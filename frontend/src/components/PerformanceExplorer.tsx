import {
  comparisonSeries,
  averageWatchSeconds,
  postsOnDay,
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
import { ExternalLink, Play, Plus, X } from "lucide-react";
import { api, monthName, number } from "../api";
import type { Dashboard } from "../types";
import { Empty, Loading } from "./ui";

const colors = ["#0075d9", "#9164b7", "#23846b", "#ae642b"];
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
        <h2>LinkedIn Posts & Videos</h2>
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
        (filter === "all" || p.kind === filter) &&
        (!day || Number(p.published_at.slice(8, 10)) === day),
    )
    .sort((a, b) =>
      sort === "date"
        ? b.published_at.localeCompare(a.published_at)
        : (b.metrics[sort] ?? -Infinity) - (a.metrics[sort] ?? -Infinity),
    );
  const videoCount =
    q.data?.posts.filter((p) => p.kind === "video").length || 0;
  return (
    <section className="panel post-section">
      <div className="panel-heading">
        <div>
          <h2>LinkedIn Posts & Videos</h2>
          <p>
            Veröffentlicht {day ? `am ${day}.` : "im"} {monthName(month)} ·
            Sonio-Unternehmensseite
          </p>
        </div>
        <span className="post-count">
          {posts.length} von {q.data?.posts.length ?? "—"} Beiträgen ·{" "}
          {videoCount} Videos im Monat
        </span>
      </div>
      <div className="post-controls">
        <div className="channel-tabs" role="group" aria-label="Beitragsformat">
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
        <label>
          Sortieren nach
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date">Veröffentlichung</option>
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
              {q.data?.message} Bereits geladene Beiträge bleiben sichtbar.
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
                  <h3>
                    <button
                      className="post-title"
                      aria-expanded={expanded === p.id}
                      onClick={() =>
                        setExpanded(expanded === p.id ? null : p.id)
                      }
                    >
                      {p.title}
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
  onChannel,
  demo,
  showPosts = true,
}: {
  data: Dashboard;
  channel: string;
  onChannel: (channel: string) => void;
  demo: boolean;
  showPosts?: boolean;
}) {
  const c = data.channels.find((c) => c.id === channel) || data.channels[0];
  const [selectedMetric, setMetric] = useState("");
  const metric =
    selectedMetric === "website_clicks" || c?.fields[selectedMetric]
      ? selectedMetric
      : c?.primary || "impressions";
  const [comparisons, setComparisons] = useState<string[]>([]);
  const [candidate, setCandidate] = useState(data.comparison_month);
  const [day, setDay] = useState<number | null>(null);
  const months = [data.month, ...comparisons.filter((m) => m !== data.month)];
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
  const key = `${c.id}.${metric}`;
  const points = comparisonSeries(months, datasets, key);
  const hasData = points.some((p) => months.some((m) => p[m] != null));
  return (
    <div className="performance-explorer">
      <section className="panel performance-panel">
        <div className="panel-heading">
          <div>
            <h2>Performance im Vergleich</h2>
            <p>Tageswerte übereinanderlegen und Beiträge zuordnen.</p>
          </div>
        </div>
        <div className="explorer-controls">
          <label>
            Kanal
            <select
              aria-label="Kanal für Zeitverlauf"
              value={c.id}
              onChange={(e) => {
                onChannel(e.target.value);
                setMetric("");
                setDay(null);
              }}
            >
              {data.channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Kennzahl
            <select
              aria-label="Kennzahl im Verlauf"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            >
              {Object.entries(c.fields).map(([k, v]) => (
                <option key={k} value={k}>
                  {c.id === "linkedin_organic" && k === "clicks"
                    ? "LinkedIn-Klicks"
                    : v}
                </option>
              ))}
              {c.id === "linkedin_organic" && (
                <option value="website_clicks">
                  Website-Klicks (nicht separat verfügbar)
                </option>
              )}
            </select>
          </label>
          <label>
            Vergleichsmonat
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
            <Plus size={15} /> Vergleichen
          </button>
        </div>
        <div className="month-legend">
          {months.map((m, i) => (
            <span key={m}>
              <i style={{ background: colors[i] }} />
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
                    data={points}
                    margin={{ top: 15, right: 15, bottom: 5, left: -10 }}
                    onClick={(state) => {
                      if (state?.activeLabel) setDay(Number(state.activeLabel));
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
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        Math.abs(v) >= 1000 ? `${v / 1000}k` : String(v)
                      }
                    />
                    <Tooltip
                      content={({ active, label }) => {
                        if (!active || label == null) return null;
                        const hoveredDay = Number(label);
                        const point = points.find((p) => p.day === hoveredDay);
                        return (
                          <div className="performance-tooltip" role="status">
                            {months.map((month, i) => {
                              const q = postQueries[i];
                              const posts = postsOnDay(
                                q.data?.posts || [],
                                month,
                                hoveredDay,
                              );
                              return (
                                <section key={month}>
                                  <div className="tooltip-heading">
                                    <span style={{ color: colors[i] }}>
                                      {hoveredDay}. {monthName(month)}
                                    </span>
                                    <strong>
                                      {number(
                                        point?.[month] as number | undefined,
                                      )}{" "}
                                      {c.fields[metric]}
                                    </strong>
                                  </div>
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
                                        <p
                                          className="tooltip-post-title"
                                          key={post.id}
                                        >
                                          {post.title}
                                        </p>
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
                    {months.map((m, i) => (
                      <Line
                        key={m}
                        dataKey={m}
                        name={m}
                        stroke={colors[i]}
                        strokeWidth={2.5}
                        strokeDasharray={i ? `${8 - i * 2} 3` : undefined}
                        dot={false}
                        activeDot={{ r: 5 }}
                        connectNulls={false}
                        isAnimationActive={false}
                      />
                    ))}
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
                    <span>{monthName(m)}</span>
                    <strong>
                      {number(ch?.values[metric], ch?.units[metric])}
                    </strong>
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
              Vergleich nach Kalendertag. Fehlende Werte bleiben Lücken;
              laufende Monate sind unvollständig.
              {c.id === "linkedin_organic" && metric === "clicks"
                ? " LinkedIn-Klicks umfassen auch Interaktionen innerhalb von LinkedIn."
                : ""}
              {demo ? " Illustrative Beispieldaten." : ""}
            </p>
          </>
        )}
        {showPosts && c.id === "linkedin_organic" && (
          <div className="publication-filter">
            <label>
              Posts vom Tag anzeigen
              <select
                aria-label="Posts nach Veröffentlichungstag"
                value={day || ""}
                onChange={(e) =>
                  setDay(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">Alle Tage</option>
                {data.series.map((p) => (
                  <option key={p.day} value={p.day}>
                    {p.day}. {monthName(data.month)}
                  </option>
                ))}
              </select>
            </label>
            {day && (
              <button className="button" onClick={() => setDay(null)}>
                Alle Posts zeigen
              </button>
            )}
            <p>
              Ein Klick im Diagramm filtert Posts nach Veröffentlichungstag. Er
              ordnet die Tageswerte keinem einzelnen Post zu.
            </p>
          </div>
        )}
      </section>
      {showPosts && c.id === "linkedin_organic" && (
        <PostCollection
          key={data.month}
          month={data.month}
          demo={demo}
          highlight={metric}
          day={day}
        />
      )}
    </div>
  );
}
