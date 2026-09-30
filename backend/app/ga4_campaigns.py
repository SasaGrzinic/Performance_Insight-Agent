"""Explicit Sonio landing pages; exact paths, no CMS preview parameters."""

from datetime import datetime, timedelta, timezone

from .analytics import month_bounds
from .connectors import ProviderError, google_token, number_id, request, require

CAMPAIGNS = [
    ("ETH Landingpage", "/server-kompetenzen"),
    ("Multivendor Storage", "/multivendor-storage"),
    ("Visitenpage – Fitim", "/fitim-hajdini-bringt-vision-und-umsetzung-zusammen"),
    ("Visitenpage – Harald Burch", "/harald-burch-verbindet-menschen-und-ideen"),
    ("Visitenpage – Kutay Karaer", "/kutay-karaer-verbindet-business-it"),
    ("Visitenpage – Paddy Gloor", "/paddy-gloor-verbindet-business-it"),
    ("Visitenpage – Roman Lorenz", "/roman-lorenz-verbindet-business-it"),
    ("Netzwerk", "/netzwerk"),
    ("Hallo Nachbar", "/steffen-ziegler-hallo-nachbar"),
    ("VMware Landingpage", "/broadcom-vcf-9-0"),
    ("Digital Workplace DE", "/digital-workplace"),
    ("Digital Workplace FR", "/fr-ch/digital-workplace"),
    ("Data Management DE", "/datamanagement"),
    ("Data Management FR", "/fr-ch/datamanagement"),
    ("Hybrid Cloud DE", "/hybrid-cloud"),
    ("Hybrid Cloud FR", "/fr-ch/hybrid-cloud"),
    ("Full Service Provider DE", "/full-service-provider"),
    ("Full Service Provider FR", "/fr-ch/full-service-provider"),
    ("Business Continuity", "/business-continuity"),
]


def page_filter(path):
    return {
        "andGroup": {
            "expressions": [
                {
                    "filter": {
                        "fieldName": "hostName",
                        "inListFilter": {"values": ["sonio.com", "www.sonio.com"]},
                    }
                },
                {
                    "filter": {
                        "fieldName": "pagePath",
                        "inListFilter": {"values": [path, path + "/"]},
                    }
                },
            ]
        }
    }


def fetch(s, month, today):
    require(s.ga4_property_id)
    start, end = month_bounds(month)
    end = min(end, today)
    if start > end:
        raise ValueError("Zukünftiger Monat")
    prev_start, prev_end = month_bounds((start - timedelta(days=1)).strftime("%Y-%m"))
    if today < month_bounds(month)[1]:
        prev_end = prev_start.replace(day=min(today.day, prev_end.day))
    headers = {"Authorization": "Bearer " + google_token(s, s.ga4_refresh_token)}
    metrics = ["screenPageViews", "totalUsers", "sessions", "userEngagementDuration"]
    campaigns = []

    def report(path, first, last, dimensions, names):
        return {
            "dateRanges": [{"startDate": str(first), "endDate": str(last)}],
            "dimensionFilter": page_filter(path),
            "dimensions": [{"name": d} for d in dimensions],
            "metrics": [{"name": m} for m in names],
            "limit": 10000,
        }

    def rows(r):
        if int(r.get("rowCount", 0)) > 10000:
            raise ProviderError("GA4-Kampagnenbericht zu gross; nicht abgeschnitten")
        return [
            {
                "dimensions": [v["value"] for v in x.get("dimensionValues", [])],
                "values": {
                    m["name"]: float(v["value"])
                    for m, v in zip(r.get("metricHeaders", []), x.get("metricValues", []))
                },
            }
            for x in r.get("rows", [])
        ]

    for title, path in CAMPAIGNS:
        reports = (
            request(
                "POST",
                f"https://analyticsdata.googleapis.com/v1beta/properties/{number_id(s.ga4_property_id)}:batchRunReports",
                headers=headers,
                json={
                    "requests": [
                        report(path, start, end, [], metrics),
                        report(path, prev_start, prev_end, [], metrics),
                        report(path, start, end, ["sessionDefaultChannelGroup"], ["sessions"]),
                        report(path, start, end, ["newVsReturning"], ["totalUsers"]),
                        report(path, start, end, ["eventName"], ["eventCount"]),
                    ]
                },
            )
            .json()
            .get("reports", [])
        )
        if len(reports) != 5:
            raise ProviderError("Unvollständige GA4-Berichte")
        current, previous, sources, visitors, events = [rows(r) for r in reports]

        def totals(items):
            if not items:
                return None
            v = items[0]["values"]
            v["engagementPerUser"] = (
                v["userEngagementDuration"] / v["totalUsers"] if v["totalUsers"] else None
            )
            return v

        campaigns.append(
            {
                "title": title.replace("Visitenpage – ", ""),
                "kind": "profile" if title.startswith("Visitenpage") else "campaign",
                "path": path,
                "url": "https://www.sonio.com" + path,
                "current": totals(current),
                "previous": totals(previous),
                "sources": sources,
                "visitors": visitors,
                "events": [
                    r
                    for r in events
                    if r["dimensions"][0]
                    in ["file_download", "video_start", "video_progress", "video_complete"]
                ],
                "thresholded": any(
                    r.get("metadata", {}).get("subjectToThresholding", False) for r in reports
                ),
            }
        )
    return {
        "month": month,
        "start": str(start),
        "end": str(end),
        "previous_start": str(prev_start),
        "previous_end": str(prev_end),
        "campaigns": campaigns,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
