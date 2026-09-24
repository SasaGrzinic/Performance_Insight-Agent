import fixture from "./demo-fixture.json" with { type: "json" };
import type { Dashboard } from "./types";

export const STATIC_DEMO = import.meta.env?.VITE_STATIC_DEMO === "true";
export const asset = (path: string) =>
  (import.meta.env?.BASE_URL || "/") + path.replace(/^\//, "");
export function staticDemoResponse(path: string) {
  const url = new URL(path, "https://demo.invalid");
  if (url.pathname === "/config/public")
    return {
      demo_enabled: true,
      timezone: "Europe/Zurich",
      report_hour: 8,
      sync_interval_minutes: 60,
    };
  if (url.pathname === "/demo/analysis")
    return structuredClone(fixture.analysis);
  if (url.pathname === "/demo/dashboard") {
    const month =
      url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
    if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month))
      throw new Error("Ungültiger Demo-Monat.");
    const [year, m] = month.split("-").map(Number);
    const days = new Date(Date.UTC(year, m, 0)).getUTCDate();
    const previous = new Date(Date.UTC(year, m - 2, 1))
      .toISOString()
      .slice(0, 7);
    const d = structuredClone(fixture.dashboard) as unknown as Dashboard;
    d.month = month;
    d.comparison_month = previous;
    d.period_start = month + "-01";
    d.period_end = month + "-" + days;
    d.comparison_end =
      previous + "-" + new Date(Date.UTC(year, m - 1, 0)).getUTCDate();
    d.series = d.series
      .slice(0, days)
      .map((p) => ({
        ...p,
        date: month + "-" + String(p.day).padStart(2, "0"),
      }));
    for (const c of d.channels)
      for (const key of Object.keys(c.values)) {
        const ratio = c.previous[key] / c.values[key];
        c.values[key] = Math.round(
          d.series.reduce(
            (sum, p) => sum + Number(p[`${c.id}.${key}`] || 0),
            0,
          ),
        );
        c.previous[key] = Math.round(c.values[key] * ratio);
      }
    for (const k of d.kpis) {
      const c = d.channels.find((c) => c.id === k.channel)!;
      k.value = c.values[k.key];
      k.previous = c.previous[k.key];
      k.change = k.previous
        ? ((k.value - k.previous) / k.previous) * 100
        : null;
    }
    return d;
  }
  throw new Error(
    "Diese Funktion benötigt die geschützte Vollversion. Die öffentliche Demo verwendet ausschliesslich Beispieldaten.",
  );
}

export function demoCampaigns() {
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const start = new Date(today.getTime() - 364 * 86400000)
    .toISOString()
    .slice(0, 10);
  return {
    start,
    end,
    status: "demo",
    message: "Fiktive Kampagnen",
    last_success: null,
    campaigns: [
      {
        id: "demo-awareness",
        name: "Demo: Menschen hinter der Technologie",
        objective: "BRAND_AWARENESS",
        status: "COMPLETED",
        start,
        end,
        currency: "CHF",
        values: { impressions: 48000, clicks: 360, spend: 720, conversions: 0 },
        ctr: 0.75,
        cpc: 2,
        first_activity: start,
        last_activity: end,
      },
      {
        id: "demo-webinar",
        name: "Demo: Cloud-Wissen im Webinar",
        objective: "WEBSITE_VISIT",
        status: "ACTIVE",
        start,
        end: null,
        currency: "CHF",
        values: {
          impressions: 18000,
          clicks: 540,
          spend: 810,
          conversions: 18,
        },
        ctr: 3,
        cpc: 1.5,
        first_activity: start,
        last_activity: end,
      },
      {
        id: "demo-launch",
        name: "Demo: Gemeinsam digital weiterdenken",
        objective: "ENGAGEMENT",
        status: "DRAFT",
        start: null,
        end: null,
        currency: "CHF",
        values: {},
        ctr: null,
        cpc: null,
        first_activity: null,
        last_activity: null,
      },
    ],
  };
}
