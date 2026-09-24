from datetime import date, datetime, timezone
from types import SimpleNamespace

import pytest

from app import linkedin_posts as lp
from app.analytics import build_dashboard
from app.connectors import ProviderError
from app.models import ChannelState, LinkedInPost, Metric

ORG = "urn:li:organization:622072"
URN = "urn:li:ugcPost:123456"
S = SimpleNamespace(linkedin_organization_id="622072")
STAMP = int(datetime(2026, 8, 3, tzinfo=timezone.utc).timestamp() * 1000)


def fake_post(**changes):
    return {
        "id": URN,
        "author": ORG,
        "publishedAt": STAMP,
        "createdAt": STAMP,
        "lifecycleState": "PUBLISHED",
        "commentary": "Sonio Video",
        "content": {"media": {"id": "urn:li:video:abc"}},
        **changes,
    }


def test_organization_only_lifetime_posts_and_video_units(monkeypatch):
    calls = []

    def request(method, url, **kwargs):
        from urllib.parse import unquote

        url = unquote(url)
        calls.append(url)
        if "/posts?" in url:
            data = {"elements": [fake_post()], "paging": {"links": []}}
        elif "organizationalEntityShareStatistics" in url:
            assert "timeIntervals" not in url
            assert "ugcPosts=List(" + URN + ")" in url
            data = {
                "elements": [
                    {
                        "organizationalEntity": ORG,
                        "ugcPost": URN,
                        "totalShareStatistics": {
                            "impressionCount": 123,
                            "clickCount": 0,
                            "likeCount": -1,
                        },
                    }
                ]
            }
        else:
            data = {"elements": [{"entity": URN, "value": 60000}]}
        return SimpleNamespace(json=lambda: data)

    monkeypatch.setattr(lp, "linkedin_headers", lambda s: {})
    monkeypatch.setattr(lp, "request", request)
    result = lp.fetch_posts(date(2026, 8, 1), date(2026, 8, 31), S)
    assert len(result) == 1
    assert result[0]["metrics"] == {
        "impressions": 123,
        "clicks": 0,
        "likes": -1,
        "video_views": 60000,
        "video_viewers": 60000,
        "watch_time_ms": 60000,
    }
    assert result[0]["metric_scope"] == "lifetime"
    assert all("urn:li:person:" not in url for url in calls)


def test_reject_foreign_organization(monkeypatch):
    monkeypatch.setattr(lp, "linkedin_headers", lambda s: {})
    monkeypatch.setattr(
        lp,
        "request",
        lambda *a, **kw: SimpleNamespace(
            json=lambda: {"elements": [fake_post(author="urn:li:organization:99")]}
        ),
    )
    with pytest.raises(ProviderError, match="Unternehmensseite"):
        lp.fetch_posts(date(2026, 8, 1), date(2026, 8, 31), S)


def test_partial_paging_continues_and_filters_publication_dates(monkeypatch):
    calls = []

    def request(method, url, **kw):
        calls.append(url)
        if "start=0" in url:
            data = {
                "elements": [fake_post(lifecycleState="DRAFT")],
                "paging": {"links": [{"rel": "next"}]},
            }
        else:
            data = {"elements": [fake_post(publishedAt=1, createdAt=1)]}
        return SimpleNamespace(json=lambda: data)

    monkeypatch.setattr(lp, "linkedin_headers", lambda s: {})
    monkeypatch.setattr(lp, "request", request)
    assert lp.fetch_posts(date(2026, 8, 1), date(2026, 8, 31), S) == []
    assert len(calls) == 2


def test_sync_failure_keeps_previous_posts_and_account_state(db, monkeypatch):
    db.add(
        LinkedInPost(
            id=URN,
            organization=ORG,
            published_at="2026-08-03T00:00:00+00:00",
            data={"title": "Previously loaded"},
        )
    )
    db.add(ChannelState(channel="linkedin_organic", status="connected"))
    db.commit()

    def fail(*args):
        raise ProviderError("HTTP 403")

    monkeypatch.setattr(lp, "fetch_posts", fail)
    lp.sync_posts(db, date(2026, 8, 1), date(2026, 8, 31), S)
    assert db.get(LinkedInPost, URN).data["title"] == "Previously loaded"
    assert db.get(ChannelState, "linkedin_organic").status == "connected"
    assert db.get(ChannelState, "linkedin_posts").status == "error"


def test_reimport_updates_without_double_counting(db, monkeypatch):
    data = {
        "id": URN,
        "organization": ORG,
        "published_at": "2026-08-03T00:00:00+00:00",
        "metrics": {"impressions": 500},
    }
    monkeypatch.setattr(lp, "fetch_posts", lambda *a: [data])
    for _ in range(2):
        lp.sync_posts(db, date(2026, 8, 1), date(2026, 8, 31), S)
    assert len(lp.post_response(db, "2026-08", S)["posts"]) == 1
    dashboard = build_dashboard(db, "2026-08", today=date(2026, 9, 16))
    assert next(c for c in dashboard["channels"] if c["id"] == "linkedin_organic")["values"] == {}


def test_daily_metrics_preserve_zero_missing_and_leap_days(db):
    db.add_all(
        [
            Metric(channel="linkedin_organic", date="2024-02-29", key="clicks", value=0),
            Metric(channel="linkedin_organic", date="2024-02-29", key="impressions", value=5),
        ]
    )
    db.commit()
    d = build_dashboard(db, "2024-02", today=date(2026, 9, 16))
    assert len(d["series"]) == 29
    assert d["series"][-1]["linkedin_organic.clicks"] == 0
    assert d["series"][-1]["linkedin_organic.impressions"] == 5
    assert d["series"][0]["linkedin_organic.clicks"] is None


def test_posts_require_auth_and_do_not_expose_other_organizations(
    client, logged_in, db, monkeypatch
):
    from app import main

    monkeypatch.setattr(main.s, "linkedin_organization_id", "622072")
    db.add_all(
        [
            LinkedInPost(
                id=URN, organization=ORG, published_at="2026-08-03T00:00:00+00:00", data={"id": URN}
            ),
            LinkedInPost(
                id="foreign",
                organization="urn:li:organization:99",
                published_at="2026-08-03T00:00:00+00:00",
                data={"id": "foreign"},
            ),
        ]
    )
    db.commit()
    r = logged_in.get("/api/linkedin/posts?month=2026-08")
    assert r.status_code == 200
    assert [p["id"] for p in r.json()["posts"]] == [URN]
    assert logged_in.get("/api/linkedin/posts?month=invalid").status_code == 422
    client.cookies.clear()
    assert client.get("/api/linkedin/posts?month=2026-08").status_code == 401


def test_short_page_uses_provider_offset_and_old_drafts_do_not_stop_scan(monkeypatch):
    calls = []

    def request(method, url, **kwargs):
        calls.append(url)
        if "/posts?" in url:
            if "start=0" in url:
                data = {
                    "elements": [fake_post(publishedAt=1, createdAt=1)],
                    "paging": {"links": [{"rel": "next", "href": "/rest/posts?start=1&count=100"}]},
                }
            else:
                assert "start=1&" in url
                data = {"elements": [fake_post(createdAt=1, content={})]}
        else:
            data = {"elements": []}
        return SimpleNamespace(json=lambda: data)

    monkeypatch.setattr(lp, "linkedin_headers", lambda s: {})
    monkeypatch.setattr(lp, "request", request)
    result = lp.fetch_posts(date(2026, 8, 1), date(2026, 8, 31), S)
    assert [post["id"] for post in result] == [URN]
    assert len([u for u in calls if "/posts?" in u]) == 2
