import { useId, useState } from "react";

const definitions: Record<string, string> = {
  click_rate: "Mailchimp-Klickrate: Anteil der zugestellten Empfänger mit mindestens einem erfassten Klick. Mehrfachklicks derselben Person erhöhen diese Rate nicht. Bots können Klicks beeinflussen.",
  delivery_rate: "Zustellrate: (Versendet − Hard-Bounces − Soft-Bounces) ÷ Versendet × 100. Eine Zustellung belegt nicht den Eingang im Posteingang statt im Spamordner.",
  delivered: "Versendete E-Mails abzüglich Hard- und Soft-Bounces. Keine Aussage darüber, ob die Nachricht gelesen wurde.",
  hard_bounces: "Dauerhaft unzustellbare E-Mails, etwa wegen einer ungültigen Empfängeradresse.",
  soft_bounces: "Vorübergehend unzustellbare E-Mails, etwa wegen eines vollen Postfachs.",
  unsubscribed: "Abmeldungen, die Mailchimp diesem Mailing zuordnet.",
  unsubscribe_rate: "Abmeldungen geteilt durch erfolgreich zugestellte E-Mails × 100. Hilft, Relevanz und Versandhäufigkeit einzuordnen.",
  open_rate: "Von Mailchimp erfasster Anteil der zugestellten Empfänger mit einer Öffnung. Datenschutzfunktionen wie Apple Mail Privacy Protection und Bots können die Zahl erhöhen; nur ergänzend bewerten.",
  impressions:
    "Wie oft Inhalte oder Anzeigen angezeigt wurden. Mehrere Anzeigen bei derselben Person zählen mehrfach.",
  clicks:
    "Von der Plattform gezählte Klicks. Sie entsprechen nicht automatisch Website-Besuchen.",
  landing_page_clicks: "Klicks, die zur Zielseite der Anzeige führen. Keine eindeutigen Personen und kein Nachweis, dass die Website vollständig geladen wurde.",
  landing_page_ctr: "Landingpage-Klicks geteilt durch Impressionen × 100. Zeigt, wie oft eine Einblendung zu einem Klick auf die Zielseite führt; unterscheidet sich von LinkedIns allgemeiner CTR.",
  landing_page_cpc: "Ausgaben geteilt durch Landingpage-Klicks. Zeigt die Kosten für einen Klick zur Zielseite, nicht die Kosten pro Website-Besuch oder Lead.",
  cpm: "Ausgaben geteilt durch Impressionen × 1’000. Beschreibt den Preis der Ausspielung, nicht die Qualität der erreichten Personen.",
  cost_per_conversion: "Ausgaben geteilt durch die LinkedIn zugerechneten Website-Zielaktionen. Aussagekräftig erst mit bekanntem Conversion-Ziel und geprüftem Tracking. Bei null Zielaktionen nicht berechenbar.",
  ctr: "Klickrate: Klicks geteilt durch Impressionen × 100. Zeigt, welcher Anteil der Einblendungen zu einem Klick führte.",
  cpc: "Durchschnittliche Kosten pro Klick: Werbeausgaben geteilt durch Klicks.",
  spend:
    "Werbeausgaben im angezeigten Zeitraum, in der Währung des Werbekontos.",
  conversions:
    "Von der Werbeplattform zugerechnete Zielaktionen. Welche Aktionen zählen, hängt von eurem Conversion-Tracking ab.",
  sessions:
    "Besuche auf der Website. Eine Person kann mehrere Sitzungen auslösen.",
  engaged_sessions:
    "GA4-Sitzungen mit mehr als 10 Sekunden Dauer, einem Schlüsselereignis oder mindestens zwei Seiten-/Bildschirmaufrufen; die Dauer kann in GA4 angepasst sein.",
  key_events:
    "In GA4 als besonders wichtig markierte Ereignisse, zum Beispiel eine abgeschickte Anfrage.",
  likes: "Gefällt-mir-Reaktionen auf Beiträge.",
  comments: "Kommentare zu den Beiträgen; keine Anzahl eindeutiger Personen.",
  shares: "Wie oft Beiträge weitergeteilt wurden.",
  followers_gained:
    "Neu hinzugewonnene Follower im Zeitraum. Abgänge sind nicht abgezogen; dies ist kein Nettozuwachs.",
  followers_organic:
    "Neue Follower aus unbezahlter Aktivität. Abgänge sind nicht abgezogen.",
  followers_paid:
    "Neue Follower, die bezahlter Aktivität zugeordnet wurden. Abgänge sind nicht abgezogen.",
  emails_sent:
    "Anzahl der versendeten E-Mails. Nicht gleichbedeutend mit erfolgreich zugestellten E-Mails.",
  unique_opens:
    "Empfänger mit mindestens einer erfassten Öffnung je Kampagne. Datenschutzfunktionen können Öffnungen beeinflussen; über Kampagnen hinweg sind Personen nicht dedupliziert.",
  unique_clicks:
    "Empfänger mit mindestens einem erfassten Link-Klick je Kampagne. Dieselbe Person kann in mehreren Kampagnen zählen.",
  views:
    "Von YouTube gezählte Videoaufrufe. Wiederholte Aufrufe können enthalten sein; dies ist keine eindeutige Zuschauerzahl.",
  watch_minutes: "Gesamte Wiedergabezeit aller erfassten Aufrufe in Minuten.",
  subscribers_gained:
    "Neu gewonnene Kanalabonnenten. Verlorene Abonnenten sind nicht abgezogen.",
  registrations:
    "Anmeldungen aus Eventlisten, innerhalb jeder Liste nach E-Mail-Adresse dedupliziert. Keine bestätigten Teilnahmen.",
  scans:
    "Erfasste QR-Code-Scans. Wiederholungen können enthalten sein; die Zählweise hängt vom Tracking-Anbieter ab.",
  video_views: "LinkedIn-Videoaufrufe ab drei Sekunden Wiedergabe.",
  video_viewers: "Von LinkedIn gemeldete eindeutige Zuschauende.",
  watch_time_ms:
    "Gesamte LinkedIn-Wiedergabezeit der qualifizierten Videoaufrufe, im Dashboard in Minuten dargestellt.",
  average_watch_seconds:
    "Durchschnittliche Betrachtungsdauer: Wiedergabezeit geteilt durch qualifizierte Aufrufe, in Sekunden. Kein Durchschnitt pro Person.",
};
export function KpiExplainer({
  channel,
  fields,
  variant = "compact",
  dataStatus,
}: {
  channel: string;
  fields: Record<string, string>;
  variant?: "compact" | "knowledge";
  dataStatus?: string;
}) {
  const titleId = useId();
  const [selected, setSelected] = useState("");
  const key = selected in fields ? selected : Object.keys(fields)[0];
  const explanation =
    channel === "linkedin_organic" && key === "clicks"
      ? "Klicks auf den LinkedIn-Beitrag und seine Inhalte. Dazu können auch interne Klicks gehören; dies sind keine nachgewiesenen Website-Besuche."
      : definitions[key] ||
        "Die Definition dieser Kennzahl ist noch nicht hinterlegt.";
  if (variant === "knowledge") return (
    <section className="yt-knowledge analytics-knowledge" aria-labelledby={titleId}>
      <div className="yt-knowledge-heading">
        <span>Von Zahlen zu Wirkung</span>
        <h2 id={titleId}>Kennzahlen verstehen.</h2>
        <p>{channel === "mailchimp" ? "Welche Mailings erreichen Menschen – und welche Inhalte wecken Interesse?" : "Was verrät der Wert über die Website – und was bedeutet er für das Marketing?"}</p>
        <label>Kennzahl auswählen
          <select value={key} onChange={e => setSelected(e.target.value)}>
            {Object.entries(fields).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      <div className="yt-knowledge-content">
        <div aria-live="polite" aria-atomic="true">
          <span className="analytics-knowledge-eyebrow">Einordnung</span>
          <h3>{fields[key]}</h3>
          <p>{explanation}</p>
        </div>
        <p className="analytics-knowledge-source">{channel === "mailchimp" ? "Quelle: Mailchimp · Gesamtstand seit Versand der ausgewählten Mailings. Website-Besuche separat aus GA4 und nur bei eindeutiger Kampagnenzuordnung." : "Quelle: GA4 · Zeitraum gemäss Monatsauswahl. Schlüsselereignisse richten sich nach der Property-Konfiguration und sind nicht automatisch Leads."}</p>
        <p className="analytics-knowledge-status">Fehlende Werte erscheinen als „—“. {dataStatus}</p>
      </div>
    </section>
  );
  return (
    <div className="kpi-explainer">
      <label>
        KPI erklärt
        <select value={key} onChange={(e) => setSelected(e.target.value)}>
          {Object.entries(fields).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <p aria-live="polite">{explanation}</p>
    </div>
  );
}
