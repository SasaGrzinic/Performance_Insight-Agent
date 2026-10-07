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

## LinkedIn-Organic-Empfehlungspilot — 06.10.2026
- Kein Agent: transparente regelbasierte Testideen, zunächst im Organic-Kanal (Top 2) und im LinkedIn-Bereich der Empfehlungsseite (bis zu 3 belegbare Hinweise).
- Kachel zeigt Beobachtung; native aufklappbare Details enthalten Einordnung, nächsten Schritt und Erfolgskontrolle. Bestehender Sonio-Stil bleibt erhalten.
- Veröffentlichungsfrequenz richtet sich nach Kampagnen, Events und News. Keine automatische Empfehlung «mehr posten» bei sinkenden Impressionen.
- Resonanz: konkrete Beiträge, Klicks/Kommentare/Reposts separat; kein willkürlich gewichteter Score. Höchste verfügbare Klickzahl ist Auswahlhilfe, kein Qualitätsurteil. Veröffentlichungsalter und Format beachten.
- Video: Bekanntheit, Verständnis oder Handlung als Zweck unterscheiden. Aufrufe allein beweisen keinen Awareness-Zuwachs; durchschnittliche Betrachtungsdauer verrät keine Abbruchursache. Fehlende Werte nicht ersetzen.
- Nur bestätigte Beitragsdaten erzeugen konkrete Beitrags-/Videoideen. Monatsbeobachtung nur mit vergleichbaren, nicht veralteten Werten. Beitrags-Gesamtwerte, Zeitraum und Abrufstand sichtbar getrennt.
- Keine künstliche Auffüllung auf 4–6 Empfehlungen bei fehlender Evidenz. Weitere Kanäle und bestehende Übersichts-Teaser bleiben vorerst unverändert.

## LinkedIn-Ads-Empfehlungspilot — 06.10.2026
Gleiches kompaktes Kachelformat wie Organic: zwei Hinweise im Kanal, bis sechs auf der Empfehlungsseite mit Erweiterung. Regelbasiert, kein Agent. Pro echte Kampagne zielabhängige Einordnung, konkrete Vorbereitung/Testidee und Erfolgskontrolle. Entwürfe/zukünftiger Start erhalten keine Performancebewertung. Awareness nicht anhand geringer Klicks abwerten; CTR immer im Mengenkontext; Leads sind Formular-Einsendungen, keine qualifizierten Verkaufschancen. Abschlussrate nur bei vollständigen plausiblen Werten und Öffnungen >0. Fehlende Kampagnenwerte erhalten Datenhinweise statt Optimierungsurteilen. Beispiele ausgeschlossen, fehlerhafter/unbestätigter Abruf unterdrückt Hinweise. Zeitraum bleibt letzte 365 Tage, unabhängig vom Berichtsmonat. Keine Änderungen an Kampagnen oder Leadkontakten.

## Google-Ads-Empfehlungspilot — 06.10.2026
Regelbasierte Prüfhinweise im bestehenden Kachelformat, Top 2 im Kanal und bis 6 erweiterbare Hinweise auf der Empfehlungsseite. Monatsdaten und Datenstände sichtbar; Demo und Abrufwarnungen erzeugen keine scheinbar aktuellen Empfehlungen. Suchkampagnen separat von anderen Anzeigentypen. Fachliches Kampagnenziel fehlt im gelieferten Bericht und wird ausdrücklich zur Bestätigung gestellt. Keine willkürlichen «hohe/niedrige CTR»-Schwellen: absolute Mengen nennen, keine Gewinnerbehauptung. Fehlende Zielaktionen von beobachteter Null trennen; Tracking/Definition und Verzögerung vor Optimierung berücksichtigen. Suchanfrage mit den meisten Klicks und bestätigten null Zielaktionen als Prüfhinweis, niemals automatisch irrelevant; Ausschlüsse nur nach fachlicher Prüfung und Freigabe. Keine externen Kampagnenänderungen oder Agentenaktivierung.

## Analytics-Empfehlungen und KI-Jahresstand — 06.10.2026
Vier regelbasierte Hinweise: gefragte Fachseite, nächster Schritt, monatlicher Quellenmix, erkennbare KI-Sitzungen. Monatswerte aus dem bestehenden geschützten Seitenbericht, keine Vermischung mit Veröffentlichungskohorten. Keine Agentenaktivierung. Quellen mit Warnungen/Thresholding/Datenverlust werden nicht bewertet.
KI-Block ergänzt um separat beschrifteten Jahresstand des ausgewählten Jahres (1.1. bis heute bzw. Jahresende). Aggregierte GA4-Abfrage mit annual=true, eigener Cache, gleiche vier Anbieter; Monat ist Teil des Jahres, nicht addieren. Copilot-Domain copilot.com ergänzt, mit offizieller Microsoft-Seite verifiziert (https://copilot.com/). Keine pauschale Zuordnung von Bing/Direct. Keine erkannte Berichtszeile bleibt «—».
Live-Audit Property: 207 sessionSource-Zeilen für 1.1.–6.10.2026, keine gemeldeten Thresholding-/OtherRow-Verluste. ChatGPT52, Copilot8 (copilot.com zuvor nicht erkannt), Perplexity2, keine Claude-Zeile; zusätzlich Gemini1 ausserhalb der vier ausgewählten Quellen. August ChatGPT3, September6, Oktober bis6.10.4; in diesen Monaten keine anderen erkannten KI-Quellen. Das ist eine Momentaufnahme, keine Aussage über nicht übermittelte Herkunft.
Quelle zur Messgrenze: https://support.google.com/analytics/answer/15258820 — fehlende Herkunft kann als Direct erscheinen. Keine nachträgliche KI-Zuschreibung.

## Conversion-Review Google Ads – 06.10.2026, nur lesend

Sonio-Konto 932-539-5786 im angemeldeten Google-Ads-Browser geprüft. Zeitraum der
sichtbaren Tabelle: **05.09.–02.10.2026**, Spalte **Alle Conv.**; ausdrücklich kein
Kalendermonat und kein bereits durchgeführter Abgleich mit `metrics.conversions`
der Dashboard-Summe. Filter alle aktivierten: 11 Aktionen, vollständig angezeigt.

- Lead-Formular – senden: 249,00; von Google gehostet, primäre Aktion, Kontoziel ja,
  Zählmethode eine, Klickfenster 1 Tag. Detailseite bestätigt Formular-Leads,
  letzte Conversion 06.10.2026 05:00. Keine Prüfung von Kontaktqualität,
  eindeutigen Personen, Spam oder Sales-Annahme; keine Rohkontakte abgerufen.
- Seitenaufruf (Google Analytics-Ereignis file_download): 3,62; GA4, primär,
  Kontoziel ja, alle, 90 Tage. Name/Kategorie passen nicht zur Download-Bezeichnung.
- Seitenaufruf (Google Analytics-Ereignis ads_conversion_Kontakt_1): 0,00;
  GA4, primär, Kontoziel ja, alle, 90 Tage; tatsächlicher Trigger noch ungeprüft.
- Calls from Smart Campaign Ads: 0,00; Anruf über Anzeigen, eine, 30 Tage.
- Klicks auf die Anrufschaltfläche in Google Maps bei smarter Kampagne: 0,00.
- Klicks auf die Anrufschaltfläche von Anzeigen bei smarter Kampagne: 0,00.
- Klicks auf den Routenplaner in Google Maps bei smarter Kampagne: 0,00.
- Lokale Aktionen – andere Interaktionen: 1,00.
- YouTube channel subscriptions: 0,00.
- (Google Analytics-Ereignis IT Health Check für Ihre Infrastruktur): 0,00;
  Auslösebedingung noch ungeprüft.
- YouTube follow-on views: 1,00.
Die letzten acht sind laut Tabelle nicht in Kontostandardzielen enthalten;
Kampagnen können eigene Ziele verwenden. Gesamt Alle Conv.: 254,62.

Vorschlag zur Nutzerentscheidung: Formularübermittlungen getrennt von Downloads
und weiteren Interaktionen auswerten; Kontakt/Health-Check erst nach Prüfung der
Auslöser als Anfrage einordnen. Keine Google-Ads-Einstellungen oder Dashboard-
Kennzahlen geändert, kein Agent aktiviert.

Technische Grenze: Direkte lesende API-Prüfung der Aktionen schlug mit
DEVELOPER_TOKEN_PARAMETER_MISSING fehl, auch nach explizitem Laden der lokalen
.env-Konfiguration. Browserzugriff funktioniert. Dies belegt nicht, dass bereits
laufende Prozesse dieselbe Konfiguration verwenden; kein Dienst wurde neu
 gestartet und kein Token geändert. API-Aufschlüsselung und Summenabgleich offen.

### Nutzerentscheid: Trennung der Google-Ads-Zielaktionen bestätigt

Am 06.10.2026 bestätigt: Formularübermittlungen, Downloads/Interessenssignale und
qualifizierte Leads fachlich trennen. Die bisherige Summe bleibt bis zum
verifizierten API-Abgleich «Erfasste Zielaktionen»; nicht pauschal in Leads
umbenennen. Keine manuellen Browserwerte aus 05.09.–02.10.2026 in Monatskacheln
übernehmen. Kontakt- und Health-Check-Ereignisse erst nach verifizierter
Auslösebedingung als Anfragen einstufen. Qualifizierte Leads erfordern bestätigte
Marketing-/Sales-Rückmeldung. Google-Ads-Gebotsziele und Kontoeinstellungen bleiben
unverändert. Die technische Umsetzung der getrennten Monatswerte ist noch offen;
Voraussetzung ist die lesende Conversion-Aktionsabfrage samt Summenabgleich.

### Umsetzung und Korrektur des API-Befunds – 07.10.2026

Der vorige Developer-Token-Befund war ein Fehler der separaten Prüf-Abfrage:
Ein explizit leerer developer-token-Header verursacht den Fehler; ohne diesen
Header funktioniert die vorhandene Verbindung. Keine Credentials, Scopes oder
Google-Ads-Einstellungen geändert. Die bisherige Importlogik lässt den leeren
Header bereits korrekt weg.

`google_ads_conversions.py` liest Definitionen und kampagnenweise Conversions /
All Conversions. Nur LEAD_FORM_SUBMIT wird als Formularübermittlung klassifiziert;
der verifizierte GA4-file_download-Identifier 6872179612 als Download. Sonstige
Aktionen bleiben getrennt und werden nicht automatisch als qualifizierte Leads
bezeichnet. Pro Kampagne muss die Summe der Einzelaktionen zur bisherigen
Conversion-Summe passen (Toleranz 0,01); Duplikate, falsche Herkunft, unbekannte
Definitionen oder ungültige Zahlen sperren die Aufschlüsselung. Ein Fehler
verändert die bestehenden Kampagnenkennzahlen nicht.

Google Ads zeigt einen kompakten Block unter den Hauptkennzahlen. Monat und
Kampagnenfilter gelten auch für die drei Gruppen. Aufklappbare Einzelaktionen
zeigen zusätzlich All Conversions, ohne sie zur oberen Summe zu addieren.
Bestehende CSV-Spalten bleiben unverändert; die neue Aufschlüsselung ist noch
kein eigener Export. Öffentliche Demo erhält keine Live-Werte.

Live September 2026: 260 Formularübermittlungen + 6,832938 Download-Conversions
+ 0 weitere Zielaktionen = 266,832938 Kampagnen-Conversions. Kontoabfrage vom
01.–06.10.2026: 31 Formular-Conversions; keine Download-Berichtszeile. Diese
Momentaufnahmen sind keine unveränderlichen historischen Referenzwerte.
