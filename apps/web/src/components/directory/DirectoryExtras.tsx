import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DIRECTORY_FAQS, DIRECTORY_GUIDANCE, DIRECTORY_KINDS, DIRECTORY_STEPS, DIRECTORY_SUPPORTS, EDITORIAL_BLOG_POSTS } from '@soldirectory/topic-content';
import InlineLinks from '../ui/InlineLinks';
import AccordionRows from '../ui/AccordionRows';
import { slugify } from '../../data/slugHelpers';
import { STATES } from '../../lib/registerMeta';
import { setJsonLd } from '../../lib/seo';
import './DirectoryExtras.css';
import { blogThumb, fullImageFallback } from '../blog/blogThumb';

/**
 * The reading part of /find-a-provider, below the results: shortcuts by support, how to choose, what the two kinds of
 * listing are, the newest guides from the blog, FAQs and state links. It adds no claims of its own: every statement here
 * describes how this site works or points to an official source.
 */

const SUPPORTS = DIRECTORY_SUPPORTS as unknown as { name: string; label: string; photo: string }[];

const STEPS = DIRECTORY_STEPS as { title: string; body: string; link?: { to: string; label: string } }[];

const FEATURED_GUIDES = [
  'how-to-choose-an-ndis-provider-questions-to-ask',
  'registered-or-unregistered-ndis-provider-what-it-means',
  'ndis-service-agreement-what-to-check-before-you-sign',
];

const FAQS = DIRECTORY_FAQS.map((f) => ({ q: f.question, a: f.answer }));

export default function DirectoryExtras({ onChooseService }: { onChooseService: (service: string) => void }) {
  useEffect(() => {
    setJsonLd('find-a-provider-faq', {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
    return () => setJsonLd('find-a-provider-faq', null);
  }, []);

  const guides = FEATURED_GUIDES
    .map((slug) => EDITORIAL_BLOG_POSTS.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="dx">
      <section className="dx-section" aria-labelledby="dx-supports">
        <span className="eyebrow"><span className="eyebrow-rule" />Browse by support</span>
        <h2 id="dx-supports" className="dx-h2">Not sure where to start? Pick a support</h2>
        <p className="dx-lede">Choose a support to filter the results above. You can add a suburb afterwards.</p>
        <ul className="dx-tiles">
          {SUPPORTS.map((s) => (
            <li key={s.name}>
              <a className="dx-tile" href={`/services/${slugify(s.name)}`} onClick={(e) => { e.preventDefault(); onChooseService(s.name); }}>
                <span className="dx-tile-photo">
                  <img src={`/images/supports/${s.photo}.jpg`} alt="" width={720} height={450} loading="lazy" decoding="async" />
                </span>
                <span className="dx-tile-label">{s.label} <span aria-hidden="true">→</span></span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="dx-section" aria-labelledby="dx-how">
        <span className="eyebrow"><span className="eyebrow-rule" />A simple way to choose</span>
        <h2 id="dx-how" className="dx-h2">Four steps to a provider you can trust</h2>
        <ol className="dx-steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className="dx-step">
              <span className="dx-step-num" aria-hidden="true">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              {step.link && <Link to={step.link.to}>{step.link.label} →</Link>}
            </li>
          ))}
        </ol>
      </section>

      <section className="dx-section" aria-labelledby="dx-kinds">
        <span className="eyebrow"><span className="eyebrow-rule" />What you are looking at</span>
        <h2 id="dx-kinds" className="dx-h2">Two kinds of listing, explained</h2>
        <div className="dx-kinds">
          <article className="dx-kind dx-kind-member">
            <h3>{DIRECTORY_KINDS.member.title}</h3>
            <p>{DIRECTORY_KINDS.member.body}</p>
          </article>
          <article className="dx-kind">
            <h3>{DIRECTORY_KINDS.register.title}</h3>
            <p>{DIRECTORY_KINDS.register.body}</p>
          </article>
        </div>
        <p className="dx-note">{DIRECTORY_KINDS.note}</p>
      </section>

      <section className="dx-section" aria-labelledby="dx-reading">
        <span className="eyebrow"><span className="eyebrow-rule" />Using the directory</span>
        <h2 id="dx-reading" className="dx-h2">How to read the results</h2>
        <p className="dx-lede">{DIRECTORY_GUIDANCE.intro}</p>
        <div className="dx-read">
          {DIRECTORY_GUIDANCE.blocks.map((b) => (
            <article key={b.heading} className="dx-read-block">
              <h3>{b.heading}</h3>
              <p>{b.text}</p>
            </article>
          ))}
        </div>
        <div className="dx-read-questions">
          <h3>{DIRECTORY_GUIDANCE.questionsHeading}</h3>
          <ul>
            {DIRECTORY_GUIDANCE.questions.map((q) => <li key={q}>{q}</li>)}
          </ul>
        </div>
        <h3 className="dx-read-wider">{DIRECTORY_GUIDANCE.widerHeading}</h3>
        <p className="dx-note"><InlineLinks text={DIRECTORY_GUIDANCE.wider} /></p>
      </section>

      {guides.length > 0 && (
        <section className="dx-section" aria-labelledby="dx-guides">
          <div className="dx-head-row">
            <div>
              <span className="eyebrow"><span className="eyebrow-rule" />From the blog</span>
              <h2 id="dx-guides" className="dx-h2">Read before you choose</h2>
            </div>
            <Link className="dx-all" to="/blog">All articles →</Link>
          </div>
          <ul className="dx-guides">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link to={`/blog/${g.slug}`} className="dx-guide">
                  <span className="dx-guide-photo"><img src={blogThumb(g.coverImage)} onError={fullImageFallback(g.coverImage)} alt="" width={800} height={450} loading="lazy" decoding="async" /></span>
                  <span className="dx-guide-body">
                    <span className="dx-guide-cat">{g.category}</span>
                    <strong>{g.title}</strong>
                    <span>{g.summary}</span>
                    <span className="dx-guide-read">Read the guide →</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="dx-section" aria-labelledby="dx-faq">
        <span className="eyebrow"><span className="eyebrow-rule" />Questions people ask</span>
        <h2 id="dx-faq" className="dx-h2">Frequently asked questions</h2>
        <AccordionRows marker="question" label="Frequently asked questions" items={FAQS.map((f) => ({ title: f.q, body: f.a }))} />
      </section>

      <section className="dx-section" aria-labelledby="dx-states">
        <span className="eyebrow"><span className="eyebrow-rule" />Browse by place</span>
        <h2 id="dx-states" className="dx-h2">Search the public register by state</h2>
        <ul className="dx-states">
          {STATES.map((s) => (
            <li key={s.code}>
              <Link to={`/ndis-providers/${s.slug}`}><strong>{s.code}</strong><span>{s.name}</span></Link>
            </li>
          ))}
        </ul>
        <p className="dx-note">Prefer to start from a map of places? <Link to="/locations">Browse all locations</Link>, or read about <Link to="/ndis-providers">the NDIS provider register</Link> and <Link to="/aged-care-providers">the My Aged Care register</Link>.</p>
      </section>
    </div>
  );
}
