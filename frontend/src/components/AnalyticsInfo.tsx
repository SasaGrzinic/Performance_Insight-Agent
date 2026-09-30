import {Info} from 'lucide-react';
import {useId,useState} from 'react';
import '../analytics-info.css';
const explanations:Record<string,string>={
 sessions:'Sitzungen sind Besuche auf der Website. Eine Person kann mehrfach kommen und damit mehrere Sitzungen auslösen. Beispiel: morgens und abends vorbeischauen kann als zwei Besuche zählen.',
 engaged_sessions:'Besuche mit erkennbarer Nutzung: länger als die in GA4 eingestellte Mindestdauer (standardmässig 10 Sekunden), mindestens zwei Seitenaufrufe oder eine als wichtig markierte Aktion. Das bedeutet noch keine Anfrage oder Kaufabsicht.',
 key_events:'Aktionen, die in Google Analytics als besonders wichtig markiert wurden. Was hier zählt, hängt von der Einrichtung ab. Die Zahl ist nicht automatisch die Anzahl der Anfragen oder Verkäufe.',
 screenPageViews:'Wie oft diese Seite aufgerufen wurde. Wiederholte Aufrufe zählen mit: dieselbe Person kann mehrere Seitenaufrufe auslösen.',
 totalUsers:'Von Google Analytics erkannte Besucher dieser Seite. Geräte, Cookies und Einwilligungen beeinflussen die Erkennung. Besucher verschiedener Seiten dürfen nicht einfach addiert werden.',
 engagementPerUser:'Durchschnittliche aktive Zeit pro erkanntem Besucher, in Sekunden. Gezählt wird die erfasste Zeit mit der Seite im Vordergrund. Das ist nicht einfach die Zeit zwischen Öffnen und Schliessen und kein Beweis, dass alles gelesen wurde.',
 Organisch:'Besuche über unbezahlte Suchergebnisse, soziale Medien, Shopping- oder Videoplattformen. Gemeint ist hier mehr als nur Google-Suche.',
 Bezahlt:'Besuche, die Google Analytics einer Werbequelle zuordnet. Ein Anzeigenklick führt nicht zwingend zu einem erfassten Website-Besuch.',
 Direkt:'Besuche ohne erkennbare Herkunft, etwa über eine eingegebene Adresse oder ein Lesezeichen. Auch fehlende Herkunftsinformationen können hier landen.',
 'E-Mail':'Besuche, die Google Analytics einem E-Mail-Link zuordnet. Die richtige Kennzeichnung der Links ist wichtig; nicht jeder Mailing-Klick wird automatisch erkannt.',
 'Verweisende Websites':'Besuche über Links auf anderen Websites. Diese Kategorie ist von Suchmaschinen und den separat erkannten Kanälen zu unterscheiden.',
 'Weitere / nicht zugeordnet':'Andere Quellen oder Besuche, die Google Analytics nicht eindeutig einer der angezeigten Gruppen zuordnen konnte.',
 'Zugriffskanäle':'Gruppen von Zugriffswegen, etwa Suchmaschinen, E-Mail oder Werbung. Die Werte zählen Sitzungen, nicht einzelne Menschen. Der Prozentwert zeigt den Anteil an allen hier gelieferten Sitzungen.',
 'Quelle / Medium':'Quelle bezeichnet den konkreten Ursprung, etwa google. Medium beschreibt den Zugriffsweg, etwa organic für unbezahlte Suche. Die Zahlen zeigen erfasste Besuche.',
 ai:'Erfasste Besuche mit eindeutig erkennbarer Herkunft aus einem KI-Dienst, etwa ChatGPT oder Perplexity. KI-Besuche ohne erkennbare Herkunft fehlen hier. Das misst keine Erwähnungen in KI-Antworten. Diese Besuche sind bereits in den anderen Quellen enthalten.',
 'Neue / wiederkehrende Besucher':'Neu bedeutet erstmals von GA4 erkannt; wiederkehrend bedeutet mit bereits erfasstem Besuch. Cookie-Löschung und Gerätewechsel beeinflussen die Zuordnung. Die Gruppen nicht zu einer eindeutigen Personenzahl addieren.',
 file_download:'Erfasste Klicks auf Download-Dateien, etwa PDFs. Ein Klick bestätigt weder den vollständigen Download noch das Lesen der Datei. Nur eingerichtetes und ausgelöstes Tracking liefert Werte.',
 video_start:'Erfasste Starts eines eingebundenen Videos auf der Website. Das sind keine YouTube-Kanalaufrufe und keine eindeutigen Zuschauer.',
 video_progress:'Erfasste Fortschrittsmarken beim Abspielen eines eingebundenen Videos. Ein einzelner Abspielvorgang kann mehrere Marken erreichen und daher mehrfach zählen.',
 video_complete:'Erfasste Wiedergaben bis zum Ende eines eingebundenen Videos. Wiederholungen können mehrfach zählen; erfasst werden nur unterstützte und eingerichtete Videoplayer.',
 eventCount:'Anzahl erfasster Aktionen, nicht Anzahl Personen. Eine Person kann dieselbe Aktion mehrfach auslösen. Fehlende Werte können auf fehlendes Tracking hinweisen.',
};
const interpretations:Record<string,string>={
 sessions:'Mehr Besuche bedeuten mehr Nutzung, aber nicht automatisch mehr relevante Kontakte. Gemeinsam mit engagierten Sitzungen und wichtigen Aktionen beurteilen.',
 engaged_sessions:'Zeigt, ob die gewonnenen Besuche auch zu aktiver Nutzung führen. Steigen nur die Sitzungen, lohnt sich ein Blick auf Zielgruppen und Zielseiten.',
 key_events:'Für Marketing nur mit bekanntem Ziel aussagekräftig: erst prüfen, welche Aktionen zählen, dann deren Entwicklung bewerten.',
 screenPageViews:'Zeigt die Nutzung eines Inhalts. Viele Aufrufe können auch durch wiederholte Besuche entstehen; Besucher und aktive Zeit ergänzend betrachten.',
 totalUsers:'Hilft, die erreichten Besucher eines Inhalts einzuschätzen. Eine steigende Zahl sagt allein noch nichts über die Qualität der Kontakte aus.',
 engagementPerUser:'Längere aktive Nutzung kann Interesse zeigen. Kurze Seiten können ihren Zweck trotzdem schnell erfüllen; ähnliche Inhalte vergleichen.',
 ai:'Zeigt messbaren Website-Traffic aus KI-Diensten. Ein kleiner oder fehlender Wert bedeutet nicht, dass Sonio dort nie empfohlen wird.',
 comparison:'Nur gleich lange Zeiträume vergleichen. Bei kleinen Ausgangswerten können wenige zusätzliche Besuche grosse Prozentänderungen auslösen.',
};
explanations.comparison='Die Tendenz zeigt die prozentuale Veränderung gegenüber dem angegebenen Vergleichszeitraum: (aktueller Wert − Vorperiode) ÷ Vorperiode × 100. Ohne geeigneten Vorwert ist keine Prozentänderung berechenbar.';
export function AnalyticsInfo({metric,label,monthly=false}:{metric:string;label?:string;monthly?:boolean}){
 const id=useId(),[open,setOpen]=useState(false);
 const text=explanations[metric]||explanations.sessions;
 return <span className="analytics-info" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}><button type="button" aria-label={`Erklärung: ${label||metric}`} aria-expanded={open} aria-controls={open?id:undefined} aria-describedby={open?id:undefined} onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)} onClick={()=>setOpen(true)} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false)}}}><Info size={15}/></button>{open&&<span className="analytics-info-box" id={id} role="tooltip"><strong>{label||metric}</strong>{text}{interpretations[metric]&&<span><b>So einordnen:</b> {interpretations[metric]}</span>}<span>{monthly?'Zeitraum: ausgewählter Berichtsmonat, im laufenden Monat bis zum Datenstand.':'Zeitraum: verfügbare Gesamtwerte dieser Seite seit Veröffentlichung bis zum Datenstand.'} «—» bedeutet fehlende Daten, nicht null.</span></span>}</span>;
}
