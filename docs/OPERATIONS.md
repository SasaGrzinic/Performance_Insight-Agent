# Betrieb und Reports

## Aufträge und Zeitplan

Der Scheduler läuft als eigener Container. Alle 30 Sekunden prüft er fällige Arbeit; Synchronisierungen werden auf konfigurierbare Intervalle gebündelt (Standard: 60 Minuten). Monatsreports sind am 3. um `REPORT_HOUR` in `REPORT_TIMEZONE` fällig und betreffen den Vormonat. `REPORT_START_MONTH` bezeichnet den ersten Monat der Zustellung, nicht den Datenmonat. Bei 2026-09 ist der erste Report für August 2026 vorgesehen.

Fällige Monatsaufträge werden nach Ausfällen ab Startmonat nachgeholt. Ein eindeutiger Auftrags-Schlüssel verhindert doppelte Planung bei Neustarts. Vor Erstellung werden Zielmonat und sein Vergleichsmonat erneut synchronisiert. API-Verzögerungen und Attribution-Nachläufe bleiben möglich.

Ein Worker beansprucht Aufträge über PostgreSQL `FOR UPDATE SKIP LOCKED`; nach 30 Minuten verwaiste Aufträge sind wieder verfügbar. Fehlerhafte Aufträge werden höchstens dreimal versucht. HTTP-Transportfehler, HTTP 429 und 5xx erhalten kurze Wiederholungen. Pro Kanal schützen PostgreSQL-Transaktionssperren den Austausch seiner Werte. Lange Importe über die 30-Minuten-Lease hinaus benötigen vor Skalierung eine Heartbeat-Erweiterung. Einzelner Worker ist die vorgesehene Erstkonfiguration.

Erfolgreiche Importe ersetzen die Werte ihres Bereichs atomar. Ein fehlgeschlagener Abruf lässt bisherige Werte unverändert und markiert den Kanal als fehlerhaft. Der Report führt nicht verbundene oder fehlerhafte Kanäle ausdrücklich auf. Ein Report kann daher trotz vorhandener Zahlen unvollständig sein.

## OpenRouter

`OPENROUTER_API_KEY` und `OPENROUTER_MODEL` setzen. Ein aktuell verfügbares Modell mit JSON-Schema-Unterstützung wählen. Die Modell-ID kann über `GET https://openrouter.ai/api/v1/models` geprüft werden; die App enthält absichtlich keinen geratenen Modellnamen.

Anfragen gehen an den offiziellen Chat-Completions-Endpunkt. Der Agent bekommt aggregierte KPI-Werte, Vergleichswerte, Kanalstatus und Datengrenzen. Kein Word-Dokument, keine Kontaktliste und keine OAuth-Zugangsdaten werden an OpenRouter übermittelt. Provider mit Datensammlung werden ausgeschlossen (`provider.data_collection=deny`); nicht jeder Modell-/Provider-Mix erfüllt diese Auswahl.

Ausgaben müssen das JSON-Schema erfüllen; Datenreferenzen werden gegen tatsächlich vorhandene `channel.metric`-IDs geprüft. Ein Validierungsfehler liefert keine scheinbar echte Empfehlung. Zahleninterpretationen bleiben probabilistisch und benötigen fachliche Prüfung. Die Anwendung ändert keine Kampagnen.

Nach erfolgreicher Synchronisierung wird die Analyse des angeforderten Monats und des mit synchronisierten Vormonats aktualisiert, sofern sich Eingabewerte oder Modell geändert haben. Uploads/KPI-Änderungen löschen vorhandene Analysen; anschliessend per Knopfdruck oder nächstem Sync neu erzeugen. „Analyse erstellen“ erzwingt eine neue Auswertung. Das Monatsreport-Briefing wird separat gespeichert.

## Zustellung

`SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` und `REPORT_RECIPIENTS` (Komma-getrennte Empfänger) konfigurieren; bei Bedarf Nutzer/Passwort. STARTTLS ist standardmässig aktiv. Der Report steht zusätzlich im Dashboard bereit. Ohne Mailkonfiguration lautet der Zustellstatus `not_configured`; es wird kein Versand behauptet.

Reports enthalten Kennzahlen, Datengrenzen, Interpretation, Empfehlungen und einen Link zum geschützten Dashboard. Ein noch nicht zugestellter Report desselben Monats kann neu erstellt werden und wird dabei aktualisiert; bereits versandte Reports bleiben unverändert. Die UI erlaubt Text-Download des gespeicherten Reports. PDF ist in dieser Fassung nicht implementiert.

SMTP bietet keine transaktionale Genau-einmal-Zustellung zusammen mit PostgreSQL: Ein Prozessabbruch nach erfolgreichem Versand, aber vor Speicherung von `sent_at`, kann beim Wiederholen eine zweite E-Mail auslösen. Eine stabile Message-ID unterstützt empfangsseitige Deduplizierung. Für streng garantierte Zustellung wäre ein Mailanbieter mit Idempotency-Key nötig.

Ein fehlgeschlagener Versand ist im Reportstatus sichtbar; die Auftragswiederholung versucht erneut zuzustellen. Nach ausgeschöpften Versuchen den Betrieb prüfen und administrativ einen neuen Auftrag anlegen. Eine automatische Erkennung der externen E-Mail-Zustellung/Bounces ist nicht implementiert.

## Betriebsvorbereitung

- API-Zugänge mit jedem echten Konto verifizieren; Kontowährung, Zeitzone, Berechtigungen und Datenvollständigkeit kontrollieren.
- PostgreSQL-Volume sichern und Wiederherstellung testen; Migration mit `docker compose run --rm migrate`.
- `docker compose logs api worker scheduler` zur Diagnose. Rohantworten der Anbieter werden nicht in Fehlernachrichten gespeichert, um Tokens/Personendaten nicht versehentlich zu protokollieren.
- Für Produktion HTTPS und sichere Cookies erzwingen, Demo abschalten, `.env` nur für Betriebspersonal lesbar halten.
- Zugangsrücksetzung und Verantwortlichkeiten für Token-Erneuerung festlegen. Kein öffentlicher Registrierungsweg, kein Self-Service-Passwortreset.
- Provider-API-Versionen regelmässig prüfen. Paket-Locks halten Builds nachvollziehbar; Updates zuerst in CI testen.
