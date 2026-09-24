type Series = {
  series: ({ day: number } & Record<string, string | number | null>)[];
};

export function multiMetricSeries(
  months: string[],
  datasets: (Series | undefined)[],
  channel: string,
  metrics: string[],
) {
  const aligned = metrics.map((metric) =>
    comparisonSeries(months, datasets, `${channel}.${metric}`),
  );
  return (aligned[0] || []).map((point, i) =>
    Object.fromEntries([
      ["day", point.day],
      ...metrics.flatMap((metric, j) =>
        months.map((month) => [`${month}|${metric}`, aligned[j][i][month]]),
      ),
    ]),
  );
}

/** Scale each complete month/metric line independently; never fill missing observations. */
export function relativeSeries(
  points: Record<string, unknown>[],
  keys: string[],
) {
  const maxima = Object.fromEntries(
    keys.map((key) => [
      key,
      Math.max(
        0,
        ...points.map((p) =>
          typeof p[key] === "number" ? (p[key] as number) : 0,
        ),
      ),
    ]),
  );
  return points.map((p) =>
    Object.fromEntries([
      ["day", p.day],
      ...keys.map((key) => [
        key,
        typeof p[key] === "number"
          ? maxima[key]
            ? ((p[key] as number) / maxima[key]) * 100
            : 0
          : null,
      ]),
    ]),
  );
}
export function comparisonSeries(
  months: string[],
  datasets: (Series | undefined)[],
  key: string,
) {
  const days = Math.max(
    0,
    ...datasets.flatMap((d) => d?.series.map((p) => p.day) || []),
  );
  return Array.from({ length: days }, (_, index) =>
    Object.fromEntries([
      ["day", index + 1],
      ...months.map((month, i) => [
        month,
        datasets[i]?.series.find((p) => p.day === index + 1)?.[key] ?? null,
      ]),
    ]),
  );
}

export function shiftMonth(month: string, step: number) {
  const date = new Date(month + "-01T12:00:00Z");
  date.setUTCMonth(date.getUTCMonth() + step);
  return date.toISOString().slice(0, 7);
}

export function averageWatchSeconds(
  metrics: Record<string, number>,
): number | undefined {
  const views = metrics.video_views,
    time = metrics.watch_time_ms;
  return Number.isFinite(views) &&
    views > 0 &&
    Number.isFinite(time) &&
    time >= 0
    ? time / views / 1000
    : undefined;
}

export function postsOnDay<T extends { published_at: string }>(
  posts: T[],
  month: string,
  day: number,
): T[] {
  const date = `${month}-${String(day).padStart(2, "0")}`;
  return posts.filter((post) => post.published_at.slice(0, 10) === date);
}

/** Normalize LinkedIn's mathematical display alphabets for legible UI titles. */
export function readablePostTitle(title: string): string {
  return title.replace(/[\u{1D400}-\u{1D7FF}]/gu, (letter) =>
    letter.normalize("NFKC"),
  );
}

export function currentReportingMonth(
  date = new Date(),
  timeZone = "Europe/Zurich",
): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  return `${parts.find((p) => p.type === "year")!.value}-${parts.find((p) => p.type === "month")!.value}`;
}
