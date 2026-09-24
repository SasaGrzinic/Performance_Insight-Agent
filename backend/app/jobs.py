import hashlib
import json
import logging
import smtplib
import ssl
import time
from datetime import datetime, timedelta
from email.message import EmailMessage
from zoneinfo import ZoneInfo

from sqlalchemy import delete, or_, select, text
from sqlalchemy.exc import IntegrityError

from .ai import analyze
from .analytics import build_dashboard, month_bounds, previous_month
from .catalog import CHANNELS
from .config import get_settings
from .connectors import NotConfigured, ProviderError, fetch_channel
from .db import SessionLocal
from .models import ChannelState, Job, Metric, Preference, Report, now

log = logging.getLogger(__name__)


def enqueue(db, kind, payload, dedupe):
    existing = db.scalar(select(Job).where(Job.dedupe_key == dedupe))
    if existing:
        return existing
    job = Job(kind=kind, payload=payload, dedupe_key=dedupe)
    try:
        db.add(job)
        db.commit()
        return job
    except IntegrityError:
        db.rollback()
        return db.scalar(select(Job).where(Job.dedupe_key == dedupe))


def sync_channel(db, channel, start, end):
    if db.bind.dialect.name == "postgresql":
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:key))"), {"key": "sync:" + channel})
    state = db.get(ChannelState, channel)
    if not state:
        state = ChannelState(channel=channel)
        db.add(state)
    try:
        records = fetch_channel(channel, start, end)
        query = delete(Metric).where(
            Metric.channel == channel,
            Metric.date >= str(start),
            Metric.date <= str(end),
        )
        if channel == "linkedin_organic":
            from .linkedin_audience import KEYS

            query = query.where(Metric.key.not_in(KEYS))
        # Automatic imports never remove manually uploaded events or QR counts.
        if channel == "events":
            query = query.where(Metric.source_id.like("graph:%"))
        db.execute(query)
        db.add_all([Metric(**r) for r in records])
        state.status = "connected"
        state.message = f"{len(records)} Messwerte aktualisiert"
        state.last_success = now()
        db.commit()
        return True
    except NotConfigured as exc:
        db.rollback()
        state = db.get(ChannelState, channel) or ChannelState(channel=channel)
        imported = db.scalar(
            select(Metric.id)
            .where(Metric.channel == channel, Metric.source_id.like("upload:%"))
            .limit(1)
        )
        state.status = "imported" if imported else "not_configured"
        state.message = ("Manueller Import vorhanden. " if imported else "") + str(exc)
        db.add(state)
        db.commit()
        return False
    except Exception as exc:
        db.rollback()
        state = db.get(ChannelState, channel) or ChannelState(channel=channel)
        state.status = "error"
        state.message = (
            str(exc)[:300]
            if isinstance(exc, ProviderError)
            else "Import fehlgeschlagen. Konfiguration oder Dateiformat prüfen."
        )
        db.add(state)
        db.commit()
        return False


def synchronize(db, month, channel=None):
    s = get_settings()
    today = datetime.now(ZoneInfo(s.report_timezone)).date()
    start = month_bounds(previous_month(month))[0]
    end = min(month_bounds(month)[1], today)
    results = {
        c["id"]: sync_channel(db, c["id"], start, end)
        for c in CHANNELS
        if not channel or c["id"] == channel
    }
    if results.get("linkedin_organic"):
        from .linkedin_audience import sync_audience
        from .linkedin_posts import sync_posts

        sync_audience(db, start, end, s)
        sync_posts(db, start, end, s)
    return results


def generate_report(db, month):
    if db.bind.dialect.name == "postgresql":
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:key))"), {"key": "report:" + month})
    existing = db.scalar(select(Report).where(Report.month == month))
    if existing and existing.sent_at:
        return existing
    snapshot = build_dashboard(
        db, month, today=datetime.now(ZoneInfo(get_settings().report_timezone)).date()
    )
    try:
        analysis = analyze(snapshot)
    except Exception:
        analysis = {
            "status": "error",
            "summary": "Die KI-Auswertung konnte nicht erstellt werden. Die Messwerte sind im Report verfügbar.",
            "recommendations": [],
        }
    report = existing or Report(month=month, snapshot=snapshot, analysis=analysis)
    report.snapshot = snapshot
    report.analysis = analysis
    report.created_at = now()
    db.add(report)
    db.commit()
    return report


def send_report(db, report):
    s = get_settings()
    if report.sent_at:
        return
    recipients = [r.strip() for r in s.report_recipients.split(",") if r.strip()]
    if not recipients or not s.smtp_host:
        report.delivery_status = "not_configured"
        db.commit()
        return
    message = EmailMessage()
    message["Subject"] = f"Sonio Insights | Performance {report.month}"
    message["From"] = s.smtp_from
    message["To"] = ", ".join(recipients)
    message["Message-ID"] = f"<sonio-report-{report.id}@{s.smtp_from.split('@')[-1]}>"
    lines = [f"Monatsreport {report.month}", report.analysis["summary"], ""]
    for channel in report.snapshot["channels"]:
        if channel["status"] != "connected":
            lines.append(f"Datenhinweis {channel['name']}: {channel['message']}")
    for k in report.snapshot["kpis"]:
        lines.append(f"{k['label']}: {k['value'] if k['value'] is not None else 'Keine Daten'}")
    for rec in report.analysis.get("recommendations", []):
        lines.extend(["", rec["title"], rec["observation"], rec["action"], rec["caveat"]])
    lines.extend(
        [
            "",
            f"Geschützter Report: {s.app_origin}/?view=reports",
            "Empfehlungen vor Umsetzung fachlich prüfen.",
        ]
    )
    message.set_content("\n".join(lines))
    try:
        with smtplib.SMTP(s.smtp_host, s.smtp_port, timeout=30) as client:
            if s.smtp_starttls:
                client.starttls(context=ssl.create_default_context())
            if s.smtp_username:
                client.login(s.smtp_username, s.smtp_password)
            client.send_message(message)
        report.sent_at = now()
        report.delivery_status = "sent"
        db.commit()
    except Exception:
        report.delivery_status = "failed"
        db.commit()
        raise ProviderError("Report erstellt, E-Mail-Zustellung fehlgeschlagen.") from None


def refresh_analysis(db, month, force=False):
    snapshot = build_dashboard(
        db, month, today=datetime.now(ZoneInfo(get_settings().report_timezone)).date()
    )
    fingerprint_data = {
        "month": month,
        "period_end": snapshot["period_end"],
        "kpis": snapshot["kpis"],
        "channels": [
            {"id": c["id"], "values": c["values"], "previous": c["previous"], "status": c["status"]}
            for c in snapshot["channels"]
        ],
        "model": get_settings().openrouter_model,
    }
    fingerprint = hashlib.sha256(json.dumps(fingerprint_data, sort_keys=True).encode()).hexdigest()
    key = "analysis:" + month
    record = db.get(Preference, key) or Preference(key=key, value={})
    if not force and record.value.get("fingerprint") == fingerprint:
        return record.value
    try:
        value = analyze(snapshot)
    except Exception:
        value = {
            "status": "error",
            "summary": "Die Daten wurden aktualisiert, die KI-Auswertung ist fehlgeschlagen. Bitte die Analyse erneut erstellen.",
            "recommendations": [],
        }
    record.value = {
        **value,
        "generated_at": now().isoformat(),
        "fingerprint": fingerprint if value["status"] not in {"error", "not_configured"} else None,
    }
    db.add(record)
    db.commit()
    return record.value


def run_job(db, job):
    if job.kind == "sync":
        results = synchronize(db, job.payload["month"], job.payload.get("channel"))
        refresh_analysis(db, job.payload["month"])
        refresh_analysis(db, previous_month(job.payload["month"]))
        failures = db.scalars(
            select(ChannelState).where(
                ChannelState.channel.in_(results), ChannelState.status == "error"
            )
        ).all()
        if failures:
            raise ProviderError(
                "Datenabruf fehlgeschlagen: " + ", ".join(s.channel for s in failures)
            )
    elif job.kind == "report":
        synchronize(db, job.payload["month"])
        report = generate_report(db, job.payload["month"])
        if job.payload.get("send"):
            send_report(db, report)
    elif job.kind == "analysis":
        refresh_analysis(db, job.payload["month"], force=True)


def worker_once():
    with SessionLocal() as db:
        # A single worker holds the lease; SKIP LOCKED permits additional workers in PostgreSQL.
        stale = now() - timedelta(minutes=30)
        job = db.scalar(
            select(Job)
            .where(
                or_(
                    (Job.status == "queued") & (Job.available_at <= now()),
                    (Job.status == "running") & (Job.leased_at < stale),
                )
            )
            .order_by(Job.created_at)
            .with_for_update(skip_locked=True)
            .limit(1)
        )
        if not job:
            return False
        job.status = "running"
        job.leased_at = now()
        job.attempts += 1
        db.commit()
        try:
            run_job(db, job)
            job.status = "completed"
            job.error = None
        except Exception as exc:
            db.rollback()
            job = db.get(Job, job.id)
            job.status = "failed" if job.attempts >= 3 else "queued"
            job.available_at = now() + timedelta(seconds=30 * 2**job.attempts)
            job.error = (
                str(exc)[:500]
                if isinstance(exc, ProviderError)
                else "Auftrag fehlgeschlagen. Serverkonfiguration prüfen."
            )
        db.commit()
        return True


def schedule_tick(db, instant=None):
    s = get_settings()
    local = (instant or now()).astimezone(ZoneInfo(s.report_timezone))
    bucket = int(local.timestamp()) // (s.sync_interval_minutes * 60)
    enqueue(db, "sync", {"month": local.strftime("%Y-%m")}, f"scheduled-sync:{bucket}")
    # Catch up every missed month after downtime, using durable unique keys.
    cursor = s.report_start_month
    last = local.strftime("%Y-%m")
    while cursor <= last:
        year, month = map(int, cursor.split("-"))
        due = datetime(year, month, 3, s.report_hour, tzinfo=ZoneInfo(s.report_timezone))
        if local >= due:
            target = previous_month(cursor)
            enqueue(
                db,
                "report",
                {"month": target, "send": True},
                f"monthly-report:{target}",
            )
        cursor = f"{year + 1}-01" if month == 12 else f"{year}-{month + 1:02}"


def main():
    import sys

    logging.basicConfig(level=logging.INFO)
    mode = sys.argv[1] if len(sys.argv) > 1 else "worker"
    while True:
        try:
            if mode == "scheduler":
                with SessionLocal() as db:
                    schedule_tick(db)
                time.sleep(30)
            elif not worker_once():
                time.sleep(2)
        except Exception:
            log.error("Background service operation failed; retrying in 10 seconds.")
            time.sleep(10)


if __name__ == "__main__":
    main()
