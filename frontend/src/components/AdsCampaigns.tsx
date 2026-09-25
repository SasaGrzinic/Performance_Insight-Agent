import { KpiExplainer } from "./KpiExplainer";
import { asset, demoCampaigns } from "../staticDemo";
import { useState } from "react";
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
const fields = {
  impressions: "Impressionen",
  clicks: "Klicks",
  spend: "Ausgaben",
  ctr: "CTR",
  cpc: "CPC",
  conversions: "Conversions",
};
const value = (c: Campaign, k: string) =>
  k === "ctr" ? c.ctr : k === "cpc" ? c.cpc : c.values[k];
export function AdsCampaigns({ demo }: { demo: boolean }) {
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
    values: { impressions: 42000, clicks: 420, spend: 840, conversions: 12 },
    ctr: 1,
    cpc: 2,
    first_activity: null,
    last_activity: null,
  };
  const displayCampaigns =
    !demo && campaigns.filter((c) => Object.keys(c.values).length).length < 2
      ? [...campaigns, example]
      : campaigns;
  return (
    <section className="ads-campaigns" aria-label="LinkedIn Ads Kampagnen">
      <div className="section-heading">
        <div>
          <h2>Deine Kampagnen</h2>
          <p>
            Kennzahlen der letzten 365 Tage: {date(d.start)} bis {date(d.end)}
          </p>
        </div>
        <span>{d.campaigns.length} Kampagnen</span>
      </div>
      <p className="ads-explainer">
        Jede Kampagne für sich: Titel, Ziel und Ergebnisse über Monatsgrenzen
        hinweg. Die Liste enthält auch ältere Kampagnen; ihre Kennzahlen bleiben
        auf die letzten 365 Tage begrenzt.
      </p>
      {d.status === "error" && (
        <p role="alert">
          Aktualisierung fehlgeschlagen: {d.message} Zuletzt geladene Daten
          bleiben sichtbar.
        </p>
      )}
      <div className="ads-actions">
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
      </div>
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
              <dl>
                {Object.entries(fields).map(([key, label]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>
                      {number(
                        value(c, key),
                        key === "spend" || key === "cpc" ? c.currency : "count",
                      )}
                      {key === "ctr" && c.ctr != null ? " %" : ""}
                    </dd>
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
                <summary>Ergebnisse einordnen</summary>
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
        <h2>So liest du diese Zahlen</h2>
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
