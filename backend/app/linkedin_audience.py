"""Follower gains and observed follower counts, kept distinct from one another."""

from datetime import datetime, timedelta, timezone
from urllib.parse import quote

from sqlalchemy import delete, select

from .analytics import month_bounds, previous_month
from .connectors import ProviderError, linkedin_headers, linkedin_url, request, row
from .models import ChannelState, Metric, Preference, now

KEYS = ["followers_organic", "followers_paid", "followers_gained"]


def sync_audience(db, start, end, s):
    org = "urn:li:organization:" + s.linkedin_organization_id
    state = db.get(ChannelState, "linkedin_audience") or ChannelState(channel="linkedin_audience")
    try:
        headers = linkedin_headers(s)
        params = {
            "q": "organizationalEntity",
            "organizationalEntity": org,
            "timeIntervals": {
                "timeRange": {
                    "start": int(
                        datetime.combine(start, datetime.min.time(), timezone.utc).timestamp()
                        * 1000
                    ),
                    "end": int(
                        datetime.combine(
                            end + timedelta(days=1), datetime.min.time(), timezone.utc
                        ).timestamp()
                        * 1000
                    ),
                },
                "timeGranularityType": "DAY",
            },
        }
        data = request(
            "GET", linkedin_url("organizationalEntityFollowerStatistics", params), headers=headers
        ).json()
        rows = []
        for item in data.get("elements", []):
            day = datetime.fromtimestamp(item["timeRange"]["start"] / 1000, timezone.utc).date()
            if item.get("organizationalEntity") != org or not start <= day <= end:
                raise ProviderError(
                    "Follower-Daten gehören nicht zur angefragten Seite oder zum Zeitraum."
                )
            gains = item.get("followerGains", {})
            for raw, key in [
                ("organicFollowerGain", "followers_organic"),
                ("paidFollowerGain", "followers_paid"),
            ]:
                if raw in gains:
                    rows.append(
                        row("linkedin_organic", day, key, gains[raw], source=org + ":followers")
                    )
            if all(k in gains for k in ["organicFollowerGain", "paidFollowerGain"]):
                rows.append(
                    row(
                        "linkedin_organic",
                        day,
                        "followers_gained",
                        gains["organicFollowerGain"] + gains["paidFollowerGain"],
                        source=org + ":followers",
                    )
                )
        total = request(
            "GET",
            linkedin_url(
                "networkSizes/" + quote(org, safe=""), {"edgeType": "COMPANY_FOLLOWED_BY_MEMBER"}
            ),
            headers=headers,
        ).json()["firstDegreeSize"]
        if not isinstance(total, int) or total < 0:
            raise ProviderError("Ungültiger Follower-Bestand.")
        db.execute(
            delete(Metric).where(
                Metric.channel == "linkedin_organic",
                Metric.key.in_(KEYS),
                Metric.date >= str(start),
                Metric.date <= str(end),
            )
        )
        db.add_all([Metric(**r) for r in rows])
        key = "linkedin_audience:" + s.linkedin_organization_id
        history = db.get(Preference, key) or Preference(key=key, value={})
        stamp = now()
        history.value = {
            **(history.value or {}),
            stamp.date().isoformat(): {"value": total, "observed_at": stamp.isoformat()},
        }
        db.add(history)
        state.status = "connected"
        state.message = "Follower-Daten aktualisiert"
        state.last_success = stamp
        db.add(state)
        db.commit()
    except Exception as exc:
        db.rollback()
        state = db.get(ChannelState, "linkedin_audience") or ChannelState(
            channel="linkedin_audience"
        )
        state.status = "error"
        state.message = (
            str(exc)[:300]
            if isinstance(exc, ProviderError)
            else "Follower-Daten konnten nicht geladen werden."
        )
        db.add(state)
        db.commit()


def audience_response(db, month, s):
    months = [month]
    for _ in range(5):
        months.insert(0, previous_month(months[0]))
    rows = db.scalars(
        select(Metric).where(
            Metric.channel == "linkedin_organic",
            Metric.key.in_(KEYS),
            Metric.date >= months[0] + "-01",
            Metric.date <= str(month_bounds(month)[1]),
            Metric.source_id == "urn:li:organization:" + s.linkedin_organization_id + ":followers",
        )
    ).all()
    history = db.get(Preference, "linkedin_audience:" + s.linkedin_organization_id)
    snapshots = history.value if history else {}
    result = []
    for m in months:
        values = {}
        for key in KEYS:
            matching = [r.value for r in rows if r.date.startswith(m) and r.key == key]
            values[key] = sum(matching) if matching else None
        observed = sorted(day for day in snapshots if day.startswith(m))
        result.append(
            {
                "month": m,
                **values,
                "total": snapshots[observed[-1]]["value"] if observed else None,
                "observed_at": snapshots[observed[-1]]["observed_at"] if observed else None,
            }
        )
    state = db.get(ChannelState, "linkedin_audience")
    return {
        "months": result,
        "current": snapshots[sorted(snapshots)[-1]] if snapshots else None,
        "status": state.status if state else "not_synced",
        "message": state.message if state else "Bitte Daten aktualisieren.",
    }
