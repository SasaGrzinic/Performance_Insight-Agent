type Series = {
  series: ({ day: number } & Record<string, string | number | null>)[];
};
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
