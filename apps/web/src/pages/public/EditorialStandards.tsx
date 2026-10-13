import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EDITORIAL_STANDARDS } from '@soldirectory/topic-content';
import { siteConfig } from '../../config/siteConfig';
import { applySeoTags, setJsonLd } from '../../lib/seo';
import { PublicFooter, PublicHeader } from './PublicLayout';
import './ReferencePages.css';

/**
 * How SolDirectory writes and checks its guides. The copy lives in packages/topic-content/editorialContent.js, shared
 * with the build step that writes this page's static HTML, so the page and what crawlers read are the same words.
 */
export default function EditorialStandards() {
  useEffect(() => {
    applySeoTags({
      title: 'Editorial standards: how we write and check our guides | SolDirectory',
      description: 'How SolDirectory writes, sources and checks its NDIS and aged care guides: original writing, official sources cited, dates shown, and how to report a mistake.',
      canonicalUrl: `${window.location.origin}/editorial-standards`,
    });
    setJsonLd('editorial-standards', {
      '@type': 'AboutPage',
      name: 'Editorial standards',
      url: `${window.location.origin}/editorial-standards`,
      about: { '@type': 'Organization', name: 'SolDirectory', url: window.location.origin },
    });
    window.scrollTo(0, 0);
    return () => setJsonLd('editorial-standards', null);
  }, []);

  return (
    <>
      <PublicHeader />
      <main className="ref-page ref-narrow">
        <nav className="ref-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Editorial standards</span>
        </nav>
        <span className="eyebrow"><span className="eyebrow-rule" />How we work</span>
        <h1>Editorial standards</h1>
        <p className="ref-lede">{EDITORIAL_STANDARDS.intro}</p>

        {EDITORIAL_STANDARDS.sections.map((section) => (
          <section className="ref-section" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((p) => <p key={p}>{p}</p>)}
            {section.list && (
              <ul>
                {section.list.map((item) => (
                  <li key={item.title}><strong>{item.title}.</strong> {item.text}</li>
                ))}
              </ul>
            )}
            {section.sources && (
              <ul className="ref-sources">
                {section.sources.map((s) => (
                  <li key={s.name}>
                    <a href={s.href} rel="noopener">{s.name}</a>
                    <span>{s.use}</span>
                  </li>
                ))}
              </ul>
            )}
            {section.links?.map((l) => <p key={l.to}><Link to={l.to}>{l.label} →</Link></p>)}
            {section.heading === 'Reporting a mistake' && siteConfig.contactEmail && (
              <p>Email us at <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.</p>
            )}
          </section>
        ))}

        <p className="ref-note">
          See also:{' '}
          {EDITORIAL_STANDARDS.see.map((l, i) => (
            <span key={l.to}>{i > 0 && ', '}<Link to={l.to}>{l.label}</Link></span>
          ))}.
        </p>
      </main>
      <PublicFooter />
    </>
  );
}
