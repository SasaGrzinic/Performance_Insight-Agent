# Kennzahlen und fachliche Grenzen

Die hier enthaltenen Kennzahlen sind Vorschläge, keine vom Nutzer bestätigten endgültigen KPIs.

| Kanal | Unterstützte Messwerte |
| --- | --- |
| Google Ads | Impressionen, Klicks, Conversions, Werbekosten in Kontowährung |
| GA4 | Sitzungen, engagierte Sitzungen, Schlüsselereignisse |
| LinkedIn Ads | Impressionen, Klicks, Website-Conversions, Kosten in konfigurierter Kontowährung |
| LinkedIn Organic | Impressionen, Klicks, Likes, Kommentare, geteilte Beiträge |
| Mailchimp | Versandte E-Mails, eindeutige Öffnende je Kampagne, eindeutige Klickende je Kampagne |
| YouTube | Aufrufe, Wiedergabeminuten, gewonnene Abonnenten |
| Events | Deduplizierte Anmeldungen pro Quelldatei |
| QR | Scans pro Datum/Quelle |

Die Übersicht verwendet zunächst Google-Ads-Conversions, GA4-Sitzungen, Mailchimp-Klickende und Event-Anmeldungen. Der Master-Admin kann Auswahl, Labels und Monatsziele ändern. Der Tageschart zeigt je Kanal dessen Kernkennzahl; weitere Kennzahlen stehen auf der Kanalseite. Conversions dürfen wegen Attribution Bruchteile enthalten und werden bis auf zwei Nachkommastellen dargestellt.

Alle gespeicherten Basiswerte sind additiv je Quelle und Datum. Quoten dürfen nicht durch Summieren oder ungewichtetes Mitteln von Tagesprozenten ergänzt werden. Beispielsweise wird CTR später aus Gesamtklicks / Gesamtimpressionen berechnet. Monatliche Unique Users benötigen einen eigenen Periodenabruf und sind deshalb nicht als Summe täglicher Nutzer implementiert.

Der Vormonatsvergleich eines laufenden Monats verwendet dieselbe Anzahl vergangener Kalendertage, begrenzt auf die Länge des Vormonats. Historische abgeschlossene Monate werden vollständig verglichen. Fehlende Daten oder ein Vergleichswert von null führen zu keiner Prozentangabe.

Plattform-Attributionen sind nicht kanalübergreifend dedupliziert; Google Ads und LinkedIn können dieselbe Conversion zählen. Es gibt deshalb keinen erfundenen Gesamt-Lead- oder Gesamt-ROI-Wert. Bei unterschiedlichen Kontowährungen findet keine automatische Umrechnung statt.

Mailchimp summiert Kampagnenkohorten nach Versanddatum und liest ihren aktuellen Reportstand. Die Summe eindeutiger Klickender je Kampagne ist keine kampagnenübergreifend eindeutige Personenanzahl. Öffnungen können von E-Mail-Privacy-Funktionen beeinflusst werden.

Zeitstempel für geplante Aufträge folgen `REPORT_TIMEZONE`; die Tagesgrenzen von Google Ads/GA4 folgen den jeweiligen Kontoeinstellungen. Mailchimp-Versanddaten und LinkedIn-Organisationsintervalle werden in UTC zugeordnet. Für verlässliche länderübergreifende Vergleiche müssen Kontozonen und die gewünschte fachliche Tagesgrenze vor Live-Freigabe abgestimmt werden.
