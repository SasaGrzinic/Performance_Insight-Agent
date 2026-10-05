"""Read-only Zoom report import; persist an explicit metadata/aggregate allowlist only."""
import calendar
import hashlib
from datetime import date, datetime, timezone
from urllib.parse import quote
from zoneinfo import ZoneInfo

import httpx

from .connectors import NotConfigured, ProviderError
from .events import KEY, Event, EventSnapshot
from .models import ChannelState, Preference

STATUS_KEY = 'events:zoom:status:v1'


def configured(s):
    return bool(s.zoom_account_id and s.zoom_client_id and s.zoom_client_secret)


def windows(today):
    # Current month and five preceding calendar months: Zoom's six-month history window.
    for offset in range(5, -1, -1):
        absolute = today.year * 12 + today.month - 1 - offset
        year, month = divmod(absolute, 12)
        month += 1
        start = max(date(year, month, 1), date(2024, 1, 1))
        end = min(date(year, month, calendar.monthrange(year, month)[1]), today)
        if start <= end:
            yield start, end


def count(value):
    return value if type(value) is int and 0 <= value <= 10000000 else None


def fetch(s, today, client):
    if not configured(s):
        raise NotConfigured('Zoom-Zugang ist noch nicht konfiguriert.')
    response = client.post('https://zoom.us/oauth/token', params={
        'grant_type': 'account_credentials', 'account_id': s.zoom_account_id,
    }, auth=(s.zoom_client_id, s.zoom_client_secret))
    if response.status_code != 200:
        raise ProviderError(f'Zoom-Anmeldung fehlgeschlagen (HTTP {response.status_code}).')
    token = response.json().get('access_token')
    if not token:
        raise ProviderError('Zoom hat keinen Zugangstoken geliefert.')
    headers = {'Authorization': 'Bearer ' + token}
    result = {}
    for start, end in windows(today):
        cursor = ''
        seen = set()
        while True:
            response = client.get('https://api.zoom.us/v2/report/history_meetings', params={
                'from': str(start), 'to': str(end), 'page_size': 30, 'next_page_token': cursor,
                'meeting_type': 'webinar', 'date_type': 'start_time', 'report_type': 'all',
            }, headers=headers)
            if response.status_code != 200:
                raise ProviderError(f'Zoom-Historie nicht abrufbar (HTTP {response.status_code}); bisheriger Stand bleibt erhalten.')
            data = response.json()
            if not isinstance(data.get('history_meetings'), list):
                raise ProviderError('Zoom-Historie hat ein unerwartetes Format.')
            for item in data['history_meetings']:
                if item.get('type') != 'Webinar':
                    continue
                moment = datetime.fromisoformat(item['start_time'].replace('Z', '+00:00'))
                if moment.tzinfo is None:
                    raise ProviderError('Zoom-Webinar ohne eindeutige Zeitzone.')
                day = moment.astimezone(ZoneInfo('Europe/Zurich')).date()
                # API range is checked against its UTC event date; local day determines display.
                if not start <= moment.date() <= end or day < date(2024, 1, 1):
                    raise ProviderError('Zoom lieferte ein Webinar ausserhalb des angefragten Zeitraums.')
                uuid = item.get('meeting_uuid')
                if not isinstance(uuid, str) or not uuid:
                    raise ProviderError('Zoom-Webinar ohne eindeutige Instanz-ID.')
                event_id = 'zoom-api-' + hashlib.sha256(uuid.encode()).hexdigest()[:32]
                if event_id in result:
                    raise ProviderError('Zoom lieferte eine doppelte Webinarinstanz.')
                attendees = count(item.get('participants'))
                path = quote(uuid, safe='')
                if uuid.startswith('/') or '//' in uuid:
                    path = quote(path, safe='')
                details = client.get('https://api.zoom.us/v2/report/webinars/' + path, headers=headers)
                note = 'Zoom API · Teilnahme-Einträge können Hosts und Wiederbeitritte enthalten; keine eindeutige Kundenzahl.'
                if details.status_code == 200:
                    detail = details.json()
                    if detail.get('uuid') != uuid:
                        raise ProviderError('Zoom-Bericht gehört nicht zur angefragten Webinarinstanz.')
                    reported = count(detail.get('participants_count'))
                    if reported is not None:
                        attendees = reported
                elif details.status_code == 404:
                    note += ' Detailbericht nicht mehr verfügbar; Zahl aus Historienbericht.'
                else:
                    raise ProviderError(f'Zoom-Detailbericht nicht abrufbar (HTTP {details.status_code}); bisheriger Stand bleibt erhalten.')
                result[event_id] = Event(
                    id=event_id, title=item.get('topic') or 'Zoom-Webinar',
                    description='Webinar · Kennzahlen aus dem Zoom-Berichtsabruf.',
                    date=day, time=moment.astimezone(ZoneInfo('Europe/Zurich')).strftime('%H:%M'),
                    location='Online · Zoom', source='Zoom', topic='Webinar',
                    attendees=attendees, data_note=note,
                    observed_at=datetime.now(timezone.utc),
                )
            cursor = data.get('next_page_token') or ''
            if not cursor:
                break
            if cursor in seen:
                raise ProviderError('Zoom-Pagination wiederholt sich; Import abgebrochen.')
            seen.add(cursor)
    return list(result.values())


def merge(existing, incoming):
    events = {e.id: e for e in existing}
    for new in incoming:
        old = events.get(new.id)
        if old is None:
            matches = [e for e in events.values() if e.source == 'Zoom' and not e.id.startswith('zoom-api-')
                       and e.date == new.date and e.title.strip().casefold() == new.title.strip().casefold()]
            if len(matches) == 1:
                old = matches[0]
                del events[old.id]
        if old:
            new = old.model_copy(update={
                'id': new.id, 'attendees': new.attendees if new.attendees is not None else old.attendees,
                'observed_at': new.observed_at, 'data_note': new.data_note, 'time': new.time or old.time,
            })
        events[new.id] = new
    return list(events.values())


def sync(db, s, today=None):
    today = today or datetime.now(ZoneInfo('Europe/Zurich')).date()
    previous = db.get(Preference, STATUS_KEY)
    last_success = previous.value.get('last_success') if previous else None
    try:
        with httpx.Client(timeout=20) as client:
            incoming = fetch(s, today, client)
        row = db.get(Preference, KEY)
        snapshot = EventSnapshot.model_validate(row.value) if row else EventSnapshot(
            observed_at=datetime.now(timezone.utc), source='Events · aggregierter Import', events=[])
        snapshot.events = merge(snapshot.events, incoming)
        validated = EventSnapshot.model_validate(snapshot.model_dump())
        if row:
            row.value = validated.model_dump(mode='json')
        else:
            db.add(Preference(key=KEY, value=validated.model_dump(mode='json')))
        status = {'status': 'connected', 'last_success': datetime.now(timezone.utc).isoformat(),
                  'from': str(next(windows(today))[0]), 'to': str(today), 'webinars': len(incoming),
                  'message': f'{len(incoming)} Webinare im verfügbaren API-Zeitraum. Ältere Archivdaten bleiben unverändert.'}
    except Exception as exc:
        db.rollback()
        status = {'status': 'error', 'last_success': last_success,
                  'message': str(exc) if isinstance(exc, (ProviderError, NotConfigured)) else 'Zoom-Abruf fehlgeschlagen; letzter Datenstand bleibt erhalten.'}
    row = db.get(Preference, STATUS_KEY)
    if row:
        row.value = status
    else:
        db.add(Preference(key=STATUS_KEY, value=status))
    channel = db.get(ChannelState, 'events') or ChannelState(channel='events')
    channel.status = status['status']
    channel.message = 'Zoom: ' + status['message']
    if status['status'] == 'connected':
        channel.last_success = datetime.now(timezone.utc)
    db.add(channel)
    db.commit()
    return status
