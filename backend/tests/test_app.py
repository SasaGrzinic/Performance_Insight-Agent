import io
import os
from datetime import date, datetime, timedelta, timezone
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

import pytest
from docx import Document
from sqlalchemy import func, select

from app.analytics import build_dashboard, delta, previous_month
from app.connectors import ProviderError, parse_docx
from app.jobs import enqueue, generate_report, schedule_tick, sync_channel, worker_once
from app.models import Invite, Job, Metric, Report, now

H = {"X-Sonio-Request": "1"}


def word(rows, headers=("E-Mail", "Anmeldedatum")):
    doc = Document()
    table = doc.add_table(rows=1, cols=2)
    for cell, value in zip(table.rows[0].cells, headers):
        cell.text = value
    for values in rows:
        for cell, value in zip(table.add_row().cells, values):
            cell.text = value
    stream = io.BytesIO()
    doc.save(stream)
    return stream.getvalue()


def test_private_data_requires_login(client):
    for path in ["/dashboard", "/reports", "/analysis", "/admin/users", "/settings"]:
        assert client.get("/api" + path).status_code == 401


def test_demo_is_explicit_and_never_real(client):
    r = client.get("/api/demo/dashboard?month=2026-08")
    assert r.status_code == 200
    assert r.json()["demo"] is True
    assert all(c["status"] == "demo" for c in r.json()["channels"])
    assert client.get("/api/demo/dashboard?month=bad").status_code == 422


def test_csrf_and_session(logged_in):
    assert logged_in.get("/api/auth/me").json()["role"] == "master_admin"
    assert logged_in.post("/api/sync", json={"month": "2026-08"}).status_code == 403
    assert (
        logged_in.post(
            "/api/sync", headers={**H, "Origin": "https://attacker.test"}, json={"month": "2026-08"}
        ).status_code
        == 403
    )
    assert logged_in.post("/api/auth/logout", headers=H).status_code == 200
    assert logged_in.get("/api/auth/me").status_code == 401


def test_cookie_is_httponly(client):
    r = client.post(
        "/api/auth/login",
        headers=H,
        json={"username": "admin", "password": os.environ["ADMIN_PASSWORD"]},
    )
    assert "HttpOnly" in r.headers["set-cookie"]
    assert "SameSite=strict" in r.headers["set-cookie"]


def test_invite_single_use_viewer_permissions(logged_in):
    r = logged_in.post("/api/admin/invites", headers=H, json={"email": "guest@example.test"})
    assert r.status_code == 200
    token = parse_qs(urlparse(r.json()["url"]).fragment)["token"][0]
    body = {"token": token, "username": "guest", "password": "test-only-strong-password"}
    assert logged_in.post("/api/auth/invite/accept", headers=H, json=body).status_code == 200
    assert logged_in.post("/api/auth/invite/accept", headers=H, json=body).status_code == 400
    logged_in.post("/api/auth/logout", headers=H)
    assert (
        logged_in.post(
            "/api/auth/login", headers=H, json={"username": "guest", "password": body["password"]}
        ).status_code
        == 200
    )
    assert logged_in.get("/api/dashboard").status_code == 200
    for path, payload in [
        ("/admin/invites", {"email": "other@example.test"}),
        ("/sync", {"month": "2026-08"}),
        ("/reports", {"month": "2026-08"}),
    ]:
        assert logged_in.post("/api" + path, headers=H, json=payload).status_code == 403


def test_expired_invite_rejected(logged_in, db):
    r = logged_in.post("/api/admin/invites", headers=H, json={"email": "expired@example.test"})
    token = parse_qs(urlparse(r.json()["url"]).fragment)["token"][0]
    invite = db.scalar(select(Invite))
    invite.expires_at = now() - timedelta(days=1)
    db.commit()
    assert (
        logged_in.post(
            "/api/auth/invite/accept",
            headers=H,
            json={"token": token, "username": "expired", "password": "test-strong-password"},
        ).status_code
        == 400
    )


def test_master_admin_cannot_be_deactivated(logged_in):
    user = logged_in.get("/api/auth/me").json()
    assert (
        logged_in.patch(
            "/api/admin/users/" + user["id"], headers=H, json={"active": False}
        ).status_code
        == 400
    )


def test_login_throttled(client):
    for _ in range(10):
        assert (
            client.post(
                "/api/auth/login", headers=H, json={"username": "bad", "password": "bad"}
            ).status_code
            == 401
        )
    assert (
        client.post(
            "/api/auth/login", headers=H, json={"username": "bad", "password": "bad"}
        ).status_code
        == 429
    )


def test_docx_deduplicates_and_discards_personal_data():
    result = parse_docx(
        word(
            [
                ("a@example.test", "01.08.2026"),
                ("A@example.test", "02.08.2026"),
                ("b@example.test", "2026-08-02"),
            ]
        )
    )
    assert result == {"2026-08-01": 1, "2026-08-02": 1}
    assert "@" not in str(result)


def test_docx_invalid_row_rejects_whole_file():
    with pytest.raises(ValueError):
        parse_docx(word([("valid@example.test", "01.08.2026"), ("bad", "01.08.2026")]))
    with pytest.raises(ValueError):
        parse_docx(word([("a@example.test", "2026-08-32")]))
    with pytest.raises(ValueError):
        parse_docx(word([], headers=("Name", "Datum")))
    with pytest.raises(ValueError):
        parse_docx(b"X" * (10 * 1024 * 1024 + 1))


def test_repeat_event_import_replaces_source(logged_in, db):
    content = word([("a@example.test", "01.08.2026")])
    for _ in range(2):
        r = logged_in.post(
            "/api/import/events",
            headers=H,
            data={"event_id": "test-event"},
            files={"file": ("list.docx", content)},
        )
        assert r.status_code == 200
    assert db.scalar(select(func.sum(Metric.value))) == 1
    assert db.scalar(select(func.count()).select_from(Metric)) == 1


def test_qr_rejects_nan_and_preserves_previous(logged_in, db):
    assert (
        logged_in.post(
            "/api/import/qr",
            headers=H,
            data={"source_id": "test"},
            files={"file": ("data.csv", b"date,scans\n2026-08-01,3\n")},
        ).status_code
        == 200
    )
    assert (
        logged_in.post(
            "/api/import/qr",
            headers=H,
            data={"source_id": "test"},
            files={"file": ("data.csv", b"date,scans\n2026-08-01,nan\n")},
        ).status_code
        == 422
    )
    assert db.scalar(select(func.sum(Metric.value))) == 3


def test_failed_sync_preserves_last_good_values(db):
    db.add(Metric(channel="analytics", date="2026-08-01", key="sessions", value=42))
    db.commit()
    with patch("app.jobs.fetch_channel", side_effect=ProviderError("API unavailable")):
        assert sync_channel(db, "analytics", date(2026, 8, 1), date(2026, 8, 31)) is False
    assert db.scalar(select(func.sum(Metric.value))) == 42


def test_sync_idempotent_and_replaces_correct_range(db):
    db.add(Metric(channel="analytics", date="2026-07-01", key="sessions", value=100))
    db.commit()
    records = [
        {
            "channel": "analytics",
            "date": "2026-08-01",
            "key": "sessions",
            "value": 42,
            "source_id": "account",
            "unit": "count",
        }
    ]
    with patch("app.jobs.fetch_channel", return_value=records):
        for _ in range(2):
            assert sync_channel(db, "analytics", date(2026, 8, 1), date(2026, 8, 31))
    assert db.scalar(select(func.count()).select_from(Metric)) == 2


def test_partial_comparison_and_unknown_not_zero(db):
    db.add_all(
        [
            Metric(channel="analytics", date="2026-08-01", key="sessions", value=10),
            Metric(channel="analytics", date="2026-08-20", key="sessions", value=900),
            Metric(channel="analytics", date="2026-09-01", key="sessions", value=20),
        ]
    )
    db.commit()
    d = build_dashboard(db, "2026-09", today=date(2026, 9, 14))
    assert d["comparison_end"] == "2026-08-14"
    assert d["kpis"][1]["previous"] == 10
    assert d["kpis"][1]["change"] == 100
    assert d["kpis"][0]["value"] is None
    assert previous_month("2026-01") == "2025-12"
    assert delta(3, 0) is None


def test_schedule_third_zurich_and_catchup_once(db):
    # 08:00 Zurich = 07:00 UTC in January.
    schedule_tick(db, datetime(2026, 1, 3, 6, 59, tzinfo=timezone.utc))
    assert db.scalar(select(func.count()).select_from(Job).where(Job.kind == "report")) == 0
    schedule_tick(db, datetime(2026, 1, 3, 7, 0, tzinfo=timezone.utc))
    schedule_tick(db, datetime(2026, 1, 3, 7, 0, tzinfo=timezone.utc))
    assert db.scalar(select(func.count()).select_from(Job).where(Job.kind == "report")) == 1
    schedule_tick(db, datetime(2026, 3, 5, 9, 0, tzinfo=timezone.utc))
    assert db.scalar(select(func.count()).select_from(Job).where(Job.kind == "report")) == 3


def test_summer_schedule_uses_dst(db):
    schedule_tick(db, datetime(2026, 7, 3, 5, 59, tzinfo=timezone.utc))
    assert not db.scalar(select(Job).where(Job.dedupe_key == "monthly-report:2026-06"))
    schedule_tick(db, datetime(2026, 7, 3, 6, 0, tzinfo=timezone.utc))
    assert db.scalar(select(Job).where(Job.dedupe_key == "monthly-report:2026-06"))


def test_jobs_dedupe_and_worker_completion(db):
    one = enqueue(db, "sync", {"month": "2026-08"}, "same")
    two = enqueue(db, "sync", {"month": "2026-08"}, "same")
    assert one.id == two.id
    with patch("app.jobs.run_job") as mocked:
        assert worker_once()
        assert mocked.call_count == 1
    db.expire_all()
    assert db.get(Job, one.id).status == "completed"
    assert not worker_once()


def test_report_unique_month_and_no_fake_ai(db):
    one = generate_report(db, "2026-08")
    two = generate_report(db, "2026-08")
    assert one.id == two.id
    assert one.analysis["status"] == "no_data"
    assert db.scalar(select(func.count()).select_from(Report)) == 1


def test_kpi_whitelist_and_duplicate_rejected(logged_in):
    bad = {"items": [{"channel": "analytics", "key": "invented", "label": "Fake"}]}
    assert logged_in.put("/api/settings/kpis", headers=H, json=bad).status_code == 422
    item = {"channel": "analytics", "key": "sessions", "label": "Besuche", "target": 100}
    assert (
        logged_in.put("/api/settings/kpis", headers=H, json={"items": [item, item]}).status_code
        == 422
    )
    assert logged_in.put("/api/settings/kpis", headers=H, json={"items": [item]}).status_code == 200
    d = logged_in.get("/api/dashboard?month=2026-08").json()
    assert d["kpis"][0]["label"] == "Besuche"
    assert d["definitions_confirmed"]


def test_unsent_report_refreshes_after_data_arrives(db):
    report = generate_report(db, "2026-08")
    assert report.analysis["status"] == "no_data"
    db.add(Metric(channel="analytics", date="2026-08-01", key="sessions", value=45))
    db.commit()
    report2 = generate_report(db, "2026-08")
    assert report2.id == report.id
    assert report2.snapshot["kpis"][1]["value"] == 45


def test_ai_receives_only_aggregates_and_validates_evidence(db):
    import json
    from types import SimpleNamespace

    from app.ai import analyze

    db.add(Metric(channel="analytics", date="2026-08-01", key="sessions", value=25))
    db.commit()
    snapshot = build_dashboard(db, "2026-08", today=date(2026, 9, 14))

    def reply(*args, **kwargs):
        sent = json.loads(kwargs["json"]["messages"][1]["content"])
        assert "message" not in sent["channels"][0]
        content = {
            "summary": "Testauswertung",
            "recommendations": [
                {
                    "title": "Daten prüfen",
                    "channel": "analytics",
                    "priority": "medium",
                    "observation": "25 Sitzungen",
                    "action": "Tracking prüfen",
                    "caveat": "Kein Vergleich",
                    "evidence": ["analytics.sessions"],
                }
            ],
        }
        return SimpleNamespace(
            json=lambda: {"choices": [{"message": {"content": json.dumps(content)}}]}
        )

    with (
        patch(
            "app.ai.get_settings",
            return_value=SimpleNamespace(
                openrouter_api_key="test", openrouter_model="test", app_origin="http://testserver"
            ),
        ),
        patch("app.ai.request", side_effect=reply),
    ):
        result = analyze(snapshot)
        assert result["status"] == "ready"
    assert "message" in snapshot["channels"][0]


def test_worker_retries_failed_job_without_losing_status(db):
    one = enqueue(db, "sync", {"month": "2026-08"}, "retry-test")
    with patch("app.jobs.run_job", side_effect=ProviderError("failure")):
        assert worker_once()
    db.expire_all()
    job = db.get(Job, one.id)
    assert job.status == "queued"
    assert job.attempts == 1
    assert job.error == "failure"
