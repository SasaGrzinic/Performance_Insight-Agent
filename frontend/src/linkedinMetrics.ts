import type { Dashboard } from "./types";
export const finite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
export function completeSum(values: unknown[]): number | undefined {
  return values.length && values.every(finite)
    ? (values as number[]).reduce((a, b) => a + b, 0)
    : undefined;
}
export function engagement(values: Record<string, number | undefined>) {
  const interactions = completeSum(
    ["clicks", "likes", "comments", "shares"].map((k) => values[k]),
  );
  return finite(values.impressions) &&
    values.impressions > 0 &&
    interactions !== undefined
    ? (interactions / values.impressions) * 100
    : undefined;
}
export function yearMonths(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")!.value,
    month = Number(parts.find((p) => p.type === "month")!.value);
  return Array.from(
    { length: month },
    (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`,
  );
}
export function aggregateLinkedIn(data: (Dashboard | undefined)[]) {
  const keys = [
    "impressions",
    "clicks",
    "likes",
    "comments",
    "shares",
    "followers_organic",
  ];
  return Object.fromEntries(
    keys.map((key) => [
      key,
      completeSum(
        data.map(
          (d) =>
            d?.channels.find((c) => c.id === "linkedin_organic")?.values[key],
        ),
      ),
    ]),
  );
}

/** Missing values and zero baselines never imply a percentage change. */
export function metricTrend(current: unknown, previous: unknown, points = false): {value?: number; direction: "up" | "down" | "flat"; label: string} {
  if (!finite(current) || !finite(previous)) return {direction: "flat", label: "Kein Vergleich verfügbar"};
  if (!points && previous === 0) return current === 0
    ? {value: 0, direction: "flat", label: "Unverändert gegenüber null im Vormonat."}
    : {direction: "flat", label: "Vorperiode: 0; Prozentänderung nicht berechenbar"};
  const value = points ? current - previous : (current - previous) / previous * 100;
  return {value, direction: value > 0 ? "up" : value < 0 ? "down" : "flat", label: points ? "Differenz in Prozentpunkten." : "Relative Veränderung gegenüber dem Vormonat."};
}
