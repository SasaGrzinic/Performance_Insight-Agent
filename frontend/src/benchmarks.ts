/** Editorial reference values, checked 2026-10-05. Never targets or scoring inputs. */
export type Benchmark = { value: string; context: string; explanation: string; source?: string; sourceName?: string };
const flin = {source:'https://flin.agency/linkedin-ads-benchmark-2025/',sourceName:'flin · 2025'};
export function linkedinAdsBenchmark(objective: string|null, metric: string, currency: string): Benchmark|undefined {
 if (objective==='BRAND_AWARENESS' && metric==='cpm' && currency==='CHF') return { ...flin,value:'CHF 10.12',context:'Ø Schweiz · Awareness',explanation:'Durchschnitt über Anzeigenformate, kein Median: flin, 1’363 Anzeigen insgesamt, 2024–2025. Keine separate IT-Branche. Ausgaben je 1’000 Impressionen; Format und Zielgruppe beeinflussen die Kosten. Günstigere Ausspielung belegt keine höhere Bekanntheit.'};
 if(objective!=='WEBSITE_VISIT')return;
 if(metric==='ctr')return {...flin,value:'0.63 %',context:'Ø Schweiz · Traffic',explanation:'Durchschnitt über Anzeigenformate: flin, 2024–2025, 1’363 Anzeigen insgesamt. Kein IT-Branchenmedian. Klickdefinition und Format vor direkter Bewertung prüfen; keine Referenz für Landingpage-CTR. Mehr Klickresonanz belegt keine besseren Leads.'};
 if(metric==='cpc'&&currency==='CHF')return {...flin,value:'CHF 5.37',context:'Ø Schweiz · Traffic',explanation:'Durchschnitt über Anzeigenformate: flin, 2024–2025. 1’363 Anzeigen insgesamt, keine ausgewiesene IT-Teilgruppe. Kosten je Anzeigenklick, nicht je Landingpage-Klick. Ein günstiger Klick belegt keine höhere Kontaktqualität.'};
}
export function googleAdsBenchmark(type:string,metric:string):Benchmark|undefined {
 if(type!=='SEARCH'||metric!=='ctr')return;
 return {value:'6.10 %',context:'US-Median · Business Services',source:'https://www.wordstream.com/blog/2026-google-ads-benchmarks',sourceName:'WordStream · 2026',explanation:'Grobe Orientierung: US-Suchkampagnen (Google und Microsoft), April 2025–März 2026. Gesamtstichprobe 13’474 Kampagnen. Kein Schweizer IT-Benchmark. Marken- und allgemeine Suchbegriffe sind nicht getrennt; deren Mischung kann die CTR stark verändern. Kein Massstab für Display oder Performance Max.'};
}
export const organicBenchmark:Benchmark={value:'5.20 %',context:'Ø Plattform · grobe Orientierung',source:'https://www.socialinsider.io/social-media-benchmarks/linkedin',sourceName:'Socialinsider · Bericht 2026',explanation:'Veröffentlichter Durchschnitt, kein Branchenmedian. Methodik: 1,3 Mio. Posts von 16’645 Unternehmensseiten, 2024–2025; die Seite enthält zusätzlich Quartalsupdates 2026. Formate, Seitengrössen und Aggregation unterscheiden sich. Socialinsider bietet Raten mit und ohne Klicks; die Benchmark-Zuordnung ist nicht eindeutig. Sonio zählt Klicks mit. Deshalb keine direkte Über-/Unterbewertung und kein Zielwert.'};
export function ownPostMedian(posts:{kind:string;metrics:Record<string,number|undefined>}[],kind:string):{value:number;count:number}|undefined {
 const rates=posts.filter(p=>p.kind===kind).flatMap(p=>{
  const m=p.metrics, keys=['impressions','clicks','likes','comments','shares'];
  if(!keys.every(k=>typeof m[k]==='number'&&Number.isFinite(m[k])&&m[k]!>=0)||!m.impressions)return [];
  return [(m.clicks!+m.likes!+m.comments!+m.shares!)/m.impressions*100];
 }).sort((a,b)=>a-b);
 if(rates.length<3)return;
 const mid=Math.floor(rates.length/2);
 return {value:rates.length%2?rates[mid]:(rates[mid-1]+rates[mid])/2,count:rates.length};
}
