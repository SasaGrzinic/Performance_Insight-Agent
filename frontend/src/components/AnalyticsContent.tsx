import {demoAnalytics,demoAnalyticsTraffic} from '../analyticsDemo';
import {useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {BookOpen,BriefcaseBusiness,FileText,Globe,Newspaper,Users} from 'lucide-react';
import {api,number} from '../api';
type Page={path:string;url:string;title:string;image:string|null;published_at:string|null;date_source:string|null;language:string;current:Record<string,number|null>|null;data_start:string;thresholded:boolean};
type Report={pages:Page[];end:string;updated_at:string;warning?:string;catalog_warning?:string;available_years:string[];unknown_dates:number;catalog_count:number;hero:string|null};
type Row={dimensions:string[];values:Record<string,number>};
type Traffic={sources:Row[];origins:Row[];ai:{providers:{label:string;value:number}[];sessions:number};visitors:Row[];events:Row[];thresholded:boolean;data_loss:boolean;warning?:string;start:string;end:string;updated_at:string};
const groups={campaign:{name:'Kampagnen',icon:Globe},profile:{name:'Vorstellungsseiten',icon:Users},competence:{name:'Kompetenzfelder',icon:BriefcaseBusiness},blog:{name:'Blogartikel',icon:BookOpen},behind:{name:'Blick hinter die Kulissen',icon:Users},news:{name:'Newsartikel',icon:Newspaper},stories:{name:'Customer Stories',icon:FileText}};
type Area=keyof typeof groups;
const metrics:Record<string,string>={screenPageViews:'Seitenaufrufe',totalUsers:'Besucher',sessions:'Sitzungen',engagementPerUser:'Ø aktive Zeit / Besucher (Sek.)'};
const paid=new Set(['Paid Search','Paid Social','Paid Shopping','Paid Video','Display','Cross-network','Audio','Paid Other']);
const organic=new Set(['Organic Search','Organic Social','Organic Shopping','Organic Video']);
const names:Record<string,string>={'Organic Search':'Organische Suche','Organic Social':'Organische soziale Medien','Organic Video':'Organische Videos','Organic Shopping':'Organisches Shopping','Paid Search':'Bezahlte Suche','Paid Social':'Bezahlte soziale Medien','Direct':'Direktzugriffe','Referral':'Verweisende Websites','Email':'E-Mail','Unassigned':'Nicht zugeordnet','(not set)':'Nicht zugeordnet','new':'Neu','returning':'Wiederkehrend',file_download:'Downloads',video_start:'Videostarts',video_progress:'Video-Fortschritte',video_complete:'Video abgeschlossen'};
const dateLabel=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString('de-CH');
function Breakdown({title,rows,metric,unit}:{title:string;rows:Row[];metric:string;unit:string}){
 const [all,setAll]=useState(false);
 return <div><h4>{title}</h4>{rows.length?<><dl>{rows.slice(0,all?undefined:5).map((r,i)=><div key={i}><dt>{r.dimensions.map(d=>names[d]||d).join(' · ')}</dt><dd>{number(r.values[metric])} <small>{unit}</small></dd></div>)}</dl>{rows.length>5&&<button className="text-button" onClick={()=>setAll(!all)}>{all?'Weniger anzeigen':`Alle ${rows.length} anzeigen`}</button>}</>:<p>Keine Werte von GA4 geliefert.</p>}</div>;
}
function TrafficDetails({area,page,demo}:{area:Area;page:Page;demo:boolean}){
 const q=useQuery<Traffic>({queryKey:['analytics-lifetime-traffic',area,page.path,demo,'ai-v2'],queryFn:()=>demo?Promise.resolve(demoAnalyticsTraffic(page.published_at)):api<Traffic>(`/analytics/area-traffic?area=${area}&path=${encodeURIComponent(page.path)}&refresh=true`),staleTime:3600000});
 if(q.isPending)return <p role="status">Herkunft und KI-Zugriffe werden geladen…</p>;
 if(q.isError)return <div role="alert"><p>Herkunftsdaten konnten nicht geladen werden.</p><button className="button" onClick={()=>q.refetch()}>Erneut versuchen</button></div>;
 const totals=[{label:'Organisch',value:0},{label:'Bezahlt',value:0},{label:'Weitere / nicht zugeordnet',value:0}];
 q.data.sources.forEach(r=>{totals[organic.has(r.dimensions[0])?0:paid.has(r.dimensions[0])?1:2].value+=r.values.sessions});
 return <div className="analytics-traffic">{q.data.warning&&<p role="alert">{q.data.warning}</p>}<p>Herkunft für diese Seite · {dateLabel(q.data.start)} bis {dateLabel(q.data.end)}</p>
 {q.data.sources.length>0&&<dl className="analytics-source-totals">{totals.map(t=><div key={t.label}><dt>{t.label}</dt><dd>{number(t.value)} <small>Sitzungen</small></dd></div>)}</dl>}
 <div className="analytics-breakdown"><Breakdown title="Zugriffskanäle" rows={q.data.sources} metric="sessions" unit="Sitzungen"/><Breakdown title="Quelle / Medium" rows={q.data.origins} metric="sessions" unit="Sitzungen"/><Breakdown title="Erkennbare KI-Zugriffe" rows={q.data.ai.providers.map(p=>({dimensions:[p.label],values:{sessions:p.value}}))} metric="sessions" unit="Sitzungen"/><Breakdown title="Neue / wiederkehrende Besucher" rows={q.data.visitors} metric="totalUsers" unit="Besucher"/><Breakdown title="Downloads & Videos" rows={q.data.events} metric="eventCount" unit="Ereignisse"/></div>
 <p>KI-Zugriffe werden anhand eindeutiger GA4-Quelldomains erkannt und sind bereits in den Quellen enthalten. Fehlende Herkunft kann nicht als KI zugeordnet werden. Besuchergruppen sind nicht additiv. Direktzugriffe und E-Mail sind keine organischen Suchzugriffe. Fehlende Ereignisse belegen kein eingerichtetes Tracking.</p>{(q.data.thresholded||q.data.data_loss)&&<p>GA4 meldet Datenschutzschwellen oder zusammengefasste Detailwerte. Die Aufschlüsselung kann unvollständig sein.</p>}</div>;
}
function PageRow({page,area,demo}:{page:Page;area:Area;demo:boolean}){
 const [open,setOpen]=useState(false);
 const [imageFailed,setImageFailed]=useState(false);
 return <article className="analytics-page"><div className="analytics-page-heading">{page.image&&!imageFailed&&<img src={page.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={()=>setImageFailed(true)}/>}<div><h3><a href={demo?undefined:page.url} target={demo?undefined:"_blank"} rel="noreferrer">{page.title}</a></h3><p>{page.published_at?`${page.date_source}: ${dateLabel(page.published_at)}`:'Veröffentlichungsdatum nicht verfügbar'} · {page.language}</p><p className="analytics-path">{page.path}</p></div></div>
 <dl className="analytics-page-kpis">{Object.entries(metrics).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{number(page.current?.[key])}</dd></div>)}</dl>
 {!page.current&&<p>GA4 liefert für diese Seite seit {dateLabel(page.data_start)} keine Messwerte. Das kann an fehlendem Tracking oder fehlenden Zugriffen liegen.</p>}{page.thresholded&&<p>GA4 schränkt diese Auswertung durch Datenschutzschwellen ein.</p>}
 <button className="analytics-detail-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Herkunft & KI ausblenden':'Herkunft, KI & Aktionen anzeigen'}</button>{open&&<TrafficDetails area={area} page={page} demo={demo}/>}</article>;
}
function AreaPanel({area,period,setPeriod,demo,today}:{area:Area;period:string;setPeriod:(v:string)=>void;demo:boolean;today:string}){
 const [selected,setSelected]=useState('');const [limit,setLimit]=useState(10);
 const queryClient=useQueryClient();
 const [refreshVersion,setRefreshVersion]=useState(0);
 const q=useQuery<Report>({queryKey:['analytics-cohorts-v2',area,period,demo,refreshVersion],queryFn:()=>demo?Promise.resolve(demoAnalytics(area,period)):api<Report>(`/analytics/areas?area=${area}&period=${period}${refreshVersion?'&refresh=true':''}`),staleTime:3600000});
 const year=period==='unknown'?today.slice(0,4):period.slice(0,4);
 const years=[...new Set([today.slice(0,4),year,...(q.data?.available_years||[])])].sort().reverse();
 const maxMonth=year===today.slice(0,4)?Number(today.slice(5,7)):12;
 const shown=(q.data?.pages||[]).filter(p=>!selected||selected===p.path);
 const hero=(selected?q.data?.pages.find(p=>p.path===selected)?.image:null)||q.data?.hero;
 return <section role="region" aria-label={groups[area].name}>
 <div className="analytics-area-hero">{hero&&<img src={hero} alt="" referrerPolicy="no-referrer"/>}<div><h3>{groups[area].name}</h3><p>Nach Veröffentlichung geordnet. Gesamte verfügbare Performance bis heute.</p></div></div>
 <div className="analytics-period-controls"><label>Veröffentlichungsjahr<select value={year} onChange={e=>setPeriod(e.target.value)}>{years.map(y=><option key={y}>{y}</option>)}</select></label><label>Veröffentlichungsmonat<select value={period} onChange={e=>setPeriod(e.target.value)}>{Array.from({length:maxMonth},(_,i)=>maxMonth-i).map(m=>{const value=`${year}-${String(m).padStart(2,'0')}`;return <option key={value} value={value}>{new Date(`${value}-01T12:00:00`).toLocaleDateString('de-CH',{month:'long'})}</option>})}<option value={year}>Ganzes Jahr {year}</option><option value="unknown">Ohne Veröffentlichungsdatum</option></select></label><button className="button" disabled={q.isFetching||demo} onClick={()=>{queryClient.invalidateQueries({queryKey:['analytics-lifetime-traffic',area]});setRefreshVersion(v=>v+1)}}>{q.isFetching?'Wird geladen…':'Kennzahlen aktualisieren'}</button></div>
 {demo&&<p>Illustrative Beispieldaten – Seiten und Kennzahlen sind fiktiv.</p>}{q.isPending?<p role="status">Originalbilder, Veröffentlichungsdaten und Kennzahlen werden geladen…</p>:q.isError?<div role="alert"><p>Die Seitenauswertung konnte nicht geladen werden.</p><button className="button" onClick={()=>q.refetch()}>Erneut versuchen</button></div>:<>
 <p className="analytics-cohort-note">{period==='unknown'?'Datum unbekannt: verfügbare Messwerte ab 1.1.2020.':'Kennzahlen je Seite seit Veröffentlichung'} bis {dateLabel(q.data.end)}. Die Auswahl filtert das Veröffentlichungsdatum, nicht den Messzeitraum.</p>
 {(q.data.warning||q.data.catalog_warning)&&<p role="alert">{q.data.warning||q.data.catalog_warning}</p>}
 <div className="analytics-page-select"><label>Seite auswählen<select value={selected} onChange={e=>{setSelected(e.target.value);setLimit(10)}}><option value="">Alle Seiten ({q.data.pages.length})</option>{q.data.pages.map(p=><option key={p.path} value={p.path}>{p.title} · {p.language}</option>)}</select></label><span>Datenstand: {new Date(q.data.updated_at).toLocaleString('de-CH')}</span></div>
 {shown.slice(0,limit).map(p=><PageRow key={`${p.path}:${q.data.updated_at}`} page={p} area={area} demo={demo}/>)}
 {!shown.length&&<p>Für diesen Veröffentlichungszeitraum sind keine Seiten hinterlegt. Wähle einen anderen Monat oder «Ganzes Jahr». {q.data.unknown_dates>0&&`${q.data.unknown_dates} Seiten findest du unter «Ohne Veröffentlichungsdatum».`}</p>}
 {shown.length>limit&&<button className="button" onClick={()=>setLimit(limit+10)}>Weitere Seiten anzeigen ({shown.length-limit})</button>}
 </>}
 </section>;
}
export function AnalyticsContent({demo}:{demo:boolean}){
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Zurich'}).format(new Date());
 const [area,setArea]=useState<Area>('blog');
 const [periods,setPeriods]=useState<Partial<Record<Area,string>>>({});
 const period=periods[area]||today.slice(0,7);
 return <section className="analytics-pages" aria-label="Website-Bereiche"><h2>Deine Website im Detail</h2><div className="channel-selector analytics-area-selector" role="group" aria-label="Website-Bereich auswählen">{(Object.keys(groups) as Area[]).map(k=>{const Icon=groups[k].icon;return <button key={k} className={area===k?'selected':''} aria-pressed={area===k} onClick={()=>setArea(k)}><Icon size={22}/>{groups[k].name}</button>})}</div>
 <AreaPanel key={`${area}:${period}`} area={area} period={period} setPeriod={p=>setPeriods({...periods,[area]:p})} demo={demo} today={today}/>
 <details><summary>Kennzahlen und Datengrundlage verstehen</summary><p>Seiten werden nach dem Artikeldatum auf Sonio.com oder, falls dieses fehlt, nach der ersten Veröffentlichung im CMS eingeordnet. Ein späteres Bearbeitungsdatum verschiebt sie nicht. Seiten ohne bestätigtes Datum werden separat gezeigt. Historische CMS-Migrationen können das Erstveröffentlichungsdatum beeinflussen.</p><p>Alle Kennzahlen zeigen den verfügbaren Gesamtstand seit Veröffentlichung bis zum Datenstand. GA4 kann nur Werte liefern, seit das Tracking aktiv ist. Seiten vor 2020 werden frühestens ab 1.1.2020 abgefragt. Die Jahresauswahl summiert keine Monatswerte und verdoppelt keine Besucher.</p><p>Seitenaufrufe zählen wiederholte Aufrufe. Besucher sind von GA4 erkannte Nutzer; Sitzungen sind Besuche mit Nutzung dieser Seite. Ø aktive Zeit je Besucher ist die gemessene aktive Interaktionszeit geteilt durch Besucher. Besucher und Sitzungen verschiedener Seiten dürfen nicht addiert werden. «—» bedeutet fehlende Messwerte, nicht null.</p><p>Organisch und bezahlt folgen den GA4-Kanalgruppen. Herkunft und KI-Zugriffe beziehen sich auf die jeweilige Seite und denselben Gesamtzeitraum. DE und FR bleiben getrennt. Die Kompetenz- und Kampagnenansicht können dieselbe Seite enthalten; sie werden nicht zusammengerechnet.</p></details>
 </section>;
}
