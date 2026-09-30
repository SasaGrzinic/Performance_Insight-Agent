"""Read sent campaign summaries only; never retrieve subscriber records."""

import re
import unicodedata

import httpx

from .connectors import ProviderError, request, require, row


def fetch_year(s, end):
    require(s.mailchimp_api_key, s.mailchimp_server)
    if not re.fullmatch(r"us\d+", s.mailchimp_server):
        raise ProviderError("Ungültiger Mailchimp-Server")
    params = {
        "since_send_time": "2026-01-01T00:00:00+00:00",
        "before_send_time": f"{end}T23:59:59+00:00",
        "count": 1000,
    }

    def pages(resource, extra):
        result, seen = [], set()
        while True:
            d = request(
                "GET",
                f"https://{s.mailchimp_server}.api.mailchimp.com/3.0/{resource}",
                auth=("sonio", s.mailchimp_api_key),
                params={**params, **extra, "offset": len(result)},
            ).json()
            batch = d.get(resource, [])
            for item in batch:
                if item["id"] in seen:
                    raise ProviderError("Doppelter Mailchimp-Datensatz")
                seen.add(item["id"])
                result.append(item)
            if len(result) >= d.get("total_items", 0):
                return result
            if not batch:
                raise ProviderError("Unvollständige Mailchimp-Paginierung")

    campaigns = pages(
        "campaigns",
        {
            "status": "sent",
            "fields": "total_items,campaigns.id,campaigns.settings.title,campaigns.settings.subject_line,campaigns.send_time,campaigns.emails_sent,campaigns.type",
        },
    )
    reports = {
        r["id"]: r
        for r in pages(
            "reports",
            {
                "fields": "total_items,reports.id,reports.emails_sent,reports.opens.unique_opens,reports.clicks.unique_subscriber_clicks,reports.clicks.click_rate,reports.opens.open_rate,reports.bounces,reports.unsubscribed"
            },
        )
    }
    records, items = [], []
    for c in campaigns:
        day = c["send_time"][:10]
        if not "2026-01-01" <= day <= str(end):
            raise ProviderError("Mailchimp liefert Versand ausserhalb des Zeitraums")
        r = reports.get(c["id"], {})
        values = {
            "emails_sent": r.get("emails_sent", c.get("emails_sent")),
            "unique_opens": r.get("opens", {}).get("unique_opens"),
            "unique_clicks": r.get("clicks", {}).get("unique_subscriber_clicks"),
        }
        values.update(report_rates(r, values["emails_sent"]))
        item = {
            "id": c["id"],
            "title": c.get("settings", {}).get("title", ""),
            "subject": c.get("settings", {}).get("subject_line", ""),
            "send_time": c["send_time"],
            "values": values,
            "report_available": bool(r),
        }
        if grouping(item)[2]:
            continue
        items.append(item)
        for key, value in values.items():
            if key in {"emails_sent", "unique_opens", "unique_clicks"} and value is not None:
                records.append(row("mailchimp", day, key, value, c["id"]))
    return records, items


def report_rates(report, sent):
    bounces = report.get("bounces", {})
    hard, soft = bounces.get("hard_bounces"), bounces.get("soft_bounces")
    delivered = (
        sent - hard - soft if sent is not None and hard is not None and soft is not None else None
    )
    if delivered is not None and not 0 <= delivered <= sent:
        delivered = None

    def percent(value):
        return value * 100 if value is not None else None

    unsubscribed = report.get("unsubscribed")
    return {
        "hard_bounces": hard,
        "soft_bounces": soft,
        "delivered": delivered,
        "delivery_rate": delivered / sent * 100 if delivered is not None and sent else None,
        "click_rate": percent(report.get("clicks", {}).get("click_rate")),
        "open_rate": percent(report.get("opens", {}).get("open_rate")),
        "unsubscribed": unsubscribed,
        "unsubscribe_rate": unsubscribed / delivered * 100
        if unsubscribed is not None and delivered
        else None,
    }


def normalized(text):
    return re.sub(
        r"\s+",
        " ",
        "".join(
            c
            for c in unicodedata.normalize("NFKD", text.casefold())
            if not unicodedata.combining(c)
        ),
    ).strip()


def grouping(item):
    title = item["title"].strip()
    text = normalized(title + " " + item["subject"])
    test = bool(re.search(r"(?<![a-z])test(?:mailing|versand|mail)?(?![a-z])|template", text))
    # User-confirmed Fly7 series; IDs avoid merging unrelated future invitations.
    fly7_stages = {
        "f274f58c34": "Initialmailing",
        "731003dd77": "Reminder 1",
        "3a453ecd84": "Reminder 2",
        "091162157e": "Reminder · Eventinformationen",
        "dc88a07aa8": "Dankesmailing",
    }
    if item["id"] in fly7_stages:
        return "Fly7 Event 2026", fly7_stages[item["id"]], test
    stage = "Mailing"
    if re.search(r"resend", text):
        stage = "Erneuter Versand"
    elif re.search(r"danke|rückblick|ruckblick|grace a vous|merci", text):
        stage = "Dankesmailing"
    elif re.search(r"reminder|erinnerung|noch \d+ tage|j 2", text):
        stage = "Reminder"
    elif re.search(r"einladung|invitation|mailing 1", text):
        stage = "Initialmailing"
    elif "mailing 2" in text:
        stage = "Mailing 2"
    if "zoo" in text and ("zurich" in text or "event" in text):
        group = "Zoo Zürich 2026"
    elif "ai experience" in text.replace("-", " ") or "ai event" in text:
        group = "AI Experience 2026"
    elif "swiss it forum" in text:
        group = "Swiss IT Forum 2026"
    elif "private cloud mit vcf 9.0" in text:
        group = "Private Cloud mit VCF 9.0"
    else:
        months = {
            "januar": "Januar",
            "janvier": "Januar",
            "februar": "Februar",
            "fevrier": "Februar",
            "marz": "März",
            "mars": "März",
            "april": "April",
            "avril": "April",
            "juni": "Juni",
            "juin": "Juni",
        }
        match = re.search(r"sonio nl (\w+) 2026", text)
        if match and match[1] in months:
            group = f"Sonio Newsletter {months[match[1]]} 2026"
        else:
            group = re.sub(r"^resend:\s*", "", title or item["subject"], flags=re.I).strip()
            if not group:
                group = "Mailing " + item["id"]
    return group, stage, test


def summary(db):
    from sqlalchemy import select

    from .models import ChannelState, MailchimpCampaign

    groups = {}
    for c in db.scalars(select(MailchimpCampaign)).all():
        item = dict(c.data)
        if not item.get("active_in_snapshot", True) or not item["send_time"].startswith("2026-"):
            continue
        name, stage, test = grouping(item)
        if test:
            continue
        item.update(stage=stage, test=test)
        groups.setdefault(name, []).append(item)
    result = []
    for name, mailings in groups.items():
        mailings.sort(key=lambda m: (m["send_time"], m["id"]))
        result.append({"name": name, "mailings": mailings})
    result.sort(key=lambda g: g["mailings"][0]["send_time"])
    state = db.get(ChannelState, "mailchimp")
    return {
        "year": 2026,
        "groups": result,
        "count": sum(len(g["mailings"]) for g in result),
        "last_success": state.last_success.isoformat() if state and state.last_success else None,
        "status": state.status if state else "not_configured",
    }


def mailing_image(html):
    """First large content image, excluding logos, icons and tracking pixels."""
    from html.parser import HTMLParser
    from urllib.parse import urlparse

    class Images(HTMLParser):
        candidates = []

        def handle_starttag(self, tag, attrs):
            if tag != "img":
                return
            a = dict(attrs)
            src = a.get("src", "")
            host = urlparse(src).hostname or ""
            if not src.startswith("https://") or not (
                host == "mcusercontent.com"
                or host.endswith(".mcusercontent.com")
                or host.endswith(".sonio.com")
                or host == "www.sonio.com"
            ):
                return
            if re.search(
                r"logo|social|icon|tracking", a.get("alt", "") + " " + a.get("class", ""), re.I
            ):
                return
            width = re.match(r"\d+", a.get("width", ""))
            if width and int(width[0]) >= 300:
                self.candidates.append(src)

    parser = Images()
    parser.candidates = []
    parser.feed(html)
    return parser.candidates[0] if parser.candidates else None


def enrich_mailing_images(items, previous, s):
    for item in items:
        cached = previous.get(item["id"], {}).get("image_url")
        if cached:
            item["image_url"] = cached
            continue
        try:
            content = request(
                "GET",
                f"https://{s.mailchimp_server}.api.mailchimp.com/3.0/campaigns/{item['id']}/content",
                auth=("sonio", s.mailchimp_api_key),
            ).json()
            item["image_url"] = mailing_image(content.get("html", ""))
        except (ProviderError, httpx.TransportError):
            item["image_url"] = None
