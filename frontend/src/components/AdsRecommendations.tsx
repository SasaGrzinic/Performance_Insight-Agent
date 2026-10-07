import {useContext,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import type {Data} from './AdsCampaigns';
import {adsAdvice} from '../adsRecommendations';
import {RecommendationContext} from './RecommendationTeaser';
import '../recommendation-teaser.css';
export function AdsRecommendations({demo,expanded=false}:{demo:boolean;expanded?:boolean}){
 const context=useContext(RecommendationContext);
 const [all,setAll]=useState(false);
 const query=useQuery({queryKey:['linkedin-ads-campaigns',demo],queryFn:()=>api<Data>('/linkedin/ads/campaigns'),enabled:!demo,refetchInterval:60000});
 const entries=!demo&&!query.isError&&query.data?adsAdvice(query.data):[];
 const shown=expanded?(all?entries:entries.slice(0,6)):entries.slice(0,2);
 return <section className="recommendation-teaser organic-advice" aria-label="LinkedIn Ads Handlungshinweise"><div className="section-heading"><div><h2>{expanded?'LinkedIn Ads: nächste Schritte.':'Die nächsten Schritte.'}</h2><p>Kampagnenbezogene Testideen und Vorbereitung · keine KI-Analyse.</p></div>{!expanded&&context&&<button className="text-button" onClick={()=>context.onAll(['linkedin'])}>Alle Empfehlungen</button>}</div>
 {demo?<p>Beispielkampagnen fliessen nicht in die Empfehlungen ein.</p>:query.isPending?<p role="status">Kampagnen werden eingeordnet …</p>:!entries.length?<p role="status">Keine aktuell bestätigte Kampagnengrundlage. Nach erfolgreichem Datenabruf erscheinen hier die nächsten Schritte.</p>:null}
 <div className="recommendation-teaser-grid">{shown.map(r=><article key={r.id}><div className="recommendation-teaser-meta"><span>LinkedIn Ads</span><small>{r.preparation?'Vorbereitung':r.title==='Datenzeitraum vor einer Bewertung prüfen'?'Datenhinweis':'Testidee'}</small></div><h3>{r.title}</h3><p><strong>{r.campaign}</strong><br/>{r.observation}</p><details><summary>Einordnung &amp; nächster Schritt</summary><dl><dt>Einordnung</dt><dd>{r.context}</dd><dt>Nächster Schritt</dt><dd>{r.action}</dd><dt>Erfolgskontrolle</dt><dd>{r.check}</dd></dl></details></article>)}</div>
 {expanded&&entries.length>6&&<button className="text-button" onClick={()=>setAll(!all)}>{all?'Weniger anzeigen':`Alle ${entries.length} Kampagnenhinweise anzeigen`}</button>}
 {!!entries.length&&query.data&&<p className="organic-advice-source">Kennzahlen: {query.data.start} bis {query.data.end} · keine Monatsbewertung. Abrufstand {new Date(query.data.last_success!).toLocaleString('de-CH')}. Entwürfe zuerst, danach Hinweise mit Messwerten und Datenhinweise; keine Erfolgsrangliste.</p>}
 </section>;
}
