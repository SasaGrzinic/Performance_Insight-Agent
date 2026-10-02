from datetime import date
from types import SimpleNamespace

import pytest

from app import search_insights as module


def test_organic_property_totals_are_not_query_totals(monkeypatch):
    monkeypatch.setattr(module, "google_token", lambda *a: "test")

    def request(method, url, **kwargs):
        assert "sc-domain%3Asonio.com" in url
        body = kwargs["json"]
        assert body["dataState"] == "final"
        dims = body["dimensions"]
        rows = (
            [{"clicks": 20, "impressions": 100}]
            if not dims
            else [{"keys": ["cloud"], "clicks": 2, "impressions": 20, "ctr": 0.1, "position": 7}]
            if len(dims) == 1
            else [{"keys": ["cloud", "https://www.sonio.com/hybrid-cloud"], "clicks": 2}]
        )
        return SimpleNamespace(json=lambda: {"rows": rows})

    monkeypatch.setattr(module, "request", request)
    result = module.fetch(
        SimpleNamespace(gsc_refresh_token="test"), date(2026, 9, 1), date(2026, 9, 30), "organic"
    )
    assert result["totals"]["clicks"] == 20
    assert result["rows"][0]["clicks"] == 2
    assert result["rows"][0]["ctr"] == 10
    assert result["rows"][0]["pages"][0]["url"].endswith("/hybrid-cloud")


def test_ads_scope_and_fractional_conversions(monkeypatch):
    monkeypatch.setattr(module, "google_token", lambda *a: "test")
    settings = SimpleNamespace(
        google_ads_refresh_token="test",
        google_ads_customer_id="9325395786",
        google_ads_developer_token="",
        google_ads_login_customer_id="",
        google_ads_api_version="v25",
    )

    def request(method, url, **kwargs):
        assert "FROM campaign_search_term_view" in kwargs["json"]["query"]
        row = {
            "campaign": {"name": "Cloud", "advertisingChannelType": "PERFORMANCE_MAX"},
            "customer": {"currencyCode": "CHF"},
            "campaignSearchTermView": {"searchTerm": "cloud"},
            "metrics": {
                "clicks": "2",
                "impressions": "20",
                "costMicros": "1250000",
                "conversions": 0.5,
            },
        }
        return SimpleNamespace(json=lambda: [{"results": [row]}])

    monkeypatch.setattr(module, "request", request)
    result = module.fetch(settings, date(2026, 9, 1), date(2026, 9, 30), "paid")
    assert result["rows"][0]["spend"] == 1.25
    assert result["rows"][0]["conversions"] == 0.5
    assert result["rows"][0]["ctr"] == 10
    settings.google_ads_customer_id = "wrong"
    with pytest.raises(module.ProviderError):
        module.fetch(settings, date(2026, 9, 1), date(2026, 9, 30), "paid")
