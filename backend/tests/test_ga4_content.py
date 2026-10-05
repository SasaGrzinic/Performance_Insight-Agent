from datetime import date
from types import SimpleNamespace

from app import ga4_content as g


def test_categories_keep_profiles_and_indexes_out():
    assert g.category("/fr-ch/blog/article") == "blog"
    assert g.category("/news/story/") == "news"
    assert g.category("/customer-stories/example") == "stories"
    assert g.category("/solutions/datamanagement") == "competence"
    assert g.category("/fr-ch/hybrid-cloud") == "competence"
    for p in [
        "/blog",
        "/news/",
        "/paddy-gloor-verbindet-business-it",
        "/blog/a?token=x",
        "//evil.com",
    ]:
        assert g.category(p) is None


def test_pagination_titles_and_missing_values(monkeypatch):
    calls = []
    monkeypatch.setattr(g, "google_token", lambda *a: "test")

    def row(path, values, title=None):
        return {
            "dimensionValues": [{"value": v} for v in ([path, title] if title else [path])],
            "metricValues": [{"value": str(v)} for v in values],
        }

    def request(*a, **kw):
        b = kw["json"]
        calls.append(b)
        if len(b["dimensions"]) == 2:
            rows = [row("/blog/a", [2], "Alter Titel"), row("/blog/a", [5], "Aktueller Titel")]
            total = 2
        elif b["dateRanges"][0]["startDate"] == "2026-09-01":
            rows = (
                [row("/blog/a", [7, 2, 3, 40])]
                if b["offset"] == 0
                else [row("/news/b", [1, 1, 1, 5])]
            )
            total = 2
        else:
            rows = [row("/customer-stories/c", [3, 1, 2, 12])]
            total = 1
        return SimpleNamespace(json=lambda: {"rows": rows, "rowCount": total})

    monkeypatch.setattr(g, "request", request)
    r = g.fetch(
        SimpleNamespace(ga4_property_id="123", ga4_refresh_token="test"),
        "2026-09",
        date(2026, 9, 25),
    )
    assert r["previous_end"] == "2026-08-25"
    assert len(r["pages"]) == 3
    assert r["pages"][0]["title"] == "Aktueller Titel"
    assert r["pages"][0]["current"]["totalUsers"] == 2
    assert r["pages"][0]["current"]["engagementPerUser"] == 20
    assert r["pages"][0]["previous"] is None
    assert r["pages"][2]["current"] is None
    assert calls[1]["offset"] == 1


def test_sales_includes_profiles_and_services_without_changing_default(monkeypatch):
    monkeypatch.setattr(g, 'google_token', lambda *args: 'test')
    def request(*args, **kwargs):
        body = kwargs['json']
        rows = []
        for path in ['/services/managed-services', '/kutay-karaer-verbindet-business-it']:
            dims = [{'value': path}]
            vals = [4, 2, 3, 40]
            if len(body['dimensions']) == 2:
                dims.append({'value': 'Title'})
                vals = [4]
            rows.append({'dimensionValues': dims, 'metricValues': [{'value': str(v)} for v in vals]})
        return SimpleNamespace(json=lambda: {'rows': rows, 'rowCount': len(rows)})
    monkeypatch.setattr(g, 'request', request)
    s = SimpleNamespace(ga4_property_id='123', ga4_refresh_token='test')
    assert not g.fetch(s, '2026-10', date(2026, 10, 5))['pages']
    result = g.fetch(s, '2026-10', date(2026, 10, 5), include_all=True)
    assert len(result['pages']) == 2
    assert result['start'] == '2026-10-01'
    assert result['end'] == '2026-10-05'
