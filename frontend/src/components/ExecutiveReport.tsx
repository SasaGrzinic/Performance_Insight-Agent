import {reportPageImage} from '../reportImages';
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from 'recharts';
import {ExternalLink} from 'lucide-react';
import {api,number,monthName} from '../api';
import {dailyReportChange} from '../reportDailyComparison';
import {reportFact} from '../reportEvidence';
import {ExecutiveEvents} from './ExecutiveEvents';
import {PeriodInfo} from './PeriodInfo';
import {overviewMetricHelp} from './MarketingOverview';
import type {Dashboard} from '../types';
import './executive-report.css';
type Page={path:string;title:string;url:string;image:string|null;kind?:string;current:Record<string,number|null>|null};
type Content={pages:Page[];warning?:string;thresholded:boolean;updated_at:string};
const choices=[{id:'analytics',key:'sessions',label:'Website-Besuche'}, {id:'linkedin_organic',key:'impressions',label:'LinkedIn-Impressionen'}, {id:'google_ads',key:'clicks',label:'Klicks auf Google-Anzeigen'}];
export function ExecutiveReport({data}:{data:Dashboard}){
 const [metric,setMetric]=useState(0);
 const previous=useQuery({queryKey:['dashboard',data.demo,data.comparison_month],queryFn:()=>api<Dashboard>(`${data.demo?'/demo':''}/dashboard?month=${data.comparison_month}`)});
 const [imageFailed,setImageFailed]=useState(false);
 const content=useQuery({queryKey:['sales-pages',data.month],queryFn:()=>api<Content>(`/sales-report/pages?month=${data.month}`),enabled:!data.demo,staleTime:3600000});
 const top=(content.data?.pages||[]).map(p=>({...p,image:reportPageImage(p.path,p.image),catalogImage:p.image})).filter(p=>(p.kind||p.catalogImage)&&!/^\/(?:fr-ch\/)?services\/support(?:\/|$)/i.test(p.path)&&typeof p.current?.screenPageViews==='number'&&p.current.screenPageViews>0).sort((a,b)=>b.current!.screenPageViews!-a.current!.screenPageViews!||a.path.localeCompare(b.path))[0];
 const selected=choices[metric];const selectedChannel=data.channels.find(c=>c.id===selected.id);const selectedFact=reportFact(data,selected.id,selected.key);
 const trend=data.series.map(p=>({day:p.day,date:p.date,value:p[`${selected.id}.${selected.key}`]??null,previous:previous.data?.series.find(v=>v.day===p.day)?.[`${selected.id}.${selected.key}`]??null}));
 const comparison=selectedChannel?.comparisons?.[selected.key];
 const organicFact=reportFact(data,'linkedin_organic','impressions');
 const adsFact=reportFact(data,'google_ads','clicks');


 return <div className="executive-report">
 <p className="executive-intro">{monthName(data.month)} in wenigen Blicken: Sichtbarkeit, Nutzung und Interesse. {data.partial?'Zwischenstand des laufenden Monats.':'Rückblick auf den abgeschlossenen Monat.'}{data.demo?' Gekennzeichnete Beispieldaten.':''}</p>
 <div className="executive-kpis">{choices.map(c=>{const fact=reportFact(data,c.id,c.key),channel=data.channels.find(x=>x.id===c.id);return <article key={c.id+'.'+c.key}><h3>{c.label}<PeriodInfo label={`${c.label} für die GL erklärt`}>{c.id==='google_ads'?'So oft wurden Google-Anzeigen angeklickt. Klicks zeigen eine Reaktion auf die Anzeige, sind aber weder eindeutige Personen noch bestätigte Leads oder Kunden.':channel?overviewMetricHelp(channel,c.key):'Keine Daten verfügbar.'} {fact.note}</PeriodInfo></h3><strong>{fact.value}</strong><span className={'executive-change '+fact.direction}>{fact.change||'Kein belastbarer Vergleich'}<PeriodInfo label={`Vergleich für ${c.label}`}>{fact.note} Vergleichszeitraum: {channel?.comparisons?.[c.key]?.current_start} bis {channel?.comparisons?.[c.key]?.current_end}; Vorperiode {channel?.comparisons?.[c.key]?.previous_start} bis {channel?.comparisons?.[c.key]?.previous_end}.</PeriodInfo></span></article>})}</div>
 <div className="executive-main"><section className="executive-chart"><header><h3>So entwickelt sich der Monat.</h3><PeriodInfo label="Entwicklungsdiagramm erklärt">Tageswerte aus dem Dashboard, keine kumulierten Gesamtwerte. Fehlende Tage bleiben Lücken. Der Hover vergleicht den einzelnen Kalendertag mit demselben Tag des Vormonats, nicht die Monatssumme. Für den noch unvollständigen laufenden Tag wird keine Veränderung berechnet. Der laufende Tag kann unvollständig sein; keine direkte Gleichsetzung von Reichweite und Geschäftserfolg.</PeriodInfo></header><div className="executive-choices" role="group" aria-label="Kennzahl im GL-Diagramm">{choices.map((c,i)=><button key={c.id+'.'+c.key} aria-pressed={metric===i} onClick={()=>setMetric(i)}>{c.label}</button>)}</div><div className="executive-chart-canvas" aria-label={`Tagesverlauf ${selected.label}`}>
 {trend.some(p=>typeof p.value==='number')?<ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{left:0,right:18,top:12,bottom:12}} accessibilityLayer><CartesianGrid vertical={false} stroke="#dce5ee"/><XAxis dataKey="day" tickLine={false} axisLine={false}/><YAxis width={56} tickLine={false} axisLine={false}/><Tooltip content={({active,payload})=>{
 const point=payload?.[0]?.payload as typeof trend[number]|undefined;
 if(!active||!point)return null;
 const incomplete=data.partial&&point.date===data.period_end;
 const unavailable=previous.isError?'Vergleich momentan nicht verfügbar':previous.isPending?'Vergleich wird geladen …':comparison?.stale?'Datenstand nicht aktuell':incomplete?'Laufender Tag noch unvollständig':null;
 const change=dailyReportChange(point.value,point.previous,!unavailable);
 return <div className="executive-tooltip"><strong>{point.day}. {monthName(data.month)}</strong><p>{selected.label}: <b>{number(typeof point.value==='number'?point.value:null,selectedChannel?.units[selected.key])}</b></p><p>{point.day}. {monthName(data.comparison_month)}: {number(typeof point.previous==='number'?point.previous:null,selectedChannel?.units[selected.key])}</p><span className={change===null?'':change>0?'up':change<0?'down':''}>{change===null?(unavailable||(point.previous===0?'Vorwert 0 – kein Prozentvergleich':'Kein Vergleichswert')):`${change>0?'+':''}${number(change)} % zum gleichen Tag des Vormonats`}</span></div>;
 }}/><Line dataKey="value" name={selected.label} type="linear" stroke="#0075d9" strokeWidth={3} connectNulls={false} dot={{r:3}} activeDot={{r:6}}/></LineChart></ResponsiveContainer>:<p>Für diese Kennzahl sind keine Tageswerte verfügbar.</p>}
 </div><p className="executive-chart-note">{selectedFact.note}</p></section>
 <section className="executive-highlight"><h3>Ein Thema mit Resonanz.<PeriodInfo label="Inhaltshighlight erklärt">Am häufigsten aufgerufene Seite unter den erkannten Fachinhalten und Seiten mit Katalogbild. Support / Helpdesk ausgeschlossen. Seitenaufrufe im Berichtsmonat, keine eindeutigen Interessenten. Datenstand: {content.data?.updated_at?new Date(content.data.updated_at).toLocaleString('de-CH'):'nicht verfügbar'}.</PeriodInfo></h3>
 {content.isLoading&&!data.demo?<p role="status">Inhalte werden geladen …</p>:content.isError?<p>Das Inhaltshighlight ist momentan nicht verfügbar. <button onClick={()=>content.refetch()}>Erneut laden</button></p>:top?<a href={top.url} target="_blank" rel="noreferrer">{top.image&&!imageFailed&&<img key={top.image} src={top.image} onError={()=>setImageFailed(true)} alt={top.title}/>}<div><h4>{top.title}</h4><strong>{number(top.current!.screenPageViews)} <small>Seitenaufrufe</small></strong><span>Inhalt ansehen <ExternalLink size={14}/></span></div></a>:<p>Für diesen Monat ist noch kein Inhaltshighlight verfügbar.</p>}
 {content.data?.warning&&<p>{content.data.warning}</p>}{content.data?.thresholded&&<p>Google begrenzt die Daten; das Ranking kann unvollständig sein.</p>}</section></div>
 <ExecutiveEvents month={data.month} demo={data.demo}/>
 <section className="executive-outlook"><header><h3>Was bedeutet das konkret?</h3><PeriodInfo label="Konkrete GL-Hinweise erklärt">Diese Hinweise verbinden beobachtete Kennzahlen mit regelbasierten nächsten Schritten. Sie sind keine KI-Analyse und belegen keine Ursache. Veränderungen beziehen sich auf den vergleichbaren Vormonatszeitraum; Seitenaufrufe sind weder Leads noch eindeutige Interessenten.</PeriodInfo></header><div>
 <article><h4>{top?'Dieses Thema erhält Aufmerksamkeit.':'Inhaltsprioritäten noch offen.'}</h4><p>{top?<>«{top.title}» führt unter den hier erfassten Fachinhalten mit <strong>{number(top.current!.screenPageViews)} Seitenaufrufen</strong>. Das zeigt Nutzung, aber noch keine Nachfrage.</>:'Ohne Seitenmesswerte lässt sich kein Thema verlässlich priorisieren.'}</p><p className="executive-next"><strong>Nächster Schritt:</strong> {top?'Marketing öffnet die Seitendetails und gleicht Zugriffsquellen sowie Interaktion ab. Sales ergänzt, ob das Thema in aktuellen Kundengesprächen vorkommt. Erst dann einen Folgebeitrag festlegen.':'Zuerst die Analytics-Seitendaten aktualisieren; bis dahin keine Themenpriorität aus diesem Ranking ableiten.'}</p></article>
 <article><h4>{organicFact.change?(organicFact.direction==='down'?'LinkedIn verliert Sichtbarkeit.':organicFact.direction==='up'?'LinkedIn gewinnt Sichtbarkeit.':'LinkedIn-Sichtbarkeit bleibt stabil.'):'LinkedIn-Entwicklung noch offen.'}</h4><p><strong>{organicFact.value} Impressionen</strong>{organicFact.change?<> · {organicFact.change}.</>:'. Ein belastbarer Vergleich fehlt.'} {organicFact.change?'Die Zahl allein erklärt nicht, ob die Beitragsanzahl oder einzelne Beiträge den Unterschied machen.':''}</p><p className="executive-next"><strong>Nächster Schritt:</strong> {organicFact.change?'Marketing vergleicht in LinkedIn Organic die Anzahl veröffentlichter Posts beider Zeiträume und die einzelnen Beitragswerte. Bei weniger Posts zuerst die Veröffentlichungsfrequenz abstimmen; andernfalls Themen und Formate gezielt vergleichen.':'Zuerst den LinkedIn-Datenstand und die Abdeckung beider Zeiträume klären. Daraus aktuell keine Änderung der Inhaltsstrategie ableiten.'}</p></article>
 <article><h4>Was folgt auf den Anzeigenklick?</h4><p><strong>{adsFact.value} Klicks auf Google-Anzeigen</strong>{adsFact.change?<> · {adsFact.change}.</>:'.'} Daraus lassen sich noch keine Leads oder Kunden ableiten.</p><p className="executive-next"><strong>Nächster Schritt:</strong> {adsFact.value==='—'?'Google-Ads-Daten aktualisieren, bevor Kampagnen priorisiert werden.':'Marketing öffnet das Kampagnenranking in Google Ads und wählt die Kampagne mit den meisten Klicks. Anschliessend die zugehörige Landingpage in Analytics auf Interaktion und erfasste Anfragen prüfen. Fehlende Anfrage-Messung als offene Grundlage festhalten.'}</p></article>
 </div></section>
 </div>;
}
