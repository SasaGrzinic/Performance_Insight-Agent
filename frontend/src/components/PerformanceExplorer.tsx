import { KpiExplainer } from "./KpiExplainer";
import {
  multiMetricSeries,
  relativeSeries,
  averageWatchSeconds,
  postsOnDay,
  readablePostTitle,
} from "../comparison";
import { useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Play,
  Plus,
  X,
} from "lucide-react";
import { api, monthName, number } from "../api";
import type { Dashboard } from "../types";
import { ChannelIcon, Empty, Loading } from "./ui";

const colors = [
  "#0075d9",
  "#ae5421",
  "#23846b",
  "#8854ac",
  "#bb3f67",
  "#546481",
  "#087d8b",
  "#75680a",
];
const displayUnit = (unit?: string) =>
  !unit || unit === "count"
    ? ""
    : unit === "minutes"
      ? "Min."
      : unit === "seconds"
        ? "Sek."
        : unit;
const dashes = [undefined, "8 4", "3 4", "10 3 2 3"];
export type Post = {
  id: string;
  title: string;
  text: string;
  kind: string;
  published_at: string;
  updated_at: string;
  url: string;
  metrics: Record<string, number>;
  video_status: string;
  image_url?: string | null;
};
export type PostsResponse = {
  month: string;
  status: string;
  message: string;
  last_success: string | null;
  posts: Post[];
};
export const postMetricLabels: Record<string, string> = {
  impressions: "Impressionen",
  clicks: "LinkedIn-Klicks",
  likes: "Likes",
  comments: "Kommentare",
  shares: "Reposts",
  video_views: "Videoaufrufe",
  video_viewers: "Zuschauende",
  watch_time_ms: "Wiedergabezeit",
  average_watch_seconds: "Ø Betrachtungsdauer",
};
const types: Record<string, string> = {
  video: "Video",
  image: "Bild",
  article: "Link-Beitrag",
  text: "Text",
};
const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
function metricValue(value: number | undefined, key: string) {
  if (value == null) return "—";
  if (key === "average_watch_seconds") return `${number(value)} Sek.`;
  return key === "watch_time_ms"
    ? `${number(value / 60000)} Min.`
    : number(value);
}

function PostImage({ post }: { post: Pick<Post, "image_url"> }) {
  const [failed, setFailed] = useState(false);
  return post.image_url && !failed ? (
    <img
      className="post-main-image"
      src={post.image_url}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  ) : (
    <span className="post-image-unavailable">Kein Hauptbild verfügbar</span>
  );
}

export function PostCollection({
  month,
  demo,
  highlight = "impressions",
  day,
  videosOnly = false,
}: {
  month: string;
  demo: boolean;
  highlight?: string;
  day?: number | null;
  videosOnly?: boolean;
}) {
  const [filter, setFilter] = useState(videosOnly ? "video" : "all");
  const [sort, setSort] = useState("date");
  const [expanded, setExpanded] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["linkedin-posts", demo, month],
    queryFn: () => api<PostsResponse>(`/linkedin/posts?month=${month}`),
    enabled: !demo,
    refetchInterval: 60000,
  });
  if (demo)
    return (
      <section className="panel post-section">
        <h2>{videosOnly ? "LinkedIn Videos" : "LinkedIn Posts & Videos"}</h2>
        <p>
          Beitragsdetails werden nur aus der verbundenen Unternehmensseite
          geladen. Diese Demo enthält keine echten Posts.
        </p>
      </section>
    );
  const posts = (q.data?.posts || [])
    .map((p) => ({
      ...p,
      metrics: {
        ...p.metrics,
        average_watch_seconds: averageWatchSeconds(p.metrics),
      } as Record<string, number | undefined>,
    }))
    .filter(
      (p) =>
        (videosOnly
          ? p.kind === "video"
          : filter === "all" || p.kind === filter) &&
        (!day || Number(p.published_at.slice(8, 10)) === day),
    )
    .sort((a, b) =>
      sort === "date"
        ? a.published_at.localeCompare(b.published_at)
        : (b.metrics[sort] ?? -Infinity) - (a.metrics[sort] ?? -Infinity),
    );
  const videoCount =
    q.data?.posts.filter((p) => p.kind === "video").length || 0;
  return (
    <section className="panel post-section">
      <div className="panel-heading">
        <div>
          <h2>{videosOnly ? "LinkedIn Videos" : "LinkedIn Posts & Videos"}</h2>
          <p>
            Veröffentlicht {day ? `am ${day}.` : "im"} {monthName(month)} ·
            Sonio-Unternehmensseite
          </p>
        </div>
        <span className="post-count">
          {posts.length} von {q.data?.posts.length ?? "—"} Beiträgen ·{" "}
          {videoCount} {videoCount === 1 ? "Video" : "Videos"} im Monat
        </span>
      </div>
      <div className="post-controls">
        {!videosOnly && (
          <div
            className="channel-tabs"
            role="group"
            aria-label="Beitragsformat"
          >
            <button
              aria-pressed={filter === "all"}
              className={filter === "all" ? "selected" : ""}
              onClick={() => setFilter("all")}
            >
              Alle Posts
            </button>
            <button
              aria-pressed={filter === "video"}
              className={filter === "video" ? "selected" : ""}
              onClick={() => setFilter("video")}
            >
              <Play size={14} /> Videos ({videoCount})
            </button>
            <button
              aria-pressed={filter === "article"}
              className={filter === "article" ? "selected" : ""}
              onClick={() => setFilter("article")}
            >
              Link-Beiträge
            </button>
          </div>
        )}
        <label>
          Sortieren nach
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date">Datum aufsteigend</option>
            {Object.entries(postMetricLabels)
              .filter(([key]) => key !== "video_viewers")
              .map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>
        </label>
      </div>
      <p className="data-explanation">
        Die Karten zeigen Gesamtwerte seit Veröffentlichung, Stand des letzten
        Abrufs. Sie sind keine Tages- oder Monatswerte. LinkedIn-Klicks sind
        nicht mit Website-Besuchen gleichzusetzen.
      </p>
      <KpiExplainer channel="linkedin_organic" fields={postMetricLabels} />
      {filter === "video" && (
        <p className="data-explanation">
          Videoaufrufe zählen Wiedergaben ab 3 Sekunden. Die Wiedergabezeit
          bezieht sich auf diese Aufrufe. Fehlende oder nicht mehr verfügbare
          Werte erscheinen als „—“. Ø Betrachtungsdauer = Wiedergabezeit ÷
          Videoaufrufe (ab 3 Sekunden), nicht pro Person.
        </p>
      )}
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <div role="alert">
          <p>Beiträge konnten nicht geladen werden: {q.error.message}</p>
          <button className="button" onClick={() => q.refetch()}>
            Erneut laden
          </button>
        </div>
      ) : (
        <>
          {q.data?.status !== "connected" && (
            <p className="form-error" role="status">
              {q.data?.message?.includes("429")
                ? "LinkedIn begrenzt derzeit die Abfragen. Die zuletzt geladenen Beiträge bleiben sichtbar."
                : `${q.data?.message || "Verbindung vorübergehend eingeschränkt."} Bereits geladene Beiträge bleiben sichtbar.`}
              {q.data?.last_success &&
                ` Letzter erfolgreicher Abruf: ${dateLabel(q.data.last_success)}.`}
            </p>
          )}
          {!posts.length ? (
            <Empty title="Keine Beiträge für diese Auswahl">
              Wähle einen anderen Monat oder ein anderes Beitragsformat. Bei
              noch fehlenden Daten verwende „Daten aktualisieren“.
            </Empty>
          ) : (
            <div className="post-grid">
              {posts.map((p) => (
                <article
                  className={`post-card ${p.kind === "video" ? "video-post" : ""}`}
                  key={p.id}
                >
                  <div className="post-meta">
                    <span>
                      {p.kind === "video" && <Play size={14} />}{" "}
                      {types[p.kind] || "Beitrag"}
                    </span>
                    <time dateTime={p.published_at}>
                      {dateLabel(p.published_at)}
                    </time>
                  </div>
                  <PostImage post={p} />
                  <h3>
                    <button
                      className="post-title"
                      aria-expanded={expanded === p.id}
                      onClick={() =>
                        setExpanded(expanded === p.id ? null : p.id)
                      }
                    >
                      {readablePostTitle(p.title)}
                    </button>
                  </h3>
                  {expanded === p.id && <p className="post-copy">{p.text}</p>}
                  <dl className="post-metrics">
                    {Object.entries(postMetricLabels)
                      .filter(
                        ([key]) =>
                          p.kind === "video" ||
                          (!key.startsWith("video_") &&
                            key !== "watch_time_ms" &&
                            key !== "average_watch_seconds"),
                      )
                      .map(([key, label]) => (
                        <div
                          className={
                            key === highlight ||
                            (filter === "video" && key === "video_views")
                              ? "metric-emphasis"
                              : ""
                          }
                          key={key}
                        >
                          <dt>{label}</dt>
                          <dd>{metricValue(p.metrics[key], key)}</dd>
                        </div>
                      ))}
                  </dl>
                  {p.kind === "video" && p.video_status !== "available" && (
                    <p className="post-note">
                      Video-Kennzahlen sind teilweise nicht verfügbar. LinkedIn
                      begrenzt den Abruf bestimmter Werte auf sechs Monate.
                    </p>
                  )}
                  <footer>
                    <span>Stand {dateLabel(p.updated_at)}</span>
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      Post ansehen <ExternalLink size={13} />
                    </a>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function PerformanceExplorer({
  data,
  channel,
  demo,
  showPosts = true,
  onOpenPosts,
  onMonth,
}: {
  data: Dashboard;
  channel: string;
  demo: boolean;
  showPosts?: boolean;
  onOpenPosts?: () => void;
  onMonth?: (month: string) => void;
}) {
  const c = data.channels.find((c) => c.id === channel) || data.channels[0];
  const [selectedMetrics, setMetrics] = useState<string[]>([]);
  const validMetrics = selectedMetrics.filter((key) => c.fields[key]);
  const metrics = validMetrics.length ? validMetrics : [c.primary];
  const metric = metrics[0];
  const [scale, setScale] = useState("absolute");
  const metricColor = (key: string) =>
    colors[Object.keys(c.fields).indexOf(key) % colors.length];
  const metricLabel = (key: string) =>
    c.id === "linkedin_organic" && key === "clicks"
      ? "LinkedIn-Klicks"
      : c.fields[key];
  const metricUnit = (key: string) => displayUnit(c.units[key]) || "Anzahl";
  const units = [...new Set(metrics.map(metricUnit))];
  const [comparisons, setComparisons] = useState<string[]>([]);
  const [candidate, setCandidate] = useState(data.comparison_month);
  const [day, setDay] = useState<number | null>(null);
  const [postMonth, setPostMonth] = useState(data.month);
  const months = [data.month, ...comparisons.filter((m) => m !== data.month).slice(0, 3)];
  const queries = useQueries({
    queries: months.slice(1).map((month) => ({
      queryKey: ["dashboard", demo, month],
      queryFn: () =>
        api<Dashboard>(`${demo ? "/demo" : ""}/dashboard?month=${month}`),
      refetchInterval: 60000,
    })),
  });
  const postQueries = useQueries({
    queries: months.map((month) => ({
      queryKey: ["linkedin-posts", demo, month],
      queryFn: () => api<PostsResponse>(`/linkedin/posts?month=${month}`),
      enabled: !demo && c.id === "linkedin_organic",
      refetchInterval: 60000,
    })),
  });
  const datasets = [data, ...queries.map((q) => q.data)];
  const points = multiMetricSeries(months, datasets, c.id, metrics);
  const lineKeys = months.flatMap((m) => metrics.map((key) => `${m}|${key}`));
  const chartPoints =
    scale === "relative" ? relativeSeries(points, lineKeys) : points;
  const hasData = points.some((p) => lineKeys.some((key) => p[key] != null));
  const activePostMonth = months.includes(postMonth) ? postMonth : data.month;
  const activePostQuery = postQueries[months.indexOf(activePostMonth)];
  const monthPosts = activePostQuery?.data?.posts || [];
  const publicationDays = [
    ...new Set(monthPosts.map((p) => Number(p.published_at.slice(8, 10)))),
  ].sort((a, b) => a - b);
  const activePosts = day ? postsOnDay(monthPosts, activePostMonth, day) : [];
  const activePoint = points.find((p) => p.day === day);

  return (
    <div className="performance-explorer">
      <section className="panel performance-panel">
        <div className="panel-heading">
          <div>
            <h2>Performance im Vergleich</h2>
            <p>
              Vergleiche Kennzahlen und Monate. Wähle einen Tag für die
              Beitragsdetails.
            </p>
          </div>
        </div>
        <div className="performance-body">
          <div className="channel-context">
            <ChannelIcon id={c.id} size={28} />
            <div>
              <strong>{c.name}</strong>
              <span>Sonio AG</span>
            </div>
          </div>
          <div className="explorer-controls">
            {onMonth && (
              <label>
                Basismonat
                <input
                  type="month"
                  aria-label="Basismonat"
                  value={data.month}
                  onChange={(e) => {
                    if (/^20\d{2}-(0[1-9]|1[0-2])$/.test(e.target.value)) {
                      onMonth(e.target.value);
                      setDay(null);
                    }
                  }}
                />
              </label>
            )}
            <label>
              Darstellung
              <select
                aria-label="Skalierung im Verlauf"
                value={scale}
                onChange={(e) => setScale(e.target.value)}
              >
                <option value="absolute">Absolute Werte</option>
                <option value="relative">Verlauf relativ zum Höchstwert</option>
              </select>
            </label>
            <details
              className="month-dropdown"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector("summary")?.focus();
                }
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  event.currentTarget.open = false;
              }}
            >
              <summary>
                Monate vergleichen <span>{months.length} ausgewählt</span>
                <ChevronDown size={16} />
              </summary>
              <div className="month-dropdown-panel">
                <fieldset className="month-multiselect">
                  <legend>Bis zu 4 Monate auswählen</legend>
                  <div>
                    {Array.from({ length: 6 }, (_, i) => {
                      const [y, m] = data.month.split("-").map(Number);
                      return new Date(Date.UTC(y, m - 1 - i, 1))
                        .toISOString()
                        .slice(0, 7);
                    }).map((m) => (
                      <label key={m}>
                        <input
                          type="checkbox"
                          checked={months.includes(m)}
                          disabled={
                            m === data.month ||
                            (!months.includes(m) && months.length >= 4)
                          }
                          onChange={() =>
                            setComparisons(
                              months.includes(m)
                                ? comparisons.filter((x) => x !== m)
                                : [...comparisons, m],
                            )
                          }
                        />
                        {monthName(m)}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="month-custom">
                  <label>
                    Weiteren Monat auswählen
                    <input
                      type="month"
                      value={candidate}
                      max={new Date().toISOString().slice(0, 7)}
                      onChange={(e) => setCandidate(e.target.value)}
                    />
                  </label>
                  <button
                    className="button compare-add"
                    disabled={
                      !/^\d{4}-\d{2}$/.test(candidate) ||
                      months.includes(candidate) ||
                      months.length >= 4
                    }
                    onClick={() => setComparisons([...comparisons, candidate])}
                  >
                    <Plus size={15} /> Monat hinzufügen
                  </button>
                </div>
              </div>
            </details>
          </div>
          <fieldset className="metric-picker">
            <legend>
              Kennzahlen gemeinsam anzeigen <span>Bis zu 4 auswählen</span>
            </legend>
            <div>
              {Object.keys(c.fields).map((key) => (
                <label
                  key={key}
                  className={metrics.includes(key) ? "is-selected" : ""}
                >
                  <input
                    type="checkbox"
                    checked={metrics.includes(key)}
                    disabled={
                      metrics.includes(key)
                        ? metrics.length === 1
                        : metrics.length >= 4
                    }
                    onChange={() =>
                      setMetrics(
                        metrics.includes(key)
                          ? metrics.filter((m) => m !== key)
                          : [...metrics, key],
                      )
                    }
                  />
                  <i style={{ background: metricColor(key) }} />
                  {metricLabel(key)}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="month-legend">
            {months.map((m, i) => (
              <span key={m}>
                <svg width="30" height="12" aria-hidden="true">
                  <line
                    x1="0"
                    x2="30"
                    y1="6"
                    y2="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={dashes[i]}
                  />
                </svg>
                {monthName(m)}
                {i > 0 && (
                  <button
                    className="icon-button"
                    aria-label={`${monthName(m)} aus Vergleich entfernen`}
                    onClick={() =>
                      setComparisons(comparisons.filter((v) => v !== m))
                    }
                  >
                    <X size={13} />
                  </button>
                )}
              </span>
            ))}
          </div>
          {metric === "website_clicks" ? (
            <Empty title="Website-Klicks werden nicht separat geliefert">
              Die LinkedIn-Schnittstelle liefert allgemeine Klicks. Für
              tatsächliche Website-Besuche braucht es verknüpfte UTM-Links und
              Webanalyse-Daten.
            </Empty>
          ) : (
            <>
              {queries.some((q) => q.isPending) && (
                <p role="status">Vergleichsmonate werden geladen …</p>
              )}
              {queries.some((q) => q.isError) && (
                <p className="form-error" role="alert">
                  Ein Vergleichsmonat konnte nicht geladen werden.{" "}
                  <button
                    onClick={() =>
                      queries.forEach((q) => q.isError && q.refetch())
                    }
                  >
                    Erneut laden
                  </button>
                </p>
              )}
              <div className="chart-container">
                {!hasData ? (
                  <Empty title="Keine Tageswerte für diese Auswahl">
                    Wähle eine andere Kennzahl oder aktualisiere die Daten des
                    gewählten Monats.
                  </Empty>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartPoints}
                      margin={{ top: 15, right: 15, bottom: 5, left: -10 }}
                      onClick={(state) => {
                        if (state?.activeLabel)
                          setDay(Number(state.activeLabel));
                      }}
                    >
                      <CartesianGrid stroke="#e6eaf0" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        minTickGap={25}
                        tickFormatter={(v) => `${v}.`}
                      />
                      {(scale === "relative"
                        ? ["% des Höchstwerts"]
                        : units
                      ).map((unit, i) => (
                        <YAxis
                          key={unit}
                          yAxisId={i}
                          orientation={i ? "right" : "left"}
                          width={62}
                          tickLine={false}
                          axisLine={false}
                          domain={scale === "relative" ? [0, 100] : [0, "auto"]}
                          tickFormatter={(v) =>
                            scale === "relative" ? `${number(v)}%` : number(v)
                          }
                        />
                      ))}
                      <Tooltip
                        content={({ active, label }) => {
                          if (!active || label == null) return null;
                          const hoveredDay = Number(label);
                          const point = points.find(
                            (p) => p.day === hoveredDay,
                          );
                          if (
                            !demo && c.id === "linkedin_organic" &&
                            !postQueries.some(q => q.isPending || q.isError) &&
                            !months.some(
                              (m, i) =>
                                postsOnDay(
                                  postQueries[i].data?.posts || [],
                                  m,
                                  hoveredDay,
                                ).length,
                            )
                          )
                            return null;
                          return (
                            <div className="performance-tooltip" role="status">
                              {months.map((month, i) => {
                                const q = postQueries[i];
                                const posts = postsOnDay(
                                  q.data?.posts || [],
                                  month,
                                  hoveredDay,
                                );
                                if (
                                  !demo && c.id === "linkedin_organic" &&
                                  !q.isPending && !q.isError && !posts.length
                                )
                                  return null;
                                return (
                                  <section key={month}>
                                    <div className="tooltip-heading">
                                      <span>
                                        {hoveredDay}. {monthName(month)}
                                      </span>
                                    </div>
                                    {(demo || c.id !== "linkedin_organic") &&
                                      metrics.map((key) => (
                                        <div
                                          className="tooltip-metric"
                                          key={key}
                                        >
                                          <span>
                                            <i
                                              style={{
                                                background: metricColor(key),
                                              }}
                                            />
                                            {metricLabel(key)}
                                          </span>
                                          <strong>
                                            {number(
                                              point?.[`${month}|${key}`] as
                                                number | undefined,
                                              c.units[key],
                                            )}
                                            {displayUnit(c.units[key])
                                              ? ` ${displayUnit(c.units[key])}`
                                              : ""}
                                          </strong>
                                        </div>
                                      ))}
                                    {!demo &&
                                      c.id === "linkedin_organic" &&
                                      (q.isPending ? (
                                        <p>Beiträge werden geladen …</p>
                                      ) : q.isError ? (
                                        <p>
                                          Beiträge konnten nicht geladen werden.
                                        </p>
                                      ) : (
                                        posts.map((post) => (
                                          <div
                                            className="tooltip-post-title"
                                            key={post.id}
                                          >
                                            <PostImage post={post} />
                                            <div>
                                              <strong>{readablePostTitle(post.title)}</strong>
                                              <dl className="tooltip-post-metrics">
                                                <div><dt>Impressionen</dt><dd>{metricValue(post.metrics.impressions, "impressions")}</dd></div>
                                                <div><dt>Klicks</dt><dd>{metricValue(post.metrics.clicks, "clicks")}</dd></div>
                                              </dl>
                                              <small>Seit Veröffentlichung</small>
                                            </div>
                                          </div>
                                        ))
                                      ))}
                                  </section>
                                );
                              })}
                            </div>
                          );
                        }}
                      />
                      {!demo &&
                        c.id === "linkedin_organic" &&
                        [
                          ...new Set(
                            postQueries.flatMap((q) =>
                              (q.data?.posts || []).map((p) =>
                                Number(p.published_at.slice(8, 10)),
                              ),
                            ),
                          ),
                        ].map((day) => (
                          <ReferenceLine
                            key={day}
                            x={day}
                            stroke="#b4d7f5"
                            strokeDasharray="2 4"
                            label={{
                              value: "•",
                              position: "insideTop",
                              fill: "#0075d9",
                            }}
                          />
                        ))}
                      {months.flatMap((m, i) =>
                        metrics.map((key) => (
                          <Line
                            key={`${m}|${key}`}
                            dataKey={`${m}|${key}`}
                            yAxisId={
                              scale === "relative"
                                ? 0
                                : units.indexOf(metricUnit(key))
                            }
                            name={`${metricLabel(key)} · ${monthName(m)}`}
                            stroke={metricColor(key)}
                            strokeWidth={2.5}
                            strokeDasharray={dashes[i]}
                            dot={false}
                            activeDot={{ r: 5 }}
                            connectNulls={false}
                            isAnimationActive={false}
                          />
                        )),
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="comparison-totals">
                {months.map((m, i) => {
                  const d = datasets[i],
                    ch = d?.channels.find((ch) => ch.id === c.id);
                  return (
                    <div key={m}>
                      {months.length > 1 && <span>{monthName(m)}</span>}
                      {metrics.map((key) => (
                        <div className="comparison-metric" key={key}>
                          <span>
                            <i style={{ background: metricColor(key) }} />
                            {metricLabel(key)}
                          </span>
                          <strong>
                            {number(ch?.values[key], ch?.units[key])}
                            {displayUnit(ch?.units[key])
                              ? ` ${displayUnit(ch?.units[key])}`
                              : ""}
                          </strong>
                        </div>
                      ))}
                      <small>
                        {d?.partial
                          ? `Bis Tag ${d.period_end.slice(8)}`
                          : d
                            ? "Gesamter Monat"
                            : "Noch nicht geladen"}
                      </small>
                    </div>
                  );
                })}
              </div>
              <p className="data-explanation">
                {scale === "relative"
                  ? "Jede Linie ist auf ihren eigenen Höchstwert im jeweiligen Monat skaliert (100 %). Die Originalwerte stehen in den Details. "
                  : `Skala: ${units.map((u, i) => `${u}${units.length > 1 ? (i ? " rechts" : " links") : ""}`).join(" · ")}. `}
                Farben kennzeichnen Kennzahlen, Linienarten die Monate.
                Vergleich nach Kalendertag. Fehlende Werte bleiben Lücken;
                laufende Monate sind unvollständig.
                {c.id === "linkedin_organic" && metrics.includes("clicks")
                  ? " LinkedIn-Klicks umfassen auch Interaktionen innerhalb von LinkedIn."
                  : ""}
                {demo ? " Illustrative Beispieldaten." : ""}
              </p>
            </>
          )}
          {!demo && c.id === "linkedin_organic" && (
            <section
              className="day-inspector"
              aria-label="Beiträge zum ausgewählten Tag"
            >
              <div className="inspector-heading">
                <div>
                  <h3>Beiträge zum Verlauf</h3>
                  <p>
                    Veröffentlichungsdatum und Beitragsleistung getrennt
                    betrachten.
                  </p>
                </div>
                {onOpenPosts && (
                  <button className="text-button" onClick={onOpenPosts}>
                    Alle Posts & Videos <ArrowRight size={16} />
                  </button>
                )}
              </div>
              <div className="inspector-controls">
                <label>
                  Monat der Beiträge
                  <select
                    aria-label="Monat der Beiträge"
                    value={activePostMonth}
                    onChange={(e) => {
                      setPostMonth(e.target.value);
                      setDay(null);
                    }}
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {monthName(m)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Tag auswählen
                  <select
                    aria-label="Posts nach Veröffentlichungstag"
                    value={day || ""}
                    onChange={(e) =>
                      setDay(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value="">Tag auswählen</option>
                    {Array.from(
                      {
                        length: new Date(
                          Number(activePostMonth.slice(0, 4)),
                          Number(activePostMonth.slice(5)),
                          0,
                        ).getDate(),
                      },
                      (_, i) => i + 1,
                    ).map((d) => (
                      <option key={d} value={d}>
                        {d}. {monthName(activePostMonth)}
                        {publicationDays.includes(d)
                          ? ` · ${postsOnDay(monthPosts, activePostMonth, d).length} Posts`
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
                {day && (
                  <button className="text-button" onClick={() => setDay(null)}>
                    Auswahl aufheben
                  </button>
                )}
              </div>
              {activePostQuery?.isPending ? (
                <Loading />
              ) : activePostQuery?.isError ? (
                <div role="alert">
                  <p>Beiträge konnten nicht geladen werden.</p>
                  <button
                    className="button"
                    onClick={() => activePostQuery.refetch()}
                  >
                    Erneut laden
                  </button>
                </div>
              ) : (
                <>
                  {activePostQuery?.data?.status !== "connected" && (
                    <p className="inspector-notice" role="status">
                      {activePostQuery?.data?.message?.includes("429")
                        ? "LinkedIn begrenzt derzeit die Abfragen."
                        : activePostQuery?.data?.message}{" "}
                      Zuletzt geladener Stand
                      {activePostQuery?.data?.last_success
                        ? `: ${dateLabel(activePostQuery.data.last_success)}`
                        : ""}
                      .
                    </p>
                  )}
                  <div
                    className="publication-days"
                    aria-label="Tage mit Beiträgen"
                  >
                    <span>
                      {monthPosts.length} Beiträge im{" "}
                      {monthName(activePostMonth)}
                    </span>
                    {publicationDays.map((d) => (
                      <button
                        key={d}
                        aria-pressed={day === d}
                        aria-label={`${d}. ${monthName(activePostMonth)}: ${postsOnDay(monthPosts, activePostMonth, d).length} Beiträge`}
                        onClick={() => setDay(d)}
                      >
                        {d}.
                        <small>
                          {postsOnDay(monthPosts, activePostMonth, d).length}
                        </small>
                      </button>
                    ))}
                  </div>
                  {day ? (
                    <div className="selected-day" aria-live="polite">
                      <div className="selected-day-summary">
                        <h4>
                          {day}. {monthName(activePostMonth)}
                        </h4>
                        <div className="selected-day-values">
                          {metrics.map((key) => (
                            <span key={key}>
                              {metricLabel(key)}:{" "}
                              <strong>
                                {number(
                                  activePoint?.[`${activePostMonth}|${key}`] as
                                    number | undefined,
                                  c.units[key],
                                )}
                                {displayUnit(c.units[key])
                                  ? ` ${displayUnit(c.units[key])}`
                                  : ""}
                              </strong>
                            </span>
                          ))}
                          <small>Kanal gesamt</small>
                        </div>
                      </div>
                      <p className="inspector-definition">
                        Beitragswerte seit Veröffentlichung. Die Tagesleistung
                        des Kanals kann auch ältere Posts enthalten.
                      </p>
                      {activePosts.length ? (
                        <div className="selected-posts">
                          {activePosts.map((post) => (
                            <article key={post.id}>
                              <PostImage post={post} />
                              <div>
                                <span className="selected-post-kind">
                                  {types[post.kind] || "Beitrag"} · Stand{" "}
                                  {dateLabel(post.updated_at)}
                                </span>
                                <a
                                  href={post.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {readablePostTitle(post.title)}{" "}
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                              <dl>
                                {[
                                  ...new Set([
                                    ...metrics.filter(
                                      (key) => postMetricLabels[key],
                                    ),
                                    "impressions",
                                    "clicks",
                                    ...(post.kind === "video"
                                      ? ["average_watch_seconds"]
                                      : []),
                                  ]),
                                ].map((key) => (
                                  <div key={key}>
                                    <dt>{postMetricLabels[key]}</dt>
                                    <dd>
                                      {metricValue(
                                        key === "average_watch_seconds"
                                          ? averageWatchSeconds(post.metrics)
                                          : post.metrics[key],
                                        key,
                                      )}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p>
                          Für diese Auswahl sind im geladenen Stand keine
                          Beiträge vorhanden.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="inspector-definition">
                      Wähle einen Veröffentlichungstag oben oder tippe auf einen
                      Tag im Diagramm. Alle geladenen Beiträge dieses Tages
                      erscheinen hier.
                    </p>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      </section>
      {showPosts && c.id === "linkedin_organic" && (
        <PostCollection
          key={activePostMonth}
          month={activePostMonth}
          demo={demo}
          highlight={metric}
          day={day}
        />
      )}
    </div>
  );
}
