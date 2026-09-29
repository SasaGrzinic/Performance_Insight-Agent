# LinkedIn Organic — verbindliche Übergabe an Codex

Branch: `design/linkedin-organic`
Basis: `fa5a5fd3b19a1eb301d0dee63248824d9a49852c` (React-Integration).
Freigegebene visuelle Referenz: `docs/design-reference/linkedin-organic-approved.html`.
Diese Datei ist die unveränderte letzte vom Nutzer freigegebene HTML-Vorschau,
inklusive eingebetteter Bilder. Sie ist eine Designreferenz mit Beispieldaten,
keine Live-Ansicht. Der bisherige Branch enthielt diese Referenz noch nicht.

## Auftrag für die Übernahme

1. `git fetch origin` ausführen und `origin/design/linkedin-organic` verwenden.
2. Bei lokalen Änderungen diese erhalten. Vorzugsweise einen eigenen Worktree
   anlegen, damit lokale Navigation und globale Styles den Abgleich nicht verfälschen:
   `git worktree add --detach ../sonio-linkedin-review origin/design/linkedin-organic`
3. `AGENTS.md`, diese Datei und `docs/DESIGN_HANDOFF_2026-09-29.md` lesen.
4. React starten: `cd frontend`, `npm ci`, `npm run dev`.
   Navigation: Kanäle → LinkedIn Organic.
5. Die React-Ansicht gegen die HTML-Referenz abgleichen. Die HTML-Referenz ist die
   visuelle Autorität, nicht der vorhandene Zustand allgemeiner Styles.
6. Bestehende Datenzugriffe, Anmeldung, CSV und Monatsvergleiche erhalten. Keine
   Referenz-Zahlen oder Referenz-Bilder als echte LinkedIn-Daten übernehmen.

## Wichtig: Umsetzung und Referenz sind noch nicht pixelgleich

Der React-Stand enthält die neuen sechs Kacheln, Jahresauswahl, Video-Fokus,
Empfehlungen und das Zitat. Der bestehende PerformanceExplorer wurde weiterverwendet
und ist umfangreicher als der freigegebene Diagrammbereich. Navigation und globale
Styles stammen aus der bestehenden Anwendung. Diese Unterschiede nicht als vom
Nutzer erneut freigegeben behandeln. Für die genaue visuelle Angleichung liegt nun
erstmals die vollständige Originalreferenz im Repository vor.

## Freigegebene Gestaltung

- Vollständiges Bergbild, Titel/Subline im Himmel, Fahrer und Gipfel frei.
- Sechs kompakte Kacheln, drei pro Zeile, einheitlich Sonio #0075d9.
- Keine Zusatzkennzahlen oder Vergleichszeilen unter den Kacheln.
- Monat dezent neben Sichtbarkeit & Relevanz, keine blaue Monatsbox oben.
- Titel und Abstand gliedern Abschnitte; keine dekorativen Trennlinien.
- Beitrags-Hauptbilder; bestes verfügbares Video im Fokus, Auswahl nach Kennzahl.
- Video-Kennzahlen nebeneinander und im gleichen kräftigen Blau.
- Zusatzinformationen per Hover, Tastatur und Touch erreichbar.
- Empfehlungen am Schluss, Kanal zuerst, nächster Schritt mit ergänzender Information.
- Freies zentriertes Seth-Godin-Zitat ohne Kachel, Berufsangabe darunter.

## Datenbeschränkungen

Monatswerte und Beitragsgesamtwerte nicht vermischen. Fehlende Messwerte sind keine
Null. Keine Abschlussrate. Zielklicks YouTube/Website und relative Betrachtung bleiben
bis zu verlässlichem Zieltracking bzw. Videolängen offen. Jahresanalyse-Empfehlungen
sind noch nicht angebunden. HTML-Vorschau und API-Daten haben unterschiedliche Zwecke.
