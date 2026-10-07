import {ComparisonInfo} from "./ComparisonInfo";
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { asset } from '../staticDemo';
import { PeriodInfo } from './PeriodInfo';
import { readablePostTitle } from '../comparison';
import { EditorialQuote } from './EditorialQuote';
import { useId, useState, type ReactNode } from "react";

import { ArrowRight, Info } from "lucide-react";
import { number, monthName } from "../api";
import { overviewKpis } from "../overviewKpis";
import type { Analysis, Channel, Dashboard, Recommendation } from "../types";
export function channelMetricLabel(c: Channel, key: string) {
  const labels: Record<string, string> = {
    sessions: "Website-Besuche",
    impressions:
      c.id === "linkedin_organic"
        ? "Einblendungen unserer Beiträge"
        : "Anzeigeneinblendungen",
    unique_clicks: "Personen klickten je Newsletter",
    views: "Videoaufrufe",
    registrations: "Bestätigte Anmeldungen",
    responses: "Formularantworten", attendees: "Zoom-Teilnahme-Einträge", recording_views: "Aufzeichnungsaufrufe",
    scans: "QR-Code-Scans",
    conversions: "Erfasste Zielaktionen",
  };
  return labels[key] || c.fields[key] || key;
}
export function overviewMetricHelp(c: Channel, key: string) {
  const help: Record<string,string> = {
    impressions: 'Anzahl der Einblendungen. Eine Person kann mehrere Einblendungen erzeugen; dies ist keine eindeutige Reichweite.',
    clicks: c.id === 'linkedin_organic' ? 'Klicks auf LinkedIn-Inhalte. Dazu können Interaktionen innerhalb von LinkedIn gehören; nicht gleichbedeutend mit Website-Besuchen.' : 'Klicks auf Anzeigen. Wiederholte Klicks sind möglich; Klicks allein belegen noch keine qualifizierten Anfragen.',
    conversions: 'Im Werbekonto erfasste Zielaktionen. Welche Aktionen zählen, hängt vom eingerichteten Tracking ab; sie sind nicht automatisch Leads oder Verkäufe.',
    sessions: 'Besuche auf der Website. Eine Person kann mehrere Sitzungen auslösen.',
    engaged_sessions: 'Sitzungen mit mehr als zehn Sekunden Engagement, einem Schlüsselereignis oder mindestens zwei Seiten- beziehungsweise Bildschirmaufrufen.',
    key_events: 'In Analytics als wichtig konfigurierte Ereignisse. Die Bedeutung hängt von der Tracking-Konfiguration ab.',
    unique_clicks: 'Summe der klickenden Empfänger je Mailing. Wer in mehreren Mailings klickt, kann mehrfach zählen.',
    emails_sent: 'Anzahl versendeter E-Mails. Dies sind weder eindeutig erreichte Personen noch garantiert zugestellte Nachrichten.',
    unique_opens: 'Öffnende je Mailing. Automatische Abrufe und Datenschutzfunktionen können die Aussagekraft einschränken.',
    views: 'Von YouTube gezählte Videoaufrufe im ausgewählten Zeitraum. Wiederholte Aufrufe sind möglich.',
    watch_minutes: 'Gesamte Wiedergabezeit auf YouTube in Minuten während des ausgewählten Zeitraums.',
    spend: 'Werbekosten im ausgewählten Zeitraum und in der angegebenen Kontowährung.',
    registrations: 'Erfasste Eventanmeldungen aus den importierten Listen; nicht automatisch tatsächliche Teilnahmen.',
    scans: 'Erfasste QR-Code-Aufrufe. Wiederholte Scans können mehrfach zählen.',
    followers_gained: 'Hinzugewonnene Follower im Zeitraum. Abgänge werden hier nicht abgezogen; keine Nettoveränderung.',
  };
  if(c.event_summary) return c.event_summary.notice + ` Abdeckung: ${c.event_summary.coverage[key]?.known ?? 0} von ${c.event_summary.event_count} Events. Datenstand: ${c.event_summary.oldest_observed_at ? new Date(c.event_summary.oldest_observed_at).toLocaleString('de-CH') : 'nicht vorhanden'}.`;
  return (help[key] || `${c.fields[key] || key}: gemeldeter Messwert des Kanals.`) + ' Fehlende Werte bleiben als Strich sichtbar.';
}
export function overviewSecondaryMetric(c: Channel) {
  const choices: Record<string,string[]> = {linkedin_organic:['clicks','followers_gained'],google_ads:['clicks','spend'],linkedin:['clicks','spend'],analytics:['engaged_sessions','key_events'],mailchimp:['emails_sent','unique_opens'],youtube:['watch_minutes']};
  return [...(choices[c.id] || []),...Object.keys(c.fields)].find(k => k !== c.primary && k in c.fields);
}
export function OverviewHighlights({ dashboard: d, periodControl }: { dashboard: Dashboard; periodControl?: ReactNode }) {
  const selected = overviewKpis(d);
  return (
    <section className="marketing-developments">
      <div className="section-heading">
        <h2>Kennzahlen im Überblick.</h2>
        {periodControl}
        <span>
          {d.demo ? "Beispieldaten · " : ""}
          {monthName(d.month)} vs. {monthName(d.comparison_month)}
        </span>
      </div>
      <p className="comparison-context">
        {d.partial
          ? `Laufender Monat: ${d.period_start} bis ${d.period_end}.`
          : "Vergleich der Monatswerte."}{" "}
        Die Tendenz verwendet je Kennzahl nur vergleichbare Tageswerte; der angezeigte Gesamtwert kann bereits neuere Tage enthalten. Mehr Volumen allein belegt keine höhere Qualität.
      </p>
      {selected.length ? (
        <div className="marketing-highlights">
          {selected.map((t) => (
            <article key={`${t.channel.id}.${t.key}`}>
              <span className="highlight-channel">
                <i
                  className={t.change == null || t.change === 0 ? "neutral" : t.positive ? "positive" : "negative"}
                  aria-hidden="true"
                />
                {t.channel.name}
              </span>
              <strong>
                {number(t.value, t.unit)}
              </strong>
              <span>{t.label} <PeriodInfo label={`${t.label} erklärt`}>{overviewMetricHelp(t.channel,t.key)}</PeriodInfo></span>
              <small data-trend={t.change==null||t.change===0?"neutral":t.change>0?"up":"down"}>
                {t.channel.event_summary ? `Event-Gesamtstand · ${t.channel.event_summary.coverage[t.key]?.known ?? 0} von ${t.channel.event_summary.event_count} Events` : t.change == null ? "Kein Vorperiodenvergleich" : t.change === 0 ? "Unverändert zum Vormonat" : `${number(Math.abs(t.change))} % ${t.positive ? "mehr" : "weniger"} als in der Vorperiode`}
              </small>
              {t.target !== null && <small>Monatsziel: {number(t.target, t.unit)}</small>}
              {!t.channel.event_summary && (
                <ComparisonInfo comparison={t.comparison} />
              )}
            </article>
          ))}
        </div>
      ) : (
        <p>
          Entwicklungen erscheinen, sobald vergleichbare Kennzahlen für beide
          Zeiträume vorliegen.
        </p>
      )}
    </section>
  );
}
export function OverviewRecommendations({
  title = "Top 3 Empfehlungen",
  analysis,
  channels,
  onSelect,
  onAll,
}: {
  title?: string;
  analysis?: Analysis;
  channels: Channel[];
  onSelect: (r: Recommendation) => void;
  onAll: () => void;
}) {
  const items = [...(analysis?.recommendations || [])]
    .sort(
      (a, b) =>
        ({ high: 0, medium: 1, low: 2 })[a.priority] -
        { high: 0, medium: 1, low: 2 }[b.priority],
    )
    .slice(0, 3);
  return (
    <section className="marketing-opportunities">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <p>{analysis?.status === "rules" ? "Aus Kennzahlen abgeleitete Handlungshinweise · keine KI-Analyse" : items.length ? `${items.length} priorisierte nächste Schritte` : "Noch keine Analyse für diesen Zeitraum"}</p>
        </div>
        <button className="text-button" onClick={onAll}>
          Alle Empfehlungen <ArrowRight size={16} />
        </button>
      </div>
      {items.length ? (
        <div className="marketing-recommendations">
          {items.map((r, i) => (
            <article key={i}>
              <div className="recommendation-channel">
                {channels.find((c) => c.id === r.channel)?.name || r.channel}
              </div>
              <button
                className="recommendation-open"
                onClick={() => onSelect(r)}
              >
                <h3>{r.title}</h3>
              </button>
              <p>{r.observation}</p>
              <NextStep r={r} onSelect={onSelect} />
            </article>
          ))}
        </div>
      ) : (
        <p>
          Hier erscheinen die nächsten Schritte aus der Kanalanalyse. Die Analyse kann unter «Insights & Empfehlungen» erstellt werden; dafür muss der KI-Zugang eingerichtet sein.
        </p>
      )}
    </section>
  );
}
export function MarketingQuote() {
  return <EditorialQuote portrait={asset('brand/portraits/richard-branson-v1.png')} text="Complexity is your enemy. Any fool can make something complicated. It is hard to keep things simple." author="Richard Branson" role="Founder, Virgin Group" source="https://www.linkedin.com/posts/rbranson_complexity-is-your-enemy-any-fool-can-activity-7372304006297296898-1Ces"/>;
}

function NextStep({
  r,
  onSelect,
}: {
  r: Recommendation;
  onSelect: (r: Recommendation) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div
      className="recommendation-step"
      data-open={open}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          e.currentTarget.querySelector("button")?.blur();
        }
      }}
    >
      <button
        className="step-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        Nächster Schritt <Info size={14} />
      </button>
      <div className="step-tooltip" id={id}>
        {r.action}
        <button onClick={() => onSelect(r)}>
          Einordnung &amp; Details <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export function OverviewExplore({demo,onOpen}:{demo:boolean;onOpen:(view:'videos'|'search'|'recommendations')=>void}) {
 const q=useQuery({queryKey:['video-library'],queryFn:()=>api<{videos:{id:string;platform:string;title:string;published_at:string;image_url?:string}[]}>('/videos/library'),enabled:!demo,staleTime:60000});
 const latest=[...(q.data?.videos||[])].filter(v=>Number.isFinite(Date.parse(v.published_at))).sort((a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at))[0];
 return <section className="overview-explore"><div className="section-heading"><div><h2>Aus Zahlen werden nächste Schritte.</h2><p>Inhalte entdecken, Suchinteresse verstehen und konkrete Massnahmen ableiten.</p></div></div><div className="overview-explore-grid"><article className="overview-video-entry"><button onClick={()=>onOpen('videos')} className="overview-video-image" aria-label="Video Insights öffnen">{latest?.image_url?<img src={latest.image_url} alt={readablePostTitle(latest.title)}/>:<span>{demo?'Videoportfolio entdecken':q.isPending?'Video wird geladen …':q.isError?'Vorschau derzeit nicht verfügbar':'Kein Vorschaubild verfügbar'}</span>}<span className="overview-video-badge">Video Insights <ArrowRight size={20}/></span></button><div><h3>{latest?readablePostTitle(latest.title):'Geschichten, die weiterwirken.'}</h3>{latest&&<small>Neueste importierte Veröffentlichung · {latest.platform==='youtube'?'YouTube':'LinkedIn'} · {new Date(latest.published_at).toLocaleDateString('de-CH',{timeZone:'Europe/Zurich'})}</small>}<p>LinkedIn und YouTube im Zusammenhang betrachten. Themen, Playlists und Videodetails entdecken.</p><button className="text-button" onClick={()=>onOpen('videos')}>Video Insights öffnen <ArrowRight size={16}/></button></div></article><div className="overview-explore-links"><button onClick={()=>onOpen('search')}><h3>Suchbegriffe &amp; Potenziale</h3><p>Was sucht die Zielgruppe? Organische und bezahlte Suche einordnen und neue Content-Ansätze erkennen.</p><span>Suchinteresse entdecken <ArrowRight size={18}/></span></button><button onClick={()=>onOpen('recommendations')}><h3>Empfehlungen</h3><p>Priorisierte Impulse nach Kanal bündeln und die nächsten Marketingentscheidungen vorbereiten.</p><span>Massnahmen vertiefen <ArrowRight size={18}/></span></button></div></div></section>;
}
