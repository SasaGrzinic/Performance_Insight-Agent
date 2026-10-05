# Datenquellen einrichten

Secrets ausschliesslich auf dem Server in `.env` oder einem Secret-Manager speichern, nie im Browser, Repository oder Chat. Die UI erklärt die notwendigen Angaben und zeigt den Verbindungsstand; diese erste Fassung bietet bewusst keinen OAuth-Registrierungsassistenten. Autorisierte Tokens werden serverseitig hinterlegt.

| Kanal | Konfiguration | Anforderungen |
| --- | --- | --- |
| Google Ads | Google OAuth, `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_REFRESH_TOKEN`, optional `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Google Cloud-Projekt mit Explorer-Zugriff oder höher und Zugriff auf das Werbekonto; API v25. Seit 9.9.2026 ist kein Developer-Token mehr erforderlich. OAuth-Scope `adwords` ist anbieterseitig nicht rein lesend, die Anwendung ruft ausschliesslich Berichte ab. |
| GA4 | Google OAuth und `GA4_PROPERTY_ID` | Analytics Data API aktivieren, Property-Lesezugriff, `analytics.readonly`. |
| LinkedIn Ads | Eigene `LINKEDIN_ADS_ACCESS_TOKEN` oder `LINKEDIN_ADS_REFRESH_TOKEN` mit `LINKEDIN_ADS_CLIENT_ID`/`LINKEDIN_ADS_CLIENT_SECRET`; `LINKEDIN_AD_ACCOUNT_ID` | Advertising API, Leserechte `r_ads` und `r_ads_reporting`. Version 202608 als zuletzt verifiziertes Release. Kein Rückgriff auf Organic-Tokens. |
| LinkedIn Organic | Gleicher LinkedIn-Zugang und `LINKEDIN_ORGANIZATION_ID` | Community Management API, Unternehmensseiten-Admin und `rw_organization_admin` für den Statistik-Endpunkt. |
| Mailchimp | `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER` (z. B. us21) | API-Key des richtigen Accounts. Kampagnenreport-Endpunkt, Pagination wird vollständig gelesen. |
| YouTube | Google OAuth, `YOUTUBE_CHANNEL_ID` | `youtube.readonly` und `yt-analytics.readonly`; Kanal- und Video-Analytics. Aufrufe können Werbung als Zugriffsquelle enthalten; Werbekampagnenberichte sind separat. |
| Word über M365 | `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MS_DRIVE_ID`, `MS_FOLDER_ID` | Graph Application-Berechtigung auf den benötigten SharePoint-/OneDrive-Bereich beschränken und administrativ freigeben. DOCX-Dateien direkt im konfigurierten Ordner, kein rekursiver Unterordnerimport. |
| QR | Keine automatische Verbindung vor Anbieterwahl | Bis dahin UTF-8 CSV mit `date,scans`. |

## Google OAuth

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` konfigurieren. Für die drei Google-Adapter wird vor einem Import ein Zugriffstoken über den offiziellen Token-Endpunkt erneuert. Refresh-Token muss offline-Zugriff auf die erforderlichen Scopes haben. Ein Google-Testprojekt mit kurzlebigen Freigaben eignet sich nicht für unbeaufsichtigten Dauerbetrieb.

### YouTube-Einrichtung am 16.09.2026

Projekt `sonio-insights`: YouTube Data API v3 und YouTube Analytics API aktiviert.
OAuth-Webclient „Sonio Insights – Lokal“ erstellt; Client-Zugangsdaten lokal in
`.env` (0600). Testnutzer `marketing@sonio.com` ist hinterlegt. Die App steht auf
„Test“; Dauerbetrieb ist noch nicht freigegeben. Kanalautorisierung und erster
Analytics-Abruf wurden am 25.09.2026 mit der bestehenden Anmeldung erfolgreich verifiziert.

Der lokale Einrichtungshelfer `scripts/youtube_oauth.py` bindet ausschliesslich
`127.0.0.1:8766`. Start mit `.venv/bin/python scripts/youtube_oauth.py`, dann
`http://127.0.0.1:8766/start` öffnen. Er fordert `youtube.readonly` und
`yt-analytics.readonly` mit Offline-Zugriff an. Diese Leserechte sind bestätigt. State, PKCE, Sitzungscookie und Host-Prüfung schützen den Callback.
Erst nach Abgleich des autorisierten Kanals mit `@sonio-channel_2023` speichert
der Helfer Refresh-Token und Kanal-ID. Codes/Tokens werden nicht protokolliert.
Der Helfer endet nach Erfolg oder 30 Minuten. API/Worker erst nach erfolgreicher
Verifikation mit aktualisierter Konfiguration neu starten.

Die aktuelle Modulspezifikation steht in `YOUTUBE_REQUIREMENTS.md`.
Website-Conversions, Website-Sessions und Conversion Rate sind bis zur späteren
Analytics-Anbindung zurückgestellt und werden nicht bewertet.

### YouTube-Videothek — Nutzerentscheidung 25.09.2026

`/api/youtube/videos?month=YYYY-MM` wählt Videos nach ihrem Veröffentlichungsmonat
in Europe/Zurich aus. Die sieben angezeigten Kennzahlen beziehen sich auf den
aktuellen Gesamtstand seit Veröffentlichung, nicht auf Aktivitäten im ausgewählten
Monat. Dies ersetzt die frühere Monatskennzahlen-Ansicht der Videothek.

Der Adapter prüft den autorisierten Sonio-Kanal und paginiert Uploads/Playlists.
Titel, Vorschaubild, Veröffentlichungsdatum und Videolänge stammen aus der Data API.
Aktuelle Aufrufe, Likes und Kommentare kommen aus deren `statistics`; Wiedergabezeit,
durchschnittliche Dauer, durchschnittlich angesehener Anteil und Teilungen aus
YouTube Analytics ab Veröffentlichung bis heute. Analytics kann verzögert sein;
die Quellen müssen deshalb nicht denselben Abrufstand abbilden. Fehlende Werte
bleiben fehlend, bei fehlenden Aufrufen wird kein Durchschnitt erfunden.

Der getrennte Cache `youtube:published:` verhindert die Übernahme alter monatlicher
Snapshots. Er gilt eine Stunde; «Videos aktualisieren» erzwingt einen Abruf.
Bei Providerfehlern bleibt ein vorhandener erfolgreicher Stand mit Warnung sichtbar.
Die Playlist-Auswahl filtert Videozugehörigkeit, nicht Wiedergaben in der Playlist.

`/api/youtube/videos/{video}/traffic?month=YYYY-MM` zeigt ebenfalls aggregierte
Zugriffsquellen seit Veröffentlichung für ein Video des ausgewählten Sonio-Bestands.
Werbung kann als Quelle enthalten sein; eine vollständige Trennung sämtlicher
Video-KPIs nach organisch/bezahlt ist damit nicht umgesetzt. Neue Abonnenten bleiben
ausgeblendet. Die öffentliche Demo ruft keine Live-Videodetails ab.

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

### LinkedIn Ads: Zugriffsvorbereitung am 24.09.2026

Vom Nutzer angegebenes Werbekonto: `514253005`. Lesende Prüfungen mit dem bestehenden Community-Token auf `adAccounts/514253005` und `adAnalytics` liefern jeweils HTTP403 (fehlende Rechte). Noch keine Ads-Daten importiert, Kontoinhaber und Währung noch nicht verifiziert.

Im Entwicklerportal blockiert LinkedIn das Hinzufügen der Advertising API zur Community-App «Sonio Teams Bot» (`247434008`): das vorhandene Produkt muss aus rechtlichen/Sicherheitsgründen allein in der App bleiben. Die vorhandene separate App «Sonio Insights» (`266496062`, Client-ID `78gkyi1f4ne85e`) kann einen Advertising-Development-Tier-Antrag stellen. Der vorbereitete Dialog verlangt Zustimmung zu API-/Marketing-API-Bedingungen, danach ein Antragsformular innerhalb von21Tagen und LinkedIn-Prüfung. Zustimmung/Absenden noch ausstehend.

Nach Freigabe: separaten Ads-Zugang mit `r_ads` und `r_ads_reporting` autorisieren und getrennt vom organischen Zugang speichern; bestehende Community-Tokens nicht ersetzen. Kontozuordnung und Kontowährung prüfen, bevor der Adapter für echte Importe aktiviert wird.

### Advertising-Freigabe und Einrichtung, 24.09.2026

Advertising API Development Tier für «Sonio Insights» (`266496062`, Client-ID
`78gkyi1f4ne85e`) im Entwicklerportal bestätigt. Nutzer hat `r_ads` und
`r_ads_reporting`, den offiziellen Token-Generator-Callback sowie die geschützte
lokale Speicherung ausdrücklich freigegeben. Callback gespeichert, ausschliesslich
diese beiden Scopes ausgewählt. LinkedIn verlangt im OAuth-Dialog erneut den
persönlichen Login; bis zu dessen Abschluss kein Ads-Token gespeichert und kein
Ads-Datenimport bestätigt. Zielkonto bleibt `514253005`; Kontoinhaber und Währung
müssen nach dem Login anhand der API geprüft werden.

Backend verwendet für Ads ausschliesslich eigene `LINKEDIN_ADS_*`-Zugangsdaten.
Die vorhandenen `LINKEDIN_*`-Tokens für Organic bleiben erhalten. Bei fehlenden
Ads-Zugangsdaten ist der Kanal nicht konfiguriert, statt den Organic-Token zu nutzen.

### Erfolgreicher Ads-Anschluss, 24.09.2026

Die zuvor ausstehende Anmeldung ist abgeschlossen. Access- und Refresh-Token sowie
App-Schlüssel separat in `.env` (0600) gespeichert; Organic-Zugang erhalten.
Refresh-Token-Austausch und Kontoabruf live erfolgreich. Konto `514253005` heisst
«Boosten_Sonio AG_Feb 5, 2025», Referenz `urn:li:organization:622072`, Währung CHF.

Nutzerfokus: letzte 365 Tage inklusive heute. Worker/Scheduler und manueller
Ads-Sync aktualisieren dieses rollierende Fenster. Erstimport: 25.09.2025–24.09.2026,
40 Kampagnen-Tagesmesswerte an 10 Tagen (22.–31.01.2026), eine Kampagne mit
gelieferten Kennzahlen: `475515244`, «Beitrag Brand Awareness am 22. Januar 2026
um 07:18 boosten». 33'500 Impressionen, 70 Klicks, CHF 499.95 Ausgaben, 0 von
LinkedIn gemeldete Conversions. Fünf Kampagnenmetadaten im Konto vorhanden, aber
nur diese Kampagne liefert im angefragten Fenster Statistikzeilen. Fehlende
Statistikzeilen werden nicht als gemessene Nullwerte angelegt.

Die bestehende Monatsansicht zeigt diese Daten im Januar 2026. Detaillierter
lokaler CSV-Erstexport: `.local/LinkedIn-Ads-letzte-365-Tage.csv`. Kampagnen-URNs
bleiben in den Datenbankmesswerten erhalten; Kampagnennamen stehen im Export.
Eine eigene Kampagnenliste in der Oberfläche wurde noch nicht ergänzt.

API: [Reporting](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/ads-reporting),
[Campaigns](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-campaigns).
`adAnalytics` unterstützt keine Pagination (15'000-Zeilen-Limit): 31-Tage-Fenster
werden bei Erreichen des Limits weiter geteilt. `fields` verlangt literale Kommas;
doppelt/strukturell falsch kodierte Projektionen wurden korrigiert.

### Kampagnenansicht statt Monatsvergleich

LinkedIn Ads besitzt eine eigene geschützte `/api/linkedin/ads/campaigns`-Abfrage.
Migration 003 speichert Titel, Ziel, API-Status, geplante Laufzeit und Währung
separat von Tageskennzahlen. Metadaten und Messwerte werden gemeinsam atomar
aktualisiert. Die Ansicht listet alle fünf bekannten Kampagnen; auch ältere bleiben
sichtbar, ihre Kennzahlen sind ausdrücklich auf das rollierende 365-Tage-Fenster
begrenzt. Fehlende Statistikzeilen bleiben leer. Kampagnen mit Monatswechsel werden
über das gesamte Fenster summiert, CTR und CPC aus den Summen berechnet.
Ads hat keine Monatsauswahl und keinen Vergleichsgraphen mehr; Organic behält sie.
CSV-Auswahl und Titelsuche beziehen sich auf die Kampagnenliste. Die Texte unter
«Ergebnisse einordnen» sind feste, zielbezogene Lesehilfen, keine KI-Analyse.

### Mailchimp — Zugang bestätigt am 25.09.2026
- API-Konto `Sonio AG`, Datacenter `us12`; Schlüsselname `Sonio Insights`.
- Freigegebener Schlüssel nur in ignorierter `.env` mit Dateirechten 0600. Schlüssel läuft gemäss Mailchimp am 25.09.2027 ab; vor Ablauf ersetzen.
- Lesender Konto-, Kampagnen- und Reportzugriff geprüft; keine Kontakte abgerufen, keine Kampagnen verändert oder versendet.
- Bestehender Monatsconnector aktiviert. Seine drei bisherigen Metriken sind vorläufig; fachliche KPI-Auswahl erfolgt erst mit dem Nutzer nach der Anbindung.
- Live-Zugang ist ausschliesslich lokal eingerichtet, nicht in der öffentlichen GitHub-Pages-Demo.

Mailchimp-2026-Basis: eigener Jahresimport aller als sent gelieferten Kampagnen,
mit Pagination, Titel/Betreff/Versandzeit und aggregierten Berichten. Kein Abruf
von Kontakten. Test/Testmailing/Testversand und Template im Titel/Betreff werden
von Übersicht und Metrics ausgeschlossen. «Resend» bleibt enthalten.
MailchimpCampaign (Migration 004) speichert Metadaten; nicht mehr im vollständigen
Snapshot enthaltene Zeilen werden reversibel ausgeblendet, nicht gelöscht.
Gruppierung ist titel-/betreffbasiert, keine gesicherte Provider-Eventzuordnung.
Fly7 wurde vom Nutzer am 25.09.2026 bestätigt: fünf Sendungen als eine Serie,
mit Initialmailing, zwei Remindern, Eventinformationen und Dankesmailing.
Zuordnung über die fünf bestätigten Kampagnen-IDs, keine pauschale Betreffvermutung.

Mailchimp-KPI-Erweiterung am 25.09.2026: Klick-/Öffnungsraten aus den Reportfeldern
werden von Bruchteilen in Prozent umgerechnet. Zustellungen = Versendet minus Hard-
und Soft-Bounces; Zustellrate bezogen auf Versendet, Abmelderate auf Zustellungen.
Fehlende Daten und Null-Nenner ergeben keine Rate. Prozentwerte bleiben nur in
Mailing-Metadaten, werden nicht als additive Tages-/Monats-Metrics gespeichert.
Event-Anmeldeattribution laut Nutzer ausdrücklich später; bisherige Seriengruppierung
bleibt erhalten. Grundlage: Mailchimp Help «About Email Reports» und «About Open and Click Rates».

### GA4-Live-Anbindung 25.09.2026

Property Sonio NEW – GA4 (358384645), Konto Sonio AG (75827860) im Browser
verifiziert. Analytics Data API im bestehenden Projekt sonio-insights aktiviert.
Separater GA4_REFRESH_TOKEN mit analytics.readonly; vorhandener Google-Client,
YouTube-Token unverändert. Helfer scripts/analytics_oauth.py verifiziert runReport
vor Speicherung. August/September importiert; lokale API/Worker/Scheduler aktiv.
Die bisherigen gemeinsamen Google-Token-Hinweise gelten für GA4 nur als Legacy-
Fallback; konfigurierte separate GA4-Zugangsdaten haben Vorrang.


### GA4-Kampagnen und Vorstellungsseiten — frühere Monatsabfrage

Die folgenden Monatsendpoints bleiben technisch verfügbar. Ihre frühere UI wurde
durch die unten dokumentierte Veröffentlichungsansicht ersetzt.

Die geschützte GET-Abfrage `/api/analytics/campaigns?month=YYYY-MM` liefert die
ursprünglich 17 vorgegebenen eindeutigen Seiten: 14 Kampagnen und drei ausdrücklich als
Visitenpage benannte Vorstellungsseiten. Business Continuity DE/FR zählt wegen
der identischen URL einmal. `ga4_campaigns.py` filtert exakt nach bereinigtem
`pagePath` (mit/ohne abschliessenden Slash) und den Hosts sonio.com/www.sonio.com.
Übergebene CMS-Vorschauparameter werden nicht in Seitenliste oder Links übernommen.

Je Seite: `screenPageViews`, `totalUsers`, `sessions` und aktive Zeit je Besucher
(`userEngagementDuration / totalUsers`, Sekunden; bei Null-Nenner fehlend).
Gemessen werden Seitenaufrufe, nicht ausschliesslich Einstiege. Besucher/Sitzungen
verschiedener Seiten dürfen nicht summiert werden. Der laufende Monat wird mit
entsprechend begrenztem Vormonatszeitraum verglichen.

Zusätzlich aktuelle Quellen nach GA4-Standardkanalgruppe, `newVsReturning` und
`eventCount` für gelieferte Download-/Videoereignisse. Neue und wiederkehrende
Nutzer sind keine zwingend überschneidungsfreien Gruppen. Fehlende Zeilen bleiben
fehlend, nicht null; fehlende Ereignisse beweisen weder null Nutzung noch aktives
Tracking. GA4-Datenschutzschwellen werden angezeigt. Cache eine Stunde;
öffentliche Demo ohne diese Live-Seitendetails.

### GA4-Inhaltsauswertung — frühere Monatsabfrage

`ga4_content.py` ergänzt die geschützte GET-Abfrage
`/api/analytics/content?month=YYYY-MM` für Kompetenzfelder, Blogartikel, Newsartikel
und Customer Stories. Die Zuordnung erfolgt über Website-Pfade; `/fr-ch/` bleibt
als separate französische Seite erhalten. Abgefragt werden ausschliesslich die
Hosts `sonio.com` und `www.sonio.com`, alle Berichtsseiten über `offset`.
Enthalten sind Pfade mit gelieferten Werten im Monat oder der Vorperiode;
Seiten ohne Werte in beiden Zeiträumen sind kein Bestandteil dieses Berichts.

`screenPageViews`, `totalUsers`, `sessions` und `userEngagementDuration` werden je
`pagePath` abgefragt. Aktive Sekunden je Besucher ergeben sich aus
`userEngagementDuration / totalUsers`; ein Null-Nenner bleibt fehlend. Die separate
Abfrage mit `pageTitle` dient nur der Titelwahl nach den meisten Seitenaufrufen,
nicht der Addition von Nutzern oder Sitzungen. Ohne Titel wird der Pfad angezeigt.
Der laufende Monat begrenzt auch die Vorperiode auf denselben Kalendertag.

Cache je Monat eine Stunde, mit `refresh=true` erneuerbar. Bei Abruffehlern bleibt
der letzte erfolgreiche Stand mit Warnung verfügbar. Datenschutzschwellen und
Abrufstand erscheinen in der Ansicht. DE/FR und einzelne Seiten werden nicht
zusammengezählt; Überschneidungen mit dem separaten Kampagnenblock sind möglich.
Die öffentliche Demo ruft keine Live-Inhaltsdaten ab.


### GA4-Veröffentlichungsansicht — aktueller Stand 25.09.2026

`ga4_areas.py` stellt die authentifizierten GET-Endpunkte
`/api/analytics/areas?area=blog&period=2026-06` und
`/api/analytics/area-traffic?area=blog&path=…` bereit. Bereiche sind `campaign`,
`profile`, `competence`, `blog`, `news`, `stories`; `period` akzeptiert `YYYY-MM`,
`YYYY` oder `unknown`. Die Auswahl bestimmt die Veröffentlichung der Seiten,
**nicht** den Messzeitraum. `AnalyticsContent.tsx` ersetzt die bisherigen beiden
Detailblöcke; der allgemeine monatliche Kanalverlauf bleibt davon unabhängig.

Der Katalog verbindet festgelegte Kampagnen-/Vorstellungsseiten mit öffentlichen
Sitemap-Pfaden. Die Vorstellungsseiten umfassen inzwischen auch Paddy Gloor und
Roman Lorenz (insgesamt 19 festgelegte Seiten, 14 Kampagnen und 5 Profile).
Öffentliche `__NEXT_DATA__` liefern Titel, Originalbild und Datum. Redaktionelles
`content.date` hat Vorrang vor `first_published_at` in Europe/Zurich; `updated_at`,
`published_at` und `created_at` ersetzen kein Veröffentlichungsdatum. Metadaten
älterer Seiten können fehlen oder nicht abrufbar sein. Solche Seiten erhalten
kein erfundenes Datum und bleiben unter «Ohne Veröffentlichungsdatum» sichtbar.

Je exaktem bereinigtem Pfad auf `sonio.com`/`www.sonio.com` werden
`screenPageViews`, `totalUsers`, `sessions` und `userEngagementDuration` seit
Veröffentlichung bis heute abgefragt, frühestens ab 1.1.2020. Unbekannte Daten
verwenden den ausdrücklich bezeichneten verfügbaren Zeitraum ab 1.1.2020.
GA4 kann nur seit aktivem Tracking vorhandene Messwerte liefern. Die Abfrage
verwendet `batchRunReports` mit höchstens fünf Berichten je Anfrage. Aktive Zeit
je Besucher ist `userEngagementDuration / totalUsers`; Null-Nenner und fehlende
Zeilen bleiben fehlend. Jahresauswahl summiert keine Monatsnutzer; Besucher und
Sitzungen verschiedener Seiten dürfen nicht addiert werden. DE/FR bleiben getrennt.

Details je Seite nutzen denselben Zeitraum: Standardkanalgruppen,
Quelle/Medium, Länder, Länder/Regionen, `newVsReturning` und gelieferte
Download-/Videoereignisse. Alle Berichtsseiten werden über Offset geladen;
Datenschutzschwellen und zusammengefasste Detailwerte werden gekennzeichnet.
Organisch/bezahlt folgen den GA4-Kanalgruppen, sonstige Kanäle bleiben separat.
Geografie ist eine ungefähre Zuordnung; Besucher können in mehreren Gruppen
vorkommen. Fehlende Ereignisse beweisen kein eingerichtetes Tracking.

Katalogcache: 24 Stunden; Kennzahlen und Herkunft: eine Stunde. `refresh=true`
erneuert den Abruf, Fehler erhalten den letzten erfolgreichen Stand mit Warnung.
Die öffentliche Demo ruft keine Live-Daten dieser Bereiche ab. Die UI merkt sich
je Bereich den Veröffentlichungszeitraum und zeigt Originalbilder, Bereichsheader,
Einzelseitenwahl sowie aufklappbare Herkunft/Geo/Aktionen im bestehenden Design.

### LinkedIn Ads: Lead-Generierung und geplante Kampagnen (05.10.2026)

Der Kampagnenfinder wird ohne Status-/Datumsfilter vollständig paginiert. Auch
Entwürfe und zukünftige Kampagnen werden gespeichert und ohne Messwerte angezeigt.
Der 365-Tage-Zeitraum begrenzt nur Messwerte. Ein zukünftiger Start bei ACTIVE wird
als «Geplant» angezeigt; DRAFT bleibt «Entwurf». Es werden keine Kampagnen angelegt,
aktiviert oder verändert.

Ads-Reporting lädt zusätzlich `oneClickLeads` → `leads` und
`oneClickLeadFormOpens` → `lead_form_opens`. LEAD_GENERATION-Kampagnen zeigen
Impressionen, Leads (LinkedIn-Formular), Kosten/Lead, Formularöffnungen,
Formular-Abschlussrate und Ausgaben. CPL = Ausgaben/Leads; Abschlussrate =
Leads/Öffnungen × 100. Fehlende oder nicht berechenbare Werte bleiben «—»;
echte gelieferte Nullen bleiben null. CSV-Auswahl enthält die neuen Felder.
Website-Conversions bleiben getrennt. Keine Kontaktdaten, keine Lead-Sync-API,
keine weiteren Berechtigungen angefordert. Leads sind noch keine qualifizierten
Verkaufschancen. Sponsored-Messaging-Sondermetriken werden nicht hinzugerechnet.

Quelle: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/ads-reporting-schema
Live-Kampagnenfinder am 05.10.2026 für Sonio-Konto 514253005: fünf bekannte Kampagnen,
noch keine LEAD_GENERATION-Kampagne, kein Entwurf mit zukünftiger Laufzeit geliefert.
Eine neue Kampagne kann erst mit ihrer tatsächlichen API-Metadatenlieferung erscheinen.
