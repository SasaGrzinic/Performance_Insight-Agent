# Referenzwerte statt fester Ziele — 05.10.2026

Laufende Aktivitäten erhalten numerische Orientierung, einschliesslich Organic.
Keine Ziele, Ampeln oder automatischen Über-/Unterbewertungen. Crossmediale Ziele
später. GA4-Link ohne Zahl entfernt; Mailchimp wegen Kontaktqualität zurückgestellt.

Implementierung: frontend/src/benchmarks.ts und components/BenchmarkNote.tsx.
Neutrale Zeile, zugänglicher Radix-Dialog; keine wachsenden KPI-Kacheln beim Öffnen.
Redaktionelle Werte, Recherche 05.10.2026, keine Live-Aktualisierung. Keine Übergabe
an Agent, Scores oder CSV als Ziele. Quelle und Grenzen stehen bei jedem Wert.

- LinkedIn Ads: flin, https://flin.agency/linkedin-ads-benchmark-2025/
  1’363 Anzeigen insgesamt 2024–2025, Schweizer Durchschnitt über Formate, kein
  IT-Median. Awareness CPM CHF 10.12; Traffic CTR 0.63 %, CPC CHF 5.37. Zielprüfung,
  vorhandener Messwert und CHF für Geldwerte erforderlich. Keine Zuordnung zu
  Landingpage-Klickrate/-CPC. Traffic-Referenzen bei CTR/CPC unter Details.
- Google Ads: https://www.wordstream.com/blog/2026-google-ads-benchmarks
  CTR 6.10 % Business Services, laut Methodik Median, 13’474 US-Suchkampagnen
  insgesamt April 2025–März 2026 (Google/Microsoft). Nur SEARCH; kein Schweizer
  IT-Benchmark, Brand/Nonbrand nicht getrennt. USD-CPC nicht neben CHF anzeigen.
- Organic: https://www.socialinsider.io/social-media-benchmarks/linkedin
  Plattformdurchschnitt 5.20 %, grobe Orientierung. Methodik 1,3 Mio. Posts,
  16’645 Unternehmensseiten 2024–2025; zusätzliche Quartalsupdates 2026.
  https://howto.socialinsider.io/en/articles/12305077-linkedin-metrics-differences-complete-overview
  Anbieter bietet Formeln mit/ohne Klicks; genaue Benchmark-Zuordnung nicht eindeutig.
  Sonio zählt Klicks. Keine direkte Erfolgsbewertung; Monatsrate nicht gleich
  Durchschnitt einzelner Postraten. Einschränkung ausdrücklich in Erklärung.
- Organic-Beitragsliste: interner Median desselben Formats, mindestens 3 vollständige
  geladene Posts. Einzeln gleich gewichtete Raten inkl. Klicks. Fehlend, negativ,
  nicht endlich und 0 Impressionen ausgeschlossen; 0 Interaktionen gültig.
  Anzahl sichtbar. Auswahl nach Veröffentlichungszeit, Gesamtstand bis Abruf;
  Beitragsalter nicht normalisiert. Bei Laden/Abfragefehler keine Referenz.
