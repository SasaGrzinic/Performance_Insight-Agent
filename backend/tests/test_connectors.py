from datetime import date, datetime, timezone
from types import SimpleNamespace
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

import httpx
import pytest

from app.connectors import (
    ProviderError,
    analytics,
    google_ads,
    linkedin,
    linkedin_organic,
    mailchimp,
    youtube,
)
from app.jobs import refresh_analysis
from app.models import Metric

START = date(2026, 8, 1)
END = date(2026, 8, 31)


def response(data):
    return SimpleNamespace(json=lambda: data)


def test_google_ads_preserves_fractional_conversions_and_currency():
    settings = SimpleNamespace(
        google_ads_customer_id="123-456",
        google_ads_developer_token="test",
        google_ads_login_customer_id="",
        google_ads_api_version="v25",
        google_ads_currency="CHF",
    )
    payload = [
        {
            "results": [
                {
                    "segments": {"date": "2026-08-01"},
                    "metrics": {
                        "conversions": 0.4,
                        "costMicros": "12340000",
                        "impressions": "100",
                        "clicks": "2",
                    },
                    "customer": {"currencyCode": "EUR"},
                }
            ]
        }
    ]
    with (
        patch("app.connectors.google_token", return_value="test"),
        patch("app.connectors.request", return_value=response(payload)) as req,
    ):
        rows = google_ads(START, END, settings)
    assert next(r for r in rows if r["key"] == "conversions")["value"] == 0.4
    spend = next(r for r in rows if r["key"] == "spend")
    assert spend["value"] == 12.34
    assert spend["unit"] == "EUR"
    assert "/v25/customers/123456/" in req.call_args.args[1]


def test_ga4_maps_daily_additive_metrics():
    settings = SimpleNamespace(ga4_property_id="12345")
    payload = {
        "rowCount": 1,
        "rows": [
            {
                "dimensionValues": [{"value": "20260801"}],
                "metricValues": [{"value": "20"}, {"value": "10"}, {"value": "3"}],
            }
        ],
    }
    with (
        patch("app.connectors.google_token", return_value="test"),
        patch("app.connectors.request", return_value=response(payload)),
    ):
        rows = analytics(START, END, settings)
    assert {r["key"]: r["value"] for r in rows} == {
        "sessions": 20,
        "engaged_sessions": 10,
        "key_events": 3,
    }
    assert all(r["date"] == "2026-08-01" for r in rows)


def test_mailchimp_reads_every_page():
    settings = SimpleNamespace(mailchimp_api_key="test", mailchimp_server="us21")

    def report(i):
        return {
            "id": str(i),
            "send_time": "2026-08-01T10:00:00+00:00",
            "emails_sent": 100,
            "opens": {"unique_opens": 30},
            "clicks": {"unique_subscriber_clicks": 5},
        }

    responses = [
        response({"total_items": 2, "reports": [report(1)]}),
        response({"total_items": 2, "reports": [report(2)]}),
    ]
    with patch("app.connectors.request", side_effect=responses) as req:
        rows = mailchimp(START, END, settings)
    assert len(rows) == 6
    assert req.call_count == 2
    assert req.call_args.kwargs["params"]["offset"] == 1
    assert {r["source_id"] for r in rows} == {"1", "2"}


def test_youtube_daily_metric_order():
    settings = SimpleNamespace(youtube_channel_id="UCtest")
    with (
        patch("app.connectors.google_token", return_value="test"),
        patch(
            "app.connectors.request", return_value=response({"rows": [["2026-08-01", 100, 250, 3]]})
        ),
    ):
        rows = youtube(START, END, settings)
    assert {r["key"]: r["value"] for r in rows} == {
        "views": 100,
        "watch_minutes": 250,
        "subscribers_gained": 3,
    }


def linkedin_settings(organization_id="12345"):
    return SimpleNamespace(
        linkedin_organization_id=organization_id,
        linkedin_access_token="test-only-token",
        linkedin_refresh_token="",
        linkedin_api_version="202608",
    )


def linkedin_statistics(organization="urn:li:organization:12345", day="2026-08-01"):
    return {
        "elements": [
            {
                "organizationalEntity": organization,
                "timeRange": {
                    "start": int(
                        datetime.fromisoformat(day).replace(tzinfo=timezone.utc).timestamp() * 1000
                    ),
                },
                "totalShareStatistics": {
                    "impressionCount": 100,
                    "clickCount": 4,
                    "likeCount": -1,
                    "commentCount": 0,
                    "shareCount": 2,
                },
            }
        ],
    }


def test_linkedin_uses_company_statistics_and_preserves_provenance():
    with patch("app.connectors.request", return_value=response(linkedin_statistics())) as req:
        rows = linkedin_organic(START, END, linkedin_settings())
    assert req.call_args.args[0] == "GET"
    url = req.call_args.args[1]
    assert urlsplit(url).path == "/rest/organizationalEntityShareStatistics"
    wire_query = httpx.Request("GET", url).url.query.decode()
    assert "timeIntervals=(timeRange:(start:" in wire_query
    assert "%28" not in wire_query and "%2528" not in wire_query
    assert "organizationalEntity=urn%3Ali%3Aorganization%3A12345" in wire_query
    params = parse_qs(urlsplit(url).query)
    assert params["organizationalEntity"] == ["urn:li:organization:12345"]
    exclusive_end = int(datetime(2026, 9, 1, tzinfo=timezone.utc).timestamp() * 1000)
    assert f"end:{exclusive_end}" in params["timeIntervals"][0]
    assert all(r["source_id"] == "urn:li:organization:12345" for r in rows)
    # LinkedIn documents negative organic likes after a sponsored like is withdrawn.
    assert {r["key"]: r["value"] for r in rows} == {
        "impressions": 100,
        "clicks": 4,
        "likes": -1,
        "comments": 0,
        "shares": 2,
    }


def test_linkedin_ads_preserves_restli_structure_and_fractional_conversions():
    settings = linkedin_settings()
    settings.linkedin_ad_account_id = "67890"
    settings.linkedin_ads_access_token = "test-ads-only-token"
    settings.linkedin_currency = "CHF"
    payload = {
        "elements": [
            {
                "dateRange": {"start": {"year": 2026, "month": 8, "day": 1}},
                "externalWebsiteConversions": 0.5,
                "pivotValues": ["urn:li:sponsoredCampaign:123"],
            }
        ]
    }
    with patch(
        "app.linkedin_ads.request",
        side_effect=[
            response({"id": 67890, "reference": "urn:li:organization:12345", "currency": "CHF"}),
            response({"elements": [{"id": 123, "account": "urn:li:sponsoredAccount:67890"}]}),
            response(payload),
        ],
    ) as req:
        rows = linkedin(START, END, settings)
    wire_query = httpx.Request("GET", req.call_args.args[1]).url.query.decode()
    assert "dateRange=(start:(year:2026,month:8,day:1)" in wire_query
    assert "accounts=List(urn%3Ali%3AsponsoredAccount%3A67890)" in wire_query
    assert "fields=dateRange,pivotValues,impressions,clicks" in wire_query
    assert rows[0]["source_id"] == "urn:li:sponsoredCampaign:123"
    assert rows[0]["value"] == 0.5
    assert req.call_args.kwargs["headers"]["Authorization"] == "Bearer test-ads-only-token"


def test_linkedin_ads_never_uses_organic_token():
    from app.connectors import NotConfigured

    settings = linkedin_settings()
    settings.linkedin_ad_account_id = "67890"
    with patch("app.connectors.request") as req, pytest.raises(NotConfigured):
        linkedin(START, END, settings)
    req.assert_not_called()


def test_linkedin_ads_refresh_uses_only_ads_app_credentials():
    from app.connectors import linkedin_headers

    settings = linkedin_settings()
    settings.linkedin_ads_refresh_token = "ads-refresh"
    settings.linkedin_ads_client_id = "ads-client"
    settings.linkedin_ads_client_secret = "ads-secret"
    settings.linkedin_refresh_token = "organic-refresh"
    with patch(
        "app.connectors.request", return_value=response({"access_token": "ads-access"})
    ) as req:
        headers = linkedin_headers(settings, ads=True)
    assert headers["Authorization"] == "Bearer ads-access"
    assert req.call_args.kwargs["data"] == {
        "grant_type": "refresh_token",
        "refresh_token": "ads-refresh",
        "client_id": "ads-client",
        "client_secret": "ads-secret",
    }
    assert settings.linkedin_access_token == "test-only-token"
    assert settings.linkedin_refresh_token == "organic-refresh"


@pytest.mark.parametrize(
    "organization_id", ["urn:li:person:12345", "https://www.linkedin.com/in/example/", "12-345"]
)
def test_linkedin_rejects_non_company_identifiers_before_network(organization_id):
    with patch("app.connectors.request") as req, pytest.raises(ProviderError):
        linkedin_organic(START, END, linkedin_settings(organization_id))
    req.assert_not_called()


@pytest.mark.parametrize("organization", ["urn:li:organization:99999", "urn:li:person:12345", None])
def test_linkedin_rejects_mismatched_response_organization(organization):
    with (
        patch("app.connectors.request", return_value=response(linkedin_statistics(organization))),
        pytest.raises(ProviderError, match="Organisation"),
    ):
        linkedin_organic(START, END, linkedin_settings())


def test_linkedin_rejects_data_outside_requested_period():
    with (
        patch(
            "app.connectors.request", return_value=response(linkedin_statistics(day="2026-09-01"))
        ),
        pytest.raises(ProviderError, match="Zeitraum"),
    ):
        linkedin_organic(START, END, linkedin_settings())


def test_analysis_reused_only_for_unchanged_values(db):
    db.add(Metric(channel="analytics", date="2026-08-01", key="sessions", value=25))
    db.commit()
    with patch(
        "app.jobs.analyze",
        return_value={"status": "ready", "summary": "test", "recommendations": []},
    ) as call:
        refresh_analysis(db, "2026-08")
        refresh_analysis(db, "2026-08")
        assert call.call_count == 1
        db.add(Metric(channel="analytics", date="2026-08-02", key="sessions", value=10))
        db.commit()
        refresh_analysis(db, "2026-08")
        assert call.call_count == 2
