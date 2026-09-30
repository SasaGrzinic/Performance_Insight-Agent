import {RecommendationTeaser} from "./RecommendationTeaser";
import { useQuery } from "@tanstack/react-query";
import { MarketingQuote } from "./MarketingOverview";
import { completeSum } from "../linkedinMetrics";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ChannelIcon } from "./ui";
import { PeriodInfo } from "./PeriodInfo";
import { api, monthName, number } from "../api";
import { metricTrend } from "../linkedinMetrics";
import type { Channel, Dashboard } from "../types";
import "../channel-directory.css";

const metrics: Record<string,string[]> = {
  linkedin_organic: ["impressions", "clicks"], linkedin: ["impressions", "clicks"],
  google_ads: ["clicks", "conversions"], analytics: ["sessions", "engaged_sessions"],
  mailchimp: ["emails_sent", "unique_clicks"], youtube: ["views", "watch_minutes"],
  events: ["registrations"], qr: ["scans"],
};
const labels: Record<string,string> = {impressions:"Impressionen",clicks:"Klicks",conversions:"Zielaktionen",sessions:"Website-Besuche",engaged_sessions:"Engagierte Besuche",emails_sent:"Versendete E-Mails",unique_clicks:"Klickende je Mailing",views:"Videoaufrufe",watch_minutes:"Wiedergabezeit · Min.",registrations:"Anmeldungen",scans:"QR-Scans"};
const descriptions: Record<string,string> = {
  linkedin_organic:"Unbezahlte Beiträge machen Sonio sichtbar und stärken den Austausch mit der Community.", linkedin:"Bezahlte Anzeigen erreichen gezielt berufliche Zielgruppen und lenken Interesse auf Angebote.",
  google_ads:"Anzeigen in der Google-Suche und im Werbenetzwerk sprechen Menschen mit passenden Interessen an.",analytics:"Zeigt, wie Besucher die Website nutzen, woher sie kommen und welche Inhalte sie interessieren.",
  mailchimp:"Newsletter und Mailings informieren Kontakte über Themen, Angebote und Veranstaltungen.", youtube:"Videos vermitteln Wissen und Einblicke. Aufrufe und Wiedergabezeit zeigen ihre Nutzung.",
  events:"Anmeldungen zu Veranstaltungen zeigen das Interesse an Themen und persönlichen Begegnungen.",qr:"QR-Codes verbinden Print und Veranstaltungen mit digitalen Inhalten; Scans machen die Nutzung sichtbar.",
};
export function ChannelDirectory({data, onSelect}: {data: Dashboard; onSelect:(c:Channel)=>void}) {
  const ads = useQuery({queryKey:["linkedin-ads-campaigns",data.demo], queryFn:()=>api<{start:string;end:string;campaigns:{example?:boolean;values:Record<string,number>}[]}>("/linkedin/ads/campaigns"),enabled:!data.demo});
  return <><section className="channel-directory" aria-label="Marketingkanäle">
    <div className="section-heading"><div><h2>Kanäle im Überblick.</h2></div>
      <span className="directory-month">{monthName(data.month)}<PeriodInfo>{data.demo ? "Beispieldaten. " : ""}Monatswerte vom {data.period_start} bis {data.period_end}. Vergleich: {data.comparison_month}-01 bis {data.comparison_end}. Laufende Monate sind unvollständig. Kampagnendetails können einen anderen Zeitraum zeigen.</PeriodInfo></span>
    </div>
    <div className="directory-list">{data.channels.map(c => {
      const connected = c.status === "connected" || c.status === "imported";
      const adsPeriod = c.id === "linkedin" && !data.demo ? ads.data : undefined;
      const measuredCampaigns = adsPeriod?.campaigns.filter(x => !x.example && Object.keys(x.values).length);
      const values = measuredCampaigns?.length ? Object.fromEntries(["impressions","clicks"].map(key => [key,completeSum(measuredCampaigns.map(x=>x.values[key]))])) : c.values;
      const hasData = Object.values(values).some(Number.isFinite);
      const blockedAds = c.id === "google_ads" && !hasData && c.status === "error";
      return <article className="directory-row" key={c.id}>
        <div className="directory-identity"><span className="directory-logo"><ChannelIcon id={c.id} size={48}/></span><div><h3>{c.name}</h3><p>{descriptions[c.id]}</p><small>{data.demo ? "Beispieldaten" : connected ? "Verbunden" : c.status === "error" ? "Aktualisierung prüfen" : "Noch nicht verbunden"}</small></div></div>
        {adsPeriod && <span className="directory-card-period">Letzte 365 Tage · {new Date(adsPeriod.start+"T12:00:00").toLocaleDateString("de-CH")} – {new Date(adsPeriod.end+"T12:00:00").toLocaleDateString("de-CH")}</span>}
        <div className="directory-kpis">{hasData || connected || blockedAds ? (metrics[c.id] || [c.primary]).slice(0,2).map(key => {
          const v=values[key], t=metricTrend(v,adsPeriod ? undefined : c.previous[key]);
          const Icon=t.direction === "up" ? TrendingUp : t.direction === "down" ? TrendingDown : Minus;
          return <div className="directory-kpi" key={key}><span>{labels[key] || c.fields[key]}</span><strong>{number(v)}</strong><small><Icon size={13} aria-hidden="true"/>{adsPeriod ? "Kampagnen im Zeitraum" : blockedAds ? "Zugriff gesperrt" : t.value === undefined ? "Kein Vergleich" : `${t.value > 0 ? "+" : ""}${number(t.value)} % zum Vormonat`}</small></div>;
        }) : <p className="directory-empty">Kennzahlen erscheinen nach der Anbindung.</p>}</div>
        {blockedAds && <small className="directory-access-note">Google Ads verweigert den API-Zugriff (403). Kennzahlen sind noch nicht verfügbar.</small>}
        <button className="directory-open" onClick={()=>onSelect(c)} aria-label={`${c.name}: Details öffnen`}/>
      </article>;
    })}</div>
  </section><RecommendationTeaser/><MarketingQuote/></>;
}
