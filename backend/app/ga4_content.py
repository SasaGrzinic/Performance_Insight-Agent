"""Monthly content reports, grouped by observed Sonio paths without summing users."""

from datetime import datetime, timedelta, timezone

from .analytics import month_bounds
from .connectors import ProviderError, google_token, number_id, request, require


def category(path):
    if not path.startswith("/") or any(c in path for c in ["?", "#", "\\"]):
        return None
    p = path.removeprefix("/fr-ch").rstrip("/")
    for prefix, kind in [("/blog/", "blog"), ("/news/", "news"), ("/customer-stories/", "stories")]:
        if p.startswith(prefix) and len(p) > len(prefix):
            return kind
    if p.startswith("/solutions/") or p in {
        "/digital-workplace",
        "/datamanagement",
        "/hybrid-cloud",
        "/full-service-provider",
        "/business-continuity",
        "/artificial-intelligence",
    }:
        return "competence"
    return None


def fetch(s, month, today):
    require(s.ga4_property_id)
    start, end = month_bounds(month)
    end = min(end, today)
    if start > end:
        raise ValueError("Zukünftiger Monat")
    prev_start, prev_end = month_bounds((start - timedelta(days=1)).strftime("%Y-%m"))
    if end < month_bounds(month)[1]:
        prev_end = prev_start.replace(day=min(end.day, prev_end.day))
    headers = {"Authorization": "Bearer " + google_token(s, s.ga4_refresh_token)}
    thresholded = False

    def report(first, last, dims, metrics):
        nonlocal thresholded
        result = []
        while True:
            r = request(
                "POST",
                f"https://analyticsdata.googleapis.com/v1beta/properties/{number_id(s.ga4_property_id)}:runReport",
                headers=headers,
                json={
                    "dateRanges": [{"startDate": str(first), "endDate": str(last)}],
                    "dimensionFilter": {
                        "filter": {
                            "fieldName": "hostName",
                            "inListFilter": {"values": ["sonio.com", "www.sonio.com"]},
                        }
                    },
                    "dimensions": [{"name": d} for d in dims],
                    "metrics": [{"name": m} for m in metrics],
                    "orderBys": [{"dimension": {"dimensionName": d}} for d in dims],
                    "limit": 10000,
                    "offset": len(result),
                },
            ).json()
            thresholded |= r.get("metadata", {}).get("subjectToThresholding", False)
            rows = r.get("rows", [])
            result.extend(rows)
            if len(result) >= int(r.get("rowCount", len(result))):
                return result
            if not rows:
                raise ProviderError("Unvollständiger GA4-Inhaltsbericht")

    names = ["screenPageViews", "totalUsers", "sessions", "userEngagementDuration"]

    def values(rows):
        out = {}
        for r in rows:
            path = r["dimensionValues"][0]["value"]
            if not category(path):
                continue
            v = dict(zip(names, [float(x["value"]) for x in r["metricValues"]]))
            v["engagementPerUser"] = (
                v["userEngagementDuration"] / v["totalUsers"] if v["totalUsers"] else None
            )
            out[path] = v
        return out

    current = values(report(start, end, ["pagePath"], names))
    previous = values(report(prev_start, prev_end, ["pagePath"], names))
    titles = {}
    for r in report(prev_start, end, ["pagePath", "pageTitle"], ["screenPageViews"]):
        path, title = [d["value"] for d in r["dimensionValues"]]
        count = float(r["metricValues"][0]["value"])
        if title and title != "(not set)" and count > titles.get(path, ("", -1))[1]:
            titles[path] = (title, count)
    pages = [
        {
            "path": p,
            "url": "https://www.sonio.com" + p,
            "kind": category(p),
            "title": titles.get(p, (p, 0))[0],
            "language": "FR" if p.startswith("/fr-ch/") else "DE",
            "current": current.get(p),
            "previous": previous.get(p),
        }
        for p in current.keys() | previous.keys()
    ]
    pages.sort(key=lambda p: (-(p["current"] or {}).get("screenPageViews", 0), p["path"]))
    return {
        "pages": pages,
        "start": str(start),
        "end": str(end),
        "previous_start": str(prev_start),
        "previous_end": str(prev_end),
        "thresholded": thresholded,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
