"""Separate paid and organic search reports; no campaign mutations."""

from datetime import datetime, timezone

from .connectors import ProviderError, google_token, request, require


def fetch(s, start, end, source):
    if source == "organic":
        require(s.gsc_refresh_token)
        headers = {"Authorization": "Bearer " + google_token(s, s.gsc_refresh_token)}
        url = "https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Asonio.com/searchAnalytics/query"

        def query(dimensions):
            rows = []
            while True:
                batch = (
                    request(
                        "POST",
                        url,
                        headers=headers,
                        json={
                            "startDate": str(start),
                            "endDate": str(end),
                            "type": "web",
                            "dataState": "final",
                            "dimensions": dimensions,
                            "rowLimit": 25000,
                            "startRow": len(rows),
                        },
                    )
                    .json()
                    .get("rows", [])
                )
                rows.extend(batch)
                if len(batch) < 25000:
                    return rows

        totals = query([])
        terms = query(["query"])
        pages = query(["query", "page"])
        by_term = {}
        for r in pages:
            by_term.setdefault(r["keys"][0], []).append(
                {"url": r["keys"][1], "clicks": r["clicks"]}
            )
        rows = [
            {
                "term": r["keys"][0],
                "clicks": r["clicks"],
                "impressions": r["impressions"],
                "ctr": r["ctr"] * 100,
                "position": r["position"],
                "pages": sorted(by_term.get(r["keys"][0], []), key=lambda x: -x["clicks"])[:3],
            }
            for r in terms
        ]
        return {
            "rows": rows,
            "totals": totals[0] if totals else None,
            "notice": "Finale Websuche-Daten. Google liefert nicht alle Suchanfragen (Datenschutz und interne Berichtslimits). Suchbegriffssummen können von Property-Summen abweichen. Zeitbezug: Pacific Time.",
            "start": str(start),
            "end": str(end),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    require(s.google_ads_refresh_token)
    if s.google_ads_customer_id.replace("-", "") != "9325395786":
        raise ProviderError("Unerwartetes Werbekonto")
    headers = {"Authorization": "Bearer " + google_token(s, s.google_ads_refresh_token)}
    if s.google_ads_developer_token:
        headers["developer-token"] = s.google_ads_developer_token
    if s.google_ads_login_customer_id:
        headers["login-customer-id"] = s.google_ads_login_customer_id.replace("-", "")
    field = (
        "campaign_search_term_view.search_term"
        if source == "paid"
        else "ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type"
    )
    resource = "campaign_search_term_view" if source == "paid" else "keyword_view"
    q = f"SELECT campaign.id, campaign.name, campaign.advertising_channel_type, customer.currency_code, {field}, metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.conversions FROM {resource} WHERE segments.date BETWEEN '{start}' AND '{end}'"
    batches = request(
        "POST",
        f"https://googleads.googleapis.com/{s.google_ads_api_version}/customers/9325395786/googleAds:searchStream",
        headers=headers,
        json={"query": q},
    ).json()
    rows = []
    for batch in batches:
        for r in batch.get("results", []):
            m = r.get("metrics", {})
            imp = int(m.get("impressions", 0))
            clicks = int(m.get("clicks", 0))
            if not imp and not clicks:
                continue
            keyword = r.get("adGroupCriterion", {}).get("keyword", {})
            rows.append(
                {
                    "term": r["campaignSearchTermView"]["searchTerm"]
                    if source == "paid"
                    else keyword["text"],
                    "match": keyword.get("matchType"),
                    "campaign": r["campaign"]["name"],
                    "type": r["campaign"]["advertisingChannelType"],
                    "currency": r["customer"]["currencyCode"],
                    "clicks": clicks,
                    "impressions": imp,
                    "ctr": clicks / imp * 100 if imp else None,
                    "spend": int(m.get("costMicros", 0)) / 1e6,
                    "conversions": float(m.get("conversions", 0)),
                }
            )
    return {
        "rows": rows,
        "totals": None,
        "notice": "Nur von Google bereitgestellte Berichtszeilen. Verdeckte Suchbegriffe fehlen; Anteile beziehen sich auf die gefilterten Zeilen, nicht das gesamte Werbebudget. Performance Max wird separat gekennzeichnet. Zielaktionen sind nicht automatisch Leads. Zeitbezug: Ads-Konto.",
        "start": str(start),
        "end": str(end),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
