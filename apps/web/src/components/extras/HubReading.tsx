import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hubCopy } from '@soldirectory/topic-content';
import { setJsonLd } from '../../lib/seo';
import AccordionRows from '../ui/AccordionRows';
import './HubReading.css';

/**
 * The reading section at the foot of a hub page: what the page is, how to use it, and the questions people ask. The
 * words come from packages/topic-content/hubContent.js, the same copy the server writes into the page's HTML for search
 * engines. It sits inside the page's own container (no padding of its own) and lays each topic out as a heading on the
 * left with its content on the right, titled points as rows that slide open, so it reads as part of the page.
 */
export default function HubReading({ path, eyebrow = 'About this page' }: { path: string; eyebrow?: string }) {
  const copy = hubCopy(path);
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
    <div className="hr">
      {copy.sections.map((section, index) => {
        const titled = section.list?.some((item) => item.title);
        return (
          <section className="hr-row" key={section.heading} aria-labelledby={`${id}-s${index}`}>
            <div className="hr-head">
              {index === 0 && <span className="eyebrow"><span className="eyebrow-rule" />{eyebrow}</span>}
              <h2 id={`${id}-s${index}`}>{section.heading}</h2>
            </div>
            <div className="hr-body">
              {section.paragraphs?.map((p) => <p key={p}>{p}</p>)}

              {section.list && titled && (
                <AccordionRows
                  label={section.heading}
                  items={section.list.map((item) => ({
                    title: item.title ?? item.label ?? item.text,
                    body: <>{item.text}{item.to && <> <Link to={item.to}>{item.label ?? 'Read more'} →</Link></>}</>,
                  }))}
                />
              )}
              {section.list && !titled && (
                <ul className="hr-ticks">
                  {section.list.map((item) => (
                    <li key={item.text}>
                      <span className="hr-tick" aria-hidden="true">✓</span>
                      <span>{item.text}{item.to && <> <Link to={item.to}>{item.label ?? 'Read more'} →</Link></>}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.links && section.links.length > 0 && (
                <div className="hr-pills">
                  {section.links.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {faqs.length > 0 && (
        <section className="hr-row" aria-labelledby={`${id}-faq`}>
          <div className="hr-head">
            <span className="eyebrow"><span className="eyebrow-rule" />Questions people ask</span>
            <h2 id={`${id}-faq`}>Frequently asked questions</h2>
          </div>
          <div className="hr-body">
            <AccordionRows marker="question" label="Frequently asked questions" items={faqs.map((f) => ({ title: f.question, body: f.answer }))} />
          </div>
        </section>
      )}
    </div>
  );
}
