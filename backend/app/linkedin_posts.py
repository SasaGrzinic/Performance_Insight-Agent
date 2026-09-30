"""Read organization posts and lifetime statistics; never mix them into daily totals."""

import re
from datetime import datetime, timezone
from urllib.parse import parse_qs, quote, urlsplit

from sqlalchemy import select

from .connectors import ProviderError, linkedin_headers, linkedin_url, request, require
from .models import ChannelState, LinkedInPost, now

POST_FIELDS = {
    "impressionCount": "impressions",
    "clickCount": "clicks",
    "likeCount": "likes",
    "commentCount": "comments",
    "shareCount": "shares",
}
VIDEO_FIELDS = {
    "VIDEO_VIEW": "video_views",
    "VIEWER": "video_viewers",
    "TIME_WATCHED_FOR_VIDEO_VIEWS": "watch_time_ms",
}


def fetch_posts(start, end, s, videos_only=False):
    require(s.linkedin_organization_id)
    if not re.fullmatch(r"[1-9][0-9]*", s.linkedin_organization_id):
        raise ProviderError("Ungültige Unternehmensseiten-ID.")
    org = "urn:li:organization:" + s.linkedin_organization_id
    headers = linkedin_headers(s)
    posts = {}
    offset = 0
    for _ in range(100):
        page = request(
            "GET",
            linkedin_url(
                "posts",
                {"q": "author", "author": org, "count": 100, "start": offset, "sortBy": "CREATED"},
            ),
            headers=headers,
        ).json()
        elements = page.get("elements", [])
        for p in elements:
            if p.get("author") != org:
                raise ProviderError("Beitrag gehört nicht zur konfigurierten Unternehmensseite.")
            published = datetime.fromtimestamp(
                p.get("publishedAt", p.get("createdAt", 0)) / 1000, timezone.utc
            )
            if not start <= published.date() <= end or p.get("lifecycleState") != "PUBLISHED":
                continue
            if (
                p.get("adContext", {}).get("isDsc")
                or p.get("distribution", {}).get("feedDistribution") == "NONE"
            ):
                continue
            urn = p.get("id", "")
            if not re.fullmatch(r"urn:li:(ugcPost|share):[0-9]+", urn):
                raise ProviderError("LinkedIn hat eine ungültige Beitrags-ID geliefert.")
            content = p.get("content", {})
            media = content.get("media", {})
            article = content.get("article", {})
            kind = (
                "video"
                if media.get("id", "").startswith("urn:li:video:")
                else "image"
                if media.get("id", "").startswith("urn:li:image:") or "multiImage" in content
                else "article"
                if article
                else "text"
            )
            if videos_only and kind != "video":
                continue
            images = content.get("multiImage", {}).get("images", [])
            image_urn = (
                article.get("thumbnail")
                or media.get("id")
                or (images[0].get("id") if images else None)
            )
            text = p.get("commentary", "")
            posts[urn] = {
                "id": urn,
                "organization": org,
                "published_at": published.isoformat(),
                "kind": kind,
                "title": media.get("title")
                or article.get("title")
                or text.split("\n")[0][:180]
                or "LinkedIn-Beitrag",
                "text": text,
                "url": "https://www.linkedin.com/feed/update/" + urn + "/",
                "metrics": {},
                "video_status": "not_applicable",
                "metric_scope": "lifetime",
                "media_urn": image_urn,
            }
        links = page.get("paging", {}).get("links", [])
        next_link = next((link for link in links if link.get("rel") == "next"), None)
        if next_link:
            # LinkedIn can return short pages; never guess the next offset.
            values = parse_qs(urlsplit(next_link.get("href", "")).query).get("start", [])
            next_offset = int(values[0]) if values else offset + len(elements)
            if next_offset <= offset:
                raise ProviderError("LinkedIn hat eine ungültige Folgeseite geliefert.")
            offset = next_offset
        elif len(elements) == 100:
            offset += len(elements)
        else:
            break
    else:
        raise ProviderError("Zu viele Beiträge für einen Import. Zeitraum verkleinern.")
    for kind, param in [("share", "shares"), ("ugcPost", "ugcPosts")]:
        ids = [key for key in posts if key.startswith("urn:li:" + kind + ":")]
        for offset in range(0, len(ids), 20):
            batch = ids[offset : offset + 20]
            data = request(
                "GET",
                linkedin_url(
                    "organizationalEntityShareStatistics",
                    {"q": "organizationalEntity", "organizationalEntity": org, param: batch},
                ),
                headers=headers,
            ).json()
            # The provider defines omitted posts in a successful batch as zero activity.
            for urn in batch:
                posts[urn]["metrics"] = {key: 0 for key in POST_FIELDS.values()}
            for item in data.get("elements", []):
                urn = item.get("share") or item.get("ugcPost")
                if item.get("organizationalEntity") != org or urn not in batch:
                    raise ProviderError(
                        "Beitragsstatistik ist nicht eindeutig der Unternehmensseite zugeordnet."
                    )
                posts[urn]["metrics"] = {
                    key: item["totalShareStatistics"][raw]
                    for raw, key in POST_FIELDS.items()
                    if raw in item.get("totalShareStatistics", {})
                }
    for urn, post in posts.items():
        if post["kind"] != "video":
            continue
        if not urn.startswith("urn:li:ugcPost:"):
            post["video_status"] = "unsupported"
            continue
        post["video_status"] = "available"
        for kind, key in VIDEO_FIELDS.items():
            try:
                data = request(
                    "GET",
                    linkedin_url(
                        "videoAnalytics",
                        {"q": "entity", "entity": urn, "type": kind, "aggregation": "ALL"},
                    ),
                    headers=headers,
                ).json()
                elements = data.get("elements", [])
                if not elements:
                    post["video_status"] = "partial"
                    continue
                if any(
                    item.get("entity") != urn or item.get("statisticsType", kind) != kind
                    for item in elements
                ):
                    raise ProviderError(
                        "Videostatistik ist nicht eindeutig dem Beitrag zugeordnet."
                    )
                post["metrics"][key] = sum(item["value"] for item in elements)
            except ProviderError:
                post["video_status"] = "partial"
    return list(posts.values())


def sync_posts(db, start, end, s, videos_only=False):
    state = db.get(ChannelState, "linkedin_posts") or ChannelState(channel="linkedin_posts")
    try:
        posts = fetch_posts(start, end, s, videos_only=True) if videos_only else fetch_posts(start, end, s)
        media_posts = [p for p in posts if p.get("media_urn")]
        if media_posts:
            enrich_images(media_posts, s)
        for data in posts:
            record = db.get(LinkedInPost, data["id"]) or LinkedInPost(id=data["id"])
            if not data.get("image_url") and record.data:
                data["image_url"] = record.data.get("image_url")
                if record.data.get("image_source"):
                    data["image_source"] = record.data["image_source"]
            record.organization = data["organization"]
            record.published_at = data["published_at"]
            record.data = data
            record.updated_at = now()
            db.add(record)
        state.status = "connected"
        state.message = f"{len(posts)} Beiträge aktualisiert"
        state.last_success = now()
        db.add(state)
        db.commit()
    except Exception as exc:
        db.rollback()
        state = db.get(ChannelState, "linkedin_posts") or ChannelState(channel="linkedin_posts")
        state.status = "error"
        state.message = (
            str(exc)[:300]
            if isinstance(exc, ProviderError)
            else "Beiträge konnten nicht geladen werden. Verbindung prüfen."
        )
        db.add(state)
        db.commit()


def post_response(db, month, s):
    state = db.get(ChannelState, "linkedin_posts")
    records = db.scalars(
        select(LinkedInPost)
        .where(
            LinkedInPost.organization == "urn:li:organization:" + s.linkedin_organization_id,
            LinkedInPost.published_at.startswith(month),
        )
        .order_by(LinkedInPost.published_at.desc())
    ).all()
    return {
        "month": month,
        "status": state.status if state else "not_synced",
        "message": state.message if state else "Bitte Daten aktualisieren, um Beiträge zu laden.",
        "last_success": state.last_success.isoformat() if state and state.last_success else None,
        "posts": [{**p.data, "updated_at": p.updated_at.isoformat()} for p in records],
    }


def enrich_images(posts, s):
    headers = linkedin_headers(s)
    cache = {}
    for post in posts:
        urn = post.get("media_urn") or ""
        if not re.fullmatch(r"urn:li:(image|video):[A-Za-z0-9_-]+", urn):
            continue
        if urn not in cache:
            endpoint = "videos" if urn.startswith("urn:li:video:") else "images"
            try:
                data = request(
                    "GET",
                    "https://api.linkedin.com/rest/" + endpoint + "/" + quote(urn, safe=""),
                    headers=headers,
                ).json()
                url = data.get("thumbnail") if endpoint == "videos" else data.get("downloadUrl")
                host = urlsplit(url or "").hostname or ""
                cache[urn] = (
                    url
                    if urlsplit(url or "").scheme == "https"
                    and (host.endswith(".licdn.com") or host.endswith(".licdn-ei.com"))
                    else None
                )
            except ProviderError:
                cache[urn] = None
        post["image_url"] = cache[urn]
