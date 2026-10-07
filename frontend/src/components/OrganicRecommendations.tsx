import {useContext} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api,monthName} from '../api';
import type {Dashboard} from '../types';
import type {PostsResponse} from './PerformanceExplorer';
import {organicAdvice} from '../organicRecommendations';
import {RecommendationContext} from './RecommendationTeaser';
import '../recommendation-teaser.css';
export function OrganicRecommendations({data,expanded=false}:{data:Dashboard;expanded?:boolean}){
 const context=useContext(RecommendationContext);
 const query=useQuery({queryKey:['linkedin-posts',data.demo,data.month],queryFn:()=>api<PostsResponse>(`/linkedin/posts?month=${data.month}`),enabled:!data.demo});
 const fresh=!query.isError&&query.data?.status==='connected'&&!!query.data.last_success;
 const entries=data.demo?[]:organicAdvice(data.channels.find(c=>c.id==='linkedin_organic'),query.data?.posts||[],fresh);
 return <section className="recommendation-teaser organic-advice" aria-label="LinkedIn Organic Handlungshinweise"><div className="section-heading"><div><h2>{expanded?'LinkedIn Organic: nächste Schritte.':'Die nächsten Schritte.'}</h2><p>{monthName(data.month)} · Regelbasierte Testideen, keine KI-Analyse.</p></div>{!expanded&&context&&<button className="text-button" onClick={()=>context.onAll(['linkedin_organic'])}>Alle Empfehlungen</button>}</div>
 {data.demo?<p>Der Pilot benötigt echte LinkedIn-Daten. In der Demo werden keine Handlungshinweise daraus abgeleitet.</p>:query.isPending?<p role="status">Beiträge für die Einordnung werden geladen …</p>:!fresh?<p role="status">Beitragsdaten sind nicht aktuell bestätigt. Konkrete Beitrags- und Videotests bleiben bis zur erfolgreichen Aktualisierung zurückgestellt.</p>:null}
 <div className="recommendation-teaser-grid">{(expanded?entries:entries.slice(0,2)).map(r=><article key={r.id}><div className="recommendation-teaser-meta"><span>LinkedIn Organic</span><small>Testidee</small></div><h3>{r.title}</h3><p>{r.observation}</p><details><summary>Einordnung &amp; nächster Schritt</summary><dl><dt>Einordnung</dt><dd>{r.context}</dd><dt>Nächster Schritt</dt><dd>{r.action}</dd><dt>Erfolgskontrolle</dt><dd>{r.check}</dd></dl>{r.url?.startsWith('https://www.linkedin.com/')&&<a href={r.url} target="_blank" rel="noreferrer">Beitrag auf LinkedIn öffnen</a>}</details></article>)}</div>
 {!data.demo&&!query.isPending&&!entries.length&&<p>Noch keine belastbare Grundlage für eine konkrete Empfehlung im gewählten Monat.</p>}
 {fresh&&<p className="organic-advice-source">Beiträge: Gesamtwerte seit Veröffentlichung · Abrufstand {new Date(query.data!.last_success!).toLocaleString('de-CH')}.</p>}
 </section>;
}
