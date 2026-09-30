# LinkedIn Organic: Referenzabgleich 29.09.2026

Basis: origin/design/linkedin-organic, fea9b7fef0ec98b3ce5e20588488b39620edf802.
Visuelle Autorität: docs/design-reference/linkedin-organic-approved.html.
Abgleich isoliert in /private/tmp/sonio-linkedin-fea9b7f, Vorschau Port 5174.
Lokale Änderungen vorher als 41 Dateien und Patch unter
/private/tmp/sonio-local-backup-20260929 gesichert; bestehende Git-Stashes erhalten.

Angeglichen: blaue schmale Navigation nur im Organic-Bereich; Masthead, Hero-Typografie,
kompakte sechs Kacheln, ruhiger Diagrammbereich mit ergänzenden Kontrollen auf Knopfdruck,
Format-Schaltflächen, Beitragstabelle inklusive Hauptbild/Impressionen/Klicks/Engagement/
Kommentare/Reposts, Video-Fokus mit Original-Link, Video-Tabelle, Website-Zuordnungsblock,
Empfehlungsüberschrift und Zitat. Neue Übersicht unverändert erhalten.

Bewusste funktionale Unterschiede zur statischen Referenz: Kanalwahl bleibt erhalten;
Vergleiche erlauben weiterhin mehrere Monate und Kennzahlen. Fehlende Bilder und Werte
bleiben fehlend; keine Referenzdaten oder Musterempfehlungen in Live übernommen.
Videolänge/relativer Betrachtungsanteil und GA4-Zuordnung bleiben mangels belastbarer
Daten offen. Live-Analyse lieferte beim Abgleich keine LinkedIn-Empfehlungen.

Prüfung: TypeScript, Vite-Build, 22 Frontend-Tests bestanden. Build meldet Chunk über
500 kB. Desktop und Mobile 390 px visuell geprüft, kein horizontaler Seitenüberlauf.
Mehrfachauswahl: August/September plus Impressionen/Klicks im Browser bestätigt.
Bei einer früheren Variante stürzte der Vorschau-Tab beim Öffnen der Zusatzkontrollen
ab; nach explizitem React-Toggle statt nativer Details und einfacherem Chart-Layout
war der obige kombinierte Vergleich erfolgreich. Keine Behauptung einer gesicherten
Browser-Crash-Ursache. Vorschau greift auf bestehenden lokalen API-Dienst zu;
kein zweiter Worker/Scheduler und keine Credentials-Kopie.

Integration in die laufende Ansicht 5173: nur die LinkedIn-Komponenten, optionaler
Empfehlungstitel und Referenzdokumente übernommen. Alle zuvor lokalen Dateien sind
bytegleich erhalten ausser MarketingOverview.tsx (optionaler Titel, bestehende
Top-3-Überschrift als Default erhalten). Kombinierte Version: TypeScript und 23 Tests bestanden.

## Präzisierung und Bildreparatur – 29.09.2026
Remote nochmals geprüft: unverändert fea9b7f. Nutzerpräzisierung hat Vorrang:
zusätzlichen Rücklink und Kanalwähler in Organic entfernt, Leitvideo nur Vorschau
mit Original-Link (keine KPI-/Textspalte), Rankingauswahl neben Abschnittstitel,
Kennzahlen darunter. Zitat auf responsive 23–34 px vergrössert.

Bilddiagnose: 27 von 160 gespeicherten Sonio-Posts ohne Bildadresse, darunter
14 von 15 September-Posts. API-Nachladen durch HTTP 429 blockiert. Öffentliche
Original-Postseiten lieferten für alle 27 og:image; nur HTTPS-licdn-Adressen
gespeichert, Herkunft public_post_og_image, Kennzahlen/Zeitstempel unverändert.
Keine Musterbilder verwendet. September: alle 15 Postbilder geladen, Tooltip
am 8. September mit beiden passenden Bildern/Überschriften/Impressionen/Klicks
im Browser bestätigt. PostImage merkt fehlgeschlagene URL statt dauerhaftem
Fehlerstatus, damit eine erneuerte URL wieder geladen wird.
TypeScript und Build bestanden; unveränderte Bundle-Grössenwarnung.
Backup vor diesen Änderungen: /private/tmp/sonio-before-second-alignment.

## Dauerhafte Aktivierung der Bildkorrektur
Erneut fehlende Bilder: der lokale API-/Worker-/Scheduler-Verbund lief seit
25.09.2026 und hatte die neuere Erhaltungslogik noch nicht geladen. Alten Verbund
kontrolliert beendet, Prozessende geprüft, mit scripts/dev.py --scheduler neu
gestartet. Vorhandene Bildquelle wird beim Erhalt einer Bildadresse mit erhalten.
Regressionstest prüft zwei aufeinanderfolgende Importe ohne Bildantwort: Originalbild
bleibt erhalten, Kennzahlen werden dennoch aktualisiert. 10 LinkedIn-Tests bestanden.
24 erneut fehlende Bildadressen über öffentliche Originalseiten repariert; danach
160/160 gespeicherte Sonio-Posts mit Bildadresse. Alle 15 September-Postbilder in
der Liste geladen, Tooltip vom 8. September mit beiden Bildern visuell bestätigt.
API-Limitmeldung bleibt wahrheitsgemäss sichtbar. Keine neuen Zugangsdaten.
