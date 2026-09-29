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

## Freigegebene LinkedIn-Organic-Ansicht (29.09.2026, abends)

Die freigegebene Vorschau wird als React-Komponente `LinkedInOrganic.tsx` integriert,
mit `linkedin-organic.css` und Datenhelfern in `linkedinMetrics.ts`.

- Primäre Zielgruppe: Marketing. Vollständiges Bergmotiv, Titel im Himmel, kein
  überlagertes Kanal-Logo. Kanalwahl bleibt mit Kanal-Icon erhalten.
- Sechs kompakte Sonio-blaue Kacheln, Desktop drei pro Zeile: Impressionen,
  Engagement-Rate, Kommentare/Reposts, organische Follower-Zugewinne,
  LinkedIn-Klicks, Reaktionen. Keine Zahlen-Zusatzzeile oder Trend-Deltas darunter.
- Monat dezent direkt bei «Sichtbarkeit & Relevanz», keine dominante Auswahl im Header.
  Dort auch «Laufendes Jahr». Monatswechsel und CSV unter «Daten & Export»;
  bestehender Monatsvergleich mit Kennzahl-Auswahl bleibt erhalten.
- Abschnitte durch blaue Titel und Abstand gliedern, ohne dekorative Trennstriche.
- Beitragsbilder kommen aus `image_url`; fehlende Bilder werden ehrlich ausgewiesen.
- Video im Fokus nach gesamter/Ø Betrachtungsdauer oder Aufrufen wählbar;
  Vorschaubild verlinkt zum Originalvideo auf LinkedIn (kein vorgetäuschter Player).
- Alle Video-Kacheln im gleichen kräftigen Blau. Keine rosa/grünen Flächen.
- Empfehlungen am Schluss, Kanal zuerst, nächste Schritte per Hover/Fokus/Klick.
- Freistehendes zentriertes Seth-Godin-Zitat, blaue Anführungszeichen, darunter
  «Marketingautor und Unternehmer», mit Link zur Originalquelle.

### Datenlogik und verbleibende Integrationen

Die Jahresauswahl lädt Januar bis zum aktuellen Schweizer Kalendermonat. Summen
werden nur bei vollständig vorhandenen Monatswerten berechnet. Engagement wird aus
summierten Interaktionen / Impressionen berechnet, nicht aus gemittelten Monatsraten.
Monatsdatenqualität bleibt auf die vorhandene API angewiesen; fehlende Tagesabdeckung
kann ohne zusätzliche API-Metadaten nicht zuverlässig erkannt werden.
Beitrags- und Videowerte bleiben Gesamtwerte seit Veröffentlichung, gefiltert nach
Veröffentlichungszeitraum, und sind entsprechend beschriftet. Video-Durchschnitt ist
nach Aufrufen gewichtet. Abschlussrate wird nicht angezeigt.

Zielklicks YouTube/Website, GA4-Zuordnung und relative Videobetrachtung benötigen
zusätzliche Daten (Zieltracking bzw. verlässliche Videolänge). Sie werden nicht aus
allgemeinen Klicks oder erfundenen Videolängen abgeleitet. Jahres-Empfehlungen werden
nicht aus einer Monatsanalyse übernommen; diese Jahresanalyse ist noch offen.
Die Demo enthält keine echten Posts/Videos. In Live werden keine Vorschau-Zahlen benutzt.

### Codex übernehmen

Branch `design/sonio-dashboard-login` aktualisieren (Befehle oben), dann diese Datei
lesen. Navigation: **Kanäle → LinkedIn Organic**. Für die Vorschau der Oberfläche ist
`/?demo=1` möglich; echte Posts und Videos erscheinen nur mit verbundenem Live-Konto.
Ein bereits laufender Codex-Task muss den Branch ausdrücklich aktualisieren.
