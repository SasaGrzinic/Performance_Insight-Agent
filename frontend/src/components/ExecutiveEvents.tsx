import {useQuery} from '@tanstack/react-query';
import {api,number,monthName} from '../api';
import {PeriodInfo} from './PeriodInfo';
import type {Data} from './Events';

export function ExecutiveEvents({month,demo}:{month:string;demo:boolean}){
 const q=useQuery({queryKey:['events-aggregate','gl',month],queryFn:()=>api<Data>(`/events?year=${month.slice(0,4)}&month=${month.slice(5,7)}`),enabled:!demo,refetchInterval:60000});
 const events=(q.data?.snapshot?.events||[]).filter(e=>e.date?.startsWith(month)&&!e.duplicate_candidate).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
 return <section className="executive-events"><header><h3>Begegnungen ermöglichen.</h3><PeriodInfo label="Events im Report erklärt">Events nach Veranstaltungsdatum in {monthName(month)}. Kennzahlen zeigen den zuletzt erfassten Gesamtstand je Event, keine tatsächlichen Teilnahmen. Formularantworten sind keine bestätigte Personenzahl. Mögliche Mehrfacherfassungen sind ausgeschlossen. Fehlende Zahlen bleiben offen.</PeriodInfo></header>
 {demo?<p>Eventdetails sind in der öffentlichen Demo nicht enthalten.</p>:q.isPending?<p role="status">Events werden geladen …</p>:q.isError?<p role="alert">Events können momentan nicht geladen werden. <button onClick={()=>q.refetch()}>Erneut laden</button></p>:!events.length?<p>Für diesen Monat sind keine Events hinterlegt.</p>:<div className={`executive-event-grid ${events.length===1?'executive-event-grid--single':''}`}>{events.map(e=><article className="executive-event" key={e.id}>
 {e.image_url&&<img src={e.image_url} alt={e.title} loading="lazy" onError={ev=>{ev.currentTarget.style.display='none'}}/>}
 <div className="executive-event-copy"><p className="executive-event-meta">{e.date&&new Date(e.date+'T12:00:00').toLocaleDateString('de-CH')}{e.location&&` · ${e.location}`} · {e.source}</p><h4>{e.title}</h4>{e.description&&<p className="executive-event-description">{e.description}</p>}
 <dl>{[[e.registrations!=null?'Anmeldungen':'Formularantworten',e.registrations??e.responses],['Kunden',e.customers],['Sonio',e.employees],['Partner / Hersteller',e.partners]].map(([label,value])=><div key={String(label)}><dt>{label}</dt><dd>{number(typeof value==='number'?value:null)}</dd></div>)}</dl>
 {e.source==='Zoom'&&<dl className="executive-event-zoom"><div><dt>Teilnahme-Einträge</dt><dd>{number(e.attendees)}</dd></div><div><dt>Aufzeichnungsaufrufe</dt><dd>{number(e.recording_views)}</dd></div></dl>}
 <PeriodInfo label={`Zahlen und Datenstand: ${e.title}`}>{e.data_note} {e.customers_calculated?'Kundenzahl berechnet: Gesamtzahl abzüglich Sonio und Partner / Hersteller. ':''}{e.includes_companions?'Begleitpersonen sind nicht separat in der Antwortzahl berücksichtigt. ':''}{e.source==='Zoom'?'Teilnahme-Einträge können wiederholte Beitritte und Veranstalter enthalten. ':''}Stand: {new Date(e.observed_at||q.data!.snapshot!.observed_at).toLocaleString('de-CH',{timeZone:'Europe/Zurich'})}.</PeriodInfo>
 </div></article>)}</div>}
 </section>;
}
