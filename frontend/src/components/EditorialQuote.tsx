import '../editorial-quote.css';

type Props = { text: string; author: string; role: string; source: string; sourceLabel?: string; portrait?: string };

export function EditorialQuote({text, author, role, source, sourceLabel, portrait}: Props) {
  return <figure className={`editorial-quote${portrait ? " editorial-quote-with-portrait" : ""}`}>
    <div className="editorial-quote-copy">
    <blockquote lang="en" cite={source}><span aria-hidden="true">“</span>{text}<span aria-hidden="true">”</span></blockquote>
    <figcaption>{portrait && <img className="editorial-quote-portrait" src={portrait} alt={`Gezeichnetes Porträt von ${author}`} width={110} height={120}/>}<span className="editorial-quote-attribution"><a href={source} title={sourceLabel || "Zitatquelle öffnen"} target="_blank" rel="noreferrer">{author}</a>{" · "}{role}</span></figcaption>
    </div>
  </figure>;
}
