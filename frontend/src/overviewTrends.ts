import type { Channel } from "./types";
export function overviewTrends(channels: Channel[]) {
  const trends = channels.flatMap((c) => {
    const k = c.primary,
      v = c.values[k],
      p = c.previous[k];
    if (
      ![
        "sessions",
        "impressions",
        "unique_clicks",
        "views",
        "registrations",
        "scans",
        "conversions",
      ].includes(k) ||
      v == null ||
      p == null ||
      !Number.isFinite(v) ||
      !Number.isFinite(p) ||
      p <= 0 ||
      v === p
    )
      return [];
    return [{ c, k, v, p, change: ((v - p) / p) * 100, positive: v > p }];
  });
  const selected = [
    ...trends.filter((t) => t.positive).slice(0, 3),
    ...trends.filter((t) => !t.positive).slice(0, 1),
  ];
  for (const t of trends)
    if (selected.length < 4 && !selected.includes(t)) selected.push(t);
  return selected;
}
