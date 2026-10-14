import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EDITORIAL_STANDARDS } from '@soldirectory/topic-content';
import PageHero from '../../components/topic/PageHero';
import { siteConfig } from '../../config/siteConfig';
import { applySeoTags, setJsonLd } from '../../lib/seo';
import { PublicFooter, PublicHeader } from './PublicLayout';
import '../../components/extras/HubReading.css';
import './ReferencePages.css';

/**
 * How SolDirectory writes and checks its guides. The copy lives in packages/topic-content/editorialContent.js, shared
 * with the build step that writes this page's static HTML, so the page and what crawlers read are the same words.
 */
export default function EditorialStandards() {
  const navigate = useNavigate();

  useEffect(() => {
    applySeoTags({
      title: 'Editorial standards: how we check our guides | SolDirectory',
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
      <main>
        <PageHero
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Editorial standards' }]}
          eyebrow="How we work"
          title="Editorial standards"
          description={EDITORIAL_STANDARDS.intro}
          image="/images/banners/guides-3.jpg"
          imageAlt="A woman reading a notebook in a café"
          panel={{
            title: 'In short',
            checks: ['Original writing, official source cited', 'Date last checked shown on each article', 'Figures that change are not guessed', 'A person writes every article'],
            ctaLabel: 'Read the guides →',
            onCta: () => navigate('/guides'),
            note: <>See also the <Link to="/glossary">glossary</Link></>,
          }}
        />

        <div className="ref-wrap">
          {EDITORIAL_STANDARDS.sections.map((section, index) => {
            if (section.list) {
              return (
                <section className="ref-block" key={section.heading} aria-labelledby={`es-${index}`}>
                  <div className="ref-block-head">
                    <span className="eyebrow"><span className="eyebrow-rule" />Our practice</span>
                    <h2 id={`es-${index}`}>{section.heading}</h2>
                  </div>
                  <ol className="ref-principles">
                    {section.list.map((item, i) => (
                      <li key={item.title}>
                        <span className="ref-principle-num">{String(i + 1).padStart(2, '0')}</span>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            }
            if (section.sources) {
              return (
                <section className="ref-block" key={section.heading} aria-labelledby={`es-${index}`}>
                  <div className="ref-block-head">
                    <span className="eyebrow"><span className="eyebrow-rule" />Sources</span>
                    <h2 id={`es-${index}`}>{section.heading}</h2>
                  </div>
                  <ul className="ref-sources">
                    {section.sources.map((s) => (
                      <li key={s.name}>
                        <a href={s.href} rel="noopener noreferrer">{s.name}<span aria-hidden="true"> ↗</span></a>
                        <p>{s.use}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            }
            return (
              <section className="hr-row" key={section.heading} aria-labelledby={`es-${index}`}>
                <div className="hr-head"><h2 id={`es-${index}`}>{section.heading}</h2></div>
                <div className="hr-body">
                  {section.paragraphs?.map((p) => <p key={p}>{p}</p>)}
                  {section.links && (
                    <div className="hr-pills">
                      {section.links.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
                    </div>
                  )}
                  {section.heading === 'Reporting a mistake' && siteConfig.contactEmail && (
                    <div className="hr-pills"><a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a></div>
                  )}
                </div>
              </section>
            );
          })}

          <section className="ref-cta">
            <div>
              <h2>See the standards in practice</h2>
              <p>Every guide names its official source, shows when it was last checked and says what to confirm for your own plan.</p>
            </div>
            <div className="ref-cta-actions">
              {EDITORIAL_STANDARDS.see.slice(0, 2).map((l, i) => (
                <Link key={l.to} className={`${i === 0 ? 'btn-white' : 'btn-outline-light'} btn-lg`} to={l.to}>{l.label}</Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
