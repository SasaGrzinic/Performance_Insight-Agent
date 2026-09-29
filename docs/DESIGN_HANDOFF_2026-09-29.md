# Freigegebene Gestaltung – Dashboard und Anmeldung

Branch: `design/sonio-dashboard-login`. Freigabe durch Sasa Grzinic am 29.09.2026.

## Umgesetzt

- Dashboard: dunkle Sonio-Navigation, allgemeiner Einstieg mit vollständigem Bergmotiv,
  kompakte Entwicklungen, dominante blaue Empfehlungen vor den Kanalkacheln.
- Empfehlungen: Kanal zuerst; bis zu drei Empfehlungen (Auswahl); kompakter nächster
  Schritt mit Zusatzinformation per Hover, Tastatur oder Klick und bestehendem Detaildialog.
- Kanalkacheln: eine primäre Kennzahl, verständliche Bezeichnungen. Conversions werden
  als erfasste Zielaktionen bezeichnet, nicht unbelegt als Leads/Anfragen.
- Zentriertes Richard-Branson-Zitat mit blauen Anführungszeichen und Quellenlink.
- Login: vollständiges 16:9-Bergbild, Original-Logo und Titel im Bild, kleines zentriertes
  Formular. Bei abweichendem Bildschirmformat bleiben Randflächen, damit nichts vom
  Bild abgeschnitten wird. Kleine Displays zeigen das ganze Bild über dem Formular.
- Bestehende Authentifizierung, Einladungen, Rollen, Fehlermeldungen, Demo-Einstieg,
  Datenaktualisierung, Export und Kanalansichten bleiben funktional erhalten.

## Verbindliche Datengrenzen

Die Entwurfszahlen werden nicht in Live-Daten übernommen. Entwicklungen verwenden
beobachtete primäre Kanalwerte und deren Vorperiode. Bis zu drei Anstiege und ein
Rückgang werden bevorzugt; fehlen entsprechende Daten, wird nichts erfunden.
Die Auswahl beschreibt Volumen und belegt keine Qualität oder Kausalität.
Null ist ein beobachteter Wert; fehlende Werte, nicht-endliche Zahlen und eine
Null-Vergleichsbasis liefern keinen Prozenttrend. Laufende Zeiträume sind markiert.
Die illustrative Klickrate/Betrachtungsdauer aus dem Mockup wird nicht aus unzureichenden
Daten approximiert. Empfehlungen stammen aus der vorhandenen Analyse.

## In Codex weiterarbeiten

Neue Aufgabe im Repository mit Branch `design/sonio-dashboard-login` starten.
Bei einer bestehenden lokalen Arbeitskopie zunächst eigene Änderungen sichern, dann:

```bash
git fetch origin
git switch design/sonio-dashboard-login
git pull --ff-only origin design/sonio-dashboard-login
cd frontend
npm ci
npm run dev
```

Beim ersten lokalen Wechsel erstellt Git den Tracking-Branch aus `origin`, sofern
noch kein lokaler Branch dieses Namens existiert. Keine fremden Änderungen verwerfen.
Ein schon laufender Codex-Task wechselt nicht automatisch durch den GitHub-Push.
Die öffentliche GitHub-Pages-Demo bleibt bis zur Integration in den Deployment-Branch
unverändert. Diese Arbeit ändert keine Zugangsdaten und führt keine Produktionseinführung aus.
