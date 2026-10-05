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

Noch kein automatischer Forms-/Zoom-Sync. Aktualisieren lädt den gespeicherten
Snapshot und weist dies aus. Browser-Anmeldung ist keine API-Verbindung.
Für den Dauerbetrieb Aggregation in Microsoft 365/Power Automate beziehungsweise
freigegebener Zoom-Zugang; ausschliesslich Summen an das Backend übertragen.

## Prüfung

Sechs gezielte Backendtests, Ruff und TypeScript erfolgreich. Browser: Quellen-
und Jahresfilter, zwei Zoom-Einträge 2024, Forms-Gruppensummen 2025 und geladene
Originalbilder geprüft. Desktop zwei Karten nebeneinander; Mobile 390 px ohne
horizontalen Seitenüberlauf. Temporären Viewport anschliessend zurückgesetzt.
