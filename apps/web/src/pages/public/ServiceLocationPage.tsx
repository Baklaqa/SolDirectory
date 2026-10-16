import { bannerFor } from '../../data/bannerImages';
import { isPriorityIndexSuburb, metaDescription, serviceLocalSnapshot } from '@soldirectory/topic-content';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { PublicHeader, PublicFooter } from './PublicLayout';
import { runAction } from '../../lib/runAction';
import { useAuth } from '../../context/AuthContext';
import { canViewProviderProfiles } from '../../lib/profileAccess';
import PageHero from '../../components/topic/PageHero';
import {
  COMPARE, POLICIES,
} from '../../data/servicePageFixtures';
import { unslugify, stateForSuburb, STATE_ABBR } from '../../data/slugHelpers';
import { SERVICES } from '../../data/providers';
import { slugify } from '../../data/slugHelpers';
import { MIN_INDEXABLE_SERVICE_LOCATION, REAL_SERVICES, stateBySlug, SUPPORT_CATEGORIES } from '../../lib/registerMeta';
import Counter from '../../components/Counter';
import { useMatchModal } from '../../context/MatchModalContext';
import { getServiceAreaPage, type ServiceAreaPage } from '../../api/wordpressApi';
import { getAreaSupports, getServiceSuburbs } from '../../api/registerApi';
import { listPublicProviders, type PublicProviderRow } from '../../api/providerResources';
import { applySeoTags, setJsonLd } from '../../lib/seo';
import RegisterNearby from './register/RegisterNearby';
import LocationWorkers from './register/LocationWorkers';
import { serviceEditorialFor } from '@soldirectory/service-content';
import './ServiceLocationPage.css';
import RelatedArticles from '../../components/blog/RelatedArticles';

// REAL DATA, TWO SOURCES, PER THE ARCHITECTURE DECIDED WITH THE USER:
//
// 1. Providers (this section, the hero provider count) come from the
//    real Provider database via listPublicProviders() — never WordPress,
//    never the old fixture data. This was previously the same 6 fake
//    providers shown on every single service×suburb combination,
//    which actively misrepresented real data. That's fixed here.
//
// 2. Editorial content (intro paragraph, compare cards, suburb facts,
//    language stats, FAQ, demand stats, glance table, service counts,
//    most-requested support) comes from the real service_area_page
//    WordPress CPT, keyed by slug `${service}-${suburb}`, WITH
//    PER-FIELD FALLBACK to the original illustrative fixture content
//    when no WordPress content has been authored yet for this exact
//    combination. Most combinations won't have real content authored
//    — that's expected, not a bug — so this page must keep working
//    gracefully either way, per-field, not all-or-nothing.
//
// 3. Genuinely generic, site-wide content (ranking methodology, how
//    to check credentials, regulator contact info, response time by
//    state, state coverage list) is NOT per-combination fake data —
//    it's real explanatory content that happens to be the same
//    everywhere. Left as-is; migrating this to a CMS isn't fixing
//    anything that's actually broken.

const CORE_SERVICES = SERVICES.filter((service) => service !== 'All services');
const seoTitle = (text: string) => `${text.length <= 50 ? text : `${text.slice(0, 49).replace(/\s+\S*$/, '')}…`} | SolDirectory`;

const SERVICE_GROUPS = [
  {
    title: 'Daily and community support',
    services: ['Personal care', 'Domestic assistance', 'Transport', 'Community access', 'Respite care', 'Support workers'],
  },
  {
    title: 'Planning and independence',
    services: ['Support coordination', 'Plan management', 'Life skills', 'Employment & education support'],
  },
  {
    title: 'Health, therapy and equipment',
    services: ['Therapy services', 'Nursing', 'Behaviour support', 'Assistive technology & equipment', 'Home modifications'],
  },
  {
    title: 'Housing and aged care',
    services: ['Housing (SDA & SIL)', 'Dementia care', 'Palliative care', 'Residential aged care'],
  },
] as const;

/** Cuts a title to `max` characters at a word boundary, with an ellipsis. */
const fitTitle = (text: string, max: number) => (text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`);

export default function ServiceLocationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canOpenProfiles = canViewProviderProfiles(user?.role);
  const { openMatchModal } = useMatchModal();
  const { serviceSlug = 'nursing', state: stateSlug, suburb: suburbSlug = 'bankstown' } = useParams<{ serviceSlug: string; state?: string; suburb: string }>();

  // The catalogue name ('housing-sda-and-sil' -> 'Housing (SDA & SIL)'), else the slug made readable.
  const serviceName = REAL_SERVICES.find((s) => slugify(s) === serviceSlug)
    ?? SERVICES.find((s) => s !== 'All services' && slugify(s) === serviceSlug)
    ?? unslugify(serviceSlug);
  const serviceLower = serviceName.toLowerCase();
  const serviceEditorial = serviceEditorialFor(serviceName);
  const suburbName = unslugify(suburbSlug);
  // The catalogue name for this service, so its articles can be found ('personal-care' -> 'Personal care').
  const catalogueService = SERVICES.find((s) => s !== 'All services' && slugify(s) === serviceSlug);
  // The real, register-backed route carries its own :state segment
  // (disambiguates same-named suburbs across states, same as
  // /ndis-providers/:state/:suburb) — the older two-segment illustrative
  // links (see AppRoutes.tsx) have no state, so they keep the previous
  // hardcoded-lookup guess rather than 404ing.
  const realState = stateSlug ? stateBySlug(stateSlug) : undefined;
  const stateName = realState?.name ?? stateForSuburb(suburbSlug);
  const stateAbbr = realState?.code ?? (STATE_ABBR[stateName] ?? stateName);
  // Real WordPress content for this exact combination, if an editor
  // has written it. null means "nothing authored yet" — every usage
  // below falls back to the original fixture content per-field, not
  // as an all-or-nothing switch.
  const [wp, setWp] = useState<ServiceAreaPage | null>(null);
  const [wpLoading, setWpLoading] = useState(true);

  // Real providers actually matching this service + suburb — this
  // replaces the fixture PROVIDERS array entirely, not just when WP
  // content exists. Real data, always, regardless of WordPress.
  const [providers, setProviders] = useState<PublicProviderRow[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersTotal, setProvidersTotal] = useState(0);
  // Register listings for this support in this suburb, both registers combined (null until known). Below
  // MIN_INDEXABLE_SERVICE_LOCATION the page stays reachable but is kept out of search results, the same rule the
  // server-rendered HTML applies (registerShell.controller.ts).
  const [registerTotal, setRegisterTotal] = useState<number | null>(null);
  // Every support listed in this suburb, and other suburbs with this support, from the register (real counts).
  const [areaSupports, setAreaSupports] = useState<{ category: string; count: number }[]>([]);
  const [otherSuburbs, setOtherSuburbs] = useState<{ slug: string; suburb: string; count: number }[]>([]);
  const [stateSuburbs, setStateSuburbs] = useState<{ slug: string; suburb: string; count: number }[]>([]);

  useEffect(() => { setRegisterTotal(null); }, [serviceSlug, stateSlug, suburbSlug]);

  useEffect(() => {
    setAreaSupports([]);
    setOtherSuburbs([]);
    setStateSuburbs([]);
    if (!realState) return;
    let alive = true;
    getAreaSupports(realState.code, suburbSlug)
      .then((r) => { if (alive) setAreaSupports(r.categories); })
      .catch(() => {});
    if ((REAL_SERVICES as readonly string[]).includes(serviceName)) {
      getServiceSuburbs(serviceName, undefined, realState.code)
        .then((r) => { if (alive) { setStateSuburbs(r.suburbs); setOtherSuburbs(r.suburbs.filter((s) => s.slug !== suburbSlug).slice(0, 40)); } })
        .catch(() => {});
    }
    return () => { alive = false; };
  }, [realState, suburbSlug, serviceName]);

  useEffect(() => {
    setWpLoading(true);
    getServiceAreaPage(serviceSlug, suburbSlug)
      .then(setWp)
      .finally(() => setWpLoading(false));

    setProvidersLoading(true);
    listPublicProviders({ service: serviceName, suburb: suburbName })
      .then((res) => { setProviders(res.items); setProvidersTotal(res.total); })
      .catch(() => {})
      .finally(() => setProvidersLoading(false));
  }, [serviceSlug, suburbSlug, serviceName, suburbName]);

  const act = (value: string | undefined) => runAction(value, { openMatchModal, navigate });

  // Regulator cards, response times and related services are editor-authored (extended ACF group) and shown only when written.
  const regulatorItems = (wp?.regulations?.cards ?? []).map((c) => ({ name: c.title, phone: c.phone, site: c.website, description: c.description }));
  const responseTimeItems = (wp?.responseTimes ?? []).map((r) => ({ abbr: r.state, minutes: r.minutes }));
  const relatedLinks = (wp?.relatedServices ?? []).map((r) => ({ name: r.title, to: `/services/${r.slug}` }));
  const serviceDirectoryGroups = SERVICE_GROUPS.map((group) => ({
    ...group,
    links: group.services
      .filter((name) => name !== serviceName && SUPPORT_CATEGORIES.includes(name))
      .map((name) => ({
        name,
        to: CORE_SERVICES.includes(name)
          ? `/services/${slugify(name)}`
          : `/find-a-provider?service=${encodeURIComponent(name)}`,
      })),
  }));
  const supportRows = areaSupports
    .filter((r) => r.category !== serviceName && r.count >= MIN_INDEXABLE_SERVICE_LOCATION && REAL_SERVICES.includes(r.category))
    .slice(0, 12);
  const localSnapshot = serviceLocalSnapshot(serviceName, suburbName, suburbSlug, stateName, stateSuburbs);
  const suburbRows = otherSuburbs.filter((s) => s.count >= MIN_INDEXABLE_SERVICE_LOCATION).slice(0, 12);
  const localFacts: [string, string][] = wp?.local
    ? ([
        ['Population', wp.local.population],
        ['Median personal income', wp.local.medianIncome],
        ['Nearest hospital', wp.local.nearestHospital],
        ['Public transport', wp.local.publicTransport],
        ['Postcode', wp.local.postcode],
      ] as [string, string][]).filter(([, v]) => v)
    : [];

  const introParagraph = wp?.introParagraph || `This page lists ${serviceLower} providers who support ${suburbName} and the surrounding area. Providers set their own supports, service areas and availability, and confirm their capacity each week. Before you engage a provider, confirm their registration, insurance and worker screening directly with them.`;
  const compareItems = wp?.compare?.length ? wp.compare : COMPARE;
  const demandItems = wp?.demand ?? [];
  const suburbFactsItems = wp?.suburbFacts ?? [];
  const languageItems = wp?.languages ?? [];
  const glanceItems = wp?.glance ?? [];
  const serviceCountsItems = wp?.serviceCounts ?? [];
  const requestedItems = wp?.requested ?? [];
  // Questions only where an editor wrote them for this page; a generic list repeated on every suburb adds nothing.
  const faqItems = wp?.faq ?? [];

  // The ToC only lists sections that actually render — "Costs" and
  // "What to expect" used to be listed unconditionally although no such
  // sections existed (dead anchors). They're now real sections that
  // appear only when an editor has filled in their ACF group.
  const hasRegister = registerTotal !== null && registerTotal > 0;
  const toc = wp?.toc?.length ? [
    ...wp.toc,
    ...(serviceEditorial && !wp.toc.some((item) => item.href === '#service-guide')
      ? [{ label: `${serviceName} at a glance`, href: '#service-guide' }]
      : []),
    ...(!wp.toc.some((item) => item.href === '#register')
      ? [{ label: 'Providers on the register', href: '#register' }]
      : []),
    ...(!wp.toc.some((item) => item.href === '#workers')
      ? [{ label: 'Independent workers', href: '#workers' }]
      : []),
    ...(wp.editorialContentHtml && !wp.toc.some((item) => item.href === '#editorial-content')
      ? [{ label: 'Local guide', href: '#editorial-content' }]
      : []),
  ] : [
    { label: 'Top providers', href: '#providers' },
    ...(hasRegister ? [{ label: 'Providers on the register', href: '#register' }] : []),
    { label: 'Independent workers', href: '#workers' },
    { label: `About ${serviceLower}`, href: '#about-service' },
    ...(serviceEditorial ? [{ label: `${serviceName} at a glance`, href: '#service-guide' }] : []),
    ...(wp?.editorialContentHtml ? [{ label: 'Local guide', href: '#editorial-content' }] : []),
    { label: 'What to compare', href: '#compare' },
    ...(supportRows.length > 0 ? [{ label: `Other supports in ${suburbName}`, href: '#other-supports' }] : []),
    ...(suburbRows.length > 0 ? [{ label: `${serviceName} in nearby suburbs`, href: '#other-suburbs' }] : []),
    ...(demandItems.length > 0 ? [{ label: "Who's asking", href: '#asking' }] : []),
    ...(suburbFactsItems.length > 0 || localFacts.length > 0 ? [{ label: `About ${suburbName}`, href: '#suburb' }] : []),
    ...(languageItems.length > 0 ? [{ label: 'Language support', href: '#language' }] : []),
    ...(glanceItems.length > 0 ? [{ label: `${serviceName} at a glance`, href: '#glance' }] : []),
    ...(wp?.cost ? [{ label: wp.cost.heading || 'Costs and how to pay', href: '#costs' }] : []),
    ...(wp?.expect ? [{ label: wp.expect.heading || 'What to expect', href: '#expect' }] : []),
    ...(serviceCountsItems.length > 0 ? [{ label: 'Services in this suburb', href: '#services' }] : []),
    ...(requestedItems.length > 0 ? [{ label: 'Most requested support', href: '#requested' }] : []),
    ...(regulatorItems.length > 0 ? [{ label: 'Regulations & compliance', href: '#rules' }] : []),
    { label: 'Find providers near you', href: '#find-near-you' },
    ...(faqItems.length > 0 ? [{ label: 'FAQ', href: '#faq' }] : []),
  ];

  // SEO: an editor's own "SEO" fields (wp.seo) win when they've filled
  // them in; otherwise a real, page-specific title/description built
  // from the actual service + suburb + the real intro paragraph above
  // — never a generic or invented line. Runs once wp has resolved
  // (null on "nothing authored", which still yields a real fallback).
  useEffect(() => {
    // Wait for the register total: whether the page is indexed depends on it.
    if (wpLoading || registerTotal === null) return;
    const fullTitle = `${serviceName} providers in ${suburbName}, ${stateAbbr}`;
    const compactTitle = `${serviceName} in ${suburbName}, ${stateAbbr}`;
    applySeoTags({
      // 46 characters for the page part plus " | SolDirectory" keeps the whole title within 60.
      title: wp?.seo.title || `${fitTitle(fullTitle.length <= 46 ? fullTitle : compactTitle, 46)} | SolDirectory`,
      description: metaDescription(wp?.seo.description || introParagraph, 160),
      ogImage: wp?.seo.ogImage,
      canonicalUrl: `${window.location.origin}${stateSlug
        ? `/services/${serviceSlug}/${stateSlug}/${suburbSlug}`
        : `/services/${serviceSlug}/${suburbSlug}`}`,
      noindex: !stateSlug || wp?.seo.noindex || registerTotal < MIN_INDEXABLE_SERVICE_LOCATION || !isPriorityIndexSuburb(stateAbbr, suburbName),
    });
    setJsonLd('service-location', {
      '@type': 'Service',
      name: `${serviceName} in ${suburbName}, ${stateAbbr}`,
      serviceType: serviceName,
      areaServed: { '@type': 'City', name: suburbName, containedInPlace: { '@type': 'State', name: stateName } },
      provider: { '@type': 'Organization', name: 'SolDirectory', url: `${window.location.origin}/` },
      description: introParagraph,
      url: window.location.href,
    });
    setJsonLd('service-location-faq', faqItems.length > 0 ? {
      '@type': 'FAQPage',
      mainEntity: faqItems.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    } : null);
    return () => {
      setJsonLd('service-location', null);
      setJsonLd('service-location-faq', null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wpLoading, registerTotal, wp, serviceName, suburbName, stateAbbr, stateName, introParagraph, stateSlug, serviceSlug, suburbSlug, faqItems]);

  const heroProviderLabel = providersLoading
    ? `Checking providers serving ${suburbName}`
    : providersTotal > 0
      ? `${providersTotal} providers cover ${suburbName}`
      : `Providers serving ${suburbName}`;
  const HERO_CHECKS = [
    heroProviderLabel,
    'Funded via NDIS and aged care',
    'Free, no obligation',
    'One request, providers respond',
  ];

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [finderLocationInput, setFinderLocationInput] = useState(suburbName);
  const [finderServiceInput, setFinderServiceInput] = useState(SERVICES.includes(serviceName) ? serviceName : SERVICES[1]);

  function toggleBlurb(id: string) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  return (
    <>
      <PublicHeader />


      {/* Hero */}
      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Services', to: '/services' }, { label: serviceName }, { label: stateName }, { label: suburbName }]}
        image={bannerFor({ text: serviceName, section: 'locations', state: stateAbbr })}
        imageAlt=""
        eyebrow={<>{serviceName} · {stateName}</>}
        title={`${serviceName} providers in ${suburbName}, ${stateName}`}
        description={`Compare provider profiles and public-register listings for ${serviceLower} in ${suburbName}, then send one request to providers serving your area.`}
        stats={<span><strong>{heroProviderLabel}</strong></span>}
        panel={{
          title: `For ${serviceLower}`,
          checks: HERO_CHECKS,
          ctaLabel: `Find providers in ${suburbName} →`,
          onCta: () => openMatchModal(),
          note: 'One minute to send, and it costs nothing.',
        }}
      />

      {/* Body: TOC + main content */}
      <div className="svc-body">
        <aside className="svc-toc">
          <p className="svc-toc-title">On this page</p>
          <div className="svc-toc-list">
            {toc.map((t) => (
              <a key={t.href} href={t.href} className="svc-toc-link">
                {t.label}
              </a>
            ))}
          </div>
        </aside>

        <main className="svc-main">
          {/* Providers — REAL data, not fixtures */}
          <section id="providers">
            <h2 className="svc-h2">{serviceName} providers supporting {suburbName}</h2>

            {providersLoading ? (
              <p className="svc-p">Loading providers…</p>
            ) : providers.length > 0 ? (
              <>
                <p className="svc-showing">
                  Showing {providers.length} of {providersTotal} SolDirectory provider {providersTotal === 1 ? 'profile' : 'profiles'}
                </p>
                <div className="svc-provider-list">
                  {providers.map((p, i) => (
                    <article key={p.id} className="svc-provider-card">
                      <div className="svc-provider-top">
                        <div className="svc-provider-info">
                          <div className="svc-provider-name-row">
                            <h3 className="svc-provider-name">
                              {p.slug && canOpenProfiles ? (
                                <Link to={`/providers/${p.slug}`}>{p.tradingName || p.legalEntityName}</Link>
                              ) : (
                                p.tradingName || p.legalEntityName
                              )}
                            </h3>
                          </div>
                          <p className="svc-provider-area">{p.serviceSuburbs.join(', ') || 'Service area not listed'}</p>
                          {p.registrationGroups.length > 0 && (
                            <div className="svc-provider-checks">
                              {p.registrationGroups.slice(0, 4).map((g) => (
                                <span key={g} className="svc-provider-check"><CheckIcon /> {g}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="svc-provider-meta">
                        <span>Availability</span>
                        <span className={p.intakeStatus === 'Open to referrals' ? 'svc-avail-ok' : 'svc-avail-closed'}>{p.intakeStatus}</span>
                      </div>

                      <div className="svc-provider-cta">
                        <button className="btn-gradient" onClick={() => openMatchModal()}>Get matched</button>
                        {p.slug && canOpenProfiles && <Link to={`/providers/${p.slug}`} className="svc-readmore">View full profile</Link>}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : null}

            <p className="svc-p">
              Members taking new people are shown first, then other members, each alphabetically. Paying never changes the order, and a listing is not an endorsement; compare suitability, safeguards, availability, fees and service terms directly.
            </p>

            {localSnapshot && (
              <>
                <h2 className="svc-h2-sm">{suburbName} at a glance</h2>
                <p className="svc-p">{localSnapshot}</p>
              </>
            )}

            <RegisterNearby serviceName={serviceName} suburbSlug={suburbSlug} suburbName={suburbName} stateAbbr={stateAbbr} onTotal={setRegisterTotal} />

            <LocationWorkers stateCode={stateAbbr} stateName={stateName} suburbName={suburbName} serviceName={serviceName} />

            <div id="match" className="svc-match-card">
              <div className="svc-match-header">Get matched directly</div>
              <div className="svc-match-body">
                <h3>Not finding the right match?</h3>
                <p>Tell us what you need and we will connect you with {serviceLower} providers in {suburbName}. No wait list.</p>
                {/* This used to be an inline "email or phone" box whose
                    Send button only flipped a local flag to "Thanks —
                    we'll be in touch" — nothing was ever sent, so a real
                    enquiry was silently discarded. It now opens the real
                    Get Matched wizard, which validates, saves and matches. */}
                <div className="svc-match-form">
                  <button type="button" className="btn-gradient" onClick={() => openMatchModal()}>
                    Start your free request →
                  </button>
                </div>
                <p className="svc-match-footnote">Free, no obligation. Providers respond directly to you.</p>
              </div>
            </div>

            <Link to={`/find-a-provider?service=${encodeURIComponent(serviceName)}&suburb=${encodeURIComponent(suburbName)}`} className="svc-seeall-card">
              <span><MapPinIcon /> See all providers in {suburbName}, {stateAbbr}</span>
              <span>›</span>
            </Link>
          </section>

          <section id="about-service">
            <h2 className="svc-h2-sm">About home {serviceLower} in {suburbName}</h2>
            <p className="svc-p">{introParagraph}</p>
          </section>

          {serviceEditorial && (
            <section id="service-guide" className="svc-service-guide">
              <h2 className="svc-h2-sm">{serviceName} at a glance</h2>
              <p className="svc-service-answer">{serviceEditorial.shortAnswer}</p>
              <div className="svc-service-guide-block">
                <h3>What {serviceLower} may include</h3>
                <ul>{serviceEditorial.includes.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <p className="svc-p">
                <Link to={`/services/${serviceSlug}`}>Read the full guide to {serviceLower}</Link>: planning, funding, questions to ask and official information.
              </p>
            </section>
          )}

          {wp?.editorialContentHtml && (
            <section id="editorial-content" className="svc-editorial-content">
              <div className="svc-rich" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(wp.editorialContentHtml) }} />
            </section>
          )}

          <section id="compare">
            <h2 className="svc-h2-sm">What to compare before choosing</h2>
            <p className="svc-p svc-p-tight">
              Use these {serviceLower}-specific checks when you contact providers in {suburbName}. Confirm each answer directly: a directory listing does not prove current capacity.
            </p>
            <div className="svc-compare-grid">
              {compareItems.map((c) => (
                <div key={c.title} className="svc-compare-card">
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                  <p className="svc-compare-ask"><strong>Ask:</strong> {c.ask}</p>
                </div>
              ))}
            </div>
          </section>

          {supportRows.length > 0 && (
            <section id="other-supports">
              <h2 className="svc-h2-sm">Other supports listed in {suburbName}</h2>
              <p className="svc-p svc-p-tight">Each number is how many register listings in {suburbName} list that support.</p>
              <div className="svc-state-grid">
                {supportRows.map((r) => (
                  <Link key={r.category} to={`/services/${slugify(r.category)}/${stateSlug}/${suburbSlug}`} className="svc-state-card">
                    <span className="svc-state-abbr">{r.category} in {suburbName}</span>
                    <span className="svc-state-count">({r.count.toLocaleString('en-AU')})</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {suburbRows.length > 0 && (
            <section id="other-suburbs">
              <h2 className="svc-h2-sm">{serviceName} in other {stateName} suburbs</h2>
              <div className="svc-state-grid">
                {suburbRows.map((s) => (
                  <Link key={s.slug} to={`/services/${serviceSlug}/${stateSlug}/${s.slug}`} className="svc-state-card">
                    <span className="svc-state-abbr">{serviceName} in {s.suburb}</span>
                    <span className="svc-state-count">({s.count.toLocaleString('en-AU')})</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {demandItems.length > 0 && (
          <section id="asking">
            <h2 className="svc-h2-sm">Who is asking for home {serviceLower}</h2>
            <div className="svc-demand-grid">
              {demandItems.map((d) => (
                <div key={d.title}>
                  <p className="svc-demand-title">{d.title}</p>
                  <div className="svc-bar-list">
                    {d.rows.map(([label, value]) => (
                      <div key={label}>
                        <div className="svc-bar-row">
                          <span>{label}</span>
                          <span className="svc-bar-pct">{value}%</span>
                        </div>
                        <div className="svc-bar-track"><div className="svc-bar-fill" style={{ width: `${value}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          )}

          {(suburbFactsItems.length > 0 || localFacts.length > 0) && (
          <section id="suburb">
            <h2 className="svc-h2-sm">About {suburbName}</h2>
            <div className="svc-facts-grid">
              {suburbFactsItems.map((f) => (
                <div key={f.label} className="svc-fact-card">
                  <p className="svc-fact-label">{f.label}</p>
                  <p className="svc-fact-value">{f.value}</p>
                  {f.note && <p className="svc-fact-note">{f.note}</p>}
                </div>
              ))}
              {localFacts.map(([label, value]) => (
                <div key={`local-${label}`} className="svc-fact-card">
                  <p className="svc-fact-label">{label}</p>
                  <p className="svc-fact-value">{value}</p>
                </div>
              ))}
            </div>
            {wp?.local?.communityInfo && <p className="svc-p" style={{ marginTop: 16 }}>{wp.local.communityInfo}</p>}
            {wp?.local?.dataDate && <p className="svc-fact-note" style={{ marginTop: 8 }}>Source: {wp.local.dataDate}</p>}
          </section>
          )}

          {languageItems.length > 0 && (
          <section id="language">
            <h2 className="svc-h2-sm">Language support in {suburbName}</h2>
            <div className="svc-language-grid">
              {languageItems.map((l) => (
                <div key={l.name} className="svc-language-card">
                  <span>
                    <span className="svc-language-name">{l.name}</span>
                    <span className="svc-language-native">{l.native}</span>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <span className="svc-language-count">{l.count}</span>
                    <span className="svc-language-share">{l.share}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
          )}

          {glanceItems.length > 0 && (
          <section id="glance">
            <h2 className="svc-h2-sm">Home {serviceLower} at a glance</h2>
            <div className="svc-glance-table">
              {glanceItems.map(([label, value], i) => (
                <div key={label} className="svc-glance-row" style={{ background: i % 2 === 1 ? '#F2F7FF' : 'transparent' }}>
                  <span>{label}</span>
                  <span className="svc-glance-value">{value}</span>
                </div>
              ))}
            </div>
          </section>
          )}

          {wp?.cost && (
            <section id="costs">
              <h2 className="svc-h2-sm">{wp.cost.heading || 'Costs and how to pay'}</h2>
              {wp.cost.intro && <p className="svc-p svc-p-tight">{wp.cost.intro}</p>}
              {wp.cost.pricingInfoHtml && (
                <div className="svc-p svc-rich" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(wp.cost.pricingInfoHtml) }} />
              )}
              <div className="svc-facts-grid">
                {([
                  ['NDIS', wp.cost.ndis],
                  ['Private payment', wp.cost.privatePay],
                  ['Aged care', wp.cost.agedCare],
                  ['DVA', wp.cost.dva],
                ] as [string, string][]).filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="svc-fact-card">
                    <p className="svc-fact-label">{label}</p>
                    <p className="svc-fact-value svc-fact-value-body">{value}</p>
                  </div>
                ))}
              </div>
              {wp.cost.notes && <p className="svc-fact-note" style={{ marginTop: 12 }}>{wp.cost.notes}</p>}
            </section>
          )}

          {wp?.expect && (
            <section id="expect">
              <h2 className="svc-h2-sm">{wp.expect.heading || 'What to expect'}</h2>
              {wp.expect.intro && <p className="svc-p svc-p-tight">{wp.expect.intro}</p>}
              {wp.expect.steps.length > 0 && (
                <ol className="svc-credentials-list">
                  {wp.expect.steps.map((st) => (
                    <li key={`${st.number}-${st.title}`}>
                      <span className="svc-credentials-num">{st.number}</span>
                      <div>
                        <p className="svc-credentials-title">{st.title}</p>
                        {st.description && <p className="svc-credentials-body">{st.description}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}

          {serviceCountsItems.length > 0 && (
          <section id="services">
            <h2 className="svc-h2-sm">Care services available in {suburbName}</h2>
            <div className="svc-bar-list">
              {(() => {
                const maxCount = Math.max(...serviceCountsItems.map(([, c]) => c));
                return serviceCountsItems.map(([label, count]) => (
                  <div key={label}>
                    <div className="svc-bar-row"><span>{label}</span><span className="svc-bar-pct">{count}</span></div>
                    <div className="svc-bar-track"><div className="svc-bar-fill" style={{ width: `${(count / maxCount) * 100}%` }} /></div>
                  </div>
                ));
              })()}
            </div>
            <div style={{ marginTop: 24 }}>
              <Link to="/services" className="svc-link-strong">View all services →</Link>
            </div>
          </section>
          )}

          {requestedItems.length > 0 && (
          <section id="requested">
            <h2 className="svc-h2-sm">Most requested support in {suburbName}</h2>
            <div className="svc-bar-list">
              {(() => {
                const maxV = Math.max(...requestedItems.map((r) => r.v));
                return requestedItems.map((r) => (
                  <div key={r.label}>
                    <div className="svc-bar-row">
                      <span style={{ fontWeight: r.on ? 600 : 400 }}>{r.label}</span>
                      <span className="svc-bar-pct"><strong>{r.requests}</strong> · {r.providers}</span>
                    </div>
                    <div className="svc-bar-track"><div className="svc-bar-fill" style={{ width: `${(r.v / maxV) * 100}%` }} /></div>
                  </div>
                ));
              })()}
            </div>
          </section>
          )}

          {regulatorItems.length > 0 && (
          <section id="rules">
            <h2 className="svc-h2-sm">{wp?.regulations?.heading || `${stateName} regulations and compliance`}</h2>
            {wp?.regulations?.intro && <p className="svc-p svc-p-tight">{wp.regulations.intro}</p>}
            <div className="svc-regulators-grid">
              {regulatorItems.map((r) => (
                <div key={r.name} className="svc-regulator-card">
                  <p className="svc-regulator-name">{r.name}</p>
                  {r.description && <p>{r.description}</p>}
                  {r.phone && <p>Phone: {r.phone}</p>}
                  {r.site && <p>Website: {r.site}</p>}
                </div>
              ))}
            </div>
            <div className="svc-policy-pills">
              {POLICIES.map((p) => <span key={p} className="svc-policy-pill">{p}</span>)}
            </div>
          </section>
          )}

          <section id="find-near-you" className="svc-finder">
            <h2 className="svc-h2-sm">{wp?.finder?.heading || `Find ${serviceLower} providers near you`}</h2>
            {wp?.finder?.description && <p className="svc-p svc-p-tight">{wp.finder.description}</p>}
            <form className="svc-finder-form" onSubmit={(e) => { e.preventDefault(); navigate(`/find-a-provider?service=${encodeURIComponent(finderServiceInput)}&suburb=${encodeURIComponent(finderLocationInput.trim())}`); }}>
              <label className="svc-finder-field">
                <span>Location</span>
                <input value={finderLocationInput} onChange={(e) => setFinderLocationInput(e.target.value)} placeholder="Suburb or postcode" />
              </label>
              <label className="svc-finder-field">
                <span>Service / need</span>
                <select value={finderServiceInput} onChange={(e) => setFinderServiceInput(e.target.value)}>
                  {SERVICES.filter((s) => s !== 'All services').map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <button type="submit" className="btn-gradient svc-finder-btn">Search →</button>
            </form>
          </section>

          {faqItems.length > 0 && (
          <section id="faq">
            <h2 className="svc-h2-sm" style={{ marginBottom: 22 }}>Frequently asked questions</h2>
            <div className="svc-faq-list">
              {faqItems.map((f, i) => (
                <div key={f.q} className="svc-faq-item">
                  <button className="svc-faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                    {f.q}
                    <span className={`svc-faq-icon ${openFaq === i ? 'svc-faq-icon-open' : ''}`}>+</span>
                  </button>
                  {openFaq === i && <p className="svc-faq-answer">{f.a}</p>}
                </div>
              ))}
            </div>
          </section>
          )}

          {responseTimeItems.length > 0 && (
          <section id="response-by-state">
            <h2 className="svc-h2-sm">Response time by state</h2>
            <div className="svc-bar-list">
              {(() => {
                const maxMin = Math.max(...responseTimeItems.map((r) => r.minutes));
                return responseTimeItems.map((r) => (
                  <div key={r.abbr}>
                    <div className="svc-bar-row"><span>{r.abbr}</span><span className="svc-bar-pct">{r.minutes} min</span></div>
                    <div className="svc-bar-track"><div className="svc-bar-fill" style={{ width: `${(r.minutes / maxMin) * 100}%` }} /></div>
                  </div>
                ));
              })()}
            </div>
          </section>
          )}
        </main>
      </div>

      <section className="svc-cta-band">
        <div className="svc-cta-band-inner">
          <span className="svc-cta-eyebrow">Free provider matching</span>
          <h2>{wp?.cta?.heading || `Looking for ${serviceLower} in ${suburbName}?`}</h2>
          <p>{wp?.cta?.description || `Tell us what support you need once. Providers serving ${suburbName} can review your request and respond directly.`}</p>
          <div className="svc-cta-band-actions">
            <button type="button" className="btn-gradient btn-lg" onClick={() => act(wp?.cta?.primaryAction || wp?.cta?.primaryUrl || 'get_matched')}>
              {wp?.cta?.primaryLabel || 'Get matched, free'}
            </button>
            <button type="button" className="svc-cta-band-secondary" onClick={() => act(wp?.cta?.secondaryAction || wp?.cta?.secondaryUrl || '#providers')}>
              {wp?.cta?.secondaryLabel || 'Browse providers'}
            </button>
          </div>
        </div>
      </section>

      <section className="svc-related-section">
        <div className="svc-related-inner">
          <span className="svc-section-kicker">Explore support</span>
          <h2 className="svc-h2-sm">Other services available through SolDirectory</h2>
          <p className="svc-p svc-related-intro">Browse another service for {suburbName}, or explore specialist support categories in the provider directory.</p>
          {relatedLinks.length > 0 && (
            <div className="svc-related-featured">
              <h3>Related to {serviceName}</h3>
              <div className="svc-related-grid">
                {relatedLinks.map((r) => (
                  <Link key={r.to} to={r.to} className="svc-related-link">{r.name}<span>→</span></Link>
                ))}
              </div>
            </div>
          )}
          <div className="svc-service-groups">
            {serviceDirectoryGroups.map((group) => (
              <div key={group.title} className="svc-service-group">
                <h3>{group.title}</h3>
                <div className="svc-service-links">
                  {group.links.map((service) => (
                    <Link key={service.name} to={service.to}>{service.name}<span>→</span></Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RelatedArticles standalone service={catalogueService} themes={['local', 'choosing']} heading={`Reading about ${catalogueService ?? serviceName} in ${suburbName}`} />

      <PublicFooter />
    </>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 2 }}>
      <path d="m4 12.5 5 5 11-11" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5 20 6v6c0 4.6-3.3 8.4-8 9.5-4.7-1.1-8-4.9-8-9.5V6Z" />
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10.5c0 5.5-8 11-8 11s-8-5.5-8-11a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10.5" r="2.6" />
    </svg>
  );
}
