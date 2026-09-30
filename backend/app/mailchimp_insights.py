"""Aggregate link interest and strictly attributable GA4 visits; no subscriber data."""

import re
from datetime import datetime, timezone
from urllib.parse import parse_qs, urlsplit, urlunsplit

import httpx

from .connectors import NotConfigured, ProviderError, google_token, number_id, request, require


def safe_link(value):
    url = urlsplit(value)
    if url.scheme not in ("https", "http") or not url.hostname or url.username or url.password:
        return None
    # Never expose recipient IDs or other tracking query parameters.
    return urlunsplit((url.scheme, url.netloc, url.path, "", ""))


def campaign_tags(links, campaign_id):
    tags = set()
    for link in links:
        url = urlsplit(link.get("url", ""))
        if url.hostname not in ("sonio.com", "www.sonio.com"):
            continue
        query = parse_qs(url.query)
        for tag in query.get("utm_campaign", []):
            # Require the exact Mailchimp ID, not a guessed title match.
            if re.search(r"(?<![a-zA-Z0-9])" + re.escape(campaign_id) + r"(?![a-zA-Z0-9])", tag):
                if query.get("utm_medium") == ["email"]:
                    tags.add(tag)
    return sorted(tags)


def website(s, tags, start, end):
    if not tags:
        return {"status": "unmapped", "sessions": None, "engaged_sessions": None}
    require(s.ga4_property_id, s.ga4_refresh_token)
    result = request(
        "POST",
        f"https://analyticsdata.googleapis.com/v1beta/properties/{number_id(s.ga4_property_id)}:runReport",
        headers={"Authorization": "Bearer " + google_token(s, s.ga4_refresh_token)},
        json={
            "dateRanges": [{"startDate": start, "endDate": str(end)}],
            "metrics": [{"name": "sessions"}, {"name": "engagedSessions"}],
            "dimensionFilter": {
                "andGroup": {
                    "expressions": [
                        {
                            "filter": {
                                "fieldName": "sessionManualCampaignName",
                                "inListFilter": {"values": tags, "caseSensitive": True},
                            }
                        },
                        {
                            "filter": {
                                "fieldName": "sessionMedium",
                                "stringFilter": {
                                    "matchType": "EXACT",
                                    "value": "email",
                                    "caseSensitive": True,
                                },
                            }
                        },
                        {
                            "filter": {
                                "fieldName": "hostName",
                                "inListFilter": {"values": ["sonio.com", "www.sonio.com"]},
                            }
                        },
                    ]
                }
            },
        },
    ).json()
    rows = result.get("rows", [])
    vals = [float(v["value"]) for v in rows[0]["metricValues"]] if rows else [None, None]
    return {
        "status": "matched" if rows else "no_rows",
        "sessions": vals[0],
        "engaged_sessions": vals[1],
        "start": start,
        "end": str(end),
        "thresholded": result.get("metadata", {}).get("subjectToThresholding", False),
    }


def fetch(s, mailing, today):
    require(s.mailchimp_api_key, s.mailchimp_server)
    if not re.fullmatch(r"us\d+", s.mailchimp_server):
        raise ProviderError("Ungültiger Mailchimp-Server")
    campaign_id = mailing["id"]
    links, seen = [], set()
    while True:
        result = request(
            "GET",
            f"https://{s.mailchimp_server}.api.mailchimp.com/3.0/reports/{campaign_id}/click-details",
            auth=("sonio", s.mailchimp_api_key),
            params={
                "count": 1000,
                "offset": len(links),
                "fields": "total_items,urls_clicked.id,urls_clicked.url,urls_clicked.unique_clicks,urls_clicked.total_clicks",
            },
        ).json()
        batch = result.get("urls_clicked", [])
        for link in batch:
            if link["id"] in seen:
                raise ProviderError("Doppelte Link-Daten")
            seen.add(link["id"])
        links.extend(batch)
        if len(links) >= result.get("total_items", 0):
            break
        if not batch:
            raise ProviderError("Unvollständiger Link-Bericht")
    tags = campaign_tags(links, campaign_id)
    try:
        traffic = website(s, tags, mailing["send_time"][:10], today)
    except (ProviderError, NotConfigured, httpx.HTTPError):
        traffic = {"status": "unavailable", "sessions": None, "engaged_sessions": None}
    public = []
    for link in links:
        url = safe_link(link.get("url", ""))
        if url and link.get("unique_clicks") is not None and link["unique_clicks"] > 0:
            public.append({"id": link["id"], "url": url, "unique_clicks": link["unique_clicks"]})
    public.sort(key=lambda x: -x["unique_clicks"])
    return {
        "links": public[:3],
        "website": traffic,
        "bot_filter": "unknown",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
