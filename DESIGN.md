---
name: Sonio Insights
description: React interface for marketing channel metrics, analysis, and monthly reports.
colors:
  primary: "#0075d9"
  primary-hover: "#0063b8"
  ink: "#1d1d1b"
  muted: "#64717f"
  canvas: "#f7f8fa"
  surface: "#ffffff"
  blue-surface: "#e8f3ff"
  line: "#e6eaf0"
  focus: "#78b7ef"
  nav-selected-bg: "#e9f3fd"
  nav-selected-text: "#006ac6"
  control-line: "#dce3eb"
  control-hover-bg: "#f3f7fb"
  field-line: "#dce3ea"
  field-text: "#334658"
  positive: "#347f5a"
  negative: "#ba604e"
  priority-high-bg: "#fff2e9"
  priority-high-text: "#a96834"
typography:
  display:
    fontFamily: '"Red Hat Display", sans-serif'
    fontSize: "clamp(32px, 3.3vw, 55px)"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Red Hat Display", sans-serif'
    fontSize: "clamp(25px, 2.5vw, 32px)"
    fontWeight: 750
    lineHeight: 1.22
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"Red Hat Display", sans-serif'
    fontSize: "19px"
    fontWeight: 750
    letterSpacing: "-0.025em"
  body:
    fontFamily: '"Red Hat Display", sans-serif'
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: '"Red Hat Display", sans-serif'
    fontSize: "12px"
    fontWeight: 650
  button:
    fontFamily: '"Red Hat Display", sans-serif'
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.5
  metric:
    fontFamily: '"Red Hat Display", sans-serif'
    fontSize: "clamp(29px, 3vw, 38px)"
    fontWeight: 750
    lineHeight: 1.15
    letterSpacing: "-0.035em"
rounded:
  tag: "4px"
  field: "7px"
  navigation: "8px"
  toast: "10px"
  panel: "14px"
  dialog: "16px"
spacing:
  small: "8px"
  compact: "12px"
  grid: "16px"
  card: "20px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.field}"
    padding: "9px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.field}"
    padding: "9px 14px"
  button-secondary-hover:
    backgroundColor: "{colors.control-hover-bg}"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.field-text}"
    rounded: "{rounded.field}"
    padding: "11px 12px"
    width: "100%"
  navigation-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.navigation}"
    padding: "13px 12px"
    width: "100%"
  priority-high:
    backgroundColor: "{colors.priority-high-bg}"
    textColor: "{colors.priority-high-text}"
    rounded: "{rounded.tag}"
    padding: "4px 7px"
  kpi-card:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "22px 24px"
  page-intro:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "22px 26px"
  photographic-intro:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "40px"
  overview-intro:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "40px"
  channel-entry:
    backgroundColor: "#e2efff"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "18px 20px"
  ads-campaign:
    backgroundColor: "#e2efff"
    rounded: "{rounded.panel}"
    padding: "20px"
  ads-campaign-alternate:
    backgroundColor: "#d4e7fb"
  ads-campaign-mobile:
    padding: "16px"
  metric-option-selected:
    backgroundColor: "{colors.blue-surface}"
    textColor: "#153d60"
    rounded: "{rounded.field}"
    padding: "9px 12px"
  performance-body:
    padding: "20px 24px"
  performance-body-mobile:
    padding: "16px"
  publication-day:
    backgroundColor: "#f2f7fc"
    textColor: "#00549c"
    rounded: "{rounded.field}"
    height: "44px"
  publication-day-selected:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
  export-panel:
    backgroundColor: "{colors.blue-surface}"
    rounded: "12px"
  insight-panel:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "25px 25px 19px"
---

# Design System: Sonio Insights

## Overview

This document records the implemented interface in `frontend/src/styles.css`, `frontend/src/App.tsx`, and `frontend/src/components/ui.tsx`. It uses a white navigation sidebar, a light grey canvas, bordered white panels, and blue primary controls. Red Hat Display is used throughout; the original Sonio logo and arrow assets are served from `frontend/public/brand/`.

This record replaces the provisional plan written during the same implementation. It adds no creative metaphor or brand claims. The frontmatter records reusable values, with component-specific extensions in `.impeccable/design.json`. The application canvas follows the extracted `canvas` token.

**Key Characteristics:**

- White panels separated by borders on a light grey canvas.
- Blue controls, selected states, time-series lines, and the insight panel.
- Left-aligned labels and tabular metric numerals.
- Text labels alongside data status, comparison, and priority indicators.
- Responsive grids, visible keyboard focus, and reduced-motion support.

## Colors

### Primary

Primary and primary-hover map to the CSS custom properties `--blue` and `--blue-dark`. Primary appears in action buttons, links, chart strokes, and the insight panel. Primary-hover is the primary button hover background. Selected navigation uses primary blue and white text, with primary-hover on hover. The user-approved stronger blue treatment also uses primary-hover behind the page introduction and for KPI values, white introduction text, and blue-surface behind export controls and chart headings. Video entries use a local pale blue tint (`#f1f7ff`) with a blue border (`#b4d7f5`). Existing primitive values are retained; earlier nav-selected primitives are no longer the active navigation component mapping.

Channel icons use local provider SVG assets for LinkedIn, YouTube, Google Ads, Google Analytics and Mailchimp; event and QR channels retain line icons. These distinguish channels within the interface rather than define alternate primary actions. Header and chart-context logos sit in white bordered tiles with an 8px radius and 8px padding.

### Neutral

Ink, muted, line, and canvas map to the corresponding CSS custom properties. White is used for panels, fields, navigation, and text on primary controls. Muted text covers explanations, table headings, comparison context, and footnotes.

Positive and negative comparisons use the semantic colors alongside arrows and signed numbers. Priority tags pair color with an explicit priority label.

## Typography

Self-hosted Red Hat Display is the only font family, with a sans-serif fallback. Font-face declarations live in `frontend/public/brand/fonts.css`.

The frontmatter records desktop defaults: display for the login brand heading, headline for page headings, title for section headings, body for root paragraph text, label for form labels, button for standard actions, and metric for KPI values. Supporting text is commonly 10–13px; the implementation does not define a proportional type scale.

KPI values and comparison indicators use tabular numerals. Analysis workspace KPI values use the metric clamp and become 29px on mobile. LinkedIn Organic overrides these with compact 28px values and bold labels (weight 800). Comparison context and previous values use 12px, with 13px percentage deltas. Page headings use the headline clamp and become 25px at widths up to 760px. Paragraph measures are component-specific, including 45ch in the insight panel and 65ch in settings.

## Layout

The desktop shell has a fixed sidebar and a matching content offset. Sidebar width is 248px by default, 220px at widths up to 1250px, and 200px at widths up to 1020px. Main content has a 1640px maximum width and default padding of 34px 36px 0.

Organic and other monthly channel details retain the KPI strip and performance workspace; the overview has neither a KPI strip nor a chart. The KPI strip uses four equal columns without gaps, becoming two columns at 1020px. Its white surface has horizontal outer borders and internal dividers. LinkedIn Organic uses five compact columns with 14px vertical and 16px horizontal cell padding, becoming three columns at 1100px and two at 760px. The performance workspace spans the available content width, with 20px vertical and 24px horizontal body padding, reduced to 16px on mobile. A compact monthly briefing replaces the former adjacent insight card; unavailable AI analysis is explained once. Connected or previously synchronised channels lead the channel selector. Recommendation and source grids start at three columns. Recommendations become one column at 1020px; sources become two at 1250px and one at 760px.

At 760px and below, the main offset disappears and the sidebar becomes a drawer. Main padding becomes 25px 19px 0. The closed drawer is hidden from focus; opening it traps keyboard focus and makes the main content inert. Escape closes it and focus returns to the opening control. Tables scroll inside their own container.

The overview presents all eight channels as clickable cards with a channel logo or icon, status and up to three available KPI slots. Cards use two equal columns with a 20px gap, becoming one column with a 14px gap at 760px. Card padding is 18px vertically and 20px horizontally on desktop and mobile; channel marks are 44px inside 60px tiles. Selecting a card opens the retained channel deep dive.

The overview header uses `/brand/sonio-blog-header.jpg` across its full image surface, with the exact white title **MARKETING PERFORMANCE & INSIGHT**. Its minimum height is 400px with 40px padding on desktop, and 330px with 24px padding at 760px and below. The title uses `clamp(30px, 3.4vw, 48px)`, 1.08 line height and a 19ch maximum width; mobile uses 30px. The photograph is cropped at center top on desktop and right top on mobile. A dark bottom-to-top gradient preserves text legibility. An agent introduction follows the header, with a 24px heading and 16px paragraph (21px and 15px on mobile). The context row shows the current reporting month without a month input and places refresh beside the connected-channel count. The reporting timezone comes from public configuration, with Europe/Zurich as fallback; the displayed month is recalculated every minute. Monthly detail views retain month selection; LinkedIn Ads uses its independent rolling 365-day window. A freshness note distinguishes minute-based display refresh from the last successful provider retrieval. The Top 3 recommendations section follows all eight channel cards. Reference captures are `.impeccable/review/compact-blue-desktop.png` and `.impeccable/review/compact-blue-mobile.png`.

All analysis pages, including channel details and Video Performance, reuse the approved full-image header described above: 400px minimum height and 40px padding on desktop, 330px and 24px at 760px and below. The image fills the header, with the same crop, gradient and white title treatment as the overview. Channel-specific descriptions sit under the title inside the photographic header and remain visible on mobile. Subpage refresh controls sit in a separate toolbar below the header with 24px bottom spacing; the toolbar contains no month selector. Monthly channel selection lives in the performance workspace; Video Performance, posts, audience, insights and reports place their month selector in the content area. Controls wrap, and the primary action spans the available width on mobile. The former split photograph and blue text surface is superseded.

LinkedIn Ads uses compact image-led campaign rows with a 20px list gap. Each row pairs a 180px image column with flexible content and six metric columns, becoming three metric columns at 1100px and two at 760px. At 760px, image and content stack with a 12px gap, campaign headings and export actions stack vertically, and images are limited to 240px width. Ads omits search, month selection and monthly comparison controls; its refresh action remains below the shared photographic header.

Mailchimp uses compact, initially expanded mailing groups with native disclosure controls. Pale blue group headings and a primary-blue top border separate white mailing rows. Rows place the send date, an actual lead image from the mailing content, stage/title/subject and five metrics in columns, with 16px padding and gaps. Images fit within 112px by 76px without cropping; unavailable images use a text fallback. At 1200px the metrics move below the copy; at 600px the date spans the row, images narrow to 80px, row padding becomes 12px and the group count moves below the title. Month and content-type selects sit alongside a free-text search, stacking into one column at 760px. The month selector defaults to the current month in Europe/Zurich and lists it first, with the whole-year option last. The month filter selects whole groups and explicitly explains that related sendings from other months remain visible. Groups are ordered by their latest mailing, newest first; mailings within each group also run newest first. Grouping inferred from titles and subjects is labelled; unclear assignments remain separate. Test/template mailings are excluded, while language variants and repeat sendings retain separate rows. The five immediately visible metrics are sent, unique openers, unique clickers, click rate and delivery rate, arranged in a three-column metric grid. A nested native disclosure labelled “Zustellung & Abmeldungen” reveals delivered messages, hard and soft bounces, unsubscribe count and rate, and open rate; it spans the row on mobile. The shared KPI explainer covers every displayed metric. Rate values include a percent suffix; missing report metrics display a dash. The existing title/subject grouping remains in place; event-registration attribution is deferred.

The spacing tokens capture recurring values. The stylesheet also contains local padding, gaps, and responsive adjustments; it does not constrain every measurement to a single scale.

## Elevation & Depth

Panels and cards use background contrast and one-pixel borders without default shadows. The toast shadow is `0 6px 26px #16395626`; the dialog shadow is `0 16px 60px #12273d30`. Dialogs appear above a translucent dark overlay, and mobile navigation has a separate backdrop.

Standard buttons change background and border colors without movement. The mobile drawer uses a 0.2s ease transform transition. Loading icons rotate with a 1s linear animation. The reduced-motion query disables animation, transitions, and smooth scrolling.

## Shapes

Priority tags use the small tag radius. Buttons and fields share the field radius; selected navigation uses the navigation radius. Main panels, recommendation cards, and the insight panel use the panel radius, mapped to `--radius`. Analysis KPI cells have square corners within a contiguous white strip. Dialogs use the largest recorded radius.

Fields and panels have solid one-pixel borders. File upload regions have dashed borders. Avatars and channel icons use their own compact rounded containers.

## Components

### Buttons

Standard controls are inline-flex, use the button typography, and have a minimum height of 38px. Primary actions use primary blue and white text; secondary actions use a white surface, outline, and ink text. Text actions omit the filled background and border and underline on hover.

Keyboard focus uses a 3px outline in the focus color with a 3px offset. Disabled buttons have half opacity and a not-allowed cursor. Login actions have a larger local minimum height.

### Inputs / Fields

Inputs and selects use white backgrounds, the field border and text tokens, 13px text, and a minimum height of 42px. Labels sit above fields with an 8px gap. The month selector uses a compact native month input. Form errors appear as text in a pale red block.

### Navigation

Main navigation runs in this order: Übersicht, Kanäle, Insights & Empfehlungen, Video Performance, Reports. Administrative entries remain Datenquellen, Team & Zugänge, Einstellungen. Main navigation uses left-aligned text and line icons. Selection adds primary blue, white text, and a thin blue marker at the sidebar edge. Hover uses a pale neutral background. Administrative navigation and editing controls follow the account role.

Settings use Radix Tabs with a blue underline for the active tab. Channel buttons use filled selected states and update their channel chart or details.

### Chips / Status

Priority tags are small rounded rectangles with high, medium, or low text labels. Data status uses a dot plus text. Comparisons combine arrows, a sign, and a percentage; unavailable comparisons show explanatory text.

### Cards / Containers

KPI cells contain a label, tabular value, percentage comparison, explicit previous value when available, and optional target. They omit decorative channel icons. Detail KPI cards are articles. The overview instead uses channel-entry buttons with a logo or icon, status, up to three KPI slots, data date and a channel-opening action. Cards cycle through blue surfaces (#e2efff, #f1f7ff, #d9eafa), with respective borders (#b7d4f5, #d4e3f5, #accbeb), independently of data availability; unavailable values remain missing and channels without data show an explanatory empty state. Interactive KPI cells use the blue-surface background on hover without movement.

Standard panels contain charts, tables, reports, and settings. Recommendation cards contain a channel icon, priority, title, observation, and action; their dialog exposes observation, next step, caveat, and evidence. The overview shows up to three available recommendations sorted by high, medium, then low priority. When none are available, it shows three non-interactive graphical preview cards under “Grafische Vorschau · Noch keine datenbasierte Auswertung”. These describe future recommendation roles without fabricated findings or measurements; the illustrative evidence skeleton is removed. This explicitly requested preview remains visible while AI is unconfigured, without setup alerts. Recommendation and preview cards use 20px padding and three blue variants: #e2efff with #b7d4f5 borders, #bddbfa with #95bee8 borders, and #07569c with matching borders and white text. Preview icons are 42px; the panel radius and responsive grid from three columns to one at 1020px remain.

### Charts / Insight Panel

Recharts renders up to four selected daily metrics as lines with horizontal grid lines and a tooltip. The workspace contains the base-month input and a compact “Monate vergleichen” disclosure showing the selected count. Its checkbox list and optional custom month allow at most four months including the base month; the base month cannot be deselected. Controls use four desktop columns, two at 1100px and one at 600px. Metric colors remain stable by field; month comparisons use solid, long-dash, short-dash and dash-dot strokes. Metric checkboxes have 44px minimum-height targets and a pale blue selected state; their labels remain visible alongside color dots. Absolute mode separates axes by unit. Relative mode sets each month/metric series' own highest value to 100%; tooltip and day-inspector values remain absolute. Missing points remain gaps, while empty charts show explanatory text.

The insight panel uses a primary background, white heading and action control, and pale supporting text. Demo content has explicit sample-data labels. Missing metrics show a dash. Number formatting preserves up to two decimal places.

A persistent day inspector below the chart exposes month and day selectors, publication-day buttons, and all posts for the selected date. Day buttons have a minimum height of 44px and width of 46px, with a filled blue selected state. Post titles use readable normalised mathematical Unicode letters; titles wrap without truncation. Daily channel metrics remain distinct from post totals since publication. Each Organic tooltip post shows its real main image when available, its full title, impressions and clicks, with the explicit “Seit Veröffentlichung” time basis. Missing or failed images show “Kein Hauptbild verfügbar”; no substitute image is invented. Tooltip images fit within 100px by 70px without cropping. On mobile (760px and below), the hover tooltip is hidden: the persistent inspector provides touch and keyboard access to the selected day and its posts. Post details stack vertically and selectors expand to full width.

The post collection includes the same real main images above each title, fitting the card width within a 150px image area without cropping. Compact metric labels use 12px and values 18px. Default date ordering runs from the oldest to the newest publication; metric sorting remains descending. All posts on a date are retained.

### LinkedIn Ads Campaigns

Each campaign appears as a separate article with its real title, objective, text status and planned runtime. The six metric slots are impressions, clicks, spend, CTR, CPC and conversions; unavailable values remain dashes. The list includes older campaign metadata while all displayed metrics use the stated rolling 365-day window, independently of the reporting month. No monthly or blanket campaign comparison is shown.

Rows alternate the `ads-campaign` and `ads-campaign-alternate` blue surfaces, with the shared panel radius and compact campaign padding tokens. Real API-provided campaign images fit without cropping within a 160px maximum height; unavailable or failed images use a text fallback. Titles wrap without truncation at 18px; tabular metric values use 21px, and labels use 12px with weight 800. Runtime and data notes use 12px. A native CSV disclosure provides metric field selection and exports the real campaign list. The per-row “Ergebnisse einordnen” disclosure provides fixed objective-specific reading guidance, not a generated AI recommendation.

When fewer than two real campaigns have metrics, the live view appends one visibly labelled fictitious example. Its image and invented values are presentation-only, excluded from campaign counts, exports and analysis; missing real measurements remain missing.

### KPI Explanations

Channel definitions, Ads, post collections and video views use the shared “KPI erklärt” native dropdown. It lists the metrics relevant to that view and shows one plain-language explanation alongside it, announced with a polite live region when selection changes. The 12px bold label sits above the select; explanation text uses 14px with a 65ch maximum measure. At 760px and below, selection and explanation stack with a 10px gap. Definitions preserve channel-specific meaning, units and caveats, including internal LinkedIn clicks, follower gains versus net growth, and qualified video views.

### Video Performance

The dedicated video view reuses the shared full-image introduction, refresh toolbar and a month selector in the content area. LinkedIn and YouTube appear as separate platform sections with 36px bottom spacing; their headings pair a 44px channel mark in a 64px white tile with a 24px heading. LinkedIn reuses the existing post collection with a fixed video-only filter. Its video cards use 20px padding, 14px corners, a #b7d4f5 border and alternating #e2efff, #f1f7ff and #d9eafa surfaces; the surrounding collection has a transparent background without an outer border. Platform totals are not combined.

YouTube uses a #bddbfa blue panel with 20px padding: available monthly values appear as a summary; missing data stays an explicit pending state with dashes. This view does not establish a YouTube connection. Its metric grid has three columns and a 20px gap, becoming one column with a 14px gap at 760px and below. Reference captures are `.impeccable/review/video-performance-desktop.png` and `.impeccable/review/video-performance-mobile.png`.

### CSV Export / Page Introduction

The page introduction is a primary-hover blue panel with white text, white month controls, and a white primary-action variant. The base page-introduction component uses 22px vertical and 26px horizontal padding, reduced to 18px on mobile; its supporting paragraph is hidden on mobile. Analysis pages override this base component with the shared full-image variant described in Layout, using the local `/brand/sonio-blog-header.jpg` image. Subpage controls sit below the photograph. The overview follows its header with the agent introduction; its current-month label and refresh action sit in the context row. KPI values and comparison totals use primary-hover blue.

The CSV export is a compact native disclosure aligned with the overview context row on desktop. Closed, it has a transparent background without a border and a 44px minimum summary height; its extra summary text is hidden. Open, it expands to full width with a blue-surface background and 12px radius; native selects and labeled metric checkboxes control the export. Controls wrap and expand to full width on mobile. The chart heading shares its pale blue background, preserving white chart plotting areas and the existing panel hierarchy.

### Dialogs / Feedback

Radix Dialog supplies title, description, close control, and focus behavior. Standard dialogs are capped at 530px width and wide dialogs at 850px, both with viewport margins and scrolling within 90dvh.

Toasts use a dark background and status semantics. Analysis read failures have an explicit error and retry control. Job polling errors clear the busy state and explain recovery.

## Do's and Don'ts

### Do:

- **Do** reuse the original Sonio logo, arrow assets, and self-hosted Red Hat Display font.
- **Do** use the implemented primary, neutral, border, radius, and control tokens.
- **Do** keep status and priority meanings available in text alongside color and icons.
- **Do** preserve visible keyboard focus, modal and mobile navigation behavior, and reduced-motion support.
- **Do** label demonstration data and preserve missing values and fractional measurements.

### Don't:

- **Don't** present demonstration values as live measurements.
- **Don't** replace missing metrics with fabricated zeroes.
- **Don't** show administrator-only editing workflows to viewers.
- **Don't** remove explanation, evidence, and caveats from recommendation details.

### Kanalidentität im Header (25.09.2026)
Auf Kanal-, Post- und Followerseiten sitzt das jeweilige Kanallogo innerhalb der fotografierten Fahne. Bild und Logo teilen denselben SVG-Koordinatenraum und bleiben beim responsiven Zuschnitt zusammen. Die frühere zusätzliche Zeile «Kanal · Sonio AG» im Header entfällt. Titel und Kanalbeschreibung bleiben erhalten; die Übersicht verwendet weiterhin das Originalbild.

## Freigegebene Aktualisierung vom 29.09.2026

Für Dashboard und Login ersetzt die freigegebene Gestaltung die oben dokumentierte
alte Darstellung: dunkle Navigation (`#173d62`), vollständiges Bergmotiv, kompakte
Kanalzahlen und Entwicklungen, blaue Empfehlungsfläche mit Kanal zuerst sowie
zentriertes Branson-Zitat. Die Anmeldung zeigt das vollständige Bild mit integriertem
Logo/Titel und kleinem mittigem Formular. Red Hat Display und Original-Assets bleiben.
Die konkrete Umsetzung liegt in `frontend/src/marketing-design.css` und
`frontend/src/components/MarketingOverview.tsx`; Details und Datengrenzen in
`docs/DESIGN_HANDOFF_2026-09-29.md`. Andere Fachansichten behalten ihre Struktur.

## LinkedIn Organic – Freigabe 29.09.2026

Marketingansicht in `LinkedInOrganic.tsx`/`linkedin-organic.css`: vollständiges
Bergmotiv, kompakte 3×2-Kennzahlen in #0075d9 mit weisser Schrift, Videozahlen
im selben Blau. Red Hat Display; #0063b8 für Abschnittstitel, #eaf2f9 als Grund,
weisse Inhaltsflächen. Abgrenzung durch Titel und Abstand, ohne Trennlinien.
Dezente Zeitraumwahl beim Kennzahlen-Titel, Empfehlungen zuletzt, freies Seth-Godin-
Zitat mit Berufsangabe. Siehe aktualisierte Design-Übergabe für Datenbeschränkungen.

### Gemeinsame Aktionsleiste — 30.09.2026
«Daten aktualisieren» und «CSV herunterladen» stehen horizontal nebeneinander.
Für bestehende und neue Kanalansichten dieselbe `channel-action-toolbar` verwenden;
keine vertikale Sondervariante ergänzen. Auf kleinen Displays darf die gesamte
Aktionszeile unter den Titel wechseln, beide Aktionen bleiben nebeneinander.
Analytics nutzt den gemeinsamen grossen Bildheader ohne Kanal-Logo/Fahnenoverlay,
Sonio-blaue KPI-/Inhaltsflächen und den gemeinsamen EditorialQuote-Abschluss.
GEO listet alle unterstützten KI-Quellen offen; fehlende Berichtszeilen als «—»
mit Erklärung statt erfundenen Nullen darstellen.

## Gemeinsame Flächenrollen – 02.10.2026
`frontend/src/harmonized-design.css` bündelt die Harmonisierung bestehender Seiten:
- Kennzahlen: Weiss, Kontur #bbcbd9, Zahlen #0063b8; blaue Übersichtssignale bleiben.
- Aktive Filter/Navigation: #0063b8, Weiss; zusätzlich Gewicht/Unterkante als Signal.
- Empfehlungen/Prüfansätze: #f2ebdf und #e8decd, Text #173d62.
- Infoboxen: #173d62/Weiss, identische Abstände und Form; bestehende Interaktionen.
- Bildwelt, Datenlogik, Kanalrouten und Zitattexte bleiben bestehen. Porträts folgen
  als separater Entwurf nach der Harmonisierung, noch nicht integriert.
