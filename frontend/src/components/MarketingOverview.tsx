import { useId, useState } from "react";
import { overviewTrends } from "../overviewTrends";
import { ArrowRight, Info } from "lucide-react";
import { number, monthName } from "../api";
import type { Analysis, Channel, Dashboard, Recommendation } from "../types";
export function channelMetricLabel(c: Channel, key: string) {
  const labels: Record<string, string> = {
    sessions: "Website-Besuche",
    impressions:
      c.id === "linkedin_organic"
        ? "Einblendungen unserer Beiträge"
        : "Anzeigeneinblendungen",
    unique_clicks: "Personen klickten je Newsletter",
    views: "Videoaufrufe",
    registrations: "Anmeldungen",
    scans: "QR-Code-Scans",
    conversions: "Erfasste Zielaktionen",
  };
  return labels[key] || c.fields[key] || key;
}
export function OverviewHighlights({ dashboard: d }: { dashboard: Dashboard }) {
  const selected = overviewTrends(d.channels);
  return (
    <section className="marketing-developments">
      <div className="section-heading">
        <h2>Entwicklungen im Blick.</h2>
        <span>
          {d.demo ? "Beispieldaten · " : ""}
          {monthName(d.month)} vs. {monthName(d.comparison_month)}
        </span>
      </div>
      <p className="comparison-context">
        {d.partial
          ? `Laufender Monat: ${d.period_start} bis ${d.period_end}; Vergleich bis ${d.comparison_end}.`
          : "Vergleich der Monatswerte."}{" "}
        Mehr Volumen allein belegt keine höhere Qualität.
      </p>
      {selected.length ? (
        <div className="marketing-highlights">
          {selected.map((t) => (
            <article key={t.c.id}>
              <span className="highlight-channel">
                <i
                  className={t.positive ? "positive" : "negative"}
                  aria-hidden="true"
                />
                {t.c.name}
              </span>
              <strong>
                {number(Math.abs(t.change))} % {t.positive ? "mehr" : "weniger"}
              </strong>
              <span>{channelMetricLabel(t.c, t.k)}</span>
              <small>
                {number(t.p)} → {number(t.v)} ·{" "}
                {t.positive ? "Gestiegen" : "Gesunken"}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <p>
          Entwicklungen erscheinen, sobald vergleichbare Kennzahlen für beide
          Zeiträume vorliegen.
        </p>
      )}
    </section>
  );
}
export function OverviewRecommendations({
  analysis,
  channels,
  onSelect,
  onAll,
}: {
  analysis?: Analysis;
  channels: Channel[];
  onSelect: (r: Recommendation) => void;
  onAll: () => void;
}) {
  const items = [...(analysis?.recommendations || [])]
    .sort(
      (a, b) =>
        ({ high: 0, medium: 1, low: 2 })[a.priority] -
        { high: 0, medium: 1, low: 2 }[b.priority],
    )
    .slice(0, 3);
  return (
    <section className="marketing-opportunities">
      <div className="section-heading">
        <div>
          <h2>Darauf können wir aufbauen.</h2>
          <p>{items.length} Empfehlungen (Auswahl)</p>
        </div>
        <button className="text-button" onClick={onAll}>
          Alle Empfehlungen <ArrowRight size={16} />
        </button>
      </div>
      {items.length ? (
        <div className="marketing-recommendations">
          {items.map((r, i) => (
            <article key={i}>
              <div className="recommendation-channel">
                {channels.find((c) => c.id === r.channel)?.name || r.channel}
              </div>
              <button
                className="recommendation-open"
                onClick={() => onSelect(r)}
              >
                <h3>{r.title}</h3>
              </button>
              <p>{r.observation}</p>
              <NextStep r={r} onSelect={onSelect} />
            </article>
          ))}
        </div>
      ) : (
        <p>
          Sobald eine Auswertung vorliegt, findest du hier konkrete nächste
          Schritte für deine Kanäle.
        </p>
      )}
    </section>
  );
}
export function MarketingQuote() {
  return (
    <figure className="marketing-quote">
      <blockquote
        lang="en"
        cite="https://www.linkedin.com/posts/rbranson_complexity-is-your-enemy-any-fool-can-activity-7372304006297296898-1Ces"
      >
        <span aria-hidden="true">“</span>Complexity is your enemy. Any fool can
        make something complicated. It is hard to keep things simple.
        <span aria-hidden="true">”</span>
      </blockquote>
      <figcaption>
        <a
          href="https://www.linkedin.com/posts/rbranson_complexity-is-your-enemy-any-fool-can-activity-7372304006297296898-1Ces"
          target="_blank"
          rel="noreferrer"
        >
          Richard Branson
        </a>{" "}
        · Founder, Virgin Group
      </figcaption>
    </figure>
  );
}

function NextStep({
  r,
  onSelect,
}: {
  r: Recommendation;
  onSelect: (r: Recommendation) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div
      className="recommendation-step"
      data-open={open}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          e.currentTarget.querySelector("button")?.blur();
        }
      }}
    >
      <button
        className="step-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        Nächster Schritt <Info size={14} />
      </button>
      <div className="step-tooltip" id={id}>
        {r.action}
        <button onClick={() => onSelect(r)}>
          Einordnung &amp; Details <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
