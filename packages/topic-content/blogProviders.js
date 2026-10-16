/**
 * Guides for providers: registration, audits, the Practice Standards, incidents, complaints, and how to present and
 * answer well. Same editorial rules as blogGuides.js: original writing, each source page opened and read on the checked
 * date, nothing that changes often is stated as a number, and every article says what to confirm for the reader's case.
 */
const CHECKED = '2026-10-13T09:00:00+11:00';
const NDISC = 'https://www.ndiscommission.gov.au';
const ndisc = (path) => `${NDISC}${path}`;
const NDIS = 'https://www.ndis.gov.au';
const GUIDANCE = 'Current guidance page';

export const PROVIDER_POSTS = [
  {
    slug: 'how-to-become-a-registered-ndis-provider-the-steps-and-what-to-prepare',
    title: 'How to become a registered NDIS provider: the steps and what to prepare',
    summary: 'Registration is an application, an independent quality audit and a suitability assessment. Here is the sequence, what to have ready, and where the costs and delays usually sit.',
    category: 'For providers',
    publishedAt: '2026-10-13T10:00:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/general.jpg',
    coverAlt: 'A woman in a wheelchair at her desk while colleagues talk by a whiteboard',
    source: { label: 'NDIS Commission: Apply for registration', url: ndisc('/provider-registration/apply-registration'), date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: About registration', url: ndisc('/provider-registration/about-registration') },
      { label: 'NDIS Commission: The quality audit process', url: ndisc('/provider-registration/apply-registration/types-audits') },
    ],
    keyPoints: [
      'Registration means you have applied, been audited against the relevant NDIS Practice Standards, and been assessed as suitable, along with your key personnel.',
      'There is no cost to register with the Commission, but you pay an independent approved quality auditor, and audit costs vary with your size and the supports you deliver.',
      'Registration is generally for three years, and you must be registered to deliver some supports, such as supported independent living and supports for NDIA-managed participants.',
    ],
    sections: [
      {
        heading: 'What registration means',
        paragraphs: [
          'The NDIS Commission describes a registered provider as one that has applied for registration, has been audited against the relevant NDIS Practice Standards and assessed as meeting them, has had a suitability assessment of both the organisation and its key personnel, and has been issued a certificate of registration. Registration is generally for three years, and registered providers are published on the NDIS Provider Register.',
          'Registration is mandatory for some supports. The Commission lists specialist disability accommodation, specialist behaviour support, supports for participants with NDIA-managed funding, plan management, supported independent living and NDIS digital platform services, and registration is also required if you intend to use regulated restrictive practices. From 1 July 2026 registration is required for supported independent living and for NDIS digital platform services.',
        ],
      },
      {
        heading: 'Before you apply',
        paragraphs: [
          'You must have an Australian Business Number and be able to show, with evidence, that you can deliver the classes of supports you are applying for. All key personnel are checked for a valid NDIS worker screening clearance and for suitability, and workers in risk-assessed roles are checked for a clearance too. Sorting these out first avoids delays.',
          'The Commission suggests you also review your policies and procedures against the Practice Standards, make an action plan for any gaps, train staff on the standards and the audit process, and tell participants and their advocates how they may be involved in the audit. If you have workers on temporary visas, check that they meet the requirements for NDIS workers on temporary visas.',
          'You will need a myID account, your organisation’s details including corporate structure, governance arrangements and locations, details of every key personnel, the supports you plan to provide, and any supporting evidence.',
        ],
      },
      {
        heading: 'The application, step by step',
        paragraphs: [
          'You apply online in two parts. Part 1 is an initial assessment; after you receive the outcome you complete Part 2. The form includes the registration groups or classes of support you want, a self-assessment against the applicable Practice Standards with evidence, and questions about suitability, for example whether you or key personnel have been declared bankrupt or convicted of an indictable offence. Information must be accurate and truthful, and false or misleading information can lead to refusal. You have 60 days from starting to finish, or the application is deleted.',
          'When you submit, the Commission sends an initial scope of audit that says which type of audit you need and which standards apply. You then engage an approved quality auditor from the Commission’s list, ideally after getting more than one quote. The auditor may ask you to fix issues, then sends a recommendation to the Commission, which assesses it along with your suitability and may ask for more information.',
          'You are then told whether the application is approved or refused, and if the Commission plans to refuse you are invited to respond first. You can ask for a review within three months, and then ask the Administrative Review Tribunal for a further review. Approved providers receive a certificate listing registration groups, the registration period and any conditions.',
        ],
      },
      {
        heading: 'Cost and time',
        paragraphs: [
          'The Commission says there is no cost to register, but providers pay an approved quality auditor, and the cost depends on the size and scale of the organisation and on the number of participants supported. The Commission does not set audit prices. How long an application takes depends on the size and complexity of the organisation and its supports.',
          'Budget for the audit, for staff time to prepare evidence, and for any systems you need to put in place, such as complaints, incident management and screening records.',
        ],
      },
      {
        heading: 'Check which portal applies',
        paragraphs: [
          'From 12 October 2026 the Commission runs two provider portals. New applications start in the new NDIS Commission Portal, and applications already under way finish in the existing portal. The Commission says some drafts have been removed from the existing portal, so check its guidance on what to do with a draft. This changes, so read the Commission’s “which portal do I use” page before you start. This article is general information, not a substitute for the Commission’s instructions.',
        ],
      },
    ],
  },
  {
    slug: 'registered-or-unregistered-which-path-suits-your-ndis-support-business',
    title: 'Registered or unregistered? Which path suits your NDIS support business',
    summary: 'Some supports can only be delivered by registered providers, and others can be delivered either way. Here is what each path allows, what it asks of you, and a third option.',
    category: 'For providers',
    publishedAt: '2026-10-13T10:10:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/condition-sensory.jpg',
    coverAlt: 'A smiling young woman outdoors',
    source: { label: 'NDIS Commission: About registration', url: ndisc('/provider-registration/about-registration'), date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: NDIS Code of Conduct', url: ndisc('/rules-and-standards/ndis-code-conduct') },
      { label: 'NDIS: Pricing arrangements', url: `${NDIS}/providers/pricing-and-payments/pricing/pricing-arrangements` },
    ],
    keyPoints: [
      'Unregistered providers can deliver most supports, but only to participants who self-manage or plan-manage their funding.',
      'Registration is mandatory for some supports, including supported independent living, specialist disability accommodation and plan management.',
      'Whichever path you take, the Code of Conduct applies, and a registered provider is responsible for supports delivered under its registration.',
    ],
    sections: [
      {
        heading: 'What each path allows',
        paragraphs: [
          'The Commission says you must be registered to provide specialist disability accommodation, specialist behaviour support, supports or services to participants with NDIA-managed funding, plan management, assistance with supported independent living and NDIS digital platform services, and to use regulated restrictive practices.',
          'Unregistered providers can deliver supports and services to participants except for those. Only participants who self-manage or plan-manage their NDIS funding can choose to receive supports from an unregistered provider. So the first question is not whether you would like to be registered, but which participants and which supports you want to serve.',
        ],
      },
      {
        heading: 'What staying unregistered still involves',
        paragraphs: [
          'The Code of Conduct applies to unregistered providers, their key personnel and their workers. The Commission also expects all providers to have effective complaints management and incident management practices, recommends that unregistered providers make sure all workers have an NDIS worker screening clearance, and lets self-managed and plan-managed participants require one.',
          'The NDIA’s maximum prices apply to NDIA-managed and plan-managed participants, so a plan-managed participant will expect your rates to sit within the price limits. A self-managed participant is not bound by those limits, but fair pricing under the Code still applies.',
        ],
      },
      {
        heading: 'What registration adds',
        paragraphs: [
          'Registered providers can serve NDIA-managed participants and deliver the supports that require registration, and they are listed on the NDIS Provider Register. In return, registration is subject to conditions: complying with the Practice Standards and the Code of Conduct, effective complaints and incident systems, worker screening for certain roles, notification requirements, audits, and behaviour support requirements where they apply.',
          'It also means regular external scrutiny: an initial audit, and for higher-risk supports a mid-term audit during the registration period. That is a real cost in time and money, and it is also what many participants and families look for.',
        ],
      },
      {
        heading: 'A third option: under another provider’s registration',
        paragraphs: [
          'Some providers deliver supports under another provider’s registration, through facilitation or brokerage arrangements. The registered provider must claim payment, is responsible for all supports delivered under its registration, and must make sure the arrangement is transparent to participants. It can be a way to start before you are ready for your own registration, but it makes you dependent on that provider’s systems and decisions.',
        ],
      },
      {
        heading: 'Questions to settle before you decide',
        paragraphs: [
          'Which supports do you want to deliver, and do any require registration? How do the participants you want to serve manage their funding? How much capacity do you have for audits, systems and record keeping? What would registration cost, and what could it open up? Are you planning to grow into supports that need it later?',
          'If you are unsure, read the Practice Standards for the supports you would deliver, and speak to an approved quality auditor, who can tell you which type of audit would apply to you. General information only; the Commission’s pages are the authority.',
        ],
      },
    ],
  },
  {
    slug: 'ndis-quality-audits-verification-or-certification-what-to-expect',
    title: 'NDIS quality audits: verification or certification, and what to expect',
    summary: 'The audit is the part of registration most providers worry about. A plain description of the two main audit types, what the auditor looks at, and how to prepare.',
    category: 'For providers',
    publishedAt: '2026-10-13T10:20:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/condition-neuro-2.jpg',
    coverAlt: 'A doctor talking with a patient in a medical room',
    source: { label: 'NDIS Commission: The quality audit process', url: ndisc('/provider-registration/apply-registration/types-audits'), date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: NDIS Practice Standards', url: ndisc('/rules-and-standards/ndis-practice-standards') },
      { label: 'NDIS Commission: Apply for registration', url: ndisc('/provider-registration/apply-registration') },
    ],
    keyPoints: [
      'A verification audit is a desktop review of documents for lower-risk, lower-complexity supports; a certification audit is for higher-risk or more complex supports and includes an on-site stage.',
      'Higher-risk providers also complete a mid-term audit about 18 months into registration, and an out-of-cycle audit may be needed if the supports change.',
      'You choose and pay an approved quality auditor, so compare quotes and ask questions before you commit.',
    ],
    sections: [
      {
        heading: 'Why there is an audit',
        paragraphs: [
          'Before you become a registered provider you are assessed against the relevant NDIS Practice Standards through an independent quality audit carried out by an approved quality auditor. The Commission describes audits as a way of making services safer and more consistent, finding issues early and confirming when they are fixed, and helping providers improve over time.',
        ],
      },
      {
        heading: 'Which type of audit you need',
        paragraphs: [
          'When you submit your application the Commission gives you an initial scope of audit, which says which type applies. As a general rule, a verification audit is for providers who deliver lower-risk, lower-complexity supports, and a certification audit is for higher-risk or more complex supports. The registration groups table sets out which applies to each class of support.',
          'Other audits exist: a mid-term audit for providers who first completed a certification audit, held 18 months into the registration period; a condition audit the Commission can require; and an out-of-cycle audit that may be needed when you want to change the supports you provide during registration.',
        ],
      },
      {
        heading: 'What a verification audit involves',
        paragraphs: [
          'A verification audit is a desktop review: the auditor looks at documentary evidence that you meet the requirements. Many providers who need one have already met professional regulation requirements, for example through registration with the Australian Health Practitioner Regulation Agency or another professional body, because professional regulation means a practitioner’s standards and competence are already being monitored.',
          'The Commission publishes a guide listing the documents required, so you can see in advance what the auditor will ask for.',
        ],
      },
      {
        heading: 'What a certification audit involves',
        paragraphs: [
          'A certification audit has two stages. Stage 1 is a desktop audit, usually off site, where the auditor asks for information and evidence. Stage 2 is an on-site audit that should take place within three months of Stage 1, where the auditor looks at how you are applying your policies and procedures: viewing records, visiting sites, observing, and interviewing workers and participants.',
          'Participants are automatically included in the audit unless they opt out, so you need to let them know. Depending on the supports you deliver, the audit can include site visits to head office and the places supports are delivered, inspection of facilities and equipment, participant and worker interviews, and a review of business documents.',
        ],
      },
      {
        heading: 'Choosing an auditor and preparing',
        paragraphs: [
          'You are responsible for engaging an approved quality auditor and paying for the audit. The Commission does not set audit prices and recommends getting more than one quote and asking questions to check an auditor suits your organisation. If the auditor finds issues you may be asked to fix them before the auditor sends their recommendation.',
          'The best preparation is the one the Commission suggests for the application: compare your policies and procedures against the Practice Standards, make an action plan for gaps, train staff, and keep your evidence organised in the way the standards expect. General information only; the Commission’s audit page is the authority.',
        ],
      },
    ],
  },
  {
    slug: 'ndis-practice-standards-in-plain-english-for-new-providers',
    title: 'The NDIS Practice Standards in plain English for new providers',
    summary: 'The Practice Standards are what registered providers are audited against. A short tour of how they are organised, which modules apply to whom, and how to use them as a working checklist.',
    category: 'For providers',
    publishedAt: '2026-10-13T10:30:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/condition-neuro.jpg',
    coverAlt: 'A health professional fitting a wrist support to a patient’s hand',
    source: { label: 'NDIS Commission: NDIS Practice Standards', url: ndisc('/rules-and-standards/ndis-practice-standards'), date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: Apply for registration', url: ndisc('/provider-registration/apply-registration') },
      { label: 'NDIS Commission: The quality audit process', url: ndisc('/provider-registration/apply-registration/types-audits') },
    ],
    keyPoints: [
      'The Standards are organised into modules, each with participant-focused outcomes and quality indicators that auditors use.',
      'A core module applies to providers of higher-risk supports; a verification module applies to providers of lower-risk, lower-complexity supports; supplementary modules apply by type of support.',
      'Use them as a gap analysis before you apply: compare your policies against the relevant modules and make an action plan.',
    ],
    sections: [
      {
        heading: 'What the Standards are for',
        paragraphs: [
          'The NDIS Practice Standards specify the quality standards that registered providers must meet when delivering supports and services to NDIS participants. They also tell participants what quality they can expect, which makes them useful for you to read from the participant’s side too.',
          'They are organised into modules. Each module has outcomes, which are high level and focused on the participant, and quality indicators, which auditors use to assess compliance and which indicate how providers may show that they comply.',
        ],
      },
      {
        heading: 'The core module',
        paragraphs: [
          'The core module applies to registered providers delivering higher-risk supports and services. It covers four areas: rights and responsibilities for participants, provider governance and operational management, provision of supports, and the environment in which supports are provided.',
          'In everyday terms that is how you respect a person’s choices and privacy, how your organisation is run and how risks are managed, how you plan and deliver and review support, and whether the places and equipment are safe and suitable.',
        ],
      },
      {
        heading: 'The verification module',
        paragraphs: [
          'The verification module applies to providers delivering lower-risk, lower-complexity supports. It covers human resource management, risk management, complaints management and resolution, and incident management. It is shorter, but those four areas still need to be real systems rather than documents that live in a folder.',
        ],
      },
      {
        heading: 'Supplementary modules',
        paragraphs: [
          'On top of the core module, supplementary modules apply depending on what you deliver: high intensity daily personal activities, specialist behaviour support, implementing behaviour support plans, early childhood supports, specialised support coordination, specialist disability accommodation and supported independent living. The initial scope of audit you receive when you apply lists the standards that apply to your registration groups.',
        ],
      },
      {
        heading: 'Using the Standards as a checklist',
        paragraphs: [
          'The Commission suggests reviewing your policies and procedures against the Standards, making an action plan where there are gaps, and training staff before the audit. Try this: read the modules that apply to you, write one line per quality indicator on how you meet it and where the evidence lives, and note the gaps. That document is also the start of your self-assessment in the application.',
          'Keep it alive after registration. Standards are part of how you run the service day to day, and the Commission’s later audits are checking that. General information only; use the Commission’s current text.',
        ],
      },
    ],
  },
  {
    slug: 'reportable-incidents-and-incident-management-what-ndis-providers-need-to-know',
    title: 'Reportable incidents and incident management: what NDIS providers need to know',
    summary: 'Incidents happen, and how you respond is what is judged. The difference between an incident and a reportable incident, the timeframes, and a simple process to build around them.',
    category: 'For providers',
    publishedAt: '2026-10-13T10:40:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/condition-mobility-2.jpg',
    coverAlt: 'A person sitting on a bench in a paved square with a wheelchair beside them',
    source: { label: 'NDIS Commission: Reportable incidents', url: ndisc('/rules-and-standards/reportable-incidents-and-incident-management/reportable-incidents'), date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: Incident management', url: ndisc('/rules-and-standards/reportable-incidents-and-incident-management/incident-management') },
      { label: 'NDIS Commission: NDIS Code of Conduct', url: ndisc('/rules-and-standards/ndis-code-conduct') },
    ],
    keyPoints: [
      'All NDIS providers should have an incident management system; registered providers must have one and must notify the Commission of reportable incidents.',
      'Deaths, serious injuries, abuse or neglect, unlawful sexual or physical contact and assault, and sexual misconduct must be reported within 24 hours of becoming aware.',
      'An unauthorised restrictive practice is reported within five business days, or within 24 hours if it caused harm.',
    ],
    sections: [
      {
        heading: 'An incident and a reportable incident',
        paragraphs: [
          'The Commission defines an incident as an act, omission, event or circumstance that has or could have caused harm to a person with disability, or where a person with disability has caused serious harm or the risk of serious harm to another person. Incidents that happen while supports are delivered need to be identified, assessed, recorded, managed and resolved, while the person feels safe, respected and informed.',
          'A reportable incident is a defined subset: an act or event, or an alleged one, in connection with delivering NDIS supports that must be notified to the Commission by registered providers. That includes incidents you have already recorded and responded to in your own system.',
        ],
      },
      {
        heading: 'Build a simple incident process',
        paragraphs: [
          'The Commission describes a sequence you can adapt to your size: identify the incident, support the people affected straight away, record what happened and the evidence, report and assess it internally, and then review it so you can learn from it. Immediate safety comes first, including calling 000 if someone needs urgent medical care or a crime may have happened.',
          'Your system should suit your size and the supports you deliver, be written down in an accessible form, and be available to all workers and to the people you support. Records need to be stored so that the privacy and confidentiality of the people affected is kept. A culture in which workers and participants feel comfortable telling you about incidents matters more than any form.',
        ],
      },
      {
        heading: 'The reporting timeframes',
        paragraphs: [
          'Timeframes run from when the registered provider became aware of the incident. The Commission lists deaths, serious injuries, abuse or neglect, unlawful sexual or physical contact with or assault of a person with disability, and sexual misconduct, including grooming, as incidents that must be notified within 24 hours.',
          'The use of a restrictive practice that is unauthorised by the state or territory, or does not follow a behaviour support plan, must be notified within five business days, unless it resulted in harm, in which case it must be reported within 24 hours. A 24-hour report is an immediate notification; a five-day report adds more information and the actions you have taken.',
          'Not reporting within the timeframes can lead to an infringement notice or other compliance action. A third party report form is also available to tell the Commission about an incident connected to another registered provider’s supports.',
        ],
      },
      {
        heading: 'The portal change',
        paragraphs: [
          'From 12 October 2026 the Commission runs two portals. New incidents are lodged in the new NDIS Commission Portal, including the 24-hour and five-day reports, and incidents lodged earlier stay in the existing portal for follow-up. The Commission publishes a “which portal do I use” page and quick reference guides, so check them before you need them in a hurry.',
        ],
      },
      {
        heading: 'If you are not registered',
        paragraphs: [
          'Unregistered providers do not report incidents to the Commission in the same way, but the Commission says all providers should have an incident management system, and the Code of Conduct requires every provider to respond to incidents and to act promptly on concerns about safety and quality. If you work under another provider’s registration, tell them immediately, because their timeframe starts when they become aware. General information only; use the Commission’s current guidance.',
        ],
      },
    ],
  },
  {
    slug: 'handling-complaints-well-a-guide-for-ndis-providers',
    title: 'Handling complaints well: a guide for NDIS providers',
    summary: 'A complaint handled well can strengthen a relationship. What the Commission expects, the “four As” approach to resolution, and why procedural fairness matters to everyone involved.',
    category: 'For providers',
    publishedAt: '2026-10-13T10:50:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/mental-health-3.jpg',
    coverAlt: 'Two people talking on a sofa in a living room',
    source: { label: 'NDIS Commission: Complaints about supports and services you provide', url: ndisc('/complaints/complaints-about-supports-and-services-you-provide'), date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: NDIS Code of Conduct', url: ndisc('/rules-and-standards/ndis-code-conduct') },
      { label: 'NDIS Commission: Report an issue or make a complaint', url: ndisc('/complaints/report') },
    ],
    keyPoints: [
      'All NDIS providers are expected to have effective complaints management and resolution practices; for registered providers it is a condition of registration.',
      'Threatening someone, or trying to stop them from complaining, is against the law and can result in penalties.',
      'Many people who complain want one or more of four things: acknowledgment, answers, action and an apology.',
    ],
    sections: [
      {
        heading: 'What is expected',
        paragraphs: [
          'The Commission says all NDIS providers are expected to have effective complaints management and resolution practices, and registered providers must have a documented complaints management and resolution system as a condition of registration. The Code of Conduct requires every provider to act promptly when someone raises a concern about the quality and safety of supports.',
          'Your approach should be proportionate: suitable for the size of your organisation and the complexity of the supports you provide, and designed so people with disability can complain and feel safe doing so.',
        ],
      },
      {
        heading: 'Prepare before a complaint arrives',
        paragraphs: [
          'Make it easy to complain. The Commission describes documented, transparent processes for submitting complaints, including the ability to complain anonymously and through platforms and languages that are accessible to participants and staff. Tell participants how to make a complaint to you and to the Commission, and train staff in what to do when one is made.',
          'Making threats, or trying to stop someone complaining, directly or indirectly, is against the law and can result in penalties. A safe, welcoming space where people can share worries freely is the aim, not a formality.',
        ],
      },
      {
        heading: 'When one arrives: the four As',
        paragraphs: [
          'The Commission points to an approach it calls the four As, because most people who complain hope for one or more of these outcomes: acknowledgment, answers, action and an apology. Acknowledge quickly that you have heard it, give a straight answer about what happened and what you will do, act on it, and apologise where an apology is due.',
          'Two things matter most: how you respond, so that the participant feels informed, safe and involved, and how it is resolved, quickly and fairly. Keep the person who complained, and the person affected if that is someone else, involved and updated on decisions and actions.',
        ],
      },
      {
        heading: 'Fairness for everyone involved',
        paragraphs: [
          'Procedural fairness means the person complaining has a reasonable opportunity to present their complaint, has it understood, and does not have it dismissed because of details that were not raised or known to you. It also applies to workers who are the subject of a complaint, who should be treated fairly as well.',
          'Respect the person’s right to make decisions about their own life while you resolve things, and refer a complaint on when you should, for example to law enforcement where it is possible that a criminal offence has been committed.',
        ],
      },
      {
        heading: 'Record it and learn from it',
        paragraphs: [
          'Record complaints and what was done, store the records privately, and review them regularly to see patterns. Feedback and complaints are among the most useful information you will get about how your service is experienced. If someone is not satisfied with how you handled it, they can take it to the NDIS Commission, so a clear record of what you did will matter. General information only; the Commission’s guidelines on effective complaint handling go further.',
        ],
      },
    ],
  },
  {
    slug: 'writing-a-provider-profile-that-helps-people-choose-you',
    title: 'Writing a provider profile that helps people choose you',
    summary: 'People comparing providers want specific, checkable answers. What to put in a profile, what to keep current, and what to leave out so that your listing is honest and useful.',
    category: 'For providers',
    publishedAt: '2026-10-13T11:00:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/multicultural-3.jpg',
    coverAlt: 'A smiling woman in a white t-shirt',
    source: { label: 'NDIS: Working with providers', url: `${NDIS}/participants/working-providers`, date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: NDIS Code of Conduct', url: ndisc('/rules-and-standards/ndis-code-conduct') },
      { label: 'NDIS Commission: Fair pricing', url: ndisc('/rules-and-standards/ndis-code-conduct/fair-pricing') },
    ],
    keyPoints: [
      'Answer the questions people actually ask: what you provide, where, when, how you charge and how they can reach you.',
      'Accuracy beats polish. Out-of-date service areas or availability waste both sides’ time.',
      'Be honest about registration status and do not use claims you cannot support. The Code of Conduct expects integrity, honesty and transparency.',
    ],
    sections: [
      {
        heading: 'Write for someone comparing two or three providers',
        paragraphs: [
          'A person choosing a provider usually has a short list and a set of questions: do you provide exactly this support, who would deliver it, what days and times, where you work, how you charge, and what happens if something goes wrong. Our guide to choosing a provider lists twelve of them. A profile that answers those questions in plain language makes the decision easy to make in your favour, or easy to rule out early, and both are good outcomes.',
        ],
      },
      {
        heading: 'What to include',
        paragraphs: [
          'Say what you provide and for whom, in the words a participant would use. Name the suburbs or regions you actually cover and the days and hours you can work. Say how funding can be arranged, for example whether you work with self-managed, plan-managed and NDIA-managed participants. State your registration status clearly and say which support types you are registered for if you are registered.',
          'Give a straightforward way to enquire and say what happens next. If you have conditions, such as minimum shift lengths or travel charges, say so up front, because it saves everyone time and avoids a hard conversation later.',
        ],
      },
      {
        heading: 'Keep it current',
        paragraphs: [
          'A profile is a promise about the present. When service areas, funding types or availability change, change the profile. On SolDirectory, your listing shows the service areas, funding types and registration status you enter, and member providers confirm each week that they are taking referrals, so that people are not directed to a provider that has no capacity.',
          'If you stop taking new referrals, say so. A short, honest “not taking new participants in this area at the moment” is more useful to everyone than a profile that implies availability.',
        ],
      },
      {
        heading: 'Be careful with claims',
        paragraphs: [
          'The Code of Conduct expects integrity, honesty and transparency, and prices that can be justified. Avoid “best”, “guaranteed” and other claims you cannot substantiate, and do not describe registration or qualifications in a way that overstates them. A listing is not a guarantee of work, and a profile is not an endorsement.',
          'Respect privacy as well. Do not publish participant names, photos or stories without clear consent, and check that anything you publish is not identifiable.',
        ],
      },
      {
        heading: 'Make the next step easy',
        paragraphs: [
          'Say who will respond and how quickly you aim to. Keep contact details current, check your enquiry inbox, and set up notifications so a new request does not wait. Our guide to responding to enquiries covers what to say in a first reply. General information only.',
        ],
      },
    ],
  },
  {
    slug: 'responding-to-enquiries-a-practical-checklist-for-ndis-and-aged-care-providers',
    title: 'Responding to enquiries: a practical checklist for NDIS and aged care providers',
    summary: 'An enquiry is a person asking for information, not a booking. How to reply quickly and respectfully, what to put in a first message, and how to decline well when you cannot help.',
    category: 'For providers',
    publishedAt: '2026-10-13T11:10:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/language-asia-pacific.jpg',
    coverAlt: 'Two women chatting and laughing by a lake',
    source: { label: 'NDIS Commission: NDIS Code of Conduct', url: ndisc('/rules-and-standards/ndis-code-conduct'), date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: Fair pricing', url: ndisc('/rules-and-standards/ndis-code-conduct/fair-pricing') },
      { label: 'NDIS: Working with providers', url: `${NDIS}/participants/working-providers` },
    ],
    keyPoints: [
      'An enquiry is a request for information. It is not an exclusive referral, a confirmed client or a booking.',
      'A good first reply says who you are, whether you can help, when you could start, what it would cost and what happens next.',
      'Respect the person’s right to decide. Do not pressure, and say plainly when you cannot help.',
    ],
    sections: [
      {
        heading: 'What an enquiry is',
        paragraphs: [
          'An enquiry is a person, or someone acting for them, asking about support. It is not an exclusive referral or a booking, and several providers may receive the same enquiry. The person decides who to contact back, so the way you reply is part of what they are choosing.',
        ],
      },
      {
        heading: 'Reply quickly, and say something useful',
        paragraphs: [
          'Reply as soon as you reasonably can, because people are often contacting several providers at once and waiting without news is stressful. A first reply that says who you are, whether you can provide the support asked for, in which area and on which days, when you could start, indicative costs, and the next step is more useful than a long brochure.',
          'If you need more information, ask for what you need and explain why, and avoid asking for details that are not necessary at this stage. Contact details and information in an enquiry are private, and should only be used to respond to it.',
        ],
      },
      {
        heading: 'Be open about cost',
        paragraphs: [
          'Cost is often the question people are most hesitant to ask. Offer it. Say what you charge, what is and is not included, and how invoicing works, and note that prices are limited for NDIA-managed and plan-managed participants. The Code of Conduct expects fair prices that you can justify, and a clear answer builds trust early.',
        ],
      },
      {
        heading: 'Respect the person’s decision',
        paragraphs: [
          'The Code of Conduct expects respect for individual rights to freedom of expression, self-determination and decision-making. In an enquiry that means giving information, answering questions honestly and letting people take time. Do not pressure someone to commit or to sign something straight away, and encourage them to compare more than one provider.',
        ],
      },
      {
        heading: 'When you cannot help',
        paragraphs: [
          'If you cannot provide the support, or have no capacity, say so quickly and politely. If you know of another provider or service that might help, say that too, or point to the NDIS provider finder or the public registers. A clear “no” helps the person move on, and many people remember providers who were honest and helpful when the answer was no.',
          'Keep a simple record of enquiries and what you replied. It helps you follow up where you promised to, and to see where enquiries are dropping off. General information only.',
        ],
      },
    ],
  },
];
