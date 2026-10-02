# KPI-Erklärungen: Prüfung vom 02.10.2026

## Google Ads umgesetzt
Chart-Infoboxen an beiden Überschriften, keine Icons pro Diagrammwert. CTR-Einordnung folgt der gefilterten Auswahl und nennt Klicks/Impressionen der führenden Kampagne. Bei null CTR keine Resonanzbehauptung. Kampagnenabschnitt erklärt aktuellen Status und Beispielmotive. Bestehende Infos an allen acht Kennzahlen bleiben erhalten. TypeScript bestanden; Top-CTR-Infobox im Browser geöffnet und geprüft.

## Vorschläge nach Prüfung der Komponenten (noch nicht umgesetzt)
- LinkedIn Ads / AdsCampaigns.tsx: Priorität hoch. Primäre und sekundäre Kampagnenwerte besitzen keine direkte Infobox, nur den zentralen Erklärbereich. Landingpage-Klicks vs. LinkedIn-Klicks, CTR, CPC/CPM, Conversions und CPA direkt erklären.
- LinkedIn Organic / LinkedInOrganic.tsx: KPI- und Follower-Erklärungen vorhanden. Am Titel «Entwicklung im Vergleich» Monats-/Tageswerte und Vergleich laufender Zeiträume erklären; am Inhaltsvergleich Gesamtwerte je Post gegenüber Organisations-Tageswerten unterscheiden.
- YouTube / YouTubeVideos.tsx: Hauptkennzahlen, Veröffentlichungszeitraum und Werbe-KPIs erklärt. Am Titel «Videos im Vergleich» Gesamtwerte, unterschiedliches Videoalter und Werbeunterstützung bündeln; Likes/Kommentare/Shares in den aufgeklappten Details haben keine direkten Infos.
- Video Insights / VideoInsights.tsx: Hauptlücke. Importierte Videos, erfasste Aufrufe und durchschnittliche Betrachtungsdauer direkt erklären. Am Vergleichstitel unterschiedliche Zählweisen der Plattformen erläutern; bestehender Hinweistext ist bereits vorhanden.
- Mailchimp / MailchimpCampaigns.tsx: Weitgehend abgedeckt, inklusive Bots, Öffnungen, Linkklicks und GA4-Zuordnung. Ergänzend eine zentrale Info an der aggregierten Übersicht: Personen können über mehrere Mailings mehrfach zählen; Quoten nach zugestellten E-Mails gewichtet. Keine zusätzlichen Icons je Linkzeile nötig.
- Analytics / AnalyticsInfo.tsx, AnalyticsMonthlySources.tsx, AnalyticsContent.tsx: Breite Erklärung bereits vorhanden, auch KI-Quellen und Zeitraum. Keine zusätzlichen Symbole pro Balken. Bestehende Hinweise zu Veröffentlichungsauswahl/Gesamtwerten und monatlicher Übersicht stärker am jeweiligen Abschnittstitel bündeln, falls Verständlichkeit im Nutzungstest weiterhin unzureichend ist.

Prüfumfang: bestehende React-Komponenten gelesen; Google-Ads-Änderung im Browser geprüft. Kein vollständiger Live-Abruf oder Browserdurchlauf aller Kanäle und kein dauerhaftes Monitoring eingerichtet.

## Ergänzungen umgesetzt
Die oben vorgeschlagenen Ergänzungen wurden nach Nutzerfreigabe in LinkedIn Ads, LinkedIn Organic, YouTube, Video Insights, Mailchimp und Analytics umgesetzt. Bestehende PeriodInfo-/Help-Komponenten wiederverwendet, keine Symbole pro Diagrammwert hinzugefügt. LinkedIn Ads erhält direkte Infos an primären und sekundären KPIs; Mailchimp eine zentrale Aggregationsinfo. Analytics erläutert den Zeitbezug an beiden Abschnittstiteln. YouTube-Interaktionen nutzen vorhandene ausführliche Definitionen.

Verifikation: TypeScript und Vite-Build bestanden (bestehende Bundle-Grössenwarnung). Video-Insights-Plattformvergleich im Browser per Klick geöffnet, Inhalt geprüft und per Escape geschlossen. Keine Änderung an Importen, Berechnungen oder Veröffentlichung.
