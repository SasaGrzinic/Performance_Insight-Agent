import {SearchInsights,SearchHero} from "./components/SearchInsights";
import {GoogleAds,GoogleAdsHero} from "./components/GoogleAds";
import {RecommendationContext, RecommendationTeaser} from "./components/RecommendationTeaser";
import {AnalyticsHero} from './components/AnalyticsHero';
import {EditorialQuote} from './components/EditorialQuote';
import {AnalyticsInfo} from './components/AnalyticsInfo';
import { ChannelDirectory } from "./components/ChannelDirectory";
import { LinkedInHero, LinkedInOrganic } from "./components/LinkedInOrganic";
import {ChannelRecommendations} from "./components/ChannelRecommendations";
import {recommendationAreas} from './recommendationContent';
import {metricRecommendations} from "./recommendations";
import { PeriodInfo } from "./components/PeriodInfo";
import { AnalyticsMonthlySources } from "./components/AnalyticsMonthlySources";
import { AnalyticsContent } from "./components/AnalyticsContent";
import { YouTubeVideos, YouTubeHero } from "./components/YouTubeVideos";
import { MailchimpCampaigns, MailchimpHero } from "./components/MailchimpCampaigns";
import { KpiExplainer } from "./components/KpiExplainer";
import { STATIC_DEMO, asset } from "./staticDemo";
import { AdsCampaigns, LinkedInAdsHero } from "./components/AdsCampaigns";
import { VideoInsights, VideoInsightsHero } from "./components/VideoInsights";
import { CSVExport } from "./components/CSVExport";
import { currentReportingMonth } from "./comparison";
import { Audience } from "./components/Audience";
import { useState, useEffect } from "react";
import {
  PerformanceExplorer,
  PostCollection,
} from "./components/PerformanceExplorer";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  OverviewHighlights,
  OverviewExplore,
  overviewSecondaryMetric,
  overviewMetricHelp,
  MarketingQuote,
  channelMetricLabel,
} from "./components/MarketingOverview";
import {
  LayoutDashboard,
  Play,
  ChartNoAxesCombined,
  Lightbulb,
  FileText,
  Plug,
  Settings2,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Download,
  CalendarDays,
  Check,
  Plus,
  Clock3,
  LogOut,
  Menu,
  X,
  Info,
  ShieldCheck,
  Link2,
  Upload,
  ExternalLink,
  CheckCircle2,
  LoaderCircle,
  SlidersHorizontal,
  Copy,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { api, number, monthName } from "./api";
import type {
  Dashboard,
  Analysis,
  Channel,
  Recommendation,
  User,
  Report,
  Settings,
  KPI,
} from "./types";
import { Modal, ChannelIcon, Change, Loading, Empty } from "./components/ui";

type View =
  | "search"
  | "videos"
  | "audience"
  | "posts"
  | "overview"
  | "channel-directory"
  | "channels"
  | "recommendations"
  | "insights"
  | "reports"
  | "sources"
  | "team"
  | "settings";
const navigation: { id: View; label: string; icon: typeof LayoutDashboard }[] =
  [
    { id: "overview", label: "Übersicht", icon: LayoutDashboard },
    { id: "channel-directory", label: "Kanäle", icon: ChartNoAxesCombined },
    { id: "search", label: "Suchbegriffe & Potenziale", icon: ChartNoAxesCombined },
    { id: "videos", label: "Video Insights", icon: Play },
    { id: "recommendations", label: "Empfehlungen", icon: Lightbulb },
    { id: "reports", label: "Reports", icon: FileText },
  ];
const adminNav: { id: View; label: string; icon: typeof Plug }[] = [
  { id: "sources", label: "Datenquellen", icon: Plug },
  { id: "team", label: "Team & Zugänge", icon: Users },
  { id: "settings", label: "Einstellungen", icon: Settings2 },
];
const titles: Record<View, string> = {
  search: "Suchbegriffe & Potenziale",
  videos: "Video Insights",
  audience: "Entwicklung der Community.",
  posts: "Wirkung der Beiträge.",
  overview: "Marketing-Überblick",
  channels: "Jeder Kanal. Seine Wirkung.",
  "channel-directory": "Alle Kanäle. Klar im Blick.",
  insights: "Aus Zahlen werden nächste Schritte.",
  recommendations: "Empfehlungen im Überblick.",
  reports: "Marketing Performance, Monat für Monat.",
  sources: "Alle Daten an einem Ort.",
  team: "Gute Entscheidungen sind Teamwork.",
  settings: "Einstellungen des Dashboards.",
};
const channelDescriptions: Record<string, string> = {
  linkedin_organic:
    "Unbezahlte Beiträge auf LinkedIn: Sie machen Sonio sichtbar, vermitteln Wissen und stärken den Austausch mit der Community.",
  linkedin:
    "Bezahlte LinkedIn-Kampagnen erreichen gezielt berufliche Zielgruppen. Jede Kampagne erscheint hier mit ihrem Ziel und ihren Ergebnissen.",
  google_ads:
    "Bezahlte Anzeigen in der Google-Suche und im Google-Netzwerk: Sie erreichen Menschen, die nach passenden Lösungen suchen oder sich dafür interessieren.",
  analytics:
    "Google Analytics zeigt, wie Menschen die Website nutzen und welche Inhalte und Aktionen für sie relevant sind.",
  mailchimp:
    "Newsletter und E-Mail-Kampagnen halten Kontakte auf dem Laufenden. Öffnungen und Klicks zeigen, welche Inhalte Interesse wecken.",
  youtube:
    "Videos auf YouTube vermitteln Wissen und machen Sonio erlebbar. Aufrufe und Wiedergabezeit zeigen, wie die Inhalte genutzt werden.",
  events:
    "Veranstaltungen bringen Sonio und Interessierte zusammen. Die Anmeldelisten zeigen, welche Events Resonanz erzeugen.",
  qr: "QR-Codes verbinden Print, Veranstaltungen und andere Kontaktpunkte mit digitalen Inhalten. Scans machen diese Zugriffe messbar.",
};
function App() {
  const initialDemo =
    STATIC_DEMO || new URLSearchParams(location.search).get("demo") === "1";
  const [demo, setDemo] = useState(initialDemo);
  const [selectedMonth, setMonth] = useState(() => currentReportingMonth());
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const [view, setView] = useState<View>(
    (new URLSearchParams(location.search).get("view") as View) || "overview",
  );
  const [mobile, setMobile] = useState(false);
  const [notice, setNotice] = useState("");
  const [recommendationScope, setRecommendationScope] = useState<string[]>([]);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [channel, setChannel] = useState("");
  const [job, setJob] = useState<string | null>(null);
  const [jobKind, setJobKind] = useState("");
  const [metricModal, setMetricModal] = useState(false);
  const client = useQueryClient();
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<User>("/auth/me"),
    retry: false,
    enabled: !demo,
  });
  const publicConfig = useQuery({
    queryKey: ["public"],
    queryFn: () =>
      api<{
        demo_enabled: boolean;
        timezone: string;
        report_hour: number;
        sync_interval_minutes: number;
      }>("/config/public"),
  });
  const currentMonth = currentReportingMonth(now, publicConfig.data?.timezone || "Europe/Zurich");
  const month = selectedMonth;
  const data = useQuery({
    queryKey: ["dashboard", demo, month],
    refetchInterval: demo ? false : 60000,
    queryFn: () =>
      api<Dashboard>(`${demo ? "/demo" : ""}/dashboard?month=${month}`),
    enabled: demo || !!me.data,
  });
  const analysis = useQuery({
    queryKey: ["analysis", demo, month],
    refetchInterval: demo ? false : 60000,
    queryFn: () =>
      api<Analysis>(`${demo ? "/demo" : ""}/analysis?month=${month}`),
    enabled: demo || !!me.data,
  });
  const progress = useQuery({
    queryKey: ["job", job],
    queryFn: () =>
      api<{ status: string; error: string | null }>("/jobs/" + job),
    enabled: !!job,
    refetchInterval: job ? 2000 : false,
  });
  useEffect(() => {
    if (!channel && data.data) {
      setChannel(
        data.data.channels.find((item) => item.status === "connected")?.id ||
          data.data.channels[0]?.id ||
          "google_ads",
      );
    }
  }, [channel, data.data]);
  const isAdmin = demo || me.data?.role === "master_admin";
  useEffect(() => {
    if (!isAdmin && ["team", "settings"].includes(view)) setView("overview");
  }, [isAdmin, view]);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.activeElement as HTMLElement;
    const sidebar = document.querySelector(".sidebar") as HTMLElement;
    const selector = "a[href],button:not([disabled])";
    (sidebar.querySelector(selector) as HTMLElement)?.focus();
    function keydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobile(false);
        return;
      }
      if (e.key === "Tab") {
        const elements = [...sidebar.querySelectorAll<HTMLElement>(selector)];
        const first = elements[0],
          last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [mobile]);
  useEffect(() => {
    if (progress.isError) {
      setNotice(
        "Der Auftragsstatus ist nicht erreichbar. Die Verarbeitung kann im Hintergrund weiterlaufen. Bitte Verbindung prüfen und die Ansicht neu laden.",
      );
      setJob(null);
    }
  }, [progress.isError]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 6000);
      return () => clearTimeout(t);
    }
  }, [notice]);
  useEffect(() => {
    if (
      progress.data?.status === "completed" ||
      progress.data?.status === "failed"
    ) {
      setNotice(
        progress.data.status === "completed"
          ? "Auftrag abgeschlossen. Die Ansicht wurde aktualisiert."
          : progress.data.error || "Auftrag fehlgeschlagen.",
      );
      setJob(null);
      client.invalidateQueries({ queryKey: ["dashboard"] });
      client.invalidateQueries({ queryKey: ["analysis"] });
      client.invalidateQueries({ queryKey: ["reports"] });
      client.invalidateQueries({ queryKey: ["linkedin-posts"] });
      client.invalidateQueries({ queryKey: ["linkedin-audience"] });
      client.invalidateQueries({ queryKey: ["linkedin-ads-campaigns"] });
      client.invalidateQueries({ queryKey: ["mailchimp-campaigns"] });
      client.invalidateQueries({ queryKey: ["mailchimp-insights"] });
      client.invalidateQueries({ queryKey: ["analytics-monthly-sources"] });
    }
  }, [progress.data, client]);
  function changeView(v: View) {
    if (view === "overview") setMonth(month);
    if (!isAdmin && ["team", "settings"].includes(v)) return;
    setView(v);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function demoOnly() {
    setNotice("Demo-Modus. Für eigene Daten ist eine Anmeldung erforderlich.");
  }
  async function startJob(kind: string) {
    if (demo) {
      demoOnly();
      return;
    }
    try {
      const r = await api<{ id: string }>(kind, {
        method: "POST",
        body: JSON.stringify({
          month,
          ...(view === "channels" ? { channel } : {}),
        }),
      });
      setJob(r.id);
      setJobKind(kind);
      setNotice("Auftrag gestartet. Die Anwendung bleibt verfügbar.");
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      client.clear();
      location.assign("/");
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  function enterDemo() {
    setDemo(true);
    history.replaceState(null, "", "/?demo=1");
  }
  function leaveDemo() {
    if (STATIC_DEMO) {
      setNotice(
        "Öffentliche Hackathon-Demo mit Beispieldaten. Die Vollversion ist separat geschützt.",
      );
      return;
    }
    setDemo(false);
    history.replaceState(null, "", "/");
    client.invalidateQueries({ queryKey: ["me"] });
  }
  if (location.pathname === "/invite")
    return (
      <Login
        invite
        onSuccess={() => {
          location.href = "/";
        }}
        allowDemo={false}
        onDemo={enterDemo}
      />
    );
  if (!demo && me.isPending)
    return (
      <div className="auth-shell">
        <Loading />
      </div>
    );
  if (!demo && !me.data)
    return (
      <Login
        sessionExpired={
          new URLSearchParams(location.search).get("session") === "expired"
        }
        onSuccess={() => {
          const url = new URL(location.href);
          url.searchParams.delete("session");
          history.replaceState(null, "", url);
          client.invalidateQueries({ queryKey: ["me"] });
        }}
        allowDemo={!!publicConfig.data?.demo_enabled}
        onDemo={enterDemo}
      />
    );
  const d = data.data;
  const a = analysis.data;
  const recommendationAnalysis = a?.recommendations?.length ? a : d ? {status:"rules",summary:"Regelbasierte Handlungshinweise aus vorhandenen Kennzahlen – keine KI-Analyse.",recommendations:metricRecommendations(d)} : undefined;
  const selected = d?.channels.find((c) => c.id === channel) || d?.channels[0];
  const connected =
    d?.channels.filter((c) => c.status === "connected").length || 0;
  const isAds = view === "channels" && channel === "linkedin";
  const inlineChannelActions = view === "channels" || view === "channel-directory";
  const periodControls = (
    <div className="intro-actions">
      {["overview", "posts", "channels", "audience", "videos"].includes(
        view,
      ) && (
        <button
          className="button primary"
          disabled={!!job || !isAdmin}
          onClick={() => startJob("/sync")}
        >
          <RefreshCw
            size={16}
            className={job && jobKind === "/sync" ? "spin" : ""}
          />
          {job ? "Wird aktualisiert" : "Daten aktualisieren"}
        </button>
      )}
    </div>
  );
  const dashboardActions = (
    <div className="detail-toolbar" id="channel-action-toolbar">
      {periodControls}
      {data.data &&
        !isAds &&
        ["posts", "channels", "audience", "videos"].includes(view) && (
          <CSVExport key={`${month}-${demo}`} data={data.data} demo={demo} />
        )}
    </div>
  );

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Zum Inhalt
      </a>
      {mobile && (
        <button
          className="mobile-backdrop"
          onClick={() => setMobile(false)}
          aria-label="Navigation schliessen"
        />
      )}
      <aside
        aria-label="Workspace-Navigation"
        className={"sidebar " + (mobile ? "open" : "")}
      >
        <a className="brand" href={asset(demo ? "?demo=1" : "")}>
          <img src={asset("brand/sonio-light.svg")} alt="Sonio" />
          <span>insights</span>
        </a>
        <nav aria-label="Hauptnavigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              aria-current={(view === id || id === "channel-directory" && view === "channels") ? "page" : undefined}
              className={"nav-item " + ((view === id || id === "channel-directory" && view === "channels") ? "active" : "")}
              onClick={() => changeView(id)}
            >
              <Icon size={19} strokeWidth={1.7} />
              <span>{label}</span>
              {id === "insights" && !!a?.recommendations.length && (
                <span className="nav-count">{a.recommendations.length}</span>
              )}
            </button>
          ))}
          <div className="nav-separator" />
          {adminNav
            .filter((n) => isAdmin || n.id === "sources")
            .map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                aria-current={view === id ? "page" : undefined}
                className={"nav-item " + (view === id ? "active" : "")}
                onClick={() => changeView(id)}
              >
                <Icon size={19} strokeWidth={1.7} />
                <span>{label}</span>
              </button>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="profile">
            <span className="avatar">
              {demo ? "SM" : me.data?.username.slice(0, 2).toUpperCase()}
            </span>
            <span>
              <strong>{demo ? "Sonio Marketing" : me.data?.username}</strong>
              <small>
                {demo
                  ? "Demo-Workspace"
                  : isAdmin
                    ? "Master-Admin"
                    : "Teammitglied"}
              </small>
            </span>
            <button
              className="icon-button"
              onClick={demo ? leaveDemo : logout}
              aria-label={demo ? "Zur Anmeldung" : "Abmelden"}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={mobile}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Menü öffnen"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {[...navigation, ...adminNav].find((n) => n.id === (view === "channels" ? "channel-directory" : view))?.label ||
                "Übersicht"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className={"status-dot " + (demo ? "demo" : "")} />
            <span>{demo ? "Demo-Workspace" : "Geschützter Workspace"}</span>
            <span className="topbar-divider" />
            <span className="small">
              {publicConfig.data?.timezone || "Europe/Zurich"}
            </span>
            <span className="avatar small-avatar">
              {demo ? "SM" : me.data?.username.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </header>
        <RecommendationContext.Provider value={{periodLabel:monthName(month),channels:d?.channels||[],items:recommendationAnalysis?.recommendations||[],scope:view==='channels'&&channel?[channel]:view==='videos'?['linkedin_organic','youtube']:[],onSelect:setRec,onAll:scope=>{setRecommendationScope(scope);changeView('recommendations');}}}>
        <main
          id="main"
          className={`analysis-workspace view-${view} ${channel === "analytics" && view === "channels" ? "analytics-detail" : ""} ${channel === "linkedin_organic" && view === "channels" ? "organic-detail" : ""}`}
        >
          {view === "overview" ? (
            <>
              <div className="marketing-mast">
                <span>Performance &amp; Insight</span>
                <h1>Wirkung im Blick.</h1>
              </div>
              <section className="marketing-hero" aria-label="Sonio Insights">
                <img
                  src={asset("brand/sonio-blog-header.jpg")}
                  alt="Berglandschaft mit Gipfel und Zielflagge"
                />
                <div>

                  <h2>
                    Marketing mit Überblick.
                  </h2>
                  <p>
                    Alle Kanäle verstehen. Die nächsten Schritte erkennen.
                  </p>
                </div>
              </section>
              <p className="marketing-pitch">Der Marketing Performance &amp; Insight Agent bündelt die Kanalzahlen, macht Entwicklungen verständlich und unterstützt bei der Priorisierung der nächsten Schritte – für weniger Reporting-Aufwand und fundierte Marketingentscheidungen.</p>
            </>
          ) : view === "search" ? <SearchHero/> : view === "channel-directory" ? <><div className="marketing-mast"><h1>Marketingkanäle.</h1></div><section className="marketing-hero"><img src={asset("brand/sonio-blog-header.jpg")} alt="Berglandschaft mit Fahrer und Zielflagge"/><div><h2>Alle Kanäle. Klar im Blick.</h2><p>Entwicklungen erkennen. Gezielt tiefer einsteigen.</p></div></section><p className="directory-intro">Die Marketingkanäle auf einen Blick: Die wichtigsten Monatszahlen und ihre Entwicklung zeigen, wo sich ein genauerer Blick lohnt. Im jeweiligen Kanal stehen weitere Kennzahlen, Inhalte und vertiefte Auswertungen bereit.</p></> : view === "channels" && channel === "google_ads" ? <GoogleAdsHero /> : view === "channels" && channel === "mailchimp" ? <MailchimpHero /> : view === "channels" && channel === "analytics" ? <AnalyticsHero /> : view === "videos" ? <VideoInsightsHero /> : view === "channels" && channel === "linkedin_organic" ? <LinkedInHero /> : view === "channels" && channel === "linkedin" ? <LinkedInAdsHero /> : view === "channels" && channel === "youtube" ? <YouTubeHero /> : (
            <div className="page-intro photographic-intro">
              {
                <svg
                  className="header-photo channel-flag-photo"
                  viewBox="0 0 1600 900"
                  preserveAspectRatio="xMaxYMin slice"
                  aria-hidden="true"
                >
                  <image
                    href={asset("brand/sonio-blog-header.jpg")}
                    width="1600"
                    height="900"
                  />
                  <defs>
                    <clipPath id="channel-flag-outline">
                      <path d="M1346 54 C1385 49 1426 57 1481 53 L1484 107 C1485 121 1491 133 1481 146 C1467 161 1460 174 1432 181 C1406 188 1382 184 1364 195 Z" />
                    </clipPath>
                    <linearGradient
                      id="channel-flag-folds"
                      x1="0"
                      x2="1"
                      y1="0"
                      y2="0"
                    >
                      <stop offset="0" stopColor="#000" stopOpacity=".18" />
                      <stop offset=".24" stopColor="#fff" stopOpacity=".12" />
                      <stop offset=".48" stopColor="#000" stopOpacity=".2" />
                      <stop offset=".7" stopColor="#fff" stopOpacity=".14" />
                      <stop offset=".88" stopColor="#000" stopOpacity=".18" />
                      <stop offset="1" stopColor="#fff" stopOpacity=".06" />
                    </linearGradient>
                  </defs>
                  {view !== "recommendations" && <g clipPath="url(#channel-flag-outline)">
                    <foreignObject x="1340" y="47" width="156" height="153">
                      <div className="flag-channel-mark">
                        {!["channels", "posts", "audience"].includes(view) ? (
                          <img
                            className="flag-sonio-logo"
                            src={asset("brand/sonio.svg")}
                            alt="Sonio"
                          />
                        ) : (
                          <ChannelIcon
                            id={
                              view === "channels"
                                ? selected?.id || channel
                                : "linkedin_organic"
                            }
                            size={156}
                          />
                        )}
                      </div>
                    </foreignObject>
                    <rect
                      x="1340"
                      y="47"
                      width="156"
                      height="153"
                      fill="url(#channel-flag-folds)"
                    />
                  </g>}
                </svg>
              }
              <div className="intro-copy">
                <h1>
                  {view === "channels"
                    ? selected?.name || "Kanal im Detail"
                    : titles[view] || titles.overview}
                </h1>
                <p>
                  {view === "audience"
                      ? "Neue Follower pro Monat und dokumentierte Gesamtstände der Unternehmensseite."
                      : view === "posts"
                        ? "Videos, Beiträge und ihre Ergebnisse seit Veröffentlichung."
                        : view === "channels"
                          ? channelDescriptions[channel] ||
                            "Kennzahlen und Inhalte dieses Marketingkanals im Überblick."
                          : view === "sources"
                            ? "Verbindungen verwalten, Daten prüfen und Anmeldelisten importieren."
                            : view === "recommendations"
                              ? "Empfehlungen nach Kanälen und Themenbereichen bündeln, nächste Schritte priorisieren und gezielt umsetzen."
                            : view === "insights"
                              ? "Nachvollziehbare Interpretationen. Konkrete Handlungsempfehlungen."
                              : view === "reports"
                                ? "Alle Kennzahlen und Empfehlungen als nachvollziehbarer Monatsstand."
                                : view === "team"
                                  ? "Team einladen und Zugriff auf Kennzahlen verwalten."
                                  : "Kennzahlen, Datenaktualisierung und automatisches Reporting."}
                </p>
              </div>
            </div>
          )}
          {view !== "search" && view !== "overview" && view !== "videos" && !inlineChannelActions && dashboardActions}
          {demo && (
            <div className="demo-banner">
              <Info size={16} />
              <span>
                <strong>Ein Blick auf die Möglichkeiten.</strong> Illustrative
                Beispieldaten. Diese Ansicht enthält keine Live-Daten.
              </span>
              {!STATIC_DEMO && (
                <button onClick={leaveDemo}>
                  Mit eigenen Daten starten <ArrowRight size={15} />
                </button>
              )}
            </div>
          )}
          {analysis.isError && (
            <div role="alert" className="info-strip">
              <Info size={18} />
              <span>
                Die Analyse konnte nicht geladen werden:{" "}
                {analysis.error.message}
              </span>
              <button
                className="text-button"
                onClick={() => analysis.refetch()}
              >
                Erneut laden
              </button>
            </div>
          )}
          {data.isPending ? (
            <Loading />
          ) : data.isError ? (
            <Empty title="Daten konnten nicht geladen werden">
              <span>{data.error.message}</span>
              <button className="button" onClick={() => data.refetch()}>
                Erneut versuchen
              </button>
            </Empty>
          ) : (
            d && (
              <>
                {view === "overview" && (
                  <>
                    <OverviewHighlights dashboard={d} periodControl={<label className="overview-period-select"><CalendarDays size={16} aria-hidden="true"/><select aria-label="Monat der Übersicht" value={month} onChange={e=>setMonth(e.target.value)}>{Array.from({length:12},(_,i)=>{const [y,m]=currentMonth.split('-').map(Number);const value=new Date(Date.UTC(y,m-1-i,1)).toISOString().slice(0,7);return <option key={value} value={value}>{monthName(value)}</option>})}{month < new Date(Date.UTC(Number(currentMonth.slice(0,4)),Number(currentMonth.slice(5,7))-12,1)).toISOString().slice(0,7) && <option value={month}>{monthName(month)}</option>}</select><PeriodInfo>{month===currentMonth?'Aktueller Monat bis zum letzten verfügbaren Datenstand.':'Monatswerte für den ausgewählten Zeitraum.'} Kennzahlen, Vergleich und CSV folgen dieser Auswahl. Fehlende Werte werden nicht durch ältere Zahlen ersetzt.</PeriodInfo></label>} />
                    <ChannelOverview
                      actions={
                        <div className="overview-channel-actions">
                          <button
                            className="button primary"
                            disabled={!!job || !isAdmin}
                            onClick={() => startJob("/sync")}
                          >
                            <RefreshCw
                              size={16}
                              className={
                                job && jobKind === "/sync" ? "spin" : ""
                              }
                            />
                            {job ? "Wird aktualisiert" : "Daten aktualisieren"}
                          </button>
                          <CSVExport
                            key={`${month}-${demo}`}
                            data={d}
                            demo={demo}
                          />
                          <button
                            className="icon-button"
                            disabled={!isAdmin}
                            aria-label="Kennzahlen anpassen"
                            title={
                              d.definitions_confirmed
                                ? "Eigene Kennzahlen anpassen"
                                : "Vorläufige Kennzahlen anpassen"
                            }
                            onClick={() => setMetricModal(true)}
                          >
                            <SlidersHorizontal size={15} />
                          </button>
                        </div>
                      }
                      status={
                        demo
                          ? "8 Kanäle in der Demo"
                          : `${connected} von ${d.channels.length} Kanälen verbunden`
                      }
                      freshness={
                        <span>
                          {demo
                            ? "Illustrative Monatswerte für die Präsentation. Keine Live-Aktualisierung."
                            : `${month === currentMonth ? "Aktueller Monat" : "Ausgewählter Monat"} · Anzeige wird jede Minute neu geladen.`}
                          Datenstand je Kanal gemäss letztem erfolgreichen
                          Abruf; die Schnittstellen können verzögert liefern.
                        </span>
                      }
                      channels={d.channels}
                      demo={demo}
                      month={month}
                      onSelect={(c) => {
                        setChannel(c.id);
                        changeView("channels");
                      }}
                    />
                    <OverviewExplore demo={demo} onOpen={changeView}/>
                    <RecommendationTeaser/>
                    <MarketingQuote />
                  </>
                )}
                {["audience", "posts", "insights", "recommendations", "reports"].includes(
                  view,
                ) && (
                  <label className="content-month">
                    <span className="period-control-label"><CalendarDays size={19} aria-hidden="true"/>Zeitraum</span>
                    <input
                      aria-label="Berichtsmonat im Inhaltsbereich"
                      type="month"
                      value={month}
                      onChange={(e) => {
                        if (/^20\d{2}-(0[1-9]|1[0-2])$/.test(e.target.value))
                          setMonth(e.target.value);
                      }}
                    />
                  </label>
                )}
                {view === "search" && <SearchInsights demo={demo}/>}
                {view === "videos" && <VideoInsights demo={demo} actions={dashboardActions} onChannel={id=>{setChannel(id);changeView("channels")}} />}
                {view === "audience" && <Audience month={month} demo={demo} />}
                {view === "posts" && (
                  <PostCollection key={month} month={month} demo={demo} />
                )}
                {view === "channel-directory" && <ChannelDirectory data={d} onSelect={c => {setChannel(c.id); changeView("channels");}}/>}
                {view === "channels" && (
                  <>
                    {channel !== "linkedin_organic" && <>
                    <button
                      className="text-button back-to-overview"
                      onClick={() => changeView("channel-directory")}
                    >
                      <ChevronLeft size={16} /> Alle Kanäle im Überblick
                    </button>
                    {["google_ads","analytics"].includes(channel)&&<button className="text-button" onClick={()=>changeView("search")}>Suchbegriffe &amp; Potenziale öffnen</button>}
                    {channel === "google_ads" && <GoogleAds month={month} onMonth={setMonth} demo={demo} />}
                    {isAds && (
                      <AdsCampaigns demo={demo} actions={dashboardActions} />
                    )}
                    {channel === "mailchimp" && (
                      <MailchimpCampaigns
                        demo={demo}
                        actions={dashboardActions}
                      />
                    )}
                    {channel === "youtube" && (
                      <YouTubeVideos demo={demo} actions={dashboardActions} />
                    )}
                    </>}
                    {selected && channel === "linkedin_organic" && <LinkedInOrganic data={d} demo={demo} analysis={a} onMonth={setMonth} onRecommendation={setRec} onAll={() => changeView("recommendations")} actions={dashboardActions} />}
                    {selected &&
                      channel !== "linkedin_organic" &&
                      !isAds &&
                      channel !== "mailchimp" &&
                      channel !== "youtube" && channel !== "google_ads" && (
                        <>
                          <div className="section-heading">
                            <div className="channel-title">
                              <ChannelIcon id={selected.id} size={25} />
                              <div>
                                <h2>
                                  {selected.name}{" "}
                                  <span className="kpi-period">
                                    {monthName(d.month)}{" "}
                                    <PeriodInfo>
                                      Monatswerte für den gewählten Zeitraum.
                                      Der laufende Monat ist unvollständig.
                                      Datenstand gemäss letztem erfolgreichen
                                      Abruf; die Schnittstellen können verzögert
                                      liefern.
                                    </PeriodInfo>
                                  </span>
                                </h2>
                                <p>
                                  {selected.type} · {selected.message}
                                </p>
                              </div>
                            </div>
                            {inlineChannelActions && dashboardActions}
                          </div>
                          <div className="kpi-grid">
                            {Object.entries(selected.fields).map(
                              ([key, label]) => (
                                <KPICard
                                  key={key}
                                  kpi={{
                                    channel: selected.id,
                                    key,
                                    label,
                                    value: selected.values[key] ?? null,
                                    previous: selected.previous[key] ?? null,
                                    unit: selected.units[key] || "count",
                                    target: null,
                                    change: change(
                                      selected.values[key],
                                      selected.previous[key],
                                    ),
                                  }}
                                />
                              ),
                            )}
                          </div>
                          {selected.id === "analytics" && (
                            <AnalyticsMonthlySources
                              month={d.month}
                              demo={demo}
                            />
                          )}
                          <PerformanceExplorer
                            key={`channel-${channel}`}
                            onMonth={setMonth}
                            data={d}
                            channel={channel}
                            demo={demo}
                          />
                          {selected.id === "analytics" && (
                            <AnalyticsContent demo={demo} />
                          )}
                          {selected.id === "linkedin_organic" && (
                            <div className="channel-detail-links">
                              <button
                                className="button"
                                onClick={() => changeView("audience")}
                              >
                                <Users size={18} /> Follower-Entwicklung
                              </button>
                              <button
                                className="button"
                                onClick={() => changeView("posts")}
                              >
                                <FileText size={18} /> Alle Posts & Videos
                              </button>
                            </div>
                          )}
                          {selected.id === "analytics" ? (
                            <KpiExplainer
                              key={selected.id}
                              channel={selected.id}
                              fields={selected.fields}
                              variant="knowledge"
                              dataStatus={selected.last_success
                                ? "Letzter erfolgreicher Abruf: " + new Date(selected.last_success).toLocaleString("de-CH")
                                : "Noch kein erfolgreicher Live-Abruf."}
                            />
                          ) : (
                          <section className="panel detail-definitions">
                            <h2>Kennzahlen verstehen</h2>
                            <KpiExplainer
                              key={selected.id}
                              channel={selected.id}
                              fields={selected.fields}
                            />
                            <p>
                              {selected.id === "events"
                                ? "Anmeldungen werden innerhalb jeder Event-Liste anhand der E-Mail-Adresse dedupliziert. Sie sind keine bestätigten Teilnahmen. Das Datum ist das Anmeldedatum."
                                : selected.id === "mailchimp"
                                  ? "Öffnungen und Klickende werden je Kampagne gezählt und dem Versanddatum zugeordnet. Die Summe über Kampagnen ist keine eindeutige Personenanzahl."
                                  : selected.id === "analytics"
                                    ? "Sitzungen, engagierte Sitzungen und Schlüsselereignisse stammen direkt aus GA4. Schlüsselereignisse richten sich nach eurer Property-Konfiguration."
                                    : "Die Messwerte und Attribution stammen aus der jeweiligen Plattform. Conversions verschiedener Kanäle können dieselbe Person oder Aktion enthalten."}
                            </p>
                            <p className="muted">
                              Fehlende Werte erscheinen als „—“.{" "}
                              {selected.last_success
                                ? "Letzter erfolgreicher Abruf: " +
                                  new Date(
                                    selected.last_success,
                                  ).toLocaleString("de-CH")
                                : "Noch kein erfolgreicher Live-Abruf."}
                            </p>
                          </section>
                          )}
                          {selected.id === "qr" && <EditorialQuote portrait={asset("brand/portraits/neil-armstrong-v2.png")} text="That’s one small step for [a] man, one giant leap for mankind." author="Neil Armstrong" role="Astronaut" source="https://www.nasa.gov/history/SP-4225/documentation/brief-history/history.htm"/>}
                          {selected.id === "events" && <EditorialQuote portrait={asset("brand/portraits/tina-turner-v1.png")} text="It’s for the people and it’s for the song and it’s for the moment." author="Tina Turner" role="Sängerin und Bühnenikone" source="https://www.cbsnews.com/news/proud-tina-a-life-well-lived/"/>}
                          {selected.id === "analytics" && <><RecommendationTeaser/><EditorialQuote portrait={asset('brand/portraits/michelle-obama-v1.png')} text="Success isn’t about how much money you make, it’s about the difference you make in people’s lives." author="Michelle Obama" role="Autorin und ehemalige First Lady" source="https://obamawhitehouse.archives.gov/the-press-office/2012/09/05/remarks-first-lady-democratic-national-convention/"/></>}
                        </>
                      )}
                  </>
                )}
                {view === "recommendations" && <><ChannelRecommendations onOpenArea={changeView} initialChannels={recommendationScope} channels={d.channels} items={recommendationAnalysis?.recommendations||[]} onSelect={setRec}/><EditorialQuote portrait={asset('brand/portraits/roger-federer-v1.png')} text="When you lose every second point, on average, you learn not to dwell on every shot." author="Roger Federer" role="Tennislegende und Unternehmer" source="https://home.dartmouth.edu/news/2024/06/2024-commencement-address-roger-federer"/></>}
                {view === "insights" && (
                  <>
                    <div className="analysis-summary">
                      <Lightbulb size={26} />
                      <div>
                        <h2>Die Einordnung für {monthName(month)}</h2>
                        <p>{a?.summary || "Noch keine Analyse verfügbar."}</p>
                        <span className="muted small">
                          {demo
                            ? "Beispielanalyse"
                            : a?.model
                              ? "Modell: " + a.model
                              : "OpenRouter-Auswertung"}{" "}
                          · Empfehlungen werden nicht automatisch umgesetzt.
                        </span>
                      </div>
                      <button
                        className="button primary"
                        onClick={() => startJob("/analysis")}
                        disabled={!!job || !isAdmin}
                      >
                        <RefreshCw size={15} />
                        Analyse erstellen
                      </button>
                    </div>
                    {a?.recommendations.length ? (
                      <div className="insight-list">
                        {a.recommendations.map((r, i) => (
                          <RecommendationCard
                            key={i}
                            r={r}
                            onClick={() => setRec(r)}
                          />
                        ))}
                      </div>
                    ) : (
                      <Empty title="Erkenntnisse beginnen mit Daten">
                        Sobald Messwerte und OpenRouter konfiguriert sind, kann
                        die erste Analyse erstellt werden.
                      </Empty>
                    )}
                    <div className="info-strip">
                      <ShieldCheck size={18} />
                      Jede Empfehlung enthält ihre Datenreferenzen, einen
                      konkreten nächsten Schritt und die Grenzen der Aussage.
                    </div>
                  </>
                )}
                {view === "sources" && (
                  <Sources
                    interval={publicConfig.data?.sync_interval_minutes || 60}
                    channels={d.channels}
                    demo={demo}
                    isAdmin={isAdmin}
                    onNotice={setNotice}
                    onRefresh={() => {
                      client.invalidateQueries({ queryKey: ["dashboard"] });
                      client.invalidateQueries({ queryKey: ["analysis"] });
                    }}
                  />
                )}
                {view === "reports" && (
                  <>
                  <Reports
                    timezone={publicConfig.data?.timezone || "Europe/Zurich"}
                    hour={publicConfig.data?.report_hour ?? 8}
                    demo={demo}
                    month={month}
                    data={d}
                    analysis={a}
                    canEdit={isAdmin}
                    busy={!!job}
                    onCreate={() => startJob("/reports")}
                    onNotice={setNotice}
                  />
                  <EditorialQuote portrait={asset("brand/portraits/bill-gates-v1.png")} text="You can achieve amazing progress if you set a clear goal and find a measure that will drive progress toward that goal." author="Bill Gates" role="Microsoft-Mitgründer" source="https://www.gatesfoundation.org/ideas/annual-letters/annual-letter-2013"/>
                  </>
                )}
                {view === "team" && isAdmin && (
                  <Team demo={demo} onNotice={setNotice} />
                )}
                {view === "settings" && isAdmin && (
                  <SettingsView
                    demo={demo}
                    onMetrics={() => setMetricModal(true)}
                  />
                )}
              </>
            )
          )}
          <footer className="page-footer">
            <span>
              Sonio Insights<span className="footer-dot">.</span> Klarheit für
              Marketing.
            </span>
            <span>
              {demo
                ? "Beispieldaten · Keine Live-Verbindung"
                : "Geschützter Zugriff · Sonio Marketing"}
              <ShieldCheck size={14} />
            </span>
          </footer>
        </main>
        </RecommendationContext.Provider>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Info size={18} />
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Meldung schliessen"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <Modal
        open={!!rec}
        onClose={() => setRec(null)}
        title={rec?.title || "Empfehlung"}
        description="Die Einordnung hinter der Empfehlung"
      >
        {rec && (
          <div className="rec-detail">
            <div className="detail-label">
              <ChannelIcon id={rec.channel} />
              <span>{d?.channels.find((c) => c.id === rec.channel)?.name || recommendationAreas.find(c=>c.id===rec.channel)?.name}</span>
              <span className={"priority " + rec.priority}>
                {rec.priority === "high"
                  ? "Hohe Priorität"
                  : rec.priority === "medium"
                    ? "Mittlere Priorität"
                    : "Niedrige Priorität"}
              </span>
            </div>
            <h3>Beobachtung</h3>
            <p>{rec.observation}</p>
            <h3>Nächster Schritt</h3>
            <p>{rec.action}</p>
            <h3>Hinweise zur Einordnung</h3>
            <p>{rec.caveat}</p>
            <h3>Datenbasis</h3>
            {rec.evidence.map((e) => (
              <div className="evidence" key={e}>
                <CheckCircle2 size={15} />
                {e}
              </div>
            ))}
          </div>
        )}
      </Modal>
      {d && isAdmin && (
        <MetricsEditor
          open={metricModal}
          onClose={() => setMetricModal(false)}
          dashboard={d}
          demo={demo}
          onNotice={setNotice}
          onSaved={() => {
            client.invalidateQueries({ queryKey: ["dashboard"] });
            client.invalidateQueries({ queryKey: ["analysis"] });
          }}
        />
      )}
    </div>
  );
}

function change(v: number | undefined, p: number | undefined) {
  return v == null || p == null || p === 0
    ? null
    : Math.round(((v - p) / Math.abs(p)) * 1000) / 10;
}
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob(["\ufeff" + content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function KPICard({
  kpi: k,
  onClick,
  comparisonMonth,
  comparisonEnd,
}: {
  kpi: KPI;
  onClick?: () => void;
  comparisonMonth?: string;
  comparisonEnd?: string;
}) {
  const body = (
    <>
      <div className="kpi-top">
        <span>{k.label}{k.channel === "analytics" && !onClick && <AnalyticsInfo metric={k.key} label={k.label} monthly/>}</span>
      </div>
      <strong className="kpi-value">{number(k.value, k.unit)}</strong>
      <div className="kpi-comparison">
        <Change value={k.change} />
        {k.channel === "analytics" && !onClick && <AnalyticsInfo metric="comparison" label="Entwicklung zur Vorperiode" monthly/>}
        <span>
          {comparisonMonth
            ? `gegenüber ${monthName(comparisonMonth)}${comparisonEnd ? ` bis ${Number(comparisonEnd.slice(8))}.` : ""}`
            : "zum Vergleichszeitraum"}
        </span>
        <span className="kpi-previous">
          Vorperiode: {number(k.previous, k.unit)}
        </span>
      </div>
      {k.target !== null && (
        <span className="small muted">Ziel: {number(k.target, k.unit)}</span>
      )}
    </>
  );
  return onClick ? (
    <button className="kpi-card" onClick={onClick}>
      {body}
    </button>
  ) : (
    <article className="kpi-card">{body}</article>
  );
}
function ChannelOverview({
  channels,
  demo,
  month,
  onSelect,
  actions,
  freshness,
  status,
}: {
  actions: React.ReactNode;
  freshness: React.ReactNode;
  status: string;
  channels: Channel[];
  demo: boolean;
  month: string;
  onSelect: (channel: Channel) => void;
}) {
  return (
    <section className="channel-overview" aria-label="Alle Marketingkanäle">
      <div className="section-heading">
        <div>
          <h2>Alle Kanäle. Ein Überblick.</h2>
          <div className="overview-period-status">
            <span
              className="overview-month-help"
              tabIndex={0}
              aria-describedby="overview-month-tooltip"
            >
              <CalendarDays size={15} /> {monthName(month)} <Info size={13} />
              <span
                className="overview-month-tooltip"
                id="overview-month-tooltip"
                role="tooltip"
              >
                {freshness}
              </span>
            </span>
            <span className="overview-connected">{status}</span>
          </div>
        </div>
        {actions}
      </div>
      <div className="channel-overview-grid">
        {[...channels]
          .sort(
            (a, b) =>
              Number(!!b.last_success || b.status === "connected") -
              Number(!!a.last_success || a.status === "connected"),
          )
          .map((c) => {
            const hasValues = Object.values(c.values).some(
              (value) => value != null,
            );
            const status = demo
              ? "Beispieldaten"
              : c.status === "connected"
                ? "Verbunden"
                : c.last_success
                  ? "Gespeicherter Datenstand"
                  : c.status === "error"
                    ? "Verbindung prüfen"
                    : "Noch nicht verbunden";
            const secondary = overviewSecondaryMetric(c);
            const keys = secondary ? [secondary] : [];
            return (
              <article
                key={c.id}
                className={`channel-entry ${hasValues ? "has-data" : ""}`}
              >
                <button className="channel-entry-open" onClick={()=>onSelect(c)} aria-label={`${c.name} öffnen`}/>
                <div className="channel-entry-heading">
                  <ChannelIcon id={c.id} size={44} />
                  <div>
                    <h3>{c.name}</h3>
                    <span>{c.type}</span>
                  </div>
                  <ArrowRight className="channel-entry-arrow" size={20} />
                </div>
                <span
                  className={`channel-entry-status ${c.status === "connected" && !demo ? "is-connected" : ""}`}
                >
                  {status}
                </span>
                {hasValues && keys.length ? (
                  <dl className="channel-entry-values">
                    {keys.map((key) => (
                      <div key={key}>
                        <dt>{channelMetricLabel(c, key)} <PeriodInfo label={`${channelMetricLabel(c,key)} erklärt`}>{overviewMetricHelp(c,key)}</PeriodInfo></dt>
                        <dd>
                          {number(c.values[key], c.units[key])}
                          {c.units[key] && c.units[key] !== "count"
                            ? ` ${c.units[key]}`
                            : ""}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="channel-entry-empty">
                    {hasValues && !keys.length ? 'Details und Entwicklung im Kanal ansehen.' : c.last_success || c.status === "connected"
                      ? `Keine Kennzahlen für ${monthName(month)} vorhanden.`
                      : "Nach der Anbindung erscheinen hier die Kennzahlen."}
                  </p>
                )}
                <div className="channel-entry-footer">
                  <span>
                    {c.last_success && !demo
                      ? `Datenstand ${new Date(c.last_success).toLocaleString("de-CH", { timeZone: "Europe/Zurich", dateStyle: "short", timeStyle: "short" })}`
                      : demo || c.status === "connected"
                        ? monthName(month)
                        : "Einrichtung ausstehend"}
                  </span>

                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}

function RecommendationCard({
  r,
  onClick,
}: {
  r: Recommendation;
  onClick: () => void;
}) {
  return (
    <button className="recommendation-card" onClick={onClick}>
      <div className="rec-card-top">
        <ChannelIcon id={r.channel} />
        <span className={"priority " + r.priority}>
          {r.priority === "high"
            ? "Hohe Priorität"
            : r.priority === "medium"
              ? "Mittlere Priorität"
              : "Niedrige Priorität"}
        </span>
      </div>
      <h3>{r.title}</h3>
      <p>{r.observation}</p>
      <span className="rec-card-link">
        Empfehlung ansehen <ArrowUpRight size={17} />
      </span>
    </button>
  );
}

function Login({
  invite = false,
  sessionExpired = false,
  onSuccess,
  allowDemo,
  onDemo,
}: {
  invite?: boolean;
  sessionExpired?: boolean;
  onSuccess: () => void;
  allowDemo: boolean;
  onDemo: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await api(invite ? "/auth/invite/accept" : "/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
          ...(invite
            ? {
                token:
                  new URLSearchParams(location.hash.slice(1)).get("token") ||
                  "",
              }
            : {}),
        }),
      });
      if (invite) {
        setAccepted(true);
        history.replaceState(null, "", "/invite");
      } else onSuccess();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-layout login-panorama">
      <div className="login-scene">
        <img
          className="login-landscape"
          src={asset("brand/sonio-blog-header.jpg")}
          alt="Berglandschaft mit Gipfel und Zielflagge"
        />
        <header className="login-image-brand">
          <img src={asset("brand/sonio-light.svg")} alt="Sonio" />
          <div>
            <span>Marketing</span>
            <h1>Performance &amp; Insights</h1>
          </div>
        </header>
        <section className="login-form-area">
          <div className="login-box">
            {(invite || accepted || sessionExpired) && (
              <div className="login-context">
                <h2>
                  {accepted
                    ? "Das Konto ist bereit."
                    : invite
                      ? "Willkommen im Team."
                      : "Erneut anmelden"}
                </h2>
                <p>
                  {accepted
                    ? "Die Anmeldung mit dem neuen Konto ist jetzt möglich."
                    : invite
                      ? "Benutzernamen und Passwort festlegen."
                      : "Die Sitzung ist abgelaufen. Bitte erneut anmelden."}
                </p>
              </div>
            )}
            {accepted ? (
              <a className="button primary" href="/">
                Zur Anmeldung <ArrowRight size={16} />
              </a>
            ) : (
              <form onSubmit={submit}>
                <label>
                  Benutzername
                  <input
                    name="username"
                    autoComplete="username"
                    required
                    minLength={invite ? 3 : 1}
                    maxLength={80}
                    placeholder="Benutzername"
                  />
                </label>
                <label>
                  Passwort
                  <input
                    name="password"
                    type="password"
                    autoComplete={invite ? "new-password" : "current-password"}
                    required
                    minLength={invite ? 12 : 1}
                    maxLength={256}
                    placeholder={invite ? "Mindestens 12 Zeichen" : "Passwort"}
                  />
                </label>
                {error && (
                  <p role="alert" className="form-error">
                    {error}
                  </p>
                )}
                <button className="button primary full" disabled={busy}>
                  {busy ? <LoaderCircle className="spin" size={16} /> : null}
                  {invite ? "Konto erstellen" : "Anmelden"}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
            {!invite && (
              <>
                <p className="login-help">Zugang über persönliche Einladung.</p>
                {allowDemo && (
                  <button className="button full" onClick={onDemo}>
                    Demo mit Beispieldaten
                    <ExternalLink size={15} />
                  </button>
                )}
              </>
            )}
          </div>
          <span className="login-footer">
            Sonio Insights · Geschützter Workspace
          </span>
        </section>
      </div>
    </div>
  );
}

const sourceInstructions: Record<
  string,
  { fields: string; steps: string; link: string }
> = {
  google_ads: {
    fields: "Google OAuth · Customer-ID · Developer Token",
    steps:
      "Google-Ads-API-Zugriff freigeben. OAuth-Zugang und Kontonummer in der Serverkonfiguration hinterlegen. Die Anwendung liest Kampagnendaten und verändert keine Anzeigen.",
    link: "https://developers.google.com/google-ads/api/docs/start",
  },
  analytics: {
    fields: "Google OAuth · GA4 Property-ID",
    steps:
      "Der Google-Nutzer benötigt Lesezugriff auf die GA4-Property. Property-ID und Google-OAuth-Konfiguration auf dem Server hinterlegen.",
    link: "https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries",
  },
  linkedin: {
    fields: "Marketing API · Ad-Account-ID · OAuth",
    steps:
      "LinkedIn Marketing API und r_ads_reporting benötigen genehmigten Zugriff. Der Zugriffstoken oder ein autorisierter Refresh-Token wird serverseitig konfiguriert.",
    link: "https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/ads-reporting",
  },
  linkedin_organic: {
    fields: "Community Management API · Organisations-ID",
    steps:
      "Für organische Kennzahlen werden Organisationszugriff und r_organization_social benötigt. Die Organisations-ID wird getrennt vom Werbekonto hinterlegt.",
    link: "https://learn.microsoft.com/en-us/linkedin/marketing/community-management/organizations/share-statistics",
  },
  mailchimp: {
    fields: "Marketing API-Key · Server-Präfix",
    steps:
      "Einen Mailchimp-API-Key und den Server-Präfix (z. B. us21) in der Serverkonfiguration hinterlegen. Der Import ordnet Kennzahlen nach Versanddatum zu.",
    link: "https://mailchimp.com/developer/marketing/api/reports/",
  },
  youtube: {
    fields: "YouTube Analytics · Kanal-ID · Google OAuth",
    steps:
      "Google-Zugang mit yt-analytics.readonly und Zugriff auf den gewünschten Kanal hinterlegen. YouTube-Werbedaten werden über Google Ads eingelesen.",
    link: "https://developers.google.com/youtube/analytics/reference/reports/query",
  },
  events: {
    fields: "Word-Datei oder Microsoft-365-Ordner",
    steps:
      "DOCX-Tabelle mit „E-Mail“ und „Anmeldedatum“ hochladen. Automatischer Import: Microsoft Graph mit Tenant-, Client-, Drive- und Ordner-ID konfigurieren. Gleiche Event-ID ersetzt die vorherige Liste.",
    link: "https://learn.microsoft.com/en-us/graph/api/driveitem-list-children",
  },
  qr: {
    fields: "Anbieter noch festzulegen · CSV-Import verfügbar",
    steps:
      "Bis zur Wahl des Anbieters lassen sich CSV-Dateien mit den Spalten date,scans importieren. Datum: JJJJ-MM-TT. Gleiche Quellen-ID ersetzt den bisherigen Import.",
    link: "",
  },
};
function Sources({
  channels,
  demo,
  isAdmin,
  onNotice,
  onRefresh,
  interval,
}: {
  interval: number;
  channels: Channel[];
  demo: boolean;
  isAdmin: boolean;
  onNotice: (s: string) => void;
  onRefresh: () => void;
}) {
  const [selected, setSelected] = useState<Channel | null>(null);
  const [upload, setUpload] = useState<"events" | "qr" | null>(null);
  const [busy, setBusy] = useState(false);
  async function importFile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demo) {
      onNotice("Importe sind im Demomodus deaktiviert. Bitte zuerst anmelden.");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      await api("/import/" + upload, { method: "POST", body: form });
      setUpload(null);
      onNotice("Import erfolgreich. Die Kennzahlen wurden aktualisiert.");
      onRefresh();
    } catch (e) {
      onNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="info-strip">
        <Clock3 size={18} />
        <span>
          Automatisch alle {interval} Minuten aktualisieren. Datenzugänge werden
          geschützt auf dem Server konfiguriert.
        </span>
      </div>
      <div className="source-grid">
        {channels.map((c) => (
          <section className="source-card" key={c.id}>
            <div className="source-head">
              <ChannelIcon id={c.id} size={23} />
              <span
                className={
                  "data-status " + (c.status === "connected" ? "good" : "")
                }
              >
                <span />
                {c.status === "connected"
                  ? "Verbunden"
                  : c.id === "qr"
                    ? "Anbieter offen"
                    : "Einrichtung erforderlich"}
              </span>
            </div>
            <h2>{c.name}</h2>
            <p>{sourceInstructions[c.id].fields}</p>
            <span className="source-meta">
              {c.last_success
                ? "Aktualisiert: " +
                  new Date(c.last_success).toLocaleString("de-CH")
                : "Noch keine Live-Daten synchronisiert"}
            </span>
            <div className="source-actions">
              <button className="button" onClick={() => setSelected(c)}>
                <Plug size={15} />
                Einrichtung
              </button>
              {["events", "qr"].includes(c.id) && isAdmin && (
                <button
                  className="text-button"
                  onClick={() => setUpload(c.id as "events" | "qr")}
                >
                  <Upload size={15} />
                  Importieren
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={
          selected ? selected.name + " verbinden" : "Datenquelle verbinden"
        }
        description="Verbindung einrichten"
      >
        {selected && (
          <div className="source-detail">
            <ChannelIcon id={selected.id} size={28} />
            <p>{sourceInstructions[selected.id].steps}</p>
            <div className="info-strip">
              <ShieldCheck size={20} />
              <span>
                API-Schlüssel und Tokens gehören in die geschützte
                Serverkonfiguration. Sie werden nicht im Browser gespeichert.
              </span>
            </div>
            {sourceInstructions[selected.id].link && (
              <a
                className="button"
                href={sourceInstructions[selected.id].link}
                target="_blank"
                rel="noreferrer"
              >
                Offizielle Dokumentation <ExternalLink size={15} />
              </a>
            )}
          </div>
        )}
      </Modal>
      <Modal
        open={!!upload}
        onClose={() => setUpload(null)}
        title={
          upload === "events"
            ? "Event-Liste importieren"
            : "QR-Messwerte importieren"
        }
        description={
          upload === "events"
            ? "DOCX-Tabelle mit E-Mail und Anmeldedatum. Maximal 10 MB."
            : "UTF-8 CSV mit date,scans. Maximal 1 MB."
        }
      >
        <form onSubmit={importFile}>
          <label>
            {upload === "events" ? "Event-ID" : "Quellen-ID"}
            <input
              name={upload === "events" ? "event_id" : "source_id"}
              required
              maxLength={80}
              placeholder={
                upload === "events"
                  ? "z. B. cloud-day-2026"
                  : "z. B. messestand-zuerich"
              }
            />
          </label>
          <p className="small muted">
            Eine bestehende ID ersetzt ihren bisherigen Import vollständig. Pro
            Event bzw. Quelle immer dieselbe ID verwenden.
          </p>
          <label className="file-field">
            <Upload size={24} />
            <span>
              {upload === "events"
                ? "Word-Datei auswählen"
                : "CSV-Datei auswählen"}
            </span>
            <input
              type="file"
              name="file"
              accept={upload === "events" ? ".docx" : ".csv"}
              required
            />
          </label>
          <button className="button primary full" disabled={busy}>
            {busy ? "Wird geprüft …" : "Datei prüfen und importieren"}
          </button>
        </form>
      </Modal>
    </>
  );
}

function Reports({
  demo,
  month,
  data,
  analysis,
  canEdit,
  busy,
  onCreate,
  onNotice,
  timezone,
  hour,
}: {
  timezone: string;
  hour: number;
  demo: boolean;
  month: string;
  data: Dashboard;
  analysis?: Analysis;
  canEdit: boolean;
  busy: boolean;
  onCreate: () => void;
  onNotice: (s: string) => void;
}) {
  const reports = useQuery({
    queryKey: ["reports", demo],
    queryFn: () => api<Report[]>("/reports"),
    enabled: !demo,
  });
  const [opened, setOpened] = useState<{
    month: string;
    snapshot: Dashboard;
    analysis: Analysis;
  } | null>(null);
  async function openReport(id: string) {
    try {
      setOpened(await api("/reports/" + id));
    } catch (e) {
      onNotice((e as Error).message);
    }
  }
  const list = demo
    ? [
        {
          id: "demo",
          month,
          created_at: month + "-03T08:00:00",
          delivery_status: "demo",
          analysis_status: "demo",
        },
      ]
    : reports.data || [];
  return (
    <>
      <div className="schedule-banner">
        <div className="schedule-visual">
          <CalendarDays size={27} />
          <strong>03</strong>
        </div>
        <div>
          <h2>Der Rückblick kommt automatisch.</h2>
          <p>
            Jeden 3. um {String(hour).padStart(2, "0")}:00 Uhr ({timezone}). Der
            vollständige Vormonat wird vor der Reporterstellung erneut
            abgerufen.
          </p>
          <span className="small muted">
            E-Mail-Zustellung wird aktiv, sobald Empfänger und Mailversand
            eingerichtet sind.
          </span>
        </div>
        <span className="outline-tag">
          <Clock3 size={14} />
          Monatlich
        </span>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Report-Archiv</h2>
            <p>
              Gespeicherte Monatsstände mit Interpretation und Empfehlungen.
            </p>
          </div>
          <button
            className="button primary"
            disabled={busy || !canEdit}
            onClick={onCreate}
          >
            <Plus size={16} />
            Report erstellen
          </button>
        </div>
        {reports.isError ? (
          <Empty title="Reports nicht erreichbar">
            {reports.error.message}
          </Empty>
        ) : list.length ? (
          <div className="report-list">
            {list.map((r) => (
              <div key={r.id} className="report-row">
                <span className="report-file">
                  <FileText size={24} />
                </span>
                <div>
                  <h3>Performance-Report {monthName(r.month)}</h3>
                  <p>
                    {demo
                      ? "Illustrative Vorschau"
                      : "Erstellt am " +
                        new Date(r.created_at).toLocaleDateString("de-CH")}{" "}
                    · Kennzahlen & Empfehlungen
                  </p>
                </div>
                <span className="outline-tag">
                  {demo
                    ? "Demo"
                    : r.delivery_status === "sent"
                      ? "Per E-Mail versandt"
                      : r.delivery_status === "failed"
                        ? "Versand fehlgeschlagen"
                        : "Im Dashboard"}
                </span>
                <button
                  className="button"
                  onClick={() =>
                    demo
                      ? setOpened({
                          month,
                          snapshot: data,
                          analysis: analysis || {
                            status: "demo",
                            summary: "Beispielreport",
                            recommendations: [],
                          },
                        })
                      : openReport(r.id)
                  }
                >
                  Ansehen <ArrowUpRight size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty title="Report-Archiv">
            Erstelle den ersten Report, sobald Daten für den ausgewählten Monat
            vorliegen.
          </Empty>
        )}
      </section>
      <Modal
        open={!!opened}
        onClose={() => setOpened(null)}
        title={
          opened ? "Performance-Report " + monthName(opened.month) : "Report"
        }
        description={
          demo
            ? "Beispielreport mit synthetischen Kennzahlen"
            : "Gespeicherter Monatsstand"
        }
        wide
      >
        {opened && (
          <div className="report-document">
            <p>{opened.analysis.summary}</p>
            <div className="report-kpis">
              {opened.snapshot.kpis.map((k) => (
                <div key={k.channel + k.key}>
                  <span>{k.label}</span>
                  <strong>{number(k.value, k.unit)}</strong>
                </div>
              ))}
            </div>
            {opened.analysis.recommendations.map((r, i) => (
              <article key={i}>
                <h3>{r.title}</h3>
                <p>{r.observation}</p>
                <p>
                  <strong>Nächster Schritt: </strong>
                  {r.action}
                </p>
                <p className="muted">{r.caveat}</p>
              </article>
            ))}
            <button
              className="button"
              onClick={() => {
                download(
                  "sonio-report-" + opened.month + ".txt",
                  [
                    demo ? "DEMOREPORT" : "MONATSREPORT",
                    monthName(opened.month),
                    opened.analysis.summary,
                    ...opened.snapshot.kpis.map(
                      (k) => k.label + ": " + number(k.value, k.unit),
                    ),
                    ...opened.analysis.recommendations.flatMap((r) => [
                      r.title,
                      r.observation,
                      r.action,
                      r.caveat,
                    ]),
                  ].join("\n\n"),
                  "text/plain;charset=utf-8",
                );
              }}
            >
              <Download size={16} />
              Report herunterladen
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}

function Team({
  demo,
  onNotice,
}: {
  demo: boolean;
  onNotice: (s: string) => void;
}) {
  const client = useQueryClient();
  const users = useQuery({
    queryKey: ["users", demo],
    queryFn: () => api<User[]>("/admin/users"),
    enabled: !demo,
  });
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const list = demo
    ? [
        {
          id: "demo",
          username: "Sonio Marketing",
          email: "Beispielkonto",
          role: "master_admin",
          active: true,
        },
      ]
    : users.data || [];
  async function invite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demo) {
      onNotice("Einladungen sind erst nach der Anmeldung verfügbar.");
      return;
    }
    setBusy(true);
    try {
      const r = await api<{ url: string }>("/admin/invites", {
        method: "POST",
        body: JSON.stringify({
          email: new FormData(e.currentTarget).get("email"),
        }),
      });
      setUrl(r.url);
    } catch (e) {
      onNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Team</h2>
            <p>
              Der Master-Admin entscheidet, wer Zugang erhält. Neue Nutzer
              können nur über einen persönlichen Einladungslink beitreten. Es
              gibt keine offene Registrierung; eingeladene Mitglieder erhalten
              Lesezugriff.
            </p>
          </div>
          <button
            className="button primary"
            onClick={() => {
              setOpen(true);
              setUrl("");
            }}
          >
            <Plus size={16} />
            Mitglied einladen
          </button>
        </div>
        {users.isError ? (
          <Empty title="Team konnte nicht geladen werden">
            {users.error.message}
          </Empty>
        ) : (
          list.map((u) => (
            <div className="team-row" key={u.id}>
              <span className="avatar">
                {u.username.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <strong>{u.username}</strong>
                <p>{u.email}</p>
              </div>
              <span className="outline-tag">
                {u.role === "master_admin" ? "Master-Admin" : "Leserechte"}
              </span>
              <span className={"data-status " + (u.active ? "good" : "")}>
                <span />
                {u.active ? "Aktiv" : "Deaktiviert"}
              </span>
              {u.role !== "master_admin" && (
                <button
                  className="text-button"
                  onClick={async () => {
                    try {
                      await api("/admin/users/" + u.id, {
                        method: "PATCH",
                        body: JSON.stringify({ active: !u.active }),
                      });
                      client.invalidateQueries({ queryKey: ["users"] });
                      onNotice("Zugriff aktualisiert.");
                    } catch (e) {
                      onNotice((e as Error).message);
                    }
                  }}
                >
                  {u.active ? "Deaktivieren" : "Aktivieren"}
                </button>
              )}
            </div>
          ))
        )}
      </section>
      <div className="info-strip">
        <ShieldCheck size={18} />
        Einladungslinks sind sieben Tage gültig und können genau einmal
        verwendet werden.
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ein neues Teammitglied einladen"
        description="Persönlichen Einladungslink erstellen und anschliessend selbst teilen."
      >
        {url ? (
          <div className="invite-result">
            <CheckCircle2 size={34} />
            <h3>Einladung ist bereit.</h3>
            <p>
              Der Link läuft in sieben Tagen ab und gibt Leserechte auf euren
              Workspace.
            </p>
            <input aria-label="Einladungslink" readOnly value={url} />
            <button
              className="button primary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  onNotice("Einladungslink kopiert.");
                } catch {
                  onNotice("Bitte den Link im Feld auswählen und kopieren.");
                }
              }}
            >
              <Copy size={16} />
              Link kopieren
            </button>
          </div>
        ) : (
          <form onSubmit={invite}>
            <label>
              E-Mail-Adresse
              <input
                name="email"
                type="email"
                required
                placeholder="vorname.nachname@sonio.com"
                maxLength={254}
              />
            </label>
            <div className="info-strip">
              <Users size={18} />
              Zugriff: Kennzahlen, Insights und Reports ansehen.
            </div>
            <button className="button primary full" disabled={busy}>
              <Link2 size={16} />
              {busy ? "Wird erstellt …" : "Einladungslink erstellen"}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}

function SettingsView({
  demo,
  onMetrics,
}: {
  demo: boolean;
  onMetrics: () => void;
}) {
  const settings = useQuery({
    queryKey: ["settings", demo],
    queryFn: () => api<Settings>("/settings"),
    enabled: !demo,
  });
  const config = settings.data;
  return (
    <>
      <Tabs.Root defaultValue="metrics">
        <Tabs.List className="settings-tabs" aria-label="Einstellungen">
          <Tabs.Trigger value="metrics">Kennzahlen</Tabs.Trigger>
          <Tabs.Trigger value="schedule">Aktualisierung & Reports</Tabs.Trigger>
          <Tabs.Trigger value="ai">KI-Auswertung</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="metrics">
          <section className="panel settings-panel">
            <SlidersHorizontal size={25} />
            <h2>Relevante Kennzahlen festlegen.</h2>
            <p>
              Wähle bis zu acht Kennzahlen für die Übersicht, passe ihre
              Bezeichnung an und hinterlege optional Monatsziele. Die Auswahl
              ist bis zum Speichern vorläufig.
            </p>
            <button className="button primary" onClick={onMetrics}>
              Kennzahlen festlegen <ArrowRight size={16} />
            </button>
          </section>
        </Tabs.Content>
        <Tabs.Content value="schedule">
          <section className="panel settings-panel">
            <CalendarDays size={25} />
            <h2>Verlässlich auf dem neuesten Stand.</h2>
            <div className="setting-row">
              <span>Datenaktualisierung</span>
              <strong>
                Alle {config?.sync_interval_minutes || 60} Minuten
              </strong>
            </div>
            <div className="setting-row">
              <span>Monatsreport</span>
              <strong>
                Am 3. um {String(config?.report_hour ?? 8).padStart(2, "0")}:00
                Uhr
              </strong>
            </div>
            <div className="setting-row">
              <span>Zeitzone</span>
              <strong>{config?.timezone || "Europe/Zurich"}</strong>
            </div>
            <div className="setting-row">
              <span>E-Mail-Zustellung</span>
              <strong>
                {config?.email_configured
                  ? "Eingerichtet"
                  : "Noch einzurichten"}
              </strong>
            </div>
            <p className="muted">
              Zeitplan und Empfänger werden zentral in der Serverkonfiguration
              verwaltet. Berichte stehen nach ihrer Erstellung im Archiv bereit.
            </p>
          </section>
        </Tabs.Content>
        <Tabs.Content value="ai">
          <section className="panel settings-panel">
            <Lightbulb size={25} />
            <h2>Interpretation mit OpenRouter.</h2>
            <div className="setting-row">
              <span>Verbindung</span>
              <strong>
                {config?.ai_configured ? "Konfiguriert" : "Zugang fehlt"}
              </strong>
            </div>
            <div className="setting-row">
              <span>Modell</span>
              <strong>{config?.model || "Noch nicht ausgewählt"}</strong>
            </div>
            <p>
              Die Analyse verarbeitet aggregierte Kanal-Kennzahlen. Sie liefert
              Beobachtungen, konkrete Empfehlungen und Grenzen der Aussage.
              OpenRouter-Zugang und ein Modell mit strukturierten Antworten
              werden auf dem Server hinterlegt.
            </p>
            <a
              className="text-button"
              href="https://openrouter.ai/docs/quickstart"
              target="_blank"
              rel="noreferrer"
            >
              OpenRouter-Dokumentation <ExternalLink size={15} />
            </a>
          </section>
        </Tabs.Content>
      </Tabs.Root>
      {settings.isError && (
        <p className="form-error">{settings.error.message}</p>
      )}
    </>
  );
}
function MetricsEditor({
  open,
  onClose,
  dashboard,
  demo,
  onNotice,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  dashboard: Dashboard;
  demo: boolean;
  onNotice: (s: string) => void;
  onSaved: () => void;
}) {
  const [items, setItems] = useState<KPI[]>(dashboard.kpis);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) setItems(dashboard.kpis);
  }, [open, dashboard.kpis]);
  async function save() {
    if (demo) {
      onNotice("Eigene Kennzahlen lassen sich nach der Anmeldung speichern.");
      return;
    }
    setBusy(true);
    try {
      await api("/settings/kpis", {
        method: "PUT",
        body: JSON.stringify({
          items: items.map(({ channel, key, label, target }) => ({
            channel,
            key,
            label,
            target,
          })),
        }),
      });
      onNotice("Kennzahlen gespeichert.");
      onSaved();
      onClose();
    } catch (e) {
      onNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function update(i: number, partial: Partial<KPI>) {
    setItems(items.map((x, n) => (n === i ? { ...x, ...partial } : x)));
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Wichtigste Kennzahlen"
      description="Bis zu acht Kennzahlen für die Übersicht. Die genaue Definition bleibt an den jeweiligen Kanal gebunden."
      wide
    >
      <div className="metric-editor">
        {items.map((k, i) => {
          const c = dashboard.channels.find((c) => c.id === k.channel)!;
          return (
            <div className="metric-editor-row" key={i}>
              <label>
                Kanal
                <select
                  value={k.channel}
                  onChange={(e) => {
                    const c = dashboard.channels.find(
                      (c) => c.id === e.target.value,
                    )!;
                    update(i, {
                      channel: c.id,
                      key: c.primary,
                      label: c.fields[c.primary],
                    });
                  }}
                >
                  {dashboard.channels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Kennzahl
                <select
                  value={k.key}
                  onChange={(e) =>
                    update(i, {
                      key: e.target.value,
                      label: c.fields[e.target.value],
                    })
                  }
                >
                  {Object.entries(c.fields).map(([key, label]) => (
                    <option value={key} key={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Bezeichnung
                <input
                  value={k.label}
                  maxLength={80}
                  onChange={(e) => update(i, { label: e.target.value })}
                />
              </label>
              <label>
                Monatsziel
                <input
                  type="number"
                  min="0"
                  value={k.target ?? ""}
                  placeholder="Optional"
                  onChange={(e) =>
                    update(i, {
                      target: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </label>
              <button
                className="icon-button"
                aria-label={"Kennzahl " + (i + 1) + " entfernen"}
                disabled={items.length === 1}
                onClick={() => setItems(items.filter((_, n) => n !== i))}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="modal-actions">
        <button
          className="button"
          disabled={items.length >= 8}
          onClick={() => setItems([...items, { ...dashboard.kpis[0] }])}
        >
          <Plus size={15} />
          Kennzahl hinzufügen
        </button>
        <button className="button primary" disabled={busy} onClick={save}>
          <Check size={15} />
          Auswahl speichern
        </button>
      </div>
    </Modal>
  );
}
export default App;
