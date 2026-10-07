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

## Umsetzung der Produktdesign-Prüfung

- Übersicht auf kompakte Monatskennzahlen, Einordnung und Verlauf konzentriert.
  Vollständige Beitragskarten bleiben in der Detailansicht erreichbar; doppelte
  leere KI-Empfehlungsflächen entfernt. Exportauswahl bleibt erhalten.
- Vergleiche nennen Monat und Vorperiodenwert; laufende Monatsvergleiche nennen
  zusätzlich das Vergleichs-Enddatum. Vergleichstext mindestens 12 px.
- Persistente Auswahl von Beitragsmonat und Veröffentlichungstag unter dem
  Diagramm. Alle geladenen Beiträge des ausgewählten Datums erscheinen dort;
  Vergleichsmonate sind unabhängig vom Berichtsmonat auswählbar.
- Kanal-Tageswerte und Beitragswerte seit Veröffentlichung separat beschriftet.
  Mobile verwendet den persistenten Bereich statt eines verdeckenden Tooltips.
  Dekorative mathematische Unicode-Schriften in Titeln werden nur für die Anzeige
  normalisiert; Quelldaten und CSV-Titel bleiben unverändert.
- Live-Browserprüfung: August/Julivergleich, zwei Beiträge am 6. August und zwei
  am 3. Juli im Vergleichsmonat, CSV-Auswahl. LinkedIn meldete API-Begrenzung;
  vorhandene Daten mit Abrufstand wurden angezeigt, kein neuer Import behauptet.
- Desktop 1280 px und Mobile 390 px visuell geprüft. Unabhängiger Finish-Reviewer
  beanstandete fehlenden Innenabstand im Analysebereich; korrigiert und anhand
  beider neuen Aufnahmen als behoben bestätigt (Disposition: ship, Umfang: Fix).
- Zwölf Frontend-Tests, TypeScript-Prüfung und Produktionsbuild erfolgreich.
  Neuer Test schützt Titel-Normalisierung inklusive Akzenten und Emoji.
  Backend unverändert. Automatischer Impeccable-Detektor wegen fehlender Engine
  nicht verfügbar. Keine vollständige WCAG-Abnahme.
- Frühere Behauptung fehlender Posttitel ist damit nicht für sämtliche Zeiträume
  abschliessend geklärt; die neue Auswahl macht die Zuordnung überprüfbar.

### Headerbild, Kanal-Logos und mehrere Diagrammkennzahlen — 24.09.2026

- Vorhandenes Sonio-Websitefoto lokal eingebunden, Herkunft in `frontend/public/brand/ASSETS.md` und JPEG-Kommentar dokumentiert. Kanalmarken lokal; Events/QR behalten funktionale Icons ohne erfundenen Anbieter.
- Performance unterstützt 1–4 Kennzahlen und weiterhin bis zu vier Monate. Kennzahlenfarbe bleibt stabil; Monate unterscheiden sich durch Linienarten. Absolute Werte gruppieren sich nach Einheit; relative Darstellung skaliert jede Monats-/Kennzahllinie auf ihren eigenen Höchstwert. Tooltip, Tagdetails und Monatsergebnisse bleiben Originalwerte. Fehlend bleibt eine Lücke, echte Null bleibt Null.
- Live-Browser: zwei Kennzahlen × August/Juli = vier Linien; vier Kennzahlen × zwei Monate = acht Linien, fünfte Auswahl deaktiviert. 6. August zeigt weiterhin beide Posttitel und beide Tageskennzahlen. Kanalansicht zeigt LinkedIn-Logo mit Kanalnamen im Header.
- Desktop (Standardbreite 1224) und Mobile (390) visuell geprüft. Desktop absolute/mobile relative Darstellung erfasst unter `.impeccable/review/header-metrics-{desktop,mobile}.png`; mobiler Seitenüberlauf geprüft: keiner. Temporäre Viewport-Anpassung zurückgesetzt.
- 14 Frontend-Tests erfolgreich (darunter neue Mehrfachkennzahl-Ausrichtung und relative Skalierung), TypeScript und Vite-Produktionsbuild erfolgreich. Keine Backend- oder API-Berechtigungsänderung. LinkedIn-Rate-Limit besteht; vorhandener Datenstand bleibt sichtbar.
- Impeccable-Detektor versucht, mangels installierter Engine 0.1.5/Cache-Schreibrecht nicht ausführbar; keine automatisierte Design-Abnahme behauptet.
- Unabhängige Abschlussprüfung: `ship` für die beiden gelieferten Ansichten; keine belegten materiellen Darstellungsfehler. Ergänzender Browser-Funktionstest auf separater, danach geschlossener Demo-Seite bei 390 px: vier Kennzahlen, vier Kurven, zwei Achsen; Erläuterung «Anzahl links · CHF rechts», kein Seitenüberlauf. Kein echter Google-Ads-Zugriff dadurch behauptet.

### Kanalübersicht und vollflächiger Bildheader — 24.09.2026

- Übersicht als Einstieg mit allen acht Kanalprodukten, vorhandenen Markenlogos (Events/QR ohne definierten Anbieter: Funktionssymbole), Status, bis zu drei verfügbaren Kennzahlen und letztem Abruf. Verbundene Kanäle zuerst. Fehlende Werte werden nicht erfunden.
- LinkedIn-KPI-Streifen, PerformanceExplorer und vollständige Posts nicht mehr auf der Übersicht; bestehende Kanaldetails behalten Analysen und Mehrfachvergleich. Direkte Verweise auf Follower und Posts ergänzen die LinkedIn-Detailseite.
- Nutzerkorrekturen umgesetzt: explizit das Artikel-Headerbild, nicht das Autorenporträt. Übersicht mit vollflächigem Foto, Titel «MARKETING PERFORMANCE & INSIGHT»; Monat und Aktualisierung in eigener Werkzeugzeile ausserhalb des Bildheaders. Alte ungenutzte Fotodateien entfernt; neue Quelle im JPEG und ASSETS.md dokumentiert.
- Browser: acht Übersichtseinträge, kein PerformanceExplorer auf Übersicht, null Buttons/Inputs im Header. LinkedIn-Karte öffnet richtige Überschrift und Diagramm; YouTube öffnet eigene Detailansicht; Rückweg funktioniert. Mobile390 ohne Seitenüberlauf, Desktop1224 und Mobile visuell erfasst in `.impeccable/review/channel-overview-{desktop,mobile}.png`.
- Erneut 14 Frontend-Tests, TypeScript und Produktionsbuild erfolgreich. Keine Backendänderungen, keine neue Datenanbindung oder Synchronisierung ausgelöst.
- Unabhängige Abschlussprüfung der gelieferten Desktop-/Mobile-Aufnahmen: `ship`, keine sichtbaren Blocker. Keine vollständige Accessibility-Zertifizierung; Fokus/Fehlerzustände und Kontrast wurden dabei nicht separat messtechnisch geprüft.

### Agententext, Top-3-Vorschau und aktueller Monat — 24.09.2026

- Übersicht nutzt den aktuellen Monat in der konfigurierten Berichtszeitzone, mit Minutenprüfung auch beim Monatswechsel. Historische Auswahl bleibt in Detailansichten. Datumsauswahl und «Abgeschlossener Monat» entfallen auf der Übersicht; Aktualisierung steht neben dem Kanalstatus.
- Erklärung direkt unter dem Header aus dem bisherigen Projektauftrag formuliert; keine separate Challenge-Datei gefunden. Top-3-Bereich vor Kanälen: verfügbare Empfehlungen nach Priorität sortiert; ohne Empfehlungen ausdrücklich gewünschte grafische Vorschau mit drei Platzhaltern, ohne erfundene Befunde und ohne erneuten OpenRouter-Einrichtungshinweis.
- Frontend lädt den gespeicherten Dashboard-Stand jede Minute; das ist keine Zusage sekundengenauer Provider-Echtzeit. Karten zeigen letzten erfolgreichen Abruf inklusive Uhrzeit. Keine Backend-Sync-Frequenz geändert.
- Browser: September2026, null Datumsinputs auf Übersicht, drei Vorschaukarten; Desktop1224/Mobile390 geprüft, kein mobiler Seitenüberlauf. Aufnahmen `.impeccable/review/overview-recommendations-{desktop,mobile}.png`. Unabhängige visuelle Abschlussprüfung ohne wesentliche Befunde.
- 15 Frontend-Tests inkl. Monats-/Jahreswechsel in Berichtszeitzone, TypeScript und Vite-Build erfolgreich.

### Kompakte blaue Übersichtskarten — 24.09.2026

- Empfehlungen nach die vollständige Kanalliste verschoben. Empfehlungssymbole auf42px, Kanallogos auf44px vergrössert. Kartenabstände reduziert, illustrative Beleg-Platzhalterlinien entfernt. Drei Blautöne unterscheiden Karten; dunkle Empfehlung nutzt weisse Schrift. Daten und Navigation unverändert.
- Desktop1224 und Mobile390 visuell geprüft (`compact-blue-desktop.png`/`compact-blue-mobile.png` in `.impeccable/review/`). TypeScript und Produktionsbuild erfolgreich; keine neue fachliche Datenlogik und keine zusätzlichen Tests erforderlich.

### Navigation, Video Performance und Zugang — 24.09.2026

- Hauptnavigation: Übersicht, Kanäle, Insights & Empfehlungen, Video Performance, Reports. Follower und vollständige LinkedIn-Posts bleiben über Kanaldetails erreichbar; Verwaltungsnavigation separat erhalten.
- Neue Videoansicht trennt LinkedIn-Videobeiträge (Gesamtwerte seit Veröffentlichung inklusive Ø Betrachtungsdauer) von YouTube-Monatskennzahlen. `videosOnly` erzwingt Videofilter, statt bloss vorauszuwählen. YouTube weiterhin pausiert und ohne vorgetäuschte Daten.
- Browser: exakte Navigationsreihenfolge, zwei Plattformbereiche, keine «Alle Posts»-Umschaltung in Videoansicht; September enthält einen LinkedIn-Videobeitrag mit Aufrufen, Wiedergabezeit und Durchschnitt. Desktop1224/Mobile390 geprüft, kein mobiler Seitenüberlauf; `.impeccable/review/video-performance-{desktop,mobile}.png`.
- Bestehender Master-Admin-/Einladungsmechanismus erhalten, Teamtext präzisiert. Vier gezielte Backendtests auf temporärer Testdatenbank erfolgreich: Authpflicht, einmalige Einladung/Viewer-Rechte, abgelaufene Einladung, Schutz des Master-Admins vor Deaktivierung. TypeScript und Produktionsbuild erfolgreich. Keine Nutzer eingeladen oder Zugriffsrechte geändert.
- LinkedIn Ads auf Nutzerwunsch pausiert. Bedingungen nicht angenommen und Advertising-Antrag nicht abgesendet; Account-ID bleibt als gewünschtes Ziel dokumentiert.

### 24.09.2026 – Getrennte LinkedIn-Ads-Autorisierung

- Advertising API Development Tier der App 266496062 im Entwicklerportal geprüft.
- Eigene Ads-Token-/Client-Konfiguration, ohne Fallback auf Organic-Zugang.
- 11 LinkedIn-Connector-Tests erfolgreich, einschliesslich getrennter Token-Nutzung,
  fehlendem Ads-Token und Refresh mit ausschliesslich Ads-App-Zugangsdaten.
- Ruff-Prüfung der vier betroffenen Python-Dateien erfolgreich.
- Live-Konto-/Währungsprüfung und Import warten auf den erneuten OAuth-Login.

### 24.09.2026 – Ads-Liveimport abgeschlossen

- OAuth abgeschlossen, eigenständige Ads-Zugangsdaten geschützt gespeichert.
- Refresh-Austausch und Konto 514253005 live geprüft: Sonio AG (622072), CHF.
- 365 Tage (25.09.2025–24.09.2026) kampagnenweise importiert: 40 Messwerte,
  10 Januartage, Kampagne 475515244. 33'500 Impressionen, 70 Klicks, CHF 499.95.
- Rollierendes 365-Tage-Fenster in regulärer manueller/geplanter Synchronisation.
- Kontozuordnung, Kampagnenpagination, Datumsgrenzen, fremde Kampagnen,
  Duplikate, getrennte Token und Rest.li-Projektionen getestet.
- Vollständige Backend-Suite: 55 Tests bestanden. Ruff für betroffene Dateien bestanden.
- API, Worker und bestehender Scheduler mit neuer Konfiguration neu gestartet.
- Live-Dashboard im Browser: LinkedIn Ads, Januar 2026; alle vier Summen geprüft.
- Vollständiger kampagnenbezogener Erstexport unter `.local/LinkedIn-Ads-letzte-365-Tage.csv`.
- Keine neuen Frontend-Komponenten oder Kampagnennamenliste implementiert;
  aktuelle Oberfläche zeigt Monatskennzahlen und Tagesverlauf, CSV auch Kampagnennamen.

### 24.09.2026 – Monatsunabhängige Ads-Kampagnenansicht

- Migration 003 lokal angewendet; 5 echte Kampagnentitel samt Ziel, Status,
  Laufzeit und Währung mit 365-Tage-Statistiken importiert.
- Neue geschützte API; Aggregation über Monatsgrenzen, 365-Tage-Grenze,
  fehlende Daten und nicht authentifizierter Zugriff getestet.
- Backend: 57 Tests bestanden; TypeScript und Produktionsbuild erfolgreich.
- Browser bestätigt 5 benannte Kampagnen, echte Werte der Januar-Kampagne,
  keine Ads-Monatsauswahl und keinen Vergleichsgraphen. Desktop/Mobile erfasst.

### Lokale Organic-Verfeinerung, 25.09.2026
- Headerbeschreibungen, kompakte KPIs, Monatsauswahl im Vergleich als Mehrfach-Dropdown.
- Originalbilder über LinkedIn-Medien-API, Tooltip mit Post-Gesamtwerten für Impressionen/Klicks; Postliste mit Bildern und Datum aufsteigend.
- TypeScript und Vite-Build erfolgreich; 9 LinkedIn-Post-Tests bestanden.
- Browser: 14 September-Beiträge, erster Beitrag 02.09.; zwei Monate überlagert; mobile Ansicht 390px ohne Seitenüberlauf, Originalbilder geladen.
- Automatische Sicherheitsprüfung lehnte eine Löschung alter Post-Datensätze ab; keine Löschung implementiert, gespeicherte Posts bleiben erhalten.
- Änderungen lokal, noch nicht auf GitHub Pages veröffentlicht.

### Ads-Motive und KPI-Hilfe, 25.09.2026
- Erneuter lesender Analytics-Abruf 26.09.2025–25.09.2026: weiterhin nur eine Kampagne mit Messwerten. Keine fehlenden Realwerte ergänzt.
- 16 Creatives, fünf Kampagnen; pro Kampagne ein Originalmotiv über organisationsgeprüften Beitrag geladen. Alle fünf Bilder im Browser erfolgreich geladen.
- Kompakte Ads-Zeilen, fette KPI-Titel, Suche entfernt. Eine ausdrücklich fiktive Ansichtskampagne, ausgeschlossen aus Exporten und Backend/KI.
- KPI-Dropdown in allen Kanal-Erläuterungen sowie Post-/Videoansicht. Ads-CTR und GA4-Sitzungen im Browser geprüft, 390px ohne Seitenüberlauf.
- TypeScript/Vite erfolgreich; 10 Ads-Tests bestanden. Optionaler Motivabruf darf fehlgeschlagenen Abruf oder fehlende Organic-Konfiguration ohne Verlust bestehender Bilder überstehen.
- API-Grundlage: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-creatives
- Nur lokal aktualisiert; kein Pages-Deployment.

### Mailchimp-Anbindung, 25.09.2026
API bestätigte Sonio AG. Kampagnen- und Report-Endpunkte lesend erreichbar. Erster Sync des laufenden Monats erfolgreich: 15 Messwerte, ChannelState connected. Lokales Backend mit neuer Konfiguration neu gestartet. Keine Schlüsselwerte ausgegeben oder ins Repository übernommen; .env und .local/preview.db git-ignoriert. Endgültige KPI-Auswahl bleibt offen.

### Mailchimp-Jahresübersicht 2026
39 gesendete Mailings über API gefunden; 4 Test-/Vorlagensendungen ausgeschlossen.
35 Mailings, 15 Gruppen, 105 vorläufige Kennzahlen importiert. Migration 004 lokal
angewandt. Fünf Tests zu Gruppierung, fehlenden Reports, Testausschluss und
unvollständiger Pagination bestanden. TypeScript/Produktionsbuild erfolgreich.
Browser: September + Events sowie Suchbegriff Swiss zeigen die passenden Gruppen;
390px ohne Seitenüberlauf. Fachliche KPI-Festlegung weiterhin offen.

Mailing-Leitbilder: 35/35 Bild-URLs aus versendetem HTML ermittelt (erstes grosses
Inhaltsbild, Logos/Icons/Pixel ausgeschlossen). Mailchimp-HTML wird nicht gerendert,
nur erlaubte HTTPS-Bildhosts. Bestehende URLs werden beim Sync wiederverwendet.
Acht Mailchimp-Tests bestanden, inklusive Pixel-/Logo-/Hostfilter und optionalem
Bild-Timeout. Build/TypeScript erfolgreich. Dropdown aktuell September zuerst,
Ganzes Jahr zuletzt; Gruppen nach letztem Versand und Sendungen absteigend.
Desktop/Mobile (390px) ohne horizontalen Überlauf geprüft.

Mailchimp-KPI-Erweiterung: Live-Import für 35 Mailings erfolgreich. Neun gezielte
Tests bestanden (Rate/Null/fehlend enthalten), TypeScript/Vite-Build erfolgreich.
Browserprüfung zeigt Klick-/Zustellrate direkt, aufklappbare Detailwerte; Mobile
390px ohne Überlauf. API-Raten nicht als summierbare Metrics importiert.

## YouTube-Zugang — 25.09.2026

- Bestehenden OAuth-Client und vorhandene Google-Anmeldung genutzt; Zielkanal
  @sonio-channel_2023 vor Token-Speicherung via Data API verifiziert.
- September 2026 live importiert: 63 Messwerte (21 Tageszeilen), 32’355 Aufrufe,
  9’854 Wiedergabeminuten, 0 gewonnene Abonnenten. Das ist der gelieferte
  Analytics-Datenstand, keine Garantie für Echtzeit-Vollständigkeit.
- API, Worker und Scheduler mit aktualisierter Konfiguration neu gestartet.
- Browser: Übersicht zeigt 4 von 8 verbunden; YouTube-Detailseite zeigt echte
  Kennzahlen und Tagesverlauf. OAuth-Erfolgsfenster geschlossen.
- Keine UI-/Adapterlogik geändert; keine zusätzlichen Unit-Tests nötig.
- Noch offen: detaillierte Video-KPIs und Freigabe für dauerhaften Betrieb
  ausserhalb des Google-Testmodus. Frühere Pausen-/Zugangshinweise sind überholt.

### YouTube-Videothek — 25.09.2026

- Lesender Live-Abruf: 80 Videos und 8 Playlists; 38 Videos mit gelieferten
  Kennzahlen für September 2026. Dies ist ein beobachteter Abrufstand, keine feste
  Erwartung für spätere Abfragen. Zugriffsquellen ebenfalls live erfolgreich abgerufen.
- Zwei gezielte Backend-Tests bestanden: Upload-Pagination mit fehlenden Werten
  gegenüber echten Nullwerten sowie Ablehnung eines fremden autorisierten Kanals.
  TypeScript-Prüfung und Produktionsbuild erfolgreich.
- Ansicht mit Monats-, Playlist- und Videofilter, Vorschaubildern, sieben
  Monatskennzahlen und aufklappbaren Zugriffsquellen ergänzt. Bestehende Sonio-Blautöne
  und kompakte Zeilen beibehalten; keine neue Designidentität eingeführt.
- Öffentliche Demo ohne Live-Videodetails. Keine Zugangsdaten in UI oder Dokumentation.
- Browser: Playlistfilter «EVENTS», Videoauswahl «Zoo2026» und Öffnen der
  Zugriffsquellen erfolgreich geprüft. Mobile-Prüfung siehe UI-Abschluss unten.
  Google-Testmodus und weiterführende Format-/Sprachsegmentierung bleiben offen.

YouTube UI-Abschluss: Monatsdropdown September → August → September erfolgreich
geprüft; Playlist EVENTS und Einzelvideo Zoo-Event 2026 auswählbar. Desktop1224
und Mobile390 erfasst, mobile Seitenbreite383 ohne horizontalen Überlauf.
Finish-Review: Aktualisieren-Button an Sonio-Stil angepasst, Nachkontrolle «ship».
TypeScript und Vite-Build bestanden. Impeccable-Detektor wegen fehlender lokal
installierter Engine nicht ausführbar; visuelle Prüfung direkt erfolgt.

YouTube-KPI-Ausrichtung: gemeinsames CSS-Grid mit Subgrid für Beschriftungen und
Zahlen. Desktop1224: alle sieben Zahlen exakt auf y1170; Mobile390: je zwei
Zahlen auf gleicher Höhe, kein horizontaler Überlauf (383px Inhaltsbreite).

Korrektur Nutzerbezug: Gemeint war die YouTube-Kachel in der Übersicht.
Auch `.channel-entry-values` teilt nun Beschriftungs-/Zahlenzeilen per Subgrid.
Browser bestätigt gleiche Höhe beider YouTube-Werte: Desktop y1258, Mobile y1912.

### YouTube-Videolänge, Gesamtwerte und bestätigte Monatsnullen — 25.09.2026

- Data API um `contentDetails.duration` und verfügbare Gesamtwerte aus
  `statistics` für Aufrufe, Likes und Kommentare ergänzt. Gesamtwerte erscheinen
  separat von Monats-KPIs; Länge steht beim Veröffentlichungsdatum.
- Fehlende Videozeilen im dimensionsbezogenen Monatsbericht werden mit einzelnen
  Monatsberichten geprüft. Nur explizit gelieferte Nullwerte werden übernommen;
  fehlende Antworten bleiben fehlend. Bei null Aufrufen aus der Einzelabfrage
  bleiben durchschnittliche Dauer und durchschnittlicher Anteil leer.
- Live-Abruf: Monatswerte und Videolängen für 80 von 80 Videos. Beispiel
  Miguel-Testimonial: September 0 Aufrufe, seit Veröffentlichung 7 Aufrufe,
  Länge 30 Sekunden. Die früher dokumentierten 38 Videos bezogen sich auf den
  dimensionsbezogenen Bericht vor den ergänzenden Einzelabfragen.
- Zwei gezielte Backend-Tests, TypeScript und Produktionsbuild erfolgreich. Browser: korrekte
  Monats-/Gesamtwerttrennung und Länge geprüft; Mobile390 ohne horizontalen
  Überlauf. Desktop-/Mobile-Abschlussreview: «ship».
  Erklärtexte zu allen sieben Video-KPIs erweitert.
- Keine Änderung der Sonio-Design-Tokens oder der öffentlichen Demo-Datentrennung.


### YouTube-Veröffentlichungsmonat — vorrangige Nutzerentscheidung 25.09.2026

- Monatsauswahl filtert jetzt Veröffentlichungen in Europe/Zurich. Kennzahlen und
  Zugriffsquellen gelten seit Veröffentlichung bis heute. Frühere Einträge zu
  Monatskennzahlen und separater Gesamtwertezeile beschreiben den abgelösten Stand.
- Aufrufe, Likes und Kommentare: aktuelle Data-API-Bestände. Übrige Werte: Analytics,
  möglicherweise verzögert. Eigener Cache `youtube:published:` trennt alte Monatsdaten.
- Zwei Regressionstests bestanden: Januarvideo bei Septemberauswahl ausgeschlossen;
  Septembervideo bis 25. Oktober abgefragt statt nur bis Monatsende.
- Live und im Browser bestätigt: Juli zeigt zwei Videos; Miguel-Testimonial zeigt
  aktuell 7 Aufrufe, Ø Betrachtungsdauer 21 Sekunden und Videolänge 30 Sekunden.
- TypeScript und Produktionsbuild erfolgreich. Desktop-/Mobile-Abschlussreview
  inklusive Zeitbezug: «ship».

Website-Quervergleich DE/FR am 25.09.2026: 58 Einträge, 54 eindeutige YouTube-IDs, alle im 80er-Import enthalten. Romandie/Charlie-Chaplin-Film unter Juni 2025 live bestätigt. Einzelabgleich: YOUTUBE_WEBSITE_AUDIT.md.

## GA4-Anbindung 25.09.2026

- Lesender Live-Zugriff auf Property358384645 bestätigt; 168 Tagesmesswerte
  aus August/September2026 importiert. September:1592 Sitzungen,1405 engagierte
  Sitzungen,4602 Schlüsselereignisse (Momentaufnahme).
- Browser zeigt GA4-KPIs, Tagesdiagramm und Vorperiodenvergleich.
- Separate Tokenkonfiguration erhält YouTube-Autorisierung. Keine Secrets
  protokolliert oder veröffentlicht. Bestehende Google-Testmodusgrenze bleibt.


### GA4-Seitenauswertung — 25.09.2026

- 17 eindeutige vorgegebene URLs: 14 Kampagnen und drei Vorstellungsseiten.
  Identische Business-Continuity-URL für DE/FR einmal erfasst; bereinigte exakte
  Pfade und Sonio-Hosts gefiltert, keine CMS-Vorschauparameter übernommen.
- Live September: 12 von 17 Seiten mit gelieferten Daten, darunter alle drei
  Vorstellungsseiten. Fehlende Berichtszeilen bleiben fehlend.
- Zwei gezielte Tests, TypeScript und Produktionsbuild erfolgreich.
- Browser: Vorstellungsseite Fitim mit 5 Seitenaufrufen, 3 Besuchern, 4 Sitzungen
  und Ø 35,33 aktiven Sekunden je Besucher korrekt angezeigt. Mobile390 ohne
  horizontalen Überlauf. Keine Live-Seitendaten in der öffentlichen Demo.

### GA4-Inhaltsauswertung — 25.09.2026

- Live-Abruf für September und begrenzte Vorperiode: 17 Kompetenzseiten,
  76 Blogartikel, 39 Newsartikel und 48 Customer Stories. Dies ist eine
  Momentaufnahme der beobachteten GA4-Pfade, kein vollständiges Website-Inventar.
- Vier gezielte Backend-Tests für Inhalte und Kampagnenseiten bestanden.
  Inhaltsregressionen prüfen Kategorien, Pagination, Titelwahl, getrennte
  Pfadkennzahlen, fehlende Werte und die begrenzte Vorperiode.
- TypeScript-Prüfung und Vite-Produktionsbuild bestanden; Ruff für das neue
  Inhaltsmodul und dessen Tests bestanden.
- Browserprüfung auf Desktop und bei 390 px mobiler Breite: kein horizontaler
  Seitenüberlauf. Inhaltsbereich, Einzelseitenwahl und Erweiterung der Liste
  sind in der bestehenden Analytics-Ansicht integriert; Monatswechsel setzt
  über den React-Schlüssel die Inhaltsauswahl zurück.
- Bestehende Sonio-Gestaltung anhand von `PRODUCT.md`, `DESIGN.md`,
  `AnalyticsContent.tsx` und den wiederverwendeten Analytics-Styles abgeglichen:
  blaue Kennzahlen/Links, Red Hat Display und vorhandene Formulare/Seitenzeilen.
  Keine Änderung der Design-Tokens oder von `DESIGN.md`.


### GA4-Veröffentlichungsansicht — 25.09.2026

Diese Prüfung betrifft die neue Auswahl nach Veröffentlichungsmonat/-jahr und
Gesamtkennzahlen seit Veröffentlichung bis heute. Sie ersetzt die frühere
Monatssemantik der oben beschriebenen Seitendetails, nicht den Kanalverlauf.

- Live-Momentaufnahmen: Juni 2026 mit fünf Blogartikeln, Kampagnenjahr 2026 mit
  acht Seiten und Vorstellungsseitenjahr 2026 mit zwei Seiten; alle lieferten
  Kennzahlen. Das sind beobachtete Ergebnisse, keine festen Erwartungen.
- Beim geprüften Artikel vom 14. September wurden sechs Quellen, zwei Länder
  und zehn Regionen geliefert. Einzelne ältere öffentliche Seiten bleiben ohne
  abrufbare Metadaten oder bestätigtes Datum; Vollständigkeit nicht behauptet.
- Zehn gezielte Backend-Tests für Inhalte, Kampagnen und Bereiche einschliesslich
  Zugriffsschutz bestanden. TypeScript und Vite-Produktionsbuild bestanden;
  Ruff für das neue Bereichsmodul und dessen Tests bestanden.
- Desktop und Mobile im Browser geprüft; Originalbilder geladen. Bei 390 px
  mobiler Breite 383 px Scrollbreite und kein horizontaler Seitenüberlauf.
  Vollseitenaufnahmen: `.impeccable/review/analytics-cohort-desktop.png` und
  `.impeccable/review/analytics-cohort-mobile.png`.
- Unabhängiges Review der neuen Sektion: Freigabe im geprüften Umfang, keine
  Befunde. Bestehende Sonio-Gestaltung mit `PRODUCT.md`, `DESIGN.md` und den
  Komponenten abgeglichen; keine Änderung von Design-Tokens oder `DESIGN.md`.
- Dokumentiert sind lokale Prüfungen. Daraus folgt kein bestätigter
  Produktions-, Docker- oder CI-Lauf. Vor Trackingbeginn bleiben Daten
  unverfügbar; unbekannte Veröffentlichungsdaten werden separat ausgewiesen.

### 25.09.2026 – Bereich «Blick hinter die Kulissen»
Sieben gezielte GA4-Area-Tests bestanden, inklusive DE/FR-Abgrenzung zum Blog.
TypeScript und Vite-Build bestanden. Browser: eigener Bereich mit zwei September-
Artikeln (DE/FR) und Gesamtkennzahlen, «September 2026» bei den obersten KPIs;
unter der Sitzungs-Summe bei nur einem Monat keine erneute Monatsbeschriftung.

### 25.09.2026 – Monatsquellen und Geo
Zwei gezielte Tests für Zeitraum, Pagination, Länder-/Regionsdimensionen und
Zugriffsschutz bestanden; TypeScript/Vite bestanden. Live-Browser: Monatsquellen
und 40 Länder geladen, Regionswechsel funktioniert. Desktop/Mobile visuell geprüft;
390 px ohne horizontalen Überlauf (scrollWidth 383). Sitzungen und Besucher klar
getrennt; Datenschutz-/Aggregationshinweise bleiben sichtbar.

### 25.09.2026 – KI-Quellen statt geografischer Herkunft
Elf gezielte Tests bestanden: Monats-/Gesamtzeitraum, Pagination, geschützte
Endpoints und konservative KI-Domainzuordnung inklusive negativer Treffer.
TypeScript und Vite-Build bestanden. Länder-/Regionsabfragen entfernt.
Referenz: https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
und https://help.openai.com/en/articles/12627856-publishers-and-developers-faq.

### 26.09.2026 – automatischer LinkedIn-Videoimport nach Tagesreset
- Vollständige Provider-Pagination für Sonio 622072, Veröffentlichungszeitraum ab 2003 bis Abrufdatum: 121 organische Video-Beiträge lokal gespeichert (zuvor 4).
- 118 Vorschaubilder; Video-Status 50 available / 71 partial; 53 Beiträge mit geliefertem video_views-Wert. Fehlende Kennzahlen bleiben fehlend; kein vollständiger Statistikbestand behauptet.
- Keine Veröffentlichung, keine zusätzlichen Worker/Scheduler gestartet. Browserprüfung durch abgelaufene Sitzung begrenzt; Datenbankbestand geprüft.

## 2026-09-29 – Dashboard und Login Designbranch

- `npm test`: 19/19 erfolgreich, einschliesslich zwei neuer Regressionstests für
  Trend-Auswahl, fehlende Werte, Null-Vergleichsbasis und echte Null-Ergebnisse.
- `npm run build`: TypeScript und Vite Produktionsbuild erfolgreich.
- Chromium/Playwright, 1440×900 und 390×844: Login und Dashboard gerendert,
  Screenshots geprüft; kein horizontaler Dokumentüberlauf. Vollständiges Bergbild.
- Empfehlung: Zusatztext per Hover und Klick sichtbar; Detaildialog geöffnet.
- UI-Prüfung mit abgefangenen API-Antworten aus bestehender Demo-Fixture;
  keine Live-API, keine echten Logindaten, keine produktiven Schreibvorgänge.
- Impeccable-Detektor: keine Befunde in den geänderten UI-Dateien beim Prüflauf.
- Backend, Docker und echtes Einloggen nicht erneut ausgeführt; unveränderte
  Authentifizierungslogik ist durch bestehende Frontend-Regressionstests abgedeckt.

## 2026-09-29 – LinkedIn Organic Designintegration

- `npm test`: 22/22 erfolgreich. Neue Regressionen: fehlende Monatswerte versus
  beobachtete Null, vollständige Engagement-Bestandteile, Schweizer Jahreswechsel.
- `npm run build`: TypeScript/Vite erfolgreich. Bestehende Bundle-Grössenwarnung
  (>500 kB Hauptchunk) bleibt; kein Buildfehler.
- Chromium/Playwright bei 1440 und 390 Pixeln: sechs KPI-Kacheln, kein horizontaler
  Dokumentüberlauf, Screenshots geprüft. Jahresauswahl, KPI-Auswahl (6→5), Video-
  Ranking-Wechsel und Tastatur-Tooltip funktionieren; keine JavaScript-Laufzeitfehler.
- Browserprüfung nutzt abgefangene API-Antworten mit Test-Posts, nicht Live-Kontodaten.
  Echte LinkedIn-Berechtigungen, Zieltracking, Backend/Docker und Produktion wurden
  hier nicht erneut getestet. Fehlende Zielklicks werden als «—» angezeigt.

### Einheitliche Zitate — 30.09.2026
Alle vorhandenen Seitenzitate (Übersicht, Kanalübersicht, LinkedIn Organic, YouTube) verwenden EditorialQuote und editorial-quote.css. Zitattexte/Quellen bleiben erhalten; zentrierte Typografie, blaue Anführungszeichen und Autoren-/Rollenzeile sind gemeinsam definiert. Überholte marketing-quote/li-quote-Regeln entfernt. TypeScript und Vite-Build bestanden (bestehende Bundlewarnung). LinkedIn und Übersicht visuell auf Desktop verglichen; Übersicht bei 390 px ohne horizontalen Überlauf geprüft. Keine Veröffentlichung.

### Analytics-Infoboxen — 30.09.2026
Alltagssprachliche AnalyticsInfo-Erklärungen an den vorhandenen Monats-KPIs, Seitenkennzahlen, Herkunftsgruppen, KI-Zugriffen und Detailaktionen ergänzt. Monat/Gesamtstand werden explizit unterschieden; fehlend ist nicht null. GEO-Block entsprechend benannt. Hover, Fokus und Antippen öffnen; Escape und Fokusverlust schliessen. Mobile Darstellung als lesbares Kästchen am unteren Bildschirmrand. Keine neuen Messwerte oder Tracking-Zusagen. TypeScript und Vite-Build erfolgreich (bekannte Bundlewarnung). Live-Browser: Sitzungsinfo am Desktop sowie GEO-Info bei 390 px geöffnet, Escape-Schliessen bestätigt.

### Analytics-Designabgleich — 30.09.2026
Gemeinsamer grosser Hero ohne Logo, blaue KPI-/Inhaltskarten, SEO-Zitat und GEO-Raster mit sieben expliziten KI-Quellen umgesetzt. Quellen ohne gelieferte Berichtszeile bleiben «—». Diagramm-Hover zeigt alle drei importierten Tages-KPIs und berechnet zusätzlich Engagement-Rate nur bei vorhandenen Werten und positivem Nenner. Live geprüft am 2.9.: 84 Sitzungen, 78 engagierte Sitzungen, 260 Schlüsselereignisse, 92.86 %. Die Linienauswahl bleibt unabhängig. Zentrale horizontale Aktionsleiste in DESIGN.md festgehalten. TypeScript und Build erfolgreich (bestehende Bundlewarnung). Desktop-Hero/GEO/Hover visuell geprüft, Mobile 390 px ohne horizontalen DOM-Überlauf; Titel/Aktionszeile für kleine Displays getrennt. Keine Veröffentlichung.

### Analytics-Inhaltsraster — 30.09.2026
Alle Analytics-Bereiche verwenden ein gemeinsames zweispaltiges Inhaltsraster; unter 761 px eine Spalte. Bilder stehen flächig über Titel und kompaktem 2×2-KPI-Raster. Detailaufschlüsselungen bleiben innerhalb ihrer Kachel einspaltig. TypeScript erfolgreich; Live-Vorstellungsseiten mit fünf Karten, Desktop zwei Spalten à 565.5 px, Mobile 390 px eine Spalte 345 px ohne horizontalen Überlauf geprüft.

### 30.09.2026 – Analytics: Kennzahlen verstehen
- Analytics übernimmt die blaue Auswahlfläche und helle Erklärfläche der bestehenden YouTube-Kennzahlenhilfe. Andere Kanäle behalten ihre Darstellung.
- TypeScript und Vite-Produktionsbuild erfolgreich; bestehende Bundle-Grössenwarnung bleibt.
- Lokale Browseransicht und Wechsel zu «Engagierte Sitzungen» geprüft. Das gemeinsame Layout enthält den bestehenden einspaltigen Breakpoint bei 650 px; die Browser-Viewport-Prüfung lieferte weiterhin Desktopbreite und ist daher kein bestätigter Mobile-Test.

### 30.09.2026 – Analytics KPI-Hilfe und GEO-Auswahl
- KPI-Kacheln mit blauen Flächen, umlaufender Kontur und linker blauer Kante. Info-Symbole ohne weisse Hintergrundflächen; Tastaturfokus bleibt sichtbar. Infoboxen um Interpretation und Vorperiodenvergleich ergänzt; Quellen-Details und Diagrammsummen ebenfalls mit Info.
- GEO zeigt ausschliesslich ChatGPT, Claude, Copilot und Perplexity. Summe und sichtbare Quelldomains sind auf diese Auswahl begrenzt; Import/Klassifikation weiterer Dienste bleiben erhalten.
- Frischer lesender GA4-Abgleich 01.–30.09.2026: 38 sessionSource-Zeilen, ChatGPT 6 Sitzungen (chatgpt.com); keine zugeordneten Zeilen für Claude, Copilot oder Perplexity. Keine gemeldeten Datenschutzschwellen oder Other-Row-Datenverluste. Bing und Microsoft Teams nicht als Copilot klassifiziert.
- TypeScript/Build erfolgreich vor abschliessender reiner Hintergrundfarben-Korrektur; lokale Browserprüfung bestätigt vier GEO-Kacheln, KPI-Konturen, geöffnete Erklärung und transparente Info-Buttons. Keine Veröffentlichung.

### 30.09.2026 – Website-Bereiche und Vormonatsvergleich
- Navigation: Kompetenzfelder, Services, Blogartikel, Newsartikel, Blick hinter die Kulissen, Vorstellungsseiten, Customer Stories, Videos, Kampagnen.
- Kompetenzfelder entsprechen exakt den fünf Hauptseiten der aktuellen sonio.com-Navigation. Services erfasst die Sitemap-Pfade unter /services/, Videos /video und Unterseiten. DE/FR bleiben getrennt; Sprachfilter ergänzt. Dauerhafte Bereiche starten mit «Alle», damit ältere Veröffentlichungen nicht verschwinden.
- Lesender Live-Abgleich: fünf deutsche Kompetenzseiten und 27 deutsche Services-Seiten lieferten GA4-Kennzahlen; Videoseiten ebenfalls abgefragt. Bestehende API/Worker/Scheduler-Gruppe geordnet neu gestartet, keine zusätzliche Gruppe.
- Seitengesamtstand bleibt seit Veröffentlichung. Separater Vergleich: aktueller Kalendermonat bis heute gegen Vormonat; bei laufendem Teilmonat gleich lange Vorperiode, bei abgeschlossenem Monat vollständiger Vormonat. Fehlende Werte bleiben fehlend; null Vorwert ergibt keine Prozentquote. Monatswerte werden unabhängig vom Veröffentlichungsfilter abgefragt.
- 11 gezielte GA4-Bereichstests bestanden, Ruff für geänderte Bereichslogik/Tests sowie TypeScript und Frontend-Build erfolgreich (bestehende Bundle-Warnung). Kompetenzfelder live im Browser mit fünf Karten und September/August-Vergleich geprüft.

### 30.09.2026 – Kompakte Services und Unterbereiche
- Services-Karten stellen Monatswerte samt Vormonatstendenz kompakt dar; Gesamtstand seit Veröffentlichung ist aufklappbar. Keine Bilder in den Einzelkarten.
- Filter entsprechend sonio.com: Alle, Consulting, Professional Services, Support Services, Sonio Cloud, Managed Services. Unterseiten zählen exakt nach Pfadpräfix; DE/FR bleiben über den Sprachfilter verfügbar. Historischer Sonio-Cloud-Pfad ebenfalls unter Sonio Cloud, nicht doppelt unter Managed Services.
- Live-Browser: 27 deutsche Seiten aufgeteilt in 4/3/4/2/14; Consulting-Filter zeigt die vier passenden Seiten. Aufklappen der Gesamtwerte und TypeScript-Prüfung erfolgreich.

### 30.09.2026 – Empfehlungen als gemeinsamer Seitenabschluss
- Übersicht, Kanalverzeichnis, LinkedIn Organic, YouTube, Video Insights und Analytics: zwei Empfehlungskacheln unmittelbar vor dem bestehenden Zitat. LinkedIn Ads erhält denselben Empfehlungsabschluss.
- Zentrale Empfehlungsquelle priorisiert vorhandene Analyse-/Kennzahlenhinweise; fehlende Einträge werden ausschliesslich mit ausdrücklich gekennzeichneten Gestaltungsbeispielen ergänzt. Keine neuen KI-Ergebnisse vorgetäuscht.
- Empfehlungsseite zeigt vier bis sechs Einträge pro Kanal; Weiterleitung aus einem Kanal setzt den entsprechenden Filter, «Alle Kanäle» bleibt erreichbar. Bezugsmonat ist am Teaser sichtbar.
- TypeScript und Produktionsbuild erfolgreich; bestehende Bundle-Grössenwarnung. Desktopansicht mit zwei blauen Karten vor dem Zitat geprüft.

### 2026-09-30 — Mailchimp Marketing-Ansicht
- Bestehende Mailing-Gruppierung/Filter erhalten. Neues Leitbild aus dem neuesten Mailing, vier Haupt-KPIs (Zugestellt, Klickende, Klickrate, Abmelderate), Infoboxen, zweispaltige Mailing-Kacheln, aufklappbare Zustell-/Öffnungswerte, Wissensbereich, zwei Empfehlungen vor gemeinsamem Zitat.
- Summen nur bei vollständigen Kennzahlen; Quoten nach Zustellungen gewichtet. Auswahl umfasst zugehörige Sendungen auch ausserhalb des Versandmonats, klar beschriftet. Keine kanalübergreifend eindeutigen Personen behauptet.
- Neuer geschützter Mailchimp-Insights-Endpunkt: paginierte Linkberichte, Top 3 nach Klickenden, keine Subscriber-Daten. Link-Query/Fragment werden vor Ausgabe entfernt. Bot-Filterstand ausdrücklich unbekannt.
- GA4-Zuordnung nur bei Sonio-Link mit `utm_medium=email` und eindeutiger Mailchimp-ID im Kampagnennamen; keine Titelähnlichkeits-Heuristik. GA4-Sitzungen/engagierte Sitzungen separat seit Versand, fehlende Berichtszeilen bleiben fehlend.
- Live gelesen: neuester Swiss-IT-Forum-Resend ohne geklickte Links; Zoo-Dankesmailing Top 3 mit 62/31/4 Klickenden. Beide ohne eindeutige UTM-Kennung, deshalb keine zugeschätzten Website-Besuche.
- 14 gezielte Backendtests bestanden; TypeScript und Vite-Build bestanden (bestehende Chunk-Grössenwarnung). Desktop-Browser: echte Mailingwerte, Bilder und Linkdetails geprüft, kein Seitenüberlauf.
- Übersicht: Kanal-Kacheln in zwei dunkleren Blautönen von hellen KPI-Flächen abgegrenzt. Kein Deployment.
- Mobile390 im Browser geprüft: einspaltige Mailing-Kacheln, Dokumentbreite383px, kein horizontaler Überlauf. Infobuttons öffnen nun auch beim ersten Tippen/Klick statt durch Fokus und Klick sofort wieder zu schliessen.
- Mailchimp-Bildkorrektur: gemeinsamer Sonio-Hero ohne separate Abdunklung; Mailingbilder ohne feste Bildhöhe im Original-Seitenverhältnis. Drei geladene Bilder im Desktop-DOM auf unverzerrte Proportionen geprüft und Screenshot bestätigt; TypeScript erfolgreich.

### 2026-09-30 — Gesamter Stand vor GitHub-Sicherung
- 101 Backendtests auf isolierter temporärer SQLite-Testdatenbank bestanden; keine Vorschau-/Produktionsdatenbank verwendet.
- 24 Frontendtests, TypeScript und Vite-Produktionsbuild bestanden. Bestehende Bundle-Grössenwarnung sowie zwei Testclient-Deprecation-Warnungen bleiben.
- Ruff-Importsortierung bereinigt; Backend-Lint erfolgreich. Offene Dateien gegen lokale Geheimniswerte und gängige Credential-Muster geprüft, keine Treffer. `.env` und `.local/` bleiben ignoriert.
- Zielbranch `design/sonio-dashboard-login`. Branch-Push ist kein Deployment der GitHub-Pages-Demo auf `main`; Remote-CI und Containerprüfung sind getrennt zu bestätigen.

### Übersicht-Monatsauswahl und erneuter Datenabgleich Anfang Oktober 2026
- Übersicht folgt jetzt dem gewählten Monat statt ihn auf den laufenden Monat zu erzwingen. Kompaktes Dropdown für die letzten zwölf Monate; Kennzahlen, Vergleich, Empfehlungen und CSV verwenden denselben Berichtsmonat. TypeScript erfolgreich, Browserwechsel Oktober → September verifiziert.
- Manueller Gesamt-Sync erfolgreich abgeschlossen; Analytics, LinkedIn Organic/Ads, Mailchimp und YouTube aktualisiert. YouTube-Veröffentlichungscache 2026 separat erneuert: 13 Videos im Jahr, eines im Oktober. Tagesstatistik der YouTube-API zuletzt bis 29.09.; kein Ersatz fehlender Oktoberwerte durch Lifetime-Zahlen. Mailchimp letzter Versand am 18.09.; Oktoberübersicht deshalb ohne Mailchimp-Werte.
- Google Ads: OAuth mit persönlichem Gmail-Konto bei Kontoprüfung HTTP403 USER_PERMISSION_DENIED; kein Refresh-Token gespeichert. Ads-Oberfläche mit marketing@sonio.com zeigt Sonio 932-539-5786. Erneuter OAuth-Vorgang mit diesem Unternehmenskonto wartet auf Nutzer-Identitätsbestätigung. Noch keine erfolgreiche Ads-Anbindung behauptet.

### Google Ads – Verbindung bestätigt am 02.10.2026

- Anmeldung mit marketing@sonio.com abgeschlossen; der OAuth-Helfer hat den Zugriff auf Sonio-Werbekonto 932-539-5786 über die API verifiziert und den separaten Ads-Refresh-Token lokal gespeichert.
- Bestehende lokale API, Worker und Scheduler kontrolliert beendet und mit aktualisierter Konfiguration neu gestartet; keine parallelen Worker gestartet.
- Sync-Job fa5bbafb-7776-4f4d-8aea-b745aec6e476 erfolgreich abgeschlossen: 128 Tagesmesswerte für September und den laufenden Oktober 2026. ChannelState `connected`, letzter Erfolg 02.10.2026 07:29 UTC.
- September: 90'080 Impressionen, 3'067 Klicks, CHF 1'331.29 Ausgaben. Oktober bisher: 2'749 Impressionen, 83 Klicks, CHF 45.86 Ausgaben. Import enthält auch vom Werbekonto gemeldete Conversions; diese sind keine automatisch bestätigten Leads oder Verkäufe.
- API-Abruf und Datenbankimport geprüft. Keine neue Frontend-Implementierung und kein öffentliches Deployment. Google-OAuth-Testmodus bleibt eine Betriebsgrenze.

### Google-Ads-Cockpit – 02.10.2026

- Neue geschützte Kampagnenansicht im bestehenden Sonio-Design: vier Hauptkennzahlen, Klick-/CTR-Rankings mit Bildvorschau bei Hover und Tastaturfokus, Zweierspalten, aufklappbare KPI-Details, Monats-/Typfilter, Empfehlungen und vorhandene EditorialQuote-Komponente.
- Eigener lesender `/api/google-ads/campaigns`-Endpoint; strikt Konto 9325395786, serverseitiger Monatsfilter und einstündiger Cache mit letztem erfolgreichen Stand bei Abruffehlern. Keine zusätzlichen Metric-Zeilen, daher keine Doppelzählung des bestehenden Imports.
- September live geprüft: 80 bekannte Kampagnen, elf mit Auslieferung. 3'067 Klicks, CHF 1'331.29 Kosten stimmen mit dem Kontoimport überein. Zehn Performance-Max-Kampagnen haben zugeordnete Bild-Assets; eine Suchkampagne echte Textbausteine. Motive als Beispiele gekennzeichnet, keine Behauptung einer exakt ausgespielten Anzeigenkombination.
- CSV enthält gefilterte Kampagnen, Zeitraum, Währung und Abrufstand. Bestehendes CSV-Escaping genutzt. Demo fragt keine echten Kampagnendetails ab.
- Zwei Regressionstests bestanden (Kennzahlen/Asset-Zuordnung und falsches Konto), Ruff, TypeScript und Vite-Build bestanden; bestehende Bundle-Grössenwarnung. Browser: Daten, Bilder (zehn geladen), Desktop und mobile Breite 390 ohne horizontalen Überlauf geprüft.
- Offen: fachliche Conversion-Ziele prüfen; keine Aussage über qualifizierte Leads. Such-Impression-Share und GA4-Kampagnenqualität sind noch nicht Teil dieses ersten Entwurfs. Keine Veröffentlichung vorgenommen.

### Search Console – Zugang bestätigt am 02.10.2026

- API searchconsole.googleapis.com im bestehenden Projekt sonio-insights aktiviert; ausdrücklich freigegebener Scope webmasters.readonly mit marketing@sonio.com autorisiert.
- scripts/search_console_oauth.py prüft ausschliesslich sc-domain:sonio.com vor Speicherung. Separater GSC_REFRESH_TOKEN und GSC_SITE_URL in lokaler .env (0600); bestehende Provider-Tokens bleiben erhalten. OAuth-State, PKCE und HttpOnly-Loopback-Cookie wie beim bestehenden Helfer.
- Token-Erneuerung und Search-Analytics-Abfrage live geprüft: Websuche, 01.–30.09.2026, dataState=final: 734 Klicks, 10'021 Impressionen, CTR 7.3246 %, durchschnittliche Position 11.2464. Suchbegriffsabfrage mit Testlimit zehn lieferte zehn Zeilen; kein vollständiger Import behauptet.
- Noch kein Search-Console-Dashboard, Scheduler-Import oder Keyword-Vorschlagsmodul umgesetzt. Google-Testmodus bleibt bestehen.

## 2026-10-02 – Suchbegriffe & Potenziale
- Eigener Navigationspunkt und Verweise aus Google Ads/Analytics. Geschützter
  Endpoint `/api/search-insights`, Quellen organic/paid/keywords strikt getrennt,
  Monatscache eine Stunde, manuelle Erneuerung und letzter Stand bei Fehlern.
- September live abgerufen: 659 organische Suchbegriffe, 538 bezahlte
  Suchanfragezeilen, vier Keyword-Zeilen. Suchanfragen sind nicht vollständig:
  Google-Datenschutz und Berichtslimits; Anteile beziehen sich auf sichtbare
  gefilterte Zeilen. Property-Summen werden nicht mit Query-Summen vermischt.
- Sonio-Domain und Ads-Konto fest begrenzt. GSC verwendet separaten Refresh-Token;
  Google-App im Testmodus bleibt eine Betriebsgrenze. Keine Kampagnenänderungen.
- Monats-/Text-/Marken-/Kampagnentypfilter, Rankings mit Hover und Tastaturfokus,
  Infoboxen, Detailtabelle, CSV und regelbasierte Prüfkandidaten. Keine KI-Analyse
  und noch keine Keyword-Planner-Ideen/Suchvolumen. Kein geplanter Hintergrundjob
  für diese Detailberichte; Abruf bei Aufruf beziehungsweise manueller Erneuerung.
- Zwei isolierte Backendtests bestanden (Property-/Query-Trennung, Kosten und
  fraktionale Conversions, falsches Ads-Konto abweisen). Ruff und TypeScript/Vite
  bestanden; bestehende Chunkgrössenwarnung bleibt.
- Browser: organische und bezahlte Daten sichtbar, Textfilter/Leerzustand geprüft,
  Ranking-Tooltip per Tastatur sichtbar. Desktop und 390px ohne Seitenüberlauf;
  Detailtabelle horizontal scrollbar. Lokale geschützte Ansicht, kein Deployment.

## 2026-10-02 – Übersicht als Einstieg
- Obere Monatskennzahlen mit erklärenden, per Hover/Fokus/Klick erreichbaren
  Infoboxen und kräftigeren blauen Flächen. Untere Kanalkacheln zeigen ergänzende
  Kennzahlen, niemals erneut den konfigurierten Primärwert; fehlend bleibt fehlend.
- Direkte Einstiege zu Video Insights, Suchbegriffen und Empfehlungen. Neueste
  importierte Veröffentlichung aus geschützter Video-Library nach Zeitstempel,
  unabhängig vom KPI-Monat: Originalvorschau, Titel, Plattform und Datum. In Demo
  keine echte Library-Abfrage. Fehler/Leerzustand statt erfundener Vorschau.
- Browser bestätigt neuestes importiertes Video vom 1.10.2026, Vorschaubild geladen,
  Infobox sichtbar und alle drei Weiterleitungen erfolgreich. Desktop und 390px
  ohne horizontalen Seitenüberlauf. TypeScript und Vite bestanden (bekannte
  Chunkgrössenwarnung). Kein öffentliches Deployment.

## 2026-10-02 – Themencluster für Suchbegriffe
- Acht auswählbare Themenkacheln mit Klicks und Impressionen. Alle Themen bleibt
  verfügbar; Ranking, Kennzahlen, Potenziale und CSV folgen der Auswahl.
- Konservative DE/FR/EN-Regeln anhand des Suchbegriffs, keine Ableitung aus dem
  Kampagnennamen. Fachthemen vor Marke/generischem Service; mehrdeutige und
  unbekannte Begriffe bleiben unter Weitere. Eine Zuordnung pro Zeile.
- Details zunächst zehn Zeilen, um jeweils zehn erweiterbar. CSV enthält Thema.
- Zwei Regressionstests für Sprachvarianten, Prioritäten, Mehrdeutigkeit und
  Summenerhaltung bestanden. TypeScript und Vite bestanden (Chunkwarnung bleibt).
- Browser: September organisch 659 Zeilen; Cloud-Auswahl 52 Zeilen und passende
  Kennzahlen, Erweiterung 10 auf 20, Alle-Themen-Rückkehr geprüft. Mobile 390px
  ohne Seitenüberlauf. Kein öffentliches Deployment.

## 2026-10-02 – Suchansicht: Struktur und Einordnung
- Filter in Zeitraum/Aktionen, Quelle und Eingrenzung gruppiert. Themenflächen
  wechseln zwischen Sonio-Blau, Dunkelblau und Weiss; Kennzahlen/Ranking ruhiger.
- Potenzialtexte explizit hell auf dunklem Grund, mit zusätzlichem Prüfschritt.
- Auswählbare Lesehilfe für Sichtbarkeit, Interesse und Position/Ergebnis;
  Bedeutung und mögliche nächste Prüfung getrennt, keine Ursachenbehauptungen.
- Neues Such-Zitat von Lucy Sinclair und Debadeep Bandyopadhyay, Originalquelle:
  https://business.google.com/uk/think/marketing-strategies/spot-intent-in-searches/
- TypeScript und Vite erfolgreich (bestehende Chunkwarnung). Desktop visuell,
  Lesehilfe per Klick und 390px ohne Seitenüberlauf geprüft. Kein Deployment.

## 2026-10-02 – Empfehlungen: zusätzliche Bereiche
- Suchbegriffe & Potenziale sowie Video Insights als eigene Auswahl und Abschnitte
  mit je vier explizit gekennzeichneten redaktionellen Beispielen ergänzt.
  Keine datenbasierte oder KI-generierte Analyse für diese Beispiele behauptet.
- Direkte Navigation aus den Abschnitten zur jeweiligen Detailansicht; Modal
  erhält den korrekten Bereichsnamen. Bestehende Kanalempfehlungen bleiben erhalten.
- TypeScript/Vite bestanden, Suchbereich mit vier Kacheln im Browser verifiziert.

## 2026-10-02 – Gemeinsame Designharmonisierung
- Zentrale Flächenrollen für KPI-Kacheln, Empfehlungen, Filter, Navigation,
  Aktionsgruppen und Infoboxen; Sandakzent ergänzt die Sonio-Blautöne.
- Browserstichproben Empfehlungen, Übersicht, Google Ads und YouTube. Sandkacheln
  und aktive Filter sichtbar, KPI-Infobox geprüft; rechtsbündige letzte KPI-Box
  korrigiert. YouTube bei 390px ohne Seitenüberlauf, Aktionen nebeneinander.
- TypeScript/Vite erfolgreich; vorhandene Chunkwarnung bleibt. Kein Deployment.
- Kein vollständiger Test sämtlicher Zustände aller Seiten. Zitatwechsel und
  Branson-Porträt sind nicht Teil dieses Durchgangs.

### 2026-10-02 — Einheitliche Zitate und Porträts
- Gemeinsames Layout in editorial-quote.css konsolidiert, widersprüchliche ältere Quote-Overrides entfernt. Porträts per CSS monochrom, 72 × 88 px Desktop / 60 × 76 px Mobile, Seitenverhältnis durch object-fit erhalten.
- Quellen durch Autor-Link mit erklärendem Titel erreichbar; doppelte Quellenzeile neben Berufsbezeichnung entfernt.
- Browser: alle 14 Inhaltsseiten jeweils mit einem Zitat und geladenem Porträt geprüft. Datenquellen, Team & Zugänge, Einstellungen: jeweils kein Zitat.
- Mobile 390 px: Kanäle und längeres Reports-Zitat visuell geprüft, kein Überlauf des Zitatblocks. Desktop-Viewport anschliessend wiederhergestellt.
- TypeScript-Build bestanden. Keine Daten-, Authentifizierungs- oder Deploymentänderung.

### 2026-10-02 — GitHub-Sicherung des Tagesstands
- Backend: 105 Tests bestanden, isolierte temporäre Testdatenbank; zwei bestehende Deprecation-Warnungen.
- Frontend: 26 Tests bestanden; TypeScript und Vite-Produktionsbuild bestanden (bestehende Chunk-Grössenwarnung).
- Ruff: bestanden. 52 geänderte/neue Dateien vor Commit auf Übereinstimmungen mit lokalen Geheimnissen und private Schlüssel geprüft, keine Treffer. .env und .local bleiben ausgeschlossen.
- Sicherung auf design/sonio-dashboard-login; kein Pages-Deployment beauftragt.
# Aktualisierungsdiagnose – 05.10.2026

## Wiederverbindung abgeschlossen (später am 05.10.)
- Neuer admin-/CSRF-geschützter lokaler Wiederverbindungsablauf im Dashboard.
- Live über die Oberfläche geprüft: GA4-Sonio-Property und YouTube-Sonio-Kanal erneut bestätigt. Beide automatisch angelegten Sync-Aufträge `completed`; GA4 105 und YouTube 93 Messwerte geladen, YouTube-Jahresvideothek ebenfalls geladen. Kein manueller Neustart nach Tokenrotation.
- 112 Backend- und 28 Frontend-Tests erfolgreich; TypeScript, Ruff und Vite-Build erfolgreich. Bestehende Bundle-Grössenwarnung bleibt.
- Desktop: Fehlermeldung, letzter Datenstand, Startlink und erfolgreicher automatischer Zahlenwechsel im Browser geprüft. Testmodus unverändert; Freigaben können erneut ablaufen.
- Vorherige Diagnose und damalige offene Freigabe unten dokumentieren den Verlauf; sie sind durch diesen bestätigten Erfolg ersetzt.

- Google-Token-Endpunkt meldet für GA4 und YouTube `invalid_grant` (abgelaufen oder widerrufen); keine Geheimnisse protokolliert. Erneute Autorisierung ist noch erforderlich. Testmodus ist der zuletzt dokumentierte Zustand, nicht erneut in der Cloud-Konsole bestätigt.
- Lokale Importzustände: Mailchimp, Google Ads, LinkedIn Ads und Organic-Basiswerte am 05.10. erfolgreich; LinkedIn-Postdetails zuletzt durch HTTP 429 begrenzt.
- Zentraler Aktualisierungsabschluss invalidiert jetzt auch YouTube-, Video-, Analytics-Detail-, Google-Ads- und Suchabfragen. Cachefähige Detailendpoints umgehen nach manueller Aktualisierung ihren Servercache einmal pro URL; Warnungs-Fallbacks gelten nicht als frischer Abruf.
- Google-Tokenfehler erhält eine konkrete, geheimnisfreie Wiederverbindungsanweisung. Backend-Änderung benötigt Neustart der laufenden Prozesse.
- Geprüft: 18 Connector-Tests, 8 Frontend-API-Tests, TypeScript und Ruff erfolgreich. Kein erneuter erfolgreicher GA4-/YouTube-Liveabruf behauptet; Produktions-OAuth/Hosting noch nicht eingerichtet.

### 2026-10-05 — Events und Zoom-Archiv
- Acht Forms-Formulare mit 432 Antworten, 118 Sonio und 43 Partnern aggregiert; 271 unzugeordnet. Keine personenbezogenen Antwortdaten gespeichert.
- Sieben erhaltene Zoom-Aufzeichnungen seit 2024 integriert. Keine vollständige historische Abdeckung oder automatische Synchronisierung behauptet.
- Sechs gezielte Backendtests, Ruff, TypeScript und Vite-Build erfolgreich (bestehende Chunk-Warnung).
- Browser: Quellen-/Jahresfilter, Forms-Bilder und Gruppensummen geprüft. Mobile 390 px ohne horizontalen Überlauf; Viewport zurückgesetzt.
- Nach Nutzerfeedback Eventbilder randlos im Format 16:9 mit zentriertem Ausschnitt; Desktop-Darstellung visuell bestätigt.

### 2026-10-05 — Freigabe zur GitHub-Veröffentlichung
- 118 Backendtests und 28 Frontendtests bestanden; Ruff und TypeScript erfolgreich.
- Statischer Pages-Build mit VITE_STATIC_DEMO=true und Repository-Basispfad erfolgreich; bestehende Bundle-Grössenwarnung.
- 23 geänderte/neue Dateien gegen lokale Geheimniswerte geprüft, keine Treffer. .env und .local bleiben ausgeschlossen.
- Events in der öffentlichen Demo ohne echte Anmeldezahlen; Google-Wiederverbindung ausschliesslich im geschützten Workspace.

## 05.10.2026 – Zoom-Berichtsverbindung
- Server-to-Server OAuth aktiviert; Tokenaustausch und sechs Monatsabfragen live erfolgreich.
- Expliziter Webinarfilter: 01.05.–05.10.2026 liefert null Webinare. Ältere API-Abfrage mit Code 300/sechsmonatigem Fenster abgelehnt; sieben Archivwebinare unverändert erhalten.
- Backend-Gesamtsuite: 121 Tests erfolgreich; danach zwei zusätzliche Regressionstests für Fehlererhalt und Admin/CSRF ergänzt, alle fünf Zoom-Tests erfolgreich. Zwei bestehende Starlette-Deprecation-Warnungen.
- Ruff, TypeScript und Produktionsbuild erfolgreich; bestehende Chunkgrössen-Warnung.
- Geschütztes Dashboard zeigt Zoom-Abrufstand und getrennten manuellen Forms-Stand. Keine Teilnehmerlisten, keine Geheimnisse in Artefakten.

## 05.10.2026 – Vergleichbare Monatsstände (Review F01, erster Schritt)
- Monatssummen bleiben erhalten; separate Vergleichswerte und Zeiträume je Kennzahl verhindern den Vergleich einer Teilperiode gegen einen längeren Vormonat.
- Sieben neue Regressionstests: 3 gegen 5 Tage, innere Datenlücken, echte Nullen, fehlende Vorperiodentage, leere/verkürzte Importe, Nullkorrektur, Monatslängen/Jahreswechsel. Alle bestanden.
- Gesamtsuite vor finaler AI-Validierungskorrektur: 128 bestanden, ein Bestandsfall fehlgeschlagen; nach Rücknahme der zu strikten Referenzsperre gezielt erfolgreich. Bestehende zwei Starlette-Warnungen. Frontend: 28 Tests, TypeScript und Build bestanden (bekannte Chunkgrössen-Warnung).
- Browser: geschützte Übersicht zeigt YouTube 1.–2. Oktober gegen 1.–2. September samt Abrufdatum; Desktop-Info geprüft. Mobile 390px ohne Seitenüberlauf, Tooltip-Verankerung korrigiert.
- Datenreife bleibt eine explizite Grenze: explizite Tageszeilen + Ausschluss heute, bei GA4 drei Kalendertage Puffer sind eine konservative Regel, kein Beweis endgültiger Anbieterzahlen. Fehlende Nullzeilen werden nicht ergänzt.
- Abschlussprüfung nach Korrektur: gesamte Backend-Suite 130 bestanden, Ruff bestanden. Mobile Info-Box vollständig innerhalb des Bildschirms bestätigt; Viewport zurückgesetzt. Lokale API, Worker und Scheduler mit aktuellem Code neu gestartet.

### 05.10.2026 – Google Ads: Vormonatsvergleich der Hauptkennzahlen
- Zwei Backend-Tests und zwei neue Frontend-Vergleichstests bestanden; Ruff, TypeScript und Vite-Build erfolgreich. Bestehende Deprecation-/Chunkgrössenwarnungen bleiben.
- Geschützte lokale Ansicht mit Live-Abruf geprüft: 01.–04.10. gegen 01.–04.09., Klicks 255 gegen 294 (−13.27 %), Ausgaben CHF 145.39 gegen CHF 109.22 (+33.12 %). Momentaufnahme, keine festen Erwartungen.
- Filter «Suche» setzt bei unklarer Tagesabdeckung den Vergleich aus. Desktop-Infobox und Mobile-Ansicht ohne horizontalen Überlauf geprüft; vier Hauptwerte erhalten.
- Kein Push und keine öffentliche Veröffentlichung.

### 05.10.2026 – Einheitliche Farben für Veränderungswerte
- Nutzerentscheidung: numerische Zunahmen grün, Abnahmen rot, Null/fehlend neutral. Dies beschreibt die Richtung, keine pauschale Qualitätsbewertung (insbesondere Kosten).
- Zentrale Farbtokens mit hellen Hintergrundflächen für helle und dunkle Kacheln. Übersicht, Kanalverzeichnis, Google Ads, LinkedIn Organic, allgemeine KPI-Komponente und Analytics-Seitenvergleiche vereinheitlicht.
- Google Ads und LinkedIn live im Browser auf berechnete Farben geprüft, Mobile 390px ohne horizontalen Überlauf. TypeScript und Vite-Build erfolgreich; bestehende Chunkgrössenwarnung bleibt.
- Keine Datenberechnung oder Veröffentlichung geändert.

### 05.10.2026 – Analytics: leere Bereichsauswahl erklärt und vereinfacht
- Ursache im geschützten Browser verifiziert: Blogartikel starteten im Veröffentlichungsmonat Oktober 2026 mit 0 Seiten; 56 Katalogseiten besitzen kein bestätigtes Veröffentlichungsdatum. Auswahl «Alle» liefert 150 Seiten (Sprachvarianten enthalten) mit Kennzahlen. Keine verlorenen Messwerte in diesem geprüften Fall.
- Alle Bereiche starten nun mit sämtlichen Veröffentlichungszeiträumen; Monat/Jahr bleiben explizit wählbar. Seitenselektor entfernt, Sprache und Service-Themen bleiben. Zehn Karten plus «Weitere Seiten» erhalten.
- Status zeigt Anzahl Seiten, sichtbare Karten, Seiten mit Kennzahlen und Abrufstand. Leere Ergebnisse unterscheiden Zeitraum von Sprache/Service-Filtern, mit direktem Zurücksetzen. Katalog- und Kennzahlenwarnungen bleiben getrennt sichtbar.
- Oktober-Leerzustand und Rückkehr zu «Alle» im Browser geprüft. Kein Seitenselektor mehr vorhanden; Mobile 390px ohne horizontalen Überlauf. TypeScript und Build bestanden; bestehende Chunkgrössenwarnung. Keine Veröffentlichung.

### 05.10.2026 – Review F02 Event-Summen
- Backend: 134 Tests bestanden, inklusive Eventdatum, bevorstehende Events,
  unbekannte Werte/echte Null, Teilabdeckung, Duplikate, Legacy-Doppelzählung und
  Gleichheit zwischen gefiltertem Eventendpoint und Dashboard.
- TypeScript und Vite-Build bestanden; bestehende Chunkgrössenwarnung bleibt.
- Browser: Übersicht Oktober und Eventfilter Oktober zeigen übereinstimmend
  10 Formularantworten; Eventgruppen 6 Sonio/1 Partner, Kunden unbekannt.
- Keine Veröffentlichung, kein Reportversand und kein echter KI-Aufruf.

### 05.10.2026 – Kunden-Restgruppe und Testformular
- 16 Event-/Zoom-/Aggregations-Tests bestanden; neue Regel inkl. Vorrang
  importierter Werte, fehlender Eingänge, echter Null, negativem Rest und
  Übereinstimmung zwischen Endpoint und Dashboard geprüft. TypeScript bestanden.
- Nutzerbestätigtes Testformular lokal mit vorheriger Sicherung entfernt.

### 2026-10-05 — F03, erster Benchmark-Schritt (GA4)
- Sonio-Property 358384645 im angemeldeten GA4 geprüft: Benchmarking aktiviert,
  ausgewählte Vergleichsgruppe «Unternehmenstechnologie». Keine Einstellungen geändert.
- Geschützte Analytics-Ansicht: schmale Benchmark-Zeile unter Haupt-KPIs,
  eine gemeinsame Infobox und externer GA4-Link. Keine zusätzlichen KPI-Kacheln,
  keine numerischen Branchenwerte und keine automatische Erfolgsbewertung.
  In Demo ausgeblendet. GA4-Zeitraum muss separat ausgewählt werden.
- Offizielle Benchmark-Dokumentation: https://support.google.com/analytics/answer/16388466?hl=de
  Median und 25.–75. Perzentil dienen als Orientierung, nicht als Ziel.
- Data API Schema geprüft: https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
  Kein dokumentiertes Benchmark-Feld gefunden. Automatischer Branchenimport ist
  NICHT umgesetzt; der Link ist Zugang zur GA4-Auswertung, kein Datenimport.
- TypeScript und Vite-Build erfolgreich; bestehende Warnung zu Bundle >500 kB.
  Browserprüfung Desktop und 390 px: Infobox sichtbar, mobile Tooltip-Grenzen
  innerhalb Viewport, kein horizontaler Seitenüberlauf. Escape schliesst Tooltip.
- Mailchimp-Benchmarks auf Nutzerwunsch zurückgestellt (Kontaktqualität unklar).
  Weitere Kanäle werden schrittweise geprüft, keine pauschalen Branchenziele gesetzt.

### 2026-10-05 — Numerische Referenzen Organic/Ads (ersetzt GA4-Schritt)
- Nutzer verwirft GA4-Zugang ohne Zahl. Entfernt. Numerische Referenzen und Grenzen
  in BENCHMARKS.md dokumentiert; keine Zielwerte oder neue automatisierte Bewertung.
- TypeScript und Vite-Build bestanden (bestehende >500 kB Bundle-Warnung).
- Zwei Regressionstests bestanden: Ziel/Typ/Währung/Klickdefinitionen korrekt
  getrennt; interner Median schliesst unbekannte Werte aus, behält echte Nullen.
- Live-Browser: Organic 5.20 % Referenz unter Engagement-Rate; LinkedIn-Awareness
  CPM-Referenz CHF 10.12 unter tatsächlichem CPM, keine Traffic-CTR an dieser Kampagne.
  Google Ads Referenz 6.10 % bei zwei SEARCH-Kampagnen, keine bei PMax.
- Gemeinsamer Referenzdialog Desktop visuell geprüft; bei 390 px links20/rechts370,
  schliessbar, keine Vergrösserung benachbarter Kacheln. Organic Mobil kein horizontaler
  Seitenüberlauf. Keine Veröffentlichung/kein Push in diesem Schritt.

### 2026-10-05 — LinkedIn Lead-Kampagnen vorbereiten
- Live-Finder Konto 514253005: fünf bestehende Kampagnen, keine neue Lead-Kampagne
  geliefert. Keine Kampagne angelegt oder aktiviert; nichts als Ersatz erfunden.
- Regulärer 365-Tage-Import mit oneClickLeads/oneClickLeadFormOpens erfolgreich:
  Status connected, fünf Kampagnen, 20 Lead-/Öffnungs-Tagesmesswerte gespeichert.
  Das ist eine Feldverfügbarkeitsprüfung, kein Nachweis einer neuen Lead-Kampagne.
- 13 LinkedIn-Ads-Tests bestanden, darunter explizite 0 vs. fehlend, Trennung von
  Website-Conversions und zukünftiger LEAD_GENERATION-Entwurf ohne Messwerte.
  Ruff, TypeScript und Vite-Build bestanden; bestehende Bundle-Warnung >500 kB.
- Lokale API/Worker/Scheduler kontrolliert neu gestartet. Browser zeigt fünf reale
  Kampagnen und neue Lead-Kennzahlen in gemeinsamer Erklärung. Bestehendes fiktives
  Beispiel unverändert erhalten. Lead-Karten live erst nach API-Lieferung prüfbar.

## 2026-10-05 – Reports als Inhaltsvorschau

- TypeScript-Projektprüfung und Vite-Produktionsbuild erfolgreich; bestehender Hinweis auf grosse Bundles bleibt.
- Lokaler geschützter Browser: GL-, Sales- und Marketing-Auswahl geprüft. Marketing zeigt vier ausdrücklich illustrative Empfehlungen direkt nach dem Monatsrückblick. Bestehendes Archiv mit August/September sichtbar. Keine Speicherung oder Zustellung ausgelöst.
- Mobile 390px: Sales und Marketing ohne horizontalen Überlauf (clientWidth = scrollWidth = 383); Desktop-Header und Auswahl visuell geprüft. Viewport danach zurückgesetzt.
- Originalbild und bestehendes Zitat erhalten. Drei neue Perspektiven sind noch keine automatisch erzeugten oder exportierten Zielgruppenreports.

### Reports – befüllte Kapitel und gestalterische Verfeinerung
- Zwei Regressionstests für fehlend/null, bestätigte Null, veraltete Vergleiche, Null im Nenner und Eventbestände bestanden; TypeScript und Vite-Build erfolgreich.
- Geschützte Reports-Ansicht: aufklappbare Kapitel, reale Kennzahlen und Lesehilfen sichtbar. Desktop und Mobile 390 geprüft, kein horizontaler Überlauf. Bestehende Bildwelt, Schrift und Archiv erhalten.

### 2026-10-05 – Visueller Sales-Report und Vorstellungsfilme
- 17 Tests in test_ga4_content/test_linkedin_ads bestanden, inklusive Service-/Profilseiten und strikter Monatsbegrenzung von LinkedIn-Klicks. Ruff, TypeScript und Vite-Build erfolgreich (bekannter Bundlegrössenhinweis).
- Live im geschützten Browser: Oktober-Website-Ranking geladen, Google Ads mit Kampagnenbildern und Klicks (Datamanagement 58). Fitim 3, Kutay 4, Harald 1 Monats-Seitenaufrufe; keine Ersatzwerte für fehlende Seitenmessungen.
- Desktop und 390px geprüft, kein horizontaler Überlauf. Fünf Videoplayer mit Originalpostern vorhanden. Lokale API/Worker/Scheduler kontrolliert neu gestartet. Kein Deployment.

### Sales: Organic statt Ads, Vergleich an Vorstellungsvideos
TypeScript/Vite-Build erfolgreich. Browserprüfung: LinkedIn-Organic-Beitrag mit 14 Klicks, Bild und Original-Link; Providerwarnung HTTP 429 sichtbar, letzter importierter Stand bleibt erhalten. Videokarten Oktober/September jeweils bis 5.: Fitim 3/2, Kutay 4/1. Werte nebeneinander und ohne Verschiebung geprüft.

Sales-Vorstellungsvideos auf Monat/Gesamt umgestellt: TypeScript erfolgreich; Browser zeigt echte Gesamtwerte Fitim 351, Kutay 181, Harald 54, Paddy 48, Roman 14. Vormonatsanzeige entfernt.

### GL-Report visuell – 2026-10-05
- TypeScript und Vite-Build erfolgreich; bestehender Bundlegrössenhinweis. Zwei Report-Evidence-Regressionstests bestanden.
- Browser: echte Oktoberwerte sichtbar (314 Sitzungen, 1554 LinkedIn-Impressionen, CHF 174.05 Google-Ads-Ausgaben), Diagrammwechsel Website/LinkedIn geprüft, Bildhighlight Full Service Provider statt Support.
- Desktop und Mobile 390 geprüft; kein horizontaler Überlauf. Keine neue KI-Analyse oder Reportzustellung erzeugt.

### GL-Hover-Vergleich – 05.10.2026
TypeScript und Regressionstest für Tagesvergleiche bestanden. Browser zeigt 4. Oktober: 22 Website-Besuche gegenüber 62 am 4. September, −64.52 %. Vorwert null/fehlend, veraltete Werte und laufender Tag werden nicht prozentual bewertet. Positive/negative Veränderungen als grüne/rote Schrift.

GL-Events und kontextbezogene Hinweise: TypeScript bestanden. Geschützter Browser zeigt VMware Cloud Foundation am 29.10.2026 mit Originalbild und 10 Formularantworten / 3 Kunden / 6 Sonio / 1 Partner. Drei Hinweise mit aktuellen Daten und konkreten nächsten Schritten sichtbar geprüft.

### Marketing-Hub – 05.10.2026
TypeScript, Vite-Build und drei Reporttests bestanden (bekannter Bundlegrössenhinweis). Geschützte Browserprüfung: Monatskennzahlen, Kanalwechsel per Maus/Tastatur, Website-/LinkedIn-/YouTube-Originalbilder und Eventkarte sichtbar. Keine Newsletter-Messwerte für Oktober werden erfunden; LinkedIn HTTP429 bleibt sichtbar. 390px geprüft, scrollWidth=clientWidth=383, kein horizontaler Überlauf. Desktopansicht wiederhergestellt. Keine Veröffentlichung oder neue Agentenanalyse.

Report-Bildprüfung 05.10.2026: 123 vorhandene Sonio-Seitenpfade öffentlich geprüft, 99 Originalmotive gefunden. TypeScript bestanden. Browser: Sales-Startseite, Über Sonio, Karriere, Kontakt, fünf Kampagnenmotive sowie GL-Fachinhalt/Event und Marketing-Website/LinkedIn/YouTube mit erfolgreich geladenen Bildern verifiziert. Newsletter ohne Oktober-Mailing bleibt leer; nicht mit fremdem Motiv befüllt.

Marketing-Überlagerung: TypeScript erfolgreich. Browserauswahl aller drei Kanäle und beider Kennzahlen geprüft; Google/Organic-Linien vorhanden, fehlende LinkedIn-Ads-Messwerte ausdrücklich markiert. Kontrollgrössen nach visueller Prüfung kompakt korrigiert.

### GitHub-Sicherung 05.10.2026
Vor Commit: vollständige Backend-Suite auf separater temporärer Testdatenbank 139 bestanden; Frontend 35 bestanden; TypeScript, Vite-Build, Ruff und git diff --check erfolgreich. Bekannte Hinweise: Bundlegrösse und zwei Testclient-Deprecations. Geänderte Dateien auf bekannte Secret-Muster geprüft; .env und .local bleiben ignoriert. Sicherung auf bestehendem Design-Branch, kein Pages-Deployment.

### 06.10.2026 — LinkedIn-Empfehlungspilot
40 Frontend-Tests bestanden, darunter fünf neue Datenlogik-Prüfungen (fehlende/echte Nullwerte, veraltete Daten, konkrete Postreferenz, Videodurchschnitt, vergleichbare Impressionen). TypeScript und Vite-Build bestanden; bestehende Warnung zu Bundlegrössen >500 KB bleibt. Nach Text-/Layoutkorrektur fünf Pilottests und TypeScript erneut bestanden. Browser: Organic-Teaser, aufklappbare Details und LinkedIn-Filter der Empfehlungsseite mit echten Daten geprüft; Video mit 341 Aufrufen/Ø18,1 Sekunden als beobachtete Momentaufnahme. Mobil 390 px: einspaltig, kein horizontaler Überlauf (scrollWidth383). Kein Agent aktiviert, keine Veröffentlichung.

### 06.10.2026 — LinkedIn-Ads-Empfehlungen
Sechs neue Regressionstests bestanden: Demo-/Fehlerausschluss, Planung, fehlende vs. null Leads, plausible Abschlussrate, Awareness-/CTR-Kontext und historische Kampagnen ohne Messwerte. TypeScript, Vite-Build und diff-check bestanden; bestehende Bundlewarnung bleibt. Live-Browser: zwei Kanalhinweise, Weiterleitung in gefilterte Empfehlungsseite, fünf echte Kampagnenhinweise und aufklappbare Einordnung geprüft. 390px-Prüfung ohne horizontalen Überlauf (scrollWidth383). Keine Veröffentlichung, kein Agent aktiviert.

### 06.10.2026 — Google-Ads-Empfehlungspilot
Sieben Regressionstests bestanden (fehlende/Nullwerte, Warnungen, Anzeigentyp, CTR-Kontext, Suchanfragen und Ausschluss von Sonio-Markensuchen aus Ausschluss-Prüfhinweisen). TypeScript und Vite-Build bestanden vor abschliessendem Markenfilter; bestehende Bundlewarnung bleibt. Browser: echte Oktober-Kampagnen und Suchanfrage geladen, Filter Google Ads und aufklappbare Details visuell geprüft. 390px ohne horizontalen Überlauf (scrollWidth383). Keine Kampagnenänderungen, kein Agent, kein Deployment.

### 06.10.2026 — Analytics-Pilot / KI-Jahresstand
Vier neue Frontend-Logiktests und sechs GA4-Backendtests bestanden, TypeScript/Vite-Build/Ruff/diff-check bestanden (bestehende Bundlewarnung). Live GA4-Jahresabgleich und August–Oktober lesend geprüft. Copilot-Alias korrigiert und Caches versioniert. Dienste kontrolliert neugestartet, keine Zugangsdaten geändert. Browser bestätigt Jahresstand62 mit ChatGPT52/Copilot8/Perplexity2/Claude— sowie echte monatliche Analytics-Hinweise. Mobil390: kein Seitenüberlauf (scrollWidth383). Keine Publikation und kein Agent.

## 07.10.2026 – Google Ads Conversion-Aufschlüsselung
- Sechs gezielte Backendtests erfolgreich: Kampagnenbericht sowie Aufteilung,
  andere/ungeprüfte Aktionen, All-Conversions-Abgrenzung, Summenabweichungen und
  Duplikate/fehlende Zeilen. Disposable Tests ohne TEST_DATABASE_URL.
- Ruff für die geänderten Backenddateien, TypeScript, Vite-Build und diff-check
  bestanden. Bestehender Chunkgrössenhinweis im Build.
- Echter September-Abruf: 260 + 6,832938 = 266,832938, keine Aufschlüsselungswarnung.
- Browser September: 260 / 6.83 / 0; Filter Suche: 0 / 1.6 / 0; Details geprüft.
  Desktop und 390px-Mobilansicht geprüft; scrollWidth 383 bei innerWidth 390.
- Lokale API/Worker/Scheduler geordnet neu gestartet. Keine Veröffentlichung.

## 07.10.2026 – Prüfung vor GitHub-Sicherung
- Gesamte lokale Backend-Suite: 145 Tests bestanden, zwei Deprecation-Hinweise.
  TEST_DATABASE_URL war für den Testlauf entfernt; keine Vorschau-Datenbank als Testziel.
- Gesamte Frontend-Suite: 57 Tests bestanden. TypeScript, Vite-Build,
  Ruff für backend und git diff --check bestanden; bestehender Bundlegrössenhinweis.
- Geänderte/neue Dateien auf typische Geheimnismuster geprüft, keine Treffer.
  .env und .local bleiben ignoriert und werden nicht eingecheckt.
- Dies ist lokale Validierung, kein Nachweis eines GitHub-CI- oder Docker-Laufs.
  Sicherung auf design/sonio-dashboard-login; keine GitHub-Pages-Publikation.
