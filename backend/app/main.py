import csv
import io
import math
import re
import secrets
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Request,
    Response,
    UploadFile,
)
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy import delete, select, text, update
from sqlalchemy.exc import IntegrityError

from .analytics import build_dashboard, month_bounds
from .catalog import BY_ID
from .config import get_settings
from .connectors import parse_docx
from .db import SessionLocal, get_db
from .demo import demo_analysis, demo_dashboard
from .jobs import enqueue
from .models import (
    ChannelState,
    Invite,
    Job,
    LoginSession,
    Metric,
    Preference,
    Report,
    User,
    now,
)
from .security import (
    DUMMY_HASH,
    admin,
    current_user,
    digest,
    hasher,
    throttle,
    utc,
    verify,
)

s = get_settings()


@asynccontextmanager
async def lifespan(app):
    with SessionLocal() as db:
        if not db.scalar(select(User).where(User.role == "master_admin")):
            if len(s.admin_password) < 12 or not re.fullmatch(
                r"[^\s@]+@[^\s@]+\.[^\s@]+", s.admin_email
            ):
                raise RuntimeError(
                    "Set ADMIN_PASSWORD (12+ characters) and ADMIN_EMAIL before first startup."
                )
            db.add(
                User(
                    username=s.admin_username.casefold(),
                    email=s.admin_email.casefold(),
                    password_hash=hasher.hash(s.admin_password),
                    role="master_admin",
                )
            )
            db.commit()
    yield


app = FastAPI(
    title="Sonio Insights API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/api/docs" if s.environment != "production" else None,
    openapi_url="/api/openapi.json" if s.environment != "production" else None,
)


@app.middleware("http")
async def security_headers(request, call_next):
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        origin = request.headers.get("origin")
        if origin and origin.rstrip("/") != s.app_origin.rstrip("/"):
            return JSONResponse(
                {"detail": "Anfrage von unbekannter Herkunft abgelehnt."},
                status_code=403,
            )
        if request.headers.get("x-sonio-request") != "1":
            return JSONResponse({"detail": "Sicherheitsheader fehlt."}, status_code=403)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Frame-Options"] = "DENY"
    return response


def month_param(month: str | None = None):
    month = month or (
        datetime.now(ZoneInfo(s.report_timezone)).date().replace(day=1) - timedelta(days=1)
    ).strftime("%Y-%m")
    try:
        if not re.fullmatch(r"20\d{2}-(0[1-9]|1[0-2])", month):
            raise ValueError()
        month_bounds(month)
    except ValueError:
        raise HTTPException(422, "Monat muss JJJJ-MM sein.") from None
    return month


def user_json(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "active": user.active,
    }


@app.get("/api/health")
def health(db=Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.get("/api/config/public")
def public_config():
    return {
        "demo_enabled": s.demo_enabled,
        "timezone": s.report_timezone,
        "report_hour": s.report_hour,
        "sync_interval_minutes": s.sync_interval_minutes,
    }


class LoginBody(BaseModel):
    username: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=1, max_length=256)


@app.post("/api/auth/login")
def login(body: LoginBody, request: Request, response: Response, db=Depends(get_db)):
    throttle(db, request, body.username)
    user = db.scalar(select(User).where(User.username == body.username.casefold()))
    valid = verify(user.password_hash if user else DUMMY_HASH, body.password)
    if not user or not valid or not user.active:
        raise HTTPException(401, "Benutzername oder Passwort ist nicht korrekt.")
    token = secrets.token_urlsafe(48)
    db.add(
        LoginSession(
            token_hash=digest(token),
            user_id=user.id,
            expires_at=now() + timedelta(hours=12),
        )
    )
    db.commit()
    response.set_cookie(
        "sonio_session",
        token,
        httponly=True,
        secure=s.cookie_secure,
        samesite="strict",
        max_age=43200,
        path="/",
    )
    return user_json(user)


@app.post("/api/auth/logout")
def logout(request: Request, response: Response, db=Depends(get_db)):
    db.execute(
        delete(LoginSession).where(
            LoginSession.token_hash == digest(request.cookies.get("sonio_session", ""))
        )
    )
    db.commit()
    response.delete_cookie("sonio_session", path="/")
    return {"ok": True}


@app.get("/api/auth/me")
def me(user=Depends(current_user)):
    return user_json(user)


class InviteBody(BaseModel):
    email: str = Field(max_length=254)


@app.post("/api/admin/invites")
def create_invite(body: InviteBody, user=Depends(admin), db=Depends(get_db)):
    email = body.email.strip().casefold()
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        raise HTTPException(422, "Bitte eine gültige E-Mail-Adresse eingeben.")
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "Diese E-Mail-Adresse hat bereits ein Konto.")
    db.execute(delete(Invite).where(Invite.email == email, Invite.used.is_(False)))
    token = secrets.token_urlsafe(48)
    expiry = now() + timedelta(days=7)
    db.add(Invite(token_hash=digest(token), email=email, expires_at=expiry))
    db.commit()
    return {
        "url": f"{s.app_origin}/invite#token={token}",
        "expires_at": expiry.isoformat(),
    }


class AcceptBody(LoginBody):
    token: str = Field(min_length=30, max_length=200)


@app.post("/api/auth/invite/accept")
def accept_invite(body: AcceptBody, request: Request, db=Depends(get_db)):
    throttle(db, request, body.username)
    if len(body.password) < 12:
        raise HTTPException(422, "Bitte mindestens 12 Zeichen für das Passwort verwenden.")
    if not re.fullmatch(r"[a-zA-Z0-9._-]{3,80}", body.username):
        raise HTTPException(
            422,
            "Benutzername: 3–80 Buchstaben, Zahlen, Punkt, Strich oder Unterstrich.",
        )
    invite = db.scalar(
        select(Invite).where(Invite.token_hash == digest(body.token)).with_for_update()
    )
    if not invite or invite.used or utc(invite.expires_at) <= now():
        raise HTTPException(400, "Einladung ist abgelaufen oder wurde bereits verwendet.")
    try:
        claimed = db.execute(
            update(Invite)
            .where(Invite.token_hash == invite.token_hash, Invite.used.is_(False))
            .values(used=True)
        )
        if claimed.rowcount != 1:
            raise HTTPException(400, "Einladung wurde bereits verwendet.")
        user = User(
            username=body.username.casefold(),
            email=invite.email,
            password_hash=hasher.hash(body.password),
            role="viewer",
        )
        db.add(user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Benutzername oder E-Mail-Adresse ist bereits vergeben.") from None
    return {"ok": True}


@app.get("/api/admin/users")
def users(user=Depends(admin), db=Depends(get_db)):
    return [user_json(u) for u in db.scalars(select(User).order_by(User.created_at)).all()]


class ActiveBody(BaseModel):
    active: bool


@app.patch("/api/admin/users/{user_id}")
def update_user(user_id: str, body: ActiveBody, user=Depends(admin), db=Depends(get_db)):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(404, "Nutzer nicht gefunden.")
    if target.role == "master_admin":
        raise HTTPException(400, "Der Master-Admin kann hier nicht deaktiviert werden.")
    target.active = body.active
    if not body.active:
        db.execute(delete(LoginSession).where(LoginSession.user_id == user_id))
    db.commit()
    return user_json(target)


@app.get("/api/dashboard")
def dashboard(month=Depends(month_param), user=Depends(current_user), db=Depends(get_db)):
    return build_dashboard(db, month, today=datetime.now(ZoneInfo(s.report_timezone)).date())


@app.get("/api/demo/dashboard")
def demo(month=Depends(month_param)):
    if not s.demo_enabled:
        raise HTTPException(404)
    return demo_dashboard(month)


@app.get("/api/linkedin/posts")
def linkedin_posts(month=Depends(month_param), user=Depends(current_user), db=Depends(get_db)):
    from .linkedin_posts import post_response

    return post_response(db, month, s)


@app.get("/api/demo/analysis")
def demo_insights():
    if not s.demo_enabled:
        raise HTTPException(404)
    return demo_analysis()


@app.get("/api/analysis")
def analysis(month=Depends(month_param), user=Depends(current_user), db=Depends(get_db)):
    cached = db.get(Preference, "analysis:" + month)
    return (
        cached.value
        if cached
        else {
            "status": "not_generated",
            "summary": "Erstelle eine Analyse, sobald die Daten für diesen Monat vorliegen.",
            "recommendations": [],
        }
    )


class JobBody(BaseModel):
    month: str
    channel: str | None = None


def queue_request(kind, body, db):
    month_param(body.month)
    if body.channel and body.channel not in BY_ID:
        raise HTTPException(422, "Unbekannter Kanal.")
    # A minute bucket avoids accidental double clicks and duplicate API work.
    bucket = int(now().timestamp()) // 60
    return enqueue(
        db,
        kind,
        body.model_dump(),
        f"manual:{kind}:{body.month}:{body.channel}:{bucket}",
    )


def job_json(job):
    return {
        "id": job.id,
        "kind": job.kind,
        "status": job.status,
        "error": job.error,
        "created_at": job.created_at.isoformat(),
    }


@app.post("/api/sync", status_code=202)
def sync(body: JobBody, user=Depends(admin), db=Depends(get_db)):
    return job_json(queue_request("sync", body, db))


@app.post("/api/analysis", status_code=202)
def analyze(body: JobBody, user=Depends(admin), db=Depends(get_db)):
    return job_json(queue_request("analysis", body, db))


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str, user=Depends(current_user), db=Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Auftrag nicht gefunden.")
    return job_json(job)


@app.get("/api/reports")
def reports(user=Depends(current_user), db=Depends(get_db)):
    return [
        {
            "id": r.id,
            "month": r.month,
            "created_at": r.created_at.isoformat(),
            "delivery_status": r.delivery_status,
            "analysis_status": r.analysis.get("status"),
        }
        for r in db.scalars(select(Report).order_by(Report.month.desc())).all()
    ]


@app.post("/api/reports", status_code=202)
def create_report(body: JobBody, user=Depends(admin), db=Depends(get_db)):
    return job_json(queue_request("report", body, db))


@app.get("/api/reports/{report_id}")
def report(report_id: str, user=Depends(current_user), db=Depends(get_db)):
    r = db.get(Report, report_id)
    if not r:
        raise HTTPException(404, "Report nicht gefunden.")
    return {
        "id": r.id,
        "month": r.month,
        "snapshot": r.snapshot,
        "analysis": r.analysis,
        "created_at": r.created_at.isoformat(),
        "delivery_status": r.delivery_status,
    }


@app.get("/api/settings")
def settings(user=Depends(admin)):
    configured = {
        "google_ads": bool(s.google_ads_customer_id and s.google_refresh_token),
        "analytics": bool(s.ga4_property_id and s.google_refresh_token),
        "linkedin": bool(
            s.linkedin_ad_account_id
            and (s.linkedin_ads_access_token or s.linkedin_ads_refresh_token)
        ),
        "linkedin_organic": bool(
            s.linkedin_organization_id and (s.linkedin_access_token or s.linkedin_refresh_token)
        ),
        "mailchimp": bool(s.mailchimp_api_key),
        "youtube": bool(s.youtube_channel_id and s.google_refresh_token),
        "events": bool(s.ms_drive_id and s.ms_client_secret),
        "qr": False,
    }
    return {
        "timezone": s.report_timezone,
        "report_day": 3,
        "report_hour": s.report_hour,
        "sync_interval_minutes": s.sync_interval_minutes,
        "email_configured": bool(s.smtp_host and s.report_recipients),
        "ai_configured": bool(s.openrouter_api_key and s.openrouter_model),
        "model": s.openrouter_model,
        "channels": configured,
    }


class KPI(BaseModel):
    channel: str
    key: str
    label: str = Field(min_length=1, max_length=80)
    target: float | None = Field(default=None, ge=0, allow_inf_nan=False)


class KPIBody(BaseModel):
    items: list[KPI] = Field(min_length=1, max_length=8)


@app.put("/api/settings/kpis")
def save_kpis(body: KPIBody, user=Depends(admin), db=Depends(get_db)):
    for item in body.items:
        if item.channel not in BY_ID or item.key not in BY_ID[item.channel]["fields"]:
            raise HTTPException(422, "Kennzahl ist für diesen Kanal nicht verfügbar.")
    if len({(k.channel, k.key) for k in body.items}) != len(body.items):
        raise HTTPException(422, "Eine Kennzahl darf nur einmal ausgewählt werden.")
    pref = db.get(Preference, "kpis") or Preference(key="kpis", value={})
    pref.value = body.model_dump()
    db.add(pref)
    db.execute(delete(Preference).where(Preference.key.like("analysis:%")))
    db.commit()
    return {"ok": True}


@app.post("/api/import/events")
async def import_events(
    event_id: str = Form(..., min_length=1, max_length=80),
    file: UploadFile = File(...),
    user=Depends(admin),
    db=Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".docx"):
        raise HTTPException(422, "Bitte eine .docx-Datei auswählen.")
    content = await file.read(10 * 1024 * 1024 + 1)
    try:
        counts = parse_docx(content, s.event_date_column, s.event_email_column)
    except Exception as exc:
        raise HTTPException(
            422,
            str(exc) if isinstance(exc, ValueError) else "Word-Datei konnte nicht gelesen werden.",
        ) from None
    if not event_id.strip():
        raise HTTPException(422, "Event-ID darf nicht leer sein.")
    source = "upload:" + event_id.strip()
    db.execute(delete(Metric).where(Metric.channel == "events", Metric.source_id == source))
    db.add_all(
        [
            Metric(channel="events", date=d, key="registrations", value=n, source_id=source)
            for d, n in counts.items()
        ]
    )
    mark_import(db, "events")
    db.commit()
    return {
        "registrations": sum(counts.values()),
        "days": len(counts),
        "message": "Import abgeschlossen. Namen und E-Mail-Adressen wurden nicht gespeichert.",
    }


@app.post("/api/import/qr")
async def import_qr(
    source_id: str = Form(..., min_length=1, max_length=80),
    file: UploadFile = File(...),
    user=Depends(admin),
    db=Depends(get_db),
):
    raw = await file.read(1024 * 1024 + 1)
    if len(raw) > 1024 * 1024:
        raise HTTPException(413, "CSV darf höchstens 1 MB gross sein.")
    try:
        reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")))
        if reader.fieldnames != ["date", "scans"]:
            raise ValueError("CSV benötigt genau die Spalten date,scans.")
        values = {}
        for r in reader:
            day = date.fromisoformat(r["date"]).isoformat()
            value = float(r["scans"])
            if not math.isfinite(value) or value < 0 or not value.is_integer():
                raise ValueError("Scans müssen ganze, nicht negative Zahlen sein.")
            values[day] = values.get(day, 0) + value
        if not values:
            raise ValueError("CSV enthält keine Messwerte.")
    except (ValueError, KeyError, TypeError, UnicodeDecodeError) as exc:
        raise HTTPException(422, str(exc)) from None
    if not source_id.strip():
        raise HTTPException(422, "Quellen-ID darf nicht leer sein.")
    source = "upload:" + source_id.strip()
    db.execute(delete(Metric).where(Metric.channel == "qr", Metric.source_id == source))
    db.add_all(
        [
            Metric(channel="qr", date=d, key="scans", value=n, source_id=source)
            for d, n in values.items()
        ]
    )
    mark_import(db, "qr")
    db.commit()
    return {"rows": len(values)}


def mark_import(db, channel):
    state = db.get(ChannelState, channel) or ChannelState(channel=channel)
    state.status = "imported"
    state.message = "Manuell importierte Daten. Keine automatische Verbindung."
    state.last_success = now()
    db.add(state)
    db.execute(delete(Preference).where(Preference.key.like("analysis:%")))


@app.get("/api/linkedin/audience")
def linkedin_audience(month=Depends(month_param), user=Depends(current_user), db=Depends(get_db)):
    from .linkedin_audience import audience_response

    return audience_response(db, month, s)


@app.get("/api/linkedin/ads/campaigns")
def ads_campaigns(user=Depends(current_user), db=Depends(get_db)):
    from .linkedin_ads import campaign_summary

    return campaign_summary(db, s, datetime.now(ZoneInfo(s.report_timezone)).date())
