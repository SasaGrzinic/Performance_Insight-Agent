"""Shared aggregate event view. Snapshot counts belong to the event month, never signup days."""
from collections import Counter
from datetime import timezone

from .models import Preference

FIELDS = {
    'registrations': 'Bestätigte Anmeldungen', 'responses': 'Formularantworten',
    'attendees': 'Zoom-Teilnahme-Einträge', 'recording_views': 'Aufzeichnungsaufrufe',
    'employees': 'Sonio', 'partners': 'Partner / Hersteller', 'customers': 'Kunden',
}


def customer_count(event):
    """User-approved residual rule; keep imported figures unchanged."""
    if event.customers is not None:
        return event.customers
    total = event.registrations if event.registrations is not None else event.responses
    if total is None or event.employees is None or event.partners is None:
        return None
    residual = total - event.employees - event.partners
    return residual if residual >= 0 else None


def event_view(event):
    data = event.model_dump(mode="json")
    data['customers'] = customer_count(event)
    data['customers_calculated'] = event.customers is None and data['customers'] is not None
    return data


def summarize(snapshot, events):
    # Matching date/title across sources may describe the same event. Do not guess a merge.
    signatures = Counter((e.date, e.title.strip().casefold()) for e in snapshot.events if e.date and not e.duplicate_candidate)
    excluded = [e for e in events if e.duplicate_candidate or
                (e.date and signatures[(e.date, e.title.strip().casefold())] > 1)]
    excluded_ids = {e.id for e in excluded}
    included = [e for e in events if e.id not in excluded_ids]
    values, coverage = {}, {}
    for key in FIELDS:
        counts = [(customer_count(e) if key == 'customers' else getattr(e, key)) for e in included]
        known = [value for value in counts if value is not None]
        coverage[key] = {'known': len(known), 'total': len(included),
                         'status': 'missing' if not known else 'complete' if len(known) == len(included) else 'partial'}
        if known:
            values[key] = sum(known)
    stamps = [(e.observed_at or snapshot.observed_at).astimezone(timezone.utc).isoformat() for e in included]
    return {'values': values, 'coverage': coverage, 'event_count': len(included),
            'customers_calculated_events': sum(e.customers is None and customer_count(e) is not None for e in included),
            'excluded_duplicates': len(excluded), 'undated_in_selection': sum(e.date is None for e in events),
            'oldest_observed_at': min(stamps) if stamps else None,
            'newest_observed_at': max(stamps) if stamps else None,
            'time_basis': 'event_date', 'count_basis': 'latest_snapshot_per_event',
            'notice': 'Letzter erfasster Gesamtstand der Events im Eventmonat. Keine Monats-Neuanmeldungen und keine eindeutigen Personen über mehrere Events. Formularantworten, bestätigte Anmeldungen, Teilnahme-Einträge und Aufzeichnungsaufrufe nicht addieren. Kunden werden bei fehlendem Importwert nach der festgelegten Regel Gesamtzahl minus Sonio minus Partner/Hersteller berechnet, sofern alle drei Werte vorhanden sind. Zählbasis sind bestätigte Anmeldungen, sonst Formularantworten. Teilstände sind keine vollständigen Summen; keine automatische Erfolgsbewertung.'}


def monthly_summary(db, month):
    from .events import KEY, EventSnapshot
    row = db.get(Preference, KEY)
    if row is None:
        return None
    snapshot = EventSnapshot.model_validate(row.value)
    events = [e for e in snapshot.events if e.date and e.date.isoformat().startswith(month)]
    result = summarize(snapshot, events)
    result['undated_excluded'] = sum(e.date is None for e in snapshot.events)
    result['event_month'] = month
    return result
