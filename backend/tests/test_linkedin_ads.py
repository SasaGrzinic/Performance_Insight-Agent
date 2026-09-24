from datetime import date
from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.connectors import ProviderError
from app.linkedin_ads import campaigns, fetch


def response(data):
    return SimpleNamespace(json=lambda: data)


def settings():
    return SimpleNamespace(linkedin_ad_account_id="514253005", linkedin_organization_id="622072")


def test_campaign_cursor_and_account_validation():
    s = settings()
    account = {"id": 514253005, "reference": "urn:li:organization:622072", "currency": "CHF"}
    with patch(
        "app.linkedin_ads.request",
        side_effect=[
            response(account),
            response(
                {
                    "elements": [{"id": 1, "account": "urn:li:sponsoredAccount:514253005"}],
                    "metadata": {"nextPageToken": "next"},
                }
            ),
            response({"elements": [{"id": 2, "account": "urn:li:sponsoredAccount:514253005"}]}),
        ],
    ) as req:
        actual, items = campaigns(s, {})
    assert actual == account and len(items) == 2
    assert "pageToken=next" in req.call_args.args[1]
    with (
        patch(
            "app.linkedin_ads.request",
            return_value=response({**account, "reference": "urn:li:organization:999"}),
        ),
        pytest.raises(ProviderError),
    ):
        campaigns(s, {})


def test_365_day_window_is_contiguous_and_bounded():
    with (
        patch("app.linkedin_ads.linkedin_headers", return_value={}),
        patch(
            "app.linkedin_ads.campaigns", return_value=({"id": 514253005, "currency": "CHF"}, {})
        ),
        patch("app.linkedin_ads.request", return_value=response({"elements": []})) as req,
    ):
        assert fetch(date(2025, 9, 25), date(2026, 9, 24), settings()) == []
    assert req.call_count == 12
    assert "start:(year:2025,month:9,day:25)" in req.call_args_list[0].args[1]
    assert "end:(year:2026,month:9,day:24)" in req.call_args.args[1]


@pytest.mark.parametrize("invalid", ["campaign", "period", "duplicate"])
def test_invalid_analytics_aborts_import(invalid):
    item = {
        "pivotValues": ["urn:li:sponsoredCampaign:1"],
        "dateRange": {"start": {"year": 2026, "month": 9, "day": 1}},
        "clicks": 1,
    }
    if invalid == "campaign":
        item["pivotValues"] = ["urn:li:sponsoredCampaign:999"]
    if invalid == "period":
        item["dateRange"]["start"]["month"] = 8
    elements = [item, item] if invalid == "duplicate" else [item]
    with (
        patch("app.linkedin_ads.linkedin_headers", return_value={}),
        patch(
            "app.linkedin_ads.campaigns",
            return_value=({"id": 514253005, "currency": "CHF"}, {"urn:li:sponsoredCampaign:1": {}}),
        ),
        patch("app.linkedin_ads.request", return_value=response({"elements": elements})),
        pytest.raises(ProviderError),
    ):
        fetch(date(2026, 9, 1), date(2026, 9, 2), settings())


def test_synchronization_always_refreshes_365_days_for_ads(db):
    from datetime import datetime, timedelta
    from zoneinfo import ZoneInfo

    from app.config import get_settings
    from app.jobs import synchronize

    today = datetime.now(ZoneInfo(get_settings().report_timezone)).date()
    with patch("app.jobs.sync_channel", return_value=True) as sync:
        synchronize(db, "2026-01", channel="linkedin")
    assert sync.call_args.args[1:] == ("linkedin", today - timedelta(days=364), today)


def test_campaign_summary_crosses_months_and_preserves_missing(db):
    from app.linkedin_ads import campaign_summary
    from app.models import LinkedInCampaign, Metric

    for id in ["1", "2"]:
        db.add(
            LinkedInCampaign(
                id="urn:li:sponsoredCampaign:" + id,
                account="urn:li:sponsoredAccount:514253005",
                data={"name": "Kampagne " + id, "currency": "CHF"},
            )
        )
    for day, value in [("2025-09-24", 999), ("2025-12-31", 10), ("2026-01-01", 20)]:
        db.add(
            Metric(
                channel="linkedin",
                date=day,
                key="clicks",
                value=value,
                source_id="urn:li:sponsoredCampaign:1",
            )
        )
    db.commit()
    s = settings()
    s.report_timezone = "Europe/Zurich"
    data = campaign_summary(db, s, date(2026, 9, 24))
    c = {c["name"]: c for c in data["campaigns"]}
    assert c["Kampagne 1"]["values"]["clicks"] == 30
    assert c["Kampagne 1"]["ctr"] is None
    assert c["Kampagne 2"]["values"] == {}
    assert data["start"] == "2025-09-25"


def test_ads_campaign_endpoint_requires_login(client):
    assert client.get("/api/linkedin/ads/campaigns").status_code == 401
