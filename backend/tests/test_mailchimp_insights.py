from datetime import date
from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.connectors import ProviderError
from app.mailchimp_insights import campaign_tags, fetch, safe_link, website


def test_tracking_requires_exact_campaign_id_email_and_sonio_host():
    def link(tag="intro-abc123", medium="email", host="www.sonio.com"):
        return {"url": f"https://{host}/page?utm_campaign={tag}&utm_medium={medium}"}

    assert campaign_tags([link()], "abc123") == ["intro-abc123"]
    assert (
        campaign_tags(
            [link(tag="intro-abc1234"), link(medium="social"), link(host="sonio.com.evil.test")],
            "abc123",
        )
        == []
    )
    assert website(None, [], "2026-01-01", date(2026, 9, 30))["sessions"] is None


def test_public_links_strip_recipient_and_tracking_queries():
    assert (
        safe_link("https://sonio.com/a?mc_eid=private&utm_source=x#token") == "https://sonio.com/a"
    )
    assert safe_link("javascript:alert(1)") is None
    assert safe_link("https://private:secret@sonio.com/a") is None


def test_links_paginate_sort_and_keep_ga_missing():
    replies = [
        {
            "total_items": 2,
            "urls_clicked": [{"id": "1", "url": "https://sonio.com/a", "unique_clicks": 4}],
        },
        {
            "total_items": 2,
            "urls_clicked": [{"id": "2", "url": "https://sonio.com/b", "unique_clicks": 8}],
        },
    ]
    with patch(
        "app.mailchimp_insights.request",
        side_effect=[SimpleNamespace(json=lambda d=d: d) for d in replies],
    ) as mock:
        result = fetch(
            SimpleNamespace(mailchimp_api_key="test", mailchimp_server="us12"),
            {"id": "abc123", "send_time": "2026-09-01"},
            date(2026, 9, 30),
        )
    assert mock.call_args_list[1].kwargs["params"]["offset"] == 1
    assert result["links"][0]["unique_clicks"] == 8
    assert result["website"]["sessions"] is None


def test_incomplete_link_report_fails():
    with (
        patch(
            "app.mailchimp_insights.request",
            return_value=SimpleNamespace(json=lambda: {"total_items": 1, "urls_clicked": []}),
        ),
        pytest.raises(ProviderError),
    ):
        fetch(
            SimpleNamespace(mailchimp_api_key="test", mailchimp_server="us12"),
            {"id": "abc123", "send_time": "2026-09-01"},
            date(2026, 9, 30),
        )


def test_website_uses_exact_aggregate_filter_and_keeps_missing():
    s = SimpleNamespace(ga4_property_id="358384645", ga4_refresh_token="test")
    with (
        patch("app.mailchimp_insights.google_token", return_value="test"),
        patch(
            "app.mailchimp_insights.request",
            return_value=SimpleNamespace(json=lambda: {"rows": []}),
        ) as mock,
    ):
        result = website(s, ["intro-abc123"], "2026-09-01", date(2026, 9, 30))
    assert result["status"] == "no_rows" and result["sessions"] is None
    payload = mock.call_args.kwargs["json"]
    assert "dimensions" not in payload
    assert (
        payload["dimensionFilter"]["andGroup"]["expressions"][0]["filter"]["fieldName"]
        == "sessionManualCampaignName"
    )
