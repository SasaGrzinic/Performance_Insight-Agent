import type { Comparison } from '../types';
import {number} from '../api';
import { PeriodInfo } from './PeriodInfo';
const day = (value?: string | null) => value ? new Date(value+'T12:00:00').toLocaleDateString('de-CH') : 'unbekannt';
export function comparisonText(c?: Comparison) {
 if (!c) return 'Für diesen Datenstand ist keine geprüfte Vergleichsabdeckung hinterlegt.';
 return `${c.status === 'comparable' ? `Vergleich: ${day(c.current_start)}–${day(c.current_end)} / ${day(c.previous_start)}–${day(c.previous_end)}. Vergleichswerte: ${number(c.value)} gegenüber ${number(c.previous)}. ` : ''}${c.message} Letztes vorhandenes Messdatum: ${day(c.last_measurement)}. Letzter erfolgreicher Abruf: ${c.last_success ? new Date(c.last_success).toLocaleString('de-CH') : 'unbekannt'}. Fehlende Werte werden nicht als null gewertet; bestätigte Nullen bleiben 0.`;
}
export function ComparisonInfo({comparison:c}:{comparison?:Comparison}) {
 if(!c) return null;
 return <span className="comparison-data-info"><span>{c.status === 'comparable' ? `Vergleich jeweils bis ${Number(c.current_end?.slice(8))}.` : 'Vergleich ausgesetzt'}{c.last_measurement ? ` · Messstand ${day(c.last_measurement)}` : ''}{c.stale ? ' · Aktualisierung ausstehend' : ''}</span> <PeriodInfo label="Datenstand und Vergleich erklärt">{comparisonText(c)}</PeriodInfo></span>;
}
