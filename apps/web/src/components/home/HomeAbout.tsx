import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { hubCopy } from '@soldirectory/topic-content';
import { setJsonLd } from '../../lib/seo';
import './HomeAbout.css';

/**
 * The lower part of the home page: what SolDirectory is, how it works, who it is for, where to read more and the
 * questions people ask. The words come from packages/topic-content/hubContent.js (the same copy the server writes into
 * the page's HTML); the layout uses the home page's own bands, headings and cards so it reads as part of the page.
 */
const AUDIENCE_TITLES: Record<string, { title: string; tag: string }> = {
  '/find-a-provider': { title: 'Participants, families and carers', tag: 'Find support' },
  '/support-coordinators': { title: 'Coordinators and plan managers', tag: 'Find who works where' },
  '/providers': { title: 'Providers', tag: 'Receive enquiries' },
  '/independent-workers': { title: 'Independent support workers', tag: 'Be found' },
};

export default function HomeAbout() {
  const copy = hubCopy('/');
  const [open, setOpen] = useState<number | null>(0);
  const faqs = copy?.faqs ?? [];

  useEffect(() => {
    if (!faqs.length) return undefined;
    setJsonLd('hub-faq-home', {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
    });
    return () => setJsonLd('hub-faq-home', null);
  }, [faqs]);

  if (!copy) return null;
  const find = (heading: string) => copy.sections.find((s) => s.heading === heading);
  const what = find('What SolDirectory is');
  const how = find('How it works');
  const who = find('Who it is for');
  const reading = find('Reading that helps you decide');

  return (
    <>
      {(what || how) && (
        <section className="ha-band" aria-labelledby="ha-what">
          <div className="ha-inner ha-split">
            <div data-reveal>
              <span className="eyebrow"><span className="eyebrow-rule" />About SolDirectory</span>
              <h2 id="ha-what" className="section-heading">{what?.heading ?? 'What SolDirectory is'}</h2>
              {what?.paragraphs?.[0] && <p className="section-copy ha-copy">{what.paragraphs[0]}</p>}
              {what?.paragraphs?.[1] && <p className="ha-note">{what.paragraphs[1]}</p>}
            </div>
            {how && (
              <div className="ha-how" data-reveal style={{ '--rv': 1 } as CSSProperties}>
                <h3>{how.heading}</h3>
                <ol>
                  {how.list?.map((step, i) => (
                    <li key={step.text}>
                      <span className="ha-step-num">{i + 1}</span>
                      <span>{step.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {who && (
        <section className="ha-band ha-band-tint" aria-labelledby="ha-who">
          <div className="ha-inner">
            <div data-reveal>
              <span className="eyebrow"><span className="eyebrow-rule" />Who it is for</span>
              <h2 id="ha-who" className="section-heading">Made for the people on both sides of a request</h2>
            </div>
            <div className="ha-cards">
              {who.list?.map((item, i) => {
                const meta = item.to ? AUDIENCE_TITLES[item.to] : undefined;
                return (
                  <article className="ha-card" key={item.text} data-reveal style={{ '--rv': i } as CSSProperties}>
                    <span className="ha-card-tag">{meta?.tag ?? 'SolDirectory'}</span>
                    <h3>{meta?.title ?? item.label}</h3>
                    <p>{item.text}</p>
                    {item.to && <Link to={item.to}>{item.label} →</Link>}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {(reading || faqs.length > 0) && (
        <section className="ha-band ha-band-accent" aria-labelledby="ha-read">
          <div className="ha-inner ha-split ha-split-faq">
            <div data-reveal>
              {reading && (
                <>
                  <span className="eyebrow"><span className="eyebrow-rule" />Reading</span>
                  <h2 id="ha-read" className="section-heading">{reading.heading}</h2>
                  {reading.paragraphs?.map((p) => <p key={p} className="section-copy ha-copy">{p}</p>)}
                  {reading.links && (
                    <div className="ha-pills">
                      {reading.links.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
                    </div>
                  )}
                </>
              )}
            </div>
            {faqs.length > 0 && (
              <div className="ha-faq" data-reveal style={{ '--rv': 1 } as CSSProperties}>
                <h3>Questions people ask</h3>
                {faqs.map((f, i) => (
                  <div className={`ha-faq-item${open === i ? ' is-open' : ''}`} key={f.question}>
                    <button type="button" aria-expanded={open === i} aria-controls={`ha-a${i}`} onClick={() => setOpen(open === i ? null : i)}>
                      <span>{f.question}</span>
                      <span className="ha-faq-icon" aria-hidden="true">{open === i ? '−' : '+'}</span>
                    </button>
                    {open === i && <p id={`ha-a${i}`}>{f.answer}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
