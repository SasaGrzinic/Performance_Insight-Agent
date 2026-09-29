import { useState, type ReactNode } from "react";
import { useQueries } from "@tanstack/react-query";
import { Info, ExternalLink } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api, monthName, number } from "../api";
import { averageWatchSeconds, readablePostTitle } from "../comparison";
import {
  aggregateLinkedIn,
  completeSum,
  engagement,
  finite,
  yearMonths,
} from "../linkedinMetrics";
import type { Dashboard, Analysis, Recommendation } from "../types";
import {
  PerformanceExplorer,
  PostImage,
  type PostsResponse,
} from "./PerformanceExplorer";
import { OverviewRecommendations } from "./MarketingOverview";
import "../linkedin-organic.css";

function Help({ children }: { children: ReactNode }) {
  return (
    <span className="li-help">
      <button aria-label="Kennzahl erklären" type="button">
        <Info size={14} />
      </button>
      <span role="tooltip">{children}</span>
    </span>
  );
}
function Tile({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help: string;
}) {
  return (
    <div className="li-tile">
      <div>
        {label}
        <Help>{help}</Help>
      </div>
      <strong>{value}</strong>
    </div>
  );
}
const fmt = (v: unknown) => (finite(v) ? number(v) : "—");
export function LinkedInHero() {
  return (
    <>
      <div className="li-mast">
        <h1>Dein LinkedIn Cockpit.</h1>
      </div>
      <section className="li-hero">
        <img
          src={`${import.meta.env.BASE_URL}brand/sonio-blog-header.jpg`}
          alt="Berglandschaft mit Fahrer und Zielflagge"
        />
        <div>
          <h2>Sichtbar werden. Relevant bleiben.</h2>
          <p>Aufmerksamkeit. Austausch. Wirkung.</p>
        </div>
      </section>
      <p className="li-intro">
        LinkedIn macht unsere Expertise sichtbar, bringt Menschen ins Gespräch
        und schafft Interesse an Sonio.
      </p>
    </>
  );
}
export function LinkedInOrganic({
  data,
  demo,
  analysis,
  onMonth,
  onRecommendation,
  onAll,
  actions,
}: {
  data: Dashboard;
  demo: boolean;
  analysis?: Analysis;
  onMonth: (m: string) => void;
  onRecommendation: (r: Recommendation) => void;
  onAll: () => void;
  actions: ReactNode;
}) {
  const [year, setYear] = useState(false),
    [choose, setChoose] = useState(false),
    [visible, setVisible] = useState([true, true, true, true, true, true]);
  const [format, setFormat] = useState("all"),
    [ranking, setRanking] = useState("watch"),
    [trend, setTrend] = useState("impressions");
  const months = year ? yearMonths() : [data.month];
  const queries = useQueries({
    queries: months.map((month) => ({
      queryKey: ["dashboard", demo, month],
      queryFn: () =>
        api<Dashboard>(`${demo ? "/demo" : ""}/dashboard?month=${month}`),
      enabled: year,
    })),
  });
  const postQueries = useQueries({
    queries: months.map((month) => ({
      queryKey: ["linkedin-posts", demo, month],
      queryFn: () => api<PostsResponse>(`/linkedin/posts?month=${month}`),
      enabled: !demo,
    })),
  });
  const channel = data.channels.find((c) => c.id === "linkedin_organic")!;
  const datasets = year ? queries.map((q) => q.data) : [data];
  const values = year ? aggregateLinkedIn(datasets) : channel.values;
  const period = year
    ? `Laufendes Jahr ${months[0].slice(0, 4)}`
    : monthName(data.month);
  const posts = [
    ...new Map(
      postQueries.flatMap((q) => q.data?.posts || []).map((p) => [p.id, p]),
    ).values(),
  ];
  const videos = posts.filter((p) => p.kind === "video");
  const loading = !demo && postQueries.some((q) => q.isPending),
    failed = !demo && postQueries.some((q) => q.isError);
  const score = (p: (typeof posts)[number]) =>
    ranking === "views"
      ? p.metrics.video_views
      : ranking === "average"
        ? averageWatchSeconds(p.metrics)
        : p.metrics.watch_time_ms;
  const winner = [...videos]
    .filter((p) => finite(score(p)))
    .sort((a, b) => (score(b) ?? 0) - (score(a) ?? 0))[0];
  const videoSum = (key: string) =>
    loading || failed
      ? undefined
      : completeSum(videos.map((p) => p.metrics[key]));
  const views = videoSum("video_views"),
    watch = videoSum("watch_time_ms");
  const avg =
    finite(views) && views > 0 && finite(watch)
      ? watch / views / 1000
      : undefined;
  const cards = [
    [
      "Impressionen",
      fmt(values.impressions),
      "Einblendungen im ausgewählten Zeitraum; keine eindeutigen Personen.",
    ],
    [
      "Engagement-Rate",
      finite(engagement(values)) ? `${number(engagement(values))} %` : "—",
      "(LinkedIn-Klicks + Reaktionen + Kommentare + Reposts) / Impressionen × 100. Fehlende Bestandteile ergeben keine Rate.",
    ],
    [
      "Kommentare & Reposts",
      `${fmt(values.comments)} / ${fmt(values.shares)}`,
      "Kommentare und Reposts separat. Aktivität bedeutet nicht automatisch Zustimmung.",
    ],
    [
      "Neue Follower",
      fmt(values.followers_organic),
      "Organische Zugewinne, keine Nettoveränderung. Bezahlte Zugewinne sind ausgeschlossen.",
    ],
    [
      "LinkedIn-Klicks",
      fmt(values.clicks),
      "LinkedIn-Klicks sind keine externen Linkklicks und keine Website-Besuche.",
    ],
    [
      "Reaktionen",
      fmt(values.likes),
      "Reaktionen auf organische Beiträge, ohne Kommentare und Reposts.",
    ],
  ];
  return (
    <div className="li-cockpit">
      <div className="li-controls">
        <nav aria-label="LinkedIn Bereiche">
          <a href="#li-impact">Wirkung</a>
          <a href="#li-posts">Beiträge</a>
          <a href="#li-videos">Videos</a>
          <a href="#li-website">Website</a>
        </nav>
        <button
          className="button"
          onClick={() => setChoose(!choose)}
          aria-expanded={choose}
        >
          Kennzahlen wählen
        </button>
      </div>
      {choose && (
        <fieldset className="li-picker">
          <legend>Deine Übersicht</legend>
          {cards.map(([label], i) => (
            <label key={label}>
              <input
                type="checkbox"
                checked={visible[i]}
                onChange={() =>
                  setVisible(visible.map((v, j) => (i === j ? !v : v)))
                }
              />
              {label}
            </label>
          ))}
        </fieldset>
      )}
      <section id="li-impact">
        <div className="li-heading">
          <h2>Sichtbarkeit &amp; Relevanz.</h2>
          <label className="li-period">
            <span className="sr-only">Auswertungszeitraum</span>
            <select
              value={year ? "year" : "month"}
              onChange={(e) => setYear(e.target.value === "year")}
            >
              <option value="month">{monthName(data.month)}</option>
              <option value="year">
                Laufendes Jahr {yearMonths()[0].slice(0, 4)}
              </option>
            </select>
            <Help>
              {year
                ? "Vom 1. Januar bis zum letzten verfügbaren Stand. Fehlende Monatswerte werden nicht als null addiert."
                : "Monatswerte. Laufende Monate sind unvollständig."}
            </Help>
          </label>
        </div>
        {year && (
          <p className="li-note">
            {queries.some((q) => q.isPending)
              ? "Jahresdaten werden geladen …"
              : queries.some((q) => q.isError)
                ? "Einzelne Monate konnten nicht geladen werden."
                : "Januar bis " + monthName(months.at(-1)!)}{" "}
            · bis zum verfügbaren Datenstand
          </p>
        )}
        <div className="li-kpis">
          {cards.map(
            ([label, value, help], i) =>
              visible[i] && (
                <Tile key={label} label={label} value={value} help={help} />
              ),
          )}
        </div>
        <details className="li-data-actions">
          <summary>Daten &amp; Export</summary>
          {actions}
        </details>
      </section>
      <section>
        <h2>Entwicklung im Vergleich.</h2>
        {year ? (
          <>
            <label>
              Kennzahl{" "}
              <select value={trend} onChange={(e) => setTrend(e.target.value)}>
                {[
                  "impressions",
                  "clicks",
                  "likes",
                  "comments",
                  "followers_organic",
                ].map((key, i) => (
                  <option key={key} value={key}>
                    {
                      [
                        "Impressionen",
                        "LinkedIn-Klicks",
                        "Reaktionen",
                        "Kommentare",
                        "Neue Follower",
                      ][i]
                    }
                  </option>
                ))}
              </select>
            </label>
            <div className="li-year-chart">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={months.map((m, i) => ({
                    month: monthName(m),
                    value:
                      datasets[i]?.channels.find(
                        (c) => c.id === "linkedin_organic",
                      )?.values[trend] ?? null,
                  }))}
                >
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    dataKey="value"
                    name="Monatswert"
                    stroke="#0075d9"
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <PerformanceExplorer
            data={data}
            channel="linkedin_organic"
            demo={demo}
            onMonth={onMonth}
            showPosts={false}
          />
        )}
      </section>
      <section id="li-posts">
        <div className="li-heading">
          <h2>Deine Inhalte im Vergleich.</h2>
          <label>
            Format{" "}
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="all">Alle Beiträge</option>
              <option value="video">Videos</option>
              <option value="article">Link-Beiträge</option>
              <option value="image">Bilder</option>
            </select>
          </label>
        </div>
        <p className="li-note">
          Veröffentlicht: {period} · Beitragswerte seit Veröffentlichung{" "}
          <Help>
            Diese Werte sind keine Monatsleistung. Der Abrufstand steht bei
            jedem Beitrag.
          </Help>
        </p>
        {loading ? (
          <p role="status">Beiträge werden geladen …</p>
        ) : failed ? (
          <p role="alert">
            Beiträge konnten nicht vollständig geladen werden.{" "}
            <button
              className="button"
              onClick={() => postQueries.forEach((q) => q.refetch())}
            >
              Erneut laden
            </button>
          </p>
        ) : null}
        {demo && (
          <p>
            In dieser Demo sind keine echten Beitragsbilder oder Videos
            hinterlegt.
          </p>
        )}
        <div className="li-post-list">
          {posts
            .filter((p) => format === "all" || p.kind === format)
            .map((p) => (
              <article key={p.id}>
                <PostImage post={p} />
                <div>
                  <a href={p.url} target="_blank" rel="noreferrer">
                    {readablePostTitle(p.title)} <ExternalLink size={13} />
                  </a>
                  <small>
                    {new Date(p.published_at).toLocaleDateString("de-CH")} ·
                    Stand {new Date(p.updated_at).toLocaleDateString("de-CH")}
                  </small>
                </div>
                <dl>
                  <div>
                    <dt>Impressionen</dt>
                    <dd>{fmt(p.metrics.impressions)}</dd>
                  </div>
                  <div>
                    <dt>Klicks</dt>
                    <dd>{fmt(p.metrics.clicks)}</dd>
                  </div>
                </dl>
              </article>
            ))}
        </div>
        {!loading && !failed && !demo && !posts.length && (
          <p>Keine Beiträge im geladenen Zeitraum.</p>
        )}
      </section>
      <section id="li-videos">
        <div className="li-heading">
          <h2>Aufmerksamkeit, die bleibt.</h2>
          <label>
            Video im Fokus{" "}
            <select
              value={ranking}
              onChange={(e) => setRanking(e.target.value)}
            >
              <option value="watch">Gesamte Betrachtungsdauer</option>
              <option value="average">Ø Betrachtungsdauer</option>
              <option value="views">Videoaufrufe</option>
            </select>
          </label>
        </div>
        <p className="li-note">
          Videos veröffentlicht: {period} · Gesamtwerte seit Veröffentlichung{" "}
          <Help>
            Ranking innerhalb der geladenen Videos. Unterschiedliches Alter und
            unterschiedliche Länge beeinflussen den Vergleich.
          </Help>
        </p>
        {winner ? (
          <div className="li-video-feature">
            <a
              href={winner.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Video auf LinkedIn ansehen: ${readablePostTitle(winner.title)}`}
            >
              <PostImage key={winner.id} post={winner} />
            </a>
            <div>
              <h3>{readablePostTitle(winner.title)}</h3>
              <p>
                Stärkstes Video nach{" "}
                {ranking === "watch"
                  ? "gesamter Betrachtungsdauer"
                  : ranking === "average"
                    ? "durchschnittlicher Betrachtungsdauer"
                    : "Videoaufrufen"}
              </p>
              <div className="li-winner-kpis">
                <Tile
                  label="Betrachtungsdauer"
                  value={
                    finite(winner.metrics.watch_time_ms)
                      ? `${number(winner.metrics.watch_time_ms / 60000)} Min.`
                      : "—"
                  }
                  help="Gesamtwert seit Veröffentlichung."
                />
                <Tile
                  label="Ø Betrachtungsdauer"
                  value={
                    finite(averageWatchSeconds(winner.metrics))
                      ? `${number(averageWatchSeconds(winner.metrics))} Sek.`
                      : "—"
                  }
                  help="Wiedergabezeit geteilt durch qualifizierte Videoaufrufe."
                />
              </div>
              <a href={winner.url} target="_blank" rel="noreferrer">
                Video auf LinkedIn ansehen <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ) : (
          <p>
            {loading
              ? "Videos werden geladen …"
              : "Noch kein Video mit auswertbaren Kennzahlen vorhanden."}
          </p>
        )}
        <div className="li-video-kpis">
          <Tile
            label="Videoaufrufe"
            value={fmt(views)}
            help="Gesamtwerte der ausgewählten Videos seit Veröffentlichung. Fehlende Einzelwerte ergeben keine vollständige Summe."
          />
          <Tile
            label="Betrachtungsdauer"
            value={finite(watch) ? `${number(watch / 3600000)} Std.` : "—"}
            help="Gesamte Wiedergabezeit seit Veröffentlichung."
          />
          <Tile
            label="Ø Betrachtungsdauer"
            value={finite(avg) ? `${number(avg)} Sek.` : "—"}
            help="Gesamte Wiedergabezeit / gesamte qualifizierte Aufrufe. Gewichteter Durchschnitt, keine Abschlussrate."
          />
          <Tile
            label="Klicks zu YouTube"
            value="—"
            help="Zielspezifisches Linktracking noch nicht angebunden. Allgemeine LinkedIn-Klicks sind kein Ersatz."
          />
          <Tile
            label="Klicks zur Website"
            value="—"
            help="Zielspezifisches Linktracking noch nicht angebunden. Klicks sind keine Website-Sitzungen."
          />
        </div>
      </section>
      <section id="li-website">
        <h2>Von Interesse zu Besuch.</h2>
        <p>
          Website-Beitrag noch nicht zuordenbar{" "}
          <Help>
            Für eine belastbare Zuordnung benötigen wir GA4-Sitzungen mit
            konsistenten LinkedIn-UTM-Parametern. Bis dahin keine Schätzwerte.
          </Help>
        </p>
      </section>
      <OverviewRecommendations
        analysis={
          year
            ? { status: "unavailable", summary: "", recommendations: [] }
            : analysis
              ? {
                  ...analysis,
                  recommendations: analysis.recommendations.filter(
                    (r) => r.channel === "linkedin_organic",
                  ),
                }
              : undefined
        }
        channels={data.channels}
        onSelect={onRecommendation}
        onAll={onAll}
      />
      {year && (
        <p className="li-note">
          Empfehlungen für das ganze Jahr sind noch nicht berechnet.
          Monatsauswahl für verfügbare Empfehlungen verwenden.
        </p>
      )}
      <blockquote className="li-quote">
        <span>“</span> Attention is priceless and trust is worth even more{" "}
        <span>”</span>
        <cite>
          <a
            href="https://seths.blog/2025/12/building-blocks-of-marketing/"
            target="_blank"
            rel="noreferrer"
          >
            Seth Godin
          </a>
          <small>Marketingautor und Unternehmer</small>
        </cite>
      </blockquote>
    </div>
  );
}
