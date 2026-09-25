import { useState } from "react";

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
}: {
  channel: string;
  fields: Record<string, string>;
}) {
  const [selected, setSelected] = useState("");
  const key = selected in fields ? selected : Object.keys(fields)[0];
  const explanation =
    channel === "linkedin_organic" && key === "clicks"
      ? "Klicks auf den LinkedIn-Beitrag und seine Inhalte. Dazu können auch interne Klicks gehören; dies sind keine nachgewiesenen Website-Besuche."
      : definitions[key] ||
        "Die Definition dieser Kennzahl ist noch nicht hinterlegt.";
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
