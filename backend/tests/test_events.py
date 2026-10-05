from copy import deepcopy

from sqlalchemy import func, select

from app.models import Preference


def snapshot():
    return {'observed_at': '2026-10-05T12:00:00Z', 'source': 'Microsoft Forms · aggregierter Import', 'events': [{
        'id': 'event-1', 'title': 'Anlass', 'description': 'Ein Event', 'responses': 12,
        'registrations': 14, 'employees': 2, 'partners': 3, 'customers': 8,
    }]}


HEADERS = {'X-Sonio-Request': '1'}


def test_events_protected_and_import_requires_csrf(client, logged_in):
    client.cookies.clear()
    assert client.get('/api/events').status_code == 401


def test_aggregate_replaces_idempotently_and_rejects_personal_fields(logged_in, db):
    data = snapshot()
    assert logged_in.put('/api/events/aggregate', json=data).status_code == 403
    for _ in range(2):
        assert logged_in.put('/api/events/aggregate', json=data, headers=HEADERS).status_code == 200
    assert db.scalar(select(func.count()).select_from(Preference).where(Preference.key == 'events:aggregate:v1')) == 1
    invalid = deepcopy(data)
    invalid['events'][0]['respondents'] = [{'email': 'example@example.invalid'}]
    assert logged_in.put('/api/events/aggregate', json=invalid, headers=HEADERS).status_code == 422
    result = logged_in.get('/api/events').json()
    assert result['snapshot']['events'][0]['responses'] == 12
    assert 'respondents' not in str(result)
    assert result['automatic_sync'] is False


def test_invalid_counts_and_stale_snapshot_preserve_last_good(logged_in):
    data = snapshot()
    assert logged_in.put('/api/events/aggregate', json=data, headers=HEADERS).status_code == 200
    invalid = deepcopy(data)
    invalid['events'][0]['customers'] = 100
    assert logged_in.put('/api/events/aggregate', json=invalid, headers=HEADERS).status_code == 422
    data['observed_at'] = '2026-10-04T12:00:00Z'
    assert logged_in.put('/api/events/aggregate', json=data, headers=HEADERS).status_code == 409
    assert logged_in.get('/api/events').json()['snapshot']['events'][0]['customers'] == 8


def test_unknown_groups_remain_missing_and_viewer_cannot_import(logged_in, db):
    from app.models import User
    data = snapshot()
    for key in ('registrations', 'employees', 'partners', 'customers'):
        data['events'][0].pop(key)
    assert logged_in.put('/api/events/aggregate', json=data, headers=HEADERS).status_code == 200
    assert logged_in.get('/api/events').json()['snapshot']['events'][0]['employees'] is None
    user = db.scalar(select(User))
    user.role = 'viewer'
    db.commit()
    assert logged_in.put('/api/events/aggregate', json=data, headers=HEADERS).status_code == 403


def test_zoom_boundary_and_partial_groups(logged_in):
    data = snapshot()
    event = data['events'][0]
    event.update(source='Zoom', date='2023-12-31')
    assert logged_in.put('/api/events/aggregate', json=data, headers=HEADERS).status_code == 422
    event.update(date='2024-01-01', customers=None)
    assert logged_in.put('/api/events/aggregate', json=data, headers=HEADERS).status_code == 200
    result = logged_in.get('/api/events').json()['snapshot']['events'][0]
    assert result['source'] == 'Zoom'
    assert result['customers'] == 9  # 14 registrations - 2 Sonio - 3 partners
    assert result['customers_calculated'] is True


def test_company_mapping_is_exact_and_unknown_is_not_customer():
    from app.event_company_groups import PARTNER_NAMES, company_group
    assert len(PARTNER_NAMES) == 16
    for name in PARTNER_NAMES:
        assert company_group(name.upper() + ' AG') == 'partners'
    assert company_group('Sonio AG') == 'employees'
    assert company_group('HP Inc.') == 'partners'
    assert company_group('Sonio Partner Consulting') == 'unassigned'
    assert company_group('Unbekannte Firma') == 'unassigned'
