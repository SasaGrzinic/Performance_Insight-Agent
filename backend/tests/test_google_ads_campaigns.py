from datetime import date
from types import SimpleNamespace

import pytest

from app import google_ads_campaigns as module


def settings():
    return SimpleNamespace(
        google_ads_refresh_token="test",
        google_ads_customer_id="9325395786",
        google_ads_developer_token="",
        google_ads_login_customer_id="",
        google_ads_api_version="v25",
    )


def test_metrics_and_asset_attribution(monkeypatch):
    monkeypatch.setattr(module, "google_token", lambda *a: "test")

    def request(*args, **kwargs):
        q = kwargs["json"]["query"]
        if "FROM campaign " in q:
            rows = [
                {
                    "campaign": {
                        "id": "1",
                        "name": "One",
                        "status": "ENABLED",
                        "advertisingChannelType": "PERFORMANCE_MAX",
                    },
                    "customer": {"currencyCode": "CHF"},
                    "metrics": {
                        "clicks": "10",
                        "impressions": "100",
                        "costMicros": "20000000",
                        "conversions": 2,
                        "conversionsFromInteractionsRate": 0.1,
                    },
                }
            ]
        elif "FROM asset WHERE" in q:
            rows = [
                {
                    "asset": {
                        "resourceName": "a1",
                        "imageAsset": {"fullSize": {"url": "https://example.com/a.jpg"}},
                    }
                }
            ]
        elif "FROM asset_group_asset" in q:
            rows = [
                {
                    "campaign": {"id": "1"},
                    "assetGroup": {"id": "g1", "name": "Group"},
                    "asset": {"resourceName": "a1"},
                    "assetGroupAsset": {"fieldType": "MARKETING_IMAGE"},
                },
                {
                    "campaign": {"id": "2"},
                    "assetGroup": {"id": "g2", "name": "Other"},
                    "asset": {"resourceName": "a1"},
                    "assetGroupAsset": {"fieldType": "MARKETING_IMAGE"},
                },
            ]
        else:
            rows = []
        return SimpleNamespace(json=lambda: [{"results": rows}])

    monkeypatch.setattr(module, "request", request)
    r = module.fetch(settings(), date(2026, 9, 1), date(2026, 9, 30))
    c = r["campaigns"][0]
    assert (c["spend"], c["ctr"], c["cpc"], c["cpa"], c["conversion_rate"]) == (20, 10, 2, 10, 10)
    assert len(c["creatives"]) == 1 and c["creatives"][0]["image"] == "https://example.com/a.jpg"
    assert r["start"] == "2026-09-01"


def test_reject_other_account_before_network(monkeypatch):
    s = settings()
    s.google_ads_customer_id = "1234567890"
    monkeypatch.setattr(module, "google_token", lambda *a: pytest.fail("Unexpected network"))
    with pytest.raises(ValueError):
        module.fetch(s, date(2026, 9, 1), date(2026, 9, 30))
