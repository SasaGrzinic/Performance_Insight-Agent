from datetime import date

from app.analytics import build_dashboard
from app.event_summary import monthly_summary, summarize
from app.events import EventSnapshot, store_snapshot
from app.models import Metric


def fixture():
    return EventSnapshot.model_validate({'observed_at':'2026-10-05T12:00:00Z','source':'Events · aggregierter Import', 'events':[
        {'id':'one','title':'Oktober','description':'Event','date':'2026-10-29','responses':10,'employees':2,'partners':3,'customers':4},
        {'id':'two','title':'September','description':'Event','date':'2026-09-03','registrations':27},
        {'id':'unknown','title':'Unbekannt','description':'Event','responses':100},
        {'id':'copy','title':'Oktober','description':'Event','date':'2026-10-29','responses':999,'duplicate_candidate':True},
    ]})


def test_month_uses_event_date_including_upcoming_and_no_legacy_double_count(db):
    store_snapshot(db, fixture())
    db.add(Metric(channel='events',key='registrations',value=300,date='2026-10-01',unit='count',source_id='legacy'))
    db.commit()
    dashboard = build_dashboard(db,'2026-10',today=date(2026,10,5))
    channel = next(c for c in dashboard['channels'] if c['id']=='events')
    assert channel['values']=={'responses':10,'employees':2,'partners':3,'customers':4}
    assert channel['primary']=='responses'
    assert channel['previous']=={}
    assert channel['last_success']=='2026-10-05T12:00:00+00:00'
    assert channel['event_summary']['undated_excluded']==1
    assert channel['event_summary']['excluded_duplicates']==1
    assert all(day['events'] is None for day in dashboard['series'])
    assert monthly_summary(db,'2026-09')['values']=={'registrations':27}
    assert monthly_summary(db,'2026-08')['values']=={}


def test_missing_partial_and_real_zero_are_distinct():
    snapshot=fixture()
    snapshot.events[0].responses=0
    snapshot.events[0].employees=None
    snapshot.events[0].partners=None
    snapshot.events[0].customers=None
    result=summarize(snapshot,snapshot.events)
    assert result['values']['responses']==100
    assert result['coverage']['responses']=={'known':2,'total':3,'status':'partial'}
    assert 'employees' not in result['values']
    assert summarize(snapshot,[snapshot.events[0]])['values']['responses']==0


def test_cross_source_possible_duplicates_excluded_even_after_source_filter():
    snapshot=fixture()
    other=snapshot.events[0].model_copy(update={'id':'zoom','source':'Zoom'})
    snapshot.events.append(other)
    assert summarize(snapshot,[other])['values']=={}


def test_filtered_endpoint_and_dashboard_share_same_values(logged_in,db):
    store_snapshot(db,fixture())
    result=logged_in.get('/api/events?year=2026&month=10').json()
    assert result['summary']['values']==monthly_summary(db,'2026-10')['values']
    assert result['summary']['values']['customers']==4
    assert 'unknown' not in str(result['summary'])


def test_customer_residual_rule_preserves_import_and_missing_inputs(logged_in,db):
    from app.event_summary import customer_count
    snap=fixture()
    event=snap.events[0]
    assert customer_count(event)==4  # Explicit imported count has precedence.
    event.customers=None
    event.responses=48
    event.employees=19
    event.partners=3
    assert customer_count(event)==26
    assert event.customers is None  # Raw data is not rewritten.
    store_snapshot(db,snap)
    assert monthly_summary(db,'2026-10')['values']['customers']==26
    result=logged_in.get('/api/events?year=2026&month=10').json()
    assert result['snapshot']['events'][0]['customers']==26
    assert result['snapshot']['events'][0]['customers_calculated'] is True
    event.partners=None
    assert customer_count(event) is None
    event.partners=29
    assert customer_count(event)==0
    event.partners=30
    assert customer_count(event) is None
    event.responses=None
    assert customer_count(event) is None
