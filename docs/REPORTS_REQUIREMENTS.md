# Reports – bestätigter Aufbau, 5. Oktober 2026

Die Reports werden nach GL, Sales und Marketing unterschieden. Der Ton ist konstruktiv und transparent: Ergebnisse und Chancen zuerst, Rückgänge und Datengrenzen sachlich einordnen. Bestehende Sonio-Gestaltung, Originalbild, Typografie und Zitat bleiben erhalten; keine eigenständige neue Designsprache.

- GL: Monatszusammenfassung, ausgewählte Ergebnisse/Fortschritte, höchstens drei Prioritäten, nächste Schritte und notwendige GL-Entscheidungen.
- Sales: relevante Themen, drei bis fünf passende Inhalte für Gespräche, erfasste Leads und Event-Kontaktanlässe, höchstens drei gemeinsame Aktionen. Keine Firmenidentifikation oder Pipeline aus anonymen Kennzahlen ableiten.
- Marketing: Monatszusammenfassung, unmittelbar danach vier wichtigste/dringendste Empfehlungen, dann Kanal-/Inhaltsleistung, kampagnenbezogene Ausgaben/Ergebnisse und Events/Webinare. Keine zweite redundante Massnahmenliste.

Crossmediale Kampagnen werden später vertieft. Empfehlungen sollen Beobachtung und Zeitbezug, Aktion, erwarteten Nutzen und Dringlichkeit enthalten. Keine erfundenen Ergebnisse oder ungestützten Prioritäten.

## Implementierter Stand

`ReportPreview.tsx` bietet die drei auswählbaren Inhaltsvorschauen, jeweils drei Kennzahlen aus dem geladenen Dashboard und beispielhafte redaktionelle Gliederung. Die vier Marketing-Empfehlungen sind ausdrücklich illustrative Gestaltungsbeispiele, keine KI-Auswertung. Der Zeitraum folgt dem bestehenden Monatswähler. Unbekannte Kennzahlen bleiben unbekannt; Eventbestände sind als solche beschriftet.

Archiv und bestehende Speicherung verwenden weiterhin den bisherigen gemeinsamen Monatsreport. Es gibt noch keine nach Zielgruppe generierten oder exportierten Reports. Die Vorschau wird nicht als fertiger Bericht gespeichert. Automatische Zustellung ist ohne Prüfung von Scheduler, Empfängern und Mailkonfiguration nicht zugesichert.

## Verfeinerung und Datenvorschau

Die Kapitel unter den Kennzahlen öffnen sich inline. Sie führen nicht auf weitere Seiten. Jede Perspektive zeigt bereits Monatskennzahlen, feste Lesehilfen, Datenbasis und konkret benannte nächste Ausbauschritte. Der Einstieg wird aus vorhandenen Website-Besuchen und LinkedIn-Impressionen befüllt. Veränderungen werden nur bei serverseitig vergleichbaren, nicht veralteten Zeiträumen und positivem Vorperiodenwert berechnet; unbekannt bleibt unbekannt. Eventzahlen kommen aus EventSummary einschliesslich Abdeckung.

Noch keine automatisch erzeugte Analyse: Die vier Marketing-Empfehlungen bleiben ausdrücklich illustrative Beispiele. Einzelne Artikel, Videos und Kampagnen werden in dieser Vorschau noch nicht zusätzlich abgefragt. Der Entwurf zeigt dafür konkrete Datenquellen und die vorgesehene Darstellung.

## Visueller Sales-Report

Sales verwendet jetzt eine eigene visuelle Ansicht (`SalesReport.tsx`) anstelle der Kapiteltexte: Top-5-Balkenranking, hervorgehobener Inhalt, zunächst vier Bildkarten (auf alle erweiterbar), separate Google-/LinkedIn-Ads-Klickranglisten. Website-Ranking misst Seitenaufrufe, nicht Linkklicks. Fachinhalte/Porträts filtert erkannte Kategorien bzw. Seiten mit Katalogbild; Alle Webseiten zeigt alle gelieferten Pfade.

Geschützte Endpoints `/api/sales-report/pages` (GA4-Monatsdaten aller gemeldeten Sonio-Pfade, bestehender Katalog nur für Bilder) und `/api/sales-report/linkedin` (lokale Kampagnen-Tageswerte auf ausgewählten Monat begrenzt). Google Ads verwendet den bestehenden Monatsendpoint. Fehlende Werte bleiben fehlend, keine Lifetime-Werte als Ersatz. Demo ruft diese Endpoints nicht auf.

Fünf öffentliche Vorstellungsfilme für Fitim, Kutay, Harald, Paddy und Roman anhand der Sonio-CMS-Seiten am 5.10.2026 verifiziert. Direkt abspielbar, mit Originalposter, kein Autoplay. Verfügbare Zahlen unter den Videos sind ausdrücklich Monats-Seitenaufrufe, keine Videoaufrufe. Filme bleiben unabhängig vom Berichtsmonat sichtbar. Die Zuordnung liegt in `salesPortraits.ts`.

GL und Marketing behalten bis zur separaten Überarbeitung ihren bisherigen Entwurf. Speicherung/Export des neuen Sales-Layouts ist noch nicht umgesetzt.

### Sales-Korrektur: Organic und Video-Vormonat
LinkedIn Ads im Sales-Report durch LinkedIn Organic ersetzt (vorhandener geschützter Posts-Endpunkt). Ranking nach verfügbaren Klickmesswerten, fünf Beiträge mit Bildern und Original-Link. Veröffentlichungsmonat bestimmt Auswahl, Kennzahlen bleiben ausdrücklich Gesamtstände seit Veröffentlichung; keine falsche Monatszuordnung. Google Ads bleibt Monatsauswertung.
Vorstellungsvideos zeigen aktuelle und vorige Monats-Seitenaufrufe nebeneinander. Laufender Monat: Vorperiode bis zum gleichen Kalendertag (bei kürzerem Monat dessen Ende), sichtbar beschriftet. Unbekannt bleibt Strich.

### Redaktionelle Auswahl Sales / GL
IT Support & Helpdesk (`/services/support`, inklusive FR und Unterpfaden) wird nicht als Highlight oder Ranking-Inhalt in Sales/GL aufgenommen. Sales blendet es in beiden Website-Auswahlen aus. Rohdaten und gesamte Website-KPIs bleiben unverändert; dies ist eine redaktionelle Auswahl, keine Datenlöschung.

### Vorrangige Korrektur: Vorstellungsvideos
Vormonatsanzeige wieder entfernt. Neben dem ausgewählten Monat steht der verfügbare Gesamtstand seit Veröffentlichung aus `/analytics/areas?area=profile&period=all`. Beide Zahlen sind ausdrücklich Seitenaufrufe, keine Videoaufrufe. Die Gesamtabfrage ist unabhängig vom ausgewählten Monat. Fehler bleiben sichtbar, unbekannte Werte bleiben Striche.

## Visueller GL-Report
`ExecutiveReport.tsx` ersetzt die Kapitelvorschau für GL: drei ausgewählte Monatskennzahlen (Website-Sitzungen, LinkedIn-Organic-Impressionen, Google-Ads-Ausgaben), geprüfte Tendenzen aus der bestehenden Vergleichslogik, umschaltbare Tageskurve mit Tooltip. Fehlende Tage bleiben Lücken. Ein Monats-Inhaltshighlight aus dem Website-Katalog mit Bild; Support/Helpdesk bleibt ausgeschlossen.
Werbeausgaben getrennt nach Konto, Eventanzahl und Kundenbestand mit Datenabdeckung in Infoboxen. Drei feste redaktionelle Handlungsimpulse, nicht als KI-Analyse bezeichnet. Keine Umsatz-/Pipeline-Ableitung. Bildwelt, Farben, Typografie und Archiv unverändert. Marketing folgt weiterhin dem vorherigen Entwurf.

### GL: Wirkung statt Budget – 05.10.2026
Budget und Werbeausgaben entfallen vollständig aus der GL-Vorschau, einschliesslich Diagrammauswahl und Handlungsimpulsen. Dritte Hauptkennzahl bleiben Google Ads: Klicks auf Google-Anzeigen statt Ausgaben, mit verständlicher Definition und verlässlichem Vorperiodenvergleich. Klicks sind keine Leads oder Kunden. Die LinkedIn-Kennzahl heisst auf Nutzerwunsch «LinkedIn-Impressionen»; die Erklärung bleibt in der Infobox.

GL-Diagramm: Hover zeigt Tageswert, Wert desselben Kalendertags im Vormonat und prozentuale Veränderung. Vergleich ist ausdrücklich ein Tagesvergleich; obere KPI-Tendenzen bleiben Vergleiche gleich langer Monatszeiträume. Fehlende Werte, Null im Nenner, veralteter Stand oder laufender unvollständiger Tag ohne Prozentwert.

GL-Events und Hinweise (05.10.2026): Events des Berichtsmonats als Bildkarten mit Datum, Ort, Quelle und vorhandenen aggregierten Zahlen (Anmeldungen oder korrekt bezeichnete Formularantworten, Kunden, Sonio, Partner). Mehrere Events zweispaltig, mobil einspaltig, mögliche Duplikate ausgeschlossen. Keine Personendaten.
«Was bedeutet das konkret?» ersetzt allgemeine Impulse: beobachtete Inhaltsresonanz, LinkedIn-Entwicklung und Anzeigenklicks jeweils mit konkretem nächsten Schritt. Regelbasierte Hinweise, keine behauptete KI-Analyse oder gesicherte Ursache.

GL-Eventlayout: Genau ein Event nutzt die volle Inhaltsbreite mit Bild links und Kennzahlen rechts. Ab zwei Events zweispaltige Karten; bis 800px alle Karten und Bild/Text untereinander.

### Marketing-Hub – 05.10.2026
Die alte textlastige Vorschau wird durch einen visuellen Hub ersetzt:
- Sechs Kanal-Kennzahlen mit verifiziertem Monatsvergleich und Infoboxen; Auswahl steuert ein Tagesdiagramm mit Vormonatslinie und Prozent-Hover.
- Vier Bildhighlights aus Website, LinkedIn Organic, YouTube und Newsletter. Veröffentlichung/Versand im Berichtsmonat und Gesamtwerte bleiben von monatlichen Website-Werten explizit getrennt. Keine Rangliste über verschiedene Kanäle.
- Vier regelbasierte Aufgaben mit konkreter Datenbeobachtung, transparenter Reihenfolge und Link zur Empfehlungsseite. Keine behauptete Agentenanalyse.
- Aggregierte Eventkarten mit demselben responsiven Layout wie GL. Keine Personendaten, Demo ohne geschützte Inhalte.

Report-Vorschaubilder (05.10.2026): Gemeinsamer Resolver ergänzt den Live-Katalog mit öffentlich verifizierten Sonio-Originalmotiven in reportPageImages.json. Vorstellungsseiten verwenden die bestätigten Protagonistenbilder. Die Fachinhalte-Auswahl bleibt unabhängig von neu ergänzten Bildern unverändert. Kleine Vorschaubilder auch im Sales-Ranking. Keine Ersatzmotive für unbekannte Bilder.

Marketing-Kanalvergleich: Google Ads, LinkedIn Organic und LinkedIn Ads mehrfach auswählbar. Impressionen und Klicks einzeln oder gemeinsam überlagerbar; Kanalfarbe und gestrichelte Klicklinien unterscheiden die Reihen. Gleiche Anzahl-Skala, keine Normalisierung oder Addition. Tooltip mit Werten und Tagesvergleich zum Vormonat. Fehlende Reihen sichtbar kennzeichnen.
