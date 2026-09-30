import json
from datetime import date
from types import SimpleNamespace

import pytest

from app import ga4_areas as g


def test_publication_cohorts_not_traffic_month():
    pages = [
        {"published_at": "2026-06-12"},
        {"published_at": "2026-09-01"},
        {"published_at": None},
        {"published_at": "2026-12-01"},
    ]
    assert g.select_pages(pages, "2026-06", date(2026, 9, 25)) == pages[:1]
    assert g.select_pages(pages, "2026", date(2026, 9, 25)) == pages[:2]
    assert g.select_pages(pages, "unknown", date(2026, 9, 25)) == pages[2:3]
    with pytest.raises(ValueError):
        g.select_pages(pages, "2026-13", date(2026, 9, 25))


def test_metadata_uses_editorial_not_update_or_creation(monkeypatch):
    story = {
        "name": "Test",
        "created_at": "2024-01-01",
        "first_published_at": "2026-06-13T09:00:00Z",
        "published_at": "2026-09-25T09:00:00Z",
        "content": {
            "date": "2026-06-12 00:00",
            "bannerImage": {"filename": "https://a.storyblok.com/f/header.jpg"},
        },
    }
    html = (
        '<script id="__NEXT_DATA__">'
        + json.dumps({"props": {"pageProps": {"story": story}}})
        + "</script>"
    )
    monkeypatch.setattr(
        g.httpx, "get", lambda *a, **kw: SimpleNamespace(text=html, raise_for_status=lambda: None)
    )
    p = g.metadata("/blog/test")
    assert p["published_at"] == "2026-06-12"
    assert p["date_source"] == "Artikeldatum"
    assert p["image"] == "https://a.storyblok.com/f/header.jpg"
    assert not g.belongs("blog", "//evil.com/blog/a")
    assert not g.belongs("blog", "/blog/../private")


def test_lifetime_dates_missing_is_not_zero(monkeypatch):
    bodies = []
    monkeypatch.setattr(g, "google_token", lambda *a: "test")

    def req(*a, **kw):
        bodies.extend(kw["json"]["requests"])
        return SimpleNamespace(
            json=lambda: {
                "reports": [
                    {
                        "rows": [{"metricValues": [{"value": str(v)} for v in [10, 2, 4, 50]]}],
                        "rowCount": 1,
                    },
                    {"rows": [], "rowCount": 0},
                ]
            }
        )

    monkeypatch.setattr(g, "request", req)
    pages = [
        {"path": "/blog/a", "published_at": "2026-06-12"},
        {"path": "/blog/b", "published_at": "2026-06-20"},
    ]
    r = g.fetch(
        SimpleNamespace(ga4_property_id="123", ga4_refresh_token="test"), pages, date(2026, 9, 25)
    )
    assert bodies[0]["dateRanges"] == [{"startDate": "2026-06-12", "endDate": "2026-09-25"}]
    assert r["pages"][0]["current"]["totalUsers"] == 2
    assert r["pages"][0]["current"]["engagementPerUser"] == 25
    assert r["pages"][1]["current"] is None


def test_ai_traffic_uses_same_lifetime_and_paginates(monkeypatch):
    calls = []
    monkeypatch.setattr(g, "google_token", lambda *a: "test")

    def req(*a, **kw):
        b = kw["json"]
        calls.append(b)
        dims = [d["name"] for d in b["dimensions"]]
        values = ["Switzerland", "Zurich"] if dims == ["country", "region"] else ["Organic Search"]
        rows = [
            {"dimensionValues": [{"value": v} for v in values], "metricValues": [{"value": "3"}]}
        ]
        return SimpleNamespace(
            json=lambda: {"rows": rows, "rowCount": 2 if dims == ["sessionSource"] else 1}
        )

    monkeypatch.setattr(g, "request", req)
    r = g.traffic(
        SimpleNamespace(ga4_property_id="123", ga4_refresh_token="test"),
        {"path": "/blog/a", "published_at": "2026-06-12"},
        date(2026, 9, 25),
    )
    assert all(b["dateRanges"][0]["startDate"] == "2026-06-12" for b in calls)
    assert r["ai"]["sessions"] == 0
    assert any(b["offset"] == 1 for b in calls)
    assert "countries" not in r and "regions" not in r


def test_cohorts_and_geography_require_login(client):
    assert client.get("/api/analytics/areas?area=blog&period=2026-06").status_code == 401
    assert client.get("/api/analytics/area-traffic?area=blog&path=/blog/a").status_code == 401


def test_unknown_period_and_unlisted_page_rejected(logged_in):
    assert logged_in.get("/api/analytics/areas?area=blog&period=2026-13").status_code == 422
    assert (
        logged_in.get("/api/analytics/area-traffic?area=blog&path=//other.example").status_code
        == 404
    )


def test_behind_the_scenes_separate_from_blog():
    for path in [
        "/blog/ein-blick-hinter-die-kulissen-heiko-schuermann",
        "/fr-ch/blog/blick-hinter-die-kulissen-laura-nussbaumer",
    ]:
        assert g.belongs("behind", path)
        assert not g.belongs("blog", path)
    assert g.belongs("blog", "/blog/spezialisten-loesen-ihr-chaos-nicht")
    assert not g.belongs("behind", "/blog/spezialisten-loesen-ihr-chaos-nicht")


def test_all_publication_period_includes_older_and_undated_pages():
    pages = [{"published_at": d} for d in ["2025-07-01", "2026-06-01", None, "2027-01-01"]]
    assert g.select_pages(pages, "all", date(2026, 9, 25)) == pages[:3]


def test_profile_uses_editorial_photo_below_video():
    content = {"body": [
        {"component": "heroVideo", "videoCode": {"filename": "https://a.storyblok.com/person.mp4"}},
        {"component": "cta", "image": {"filename": "https://a.storyblok.com/person.jpg"}},
        {"component": "cta", "image": {"filename": "https://a.storyblok.com/footer.jpg"}},
    ]}
    assert g.profile_image(content) == "https://a.storyblok.com/person.jpg"


def test_website_areas_match_current_navigation():
    roots = ["/full-service-provider", "/datamanagement", "/digital-workplace",
             "/hybrid-cloud", "/artificial-intelligence"]
    for prefix in ["", "/fr-ch"]:
        for path in roots:
            assert g.belongs("competence", prefix + path)
        assert g.belongs("services", prefix + "/services/consulting")
        assert g.belongs("services", prefix + "/services/sonio-cloud")
        assert g.belongs("videos", prefix + "/video")
        assert g.belongs("videos", prefix + "/video/example")
        assert not g.belongs("competence", prefix + "/services/consulting")
        assert not g.belongs("competence", prefix + "/solutions/storage")
        assert not g.belongs("competence", prefix + "/business-continuity")
    for area in ["competence", "services", "videos"]:
        assert not g.belongs(area, "//evil.com/services/test")
        assert not g.belongs(area, "/services/../private")
        assert not g.belongs(area, "/video?preview=1")
    assert g.select_pages([{"published_at": "2024-01-01"}, {"published_at": None}],
                          "all", date(2026, 9, 30)) == [
                              {"published_at": "2024-01-01"}, {"published_at": None}]


def test_monthly_comparison_separate_from_publication_and_missing(monkeypatch):
    bodies = []
    def req(*args, **kwargs):
        bodies.extend(kwargs['json']['requests'])
        return SimpleNamespace(json=lambda: {'reports': [
            {'rows': [{'metricValues': [{'value': str(v)} for v in [20, 4, 8, 120]]}], 'rowCount': 1},
            {'rows': [], 'rowCount': 0},
        ]})
    monkeypatch.setattr(g, 'request', req)
    settings = SimpleNamespace(ga4_property_id='123')
    result = g.monthly_comparison(settings, [{'path': '/services/consulting', 'published_at': '2023-08-01'}], date(2026, 9, 30), {})
    assert bodies[0]['dateRanges'] == [{'startDate': '2026-09-01', 'endDate': '2026-09-30'}]
    assert bodies[1]['dateRanges'] == [{'startDate': '2026-08-01', 'endDate': '2026-08-31'}]
    assert result[0]['current']['engagementPerUser'] == 30
    assert result[0]['previous'] is None
    bodies.clear()
    g.monthly_comparison(settings, [{'path': '/services/consulting'}], date(2026, 9, 12), {})
    assert bodies[1]['dateRanges'][0]['endDate'] == '2026-08-12'
