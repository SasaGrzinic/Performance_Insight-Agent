import '../editorial-quote.css';

type Props = { text: string; author: string; role: string; source: string; sourceLabel?: string };

export function EditorialQuote({text, author, role, source, sourceLabel}: Props) {
  return <figure className="editorial-quote">
    <blockquote lang="en" cite={source}><span aria-hidden="true">“</span>{text}<span aria-hidden="true">”</span></blockquote>
    <figcaption><span className="editorial-quote-attribution"><a href={source} target="_blank" rel="noreferrer">{author}</a>{" · "}{role}</span>{sourceLabel && <a className="editorial-quote-source" href={source} target="_blank" rel="noreferrer">{sourceLabel}</a>}</figcaption>
  </figure>;
}
