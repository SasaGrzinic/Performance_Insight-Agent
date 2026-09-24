# Quellen, Assets und Versionen

Geprüft am 14. September 2026. Die Versionen wurden aus offiziellen Paketregistern bzw. Hersteller-Releases gelesen und anschliessend festgeschrieben; keine Betaversionen gewählt. Lokale Testlaufzeit: Python 3.12.14; Containerziel: Python 3.14.7.

| Baustein | Version |
| --- | --- |
| React / React DOM | 19.3.0 |
| Vite | 8.3.0 |
| TypeScript | 7.0.2 |
| Recharts | 3.10.1 |
| Radix Dialog / Tabs | 1.1.23 / 1.1.21 |
| TanStack Query | 5.102.8 |
| Lucide React | 1.46.0 |
| FastAPI | 0.141.1 |
| SQLAlchemy | 2.0.52 |
| Psycopg | 3.3.5 |
| Uvicorn | 0.53.0 |
| PostgreSQL | 18.6 |
| Python (Docker) | 3.14.7 |
| Node.js (Docker/Frontend-Build) | 26.8.2 |
| Nginx | 1.31.5 |

Vollständige Auflösung: `frontend/package-lock.json`, `backend/requirements.lock` und `backend/requirements-dev.txt`. „Aktuell“ bezieht sich auf den Abrufzeitpunkt, nicht auf eine Garantie für zukünftige Releases.

## Marke

[Sonio Website](https://www.sonio.com/) — Original-Logos `/images/site-logo-inverted.svg` und `/images/site-logo-light.svg`; Blau `#0075d9`, Anthrazit `#1d1d1b`, Grau `#f7f7f7` und Schriftfamilie „Red Hat Display Regular“ aus der öffentlichen CSS-Datei. Originales Pfeil-SVG aus der Website. Zusätzliche Dashboard-Funktionsicons kommen aus Lucide; sie sind keine behaupteten Original-Sonio-Icons.

[Red Hat Display](https://fonts.google.com/specimen/Red+Hat+Display) — Schrift lokal bereitgestellt, Lizenz unter `frontend/public/brand/OFL.txt`. Keine Google-Fonts-Laufzeitanfragen aus dem Dashboard.

## Öffentliche technische Dokumentation

- [OpenRouter Quickstart](https://openrouter.ai/docs/quickstart)
- [OpenRouter Structured Outputs](https://openrouter.ai/docs/guides/features/structured-outputs)
- [GA4 runReport](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport)
- [Google Ads Release Notes](https://developers.google.com/google-ads/api/docs/release-notes)
- [LinkedIn Marketing API](https://learn.microsoft.com/en-us/linkedin/marketing/)
- [LinkedIn API-Änderungen](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/recent-changes?view=li-lms-2026-04)
- [Mailchimp Reports](https://mailchimp.com/developer/marketing/api/reports/list-campaign-reports/)
- [YouTube Analytics Reports](https://developers.google.com/youtube/analytics/reference/reports/query)
- [Microsoft Graph Drive-Ordner](https://learn.microsoft.com/en-us/graph/api/driveitem-list-children)
- [PostgreSQL Releases](https://www.postgresql.org/docs/release/)
- [Python Releases](https://www.python.org/downloads/)
- [Node.js Releases](https://github.com/nodejs/node/releases)
- [Nginx Releases](https://nginx.org/en/download.html)

## Gewünschte Design-Skills

Installiert per `npx skills add … --agent codex --yes`:

- [Anthropic frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design)
- [Impeccable](https://github.com/pbakaus/impeccable)

Die Dateien befinden sich in `.agents/skills/`, inklusive Projekt-Lockfile `skills-lock.json`. Der Impeccable-Kontextlauncher konnte wegen seines nicht vorhandenen Engine-Caches nicht starten. Skill-Referenzen wurden direkt gelesen; Design und Produktkontext sind im Projekt dokumentiert.
