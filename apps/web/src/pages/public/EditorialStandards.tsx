import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EDITORIAL_BLOG_POSTS } from '@soldirectory/topic-content';
import { siteConfig } from '../../config/siteConfig';
import { applySeoTags, setJsonLd } from '../../lib/seo';
import { PublicFooter, PublicHeader } from './PublicLayout';
import './ReferencePages.css';

/**
 * How SolDirectory writes and checks its guides. Every statement describes a practice that is built into how the
 * articles in packages/topic-content are written and published (original writing, a cited official page, a checked date,
 * no stated figures for things that change, and a monitor that drafts but never publishes).
 */
const SOURCES: { name: string; use: string; href: string }[] = [
  { name: 'National Disability Insurance Agency (NDIS)', use: 'Plans, funding, pricing arrangements and participant guidance.', href: 'https://www.ndis.gov.au' },
  { name: 'NDIS Quality and Safeguards Commission', use: 'Provider registration, the Practice Standards, the Code of Conduct, worker screening, incidents and complaints.', href: 'https://www.ndiscommission.gov.au' },
  { name: 'My Aged Care', use: 'Assessments, Support at Home, costs, rights and choosing aged care.', href: 'https://www.myagedcare.gov.au' },
  { name: 'Fair Work Ombudsman', use: 'Independent contractors and employees.', href: 'https://www.fairwork.gov.au' },
  { name: 'Australian Business Register and the ATO', use: 'ABNs and business and tax basics for independent workers.', href: 'https://www.abr.gov.au' },
];

export default function EditorialStandards() {
  const articleCount = EDITORIAL_BLOG_POSTS.length;

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
        <p className="ref-lede">
          People use our guides to make decisions about support, money and safety, so they should be able to see where each statement comes from and when it was
          last checked. This page explains how the {articleCount} articles on our <Link to="/blog">blog</Link> and the guides on this site are written.
        </p>

        <section className="ref-section">
          <h2>What SolDirectory is, and is not</h2>
          <p>
            SolDirectory is an independent directory and enquiry service. It is not the NDIA, the NDIS Quality and Safeguards Commission, My Aged Care or any
            other government body, and nothing here is an official decision about your plan or eligibility. The information is general, so confirm what
            applies to you with your plan manager, support coordinator, the responsible agency or a professional.
          </p>
        </section>

        <section className="ref-section">
          <h2>How an article is written</h2>
          <ul>
            <li><strong>Original writing.</strong> We do not copy text, images or logos from other sites. Official content is restated in our own words and the source is cited. The NDIA licenses its website content for non-commercial use, which is one reason we write our own explanations and link to the original.</li>
            <li><strong>One official source at the centre.</strong> Each article names the official page it is based on and lists any further pages it draws on, so you can read the original yourself.</li>
            <li><strong>The pages were opened.</strong> Sources are read when an article is written or updated, and the date they were last checked is shown on the article.</li>
            <li><strong>Things that change are not stated as figures.</strong> Prices, thresholds and deadlines change, so where we can we describe how something works and send you to the official page for the current number. Time-sensitive notices carry an expiry and are marked once they have passed.</li>
            <li><strong>Plain statements of limits.</strong> Articles say what to confirm for your own plan, and do not tell you what you are entitled to.</li>
            <li><strong>A summary you can trust.</strong> The “In short” points at the top of an article restate what the article says. They add nothing that is not in the text below.</li>
          </ul>
        </section>

        <section className="ref-section">
          <h2>Where the information comes from</h2>
          <ul className="ref-sources">
            {SOURCES.map((s) => (
              <li key={s.name}>
                <a href={s.href} rel="noopener">{s.name}</a>
                <span>{s.use}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ref-section">
          <h2>Monitoring official announcements</h2>
          <p>
            An automated monitor reads the NDIS and My Aged Care news pages, politely and within each site’s published rules, and notes when something new
            appears. It records only facts such as a title, date and category, and it prepares a private brief for an editor. It never publishes anything: a person
            writes each article, and nothing is released without being read.
          </p>
        </section>

        <section className="ref-section">
          <h2>Keeping articles current</h2>
          <p>
            Guidance changes. Articles show when their source was last checked, and we review them against the official pages when we are told something has
            moved. If a notice is only relevant for a short time, it expires instead of staying up as if it were current.
          </p>
        </section>

        <section className="ref-section">
          <h2>Photographs</h2>
          <p>
            Article and page photographs come from a licensed photo library and are credited on our <Link to="/photo-credits">photo credits</Link> page. They
            illustrate a topic; they are not pictures of the people or organisations an article mentions.
          </p>
        </section>

        <section className="ref-section">
          <h2>Independence from the directory</h2>
          <p>
            Guides explain how things work and how to compare options. They are not recommendations of a particular provider, and a listing in the directory is not an
            endorsement. Register listings are shown as the public registers publish them.
          </p>
        </section>

        <section className="ref-section">
          <h2>Reporting a mistake</h2>
          <p>
            If you think something is wrong, unclear or out of date, tell us which page and what you saw
            {siteConfig.contactEmail ? <>, at <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a></> : ' using the contact details in the footer'}.
            We will compare it with the official source and correct the page if it needs it.
          </p>
        </section>

        <p className="ref-note">See also: <Link to="/glossary">the NDIS and aged care glossary</Link>, <Link to="/guides">our guides</Link> and <Link to="/blog">the blog</Link>.</p>
      </main>
      <PublicFooter />
    </>
  );
}
