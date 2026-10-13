import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicHeader, PublicFooter } from './PublicLayout';
import PageHero from '../../components/topic/PageHero';
import PhotoSlot from '../../components/PhotoSlot';
import Counter from '../../components/Counter';
import ProviderExtras from '../../components/extras/ProviderExtras';
import AccordionRows from '../../components/ui/AccordionRows';
import { getRegisterHub, type RegisterHub } from '../../api/registerApi';
import { useSiteStats } from '../../hooks/useSiteStats';
import { applySeoTags, setJsonLd } from '../../lib/seo';
import { PROVIDER_FAQS, PROVIDER_PAGE_DESCRIPTION, PROVIDER_PAGE_UPDATED, PROVIDER_PLANS, PROVIDER_REACH, PROVIDER_STEPS, PROVIDER_UNDERSTAND } from '@soldirectory/topic-content';
import './Home.css';
import './ForProviders.css';

// Mirrors the default rows seeded in apps/api/src/models/PlanConfig.ts —
// update both together if pricing or quotas change.
const STARTER_FEATURES = PROVIDER_PLANS.starter.features;
const GROWTH_FEATURES = PROVIDER_PLANS.growth.features;

const FAQS = PROVIDER_FAQS as { question: string; answer: string }[];

const HERO_CHECKS = [
  'Claiming and listing your profile is free',
  'Enquiries compared with your service areas and capacity',
  'No percentage taken from fees you agree',
];

const UNDERSTAND = PROVIDER_UNDERSTAND as { title: string; body: string }[];

const REACH = PROVIDER_REACH as { title: string; body: string }[];

const STEPS = PROVIDER_STEPS as { title: string; body: string }[];

const fmt = (n: number) => n.toLocaleString('en-AU');

export default function ForProviders() {
  const navigate = useNavigate();
  const stats = useSiteStats();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ndis, setNdis] = useState<RegisterHub | null>(null);
  const [aged, setAged] = useState<RegisterHub | null>(null);

  useEffect(() => {
    applySeoTags({
      title: 'List your provider business | SolDirectory',
      description: PROVIDER_PAGE_DESCRIPTION,
      canonicalUrl: `${window.location.origin}/providers`,
      ogImage: `${window.location.origin}/images/providers.jpg`,
    });
    setJsonLd('providers-page', {
      '@type': 'WebPage',
      name: 'List your provider business on SolDirectory',
      description: PROVIDER_PAGE_DESCRIPTION,
      url: `${window.location.origin}/providers`,
      inLanguage: 'en-AU',
      dateModified: PROVIDER_PAGE_UPDATED,
      isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: window.location.origin },
      publisher: { '@type': 'Organization', name: 'SolDirectory', url: `${window.location.origin}/` },
    });
    setJsonLd('providers-faq', {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
    });
    return () => { setJsonLd('providers-page', null); setJsonLd('providers-faq', null); };
  }, []);

  useEffect(() => {
    let alive = true;
    getRegisterHub('ndis').then((r) => { if (alive) setNdis(r); }).catch(() => {});
    getRegisterHub('aged_care').then((r) => { if (alive) setAged(r); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // Headline figures come from the public registers, so they describe the size of the field people search, and each
  // is hidden until it is known. Member profiles are only shown once there are enough for the number to mean something.
  const facts = useMemo(() => {
    const rows: { value: number; label: string }[] = [];
    if (ndis && ndis.total > 0) rows.push({ value: ndis.total, label: 'organisations on the public NDIS register' });
    if (aged && aged.total > 0) rows.push({ value: aged.total, label: 'organisations on the My Aged Care register' });
    const suburbs = new Set([...(ndis?.suburbs ?? []), ...(aged?.suburbs ?? [])].map((s) => `${s.state}|${s.slug}`)).size;
    if (suburbs > 0) rows.push({ value: suburbs, label: 'suburbs with register listings' });
    if (stats && stats.providersListed >= 25) rows.push({ value: stats.providersListed, label: 'provider profiles on SolDirectory' });
    return rows;
  }, [ndis, aged, stats]);

  return (
    <>
      <PublicHeader />
      <main>
        <PageHero
          crumbs={[{ label: 'Home', to: '/' }, { label: 'For providers' }]}
          eyebrow="For providers"
          title="Receive relevant enquiries in your service area"
          description="People looking for NDIS and aged care support send a request. SolDirectory compares it with provider service areas, funding arrangements and confirmed capacity, and delivers relevant enquiries by email or SMS for your team to assess."
          image="/images/login-hero.jpg"
          imageAlt="A provider team at work in an office"
          panel={{
            title: 'List your business',
            checks: HERO_CHECKS,
            ctaLabel: 'List your business →',
            onCta: () => navigate('/signup?type=provider'),
            note: (
              <>
                Already listed? <Link to="/login">Log in</Link> · <Link to="/find-a-provider">For support coordinators</Link>
              </>
            ),
          }}
        />

        <div className="fp-wrap">
          {facts.length > 0 && (
            <section className="fp-facts" aria-label="The registers at a glance">
              <ul>
                {facts.map((f) => (
                  <li key={f.label}>
                    <strong><Counter value={f.value} /></strong>
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
              <p>Counts come from the public NDIS and My Aged Care registers as last imported. They show how many organisations people compare you with, not how many enquiries there are.</p>
            </section>
          )}

          <section className="fp-split" aria-labelledby="fp-understand-heading">
            <div className="fp-split-intro">
              <span className="eyebrow"><span className="eyebrow-rule" />Before you subscribe</span>
              <h2 id="fp-understand-heading" className="fp-h2">Understand provider enquiries</h2>
              <p>
                An enquiry is a request for information about support. It is not an exclusive referral, a confirmed client or a service booking.
                Review the process and plan inclusions before subscribing.
              </p>
            </div>
            <AccordionRows label="Things to understand about provider enquiries" items={UNDERSTAND.map((card) => ({ title: card.title, body: card.body }))} />
          </section>

          <section className="fp-reach" aria-labelledby="fp-reach-heading">
            <div className="fp-reach-photo">
              <PhotoSlot src="/images/providers.jpg" alt="A support worker helping a participant" variant="care" />
            </div>
            <div className="fp-reach-body">
              <span className="eyebrow"><span className="eyebrow-rule" />How enquiries reach you</span>
              <h2 id="fp-reach-heading" className="fp-h2">Choose how your team is notified</h2>
              <p className="fp-lede">Choose how your organisation receives notifications when an enquiry is relevant to your profile.</p>
              <AccordionRows marker="check" label="How enquiries reach you" items={REACH.map((item) => ({ title: item.title, body: item.body }))} />
            </div>
          </section>

          <section className="fp-how" id="how-it-works" aria-labelledby="fp-how-heading">
            <div className="fp-how-head">
              <span className="eyebrow"><span className="eyebrow-rule" />How it works</span>
              <h2 id="fp-how-heading" className="fp-h2">From claiming your profile to your first enquiry</h2>
              <p className="fp-lede">
                Complete your profile and tell us where you have capacity. Listing does not guarantee enquiries: matching depends on demand and
                how closely your profile fits what people are searching for.
              </p>
            </div>
            <ol className="fp-steps">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <span className="fp-step-num">{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
            <button className="btn-gradient btn-lg" type="button" onClick={() => navigate('/signup?type=provider')}>Claim your profile for free →</button>
          </section>

          <section className="fp-plans" aria-labelledby="fp-plans-heading">
            <div className="fp-plans-head">
              <span className="eyebrow"><span className="eyebrow-rule" />Plans</span>
              <h2 id="fp-plans-heading" className="fp-h2">Free listing, or Growth</h2>
              <p className="fp-lede">
                A Starter listing provides directory visibility and limited enquiry information. Growth adds contact access and a monthly lead allowance.
              </p>
            </div>
            <div className="fp-plan-grid">
              <article className="fp-plan">
                <span className="fp-plan-tier">Free</span>
                <h3>Starter</h3>
                <p className="fp-plan-price">$0<span>/month</span></p>
                <ul>{STARTER_FEATURES.map((f) => <li key={f}>{f}</li>)}</ul>
                <button className="btn-tint btn-lg" type="button" onClick={() => navigate('/signup?type=provider')}>Claim your profile</button>
              </article>
              <article className="fp-plan fp-plan-featured">
                <span className="fp-plan-tier">Growth</span>
                <h3>Growth</h3>
                <p className="fp-plan-price">$249<span>/month + GST</span></p>
                <ul>{GROWTH_FEATURES.map((f) => <li key={f}>{f}</li>)}</ul>
                <button className="btn-white btn-lg" type="button" onClick={() => navigate('/signup?type=provider')}>Start on Growth</button>
              </article>
            </div>
          </section>
        </div>

        <ProviderExtras />

        <div className="fp-wrap">
          <section className="fp-faq" aria-labelledby="fp-faq-heading">
            <div className="fp-faq-head">
              <span className="eyebrow"><span className="eyebrow-rule" />Questions</span>
              <h2 id="fp-faq-heading" className="fp-h2">Provider questions</h2>
              <p className="fp-lede">Not sure whether listing suits your business? Start with the basics here, or {' '}
                <Link to="/blog">read our guides for providers</Link>.</p>
            </div>
            <div className="fp-faq-list">
              {FAQS.map((item, index) => {
                const open = openFaq === index;
                return (
                  <div className={`fp-faq-item${open ? ' is-open' : ''}`} key={item.question}>
                    <h3>
                      <button type="button" aria-expanded={open} aria-controls={`fp-faq-${index}`} onClick={() => setOpenFaq(open ? null : index)}>
                        <span>{item.question}</span>
                        <span className="fp-faq-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
                      </button>
                    </h3>
                    {open && <p id={`fp-faq-${index}`}>{item.answer}</p>}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="fp-cta">
            <div>
              <h2>Create or claim your provider profile</h2>
              <p>Publish accurate service information and choose how your team receives relevant NDIS and aged care enquiries.</p>
            </div>
            <div className="fp-cta-actions">
              <button className="btn-white btn-lg" type="button" onClick={() => navigate('/signup?type=provider')}>List your business →</button>
              <button className="btn-outline-light btn-lg" type="button" onClick={() => navigate('/login')}>Log in</button>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
