import {MetricHelp} from './MetricHelp';
import { RecommendationTeaser } from './RecommendationTeaser';
import { EditorialQuote } from './EditorialQuote';
import { asset } from '../staticDemo';
import '../mailchimp-cockpit.css';
import { PeriodInfo } from "./PeriodInfo";
import { useState, type ReactNode } from "react";
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
const fields = { delivered: "Zugestellt", unique_clicks: "Klickende", click_rate: "Klickrate", unsubscribe_rate: "Abmelderate" };
const detailFields = { emails_sent: "Versendet", unique_opens: "Öffnende", delivery_rate: "Zustellrate", hard_bounces: "Hard-Bounces", soft_bounces: "Soft-Bounces", unsubscribed: "Abmeldungen", open_rate: "Öffnungsrate" };
const displayMetric = (values: Mailing["values"], key: string) => number(values[key]) + (key.endsWith("_rate") && values[key] != null ? " %" : "");
const date = (s: string) =>
  new Date(s).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Zurich",
  });
export function MailchimpCampaigns({ demo, actions }: { demo: boolean; actions?: ReactNode }) {
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
    <section className="mailing-workspace mc-workspace">
      <div className="section-heading">
        <div>
          <h2>Mailings, die bewegen.</h2>
          <p>{q.data.count} Mailings · {q.data.groups.length} Gruppen</p>
        </div>
        {actions}
      </div>

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
          <span>Monat <PeriodInfo>Gruppen mit Versand im gewählten Monat. Zugehörige Sendungen aus anderen Monaten bleiben sichtbar. Kennzahlen entsprechen dem letzten erfolgreichen Abruf.</PeriodInfo></span>
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
      <MailingTotals mailings={displayedGroups.flatMap(g=>g.mailings)} /><p className="mailing-note" role="status">
        {groups.length} von {q.data.groups.length} Gruppen

      </p>
      {!groups.length && (
        <p>
          Keine Mailings für diese Auswahl. Ändere den Monat, Inhaltstyp oder
          Suchbegriff.
        </p>
      )}
      <MetricHelp label="Mailingkennzahlen erklärt" entries={Object.entries({...fields,...detailFields}).map(([key,label])=>({key,label,text:explanations[key]}))}/><div className="mailing-groups">
        {displayedGroups.map((group) => (
          <details className="mailing-group" key={group.name} open>
            <summary>
              <strong>{group.name}</strong>
              <span>
                {group.mailings.length}{" "}
                {group.mailings.length === 1 ? "Mailing" : "Mailings"}
              </span>
            </summary>
            <div className="mc-cards">
              {[...group.mailings].sort((a,b) => Date.parse(b.send_time) - Date.parse(a.send_time)).map(m=><MailingCard key={m.id} mailing={m} />)}
            </div>
          </details>
        ))}
      </div>
      <section className="mc-knowledge">
        <KpiExplainer channel="mailchimp" fields={{...fields, ...detailFields, sessions: 'Website-Besuche', engaged_sessions: 'Engagierte Website-Besuche'}} variant="knowledge" dataStatus="Mailchimp-Berichte; Website-Nutzung separat aus GA4. Der Bot-Filterstand der API ist nicht bestätigt. Öffnungen und Klicks können automatisierte Aktivität enthalten." />
        {q.data.last_success && <p className="muted">Datenstand: {new Date(q.data.last_success).toLocaleString('de-CH')}</p>}
      </section>
      <RecommendationTeaser/>
      <EditorialQuote portrait={asset('brand/portraits/stephen-king-v1.png')} text="All the arts depend upon telepathy to some degree, but I believe that writing offers the purest distillation." author="Stephen King" role="Schriftsteller" source="https://phsaplanguage.weebly.com/uploads/5/0/8/6/5086160/ap_2015_summer_reading.pdf" sourceLabel="Quelle: On Writing · What Writing Is"/>

    </section>
  );
}

function MailingImage({ mailing }: { mailing: Mailing }) {
  const [failed, setFailed] = useState(false);
  return <div className="mailing-image">{mailing.image_url && !failed ? <img src={mailing.image_url} alt={`Leitbild: ${mailing.title || mailing.subject}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : <span>Kein Leitbild verfügbar</span>}</div>;
}

const explanations: Record<string,string> = {
 delivered: 'Versendete E-Mails abzüglich unzustellbarer Nachrichten. Eine Zustellung belegt nicht die Platzierung im Posteingang oder das Lesen.',
 unique_clicks: 'Empfänger mit mindestens einem erfassten Klick. Pro Mailing einmal gezählt. Über mehrere Mailings können dieselben Personen mehrfach enthalten sein; Bots können Klicks auslösen.',
 click_rate: 'Anteil der zugestellten Empfänger mit mindestens einem Klick. Hilft, das Interesse unabhängig von der Versandgrösse einzuordnen. Kein Nachweis für Website-Besuche oder Leads.',
 unsubscribe_rate: 'Abmeldungen geteilt durch zugestellte E-Mails. Ein Anstieg kann auf unpassende Inhalte oder eine zu hohe Versandhäufigkeit hindeuten; kleine Versandmengen vorsichtig bewerten.',
 emails_sent: 'Versandvolumen vor Abzug unzustellbarer E-Mails.',
 unique_opens: 'Empfänger mit erfasster Öffnung. Datenschutzfunktionen können Öffnungen automatisch auslösen. Nur als ergänzendes Signal betrachten.',
 delivery_rate: 'Zugestellte E-Mails geteilt durch versendete E-Mails. Keine Garantie für die Platzierung im Posteingang.',
 hard_bounces: 'Dauerhaft unzustellbar, beispielsweise eine ungültige Adresse.',
 soft_bounces: 'Vorübergehend unzustellbar, beispielsweise ein volles Postfach.',
 unsubscribed: 'Abmeldungen, die Mailchimp diesem Mailing zurechnet.',
 open_rate: 'Erfasste Öffnungen im Verhältnis zur Zustellung. Durch Apple Mail Privacy Protection und Bots beeinflussbar.',
};
function MailingMetrics({values,detail=false,showHelp=false}:{values:Mailing['values'];detail?:boolean;showHelp?:boolean}){
 return <dl className="mc-metrics">{Object.entries(detail?detailFields:fields).map(([key,label])=><div key={key}><dt>{label} {showHelp&&<PeriodInfo label={`${label} erklärt`}>{explanations[key]}</PeriodInfo>}</dt><dd>{displayMetric(values,key)}</dd></div>)}</dl>
}
function MailingTotals({mailings}:{mailings:Mailing[]}){
 const sum=(key:string)=>mailings.length && mailings.every(m=>m.values[key]!=null)?mailings.reduce((n,m)=>n+m.values[key]!,0):null;
 const delivered=sum('delivered'), clicks=sum('unique_clicks'), unsubscribed=sum('unsubscribed');
 const values={delivered,unique_clicks:clicks,click_rate:delivered&&clicks!=null?clicks/delivered*100:null,unsubscribe_rate:delivered&&unsubscribed!=null?unsubscribed/delivered*100:null};
 return <section className="mc-totals" aria-label="Kennzahlen der ausgewählten Mailings"><MailingMetrics values={values} showHelp/><p><PeriodInfo label="Gesamtübersicht der Mailings erklärt">Empfänger werden je Mailing gezählt. Dieselbe Person kann deshalb in mehreren Mailings mehrfach vorkommen. Klick- und Abmeldequote werden aus den aufsummierten Werten und Zustellungen berechnet, nicht als einfacher Durchschnitt der Mailingquoten. Die Zahlen zeigen den Gesamtstand seit Versand; zugehörige Sendungen anderer Monate können enthalten sein.</PeriodInfo> {mailings.length} Mailings in der Auswahl · Gesamtstand seit Versand. Klickende je Mailing gezählt; Quoten nach Zustellungen gewichtet. Zugehörige Sendungen aus anderen Monaten sind enthalten.</p></section>
}
function MailingCard({mailing:m}:{mailing:Mailing}){
 const [open,setOpen]=useState(false);
 return <article className="mc-card"><MailingImage mailing={m}/><div className="mc-card-body"><div className="mc-meta"><span>{m.stage}</span><time dateTime={m.send_time}>{date(m.send_time)}</time></div><h3>{m.title||m.subject||'Mailing ohne Titel'}</h3>{m.subject&&m.subject!==m.title&&<p className="mc-subject">{m.subject}</p>}<MailingMetrics values={m.values}/><details className="mc-detail"><summary>Zustellung & Öffnungen</summary><MailingMetrics values={m.values} detail/></details><details className="mc-detail" onToggle={e=>setOpen(e.currentTarget.open)}><summary>Was interessiert? Links & Website-Besuche</summary>{open&&<MailingInsights id={m.id}/>}</details></div></article>
}
type Insights={links:{id:string;url:string;unique_clicks:number}[];website:{status:string;sessions:number|null;engaged_sessions:number|null;start?:string;end?:string;thresholded?:boolean};updated_at:string;warning?:string};
function MailingInsights({id}:{id:string}){
 const q=useQuery({queryKey:['mailchimp-insights',id],queryFn:()=>api<Insights>(`/mailchimp/campaigns/${encodeURIComponent(id)}/insights`),staleTime:3600000});
 if(q.isPending)return <p role="status">Link-Interesse wird geladen …</p>;
 if(q.isError)return <p role="alert">Details konnten nicht geladen werden. <button className="text-button" onClick={()=>q.refetch()}>Erneut laden</button></p>;
 const d=q.data;
 return <div className="mc-insights">{d.warning&&<p role="alert">{d.warning}</p>}<h4>Top 3 geklickte Links <PeriodInfo label="Link-Klickzahlen erklärt">Klickende je Link. Eine Person kann mehrere Links anklicken; die Werte dürfen nicht zu eindeutigen Personen addiert werden. Bots können enthalten sein.</PeriodInfo></h4>{d.links.length?<ol>{d.links.map(l=><li key={l.id}><a href={l.url} target="_blank" rel="noreferrer">{new URL(l.url).hostname}{new URL(l.url).pathname}</a><strong>{number(l.unique_clicks)} Klickende</strong></li>)}</ol>:<p>Keine Links mit erfassten Klicks vorhanden.</p>}<h4>Vom Mailing zur Website</h4><dl className="mc-metrics"><div><dt>Website-Besuche <PeriodInfo label="Website-Besuche erklärt">GA4-Sitzungen mit eindeutigem Mailing-Kampagnencode und Medium E-Mail, seit Versand. Eine Person kann mehrere Sitzungen auslösen. Nicht gleich Mailchimp-Klicks.</PeriodInfo></dt><dd>{number(d.website.sessions)}</dd></div><div><dt>Engagierte Besuche <PeriodInfo label="Engagierte Besuche erklärt">GA4-Sitzungen mit längerer Interaktion, mindestens zwei Seitenaufrufen oder einem Schlüsselereignis. Die konfigurierte Mindestdauer liegt standardmässig bei zehn Sekunden.</PeriodInfo></dt><dd>{number(d.website.engaged_sessions)}</dd></div></dl><p>{d.website.status==='unmapped'?'Keine eindeutige Kampagnenkennung in den Sonio-Links. Website-Besuche sind diesem Mailing nicht zuverlässig zuordenbar.':d.website.status==='unavailable'?'Analytics ist momentan nicht abrufbar.':d.website.status==='no_rows'?'Keine zugeordneten GA4-Berichtszeilen vorhanden.':`GA4 · ${d.website.start} bis ${d.website.end}`}</p>{d.website.thresholded&&<p>GA4-Datenschwellen können die Werte einschränken.</p>}<small>Abruf: {new Date(d.updated_at).toLocaleString('de-CH')}</small></div>
}
export function MailchimpHero(){
 return <><div className="marketing-mast"><h1>Mailchimp Insights.</h1></div><section className="marketing-hero"><img src={asset('brand/sonio-blog-header.jpg')} alt="Sonio Berglandschaft mit Fahrer und Zielflagge"/><div><h2>Im Postfach beginnt die Verbindung.</h2><p>Relevanz erkennen. Interesse vertiefen. Beziehungen stärken.</p></div></section><p className="directory-intro">Welche Mailings erreichen Menschen – und welche Inhalte bewegen zum nächsten Schritt? Zustellung, Klicks und Abmeldungen machen die Wirkung sichtbar. Die Linkauswertung zeigt, welche Themen besonderes Interesse wecken.</p></>
}
