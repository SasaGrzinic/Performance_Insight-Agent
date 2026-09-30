import {createContext,useContext} from 'react';
import {ArrowRight} from 'lucide-react';
import type {Channel,Recommendation} from '../types';
import {channelEntries} from '../recommendationContent';
import '../recommendation-teaser.css';
export const RecommendationContext=createContext<{channels:Channel[];items:Recommendation[];scope:string[];periodLabel:string;onSelect:(r:Recommendation)=>void;onAll:(scope:string[])=>void}|null>(null);
export function RecommendationTeaser(){
 const context=useContext(RecommendationContext);
 if(!context)return null;
 const {channels,items,scope,periodLabel,onSelect,onAll}=context;
 const groups=channels.filter(c=>!scope.length||scope.includes(c.id)).map(c=>channelEntries(c.id,items));
 // Prioritise available analysis; use one lead per channel for cross-channel views.
 const leads=groups.map(g=>g[0]).filter(Boolean);
 const rest=groups.flatMap(g=>g.slice(1));
 const entries=[...leads,...rest].sort((a,b)=>Number(a.example)-Number(b.example)||({high:0,medium:1,low:2}[a.recommendation.priority]-{high:0,medium:1,low:2}[b.recommendation.priority])).slice(0,2);
 if(!entries.length)return null;
 return <section className="recommendation-teaser" aria-label="Empfohlene nächste Schritte"><div className="section-heading"><div><h2>Die nächsten Schritte.</h2><p>Zwei Impulse für die nächste Marketingentscheidung. Basis: {periodLabel}.</p></div><button className="text-button" onClick={()=>onAll(scope)}>Alle Empfehlungen <ArrowRight size={16}/></button></div><div className="recommendation-teaser-grid">{entries.map(({recommendation:r,example},i)=><article key={`${r.channel}:${i}`}><div className="recommendation-teaser-meta"><span>{channels.find(c=>c.id===r.channel)?.name||r.channel}</span><small>{example?'Beispiel':'Aus Kennzahlen / Analyse'}</small></div><h3>{r.title}</h3><p>{r.action}</p><button className="text-button" onClick={()=>onSelect(r)}>{example?'Beispiel einordnen':'Begründung ansehen'} <ArrowRight size={14}/></button></article>)}</div></section>;
}
