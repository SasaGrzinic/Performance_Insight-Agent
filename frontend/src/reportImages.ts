import images from './reportPageImages.json';
import {salesPortraits} from './salesPortraits';
/** Verified public Sonio page motifs supplement the live catalogue; never guess a URL. */
export function reportPageImage(path:string,live?:string|null):string|null{
 const normalized=path.replace(/\/$/,'')||'/';
 return salesPortraits.find(p=>p.path===normalized)?.image||live||(images as Record<string,string>)[normalized]||null;
}
