from datetime import date
from types import SimpleNamespace

import httpx
import pytest

from app.connectors import ProviderError
from app.events import Event
from app.zoom_events import fetch, merge, windows

S = SimpleNamespace(zoom_account_id='account', zoom_client_id='client', zoom_client_secret='secret')


def test_window_and_atomic_allowlist_pagination():
    calls = []
    def handler(req):
        calls.append(str(req.url))
        if req.url.path == '/oauth/token':
            return httpx.Response(200, json={'access_token':'test'})
        if req.url.path.startswith('/v2/report/webinars/'):
            return httpx.Response(200, json={'uuid':'uuid', 'participants_count':19, 'user_email':'private@test.invalid'})
        if req.url.params['from']=='2026-10-01' and not req.url.params.get('next_page_token'):
            return httpx.Response(200,json={'next_page_token':'next','history_meetings':[
                {'type':'Webinar','meeting_uuid':'uuid','topic':'Webinar','start_time':'2026-10-01T12:00:00Z','host_email':'private@test.invalid'},
                {'type':'Meeting','topic':'Private meeting'}]})
        return httpx.Response(200,json={'history_meetings':[]})
    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        events=fetch(S,date(2026,10,5),client)
    assert len(events)==1 and events[0].attendees==19
    assert 'private@test.invalid' not in events[0].model_dump_json()
    assert events[0].registrations is None
    assert any('next_page_token=next' in c for c in calls)
    assert list(windows(date(2026,10,5)))[0][0]==date(2026,5,1)


def test_merge_preserves_forms_and_archive_and_is_idempotent():
    old=Event(id='zoom-2025',source='Zoom',title='Webinar',description='Archive',date=date(2025,10,29),recording_views=3)
    form=Event(id='form',title='Form',description='',responses=12)
    new=Event(id='zoom-api-123',source='Zoom',title='Webinar',description='',date=date(2025,10,29),attendees=19)
    merged=merge([old,form],[new])
    assert len(merged)==2
    assert next(e for e in merged if e.source=='Zoom').recording_views==3
    assert merge(merged,[new])==merged


def test_failure_contains_no_provider_body():
    def handler(req):
        return httpx.Response(403,text='private-secret-body')
    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        with pytest.raises(ProviderError) as exc:
            fetch(S,date(2026,10,5),client)
    assert 'private-secret-body' not in str(exc.value)


def test_failed_sync_preserves_snapshot(db, monkeypatch):
    from app import zoom_events
    from app.events import KEY
    from app.models import Preference
    value = {'observed_at': '2026-10-05T12:00:00Z', 'source': 'Test', 'events': []}
    db.add(Preference(key=KEY, value=value))
    db.commit()
    def fail(*args):
        raise ProviderError('Abruf fehlgeschlagen')
    monkeypatch.setattr(zoom_events, 'fetch', fail)
    assert zoom_events.sync(db, S)['status'] == 'error'
    assert db.get(Preference, KEY).value == value


def test_refresh_requires_admin_and_csrf(logged_in, db):
    from sqlalchemy import select

    from app.models import User
    assert logged_in.post('/api/events/zoom/refresh').status_code == 403
    user = db.scalar(select(User))
    user.role = 'viewer'
    db.commit()
    assert logged_in.post('/api/events/zoom/refresh', headers={'X-Sonio-Request': '1'}).status_code == 403
