import {useContext,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api,monthName} from '../api';
import type {Report} from './GoogleAds';
import {googleAdsAdvice,type SearchEvidence} from '../googleAdsRecommendations';
import {RecommendationContext} from './RecommendationTeaser';
import '../recommendation-teaser.css';
export function GoogleAdsRecommendations({month,demo,expanded=false}:{month:string;demo:boolean;expanded?:boolean}){
 const context=useContext(RecommendationContext);const [all,setAll]=useState(false);
 const q=useQuery({queryKey:['google-ads-campaigns',month,demo],queryFn:()=>api<Report>(`/google-ads/campaigns?month=${month}`),enabled:!demo});
 const terms=useQuery({queryKey:['search-insights',month,'paid',demo],queryFn:()=>api<SearchEvidence>(`/search-insights?month=${month}&source=paid`),enabled:!demo});
 const entries=!demo&&!q.isError&&q.data?googleAdsAdvice(q.data,terms.isError?undefined:terms.data):[];
 const shown=entries.slice(0,expanded?(all?entries.length:6):2);
 return <section className="recommendation-teaser organic-advice" aria-label="Google Ads Handlungshinweise"><div className="section-heading"><div><h2>{expanded?'Google Ads: nächste Schritte.':'Die nächsten Schritte.'}</h2><p>{monthName(month)} · Regelbasierte Prüfhinweise und Testideen, keine KI-Analyse.</p></div>{!expanded&&context&&<button className="text-button" onClick={()=>context.onAll(['google_ads'])}>Alle Empfehlungen</button>}</div>
 {demo?<p>Für die Demo werden keine Empfehlungen aus echten Daten abgerufen.</p>:q.isPending?<p role="status">Kampagnen werden eingeordnet …</p>:!entries.length?<p role="status">Keine belastbare Kampagnengrundlage für diesen Zeitraum. Fehlende Werte werden nicht durch Beispiele ersetzt.</p>:null}
 {!demo&&(terms.isError||terms.data?.warning)&&<p>Suchanfragen derzeit nicht aktuell bestätigt; daraus werden keine Hinweise abgeleitet.</p>}
 <div className="recommendation-teaser-grid">{shown.map(r=><article key={r.id}><div className="recommendation-teaser-meta"><span>Google Ads</span><small>Prüfhinweis / Testidee</small></div><h3>{r.title}</h3><p>{r.observation}</p><details><summary>Einordnung &amp; nächster Schritt</summary><dl><dt>Einordnung</dt><dd>{r.context}</dd><dt>Nächster Schritt</dt><dd>{r.action}</dd><dt>Erfolgskontrolle</dt><dd>{r.check}</dd></dl></details></article>)}</div>
 {expanded&&entries.length>6&&<button className="text-button" onClick={()=>setAll(!all)}>{all?'Weniger anzeigen':`Alle ${entries.length} Hinweise anzeigen`}</button>}
 {!!entries.length&&q.data&&<p className="organic-advice-source">Alle Kampagnen im Berichtsmonat · {q.data.start} bis {q.data.end}. Kampagnenstand: {new Date(q.data.updated_at).toLocaleString('de-CH')}.{terms.data&&!terms.data.warning&&!terms.isError?` Suchanfragenstand: ${new Date(terms.data.updated_at).toLocaleString('de-CH')}.`:''} Kein Vergleich unterschiedlicher Kampagnenziele; keine automatischen Änderungen.</p>}
 </section>;
}
