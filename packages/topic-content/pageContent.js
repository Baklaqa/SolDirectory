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

/** Questions on /providers. */
export const PROVIDER_FAQS = [
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
