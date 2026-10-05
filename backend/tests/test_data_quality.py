from datetime import date

from app.analytics import build_dashboard
from app.jobs import sync_channel
from app.models import ChannelState, Metric


def seed(db, month, days, value=100, channel='youtube'):
    for day in days:
        db.add(Metric(channel=channel, date=f'2026-{month:02}-{day:02}', key='views', value=value))
    db.commit()


def metric(db, today=date(2026, 10, 5)):
    c = next(c for c in build_dashboard(db, '2026-10', today)['channels'] if c['id'] == 'youtube')
    return c, c['comparisons']['views']


def test_delayed_three_days_not_false_forty_percent_decline(db):
    seed(db, 10, range(1, 4))
    seed(db, 9, range(1, 6))
    c, q = metric(db)
    assert q['status'] == 'comparable'
    assert q['current_end'] == '2026-10-03'
    assert q['previous_end'] == '2026-09-03'
    assert q['value'] == q['previous'] == 300
    assert c['values']['views'] == 300


def test_internal_gap_blocks_comparison_without_losing_value(db):
    seed(db, 10, [1, 3])
    seed(db, 9, range(1, 6))
    c, q = metric(db)
    assert q['status'] == 'unavailable'
    assert c['values']['views'] == 200
    assert 'views' not in c['previous']


def test_zero_is_real_and_today_is_not_compared(db):
    seed(db, 10, range(1, 6), value=0)
    seed(db, 9, range(1, 6))
    c, q = metric(db)
    assert q['value'] == 0 and c['values']['views'] == 0
    assert q['current_end'] == '2026-10-04'
    assert q['previous'] == 400


def test_previous_gap_and_no_data_block_comparison(db):
    seed(db, 10, range(1, 4))
    seed(db, 9, [1, 3])
    assert metric(db)[1]['status'] == 'unavailable'


def test_empty_or_truncated_success_preserves_last_snapshot(db, monkeypatch):
    from app import jobs
    seed(db, 10, range(1, 4))
    for rows in ([], [{'channel':'youtube','date':'2026-10-01','key':'views','value':0,'source_id':'account','unit':'count'}]):
        monkeypatch.setattr(jobs, 'fetch_channel', lambda *args: rows)
        assert not sync_channel(db, 'youtube', date(2026,10,1), date(2026,10,5))
        assert metric(db)[0]['values']['views'] == 300
        assert db.get(ChannelState, 'youtube').status == 'error'


def test_confirmed_zero_import_replaces_previous_nonzero(db, monkeypatch):
    from app import jobs
    seed(db, 10, [1])
    monkeypatch.setattr(jobs, 'fetch_channel', lambda *args: [{'channel':'youtube','date':'2026-10-01','key':'views','value':0,'source_id':'account','unit':'count'}])
    assert sync_channel(db, 'youtube', date(2026,10,1), date(2026,10,1))
    assert metric(db)[0]['values']['views'] == 0


def test_short_previous_month_and_year_boundary(db):
    for month, days in [('2026-02',28),('2026-03',31),('2025-12',31),('2026-01',3)]:
        for day in range(1,days+1):
            db.add(Metric(channel='youtube',date=f'{month}-{day:02}',key='views',value=1))
    db.commit()
    for month, today, expected in [('2026-03',date(2026,4,4),'2026-02-28'),('2026-01',date(2026,1,5),'2025-12-03')]:
        c=next(c for c in build_dashboard(db,month,today)['channels'] if c['id']=='youtube')
        q=c['comparisons']['views']
        assert q['status']=='comparable'
        assert q['previous_end']==expected
        assert q['value']==q['previous']
