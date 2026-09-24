"""Read-only provider adapters. Credentials only come from server configuration."""

import io
import re
import zipfile
from datetime import datetime, timezone
from urllib.parse import quote

import httpx
from docx import Document
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from .config import get_settings


class NotConfigured(Exception):
    pass


class ProviderError(Exception):
    pass


class TemporaryProviderError(ProviderError):
    pass


def require(*values):
    if not all(values):
        raise NotConfigured("Zugangsdaten oder Konto-ID fehlen")


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(min=1, max=8),
    retry=retry_if_exception_type((httpx.TransportError, TemporaryProviderError)),
    reraise=True,
)
def request(method, url, **kwargs):
    with httpx.Client(timeout=45, follow_redirects=False) as client:
        response = client.request(method, url, **kwargs)
    if response.status_code == 429 or response.status_code >= 500:
        raise TemporaryProviderError(
            f"Anbieter vorübergehend nicht verfügbar (HTTP {response.status_code})."
        )
    if response.status_code >= 400:
        # Never persist a provider response that may echo credentials or contact data.
        raise ProviderError(
            f"Anbieter antwortet mit HTTP {response.status_code}; Zugang und Kontoberechtigungen prüfen."
        )
    return response


def google_token(s):
    require(s.google_client_id, s.google_client_secret, s.google_refresh_token)
    return request(
        "POST",
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": s.google_client_id,
            "client_secret": s.google_client_secret,
            "refresh_token": s.google_refresh_token,
            "grant_type": "refresh_token",
        },
    ).json()["access_token"]


def number_id(value):
    value = value.replace("-", "")
    if not value.isdigit():
        raise ProviderError("Konto-ID muss numerisch sein")
    return value


def row(channel, day, key, value, source="account", unit="count"):
    return {
        "channel": channel,
        "date": str(day),
        "key": key,
        "value": float(value),
        "source_id": source,
        "unit": unit,
    }


def analytics(start, end, s):
    require(s.ga4_property_id)
    mapping = {
        "sessions": "sessions",
        "engagedSessions": "engaged_sessions",
        "keyEvents": "key_events",
    }
    body = {
        "dateRanges": [{"startDate": str(start), "endDate": str(end)}],
        "dimensions": [{"name": "date"}],
        "metrics": [{"name": m} for m in mapping],
        "limit": 10000,
        "keepEmptyRows": True,
    }
    data = request(
        "POST",
        f"https://analyticsdata.googleapis.com/v1beta/properties/{number_id(s.ga4_property_id)}:runReport",
        headers={"Authorization": f"Bearer {google_token(s)}"},
        json=body,
    ).json()
    if data.get("rowCount", 0) > 10000:
        raise ProviderError(
            "Unerwartet grosse Ergebnismenge; Import abgebrochen statt abgeschnitten."
        )
    return [
        row(
            "analytics",
            datetime.strptime(r["dimensionValues"][0]["value"], "%Y%m%d").date(),
            key,
            r["metricValues"][i]["value"],
        )
        for r in data.get("rows", [])
        for i, key in enumerate(mapping.values())
    ]


def google_ads(start, end, s):
    require(s.google_ads_customer_id, s.google_ads_developer_token)
    if not re.fullmatch(r"v\d+", s.google_ads_api_version):
        raise ProviderError("Ungültige API-Version")
    headers = {
        "Authorization": f"Bearer {google_token(s)}",
        "developer-token": s.google_ads_developer_token,
    }
    if s.google_ads_login_customer_id:
        headers["login-customer-id"] = number_id(s.google_ads_login_customer_id)
    url = f"https://googleads.googleapis.com/{s.google_ads_api_version}/customers/{number_id(s.google_ads_customer_id)}/googleAds:searchStream"
    query = f"SELECT segments.date, metrics.impressions, metrics.clicks, metrics.conversions, metrics.cost_micros, customer.currency_code FROM customer WHERE segments.date BETWEEN '{start}' AND '{end}'"
    data = request("POST", url, headers=headers, json={"query": query}).json()
    result = []
    for batch in data:
        for r in batch.get("results", []):
            for source, target in [
                ("impressions", "impressions"),
                ("clicks", "clicks"),
                ("conversions", "conversions"),
                ("costMicros", "spend"),
            ]:
                value = float(r.get("metrics", {}).get(source, 0))
                unit = (
                    r.get("customer", {}).get("currencyCode", s.google_ads_currency)
                    if target == "spend"
                    else "count"
                )
                result.append(
                    row(
                        "google_ads",
                        r["segments"]["date"],
                        target,
                        value / 1000000 if target == "spend" else value,
                        unit=unit,
                    )
                )
    return result


def linkedin_headers(s, *, ads=False):
    # Ads belongs to a separate app. Never fall back to the Community token.
    prefix = "linkedin_ads_" if ads else "linkedin_"
    token = getattr(s, prefix + "access_token", "")
    refresh_token = getattr(s, prefix + "refresh_token", "")
    if refresh_token:
        client_id = getattr(s, prefix + "client_id", "")
        client_secret = getattr(s, prefix + "client_secret", "")
        require(client_id, client_secret)
        token = request(
            "POST",
            "https://www.linkedin.com/oauth/v2/accessToken",
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": client_id,
                "client_secret": client_secret,
            },
        ).json()["access_token"]
    require(token)
    return {
        "Authorization": f"Bearer {token}",
        "LinkedIn-Version": s.linkedin_api_version,
        "X-Restli-Protocol-Version": "2.0.0",
    }


def linkedin_url(endpoint, params):
    # Rest.li 2.0 encodes scalar values (including URNs), but its structural
    # parentheses, commas and colons must remain literal on the wire.
    def encode(value):
        if isinstance(value, dict):
            return (
                "(" + ",".join(f"{quote(k, safe='')}:{encode(v)}" for k, v in value.items()) + ")"
            )
        if isinstance(value, list):
            return "List(" + ",".join(encode(v) for v in value) + ")"
        return quote(str(value), safe="")

    query = "&".join(
        f"{quote(k, safe='')}={quote(str(v), safe=',') if k == 'fields' else encode(v)}"
        for k, v in params.items()
    )
    return f"https://api.linkedin.com/rest/{endpoint}?{query}"


def linkedin(start, end, s):
    from .linkedin_ads import fetch

    return fetch(start, end, s)


def linkedin_organic(start, end, s):
    from datetime import timedelta

    require(s.linkedin_organization_id)
    # Never interpret a member/profile identifier as an organization identifier.
    if not re.fullmatch(r"[1-9][0-9]*", s.linkedin_organization_id):
        raise ProviderError(
            "LINKEDIN_ORGANIZATION_ID muss die numerische Unternehmensseiten-ID sein."
        )
    organization = f"urn:li:organization:{s.linkedin_organization_id}"
    params = {
        "q": "organizationalEntity",
        "organizationalEntity": organization,
        "timeIntervals": {
            "timeRange": {
                "start": int(
                    datetime.combine(start, datetime.min.time(), timezone.utc).timestamp() * 1000
                ),
                "end": int(
                    datetime.combine(
                        end + timedelta(days=1), datetime.min.time(), timezone.utc
                    ).timestamp()
                    * 1000
                ),
            },
            "timeGranularityType": "DAY",
        },
    }
    data = request(
        "GET",
        linkedin_url("organizationalEntityShareStatistics", params),
        headers=linkedin_headers(s),
    ).json()
    out = []
    for r in data.get("elements", []):
        if r.get("organizationalEntity") != organization:
            raise ProviderError(
                "LinkedIn hat Daten für eine andere oder unbekannte Organisation geliefert."
            )
        day = datetime.fromtimestamp(r["timeRange"]["start"] / 1000, timezone.utc).date()
        if not start <= day <= end:
            raise ProviderError(
                "LinkedIn hat Daten ausserhalb des angefragten Zeitraums geliefert."
            )
        for raw, key in [
            ("impressionCount", "impressions"),
            ("clickCount", "clicks"),
            ("likeCount", "likes"),
            ("commentCount", "comments"),
            ("shareCount", "shares"),
        ]:
            if raw in r.get("totalShareStatistics", {}):
                out.append(
                    row(
                        "linkedin_organic",
                        day,
                        key,
                        r["totalShareStatistics"][raw],
                        source=organization,
                    )
                )
    return out


def mailchimp(start, end, s):
    require(s.mailchimp_api_key, s.mailchimp_server)
    if not re.fullmatch(r"us\d+", s.mailchimp_server):
        raise ProviderError("Mailchimp-Server muss z. B. us21 lauten")
    out = []
    offset = 0
    while True:
        data = request(
            "GET",
            f"https://{s.mailchimp_server}.api.mailchimp.com/3.0/reports",
            auth=("sonio", s.mailchimp_api_key),
            params={
                "since_send_time": f"{start}T00:00:00+00:00",
                "before_send_time": f"{end}T23:59:59+00:00",
                "count": 1000,
                "offset": offset,
            },
        ).json()
        reports = data.get("reports", [])
        for r in reports:
            day = r["send_time"][:10]
            source = r["id"]
            out.extend(
                [
                    row("mailchimp", day, "emails_sent", r["emails_sent"], source),
                    row(
                        "mailchimp",
                        day,
                        "unique_opens",
                        r["opens"]["unique_opens"],
                        source,
                    ),
                    row(
                        "mailchimp",
                        day,
                        "unique_clicks",
                        r["clicks"]["unique_subscriber_clicks"],
                        source,
                    ),
                ]
            )
        offset += len(reports)
        if offset >= data.get("total_items", 0):
            break
        if not reports:
            raise ProviderError("Unvollständige Mailchimp-Paginierung")
    return out


def youtube(start, end, s):
    require(s.youtube_channel_id)
    data = request(
        "GET",
        "https://youtubeanalytics.googleapis.com/v2/reports",
        headers={"Authorization": f"Bearer {google_token(s)}"},
        params={
            "ids": f"channel=={s.youtube_channel_id}",
            "startDate": str(start),
            "endDate": str(end),
            "metrics": "views,estimatedMinutesWatched,subscribersGained",
            "dimensions": "day",
            "sort": "day",
            "maxResults": 200,
        },
    ).json()
    return [
        row("youtube", r[0], key, r[i + 1])
        for r in data.get("rows", [])
        for i, key in enumerate(["views", "watch_minutes", "subscribers_gained"])
    ]


def parse_docx(content, date_column="Anmeldedatum", email_column="E-Mail"):
    if len(content) > 10 * 1024 * 1024:
        raise ValueError("Die Word-Datei darf höchstens 10 MB gross sein.")
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            if (
                sum(i.file_size for i in archive.infolist()) > 40 * 1024 * 1024
                or len(archive.infolist()) > 1000
            ):
                raise ValueError("Die entpackte Word-Datei ist zu gross.")
        document = Document(io.BytesIO(content))
    except (zipfile.BadZipFile, KeyError):
        raise ValueError("Bitte eine gültige .docx-Datei verwenden.") from None
    dates = {}
    seen = set()
    found = False
    for table in document.tables:
        if not table.rows:
            continue
        headers = [c.text.strip().casefold() for c in table.rows[0].cells]
        if date_column.casefold() not in headers or email_column.casefold() not in headers:
            continue
        found = True
        di = headers.index(date_column.casefold())
        ei = headers.index(email_column.casefold())
        for i, r in enumerate(table.rows[1:], 2):
            texts = [c.text.strip() for c in r.cells]
            if not any(texts):
                continue
            email = texts[ei].casefold()
            raw = texts[di]
            day = None
            if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
                raise ValueError(f"Zeile {i}: gültige E-Mail-Adresse fehlt.")
            for fmt in ["%Y-%m-%d", "%d.%m.%Y", "%d/%m/%Y"]:
                try:
                    day = datetime.strptime(raw, fmt).date()
                    break
                except ValueError:
                    pass
            if day is None:
                raise ValueError(f"Zeile {i}: Anmeldedatum muss TT.MM.JJJJ oder JJJJ-MM-TT sein.")
            if email in seen:
                continue
            seen.add(email)
            dates[str(day)] = dates.get(str(day), 0) + 1
    if not found:
        raise ValueError(
            f"Keine Tabelle mit den Spalten „{date_column}“ und „{email_column}“ gefunden."
        )
    if not seen:
        raise ValueError("Die Anmeldetabelle enthält keine gültigen Anmeldungen.")
    return dates


def events(start, end, s):
    require(
        s.ms_tenant_id,
        s.ms_client_id,
        s.ms_client_secret,
        s.ms_drive_id,
        s.ms_folder_id,
    )
    token = request(
        "POST",
        f"https://login.microsoftonline.com/{quote(s.ms_tenant_id, safe='')}/oauth2/v2.0/token",
        data={
            "client_id": s.ms_client_id,
            "client_secret": s.ms_client_secret,
            "scope": "https://graph.microsoft.com/.default",
            "grant_type": "client_credentials",
        },
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    base = f"https://graph.microsoft.com/v1.0/drives/{quote(s.ms_drive_id, safe='')}/items"
    url = f"{base}/{quote(s.ms_folder_id, safe='')}/children"
    out = []
    files = 0
    while url:
        if not url.startswith("https://graph.microsoft.com/"):
            raise ProviderError("Unerwartetes Microsoft-Paginierungsziel")
        data = request("GET", url, headers=headers).json()
        for item in data.get("value", []):
            if not item.get("name", "").lower().endswith(".docx"):
                continue
            if item.get("size", 0) > 10 * 1024 * 1024:
                raise ProviderError("Word-Datei über 10 MB; Import abgebrochen.")
            files += 1
            # Graph /content redirects to a short-lived download URL. Never forward the bearer token.
            response = request(
                "GET", f"{base}/{quote(item['id'], safe='')}/content", headers=headers
            )
            if response.is_redirect:
                location = response.headers.get("location", "")
                if not location.startswith("https://"):
                    raise ProviderError("Ungültiger Download-Link von Microsoft")
                response = request("GET", location)
            counts = parse_docx(response.content, s.event_date_column, s.event_email_column)
            out.extend(
                row("events", day, "registrations", count, "graph:" + item["id"])
                for day, count in counts.items()
                if str(start) <= day <= str(end)
            )
        url = data.get("@odata.nextLink")
    if not files:
        raise ProviderError("Im konfigurierten Ordner wurden keine DOCX-Dateien gefunden.")
    return out


def qr(start, end, s):
    raise NotConfigured("QR-Anbieter noch offen. Normalisierten CSV-Import verwenden.")


ADAPTERS = {
    "google_ads": google_ads,
    "analytics": analytics,
    "linkedin": linkedin,
    "linkedin_organic": linkedin_organic,
    "mailchimp": mailchimp,
    "youtube": youtube,
    "events": events,
    "qr": qr,
}


def fetch_channel(channel, start, end):
    return ADAPTERS[channel](start, end, get_settings())
