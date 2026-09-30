from datetime import date
from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.connectors import ProviderError
from app.youtube_videos import fetch


class Result:
    def __init__(self, data):
        self.data = data

    def json(self):
        return self.data


def test_verified_library_pagination_and_missing_metrics():
    def request(method, url, **kw):
        p = kw["params"]
        if url.endswith("/channels"):
            return Result(
                {
                    "items": [
                        {
                            "id": "sonio",
                            "contentDetails": {"relatedPlaylists": {"uploads": "uploads"}},
                        }
                    ]
                }
            )
        if url.endswith("/playlists"):
            return Result({"items": []})
        if url.endswith("/playlistItems"):
            return Result(
                {"items": [{"contentDetails": {"videoId": "b"}}]}
                if p.get("pageToken")
                else {"items": [{"contentDetails": {"videoId": "a"}}], "nextPageToken": "next"}
            )
        if url.endswith("/videos"):
            return Result(
                {
                    "items": [
                        {
                            "id": v,
                            "snippet": {
                                "channelId": "sonio",
                                "title": v,
                                "publishedAt": "2026-10-04T12:00:00Z" if v == "newest" else "2026-09-04T12:00:00Z"
                                if v != "old"
                                else "2026-01-01T12:00:00Z",
                                "thumbnails": {},
                            },
                        }
                        for v in ["a", "b", "old", "newest"]
                    ]
                }
            )
        assert p["filters"] in {"video==a", "video==b"}
        assert p["startDate"] == "2026-09-04"
        assert p["endDate"] == "2026-10-25"
        return Result({"columnHeaders": [{"name": "views"}], "rows": [[0]]})

    with (
        patch("app.youtube_videos.google_token", return_value="test"),
        patch("app.youtube_videos.request", side_effect=request),
    ):
        r = fetch(
            SimpleNamespace(youtube_channel_id="sonio"),
            date(2026, 9, 1),
            date(2026, 9, 25),
            today=date(2026, 10, 25),
        )
    assert r["latest_video"]["id"] == "newest"
    assert r["latest_video"]["metrics"] is None
    assert len(r["videos"]) == 2
    assert r["videos"][0]["metrics"]["views"] == 0
    assert r["videos"][1]["metrics"]["views"] == 0
    assert r["videos"][1]["metrics"]["averageViewDuration"] is None


def test_wrong_channel_rejected():
    with (
        patch("app.youtube_videos.google_token", return_value="test"),
        patch("app.youtube_videos.request", return_value=Result({"items": []})),
    ):
        with pytest.raises(ProviderError):
            fetch(
                SimpleNamespace(youtube_channel_id="sonio"),
                date(2026, 9, 1),
                date(2026, 9, 25),
                today=date(2026, 10, 25),
            )


def test_year_endpoint_uses_separate_cache_and_full_publication_year(monkeypatch):
    from datetime import datetime
    from zoneinfo import ZoneInfo

    from app.main import youtube_videos

    current = datetime.now(ZoneInfo("Europe/Zurich")).date()
    requested = f"{current.year - 1}-06"
    calls = []

    class DB:
        def get(self, model, key):
            calls.append(key)
            return None

        def add(self, value):
            self.saved = value

        def commit(self):
            pass

    def loader(settings, start, end):
        assert start == date(current.year - 1, 1, 1)
        assert end == date(current.year - 1, 12, 31)
        return {"videos": [], "latest_video": None}

    monkeypatch.setattr("app.youtube_videos.fetch", loader)
    db = DB()
    youtube_videos(month=requested, year=True, refresh=False, user=object(), db=db)
    assert calls == [f"youtube:published:{requested}:year"]


def test_promoted_values_do_not_label_unknown_as_organic():
    from app.youtube_videos import promotion_values

    values = promotion_values([
        {"source": "ADVERTISING", "views": 80, "watch_minutes": 25},
        {"source": "NO_LINK_OTHER", "views": 10, "watch_minutes": 1},
        {"source": "YT_SEARCH", "views": 5, "watch_minutes": 2},
    ])
    assert values == {"paid_views": 80, "other_views": 15, "paid_watch_minutes": 25}
    assert promotion_values([])["paid_views"] is None


def test_promoted_checks_all_videos_but_only_includes_advertising(monkeypatch):
    from app.youtube_videos import promoted

    monkeypatch.setattr('app.youtube_videos.fetch', lambda *a, **k: {
        'videos': [{'id': key, 'published_at': '2024-01-01T12:00:00Z', 'lifetime': {'views': 123}}
                   for key in ['paid', 'playlist_only']],
        'available_years': [2024], 'updated_at': '2026-09-30T12:00:00+00:00',
    })
    monkeypatch.setattr('app.youtube_videos.traffic', lambda s, key, *a: {'sources': [
        {'source': 'ADVERTISING' if key == 'paid' else 'YT_SEARCH', 'views': 12, 'watch_minutes': 4}
    ]})
    result = promoted(SimpleNamespace())
    assert [v['id'] for v in result['videos']] == ['paid']
