import {useContext} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api,monthName} from '../api';
import {analyticsAdvice,type AnalyticsPagesReport,type AnalyticsSources} from '../analyticsRecommendations';
import {RecommendationContext} from './RecommendationTeaser';
import '../recommendation-teaser.css';
export function AnalyticsRecommendations({month,demo,expanded=false}:{month:string;demo:boolean;expanded?:boolean}){
 const context=useContext(RecommendationContext);
 const pages=useQuery({queryKey:['sales-pages',month],queryFn:()=>api<AnalyticsPagesReport>(`/sales-report/pages?month=${month}`),enabled:!demo,staleTime:3600000});
 const sources=useQuery({queryKey:['analytics-monthly-sources',month,demo,'ai-v4'],queryFn:()=>api<AnalyticsSources>(`/analytics/monthly-sources?month=${month}`),enabled:!demo,staleTime:3600000});
 const entries=demo?[]:analyticsAdvice(pages.isError?undefined:pages.data,sources.isError?undefined:sources.data);
 return <section className="recommendation-teaser organic-advice" aria-label="Analytics Handlungshinweise"><div className="section-heading"><div><h2>{expanded?'Google Analytics: nächste Schritte.':'Die nächsten Schritte.'}</h2><p>{monthName(month)} · Regelbasierte Prüfhinweise, keine KI-Analyse.</p></div>{!expanded&&context&&<button className="text-button" onClick={()=>context.onAll(['analytics'])}>Alle Empfehlungen</button>}</div>
 {!demo&&(pages.isError||sources.isError||pages.data?.warning||sources.data?.warning||pages.data?.thresholded||sources.data?.thresholded||sources.data?.data_loss)&&<p role="status">Ein Teil der Daten ist nicht aktuell oder vollständig bestätigt. Daraus werden keine Empfehlungen abgeleitet.</p>}
 {!entries.length&&<p>{demo?'Keine Live-Empfehlungen in der Demo.':pages.isPending||sources.isPending?'Daten für die Einordnung werden geladen …':'Noch keine belastbare Grundlage für diesen Zeitraum.'}</p>}
 <div className="recommendation-teaser-grid">{(expanded?entries:entries.slice(0,2)).map(r=><article key={r.id}><div className="recommendation-teaser-meta"><span>Google Analytics</span><small>Prüfhinweis / Testidee</small></div><h3>{r.title}</h3><p>{r.observation}</p><details><summary>Einordnung &amp; nächster Schritt</summary><dl><dt>Einordnung</dt><dd>{r.context}</dd><dt>Nächster Schritt</dt><dd>{r.action}</dd><dt>Erfolgskontrolle</dt><dd>{r.check}</dd></dl></details></article>)}</div>
 {!!entries.length&&<p className="organic-advice-source">Diese Hinweise verwenden Monatswerte, keine Gesamtwerte seit Veröffentlichung.{pages.data?` Seiten: ${pages.data.start}–${pages.data.end}, Abruf ${new Date(pages.data.updated_at).toLocaleString('de-CH')}.`:''}{sources.data?` Quellen: ${sources.data.start}–${sources.data.end}, Abruf ${new Date(sources.data.updated_at).toLocaleString('de-CH')}.`:''}</p>}
 </section>;
}
