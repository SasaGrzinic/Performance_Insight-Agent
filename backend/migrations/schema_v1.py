# Frozen initial schema. Do not modify after release.
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


def now():
    return datetime.now(timezone.utc)


def uid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    username: Mapped[str] = mapped_column(String(80), unique=True)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    password_hash: Mapped[str] = mapped_column(String(512))
    role: Mapped[str] = mapped_column(String(20), default="viewer")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class LoginSession(Base):
    __tablename__ = "sessions"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class Invite(Base):
    __tablename__ = "invites"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(String(254))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used: Mapped[bool] = mapped_column(Boolean, default=False)


class AuthAttempt(Base):
    __tablename__ = "auth_attempts"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    key: Mapped[str] = mapped_column(String(64), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, index=True)


class Metric(Base):
    __tablename__ = "metrics"
    __table_args__ = (
        UniqueConstraint("channel", "date", "key", "source_id", name="uq_metric_source_day"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    channel: Mapped[str] = mapped_column(String(40), index=True)
    date: Mapped[str] = mapped_column(String(10), index=True)
    key: Mapped[str] = mapped_column(String(64))
    value: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(20), default="count")
    source_id: Mapped[str] = mapped_column(String(200), default="account")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class ChannelState(Base):
    __tablename__ = "channel_states"
    channel: Mapped[str] = mapped_column(String(40), primary_key=True)
    status: Mapped[str] = mapped_column(String(30), default="not_configured")
    message: Mapped[str] = mapped_column(String(300), default="Zugangsdaten fehlen")
    last_success: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Job(Base):
    __tablename__ = "jobs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    dedupe_key: Mapped[str] = mapped_column(String(120), unique=True)
    kind: Mapped[str] = mapped_column(String(30))
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(20), default="queued", index=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    available_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    leased_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error: Mapped[str | None] = mapped_column(String(500), nullable=True)


class Report(Base):
    __tablename__ = "reports"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    month: Mapped[str] = mapped_column(String(7), unique=True)
    snapshot: Mapped[dict] = mapped_column(JSON)
    analysis: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    delivery_status: Mapped[str] = mapped_column(String(30), default="dashboard")
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Preference(Base):
    __tablename__ = "preferences"
    key: Mapped[str] = mapped_column(String(60), primary_key=True)
    value: Mapped[dict] = mapped_column(JSON)


metadata = Base.metadata
