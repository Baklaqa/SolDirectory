import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GLOSSARY } from '@soldirectory/topic-content';
import { applySeoTags, setJsonLd } from '../../lib/seo';
import { PublicFooter, PublicHeader } from './PublicLayout';
import './ReferencePages.css';

/** Same rule as the build step that writes this page's static HTML, so anchors match. */
const termId = (term: string) => term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/**
 * NDIS and aged care glossary. The definitions come from packages/topic-content/glossary.js, the same copy the build
 * step writes into the page's static HTML, and each links to the guide that explains the term in full.
 */
export default function GlossaryPage() {
  const [query, setQuery] = useState('');

  const terms = useMemo(
    () => [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, 'en-AU')).map((t) => ({ ...t, id: termId(t.term) })),
    [],
  );

  useEffect(() => {
    applySeoTags({
      title: 'NDIS and aged care glossary: terms explained | SolDirectory',
      description: 'Plain-English definitions of NDIS and aged care terms, from plan management and SIL to Support at Home and the Code of Conduct, each linked to a guide.',
      canonicalUrl: `${window.location.origin}/glossary`,
    });
    setJsonLd('glossary', {
      '@type': 'DefinedTermSet',
      name: 'NDIS and aged care glossary',
      url: `${window.location.origin}/glossary`,
      hasDefinedTerm: terms.map((t) => ({
        '@type': 'DefinedTerm',
        name: t.term,
        description: t.definition,
        url: `${window.location.origin}/glossary#${t.id}`,
        inDefinedTermSet: `${window.location.origin}/glossary`,
      })),
    });
    window.scrollTo(0, 0);
    return () => setJsonLd('glossary', null);
  }, [terms]);

  const q = query.trim().toLowerCase();
  const visible = q ? terms.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)) : terms;
  const groups = useMemo(() => {
    const map = new Map<string, typeof visible>();
    for (const t of visible) {
      const letter = t.term[0].toUpperCase();
      map.set(letter, [...(map.get(letter) ?? []), t]);
    }
    return [...map.entries()];
  }, [visible]);
  const letters = useMemo(() => [...new Set(terms.map((t) => t.term[0].toUpperCase()))], [terms]);

  return (
    <>
      <PublicHeader />
      <main className="ref-page">
        <nav className="ref-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Glossary</span>
        </nav>
        <span className="eyebrow"><span className="eyebrow-rule" />Plain-English reference</span>
        <h1>NDIS and aged care glossary</h1>
        <p className="ref-lede">
          The terms you will hear from the NDIA, providers, plan managers and My Aged Care, explained in plain language. Each one links to the guide that
          covers it properly. Definitions are general information, not advice about a particular plan, so check the official page for anything that affects you.
        </p>

        <div className="ref-tools">
          <label className="visually-hidden" htmlFor="glossary-search">Search the glossary</label>
          <input
            id="glossary-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms, for example SIL or plan manager"
          />
          <span className="ref-count" aria-live="polite">{visible.length} {visible.length === 1 ? 'term' : 'terms'}</span>
        </div>

        <nav className="ref-letters" aria-label="Jump to a letter">
          {letters.map((letter) => (
            <a key={letter} href={`#letter-${letter}`} className={groups.some(([l]) => l === letter) ? '' : 'is-empty'}>{letter}</a>
          ))}
        </nav>

        {groups.length === 0 && <p className="ref-empty">No terms match “{query}”. Try a shorter word, or <Link to="/blog">browse our guides</Link>.</p>}

        {groups.map(([letter, items]) => (
          <section key={letter} className="ref-group" id={`letter-${letter}`} aria-label={`Terms starting with ${letter}`}>
            <h2>{letter}</h2>
            <dl>
              {items.map((t) => (
                <div key={t.id} id={t.id} className="ref-term">
                  <dt>{t.term}</dt>
                  <dd>
                    <p>{t.definition}</p>
                    <Link to={t.to}>{t.label} →</Link>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <p className="ref-note">
          Found something out of date or unclear? Our <Link to="/editorial-standards">editorial standards</Link> explain how we write and check each page,
          and how to tell us about a mistake.
        </p>
      </main>
      <PublicFooter />
    </>
  );
}
