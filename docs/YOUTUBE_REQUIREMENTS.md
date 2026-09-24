# Aktueller Umfang — Präzisierung vom 16.09.2026

Website-Conversions, Website-Sessions und Conversion Rate werden bis zur späteren
Analytics-Anbindung zurückgestellt. Sie erscheinen vorerst weder als KPI noch als
Warnung oder Handlungsempfehlung. Damit umfasst die Management-Sicht vier und die
operative Sicht sieben zentrale Kennzahlen. Die Conversion-Gewichtung von 35 %
wird nicht auf andere Dimensionen verteilt; ein etwaiger Score bleibt vorläufig
mit expliziter Datenabdeckung. Die ursprüngliche Spezifikation darunter beschreibt
auch den späteren Ausbau und wird durch diese Präzisierung eingeschränkt.

Die bereits begonnene YouTube-API-Anbindung wird zuerst abgeschlossen. CSV-/Excel-
Import bleibt als ergänzender Zugang für nicht verfügbare API-Kennzahlen vorgesehen.

---

Die operative Sicht wird auf genau acht steuerungsrelevante Kennzahlen reduziert. Sprache, Format, Kampagne und organisch/bezahlt bleiben nur Filter und zählen nicht als zusätzliche KPIs.

# Auftrag an Codex: YouTube-Modul integrieren

## Projektkontext

Erweitere den bestehenden Marketing Performance & Insight Manager um ein YouTube-Modul.

Das Modul soll nicht einfach YouTube-Zahlen darstellen. Es soll beurteilen, ob die Videos von Sonio:

* relevante Reichweite erzielen,
* gefunden und angeklickt werden,
* die Aufmerksamkeit der Zuschauer halten,
* messbare Website-Aktionen oder Conversions auslösen.

Nutze die bestehende Architektur, Navigation, Designsprache und Komponentenlogik des Dashboards. Bestehende Funktionen dürfen nicht beeinträchtigt werden.

## Grundprinzip

Die Auswertung muss folgende Fragen beantworten:

1. Was ist passiert?
2. Warum könnte es passiert sein?
3. Was bedeutet es?
4. Was sollen wir konkret tun?

Belegte Beobachtungen, vermutete Ursachen und Empfehlungen müssen klar getrennt werden.

---

# 1. Management View

Die Management View zeigt ausschliesslich fünf Haupt-KPIs.

| Haupt-KPI                     | Bedeutung                                                       |
| ----------------------------- | --------------------------------------------------------------- |
| **Engaged Views**             | Aufrufe, bei denen das Video tatsächlich angesehen wurde        |
| **Watch Time**                | Gesamte erzeugte Aufmerksamkeit in Stunden                      |
| **Average Percentage Viewed** | Durchschnittlich angesehener Anteil eines Videos                |
| **Impressions CTR**           | Anteil der Impressionen, die zu einem Videoaufruf führten       |
| **Business Conversions**      | Website-Aktionen, Downloads, Anmeldungen oder Leads aus YouTube |

Zu jedem KPI sind anzuzeigen:

* aktueller Wert
* Veränderung zur Vorperiode
* Vergleich mit Zielwert oder interner Baseline
* Ampel oder Bewertung
* kurze Interpretation
* wichtigste Handlungsempfehlung

Reine Views dürfen ergänzend angezeigt werden, sind aber kein Haupt-KPI.

---

# 2. Operative Marketing View

Die operative Sicht wird auf genau acht Kennzahlen begrenzt.

| Nr. | Kennzahl                       | Optimierungsfrage                                               |
| --: | ------------------------------ | --------------------------------------------------------------- |
|   1 | **Engaged Views**              | Welche Videos werden tatsächlich angesehen?                     |
|   2 | **Impressions**                | Welche Videos erhalten Sichtbarkeit auf YouTube?                |
|   3 | **Impressions CTR**            | Funktionieren Thema, Titel und Thumbnail?                       |
|   4 | **Watch Time**                 | Welche Videos erzeugen insgesamt die meiste Aufmerksamkeit?     |
|   5 | **Average Percentage Viewed**  | Wie viel eines Videos wird durchschnittlich konsumiert?         |
|   6 | **Retention nach 30 Sekunden** | Funktionieren Einstieg und Nutzenversprechen?                   |
|   7 | **Traffic Sources**            | Über welche Quellen werden die Videos gefunden?                 |
|   8 | **Business Conversions**       | Welche Videos führen zu relevanten Website-Aktionen oder Leads? |

Likes, Kommentare, Shares, Abonnenten und weitere Detailwerte sollen nicht Teil der zentralen operativen Sicht sein. Sie können später in einer Detailansicht ergänzt werden.

## Filter

Die folgenden Angaben sind Filter und keine zusätzlichen KPIs:

* Zeitraum
* einzelnes Video
* Thema oder Kampagne
* Sprache DE oder FR
* Longform, Shorts oder Live
* organisch oder bezahlt
* Veröffentlichungsdatum
* Videolänge

---

# 3. Qualität der Aufmerksamkeit

Für die Bewertung der Aufmerksamkeitsqualität sind insbesondere diese vier Kennzahlen zu kombinieren:

* Watch Time
* Average Percentage Viewed
* Retention nach 30 Sekunden
* Engaged Views

## Interpretationslogik

### Hohe CTR und hohe Wiedergabequote

Thema, Thumbnail, Titel und Inhalt funktionieren.

**Empfehlung:** Thema oder Format weiterführen und für ähnliche Inhalte nutzen.

### Hohe CTR und tiefe Wiedergabequote

Titel und Thumbnail lösen Interesse aus, der Inhalt erfüllt die Erwartung jedoch nicht ausreichend.

**Empfehlung:** Einstieg, Aufbau und Übereinstimmung zwischen Versprechen und Inhalt prüfen.

### Tiefe CTR und hohe Wiedergabequote

Der Inhalt überzeugt die Zuschauer, wird aber nicht attraktiv genug präsentiert.

**Empfehlung:** Titel und Thumbnail optimieren.

### Tiefe CTR und tiefe Wiedergabequote

Thema, Zielgruppenrelevanz und Umsetzung müssen grundsätzlich überprüft werden.

**Empfehlung:** Inhalt nicht einfach wiederholen, sondern Format oder Themenansatz überarbeiten.

### Starker Rückgang innerhalb der ersten 30 Sekunden

Der Einstieg ist zu lang, der Nutzen nicht klar oder die Erwartung wird nicht erfüllt.

**Empfehlung:** Kernaussage und Nutzen früher platzieren.

---

# 4. Reichweite und Auffindbarkeit

Für die Bewertung von Reichweite und Auffindbarkeit sind folgende Kennzahlen zu kombinieren:

* Impressions
* Impressions CTR
* Engaged Views
* Traffic Sources

Die Traffic Sources sind mindestens aufzuteilen in:

* YouTube Search
* Suggested Videos
* Browse Features
* Channel Pages
* External
* Direct oder Unknown
* Playlists
* YouTube Advertising, sofern vorhanden

## Interpretationslogik

### Impressions steigen, CTR bleibt stabil

YouTube spielt die Inhalte einer grösseren Zielgruppe aus, ohne dass die Relevanz abnimmt.

### Impressions steigen, CTR sinkt

Die Reichweite wächst, die zusätzlich erreichte Zielgruppe reagiert aber weniger stark.

### Hoher Anteil YouTube Search

Das Thema besitzt Suchrelevanz und möglicherweise langfristiges Evergreen-Potenzial.

### Hoher Anteil Suggested Videos

Das Video wird innerhalb von YouTube als thematisch relevant eingestuft.

### Hoher externer Anteil

Die Reichweite wird hauptsächlich über Website, LinkedIn, Newsletter oder Kampagnen erzeugt.

### Hohe Impressions, aber wenige Engaged Views

Das Video wird sichtbar, überzeugt aber nach der Einblendung oder beim Start nicht ausreichend.

---

# 5. Business Conversions

YouTube muss mit Website-, Kampagnen- und später möglichst auch CRM-Daten verbunden werden.

Als Business Conversions gelten:

* Website-Sessions aus YouTube
* CTA-Klicks
* Downloads
* Event- oder Webinar-Anmeldungen
* Kontaktanfragen
* Marketing Qualified Leads
* beeinflusste Opportunities, sofern nachvollziehbar

Alle Links müssen über konsistente UTM-Parameter zuordenbar sein.

## Berechnung

**Conversion Rate**

Business Conversions ÷ YouTube-Website-Sessions × 100

Falls noch keine Conversion-Daten vorliegen, muss das Dashboard dies als Datenlücke kennzeichnen. Es dürfen keine Werte geschätzt oder erfunden werden.

---

# 6. YouTube-Score

Berechne einen YouTube-Score zwischen 0 und 100.

| Dimension                     | Gewichtung |
| ----------------------------- | ---------: |
| Business Conversions          |       35 % |
| Qualität der Aufmerksamkeit   |       30 % |
| Reichweite und Auffindbarkeit |       20 % |
| Zuschauerbindung              |       10 % |
| ergänzende Interaktion        |        5 % |

Falls für eine Dimension noch keine belastbaren Daten vorhanden sind:

* keine Bewertung erfinden,
* Datenlücke sichtbar machen,
* Score als vorläufig kennzeichnen,
* verfügbare Dimensionen nicht automatisch auf 100 Prozent hochrechnen.

Die Bewertung soll primär auf der eigenen Sonio-Baseline der letzten sechs bis zwölf Monate basieren.

---

# 7. Verbindliche Bewertungsregeln

* Shorts, Longform und Live getrennt bewerten.
* Organische und bezahlte Performance trennen.
* DE- und FR-Inhalte separat auswertbar machen.
* Videos nur mit ähnlicher Länge und vergleichbarem Alter vergleichen.
* CTR nur bei ausreichender Anzahl Impressions interpretieren.
* Kleine Datenmengen nicht überbewerten.
* Externe Benchmarks nur als Orientierung verwenden.
* Interne Vorperioden und Baselines priorisieren.
* Korrelationen nicht als gesicherte Ursachen darstellen.
* Jede Warnung muss begründet sein.
* Jede Empfehlung muss auf einer festgestellten Entwicklung oder Auffälligkeit basieren.

---

# 8. Daten und Import

Das YouTube-Modul soll zunächst CSV- oder Excel-Daten verarbeiten können. Die Architektur muss für eine spätere Anbindung an die YouTube Analytics API offenbleiben.

Erwartete Datenfelder:

* Datum
* Video-ID
* Videotitel
* Veröffentlichungsdatum
* Sprache
* Format
* Kampagne oder Thema
* organisch oder bezahlt
* Views
* Engaged Views
* Impressions
* Impressions CTR
* Watch Time
* Average Percentage Viewed
* Retention nach 30 Sekunden
* Traffic Source
* Website-Sessions
* Business Conversions

Fehlende Spalten oder Daten müssen verständlich ausgewiesen werden.

---

# 9. Erwartete Dashboard-Ausgabe

Das fertige YouTube-Modul muss:

* die fünf Haupt-KPIs in der Management View darstellen,
* die acht operativen Kennzahlen anzeigen,
* Entwicklungen gegenüber der Vorperiode visualisieren,
* Reichweite und Aufmerksamkeitsqualität getrennt bewerten,
* auffällige Videos automatisch markieren,
* mögliche Ursachen als Hypothesen formulieren,
* priorisierte Handlungsempfehlungen ausgeben,
* Datenlücken und geringe Datenqualität sichtbar machen,
* Management- und operative Sicht klar voneinander trennen.

Ziel ist kein weiteres Zahlen-Dashboard. Das Modul soll zeigen, ob YouTube für Sonio lediglich Sichtbarkeit erzeugt oder relevante Aufmerksamkeit und einen messbaren Beitrag zu Kampagnen, Website-Nutzung und Leadgenerierung leistet.
