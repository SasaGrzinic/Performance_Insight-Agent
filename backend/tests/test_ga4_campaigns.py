from datetime import date
from types import SimpleNamespace
from unittest.mock import patch

from app.ga4_campaigns import CAMPAIGNS, fetch, page_filter


def test_exact_clean_paths():
    paths = [p for _, p in CAMPAIGNS]
    assert len(paths) == len(set(paths)) == 19
    assert sum(t.startswith("Visitenpage") for t, _ in CAMPAIGNS) == 5
    assert all("?" not in p for p in paths)
    assert page_filter("/network")["andGroup"]["expressions"][1]["filter"]["inListFilter"][
        "values"
    ] == ["/network", "/network/"]


def test_groups_and_partial_comparison():
    class Response:
        def json(self):
            return {"reports": [{"rows": []} for _ in range(5)]}

    def request(*args, **kwargs):
        reports = kwargs["json"]["requests"]
        assert reports[1]["dateRanges"][0] == {"startDate": "2026-08-01", "endDate": "2026-08-25"}
        return Response()

    with (
        patch("app.ga4_campaigns.google_token", return_value="test"),
        patch("app.ga4_campaigns.request", side_effect=request),
    ):
        r = fetch(
            SimpleNamespace(ga4_property_id="123", ga4_refresh_token="test"),
            "2026-09",
            date(2026, 9, 25),
        )
    assert len([c for c in r["campaigns"] if c["kind"] == "profile"]) == 5
    assert all(c["current"] is None for c in r["campaigns"])
