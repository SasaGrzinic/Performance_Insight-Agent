# Infoboxen – Prüfung und Bereinigung vom 05.10.2026

Auftrag: Wiederholungen im Dashboard prüfen, Erklärungen gezielter platzieren,
Fragezeichen-Mauszeiger durch Handzeiger ersetzen. Umsetzung vom Nutzer bestätigt.
Die Prüfung umfasst die verwendeten Info-Komponenten und deren Aufrufstellen;
Browserkontrollen betreffen Analytics, Ads, Mailchimp, YouTube und Video Insights.

## Umgesetzt

- Analytics GEO: eine gemeinsame Erklärung am Titel statt sechs identischen
  Definitionen an Titel, Gesamtzahl und vier Quellen. Keine Wiederholung je Domain.
- Analytics Zugriffsquellen: eigene Kanaldefinitionen bleiben; identische Erklärungen
  jeder Zeile der ausführlichen Quellenliste entfernt.
- Analytics Seitendetails: Sitzungen, Besucher und KI-Herkunft einmal am jeweiligen
  Abschnitt erklärt; Download- und Videoereignisse behalten unterschiedliche Definitionen.
- Analytics Seitenkarten: gemeinsame auswählbare Kennzahlhilfe oberhalb der Liste
  statt derselben vier Definitionen an Gesamtstand und Monatsstand jeder Seite.
  Zeitbezüge und individuelle Warnungen bleiben erhalten.
- Analytics Haupt-KPIs: allgemeine Vergleichsinfo entfällt, wenn bereits eine
  konkrete Info mit Zeitraum, Vergleichswerten und Datenstand vorhanden ist.
- Google Ads: gemeinsame Kampagnenhilfe oberhalb der Liste. Haupt-KPI-Definitionen
  und konkrete Vergleichswerte bleiben direkt bei der Kennzahl; allgemeine
  Vergleichsregeln stehen einmal an der Zeitraumsauswahl.
- LinkedIn Ads und Mailchimp: gemeinsame auswählbare Hilfe über den Karten.
  Unterschiedliche Zieldefinitionen, Aggregationsregeln und Datenwarnungen bleiben.
- YouTube: gemeinsame Hilfe für Videokarten sowie separate Hilfe für Werbeaufrufe.
- Video Insights: gemeinsame Hilfen für Portfolio und Gegenüberstellung statt
  wiederholter Definitionen pro Plattform.
- Alle bestehenden CSS-Regeln mit cursor:help auf cursor:pointer umgestellt.
  LinkedIn verwendete bereits den Handzeiger. Info-Symbole bleiben erhalten.

## Bewusst erhalten

- Übersicht/Kanäle: kanalspezifische Kennzahldefinitionen sowie unterschiedliche
  Vergleichs- und Datenstände; gleich aussehende Icons bedeuten nicht gleichen Inhalt.
- LinkedIn Organic: Followerbestand/Zugewinne, Engagement und Videozählweise
  unterscheiden sich fachlich. Keine pauschale Entfernung.
- Suche: Infos am Ranking-/Potenzialtitel und Tabellenkopf statt an einzelnen
  Suchbegriffzeilen sind bereits sinnvoll platziert.
- Events: Formularantworten, Anmeldungen, Teilnahmen und Aufzeichnungsaufrufe
  haben verschiedene Zählgrundlagen. Eventbezogene Einschränkungen bleiben lokal.
- Diagramm-Hover mit tatsächlichen Messwerten und Bildern ist keine redundante
  Erklärbox und bleibt unverändert.
- Empfehlungen, Reports, Datenquellen, Team und Einstellungen: keine vergleichbare
  massenhafte Wiederholung von Kennzahlerklärungen in den geprüften Aufrufstellen.

## Prüfung

TypeScript und Vite-Build erfolgreich; 30 bestehende Frontend-Tests bestanden.
Bestehende Buildwarnung zu Chunkgrössen bleibt. Analytics-Hilfe auf Desktop und
390px geprüft, kein horizontaler Überlauf; Auswahl der Kennzahl funktioniert.
GEO-Info zeigt im Browser cursor:pointer; nur noch eine gemeinsame KI-Infobox.
Keine Datenberechnung, API, Berechtigung oder Veröffentlichung geändert.
