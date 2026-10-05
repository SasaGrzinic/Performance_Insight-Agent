"""Admin-triggered, loopback-only recovery using the existing verified OAuth helpers.

No credentials are returned to the browser. The subprocess verifies the Sonio
property/channel before saving; a successful exit then queues the normal import.
This is intentionally unavailable in production and on GitHub Pages.
"""

import os
import secrets
import subprocess
import sys
import threading
from datetime import datetime
from pathlib import Path
from typing import Literal
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from .config import get_settings, reload_local_google_credentials
from .db import SessionLocal, get_db
from .jobs import enqueue
from .models import ChannelState, Job
from .security import admin, current_user

router = APIRouter(prefix="/api/connections/google")
ROOT = Path(__file__).resolve().parents[2]
HELPERS = {"analytics": "analytics_oauth.py", "youtube": "youtube_oauth.py"}
_lock = threading.Lock()
_operation = None


def stop_helper():
    with _lock:
        if _operation and _operation["process"].poll() is None:
            _operation["process"].terminate()


def available():
    s = get_settings()
    return (
        s.environment == "development"
        and s.local_google_reconnect
        and s.app_origin == "http://127.0.0.1:5173"
        and (ROOT / "scripts/analytics_oauth.py").is_file()
    )


def public_operation(operation, db):
    if not operation:
        return None
    result = {k: operation.get(k) for k in ("id", "channel", "status", "message", "job_id")}
    if result["status"] == "syncing":
        job = db.get(Job, result["job_id"])
        if job and job.status in {"completed", "failed"}:
            result["status"] = "completed" if job.status == "completed" else "sync_failed"
            result["message"] = (
                "Verbindung bestätigt. Kennzahlen wurden aktualisiert."
                if job.status == "completed"
                else "Verbindung bestätigt; Datenabruf fehlgeschlagen. Bitte Daten aktualisieren."
            )
    return result


@router.get("")
def status(user=Depends(current_user), db=Depends(get_db)):
    channels = []
    for channel in HELPERS:
        state = db.get(ChannelState, channel)
        channels.append({
            "id": channel,
            "status": state.status if state else "not_configured",
            "message": state.message if state else "Noch nicht verbunden.",
            "last_success": state.last_success.isoformat() if state and state.last_success else None,
        })
    with _lock:
        operation = public_operation(_operation, db) if user.role == "master_admin" else None
    return {"available": available(), "channels": channels, "operation": operation}


def monitor(operation, ready):
    process = operation["process"]
    try:
        # Helpers print a fixed readiness line before serving. Output never
        # leaves this process; stderr is discarded to avoid OAuth query logs.
        line = process.stdout.readline()
        if "OAuth bereit:" not in line:
            raise RuntimeError("Helper not ready")
        ready.set()
        output, _ = process.communicate(timeout=1810)
        if process.returncode != 0 or "SONIO_OAUTH_COMPLETE" not in output:
            raise RuntimeError("Authorization not completed")
        reload_local_google_credentials()
        s = get_settings()
        month = datetime.now(ZoneInfo(s.report_timezone)).strftime("%Y-%m")
        with SessionLocal() as db:
            job = enqueue(db, "sync", {"month": month, "channel": operation["channel"],
                                       "reconnected": True}, "google-reconnect:" + operation["id"])
            with _lock:
                operation.update(status="syncing", job_id=job.id,
                                 message="Verbindung bestätigt. Kennzahlen werden automatisch geladen.")
    except Exception:
        if process.poll() is None:
            process.terminate()
            process.wait(timeout=5)
        with _lock:
            operation.update(status="failed", message="Anmeldung nicht abgeschlossen oder abgelaufen. Bitte erneut verbinden.")
        ready.set()


class StartBody(BaseModel):
    channel: Literal["analytics", "youtube"]


@router.post("/start")
def start(body: StartBody, user=Depends(admin), db=Depends(get_db)):
    global _operation
    if not available():
        raise HTTPException(409, "Direkte Wiederverbindung ist nur in der lokalen Entwicklung verfügbar.")
    with _lock:
        current = public_operation(_operation, db)
        if current and current["status"] in {"waiting", "syncing"}:
            raise HTTPException(409, "Bitte die laufende Google-Verbindung zuerst abschliessen.")
        ticket = secrets.token_urlsafe(32)
        env = os.environ.copy()
        env["SONIO_OAUTH_START_KEY"] = ticket
        try:
            process = subprocess.Popen(
                [sys.executable, "-u", str(ROOT / "scripts" / HELPERS[body.channel])],
                cwd=ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True,
            )
        except OSError:
            raise HTTPException(503, "Anmeldeassistent konnte nicht gestartet werden.") from None
        operation = {"id": secrets.token_urlsafe(16), "channel": body.channel,
                     "status": "waiting", "message": "Google-Bestätigung steht aus.", "process": process}
        _operation = operation
        ready = threading.Event()
        threading.Thread(target=monitor, args=(operation, ready), daemon=True).start()
    if not ready.wait(5) or process.poll() is not None:
        if process.poll() is None:
            process.terminate()
        raise HTTPException(503, "Anmeldeassistent nicht erreichbar. Möglicherweise läuft bereits eine Anmeldung.")
    return {"id": operation["id"], "url": "http://127.0.0.1:8766/start?ticket=" + ticket}


@router.post("/cancel")
def cancel(user=Depends(admin)):
    with _lock:
        if _operation and _operation["status"] == "waiting":
            process = _operation["process"]
            if process.poll() is None:
                process.terminate()
    return {"ok": True}
