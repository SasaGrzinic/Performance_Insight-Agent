import { useId, useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';
export function PeriodInfo({children,label="Informationen zum Zeitraum"}:{children:ReactNode;label?:string}) {
 const id=useId(); const [open,setOpen]=useState(false);
 return <span className="period-info" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
  <button type="button" aria-label={label} aria-describedby={open?id:undefined} onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)} onClick={()=>setOpen(true)} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false)}}}><Info size={14}/></button>
  {open&&<span id={id} role="tooltip" className="period-info-tooltip">{children}</span>}
 </span>;
}
