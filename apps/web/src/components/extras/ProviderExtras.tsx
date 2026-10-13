import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRegisterHub, type RegisterHub } from '../../api/registerApi';
import { STATE_INFO } from '../../data/locationInfo';
import { KIND_BY_TYPE, registerPath, stateByCode } from '../../lib/registerMeta';
import ArticleCards from '../blog/ArticleCards';
import './PageExtras.css';

/**
 * The reading part of /providers, below the plans: how the public register looks state by state, what a strong
 * listing contains, the registration paths, the safeguards providers are expected to have, and the guides written for
 * providers. It adds no promise of enquiries: counts are public-register listings, and every rule links to the
 * NDIS Commission or to a guide that cites it.
 */

const LISTING_CHECKS: { title: string; body: string }[] = [
  { title: 'Supports you actually deliver', body: 'Name each support in the words a participant would use, and leave out anything you do not currently provide.' },
  { title: 'The suburbs you cover', body: 'List the areas you really work in. Matching compares enquiries with your service areas, so accuracy saves your team time.' },
  { title: 'How funding can be arranged', body: 'Say whether you work with self-managed, plan-managed and NDIA-managed participants, and for aged care, which programs.' },
  { title: 'Your registration status', body: 'State it plainly, with the support types you are registered for if you are registered. People check.' },
  { title: 'Capacity and availability', body: 'Keep your availability current. A short “not taking new people in this area at the moment” is better than silence.' },
  { title: 'A route to reach you', body: 'Use an intake address that is checked every day, and say how quickly you aim to reply.' },
];

const PATHS: { title: string; body: string; link: { to: string; label: string }; tint?: boolean }[] = [
  {
    title: 'Registered with the NDIS Commission',
    body: 'Audited against the Practice Standards and assessed as suitable. Required for some supports, and for serving NDIA-managed participants.',
    link: { to: '/blog/how-to-become-a-registered-ndis-provider-the-steps-and-what-to-prepare', label: 'The registration steps' },
    tint: true,
  },
  {
    title: 'Unregistered provider',
    body: 'Can deliver supports that do not require registration, to participants who self-manage or plan-manage. The Code of Conduct still applies.',
    link: { to: '/blog/registered-or-unregistered-which-path-suits-your-ndis-support-business', label: 'Which path suits you' },
  },
  {
    title: 'Under another provider’s registration',
    body: 'Supports delivered through a facilitation or brokerage arrangement, where the registered provider is responsible and claims payment.',
    link: { to: '/blog/registered-or-unregistered-which-path-suits-your-ndis-support-business', label: 'How these arrangements work' },
  },
];

const SAFEGUARDS: { title: string; body: string; link: { to: string; label: string } }[] = [
  {
    title: 'Practice Standards',
    body: 'The quality standards registered providers are audited against, organised into core, supplementary and verification modules.',
    link: { to: '/blog/ndis-practice-standards-in-plain-english-for-new-providers', label: 'The Standards in plain English' },
  },
  {
    title: 'Quality audits',
    body: 'Verification audits for lower-risk supports and certification audits, with an on-site stage, for higher-risk ones.',
    link: { to: '/blog/ndis-quality-audits-verification-or-certification-what-to-expect', label: 'What to expect' },
  },
  {
    title: 'Incidents',
    body: 'An incident management system, and reporting of reportable incidents to the Commission within the set timeframes.',
    link: { to: '/blog/reportable-incidents-and-incident-management-what-ndis-providers-need-to-know', label: 'Incident management' },
  },
  {
    title: 'Complaints',
    body: 'Safe, accessible ways to complain, answers and action, and procedural fairness for everyone involved.',
    link: { to: '/blog/handling-complaints-well-a-guide-for-ndis-providers', label: 'Handling complaints well' },
  },
  {
    title: 'Worker screening',
    body: 'Registered providers must have workers in risk-assessed roles screened; unregistered providers can choose to require it.',
    link: { to: '/blog/ndis-worker-screening-check-who-needs-one-and-how-it-works', label: 'How the check works' },
  },
  {
    title: 'Pricing',
    body: 'Maximum prices apply to NDIA-managed and plan-managed participants, and fair pricing applies under the Code of Conduct.',
    link: { to: '/blog/setting-your-rates-ndis-price-limits-and-fair-pricing-for-independent-workers', label: 'Price limits and fair pricing' },
  },
];

const GUIDE_SLUGS = [
  'how-to-become-a-registered-ndis-provider-the-steps-and-what-to-prepare',
  'registered-or-unregistered-which-path-suits-your-ndis-support-business',
  'ndis-quality-audits-verification-or-certification-what-to-expect',
  'ndis-practice-standards-in-plain-english-for-new-providers',
  'reportable-incidents-and-incident-management-what-ndis-providers-need-to-know',
  'handling-complaints-well-a-guide-for-ndis-providers',
  'writing-a-provider-profile-that-helps-people-choose-you',
  'responding-to-enquiries-a-practical-checklist-for-ndis-and-aged-care-providers',
];

const fmt = (n: number) => n.toLocaleString('en-AU');

export default function ProviderExtras() {
  const [hub, setHub] = useState<RegisterHub | null>(null);
  const [state, setState] = useState('');

  useEffect(() => {
    let alive = true;
    getRegisterHub('ndis').then((r) => { if (alive) setHub(r); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const rows = useMemo(
    () => STATE_INFO.map((info) => ({ code: info.code, name: stateByCode(info.code)?.name ?? info.code, slug: stateByCode(info.code)?.slug ?? '', count: hub?.states[info.code] ?? 0 }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count),
    [hub],
  );
  const suburbs = useMemo(() => (hub?.suburbs ?? []).filter((s) => !state || s.state === state).slice(0, 12), [hub, state]);

  return (
    <div className="xp">
      <div className="dx">
        {rows.length > 0 && (
          <section className="dx-section" aria-labelledby="xf-places">
            <span className="eyebrow"><span className="eyebrow-rule" />The public register by place</span>
            <h2 id="xf-places" className="dx-h2">See how your area looks on the public NDIS register</h2>
            <p className="dx-lede">
              Each figure is the number of organisations the public NDIS register lists in that state or territory. It shows where organisations are
              based. It is not a measure of demand, and it is not a count of enquiries.
            </p>
            <ul className="xp-states">
              {rows.map((r) => (
                <li key={r.code}>
                  <Link className="xp-state" to={`/ndis-providers/${r.slug}`}>
                    <strong>{r.name}</strong>
                    <span>{fmt(r.count)} organisations listed</span>
                  </Link>
                </li>
              ))}
            </ul>
            {suburbs.length > 0 && (
              <>
                <ul className="xp-chips" aria-label="Filter suburbs by state">
                  <li><button type="button" className="xp-chip" aria-pressed={state === ''} onClick={() => setState('')}>All states</button></li>
                  {rows.map((r) => (
                    <li key={r.code}><button type="button" className="xp-chip" aria-pressed={state === r.code} onClick={() => setState(r.code)}>{r.code}</button></li>
                  ))}
                </ul>
                <ul className="xp-links">
                  {suburbs.map((s) => (
                    <li key={`${s.state}-${s.slug}`}>
                      <Link to={registerPath(KIND_BY_TYPE.ndis, stateByCode(s.state)?.slug, s.slug)}>
                        <span>{s.suburb}, {s.state}</span><span className="xp-count">{fmt(s.count)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="dx-note">
              See every place: <Link to="/locations">browse all locations</Link>, or <Link to="/ndis-providers">the NDIS provider register</Link> and <Link to="/aged-care-providers">the My Aged Care register</Link>.
            </p>
          </section>
        )}

        <section className="dx-section" aria-labelledby="xf-listing">
          <span className="eyebrow"><span className="eyebrow-rule" />A strong listing</span>
          <h2 id="xf-listing" className="dx-h2">What people look for before they get in touch</h2>
          <p className="dx-lede">Participants and coordinators compare a few providers at a time. These are the points that make a profile easy to choose, or to rule out early.</p>
          <ul className="xp-cards">
            {LISTING_CHECKS.map((c) => (
              <li key={c.title} className="xp-card">
                <span className="xp-tick" aria-hidden="true">✓</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </li>
            ))}
          </ul>
          <p className="dx-note">
            More detail: <Link to="/blog/writing-a-provider-profile-that-helps-people-choose-you">writing a profile that helps people choose you</Link> and{' '}
            <Link to="/blog/responding-to-enquiries-a-practical-checklist-for-ndis-and-aged-care-providers">responding to enquiries</Link>.
          </p>
        </section>

        <section className="dx-section" aria-labelledby="xf-paths">
          <span className="eyebrow"><span className="eyebrow-rule" />Registration</span>
          <h2 id="xf-paths" className="dx-h2">Three ways providers work, and what each asks of you</h2>
          <p className="dx-lede">You can list on SolDirectory whichever path you are on. Which one suits you depends on the supports you deliver and how your participants manage their funding.</p>
          <ul className="xp-cards">
            {PATHS.map((p) => (
              <li key={p.title} className={`xp-card${p.tint ? ' xp-card-tint' : ''}`}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <Link to={p.link.to}>{p.link.label} →</Link>
              </li>
            ))}
          </ul>
          <p className="dx-note">
            The authority on all of this is the NDIS Commission: <a href="https://www.ndiscommission.gov.au/provider-registration/about-registration" rel="noopener">About registration</a>.
          </p>
        </section>

        <section className="dx-section" aria-labelledby="xf-safeguards">
          <span className="eyebrow"><span className="eyebrow-rule" />Quality and safeguards</span>
          <h2 id="xf-safeguards" className="dx-h2">The expectations that sit behind a good listing</h2>
          <p className="dx-lede">Listing is the start. These are the areas participants, coordinators and the Commission look at, each with a plain-English guide.</p>
          <ul className="xp-cards">
            {SAFEGUARDS.map((s) => (
              <li key={s.title} className="xp-card">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <Link to={s.link.to}>{s.link.label} →</Link>
              </li>
            ))}
          </ul>
        </section>

        <ArticleCards
          slugs={GUIDE_SLUGS}
          headingId="xf-guides"
          eyebrow="From the blog"
          heading="Guides for running a provider business"
          lede="Written from the NDIS Commission and NDIA pages providers rely on, and checked against them. General information, not legal or compliance advice."
        />

        <aside className="xp-aside" aria-labelledby="xf-workers">
          <div>
            <h2 id="xf-workers">Working as an individual rather than running a service?</h2>
            <p>Independent support workers have their own profile, guides and worker directory access for eligible organisations.</p>
          </div>
          <div className="xp-aside-links">
            <Link to="/independent-workers">Independent workers →</Link>
            <Link to="/find-a-provider">See the provider directory →</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
