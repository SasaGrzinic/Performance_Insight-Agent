import io
import threading
from unittest.mock import patch

from sqlalchemy import select

from app import google_reconnect
from app.config import get_settings, reload_local_google_credentials
from app.db import SessionLocal
from app.models import ChannelState, Job, User


def test_reconnect_requires_admin_csrf_and_allowlisted_channel(client, logged_in, db):
    with patch.object(google_reconnect, "available", return_value=True), patch("subprocess.Popen") as launch:
        assert client.post("/api/connections/google/start", json={"channel": "analytics"}).status_code == 403
        assert logged_in.post("/api/connections/google/start", json={"channel": "../../anything"}, headers={"X-Sonio-Request": "1"}).status_code == 422
        user = db.scalar(select(User))
        user.role = "viewer"
        db.commit()
        assert logged_in.post("/api/connections/google/start", json={"channel": "analytics"}, headers={"X-Sonio-Request": "1"}).status_code == 403
        launch.assert_not_called()


def test_reconnect_unavailable_outside_local_preview(logged_in):
    with patch("subprocess.Popen") as launch:
        r = logged_in.post("/api/connections/google/start", json={"channel": "analytics"}, headers={"X-Sonio-Request": "1"})
    assert r.status_code == 409
    launch.assert_not_called()


def test_status_is_authenticated_and_never_returns_credentials(client, db):
    assert client.get("/api/connections/google").status_code == 401


class Helper:
    returncode = 0

    def __init__(self, output):
        self.stdout = io.StringIO("OAuth bereit: http://127.0.0.1:8766/start (30 Minuten)\n")
        self.output = output

    def communicate(self, timeout):
        return self.output, None

    def poll(self):
        return self.returncode


def test_verified_helper_queues_only_its_channel_and_retains_data(db):
    state = ChannelState(channel="analytics", status="error", message="Old data retained")
    db.add(state)
    db.commit()
    op = {"id": "operation1", "channel": "analytics", "status": "waiting", "process": Helper("SONIO_OAUTH_COMPLETE\n")}
    ready = threading.Event()
    with patch.object(google_reconnect, "reload_local_google_credentials") as reload:
        google_reconnect.monitor(op, ready)
        reload.assert_called_once()
    assert ready.is_set()
    assert op["status"] == "syncing"
    with SessionLocal() as session:
        job = session.get(Job, op["job_id"])
        assert job.payload["channel"] == "analytics"
        assert job.payload["reconnected"] is True
        assert session.get(ChannelState, "analytics").message == "Old data retained"
        assert "process" not in google_reconnect.public_operation(op, session)
        job.status = "completed"
        session.commit()
        assert google_reconnect.public_operation(op, session)["status"] == "completed"


def test_unverified_or_expired_helper_never_queues_import(db):
    op = {"id": "failed1", "channel": "youtube", "status": "waiting", "process": Helper("No approval")}
    google_reconnect.monitor(op, threading.Event())
    assert op["status"] == "failed"
    assert db.scalar(select(Job)) is None


def test_local_rotation_is_read_by_existing_settings_and_preserves_ads(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "environment", "development")
    monkeypatch.setattr(settings, "local_google_reconnect", True)
    monkeypatch.setattr(settings, "ga4_refresh_token", "old")
    monkeypatch.setattr(settings, "google_ads_refresh_token", "ads-token")
    monkeypatch.setattr("app.config.dotenv_values", lambda path: {"GA4_REFRESH_TOKEN": "new", "GOOGLE_ADS_REFRESH_TOKEN": "wrong"})
    reload_local_google_credentials()
    assert settings.ga4_refresh_token == "new"
    assert settings.google_ads_refresh_token == "ads-token"
    monkeypatch.setattr(settings, "environment", "production")
    monkeypatch.setattr(settings, "ga4_refresh_token", "production")
    reload_local_google_credentials()
    assert settings.ga4_refresh_token == "production"
