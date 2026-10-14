/**
 * Page copy shared by the website and the build step that writes each page's static HTML, so the questions people read
 * on the page are the same ones crawlers and link previews see (and the FAQ markup is built from this one copy).
 */

/** Questions on /independent-workers. */
export const INDEPENDENT_WORKER_FAQS = [
  {
    question: 'Who can create an independent worker profile?',
    answer: 'Support workers, nurses and allied health assistants who work independently can register. You are responsible for holding the checks, qualifications, insurance and registrations required for the supports you offer.',
  },
  {
    question: 'Does SolDirectory employ independent workers?',
    answer: 'No. SolDirectory is an independent directory and connection service. It does not employ workers, set employment conditions, supervise support delivery or act as a registered NDIS provider.',
  },
  {
    question: 'Does a profile guarantee work?',
    answer: 'No. A profile makes your information searchable to eligible organisations using the worker directory. Contact, engagement and ongoing work depend on each organisation’s requirements and your suitability and availability.',
  },
  {
    question: 'What should I confirm before accepting work?',
    answer: 'Confirm the support requirements, role expectations, location, schedule, rate, insurance arrangements, service agreement and whether the engagement is employment or independent contracting. Obtain professional advice if you are unsure.',
  },
  {
    question: 'Can participants use this page to hire a worker directly?',
    answer: 'This page is for worker registration. Access to worker profiles is currently available to authorised organisations through the worker directory. Participants and representatives can use the public provider directory or submit a provider enquiry request.',
  },
  {
    question: 'Do I need an ABN to work independently?',
    answer: 'Working independently usually means invoicing under your own Australian Business Number, but not everyone is entitled to one, and applying when you are not can have serious consequences. Read the Australian Business Register’s guidance and our guide to ABN, tax and insurance, and ask a registered tax agent if you are unsure.',
  },
  {
    question: 'Do I need an NDIS Worker Screening Check?',
    answer: 'It depends on who engages you. Registered providers must have workers in risk-assessed roles screened. Unregistered providers and self-managed or plan-managed participants can choose to require one, and some self-employed workers need one themselves. Ask the person or organisation engaging you before you apply, because a check costs money.',
  },
  {
    question: 'Do I have to be registered with the NDIS Commission?',
    answer: 'Not to work as an individual delivering supports that do not require registration for participants who self-manage or plan-manage. Some supports can only be delivered by registered providers, and if you work under another provider’s registration, that provider is responsible for the supports and for claiming payment. Our guide to registered and unregistered paths explains the difference.',
  },
  {
    question: 'Am I a contractor or an employee?',
    answer: 'That depends on how the arrangement really works, not on what it is called. The Fair Work Ombudsman lists factors such as control, financial risk, equipment and whether you can send someone else. Our guide sets out the questions to ask before you agree, and legal advice is the safe way to be sure.',
  },
  {
    question: 'How do I set my rates?',
    answer: 'NDIA price limits apply to NDIA-managed and plan-managed participants and are a ceiling, not a target. Work out what your rate has to cover, such as tax, super, insurance, travel and unpaid time, and be ready to justify it, because the Code of Conduct expects fair pricing.',
  },
  {
    question: 'What records should I keep?',
    answer: 'A written service agreement, short factual notes for each shift, a written process for incidents, and invoices that match what you delivered. Keep them private and secure, and ask the people you work for how long they expect them to be kept.',
  },
  {
    question: 'Which guides should I read first?',
    answer: 'Start with setting up as an independent worker, then worker screening, the Code of Conduct and your rates. All are in the guides section of this page, with links to the official pages they rely on.',
  },
];

/** /independent-workers: one title, description and set of hero points for the page and its crawler HTML. */
export const WORKER_PAGE_TITLE = 'Independent support workers | SolDirectory';
export const WORKER_PAGE_DESCRIPTION = 'Create an independent worker profile with services, experience, location and availability so eligible organisations can assess suitable opportunities.';
export const WORKER_PAGE_UPDATED = '2026-10-13';
export const WORKER_HERO_CHECKS = [
  'One profile for your services and availability',
  'Eligible organisations search and contact you',
  'No guarantee of work: you choose what to accept',
];

/** The date /providers guidance last changed (used for dateModified in the page's structured data). */
export const PROVIDER_PAGE_UPDATED = '2026-10-13';

/** The search-result description for /providers (the page and its crawler HTML both use it). */
export const PROVIDER_PAGE_DESCRIPTION = 'Create or claim a free provider profile, set your service areas and capacity, and review relevant NDIS and aged care enquiries from people in your area.';

/** Questions on /providers. */
export const PROVIDER_FAQS = [
  {
    question: 'How do I list my NDIS provider business on SolDirectory?',
    answer: 'Find your business in the directory and claim it, or create a new listing. Claiming is free. Then set the suburbs you cover, the supports you offer and where matches should be sent: email, SMS or both. When an enquiry fits your profile, your team can review it and decide whether to respond.',
  },
  {
    question: 'What should an NDIS provider profile include?',
    answer: 'The supports you actually deliver, the suburbs you cover, the funding arrangements you work with, your registration status, your current capacity and a way to reach you that is checked every day. Matching compares enquiries with these details, so accuracy saves your team time.',
  },
  {
    question: 'Is a lead the same as a booked client?',
    answer: 'No. A lead is an enquiry from someone looking for support in your area. Several matched providers can see the same enquiry, and the person decides who to contact back. We do not guarantee a booking, a response, or a fixed volume of enquiries.',
  },
  {
    question: 'Do I need to be NDIS registered?',
    answer: 'No, but your registration status is shown on your listing and some participants specifically search for registered providers. Unregistered providers can still list and be matched to self-managed or plan-managed enquiries.',
  },
  {
    question: 'How much does it cost?',
    answer: 'Claiming and verifying your listing is free. The Growth plan is a flat monthly subscription that includes a set number of lead unlocks — see the comparison below for current pricing and inclusions.',
  },
  {
    question: 'Will listing guarantee me new clients?',
    answer: 'No directory can guarantee that. Enquiry volume depends on demand in your service area, your capacity, and how complete your profile is. We only ask that your service area, funding types and contact details are accurate.',
  },
  {
    question: 'Can I cancel any time?',
    answer: 'Yes. Growth is billed monthly with no lock-in contract — cancel from your dashboard whenever you like and you will not be billed again for the next cycle.',
  },
  {
    question: 'How do participants find me?',
    answer: 'Participants and support coordinators search the public directory by suburb, service type and funding, or submit a "Get matched" request that we compare against your listed service areas and confirmed capacity.',
  },
  {
    question: 'Can I list if I am registered for only some supports?',
    answer: 'Yes. State the supports you are registered for and the supports you deliver. People compare listings on exactly that, so a precise profile helps the right enquiries reach you.',
  },
  {
    question: 'What does the NDIS Commission expect of registered providers?',
    answer: 'Registered providers are audited against the NDIS Practice Standards, must follow the Code of Conduct, have complaints and incident systems, screen workers in certain roles, notify the Commission of changes and reportable incidents, and meet audit requirements. Our guides to registration, audits and the Practice Standards explain each in plain English, and link to the Commission’s own pages.',
  },
  {
    question: 'Can unregistered providers deliver NDIS supports?',
    answer: 'Yes, for supports that do not require registration, and only to participants who self-manage or plan-manage their funding. The Code of Conduct still applies, and the Commission recommends that unregistered providers have workers screened.',
  },
  {
    question: 'Where do I confirm the current NDIS price limits?',
    answer: 'On the NDIS website’s pricing arrangements page, which publishes the pricing schedules. The maximum prices apply to NDIA-managed and plan-managed participants. Confirm the current schedule there rather than relying on a figure elsewhere.',
  },
  {
    question: 'How should I reply to an enquiry?',
    answer: 'Quickly, plainly and without pressure. Say whether you can help, in which area and on which days, when you could start, what it would cost and what happens next. If you cannot help, say so and point to where they might look. Our guide to responding to enquiries has a checklist.',
  },
  {
    question: 'What should I do if someone complains?',
    answer: 'Acknowledge it, give a straight answer, act, and apologise where it is due. Threatening anyone, or discouraging a complaint, is against the law. The Commission’s expectations and the “four As” approach are covered in our guide to handling complaints well.',
  },
];

/** Blog articles shown as "guides" on /independent-workers, in order. */
export const WORKER_PAGE_GUIDES = [
  'starting-as-an-independent-support-worker-what-to-set-up-first',
  'ndis-worker-screening-check-who-needs-one-and-how-it-works',
  'ndis-code-of-conduct-for-support-workers-what-it-means-in-everyday-work',
  'abn-tax-and-insurance-for-independent-support-workers-what-to-sort-out',
  'independent-contractor-or-employee-getting-your-support-work-arrangement-right',
  'setting-your-rates-ndis-price-limits-and-fair-pricing-for-independent-workers',
  'service-agreements-notes-and-invoices-the-paperwork-independent-workers-need',
  'registered-or-unregistered-which-path-suits-your-ndis-support-business',
];

/** Blog articles shown as "guides" on /providers, in order. */
export const PROVIDER_PAGE_GUIDES = [
  'how-to-become-a-registered-ndis-provider-the-steps-and-what-to-prepare',
  'registered-or-unregistered-which-path-suits-your-ndis-support-business',
  'ndis-quality-audits-verification-or-certification-what-to-expect',
  'ndis-practice-standards-in-plain-english-for-new-providers',
  'reportable-incidents-and-incident-management-what-ndis-providers-need-to-know',
  'handling-complaints-well-a-guide-for-ndis-providers',
  'writing-a-provider-profile-that-helps-people-choose-you',
  'responding-to-enquiries-a-practical-checklist-for-ndis-and-aged-care-providers',
];

/** The steps on /independent-workers for setting up to work for yourself. */
export const WORKER_SETUP_STEPS =  [
  {
    title: 'Decide how you will work',
    body: 'Contractor or employee is decided by how the arrangement really works, not by what it is called. Settle it before the first shift.',
    link: { to: '/blog/independent-contractor-or-employee-getting-your-support-work-arrangement-right', label: 'Contractor or employee?' },
  },
  {
    title: 'Get your business basics in place',
    body: 'An ABN if you are entitled to one, a plan for tax, GST and super, and a conversation about insurance with whoever engages you.',
    link: { to: '/blog/abn-tax-and-insurance-for-independent-support-workers-what-to-sort-out', label: 'ABN, tax and insurance' },
  },
  {
    title: 'Understand worker screening',
    body: 'Whether you need an NDIS Worker Screening Check depends on who engages you. Find out before you pay for one.',
    link: { to: '/blog/ndis-worker-screening-check-who-needs-one-and-how-it-works', label: 'The screening check explained' },
  },
  {
    title: 'Know the Code of Conduct',
    body: 'It applies to workers as well as providers, and it covers privacy, safety, honesty, raising concerns and fair prices.',
    link: { to: '/blog/ndis-code-of-conduct-for-support-workers-what-it-means-in-everyday-work', label: 'The Code in everyday work' },
  },
  {
    title: 'Set a rate you can explain',
    body: 'Price limits are a ceiling, not a target. Know which limits apply to the participant, and what your rate has to cover.',
    link: { to: '/blog/setting-your-rates-ndis-price-limits-and-fair-pricing-for-independent-workers', label: 'Setting your rates' },
  },
  {
    title: 'Keep simple, safe paperwork',
    body: 'A written agreement, short factual shift notes, a one-page incident process and invoices that match what was delivered.',
    link: { to: '/blog/service-agreements-notes-and-invoices-the-paperwork-independent-workers-need', label: 'The paperwork you need' },
  },
];

/** What a strong provider listing contains, on /providers. */
export const PROVIDER_LISTING_CHECKS =  [
  { title: 'Supports you actually deliver', body: 'Name each support in the words a participant would use, and leave out anything you do not currently provide.' },
  { title: 'The suburbs you cover', body: 'List the areas you really work in. Matching compares enquiries with your service areas, so accuracy saves your team time.' },
  { title: 'How funding can be arranged', body: 'Say whether you work with self-managed, plan-managed and NDIA-managed participants, and for aged care, which programs.' },
  { title: 'Your registration status', body: 'State it plainly, with the support types you are registered for if you are registered. People check.' },
  { title: 'Capacity and availability', body: 'Keep your availability current. A short “not taking new people in this area at the moment” is better than silence.' },
  { title: 'A route to reach you', body: 'Use an intake address that is checked every day, and say how quickly you aim to reply.' },
];

/** Four steps to choose a provider, on /find-a-provider. */
export const DIRECTORY_STEPS = [
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

/** Questions on /find-a-provider. */
export const DIRECTORY_FAQS = [
  {
    question: 'What is the difference between a SolDirectory member and a register listing?',
    answer: 'Members are providers who have joined SolDirectory, keep their own profile and confirm their availability each week. They can receive enquiries through the site. Register listings are organisations that appear on the public NDIS or My Aged Care registers, shown here as those registers publish them. A register listing does not tell you whether an organisation has capacity or is taking new people.',
  },
  {
    question: 'Does being on a register mean a provider is right for me?',
    answer: 'No. Registration is about regulation and oversight. It does not show whether a provider suits your needs, offers the support in your area, has a worker free on the days you need, or fits your plan. Compare providers on the things that matter to you and ask the questions in our guides.',
  },
  {
    question: 'How do I contact a provider?',
    answer: 'Open a member profile to see the options on it, or use Get matched to send one request that suitable member providers can respond to. For register listings, contact the organisation directly using its own website or the details on the official register.',
  },
  {
    question: 'Can I use a provider that is not registered?',
    answer: 'It depends on how your plan is managed and on the support you need. Some supports can only be delivered by registered providers, and the rules for plan-managed and self-managed participants have been changing, so confirm the current position for your own plan with your plan manager, support coordinator or the NDIA.',
  },
  {
    question: 'How do I check that a provider is registered?',
    answer: 'The NDIS Quality and Safeguards Commission publishes a provider register you can search. Compare the name and the registered support types with what the provider tells you, and ask for their ABN if you are unsure.',
  },
  {
    question: 'How current is the register information on this page?',
    answer: 'Register listings are imported from the public registers at a point in time and can lag behind the live register. Treat them as a starting point, and confirm details with the provider and the official register before you rely on them.',
  },
  {
    question: 'Is it free to search and send a request?',
    answer: 'Searching and submitting a request is free for participants, families and coordinators. You are not obliged to use any provider that responds.',
  },
];

/** Each state or territory's capital and larger regional centres. */
export const STATE_CENTRES = [
  { code: 'NSW', capital: 'Sydney', centres: ['Newcastle', 'Wollongong', 'Central Coast', 'Parramatta', 'Wagga Wagga', 'Albury', 'Orange', 'Dubbo', 'Tamworth', 'Coffs Harbour', 'Port Macquarie'] },
  { code: 'VIC', capital: 'Melbourne', centres: ['Geelong', 'Ballarat', 'Bendigo', 'Dandenong', 'Shepparton', 'Wodonga', 'Mildura', 'Warrnambool', 'Traralgon'] },
  { code: 'QLD', capital: 'Brisbane', centres: ['Gold Coast', 'Sunshine Coast', 'Ipswich', 'Townsville', 'Cairns', 'Toowoomba', 'Rockhampton', 'Mackay', 'Bundaberg'] },
  { code: 'WA', capital: 'Perth', centres: ['Mandurah', 'Bunbury', 'Geraldton', 'Kalgoorlie', 'Albany', 'Broome', 'Karratha'] },
  { code: 'SA', capital: 'Adelaide', centres: ['Mount Gambier', 'Whyalla', 'Murray Bridge', 'Port Augusta', 'Port Lincoln'] },
  { code: 'TAS', capital: 'Hobart', centres: ['Launceston', 'Devonport', 'Burnie'] },
  { code: 'ACT', capital: 'Canberra', centres: ['Belconnen', 'Tuggeranong', 'Gungahlin', 'Woden'] },
  { code: 'NT', capital: 'Darwin', centres: ['Palmerston', 'Alice Springs', 'Katherine', 'Tennant Creek'] },
];

/** Questions on /locations. */
export const LOCATION_FAQS = [
  {
    question: 'How do I find an NDIS provider near me?',
    answer: 'Start with the suburb where the support will actually happen. Search it here, then widen to the nearest city or state if you need more options. Each result shows what the provider says it offers and where it works; contact two or three and compare how they respond.',
  },
  {
    question: 'What is the difference between a SolDirectory profile and a register listing?',
    answer: 'A profile is created and maintained by the provider itself, so it can say more about its services, areas and how to make an enquiry. A register listing comes from the public NDIS Commission or My Aged Care registers and shows only what those registers publish. Both are shown so you can see a wider picture, but a register listing does not tell you who has capacity right now.',
  },
  {
    question: 'Can I choose a provider in a different suburb or state?',
    answer: 'Yes. You are not limited to the suburb you live in. What matters is whether the provider can deliver support where you need it, so ask about their service area, travel costs and minimum shift lengths before you agree to anything.',
  },
  {
    question: 'Do providers charge extra to travel to me?',
    answer: 'Some do, and rules differ by support type. The NDIS Pricing Arrangements set limits that can include provider travel and may allow higher prices in remote and very remote areas. Always check the current pricing arrangements on the NDIS website and ask the provider to put any travel charges in writing.',
  },
  {
    question: 'What if I live in a regional, rural or remote area?',
    answer: 'Fewer providers may be based near you, but many travel or deliver some supports, such as planning, support coordination and some therapy, by phone or video. Search your nearest regional centre as well as your own town, and ask providers how often they visit.',
  },
  {
    question: 'Are the register listings checked by SolDirectory?',
    answer: 'Register listings reflect the public registers as imported, and they can go out of date. Before you commit, confirm a provider’s current status on the official register (links are on each state page) and ask for a service agreement that spells out price, hours and cancellation terms.',
  },
  {
    question: 'Is it free to use SolDirectory?',
    answer: 'Searching is free, and so is submitting a request for matched providers. We do not charge participants or families to search or to send an enquiry.',
  },
];

/** Cards under 'Understand provider enquiries' on /providers. */
export const PROVIDER_UNDERSTAND = [
  {
    title: 'Keep service and capacity information accurate',
    body: 'Keep your service areas, funding types and contact details current. Before accepting work, confirm support requirements, timing, fees and any registration requirements directly with the person or their representative.',
  },
  {
    title: 'Check the funding arrangement on every enquiry',
    body: 'We also match aged care families with providers, so check the funding type and support requested each time. Directory totals include both, so they are not a count of NDIS-only demand.',
  },
  {
    title: 'Notifications and contact access',
    body: 'Claiming a basic listing is free and you are notified when an enquiry matches your service area. Unlocking full contact details is part of the Growth plan. A notification is not the same as a person agreeing to work with you.',
  },
  {
    title: 'Judge a directory by what is included',
    body: 'Compare billing terms, covered locations, service categories and how enquiries reach you, not the size of the register alone. A larger list does not by itself mean more suitable enquiries.',
  },
];

/** How enquiries reach a provider, on /providers. */
export const PROVIDER_REACH = [
  { title: 'Email notifications', body: 'Available enquiry details are sent to your nominated intake email address.' },
  { title: 'SMS notifications', body: 'Eligible plans can receive a text alert when a relevant enquiry is available to review.' },
  { title: 'Subscription-based access', body: 'SolDirectory does not deduct a percentage from fees agreed between you and a participant.' },
  { title: 'Direct communication', body: 'Where your plan permits contact access, you can communicate directly with the person who submitted the enquiry.' },
];

/** How it works for providers, on /providers. */
export const PROVIDER_STEPS = [
  { title: 'Claim your profile', body: 'Find your business in our directory and claim it, or create a new listing. Claiming is free.' },
  { title: 'Set your service area and capacity', body: 'Tell us the suburbs you cover, the supports you offer, and where to send matches: email, SMS, or both.' },
  { title: 'Review relevant enquiries', body: 'When an enquiry aligns with your profile, your team can review the available information and decide whether to respond.' },
];

/** The three ways providers work, on /providers. */
export const PROVIDER_PATHS = [
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

/** Quality and safeguards areas, on /providers. */
export const PROVIDER_SAFEGUARDS = [
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

/** What a worker profile can hold, on /independent-workers. */
export const WORKER_PROFILE_DETAILS = [
  ['Services and experience', 'The supports you deliver, relevant experience and the participant groups you work with.'],
  ['Location and availability', 'Your suburb, service area, preferred schedule and current availability.'],
  ['Languages and transport', 'Languages spoken, and whether you can travel or provide transport where appropriate.'],
  ['Rates and contact preferences', 'An indicative hourly rate, and how eligible organisations can contact you.'],
];

/** How it works for workers, on /independent-workers. */
export const WORKER_HOW_IT_WORKS = [
  ['Create your account', 'Register as an Independent Worker with your name, email address and mobile number.'],
  ['Complete your profile', 'Add your services, experience, location, languages, availability and indicative rate.'],
  ['Keep it current', 'Update availability and professional details whenever your circumstances change.'],
  ['Assess each opportunity', 'Discuss requirements directly and complete your own suitability, safety and contractual checks.'],
];

/** Reminders on /independent-workers about checks and arrangements. */
export const WORKER_SAFEGUARDS = [
  { title: 'Checks you may need', text: 'Depending on the role and supports delivered, you may need an NDIS Worker Screening Check, Working with Children Check, professional registration, first aid training, insurance or other evidence.' },
  { title: 'A profile does not replace verification', text: 'Organisations should confirm credentials directly, and both parties should document the scope of work, rates, cancellations, privacy, incidents and complaints before support begins.' },
  { title: 'No endorsement', text: 'SolDirectory does not endorse individual workers or determine whether a worker is suitable for a particular person or role.' },
];

/** Plan inclusions on /providers. Mirrors the default rows seeded in apps/api/src/models/PlanConfig.ts: update both together. */
export const PROVIDER_PLANS = {
  starter: { name: 'Starter', price: '$0 per month', features: ['Public provider listing', 'Search the worker directory', 'Contact requests to workers', 'Lead headlines, no contact details'] },
  growth: { name: 'Growth', price: '$249 per month + GST', features: ['15 lead unlocks per month', 'Full brief, budget and contact details', 'Matched to your service areas', 'Three team seats', 'Response time reporting'] },
};
