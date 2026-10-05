import type {Dashboard,Recommendation} from './types';
export function metricRecommendations(d:Dashboard):Recommendation[]{
 return d.channels.flatMap(c=>{
 const key=c.primary,value=c.comparison_values ? c.comparison_values[key] : c.values[key],previous=c.previous[key];
 if(c.comparisons && c.comparisons[key]?.status !== "comparable")return [];
 if(value==null||!Number.isFinite(value))return [];
 const decline=previous>0&&Number.isFinite(previous)&&value<previous;
 const actions:Record<string,string>={
 linkedin_organic:'Die Beiträge mit den meisten Impressionen und Klicks öffnen. Thema, Format und Veröffentlichungszeit vergleichen und einen gezielten Folgetest planen.',
 youtube:'Videos nach Playlist und ähnlicher Länge auswählen. Aufrufe gemeinsam mit durchschnittlicher Betrachtungsdauer prüfen und den Einstieg eines Videos gezielt testen.',
 mailchimp:'Mailings derselben Kampagne vergleichen. Geklickte Links und Betreff prüfen und beim nächsten Versand genau eine Änderung testen.',
 google_analytics:'Die Zugriffsquellen und meistbesuchten Inhalte öffnen. Für einen stark besuchten Inhalt den nächsten sinnvollen Schritt für Besucher prüfen.',
 analytics:'Zugriffsquellen und meistbesuchte Inhalte prüfen. Einen häufig besuchten Inhalt auswählen und dessen weiterführende Links überprüfen.'};
 return [{channel:c.id,priority:decline?'high':'medium',title:decline?'Rückgang gezielt einordnen':'Erfolgreiche Inhalte genauer prüfen',observation:`${c.name}: ${value.toLocaleString('de-CH')} ${c.fields[key]||key} im ausgewählten Zeitraum.${previous>0&&Number.isFinite(previous)?` Vorperiode: ${previous.toLocaleString('de-CH')}.`:''}`,action:actions[c.id]||'Die Detailansicht öffnen und die verfügbaren Ergebnisse nach Inhalt oder Kampagne prüfen. Daraus einen einzelnen, überprüfbaren nächsten Schritt ableiten.',caveat:`Regelbasierter Handlungshinweis, keine KI-Analyse. Volumen belegt weder Qualität noch Ursache.${d.partial?' Der laufende Monat ist noch unvollständig.':''}`,evidence:[`${c.id}.${key}`]} as Recommendation];
 }).sort((a,b)=>(a.priority==='high'?0:1)-(b.priority==='high'?0:1));
}
