/**
 * Reading copy for the hub and landing pages: what each page is, how to use it, and the questions people ask. One copy,
 * used in two places: the website renders it (HubReading, or the page's own extras for the pages that already have them)
 * and the server writes the same words into the HTML that search engines and link previews receive.
 *
 * Statements here restate what the site's own articles say (each written from the official page it cites), or describe
 * how this site works. Nothing that changes often is stated as a figure.
 *
 * Shape: hubCopy(path) -> { sections: [{ heading, paragraphs?, list?, links? }], faqs?: [{ question, answer }] }
 *   list items:  { text, to?, label? }   (to + label make the item a link)
 *   links:       { to, label }[]          (a row of "go next" links under the section)
 */
import { EDITORIAL_BLOG_POSTS } from './blog.js';
import {
  DIRECTORY_FAQS, DIRECTORY_STEPS, LOCATION_FAQS, STATE_CENTRES,
  PROVIDER_UNDERSTAND, PROVIDER_REACH, PROVIDER_STEPS, PROVIDER_PATHS, PROVIDER_SAFEGUARDS, PROVIDER_LISTING_CHECKS, PROVIDER_PLANS, PROVIDER_FAQS, PROVIDER_PAGE_GUIDES,
  WORKER_PROFILE_DETAILS, WORKER_HOW_IT_WORKS, WORKER_SAFEGUARDS, WORKER_SETUP_STEPS, INDEPENDENT_WORKER_FAQS, WORKER_PAGE_GUIDES,
} from './pageContent.js';

const blog = (slug) => `/blog/${slug}`;

/** Two kinds of listing, shown on /find-a-provider (and in its static copy). */
export const DIRECTORY_KINDS = {
  member: {
    title: 'SolDirectory members',
    body: 'Providers who have joined, keep their own profile and confirm each week that they are taking referrals. You can view the profile and use Get matched to reach members who may be able to help.',
  },
  register: {
    title: 'Public register listings',
    body: 'Organisations that appear on the public NDIS or My Aged Care registers, shown as those registers publish them. They are useful for finding out who operates near you, but they are not a statement about availability or quality.',
  },
  note: 'Neither kind is an endorsement. Check any provider against your own needs, and confirm registration with the NDIS Quality and Safeguards Commission.',
};

const articleLinks = (slugs) => slugs
  .map((slug) => EDITORIAL_BLOG_POSTS.find((p) => p.slug === slug))
  .filter(Boolean)
  .map((p) => ({ text: p.summary, to: blog(p.slug), label: p.title }));

const qa = (list) => list.map((f) => ({ question: f.question, answer: f.answer }));

const HOME = {
  sections: [
    {
      heading: 'What SolDirectory is',
      paragraphs: [
        'SolDirectory is an independent directory and enquiry service for people looking for disability and aged care support in Australia. You can search provider profiles by support and place, look at who is listed on the public NDIS and My Aged Care registers, or send one request that suitable providers can respond to.',
        'It is not a government service. It does not make decisions about anyone’s plan, funding or eligibility, and a listing in the directory is not an endorsement of a provider.',
      ],
    },
    {
      heading: 'How it works',
      list: [
        { text: 'Tell us what support you need and where. A short request is enough, and it is free to send.' },
        { text: 'Providers whose service areas, funding types and confirmed capacity fit the request can review it and respond through SolDirectory.' },
        { text: 'You compare the responses and decide whether to go ahead. You are never obliged to use a provider that replies.' },
      ],
    },
    {
      heading: 'Who it is for',
      list: [
        { text: 'Participants, families and carers comparing providers for NDIS or aged care support.', to: '/find-a-provider', label: 'Find a provider' },
        { text: 'Support coordinators and plan managers who need to find who is working in an area.', to: '/support-coordinators', label: 'For support coordinators' },
        { text: 'Providers who want relevant enquiries from people in their service areas.', to: '/providers', label: 'List your business' },
        { text: 'Independent support workers who want a professional profile eligible organisations can find.', to: '/independent-workers', label: 'Independent workers' },
      ],
    },
    {
      heading: 'Reading that helps you decide',
      paragraphs: [
        'Our guides explain how funding, pricing, registration and rights work, written from the official pages and checked against them. They are general information rather than advice about a particular plan.',
      ],
      links: [
        { to: '/guides', label: 'Guides' },
        { to: '/blog', label: 'Updates and insights' },
        { to: '/glossary', label: 'Glossary' },
        { to: '/editorial-standards', label: 'How we write and check our guides' },
      ],
    },
  ],
  faqs: [
    { question: 'Is it free to use SolDirectory?', answer: 'Searching is free, and so is sending a request for matched providers. Families, participants and coordinators are not charged to search or to send an enquiry.' },
    { question: 'Does a provider on SolDirectory have capacity for me?', answer: 'Not necessarily. A register listing shows what the public register says, not who is taking new people. Member providers confirm each week whether they are taking referrals, and Get matched sends your request to members whose areas and capacity fit.' },
    { question: 'Is SolDirectory part of the NDIS or My Aged Care?', answer: 'No. SolDirectory is an independent directory. For decisions about a plan, funding or eligibility, contact the NDIA, My Aged Care or your plan manager or support coordinator.' },
    { question: 'Where does the register information come from?', answer: 'From the public NDIS Quality and Safeguards Commission provider register and the My Aged Care register, imported at a point in time. It can lag behind the live registers, so confirm details with the provider and the official register.' },
    { question: 'Can I trust the guides?', answer: 'Each guide names the official page it is based on, shows when that page was last checked, and says what to confirm for your own plan. Our editorial standards page explains how they are written.' },
  ],
};

const FIND_A_PROVIDER = {
  sections: [
    {
      heading: 'Four steps to a provider you can trust',
      list: DIRECTORY_STEPS.map((s) => ({ text: s.body, ...(s.link ? { to: s.link.to, label: s.link.label } : {}), title: s.title })),
    },
    {
      heading: 'Two kinds of listing, explained',
      paragraphs: [`${DIRECTORY_KINDS.member.title}: ${DIRECTORY_KINDS.member.body}`, `${DIRECTORY_KINDS.register.title}: ${DIRECTORY_KINDS.register.body}`, DIRECTORY_KINDS.note],
    },
    {
      heading: 'Read before you choose',
      list: articleLinks([
        'how-to-choose-an-ndis-provider-questions-to-ask',
        'registered-or-unregistered-ndis-provider-what-it-means',
        'ndis-service-agreement-what-to-check-before-you-sign',
      ]),
    },
    {
      heading: 'Search the public register by state',
      links: [
        { to: '/ndis-providers', label: 'NDIS provider register' },
        { to: '/aged-care-providers', label: 'My Aged Care register' },
        { to: '/locations', label: 'Browse all locations' },
      ],
    },
  ],
  faqs: qa(DIRECTORY_FAQS),
};

const LOCATIONS = {
  sections: [
    {
      heading: 'Start with the suburb where support is needed',
      paragraphs: [
        'Providers may work from a nearby suburb and travel across a wider service area, so search the exact suburb first and then broaden to the nearest city or state if you need more options. Each result shows what the provider says it offers and where it works.',
      ],
    },
    {
      heading: 'Every state and territory',
      list: STATE_CENTRES.map((s) => ({ text: `${s.capital}${s.centres.length ? `, ${s.centres.join(', ')}` : ''}.`, title: s.code })),
    },
    {
      heading: 'Guides about finding support in a particular kind of place',
      list: articleLinks([
        'finding-ndis-supports-in-regional-and-remote-areas',
        'moving-to-a-new-town-or-state-with-the-ndis',
        'registered-or-unregistered-ndis-provider-what-it-means',
        'ndis-service-agreement-what-to-check-before-you-sign',
      ]),
    },
  ],
  faqs: qa(LOCATION_FAQS),
};

const NDIS_PROVIDERS = {
  sections: [
    {
      heading: 'What the NDIS provider register is',
      paragraphs: [
        'The NDIS Quality and Safeguards Commission publishes a register of providers that have been approved to deliver NDIS supports. This directory shows those listings by state, suburb and type of support, as the register publishes them, so you can see who is registered near you.',
      ],
    },
    {
      heading: 'What a registered listing tells you',
      paragraphs: [
        'A registered provider has applied to the Commission, been audited against the relevant NDIS Practice Standards, been assessed as suitable (along with its key personnel) and been issued a certificate of registration. Registration is generally for three years. A listing shows the groups of supports a provider is registered for.',
        'It does not tell you whether a provider has a worker free on the days you need, what it charges, whether it is taking new participants, or whether it is the right fit for you. Compare providers on the things that matter to you, and ask them directly.',
      ],
    },
    {
      heading: 'How to use the register well',
      list: [
        { text: 'Choose your state, then your suburb, and narrow by the type of support you need.' },
        { text: 'Open the listing and note the registered support groups and where the provider works.' },
        { text: 'Confirm the provider’s current status on the Commission’s official register before you rely on it.' },
        { text: 'Contact two or three providers and ask each the same questions.', to: blog('how-to-choose-an-ndis-provider-questions-to-ask'), label: '12 questions to ask a provider' },
        { text: 'Put the arrangement in writing before support starts.', to: blog('ndis-service-agreement-what-to-check-before-you-sign'), label: 'What to check in a service agreement' },
      ],
    },
    {
      heading: 'When you need a registered provider',
      paragraphs: [
        'Some supports can only be delivered by registered providers, including specialist disability accommodation, supported independent living, plan management and supports for participants whose funding is managed by the NDIA. Only participants who self-manage or plan-manage can choose to use unregistered providers for supports that do not require registration.',
      ],
      links: [{ to: blog('registered-or-unregistered-ndis-provider-what-it-means'), label: 'Registered or unregistered providers' }],
    },
  ],
  faqs: [
    { question: 'Does being on the register mean a provider has capacity?', answer: 'No. Registration is about regulation and oversight. It does not show whether a provider has a worker free, offers the support in your area or is taking new participants.' },
    { question: 'How do I check that a provider is registered?', answer: 'Search the NDIS Provider Register published by the NDIS Quality and Safeguards Commission. Compare the name and the registered support types with what the provider tells you, and ask for their ABN if you are unsure.' },
    { question: 'How current is the information on these pages?', answer: 'Listings are imported from the public register at a point in time and can lag behind the live register. Treat them as a starting point and confirm details with the provider and the official register.' },
    { question: 'Why can I not find a provider I know?', answer: 'The provider may be unregistered, may be registered under a different legal name, or may have registered since the last import. Try the provider’s legal name and your suburb, and check the official register.' },
    { question: 'Can I use a provider that is not on the register?', answer: 'It depends on how your plan is managed and on the support you need. Some supports can only be delivered by registered providers. Confirm the position for your own plan with your plan manager, support coordinator or the NDIA.' },
  ],
};

const AGED_CARE_PROVIDERS = {
  sections: [
    {
      heading: 'What the aged care register shows',
      paragraphs: [
        'This directory lists providers from the public My Aged Care register, by state, suburb and type of care, as the register publishes them. It is a way to see who operates near you before you contact anyone.',
        'My Aged Care also has its own Find a provider tool, which lists providers of government-funded aged care by place and type of care and, for aged care homes, shows Star Ratings and information about prices.',
      ],
    },
    {
      heading: 'How aged care support is arranged',
      list: [
        { text: 'An aged care assessment works out which government-funded services you are eligible for. It is the gateway to most government-funded aged care.', to: blog('getting-an-aged-care-assessment-what-to-expect'), label: 'What to expect from an assessment' },
        { text: 'Support at Home helps older people keep living at home. When funding is available you choose a provider and agree a service agreement.', to: blog('support-at-home-explained-how-in-home-aged-care-works'), label: 'Support at Home explained' },
        { text: 'What you pay depends on the type of help, the provider, your finances and the services you use.', to: blog('aged-care-costs-what-you-may-be-asked-to-contribute'), label: 'Aged care costs' },
      ],
    },
    {
      heading: 'Choosing between providers or homes',
      paragraphs: [
        'Star Ratings give each aged care home between one and five stars, built from residents’ experience, compliance with the standards, staffing and quality measures. They are a useful way to compare homes quickly, but visit more than once and at different times of day, and weigh fit as well as rating: location, language, culture, food and privacy.',
      ],
      links: [
        { to: blog('choosing-an-aged-care-provider-or-home-what-to-compare'), label: 'Choosing an aged care provider or home' },
        { to: blog('aged-care-rights-and-making-a-complaint'), label: 'Aged care rights and complaints' },
      ],
    },
    {
      heading: 'NDIS or aged care?',
      paragraphs: [
        'The NDIS and My Aged Care are separate systems with separate rules, and the same support cannot be funded by both. If you are unsure which applies, contact both and keep notes of what you are told.',
      ],
      links: [{ to: blog('ndis-or-my-aged-care-which-system-supports-you'), label: 'NDIS or My Aged Care?' }],
    },
  ],
  faqs: [
    { question: 'Do I need an assessment before choosing an aged care provider?', answer: 'For most government-funded aged care, yes: the assessment works out which services you are eligible for. You can look at providers while you wait, but the services you can receive depend on the outcome.' },
    { question: 'What are Star Ratings?', answer: 'Star Ratings give each aged care home between one and five stars, built from four areas: residents’ experience, compliance with the standards, staffing and quality measures. A low compliance rating limits the overall rating.' },
    { question: 'What is Support at Home?', answer: 'The Australian Government program that helps older people keep living at home with services and equipment. It began in November 2025 and replaced the Home Care Packages Program and the Short-term Restorative Care Programme.' },
    { question: 'Does a listing show whether a provider has vacancies?', answer: 'No. A register listing shows what the register says, not availability. Contact the provider to ask about capacity, start dates and what it would cost for the services you expect to use.' },
    { question: 'Where can I raise a concern about a provider?', answer: 'Raise it with the provider first where you feel able to. There are separate routes for concerns about providers, assessments, costs and elder abuse, and independent aged care advocates can help for free.' },
  ],
};

const GUIDES = {
  sections: [
    {
      heading: 'How to use these guides',
      paragraphs: [
        'Start with the decision in front of you, then open the official source linked from the guide. Funding rules, program names, price limits and assessment pathways change, so the guides explain how things work and send you to the official page for the current detail.',
        'They are general information. They can help you prepare questions, but they cannot decide a person’s eligibility, budget, clinical needs or legal rights.',
      ],
    },
    {
      heading: 'Where to start, by situation',
      list: [
        { text: 'You are comparing providers.', to: blog('how-to-choose-an-ndis-provider-questions-to-ask'), label: '12 questions to ask before you commit' },
        { text: 'You are deciding how your funding is managed.', to: blog('self-managed-plan-managed-or-ndia-managed-how-to-decide'), label: 'Self-managed, plan-managed or NDIA-managed' },
        { text: 'You are preparing for a plan review.', to: blog('how-to-prepare-for-an-ndis-plan-review'), label: 'How to prepare for a plan review' },
        { text: 'You have a new plan.', to: blog('your-first-month-with-a-new-ndis-plan'), label: 'Your first month with a new plan' },
        { text: 'You are looking at aged care.', to: blog('support-at-home-explained-how-in-home-aged-care-works'), label: 'Support at Home explained' },
        { text: 'You are a worker or provider.', to: '/blog', label: 'Guides for workers and providers' },
      ],
    },
    {
      heading: 'Where the information comes from',
      paragraphs: [
        'Each guide names the official page it is based on, and articles show when their source was last checked. Our editorial standards explain how guides are written and checked, and how to tell us about a mistake.',
      ],
      links: [{ to: '/editorial-standards', label: 'Editorial standards' }, { to: '/glossary', label: 'Glossary' }],
    },
  ],
  faqs: [
    { question: 'Are the guides advice?', answer: 'No. They are general information to help you prepare questions. Confirm anything that affects your plan with your plan manager, support coordinator, the NDIA or another responsible agency.' },
    { question: 'How often are the guides checked?', answer: 'Articles show the date their source was last checked. Guidance changes, so if something looks out of date, check the official page and tell us.' },
    { question: 'Why do guides not quote prices or thresholds?', answer: 'Because they change. Where we can, we explain how something works and link to the official page that holds the current figure, so you are not relying on a number that has moved.' },
  ],
};

const FUNDING = {
  sections: [
    {
      heading: 'How NDIS funding is managed',
      paragraphs: [
        'NDIS funding can be managed by the NDIA, by a plan manager, or by you. Which applies is recorded in your plan and can differ between parts of it. It affects who pays providers, how you track your budget and which providers you can use.',
      ],
      list: [
        { text: 'NDIA-managed: providers claim directly from the NDIA. Least paperwork for you, but you are generally limited to registered providers.' },
        { text: 'Plan-managed: a plan manager pays invoices and keeps your budget statements. A good balance of choice and admin.', to: blog('what-does-an-ndis-plan-manager-do-and-how-to-choose-one'), label: 'What a plan manager does' },
        { text: 'Self-managed: you pay providers, keep records and claim. The most choice and the most responsibility.', to: blog('self-managed-plan-managed-or-ndia-managed-how-to-decide'), label: 'How to decide' },
      ],
    },
    {
      heading: 'How budgets are grouped',
      paragraphs: [
        'NDIS budgets have traditionally been grouped into Core supports for everyday help, Capacity Building supports for skills and independence, and Capital supports for equipment, modifications and housing. The NDIA has been changing how budgets are described in some plans, so check what your own plan says.',
      ],
      links: [{ to: blog('ndis-core-capacity-building-and-capital-supports-explained'), label: 'Core, Capacity Building and Capital supports' }],
    },
    {
      heading: 'Aged care funding',
      paragraphs: [
        'Aged care funding works differently. Support at Home began in November 2025 and replaced the Home Care Packages Program and the Short-term Restorative Care Programme, and the Commonwealth Home Support Program has its own fee arrangements. What you contribute depends on the program, the provider and your circumstances.',
      ],
      links: [
        { to: blog('support-at-home-explained-how-in-home-aged-care-works'), label: 'Support at Home explained' },
        { to: blog('aged-care-costs-what-you-may-be-asked-to-contribute'), label: 'Aged care costs' },
      ],
    },
    {
      heading: 'Keeping track',
      paragraphs: [
        'Whatever the funding, records matter: your plan, service agreements, invoices, statements and reports. A simple folder with a few sections is enough, and it makes plan reviews and queried claims much easier.',
      ],
      links: [{ to: blog('keeping-records-of-your-ndis-supports-a-simple-system'), label: 'Keeping records of your supports' }],
    },
  ],
  faqs: [
    { question: 'Which funding management type is best?', answer: 'It depends on how much time you have for paperwork, how important choice of provider is, and how much risk of an error you are comfortable carrying. Many people who want flexibility without the admin choose a plan manager.' },
    { question: 'Can I change how my funding is managed?', answer: 'Which management type applies is recorded in your plan. Ask your planner, plan manager or support coordinator what the current process is for changing it in your case.' },
    { question: 'Can the same support be funded by the NDIS and aged care?', answer: 'No. The two systems are not designed to pay for the same support. A support coordinator, the NDIA or My Aged Care can explain which system is responsible for a particular support.' },
    { question: 'Where do I find current price limits?', answer: 'On the NDIA’s pricing arrangements page, which publishes the pricing schedules. The maximum prices apply to NDIA-managed and plan-managed participants.' },
  ],
};

const PROVIDERS = {
  sections: [
    { heading: 'Understand provider enquiries', paragraphs: ['An enquiry is a request for information about support. It is not an exclusive referral, a confirmed client or a service booking. Review the process and plan inclusions before subscribing.'], list: PROVIDER_UNDERSTAND.map((c) => ({ text: c.body, title: c.title })) },
    { heading: 'How enquiries reach you', list: PROVIDER_REACH.map((c) => ({ text: c.body, title: c.title })) },
    { heading: 'How it works', paragraphs: ['Complete your profile and tell us where you have capacity. Listing does not guarantee enquiries: matching depends on demand and how closely your profile fits what people are searching for.'], list: PROVIDER_STEPS.map((c) => ({ text: c.body, title: c.title })) },
    {
      heading: 'Free listing, or Growth',
      paragraphs: ['A Starter listing provides directory visibility and limited enquiry information. Growth adds contact access and a monthly lead allowance.'],
      list: [
        { text: PROVIDER_PLANS.starter.features.join('; ') + '.', title: `${PROVIDER_PLANS.starter.name}: ${PROVIDER_PLANS.starter.price}` },
        { text: PROVIDER_PLANS.growth.features.join('; ') + '.', title: `${PROVIDER_PLANS.growth.name}: ${PROVIDER_PLANS.growth.price}` },
      ],
    },
    { heading: 'What a strong listing includes', list: PROVIDER_LISTING_CHECKS.map((c) => ({ text: c.body, title: c.title })) },
    { heading: 'Three ways providers work', list: PROVIDER_PATHS.map((p) => ({ text: p.body, title: p.title, to: p.link.to, label: p.link.label })) },
    { heading: 'The expectations behind a good listing', list: PROVIDER_SAFEGUARDS.map((p) => ({ text: p.body, title: p.title, to: p.link.to, label: p.link.label })) },
    { heading: 'Guides for running a provider business', list: articleLinks(PROVIDER_PAGE_GUIDES) },
  ],
  faqs: qa(PROVIDER_FAQS),
};

const INDEPENDENT_WORKERS = {
  sections: [
    {
      heading: 'Help organisations understand how you can contribute',
      paragraphs: ['Keep structured information about your work preferences and professional background. Organisations remain responsible for their own recruitment, screening and engagement decisions.'],
      list: WORKER_PROFILE_DETAILS.map(([title, body]) => ({ text: body, title })),
    },
    {
      heading: 'From registration to professional contact',
      paragraphs: ['SolDirectory provides the profile and search tools. Any engagement is arranged directly between you and the organisation contacting you.'],
      list: WORKER_HOW_IT_WORKS.map(([title, body]) => ({ text: body, title })),
    },
    { heading: 'Checks and arrangements remain important', list: WORKER_SAFEGUARDS.map((text) => ({ text })) },
    { heading: 'Six things to settle before your first shift', list: WORKER_SETUP_STEPS.map((s) => ({ text: s.body, title: s.title, to: s.link.to, label: s.link.label })) },
    { heading: 'Guides for independent workers', list: articleLinks(WORKER_PAGE_GUIDES) },
    {
      heading: 'Looking for a worker rather than offering work?',
      paragraphs: ['This page is for workers. Participants and families can search the public directory, send one request to matched providers, and read what to ask before choosing.'],
      links: [{ to: '/find-a-provider', label: 'Find a provider' }, { to: blog('questions-to-ask-an-independent-ndis-support-worker'), label: 'Questions to ask a worker' }],
    },
  ],
  faqs: qa(INDEPENDENT_WORKER_FAQS),
};

const COPY = {
  '/': HOME,
  '/find-a-provider': FIND_A_PROVIDER,
  '/locations': LOCATIONS,
  '/ndis-providers': NDIS_PROVIDERS,
  '/aged-care-providers': AGED_CARE_PROVIDERS,
  '/guides': GUIDES,
  '/funding': FUNDING,
  '/providers': PROVIDERS,
  '/independent-workers': INDEPENDENT_WORKERS,
};

/** The reading copy for a hub or landing page, by its path, or null when the page has none. */
export function hubCopy(path) {
  const key = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return COPY[key] ?? null;
}
