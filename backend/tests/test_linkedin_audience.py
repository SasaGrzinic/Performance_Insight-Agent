from datetime import date, datetime, timezone
from types import SimpleNamespace

from app import linkedin_audience as audience
from app.models import ChannelState, Metric

ORG = "urn:li:organization:622072"
S = SimpleNamespace(linkedin_organization_id="622072")


def test_follower_api_units_idempotency_and_no_invented_history(db, monkeypatch):
    stamp = int(datetime(2026, 8, 3, tzinfo=timezone.utc).timestamp() * 1000)

    def request(method, url, **kw):
        if "networkSizes" in url:
            assert "edgeType=COMPANY_FOLLOWED_BY_MEMBER" in url
            data = {"firstDegreeSize": 4420}
        else:
            data = {
                "elements": [
                    {
                        "organizationalEntity": ORG,
                        "timeRange": {"start": stamp},
                        "followerGains": {"organicFollowerGain": 3, "paidFollowerGain": 0},
                    }
                ]
            }
        return SimpleNamespace(json=lambda: data)

    monkeypatch.setattr(audience, "request", request)
    monkeypatch.setattr(audience, "linkedin_headers", lambda s: {})
    monkeypatch.setattr(audience, "now", lambda: datetime(2026, 9, 16, tzinfo=timezone.utc))
    for _ in range(2):
        audience.sync_audience(db, date(2026, 8, 1), date(2026, 8, 31), S)
    result = audience.audience_response(db, "2026-09", S)
    august = next(m for m in result["months"] if m["month"] == "2026-08")
    assert august["followers_gained"] == 3
    assert august["total"] is None
    assert result["months"][-1]["total"] == 4420
    assert result["months"][-1]["followers_gained"] is None


def test_foreign_follower_response_does_not_replace_stored_metrics(db, monkeypatch):
    db.add(
        Metric(
            channel="linkedin_organic",
            key="followers_gained",
            date="2026-08-03",
            value=2,
            source_id=ORG + ":followers",
        )
    )
    db.commit()
    monkeypatch.setattr(audience, "linkedin_headers", lambda s: {})
    monkeypatch.setattr(
        audience,
        "request",
        lambda *a, **kw: SimpleNamespace(
            json=lambda: {
                "elements": [
                    {
                        "organizationalEntity": "urn:li:organization:99",
                        "timeRange": {"start": 1785715200000},
                        "followerGains": {},
                    }
                ]
            }
        ),
    )
    audience.sync_audience(db, date(2026, 8, 1), date(2026, 8, 31), S)
    assert db.get(ChannelState, "linkedin_audience").status == "error"
    from sqlalchemy import select

    assert db.scalar(select(Metric)).value == 2

