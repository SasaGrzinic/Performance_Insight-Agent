# Sonio Insights — Arbeitsanweisungen für Coding Agents

Stand: 24. September 2026. Gilt für das gesamte Projekt. Neuere ausdrückliche
Nutzerentscheidungen haben Vorrang vor den hier dokumentierten Produktvorgaben.
Diese Datei beschreibt Arbeitsregeln und den zuletzt bestätigten Stand, nicht
eine Garantie für aktuell laufende Prozesse oder gültige Zugangsdaten.

## Ziel und Zusammenarbeit

Sonio Insights ist das Marketing-Performance-Dashboard der Sonio AG. Es verbindet
Kanalkennzahlen, Monatsvergleiche, nachvollziehbare Interpretation und konkrete
Empfehlungen. Zielgruppe sind Marketing und Management.

- Mit dem Nutzer auf Deutsch, klar und knapp kommunizieren; Schweizer Schreibweise
  und bestehende Zahlenformate beibehalten.
- Bestehende Anwendung weiterentwickeln, nicht durch einen neuen Prototyp ersetzen.
- Autorisierte Arbeiten eigenständig abschliessen und angemessen prüfen.
  Fehlende Kontozugänge, Daten oder echte Freigaben konkret benennen.
- Beobachtungen, mögliche Ursachen und Empfehlungen auseinanderhalten.
- Keine erfolgreichen Integrationen, Tests, Zustellungen oder Deployments behaupten,
  die nicht tatsächlich verifiziert wurden.
- Keine Geheimnisse zur Klärung im Chat anfordern. Anmeldungen und MFA bei Bedarf
  im Browser durch den Nutzer durchführen lassen. Erforderliche Zugriffsfreigaben
  konkret erklären; bestehende Autorisierung und geltende Tool-Regeln beachten.

## Verbindlicher Technologie- und Betriebsrahmen

- Frontend: React und TypeScript; vorhandene Dashboard-Komponenten mit Recharts,
  Radix und TanStack Query weiterverwenden.
- Backend: FastAPI, SQLAlchemy und Alembic; PostgreSQL für regulären Betrieb.
- Docker-Dienste: Frontend, API, PostgreSQL, Worker, Scheduler und Migration.
  SQLite unter `.local/` ist ausschliesslich die lokale Entwicklungsvorschau.
- KI: OpenRouter über die offizielle API; Modell konfigurierbar halten.
- Aktuelle unterstützte Softwareversionen und offizielle Provider-Dokumentationen
  bei Einführung/Updates prüfen. Versionen und Locks nachvollziehbar festhalten;
  keine ungezielten Komplettupdates bei fachfremden Änderungen.
- CI liegt unter `.github/workflows/ci.yml`. Konfiguration ist kein Beleg für
  einen erfolgreich ausgeführten CI-, Docker- oder Produktionslauf.
- Login mit Benutzername/Passwort, genau ein Master-Admin; weitere Nutzer über
  Einladungslinks. Bestehende Rollen, einmalige Einladungen, Argon2, CSRF,
  Sitzungsschutz und Rate-Limits erhalten. Keine offene Registrierung ergänzen.

## Produktentscheidungen, die erhalten bleiben müssen

- Kanalzahlen automatisch und auf Knopfdruck synchronisieren.
- Monatsreport am 3. für den Vormonat, mit Performance und Empfehlungen.
  Der bisherige Zeitstandard ist 08:00 Europe/Zurich; tatsächliche Konfiguration
  prüfen. Lokale Prozesse müssen laufen, damit lokale Planung ausgeführt wird.
- Mehrere Monate im Diagramm nach Kalendertag überlagern können.
- Kennzahl im Verlauf auswählbar machen, insbesondere Impressionen und Klicks.
- Beiträge anhand ihrer Überschrift, optional zusätzlich anhand des Hauptbilds,
  eindeutig zuordnen. Mehrere Posts am selben Tag vollständig berücksichtigen.
- Video-Posts separat filterbar und mit Videozahlen inklusive durchschnittlicher
  Betrachtungsdauer anzeigen.
- Follower-Entwicklung pro Monat bereitstellen.
- CSV-Download mit Auswahl von Datensatz, Kanal, Zeitraum und Kennzahlen erhalten.
- Mitbewerber/Konkurrenzanalyse ist ausdrücklich gestrichen: weder als UI-Bereich
  noch als Voraussetzung für Interpretationen oder Empfehlungen wieder einführen.
- Website-Conversions und Conversion Rate im YouTube-Modul bis zur späteren
  Analytics-Anbindung weglassen; daraus vorerst keine Warnungen oder Empfehlungen
  ableiten. Fehlende Gewichtungen nicht auf andere Score-Dimensionen verteilen.

## Datenintegrität und Interpretation

- Echte Daten und Demo strikt trennen. `/` ist die geschützte echte Ansicht;
  `/?demo=1` enthält gekennzeichnete Beispieldaten. Fehlende Live-Daten niemals
  durch Demo-Zahlen ersetzen.
- Fehlend ist nicht null. Keine unbekannten Messwerte, historischen Bestände oder
  API-Fähigkeiten erfinden. Datenquelle, Einheit, Zeitraum und Abrufstand erhalten.
- Tages-/Monatswerte und Gesamtwerte seit Veröffentlichung nicht vermischen.
  Laufende Monate sowie unvollständige Vergleichszeiträume kenntlich machen.
- Importe müssen wiederholbar sein, ohne Doppelzählung. Provider-Pagination
  vollständig verfolgen, Organisations-/Kanalherkunft prüfen und Bereichsdaten
  atomar ersetzen. Fehler lassen zuletzt erfolgreich geladene Werte bestehen.
- API-Limits, Berechtigungsprobleme und fehlende Daten transparent ausweisen.
- Kleine Datenmengen vorsichtig bewerten; eigene Vorperioden und interne Baselines
  bevorzugen. Keine Korrelation als gesicherte Ursache formulieren.
- OpenRouter bekommt ausschliesslich erlaubte aggregierte Kennzahlen und
  Datengrenzen, keine Tokens, Kontaktdaten oder Rohdokumente. Schema und
  Kennzahlreferenzen prüfen; ohne gültige KI-Konfiguration keine Analyse vortäuschen.
- CSV: UTF-8 mit BOM, Semikolon, Schutz vor Tabellenformeln und korrektes Escaping.
  Unbekannte Werte bleiben leer; Einheiten, Datenstand und Zeitbezug mit exportieren.

## LinkedIn — tatsächlich angebunden

- Ausschliesslich Sonio AG, Organisations-ID `622072` bzw.
  `urn:li:organization:622072`. Persönlicher Login dient der Autorisierung;
  private Profilstatistiken und Kontakte werden nicht abgerufen.
- Bestehende App „Sonio Teams Bot“, App-ID `247434008`, Client-ID
  `78ria4ak7covm9`, wird verwendet. Keine neue App anlegen oder bestehende
  Redirect-URLs/Schlüssel ohne konkreten Anlass verändern.
- Genehmigte Scopes: `rw_organization_admin` und `r_organization_social`.
  Anwendung verwendet lesende Abfragen. LinkedIn Ads ist separat angebunden (siehe unten).
- Organisations-Tagesstatistiken sind nicht einzelnen Beiträgen zuzurechnen.
  Postkarten zeigen Gesamtwerte seit Veröffentlichung mit Abrufstand.
- LinkedIn-Klicks sind kein verlässlicher Ersatz für externe Website-Klicks.
- Durchschnittliche Videobetrachtungsdauer:
  `watch_time_ms / video_views / 1000` Sekunden, bezogen auf qualifizierte Aufrufe
  ab drei Sekunden. Bei fehlenden Werten oder null Aufrufen kein Durchschnitt.
- Follower-Zugewinne sind keine Nettoveränderung. Gesamtbestände nur aus tatsächlich
  beobachteten Snapshots zeigen, nicht aus Zugewinnen rückwärts rekonstruieren.
- Bei Post-Pagination den vom Provider gelieferten nächsten Offset verwenden;
  nicht pauschal 100 addieren. Nicht nach Erstellungsdatum früh abbrechen, da
  Veröffentlichung und Erstellung auseinanderliegen können.
- Tooltip knapp halten: Datum, ausgewählte Kennzahl und Postüberschriften.
  Die vom Nutzer verworfenen Zusatztexte „an diesem Tag veröffentlicht“ und
  „Tageswerte der Seite“ nicht wieder in die Kästchen aufnehmen.
- **Offen:** Nutzer meldet weiterhin unvollständige Postüberschriften im Diagramm.
  Der bisherige vollständige API-Abgleich beweist nicht die Vollständigkeit der UI.
  Bei Bearbeitung konkrete Tage, alle Posttitel, Monatszuordnung und Tooltip prüfen.

## YouTube — Zugang bestätigt am 25.09.2026

- Zielkanal: `https://www.youtube.com/@sonio-channel_2023`.
- Bestehendes Google-Projekt `sonio-insights`, OAuth-Client und Anmeldung verwendet.
  Autorisierten Kanal über Data API gegen den Sonio-Handle verifiziert.
- Leserechte `youtube.readonly` und `yt-analytics.readonly`, Refresh-Token lokal
  in `.env` (0600). Keine Geheimnisse ausgeben. Helfer `scripts/youtube_oauth.py`.
- Aktuellen September 2026 erfolgreich importiert: 63 Tagesmesswerte für Aufrufe,
  Wiedergabeminuten und neue Abonnenten. Echte Werte im Dashboard geprüft.
- API/Worker/Scheduler mit neuer Konfiguration gestartet. Die frühere Pause ist
  durch den ausdrücklichen Auftrag zur Wiederaufnahme aufgehoben.
- Google-App weiterhin Testmodus; dauerhafter unbeaufsichtigter Betrieb noch offen.
- Fachliche Details: `docs/YOUTUBE_REQUIREMENTS.md`, einschliesslich der vorrangigen
  Einschränkung am Dateianfang. Vorerst vier Management-KPIs und sieben operative
  Kennzahlen; Website-Conversions sind zurückgestellt.
- Formate Shorts/Longform/Live, organisch/bezahlt und Sprache getrennt auswerten;
  Videos nach vergleichbarer Länge und Alter vergleichen. API-Verfügbarkeit der
  gewünschten Kennzahlen erst prüfen; fehlende Metriken nicht approximieren.
- CSV-/Excel-Import ist als Ergänzung vorgesehen, nicht als bereits fertig melden.

### YouTube-Videothek — Nutzerentscheidung 25.09.2026

- `backend/app/youtube_videos.py`, geschützte `/api/youtube/videos`- und
  `/api/youtube/videos/{video}/traffic`-Abfragen, `YouTubeVideos.tsx`.
- Monatsauswahl bedeutet Veröffentlichungsmonat in Europe/Zurich. Kennzahlen und
  Zugriffsquellen zeigen den aktuellen Gesamtstand seit Veröffentlichung bis heute.
  Diese Entscheidung ersetzt die frühere Monatskennzahlen-Ansicht der Videothek.
- Aufrufe, Likes und Kommentare aus Data API `statistics`; andere Kennzahlen aus
  Analytics, möglicherweise verzögert. Fehlende Werte nicht als null erfinden.
  Videolänge aus `contentDetails.duration`. Playlist filtert Zugehörigkeit.
- Getrennter Cache `youtube:published:` verhindert Vermischung mit alten Monatsdaten;
  eine Stunde Gültigkeit, manuelle Aktualisierung, letzter Stand bei Fehler mit Warnung.
  Öffentliche Demo ohne Live-Videodetails; Sonio-Design unverändert.
- Letzter Live-/Browserabgleich: Juli zwei Videos; Miguel-Testimonial 7 Aufrufe,
  Ø 21 Sekunden, Länge 30 Sekunden. Zwei Regressionstests prüfen Monatszuordnung
  und Kennzahlenabruf über den Veröffentlichungsmonat hinaus.

## Weitere Kanäle und offene Betriebsfragen

- Google Ads und Microsoft-365-Adapter sind vorbereitet,
  ihre echten Kontozugriffe jedoch noch nicht abgenommen.
- Eventlisten stammen aus Word. Vorhandener Import unterstützt DOCX; echtes
  Tabellenformat noch abgleichen. Personenbezogene Daten nicht an die KI senden.
- QR-Tracking-Anbieter ist noch offen; bisher nur definierter CSV-Import.
- OpenRouter-Schlüssel/Modell und SMTP/Reportempfänger sind noch nicht eingerichtet.
  Automatisches Versenden nicht als aktiv darstellen.
- Produktionshosting, PostgreSQL-/Docker-Laufzeit und tatsächlicher CI-Lauf sind
  noch nicht abschliessend verifiziert. „Scharfe Version“ bezeichnet im bisherigen
  Dialog die lokale Ansicht mit echten LinkedIn-Daten, keine bestätigte Produktion.

## Gestaltung

- Sonio-Markenauftritt beibehalten: vorhandenes Original-Logo, Original-Pfeil,
  selbst gehostete Red Hat Display und bestehende Komponenten verwenden.
- Nutzer wünscht deutlich mehr Blau. Bestehende Tokens: primär `#0075d9`,
  dunkler `#0063b8`, helle Flächen `#e8f3ff`. Details in `DESIGN.md`,
  `.impeccable/design.json` und `frontend/src/styles.css`.
- Für UI-Arbeiten die vorhandenen Skills `frontend-design` und `impeccable`
  lesen und anwenden. Fehlende Skill-Werkzeuge transparent behandeln.
- Desktop und Mobile prüfen: kein horizontaler Seitenüberlauf, lesbare und
  erreichbare Tooltips, sichtbarer Tastaturfokus, verständliche Lade-/Fehlerzustände.

## Projektkarte

- `frontend/src/App.tsx`: App, Navigation, Ansichten.
- `frontend/src/components/PerformanceExplorer.tsx`: Verlauf, Vergleiche, Posts/Videos.
- `frontend/src/components/Audience.tsx`: Follower-Entwicklung.
- `frontend/src/components/CSVExport.tsx`, `csv.ts`: Exportauswahl und CSV-Ausgabe.
- `frontend/src/api.ts`, `comparison.ts`: API-Zugriff und Vergleichslogik.
- `backend/app/main.py`, `security.py`: Endpoints und Zugriffsschutz.
- `backend/app/connectors.py`: Provider-Adapter.
- `backend/app/linkedin_posts.py`, `linkedin_audience.py`: LinkedIn-Detaildaten.
- `backend/app/models.py`, `backend/migrations/`: Datenmodell und Migrationen.
- `backend/app/jobs.py`, `ai.py`: Jobs, Reports und KI-Auswertung.
- `docs/CONNECTORS.md`, `METRICS.md`, `OPERATIONS.md`, `SOURCES.md`: Fachdokumentation.
- `docs/VALIDATION.md`: tatsächlich ausgeführte Prüfungen und offene Grenzen.

## Lokal arbeiten und prüfen

Bestehende Prozesse vor Neustarts prüfen; keinen parallelen Worker/Scheduler
ungeplant starten. Zugangsdaten und `.local/preview.db` nicht überschreiben.

```bash
# Projektstamm: API und Worker, bei beabsichtigtem geplantem Betrieb mit Scheduler
.venv/bin/python scripts/dev.py --scheduler

# Frontend, in einem separaten Terminal
cd frontend
npm run dev
```

Frontend `http://127.0.0.1:5173/`, API `http://127.0.0.1:8000`.
Bei abgelaufener Dashboard-Sitzung regulär neu anmelden, nicht auf Demo ausweichen.
Lokaler Admin-Zugang liegt in `.local/admin-password.txt`; niemals ausgeben.

Relevante Prüfungen je nach Änderung:

```bash
# Projektstamm
.venv/bin/python -m pytest -q backend/tests
.venv/bin/ruff check backend

# frontend/
npm test
npm run build
```

- Für Daten-/Berechtigungslogik aussagekräftige Regressionstests hinzufügen;
  reine Dokumentationsänderungen benötigen keinen vollständigen Anwendungstest.
- UI-Änderungen zusätzlich im Browser verifizieren. Testergebnisse mit Datum
  dokumentieren; alte Testzahlen nicht als neue Prüfung ausgeben.
- `TEST_DATABASE_URL` darf nur eine disposable Testdatenbank bezeichnen:
  die Tests können Anwendungstabellen löschen. Nie auf Live-/Vorschaudaten richten.
- Änderungen am Datenmodell durch Alembic-Migrationen begleiten.

## Geheimnisse und Dokumentationspflege

- `.env` und `.local/` bleiben ignoriert. Geheimnisdateien mit Rechten `0600`
  speichern. Keine Tokens, Secrets, Passwörter oder OAuth-Codes in Logs, Screenshots,
  Tool-Ausgaben, Dokumentation, Frontend, CSV oder Commits übernehmen.
- Nur erforderliche Rechte anfordern; keine privaten Profile oder zusätzlichen
  Konten ausserhalb des beauftragten Unternehmenszugriffs abfragen.
- Neue fachliche Entscheidungen und geprüfte Integrationsstände zeitnah in den
  passenden Dokumenten und bei Bedarf hier nachführen.
- Ältere allgemeine Statusabsätze in `README.md`/`PRODUCT.md` können überholt sein
  (z. B. „keine externen Konten verbunden“). Für LinkedIn gilt der später bestätigte
  Live-Stand. Widersprüche prüfen und gezielt korrigieren, nicht blind übernehmen.

## LinkedIn Ads — angebunden am 24.09.2026

- Eigene App «Sonio Insights» `266496062`, Client-ID `78gkyi1f4ne85e`,
  Advertising API Development Tier; freigegebene Leserechte `r_ads r_ads_reporting`.
- Werbekonto `514253005`, API-bestätigte Organisation `622072`, Währung CHF.
- Eigene `LINKEDIN_ADS_*`-Zugangsdaten; niemals Organic-Tokens ersetzen oder als
  Fallback verwenden. Refresh-Austausch live geprüft; Geheimnisse nur lokal.
- Nutzerfokus: rollierend letzte 365 Tage einschliesslich heute. Automatischer
  und manueller Ads-Sync lädt diesen Zeitraum; Dashboard bleibt monatlich filterbar.
- Kampagnenweise Tageswerte mit Kampagnen-URN in `Metric.source_id`; keine
  zusätzlichen Konto-Summen importieren (sonst Doppelzählung).
- `backend/app/linkedin_ads.py` prüft Konto/Organisation/Währung, paginiert alle
  Kampagnen, lädt begrenzte Zeitfenster und bricht bei unbekannter Herkunft,
  falschem Zeitraum oder Duplikaten ab. Leere API-Antwort bleibt fehlend, nicht null.
- Beim ersten Import: 40 Messwerte, 10 Tage im Januar 2026, eine Kampagne innerhalb
  25.09.2025–24.09.2026. Dies ist eine historische Beobachtung, keine feste Erwartung.

### Kampagnenorientierte Ads-Oberfläche

- Ads wird unabhängig vom ausgewählten Berichtsmonat unter «Kanäle» dargestellt.
- Jede bekannte Kampagne einzeln mit echtem Titel, Ziel, Status und geplanter Laufzeit;
  ältere Metadaten bleiben sichtbar, Kennzahlen strikt letzte 365 Tage.
- Keine Monats-/pauschalen Kampagnenvergleiche in Ads; Ziele, Themen und Zielgruppen
  können unterschiedlich sein. Organic behält seine Monatsvergleiche.
- `LinkedInCampaign` und Migration 003, API `/api/linkedin/ads/campaigns`,
  React `AdsCampaigns.tsx`. Aggregation und abgeleitete Quoten serverseitig.
- Feste zielbezogene Lesehinweise nicht als generierte KI-Empfehlungen ausgeben.

## Mailchimp — Zugang bestätigt am 25.09.2026
Sonio AG, Datacenter us12. Lokaler API-Schlüssel «Sonio Insights» geschützt in .env;
Ablauf 25.09.2027. Kampagnen/Reports lesend geprüft, laufender Monats-Sync erfolgreich.
Dies ersetzt ältere Aussagen über fehlenden Mailchimp-Zugang. Endgültige Kennzahlen
werden erst nach der Anbindung mit dem Nutzer festgelegt; vorhandene drei KPIs
sind vorläufig. Keine Kontakte abrufen oder Kampagnen ändern/versenden ohne Auftrag.

### YouTube-Anzeige — Nutzerentscheidung 25.09.2026

«Neue Abonnenten» nicht im Dashboard oder in der Kennzahlenauswahl anzeigen.
Der Kanalkatalog zeigt nur Aufrufe und Wiedergabezeit; bestehende Importdaten bleiben erhalten.

## Google Analytics — verbunden am 25.09.2026

- Sonio AG, «Sonio NEW – GA4», Property `358384645`, Konto `75827860`.
- Bestehendes Google-Projekt sonio-insights; Analytics Data API aktiviert.
- Bestätigter Lesezugriff analytics.readonly. Separater GA4_REFRESH_TOKEN lokal
  in .env0600; GOOGLE_REFRESH_TOKEN für YouTube unverändert erhalten.
- scripts/analytics_oauth.py: vorhandener Client, PKCE/State/Cookie, erst nach
  erfolgreichem runReport auf expliziter Sonio-Property lokal speichern.
- August und September2026 live geladen, 168 Tagesmesswerte. Dashboard verifiziert.
- Basis-KPIs Sitzungen, engagierte Sitzungen, Schlüsselereignisse; letztere sind
  Property-konfiguriert und nicht automatisch Leads oder Verkäufe.
- API/Worker/Scheduler neu gestartet; Google-Testmodus bleibt Betriebsgrenze.

### GA4-Seitenauswertung — früherer Stand 25.09.2026

Die Monatssemantik dieser und der folgenden Inhaltsauswertung ist durch die
unten dokumentierte Veröffentlichungsansicht ersetzt. Alte Endpoints bleiben erhalten.

- `ga4_campaigns.py`, geschützte `/api/analytics/campaigns`, `AnalyticsPages.tsx`:
  17 ausdrücklich vorgegebene Seiten, davon 14 Kampagnen und drei als
  «Visitenpage» benannte Seiten separat unter «Vorstellungsseiten».
- Business Continuity DE/FR hatte dieselbe URL und zählt einmal. Nur exakte
  bereinigte Pfade (auch mit abschliessendem Slash) auf sonio.com/www.sonio.com;
  CMS-Vorschauparameter nicht in Konfiguration oder Links übernehmen.
- Monatswerte: Seitenaufrufe, Besucher, Sitzungen, aktive Interaktionssekunden je
  Besucher. Vorperiode bei laufendem Monat auf dieselbe Tagesanzahl begrenzen.
  Quellen, neue/wiederkehrende Besucher und tatsächlich gelieferte Download-/Video-
  Ereignisse separat; fehlende Berichtszeilen bleiben fehlend. Besucher und
  Sitzungen verschiedener Seiten nicht addieren. Cache eine Stunde, keine Live-Demo.
- September live: 12 von 17 Seiten mit Werten, darunter alle drei Vorstellungsseiten.
  Fitim im Browser: 5 Aufrufe, 3 Besucher, 4 Sitzungen, Ø 35,33 aktive Sekunden.
  Zwei Tests, TypeScript/Build bestanden; Mobile390 ohne horizontalen Überlauf.

Vorstellungsseiten ergänzt: Paddy Gloor (/paddy-gloor-verbindet-business-it) und
Roman Lorenz (/roman-lorenz-verbindet-business-it). Aktuelle Liste: 19 eindeutige
Seiten, davon 14 Kampagnen und 5 Vorstellungsseiten. Cache wird bei Änderung
der konfigurierten Pfade neu geladen.

### GA4-Inhaltsauswertung — 25.09.2026

- `ga4_content.py`, geschützte `/api/analytics/content`, `AnalyticsContent.tsx`:
  Kompetenzfelder, Blogartikel, Newsartikel und Customer Stories nach beobachteten
  Seitenpfaden; DE/FR bleiben getrennt. Keine vollständige Website-Inventarliste:
  sichtbar sind nur Seiten mit GA4-Werten im gewählten Monat oder der Vorperiode.
- Seitenaufrufe, Besucher, Sitzungen und aktive Sekunden je Besucher; laufende
  Monate mit gleich lang begrenzter Vorperiode. Pfadkennzahlen separat von
  Seitentiteln abfragen, damit Titelvarianten Nutzer nicht doppelt zählen.
- Einzelne Seite auswählbar, Listen in Zehnerschritten erweiterbar. Monatswechsel
  setzt die Inhaltsauswahl zurück. Cache eine Stunde, letzter Stand mit Warnung
  bei Abruffehlern; keine Live-Inhalte in der öffentlichen Demo.
- Live-Momentaufnahme September und Vorperiode: 17 Kompetenzseiten, 76 Blogartikel,
  39 Newsartikel, 48 Customer Stories. Diese Anzahlen sind keine festen Erwartungen.


### GA4-Veröffentlichungsansicht — Nutzerentscheidung 25.09.2026

- Vorrang vor den früheren Monatsdetails: Monat/Jahr filtern das
  **Veröffentlichungsdatum**. Jede Seite zeigt verfügbare Gesamtkennzahlen seit
  Veröffentlichung bis heute, keine auf den Auswahlmonat begrenzten Messwerte.
- `ga4_areas.py`, geschützte `/api/analytics/areas` und
  `/api/analytics/area-traffic`, `AnalyticsContent.tsx`: sechs Bereiche Kampagnen,
  Vorstellungsseiten, Kompetenzfelder, Blogartikel, Newsartikel und Customer
  Stories. Jeder Bereich merkt sich seinen Zeitraum; ganzes Jahr, einzelne Monate
  und «Ohne Veröffentlichungsdatum» sind getrennt wählbar. `AnalyticsPages` wird
  nicht mehr gerendert; frühere Monatsendpoints bleiben bestehen.
- Sitemap und öffentliche `__NEXT_DATA__` liefern Katalog, Originalbilder und
  Datum: redaktionelles `content.date` vor `first_published_at`. Änderungs-,
  erneute Publikations- und Erstellungsdaten sind kein Ersatz. Unbekannte Daten
  bleiben unbekannt; einzelne ältere öffentliche Seiten sind nicht abrufbar.
- Exakte Sonio-Hosts und bereinigte Pfade, DE/FR getrennt. Seitenaufrufe,
  Besucher, Sitzungen und aktive Sekunden je Besucher werden pro Seite über den
  gesamten verfügbaren Zeitraum abgefragt; Nutzer verschiedener Seiten oder
  Monate nicht addieren. Ohne Datum ab 1.1.2020 ausdrücklich gekennzeichnet;
  auch ältere Seiten frühestens ab 2020. Vor Trackingbeginn keine Messwerte.
- Seitendetails: Kanal, Quelle/Medium, organisch/bezahlt/weitere, Länder,
  Regionen, neue/wiederkehrende Besucher und gelieferte Download-/Videoereignisse.
  Geo ist ungefähr; Besuchergruppen nicht addieren. Fehlend bleibt fehlend.
- Katalogcache 24 Stunden, Kennzahlen/Details eine Stunde, manuelle Erneuerung;
  bei Fehler letzter erfolgreicher Stand mit Warnung. Demo ohne Live-Abfragen.
  Bereichsheader und Originalbilder folgen dem bestehenden Sonio-Design;
  keine Änderung der Design-Tokens.

### Analytics-Verfeinerung 25.09.2026
- «Blick hinter die Kulissen» ist ein eigener Bereich (`behind`), inklusive FR;
  entsprechende Blogpfade werden aus dem allgemeinen Blogbereich ausgeschlossen.
  Katalog-/Kohorten-Caches v2 vermeiden alte überlappende Zuordnungen.
- Monat bei der obersten Kanal-Kennzahlenüberschrift anzeigen. Unter dem
  Vergleichsdiagramm Monatsnamen nur bei mehreren Vergleichsmonaten anzeigen.
- Veröffentlichungszuordnung und verfügbare Gesamtkennzahlen unverändert erhalten.

### Monatliche Zugriffsquellen – 25.09.2026
Unter den oberen Analytics-KPIs: Sitzungen der gesamten GA4-Property nach
organisch, bezahlt, direkt, E-Mail, Verweisen und weiteren/nicht zugeordneten
Quellen. Monat folgt dem oberen Basismonat; laufender Monat bis heute, sonst
vollständiger Monat. Keine Summierung von Seiten-/Veröffentlichungskohorten.
Geschützter Endpoint `/api/analytics/monthly-sources`, Cache eine Stunde,
manuelle Dashboard-Aktualisierung invalidiert die Frontend-Abfrage.

Monatliche Herkunft erweitert: Quellen als Balken mit Sitzungen und Anteil;
Geo daneben (mobil darunter), Länder/Regionen umschaltbar, jeweils totalUsers.
Geo-Werte sind nicht additiv, getrennte Abfragen mit vollständiger Pagination;
gleicher Monatszeitraum und gleiche Property wie Quellen. Cache monthly-sources v2.

### Korrektur «GEO» – 25.09.2026 (vorrangig)
Nutzer meint KI-Herkunft, nicht geografische Herkunft. Länder/Regionen aus
monatlicher Übersicht und Seitendetails entfernt. Stattdessen erkennbare
KI-Sitzungen anhand `sessionSource` und expliziter Quelldomains; keine pauschale
KI-Zuordnung von Google/Bing/Direct. Identische Zeiträume wie jeweilige Quellen.
KI-Werte sind Teil der übrigen Quellen, niemals zusätzlich addieren. Fehlende
Herkunft und Sichtbarkeit/Erwähnungen in KI-Antworten werden nicht geschätzt.
Cache monthly-sources v3, Seitentraffic v2. Klassifikation ga4_ai_sources.py.

## Freigegebene Dashboard-/Login-Gestaltung (29.09.2026)

Die auf Branch `design/sonio-dashboard-login` integrierte Gestaltung wurde mit dem
Nutzer abgestimmt. Bei weiteren UI-Arbeiten `docs/DESIGN_HANDOFF_2026-09-29.md` lesen.
Vollständiges Bergbild, kleines zentriertes Login, Logo/Titel im Bild; Dashboard mit
kompakten Klartext-Kanalkacheln und Empfehlungen vor den Kanälen erhalten.
Keine Mockup-Zahlen als Live-Daten einsetzen und kein negatives Ergebnis erfinden,
um die illustrative Aufteilung von drei positiven und einem negativen Trend zu erzwingen.

## LinkedIn-Designfreigabe (29.09.2026)

Die Marketingansicht für LinkedIn Organic ist nun in `LinkedInOrganic.tsx` umgesetzt.
Vorgaben und verbleibende Datenanbindungen in `docs/DESIGN_HANDOFF_2026-09-29.md`.
Keine dominanten Zeitraum-Kacheln im Header, keine dekorativen Trennlinien, keine
rosa/grünen Video-Kacheln. Jahreswerte nur aus vorhandenen Monatsdaten aggregieren.

### Analytics-Bereiche – Nutzerentscheidung 30.09.2026
- Reihenfolge Website im Detail: Kompetenzfelder, Services, Blogartikel, Newsartikel, Blick hinter die Kulissen, Vorstellungsseiten, Customer Stories, Videos, Kampagnen.
- Kompetenzfelder sind die fünf Hauptseiten Full Service Provider, Data Management, Digital Workplace, Hybrid Cloud und Artificial Intelligence; /solutions-Unterseiten gehören nicht in diese Fünferliste. Services und Website-Videoseiten sind eigene Sitemap-Bereiche. Sprachfilter DE/FR/Alle; dauerhafte Bereiche starten bei allen Veröffentlichungen.
- Pro Seite Gesamtstand seit Veröffentlichung erhalten, zusätzlich separater aktueller Monatsvergleich gegen Vormonat. Keine Prozentänderung aus Lifetime-Werten ableiten. Cache Katalog v4, Kohorten v5 mit Tagesbezug. Website-Videoseitenwerte nicht mit YouTube-Kanalaufrufen gleichsetzen.
