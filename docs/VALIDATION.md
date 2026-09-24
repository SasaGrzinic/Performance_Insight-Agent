# Verifikation vom 14. September 2026

## Ergänzung: Neuladen nach abgelaufener Anmeldung

- Ursache reproduziert: Die zwölfstündige Anmeldung war abgelaufen, während die Oberfläche den Nutzer weiterhin aus dem Cache als angemeldet anzeigte. Geschützte Anfragen lieferten HTTP 401; erneute Ladeversuche konnten deshalb nicht helfen.
- Der API-Client behandelt abgelaufene Sitzungen jetzt zentral für Lese- und Schreibzugriffe. Eine einmalige Navigation zur Anmeldung verwirft private Cache-Daten und laufende Anfragen. Die Anmeldung erklärt den Sitzungsablauf; ungültige Zugangsdaten lösen keine Weiterleitungsschleife aus. HTTP 401 wird nicht automatisch wiederholt.
- Sechs Frontend-Regressionstests und der TypeScript-/Vite-Produktionsbuild erfolgreich. Die CI führt die Frontend-Tests ebenfalls aus.
- Browserprüfung mit gezielt abgelaufener, eigens erzeugter lokaler Prüfsitzung: „Daten aktualisieren“ führt zur Anmeldung mit Ablaufhinweis. Anschliessend regulär angemeldet und die Seite neu geladen; die echten LinkedIn-Kennzahlen werden wieder angezeigt.

## Ergänzung vom 15. September: LinkedIn-Verbindung vorbereiten

- Vollständiger Backend-Testlauf nach Live-Anbindung: 37 Tests erfolgreich; Ruff ohne Befunde. React/TypeScript-Produktionsbuild erfolgreich.
- Neue Tests prüfen ausschliessliche Unternehmensabfrage, Organisationsherkunft, abweichende Organisationsantworten, unzulässige Profil-IDs, UTC-Zeitraumgrenzen und dokumentierte negative Like-Zahlen.
- Lokaler Entwicklungsstart übernimmt Provider-Konfiguration aus der `.env` im Projektstamm in API und Worker.
- Sonio AG im angemeldeten Entwicklerportal bestätigt: Unternehmens-ID `622072`. Die neu angelegte App `266496062` wurde nach ausdrücklicher Zustimmung des Nutzers mit der Unternehmensseite verifiziert. Der Community-API-Antrag wurde vor der Geschäftsmail-Verifizierung nicht weitergeführt.
- Nach Aufnahme des Nutzers in das App-Team ist die bestehende App „Sonio Teams Bot“, App-ID `247434008`, Client-ID `78ria4ak7covm9`, zugänglich. Community Management API im Development Tier und verifizierte Zuordnung zu Sonio AG wurden im Entwicklerportal bestätigt. Diese bestehende App wird für die Verbindung verwendet.
- Der Nutzer hat den Scope `rw_organization_admin` und die zusätzliche offizielle LinkedIn-Callback-URL ausdrücklich genehmigt. Zugriffstoken, Refresh-Token und bestehendes Client-Secret sind in der ignorierten lokalen `.env` gespeichert, Dateimodus `0600`. Der Schlüssel wurde nicht rotiert. Private Profilstatistiken werden nicht abgefragt.
- Die echte Organisations-API bestätigt `622072`, Sonio AG, `https://www.sonio.com`. Automatischer Refresh-Token-Austausch erfolgreich. Die korrigierte Rest.li-2.0-Kodierung für strukturierte Zeitparameter ist sowohl mit einem echten HTTP-200-Abruf als auch auf der HTTPX-Anfrage-URL getestet.
- 385 Messwerte für Juli bis 15. September 2026 importiert. Jeder Datensatz gehört zu `urn:li:organization:622072`. Laufender lokaler API-/Worker-/Scheduler-Betrieb; erster geplanter Sync und nachgeholter August-Report erfolgreich. E-Mail bleibt unkonfiguriert.
- Live-Dashboard über den normalen Admin-Login geöffnet; Übersicht verwendet vorläufig vier LinkedIn-Kennzahlen. Der Zeitverlauf wählt zunächst den verbundenen Kanal. Demo bleibt getrennt unter `?demo=1`.
- Manueller Refresh über den Dashboard-Knopf erfolgreich abgeschlossen. Weiterhin genau 385 LinkedIn-Messwerte, ausschliesslich mit Sonio-Organisations-URN; keine Doppelzählung nach erneutem Import. Die sichtbaren August-Werte und der LinkedIn-Zeitverlauf wurden im Browser geprüft.

## Erfolgreich ausgeführt

- React/TypeScript-Produktionsbuild mit Vite 8.3.0 und Node 26.8.2.
- 28 Backend-Tests mit Python 3.12.14 und temporärer SQLite-Testdatenbank.
- Ruff-Prüfung ohne Befunde; Python-Module kompilieren.
- Initiale Alembic-Migration in der lokalen Vorschau.
- Syntaxprüfung der Compose-/CI-YAML-Dateien durch Prettier.
- HTTP 200 für lokale Health-, Konfigurations- und Demo-Endpoints nach abschliessendem API-Neustart.
- Browserprüfung: Desktop und Mobile, Original-Assets geladen, kein horizontaler Seitenüberlauf; Kanalfilter, Empfehlungsdetails, Report-Archiv/-Ansicht; mobile Navigation versteckt ihre geschlossenen Links und stellt Fokus nach Escape wieder her.
- Getrennte Quellenprüfung der sechs gefundenen UI-Mängel; alle sechs Korrekturen bestätigt (Logout, mobile Navigation, Rollen-Grenzen, Auftragsfehler, Analyse-Ladefehler, Dezimal-Conversions).

Die Tests prüfen Authentifizierung, Sitzungscookies, CSRF, Rollen, Einladungsablauf/-verbrauch, Rate-Limit, Admin-Schutz, sichere DOCX-/CSV-Verarbeitung, Quellenersatz statt Doppelzählung, Fehlerrücknahme, Periodenvergleiche, Scheduling inklusive DST und Nachholung, Job-Wiederholung, Reports, OpenRouter-Payload und Cache sowie die Antwortzuordnung mehrerer Anbieter-Adapter.

Zwei Hinweise aus Drittbibliotheken sind noch vorhanden: Starlette weist auf einen zukünftigen Testclient-Wechsel von httpx hin; ausserdem wird ein AnyIO-Alias als veraltet markiert. Sie verursachen keine Testfehler.

## Noch nicht extern verifiziert

- Docker-Build/-Start und PostgreSQL-Laufzeit: Docker fehlt auf diesem Rechner. Die eingecheckte CI sieht hierfür PostgreSQL-Tests und beide Container-Builds vor; sie wurde noch nicht auf GitHub ausgeführt.
- Echte Google-, LinkedIn-Ads-, Mailchimp-, YouTube- und Microsoft-365-Kontoabfragen: Zugangsdaten fehlen. LinkedIn Organic wurde live verifiziert; die übrigen Adaptertests verwenden repräsentative Antworten und ersetzen keine Abnahme mit dem echten Konto.
- Echte OpenRouter-Auswertung: kein Schlüssel und kein Modell ausgewählt. Schema/Datengrenzen sind lokal geprüft.
- SMTP-Zustellung: keine Empfänger-/Serverkonfiguration; es wurde keine E-Mail versandt.
- Verbindliche KPI-Abnahme und Word-Formatabgleich stehen aus; QR-Anbieter ist noch offen.

Diese Grenzen sind keine versteckten Live-Funktionen: Fehlende Verbindungen werden im Dashboard ausgewiesen; die Demo verwendet ausschliesslich synthetische Werte.

## Erweiterung vom 16. September: Posts, Follower und Monatsvergleich

- 46 Backend-Tests, 8 Frontend-Tests und Ruff erfolgreich. Produktionsbuild erfolgreich; keine zusätzlichen Laufzeit-Abhängigkeiten.
- Migration 002 auf der lokalen SQLite-Vorschau angewendet. 38 reale Sonio-Posts aus Juli–September geladen, davon vier Videos mit verfügbaren Videoanalysen. Kein Abruf privater Profilstatistiken.
- Monatliche Follower-Zugewinne live geprüft: Juli 59, August 39, September bis 16.09. 22; aktueller Bestand 4’420. Frühere Gesamtbestände bleiben unbekannt.
- Browser: Monatsnavigation Juli/August/September, Videofilter und Kennzahlen, Klickvergleich August/Juli, Tagesfilter auf Beiträge, monatliche Follower geprüft. Mobile Navigation und scrollbare Tabellen bei 390 px; kein horizontaler Seitenüberlauf. Desktop bei 970 px.
- Tests decken Post-Pagination, Organisationsherkunft, Video-Zuordnung, fehlende Statistiken, atomaren Datenersatz, unabhängige Fehlerzustände, Follower-Daten sowie Kalendertag-Ausrichtung mit Nullwerten/Lücken ab.
- Zusätzlicher Impeccable-Detektor nicht ausführbar (Engine lokal nicht installiert). Visuelle Prüfung anhand aktueller Browser-Screenshots unter `.impeccable/review/`.
- Weiterhin nicht hier verifiziert: Docker/PostgreSQL-Laufzeit, produktive Bereitstellung, OpenRouter und SMTP.
- Abschliessender manueller Browser-Refresh am 16.09.2026 09:29 UTC: Job erfolgreich abgeschlossen; `linkedin_organic`, `linkedin_audience` und `linkedin_posts` jeweils `connected` mit neuen Abrufzeiten. Browser zeigt wieder den aktiven Aktualisieren-Knopf und die geladenen Live-Werte.
- Frische unabhängige Screenshot-Abschlussprüfung: Freigabe ohne materielle UI-Befunde. Tatsächliche Desktop-Aufnahmen decken 970/1280 px ab (Scrollleistenbreite im Bild abgezogen); mobile Aufnahmen 390 px.

## Hover-Zuordnung und durchschnittliche Videodauer

- Benutzerdefiniertes Diagramm-Kästchen mit Veröffentlichungsdatum und allen Posttiteln dieses Tages, getrennt pro Vergleichsmonat. Keine Attribution der gesamten Tagesleistung auf einzelne Posts.
- Ø Betrachtungsdauer wird aus `watch_time_ms / video_views / 1000` in Sekunden berechnet. Division durch Null, fehlende oder ungültige Werte bleiben unbekannt. Berechnungsbasis sind die qualifizierten Videoaufrufe ab drei Sekunden; wiederholte Schleifen können die Wiedergabezeit erhöhen.
- Zehn Frontend-Tests und Produktionsbuild erfolgreich. Neue Tests prüfen Monats-/Tageszuordnung mehrerer Posts sowie Einheiten, Nenner und fehlende Videowerte.
- Im Browser auf Desktop und 390px mobil geprüft; Diagramm-Tooltip auch per Pfeiltasten erreichbar. Reales September-Video zeigt 19.48 Sekunden. Titelanzeige statt optionalem Hauptbild.

## Vollständiger Post-Abgleich, CSV-Auswahl und Sonio-Blau

- Live-Author-Finder über alle zwölf Folgeseiten geprüft. LinkedIn lieferte u.a. 98 Einträge mit nächstem Offset 98. Import folgt nun diesem Offset, statt pauschal 100 zu addieren. Kein Abbruch nach Erstellungsdatum: vorab erstellte, später veröffentlichte Posts können auf älteren Seiten liegen. Nur der Offset wird aus dem Provider-Link gelesen; Ziel und Organisationsfilter bleiben fest.
- Erneuter Import bestätigt alle derzeit über die API sichtbaren Posts für Juli (18), August (10), September bis 16.09. (10). In diesen Monaten wurden beim Abgleich keine zusätzlichen fehlenden Posts gefunden. Tagesaktivität kann auch ältere Posts betreffen und ist kein Veröffentlichungsnachweis.
- Veröffentlichungsmarker im Diagramm; Tooltip auf Datum, Kennzahl, Titel reduziert. Keine irreführende Leertext-Aussage mehr.
- CSV-Auswahl: Monats-/Tageskennzahlen nach Kanal und Kennzahlen; LinkedIn-Posts oder nur Videos mit frei gewählten Kennzahlen. Ausgewählter Berichtsmonat, Datenstand, Einheit, Lifetime-/Tages-/Monatsbezug und Demo-Kennzeichnung werden exportiert. UTF-8 BOM, Semikolon, Formula-Escaping, leere Messwerte bleiben leer.
- Browser-Download einer CSV mit nur Ø Betrachtungsdauer tatsächlich im Downloadordner gelesen: genau eine Datenzeile mit der gewählten Kennzahl, Wert 19.478692883895132 Sekunden.
- 47 Backend-Tests, 11 Frontend-Tests, Ruff und Produktionsbuild erfolgreich. Lokale API/Worker/Scheduler mit korrigiertem Import neu gestartet.

## Offener Nutzerhinweis

Der Nutzer sieht weiterhin nur einen Teil der Postüberschriften im Diagramm (nach dem Importabgleich). Vollständigkeit der UI-Zuordnung ist deshalb nicht abschliessend abgenommen. Bei Wiederaufnahme konkrete fehlende Titel/Zeiträume mit Tooltip und Beitragsliste abgleichen; der Importabgleich allein schliesst den UI-Fehler nicht aus. Aktuell auf Nutzerwunsch YouTube als nächsten Integrationsschritt vorbereiten.
