import {useId, useState} from 'react';
import {Info} from 'lucide-react';
import '../metric-help.css';

/** Shared definitions for a list: one explanation selector instead of icons on every row. */
export function MetricHelp({label, entries}:{label:string; entries:{key:string;label:string;text:string}[]}) {
 const id=useId();
 const [selected,setSelected]=useState(entries[0]?.key||'');
 const entry=entries.find(e=>e.key===selected)||entries[0];
 if(!entry)return null;
 return <details className="metric-help"><summary><Info size={15} aria-hidden="true"/>{label}</summary><div className="metric-help-content"><label htmlFor={id}>Kennzahl auswählen</label><select id={id} value={entry.key} onChange={e=>setSelected(e.target.value)}>{entries.map(e=><option key={e.key} value={e.key}>{e.label}</option>)}</select><p aria-live="polite">{entry.text}</p></div></details>;
}
