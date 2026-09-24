import hashlib
import secrets
from datetime import timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import Depends, HTTPException, Request
from sqlalchemy import delete, func, select

from .config import get_settings
from .db import get_db
from .models import AuthAttempt, LoginSession, User, now

hasher = PasswordHasher()
DUMMY_HASH = hasher.hash(secrets.token_urlsafe(32))


def digest(token):
    return hashlib.sha256(token.encode()).hexdigest()


def verify(hash_value, password):
    try:
        return hasher.verify(hash_value, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def utc(value):
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


def current_user(request: Request, db=Depends(get_db)):
    session = db.get(LoginSession, digest(request.cookies.get("sonio_session", "")))
    if not session or utc(session.expires_at) <= now():
        raise HTTPException(401, "Bitte anmelden.")
    user = db.get(User, session.user_id)
    if not user or not user.active:
        raise HTTPException(401, "Konto ist nicht aktiv.")
    return user


def admin(user=Depends(current_user)):
    if user.role != "master_admin":
        raise HTTPException(403, "Nur der Master-Admin darf diese Aktion ausführen.")
    return user


def throttle(db, request, identity):
    ip = request.client.host if request.client else "unknown"
    if get_settings().trust_proxy:
        ip = request.headers.get("x-real-ip", ip)
    keys = [digest("ip:" + ip), digest("name:" + identity.casefold())]
    cutoff = now() - timedelta(minutes=15)
    db.execute(delete(AuthAttempt).where(AuthAttempt.created_at < cutoff))
    for key in keys:
        count = db.scalar(
            select(func.count())
            .select_from(AuthAttempt)
            .where(AuthAttempt.key == key, AuthAttempt.created_at > cutoff)
        )
        if count >= 10:
            raise HTTPException(429, "Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.")
    for key in keys:
        db.add(AuthAttempt(key=key))
    db.commit()
