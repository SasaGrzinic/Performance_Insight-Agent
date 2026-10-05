import {Info, X} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import type {Benchmark} from '../benchmarks';
import '../benchmark-note.css';
export function BenchmarkNote({benchmark}:{benchmark?:Benchmark}) {
 if(!benchmark)return null;
 return <Dialog.Root><Dialog.Trigger className="benchmark-note"><span>Referenz: <b>{benchmark.value}</b><span> · {benchmark.context}</span></span><Info size={13} aria-hidden="true"/></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="benchmark-overlay"/><Dialog.Content className="benchmark-explanation"><Dialog.Title>Referenz: {benchmark.value}</Dialog.Title><Dialog.Description>{benchmark.context}</Dialog.Description><p>{benchmark.explanation}</p><p>Orientierung, kein festgelegtes Ziel. Recherche: 5.10.2026.</p>{benchmark.source&&<a href={benchmark.source} target="_blank" rel="noopener noreferrer">Quelle: {benchmark.sourceName}</a>}<Dialog.Close className="benchmark-close" aria-label="Referenz schliessen"><X size={18}/></Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
