import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hubCopy } from '@soldirectory/topic-content';
import { setJsonLd } from '../../lib/seo';
import '../directory/DirectoryExtras.css';
import './PageExtras.css';

/**
 * The reading section at the foot of a hub page: what the page is, how to use it, and the questions people ask. The
 * words come from packages/topic-content/hubContent.js, the same copy the server writes into the page's HTML for search
 * engines, so what a visitor reads and what a crawler reads are the same.
 */
export default function HubReading({ path, eyebrow = 'About this page' }: { path: string; eyebrow?: string }) {
  const copy = hubCopy(path);
  const [open, setOpen] = useState<number | null>(0);
  const faqs = copy?.faqs ?? [];
  const id = `hub-faq-${path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}`;

  useEffect(() => {
    if (!faqs.length) return undefined;
    setJsonLd(id, {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
    });
    return () => setJsonLd(id, null);
  }, [id, faqs]);

  if (!copy) return null;

  return (
    <div className="xp">
      <div className="dx">
        {copy.sections.map((section, index) => (
          <section className="dx-section" key={section.heading} aria-labelledby={`${id}-s${index}`}>
            {index === 0 && <span className="eyebrow"><span className="eyebrow-rule" />{eyebrow}</span>}
            <h2 id={`${id}-s${index}`} className="dx-h2">{section.heading}</h2>
            {section.paragraphs?.map((p, i) => <p key={i} className={i === 0 ? 'dx-lede' : 'dx-note'}>{p}</p>)}

            {section.list && section.list.some((item) => item.title) && (
              <ul className="xp-cards">
                {section.list.map((item) => (
                  <li key={item.title ?? item.text} className="xp-card">
                    {item.title && <h3>{item.title}</h3>}
                    <p>{item.text}</p>
                    {item.to && <Link to={item.to}>{item.label ?? 'Read more'} →</Link>}
                  </li>
                ))}
              </ul>
            )}
            {section.list && !section.list.some((item) => item.title) && (
              <ul className="hr-list">
                {section.list.map((item) => (
                  <li key={item.text}>
                    <span className="xp-tick" aria-hidden="true">✓</span>
                    <span>
                      {item.text}
                      {item.to && <> <Link to={item.to}>{item.label ?? 'Read more'} →</Link></>}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {section.links && section.links.length > 0 && (
              <p className="hr-links">
                {section.links.map((l) => <Link key={l.to} to={l.to}>{l.label} →</Link>)}
              </p>
            )}
          </section>
        ))}

        {faqs.length > 0 && (
          <section className="dx-section" aria-labelledby={`${id}-faq`}>
            <span className="eyebrow"><span className="eyebrow-rule" />Questions people ask</span>
            <h2 id={`${id}-faq`} className="dx-h2">Frequently asked questions</h2>
            <div className="dx-faq">
              {faqs.map((f, i) => (
                <div key={f.question} className="dx-faq-item">
                  <h3>
                    <button type="button" aria-expanded={open === i} aria-controls={`${id}-a${i}`} onClick={() => setOpen(open === i ? null : i)}>
                      <span>{f.question}</span>
                      <span className="dx-faq-icon" aria-hidden="true">{open === i ? '−' : '+'}</span>
                    </button>
                  </h3>
                  {open === i && <p id={`${id}-a${i}`}>{f.answer}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
