"""Read-only campaign report. No writes to Google Ads or account totals."""

from datetime import datetime, timezone

from .connectors import google_token, number_id, request, require


def fetch(s, start, end):
    require(s.google_ads_refresh_token, s.google_ads_customer_id)
    customer = number_id(s.google_ads_customer_id)
    if customer != "9325395786":
        raise ValueError("Unexpected advertising account")
    headers = {"Authorization": "Bearer " + google_token(s, s.google_ads_refresh_token)}
    if s.google_ads_developer_token:
        headers["developer-token"] = s.google_ads_developer_token
    if s.google_ads_login_customer_id:
        headers["login-customer-id"] = number_id(s.google_ads_login_customer_id)

    def query(q):
        batches = request(
            "POST",
            f"https://googleads.googleapis.com/{s.google_ads_api_version}/customers/{customer}/googleAds:searchStream",
            headers=headers,
            json={"query": q},
        ).json()
        return [r for batch in batches for r in batch.get("results", [])]

    rows = query(
        f"SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, customer.currency_code, metrics.impressions, metrics.clicks, metrics.conversions, metrics.cost_micros, metrics.conversions_from_interactions_rate FROM campaign WHERE segments.date BETWEEN '{start}' AND '{end}'"
    )
    campaigns = []
    for row in rows:
        c, m = row["campaign"], row.get("metrics", {})
        # Google Ads protobuf omits zero-valued numeric fields in returned metric rows.
        clicks, impressions = int(m.get("clicks", 0)), int(m.get("impressions", 0))
        spend, conversions = float(m.get("costMicros", 0)) / 1e6, float(m.get("conversions", 0))
        campaigns.append(
            {
                "id": str(c["id"]),
                "name": c["name"],
                "type": c["advertisingChannelType"],
                "status": c["status"],
                "currency": row["customer"]["currencyCode"],
                "impressions": impressions,
                "clicks": clicks,
                "spend": spend,
                "conversions": conversions,
                "ctr": clicks / impressions * 100 if impressions else None,
                "cpc": spend / clicks if clicks else None,
                "cpa": spend / conversions if conversions else None,
                "conversion_rate": float(m.get("conversionsFromInteractionsRate", 0)) * 100
                if impressions
                else None,
                "creatives": [],
            }
        )
    warning = None
    import httpx

    from .connectors import ProviderError

    try:
        assets = {
            r["asset"]["resourceName"]: r["asset"]
            .get("imageAsset", {})
            .get("fullSize", {})
            .get("url")
            for r in query(
                "SELECT asset.resource_name, asset.image_asset.full_size.url FROM asset WHERE asset.type = 'IMAGE'"
            )
        }
        ads = query(
            "SELECT campaign.id, ad_group_ad.ad.id, ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.ad.responsive_search_ad.descriptions, ad_group_ad.ad.responsive_display_ad.marketing_images, ad_group_ad.ad.responsive_display_ad.headlines, ad_group_ad.ad.responsive_display_ad.descriptions FROM ad_group_ad WHERE ad_group_ad.status != 'REMOVED'"
        )
        by_id = {c["id"]: c for c in campaigns}
        for r in ads:
            c = by_id.get(str(r["campaign"]["id"]))
            if c is None:
                continue
            ad = r["adGroupAd"]["ad"]
            content = ad.get("responsiveSearchAd") or ad.get("responsiveDisplayAd") or {}
            images = [assets.get(a.get("asset")) for a in content.get("marketingImages", [])]
            image = next((u for u in images if u and u.startswith("https://")), None)
            titles = [v["text"] for v in content.get("headlines", [])]
            if image or titles:
                c["creatives"].append(
                    {
                        "id": str(ad["id"]),
                        "image": image,
                        "title": " | ".join(titles[:3]),
                        "description": " ".join(
                            v["text"] for v in content.get("descriptions", [])[:2]
                        ),
                    }
                )
        groups = query(
            "SELECT campaign.id, asset_group.id, asset_group.name, asset.resource_name, asset.text_asset.text, asset_group_asset.field_type FROM asset_group_asset WHERE asset_group_asset.field_type IN ('MARKETING_IMAGE', 'SQUARE_MARKETING_IMAGE', 'HEADLINE', 'DESCRIPTION')"
        )
        grouped = {}
        for r in groups:
            cid = str(r["campaign"]["id"])
            if cid not in by_id:
                continue
            group = r["assetGroup"]
            item = grouped.setdefault(
                (cid, str(group["id"])),
                {"id": str(group["id"]), "title": group["name"], "description": "", "image": None},
            )
            a = r.get("asset", {})
            image = assets.get(a.get("resourceName"))
            if image and image.startswith("https://") and not item["image"]:
                item["image"] = image
            if r["assetGroupAsset"]["fieldType"] == "DESCRIPTION":
                item["description"] = a.get("textAsset", {}).get("text", "")
        for (cid, _), item in grouped.items():
            by_id[cid]["creatives"].append(item)
    except (ProviderError, httpx.HTTPError):
        warning = "Anzeigenmotive konnten nicht geladen werden. Kampagnenkennzahlen sind verfügbar."
    return {
        "campaigns": campaigns,
        "start": str(start),
        "end": str(end),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "warning": warning,
    }
