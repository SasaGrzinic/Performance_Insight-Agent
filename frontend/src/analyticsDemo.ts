import {staticDemoResponse} from './staticDemo.ts';
import type {Dashboard} from './types';
/** Entirely synthetic public examples. Never import live cache or provider exports here. */
const image = (import.meta.env?.BASE_URL || '/')+'brand/sonio-blog-header.jpg';
const labels:Record<string,string>={campaign:'Kampagnen-Landingpage',profile:'Vorstellungsseite',competence:'Kompetenzfeld',blog:'Blogartikel',behind:'Blick hinter die Kulissen',news:'Newsartikel',stories:'Customer Story'};
const metric=(n:number)=>({screenPageViews:240*n,totalUsers:150*n,sessions:180*n,userEngagementDuration:6300*n,engagementPerUser:42});
const row=(name:string,key:string,value:number)=>({dimensions:[name],values:{[key]:value}});
export function demoAnalytics(area:string,period:string){
 const now=new Date().toISOString().slice(0,10);const year=period.slice(0,4);const month=period.length===7?period:year+'-01';
 const pages=period==='unknown'?[]:Array.from({length:period.length===4?6:2},(_,i)=>({path:`/demo/${area}/${i+1}`,url:'#',title:`Demo: ${labels[area]||'Inhalt'} ${i+1}`,image,published_at:`${period.length===4?year+'-'+String(i+1).padStart(2,'0'):month}-${i?'08':'03'}`,date_source:'Fiktives Veröffentlichungsdatum',language:i%2?'FR':'DE',current:metric(i+1),data_start:month+'-01',thresholded:false}));
 return {pages,end:now,updated_at:new Date().toISOString(),available_years:[now.slice(0,4),String(Number(now.slice(0,4))-1)],unknown_dates:0,catalog_count:12,hero:image};
}
export function demoAnalyticsTraffic(published?:string|null){
 return {sources:[row('Organic Search','sessions',95),row('Direct','sessions',48),row('Referral','sessions',25),row('Paid Search','sessions',12)],origins:[row('google / organic','sessions',95),row('(direct) / (none)','sessions',48),row('chatgpt.com / referral','sessions',8)],visitors:[row('new','totalUsers',110),row('returning','totalUsers',40)],events:[row('file_download','eventCount',18),row('video_start','eventCount',32)],ai:{providers:[{label:'ChatGPT',value:8}],sessions:8},thresholded:false,data_loss:false,start:published||new Date().toISOString().slice(0,7)+'-01',end:new Date().toISOString().slice(0,10),updated_at:new Date().toISOString()};
}
export function demoMonthlySources(month:string){
 const end=month+'-'+String(new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate());
 const total=(staticDemoResponse(`/demo/dashboard?month=${month}`) as Dashboard).channels.find(c=>c.id==='analytics')!.values.sessions;
 const sources=[{channel:'Organic Search',sessions:640},{channel:'Organic Social',sessions:160},{channel:'Paid Search',sessions:320},{channel:'Direct',sessions:400},{channel:'Email',sessions:80},{channel:'Referral',sessions:240},{channel:'Unassigned',sessions:160}];
 let remaining=total;
 sources.forEach((r,i)=>{r.sessions=i===sources.length-1?remaining:Math.round(total*r.sessions/2000);remaining-=r.sessions});
 return {sources,ai:{providers:[{label:'ChatGPT',value:24},{label:'Perplexity',value:12},{label:'Gemini',value:4}],sessions:40,evidence:[{source:'chatgpt.com',provider:'ChatGPT',sessions:24},{source:'perplexity.ai',provider:'Perplexity',sessions:12},{source:'gemini.google.com',provider:'Gemini',sessions:4}]},start:month+'-01',end,partial:false,thresholded:false,data_loss:false,updated_at:new Date().toISOString()};
}
