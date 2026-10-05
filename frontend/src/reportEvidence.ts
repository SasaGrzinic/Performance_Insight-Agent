import type {Dashboard} from './types';
import {number} from './api.ts';
export type ReportEdition='gl'|'sales'|'marketing';
export type ReportFact={label:string;value:string;note:string;change:string|null;direction:'up'|'down'|'flat';source:string};
export function reportFact(data:Dashboard,id:string,key:string):ReportFact {
 const c=data.channels.find(item=>item.id===id), events=c?.event_summary;
 const value=events?events.values[key]:c?.values[key];
 const comparison=c?.comparisons?.[key];
 const valid=typeof value==='number'&&Number.isFinite(value);
 let change:string|null=null, direction:ReportFact['direction']='flat';
 if(!events&&comparison?.status==='comparable'&&!comparison.stale&&comparison.value!=null&&comparison.previous!=null&&Number.isFinite(comparison.value)&&Number.isFinite(comparison.previous)&&comparison.previous>0){
  const delta=(comparison.value-comparison.previous)/comparison.previous*100;
  change=`${delta>0?'+':''}${number(delta)} % gegenüber dem vergleichbaren Vormonatszeitraum`;
  direction=delta>0?'up':delta<0?'down':'flat';
 }
 const labels:Record<string,string>={customers:'Kunden',employees:'Sonio',partners:'Partner / Hersteller',registrations:'Bestätigte Anmeldungen',responses:'Formularantworten',attendees:'Zoom-Teilnahme-Einträge'};
 const coverage=events?.coverage[key];
 const note=events?`${coverage?.known??0} von ${events.event_count} Events mit diesem Wert. ${key==='customers'&&events.customers_calculated_events?'Enthält rechnerisch ermittelte Kundenanteile. ':''}${events.notice}`:comparison?.stale?'Letzter verfügbarer Stand; Aktualisierung ausstehend.':!valid?'Für diesen Monat liegt kein belastbarer Wert vor.':comparison?.status!=='comparable'?'Monatswert; ein belastbarer Vormonatsvergleich steht noch nicht zur Verfügung.':'Monatswert. Veränderung bezieht sich auf gleich lange, verfügbare Zeiträume.';
 return {label:labels[key]||c?.fields[key]||key,value:valid?number(value,c?.units[key]||'count'):'—',note,change,direction,source:c?.name||id};
}
const chapters:Record<ReportEdition,[string,string][][]>={
 gl:[[['analytics','sessions'],['linkedin_organic','impressions'],['youtube','views']], [['analytics','engaged_sessions'],['linkedin_organic','clicks']], [['google_ads','spend'],['mailchimp','unique_clicks']]],
 sales:[[['analytics','engaged_sessions'],['linkedin_organic','clicks']], [['youtube','views'],['mailchimp','unique_clicks']], [['events','customers'],['events','registrations']], [['analytics','sessions']]],
 marketing:[[['linkedin_organic','clicks'],['youtube','watch_minutes'],['mailchimp','unique_clicks']], [['google_ads','spend'],['google_ads','clicks'],['linkedin','spend']], [['events','responses'],['events','employees'],['events','partners'],['events','customers']]],
};
export function reportChapterFacts(data:Dashboard,edition:ReportEdition,index:number){return chapters[edition][index].map(([id,key])=>reportFact(data,id,key))}
export const reportChapterFeedback:Record<ReportEdition,string[]>={
 gl:['Die Zahlen zeigen Nutzung und Sichtbarkeit in getrennten Kanälen. Sie belegen noch keinen Umsatzbeitrag; Reichweiten verschiedener Kanäle werden nicht addiert.','Engagierte Website-Besuche und LinkedIn-Klicks geben erste Hinweise auf Resonanz. Welche Themen dahinterstehen, muss anhand der Inhaltsdetails geprüft werden.','Nächster sinnvoller Schritt: Werbeausgaben und Reaktionen je Kampagne prüfen. Budgetänderungen brauchen zusätzlich Kampagnenziel und Ergebnisqualität.'],
 sales:['Diese Werte geben einen ersten Einblick in die Nutzung der Inhalte. Einzelne Unternehmen oder konkrete Kaufabsichten lassen sich daraus nicht erkennen.','Die Auswahl einzelner Artikel und Videos ist noch nicht mit dieser Report-Vorschau verknüpft. Dafür müssen Titel, Links und Inhaltskennzahlen aus den Kanalansichten zusammengeführt werden.','Kundenwerte können aus Gesamtantworten abzüglich Sonio und Partnern berechnet sein. Formularantworten sind nicht automatisch bestätigte Anmeldungen oder Teilnahmen; die Abdeckung steht beim Wert.','Als gemeinsamer nächster Schritt bietet sich eine Auswahl von drei Fachinhalten für Kundengespräche an. Welche Inhalte sich eignen, wird erst mit ihren Detailzahlen entschieden.'],
 marketing:['Die Quellen messen unterschiedliche Aktionen. Wiedergabezeit, Klicks und klickende Newsletter-Empfänger bleiben getrennt. Für eine inhaltliche Empfehlung sind zusätzlich die einzelnen Beiträge nötig.','Dies sind Monatswerte der Werbekonten. Für Budgetentscheidungen müssen die einzelnen Kampagnen nach Ziel betrachtet werden. Die kampagnenweise Detailansicht ist noch nicht im Report eingebunden.','Diese Werte zeigen den verfügbaren Bestand der Events im ausgewählten Eventmonat. Unvollständige Abdeckung wird ausdrücklich ausgewiesen; Personen werden nicht kanalübergreifend dedupliziert.'],
};
