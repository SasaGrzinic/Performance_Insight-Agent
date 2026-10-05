import {useState} from 'react';
import {LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from 'recharts';
import type {Dashboard} from '../types';
import {number,monthName} from '../api';
import {dailyReportChange} from '../reportDailyComparison';
const channels=[{id:'google_ads',label:'Google Ads',color:'#0075d9'},{id:'linkedin_organic',label:'LinkedIn Organic',color:'#9b5322'},{id:'linkedin',label:'LinkedIn Ads',color:'#287b67'}];
const metrics=[{id:'impressions',label:'Impressionen'},{id:'clicks',label:'Klicks'}];
export function MarketingChannelComparison({data,previous}:{data:Dashboard;previous?:Dashboard}){
 const [active,setActive]=useState(['google_ads','linkedin_organic']);
 const [fields,setFields]=useState(['impressions']);
 const lines=channels.filter(c=>active.includes(c.id)).flatMap(c=>metrics.filter(m=>fields.includes(m.id)).map(m=>({...c,metric:m.id,name:c.label+' · '+m.label,key:c.id+'__'+m.id})));
 const rows=data.series.map(p=>({day:p.day,date:p.date,...Object.fromEntries(lines.map(l=>[l.key,p[l.id+'.'+l.metric]??null]))}));
 const hasValue=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
 const missing=lines.filter(l=>!data.series.some(p=>hasValue(p[l.id+'.'+l.metric])));
 return <>
 <div className="mr-compare-controls"><fieldset><legend>Kanäle überlagern</legend>{channels.map(c=><label key={c.id}><input type="checkbox" checked={active.includes(c.id)} disabled={active.length===1&&active.includes(c.id)} onChange={()=>setActive(v=>v.includes(c.id)?v.filter(x=>x!==c.id):[...v,c.id])}/><span style={{borderBottomColor:c.color}}>{c.label}</span></label>)}</fieldset><fieldset><legend>Kennzahlen</legend>{metrics.map(m=><label key={m.id}><input type="checkbox" checked={fields.includes(m.id)} disabled={fields.length===1&&fields.includes(m.id)} onChange={()=>setFields(v=>v.includes(m.id)?v.filter(x=>x!==m.id):[...v,m.id])}/>{m.label}</label>)}</fieldset></div>
 <p className="mr-chart-note">Tageswerte · {monthName(data.month)} · durchgezogen: Impressionen · gestrichelt: Klicks. Gleiche Anzahl-Skala; Impressionen können Klicklinien optisch überlagern. LinkedIn-Klicks können innerhalb der Plattform bleiben und sind keine gesicherten Website-Besuche.</p>
 <div className="mr-chart-canvas">{missing.length<lines.length?<ResponsiveContainer width="100%" height="100%"><LineChart data={rows} margin={{left:0,right:20,top:18,bottom:8}} accessibilityLayer><CartesianGrid vertical={false} stroke="#dce5ee"/><XAxis dataKey="day" axisLine={false} tickLine={false}/><YAxis width={58} axisLine={false} tickLine={false}/><Tooltip content={({active:visible,payload})=>{
 const p=payload?.[0]?.payload as {day:number;date:string}|undefined;
 if(!visible||!p)return null;
 const current=data.series.find(x=>x.day===p.day),prior=previous?.series.find(x=>x.day===p.day);
 return <div className="mr-tooltip"><b>{p.day}. {monthName(data.month)}</b>{lines.map(l=>{const v=current?.[l.id+'.'+l.metric],old=prior?.[l.id+'.'+l.metric],stale=data.channels.find(c=>c.id===l.id)?.comparisons?.[l.metric]?.stale;const delta=dailyReportChange(v,old,!stale&&!(data.partial&&p.date===data.period_end));return <p key={l.key}><span>{l.name}: <b>{number(hasValue(v)?v:null)}</b></span><br/><span className={delta!==null&&delta>0?'up':delta!==null&&delta<0?'down':''}>{delta===null?'Vergleich offen':`${delta>0?'+':''}${number(delta)} %`}</span> · Vormonat: {number(hasValue(old)?old:null)}</p>})}<small>Vergleich mit gleichem Kalendertag</small></div>;
 }}/>{lines.map(l=><Line key={l.key} dataKey={l.key} name={l.name} type="linear" stroke={l.color} strokeDasharray={l.metric==='clicks'?'6 4':undefined} strokeWidth={2.5} dot={{r:3}} connectNulls={false}/>)}</LineChart></ResponsiveContainer>:<p>Für diese Auswahl liegen keine Tageswerte vor.</p>}</div>
 {!!missing.length&&<p className="mr-chart-note">Ohne Messwerte: {missing.map(l=>l.name).join(', ')}. Fehlende Daten werden nicht als null gezeichnet.</p>}
 </>;
}
