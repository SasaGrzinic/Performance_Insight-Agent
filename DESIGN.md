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
    fontSize: "clamp(26px, 2.1vw, 34px)"
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
    fontSize: "34px"
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
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "20px 19px"
  page-intro:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "24px"
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

Channel icon tiles retain their local provider colors. These distinguish channels within the interface rather than define alternate primary actions.

### Neutral

Ink, muted, line, and canvas map to the corresponding CSS custom properties. White is used for panels, fields, navigation, and text on primary controls. Muted text covers explanations, table headings, comparison context, and footnotes.

Positive and negative comparisons use the semantic colors alongside arrows and signed numbers. Priority tags pair color with an explicit priority label.

## Typography

Self-hosted Red Hat Display is the only font family, with a sans-serif fallback. Font-face declarations live in `frontend/public/brand/fonts.css`.

The frontmatter records desktop defaults: display for the login brand heading, headline for page headings, title for section headings, body for root paragraph text, label for form labels, button for standard actions, and metric for KPI values. Supporting text is commonly 10–13px; the implementation does not define a proportional type scale.

KPI values and comparison indicators use tabular numerals. KPI values change to 39px at the large-desktop breakpoint, 30px in the narrower desktop layout, and 29px on mobile. Page headings use 29px at widths up to 1250px and 28px at widths up to 760px. Paragraph measures are component-specific, including 45ch in the insight panel and 65ch in settings.

## Layout

The desktop shell has a fixed sidebar and a matching content offset. Sidebar width is 248px by default, 220px at widths up to 1250px, and 200px at widths up to 1020px. Main content has a 1640px maximum width and default padding of 34px 36px 0.

The KPI grid uses four equal columns with a 16px gap, becoming two columns at 1020px. Chart and insight panels use a two-column grid with a 1.9fr chart column and a second column with a 260px minimum; they stack at 1020px. Recommendation and source grids start at three columns. Recommendations become one column at 1020px; sources become two at 1250px and one at 760px.

At 760px and below, the main offset disappears and the sidebar becomes a drawer. Main padding becomes 25px 19px 0. The closed drawer is hidden from focus; opening it traps keyboard focus and makes the main content inert. Escape closes it and focus returns to the opening control. Tables scroll inside their own container.

The spacing tokens capture recurring values. The stylesheet also contains local padding, gaps, and responsive adjustments; it does not constrain every measurement to a single scale.

## Elevation & Depth

Panels and cards use background contrast and one-pixel borders without default shadows. The toast shadow is `0 6px 26px #16395626`; the dialog shadow is `0 16px 60px #12273d30`. Dialogs appear above a translucent dark overlay, and mobile navigation has a separate backdrop.

Standard buttons change background and border colors without movement. The mobile drawer uses a 0.2s ease transform transition. Loading icons rotate with a 1s linear animation. The reduced-motion query disables animation, transitions, and smooth scrolling.

## Shapes

Priority tags use the small tag radius. Buttons and fields share the field radius; selected navigation uses the navigation radius. Main panels, KPI cards, recommendation cards, and the insight panel use the panel radius, mapped to `--radius`. Dialogs use the largest recorded radius.

Fields and panels have solid one-pixel borders. File upload regions have dashed borders. Avatars and channel icons use their own compact rounded containers.

## Components

### Buttons

Standard controls are inline-flex, use the button typography, and have a minimum height of 38px. Primary actions use primary blue and white text; secondary actions use a white surface, outline, and ink text. Text actions omit the filled background and border and underline on hover.

Keyboard focus uses a 3px outline in the focus color with a 3px offset. Disabled buttons have half opacity and a not-allowed cursor. Login actions have a larger local minimum height.

### Inputs / Fields

Inputs and selects use white backgrounds, the field border and text tokens, 13px text, and a minimum height of 42px. Labels sit above fields with an 8px gap. The month selector uses a compact native month input. Form errors appear as text in a pale red block.

### Navigation

Main navigation uses left-aligned text and line icons. Selection adds primary blue, white text, and a thin blue marker at the sidebar edge. Hover uses a pale neutral background. Administrative navigation and editing controls follow the account role.

Settings use Radix Tabs with a blue underline for the active tab. Channel buttons use filled selected states and update their channel chart or details.

### Chips / Status

Priority tags are small rounded rectangles with high, medium, or low text labels. Data status uses a dot plus text. Comparisons combine arrows, a sign, and a percentage; unavailable comparisons show explanatory text.

### Cards / Containers

KPI cards contain a label, channel icon, tabular value, comparison, and optional target. Overview KPI cards are buttons opening the relevant channel; detail KPI cards are articles. Interactive cards change border color on hover.

Standard panels contain charts, tables, reports, and settings. Recommendation cards contain a channel icon, priority, title, observation, and action; their dialog exposes observation, next step, caveat, and evidence.

### Charts / Insight Panel

Recharts renders the selected channel's daily series with a primary-colored line, pale fading area fill, horizontal grid lines, and a tooltip. Missing points remain gaps, while empty charts show explanatory text.

The insight panel uses a primary background, white heading and action control, and pale supporting text. Demo content has explicit sample-data labels. Missing metrics show a dash. Number formatting preserves up to two decimal places.

On mobile (760px and below), the performance tooltip wrapper is anchored 8px from the chart’s left and top edges, with transforms disabled and width `calc(100% - 16px)`. The tooltip fills that wrapper so publication titles remain within the chart.

### CSV Export / Page Introduction

The page introduction is a primary-hover blue panel with white text, white month controls, and a white primary-action variant. Padding reduces from 24px to 20px on mobile. KPI values and comparison totals use primary-hover blue.

The CSV export is a native disclosure with a blue-surface background, a local blue border, and a 12px radius. The summary includes the selected month; native selects and labeled metric checkboxes control the export. Controls wrap and expand to full width on mobile. The chart heading shares its pale blue background, preserving white chart plotting areas and the existing panel hierarchy.

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
