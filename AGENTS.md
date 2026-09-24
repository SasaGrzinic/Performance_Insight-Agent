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
  Anwendung verwendet lesende Abfragen. LinkedIn Ads ist separat und nicht verbunden.
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

## YouTube — vorbereitet, derzeit pausiert

- Zielkanal: `https://www.youtube.com/@sonio-channel_2023`.
- Google-Projekt `sonio-insights`; Data API v3 und Analytics API aktiviert.
  OAuth-Webclient und Testnutzer sind vorbereitet; Client-Zugangsdaten lokal hinterlegt.
- Die Kanalautorisierung und der erste echte Analytics-Abruf sind noch nicht bestätigt.
  Die Anmeldung wurde wegen fehlender MFA-Möglichkeit unterbrochen.
- Nutzerentscheidung vom 24.09.2026: YouTube vorerst pausieren; Nutzer kümmert
  sich ab Montag darum. Ohne neuen Auftrag weder OAuth erneut starten noch
  automatische Erinnerungen oder Hintergrundversuche einrichten.
- Bei Wiederaufnahme abgelaufene Sitzung neu beginnen. Helfer:
  `scripts/youtube_oauth.py`; Loopback-Callback
  `http://127.0.0.1:8766/oauth/callback`. Scopes `youtube.readonly` und
  `yt-analytics.readonly` mit Offline-Zugriff; tatsächliche Freigabe steht aus.
- Vor Speicherung/Import autorisierten Kanal gegen den angegebenen Sonio-Handle
  prüfen. Google-Testmodus ist noch kein abgesicherter unbeaufsichtigter Dauerbetrieb.
- Fachliche Details: `docs/YOUTUBE_REQUIREMENTS.md`, einschliesslich der vorrangigen
  Einschränkung am Dateianfang. Vorerst vier Management-KPIs und sieben operative
  Kennzahlen; Website-Conversions sind zurückgestellt.
- Formate Shorts/Longform/Live, organisch/bezahlt und Sprache getrennt auswerten;
  Videos nach vergleichbarer Länge und Alter vergleichen. API-Verfügbarkeit der
  gewünschten Kennzahlen erst prüfen; fehlende Metriken nicht approximieren.
- CSV-/Excel-Import ist als Ergänzung vorgesehen, nicht als bereits fertig melden.

## Weitere Kanäle und offene Betriebsfragen

- Google Ads, GA4, Mailchimp, YouTube und Microsoft-365-Adapter sind vorbereitet,
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
