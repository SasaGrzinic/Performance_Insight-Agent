"""Conservative calendar-day comparisons. Missing rows are never inferred zeroes."""
from datetime import timedelta

DAILY = {'analytics', 'youtube', 'linkedin_organic', 'google_ads'}


def comparison(rows, channel, key, start, end, prev_start, prev_end, today, state):
    current = {r.date for r in rows if r.channel == channel and r.key == key and str(start) <= r.date <= str(end)}
    previous = {r.date for r in rows if r.channel == channel and r.key == key and str(prev_start) <= r.date <= str(prev_end)}
    result = {'status': 'unavailable', 'current_start': str(start), 'current_end': None,
              'previous_start': str(prev_start), 'previous_end': None, 'value': None,
              'previous': None, 'last_measurement': max(current) if current else None,
              'last_success': state.last_success.isoformat() if state and state.last_success else None,
              'stale': bool(state and state.status == 'error'),
              'message': 'Datenabdeckung nicht ausreichend belegt; kein Vormonatsvergleich.'}
    if channel not in DAILY:
        result['message'] = 'Gesamtstände, Versand- und Eventdaten benötigen einen eigenen Vergleich; kein pauschaler Tagesvergleich.'
        return result
    if not current or not previous:
        return result
    # Exclude today's incomplete day. GA4 additionally gets a conservative processing buffer;
    # this is a policy, not a provider guarantee that values will never be revised.
    cutoff = today - timedelta(days=3 if channel == 'analytics' else 1)
    last = min(end, cutoff)
    if last < start:
        return result
    day = min(last.day, int(max(current)[-2:]), prev_end.day, int(max(previous)[-2:]))
    current_end, previous_end = start.replace(day=day), prev_start.replace(day=day)
    result.update(current_end=str(current_end), previous_end=str(previous_end))
    required_current = {str(start + timedelta(days=i)) for i in range(day)}
    required_previous = {str(prev_start + timedelta(days=i)) for i in range(day)}
    # A latest date does not establish completeness: require an explicit value on every day.
    if not required_current <= current or not required_previous <= previous:
        result['message'] = 'Tageswerte fehlen innerhalb des Vergleichszeitraums. Letzte verfügbare Zahlen bleiben sichtbar; Bewertung ausgesetzt.'
        return result
    result.update(status='comparable',
                  value=sum(r.value for r in rows if r.channel == channel and r.key == key and r.date in required_current),
                  previous=sum(r.value for r in rows if r.channel == channel and r.key == key and r.date in required_previous),
                  message='Gleich viele Kalendertage mit explizit vorhandenen Tageswerten. Anbieter können Werte nachträglich korrigieren.')
    if channel == 'analytics':
        result['message'] += ' GA4: drei Kalendertage Verarbeitungspuffer; keine Garantie endgültiger Werte.'
    if result['stale']:
        result['message'] += ' Aktualisierung fehlgeschlagen; Vergleich auf dem zuletzt gespeicherten Stand.'
    return result
