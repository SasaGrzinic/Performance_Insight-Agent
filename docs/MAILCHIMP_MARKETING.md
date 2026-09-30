# Mailchimp Marketing-Ansicht
Stand: 30. September 2026

Marketing zuerst: Zustellung, Interesse und Abmeldungen. Vier Hauptwerte pro Mailing und für die gewählte Gruppe: Zugestellt, Klickende, Klickrate, Abmelderate. Gesamtquoten nach Zustellungen gewichtet, keine Mittelwerte der Prozentwerte. Fehlt ein benötigter Wert, wird keine vollständige Summe vorgetäuscht. Klickende sind nur innerhalb eines Mailings eindeutig.

Versandmonat bzw. ganzes Jahr 2026 wählen Gruppen; verbundene Initial-/Reminder-/Dankesmailings bleiben sichtbar, auch über Monatsgrenzen. Aktuelle kumulierte Berichte seit Versand. Keine neuen Eventserien-Funktionen. Bestehende Test-/Vorlagenausschlüsse bleiben.

`/api/mailchimp/campaigns/{campaign_id}/insights` liest ausschliesslich aggregierte Linkberichte bekannter, aktiver Mailings. Pagination, Duplikatprüfung, Cache eine Stunde; neue Sync-Snapshots bekommen einen eigenen Cache-Schlüssel. Fehler lassen einen vorhandenen Cache mit Warnung sichtbar. Website-Fehler beeinflussen Linkberichte nicht.

Top 3 Links nach eindeutig Klickenden je Link; keine Addition zu eindeutigen Personen. URL-Query und Fragment bleiben verborgen. Mailchimp-Botfilterstand der API ist nicht bestätigt, Öffnungen nur ergänzend.

GA4: Nur exakte Kampagnennamen mit eingebetteter Mailchimp-ID in Links auf sonio.com/www.sonio.com und Medium `email`. Filter auf diese Kennungen, Sonio-Hosts und E-Mail. Sitzungen und engagierte Sitzungen seit Versand bis heute separat ausweisen. Keine Zuordnung bei bloss ähnlichen Titeln oder fehlenden Kennungen. Bestehende Mailings werden nicht verändert; eine künftige UTM-Konvention ist separat einzurichten.

Nach Nutzerkorrektur: gemeinsames Sonio-Headerbild und identische Hero-Gestaltung wie die anderen Kanalseiten. Originalbilder in den Mailing-Kacheln vollständig im natürlichen Seitenverhältnis, ohne Beschnitt. Vier KPI-Infoboxen, zwei Kacheln pro Reihe, Wissensbereich und zwei Empfehlungen vor dem Zitat. Beispiele in Empfehlungen bleiben gekennzeichnet.

Quellen: https://mailchimp.com/developer/marketing/api/click-reports/ ; https://mailchimp.com/help/about-bot-activity/ ; https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
