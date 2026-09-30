"""Publication cohorts with current lifetime page statistics, never monthly traffic cohorts."""

import json
import re
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
from html.parser import HTMLParser
from urllib.parse import urlparse
from xml.etree import ElementTree
from zoneinfo import ZoneInfo

import httpx

from .connectors import ProviderError, google_token, number_id, request, require
from .ga4_campaigns import CAMPAIGNS, page_filter
from .ga4_content import category

AREAS = {"campaign", "profile", "competence", "blog", "news", "stories", "behind", "services", "videos"}
COMPETENCE_PATHS = {
    "/full-service-provider", "/datamanagement", "/digital-workplace",
    "/hybrid-cloud", "/artificial-intelligence",
}
METRICS = ["screenPageViews", "totalUsers", "sessions", "userEngagementDuration"]


def configured(area):
    return [
        (t.replace("Visitenpage – ", ""), p)
        for t, p in CAMPAIGNS
        if ("profile" if t.startswith("Visitenpage") else "campaign") == area
    ]


def belongs(area, path):
    if (
        not path.startswith("/")
        or path.startswith("//")
        or any(c in path for c in ["?", "#", "..", "\\"])
    ):
        return False
    p = path.rstrip("/")
    localized = p.removeprefix("/fr-ch")
    if area == "competence":
        return localized in COMPETENCE_PATHS
    if area == "services":
        return localized.startswith("/services/") and len(localized) > len("/services/")
    if area == "videos":
        return localized == "/video" or localized.startswith("/video/")
    behind = bool(re.match(r"^/(?:fr-ch/)?blog/(?:ein-)?blick-hinter-die-kulissen(?:-|$)", p))
    if area == "behind":
        return behind
    if area == "blog" and behind:
        return False
    return (
        p in {p for _, p in configured(area)}
        if area in {"campaign", "profile"}
        else category(p) == area
    )


class MetadataParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.image = None
        self.in_data = False
        self.parts = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "script" and a.get("id") == "__NEXT_DATA__":
            self.in_data = True
        if tag == "meta" and a.get("property") == "og:image":
            self.image = safe_image(a.get("content", ""))

    def handle_endtag(self, tag):
        if tag == "script":
            self.in_data = False

    def handle_data(self, text):
        if self.in_data:
            self.parts.append(text)


def safe_image(url):
    u = urlparse(url or "")
    return (
        url
        if u.scheme == "https" and u.hostname in {"a.storyblok.com", "www.sonio.com", "sonio.com"}
        else None
    )


def hero_image(content):
    for block in content.get("body", []):
        if "hero" not in block.get("component", "").lower():
            continue
        candidates = block.get("element", []) + [block]
        for candidate in candidates:
            for key in ["background", "image", "bannerImage"]:
                asset = candidate.get(key)
                if isinstance(asset, dict) and safe_image(asset.get("filename")):
                    return safe_image(asset["filename"])
    return None


def profile_image(content):
    """First editorial photograph below the video, excluding icons and shared footer art."""
    def assets(node):
        if isinstance(node, dict):
            url = safe_image(node.get("filename"))
            if url and re.search(r"\.(?:jpe?g|png|webp)$", url, re.I):
                yield url
            for value in node.values():
                yield from assets(value)
        elif isinstance(node, list):
            for value in node:
                yield from assets(value)
    return next(assets(content.get("body", [])), None)


def metadata(path):
    if not any(belongs(a, path) for a in AREAS):
        raise ValueError("Unbekannte Seite")
    result = {
        "path": path,
        "url": "https://www.sonio.com" + path,
        "title": path,
        "image": None,
        "published_at": None,
        "date_source": None,
        "language": "FR" if path.startswith("/fr-ch/") else "DE",
    }
    try:
        r = httpx.get(result["url"], timeout=15, follow_redirects=False)
        r.raise_for_status()
        parser = MetadataParser()
        parser.feed(r.text)
        story = (
            json.loads("".join(parser.parts)).get("props", {}).get("pageProps", {}).get("story", {})
        )
        if not isinstance(story, dict):
            return {**result, "metadata_missing": True}
        content = story.get("content", {})
        result["title"] = str(content.get("title") or story.get("name") or path)
        result["image"] = (
            safe_image((content.get("bannerImage") or {}).get("filename"))
            or hero_image(content)
            or parser.image
        )
        if belongs("profile", path):
            result["image"] = profile_image(content) or result["image"]
        # Editorial article date precedes first publication. Never use updated/published_at or creation date.
        editorial = content.get("date")
        first = story.get("first_published_at")
        if editorial and re.match(r"^\d{4}-\d{2}-\d{2}", editorial):
            result["published_at"] = str(date.fromisoformat(editorial[:10]))
            result["date_source"] = "Artikeldatum"
        elif first:
            result["published_at"] = str(
                datetime.fromisoformat(first.replace("Z", "+00:00"))
                .astimezone(ZoneInfo("Europe/Zurich"))
                .date()
            )
            result["date_source"] = "Erstveröffentlichung im CMS"
    except (httpx.HTTPError, ValueError, TypeError):
        result["metadata_missing"] = True
    canonical = {
        "/services/consulting": "Consulting",
        "/services/professional-services": "Professional Services",
        "/services/support": "Support",
        "/services/support-services": "Support Services",
        "/services/managed-services/workplace-as-a-service": "Workplace as a Service",
        "/datamanagement": "Data Management", "/hybrid-cloud": "Hybrid Cloud",
        "/digital-workplace": "Digital Workplace", "/video": "Videos",
    }
    result["title"] = canonical.get(path.removeprefix("/fr-ch"), result["title"])
    return result


def catalog(area):
    if area not in AREAS:
        raise ValueError("Unbekannter Bereich")
    if area in {"campaign", "profile"}:
        paths = [p for _, p in configured(area)]
    else:
        # Fixed public sitemap URL; external sitemap references are not followed.
        r = httpx.get("https://www.sonio.com/sitemap-0.xml", timeout=20, follow_redirects=False)
        r.raise_for_status()
        tree = ElementTree.fromstring(r.text)
        paths = sorted(
            {
                urlparse(n.text or "").path.rstrip("/")
                for n in tree.findall(".//{*}loc")
                if urlparse(n.text or "").hostname in {"sonio.com", "www.sonio.com"}
                and belongs(area, urlparse(n.text or "").path)
            }
        )
    if area == "competence":
        # Keep the five confirmed DE landing pages even when sitemap publication lags.
        paths = sorted(set(paths) | COMPETENCE_PATHS)
    with ThreadPoolExecutor(max_workers=6) as pool:
        pages = list(pool.map(metadata, paths))
    explicit = {p: t for t, p in configured(area)}
    for p in pages:
        p["title"] = explicit.get(p["path"], p["title"])
    return {"pages": pages, "updated_at": datetime.now(timezone.utc).isoformat()}


def select_pages(pages, period, today):
    if period == "all":
        return [p for p in pages if not p["published_at"] or p["published_at"] <= str(today)]
    if period != "unknown" and not re.fullmatch(r"20\d{2}(-(0[1-9]|1[0-2]))?", period):
        raise ValueError("Ungültiger Veröffentlichungszeitraum")
    return [
        p
        for p in pages
        if (
            not p["published_at"]
            if period == "unknown"
            else bool(
                p["published_at"]
                and p["published_at"].startswith(period)
                and p["published_at"] <= str(today)
            )
        )
    ]


def decode(r, names):
    if int(r.get("rowCount", 0)) > len(r.get("rows", [])):
        raise ProviderError("Unvollständiger GA4-Bericht")
    return [
        {
            "dimensions": [v["value"] for v in row.get("dimensionValues", [])],
            "values": dict(zip(names, [float(v["value"]) for v in row["metricValues"]])),
        }
        for row in r.get("rows", [])
    ]


def report_body(page, today, dimensions, metrics):
    return {
        "dateRanges": [
            {
                "startDate": max(page.get("published_at") or "2020-01-01", "2020-01-01"),
                "endDate": str(today),
            }
        ],
        "dimensionFilter": page_filter(page["path"]),
        "dimensions": [{"name": d} for d in dimensions],
        "metrics": [{"name": m} for m in metrics],
        "limit": 10000,
    }


def fetch(s, pages, today, include_comparison=False):
    require(s.ga4_property_id)
    headers = {"Authorization": "Bearer " + google_token(s, s.ga4_refresh_token)}
    result = []
    for offset in range(0, len(pages), 5):
        batch = pages[offset : offset + 5]
        reports = (
            request(
                "POST",
                f"https://analyticsdata.googleapis.com/v1beta/properties/{number_id(s.ga4_property_id)}:batchRunReports",
                headers=headers,
                json={"requests": [report_body(p, today, [], METRICS) for p in batch]},
            )
            .json()
            .get("reports", [])
        )
        if len(reports) != len(batch):
            raise ProviderError("Unvollständiger GA4-Seitenbericht")
        for page, r in zip(batch, reports):
            rows = decode(r, METRICS)
            values = rows[0]["values"] if rows else None
            if values is not None:
                values["engagementPerUser"] = (
                    values["userEngagementDuration"] / values["totalUsers"]
                    if values["totalUsers"]
                    else None
                )
            result.append(
                {
                    **page,
                    "current": values,
                    "data_start": report_body(page, today, [], METRICS)["dateRanges"][0][
                        "startDate"
                    ],
                    "thresholded": r.get("metadata", {}).get("subjectToThresholding", False),
                }
            )
    if include_comparison and result:
        comparisons = monthly_comparison(s, result, today, headers)
        for page, comparison in zip(result, comparisons):
            page["comparison"] = comparison
    return {
        "pages": result,
        "end": str(today),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def monthly_comparison(s, pages, today, headers):
    from .analytics import month_bounds

    start, month_end = month_bounds(today.strftime("%Y-%m"))
    previous_start, previous_end = month_bounds((start - timedelta(days=1)).strftime("%Y-%m"))
    if today < month_end:
        previous_end = previous_start.replace(day=min(today.day, previous_end.day))
    periods = [(start, today), (previous_start, previous_end)]
    bodies = []
    for page in pages:
        for first, last in periods:
            body = report_body(page, today, [], METRICS)
            body["dateRanges"] = [{"startDate": str(first), "endDate": str(last)}]
            bodies.append(body)
    values = []
    for offset in range(0, len(bodies), 5):
        batch = bodies[offset:offset + 5]
        reports = request(
            "POST",
            f"https://analyticsdata.googleapis.com/v1beta/properties/{number_id(s.ga4_property_id)}:batchRunReports",
            headers=headers, json={"requests": batch},
        ).json().get("reports", [])
        if len(reports) != len(batch):
            raise ProviderError("Unvollständiger GA4-Monatsvergleich")
        for report in reports:
            rows = decode(report, METRICS)
            value = rows[0]["values"] if rows else None
            if value is not None:
                value["engagementPerUser"] = value["userEngagementDuration"] / value["totalUsers"] if value["totalUsers"] else None
            values.append((value, report.get("metadata", {}).get("subjectToThresholding", False)))
    return [{
        "start": str(start), "end": str(today),
        "previous_start": str(previous_start), "previous_end": str(previous_end),
        "current": values[i * 2][0], "previous": values[i * 2 + 1][0],
        "thresholded": values[i * 2][1] or values[i * 2 + 1][1],
    } for i in range(len(pages))]


def traffic(s, page, today):
    require(s.ga4_property_id)
    headers = {"Authorization": "Bearer " + google_token(s, s.ga4_refresh_token)}
    queries = [
        ("sources", ["sessionDefaultChannelGroup"], ["sessions"]),
        ("origins", ["sessionSourceMedium"], ["sessions"]),
        ("ai_sources", ["sessionSource"], ["sessions"]),
        ("visitors", ["newVsReturning"], ["totalUsers"]),
        ("events", ["eventName"], ["eventCount"]),
    ]
    result = {}
    thresholded = False
    data_loss = False
    for key, dims, names in queries:
        body = report_body(page, today, dims, names)
        body["orderBys"] = [{"dimension": {"dimensionName": d}} for d in dims]
        rows = []
        while True:
            r = request(
                "POST",
                f"https://analyticsdata.googleapis.com/v1beta/properties/{number_id(s.ga4_property_id)}:runReport",
                headers=headers,
                json={**body, "offset": len(rows)},
            ).json()
            meta = r.get("metadata", {})
            thresholded |= meta.get("subjectToThresholding", False)
            data_loss |= meta.get("dataLossFromOtherRow", False)
            batch = decode({**r, "rowCount": len(r.get("rows", []))}, names)
            rows.extend(batch)
            if len(rows) >= int(r.get("rowCount", len(rows))):
                break
            if not batch:
                raise ProviderError("Unvollständige GA4-Herkunftsdaten")
        result[key] = sorted(rows, key=lambda r: -sum(r["values"].values()))
    from .ga4_ai_sources import summarize

    result["ai"] = summarize(
        [
            {"source": r["dimensions"][0], "sessions": r["values"]["sessions"]}
            for r in result.pop("ai_sources")
        ]
    )
    result["events"] = [
        r
        for r in result["events"]
        if r["dimensions"][0]
        in {"file_download", "video_start", "video_progress", "video_complete"}
    ]
    return {
        **result,
        "thresholded": thresholded,
        "data_loss": data_loss,
        "end": str(today),
        "start": report_body(page, today, [], [])["dateRanges"][0]["startDate"],
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
