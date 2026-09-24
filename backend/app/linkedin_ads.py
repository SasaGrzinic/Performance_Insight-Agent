"""Read-only campaign reporting, scoped to the configured Sonio ad account."""

import re
from datetime import date, timedelta

from .connectors import (
    ProviderError,
    linkedin_headers,
    linkedin_url,
    number_id,
    request,
    require,
    row,
)


def campaigns(s, headers):
    account_id = number_id(s.linkedin_ad_account_id)
    account_urn = f"urn:li:sponsoredAccount:{account_id}"
    account = request(
        "GET", f"https://api.linkedin.com/rest/adAccounts/{account_id}", headers=headers
    ).json()
    if (
        str(account.get("id")) != account_id
        or account.get("reference") != f"urn:li:organization:{s.linkedin_organization_id}"
    ):
        raise ProviderError("Ads-Konto gehört nicht zur konfigurierten Sonio-Unternehmensseite.")
    currency = account.get("currency", "")
    if not re.fullmatch(r"[A-Z]{3}", currency):
        raise ProviderError("Kontowährung fehlt oder ist ungültig.")
    result, seen = {}, set()
    params = {"q": "search", "pageSize": 1000}
    while True:
        data = request(
            "GET", linkedin_url(f"adAccounts/{account_id}/adCampaigns", params), headers=headers
        ).json()
        for item in data.get("elements", []):
            if item.get("account") != account_urn or not str(item.get("id", "")).isdigit():
                raise ProviderError("Kampagnenzuordnung stimmt nicht mit dem Ads-Konto überein.")
            result[f"urn:li:sponsoredCampaign:{item['id']}"] = item
        token = data.get("metadata", {}).get("nextPageToken")
        if not token:
            break
        if token in seen:
            raise ProviderError("LinkedIn liefert eine wiederholte Kampagnenseite.")
        seen.add(token)
        params["pageToken"] = token
    return account, result


def fetch(start, end, s, *, include_campaigns=False):
    require(s.linkedin_ad_account_id, s.linkedin_organization_id)
    headers = linkedin_headers(s, ads=True)
    account, known = campaigns(s, headers)
    account_urn = f"urn:li:sponsoredAccount:{account['id']}"

    def window(first, last):
        params = {
            "q": "analytics",
            "pivot": "CAMPAIGN",
            "timeGranularity": "DAILY",
            "dateRange": {
                "start": {"year": first.year, "month": first.month, "day": first.day},
                "end": {"year": last.year, "month": last.month, "day": last.day},
            },
            "accounts": [account_urn],
            "fields": "dateRange,pivotValues,impressions,clicks,externalWebsiteConversions,costInLocalCurrency",
        }
        data = request("GET", linkedin_url("adAnalytics", params), headers=headers).json()
        elements = data.get("elements", [])
        # This endpoint has no pagination. Subdivide capped responses, never truncate.
        if len(elements) >= 15000:
            if first == last:
                raise ProviderError("LinkedIn-Ergebnislimit erreicht; kein unvollständiger Import.")
            middle = first + (last - first) // 2
            return window(first, middle) + window(middle + timedelta(days=1), last)
        result, seen = [], set()
        for item in elements:
            pivots = item.get("pivotValues", [])
            if len(pivots) != 1 or pivots[0] not in known:
                raise ProviderError("Unbekannte Kampagnenzuordnung in LinkedIn Ads.")
            d = item["dateRange"]["start"]
            day = date(d["year"], d["month"], d["day"])
            if not first <= day <= last or item["dateRange"].get("end", d) != d:
                raise ProviderError("LinkedIn liefert keine passenden Tageswerte für den Zeitraum.")
            identity = (pivots[0], day)
            if identity in seen:
                raise ProviderError("Doppelte Kampagnen-Tageswerte in LinkedIn Ads.")
            seen.add(identity)
            for raw, key in [
                ("impressions", "impressions"),
                ("clicks", "clicks"),
                ("externalWebsiteConversions", "conversions"),
                ("costInLocalCurrency", "spend"),
            ]:
                if raw in item:
                    result.append(
                        row(
                            "linkedin",
                            day,
                            key,
                            item[raw],
                            source=pivots[0],
                            unit=account["currency"] if key == "spend" else "count",
                        )
                    )
        return result

    records = []
    cursor = start
    while cursor <= end:
        last = min(end, cursor + timedelta(days=30))
        records.extend(window(cursor, last))
        cursor = last + timedelta(days=1)
    return (records, account, known) if include_campaigns else records


def campaign_summary(db, s, today):
    from sqlalchemy import select

    from .models import ChannelState, LinkedInCampaign, Metric

    start = today - timedelta(days=364)
    account = (
        f"urn:li:sponsoredAccount:{number_id(s.linkedin_ad_account_id)}"
        if s.linkedin_ad_account_id
        else ""
    )
    items = db.scalars(select(LinkedInCampaign).where(LinkedInCampaign.account == account)).all()
    known = {c.id for c in items}
    metrics = db.scalars(
        select(Metric).where(
            Metric.channel == "linkedin", Metric.date >= str(start), Metric.date <= str(today)
        )
    ).all()
    values, dates = {}, {}
    for m in metrics:
        if m.source_id not in known:
            continue
        bucket = values.setdefault(m.source_id, {})
        bucket[m.key] = bucket.get(m.key, 0) + m.value
        dates.setdefault(m.source_id, []).append(m.date)
    result = []
    for c in items:
        v = values.get(c.id, {})
        schedule = c.data.get("runSchedule") or {}

        def day(value):
            from datetime import datetime
            from zoneinfo import ZoneInfo

            return (
                datetime.fromtimestamp(value / 1000, ZoneInfo(s.report_timezone)).date().isoformat()
                if value
                else None
            )

        result.append(
            {
                "id": c.id,
                "name": c.data.get("name") or c.id,
                "status": c.data.get("status"),
                "objective": c.data.get("objectiveType"),
                "start": day(schedule.get("start")),
                "end": day(schedule.get("end")),
                "currency": c.data.get("currency"),
                "values": v,
                "ctr": v["clicks"] / v["impressions"] * 100
                if v.get("impressions") and "clicks" in v
                else None,
                "cpc": v["spend"] / v["clicks"] if v.get("clicks") and "spend" in v else None,
                "first_activity": min(dates[c.id]) if c.id in dates else None,
                "last_activity": max(dates[c.id]) if c.id in dates else None,
            }
        )
    result.sort(key=lambda c: (c["start"] or "", c["id"]), reverse=True)
    state = db.get(ChannelState, "linkedin")
    return {
        "start": str(start),
        "end": str(today),
        "campaigns": result,
        "last_success": state.last_success.isoformat() if state and state.last_success else None,
        "status": state.status if state else "not_configured",
        "message": state.message if state else "Noch kein Kampagnenimport.",
    }
