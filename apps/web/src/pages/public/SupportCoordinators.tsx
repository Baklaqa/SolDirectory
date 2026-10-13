import { hubHeaderStyle } from '../../data/bannerImages';
import { useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { COORDINATOR_PAGE as P } from '@soldirectory/topic-content';
import { PublicFooter, PublicHeader } from './PublicLayout';
import { Breadcrumbs } from './register/RegisterParts';
import { applySeoTags, setJsonLd } from '../../lib/seo';
import { useMatchModal } from '../../context/MatchModalContext';
import { siteConfig } from '../../config/siteConfig';
import InlineLinks from '../../components/ui/InlineLinks';
import AccordionRows from '../../components/ui/AccordionRows';
import RelatedArticles from '../../components/blog/RelatedArticles';
import './Home.css';
import './Directory.css';
import './register/register.css';
import '../../components/ui/Button.css';
import '../../components/extras/HubReading.css';
import './SupportCoordinators.css';

/** One reading row: the heading on the left, its content on the right (the layout the other hub pages use). */
function Row({ id, heading, eyebrow, children }: { id?: string; heading: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section className="hr-row" id={id}>
      <div className="hr-head">
        {eyebrow && <span className="eyebrow"><span className="eyebrow-rule" />{eyebrow}</span>}
        <h2>{heading}</h2>
      </div>
      <div className="hr-body">{children}</div>
    </section>
  );
}

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

      <section className="directory-intro">
        <span className="directory-section-label">{P.intro.label}</span>
        <h2>{P.intro.heading}</h2>
        <p><InlineLinks text={P.intro.text} /></p>
        <div className="sc-actions">
          <Link className="sd-btn sd-btn-primary sd-btn-lg" to="/find-a-provider">Find providers</Link>
          <button type="button" className="sd-btn sd-btn-outline sd-btn-lg" onClick={() => openMatchModal()}>Submit an enquiry</button>
        </div>
      </section>

      <section className="sc-glance" aria-labelledby="sc-glance-heading">
        <div className="sc-glance-head">
          <h2 id="sc-glance-heading">{P.glanceHeading}</h2>
          <span className="sc-updated">Last updated <time dateTime={P.updated}>{P.updatedLabel}</time></span>
        </div>
        <ul className="sc-glance-list">
          {P.glance.map((point, i) => <li key={point}><span aria-hidden="true">{i + 1}</span><p>{point}</p></li>)}
        </ul>
      </section>

      <div className="hr">
        <Row id={P.referral.id} heading={P.referral.heading} eyebrow="Preparing the request">
          {P.referral.paragraphs.map((p) => <p key={p}><InlineLinks text={p} /></p>)}
          <ol className="sc-steps">{P.referral.steps.map((step) => <li key={step}><span><InlineLinks text={step} /></span></li>)}</ol>
        </Row>

        <Row id={P.urgent.id} heading={P.urgent.heading}>
          <div className="sc-callout">{P.urgent.paragraphs.map((p) => <p key={p}><InlineLinks text={p} /></p>)}</div>
        </Row>

        <Row id={P.checks.id} heading={P.checks.heading}>
          <p>{P.checks.intro}</p>
          <ul className="sc-checks">{P.checks.cards.map((card) => <li key={card.title}><h3>{card.title}</h3><p>{card.text}</p></li>)}</ul>
          <p><InlineLinks text={P.checks.note} /></p>
        </Row>

        <Row heading={P.pricing.heading}>
          {P.pricing.paragraphs.map((p) => <p key={p}><InlineLinks text={p} /></p>)}
        </Row>

        <Row heading={P.records.heading}>
          {P.records.paragraphs.map((p) => <p key={p}><InlineLinks text={p} /></p>)}
          <ul className="hr-ticks">
            {P.records.list.map((item) => <li key={item}><span className="hr-tick" aria-hidden="true">✓</span><span>{item}</span></li>)}
          </ul>
          <p><InlineLinks text={P.records.after} /></p>
        </Row>

        <Row heading={P.after.heading}>
          {P.after.paragraphs.map((p) => <p key={p}><InlineLinks text={p} /></p>)}
          <div className="sc-actions">
            <Link className="sd-btn sd-btn-outline" to="/saved-providers">Open saved providers</Link>
            <Link className="sd-btn sd-btn-outline" to="/signup">Create an account</Link>
          </div>
        </Row>

        <Row heading={P.resources.heading}>
          <p><InlineLinks text={P.resources.text} /></p>
        </Row>

        <Row heading={P.faqsHeading} eyebrow="Questions people ask">
          <AccordionRows marker="question" label={P.faqsHeading} items={P.faqs.map((f) => ({ title: f.question, body: f.answer }))} />
        </Row>

        <Row heading={P.officialHeading}>
          <p>These are the official sources behind the checks above. Each opens in a new tab.</p>
          <div className="hr-pills sc-external">
            {P.official.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
          </div>
        </Row>
      </div>

      <section id="contact" className="directory-content-cta">
        <div>
          <span className="directory-section-label">Referral practice</span>
          <h2>{P.contact.heading}</h2>
          <p>{P.contact.text}</p>
        </div>
        <div className="sc-actions">
          {siteConfig.contactEmail && <a className="sd-btn sd-btn-outline" href={`mailto:${siteConfig.contactEmail}`}>Email SolDirectory</a>}
          <button type="button" className="sd-btn sd-btn-primary" onClick={() => openMatchModal()}>Submit an enquiry</button>
        </div>
      </section>

      <RelatedArticles service="Support coordination" themes={['funding', 'plan']} />
    </main><PublicFooter />
  </>;
}
