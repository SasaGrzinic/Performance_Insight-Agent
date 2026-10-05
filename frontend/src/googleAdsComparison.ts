export type AdsDay = {id:string;date:string;currency:string;clicks:number;impressions:number;conversions:number;spend:number};
export type AdsComparisonData = {daily:AdsDay[]|null;start:string;end:string;previous_start:string;previous_end:string;warning?:string|null};
export type AdsComparison = {current:Record<string,number|null>;previous:Record<string,number|null>;start:string;end:string;previous_start:string;previous_end:string;reason:string};
export function adsComparison(data:AdsComparisonData|undefined, ids:string[],currency:string):AdsComparison {
 const empty:AdsComparison={current:{},previous:{},start:data?.start||'',end:'',previous_start:data?.previous_start||'',previous_end:'',reason:'Keine ausreichenden Vergleichsdaten.'};
 if(!data?.daily || !ids.length || data.end<data.start) return {...empty,reason:data?.warning||empty.reason};
 const selected=new Set(ids),rows=data.daily.filter(r=>selected.has(r.id));
 if(rows.some(r=>r.currency!==currency || ['clicks','impressions','conversions','spend'].some(k=>!Number.isFinite(r[k as keyof AdsDay]))))return {...empty,reason:'Währung oder Messwerte sind nicht vergleichbar.'};
 const now=rows.filter(r=>r.date>=data.start&&r.date<=data.end),prev=rows.filter(r=>r.date>=data.previous_start&&r.date<=data.previous_end);
 if(!now.length||!prev.length)return empty;
 const days=Math.min(Number(data.end.slice(8)),Number(data.previous_end.slice(8)),Math.max(...now.map(r=>Number(r.date.slice(8)))),Math.max(...prev.map(r=>Number(r.date.slice(8)))));
 const end=data.start.slice(0,8)+String(days).padStart(2,'0'),previous_end=data.previous_start.slice(0,8)+String(days).padStart(2,'0');
 const dates=(start:string)=>Array.from({length:days},(_,i)=>start.slice(0,8)+String(i+1).padStart(2,'0'));
 if(!dates(data.start).every(d=>now.some(r=>r.date===d)) || !dates(data.previous_start).every(d=>prev.some(r=>r.date===d)))return {...empty,reason:'Tagesabdeckung unklar. Fehlende Tageszeilen werden nicht als Null ergänzt.'};
 const sum=(items:AdsDay[],until:string)=>{const totals:Record<string,number|null>={};for(const k of ['clicks','conversions','spend'])totals[k]=items.filter(r=>r.date<=until).reduce((n,r)=>n+Number(r[k as keyof AdsDay]),0);totals.cpa=totals.conversions!>0?totals.spend!/totals.conversions!:null;return totals;};
 return {current:sum(now,end),previous:sum(prev,previous_end),start:data.start,end,previous_start:data.previous_start,previous_end,reason:''};
}
