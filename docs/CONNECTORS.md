# Datenquellen einrichten

Secrets ausschliesslich auf dem Server in `.env` oder einem Secret-Manager speichern, nie im Browser, Repository oder Chat. Die UI erklärt die notwendigen Angaben und zeigt den Verbindungsstand; diese erste Fassung bietet bewusst keinen OAuth-Registrierungsassistenten. Autorisierte Tokens werden serverseitig hinterlegt.

| Kanal | Konfiguration | Anforderungen |
| --- | --- | --- |
| Google Ads | Google OAuth, `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_DEVELOPER_TOKEN`, optional `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Freigeschalteter API-Zugang, Zugriff auf Werbekonto; API v25. OAuth-Scope `adwords` ist anbieterseitig nicht rein lesend, die Anwendung ruft ausschliesslich Berichte ab. |
| GA4 | Google OAuth und `GA4_PROPERTY_ID` | Analytics Data API aktivieren, Property-Lesezugriff, `analytics.readonly`. |
| LinkedIn Ads | `LINKEDIN_ACCESS_TOKEN` oder autorisierter Refresh-Token mit Client-ID/-Secret; `LINKEDIN_AD_ACCOUNT_ID` | Marketing API Genehmigung, `r_ads_reporting`. Version 202608 als zuletzt verifiziertes Release. |
| LinkedIn Organic | Gleicher LinkedIn-Zugang und `LINKEDIN_ORGANIZATION_ID` | Community Management API, Unternehmensseiten-Admin und `rw_organization_admin` für den Statistik-Endpunkt. |
| Mailchimp | `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER` (z. B. us21) | API-Key des richtigen Accounts. Kampagnenreport-Endpunkt, Pagination wird vollständig gelesen. |
| YouTube | Google OAuth, `YOUTUBE_CHANNEL_ID` | Kanalzugriff und `yt-analytics.readonly`; organische Analytics. Werbung kommt aus Google Ads. |
| Word über M365 | `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MS_DRIVE_ID`, `MS_FOLDER_ID` | Graph Application-Berechtigung auf den benötigten SharePoint-/OneDrive-Bereich beschränken und administrativ freigeben. DOCX-Dateien direkt im konfigurierten Ordner, kein rekursiver Unterordnerimport. |
| QR | Keine automatische Verbindung vor Anbieterwahl | Bis dahin UTF-8 CSV mit `date,scans`. |

## Google OAuth

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` konfigurieren. Für die drei Google-Adapter wird vor einem Import ein Zugriffstoken über den offiziellen Token-Endpunkt erneuert. Refresh-Token muss offline-Zugriff auf die erforderlichen Scopes haben. Ein Google-Testprojekt mit kurzlebigen Freigaben eignet sich nicht für unbeaufsichtigten Dauerbetrieb.

### YouTube-Einrichtung am 16.09.2026

Projekt `sonio-insights`: YouTube Data API v3 und YouTube Analytics API aktiviert.
OAuth-Webclient „Sonio Insights – Lokal“ erstellt; Client-Zugangsdaten lokal in
`.env` (0600). Testnutzer `marketing@sonio.com` ist hinterlegt. Die App steht auf
„Test“; Dauerbetrieb ist noch nicht freigegeben. Kanalautorisierung und erster
Analytics-Abruf sind noch ausstehend: Google verlangt eine Passkey-Bestätigung.

Der lokale Einrichtungshelfer `scripts/youtube_oauth.py` bindet ausschliesslich
`127.0.0.1:8766`. Start mit `.venv/bin/python scripts/youtube_oauth.py`, dann
`http://127.0.0.1:8766/start` öffnen. Er fordert `youtube.readonly` und
`yt-analytics.readonly` mit Offline-Zugriff an. Die Freigabe dieser Leserechte
steht noch aus. State, PKCE, Sitzungscookie und Host-Prüfung schützen den Callback.
Erst nach Abgleich des autorisierten Kanals mit `@sonio-channel_2023` speichert
der Helfer Refresh-Token und Kanal-ID. Codes/Tokens werden nicht protokolliert.
Der Helfer endet nach Erfolg oder 30 Minuten. API/Worker erst nach erfolgreicher
Verifikation mit aktualisierter Konfiguration neu starten.

Die aktuelle Modulspezifikation steht in `YOUTUBE_REQUIREMENTS.md`.
Website-Conversions, Website-Sessions und Conversion Rate sind bis zur späteren
Analytics-Anbindung zurückgestellt und werden nicht bewertet.

## LinkedIn-Laufzeit

**Eingerichteter Stand am 15.09.2026:** Sonio AG (`622072`) über die bestehende App [Sonio Teams Bot](https://www.linkedin.com/developers/apps/247434008/products), Client-ID `78ria4ak7covm9`. Community Management API im Development Tier ist freigeschaltet; Organisations-Lookup, Statistikabruf und Refresh-Token-Austausch wurden live erfolgreich geprüft. Die aktive Autorisierung enthält ausschliesslich `rw_organization_admin`. LinkedIn Ads ist damit nicht verbunden.

Die lokalen Geheimnisse stehen in `.env`, Token-Laufzeitinformationen in `.local/linkedin-token-info.json`. Das Zugriffstoken läuft am 14.11.2026 ab und wird vor Datenabfragen automatisch erneuert. Der ausgegebene Refresh-Token läuft am 15.09.2027 ab; spätestens dann ist eine neue Autorisierung notwendig, bei vorherigem Widerruf entsprechend früher. Die bestehende App kann weiterhin für ihren ursprünglichen Zweck genutzt werden; der vorhandene Schlüssel und die ursprüngliche Redirect-URL wurden beibehalten. Mit Zustimmung des Nutzers wurde nur LinkedIns eigener Token-Generator-Callback ergänzt.

Die Anmeldung mit dem persönlichen LinkedIn-Konto autorisiert den API-Zugriff. Datenquelle ist ausschliesslich die über `LINKEDIN_ORGANIZATION_ID` festgelegte Unternehmensseite. Diese ID muss im Entwicklerportal bzw. der Seitenverwaltung mit Sonio abgeglichen werden; Profil-URLs und Member-URNs sind nicht zulässig. Jede Statistikantwort wird vor dem Speichern auf die angefragte Organisations-URN und den Zeitraum geprüft. Die Herkunft der Messwerte bleibt als Organisations-URN gespeichert. Es werden keine privaten Profilstatistiken oder Kontakte abgerufen.

Im [LinkedIn-Entwicklerportal](https://www.linkedin.com/developers/apps) zunächst vorhandene Sonio-Apps und deren Produktfreigaben prüfen. Für organische Seitenstatistiken wird eine für die Community Management API freigeschaltete, mit der Unternehmensseite verifizierte App benötigt. Den Zugriff im persönlichen Konto mit Seiten-Admin-Rechten autorisieren. Für den ersten Verbindungstest kann der offizielle [Token Generator](https://learn.microsoft.com/en-us/linkedin/shared/authentication/developer-portal-tools) verwendet werden. Client-ID/Secret allein sind noch keine Autorisierung für Unternehmensdaten.

Der verwendete [Share-Statistics-Endpunkt](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/organizations/share-statistics) verlangt laut Dokumentation `rw_organization_admin`, obwohl die Anwendung nur lesende GET-Anfragen ausführt. Er liefert organische Statistikdaten im rollierenden Zwölfmonatsfenster. Werbeanzeigen bleiben im getrennten Ads-Adapter und benötigen eine explizite Werbekonto-ID. Persönliche Scopes wie `r_member_profileAnalytics` und `r_member_postAnalytics` werden für diese Verbindung nicht benötigt.

Für die lokale Vorschau Zugangsdaten in der `.env` im Projektstamm hinterlegen und `scripts/dev.py` neu starten. API und Worker erhalten dieselbe Konfiguration. Tokens nicht in Chat, CSV-Export, Screenshots oder Browser-Frontend übernehmen. Erst eine erfolgreiche authentifizierte API-Abfrage bestätigt die Verbindung; eine vorhandene Client-ID ist kein Nachweis.

Mit `.venv/bin/python scripts/dev.py --scheduler` laufen lokal auch die stündliche Synchronisierung und die Monatsreport-Planung. Der Rechner und die Prozesse müssen dafür aktiv bleiben. Die echte Dashboard-Ansicht verwendet `/`, die Demo weiterhin `/?demo=1`.

Refresh-Tokens sind abhängig vom freigegebenen LinkedIn-Programm. Ohne zugelassenen Refresh-Token müssen ablaufende Zugriffstokens administrativ erneuert werden. Ein widerrufenes Token wird als Fehler dargestellt; bisherige Messwerte bleiben erhalten. Die Monatsreport-Qualität kann bei fehlenden Zugängen unvollständig sein.

## Word-Anmeldelisten

Unterstützt wird `.docx`, nicht das alte binäre `.doc`. Erwartete Spalten sind `E-Mail` und `Anmeldedatum`. Abweichende Überschriften lassen sich über `EVENT_EMAIL_COLUMN` und `EVENT_DATE_COLUMN` konfigurieren. Akzeptierte Datumsformen: `2026-08-01`, `01.08.2026`, `01/08/2026`.

Innerhalb einer Datei zählt dieselbe E-Mail-Adresse nur einmal. Namen und E-Mail-Adressen verlassen den Parser nicht; gespeichert werden nur Datum, Anzahl und Quellen-ID. Das ist eine Anmeldeanzahl, keine Teilnehmer- oder Lead-Qualitätsmessung.

Bei Uploads eine stabile Event-ID verwenden. Erneutes Hochladen dieser ID ersetzt die vorherigen Messwerte. Graph verwendet die stabile Drive-Item-ID. Eine Datei darf nicht zusätzlich manuell und über Graph für dasselbe Event importiert werden, sonst entstehen zwei unterschiedliche Quellen. Pro Event nur eine massgebliche Datei im Graph-Ordner ablegen; Kopien und Backups gehören ausserhalb dieses Ordners.

Fehlerhafte Zeilen führen zum Abbruch des gesamten Dateiimports; vorhandene Daten bleiben erhalten. Upload maximal 10 MB, entpackt maximal 40 MB. Beim Graph-Import führen ungültige Dateien zum Abbruch des Kanalimports, nicht zu stiller Teilübernahme.

## QR-CSV

```csv
date,scans
2026-08-01,25
2026-08-02,31
```

Maximal 1 MB. Nur ganze, nicht negative Scan-Zahlen; ungültige Daten und NaN werden zurückgewiesen. Gleiche Quellen-ID ersetzt den bisherigen Import. Mehrere Zeilen pro Datum innerhalb derselben Datei werden summiert. Ein automatischer QR-Adapter wird erst anhand der ausgewählten Anbieter-API ergänzt.

## LinkedIn: Beiträge, Videos und Follower (16.09.2026)

Die Sonio-Unternehmensseite `622072` verwendet zusätzlich den ausdrücklich genehmigten Scope `r_organization_social`. Posts API liefert die Beiträge; Share Statistics liefert beitragsbezogene Gesamtwerte seit Veröffentlichung. Diese Werte sind keine historischen Monatswerte. Die Tagesreihen der Organisation bleiben davon getrennt. LinkedIn-Klicks enthalten weitere Interaktionen und sind kein verlässlicher Ersatz für externe Website-Klicks; diese bleiben als nicht separat verfügbar gekennzeichnet.

Video Analytics liefert Aufrufe ab drei Sekunden, Zuschauende und Wiedergabezeit dieser Aufrufe. Fehlende/beschränkt verfügbare Videozahlen bleiben leer. Beiträge werden nach Veröffentlichungsmonat und optional Tag gefiltert, Kennzahlen zeigen den letzten Abrufstand. Migration `002_linkedin_posts` speichert diese Datensätze getrennt von Tageskennzahlen.

Follower Statistics liefert organische und bezahlte Zugewinne pro Tag. Network Sizes liefert den aktuellen Gesamtbestand, den das System täglich als beobachteten Stand aufbewahrt. Zugewinne sind keine Nettoveränderung; historische Gesamtbestände werden nicht daraus zurückgerechnet. Geplanter und manueller Sync aktualisieren Organisationszahlen, Follower und Posts; separate Fehlerzustände behalten zuletzt erfolgreich geladene Daten.

Die Oberfläche berechnet die durchschnittliche Betrachtungsdauer aus der qualifizierten Wiedergabezeit geteilt durch Videoaufrufe, umgerechnet von Millisekunden in Sekunden. Das ist ein berechneter Wert, kein zusätzlicher API-Messwert; fehlende Daten oder null Aufrufe liefern keinen Durchschnitt. Grundlage: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/video-analytics-api?view=li-lms-2026-04.
