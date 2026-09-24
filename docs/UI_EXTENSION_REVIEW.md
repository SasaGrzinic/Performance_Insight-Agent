# UI extension review

Reviewed 2026-09-16 as an ordinary extension of the existing Sonio interface in Operate mode. This record adds component semantics and review evidence; it does not replace the visual system.

## Evidence and system comparison

- Compared `PRODUCT.md` and `DESIGN.md` with `frontend/src/components/PerformanceExplorer.tsx`, `frontend/src/components/Audience.tsx`, their integration in `frontend/src/App.tsx`, and extension rules in `frontend/src/styles.css`.
- Applicable captures from the preceding finish review in `.impeccable/review/` are `comparison-desktop.png`, `videos-desktop.png`, `videos-mobile.png`, `audience-desktop.png`, and `audience-mobile.png`. It reported no material UI defect. This documentation pass relies on that visual review rather than claiming a second browser audit. Comparison was captured at 970px, the other desktop views at 1280px, and mobile views at 390px.
- Follow-up evidence covers the publication tooltip and average viewing duration in `hover-desktop.png`, `hover-mobile.png`, `duration-desktop.png`, and `duration-mobile.png` in the same directory. The fresh finish review inspected all four and reported no material findings. The implementation report records 10 passing frontend tests, a successful build, and a live video average of 19.48 seconds; these are supplied validation results, not tests rerun by this documentation pass.
- Existing identity is preserved with the user-approved stronger blue treatment: primary blue `#0075d9`, Red Hat Display, charcoal text, light canvas, bordered white panels, existing controls, and the responsive application shell. The extension reuses border, muted-text, ink, and blue CSS variables and tabular numerals.
- Additional purple, green, and brown chart strokes distinguish comparison series; labels and dashed lines accompany the colors. Purple also distinguishes paid follower gains. These are local data-visualization roles, not new brand accents or primary-action tokens.
- Post grids move from three to two to one column; compact controls wrap or form two columns on mobile. The audience table uses the existing scroll container. These extend the incumbent density and responsive patterns.

## Component semantics

- **Performance comparison:** channel and metric selectors overlay up to four months by calendar day. Removable month labels, month totals, partial-period notes, loading/error feedback, and gaps for missing measurements explain the comparison. The publication-day selector provides a native-control alternative to chart clicking and filters posts published on that day; it does not attribute daily performance to those posts.
- **Publication tooltip:** each compared month shows its date and selected daily metric. For connected LinkedIn organic data, the tooltip lists titles published on that calendar day, with distinct loading, failure, no-post, and unavailable-association messages. The latest requested presentation keeps only dates, values, and titles, removing the publication label and explanatory copy. Publication markers identify relevant days. Values remain page-level daily totals, not individual-post attribution. No imagery was added.
- **Posts and videos:** format filters, sorting, expandable copy, metric emphasis, and original-post links expose real connected-company content. Cards explicitly show lifetime values as of retrieval, not daily or monthly totals. Video definitions and unavailable values are explained. Demo mode does not manufacture real posts.
- **Average viewing duration:** video cards display “Ø Betrachtungsdauer” in seconds, calculated as `watch_time_ms / video_views / 1000`. The interface explains the formula and the qualifying video-view definition. Zero views or missing inputs produce an unavailable value, not a fabricated zero-second average.
- **Follower development:** stacked organic and paid gains accompany a monthly table. Current and historical observed totals carry dates; gains are explicitly distinct from net change after unfollows. Missing historical totals remain unavailable rather than reconstructed.
- Data scope for this implementation is the connected Sonio organization `622072`.

## Latest extension evidence

- The user approved more Sonio blue: page introductions use deep blue with white text; active navigation uses primary blue with white text; KPI values are blue; export panels and chart headings are pale blue; video entries have a pale blue tint. `DESIGN.md` and `.impeccable/design.json` receive a minimal matching component/color-usage update, preserving existing primitive values.
- CSV export scopes data to the selected month, monthly or daily channel metrics, or LinkedIn posts/videos. Labeled checkboxes choose metrics, including average viewing duration. Export rows retain period, unit, data-mode, and freshness context; absent measurements remain blank. The file uses UTF-8 BOM, semicolon separators, and literal formula escaping. A downloaded CSV was verified to contain one data row with only the chosen metric.
- The supplied validation report records 47 backend tests, 11 frontend tests, Ruff, and build passing. Provider pagination now follows the returned next start (including 98 rather than assuming 100) and does not terminate early on creation dates. A full 12-page live check found the same 38 stored posts: July 18, August 10, September 10; no additional missing posts were found.
- Fresh review evidence: `.impeccable/review/export-blue-desktop.png`, `export-blue-mobile.png`, `posts-corrected-desktop.png`, and `posts-corrected-mobile.png`. The finish review found mobile tooltip clipping; the wrapper now anchors 8px inside the chart with width `calc(100% - 16px)`, and the tooltip fills it. The build passed again. The reviewer confirmed the recaptured mobile title is complete and contained, the export controls are visible, and returned ship with no remaining material findings.

## Drift notes and limits

`PRODUCT.md` still says no account access or real marketing data was supplied. That evidence statement predates the present connected-data work and is now stale; its prohibition on fabricated live results remains applicable. This pass records the discrepancy without changing product authority.

`DESIGN.md` describes the earlier single-series chart and does not enumerate these new components. The additions retain its visual vocabulary. The approved stronger blue usage is now reflected in its component mappings and the matching sidecar; this record captures task-specific data semantics.

This is a scoped finish record, not an exhaustive accessibility, provider-data, or application audit. Screenshot review cannot establish every interaction or backend guarantee. This documentation pass changed only this review, `DESIGN.md`, and `.impeccable/design.json`; application code and `PRODUCT.md` were not changed.
