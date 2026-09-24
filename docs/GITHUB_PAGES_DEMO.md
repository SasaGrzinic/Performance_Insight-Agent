# Öffentliche Hackathon-Demo

Die Demo wird über `.github/workflows/pages.yml` aus dem Frontend gebaut:
`VITE_STATIC_DEMO=true`, `VITE_BASE_PATH=/Performance_Insight-Agent/`.
Sie benötigt weder API noch Datenbank. Alle Kennzahlen sind synthetische Beispiele
in `frontend/src/demo-fixture.json` und `staticDemo.ts`, keine Exporte aus der
lokalen Datenbank. API-Schreibzugriffe und unbekannte API-Routen werden im statischen
Modus abgefangen; der Modus lässt sich nicht über URL-Parameter abschalten.

Adresse: https://sasagrzinic.github.io/Performance_Insight-Agent/

Pushes mit Frontend-Änderungen auf `main` veröffentlichen automatisch nach
Tests und Build. Alternativ unter Actions → Publish public demo → Run workflow.
GitHub Pages muss auf «GitHub Actions» als Buildquelle eingestellt sein.

Die lokale Vollversion auf Port 5173 bleibt unabhängig, mit Anmeldung und echten
Daten. `.env`, `.local`, Datenbanken und Review-Aufnahmen sind ignoriert und dürfen
niemals in das Pages-Artefakt oder Repository gelangen. Der Pages-Workflow erhält
keine Provider-Zugangsdaten. Ein Docker-/API-Deployment ist nicht Teil dieser Demo.

Backend-abhängige Aktionen wie Aktualisierung, Nutzer-Einladungen oder generierte
KI-Analysen sind nur in der geschützten Vollversion verfügbar. Demotexte und
Empfehlungen illustrieren die Bedienung und sind keine echten Auswertungen.
