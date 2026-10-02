import {RecommendationTeaser} from "./RecommendationTeaser";
import "../linkedin-ads.css";
import { PeriodInfo } from "./PeriodInfo";
import { KpiExplainer } from "./KpiExplainer";
import { asset, demoCampaigns } from "../staticDemo";
import { EditorialQuote } from './EditorialQuote';
import { useState, cloneElement, isValidElement, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { api, number } from "../api";
import { saveCSV } from "../csv";

type Campaign = {
  image_url?: string | null;
  example?: boolean;
  id: string;
  name: string;
  status: string | null;
  objective: string | null;
  start: string | null;
  end: string | null;
  currency: string;
  values: Record<string, number>;
  ctr: number | null;
  cpc: number | null;
  first_activity: string | null;
  last_activity: string | null;
};
type Data = {
  start: string;
  end: string;
  campaigns: Campaign[];
  last_success: string | null;
  status: string;
  message: string;
};
const date = (s: string | null) =>
  s ? new Date(s + "T12:00:00").toLocaleDateString("de-CH") : "Nicht angegeben";
const statuses: Record<string, string> = {
  ACTIVE: "Aktiv",
  PAUSED: "Pausiert",
  COMPLETED: "Abgeschlossen",
  DRAFT: "Entwurf",
  ARCHIVED: "Archiviert",
  CANCELED: "Abgebrochen",
};
const objectives: Record<string, string> = {
  BRAND_AWARENESS: "Markenbekanntheit",
  WEBSITE_VISIT: "Website-Besuche",
  WEBSITE_CONVERSION: "Website-Conversions",
  ENGAGEMENT: "Interaktionen",
  VIDEO_VIEW: "Videoaufrufe",
  LEAD_GENERATION: "Lead-Generierung",
};
const adsHelp: Record<string,string> = {
 impressions: 'Anzahl der Anzeigeneinblendungen. Mehrere Einblendungen können dieselbe Person betreffen; dies ist keine eindeutige Reichweite.',
 clicks: 'Von LinkedIn gezählte Anzeigenklicks. Je nach Format können auch Interaktionen innerhalb von LinkedIn enthalten sein. Nicht gleich Website-Besuche.',
 ctr: 'LinkedIn-Klicks geteilt durch Impressionen. Die Klickrate beschreibt Resonanz, nicht die Qualität der Website-Besuche. Ziel und Anzeigenformat berücksichtigen.',
 landing_page_clicks: 'Klicks zur hinterlegten Zielseite. Ein Klick garantiert keine in Analytics erfasste Sitzung, etwa wegen Ladeabbrüchen oder fehlender Einwilligung.',
 landing_page_ctr: 'Landingpage-Klicks geteilt durch Impressionen. Zeigt den Anteil der Einblendungen, der zu einem Klick zur Zielseite führt.',
 landing_page_cpc: 'Ausgaben geteilt durch Landingpage-Klicks. Ohne solche Klicks kein berechenbarer Wert. Keine Kosten pro Lead.',
 cpc: 'Ausgaben geteilt durch LinkedIn-Klicks. Ein günstiger Klick belegt noch keinen wertvollen Kontakt.',
 cpm: 'Ausgaben je 1’000 Einblendungen. Hilft bei der Einordnung der Ausspielungskosten, misst aber keine Bekanntheitssteigerung.',
 conversions: 'Von LinkedIn zugerechnete Website-Zielaktionen. Die konkrete Aktion muss geprüft werden; diese Zahl ist nicht automatisch die Anzahl von Leads oder Anmeldungen.',
 cost_per_conversion: 'Ausgaben geteilt durch zugerechnete Website-Zielaktionen. Nur bei vergleichbaren und überprüften Zielen sinnvoll; ohne Zielaktionen nicht berechenbar.',
 spend: 'Werbeausgaben in der Kontowährung für den ausgewiesenen Zeitraum. Produktions- und Agenturkosten sind nicht enthalten.',
};
const primaryFields = {
  impressions: "Impressionen",
  landing_page_clicks: "Landingpage-Klicks",
  landing_page_ctr: "Landingpage-Klickrate",
  landing_page_cpc: "Kosten / Landingpage-Klick",
  conversions: "Website-Zielaktionen",
  spend: "Ausgaben",
};
const fields = {
  ...primaryFields,
  cpm: "Kosten / 1’000 Einblendungen",
  cost_per_conversion: "Kosten / Zielaktion",
  impressions: "Impressionen",
  clicks: "Klicks",
  ctr: "CTR",
  conversions: "Website-Zielaktionen",
  cpc: "CPC",
  spend: "Ausgaben",
};
const ratio = (a: number | undefined, b: number | undefined, scale = 1) =>
  Number.isFinite(a) && Number.isFinite(b) && b! > 0 ? a! / b! * scale : null;
const value = (c: Campaign, k: string) => {
  if (k === "landing_page_ctr") return ratio(c.values.landing_page_clicks, c.values.impressions, 100);
  if (k === "landing_page_cpc") return ratio(c.values.spend, c.values.landing_page_clicks);
  if (k === "cpm") return ratio(c.values.spend, c.values.impressions, 1000);
  if (k === "cost_per_conversion") return ratio(c.values.spend, c.values.conversions);
  return k === "ctr" ? c.ctr : k === "cpc" ? c.cpc : c.values[k];
};
const campaignFields = (c: Campaign) => c.objective === "BRAND_AWARENESS" ? {
  impressions: fields.impressions, clicks: "LinkedIn-Klicks", ctr: fields.ctr,
  landing_page_clicks: fields.landing_page_clicks, cpm: fields.cpm, spend: fields.spend,
} : primaryFields;
const moneyKeys = ["spend", "cpc", "landing_page_cpc", "cpm", "cost_per_conversion"];
const metricValue = (c: Campaign, key: string) => `${number(value(c, key), moneyKeys.includes(key) ? c.currency : "count")}${["ctr", "landing_page_ctr"].includes(key) && value(c,key) != null ? " %" : ""}`;
export function LinkedInAdsHero() {
  return <><div className="li-mast"><div><small>Sonio AG</small><h1>LinkedIn Ads Cockpit.</h1></div><span>Marketing · Paid Social</span></div>
    <section className="li-hero"><img src={asset("brand/sonio-blog-header.jpg")} alt="Berglandschaft mit Fahrer und Zielflagge"/><div><h2>Gezielt sichtbar. Wirkung im Blick.</h2><p>Kampagnen verstehen. Marketing gezielt steuern.</p></div></section></>;
}
export function AdsCampaigns({ demo, actions }: { demo: boolean; actions?: ReactNode }) {
  const query = useQuery({
    queryKey: ["linkedin-ads-campaigns", demo],
    queryFn: () =>
      demo
        ? Promise.resolve(demoCampaigns() as Data)
        : api<Data>("/linkedin/ads/campaigns"),
    refetchInterval: 60000,
  });
  const [keys, setKeys] = useState(Object.keys(fields));
  if (query.isPending) return <p role="status">Kampagnen werden geladen …</p>;
  if (query.isError)
    return (
      <section className="panel" role="alert">
        <h2>Kampagnen konnten nicht geladen werden</h2>
        <p>{query.error.message}</p>
        <button className="button" onClick={() => query.refetch()}>
          Erneut versuchen
        </button>
      </section>
    );
  const d = query.data;
  const campaigns = d.campaigns;
  const example: Campaign = {
    id: "example-only",
    image_url: asset("/brand/sonio-blog-header.jpg"),
    example: true,
    name: "Beispielkampagne · Cloud-Webinar",
    status: "COMPLETED",
    objective: "WEBSITE_VISIT",
    start: d.start,
    end: d.end,
    currency: "CHF",
    values: { impressions: 42000, clicks: 420, spend: 840, landing_page_clicks: 350, conversions: 12 },
    ctr: 1,
    cpc: 2,
    first_activity: null,
    last_activity: null,
  };
  const displayCampaigns =
    !demo && campaigns.filter((c) => Object.keys(c.values).length).length < 2
      ? [...campaigns, example]
      : campaigns;
  const campaignExport = (      <>
        <details className="ads-export">
          <summary>CSV herunterladen</summary>
          <fieldset>
            <legend>Kennzahlen auswählen</legend>
            {Object.entries(fields).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={keys.includes(key)}
                  onChange={(e) =>
                    setKeys(
                      e.target.checked
                        ? [...keys, key]
                        : keys.filter((k) => k !== key),
                    )
                  }
                />
                {label}
              </label>
            ))}
          </fieldset>
          <button
            className="button"
            disabled={!keys.length || !campaigns.length}
            onClick={() =>
              saveCSV("LinkedIn-Ads-Kampagnen-365-Tage.csv", [
                [
                  "Kampagne",
                  "Kampagnen-ID",
                  "Ziel",
                  "Status",
                  "Laufzeit Start",
                  "Laufzeit Ende",
                  "Zeitraum Start",
                  "Zeitraum Ende",
                  "Währung",
                  ...keys.map((k) => fields[k as keyof typeof fields]),
                  "Datenstand",
                ],
                ...campaigns.map((c) => [
                  c.name,
                  c.id,
                  c.objective,
                  c.status,
                  c.start,
                  c.end,
                  d.start,
                  d.end,
                  c.currency,
                  ...keys.map((k) => value(c, k)),
                  d.last_success,
                ]),
              ])
            }
          >
            <Download size={16} /> {campaigns.length} Kampagnen exportieren
          </button>
        </details>
      </>);
  return (
    <section className="ads-campaigns" aria-label="LinkedIn Ads Kampagnen">
      <div className="section-heading">
        <div>
          <h2>Kampagnen &amp; Wirkung.</h2>
          <p>{d.campaigns.length} Kampagnen</p>
          <p>
            {date(d.start)} bis {date(d.end)} <PeriodInfo>Kennzahlen der letzten 365 Tage, unabhängig vom Kampagnenstart. Der aktuelle Tag ist unvollständig. Fehlende Werte erscheinen als «—».</PeriodInfo>
          </p>
        </div>
        {isValidElement<{children?: ReactNode}>(actions) ? cloneElement(actions, {}, actions.props.children, campaignExport) : campaignExport}
      </div>
      {d.status === "error" && (
        <p role="alert">
          Aktualisierung fehlgeschlagen: {d.message} Zuletzt geladene Daten
          bleiben sichtbar.
        </p>
      )}

      <p className="ads-intro">Sichtbarkeit schaffen, Interesse gewinnen, Ergebnisse einordnen. Jede Kampagne wird anhand ihres Ziels und ihrer eingesetzten Mittel betrachtet.</p>
      {!campaigns.length && <p>Noch keine Kampagnen geladen.</p>}
      <div className="ads-campaign-list">
        {displayCampaigns.map((c) => (
          <article
            key={c.id}
            className={`ads-campaign ${c.example ? "ads-example" : ""}`}
          >
            <CampaignImage key={c.image_url || c.id} campaign={c} />
            <div className="ads-campaign-body">
              {c.example && (
                <p className="example-label">
                  Fiktive Beispielkampagne · Nicht in Exporten oder Auswertungen
                  enthalten
                </p>
              )}
              <div className="ads-campaign-heading">
                <div>
                  <h3>{c.name}</h3>
                  <p>
                    Ziel:{" "}
                    {c.objective
                      ? objectives[c.objective] || c.objective
                      : "Nicht angegeben"}
                  </p>
                </div>
                <span className="ads-status">
                  {c.status
                    ? statuses[c.status] || c.status
                    : "Status unbekannt"}
                </span>
              </div>
              <p className="ads-runtime">
                Geplante Laufzeit: {date(c.start)} –{" "}
                {c.end ? date(c.end) : "ohne festes Enddatum"}
              </p>
              <dl className="ads-primary-kpis">
                {Object.entries(campaignFields(c)).map(([key, label]) => (
                  <div key={key} className={key === "spend" ? "campaign-cost" : undefined}>
                    <dt>{label} <PeriodInfo label={`${label} erklärt`}>{adsHelp[key]}</PeriodInfo></dt><dd>{metricValue(c,key)}</dd>
                  </div>
                ))}
              </dl>
              <p className="ads-data-note">
                {c.example
                  ? "Alle Zahlen sind frei erfunden und dienen ausschliesslich der Darstellung."
                  : c.first_activity
                    ? `Gelieferte Aktivität im Zeitraum: ${date(c.first_activity)} bis ${date(c.last_activity)}.`
                    : "Für die letzten 365 Tage liefert LinkedIn keine Kennzahlen zu dieser Kampagne."}
              </p>
              <details>
                <summary>Details &amp; Einordnung</summary>
                <dl className="ads-secondary-kpis">{["clicks", "ctr", "cpc", "landing_page_ctr", "landing_page_cpc", "cpm", "conversions", "cost_per_conversion"].filter(key => !(key in campaignFields(c))).map(key => <div key={key}><dt>{fields[key as keyof typeof fields]} <PeriodInfo label={`${fields[key as keyof typeof fields]} erklärt`}>{adsHelp[key]}</PeriodInfo></dt><dd>{metricValue(c,key)}</dd></div>)}</dl>
                <p>Website-Zielaktionen sind die von LinkedIn zugerechneten Website-Conversions. Die konkrete Aktion ist noch nicht verifiziert; deshalb werden sie nicht als Anmeldungen oder Leads bezeichnet. Landingpage-Klicks sind keine nachgewiesenen Website-Sitzungen.</p>
                <p>
                  {c.objective === "BRAND_AWARENESS"
                    ? "Das Ziel ist Markenbekanntheit. Impressionen zeigen die Ausspielung; Klicks und CPC sind ergänzende Signale. Ohne Reichweite und Häufigkeit lässt sich die Bekanntheitswirkung nicht abschliessend beurteilen."
                    : c.objective === "WEBSITE_CONVERSION"
                      ? "Das Ziel sind Website-Conversions. Beurteile die Ergebnisse anhand der definierten Conversion und ihrer Erfassung. Klicks allein zeigen noch keine Zielerreichung."
                      : c.objective === "WEBSITE_VISIT"
                        ? "Das Ziel sind Website-Besuche. Klicks und CPC geben erste Hinweise; tatsächliche Besuche und deren Qualität müssen mit Analytics eingeordnet werden."
                        : "Beurteile diese Kampagne anhand ihres eigenen Ziels und der verfügbaren Messwerte."}{" "}
                  Zielgruppen und Themen werden nicht pauschal gegeneinander
                  bewertet.
                </p>
              </details>
            </div>
          </article>
        ))}
      </div>
      <section className="detail-definitions">
        <h2>Kennzahlen verstehen</h2>
        <KpiExplainer channel="linkedin" fields={fields} />
      </section>
      <p className="ads-footnote">
        Status und Laufzeit stammen aus LinkedIn. „Aktiv“ bedeutet nicht
        zwingend, dass Anzeigen ausgeliefert werden. Fehlende Werte erscheinen
        als „—“. CTR = Klicks ÷ Impressionen; CPC = Ausgaben ÷ Klicks. Der
        aktuelle Tag ist unvollständig.
      </p>
      <p className="muted">
        {d.last_success
          ? `Letzter erfolgreicher Abruf: ${new Date(d.last_success).toLocaleString("de-CH")}`
          : "Noch kein erfolgreicher Abruf."}
      </p>
      <RecommendationTeaser/>
      <EditorialQuote portrait={asset('brand/portraits/steve-jobs-v1.png')} text="You’ve got to start with the customer experience and work backwards to the technology." author="Steve Jobs" role="Apple-Mitgründer" source="https://allaboutstevejobs.com/videos/misc/wwdc_1997_closing_chat"/>
    </section>
  );
}

function CampaignImage({ campaign }: { campaign: Campaign }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="campaign-image">
      {campaign.image_url && !failed ? (
        <img
          src={campaign.image_url}
          alt={`Anzeigenmotiv: ${campaign.name}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>
          {campaign.example
            ? "Beispielmotiv · Cloud-Webinar"
            : "Kein Anzeigenmotiv verfügbar"}
        </span>
      )}
    </div>
  );
}
