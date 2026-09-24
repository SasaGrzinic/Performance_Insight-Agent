# Sonio Insights

Marketing-Dashboard mit React, FastAPI, PostgreSQL, OpenRouter und getrennten Docker-Diensten.

## Stand

Lokal lauffähige Implementierung mit echten LinkedIn-Daten der Sonio AG und separat gekennzeichneter Demo. LinkedIn Organic, Beiträge, Videozahlen und Follower sind angebunden. YouTube ist vorbereitet, bis zur erneuten Nutzerfreigabe jedoch pausiert. Weitere Live-Kanäle, OpenRouter und SMTP sind noch nicht eingerichtet; es wurde keine E-Mail-Zustellung verifiziert. Der vollständige Container-/PostgreSQL-Start ist noch nicht praktisch abgenommen. Eine CI-Pipeline für PostgreSQL, Python 3.14 und Container-Builds liegt bereit; erfolgreiche Ausführung ist separat zu prüfen.

Arbeitsanweisungen und aktuelle Produktentscheidungen stehen in [AGENTS.md](AGENTS.md), Integrationsdetails in [docs/CONNECTORS.md](docs/CONNECTORS.md). Zugangsdaten, lokale Datenbanken und Screenshots echter Marketing-Daten gehören nicht ins Repository.

## Enthalten

- Responsive Sonio-Oberfläche, Original-Logos und Original-Pfeil, selbst gehostete Red Hat Display; Recharts, Radix-Dialoge und ergänzende Lucide-Icons.
- Monat und Kanal wählen, interaktive Zeitverläufe, CSV-Export und bis zu acht konfigurierbare Übersicht-KPIs mit optionalen Monatszielen.
- Login mit Benutzername/Passwort, Argon2-Hashes, HttpOnly/SameSite-Sitzungen, CSRF-Prüfung, begrenzte Anmeldeversuche.
- Genau ein Master-Admin; einladbare Nutzer mit Leserechten, einmalige Links mit sieben Tagen Gültigkeit, Kontodeaktivierung inklusive Sitzungswiderruf.
- REST-Adapter für Google Ads, GA4, LinkedIn Ads, LinkedIn Organic, Mailchimp, YouTube Analytics sowie Microsoft Graph für Word-Anmeldelisten.
- DOCX-Upload und normalisierter QR-CSV-Import; der automatische QR-Adapter bleibt bis zur Anbieterentscheidung ausdrücklich unkonfiguriert.
- Stündliche Synchronisierung und manuelle Aktualisierung, persistente Auftragswarteschlange mit Wiederholungen und Wiederaufnahme nach Unterbrechung.
- OpenRouter mit JSON-Schema, validierten Kennzahlreferenzen und ausschliesslich aggregierten Eingaben. Neue Daten erzeugen neue Analysen; unveränderte Eingaben verwenden den Cache.
- Monatsreports am 3., vorläufig 08:00 Europe/Zurich, für den Vormonat; Archiv, Text-Download und konfigurierbarer SMTP-Versand.

## Mit Docker starten

Voraussetzung: aktuelle Docker Engine bzw. Docker Desktop mit Compose V2.

1. `.env.example` nach `.env` kopieren.
2. `POSTGRES_PASSWORD` mit einem langen URL-sicheren Zufallswert füllen. `ADMIN_EMAIL` und `ADMIN_PASSWORD` (mindestens 12 Zeichen) festlegen; `ADMIN_USERNAME` ist initial `admin`.
3. `docker compose up --build -d` ausführen.
4. `http://localhost:8080` öffnen, Demo unter `http://localhost:8080/?demo=1`.

Der Admin wird beim ersten Start angelegt. Spätere Änderungen an `ADMIN_PASSWORD` ändern ein bestehendes Konto nicht automatisch. Passwort-Rücksetzung ist in dieser ersten Fassung noch kein Self-Service-Flow; ein dokumentierter administrativer Prozess muss vor breiter Einführung festgelegt werden.

Dienste: `frontend` (Nginx/React), `api` (FastAPI), `postgres`, `worker`, `scheduler` und einmalig `migrate`. Nur das Frontend wird auf Loopback-Port 8080 freigegeben. Die PostgreSQL-Daten liegen im Volume `postgres_data`.

Für einen produktiven Host: `ENVIRONMENT=production`, `APP_ORIGIN=https://<eure-domain>`, `COOKIE_SECURE=true`, `DEMO_ENABLED=false`. Einen TLS-Reverse-Proxy vor den Loopback-Port setzen. Datenbank-Backups, Secret-Verwaltung und Betriebsüberwachung einrichten. Der Browser ruft die API unter derselben Herkunft auf. Kein CORS-Wildcard.

## Lokale Vorschau ohne Docker

Diese Option verwendet nur für Entwicklung SQLite. Der reguläre Betrieb verwendet PostgreSQL.

```bash
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements-dev.txt
python3 scripts/dev.py
```

In einem zweiten Terminal:

```bash
cd frontend
npm ci
npm run dev
```

Frontend: `http://127.0.0.1:5173/?demo=1`; API: `http://127.0.0.1:8000`; Entwicklungsdokumentation: `/api/docs`.

`scripts/dev.py` legt einen zufälligen lokalen Admin-Zugang an: Benutzer `admin`, Passwort in `.local/admin-password.txt` (nur für den lokalen Nutzer lesbar). Die Vorschau startet API und Worker, aber keinen automatischen Scheduler. So werden beim blossen Betrachten der Demo keine geplanten Aufträge ausgeführt.

Für die eingerichteten Live-Datenquellen lokal mit `.venv/bin/python scripts/dev.py --scheduler` starten. Damit laufen auch die geplanten Aktualisierungen und Monatsreports, solange der Rechner und diese Prozesse laufen. Die normale Dashboard-Adresse ist `http://127.0.0.1:5173/`; `?demo=1` bleibt eine getrennte Ansicht mit Beispieldaten. Unbeaufsichtigter Dauerbetrieb benötigt weiterhin das Hosting mit Docker und PostgreSQL.

## Datenquellen und Kennzahlen

Siehe [Einrichtung der Datenquellen](docs/CONNECTORS.md), [Kennzahldefinitionen](docs/METRICS.md), [Betrieb und Reports](docs/OPERATIONS.md) und [Quellen/Versionen](docs/SOURCES.md).

Verbindliche KPIs, LinkedIn-/YouTube-Abgrenzung, QR-Anbieter, tatsächliches Word-Tabellenformat, Reportempfänger und Hostingziel sind noch offen. Die Ausgangsauswahl ist sichtbar als vorläufig markiert. Der KPI-Editor nutzt einen geprüften Katalog; neue API-Metriken oder berechnete Quoten werden nach Festlegung ihrer fachlichen Definition ergänzt.

## Prüfen

```bash
.venv/bin/python -m pytest -q backend/tests
.venv/bin/ruff check backend
cd frontend
npm run build
```

Tests prüfen unter anderem Zugriffsschutz, CSRF, Einladungsverbrauch/-ablauf, Deduplizierung, fehlerhafte Importe, Wiederholung von Syncs, fehlende Werte, vergleichbare Zeiträume, Sommer-/Winterzeit, monatliche Nachholung und OpenRouter-Eingaben. `TEST_DATABASE_URL` schaltet auf eine ausschliesslich für Tests bestimmte PostgreSQL-Datenbank um; der Testlauf löscht deren Anwendungstabellen. Niemals auf Produktivdaten richten.

Die GitHub-Pipeline prüft Build und Tests sowie beide Dockerfiles. Dependabot bereitet wöchentliche Aktualisierungen vor. Ein Deployment erfolgt erst nach Festlegung des tatsächlichen Hostingziels.
