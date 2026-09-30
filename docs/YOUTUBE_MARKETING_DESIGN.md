# YouTube Marketing-Cockpit – 30. September 2026

Marketing ist die Hauptzielgruppe, GL und Sales ergänzend; Technik ohne eigenen Schwerpunkt.
Header, Typografie und Blau folgen Übersicht und LinkedIn Organic. Neuester Kanal-Upload als visuelles Leitvideo, unabhängig von Veröffentlichungsmonat und Playlist. Original-Vorschaubild, Titel, Datum, Länge und eingebetteter Player nach Klick; externer YouTube-Link und Rückkehr zum Vorschaubild vorhanden.

Vier Hauptkennzahlen pro Video: Aufrufe, Wiedergabezeit, durchschnittlich angesehener Anteil und Betrachtungsdauer. Likes, Kommentare, Teilungen und Zugriffsquellen in aufklappbaren Details. Thumbnail-CTR/Impressionen und Einstiegsbindung sind vorgeschlagene Erweiterungen, ausdrücklich noch nicht angebunden.

Monat bzw. ganzes ausgewähltes Jahr filtern Veröffentlichungen in Europe/Zurich. Werte bleiben Gesamtstand seit Veröffentlichung. Jahrescache ist separat; Traffic-Abfrage nutzt dieselbe Auswahl. Zusammenfassung addiert nur vollständig vorhandene Aufrufe bzw. Wiedergabeminuten; keine gemittelten Video-Durchschnitte und keine erfundenen Trends. Diagramm zeigt je Veröffentlichung Gesamtkennzahlen mit Titel und Bild im Tooltip, keine Tagesleistung. Fünf Videos initial, alle auf Wunsch. CSV-/Aktualisierungsleiste erhalten.

Geprüft: drei Backendtests (Pagination/Herkunft, Leitvideo ausserhalb Auswahl, Jahresgrenzen/Cache), TypeScript und Build. Live: September ein Video, Jahresauswahl zwölf Videos. Vorschaubild geladen; bei 390 px kein horizontaler Überlauf. Player-Einbettung startet im UI, externe YouTube-Wiedergabe im eingebetteten Codex-Browser jedoch nicht bestätigt (leerer Frame); Originalbild als Hintergrund und YouTube-Link bleiben erreichbar. Build warnt weiterhin vor Bundle über 500 kB. Ruff für YouTube-Modul/Tests bestanden; main.py enthält ausserhalb dieses Bereichs bestehende Import-Sortierhinweise.

Keine Veröffentlichung oder Änderung an Zugangsdaten. Lokale Änderungen vor Bearbeitung unter /private/tmp/sonio-youtube-before gesichert.

## Ganze Jahre und beworbene Videos

- Jahresoptionen kommen aus dem vollständigen verifizierten Kanal-Katalog, absteigend; jedes vorhandene Jahr direkt als Ganzes auswählbar.
- Uploads und Playlist-Video-IDs werden dedupliziert zusammengeführt. Fremde Kanalvideos bleiben ausgeschlossen.
- Neuer geschützter Endpoint `/api/youtube/promoted`: prüft die Quellen aller eigenen Videos seit Veröffentlichung. Nur positive `ADVERTISING`-Aufrufe begründen die Aufnahme; Playlist-Zugehörigkeit allein nicht.
- Abschnitt unabhängig von der oberen Monatsauswahl, eigener Veröffentlichungsjahrfilter mit «Alle Jahre». Werbeaufrufe, Aufrufe weiterer Quellen und Werbe-Wiedergabeminuten. Weitere Quellen sind nicht automatisch organisch; fehlende Kategorien bleiben unbekannt.
- Eine Stunde Cache, manuelle Erneuerung, letzter Stand mit Warnung bei Fehler. Keine Kosten oder Kampagnenzuordnung ohne Ads-Zugang, keine Addition mit den bereits enthaltenen Gesamtwerten.
- Fünf Backendtests, TypeScript und Build bestanden; bestehende Bundle-Warnung bleibt.
- Live-Abgleich: 15 Videos mit ADVERTISING-Werten aus 2023–2026. Darunter Digital Workplace 453’904 und Hybrid Cloud 44’428 Werbeaufrufe. Jahreskatalog 2026, 2025, 2024, 2023, 2020, 2016. Separater Werbe-Jahresfilter 2025 zeigt sieben Videos; Desktop und Mobile 390 px ohne horizontalen Überlauf geprüft.

## YouTube-Verfeinerung 30.09.2026
- Aktualisieren und CSV in einer Zeile, auch bei 390 px; nur YouTube betroffen.
- Playlist-Schaltflächen direkt nach dem Diagramm inklusive «Alle» ersetzen das Playlist-Dropdown. Auswahl filtert Diagramm, Kennzahlen und Videoliste zusammen.
- Leitvideo, Karten und Tooltip verwenden randfüllende Vorschaubilder (cover).
- KPI-Erklärbereich als zweigeteilte Sonio-blaue Fläche mit Kennzahlenauswahl; bestehende Definitionen bleiben erhalten.
- Filmzitat von Steven Spielberg, englisches Original mit verlinkter ScreenCraft-Quelle.
- Geprüft: TypeScript und Vite-Build erfolgreich (bestehende Bundle-Grössenwarnung). Desktop-Playlistfilter 2025: Alle 34 Videos, Full Service Provider 2 Videos; Kennzahlen-Erklärung umschaltbar. Mobile 390 px: Aktionszeile visuell korrigiert und geprüft, Vorschau/Erklärbereich ohne horizontalen Überlauf. Keine Veröffentlichung durchgeführt.

### Auswahl und Zuordnung, 30.09.2026
Monatsdropdown auf aktuelle und elf vorhergehende Monate begrenzt; vollständige vorhandene Jahre bleiben wählbar. Playlist-Reihenfolge: Alle, Sonio.onPoint, Testimonial, Full Service Provider, Events, Image, Sonio Vodcasts, Partner, Archiv. Einheitliche Anzeigenamen, Provider-IDs unverändert. Werbeabschnitt auf tatsächlich zur Playlist Full Service Provider gehörende Videos mit nachgewiesenen Werbeaufrufen begrenzt und als «Full Service Provider · Werbewirkung» benannt. Zitat nutzt die gemeinsame zentrierte marketing-quote-Gestaltung. Browserprüfung bestätigt zwölf Monatsoptionen, Reihenfolge, fünf zugehörige Werbevideos und zentriertes Zitat. TypeScript und Produktionsbuild bestanden; bestehende Bundlewarnung bleibt.

### KPI-Infos und Titel, 30.09.2026
Abschnittstitel «Mit Video mehr erreichen.»; Playlist-Zuordnung und Werbebezug bleiben im Beschreibungstext. Alle drei Werbe-KPIs tragen Info-Schaltflächen mit Definition, Gesamtzeitraum und Interpretationsgrenzen. PeriodInfo unterstützt dafür optional einen spezifischen zugänglichen Namen; Standard bleibt unverändert. TypeScript erfolgreich, Titel/Schaltflächen und per Tastatur geöffnete Erklärung im Browser geprüft.
