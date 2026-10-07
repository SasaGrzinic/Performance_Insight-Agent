import {
  ArrowRight,
  CircleAlert,
  FileText,
  Globe2,
  Link2,
  Mail,
  QrCode,
  ShieldCheck,
  Target,
  Workflow,
} from "lucide-react";
import {
  campaignMeasurementPlan,
  type CampaignMeasure,
  type IdentificationState,
} from "../campaignIdentification";
import { asset } from "../staticDemo";
import type { Dashboard } from "../types";
import { ChannelIcon } from "./ui";
import "../campaign-workspace.css";

const stateLabels: Record<IdentificationState, string> = {
  available: "Stabile Kennung",
  partial: "Kampagnenschlüssel fehlt",
  open: "Tracking offen",
};

const demoResults: Record<string, string[]> = {
  google_ads: ["24'680 Impressionen", "710 Klicks", "14 gemeldete Zielaktionen"],
  linkedin_ads: ["18'420 Impressionen", "164 Klicks", "2 gemeldete Zielaktionen"],
  linkedin_organic: ["8'960 Impressionen", "58 Beitragsklicks"],
  landingpage: ["412 Sitzungen", "18 gemeldete Zielaktionen"],
  mailchimp: ["1'240 Zustellungen", "86 Klicker"],
  youtube: ["1'860 Aufrufe", "740 Min. Wiedergabezeit"],
  direct_mail: ["23 QR-Weiterleitungen", "18 Landingpage-Sitzungen"],
  fachartikel: ["14 QR-/Link-Weiterleitungen", "11 Landingpage-Sitzungen"],
  event: ["36 Anmeldungen"],
};

const journey = [
  {
    title: "Sichtbarkeit",
    demo: ["Google Ads · 24'680", "LinkedIn Ads · 18'420", "Organic · 8'960"],
    live: ["Impressionen und Aufrufe nach Zuordnung"],
  },
  {
    title: "Reaktion",
    demo: ["Ads-Klicks · 874", "Organic-Klicks · 58", "Mailing-Klicker · 86"],
    live: ["Klicks und Interaktionen nach Zuordnung"],
  },
  {
    title: "Website & QR",
    demo: ["Website-Sitzungen · 412", "Direct Mailing · 23 QR", "Fachartikel · 14 Links/QR"],
    live: ["Sitzungen und Weiterleitungen nach Zuordnung"],
  },
  {
    title: "Zielhandlung",
    demo: ["Website · 18 Aktionen", "Events · 36 Anmeldungen"],
    live: ["Zielaktionen und Anmeldungen nach Zuordnung"],
  },
];

function MeasureIcon({ measure }: { measure: CampaignMeasure }) {
  if (measure.id === "direct_mail") return <Mail size={25} aria-hidden="true" />;
  if (measure.id === "fachartikel") return <FileText size={25} aria-hidden="true" />;
  if (measure.id === "landingpage") return <Globe2 size={25} aria-hidden="true" />;
  return <ChannelIcon id={measure.channelId} size={28} />;
}

function sourceStatus(measure: CampaignMeasure, demo: boolean) {
  if (demo) return "Beispielhafte Zuordnung";
  if (measure.connectionStatus === "connected") return "Quelle verbunden";
  if (measure.connectionStatus === "error") return "Abrufstatus prüfen";
  return "Quelle noch nicht verbunden";
}

export function CampaignHero() {
  return (
    <>
      <div className="marketing-mast">
        <h1>Kampagnen &amp; Massnahmen.</h1>
      </div>
      <section className="marketing-hero" aria-label="Kampagnen und Massnahmen">
        <img
          src={asset("brand/sonio-blog-header.jpg")}
          alt="Berglandschaft mit Fahrer und Zielflagge"
        />
        <div>
          <h2>Kampagnenwirkung im Zusammenhang.</h2>
          <p>Alle relevanten Massnahmen. Eine gemeinsame Sicht.</p>
        </div>
      </section>
    </>
  );
}

function ImpactOverview({ demo }: { demo: boolean }) {
  return (
    <section className="campaign-impact" aria-labelledby="campaign-impact-title">
      <header>
        <div>
          <h2 id="campaign-impact-title">Kampagnenwirkung.</h2>
          <p>
            Die Kampagne wird ausserhalb von Sonio Insights umgesetzt. Hier werden ihre
            Resultate entlang der Wirkungskette zusammengeführt.
          </p>
        </div>
        <label className="campaign-picker">
          Kampagne anzeigen
          <select defaultValue={demo ? "demo" : "empty"} disabled={!demo}>
            {demo ? (
              <option value="demo">Beispielkampagne · Sichere Hybrid Cloud</option>
            ) : (
              <option value="empty">Noch keine bestätigte Kampagne</option>
            )}
          </select>
        </label>
      </header>

      {demo ? (
        <div className="campaign-context" aria-label="Beispielkampagne">
          <div>
            <strong>Sichere Hybrid Cloud</strong>
            <span>Illustrative Beispieldaten – keine Live-Kampagne</span>
          </div>
          <dl>
            <div><dt>Ziel</dt><dd>Qualifizierte Nachfrage</dd></div>
            <div><dt>Zeitraum</dt><dd>15. Sep. – 31. Okt. 2026</dd></div>
            <div><dt>Massnahmen</dt><dd>9 verknüpfte Quellen</dd></div>
          </dl>
        </div>
      ) : (
        <div className="campaign-empty" role="status">
          <Target size={30} aria-hidden="true" />
          <div>
            <strong>Die erste Kampagne wird gemeinsam bestätigt.</strong>
            <p>
              Bis dahin bleiben alle echten Werte in ihren Kanaldashboards. Es werden
              weder Massnahmen geraten noch Demo-Zahlen als Live-Ergebnisse übernommen.
            </p>
          </div>
        </div>
      )}

      <div className="campaign-journey" aria-label="Wirkungskette der Kampagne">
        {journey.map((stage, index) => (
          <div key={stage.title} className="campaign-stage">
            <div className="campaign-stage-heading">
              <h3>{stage.title}</h3>
              {index < journey.length - 1 && <ArrowRight size={18} aria-hidden="true" />}
            </div>
            <ul>
              {(demo ? stage.demo : stage.live).map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="campaign-impact-note">
        Die Stufen zeigen unterschiedliche Messpunkte. Provider-Zielaktionen und
        Website-Zielaktionen können dieselbe Handlung beschreiben und werden deshalb
        nicht ungeprüft addiert.
      </p>
    </section>
  );
}

function Measures({ data }: { data: Dashboard }) {
  const measures = campaignMeasurementPlan(data);
  return (
    <section className="campaign-measures" aria-labelledby="campaign-measures-title">
      <header>
        <div>
          <h2 id="campaign-measures-title">Massnahmen und Resultate.</h2>
          <p>
            Jede Massnahme bleibt einzeln lesbar – inklusive Kennung, Datenquelle und
            dem Ergebnis, das sie zur Kampagne beiträgt.
          </p>
        </div>
        <div className="campaign-legend" aria-label="Statuslegende">
          {(Object.keys(stateLabels) as IdentificationState[]).map((state) => (
            <span key={state} data-state={state}>{stateLabels[state]}</span>
          ))}
        </div>
      </header>

      <div className="campaign-measure-labels" aria-hidden="true">
        <span>Massnahme</span><span>Erkennung</span><span>Resultat</span>
      </div>
      <div className="campaign-measure-list">
        {measures.map((measure) => {
          const results = data.demo
            ? demoResults[measure.id]
            : ["Nach bestätigter Zuordnung sichtbar"];
          return (
            <article key={measure.id}>
              <div className="campaign-measure-name" data-label="Massnahme">
                <span className="campaign-measure-icon"><MeasureIcon measure={measure} /></span>
                <div>
                  <h3>{measure.label}</h3>
                  <span>{sourceStatus(measure, data.demo)}</span>
                </div>
              </div>
              <div className="campaign-measure-identity" data-label="Erkennung">
                <span className="campaign-state" data-state={measure.state}>
                  {stateLabels[measure.state]}
                </span>
                <strong>{measure.identifier}</strong>
                <p>{measure.matching}</p>
              </div>
              <div className="campaign-measure-results" data-label="Resultat">
                <ul>{results.map((result) => <li key={result}>{result}</li>)}</ul>
                <p>Vorgesehen: {measure.expectedResults.join(", ")}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TrackingLogic() {
  const flow = ["Kampagnenschlüssel", "Provider- oder Content-ID", "Kanalwert", "Kampagnenergebnis"];
  return (
    <section className="campaign-tracking" aria-labelledby="campaign-tracking-title">
      <div className="campaign-tracking-main">
        <Workflow size={31} aria-hidden="true" />
        <h2 id="campaign-tracking-title">Damit jede Massnahme erkannt wird.</h2>
        <p>
          Nicht der Titel entscheidet, sondern eine stabile technische Spur. Diese
          Verbindung wird einmal bestätigt und danach bei jedem Abruf wiederverwendet.
        </p>
        <div className="campaign-flow" aria-label="Zuordnungsablauf">
          {flow.map((item, index) => (
            <div key={item}>
              <span>{item}</span>
              {index < flow.length - 1 && <ArrowRight size={17} aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>

      <div className="campaign-qr-sources">
        <div className="campaign-qr-intro">
          <QrCode size={29} aria-hidden="true" />
          <div>
            <h3>QR ist der Zugang – nicht die Herkunft.</h3>
            <p>
              Die Zieladresse oder die Redirect-ID muss festhalten, wo der Code eingesetzt
              wurde. So bleiben Direct Mailing und Fachartikel getrennt auswertbar.
            </p>
          </div>
        </div>
        <div className="campaign-qr-row">
          <Mail size={21} aria-hidden="true" />
          <strong>Direct Mailing</strong>
          <code>utm_source=direct_mail</code>
          <span>eigene Redirect-ID und eigener utm_content-Wert</span>
        </div>
        <div className="campaign-qr-row">
          <FileText size={21} aria-hidden="true" />
          <strong>Fachartikel</strong>
          <code>utm_source=fachartikel</code>
          <span>eigene QR-/Link-ID und eigener utm_content-Wert</span>
        </div>
        <p className="campaign-qr-note">
          QR-Weiterleitungen und GA4-Sitzungen sind zwei verschiedene Messpunkte und
          werden separat ausgewiesen.
        </p>
      </div>
    </section>
  );
}

function OpenAssignments() {
  return (
    <section className="campaign-open" aria-labelledby="campaign-open-title">
      <header>
        <CircleAlert size={28} aria-hidden="true" />
        <div>
          <h2 id="campaign-open-title">Offene Zuordnungen.</h2>
          <p>Diese drei Punkte klären wir anhand der echten Kampagne.</p>
        </div>
      </header>
      <ul>
        <li><strong>Website:</strong> ein verbindlicher Kampagnenschlüssel für alle UTM-Links.</li>
        <li><strong>QR:</strong> Anbieter, Redirect-ID und Namensschema für Printmassnahmen.</li>
        <li><strong>Quellen:</strong> konkrete Ads-, Post-, Mailing-, Video- und Event-IDs.</li>
      </ul>
      <details>
        <summary><Link2 size={17} aria-hidden="true" /> Was Sonio Insights nicht automatisch verbindet</summary>
        <p>
          Ähnliche Titel, dieselben Themen, ein gemeinsames Veröffentlichungsdatum oder
          dieselbe Zielseite ohne Kampagnenparameter gelten nicht als Beleg. Dadurch
          bleibt jede Auswertung nachvollziehbar und korrigierbar.
        </p>
      </details>
    </section>
  );
}

export function CampaignWorkspace({ data }: { data: Dashboard }) {
  return (
    <div className="campaign-workspace">
      <p className="directory-intro">
        Dieser Bereich erstellt keine Kampagnen. Er konsolidiert die Wirkung einer
        bestehenden 360°-Kampagne über Paid, Organic, Website, E-Mail, Video, Events
        und Offline-Massnahmen hinweg.
      </p>

      <section className="campaign-guardrail" aria-labelledby="campaign-guardrail-title">
        <ShieldCheck size={34} aria-hidden="true" />
        <div>
          <h2 id="campaign-guardrail-title">Einmal zuordnen. Fortlaufend lesen.</h2>
          <p>
            Nur bestätigte IDs und Trackingparameter verbinden eine Massnahme mit der
            Kampagne. Neue Resultate fliessen danach automatisch in diese Sicht.
          </p>
        </div>
        <span>{data.demo ? "Illustrative Beispieldaten" : "Geschützte Live-Ansicht"}</span>
      </section>

      <ImpactOverview demo={data.demo} />
      <Measures data={data} />
      <TrackingLogic />
      <OpenAssignments />
    </div>
  );
}
