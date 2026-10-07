from datetime import date
from types import SimpleNamespace

from app import ga4_monthly_sources as g


def test_monthly_property_scope_and_pagination(monkeypatch):
    calls = []
    monkeypatch.setattr(g, "google_token", lambda *a: "test")

    def req(*a, **kw):
        b = kw["json"]
        calls.append(b)
        return SimpleNamespace(
            json=lambda: {
                "rowCount": 2,
                "rows": [
                    {
                        "dimensionValues": [
                            {"value": "Direct" if b["offset"] == 0 else "Organic Search"}
                        ],
                        "metricValues": [{"value": "12"}],
                    }
                ],
            }
        )

    monkeypatch.setattr(g, "request", req)
    s = SimpleNamespace(ga4_property_id="123", ga4_refresh_token="test")
    r = g.fetch(s, "2026-08", date(2026, 9, 25))
    assert r["start"] == "2026-08-01" and r["end"] == "2026-08-31"
    assert not r["partial"] and len(r["sources"]) == 2
    assert calls[1]["offset"] == 1
    assert r["ai"]["sessions"] == 0
    assert any(b["dimensions"] == [{"name": "sessionSource"}] for b in calls)
    assert "dimensionFilter" not in calls[0]
    assert calls[0]["dimensions"] == [{"name": "sessionDefaultChannelGroup"}]
    assert g.fetch(s, "2026-09", date(2026, 9, 25))["end"] == "2026-09-25"


def test_requires_login(client):
    assert client.get("/api/analytics/monthly-sources?month=2026-09").status_code == 401


def test_annual_scope_is_one_report_not_summed_months(monkeypatch):
    calls = []
    monkeypatch.setattr(g, 'google_token', lambda *a: 'test')
    def req(*a, **kw):
        calls.append(kw['json'])
        return SimpleNamespace(json=lambda: {'rowCount': 0, 'rows': []})
    monkeypatch.setattr(g, 'request', req)
    s = SimpleNamespace(ga4_property_id='123', ga4_refresh_token='test')
    result = g.fetch(s, '2026-01', date(2026, 10, 6), annual=True)
    assert result['start'] == '2026-01-01'
    assert result['end'] == '2026-10-06'
    assert result['partial']
    assert all(c['dateRanges'] == [{'startDate': '2026-01-01', 'endDate': '2026-10-06'}] for c in calls)
    previous = g.fetch(s, '2025-01', date(2026, 10, 6), annual=True)
    assert previous['end'] == '2025-12-31'
    assert not previous['partial']
