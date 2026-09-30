"""Sonio videos selected by publication month, with current lifetime statistics."""

from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

from .connectors import ProviderError, google_token, request, require

METRICS = (
    "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,comments,shares"
)


def fetch(s, start, end, today=None, catalog_only=False):
    publication_start, publication_end = start, end
    end = today or datetime.now(ZoneInfo(getattr(s, "report_timezone", "Europe/Zurich"))).date()
    require(s.youtube_channel_id)
    headers = {"Authorization": f"Bearer {google_token(s)}"}

    def data(resource, **params):
        return request(
            "GET",
            f"https://www.googleapis.com/youtube/v3/{resource}",
            headers=headers,
            params=params,
        ).json()

    def pages(resource, **params):
        items, seen = [], set()
        while True:
            result = data(resource, maxResults=50, **params)
            items.extend(result.get("items", []))
            token = result.get("nextPageToken")
            if not token:
                return items
            if token in seen:
                raise ProviderError("Unvollständige YouTube-Paginierung")
            seen.add(token)
            params["pageToken"] = token

    channel = data("channels", part="id,contentDetails", mine="true").get("items", [])
    owned = next((c for c in channel if c["id"] == s.youtube_channel_id), None)
    if not owned:
        raise ProviderError("Autorisierter Sonio-Kanal nicht gefunden")
    uploads = owned["contentDetails"]["relatedPlaylists"]["uploads"]
    ids = list(
        dict.fromkeys(
            i["contentDetails"]["videoId"]
            for i in pages("playlistItems", part="contentDetails", playlistId=uploads)
        )
    )
    playlists = []
    for p in pages("playlists", part="snippet", channelId=s.youtube_channel_id):
        playlists.append(
            {
                "id": p["id"],
                "title": p["snippet"]["title"],
                "video_ids": [
                    i["contentDetails"]["videoId"]
                    for i in pages("playlistItems", part="contentDetails", playlistId=p["id"])
                ],
            }
        )
    ids = list(dict.fromkeys(ids + [v for p in playlists for v in p["video_ids"]]))
    available_years = set()
    videos = []
    latest_video = None
    for offset in range(0, len(ids), 50):
        for v in data(
            "videos",
            part="snippet,contentDetails,statistics",
            id=",".join(ids[offset : offset + 50]),
        ).get("items", []):
            sn = v["snippet"]
            if sn["channelId"] != s.youtube_channel_id:
                continue
            publication_date = (
                datetime.fromisoformat(sn["publishedAt"].replace("Z", "+00:00"))
                .astimezone(ZoneInfo(getattr(s, "report_timezone", "Europe/Zurich")))
                .date()
            )
            available_years.add(publication_date.year)
            thumbs = sn.get("thumbnails", {})
            image = next(
                (thumbs[k]["url"] for k in ("high", "medium", "default") if k in thumbs), None
            )
            item = {
                    "id": v["id"],
                    "title": sn["title"],
                    "published_at": sn["publishedAt"],
                    "image_url": image,
                    "metrics": None,
                    "duration": v.get("contentDetails", {}).get("duration"),
                    "lifetime": {
                        k: int(v["statistics"][field])
                        for k, field in [
                            ("views", "viewCount"),
                            ("likes", "likeCount"),
                            ("comments", "commentCount"),
                        ]
                        if field in v.get("statistics", {})
                    },
                }
            if latest_video is None or item["published_at"] > latest_video["published_at"]:
                latest_video = item
            if publication_start <= publication_date <= publication_end:
                videos.append(item)

    def report(**params):
        result = request(
            "GET",
            "https://youtubeanalytics.googleapis.com/v2/reports",
            headers=headers,
            params={
                "ids": f"channel=={s.youtube_channel_id}",
                "startDate": str(start),
                "endDate": str(end),
                **params,
            },
        ).json()
        keys = [h["name"] for h in result.get("columnHeaders", [])]
        return [dict(zip(keys, r)) for r in result.get("rows", [])]

    for video in ([] if catalog_only else videos):
        # Each video's full history, not activity confined to its publication month.
        rows = report(
            metrics=METRICS, filters="video==" + video["id"], startDate=video["published_at"][:10]
        )
        video["metrics"] = rows[0] if rows else {}
        if not video["metrics"].get("views"):
            video["metrics"]["averageViewDuration"] = None
            video["metrics"]["averageViewPercentage"] = None
        # Current counters have a different refresh cycle than Analytics reports.
        video["metrics"].update(video["lifetime"])
    return {
        "videos": sorted(videos, key=lambda v: v["published_at"], reverse=True),
        "playlists": playlists,
        "latest_video": latest_video,
        "available_years": sorted(available_years, reverse=True),
        "basis": "publication_lifetime_v1",
        "start": str(start),
        "end": str(end),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def traffic(s, video, start, end):
    headers = {"Authorization": f"Bearer {google_token(s)}"}
    result = request(
        "GET",
        "https://youtubeanalytics.googleapis.com/v2/reports",
        headers=headers,
        params={
            "ids": f"channel=={s.youtube_channel_id}",
            "startDate": str(start),
            "endDate": str(end),
            "dimensions": "insightTrafficSourceType",
            "metrics": "views,estimatedMinutesWatched",
            "filters": f"video=={video}",
            "sort": "-views",
            "maxResults": 200,
        },
    ).json()
    return {
        "sources": [
            {"source": r[0], "views": r[1], "watch_minutes": r[2]} for r in result.get("rows", [])
        ]
    }


def promotion_values(sources):
    paid = [row for row in sources if row["source"] == "ADVERTISING"]
    others = [row for row in sources if row["source"] != "ADVERTISING"]
    return {
        "paid_views": sum(row["views"] for row in paid) if paid else None,
        "other_views": sum(row["views"] for row in others) if others else None,
        "paid_watch_minutes": sum(row["watch_minutes"] for row in paid) if paid else None,
    }


def promoted(s):
    today = datetime.now(ZoneInfo(getattr(s, "report_timezone", "Europe/Zurich"))).date()
    catalog = fetch(s, date(2005, 1, 1), today, today=today, catalog_only=True)
    videos = []
    for video in catalog["videos"]:
        sources = traffic(s, video["id"], date.fromisoformat(video["published_at"][:10]), today)["sources"]
        values = promotion_values(sources)
        if values["paid_views"] is not None and values["paid_views"] > 0:
            videos.append({**video, "promotion": values, "sources": sources,
                           "metrics": video["lifetime"]})
    return {"videos": videos, "updated_at": catalog["updated_at"],
            "available_years": catalog["available_years"], "end": str(today)}
