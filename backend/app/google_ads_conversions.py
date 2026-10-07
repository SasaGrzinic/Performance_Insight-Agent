"""Read-only, reconciled conversion breakdown for the confirmed Sonio account."""

import math

from .connectors import ProviderError

PREFIX = "customers/9325395786/conversionActions/"
# Verified 07.10.2026: GA4 file_download, not a contact form or generic page view.
DOWNLOAD_ID = PREFIX + "6872179612"


def breakdown(query, campaigns, start, end):
    definitions = {}
    for row in query(
        "SELECT conversion_action.resource_name, conversion_action.name, conversion_action.type, conversion_action.category FROM conversion_action"
    ):
        action = row["conversionAction"]
        key = action["resourceName"]
        if not key.startswith(PREFIX) or key in definitions:
            raise ProviderError("Conversion-Herkunft ist nicht eindeutig.")
        definitions[key] = action
    rows = query(
        f"SELECT campaign.id, segments.conversion_action, metrics.conversions, metrics.all_conversions FROM campaign WHERE segments.date BETWEEN '{start}' AND '{end}'"
    )
    result = {c["id"]: [] for c in campaigns}
    seen = set()
    for row in rows:
        cid = str(row["campaign"]["id"])
        key = row["segments"]["conversionAction"]
        if cid not in result or key not in definitions or (cid, key) in seen:
            raise ProviderError("Conversion-Aufschlüsselung ist unvollständig oder doppelt.")
        seen.add((cid, key))
        action = definitions[key]
        metric = row.get("metrics", {})
        values = [float(metric.get(k, 0)) for k in ("conversions", "allConversions")]
        if not all(math.isfinite(v) and v >= 0 for v in values):
            raise ProviderError("Ungültige Conversion-Zahlen.")
        group = (
            "forms"
            if action.get("type") == "LEAD_FORM_SUBMIT"
            else "downloads"
            if key == DOWNLOAD_ID and action.get("type") == "GOOGLE_ANALYTICS_4_CUSTOM"
            else "other"
        )
        result[cid].append(
            {
                "id": key,
                "name": action["name"],
                "group": group,
                "conversions": values[0],
                "all_conversions": values[1],
            }
        )
    for campaign in campaigns:
        total = sum(a["conversions"] for a in result[campaign["id"]])
        if not math.isclose(total, campaign["conversions"], rel_tol=1e-6, abs_tol=0.01):
            raise ProviderError(
                "Die Conversion-Aufschlüsselung stimmt noch nicht mit der Kampagnensumme überein."
            )
    return result
