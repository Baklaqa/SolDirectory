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
