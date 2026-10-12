import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EDITORIAL_BLOG_POSTS } from '@soldirectory/topic-content';
import { STATES } from '../../lib/registerMeta';
import { setJsonLd } from '../../lib/seo';
import './DirectoryExtras.css';
import { blogThumb, fullImageFallback } from '../blog/blogThumb';

/**
 * The reading part of /find-a-provider, below the results: shortcuts by support, how to choose, what the two kinds of
 * listing are, the newest guides from the blog, FAQs and state links. It adds no claims of its own: every statement here
 * describes how this site works or points to an official source.
 */

const SUPPORTS: { name: string; label: string; photo: string }[] = [
  { name: 'Personal care', label: 'Personal care', photo: 'personal-care' },
  { name: 'Domestic assistance', label: 'Domestic assistance', photo: 'domestic-assistance' },
  { name: 'Transport', label: 'Transport', photo: 'transport' },
  { name: 'Therapy services', label: 'Therapy services', photo: 'therapy-services' },
  { name: 'Nursing', label: 'Nursing', photo: 'nursing' },
  { name: 'Support coordination', label: 'Support coordination', photo: 'support-coordination' },
  { name: 'Plan management', label: 'Plan management', photo: 'plan-management' },
  { name: 'Housing (SDA & SIL)', label: 'Housing, SDA & SIL', photo: 'housing-sda-sil' },
];

const STEPS: { title: string; body: string; link?: { to: string; label: string } }[] = [
  {
    title: 'Write down what you need',
    body: 'List the supports, the days and times, and the goals they should help with. A clear list makes every provider easier to compare.',
  },
  {
    title: 'Shortlist two or three',
    body: 'Search by support and suburb, open each profile and note who covers your area and the supports you want. Compare at least two before deciding.',
  },
  {
    title: 'Ask the same questions of each',
    body: 'Cost, who will come, what happens when a worker is away and how complaints are handled. Use a written list so the answers can be compared fairly.',
    link: { to: '/blog/how-to-choose-an-ndis-provider-questions-to-ask', label: '12 questions to ask a provider' },
  },
  {
    title: 'Put it in writing',
    body: 'Agree the supports, price, cancellation terms and how either side can end the arrangement in a service agreement before you start.',
    link: { to: '/blog/ndis-service-agreement-what-to-check-before-you-sign', label: 'What to check in a service agreement' },
  },
];

const FEATURED_GUIDES = [
  'how-to-choose-an-ndis-provider-questions-to-ask',
  'registered-or-unregistered-ndis-provider-what-it-means',
  'ndis-service-agreement-what-to-check-before-you-sign',
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is the difference between a SolDirectory member and a register listing?',
    a: 'Members are providers who have joined SolDirectory, keep their own profile and confirm their availability each week. They can receive enquiries through the site. Register listings are organisations that appear on the public NDIS or My Aged Care registers, shown here as those registers publish them. A register listing does not tell you whether an organisation has capacity or is taking new people.',
  },
  {
    q: 'Does being on a register mean a provider is right for me?',
    a: 'No. Registration is about regulation and oversight. It does not show whether a provider suits your needs, offers the support in your area, has a worker free on the days you need, or fits your plan. Compare providers on the things that matter to you and ask the questions in our guides.',
  },
  {
    q: 'How do I contact a provider?',
    a: 'Open a member profile to see the options on it, or use Get matched to send one request that suitable member providers can respond to. For register listings, contact the organisation directly using its own website or the details on the official register.',
  },
  {
    q: 'Can I use a provider that is not registered?',
    a: 'It depends on how your plan is managed and on the support you need. Some supports can only be delivered by registered providers, and the rules for plan-managed and self-managed participants have been changing, so confirm the current position for your own plan with your plan manager, support coordinator or the NDIA.',
  },
  {
    q: 'How do I check that a provider is registered?',
    a: 'The NDIS Quality and Safeguards Commission publishes a provider register you can search. Compare the name and the registered support types with what the provider tells you, and ask for their ABN if you are unsure.',
  },
  {
    q: 'How current is the register information on this page?',
    a: 'Register listings are imported from the public registers at a point in time and can lag behind the live register. Treat them as a starting point, and confirm details with the provider and the official register before you rely on them.',
  },
  {
    q: 'Is it free to search and send a request?',
    a: 'Searching and submitting a request is free for participants, families and coordinators. You are not obliged to use any provider that responds.',
  },
];

export default function DirectoryExtras({ onChooseService }: { onChooseService: (service: string) => void }) {
  const [open, setOpen] = useState<number | null>(0);

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
              <button type="button" className="dx-tile" onClick={() => onChooseService(s.name)}>
                <span className="dx-tile-photo">
                  <img src={`/images/supports/${s.photo}.jpg`} alt="" width={720} height={450} loading="lazy" decoding="async" />
                </span>
                <span className="dx-tile-label">{s.label} <span aria-hidden="true">→</span></span>
              </button>
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
            <h3>SolDirectory members</h3>
            <p>Providers who have joined, keep their own profile and confirm each week that they are taking referrals. You can view the profile and use Get matched to reach members who may be able to help.</p>
          </article>
          <article className="dx-kind">
            <h3>Public register listings</h3>
            <p>Organisations that appear on the public NDIS or My Aged Care registers, shown as those registers publish them. They are useful for finding out who operates near you, but they are not a statement about availability or quality.</p>
          </article>
        </div>
        <p className="dx-note">Neither kind is an endorsement. Check any provider against your own needs, and confirm registration with the NDIS Quality and Safeguards Commission.</p>
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
        <h2 id="dx-faq" className="dx-h2">Finding a provider: FAQs</h2>
        <div className="dx-faq">
          {FAQS.map((f, i) => (
            <div key={f.q} className="dx-faq-item">
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={`dx-faq-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className="dx-faq-icon" aria-hidden="true">{open === i ? '−' : '+'}</span>
                </button>
              </h3>
              {open === i && <p id={`dx-faq-${i}`}>{f.a}</p>}
            </div>
          ))}
        </div>
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
