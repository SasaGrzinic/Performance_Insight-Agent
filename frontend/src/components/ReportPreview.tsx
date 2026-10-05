import {useState} from 'react';
import {BriefcaseBusiness, TrendingUp, Megaphone} from 'lucide-react';
import type {Dashboard} from '../types';
import {monthName} from '../api';
import {asset} from '../staticDemo';
import {PeriodInfo} from './PeriodInfo';
import {MarketingReport} from './MarketingReport';
import './report-preview.css';
import {SalesReport} from './SalesReport';
import {ExecutiveReport} from './ExecutiveReport';

const editions={
 gl:{name:'GL',title:'Das Wesentliche. Klar auf den Punkt.',description:'Ergebnisse, Entwicklung und die nächsten Entscheidungen.',icon:BriefcaseBusiness,sections:[['Ergebnisse & Fortschritte','Welche Entwicklungen sind für Sonio relevant? Ausgewählte Ergebnisse werden mit ihrem Zeitbezug eingeordnet.'],['Chancen & Handlungsbedarf','Maximal drei Prioritäten – gewichtet nach Bedeutung und belastbaren Beobachtungen.'],['Nächste Schritte','Was Marketing angeht und wo eine Entscheidung der Geschäftsleitung benötigt wird.']]},
 sales:{name:'Sales',title:'Interesse erkennen. Gespräche vorbereiten.',description:'Gefragte Themen, hilfreiche Inhalte und Kontaktanlässe.',icon:TrendingUp,sections:[['Was interessiert den Markt?','Resonanz auf Kompetenzfelder, Services und Fachthemen aus Website, Suche und Kampagnen.'],['Inhalte für Kundengespräche','Drei bis fünf Fachartikel, Customer Stories oder Videos mit Link und passendem Gesprächsanlass.'],['Kontaktanlässe im Blick','Erfasste Formular-Leads und Kundenanmeldungen bei Events. Anmeldung und Teilnahme bleiben getrennt.'],['Gemeinsam weiterdenken','Bis zu drei Impulse für Marketing und Sales. Crossmediale Kampagnen ergänzen wir später.']]},
 marketing:{name:'Marketing',title:'Aus Erkenntnissen werden nächste Schritte.',description:'Performance verstehen, Chancen nutzen, gezielt testen.',icon:Megaphone,sections:[['Kanäle & Inhalte','Beiträge, Videos, Mailings und Website-Themen mit Monatsvergleich und passenden Referenzwerten.'],['Werbeausgaben & Ergebnisse','Kampagnen entsprechend ihrem Ziel betrachten: Aufmerksamkeit, Klicks oder erfasste Zielaktionen.'],['Events & Webinare','Anmeldungen, Sonio / Partner / Kunden und verfügbare Teilnahmezahlen im Überblick.']]},
};
type Edition=keyof typeof editions;
export function ReportsHero(){return <><div className="marketing-mast"><h1>Monatsrückblick.</h1></div><section className="marketing-hero"><img src={asset('brand/sonio-blog-header.jpg')} alt="Sonio-Berglandschaft mit Fahrer und Zielflagge"/><div><h2>Ergebnisse sehen. Gemeinsam weiterkommen.</h2><p>Die passende Perspektive für die nächsten Entscheidungen.</p></div></section><p className="directory-intro">Was hat sich bewegt, wo entsteht Interesse und was nehmen wir uns als Nächstes vor? Drei Perspektiven machen aus den Marketingzahlen einen verständlichen Rückblick – für Geschäftsleitung, Sales und Marketing.</p></>}
export function ReportPreview({data}:{data:Dashboard}){
 const [edition,setEdition]=useState<Edition>('gl');
 const e=editions[edition];
 return <section className="report-studio" aria-label="Report-Vorschau">
 <div className="report-perspectives" role="group" aria-label="Report-Perspektive auswählen">{(Object.keys(editions) as Edition[]).map(key=>{const item=editions[key],Icon=item.icon;return <button key={key} type="button" aria-pressed={edition===key} onClick={()=>setEdition(key)}><Icon size={24}/><span><b>{item.name}-Report</b><small>{item.description}</small></span></button>})}</div>
 <div className="report-preview-heading"><div><h2>{e.title}</h2></div><span>{monthName(data.month)}<PeriodInfo label="Zeitraum der Report-Vorschau">{data.partial?'Zwischenstand: Der Monat ist noch nicht abgeschlossen.':'Ausgewählter Berichtsmonat.'} Kennzahlen zeigen den aktuell geladenen Dashboard-Stand, keinen gespeicherten Report. Vergleiche verwenden ausschliesslich gleich lange, verfügbare Zeiträume. Einzelne Quellen können verzögert liefern.</PeriodInfo></span></div>
 {edition==='sales'?<SalesReport data={data}/>:edition==='gl'?<ExecutiveReport data={data}/>:<MarketingReport data={data}/>}
 </section>
}
