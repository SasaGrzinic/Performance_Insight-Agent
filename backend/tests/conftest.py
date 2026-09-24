import os
import secrets
import tempfile
from pathlib import Path

import pytest

os.environ["ENVIRONMENT"] = "test"
os.environ["COOKIE_SECURE"] = "false"
os.environ["DEMO_ENABLED"] = "true"
os.environ["APP_ORIGIN"] = "http://testserver"
os.environ["ADMIN_EMAIL"] = "admin@example.test"
os.environ["ADMIN_PASSWORD"] = "test-only-" + secrets.token_urlsafe(20)
os.environ["REPORT_START_MONTH"] = "2026-01"
os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL", "sqlite:///" + str(Path(tempfile.mkdtemp()) / "test.db")
)
from fastapi.testclient import TestClient

from app.db import Base, SessionLocal, engine
from app.main import app


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client


@pytest.fixture
def db():
    with SessionLocal() as db:
        yield db


@pytest.fixture
def logged_in(client):
    r = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": os.environ["ADMIN_PASSWORD"]},
        headers={"X-Sonio-Request": "1"},
    )
    assert r.status_code == 200
    return client
