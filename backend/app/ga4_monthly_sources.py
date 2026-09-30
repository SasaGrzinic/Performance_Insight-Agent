"""Property-wide monthly session sources; no per-page sum or publication filter."""

from datetime import datetime, timezone

from .analytics import month_bounds
from .connectors import ProviderError, google_token, number_id, request, require
from .ga4_ai_sources import summarize


def fetch(s, month, today):
    require(s.ga4_property_id)
    start, end = month_bounds(month)
    end = min(end, today)
    if start > end:
        raise ValueError("Zukünftiger Monat")
    thresholded = False
    data_loss = False
    headers = {"Authorization": "Bearer " + google_token(s, s.ga4_refresh_token)}

    def report(dimensions, metric):
        nonlocal thresholded, data_loss
        rows = []
        while True:
            r = request(
                "POST",
                f"https://analyticsdata.googleapis.com/v1beta/properties/{number_id(s.ga4_property_id)}:runReport",
                headers=headers,
                json={
                    "dateRanges": [{"startDate": str(start), "endDate": str(end)}],
                    "dimensions": [{"name": d} for d in dimensions],
                    "metrics": [{"name": metric}],
                    "orderBys": [{"dimension": {"dimensionName": d}} for d in dimensions],
                    "limit": 10000,
                    "offset": len(rows),
                },
            ).json()
            thresholded |= r.get("metadata", {}).get("subjectToThresholding", False)
            data_loss |= r.get("metadata", {}).get("dataLossFromOtherRow", False)
            batch = r.get("rows", [])
            rows.extend(
                {
                    "label": " · ".join(x["value"] for x in row["dimensionValues"]),
                    "value": float(row["metricValues"][0]["value"]),
                }
                for row in batch
            )
            if len(rows) >= int(r.get("rowCount", len(rows))):
                return sorted(rows, key=lambda r: -r["value"])
            if not batch:
                raise ProviderError("Unvollständiger Herkunftsbericht")

    rows = [
        {"channel": r["label"], "sessions": r["value"]}
        for r in report(["sessionDefaultChannelGroup"], "sessions")
    ]
    ai_rows = report(["sessionSource"], "sessions")
    ai = summarize([{"source": r["label"], "sessions": r["value"]} for r in ai_rows])
    return {
        "sources": rows,
        "ai": ai,
        "start": str(start),
        "end": str(end),
        "partial": end < month_bounds(month)[1],
        "thresholded": thresholded,
        "data_loss": data_loss,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
