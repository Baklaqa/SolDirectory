/**
 * The words on /support-coordinators. One copy, used in two places: the page renders it, and the server writes the same
 * words into the HTML that search engines and link previews receive (so a crawler never reads a different, shorter version
 * of the page, and the FAQ markup always matches the FAQ people see).
 *
 * Inline links are written [label](/path). Every path must be a page or article that exists; the page tests check it.
 * Update `updated` and `updatedLabel` together whenever the guidance on the page changes.
 */
export const COORDINATOR_PAGE = {
  seoTitle: 'Provider referrals for support coordinators | SolDirectory',
  seoDescription: 'A practical guide for preparing referrals, comparing disability and aged care providers, checking capacity, consent, safeguards, fees and service agreements.',
  heading: 'Provider referrals for support coordinators',
  subtitle: 'Prepare a clear request, compare providers consistently and keep the participant in control of each decision.',
  updated: '2026-10-13',
  updatedLabel: '13 October 2026',

  glanceHeading: 'In short',
  glance: [
    'A good referral names the support, the location, the funding arrangement, the timing and who decides, and shares only what a provider needs to assess it.',
    'Compare every provider on the same checks (fit, capacity and safeguards), then get the costs and terms in writing before anything starts.',
    'Record the consent you relied on, who you contacted and why the participant chose the provider they did.',
  ],

  intro: {
    label: 'What SolDirectory does',
    heading: 'Search directly or send one provider enquiry',
    text: 'SolDirectory is a directory and referral service. You can browse provider profiles and public-register records, or submit one enquiry so relevant member providers can review the support, area, funding and timeframe. SolDirectory does not deliver supports, choose a provider for the participant or replace due diligence. If you are new to the role itself, [support coordination explained](/blog/support-coordination-explained-do-you-need-it) is a plain-language introduction.',
  },

  referral: {
    id: 'referrals',
    heading: 'Prepare a referral providers can assess',
    paragraphs: [
      'A useful referral is specific enough for a provider to decide whether it can safely meet the request, without disclosing information that is not needed. Confirm the participant or authorised representative agrees to the referral and understands which details may be shared.',
    ],
    steps: [
      'Describe the requested support in practical terms: tasks, goals, frequency, preferred days, shift length and proposed start date.',
      'Record the service location, travel expectations and whether support also occurs at work, education, appointments or community activities.',
      'State the funding program and management arrangement, but verify budget availability and provider-registration rules separately. The article on [self-managed, plan-managed or NDIA-managed plans](/blog/self-managed-plan-managed-or-ndia-managed-how-to-decide) explains how the arrangement changes who can be paid.',
      'Include communication, access, cultural, gender and worker preferences that materially affect matching.',
      'Describe relevant risks and required competencies, plans or equipment without using vague labels as a substitute for person-specific information.',
      'Name the decision-maker and best contact pathway, and state any deadline that is real rather than aspirational.',
    ],
  },

  urgent: {
    id: 'urgent-referrals',
    heading: 'Urgent and complex referrals',
    paragraphs: [
      'Urgency should change escalation and planning, not lower the quality bar. A directory response is not guaranteed and is not an emergency service. Where there is immediate danger, call 000. Use established crisis, health, safeguarding and after-hours pathways rather than waiting for a provider reply.',
      'For urgent non-emergency requests, explain the actual deadline, what happens if support is not arranged, interim supports already considered, minimum safe staffing, essential competencies, restrictive-practice or behaviour-support requirements, medication or clinical responsibilities, equipment and environmental risks. Ask providers to state clearly what they can and cannot commence by the required date.',
    ],
  },

  checks: {
    id: 'provider-checks',
    heading: 'Compare providers using the same checks',
    intro: 'Apply a consistent comparison to every provider so familiarity, speed or presentation does not replace evidence. The participant’s preferences and right to choose remain central.',
    cards: [
      { title: 'Fit and delivery', text: 'Confirm who will actually provide support, relevant experience, qualifications, supervision, continuity and how the service adapts when needs change.' },
      { title: 'Capacity', text: 'Check the realistic start date, offered roster, service area, waitlist, backup arrangements and what happens when a regular worker is unavailable.' },
      { title: 'Safeguards', text: 'Check applicable registration, worker screening, insurance, incident and complaint processes, clinical governance and required person-specific training.' },
    ],
    note: 'Registration requirements vary by support, funding and management arrangement. Check the relevant official register and ask the provider for current evidence. A SolDirectory or public-register listing is not an endorsement and does not prove suitability or availability. [Questions to ask an NDIS provider](/blog/how-to-choose-an-ndis-provider-questions-to-ask) gives a list you can reuse, and [who needs an NDIS worker screening check](/blog/ndis-worker-screening-check-who-needs-one-and-how-it-works) explains the screening step.',
  },

  pricing: {
    heading: 'Pricing, funding and service agreements',
    paragraphs: [
      'Ask for the complete proposed cost in writing. Compare hourly or unit rates alongside travel, non-face-to-face work, reports, establishment fees, minimum shifts, cancellations, weekend or public-holiday rates and exit terms. Confirm that the support and claiming arrangement fit the participant’s current plan or program.',
      'Before services begin, review the service agreement with the participant in an accessible format. It should identify the support, schedule, rates, responsibilities, consent and information-sharing arrangements, changes, cancellations, complaints, incidents, records and how either party may end the service. [What to check before you sign an NDIS service agreement](/blog/ndis-service-agreement-what-to-check-before-you-sign) walks through each of these.',
    ],
  },

  records: {
    heading: 'Consent, privacy and referral records',
    paragraphs: [
      'Share the minimum information necessary for providers to assess the request. Record the authority or consent relied on, what was shared, with whom and for what purpose. Use secure channels for sensitive information and check whether the participant wants family, nominees, advocates or other team members involved.',
    ],
    list: [
      'Keep the original request and any later clarification.',
      'Record providers contacted, responses, declared conflicts and reasons options were included or excluded.',
      'Keep written quotes, service agreements and evidence checked at the time of selection.',
      'Document the participant’s decision and any risks, contingencies or follow-up actions.',
    ],
    after: 'A simple, consistent system is easier to keep up than a detailed one; [keeping records of your NDIS supports](/blog/keeping-records-of-your-ndis-supports-a-simple-system) suggests a light-touch way to do it.',
  },

  after: {
    heading: 'After a provider responds',
    paragraphs: [
      'A quick response is not proof of fit. Arrange a conversation in the participant’s preferred format, verify outstanding evidence and make responsibilities explicit. Agree how progress, incidents, missed shifts, complaints and changes in need will be communicated. Review early enough to correct a poor fit before it becomes a crisis. If a concern is not resolved with the provider, [making a complaint about an NDIS provider or worker](/blog/making-a-complaint-about-an-ndis-provider-or-worker) explains the options.',
      'Saved provider lists are available to signed-in coordinator and participant accounts. They are an organisational aid, not a recommendation or compliance record.',
    ],
  },

  resources: {
    heading: 'Related planning resources',
    text: 'Use the [service guides](/services) to clarify the requested support, review [funding and plan-management topics](/funding), and browse guidance by [condition or support need](/condition). The [provider selection guide](/guides/choosing-a-provider) provides a reusable comparison checklist, the [glossary](/glossary) explains the terms providers and plan documents use, and the [location hub](/locations) helps identify nearby service areas.',
  },

  faqsHeading: 'Frequently asked questions',
  faqs: [
    { question: 'What should a referral for a disability provider include?', answer: 'The requested support in practical terms (tasks, goals, frequency and start date), the location, the funding program and management arrangement, communication and worker preferences, and the best person to contact. Share only what the provider needs to assess the request.' },
    { question: 'Do I need the participant’s consent to send a referral?', answer: 'Confirm that the participant or their authorised representative agrees to the referral and understands which details may be shared. Record the consent you relied on, what was shared and with whom.' },
    { question: 'Does SolDirectory recommend or rank providers?', answer: 'No. Search results and directory listings are not recommendations. Coordinators should confirm suitability, registration, screening, insurance, availability, pricing and service terms directly.' },
    { question: 'Can I submit an enquiry for a participant?', answer: 'Yes, where you have authority and consent to share the information. Include only what providers need to assess the request, and avoid unnecessary clinical or identifying detail.' },
    { question: 'Does a directory listing prove current capacity?', answer: 'No. Member providers confirm capacity regularly, but availability can change. Public-register listings do not indicate capacity at all. Confirm the proposed start date and roster directly.' },
    { question: 'What should I do for an immediate safety emergency?', answer: 'Do not use a directory enquiry as an emergency response. Call 000 where there is immediate danger and use the participant’s crisis, clinical or safeguarding pathways.' },
  ],

  officialHeading: 'Official checks and guidance',
  official: [
    { label: 'NDIS Commission provider registers', href: 'https://www.ndiscommission.gov.au/providers/provider-registers' },
    { label: 'NDIS worker screening', href: 'https://www.ndiscommission.gov.au/workers/worker-screening' },
    { label: 'NDIS guidance on working with providers', href: 'https://www.ndis.gov.au/participants/working-providers' },
    { label: 'My Aged Care provider search', href: 'https://www.myagedcare.gov.au/find-a-provider' },
  ],

  contact: {
    heading: 'Contact SolDirectory',
    text: 'Ask about using the directory or submit a provider enquiry. Do not send emergency requests through email or the directory.',
  },
};
