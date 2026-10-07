from datetime import date

import pytest

from app.connectors import ProviderError
from app.google_ads_conversions import DOWNLOAD_ID, PREFIX, breakdown


def fixture(total=7, duplicate=False):
    ids = [PREFIX + "6641695870", DOWNLOAD_ID, PREFIX + "123"]
    defs = [
        {"conversionAction": {"resourceName": key, "name": name, "type": kind}}
        for key, name, kind in zip(
            ids,
            ["Form", "Download", "Kontakt"],
            ["LEAD_FORM_SUBMIT", "GOOGLE_ANALYTICS_4_CUSTOM", "GOOGLE_ANALYTICS_4_CUSTOM"],
        )
    ]
    rows = [
        {
            "campaign": {"id": "1"},
            "segments": {"conversionAction": key},
            "metrics": {"conversions": value, "allConversions": value + 1},
        }
        for key, value in zip(ids, [5, 1.5, 0.5])
    ]
    if duplicate:
        rows.append(rows[0])
    return lambda q: defs if "FROM conversion_action" in q else rows, [
        {"id": "1", "conversions": total}
    ]


def test_split_reconciles_and_does_not_treat_contact_or_all_conversions_as_leads():
    query, campaigns = fixture()
    rows = breakdown(query, campaigns, date(2026, 9, 1), date(2026, 9, 30))["1"]
    assert [r["group"] for r in rows] == ["forms", "downloads", "other"]
    assert sum(r["conversions"] for r in rows) == 7
    assert sum(r["all_conversions"] for r in rows) == 10


@pytest.mark.parametrize("total,duplicate", [(8, False), (7, True)])
def test_rejects_mismatch_and_duplicates(total, duplicate):
    query, campaigns = fixture(total, duplicate)
    with pytest.raises(ProviderError):
        breakdown(query, campaigns, date(2026, 9, 1), date(2026, 9, 30))


def test_missing_rows_cannot_explain_positive_total():
    with pytest.raises(ProviderError):
        breakdown(
            lambda q: [], [{"id": "1", "conversions": 3}], date(2026, 9, 1), date(2026, 9, 30)
        )
