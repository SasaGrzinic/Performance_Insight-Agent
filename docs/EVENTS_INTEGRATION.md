# Events – geprüfter Stand 5. Oktober 2026

Ausschliesslich Event-Metadaten, Bilder und aggregierte Zahlen speichern. Keine
Teilnehmernamen, E-Mails, Firmenwerte einzelner Antworten oder Freitextantworten
in Datenbank, Dateien, Logs, CSV oder KI-Anfragen übernehmen.

## Umsetzung

- Authentifizierter GET `/api/events`; Admin-PUT `/api/events/aggregate`, CSRF geschützt.
- Striktes Schema, konsistente Gruppensummen, idempotenter Snapshot-Ersatz,
  Ablehnung älterer Stände. Speicherung in bestehender Preference-Tabelle.
- React-Eventübersicht mit Originalmotiven für Forms, Quellenkennzeichnung,
  Quellen-/Jahres-/Monats-/Themenfilter, KPI-Infos, CSV und Details.
- Unbekannte Werte bleiben null; Teilstände werden ausgewiesen. Keine Addition
  von Aufzeichnungsaufrufen und Live-Teilnahmen zu Anmeldungen.

## Microsoft Forms

Acht Formulare, 432 Antworten: 118 Sonio, 43 Partner/Hersteller, 271 unzugeordnet.
Die zusätzliche AI-Experience-Kopie enthält keine Antworten und ist gekennzeichnet.
Alle Firmenlisten flüchtig im Browser klassifiziert, ausschliesslich Summen übernommen.

| Formular | Antworten | Sonio | Partner | Offen |
|---|---:|---:|---:|---:|
| VCF 2026 | 10 | 6 | 1 | 3 |
| Zoo 2026 | 135 | 36 | 19 | 80 |
| AI Experience 2026 | 48 | 19 | 3 | 26 |
| FLY7 2026 | 42 | 14 | 5 | 23 |
| AI Experience Kopie | 0 | 0 | 0 | 0 |
| Zoo 2025 | 141 | 35 | 11 | 95 |
| Chaplin 2025 | 38 | 4 | 4 | 30 |
| Cyber Recovery 2025 | 18 | 4 | 0 | 14 |

Antworten sind nicht eindeutige Personen oder bestätigte Teilnahmen.
FLY7 und Chaplin fragen Begleitpersonen ab; deren Anzahl ist noch nicht verifiziert.
Kundenzahlen bleiben unbekannt: fremde Firmen sind nicht automatisch Kunden.

Freigegebene Partnerliste (16): Arctic Wolf, Arctera, Baramundi, Cohesity,
Commvault, HPE, HPI, Dell, Huawei, Everpure, Microsoft, Omnissa, Veeam,
Fortinet, Broadcom, Quantum. Regeln: `backend/app/event_company_groups.py`.
Sonio/Sonio AG bilden Mitarbeitende; Rechtsformzusätze und Schreibweise werden
normalisiert. Keine unscharfen Teilstringtreffer.

## Zoom

Aufzeichnungsarchiv im Browser auf 01.01.2024–05.10.2026 gesetzt: sieben
Aufzeichnungen gefunden und übernommen, fünf aus 2025, zwei aus September 2024.
Darunter Digital Workplace DE/FR, Private Cloud, Azure-Kosten und Cyber Recovery.
Pro Aufzeichnung Titel, Datum, Dauer und Aufzeichnungsaufrufe gespeichert.
Keine signierten Thumbnail-URLs oder personenbezogenen Teilnehmerberichte gespeichert;
Zoom-Bilder sind noch nicht integriert.

Für das Webinar vom 29.10.2025 zusätzlich 19 Teilnehmer-Einträge im Monatsbericht
bestätigt. Dies ist keine belegte Zahl eindeutiger Personen; Wiederbeitritte oder
Hosts können enthalten sein. Andere Live-Teilnahmen und Registrierungen unbekannt.

Leere Previous-Webinar-Liste bedeutet nicht, dass keine Webinare stattfanden.
Im Berichtsdatum war Oktober 2024 nicht auswählbar. Das erhaltene Archiv belegt
keine vollständige Historie gelöschter oder nicht aufgezeichneter Webinare.
Zoom-Daten vor 01.01.2024 werden vom Importschema abgelehnt.

## Betrieb und Grenzen

Zoom Server-to-Server OAuth wurde am 05.10.2026 aktiviert und live geprüft.
Scopes: `report:read:list_history_meetings:admin`, `report:read:webinar:admin`.
Keine Registranten-/Teilnehmerlisten-Endpunkte. Credentials ausschliesslich lokal.
`zoom_events.py` liest paginierte Webinarhistorie und aggregierte Detailberichte.
Explizite Filter: meeting_type=webinar, date_type=start_time, report_type=all.
Die API verweigerte Oktober 2025 mit Code 300 (nur letzte sechs Monate).
Abruf 01.05.–05.10.2026 erfolgreich, jedoch null Webinare geliefert. Sieben
ältere Archiveinträge bleiben erhalten und werden nicht als live aktualisiert markiert.
Anmeldungen und Firmenaufteilung sind über diese Berichtsscopes nicht verfügbar.

Admin-POST `/api/events/zoom/refresh` mit CSRF; manuell über Daten aktualisieren.
Automatischer Abruf im vorhandenen Scheduler bei laufender lokaler Anwendung.
Fehler erhalten den letzten Snapshot. Import ist anhand Webinarinstanz idempotent;
pro Event separater Abrufstand, keine Erneuerung des Forms-Datenstands.
Forms bleibt manuell. Öffentliche Demo enthält keine echten Eventdetails.

## Prüfung

Sechs gezielte Backendtests, Ruff und TypeScript erfolgreich. Browser: Quellen-
und Jahresfilter, zwei Zoom-Einträge 2024, Forms-Gruppensummen 2025 und geladene
Originalbilder geprüft. Desktop zwei Karten nebeneinander; Mobile 390 px ohne
horizontalen Seitenüberlauf. Temporären Viewport anschliessend zurückgesetzt.

## Review F02 – gemeinsame Event-Zählbasis (05.10.2026)

- `event_summary.py` stellt Snapshot-Summen für Eventfilter und Dashboard bereit.
  Eventdatum bestimmt den Monat, inklusive bevorstehender Events im Monat; Werte
  sind letzte Event-Gesamtstände, keine im Monat neu eingegangenen Anmeldungen.
- Antworten, bestätigte Anmeldungen, Zoom-Teilnahme-Einträge und Aufzeichnungsaufrufe
  bleiben getrennt. Sonio/Partner/Kunden werden nur aus vorhandenen Gruppenzahlen
  summiert. Unbekannte Firmen sind nicht automatisch Kunden. Teilstände nennen
  bekannte/gesamte Events. Ein Strich bedeutet unbekannt, 0 bleibt eine echte Null.
- Markierte Duplikate und gleiche Datum/Titel-Kandidaten werden konservativ aus
  Summen ausgeschlossen, nicht gelöscht. Keine Garantie auf Erkennung aller
  Mehrfacherfassungen; ohne dauerhafte gemeinsame Event-ID bleibt dies begrenzt.
- Bei vorhandenem Snapshot werden alte DOCX-Metric-Zeilen nicht zusätzlich gezählt.
  Unbekannte Eventdaten werden nicht einem Monat zugeschlagen. Keine künstliche
  Tageskurve oder Vormonatsbewertung aus heutigen Snapshots.
- Neue Reports und der Agent-Eingang enthalten dieselben Summen, Abdeckung und
  Datenstände. Bestehende Reports bleiben unverändert. Kein KI-Lauf oder
  Reportversand durch diese Änderung ausgelöst.
- Browserabgleich Oktober: 10 Formularantworten, Sonio 6, Partner 1, Kunden offen;
  3 noch nicht eindeutig zugeordnet. Alle Jahre: 432 Antworten, Sonio 118, Partner
  43 als Teilstände, Kunden offen. Es wurden keine Personendaten gespeichert.

### Vorrangige Nutzerentscheidung – Kunden als Restgruppe, 05.10.2026
Fehlende importierte Kundenzahlen werden berechnet: bestätigte Anmeldungen (falls
vorhanden, sonst Formularantworten) minus Sonio minus Partner/Hersteller. Nur wenn
alle Eingangswerte bekannt sind und der Rest nicht negativ ist. Importierte
Kundenzahlen bleiben vorrangig; Rohdaten werden nicht umgeschrieben. Oberfläche,
CSV und Agentdaten kennzeichnen berechnete Werte. Dies ersetzt die vorherige
Entscheidung, die Restgruppe grundsätzlich offen zu lassen. AI-Experience: 26,
Oktober-VCF: 3. Die Zählbasis Formularantworten wird weiterhin klar benannt.

Der Nutzer hat «AI-Experience auf dem Zürichsee (2)», ID ai-experience-2026-copy,
als Test bestätigt. Nur dieser Eintrag wurde aus dem lokalen Snapshot entfernt;
Sicherung unter .local/, echter Anlass und Originalformular bei Microsoft
unverändert. Bei späteren manuellen Importen dieses Testformular ausschliessen.
