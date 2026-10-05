"""Aggregate-only event snapshots. Never accepts or persists individual responses."""
from datetime import date as Date
from datetime import datetime
from typing import Annotated, Literal
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from sqlalchemy.orm import Session

from .db import get_db
from .models import ChannelState, Preference
from .security import admin, current_user

KEY = "events:aggregate:v1"
router = APIRouter(prefix="/api/events", tags=["events"])
Count = Annotated[int, Field(strict=True, ge=0, le=10000000)]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class EventDay(StrictModel):
    date: Date
    registrations: Count


class Event(StrictModel):
    id: str = Field(min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_-]+$")
    title: str = Field(min_length=1, max_length=250)
    description: str = Field(max_length=600)
    date: Date | None = None
    time: str = Field(default="", max_length=60)
    location: str = Field(default="", max_length=200)
    topic: str = Field(default="Event", max_length=80)
    image_url: str | None = None
    source: Literal["Microsoft Forms", "Zoom"] = "Microsoft Forms"
    observed_at: datetime | None = None
    responses: Count | None = None
    attendees: Count | None = None
    recording_views: Count | None = None
    recording_duration_seconds: Count | None = None
    data_note: str = Field(default="", max_length=500)
    registrations: Count | None = None
    employees: Count | None = None
    partners: Count | None = None
    customers: Count | None = None
    capacity: Annotated[int, Field(strict=True, gt=0)] | None = None
    includes_companions: bool = False
    duplicate_candidate: bool = False
    timeline: list[EventDay] = Field(default_factory=list, max_length=2000)

    @field_validator("image_url")
    @classmethod
    def safe_image(cls, value):
        if value:
            url = urlparse(value)
            if url.scheme != "https" or url.hostname not in {
                "hive.forms.usercontent.microsoft", "www.sonio.com", "sonio.com", "a.storyblok.com"
            } or url.username or url.password or url.query or url.fragment:
                raise ValueError("Only approved event image hosts without credentials are supported")
        return value

    @model_validator(mode="after")
    def consistent(self):
        if self.observed_at is not None and self.observed_at.tzinfo is None:
            raise ValueError("Timestamp must include timezone")
        groups = [self.employees, self.partners, self.customers]
        if self.source == "Zoom" and (self.date is None or self.date < Date(2024, 1, 1)):
            raise ValueError("Zoom events must date from 2024-01-01 onward")
        total = self.registrations if self.registrations is not None else self.responses
        if any(x is not None for x in groups):
            if total is None or sum(x for x in groups if x is not None) > total:
                raise ValueError("Group counts exceed the available total")
        days = [d.date for d in self.timeline]
        if len(days) != len(set(days)):
            raise ValueError("Duplicate timeline days")
        if self.timeline and (
            self.registrations is None
            or sum(d.registrations for d in self.timeline) != self.registrations
        ):
            raise ValueError("Timeline must reconcile to the verified registration total")
        return self


class EventSnapshot(StrictModel):
    observed_at: datetime
    source: Literal["Microsoft Forms · Browser-Abgleich", "Microsoft Forms · aggregierter Import", "Events · aggregierter Import"]
    events: list[Event] = Field(max_length=500)

    @model_validator(mode="after")
    def unique(self):
        if self.observed_at.tzinfo is None:
            raise ValueError("Timestamp must include timezone")
        ids = [e.id for e in self.events]
        if len(ids) != len(set(ids)):
            raise ValueError("Duplicate event IDs")
        return self


def store_snapshot(db: Session, snapshot: EventSnapshot):
    existing = db.get(Preference, KEY)
    if existing:
        previous = EventSnapshot.model_validate(existing.value)
        if snapshot.observed_at < previous.observed_at:
            raise HTTPException(409, "Ein älterer Stand darf den vorhandenen nicht ersetzen.")
        existing.value = snapshot.model_dump(mode="json")
    else:
        db.add(Preference(key=KEY, value=snapshot.model_dump(mode="json")))
    state = db.get(ChannelState, 'events') or ChannelState(channel='events')
    state.status = 'connected'
    state.message = 'Aggregierter Event-Datenstand vorhanden; Forms wird manuell aktualisiert.'
    state.last_success = snapshot.observed_at
    db.add(state)
    db.commit()


@router.get("")
def read_events(year: str = '', month: str = '', source: str = '', topic: str = '', status_filter: str = '', user=Depends(current_user), db=Depends(get_db)):
    from zoneinfo import ZoneInfo

    from .config import get_settings
    from .event_summary import event_view, summarize
    from .zoom_events import STATUS_KEY, configured
    status = db.get(Preference, STATUS_KEY)
    row = db.get(Preference, KEY)
    snapshot = EventSnapshot.model_validate(row.value) if row else None
    today = datetime.now(ZoneInfo('Europe/Zurich')).date()
    selected = [e for e in snapshot.events if (not year or (e.date and str(e.date).startswith(year)))
                and (not month or (e.date and str(e.date)[5:7] == month))
                and (not source or e.source == source) and (not topic or e.topic == topic)
                and (not status_filter or (e.date and (e.date >= today if status_filter == 'upcoming' else e.date < today)))] if snapshot else []
    return {
        "summary": summarize(snapshot, selected) if snapshot else None,
        "snapshot": {**snapshot.model_dump(mode="json"), "events": [event_view(e) for e in snapshot.events]} if snapshot else None,
        "automatic_sync": configured(get_settings()),
        "zoom": status.value if status else None,
        "notice": ("Zoom-Berichtsabruf eingerichtet; Forms bleibt ein manueller Datenstand."
                   if configured(get_settings()) else "Geprüfter Event-Datenstand. Automatische Synchronisierung ist noch nicht eingerichtet."),
    }


@router.put("/aggregate")
def import_events(snapshot: EventSnapshot, user=Depends(admin), db=Depends(get_db)):
    store_snapshot(db, snapshot)
    return {"events": len(snapshot.events), "observed_at": snapshot.observed_at}


@router.post("/zoom/refresh")
def refresh_zoom(user=Depends(admin), db=Depends(get_db)):
    from .config import get_settings
    from .zoom_events import sync
    return sync(db, get_settings())
