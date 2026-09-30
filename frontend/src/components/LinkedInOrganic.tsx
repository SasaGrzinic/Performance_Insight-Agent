import {RecommendationTeaser} from "./RecommendationTeaser";
import { EditorialQuote } from './EditorialQuote';
import { useState, useId, type ReactNode } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Info, ExternalLink, Play, SlidersHorizontal, TrendingUp, TrendingDown, Minus } from "lucide-react";
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
  metricTrend,
} from "../linkedinMetrics";
import type { Dashboard, Analysis, Recommendation } from "../types";
import {
  PerformanceExplorer,
  PostImage,
  type PostsResponse,
} from "./PerformanceExplorer";
import "../linkedin-organic.css";

function Help({ children }: { children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className="li-help" data-open={open} onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); e.currentTarget.querySelector("button")?.blur(); } }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <button aria-label="Kennzahl erklären" type="button" aria-describedby={id} aria-expanded={open} onClick={() => setOpen(!open)}>
        <Info size={14} />
      </button>
      <span id={id} role="tooltip">{children}</span>
    </span>
  );
}
function Tile({
  label,
  value,
  help,
  tendency,
}: {
  label: string;
  value: string;
  help: string;
  tendency?: ReactNode;
}) {
  return (
    <div className="li-tile">
      <div>
        {label}
        <Help>{help}</Help>
      </div>
      <strong>{value}</strong>
      {tendency}
    </div>
  );
}
function Tendency({current, previous, points = false, label, context}: {current: unknown; previous: unknown; points?: boolean; label?: string; context: string}) {
  const change = metricTrend(current, previous, points);
  const Icon = change.direction === "up" ? TrendingUp : change.direction === "down" ? TrendingDown : Minus;
  return <span className="li-tendency"><Icon size={12} aria-hidden="true" /><span>{label && `${label}: `}{change.value === undefined ? change.label : `${change.value > 0 ? "+" : ""}${number(change.value)} ${points ? "PP" : "%"}`}<span className="li-tendency-period"> zum Vormonat</span></span><Help>{context} {change.label}</Help></span>;
}
const fmt = (v: unknown) => (finite(v) ? number(v) : "—");
export function LinkedInHero() {
  return (
    <>
      <div className="li-mast">
        <div><small>Sonio AG</small><h1>Dein LinkedIn Cockpit.</h1></div><span>Marketing · Organic</span>
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
  onMonth,
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
  const [expandedPostsFor, setExpandedPostsFor] = useState<string | null>(null);
  const postSelection = `${year ? "year" : "month"}:${data.month}:${format}`;
  const showAllPosts = expandedPostsFor === postSelection;
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
  const audience = useQuery({
    queryKey: ["linkedin-audience", demo, data.month],
    queryFn: () => api<{current: {value: number; observed_at: string} | null; status: string; message: string}>(`/linkedin/audience?month=${data.month}`),
    enabled: !demo,
    refetchInterval: 60000,
  });
  const followerSnapshot = audience.data?.current;
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
  const filteredPosts = posts.filter(p => format === "all" || p.kind === format).sort((a, b) => a.published_at.localeCompare(b.published_at));
  const displayedPosts = showAllPosts ? filteredPosts : filteredPosts.slice(0, 5);
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
  const comparisonContext = `Vergleich ${data.period_start} bis ${data.period_end} mit ${data.comparison_month}-01 bis ${data.comparison_end}. ${data.partial ? "Laufender Monat: Vormonat auf denselben Kalendertag begrenzt." : "Abgeschlossene Monatszeiträume."}`;
  const tendencies = year ? [] : [
    <Tendency current={values.impressions} previous={channel.previous.impressions} context={comparisonContext} />,
    <Tendency current={engagement(values)} previous={engagement(channel.previous)} points context={comparisonContext} />,
    <span className="li-tendency-pair"><Tendency label="Kommentare" current={values.comments} previous={channel.previous.comments} context={comparisonContext} /><Tendency label="Reposts" current={values.shares} previous={channel.previous.shares} context={comparisonContext} /></span>,
    <Tendency current={values.followers_organic} previous={channel.previous.followers_organic} context={comparisonContext} />,
    <Tendency current={values.clicks} previous={channel.previous.clicks} context={comparisonContext} />,
    <Tendency current={values.likes} previous={channel.previous.likes} context={comparisonContext} />,
  ];
  const postsAvailable = !demo && !loading && !failed && postQueries.every(q => q.data?.last_success);
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
      "Follower & neue Follower",
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
          Kennzahlen wählen <SlidersHorizontal size={15} />
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
          <div className="li-impact-title"><h2>Sichtbarkeit &amp; Relevanz.</h2><span className="li-post-count">{postsAvailable ? `${number(posts.length)} ${posts.length === 1 ? "Post" : "Posts"}` : loading ? "Posts werden geladen …" : "Postanzahl nicht verfügbar"}<Help>Veröffentlichte Beiträge im ausgewählten Zeitraum: {period}. Gezählt werden eindeutig importierte Beiträge. {postQueries.some(q => q.data?.status !== "connected") ? "Letzter importierter Stand; Aktualisierung derzeit eingeschränkt." : ""}</Help></span></div>
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
                i === 3 ? <div className="li-tile li-follower-pair" key={label}>
                  <div className="li-follower-values">
                    <div><span>Follower gesamt <Help>Aktuellster tatsächlich beobachteter Gesamtbestand, organisch und bezahlt. {followerSnapshot ? `Stand ${new Date(followerSnapshot.observed_at).toLocaleString("de-CH", {timeZone: "Europe/Zurich"})}.` : "Noch kein Gesamtbestand verfügbar."} Kein rekonstruierter historischer Monatsbestand. {audience.data?.status !== "connected" ? audience.data?.message : ""}</Help></span><strong>{demo ? "—" : fmt(followerSnapshot?.value)}</strong><small>Aktueller Bestand</small></div>
                    <div><span>Neue Follower <Help>{help} Zeitraum: {period}.</Help></span><strong>{value}</strong><small>Organisch · {period}</small>{tendencies[i]}</div>
                  </div>
                  {audience.isError && <small role="alert">Gesamtbestand konnte nicht aktualisiert werden. <button type="button" onClick={() => audience.refetch()}>Erneut laden</button></small>}
                </div> : <Tile key={label} label={label} value={value} help={help} tendency={tendencies[i]} />
              ),
          )}
        </div>
        <details className="li-data-actions">
          <summary>Daten &amp; Export</summary>
          {actions}
        </details>
      </section>
      <section>
        <div className="li-heading"><h2>Entwicklung im Vergleich.</h2><small>{year ? "Monatsverlauf · laufendes Jahr" : "Gleiche Kalendertage · Monatswerte"}</small></div>
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
            compact
          />
        )}
      </section>
      <section id="li-posts">
        <div className="li-heading">
          <h2>Deine Inhalte im Vergleich.</h2>
          <div className="li-format-filters" role="group" aria-label="Beitragsformat">
            {[["all", "Alle"], ["video", "Videos"], ["article", "Link-Beiträge"], ["image", "Bilder"]].map(([value, label]) => <button key={value} type="button" aria-pressed={format === value} onClick={() => setFormat(value)}>{label}</button>)}
          </div>
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
        <div className="li-table-panel" role="region" aria-label="Beitragskennzahlen" tabIndex={0}>
          <table id="li-post-list" className="li-table"><thead><tr><th>Beitrag / Thema</th><th>Impressionen</th><th>Klicks</th><th>Engagement <Help>Interaktionen geteilt durch Impressionen. Gesamtwerte seit Veröffentlichung, keine Monatsrate.</Help></th><th>Kommentare / Reposts</th></tr></thead>
          <tbody>{displayedPosts.map((p) => <tr key={p.id}>
            <td><div className="li-post-cell"><PostImage post={p} /><div><a href={p.url} target="_blank" rel="noreferrer">{readablePostTitle(p.title)} <ExternalLink size={12}/></a><small>{new Date(p.published_at).toLocaleDateString("de-CH", {timeZone:"Europe/Zurich"})} · Stand {new Date(p.updated_at).toLocaleDateString("de-CH")}</small></div></div></td>
            <td>{fmt(p.metrics.impressions)}</td><td>{fmt(p.metrics.clicks)}</td><td>{finite(engagement(p.metrics)) ? `${number(engagement(p.metrics))} %` : "—"}</td><td>{fmt(p.metrics.comments)} / {fmt(p.metrics.shares)}</td>
          </tr>)}</tbody></table>
          <p className="li-note">Beitragsalter und Format beim Vergleich berücksichtigen. Gesamtwerte nicht zu Monatswerten addieren.</p>
        </div>
        {filteredPosts.length > 5 && <button type="button" className="button" aria-expanded={showAllPosts} aria-controls="li-post-list" onClick={() => setExpandedPostsFor(showAllPosts ? null : postSelection)}>
          {showAllPosts ? "Nur die ersten 5 Posts anzeigen" : `Alle ${filteredPosts.length} Posts anzeigen`}
        </button>}
        {!loading && !failed && !demo && !posts.length && (
          <p>Keine Beiträge im geladenen Zeitraum.</p>
        )}
      </section>
      <section id="li-videos">
        <div className="li-heading">
          <h2>Aufmerksamkeit, die bleibt.</h2>
          <label className="li-winner-choice">
            Stärkstes Video nach{" "}
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
              <PostImage key={winner.id} post={winner} /><span className="li-play"><Play size={22} aria-hidden="true"/></span><span className="li-poster-label">Originalvideo auf LinkedIn</span>
            </a>

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
        {!!videos.length && <div className="li-table-panel" role="region" aria-label="Videokennzahlen" tabIndex={0}><table className="li-table"><thead><tr><th>Video</th><th>Aufrufe</th><th>Gesamte Betrachtung</th><th>Ø Betrachtung</th></tr></thead><tbody>{videos.map((p) => <tr key={p.id}><td><div className="li-post-cell"><PostImage post={p}/><div><a href={p.url} target="_blank" rel="noreferrer">{readablePostTitle(p.title)}</a><small>{new Date(p.published_at).toLocaleDateString("de-CH", {timeZone:"Europe/Zurich"})} · Stand {new Date(p.updated_at).toLocaleDateString("de-CH")}</small></div></div></td><td>{fmt(p.metrics.video_views)}</td><td>{finite(p.metrics.watch_time_ms) ? `${number(p.metrics.watch_time_ms / 60000)} Min.` : "—"}</td><td>{finite(averageWatchSeconds(p.metrics)) ? `${number(averageWatchSeconds(p.metrics))} Sek.` : "—"}</td></tr>)}</tbody></table><p className="li-note">Videolänge und relativer Betrachtungsanteil erst bei verlässlicher Datenquelle verfügbar.</p></div>}
      </section>
      <section id="li-website">
        <div className="li-heading"><h2>Was auf der Website ankommt.</h2><small>Zuordnung noch einzurichten</small></div>
        <div className="li-website-panel"><div className="li-website-kpis">
          <Tile label="Besuche aus LinkedIn Organic" value="—" help="Erst nach verifizierter GA4-/UTM-Zuordnung verfügbar. LinkedIn-Klicks sind keine Website-Besuche."/>
          <Tile label="Davon engagierte Sitzungen" value="—" help="Anzahl und Anteil an den zugeordneten Besuchen. Die notwendige Zuordnung ist noch offen."/>
        </div><p className="li-note">Nach verifizierter GA4-/UTM-Zuordnung. <Help>Für eine belastbare Zuordnung benötigen wir GA4-Sitzungen mit konsistenten LinkedIn-UTM-Parametern. Bis dahin keine Schätzwerte.</Help></p></div>
      </section>
      <RecommendationTeaser/><EditorialQuote text="Attention is priceless and trust is worth even more" author="Seth Godin" role="Marketingautor und Unternehmer" source="https://seths.blog/2025/12/building-blocks-of-marketing/"/>
    </div>
  );
}
