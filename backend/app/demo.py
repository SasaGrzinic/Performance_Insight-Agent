import math

from .analytics import delta, month_bounds, previous_month
from .catalog import CHANNELS, DEFAULT_KPIS


def demo_dashboard(month):
    start, end = month_bounds(month)
    factor = 1 + ((start.month + start.year) % 5) * 0.035
    bases = {
        "google_ads": 18,
        "analytics": 1260,
        "linkedin": 5,
        "linkedin_organic": 2180,
        "mailchimp": 27,
        "youtube": 680,
        "events": 7,
        "qr": 21,
    }
    series = []
    for day in range(1, end.day + 1):
        point = {"day": day, "date": start.replace(day=day).isoformat()}
        for i, (key, base) in enumerate(bases.items()):
            point[key] = max(
                0,
                round(
                    base
                    * factor
                    * (
                        0.65
                        + day / 75
                        + 0.30 * math.sin(day * 0.48 + i)
                        + 0.15 * math.cos(day * 1.7)
                    )
                ),
            )
        series.append(point)
    channels = []
    for c in CHANNELS:
        total = sum(p[c["id"]] for p in series)
        primary = c["primary"]
        values = {
            key: round(
                total
                * (
                    {
                        "impressions": 145,
                        "clicks": 9,
                        "spend": 18.4,
                        "engaged_sessions": 0.68,
                        "key_events": 0.035,
                        "emails_sent": 25,
                        "unique_opens": 10,
                        "watch_minutes": 3.2,
                        "subscribers_gained": 0.004,
                    }.get(key, 1)
                )
            )
            for key in c["fields"]
        }
        values[primary] = total
        growth = {
            "google_ads": 23.8,
            "analytics": 12.4,
            "linkedin": -8.2,
            "linkedin_organic": 15.7,
            "mailchimp": 9.3,
            "youtube": 18.6,
            "events": 28.4,
            "qr": 6.1,
        }[c["id"]]
        channels.append(
            {
                **c,
                "values": values,
                "previous": {k: round(v / (1 + growth / 100)) for k, v in values.items()},
                "units": {k: "CHF" if k == "spend" else "count" for k in values},
                "status": "demo",
                "message": "Illustrative Beispieldaten",
                "last_success": None,
            }
        )
    for c in channels:
        primary_total = sum(p[c["id"]] for p in series)
        for point in series:
            for key, total in c["values"].items():
                point[f"{c['id']}.{key}"] = (
                    round(point[c["id"]] * total / primary_total, 2) if primary_total else 0
                )
    kpis = []
    for definition in DEFAULT_KPIS:
        c = next(c for c in channels if c["id"] == definition["channel"])
        k = definition["key"]
        kpis.append(
            {
                **definition,
                "value": c["values"][k],
                "previous": c["previous"][k],
                "unit": "count",
                "change": delta(c["values"][k], c["previous"][k]),
            }
        )
    return {
        "month": month,
        "comparison_month": previous_month(month),
        "period_start": str(start),
        "period_end": str(end),
        "comparison_end": str(month_bounds(previous_month(month))[1]),
        "partial": False,
        "demo": True,
        "kpis": kpis,
        "channels": channels,
        "series": series,
        "definitions_confirmed": False,
        "notes": [
            "Demonstration mit synthetischen Daten. Keine Aussage über Sonios tatsächliche Performance."
        ],
    }


def demo_analysis():
    return {
        "status": "demo",
        "summary": "Mehr Wirkung aus deinen Kanälen. Google Ads und Events wachsen in diesem Beispiel, während LinkedIn Ads Aufmerksamkeit braucht.",
        "recommendations": [
            {
                "title": "Erfolgreiche Suchkampagnen genauer prüfen",
                "channel": "google_ads",
                "priority": "high",
                "observation": "Im Beispiel steigen die Conversions gegenüber dem Vormonat.",
                "action": "Kampagnen nach Kosten pro Conversion vergleichen. Budget nur bei stabiler Lead-Qualität schrittweise erhöhen.",
                "caveat": "Beispiel einer Interpretation; keine echten Kampagnendaten.",
                "evidence": ["google_ads.conversions"],
            },
            {
                "title": "LinkedIn-Zielgruppen gezielter testen",
                "channel": "linkedin",
                "priority": "high",
                "observation": "Die Beispiel-Conversions liegen unter dem Vormonat.",
                "action": "Zwei Zielgruppensegmente bei gleichem Budget testen und nach zwei Wochen anhand qualifizierter Leads vergleichen.",
                "caveat": "Kleine Stichproben und der längere B2B-Verkaufszyklus können das Ergebnis verzerren.",
                "evidence": ["linkedin.conversions"],
            },
            {
                "title": "Event-Interesse in Follow-ups übersetzen",
                "channel": "events",
                "priority": "medium",
                "observation": "Die Zahl der Anmeldungen wächst in den Beispieldaten.",
                "action": "Follow-up-Inhalte nach Veranstaltungsthema vorbereiten und den späteren Website-Besuch mit UTM-Links messen.",
                "caveat": "Anmeldungen sind weder Teilnahmen noch bestätigte Verkaufschancen.",
                "evidence": ["events.registrations"],
            },
        ],
    }
