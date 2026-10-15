import { Fragment, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LEGAL_PACK, legalDocBySlug, type ResolvedLegalBlock } from '@soldirectory/topic-content';
import { PublicHeader, PublicFooter } from './PublicLayout';
import { LEGAL_PAGE_ORDER } from './legalContent';
import { siteConfig } from '../../config/siteConfig';
import { applySeoTags, setJsonLd } from '../../lib/seo';
import './LegalPage.css';

const sectionId = (heading: string) => heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** "**Lead-in.** rest" → bold lead-in. The pack marks bold with double asterisks and nothing else. */
function Inline({ text }: { text: string }) {
  const parts = text.split('**');
  return <>{parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>))}</>;
}

function Block({ block }: { block: ResolvedLegalBlock }) {
  if (block.t === 'ul') {
    return <ul className="guide-list">{block.items.map((item) => <li key={item}><Inline text={item} /></li>)}</ul>;
  }
  if (block.t === 'table') {
    return (
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead><tr>{block.head.map((cell) => <th key={cell} scope="col"><Inline text={cell} /></th>)}</tr></thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.join('|')}>{row.map((cell, i) => (i === 0 ? <th key={i} scope="row"><Inline text={cell} /></th> : <td key={i}><Inline text={cell} /></td>))}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.t === 'note') return <p className="legal-note"><Inline text={block.text} /></p>;
  return <p><Inline text={block.text} /></p>;
}

/** One template for every legal and policy page — pass the doc's slug. */
export default function LegalPage({ slug }: { slug: string }) {
  const doc = legalDocBySlug(slug);
  const { hash } = useLocation();

  useEffect(() => {
    if (doc) {
      const canonicalUrl = `${window.location.origin}/${doc.slug}`;
      applySeoTags({
        title: `${doc.title} | SolDirectory`,
        description: `${doc.title} for SolDirectory, run by Sol Business Consultant Pty Ltd.`,
        canonicalUrl,
      });
      setJsonLd('legal-page', {
        '@type': 'WebPage',
        name: doc.title,
        url: canonicalUrl,
      });
    }
    // A link such as /terms#4-10-suspension-and-removal lands on its section; otherwise start at the top.
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
    return () => setJsonLd('legal-page', null);
  }, [doc, hash]);

  if (!doc) return null;

  return (
    <>
      <PublicHeader />
      <main className="legal-page">
        <nav className="legal-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>{doc.title}</span>
        </nav>

        <h1>{doc.title}</h1>
        {doc.updated && <p className="legal-summary">Last updated: {doc.updated}</p>}


        {doc.sections.map((s, i) => (
          <section key={`${s.heading}-${i}`} id={s.heading ? sectionId(s.heading) : undefined} className="legal-section">
            {s.heading && <h2>{s.heading}</h2>}
            {s.blocks.map((block, j) => <Block key={j} block={block} />)}
          </section>
        ))}

        <section className="legal-section">
          <h2>Contact</h2>
          <p>
            {siteConfig.legalEntity}
            {siteConfig.contactAddress ? `, ${siteConfig.contactAddress}` : ''}.
            {siteConfig.contactEmail && <> Email <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.</>}
            {siteConfig.contactPhone && <> Phone {siteConfig.contactPhone}{siteConfig.supportHours ? ` (${siteConfig.supportHours})` : ''}.</>}
          </p>
        </section>

        <nav className="legal-other" aria-label="Other legal pages">
          {LEGAL_PAGE_ORDER.filter((s) => s !== doc.slug).map((s) => {
            const other = LEGAL_PACK.find((entry) => entry.slug === s);
            return other ? <Link key={s} to={`/${s}`}>{other.title}</Link> : null;
          })}
        </nav>
      </main>
      <PublicFooter />
    </>
  );
}
