from datetime import date
from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.connectors import ProviderError
from app.mailchimp_campaigns import fetch_year, grouping


def item(title, subject="", id="a"):
    return {"title": title, "subject": subject, "id": id}


def test_series_preserve_stages_and_language_variants():
    assert grouping(item("2026_Private Cloud mit VCF 9.0 Mailing 1"))[:2] == (
        "Private Cloud mit VCF 9.0",
        "Initialmailing",
    )
    assert grouping(item("2026_Private Cloud mit VCF 9.0 Mailing 2"))[:2] == (
        "Private Cloud mit VCF 9.0",
        "Mailing 2",
    )
    assert (
        grouping(item("Sonio NL janvier 2026 (FR)"))[0]
        == grouping(item("Sonio NL Januar 2026 (DE)"))[0]
    )
    assert grouping(item("Resend: Swiss IT Forum / Einladung Teil 1"))[1] == "Erneuter Versand"
    assert grouping(
        item("Vlora TEST", "Noch 2 Tage: BBQ im Zoo Zürich – Ihr Platz ist reserviert")
    ) == ("Zoo Zürich 2026", "Reminder", True)
    assert grouping(item("Danke für den schönen Abend im Zoo Zürich"))[:2] == (
        "Zoo Zürich 2026",
        "Dankesmailing",
    )


def test_unknown_subjects_not_guessed_into_event():
    assert grouping(item("", "Une soirée exceptionnelle, grâce à vous"))[0] != "Fly7"
    assert grouping(item("", "", "one"))[0] != grouping(item("", "", "two"))[0]


def test_import_preserves_missing_and_campaign_identity():
    campaigns = [
        {
            "id": "a",
            "send_time": "2026-02-01T12:00:00+00:00",
            "settings": {"title": "Same"},
            "emails_sent": 20,
        },
        {
            "id": "b",
            "send_time": "2026-02-01T12:00:00+00:00",
            "settings": {"title": "Same"},
            "emails_sent": 5,
        },
    ]
    responses = [
        {"campaigns": campaigns, "total_items": 2},
        {
            "reports": [
                {
                    "id": "a",
                    "emails_sent": 20,
                    "opens": {"unique_opens": 0},
                    "clicks": {"unique_subscriber_clicks": 0},
                }
            ],
            "total_items": 1,
        },
    ]
    with patch(
        "app.mailchimp_campaigns.request",
        side_effect=[SimpleNamespace(json=lambda d=d: d) for d in responses],
    ):
        records, items = fetch_year(
            SimpleNamespace(mailchimp_api_key="test", mailchimp_server="us12"), date(2026, 9, 25)
        )
    assert len(items) == 2 and len(records) == 4
    assert items[0]["values"]["unique_opens"] == 0
    assert items[1]["values"]["unique_opens"] is None


def test_incomplete_pagination_aborts():
    with (
        patch(
            "app.mailchimp_campaigns.request",
            return_value=SimpleNamespace(json=lambda: {"campaigns": [], "total_items": 1}),
        ),
        pytest.raises(ProviderError),
    ):
        fetch_year(
            SimpleNamespace(mailchimp_api_key="test", mailchimp_server="us12"), date(2026, 9, 25)
        )


def test_testmailings_excluded_from_metrics_and_listing():
    campaigns = [
        {
            "id": "a",
            "send_time": "2026-02-01T12:00:00+00:00",
            "settings": {"title": "Event_TEST"},
            "emails_sent": 2,
        }
    ]
    responses = [{"campaigns": campaigns, "total_items": 1}, {"reports": [], "total_items": 0}]
    with patch(
        "app.mailchimp_campaigns.request",
        side_effect=[SimpleNamespace(json=lambda d=d: d) for d in responses],
    ):
        records, items = fetch_year(
            SimpleNamespace(mailchimp_api_key="test", mailchimp_server="us12"), date(2026, 9, 25)
        )
    assert records == [] and items == []


def test_confirmed_fly7_series_preserves_individual_stages():
    expected = {
        "f274f58c34": "Initialmailing",
        "731003dd77": "Reminder 1",
        "3a453ecd84": "Reminder 2",
        "091162157e": "Reminder · Eventinformationen",
        "dc88a07aa8": "Dankesmailing",
    }
    for campaign_id, stage in expected.items():
        assert grouping(item("", "", campaign_id)) == ("Fly7 Event 2026", stage, False)


def test_lead_image_ignores_logo_tracking_and_external_hosts():
    from app.mailchimp_campaigns import mailing_image

    html = '<img src="https://mcusercontent.com/logo.png" width="600" alt="Logo"><img src="https://mcusercontent.com/pixel.png" width="1"><img src="https://evil.invalid/photo.jpg" width="600"><img src="https://mcusercontent.com/hero.jpg" width="612"><img src="https://mcusercontent.com/later.jpg" width="600">'
    assert mailing_image(html) == "https://mcusercontent.com/hero.jpg"
    assert mailing_image('<img src="javascript:alert(1)" width="600">') is None


def test_image_timeout_does_not_block_metrics():
    import httpx

    from app.mailchimp_campaigns import enrich_mailing_images

    items = [{"id": "a", "values": {"emails_sent": 20}}]
    with patch("app.mailchimp_campaigns.request", side_effect=httpx.ConnectTimeout("timeout")):
        enrich_mailing_images(
            items, {}, SimpleNamespace(mailchimp_server="us12", mailchimp_api_key="test")
        )
    assert items[0]["image_url"] is None
    assert items[0]["values"]["emails_sent"] == 20


def test_report_rates_keep_missing_separate_from_zero():
    from app.mailchimp_campaigns import report_rates
    assert report_rates({}, 100)["delivery_rate"] is None
    r = report_rates({"bounces": {"hard_bounces": 5, "soft_bounces": 5}, "unsubscribed": 9, "clicks": {"click_rate": 0.2}, "opens": {"open_rate": 0}}, 100)
    assert r["delivery_rate"] == 90
    assert r["unsubscribe_rate"] == 10
    assert r["click_rate"] == 20
    assert r["open_rate"] == 0
    assert report_rates({"bounces": {"hard_bounces": 0, "soft_bounces": 0}}, 0)["delivery_rate"] is None
