# Sonio Insights – Übergabe für den nächsten Chat

Stand: 7. Oktober 2026. Diese Übergabe fasst bestätigte Entscheidungen zusammen.
Sie ersetzt keine Prüfung des aktuellen Codes, der laufenden Prozesse oder der Zugänge.

## Einstieg und gesicherter Stand

- Repository: https://github.com/SasaGrzinic/Performance_Insight-Agent
- Arbeitsverzeichnis: `/Users/flow/Documents/dev/Insight_performance_agent`
- Arbeitsbranch: `design/sonio-dashboard-login`
- Letzter gesicherter Implementierungscommit: `67074f49a7398c00f0715b737fcf81659721ff1d`.
  Dieser wurde am 7. Oktober erfolgreich auf origin gepusht. Diese Übergabe folgt
  als eigener Dokumentationscommit. Keine Veröffentlichung auf GitHub Pages erfolgt.
- Nach dem Implementierungscommit war der Arbeitsbaum sauber. Im neuen Chat erneut
  `git status`, Branch und Remote prüfen; neue lokale Änderungen niemals verwerfen.
- Geschützte lokale Anwendung: http://127.0.0.1:5173/ ; API: Port 8000.
  Öffentliche GitHub Pages ist eine separate Demo, nicht die vollständige Live-Ansicht.
- Keine Anmeldung umgehen oder bei abgelaufener Sitzung auf Demo ausweichen.
  Keine Geheimnisse im Chat ausgeben, committen oder in Übergaben kopieren.

## Zuerst lesen

1. `AGENTS.md` für Arbeitsregeln; jüngere ausdrückliche Nutzerentscheidungen haben Vorrang.
2. Diese Übergabe für die Fortsetzung und den jüngsten Stand.
3. `docs/REPORTS_REQUIREMENTS.md`: fortlaufende fachliche Entscheidungen, besonders
   die Abschnitte vom 5.–7. Oktober. Spätere Korrekturen ersetzen frühere Statusangaben.
4. `docs/VALIDATION.md` und `docs/OPERATIONS.md` für Prüfungen und Betriebsgrenzen.
5. Bei UI-Arbeit `docs/DESIGN_HANDOFF_2026-09-29.md`,
   `docs/LINKEDIN_CODEX_HANDOFF.md`, `DESIGN.md` sowie die Skills
   `frontend-design` und `impeccable`.
6. Ursprüngliches Review: `/Users/flow/Downloads/Sonio_Dashboard_Review_2026-10-05.pdf`.
   Nicht im Repository. Falls nicht erreichbar, dies benennen; keine unbekannten
   Review-Inhalte als gelesen ausgeben. Dokumentempfehlungen sind keine pauschale
   Nutzerfreigabe zur Umsetzung.

## Ziel und Vorgehen

Das bestehende Dashboard wird Schritt für Schritt anhand des Reviews verbessert,
so dass später belastbare Empfehlungen möglich sind. Der Nutzer entscheidet über
wesentliche nächste Schritte. Noch keinen KI-Agenten erstellen oder aktivieren.
Aktuelle Empfehlungen sind transparente regelbasierte Piloten, keine KI-Analyse.
Nicht sämtliche Review-Vorschläge auf einmal umsetzen. Marketing ist Hauptzielgruppe;
GL und Sales benötigen eigene kompakte, visuelle Perspektiven. Technik nachrangig.
Kommunikation auf Deutsch, Schweizer Schreibweise, knapp und konkret.

## Verbindliche fachliche Leitplanken

- Fehlend ist nicht null. Letzten erfolgreichen Datenstand mit sichtbarem Hinweis
  erhalten; niemals alte Zahlen als aktuelle oder Demo-Zahlen als Live-Werte zeigen.
- Laufende Monatsvergleiche gegen denselben Zeitraum des Vormonats, unter Beachtung
  tatsächlich vorhandener/vergleichbarer Daten. Informationsbox beim Zeitraum.
  Keine Prozentänderung bei fehlender Vergleichsbasis oder Nenner null.
- Monatswerte, Veröffentlichungsmonat und Gesamtstand seit Veröffentlichung bleiben
  getrennt. Website-Inhalts- und YouTube-Videotheksfilter ordnen nach Veröffentlichung;
  deren Gesamtkennzahlen sind keine Monatswerte. Berichte kennzeichnen die Unterschiede.
- Positive/negative Veränderung als grüne/rote Zahl, nicht als farbiger Hintergrund.
- LinkedIn-Ads-Kampagnen bleiben zielbezogen und über letzte 365 Tage ausgewertet;
  keine pauschalen Monatsvergleiche unterschiedlicher Kampagnen. Geplante Kampagnen
  dürfen sichtbar sein, erhalten aber keine Performancebewertung ohne Messwerte.
- Postfrequenz folgt Kampagnen, Events und News: kein automatisches «mehr posten».
- Video kann Bekanntheit und Verständnis unterstützen. Aufrufe sind kein Beweis
  für Awareness-Zuwachs; schwache Klickzahlen allein machen Awareness nicht erfolglos.
- Leads/Formulare, qualifizierte Leads und Umsatz strikt unterscheiden. Keine
  Kausalität, Leadqualität oder Verkaufschancen ohne Belege behaupten.
- Events ausschliesslich aggregiert, keine Personendaten hinterlegen. Sonio,
  Partner/Hersteller und Kunden getrennt. Kundenzahl als Rest nur bei bekannter
  Gesamtbasis und bekannten Sonio-/Partnerzahlen, klar als berechnet kennzeichnen.
- Google-Testmodus bleibt bestehen. Keine eigenmächtige Produktionsfreigabe.
- Crossmediale Kampagnenziele und Zuordnung später gemeinsam ausarbeiten.

## Design erhalten

Bestehende Sonio-DNA weiterführen: Originalbilder, grosszügige Bildheader,
Red Hat Display, kompakte Kacheln und abgestufte Blautöne; keine neue Designsprache.
Vorschaubilder und Hover-Details sind wesentlich. Daten aktualisieren und CSV
nebeneinander im einheitlichen Stil. Info-Boxen knapp, zugänglich und ohne repetitive
Erklärungen pro Zahl; im Diagramm bei der Überschrift statt an jedem Datenpunkt.
Kanal-Kacheln vollständig klickbar. Zwei Kacheln nebeneinander auf Desktop, sinnvoll
mobil umbrechen. Empfehlungen vor dem Zitat, nachvollziehbare Details aufklappbar.
Zitate/fein gezeichnete Schwarzweiss-Porträts und ihre vorhandene Zuordnung erhalten;
keine Zitate für Datenquellen, Team und Einstellungen nötig.

## Seit dem vorherigen Sicherungsstand umgesetzt

### Regelbasierte Empfehlungen

- Organic, LinkedIn Ads, Google Ads und Analytics haben eigene Evidenzlogik,
  kompakte Kanalhinweise und Anschluss an die Empfehlungsseite.
- Zwei Hinweise im Kanal, auf der Empfehlungsseite nur so viele wie tatsächlich
  belegt (je nach Modul bis sechs). Nicht künstlich auf vier bis sechs auffüllen.
- Beobachtung, Einordnung, nächste Handlung und Erfolgskontrolle unterscheiden.
  Warnungen, kleine Mengen, Aktualität, Zeitraum und Kampagnenziel berücksichtigen.
- Code: `frontend/src/{organic,ads,googleAds,analytics}Recommendations.ts` und
  zugehörige Komponenten/Tests. Nicht alle alten Teaser im Dashboard sind damit
  automatisch auf die neue Logik umgestellt; Anschlussstellen jeweils prüfen.

### Analytics / erkennbare KI-Zugriffe

- Nur ChatGPT, Claude, Copilot und Perplexity in der gewünschten Übersicht.
  «GEO» meint hier KI-Herkunft, keine geografische Karte.
- Jahresstand zusätzlich zum Monat, separat abgefragt und beschriftet. Monat ist
  Teil des Jahres, nicht addieren. Eigene Cache-Schlüssel und Refresh-Anbindung.
- `copilot.com` als explizite Domain ergänzt. Bing/Google/Direct nicht pauschal KI.
  Keine erkannte Claude-Zeile ist kein Nachweis, dass nie Claude-Zugriffe stattfanden.
- Momentaufnahme bis 6. Oktober: 62 erkennbare Sitzungen der vier Quellen
  (ChatGPT 52, Copilot 8, Perplexity 2, Claude keine Zeile). Nicht fest codieren.
- `ga4_ai_sources.py`, `ga4_monthly_sources.py`, Endpoint monthly-sources mit annual.

### Google Ads: letzte abgeschlossene Review-Etappe

Unter den Hauptkennzahlen steht «Was hinter den Zielaktionen steckt»:
Formularübermittlungen, Downloads/Interesse und weitere Zielaktionen. Bestehende
Gesamtsumme bleibt «Erfasste Zielaktionen», kein pauschales Lead-Versprechen.
Monat und Kampagnenfilter gelten für die Aufteilung. Einzelaktionen und
All Conversions sind in aufklappbaren Details nachvollziehbar.

- Backend `google_ads_conversions.py`, Anbindung in `google_ads_campaigns.py`.
- Frontend `GoogleAdsConversions.tsx` und `google-ads.css`.
- Nur bestätigtes `LEAD_FORM_SUBMIT` als Formular, verifizierter file_download-Identifier
  als Download. Kontakt-/Health-Check-Trigger noch ungeprüft, bleiben weitere Aktionen.
- Summenabgleich je Kampagne; bei Abweichung oder Fehler keine scheinbar gültige
  Aufteilung anzeigen. Bisherige Kampagnenwerte bleiben erhalten.
- September live geprüft: 260 Formulare + 6,832938 Download-Conversions + 0 weitere
  = 266,832938. Fractional attribution ist möglich. Keine eindeutigen Personen
  oder qualifizierten Leads daraus ableiten. Werte sind Abrufmomentaufnahmen.
- Die frühere Meldung DEVELOPER_TOKEN_PARAMETER_MISSING war ein Fehler des separaten
  Prüfscripts: leerer developer-token-Header. Ohne diesen Header funktioniert die
  vorhandene Verbindung. Keine neue App, neuen Scopes oder Tokens nötig gewesen.
- Keine Ads-Gebotsziele oder externen Kampagnen verändert.
- Die neue Aufschlüsselung ist noch nicht im CSV-Export enthalten.

### Events / Aktualität

Eigener Abrufstand pro Event und Hinweis bei bevorstehenden Forms-Events mit über
24 Stunden altem Stand; korrekte Quellenbezeichnung auch im CSV. VCF zuletzt am
6. Oktober manuell geprüft: 12 Antworten, 6 Sonio, 1 Partner, 5 Kunden berechnet.
Diese Aggregate liegen lokal, nicht als Live-Daten im GitHub-Repository.
Microsoft Forms hat weiterhin keinen automatischen Connector. Zoom-Sync aktualisiert
Forms nicht. Power Automate wurde auf später verschoben; bestehende Freitags-Erinnerung
vor Neuanlage prüfen, keine doppelte Automation erstellen.

## Berichte – bestätigter Stand

- GL: Website-Sitzungen, LinkedIn-Impressionen und Google-Ads-Klicks, keine Budgets.
  Visuelle Highlights, verständlicher Kontext, konkrete Handlungsinformationen.
- Sales: LinkedIn Organic statt LinkedIn Ads, gefragte Seiten/Inhalte und
  Vorstellungsseiten von Sales. Seitenaufrufe des ausgewählten Monats plus
  Gesamtstand; nicht mit Videobetrachtungen verwechseln. Kein IT Support/Helpdesk.
- Marketing: kompakter visueller Hub, Bildhighlights und vier priorisierte Hinweise.
  Google Ads, LinkedIn Organic und LinkedIn Ads im Diagramm kombinierbar;
  Impressionen/Klicks auswählbar, keine irreführende Summierung oder Normalisierung.
- Events im Berichtsmonat: eines über volle Breite, mehrere in passenden Kacheln;
  Quelle, Bild und verfügbare aggregierte Kennzahlen.

## Betrieb und verifizierte Prüfungen

Lokaler Sync laut Audit 6. Oktober alle 60 Minuten bei laufenden Diensten.
Detailabfragen häufig eine Stunde Cache, Website-Katalog 24 Stunden; Forms manuell.
Anbieter-Verzögerung, Cache und Abrufzeit sind unterschiedliche Dinge.
Vor Neustarts laufende API/Worker/Scheduler prüfen, keine Doppelprozesse starten.
Google-Testmodus kann neue persönliche Freigaben erfordern. Eine laufende Sitzung
oder dauerhaft gültige Tokens sind durch diese Übergabe nicht garantiert.

Vor Commit 67074f4 am 7. Oktober erfolgreich:
- 145 Backendtests, 57 Frontendtests.
- Ruff, TypeScript, Vite-Build und diff-check.
- Bestehende Deprecation- und Bundlegrössenhinweise, keine Testfehler.
- Google-Ads-Aufteilung zusätzlich live sowie Desktop/Mobile im Browser geprüft.
- GitHub-CI und Docker-Läufe nicht als erfolgreich verifiziert.

Tests nur mit disposable Datenbank; niemals `.local/preview.db` als TEST_DATABASE_URL.
Lokale Secrets/Datenbanken bleiben ignoriert. Ein Code-Push ist keine Datenbank-
Sicherung und keine Aktualisierung der öffentlichen GitHub-Pages-Demo.

## Nächster sinnvoller Schritt – noch nicht pauschal freigegeben

Der Nutzer hat die Fortsetzung der schrittweisen Review-Arbeit freigegeben. Die
Kontakt-/Health-Check-Aktionen wurden am 7. Oktober rein lesend geprüft: Google Ads
führt beide als aktivierte primäre GA4-Ziele, aber nicht als bestätigte Leads;
GA4 lieferte 2026 keine entsprechende Ereigniszeile. Die konkreten Auslöseregeln
bleiben ungeprüft, weil die Analytics Admin API im bestehenden Projekt nicht
aktiviert ist. Keine API oder Google-Einstellung wurde verändert. Beide Aktionen
bleiben daher unter «weitere Zielaktionen».

F03 wurde am 7. Oktober konkretisiert und teilweise umgesetzt: Die Startübersicht
verwendet jetzt Auswahl, Reihenfolge, Bezeichnung und optionales Monatsziel aus
`dashboard.kpis`. Fehlende Werte bleiben sichtbar. Archiv, E-Mail-Report und eine
spätere Analyse verwenden diesen gemeinsamen Snapshot bereits. Die visuellen GL-,
Sales- und Marketing-Reports behalten ihre separat bestätigten Rollenkennzahlen;
sie wurden nicht pauschal überschrieben. Zielrichtung und Zielversionierung sind
noch nicht fachlich definiert.

F05 wurde am 7. Oktober als eigener Navigationspunkt «Kampagnen» begonnen und nach
der Nutzerkorrektur als Ergebnisansicht für bestehende 360°-Kampagnen ausgerichtet.
Der Bereich erstellt keine Kampagne. Er zeigt eine gemeinsame Wirkungskette und
darunter jede Massnahme mit technischer Erkennung, Datenquelle und vorgesehenen
Resultaten. Die geschützte Live-Ansicht bleibt ohne Kampagnenwerte, bis eine echte
Zuordnung bestätigt ist; die öffentliche Demo zeigt deutlich gekennzeichnete
illustrative Werte und ruft keine geschützten Kampagnendaten ab.

Die Ansicht führt neun Massnahmentypen: Google Ads, LinkedIn Ads, LinkedIn Organic,
Landingpage, E-Mail-Mailing, YouTube-Video, Direct Mailing, Fachartikel sowie Event
oder Webinar. Direct Mailing und Fachartikel benötigen eigene QR-/Redirect-IDs und
getrennte Quellenwerte (`utm_source=direct_mail` bzw. `utm_source=fachartikel`).
Ein QR-Code belegt die Herkunft nur, wenn Zieladresse oder Redirect-Zuordnung diese
Information trägt. QR-Weiterleitungen und GA4-Sitzungen bleiben getrennte Messpunkte.
Titelähnlichkeit, gleicher Monat oder dieselbe Zielseite ohne bestätigte Parameter
gelten weiterhin nicht als Zuordnungsbeleg.

Migration `005_marketing_campaigns.py`, Modell `MarketingCampaign` und geschützte
Endpoints `/api/campaign-registry` bleiben als vorläufige technische Grundlage
erhalten, werden in der Ergebnisansicht aber nicht als Formular angeboten. Es wurde
kein Kampagneneintrag angelegt. Am Freitag, 9. Oktober, soll die soeben gestartete
echte Kampagne gemeinsam als erster Referenzfall abgebildet werden: ein verbindlicher
Kampagnenschlüssel, konkrete Provider-/Content-IDs, Landingpage und alle UTM-/QR-
Links werden dabei bestätigt. Erst danach dürfen Resultate zusammengeführt werden.
Noch keinen KI-Agenten erstellen oder aktivieren.

Offen bleiben insbesondere:
- Verifizierte GA4-Auslöseregeln für Kontakt/Health Check und spätere
  Leadqualifizierung; aktuelle Google-Ads-Metadaten allein reichen nicht.
- Vollständiger Abgleich Review-PDF gegen Umsetzung; kein Gesamtabschluss behaupten.
- Weitere Empfehlungspiloten/alte Teaser konsistent abgleichen.
- Forms-Automatisierung später; persistente Crossmedia-Massnahmenzuordnung erst am
  echten Referenzfall definieren und einen Agenten ausdrücklich erst nach separater
  fachlicher Freigabe erwägen.
- Optional CSV-Erweiterung für Conversion-Aufschlüsselung.
- GitHub-CI-Status des gesicherten Commits prüfen, falls erneut thematisiert.

Keine laufenden Entwicklungsaufträge im Hintergrund aus der Übergabe ableiten.
