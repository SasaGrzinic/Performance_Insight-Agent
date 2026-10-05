# Monatsvergleich und letzter erfolgreicher Stand

Nutzerentscheidung 05.10.2026, Review F01. Bestehende Designs und separate
Veröffentlichungs-/Ads-Zeiträume bleiben erhalten.

- Angezeigte Monatszahlen: zuletzt erfolgreich gespeicherte Werte des gewählten
  Monats. Kein Übertrag aus anderen Monaten, kein Fortschreiben einzelner Tage.
- Tendenz: eigene Vergleichswerte ab Monatsanfang bis zum gemeinsamen verfügbaren
  Kalendertag, begrenzt durch beide Monatslängen. Beide Perioden benötigen explizite
  Tageswerte für die Kennzahl. Innere Lücken sperren die Tendenz.
- Heute wird nicht verglichen. GA4 zusätzlich drei Kalendertage Verarbeitungspuffer.
  Das ist eine Betriebsregel und KEINE Vollständigkeitsgarantie des Providers.
  Letztes Messdatum, Abrufzeit und Vergleichsgrenzen werden getrennt geliefert.
- `values` können neuere Tage enthalten als `comparison_values`; nur letztere mit
  `previous` vergleichen. `comparisons` liefert Zeiträume, Begründung und Status.
- Tagesadapter analytics/youtube/linkedin_organic/google_ads: leere oder gegenüber
  vorhandenen Tageskennzahlen verkürzte Antworten ersetzen den letzten Stand nicht.
  Explizite Nullwerte ersetzen frühere Werte. Fehler bleiben im Kanalstatus sichtbar.
- Mailings, Event-Snapshots, QR und kampagnenweise LinkedIn-Ads erhalten ohne eigene
  bestätigte Abdeckung keine pauschale monatliche Tendenz. Ihre gespeicherten Werte
  und speziellen Detailansichten bleiben verfügbar.
- GA4-Seitendetails besitzen derzeit nur Monatsaggregate, keine geprüfte tägliche
  Abdeckung. Dort werden Prozentbewertungen ausgesetzt, vorhandene Werte erhalten.
- Regelbasierte Empfehlungen berücksichtigen nur vergleichbare Primärkennzahlen.
  Der spätere Agent erhält Zeiträume/Status; seine Zahlen- und Aussagenprüfung ist
  ein separates Arbeitspaket des Reviews. Keine pauschale Agentenabnahme behaupten.

## Noch nicht dadurch gelöst
Provider-spezifische Vollständigkeitssignale, Kampagnen-/Zieldefinitionen, der gemeinsame
Event-Datenfluss und einheitliche Detailwerkzeuge bleiben eigene Review-Arbeitspakete.
Automatische spätere Messwertkorrekturen sind weiterhin möglich.

## Quellen
- https://developers.google.com/youtube/analytics/reference/reports/query
- https://support.google.com/analytics/answer/11198161

## Google-Ads-Hauptkennzahlen – 05.10.2026
Klicks, Zielaktionen, Kosten pro Zielaktion und Ausgaben zeigen einen neutralen
Vormonatsvergleich. Eine zusätzliche tägliche Kampagnenabfrage liefert beide
Zeiträume. Die Filter bestimmen identische Kampagnen-IDs in beiden Perioden.
Der heutige Tag wird ausgeschlossen; beide Perioden enden am gleichen verfügbaren
Kalendertag. Fehlende Tageszeilen werden nicht als null interpretiert. Ohne
belegbare Tagesabdeckung oder bei Vorwert null wird keine Prozentzahl angezeigt.
CPA wird aus summierten Kosten und Zielaktionen berechnet. Die grossen Hauptwerte
können neuere Daten enthalten; die Infobox nennt die tatsächlichen Vergleichswerte.
Ein Fehler der Vergleichsabfrage lässt die Kampagnenhauptwerte verfügbar.
Google kann Conversions nachträglich korrigieren.
