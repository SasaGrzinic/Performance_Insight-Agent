import {AnalyticsInfo,analyticsMetricHelp} from './AnalyticsInfo';
import {MetricHelp} from './MetricHelp';
import { PeriodInfo } from "./PeriodInfo";
import {asset} from '../staticDemo';
import {demoAnalytics,demoAnalyticsTraffic} from '../analyticsDemo';
import {useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {BookOpen,BriefcaseBusiness,FileText,Globe,Newspaper,Users,Play,Settings} from 'lucide-react';
import {api,number} from '../api';
type Comparison={start:string;end:string;previous_start:string;previous_end:string;current:Record<string,number|null>|null;previous:Record<string,number|null>|null;thresholded:boolean};
type Page={comparison?:Comparison;path:string;url:string;title:string;image:string|null;published_at:string|null;date_source:string|null;language:string;current:Record<string,number|null>|null;data_start:string;thresholded:boolean};
type Report={pages:Page[];end:string;updated_at:string;warning?:string;catalog_warning?:string;available_years:string[];unknown_dates:number;catalog_count:number;hero:string|null};
type Row={dimensions:string[];values:Record<string,number>};
type Traffic={sources:Row[];origins:Row[];ai:{providers:{label:string;value:number}[];sessions:number};visitors:Row[];events:Row[];thresholded:boolean;data_loss:boolean;warning?:string;start:string;end:string;updated_at:string};
const groups={competence:{name:'Kompetenzfelder',icon:BriefcaseBusiness},services:{name:'Services',icon:Settings},blog:{name:'Blogartikel',icon:BookOpen},news:{name:'Newsartikel',icon:Newspaper},behind:{name:'Blick hinter die Kulissen',icon:Users},profile:{name:'Vorstellungsseiten',icon:Users},stories:{name:'Customer Stories',icon:FileText},videos:{name:'Videos',icon:Play},campaign:{name:'Kampagnen',icon:Globe}};
const serviceGroups=[['all','Alle'],['consulting','Consulting'],['professional-services','Professional Services'],['support-services','Support Services'],['sonio-cloud','Sonio Cloud'],['managed-services','Managed Services']] as const;
function serviceGroup(path:string){
 const p=path.replace(/^\/fr-ch(?=\/)/,'').replace(/\/$/,'');
 if(p==='/services/sonio-cloud'||p==='/services/managed-services/sonio-cloud')return 'sonio-cloud';
 if(p==='/services/support'||p.startsWith('/services/support/'))return 'support-services';
 return p.split('/')[2]||'';
}
type Area=keyof typeof groups;
const metrics:Record<string,string>={screenPageViews:'Seitenaufrufe',totalUsers:'Besucher',sessions:'Sitzungen',engagementPerUser:'Ø aktive Zeit / Besucher (Sek.)'};
const paid=new Set(['Paid Search','Paid Social','Paid Shopping','Paid Video','Display','Cross-network','Audio','Paid Other']);
const organic=new Set(['Organic Search','Organic Social','Organic Shopping','Organic Video']);
const names:Record<string,string>={'Organic Search':'Organische Suche','Organic Social':'Organische soziale Medien','Organic Video':'Organische Videos','Organic Shopping':'Organisches Shopping','Paid Search':'Bezahlte Suche','Paid Social':'Bezahlte soziale Medien','Direct':'Direktzugriffe','Referral':'Verweisende Websites','Email':'E-Mail','Unassigned':'Nicht zugeordnet','(not set)':'Nicht zugeordnet','new':'Neu','returning':'Wiederkehrend',file_download:'Downloads',video_start:'Videostarts',video_progress:'Video-Fortschritte',video_complete:'Video abgeschlossen'};
const dateLabel=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString('de-CH');
function Breakdown({title,rows,metric,unit}:{title:string;rows:Row[];metric:string;unit:string}){
 const [all,setAll]=useState(false);
 return <div><h4>{title} <AnalyticsInfo metric={title==='Erkennbare KI-Zugriffe'?'ai':title==='Downloads & Videos'?'eventCount':title} label={title}/></h4>{rows.length?<><dl>{rows.slice(0,all?undefined:5).map((r,i)=><div key={i}><dt>{r.dimensions.map(d=>names[d]||d).join(' · ')} {metric==='eventCount'&&<AnalyticsInfo metric={r.dimensions[0]} label={r.dimensions.map(d=>names[d]||d).join(' · ')}/> }</dt><dd>{number(r.values[metric])} <small>{unit}</small></dd></div>)}</dl>{rows.length>5&&<button className="text-button" onClick={()=>setAll(!all)}>{all?'Weniger anzeigen':`Alle ${rows.length} anzeigen`}</button>}</>:<p>Keine Werte von GA4 geliefert.</p>}</div>;
}
function TrafficDetails({area,page,demo}:{area:Area;page:Page;demo:boolean}){
 const q=useQuery<Traffic>({queryKey:['analytics-lifetime-traffic',area,page.path,demo,'ai-v2'],queryFn:()=>demo?Promise.resolve(demoAnalyticsTraffic(page.published_at)):api<Traffic>(`/analytics/area-traffic?area=${area}&path=${encodeURIComponent(page.path)}&refresh=true`),staleTime:3600000});
 if(q.isPending)return <p role="status">Herkunft und KI-Zugriffe werden geladen…</p>;
 if(q.isError)return <div role="alert"><p>Herkunftsdaten konnten nicht geladen werden.</p><button className="button" onClick={()=>q.refetch()}>Erneut versuchen</button></div>;
 const totals=[{label:'Organisch',value:0},{label:'Bezahlt',value:0},{label:'Weitere / nicht zugeordnet',value:0}];
 q.data.sources.forEach(r=>{totals[organic.has(r.dimensions[0])?0:paid.has(r.dimensions[0])?1:2].value+=r.values.sessions});
 return <div className="analytics-traffic">{q.data.warning&&<p role="alert">{q.data.warning}</p>}<p>Herkunft für diese Seite · {dateLabel(q.data.start)} bis {dateLabel(q.data.end)}</p>
 {q.data.sources.length>0&&<dl className="analytics-source-totals">{totals.map(t=><div key={t.label}><dt>{t.label} <AnalyticsInfo metric={t.label}/></dt><dd>{number(t.value)} <small>Sitzungen</small></dd></div>)}</dl>}
 <div className="analytics-breakdown"><Breakdown title="Zugriffskanäle" rows={q.data.sources} metric="sessions" unit="Sitzungen"/><Breakdown title="Quelle / Medium" rows={q.data.origins} metric="sessions" unit="Sitzungen"/><Breakdown title="Erkennbare KI-Zugriffe" rows={q.data.ai.providers.map(p=>({dimensions:[p.label],values:{sessions:p.value}}))} metric="sessions" unit="Sitzungen"/><Breakdown title="Neue / wiederkehrende Besucher" rows={q.data.visitors} metric="totalUsers" unit="Besucher"/><Breakdown title="Downloads & Videos" rows={q.data.events} metric="eventCount" unit="Ereignisse"/></div>
 <p>KI-Zugriffe werden anhand eindeutiger GA4-Quelldomains erkannt und sind bereits in den Quellen enthalten. Fehlende Herkunft kann nicht als KI zugeordnet werden. Besuchergruppen sind nicht additiv. Direktzugriffe und E-Mail sind keine organischen Suchzugriffe. Fehlende Ereignisse belegen kein eingerichtetes Tracking.</p>{(q.data.thresholded||q.data.data_loss)&&<p>GA4 meldet Datenschutzschwellen oder zusammengefasste Detailwerte. Die Aufschlüsselung kann unvollständig sein.</p>}</div>;
}
function hasVerifiedCoverage(c: Comparison) { return (c as Comparison & {coverage_verified?: boolean}).coverage_verified === true; }
function PageComparison({comparison:c}:{comparison?:Comparison}){
 if(!c)return null;
 const month=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString('de-CH',{month:'long'});
 return <div className="analytics-page-comparison"><h4>Monatsentwicklung · {month(c.start)} gegenüber {month(c.previous_start)} <AnalyticsInfo metric="comparison" label="Monatsentwicklung" monthly/></h4><p>{dateLabel(c.start)}–{dateLabel(c.end)} · Vorperiode: {dateLabel(c.previous_start)}–{dateLabel(c.previous_end)}</p><p>Vergleichsbewertung ausgesetzt, solange die tägliche Datenabdeckung dieser Seite nicht geprüft ist. Vorhandene Monatswerte bleiben sichtbar.</p><dl>{Object.entries(metrics).map(([key,label])=>{const now=c.current?.[key],prev=c.previous?.[key];const delta=hasVerifiedCoverage(c)&&typeof now==='number'&&typeof prev==='number'&&prev>0?(now-prev)/prev*100:null;return <div key={key}><dt>{label}</dt><dd><strong>{number(now)}</strong><span className={delta===null?'':delta>0?'trend-up':delta<0?'trend-down':''}>{delta===null?'Kein vergleichbarer Vorwert':`${delta>0?'↗ +':delta<0?'↘ ':'→ '}${number(delta)} %`}</span><small>Vorperiode: {number(prev)}</small></dd></div>})}</dl>{c.thresholded&&<p>GA4 schränkt den Monatsvergleich durch Datenschutzschwellen ein.</p>}</div>;
}
function PageRow({page,area,demo}:{page:Page;area:Area;demo:boolean}){
 const [open,setOpen]=useState(false);
 const [imageFailed,setImageFailed]=useState(false);
 return <article className={`analytics-page ${area==='services'?'analytics-service-card':''}`}><div className="analytics-page-heading">{area!=='services'&&page.image&&!imageFailed&&<img src={page.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={()=>setImageFailed(true)}/>}<div><h3><a href={demo?undefined:page.url} target={demo?undefined:"_blank"} rel="noreferrer">{page.title}</a></h3><p>{page.published_at?`${page.date_source}: ${dateLabel(page.published_at)}`:'Veröffentlichungsdatum nicht verfügbar'} · {page.language}</p><p className="analytics-path">{page.path}</p></div></div>
 {area==='services'?<><PageComparison comparison={page.comparison}/><details className="service-lifetime"><summary>Gesamtstand seit Veröffentlichung</summary> <p className="analytics-lifetime-label">Gesamtstand seit Veröffentlichung</p>
 <dl className="analytics-page-kpis">{Object.entries(metrics).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{number(page.current?.[key])}</dd></div>)}</dl>
</details></>:<> <p className="analytics-lifetime-label">Gesamtstand seit Veröffentlichung</p>
 <dl className="analytics-page-kpis">{Object.entries(metrics).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{number(page.current?.[key])}</dd></div>)}</dl>
 <PageComparison comparison={page.comparison}/>
</>}
 {!page.current&&<p>GA4 liefert für diese Seite seit {dateLabel(page.data_start)} keine Messwerte. Das kann an fehlendem Tracking oder fehlenden Zugriffen liegen.</p>}{page.thresholded&&<p>GA4 schränkt diese Auswertung durch Datenschutzschwellen ein.</p>}
 <button className="analytics-detail-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Herkunft & KI ausblenden':'Herkunft, KI & Aktionen anzeigen'}</button>{open&&<TrafficDetails area={area} page={page} demo={demo}/>}</article>;
}
function AreaPanel({area,period,setPeriod,demo,today}:{area:Area;period:string;setPeriod:(v:string)=>void;demo:boolean;today:string}){
 const [limit,setLimit]=useState(10);
 const [service,setService]=useState('all');
 const [language,setLanguage]=useState(['competence','services','videos'].includes(area)?'DE':'all');
 const queryClient=useQueryClient();
 const [refreshVersion,setRefreshVersion]=useState(0);
 const q=useQuery<Report>({queryKey:['analytics-cohorts-v5',area,period,demo,refreshVersion],queryFn:()=>demo?Promise.resolve(demoAnalytics(area,period)):api<Report>(`/analytics/areas?area=${area}&period=${period}${refreshVersion?'&refresh=true':''}`),staleTime:3600000});
 const year=(period==='unknown'||period==='all')?today.slice(0,4):period.slice(0,4);
 const years=[...new Set([today.slice(0,4),year,...(q.data?.available_years||[])])].sort().reverse();
 const maxMonth=year===today.slice(0,4)?Number(today.slice(5,7)):12;
 const pages=(q.data?.pages||[]).filter(p=>area!=='blog'||!(/blick[\s-]+hinter[\s-]+die[\s-]+kulissen/i.test(p.title+' '+p.path)));
 const localizedPages=pages.filter(p=>language==='all'||p.language===language);
 const servicePages=localizedPages.filter(p=>area!=='services'||service==='all'||serviceGroup(p.path)===service);
 const shown=servicePages;
 const hero=asset(`brand/analytics/${area==='services'?'competence':area==='videos'?'blog':area}.webp`);
 return <section role="region" aria-label={groups[area].name}>
 <div className={`analytics-area-hero sphere-hero sphere-hero-${area} ${["profile","news","stories"].includes(area)?"sphere-title-dark":"sphere-title-light"}`}>{hero&&<img src={hero} alt="" referrerPolicy="no-referrer"/>}<div><h3>{groups[area].name}</h3></div></div>
 <div className="analytics-period-controls"><label>Veröffentlichungsjahr<select value={period==='all'?'all':year} onChange={e=>setPeriod(e.target.value)}><option value="all">Alle Jahre</option>{years.map(y=><option key={y}>{y}</option>)}</select></label><label><span>Veröffentlichungsmonat <PeriodInfo>Die Auswahl filtert das Veröffentlichungsdatum. Kennzahlen zeigen die gesamte verfügbare Performance seit Veröffentlichung bis {q.data ? dateLabel(q.data.end) : "heute"}. Ohne bekanntes Datum werden Messwerte ab 1.1.2020 berücksichtigt.</PeriodInfo></span><select aria-label="Veröffentlichungsmonat" value={period} onChange={e=>setPeriod(e.target.value)}>{Array.from({length:maxMonth},(_,i)=>maxMonth-i).map(m=>{const value=`${year}-${String(m).padStart(2,'0')}`;return <option key={value} value={value}>{new Date(`${value}-01T12:00:00`).toLocaleDateString('de-CH',{month:'long'})}</option>})}<option value={year}>Ganzes Jahr {year}</option><option value="unknown">Ohne Veröffentlichungsdatum</option><option value="all">Alle</option></select></label><button className="button" disabled={q.isFetching||demo} onClick={()=>{queryClient.invalidateQueries({queryKey:['analytics-lifetime-traffic',area]});setRefreshVersion(v=>v+1)}}>{q.isFetching?'Wird geladen…':'Kennzahlen aktualisieren'}</button></div>
 {area==='videos'&&<p>Website-Nutzung der Videoseiten auf sonio.com. Aufrufe eingebetteter Videos stehen unter «Herkunft, KI & Aktionen» – die YouTube-Kanalzahlen bleiben im Kanal YouTube.</p>}
 {demo&&<p>Illustrative Beispieldaten – Seiten und Kennzahlen sind fiktiv.</p>}{q.isPending?<p role="status">{groups[area].name}: Seiten und Kennzahlen werden geladen…</p>:q.isError?<div role="alert"><p>Die Seitenauswertung konnte nicht geladen werden.</p><button className="button" onClick={()=>q.refetch()}>Erneut versuchen</button></div>:<>

 {q.data.warning&&<p role="alert">{q.data.warning}</p>}{q.data.catalog_warning&&q.data.catalog_warning!==q.data.warning&&<p role="alert">{q.data.catalog_warning}</p>}
 <div className="analytics-language-select"><label>Sprache<select value={language} onChange={e=>{setLanguage(e.target.value);setLimit(10)}}><option value="DE">Deutsch</option><option value="FR">Französisch</option><option value="all">Alle Sprachen</option></select></label></div>
 {area==='services'&&<div className="service-group-selector" role="group" aria-label="Service-Bereich auswählen">{serviceGroups.map(([key,label])=><button key={key} type="button" aria-pressed={service===key} className={service===key?'selected':''} onClick={()=>{setService(key);setLimit(10)}}>{label}<span>{key==='all'?localizedPages.length:localizedPages.filter(p=>serviceGroup(p.path)===key).length}</span></button>)}</div>}
 <div className="analytics-page-select analytics-page-status" role="status"><span><strong>{shown.length} {shown.length===1?'Seite':'Seiten'}</strong> in der Auswahl{shown.length>limit?` · ${limit} angezeigt`:''} · {shown.filter(p=>p.current!==null).length} mit Kennzahlen</span><span>Datenstand: {new Date(q.data.updated_at).toLocaleString('de-CH')}</span></div>
 {period==='all'&&q.data.unknown_dates>0&&<p className="muted">Auch Seiten ohne bestätigtes Veröffentlichungsdatum sind enthalten. Die Kennzahlen zeigen den verfügbaren Gesamtstand je Seite.</p>}
 <MetricHelp label="Kennzahlen der Seiten erklärt" entries={Object.entries(metrics).map(([key,label])=>({key,label,text:analyticsMetricHelp(key)}))}/><div className="analytics-content-grid">{shown.slice(0,limit).map(p=><PageRow key={`${p.path}:${q.data.updated_at}`} page={p} area={area} demo={demo}/>)}</div>
 {!shown.length&&<div className="analytics-empty-selection" role="status"><p>{pages.length?'Keine Seiten passen zur gewählten Sprache oder zum Service-Bereich.':'Im gewählten Veröffentlichungszeitraum sind keine Seiten im Katalog erfasst. Das bedeutet nicht, dass die Website keine Zugriffe hatte.'}</p>{q.data.unknown_dates>0&&period!=='all'&&<p>{q.data.unknown_dates} Seiten haben kein bestätigtes Veröffentlichungsdatum und werden bei Monats- und Jahresfiltern nicht angezeigt.</p>}<div>{period!=='all'&&<button className="button" onClick={()=>setPeriod('all')}>Alle Veröffentlichungszeiträume anzeigen</button>}{(language!=='all'||service!=='all')&&<button className="button" onClick={()=>{setLanguage('all');setService('all')}}>Sprache und Service-Filter zurücksetzen</button>}</div></div>}
 {shown.length>limit&&<button className="button" onClick={()=>setLimit(limit+10)}>Weitere Seiten anzeigen ({shown.length-limit})</button>}
 </>}
 </section>;
}
export function AnalyticsContent({demo}:{demo:boolean}){
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Zurich'}).format(new Date());
 const [area,setArea]=useState<Area>('competence');
 const [periods,setPeriods]=useState<Partial<Record<Area,string>>>({});
 const period=periods[area]||'all';
 return <section className="analytics-pages" aria-label="Website-Bereiche"><h2>Website im Detail <PeriodInfo label="Zeitraum der Seitenkennzahlen erklärt">Monat und Jahr filtern das Veröffentlichungsdatum der Seiten. Die Kennzahlen zeigen den verfügbaren Gesamtstand seit Veröffentlichung, nicht nur die Nutzung im ausgewählten Monat. Die monatliche Kanalübersicht oben hat einen anderen Zeitbezug. Besucher verschiedener Seiten nicht addieren.</PeriodInfo></h2><div className="channel-selector analytics-area-selector" role="group" aria-label="Website-Bereich auswählen">{(Object.keys(groups) as Area[]).map(k=>{const Icon=groups[k].icon;return <button key={k} className={area===k?'selected':''} aria-pressed={area===k} onClick={()=>setArea(k)}><Icon size={22}/>{groups[k].name}</button>})}</div>
 <AreaPanel key={`${area}:${period}`} area={area} period={period} setPeriod={p=>setPeriods({...periods,[area]:p})} demo={demo} today={today}/>
 <details><summary>Kennzahlen und Datengrundlage verstehen</summary><p>Seiten werden nach dem Artikeldatum auf Sonio.com oder, falls dieses fehlt, nach der ersten Veröffentlichung im CMS eingeordnet. Ein späteres Bearbeitungsdatum verschiebt sie nicht. Seiten ohne bestätigtes Datum werden separat gezeigt. Historische CMS-Migrationen können das Erstveröffentlichungsdatum beeinflussen.</p><p>Alle Kennzahlen zeigen den verfügbaren Gesamtstand seit Veröffentlichung bis zum Datenstand. GA4 kann nur Werte liefern, seit das Tracking aktiv ist. Seiten vor 2020 werden frühestens ab 1.1.2020 abgefragt. Die Jahresauswahl summiert keine Monatswerte und verdoppelt keine Besucher.</p><p>Seitenaufrufe zählen wiederholte Aufrufe. Besucher sind von GA4 erkannte Nutzer; Sitzungen sind Besuche mit Nutzung dieser Seite. Ø aktive Zeit je Besucher ist die gemessene aktive Interaktionszeit geteilt durch Besucher. Besucher und Sitzungen verschiedener Seiten dürfen nicht addiert werden. «—» bedeutet fehlende Messwerte, nicht null.</p><p>Organisch und bezahlt folgen den GA4-Kanalgruppen. Herkunft und KI-Zugriffe beziehen sich auf die jeweilige Seite und denselben Gesamtzeitraum. DE und FR bleiben getrennt. Die Kompetenz- und Kampagnenansicht können dieselbe Seite enthalten; sie werden nicht zusammengerechnet.</p></details>
 </section>;
}
