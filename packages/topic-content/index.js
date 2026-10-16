import { CONDITION_CONTENT_GROUPS } from './conditionContent.js';
import { LANGUAGE_RESOURCES, languageResourceAgencies } from './languageResources.js';
import { FUNDING_CONTENT_GROUPS } from './fundingContent.js';
export { GUIDE_DOCS } from './guides.js';
export { EDITORIAL_BLOG_POSTS } from './blog.js';
export { GLOSSARY } from './glossary.js';
export { hubCopy, DIRECTORY_KINDS } from './hubContent.js';
export { EDITORIAL_STANDARDS } from './editorialContent.js';
export { COORDINATOR_PAGE } from './coordinatorContent.js';
export { ARTICLE_FAQS } from './blogFaqs.js';
export { FUNDING_SEO_DESCRIPTIONS } from './fundingSeoDescriptions.js';
export { CONDITION_CONTENT_GROUPS } from './conditionContent.js';
export { FUNDING_CONTENT_GROUPS } from './fundingContent.js';
export { LANGUAGE_SPECIFICS } from './languageSpecifics.js';
export { LEGAL_PACK, LEGAL_PRACTICES, resolveLegalDoc, legalDocBySlug } from './legalPack.js';
export { INDEX_PHASE, PHASE_2_MIN_LISTINGS, INDEX_REGISTER_PROFILES, EXTRA_INDEX_SUBURBS, isPriorityIndexSuburb, isIndexableSuburb } from './indexingPolicy.js';
export { LANGUAGE_RESOURCES, LANGUAGE_RESOURCES_CHECKED, languageResourceAgencies } from './languageResources.js';
export { LINK_TERMS, MAX_LINKS_PER_ARTICLE, newLinkState, linkParagraph, linkScopeFor, faqHtml } from './blogLinks.js';
export { DIRECTORY_PAGE_TITLE, DIRECTORY_PAGE_HEADING, DIRECTORY_PAGE_DESCRIPTION, DIRECTORY_PAGE_UPDATED, DIRECTORY_PAGE_SUBTITLE, DIRECTORY_SUPPORTS, DIRECTORY_GUIDANCE, WORKER_PAGE_TITLE, WORKER_PAGE_DESCRIPTION, WORKER_PAGE_UPDATED, WORKER_HERO_CHECKS, PROVIDER_PAGE_UPDATED, PROVIDER_PAGE_DESCRIPTION, INDEPENDENT_WORKER_FAQS, PROVIDER_FAQS, WORKER_PAGE_GUIDES, PROVIDER_PAGE_GUIDES, WORKER_SETUP_STEPS, PROVIDER_LISTING_CHECKS, DIRECTORY_STEPS, DIRECTORY_FAQS, STATE_CENTRES, LOCATION_FAQS, PROVIDER_UNDERSTAND, PROVIDER_REACH, PROVIDER_STEPS, PROVIDER_PATHS, PROVIDER_SAFEGUARDS, WORKER_PROFILE_DETAILS, WORKER_HOW_IT_WORKS, WORKER_SAFEGUARDS, PROVIDER_PLANS } from './pageContent.js';

const group = (categoryGroup, names) => names.map(([slug, name]) => ({ slug, name, categoryGroup }));

export const CONDITION_TOPICS = [
  ...group('Developmental', [
    ['autism', 'Autism'], ['adhd', 'ADHD'], ['intellectual-disability', 'Intellectual Disability'],
    ['global-developmental-delay', 'Global Developmental Delay'], ['down-syndrome', 'Down Syndrome'],
    ['fragile-x-syndrome', 'Fragile X Syndrome'], ['cerebral-palsy', 'Cerebral Palsy'],
    ['speech-language-delay', 'Speech & Language Delay'],
  ]),
  ...group('Mobility & Physical', [
    ['spinal-cord-injury', 'Spinal Cord Injury'], ['amputation-limb-loss', 'Amputation & Limb Loss'],
    ['muscular-dystrophy', 'Muscular Dystrophy'], ['multiple-sclerosis', 'Multiple Sclerosis'], ['arthritis', 'Arthritis'],
    ['spina-bifida', 'Spina Bifida'], ['chronic-pain', 'Chronic Pain'],
  ]),
  ...group('Hearing, Vision & Sensory', [
    ['deafness-hearing-loss', 'Deafness & Hearing Loss'], ['blindness-low-vision', 'Blindness & Low Vision'],
    ['deafblindness', 'Deafblindness'], ['auslan-support', 'Auslan Support'], ['sensory-processing', 'Sensory Processing'],
  ]),
  ...group('Psychosocial & Mental Health', [
    ['schizophrenia', 'Schizophrenia'], ['bipolar-disorder', 'Bipolar Disorder'], ['ptsd', 'PTSD'],
    ['anxiety-disorders', 'Anxiety Disorders'], ['depression', 'Depression'], ['eating-disorders', 'Eating Disorders'],
    ['borderline-personality-disorder', 'Borderline Personality Disorder'], ['dual-diagnosis', 'Dual Diagnosis'],
  ]),
  ...group('Chronic & Complex Medical', [
    ['epilepsy', 'Epilepsy'], ['diabetes', 'Diabetes'], ['cystic-fibrosis', 'Cystic Fibrosis'],
    ['renal-failure', 'Renal Failure'], ['cancer-care', 'Cancer Care'], ['motor-neurone-disease', 'Motor Neurone Disease'],
    ['parkinson-s-disease', "Parkinson's Disease"],
  ]),
  ...group('ABI, Stroke & Neuro Rehab', [
    ['acquired-brain-injury', 'Acquired Brain Injury'], ['stroke-recovery', 'Stroke Recovery'],
    ['traumatic-brain-injury', 'Traumatic Brain Injury'], ['huntington-s-disease', "Huntington's Disease"],
    ['neuro-physiotherapy', 'Neuro Physiotherapy'],
  ]),
];

export const FUNDING_TOPICS = [
  ...group('NDIS Plans', [
    ['agency-managed', 'Agency Managed'], ['plan-managed', 'Plan Managed'], ['self-managed', 'Self Managed'],
    ['plan-reviews', 'Plan Reviews'], ['change-of-circumstances', 'Change of Circumstances'], ['first-plan-support', 'First Plan Support'],
  ]),
  ...group('Aged Care', [
    ['home-care-packages', 'Home Care Packages'], ['commonwealth-home-support', 'Commonwealth Home Support'],
    ['support-at-home', 'Support at Home'], ['residential-fees', 'Residential Fees'],
  ]),
  ...group('Veterans', [
    ['dva-community-nursing', 'DVA Community Nursing'], ['dva-home-care', 'DVA Home Care'],
    ['veterans-home-care', "Veterans' Home Care"], ['rehabilitation-appliances', 'Rehabilitation Appliances'],
    ['open-arms-referrals', 'Open Arms Referrals'],
  ]),
  ...group('Other Funding', [
    ['private-fee-for-service', 'Private Fee for Service'], ['icare-workers-compensation', 'iCare & Workers Compensation'],
    ['private-health-insurance', 'Private Health Insurance'], ['medicare-care-plans', 'Medicare Care Plans'],
    ['state-funded-programs', 'State Funded Programs'],
  ]),
  ...group('Help With Funding', [
    ['plan-managers', 'Plan Managers'], ['bookkeeping-invoicing', 'Bookkeeping & Invoicing'],
    ['price-guide-explained', 'Price Guide Explained'], ['funding-eligibility', 'Funding Eligibility'],
    ['budget-categories', 'Budget Categories'],
  ]),
];

export const LANGUAGE_TOPICS = [
  ...group('Most Requested', [
    ['arabic', 'Arabic'], ['mandarin', 'Mandarin'], ['cantonese', 'Cantonese'], ['vietnamese', 'Vietnamese'],
    ['greek', 'Greek'], ['italian', 'Italian'], ['hindi', 'Hindi'], ['punjabi', 'Punjabi'],
  ]),
  ...group('Middle East & Africa', [
    ['assyrian', 'Assyrian'], ['persian-farsi', 'Persian (Farsi)'], ['dari', 'Dari'], ['turkish', 'Turkish'],
    ['somali', 'Somali'], ['swahili', 'Swahili'], ['amharic', 'Amharic'],
  ]),
  ...group('First Nations', [
    ['aboriginal-torres-strait-islander-services', 'Aboriginal & Torres Strait Islander Services'],
    ['kriol', 'Kriol'], ['yolngu-matha', 'Yolngu Matha'], ['pitjantjatjara', 'Pitjantjatjara'],
  ]),
  ...group('Europe', [
    ['spanish', 'Spanish'], ['portuguese', 'Portuguese'], ['polish', 'Polish'], ['croatian', 'Croatian'],
    ['serbian', 'Serbian'], ['russian', 'Russian'], ['macedonian', 'Macedonian'], ['german', 'German'],
  ]),
  ...group('Asia Pacific', [
    ['tagalog', 'Tagalog'], ['indonesian', 'Indonesian'], ['korean', 'Korean'], ['japanese', 'Japanese'],
    ['nepali', 'Nepali'], ['tamil', 'Tamil'], ['thai', 'Thai'], ['khmer', 'Khmer'],
  ]),
  ...group('Access & Interpreting', [
    ['auslan', 'Auslan'], ['deafblind-interpreters', 'Deafblind Interpreters'],
    ['tis-national-bookings', 'TIS National Bookings'], ['easy-read-materials', 'Easy Read Materials'],
    ['translated-documents', 'Translated Documents'],
  ]),
];

const CONDITION_GUIDES = {
  'Developmental': 'Good planning considers communication, sensory needs, learning, daily routines, family context and participation across home, education, work and community life.',
  'Mobility & Physical': 'Good planning considers movement, fatigue, pain, transfers, equipment, the physical environment and how support can preserve choice and independence.',
  'Hearing, Vision & Sensory': 'Good planning starts with the person’s preferred communication, accessible information, sensory environment, assistive technology and right to direct assistance.',
  'Psychosocial & Mental Health': 'Good planning is recovery-oriented and trauma-aware, respects privacy and choice, and coordinates functional support with clinical mental health care when consent is given.',
  'Chronic & Complex Medical': 'Good planning separates clinical treatment from daily functional support, uses current person-specific health plans and makes responsibility for escalation and after-hours care clear.',
  'ABI, Stroke & Neuro Rehab': 'Good planning considers cognition, communication, movement, fatigue, behaviour and meaningful daily participation, with coordinated rehabilitation and support that can change over time.',
};

const FUNDING_GUIDES = {
  'NDIS Plans': 'Use the participant’s current plan and current NDIA guidance. Confirm the relevant budget, management arrangement, provider-registration requirements, price limits and written service terms before support begins.',
  'Aged Care': 'Use the person’s current assessment and My Aged Care guidance. Confirm the program, approved services, provider availability, personal contributions, recurring fees and exit terms in writing.',
  'Veterans': 'DVA eligibility depends on card type, accepted conditions, assessed need and the particular program. Confirm referrals, prior approval, contracted-provider requirements and possible contributions directly with DVA.',
  'Other Funding': 'Check the exact insurer, scheme, policy or private arrangement. Obtain written confirmation of eligibility, referral and provider requirements, total fees, expected benefits and likely out-of-pocket costs.',
  'Help With Funding': 'Define the administrative or funding question, choose a service with the right role and authority, agree consent and record access, and check decisions against the current plan and official guidance.',
};

const FUNDING_DETAILS = {
  'NDIS Plans': {
    records: ['The current NDIS plan and implementation notes', 'Service agreements, quotes and cancellation terms', 'Invoices, budget statements and payment records', 'Assessments, reports and evidence relevant to plan decisions'],
    providerQuestions: ['Can you work with this plan-management arrangement, and must you be registered for this support?', 'Which support item or budget do you expect to use, and why?', 'What are your rates for sessions, travel, reports, cancellations and non-face-to-face work?', 'How will you report progress, spending or concerns before the budget runs short?', 'What happens if the NDIA rejects a claim or an invoice is disputed?'],
    pitfalls: ['Assuming a funded category covers every service', 'Using an outdated price limit or support-item description', 'Starting without written rates and cancellation terms', 'Waiting until the plan is nearly exhausted before reviewing spending'],
    sources: [{ label: 'NDIS: Using your plan', href: 'https://www.ndis.gov.au/participants/using-your-funding/understanding-your-ndis-funding/guide-using-your-funding' }, { label: 'NDIS pricing arrangements', href: 'https://www.ndis.gov.au/providers/pricing-and-payments/pricing/pricing-arrangements' }],
  },
  'Aged Care': {
    records: ['My Aged Care reference number and assessment outcome', 'Support plan, approval notices and provider agreement', 'Current fee schedule, budget statements and invoices', 'Health, safety and communication information shared with consent'],
    providerQuestions: ['Are you approved to deliver the current program and required services?', 'What fees, contributions, management charges, travel or establishment costs apply?', 'When can support start, and what happens if needs increase or a regular worker is absent?', 'How are service changes, complaints and moving to another provider handled?', 'Which costs are government funded and which remain the person’s responsibility?'],
    pitfalls: ['Relying on an old program name or fee description', 'Comparing headline prices without all recurring charges', 'Assuming approval means immediate provider capacity', 'Signing before understanding suspension, change and exit terms'],
    sources: [{ label: 'My Aged Care', href: 'https://www.myagedcare.gov.au/' }, { label: 'Aged care costs and fees', href: 'https://www.myagedcare.gov.au/how-do-aged-care-costs-work' }],
  },
  Veterans: {
    records: ['DVA card details and accepted-condition information', 'Referral, assessment or prior-approval documents', 'Treatment or support plan and relevant clinical instructions', 'Provider quotes, service records and DVA correspondence'],
    providerQuestions: ['Are you authorised or contracted for this DVA program?', 'Is a referral or prior approval required before the first service?', 'Will you bill DVA directly, and could the veteran have an out-of-pocket cost?', 'How do you coordinate with treating professionals or a DVA case manager?', 'What happens if DVA changes or declines the approval?'],
    pitfalls: ['Assuming every card covers the same services', 'Booking before referral or approval requirements are met', 'Using a provider that cannot bill the relevant DVA program', 'Treating disability registration as proof of DVA eligibility'],
    sources: [{ label: 'DVA health and support services', href: 'https://www.dva.gov.au/what-we-help-with/health-support' }, { label: 'DVA contact information', href: 'https://www.dva.gov.au/about-us/contact-us' }],
  },
  'Other Funding': {
    records: ['Policy, membership or claim details', 'Referral, approval or case-manager correspondence', 'Written quote and explanation of likely gaps', 'Invoices, receipts and benefit statements'],
    providerQuestions: ['Do you bill this scheme directly, or must the person pay and claim?', 'Is a referral, approval number or case-manager authority required?', 'What is the total fee and likely out-of-pocket amount?', 'Are there annual limits, waiting periods, approved-provider rules or session caps?', 'What happens if the claim is delayed, reduced or declined?'],
    pitfalls: ['Assuming a service is covered because it was covered before', 'Confusing a rebate with full payment', 'Starting before required written approval', 'Failing to check annual limits, waiting periods or provider eligibility'],
    sources: [{ label: 'Services Australia health care and payments', href: 'https://www.servicesaustralia.gov.au/medicare' }, { label: 'Private Health Insurance Ombudsman', href: 'https://www.ombudsman.gov.au/complaints/private-health-insurance-complaints' }],
  },
  'Help With Funding': {
    records: ['Current plan, budget or funding approval', 'Service agreement and authority or consent settings', 'Invoices, statements and reconciliations', 'Written advice, decisions and follow-up actions'],
    providerQuestions: ['What is your role, and which decisions remain with the person or funding body?', 'What qualifications, registration or relevant scheme experience do you have?', 'How are fees calculated and reported against the available budget?', 'Do you receive referral fees or offer other services that create a conflict?', 'How can records be accessed, errors corrected or the service changed?'],
    pitfalls: ['Giving broad authority without clear consent limits', 'Confusing administration with personal financial or legal advice', 'Ignoring conflicts where one organisation controls several services', 'Relying on verbal advice without checking current official guidance'],
    sources: [{ label: 'NDIS: Managing your plan', href: 'https://www.ndis.gov.au/participants/using-your-funding/plan-implementation-meeting/guide-your-management-options' }, { label: 'NDIS Commission participant resources', href: 'https://www.ndiscommission.gov.au/' }],
  },
};

const joinList = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0] ?? '');

/** FAQ for a condition page, shared by the page and the crawler HTML. The first answer comes from that condition's own data. */
export function conditionFaqs(name, relatedCategories = []) {
  const lower = name.toLowerCase();
  return [
    ...(relatedCategories.length ? [{
      question: `What support do people with ${lower} commonly look for?`,
      answer: `Support commonly linked to ${name} includes ${joinList(relatedCategories.map((category) => category.toLowerCase()))}. Use these as a starting point for browsing providers, not as a personal recommendation.`,
    }] : []),
    {
      question: `Does SolDirectory verify a provider’s experience with ${lower}?`,
      answer: 'No. Providers write their own profiles, including which conditions they have experience supporting. Confirm the details that matter to you directly with the provider.',
    },
    {
      question: 'Is this page medical advice?',
      answer: 'No. It is general information to help with browsing providers. For diagnosis, treatment or a specific person’s needs, speak with a GP or the relevant specialist.',
    },
    {
      question: `Does a diagnosis of ${lower} automatically qualify someone for funding?`,
      answer: 'No. Funding bodies apply their own current eligibility rules and usually consider functional impact, the support requested and available evidence. Confirm requirements with the responsible program.',
    },
  ];
}

export function conditionShellEditorial(topic) {
  const related = CONDITION_CONTENT_GROUPS.flatMap((group) => group.items).find((item) => item.slug === topic.slug)?.relatedCategories ?? [];
  return {
    overview: CONDITION_GUIDES[topic.categoryGroup],
    checks: [
      `Ask what direct experience the provider and allocated worker have supporting people with ${topic.name.toLowerCase()}.`,
      'Confirm qualifications, screening, supervision, insurance and any person-specific training required for the support.',
      'Discuss communication, culture, routines, goals, risks and how the support will be reviewed when needs change.',
      'Confirm rates, travel, cancellations, reports, funding and the written service agreement before support starts.',
    ],
    sources: [
      { label: 'NDIS access and eligibility', href: 'https://www.ndis.gov.au/applying/application-process/how-apply' },
      { label: 'NDIS supports and services', href: 'https://www.ndis.gov.au/participants/using-your-funding/understanding-your-ndis-funding/what-are-ndis-supports' },
      { label: 'Healthdirect health information', href: 'https://www.healthdirect.gov.au/' },
    ],
    faq: conditionFaqs(topic.name, related),
  };
}

const FUNDING_AUTHORITY = {
  'NDIS Plans': 'the NDIA',
  'Aged Care': 'My Aged Care',
  Veterans: 'the Department of Veterans’ Affairs',
  'Other Funding': 'the responsible insurer, scheme or program',
  'Help With Funding': 'the relevant funding body',
};

/** The topic's own written content (summary, key points, one specific question), or undefined for an unknown slug. */
export function fundingTopicContent(slug) {
  for (const group of FUNDING_CONTENT_GROUPS) {
    const item = group.items.find((entry) => entry.slug === slug);
    if (item) return item;
  }
  return undefined;
}

// Topics about how funding works rather than a scheme or arrangement a provider could "accept".
const FUNDING_NOT_ACCEPTED = new Set(['plan-reviews', 'change-of-circumstances', 'first-plan-support']);

/** FAQ shared by the page, the crawler HTML and the prerendered file: one question about this topic, then up to three about funding. */
export function fundingFaqs(topic) {
  const lower = topic.name.toLowerCase();
  const authority = FUNDING_AUTHORITY[topic.categoryGroup] ?? 'the relevant funding body';
  const own = fundingTopicContent(topic.slug)?.faq;
  const acceptable = topic.categoryGroup !== 'Help With Funding' && !FUNDING_NOT_ACCEPTED.has(topic.slug);
  return [
    ...(own ? [own] : []),
    {
      question: `Who can confirm what ${topic.name} means for me?`,
      answer: `Ask ${authority}. A provider can explain its services and billing, but it cannot make a binding funding decision for the responsible body.`,
    },
    ...(acceptable ? [{
      question: `Does a provider listing prove it accepts ${lower}?`,
      answer: 'No. A directory or public-register listing describes a provider and the supports it lists. Confirm the funding arrangement, approval and current availability with the provider before booking.',
    }] : []),
    {
      question: 'What if the rules or my circumstances change?',
      answer: `Check the current guidance with ${authority}, tell your providers promptly and update written agreements or approvals before relying on the changed arrangement.`,
    },
  ];
}

/**
 * A meta description that ends on a finished sentence and fits a search snippet (about 110 to 160 characters).
 *  - Short enough: used as written (a very short one gets a plain closing sentence so it is not a fragment of a snippet).
 *  - Too long: the first whole sentence if it fits, otherwise cut at the last comma, colon or semicolon that leaves a
 *    sensible length, drop a dangling connector ("for example", "such as", "and"), and close with a full stop.
 *  - Nothing suitable: cut at a word and add an ellipsis, as a last resort.
 * `min` (default 0, off) pads a finished sentence shorter than that with one plain closing sentence.
 * It only shortens what the page's own text already says; it never adds claims.
 */
/**
 * FAQ for a register area page (state or suburb): four questions people ask when they land on a list of register
 * providers. The answers describe what the register is and is not, in general terms; the only number is the page's own count.
 * `kind` is { register, plain, officialName, officialUrl } as on the register pages.
 */
/**
 * One sentence of real, page-specific detail for a service x suburb page: where the suburb sits among the state's suburbs by
 * number of register listings for that service. `rows` is the state's suburbs for the service ({ slug, suburb, count }), any order.
 * Returns '' when there is nothing to compare. The same words are used by the page and by the crawler HTML.
 */
/**
 * What every register page says about how the data is kept current and how to get a listing corrected or removed (gap audit B2, B3).
 * The page and the crawler HTML use the same words. The 5 business days matches the data sources page (section 12.5).
 */
/**
 * Real, page-specific local detail for a service x suburb page (gap audit A2), built from `local`:
 *   { nearby: [{ slug, suburb, count, km }], nearestTown: { slug, suburb, count, km } | null, languages: [{ language, count }] }
 * `indexable` says whether this page is indexed. When it is not, the page points to the nearest larger centre instead, so a small
 * suburb is folded into the town page rather than competing with it. Returns null for a part with nothing to say.
 */
export function serviceLocalSections(service, suburbName, stateName, local, indexable) {
  const lower = String(service).toLowerCase();
  const n = (x) => Number(x).toLocaleString('en-AU');
  const far = (km) => (km < 1 ? 'under 1 km' : `about ${Math.round(km)} km`);
  const listings = (c) => `${n(c)} ${Number(c) === 1 ? 'listing' : 'listings'}`;
  const items = (local?.nearby ?? []).map((s) => ({
    slug: s.slug,
    suburb: s.suburb,
    label: `${service} in ${s.suburb}`,
    detail: `(${listings(s.count)}, ${far(s.km)})`,
  }));
  const nearby = items.length
    ? {
        heading: `${service} near ${suburbName}`,
        intro: `These ${stateName} suburbs are the closest to ${suburbName} with register listings for ${lower}. Distances are in a straight line between suburb centres.`,
        items,
      }
    : null;
  const town = local?.nearestTown;
  const townNote = !indexable && town
    ? {
        slug: town.slug,
        suburb: town.suburb,
        text: `If you want to look wider, the nearest larger centre is ${town.suburb}, ${far(town.km)} from ${suburbName}, with ${listings(town.count)} for ${lower}.`,
      }
    : null;
  const langs = (local?.languages ?? []).filter((l) => l && l.language && l.count > 0);
  const names = langs.map((l) => `${l.language} (${listings(l.count)})`);
  const joined = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
  const languages = names.length
    ? `Some ${lower} listings in ${suburbName} say on their own websites that they support ${joined}.`
    : null;
  return { nearby, townNote, languages };
}

/**
 * The "who lists this here" analysis and the questions and answers for a service x suburb page (gap audit A2). Every sentence comes from
 * the register listings that cover the suburb and list the service, the suburbs near it and its rank in the state, so each page says
 * something its neighbours do not. `stateRows` is the state's suburbs for the service ({ slug, suburb, count }); `local` is the
 * ServiceLocalData from the API. Returns { analysis: { heading, paragraphs } | null, faqs: [{ question, answer }] }.
 */
export function serviceLocalDetail(service, suburbName, stateName, suburbSlug, stateRows, local, areaSupports) {
  const p = local?.profile;
  if (!p || !p.total) return { analysis: null, faqs: [] };
  const lower = String(service).toLowerCase();
  const n = (x) => Number(x).toLocaleString('en-AU');
  const plural = (c, one, many) => `${n(c)} ${Number(c) === 1 ? one : many}`;
  const join = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0] ?? '');
  const far = (km) => (km < 1 ? 'under 1 km' : `about ${Math.round(km)} km`);

  const registers = join([
    p.ndis ? `${n(p.ndis)} on the NDIS Commission register` : '',
    p.agedCare ? `${n(p.agedCare)} on the My Aged Care register` : '',
  ].filter(Boolean));
  const tiers = [
    [p.reach?.local, '5 or fewer areas'],
    [p.reach?.district, '6 to 25 areas'],
    [p.reach?.regional, '26 to 100 areas'],
    [p.reach?.wide, 'more than 100 areas'],
  ].filter(([c]) => c > 0).map(([c, label]) => `${n(c)} ${Number(c) === 1 ? 'covers' : 'cover'} ${label}`);
  const moreThanOneState = p.multiState > 0 ? ` ${plural(p.multiState, 'is', 'are')} listed in more than one state.` : '';
  const top = (p.topSupports ?? []).slice(0, 5).map((t) => `${lowerFirst(t.category)} (${n(t.count)} of ${n(p.total)})`);

  const rows = (stateRows ?? []).filter((r) => r && Number(r.count) > 0);
  const paragraphs = [`${plural(p.total, 'register listing', 'register listings')} for ${lower} cover ${suburbName}: ${registers}.`];
  const census = censusDetail(suburbName, stateName, local?.census);
  if (census) paragraphs.push(census.paragraph);
  if (tiers.length) paragraphs.push(`Reach varies. ${join(tiers).replace(/^./, (c) => c.toUpperCase())}.${moreThanOneState}`);
  if (top.length) paragraphs.push(`Listings that include ${lower} here also list ${join(top)}.`);
  if (p.typicalSupports || p.specialists) {
    const focus = [
      p.typicalSupports ? `The typical listing here records ${plural(p.typicalSupports, 'support', 'supports')}` : '',
      p.specialists ? `${n(p.specialists)} of the ${n(p.total)} list ${lower} as their only support` : '',
    ].filter(Boolean);
    paragraphs.push(`${focus.join('; ')}.`);
  }
  if ((p.localNames ?? []).length) paragraphs.push(`Listings that cover 5 or fewer areas include ${join(p.localNames)}.`);
  if (p.withWebsite) paragraphs.push(`${n(p.withWebsite)} of the ${n(p.total)} listings link to their own website.`);
  // Where this service sits among all the supports listed in the suburb, and how the suburb compares with its closest neighbours.
  const supportsHere = (areaSupports ?? []).filter((s) => s && Number(s.count) > 0).sort((a, b) => b.count - a.count || String(a.category).localeCompare(String(b.category)));
  const own = supportsHere.find((s) => s.category === service);
  if (own && supportsHere.length > 1) {
    const position = 1 + supportsHere.filter((s) => s.count > own.count).length;
    const lead = supportsHere[0];
    paragraphs.push(`Register listings in ${suburbName} cover ${n(supportsHere.length)} different supports. ${service} is number ${n(position)} by listings${lead.category === service ? '' : `; the most listed is ${lowerFirst(lead.category)}, with ${n(lead.count)}`}.`);
  }
  const closest = (local?.nearby ?? []).slice(0, 6);
  const mineCount = rows.find((r) => r && r.slug === suburbSlug)?.count;
  if (closest.length >= 3 && mineCount) {
    const fewer = closest.filter((s) => s.count < mineCount).length;
    paragraphs.push(`${suburbName} has more ${lower} listings than ${fewer} of its ${n(closest.length)} closest suburbs.`);
  }

  const faqs = [];
  const mine = rows.find((r) => r.slug === suburbSlug);
  const rank = mine ? 1 + rows.filter((r) => r.count > mine.count).length : 0;
  faqs.push({
    question: `How many organisations list ${lower} in ${suburbName}?`,
    answer: `${plural(p.total, 'register listing', 'register listings')} for ${lower} cover ${suburbName}: ${registers}.${mine && rows.length > 1 ? ` Across ${stateName}, ${suburbName} is number ${n(rank)} of ${n(rows.length)} suburbs for ${lower} listings.` : ''}`,
  });
  const near = (local?.nearby ?? []).slice(0, 3);
  if (near.length) {
    faqs.push({
      question: `Which suburbs near ${suburbName} also list ${lower}?`,
      answer: `The closest are ${join(near.map((s) => `${s.suburb} (${plural(s.count, 'listing', 'listings')}, ${far(s.km)})`))}.`,
    });
  }
  if (tiers.length) {
    faqs.push({
      question: `Do organisations that list ${lower} in ${suburbName} only work locally?`,
      answer: `Not all of them. ${join(tiers).replace(/^./, (c) => c.toUpperCase())}.${moreThanOneState}`,
    });
  }
  if ((p.localNames ?? []).length) {
    faqs.push({
      question: `Which ${lower} listings in ${suburbName} cover only a few areas?`,
      answer: `${plural(p.reach?.local ?? 0, 'listing covers', 'listings cover')} 5 or fewer areas, including ${join(p.localNames)}.`,
    });
  }
  if (top.length) {
    faqs.push({
      question: `What else do ${lower} listings in ${suburbName} support?`,
      answer: `Listings that include ${lower} here also list ${join(top)}.`,
    });
  }
  const langs = (local?.languages ?? []).filter((l) => l && l.language && l.count > 0);
  if (langs.length) {
    faqs.push({
      question: `Do any ${lower} listings in ${suburbName} mention languages other than English?`,
      answer: `Some say on their own websites that they support ${join(langs.map((l) => `${l.language} (${plural(l.count, 'listing', 'listings')})`))}. Ask a provider directly to confirm.`,
    });
  }
  if (census) {
    faqs.push({ question: census.question, answer: census.answer });
    paragraphs.push(CENSUS_CREDIT);
  }
  return { analysis: { heading: `Who lists ${lower} in ${suburbName}`, paragraphs }, faqs };
}

/**
 * The "who is listed here" analysis and the questions and answers for a register suburb or state page (/ndis-providers/vic/preston,
 * /aged-care-providers/vic). `kind` is { register, plain }; `suburbName` is null on a state page; `local` is the AreaLocal from the API.
 * Every sentence comes from the listings in the area, so each page says something its neighbours do not.
 * Returns { analysis: { heading, paragraphs } | null, faqs: [{ question, answer }] }.
 */
export function registerAreaDetail(kind, areaName, stateName, suburbName, local) {
  const p = local?.profile;
  if (!p || !p.total) return { analysis: null, faqs: [] };
  const plain = kind.plain;
  const n = (x) => Number(x).toLocaleString('en-AU');
  const plural = (c, one, many) => `${n(c)} ${Number(c) === 1 ? one : many}`;
  const join = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0] ?? '');
  const far = (km) => (km < 1 ? 'under 1 km' : `about ${Math.round(km)} km`);
  const where = suburbName ?? stateName;

  const tiers = [
    [p.reach?.local, '5 or fewer areas'],
    [p.reach?.district, '6 to 25 areas'],
    [p.reach?.regional, '26 to 100 areas'],
    [p.reach?.wide, 'more than 100 areas'],
  ].filter(([c]) => c > 0).map(([c, label]) => `${n(c)} ${Number(c) === 1 ? 'covers' : 'cover'} ${label}`);
  const reach = `${join(tiers).replace(/^./, (c) => c.toUpperCase())}.${p.multiState > 0 && suburbName ? ` ${plural(p.multiState, 'is', 'are')} listed in more than one state.` : ''}`;
  const top = (p.topSupports ?? []).slice(0, 6).map((t) => `${lowerFirst(t.category)} (${n(t.count)} of ${n(p.total)})`);

  const paragraphs = [];
  const faqs = [];
  const census = censusDetail(where, stateName, local?.census);
  const near = (local?.nearby ?? []).slice(0, 4);
  const busiest = local?.busiest ?? [];

  if (suburbName) {
    if (local.rank) {
      const r = local.rank;
      paragraphs.push(`Among the ${n(r.of)} ${stateName} suburbs with ${plain} listings, ${suburbName} ${r.position === 1 ? 'is the busiest' : `is number ${n(r.position)}`}, with ${plural(p.total, 'listing', 'listings')}.${r.position === 1 ? '' : ` The most is ${r.top.suburb}, with ${n(r.top.count)}.`}`);
    }
    if (near.length) paragraphs.push(`The closest suburbs with ${plain} listings are ${join(near.map((s) => `${s.suburb} (${plural(s.count, 'listing', 'listings')}, ${far(s.km)})`))}.`);
  } else {
    paragraphs.push(`${plural(p.total, `${plain} provider is`, `${plain} providers are`)} listed for ${stateName}, spread across ${n(local.suburbsCovered)} suburbs that have their own page.${busiest.length ? ` The busiest are ${join(busiest.map((b) => `${b.suburb} (${n(b.count)})`))}.` : ''}`);
  }
  if (census) paragraphs.push(census.paragraph);
  if (tiers.length) paragraphs.push(`Reach varies. ${reach}`);
  if (top.length) paragraphs.push(`The supports listed most often are ${join(top)}.`);
  if (p.typicalSupports || p.specialists) {
    const focus = [
      p.typicalSupports ? `The typical listing here records ${plural(p.typicalSupports, 'support', 'supports')}` : '',
      p.specialists ? `${n(p.specialists)} of the ${n(p.total)} ${p.specialists === 1 ? 'records' : 'record'} only one` : '',
    ].filter(Boolean);
    paragraphs.push(`${focus.join('; ')}.`);
  }
  if ((p.localNames ?? []).length) paragraphs.push(`Listings that cover 5 or fewer areas include ${join(p.localNames)}.`);
  if (p.withWebsite) paragraphs.push(`${n(p.withWebsite)} of the ${n(p.total)} listings link to their own website.`);
  const langs = (local?.languages ?? []).filter((l) => l && l.language && l.count > 0);
  const langText = langs.length ? `Some listings say on their own websites that they support ${join(langs.map((l) => `${l.language} (${plural(l.count, 'listing', 'listings')})`))}.` : '';
  if (langText) paragraphs.push(langText);

  if (suburbName) {
    if (near.length) faqs.push({ question: `Which suburbs near ${suburbName} also have ${plain} providers?`, answer: `The closest are ${join(near.slice(0, 3).map((s) => `${s.suburb} (${plural(s.count, 'listing', 'listings')}, ${far(s.km)})`))}.` });
  } else if (busiest.length) {
    faqs.push({ question: `Which ${stateName} suburbs have the most ${plain} providers?`, answer: `${join(busiest.map((b) => `${b.suburb} (${n(b.count)})`))}.` });
  }
  if (top.length) faqs.push({ question: `What supports do ${plain} providers in ${where} list most often?`, answer: `${join(top.slice(0, 5))}.` });
  if (tiers.length) faqs.push({ question: `Do ${plain} providers in ${where} only work locally?`, answer: `Not all of them. ${reach}` });
  if (suburbName && (p.localNames ?? []).length) faqs.push({ question: `Which ${plain} listings in ${suburbName} cover only a few areas?`, answer: `${plural(p.reach?.local ?? 0, 'listing covers', 'listings cover')} 5 or fewer areas, including ${join(p.localNames)}.` });
  if (langText) faqs.push({ question: `Do any ${plain} listings in ${where} mention languages other than English?`, answer: `${langText} Ask a provider directly to confirm.` });

  if (census) {
    faqs.push({ question: census.question, answer: census.answer });
    paragraphs.push(CENSUS_CREDIT);
  }
  return { analysis: { heading: `Who is listed in ${where}`, paragraphs }, faqs };
}

export const REGISTER_CORRECTION = {
  schedule: 'We re-import the register every month.',
  response: 'We reply to every request within 5 business days.',
  individuals: 'If you are an individual, such as a sole trader, listed under your own name, you can ask us to change or remove that listing.',
};

/** The credit that must appear wherever ABS Census figures are shown (CC BY 4.0). */
export const CENSUS_CREDIT = 'Source: Australian Bureau of Statistics, 2021 Census of Population and Housing, General Community Profile (suburbs and localities). Licensed under Creative Commons Attribution 4.0 (CC BY 4.0). Percentages are calculated by SolDirectory.';

/** One paragraph and one question about a suburb's (or a state's) Census figures; null when there are none. */
function censusDetail(name, stateName, c) {
  if (!c || !c.population) return null;
  const n = (x) => Number(x).toLocaleString('en-AU');
  const pc = (x) => `${Number(x).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`;
  const needWhat = 'a core activity such as self-care, mobility or communication';
  if (c.level === 'state') {
    return {
      paragraph: `At the 2021 Census, ${name} had ${n(c.population)} residents. ${n(c.needHelp)} people (${pc(c.needHelpPct)}) reported needing help with ${needWhat}, compared with ${pc(c.australiaNeedHelpPct)} across Australia. ${pc(c.over65Pct)} were aged 65 or over (${pc(c.australiaOver65Pct)} across Australia).`,
      question: `How many people in ${name} need help with everyday activities?`,
      answer: `At the 2021 Census, ${n(c.needHelp)} people in ${name} (${pc(c.needHelpPct)}) reported needing help with ${needWhat}, compared with ${pc(c.australiaNeedHelpPct)} across Australia. This is a self-reported Census figure, not a count of NDIS participants.`,
    };
  }
  return {
    paragraph: `At the 2021 Census, ${name} had ${n(c.population)} residents${c.medianAge ? ` with a median age of ${c.medianAge}` : ''}. ${n(c.needHelp)} people (${pc(c.needHelpPct)}) reported needing help with ${needWhat}, compared with ${pc(c.stateNeedHelpPct)} across ${stateName}. ${pc(c.over65Pct)} were aged 65 or over (${pc(c.stateOver65Pct)} across ${stateName}).${c.medianWeeklyHouseholdIncome ? ` The median household income was $${n(c.medianWeeklyHouseholdIncome)} a week.` : ''}`,
    question: `How many people in ${name} need help with everyday activities?`,
    answer: `At the 2021 Census, ${n(c.needHelp)} people in ${name} (${pc(c.needHelpPct)}) reported needing help with ${needWhat}, compared with ${pc(c.stateNeedHelpPct)} across ${stateName}. This is a self-reported Census figure, not a count of NDIS participants.`,
  };
}

/** Lowercases the first letter only, so "Housing (SDA & SIL)" becomes "housing (SDA & SIL)" and keeps its acronyms. */
const lowerFirst = (s) => String(s ?? '').replace(/^./, (ch) => ch.toLowerCase());

export function serviceLocalSnapshot(service, suburbName, suburbSlug, stateName, rows) {
  const list = (rows ?? []).filter((r) => r && Number(r.count) > 0);
  const mine = list.find((r) => r.slug === suburbSlug);
  if (!mine || list.length < 2) return '';
  const n = (x) => Number(x).toLocaleString('en-AU');
  const rank = 1 + list.filter((r) => r.count > mine.count).length;
  const top = [...list].sort((a, b) => b.count - a.count || String(a.suburb).localeCompare(String(b.suburb)))[0];
  const lower = service.toLowerCase();
  const position = rank === 1
    ? `${suburbName} has the most ${lower} listings of the ${n(list.length)} ${stateName} suburbs we compare, with ${n(mine.count)}.`
    : `Of the ${n(list.length)} ${stateName} suburbs we compare, ${suburbName} is number ${n(rank)} for ${lower} listings, with ${n(mine.count)}. The most is ${top.suburb}, with ${n(top.count)}.`;
  return position;
}

export function registerAreaFaqs(kind, areaName, total) {
  const count = Number(total) || 0;
  return [
    {
      question: `What does it mean to be listed on the ${kind.register}?`,
      answer: `It means the organisation appears on the official public list. A listing shows what the provider is registered for and where. It is not a recommendation or a rating of quality.`,
    },
    {
      question: `Does a listing mean a provider has room to start now?`,
      answer: `No. A register listing does not show whether a provider has capacity, what it charges or whether it suits your needs. Providers who have joined SolDirectory confirm each week whether they are taking new people. For anyone else, ask the provider directly.`,
    },
    {
      question: `How do I check a provider's registration?`,
      answer: `Search the official register at ${kind.officialName} (${kind.officialUrl}), and ask the provider for its registration details and how its workers are screened before you agree to anything.`,
    },
    {
      question: `How many ${kind.plain} providers are listed for ${areaName}?`,
      answer: `${count.toLocaleString('en-AU')} ${count === 1 ? 'provider is' : 'providers are'} listed on the ${kind.register} for ${areaName} at the latest import. The register changes, so confirm a provider's current status before relying on it.`,
    },
  ];
}

export function metaDescription(text, max = 160, min = 0) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const closing = ' Compare providers and questions to ask on SolDirectory.';
  // A short but finished sentence gets one plain closing sentence so the snippet is not a bare fragment.
  const finish = (sentence) => (sentence.length < min && sentence.length + closing.length <= max ? `${sentence}${closing}` : sentence);
  if (clean.length <= max) return finish(/[.!?]$/.test(clean) ? clean : `${clean}.`);
  const firstSentence = /^(.{40,}?[.!?])(\s|$)/.exec(clean);
  if (firstSentence && firstSentence[1].length <= max) return finish(firstSentence[1]);
  const window = clean.slice(0, max - 1);
  const cut = Math.max(window.lastIndexOf(','), window.lastIndexOf(';'), window.lastIndexOf(':'));
  if (cut >= 40) {
    const head = window.slice(0, cut).replace(/\s+(for example|such as|including|and|or|but|where|which|that|so|to|with|as|by|in|of)$/i, '').replace(/[\s,;:]+$/, '');
    if (head.length >= 40) return finish(`${head}.`);
  }
  return `${window.replace(/\s+\S*$/, '').replace(/[\s,;:.]+$/, '')}…`;
}

export function fundingShellEditorial(topic) {
  // "Help With Funding" topics (plan managers, price guide, eligibility, budget categories, bookkeeping) explain how
  // funding works; they are not a scheme a person is approved under, so the scheme-style questions would read as nonsense.
  const informational = topic.categoryGroup === 'Help With Funding';
  const lower = topic.name.toLowerCase();
  const detail = FUNDING_DETAILS[topic.categoryGroup];
  const own = fundingTopicContent(topic.slug);
  return {
    overview: FUNDING_GUIDES[topic.categoryGroup],
    summary: own ? own.summary : [],
    keyPoints: own ? own.keyPoints : [],
    checks: [
      informational
        ? 'Confirm how this applies to the person’s own plan, what it does and does not cover, and who is responsible for each part.'
        : `Confirm with the responsible funding body whether ${lower} applies to the person and proposed support.`,
      'Ask the provider to explain its role, approval requirements, billing process and full fees in writing.',
      'Check travel, cancellations, reports, administration, equipment, personal contributions and possible gaps.',
      'Keep approvals, service agreements, invoices and statements, and review them when circumstances or program rules change.',
    ],
    ...detail,
    steps: own ? own.steps : [],
    faq: fundingFaqs(topic),
  };
}

export function languageShellEditorial(topic) {
  const agencies = languageResourceAgencies(topic.slug);
  // Only the languages the NDIS and My Aged Care themselves publish in have this; see languageResources.js.
  const official = LANGUAGE_RESOURCES[topic.slug]
    ? [{
      question: `Is there official information in ${topic.name}?`,
      answer: `Yes. ${agencies.replace(/^the /, 'The ')} ${agencies.includes(' and ') ? 'publish' : 'publishes'} information in ${topic.name}. The links are on this page, and they are written by the agencies themselves, not by SolDirectory.`,
    }]
    : [];
  // "Access & Interpreting" topics (TIS National bookings, Easy Read, translated documents, Deafblind interpreters) are
  // services and formats, not a language a worker speaks, so they get their own questions.
  if (topic.categoryGroup === 'Access & Interpreting') {
    return {
      overview: `${topic.name} is about how information and interpreting are arranged around support. It is not a language a worker speaks. A provider listing is only a starting point. Confirm who arranges the service, how it is booked and paid for, and how it will work for the person.`,
      checks: [
        `Ask who arranges and books ${topic.name} for the person, and who pays for it.`,
        'Confirm which information needs to be accessible (spoken, signed, written, Easy Read) and by when.',
        'Ask when a qualified independent interpreter or translator will be used instead of a family member or a bilingual worker.',
        'Check current availability, funding, privacy and the written service agreement.',
      ],
      faq: [
        ...official,
        { question: `Does a listing prove that a provider can arrange ${topic.name}?`, answer: 'No. Providers supply their own information. Confirm what they can arrange, how it is booked and who pays before support begins.' },
        { question: 'Is a bilingual worker the same as an accredited interpreter?', answer: 'No. A bilingual worker may communicate directly during support, while an accredited interpreter has a separate interpreting role. Ask what is appropriate for important, technical or consent-related discussions.' },
      ],
    };
  }
  return {
    overview: `Support connected with ${topic.name} can make it easier to explain preferences, understand choices and take part in decisions. A provider listing is only a starting point. Confirm who communicates in ${topic.name}, how fluent they are and whether an accredited interpreter is needed.`,
    checks: [
      `Ask whether the allocated worker communicates in ${topic.name}, rather than relying on the organisation having one multilingual staff member.`,
      'Confirm spoken, signed, written and Easy Read needs separately, including preferred dialect, terminology and communication aids.',
      'Ask when a qualified independent interpreter will be used and who books and pays for that service.',
      'Check current availability, qualifications, worker screening, fees, funding, privacy and the written service agreement.',
    ],
    faq: [
      ...official,
      { question: `Does a listing prove that every worker speaks or uses ${topic.name}?`, answer: 'No. Providers supply their own language information. Confirm the specific worker, fluency, dialect and communication method before support begins.' },
      { question: 'Is a bilingual worker the same as an accredited interpreter?', answer: 'No. A bilingual worker may communicate directly during support, while an accredited interpreter has a separate interpreting role. Ask what is appropriate for important, technical or consent-related discussions.' },
    ],
  };
}
export { relatedArticles, relatedToArticle } from './blogRelated.js';
