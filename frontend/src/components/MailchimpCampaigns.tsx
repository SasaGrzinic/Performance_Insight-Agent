import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, number } from "../api";
import { KpiExplainer } from "./KpiExplainer";

type Mailing = {
  image_url?: string | null;
  id: string;
  title: string;
  subject: string;
  send_time: string;
  stage: string;
  test: boolean;
  values: Record<string, number | null>;
  report_available: boolean;
};
type Data = {
  year: number;
  count: number;
  groups: { name: string; mailings: Mailing[] }[];
  last_success: string | null;
  status: string;
};
const fields = {
  emails_sent: "Versendet",
  unique_opens: "Öffnende",
  unique_clicks: "Klickende",
  click_rate: "Klickrate",
  delivery_rate: "Zustellrate",
};
const detailFields = { delivered: "Zugestellt", hard_bounces: "Hard-Bounces", soft_bounces: "Soft-Bounces", unsubscribed: "Abmeldungen", unsubscribe_rate: "Abmelderate", open_rate: "Öffnungsrate" };
const displayMetric = (values: Mailing["values"], key: string) => number(values[key]) + (key.endsWith("_rate") && values[key] != null ? " %" : "");
const date = (s: string) =>
  new Date(s).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Zurich",
  });
export function MailchimpCampaigns({ demo }: { demo: boolean }) {
  const currentMonth = Number(new Intl.DateTimeFormat("en", {month: "2-digit", timeZone: "Europe/Zurich"}).format(new Date()));
  const monthOrder = Array.from({length: 12}, (_, i) => ((currentMonth - 1 - i + 12) % 12));
  const [month, setMonth] = useState(String(currentMonth).padStart(2, "0"));
  const [kind, setKind] = useState("");
  const [search, setSearch] = useState("");
  const q = useQuery({
    queryKey: ["mailchimp-campaigns", demo],
    queryFn: () => api<Data>("/mailchimp/campaigns"),
    enabled: !demo,
    refetchInterval: 60000,
  });
  if (demo)
    return (
      <section className="panel">
        <h2>Mailings 2026</h2>
        <p>Die öffentliche Demo enthält keine echten Mailings.</p>
      </section>
    );
  if (q.isPending) return <p role="status">Mailings werden geladen …</p>;
  if (q.isError)
    return (
      <section className="panel" role="alert">
        <p>Mailings konnten nicht geladen werden.</p>
        <button className="button" onClick={() => q.refetch()}>
          Erneut laden
        </button>
      </section>
    );
  const titleOptions = [...new Set(q.data.groups.flatMap(g => [g.name, ...g.mailings.map(m => m.title.trim() || m.subject.trim())]).filter(Boolean))].sort((a,b) => a.localeCompare(b, "de-CH"));
  const category = (name: string) =>
    /newsletter|sonio nl/i.test(name)
      ? "newsletter"
      : /event|webinar|invitation|fly7|experience|zoo|forum/i.test(name)
        ? "event"
        : "campaign";
  const groups = q.data.groups.filter(
    (g) =>
      (!kind || category(g.name) === kind) &&
      (!month || g.mailings.some((m) => m.send_time.slice(5, 7) === month)) &&
      (!search ||
        [g.name, ...g.mailings.flatMap((m) => [m.title, m.subject])]
          .join(" ")
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase().trim())),
  );
  const displayedGroups = [...groups].sort((a, b) =>
    Math.max(...b.mailings.map(m => Date.parse(m.send_time))) - Math.max(...a.mailings.map(m => Date.parse(m.send_time))));
  return (
    <section className="mailing-workspace">
      <div className="section-heading">
        <div>
          <h2>Events & Kampagnen 2026</h2>
          <p>Versendete Mailings ohne Test- und Vorlagenmailings.</p>
        </div>
        <span>
          {q.data.count} Mailings · {q.data.groups.length} Gruppen
        </span>
      </div>
      <p className="mailing-note">
        Test- und Vorlagenmailings sind ausgeschlossen. Die Gruppierung wird aus
        Titel und Betreff abgeleitet. Sprachvarianten und erneute Sendungen
        bleiben einzeln sichtbar. Unklare Zuordnungen stehen separat.
      </p>
      {q.data.status === "error" && (
        <p role="alert">
          Aktualisierung fehlgeschlagen. Die zuletzt geladenen Mailings bleiben
          sichtbar.
        </p>
      )}
      {!q.data.count && (
        <p>Noch keine versendeten Mailings aus 2026 geladen.</p>
      )}
      <div className="mailing-filters">
        <label>
          Monat
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {monthOrder.map((i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>
                {new Date(2026, i, 1).toLocaleString("de-CH", {
                  month: "long",
                })}
              </option>
            ))}
            <option value="">Ganzes Jahr 2026</option>
          </select>
        </label>
        <label>
          Inhalt
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">Alle Mailings</option>
            <option value="campaign">Kampagnen</option>
            <option value="event">Events</option>
            <option value="newsletter">Multitopic-Newsletter</option>
          </select>
        </label>
        <label>
          Mailing oder Thema suchen
          <input
            type="search"
            list="mailing-title-options"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (titleOptions.includes(e.target.value)) { setMonth(""); setKind(""); }
            }}
            placeholder="Titel auswählen oder suchen"
          />
          <datalist id="mailing-title-options">{titleOptions.map(title => <option key={title} value={title} />)}</datalist>
        </label>
      </div>
      <p className="mailing-note" role="status">
        {groups.length} von {q.data.groups.length} Gruppen
        {month
          ? " · Gruppen mit Versand im gewählten Monat; zugehörige Sendungen aus anderen Monaten bleiben sichtbar."
          : ""}
      </p>
      {!groups.length && (
        <p>
          Keine Mailings für diese Auswahl. Ändere den Monat, Inhaltstyp oder
          Suchbegriff.
        </p>
      )}
      <div className="mailing-groups">
        {displayedGroups.map((group) => (
          <details className="mailing-group" key={group.name} open>
            <summary>
              <strong>{group.name}</strong>
              <span>
                {group.mailings.length}{" "}
                {group.mailings.length === 1 ? "Mailing" : "Mailings"}
              </span>
            </summary>
            <div className="mailing-rows">
              {[...group.mailings].sort((a,b) => Date.parse(b.send_time) - Date.parse(a.send_time)).map((m) => (
                <article className="mailing-row" key={m.id}>
                  <time dateTime={m.send_time}>{date(m.send_time)}</time>
                  <MailingImage key={m.image_url || m.id} mailing={m} />
                  <div className="mailing-copy">
                    <div className="mailing-stage">
                      {m.stage}
                      {m.test && <span>Test / Vorlage im Titel</span>}
                    </div>
                    <h3>{m.title || m.subject || "Mailing ohne Titel"}</h3>
                    {m.subject && m.subject !== m.title && <p>{m.subject}</p>}
                    <small>ID: {m.id}</small>
                  </div>
                  <dl>
                    {Object.entries(fields).map(([key, label]) => (
                      <div key={key}>
                        <dt>{label}</dt>
                        <dd>{displayMetric(m.values, key)}</dd>
                      </div>
                    ))}
                  </dl>
                  <details className="mailing-delivery-details"><summary>Zustellung & Abmeldungen</summary>
                    <dl>{Object.entries(detailFields).map(([key,label]) => <div key={key}><dt>{label}</dt><dd>{displayMetric(m.values,key)}</dd></div>)}</dl>
                    <p>Öffnungsraten können durch Datenschutzfunktionen und Bots beeinflusst sein. Fehlende Werte bleiben „—“.</p>
                  </details>
                </article>
              ))}
            </div>
          </details>
        ))}
      </div>
      <section className="panel detail-definitions">
        <h2>So liest du diese Zahlen</h2>
        <KpiExplainer channel="mailchimp" fields={{...fields, ...detailFields}} />
        <p>
          Öffnende und Klickende
          werden je Mailing gezählt; über mehrere Mailings hinweg sind das keine
          eindeutigen Personen. Fehlende Berichte erscheinen als „—“.
        </p>
        {q.data.last_success && (
          <p className="muted">
            Datenstand: {new Date(q.data.last_success).toLocaleString("de-CH")}
          </p>
        )}
      </section>
    </section>
  );
}

function MailingImage({ mailing }: { mailing: Mailing }) {
  const [failed, setFailed] = useState(false);
  return <div className="mailing-image">{mailing.image_url && !failed ? <img src={mailing.image_url} alt={`Leitbild: ${mailing.title || mailing.subject}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : <span>Kein Leitbild verfügbar</span>}</div>;
}
