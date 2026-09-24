from calendar import monthrange
from datetime import date, timedelta

from sqlalchemy import select

from .catalog import CHANNELS, DEFAULT_KPIS
from .models import ChannelState, Metric, Preference


def month_bounds(month):
    start = date.fromisoformat(month + "-01")
    return start, start.replace(day=monthrange(start.year, start.month)[1])


def previous_month(month):
    return (month_bounds(month)[0] - timedelta(days=1)).strftime("%Y-%m")


def delta(current, previous):
    if current is None or previous is None or previous == 0:
        return None
    return round((current - previous) / abs(previous) * 100, 1)


def build_dashboard(db, month, today=None):
    today = today or date.today()
    start, end = month_bounds(month)
    prev = previous_month(month)
    prev_start, prev_end = month_bounds(prev)
    # Compare incomplete current months with the same elapsed number of days.
    if start <= today <= end:
        end = today
        prev_end = prev_start.replace(day=min(today.day, prev_end.day))
    rows = db.scalars(
        select(Metric).where(Metric.date >= str(prev_start), Metric.date <= str(end))
    ).all()
    states = {s.channel: s for s in db.scalars(select(ChannelState)).all()}
    totals, before, units = {}, {}, {}
    for r in rows:
        k = (r.channel, r.key)
        if str(start) <= r.date <= str(end):
            totals[k] = totals.get(k, 0) + r.value
            units[k] = r.unit
        elif str(prev_start) <= r.date <= str(prev_end):
            before[k] = before.get(k, 0) + r.value
    pref = db.get(Preference, "kpis")
    definitions = pref.value["items"] if pref else DEFAULT_KPIS
    kpis = []
    for item in definitions:
        key = (item["channel"], item["key"])
        value = totals.get(key)
        kpis.append(
            {
                **item,
                "value": value,
                "previous": before.get(key),
                "change": delta(value, before.get(key)),
                "unit": units.get(key, "count"),
            }
        )
    channels = []
    for c in CHANNELS:
        state = states.get(c["id"])
        values = {key: totals[(c["id"], key)] for key in c["fields"] if (c["id"], key) in totals}
        channels.append(
            {
                **c,
                "values": values,
                "units": {key: units.get((c["id"], key), "count") for key in values},
                "previous": {
                    key: before[(c["id"], key)] for key in c["fields"] if (c["id"], key) in before
                },
                "status": state.status if state else "not_configured",
                "message": state.message if state else "Noch nicht verbunden",
                "last_success": state.last_success.isoformat()
                if state and state.last_success
                else None,
            }
        )
    series = []
    for day in range(1, end.day + 1):
        point = {"date": start.replace(day=day).isoformat(), "day": day}
        for c in CHANNELS:
            matching = [
                r.value
                for r in rows
                if r.channel == c["id"] and r.key == c["primary"] and r.date == point["date"]
            ]
            point[c["id"]] = sum(matching) if matching else None
            for key in c["fields"]:
                values = [
                    r.value
                    for r in rows
                    if r.channel == c["id"] and r.key == key and r.date == point["date"]
                ]
                point[f"{c['id']}.{key}"] = sum(values) if values else None
        series.append(point)
    return {
        "month": month,
        "comparison_month": prev,
        "period_start": str(start),
        "period_end": str(end),
        "comparison_end": str(prev_end),
        "partial": start <= today <= month_bounds(month)[1],
        "demo": False,
        "kpis": kpis,
        "channels": channels,
        "series": series,
        "definitions_confirmed": bool(pref),
        "notes": [
            "Plattform-Attributionen sind nicht kanalübergreifend dedupliziert.",
            "Mailchimp-Zahlen beziehen sich auf das Versanddatum der Kampagne; Öffnungen können durch Privacy-Funktionen verzerrt sein.",
        ],
    }
