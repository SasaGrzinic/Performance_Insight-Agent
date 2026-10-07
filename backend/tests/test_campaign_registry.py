from urllib.parse import parse_qs, urlparse

from sqlalchemy import select

from app.models import MarketingCampaign

H = {"X-Sonio-Request": "1"}

CAMPAIGN = {
    "name": "  Herbstkampagne Romandie  ",
    "objective": "website_visits",
    "start_date": "2026-09-15",
    "end_date": "2026-11-30",
    "owner": "  Marketing Team  ",
}


def test_campaign_registry_requires_login(client):
    assert client.get("/api/campaign-registry").status_code == 401


def test_admin_can_create_list_and_update_campaign(logged_in, db):
    created = logged_in.post("/api/campaign-registry", headers=H, json=CAMPAIGN)
    assert created.status_code == 201
    assert created.json()["name"] == "Herbstkampagne Romandie"
    assert created.json()["owner"] == "Marketing Team"

    listed = logged_in.get("/api/campaign-registry")
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()] == [created.json()["id"]]

    updated_body = {
        **CAMPAIGN,
        "name": "Herbstkampagne Westschweiz",
        "objective": "awareness",
    }
    updated = logged_in.put(
        f"/api/campaign-registry/{created.json()['id']}", headers=H, json=updated_body
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Herbstkampagne Westschweiz"
    assert updated.json()["objective"] == "awareness"
    stored = db.scalar(select(MarketingCampaign))
    assert stored.name == "Herbstkampagne Westschweiz"


def test_campaign_registry_validates_dates_and_controlled_objective(logged_in, db):
    invalid_range = {
        **CAMPAIGN,
        "start_date": "2026-11-30",
        "end_date": "2026-09-15",
    }
    response = logged_in.post("/api/campaign-registry", headers=H, json=invalid_range)
    assert response.status_code == 422
    assert "Enddatum" in response.json()["detail"]

    invalid_objective = {**CAMPAIGN, "objective": "guaranteed_revenue"}
    response = logged_in.post("/api/campaign-registry", headers=H, json=invalid_objective)
    assert response.status_code == 422
    assert "Kampagnenziel" in response.json()["detail"]
    assert db.scalar(select(MarketingCampaign)) is None


def test_viewer_can_read_but_not_change_campaigns(logged_in):
    created = logged_in.post("/api/campaign-registry", headers=H, json=CAMPAIGN)
    assert created.status_code == 201

    invite = logged_in.post(
        "/api/admin/invites", headers=H, json={"email": "campaign-viewer@example.test"}
    )
    token = parse_qs(urlparse(invite.json()["url"]).fragment)["token"][0]
    accepted = logged_in.post(
        "/api/auth/invite/accept",
        headers=H,
        json={
            "token": token,
            "username": "campaign-viewer",
            "password": "test-only-strong-password",
        },
    )
    assert accepted.status_code == 200
    assert logged_in.post("/api/auth/logout", headers=H).status_code == 200
    assert (
        logged_in.post(
            "/api/auth/login",
            headers=H,
            json={
                "username": "campaign-viewer",
                "password": "test-only-strong-password",
            },
        ).status_code
        == 200
    )

    assert logged_in.get("/api/campaign-registry").status_code == 200
    assert logged_in.post("/api/campaign-registry", headers=H, json=CAMPAIGN).status_code == 403
    assert (
        logged_in.put(
            f"/api/campaign-registry/{created.json()['id']}", headers=H, json=CAMPAIGN
        ).status_code
        == 403
    )
