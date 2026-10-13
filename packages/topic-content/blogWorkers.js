/**
 * Guides for independent support workers: the business and compliance side of working for yourself.
 * Same editorial rules as blogGuides.js: original writing, each source page opened and read on the checked date,
 * nothing that changes often is stated as a number, and every article says what to confirm for the reader's own case.
 */
const CHECKED = '2026-10-13T09:00:00+11:00';
const NDISC = 'https://www.ndiscommission.gov.au';
const ndisc = (path) => `${NDISC}${path}`;
const NDIS = 'https://www.ndis.gov.au';
const GUIDANCE = 'Current guidance page';

export const WORKER_POSTS = [
  {
    slug: 'ndis-worker-screening-check-who-needs-one-and-how-it-works',
    title: 'NDIS Worker Screening Check: who needs one, how to apply and how long it lasts',
    summary: 'A plain-English guide to the NDIS Worker Screening Check for independent workers and small providers: when one is required, how to apply, and what happens after a decision.',
    category: 'For workers',
    publishedAt: '2026-10-13T09:00:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/therapy-3.jpg',
    coverAlt: 'Two professionals standing together in a therapy room',
    source: { label: 'NDIS Commission: Worker screening', url: ndisc('/workforce/worker-screening'), date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: Worker screening for unregistered providers', url: ndisc('/workforce/worker-screening/worker-screening-unregistered-providers') },
      { label: 'NDIS Commission: NDIS Code of Conduct', url: ndisc('/rules-and-standards/ndis-code-conduct') },
    ],
    keyPoints: [
      'It is a national check, carried out by the worker screening unit in your state or territory for the NDIS Commission, and it ends in a “cleared” or “excluded” decision.',
      'Whether you need one depends on who engages you: registered providers must have workers in risk-assessed roles screened, while unregistered providers and self-managed participants can choose to require it.',
      'A check lasts up to five years, can be renewed from 90 days before it expires, and is recognised in every state and territory.',
    ],
    sections: [
      {
        heading: 'What the check is',
        paragraphs: [
          'An NDIS Worker Screening Check is an assessment, made by a state or territory worker screening unit on behalf of the NDIS Quality and Safeguards Commission, of whether a worker poses a risk to people with disability. The outcome is that the worker is either cleared or excluded from working in certain roles.',
          'The check is national. You apply to the unit in the state or territory where you live, you only ever apply in one jurisdiction, and the decision is recorded in a national NDIS worker screening database that organisations with access can use to confirm your status.',
        ],
      },
      {
        heading: 'Who needs one',
        paragraphs: [
          'The Commission describes the requirement by arrangement. An employee, volunteer, contractor or student needs a check if they work for a registered provider in a risk-assessed role or key personnel role, for a registered provider that has decided every worker needs one, or for an unregistered provider that has decided its workers need one.',
          'Self-employed workers and sole traders need one if they are themselves a registered provider, or if they support a self-managed participant who has decided that everyone they engage must hold one. Unregistered providers are not legally required to ask for a check, although the Commission recommends they do, and self-managed and plan-managed participants can decide whether the workers who support them must have one.',
          'In practice that means the answer sits with the person or organisation engaging you. Ask what they require before you apply, and expect that some will ask for a check even where the law does not.',
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Apply or renew with the worker screening unit in your state or territory. The application asks for your employer’s details, and for a first application or a renewal you must include them: you either enter the employer’s NDIS Commission employer ID, which you get from them, or search for them in the online form. Sole traders and self-employed workers follow separate instructions from the Commission for this step.',
          'Applying costs money, so providers are asked to hand out their employer ID only when they genuinely intend to engage you. If you are unsure whether an arrangement will go ahead, ask before you pay for a check.',
          'Some states and territories let a worker start with a registered provider while a decision is pending, but not all do, and a worker who has an interim bar must not work with people with disability while they wait.',
        ],
      },
      {
        heading: 'After the decision, and when it expires',
        paragraphs: [
          'You do not upload your check anywhere. You give your worker screening number to the organisation, and once you are linked to them they can confirm your current status in the database. A check is valid for up to five years unless it is cancelled or revoked, and you can renew up to 90 days before it expires.',
          'It is nationally recognised, so you do not need to reapply if you move to another state or territory, or if your business structure changes, for example from a sole trader to a company. You only reapply if your check expires or is cancelled.',
          'The statuses an organisation can see are a current clearance, pending, interim bar, exclusion, suspension and no valid clearance. An interim bar, an exclusion or a suspension all mean the worker must not work in the relevant roles.',
        ],
      },
      {
        heading: 'Related checks and what to do next',
        paragraphs: [
          'The NDIS check is not the same thing as a Working with Children Check, and your state or territory unit can tell you whether your role needs both. Other things may be asked of you as well, such as first aid training, professional registration, or the Commission’s online worker orientation module, which is mandatory for staff of registered providers.',
          'Keep your worker screening number, expiry date and a renewal reminder in one place. This article is general information; the requirement for your role depends on who engages you, so check the Commission’s page and your state or territory unit.',
        ],
      },
    ],
  },
  {
    slug: 'ndis-code-of-conduct-for-support-workers-what-it-means-in-everyday-work',
    title: 'The NDIS Code of Conduct for support workers: what it means in everyday work',
    summary: 'The Code of Conduct applies to registered and unregistered providers and to the workers who deliver NDIS supports. Here is what each commitment looks like on an ordinary shift.',
    category: 'For workers',
    publishedAt: '2026-10-13T09:10:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/community-3.jpg',
    coverAlt: 'A group of friends smiling together outdoors',
    source: { label: 'NDIS Commission: NDIS Code of Conduct', url: ndisc('/rules-and-standards/ndis-code-conduct'), date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: Fair pricing', url: ndisc('/rules-and-standards/ndis-code-conduct/fair-pricing') },
    ],
    keyPoints: [
      'The Code applies to registered and unregistered providers, their key personnel and workers, so it covers independent workers who deliver NDIS supports.',
      'It has eight commitments, from respecting a person’s choices and privacy to raising concerns promptly and charging fairly.',
      'Raising a concern is part of the Code, not a breach of loyalty: providers are not allowed to threaten anyone for raising one.',
    ],
    sections: [
      {
        heading: 'Who it applies to',
        paragraphs: [
          'The Code of Conduct must be followed by registered providers, their key personnel and workers, and by unregistered providers, their key personnel and workers. It also applies to providers delivering information, linkages and capacity building activities. If you deliver NDIS supports, whether you work for an organisation or on your own, it applies to you.',
          'The Code sets out expected conduct, behaviour and culture. It is written into the National Disability Insurance Scheme (Code of Conduct) Rules 2018, and the Commission can take action where it is breached.',
        ],
      },
      {
        heading: 'Respect, privacy and safe, skilled support',
        paragraphs: [
          'The first commitments are about the person. Act with respect for their rights to freedom of expression, self-determination and decision-making. On a shift that means offering choices and accepting a person’s decision even when you would have chosen differently, unless safety requires otherwise and the proper process is followed.',
          'Respect the privacy of people with disability. That covers what you say about a person to others, what you write down, and what you post online. Do not share names, photos or stories about participants without their permission.',
          'Provide supports in a safe and competent manner, with care and skill. Say so when something is outside your training or experience, and do not agree to tasks you are not prepared or qualified to do.',
        ],
      },
      {
        heading: 'Honesty, concerns and protection from harm',
        paragraphs: [
          'Act with integrity, honesty and transparency. In practice that includes being accurate about your qualifications, your hours and what you are charging, and being open with the person about who is responsible for what.',
          'Promptly take steps to raise and act on concerns about matters that might affect the quality and safety of supports. Take all reasonable steps to prevent and respond to violence, exploitation, neglect and abuse, and to prevent and respond to sexual misconduct. These are not only about what you do yourself: they include what you notice and what you do about it.',
        ],
      },
      {
        heading: 'Fair pricing',
        paragraphs: [
          'The last commitment is not to charge or represent higher prices for goods or supplies for NDIS participants without a reasonable justification. The Commission explains fairness as no major price difference between what an NDIS participant pays and what other customers pay for the same thing, and asks providers to be able to justify their prices.',
          'If you set your own rates, keep a note of how you arrived at them so you can explain them to a participant or to the Commission if asked.',
        ],
      },
      {
        heading: 'Raising concerns, and where to learn more',
        paragraphs: [
          'Anyone can raise a concern about the safety or quality of NDIS supports, and providers must make participants feel safe to discuss issues with them. They must not threaten someone for raising a concern or complaint. Concerns about a possible breach of the Code can be reported to the Commission through its report an issue or make a complaint process.',
          'The Commission publishes short videos on each part of the Code, a guide to the Code for workers, the NDIS Workforce Capability Framework and an online worker orientation module, “Quality, safety and you”, which is mandatory for staff of registered providers and useful for every worker.',
        ],
      },
    ],
  },
  {
    slug: 'abn-tax-and-insurance-for-independent-support-workers-what-to-sort-out',
    title: 'ABN, tax and insurance for independent support workers: what to sort out first',
    summary: 'Working for yourself means the business basics are yours: an ABN, tax, super, records and insurance. A calm checklist, and where to confirm each point.',
    category: 'For workers',
    publishedAt: '2026-10-13T09:20:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/employment-3.jpg',
    coverAlt: 'A woman on the phone at her desk',
    source: { label: 'Australian Business Register: Applying for an ABN', url: 'https://www.abr.gov.au/business-super-funds-charities/applying-abn', date: GUIDANCE },
    additionalSources: [
      { label: 'ATO: Starting, registering or closing a business', url: 'https://www.ato.gov.au/businesses-and-organisations/starting-registering-or-closing-a-business' },
      { label: 'Fair Work Ombudsman: Independent contractors', url: 'https://www.fairwork.gov.au/find-help-for/independent-contractors' },
    ],
    keyPoints: [
      'An ABN is an 11-digit number, and not everyone is entitled to one, so check that you really are running a business before you apply.',
      'Tax, GST and super become your responsibility when you are not paid through an employer. Confirm what applies with the ATO or a registered tax agent.',
      'There is no single insurance rule we can point to for every arrangement, so ask the person engaging you what cover they expect and ask an insurer what suits the work you do.',
    ],
    sections: [
      {
        heading: 'First, are you actually running a business?',
        paragraphs: [
          'Independent work usually means you invoice the people you work for instead of being paid wages, you decide how the work is done, and you can take on more than one client. If that describes you, you are likely to need an Australian Business Number. If you are in fact an employee of one organisation in all but name, the position is different, so read our guide to contractor and employee arrangements before you apply.',
          'The Australian Business Register is clear that not everyone is entitled to an ABN. It warns that applying for an ABN, registering for GST and claiming GST refunds when you are not entitled can lead to prosecution or criminal charges, and that your entitlement can be reviewed at any time, when you may be asked for evidence that you started, or took steps to start, a business.',
        ],
      },
      {
        heading: 'Getting an ABN',
        paragraphs: [
          'The ABN is an 11-digit number that identifies your business to government and the community. You apply through the Australian Business Register. If the application is successful you receive the number straight away, and you can then apply for other registrations such as GST. If the register needs to check something you receive a reference number instead, and it aims to review within 20 business days.',
          'Your application is processed faster when the register can identify you from the details you give, such as your tax file number. Your details are added to the register, which is public, and you can ask for certain details not to be disclosed if you have privacy concerns. It is then your job to keep them up to date.',
        ],
      },
      {
        heading: 'Tax, GST and super',
        paragraphs: [
          'Without an employer taking tax out of every payment, setting money aside becomes your job. A simple habit is to move a fixed share of every payment into a separate account so that tax time is not a shock. Whether you must register for GST depends on your turnover and your circumstances, and the rules, thresholds and dates are set by the Australian Taxation Office, so confirm them there rather than relying on a figure from an article.',
          'You are also responsible for your own superannuation as a sole trader. The ATO’s starting a business section is the place to begin, and a registered tax agent can set you up correctly the first time. This article is general information, not tax advice.',
        ],
      },
      {
        heading: 'Insurance',
        paragraphs: [
          'Organisations and participants may ask what cover you hold, commonly public liability and professional indemnity, and the cover that suits you depends on the supports you deliver, whether you drive participants, and who you work with. We have not found a single national rule we can cite for every independent arrangement, so do not assume one: ask whoever engages you what they expect, and ask an insurance broker or insurer what is appropriate for your work.',
          'Keep your certificate of currency with your other business documents, and check what an insurer expects you to disclose, since an error at the start can matter when you make a claim.',
        ],
      },
      {
        heading: 'Keep it separate and keep records',
        paragraphs: [
          'Use a separate bank account for business money, keep every invoice and receipt, and record kilometres if you drive for work. Those habits make tax time simpler and make it easier to show what you charged and why. Our guide to paperwork for independent workers covers service agreements, notes and invoices.',
        ],
      },
    ],
  },
  {
    slug: 'independent-contractor-or-employee-getting-your-support-work-arrangement-right',
    title: 'Independent contractor or employee? Getting your support work arrangement right',
    summary: 'Calling someone a contractor does not make them one. Here is how the Fair Work Ombudsman describes the difference, the questions to ask before you agree, and what changes if you work under another provider’s registration.',
    category: 'For workers',
    publishedAt: '2026-10-13T09:30:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/transport-3.jpg',
    coverAlt: 'Three people talking beside a van',
    source: { label: 'Fair Work Ombudsman: Independent contractors', url: 'https://www.fairwork.gov.au/find-help-for/independent-contractors', date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: About registration', url: ndisc('/provider-registration/about-registration') },
    ],
    keyPoints: [
      'Contractors usually negotiate their own fees and working arrangements and can work for more than one client; they do not have the same rights and obligations as employees.',
      'What the paperwork says is only part of it: for many businesses, how the arrangement works in practice is what decides whether someone is a contractor.',
      'If you deliver supports under a registered provider’s registration, that provider is responsible for the supports, for claiming payment and for you meeting the Code of Conduct.',
    ],
    sections: [
      {
        heading: 'Why the label matters',
        paragraphs: [
          'The Fair Work Ombudsman explains that independent contractors provide services to another person or business instead of being employed by them. They usually negotiate their own fees and working arrangements, can work for more than one client at a time, and do not have the same rights and obligations as employees.',
          'It matters because it affects tax, super, insurance, leave, who directs the work and who carries the risk. Getting it wrong can create problems for both sides, so it is worth settling before the first shift.',
        ],
      },
      {
        heading: 'What decides it',
        paragraphs: [
          'The Ombudsman lists factors that are looked at together: how much control the business has over how the work is performed, who holds the financial responsibility and risk, who supplies the tools and equipment, whether the worker can delegate or subcontract the work, how hours are set, and whether there is an expectation that the work will continue indefinitely.',
          'Which test applies depends on the business. For constitutionally covered businesses, a whole-of-relationship test has applied since 26 August 2024, which looks at how the arrangement is carried out in practice as well as at the contract. A start-of-relationship test, which focuses on what the parties agreed, applies to state-referred businesses, which include sole traders and partnerships in several states. The terms can be written, verbal or a mix, and the Ombudsman says to check which test applies to the business engaging you.',
          'The Ombudsman cannot decide for you whether someone is a contractor or an employee. It gives general guidance, and recommends legal advice if you need a firm answer.',
        ],
      },
      {
        heading: 'Questions to ask before you agree',
        paragraphs: [
          'Who decides how and when the work is done, and can you say no to a shift without consequences? Can you send someone else, or take on other clients? Who supplies equipment, and who pays if a participant cancels at short notice? Is the work expected to continue indefinitely? Would you be treated differently from the organisation’s own employees doing the same work?',
          'Write the answers into the agreement, and keep a copy. If the day-to-day reality drifts away from what the document says, raise it early.',
        ],
      },
      {
        heading: 'Working under another provider’s registration',
        paragraphs: [
          'Some providers deliver supports through facilitation or brokerage arrangements, where an unregistered provider, a sole trader or a subcontracted worker delivers supports under another provider’s registration. The NDIS Commission says that in those arrangements the registered provider must be the one that claims payment, is responsible for all supports delivered under its registration, and must make sure everyone delivering them complies with the conditions of registration, including the Code of Conduct.',
          'It also says these arrangements must be transparent to participants, so that they know who is responsible for delivering their supports. If you are engaged this way, ask what the provider expects of you, how you will be paid, and how incidents and complaints are handled.',
        ],
      },
      {
        heading: 'Where to get advice',
        paragraphs: [
          'The Fair Work Ombudsman has information and a helpline, a registered tax agent can advise on the tax side, and a community legal centre or lawyer can review a contract. This article is general information, not legal advice.',
        ],
      },
    ],
  },
  {
    slug: 'setting-your-rates-ndis-price-limits-and-fair-pricing-for-independent-workers',
    title: 'Setting your rates: NDIS price limits and fair pricing for independent workers',
    summary: 'A price limit is a ceiling, not a target. How the NDIS pricing schedules apply, when they do not, and how to set a rate you can explain.',
    category: 'For workers',
    publishedAt: '2026-10-13T09:40:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/employment.jpg',
    coverAlt: 'A woman working at a laptop in a busy office',
    source: { label: 'NDIS: Pricing arrangements', url: `${NDIS}/providers/pricing-and-payments/pricing/pricing-arrangements`, date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: Fair pricing', url: ndisc('/rules-and-standards/ndis-code-conduct/fair-pricing') },
      { label: 'NDIS Commission: NDIS Code of Conduct', url: ndisc('/rules-and-standards/ndis-code-conduct') },
    ],
    keyPoints: [
      'The NDIA’s pricing schedules set maximum prices, and they apply to NDIA-managed and plan-managed participants.',
      'They list support item numbers and separate national, remote and very remote prices, so use the item and the location that match the support you deliver.',
      'Whatever you charge, the Code of Conduct expects fair pricing: you should be able to justify any difference between the price you charge an NDIS participant and the price for other customers.',
    ],
    sections: [
      {
        heading: 'Start with who is paying',
        paragraphs: [
          'The NDIA’s pricing schedules set out the maximum prices payable for NDIS supports. At the time this article was checked, the Minister’s first pricing determination had set maximum prices for the 2026–27 financial year. The NDIA says it cannot pay a claim above the maximum price, that providers cannot charge more than it, and that participants are not entitled to a payment above it.',
          'Those maximum prices apply to NDIA-managed and plan-managed participants. They do not govern what a self-managed participant agrees to pay you, but fair pricing under the Code of Conduct still applies, so a self-managed rate still needs to be reasonable and explainable.',
        ],
      },
      {
        heading: 'Find the right support item',
        paragraphs: [
          'The schedules list support item numbers and names, with a national price and separate remote and very remote prices. Match your service to the item that describes it, and the price to the place the support is delivered, not to where you live. If an item is unclear, ask the participant’s plan manager or support coordinator which item they expect it to be claimed under.',
          'The NDIA also publishes a disability support worker cost model, which estimates the cost of delivering a billable hour of support. It is useful for understanding how much sits behind an hourly rate, and it is not a rate you are required to charge.',
        ],
      },
      {
        heading: 'What your rate has to cover',
        paragraphs: [
          'Independent workers carry costs that an employee’s wage does not: tax and super, insurance, vehicle costs, training, worker screening, admin time and unpaid time between shifts. Add those up before you decide what a sustainable hourly rate is, then check it against the price limit for the item.',
          'Treat the limit as a ceiling. A lower rate can be right for a small, simple arrangement, and a rate at the limit is only appropriate where it reflects the cost of the support. Charges such as travel or short-notice cancellations are only available where the pricing rules allow them and where they are set out in the service agreement, so read the current arrangements before you promise them.',
        ],
      },
      {
        heading: 'Fair pricing in practice',
        paragraphs: [
          'The Code of Conduct requires that you do not charge or represent higher prices for goods or services for NDIS participants without reasonable justification. The Commission says pricing is fair when there is no major price difference between the cost for an NDIS participant and for other customers, and it expects providers to be able to justify their pricing.',
          'Keep a short note of how you arrived at your rate, and be ready to explain it. If you suspect you are charging too much, review it and adjust. If you are not sure whether a difference is justifiable, that is a good reason to ask the Commission before the question is put to you.',
        ],
      },
      {
        heading: 'Put it in writing, and review it',
        paragraphs: [
          'Put your rates, what they include and what they do not in the service agreement, and tell people in advance when they change. The schedules are reissued each year and the NDIA has said updated pricing and claiming guidance documents are being published, so check the current pages before you quote. This is general information, not financial advice.',
        ],
      },
    ],
  },
  {
    slug: 'service-agreements-notes-and-invoices-the-paperwork-independent-workers-need',
    title: 'Service agreements, notes and invoices: the paperwork independent workers need',
    summary: 'Good paperwork protects you and the person you support. A practical set: an agreement, simple notes, a written incident process and invoices that match what was delivered.',
    category: 'For workers',
    publishedAt: '2026-10-13T09:50:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/why-sol-directory.jpg',
    coverAlt: 'A support worker and a woman using a walker looking at a notebook together',
    source: { label: 'NDIS Commission: NDIS Practice Standards', url: ndisc('/rules-and-standards/ndis-practice-standards'), date: GUIDANCE },
    additionalSources: [
      { label: 'NDIS Commission: Incident management', url: ndisc('/rules-and-standards/reportable-incidents-and-incident-management/incident-management') },
      { label: 'NDIS Commission: NDIS Code of Conduct', url: ndisc('/rules-and-standards/ndis-code-conduct') },
    ],
    keyPoints: [
      'A service agreement is a written agreement between the provider and the participant about the supports to be provided and the conditions around them.',
      'The Commission says all NDIS providers should have an incident management system; registered providers must, and must report reportable incidents.',
      'Invoice only for supports that were delivered, at the rate that was agreed, with enough detail for the person or their plan manager to check it.',
    ],
    sections: [
      {
        heading: 'A service agreement',
        paragraphs: [
          'The NDIS Practice Standards define a service agreement as a written agreement between the provider and the participant on the supports to be provided and the conditions surrounding those supports. Even where you are not required to follow the Practice Standards, a written agreement is the simplest way to avoid misunderstandings.',
          'A useful agreement says what you will do, when, and how often; what it costs and how you will invoice; what happens if either side cancels at short notice; how privacy is handled; how to raise a concern or complaint; and how either side can end the arrangement. Our guide to what to check before signing is written from the participant’s side and is a good checklist from yours too.',
        ],
      },
      {
        heading: 'Shift notes',
        paragraphs: [
          'Keep a short factual note of each shift: the date and times, what you did, anything that changed, and anything that worried you. Write what you saw and did rather than judgements, and avoid details that are not needed. Notes help you remember, help a replacement worker to continue the support, and can matter a great deal if something is questioned later.',
          'Store them securely, because they contain private information. A locked phone or computer and a password are the minimum, and sending identifying details through unsecured messaging apps is best avoided.',
        ],
      },
      {
        heading: 'A written process for incidents',
        paragraphs: [
          'The Commission defines an incident as an act, omission, event or circumstance that has or could have caused harm to a person with disability, or where a person with disability has caused serious harm or the risk of serious harm to another person. It says all NDIS providers should have an incident management system, and that registered providers must have one and must report certain incidents.',
          'For one worker that can be a one-page procedure: make sure everyone is safe and call 000 if someone needs urgent medical care or a crime may have happened, write down what happened as soon as you can, tell the participant or their representative, and tell the organisation or registered provider you work under straight away if there is one. If you work under another provider’s registration, they may have reporting timeframes that start from when they become aware.',
        ],
      },
      {
        heading: 'Invoices',
        paragraphs: [
          'An invoice should let the person, or their plan manager, see what was delivered without needing to ask. Include your name and ABN, the participant’s name, the date and times, the support delivered, the rate and the total, and the support item name or number where the claim is plan-managed. Invoice only for supports you actually delivered and at the rate agreed.',
          'Send invoices promptly and keep a copy. Chasing and correcting old invoices is harder than getting them right the first time.',
        ],
      },
      {
        heading: 'Privacy and how long to keep records',
        paragraphs: [
          'The Code of Conduct requires you to respect the privacy of people with disability, so share records only with people who need them. How long you must keep records depends on the arrangement and on tax rules, so ask the organisation you work under, check the Australian Taxation Office’s record-keeping guidance, and keep documents until you are certain they are no longer needed.',
        ],
      },
    ],
  },
];
