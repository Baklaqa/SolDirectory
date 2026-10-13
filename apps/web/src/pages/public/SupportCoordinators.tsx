import { hubHeaderStyle } from '../../data/bannerImages';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { COORDINATOR_PAGE as P } from '@soldirectory/topic-content';
import { PublicFooter, PublicHeader } from './PublicLayout';
import { Breadcrumbs } from './register/RegisterParts';
import { applySeoTags, setJsonLd } from '../../lib/seo';
import { useMatchModal } from '../../context/MatchModalContext';
import { siteConfig } from '../../config/siteConfig';
import InlineLinks from '../../components/ui/InlineLinks';
import './Home.css';
import './Directory.css';
import './register/register.css';
import './ProfilePages.css';
import '../wordpress/WordPressCPTPage.css';
import '../../components/ui/Button.css';
import './SupportCoordinators.css';
import RelatedArticles from '../../components/blog/RelatedArticles';

// The words come from @soldirectory/topic-content (coordinatorContent.js); the server writes the same copy into the HTML
// that search engines receive (registerShell.controller.ts), so keep the markup here and the words there.
export default function SupportCoordinators() {
  const { hash } = useLocation();
  const { openMatchModal } = useMatchModal();

  useEffect(() => {
    const url = `${window.location.origin}/support-coordinators`;
    applySeoTags({ title: P.seoTitle, description: P.seoDescription, canonicalUrl: url });
    setJsonLd('coordinator-page', {
      '@type': 'WebPage',
      name: P.heading,
      description: P.seoDescription,
      url,
      inLanguage: 'en-AU',
      dateModified: P.updated,
      isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: window.location.origin },
      publisher: { '@type': 'Organization', name: 'SolDirectory', url: `${window.location.origin}/` },
    });
    setJsonLd('coordinator-faq', { '@type': 'FAQPage', mainEntity: P.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) });
    return () => { setJsonLd('coordinator-page', null); setJsonLd('coordinator-faq', null); };
  }, []);

  useEffect(() => {
    const id = hash.replace(/^#/, '');
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    else window.scrollTo(0, 0);
  }, [hash]);

  return <><PublicHeader />
    <div className="directory-page-header" style={hubHeaderStyle('support-coordination')}><div className="directory-page-header-inner"><span className="eyebrow eyebrow-light"><span className="eyebrow-rule" />Referral practice</span><h1 className="section-heading section-heading-light">{P.heading}</h1><p className="directory-page-subtitle">{P.subtitle}</p></div></div>
    <main className="reg-page category-hub-page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Support coordinators' }]} />
      <section className="directory-intro"><span className="directory-section-label">{P.intro.label}</span><h2>{P.intro.heading}</h2><p><InlineLinks text={P.intro.text} /></p><div className="dir-empty-actions"><Link className="btn-secondary" to="/find-a-provider">Find providers</Link><button type="button" className="btn-gradient" onClick={() => openMatchModal()}>Submit an enquiry</button></div></section>

      <aside className="coord-glance" aria-label={P.glanceHeading}><h2>{P.glanceHeading}</h2><ul>{P.glance.map((point) => <li key={point}>{point}</li>)}</ul><p className="coord-updated">Last updated <time dateTime={P.updated}>{P.updatedLabel}</time></p></aside>

      <section id={P.referral.id} className="wp-cpt-section"><h2>{P.referral.heading}</h2>{P.referral.paragraphs.map((p) => <p key={p}><InlineLinks text={p} /></p>)}<ol className="wp-cpt-plain-list">{P.referral.steps.map((step) => <li key={step}><InlineLinks text={step} /></li>)}</ol></section>

      <section id={P.urgent.id} className="wp-cpt-section"><h2>{P.urgent.heading}</h2>{P.urgent.paragraphs.map((p) => <p key={p}><InlineLinks text={p} /></p>)}</section>

      <section id={P.checks.id} className="wp-cpt-section"><h2>{P.checks.heading}</h2><p>{P.checks.intro}</p><div className="directory-guidance-grid">{P.checks.cards.map((card) => <article key={card.title}><h3>{card.title}</h3><p>{card.text}</p></article>)}</div><p><InlineLinks text={P.checks.note} /></p></section>

      <section className="wp-cpt-section"><h2>{P.pricing.heading}</h2>{P.pricing.paragraphs.map((p) => <p key={p}><InlineLinks text={p} /></p>)}</section>

      <section className="wp-cpt-section"><h2>{P.records.heading}</h2>{P.records.paragraphs.map((p) => <p key={p}><InlineLinks text={p} /></p>)}<ul className="wp-cpt-plain-list">{P.records.list.map((item) => <li key={item}>{item}</li>)}</ul><p><InlineLinks text={P.records.after} /></p></section>

      <section className="wp-cpt-section"><h2>{P.after.heading}</h2>{P.after.paragraphs.map((p) => <p key={p}><InlineLinks text={p} /></p>)}<div className="dir-empty-actions"><Link className="btn-secondary" to="/saved-providers">Open saved providers</Link><Link className="btn-secondary" to="/signup">Create an account</Link></div></section>

      <section className="wp-cpt-section"><h2>{P.resources.heading}</h2><p><InlineLinks text={P.resources.text} /></p></section>

      <section className="wp-cpt-section"><h2>{P.faqsHeading}</h2><div className="wp-cpt-faq-list">{P.faqs.map((faq) => <details className="wp-cpt-faq-item" key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section>
      <section className="wp-cpt-section"><h2>{P.officialHeading}</h2><ul className="wp-cpt-plain-list">{P.official.map((l) => <li key={l.href}><a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a></li>)}</ul></section>
      <section id="contact" className="wp-cpt-cta"><h2>{P.contact.heading}</h2><p>{P.contact.text}</p><div className="dir-empty-actions">{siteConfig.contactEmail && <a className="btn-secondary" href={`mailto:${siteConfig.contactEmail}`}>Email SolDirectory</a>}<button type="button" className="btn-gradient" onClick={() => openMatchModal()}>Submit an enquiry</button></div></section>
    <RelatedArticles service="Support coordination" themes={['funding', 'plan']} /></main><PublicFooter />
  </>;
}
