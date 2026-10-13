/**
 * Plain-English definitions of the terms people meet in NDIS and aged care. Each definition restates what the site's own
 * articles say (which are written from the official pages they cite), and links to the article for the detail. Nothing
 * here is advice, and nothing that changes often is stated as a number: for prices, thresholds and dates the reader is
 * sent to the official page through the article.
 *
 * `to` is a site path. Order does not matter: the page sorts entries and groups them by first letter.
 */
const blog = (slug) => `/blog/${slug}`;

export const GLOSSARY = [
  {
    term: 'ABN (Australian Business Number)',
    definition: 'An 11-digit number that identifies a business to government and the community. Independent workers who invoice for their work often need one, but not everyone is entitled to one, so it is worth checking before you apply.',
    to: blog('abn-tax-and-insurance-for-independent-support-workers-what-to-sort-out'),
    label: 'ABN, tax and insurance for independent workers',
  },
  {
    term: 'Aged care assessment',
    definition: 'An assessment that works out which government-funded aged care services a person is eligible for and how quickly. It is the gateway to most government-funded aged care, and it is usually done at home by a trained assessor.',
    to: blog('getting-an-aged-care-assessment-what-to-expect'),
    label: 'What to expect from an aged care assessment',
  },
  {
    term: 'Assistive technology',
    definition: 'Equipment that helps a person do something they would otherwise find difficult or impossible, from simple aids around the home to mobility equipment and communication devices. To be funded by the NDIS it generally has to relate to the person’s disability and be considered reasonable and necessary.',
    to: blog('assistive-technology-and-the-ndis-where-to-start'),
    label: 'Assistive technology and the NDIS',
  },
  {
    term: 'Capacity Building supports',
    definition: 'NDIS supports that build skills and independence over time, such as therapies, support coordination, help with finding work and skills training. These budgets are typically tied to specific purposes, so funds in one category usually cannot be moved to another.',
    to: blog('ndis-core-capacity-building-and-capital-supports-explained'),
    label: 'Core, Capacity Building and Capital supports',
  },
  {
    term: 'Capital supports',
    definition: 'Larger, one-off or less frequent NDIS items such as assistive technology, home modifications and specialist housing. They are usually funded for a specific item or purpose and may need assessments or quotes before they are approved.',
    to: blog('ndis-core-capacity-building-and-capital-supports-explained'),
    label: 'Core, Capacity Building and Capital supports',
  },
  {
    term: 'Claim',
    definition: 'A request for payment for a support that has been delivered. It is usually made by a provider or plan manager, or by a self-managed participant. The NDIA has said claims made more than 90 days after a support was delivered receive additional checks from 15 October 2026.',
    to: blog('ndis-claims-after-90-days-from-15-october-2026'),
    label: 'NDIS claims over 90 days',
  },
  {
    term: 'Code of Conduct (NDIS)',
    definition: 'Eight commitments that apply to registered and unregistered NDIS providers, their key personnel and workers: respect individual rights, respect privacy, provide safe and competent supports, act with integrity, honesty and transparency, raise and act on concerns, prevent and respond to violence, exploitation, neglect and abuse and to sexual misconduct, and not charge higher prices without reasonable justification.',
    to: blog('ndis-code-of-conduct-for-support-workers-what-it-means-in-everyday-work'),
    label: 'The Code of Conduct in everyday work',
  },
  {
    term: 'Commonwealth Home Support Program (CHSP)',
    definition: 'An aged care program under which you agree fees with your provider before services start, without an income and assets assessment. It works differently from Support at Home, so ask which applies to you.',
    to: blog('aged-care-costs-what-you-may-be-asked-to-contribute'),
    label: 'Aged care costs',
  },
  {
    term: 'Contractor (independent)',
    definition: 'A person who provides services to another person or business instead of being employed by them. Contractors usually negotiate their own fees and working arrangements and can work for more than one client, and they do not have the same rights and obligations as employees.',
    to: blog('independent-contractor-or-employee-getting-your-support-work-arrangement-right'),
    label: 'Contractor or employee?',
  },
  {
    term: 'Core supports',
    definition: 'NDIS supports for everyday activities: personal care, household tasks, consumables, transport and taking part in social and community life. This is usually the largest part of a budget and often the most flexible.',
    to: blog('ndis-core-capacity-building-and-capital-supports-explained'),
    label: 'Core, Capacity Building and Capital supports',
  },
  {
    term: 'Facilitation or brokerage',
    definition: 'An arrangement in which an unregistered provider, a sole trader or a subcontracted worker delivers supports under another provider’s registration. The registered provider claims payment, is responsible for the supports delivered, and must make the arrangement clear to participants.',
    to: blog('registered-or-unregistered-which-path-suits-your-ndis-support-business'),
    label: 'Registered or unregistered?',
  },
  {
    term: 'Fair pricing',
    definition: 'The Code of Conduct expectation that a provider does not charge or represent higher prices for NDIS participants without reasonable justification. Pricing is fair when there is no major price difference between what an NDIS participant pays and what other customers pay.',
    to: blog('setting-your-rates-ndis-price-limits-and-fair-pricing-for-independent-workers'),
    label: 'Price limits and fair pricing',
  },
  {
    term: 'Incident',
    definition: 'An act, omission, event or circumstance that has or could have caused harm to a person with disability, or where a person with disability has caused serious harm or the risk of serious harm to another person. Incidents need to be identified, assessed, recorded, managed and resolved.',
    to: blog('reportable-incidents-and-incident-management-what-ndis-providers-need-to-know'),
    label: 'Reportable incidents and incident management',
  },
  {
    term: 'Incident management system',
    definition: 'The documented processes and responsibilities for managing incidents. The NDIS Commission says all NDIS providers should have one, and registered providers must have one as a condition of registration.',
    to: blog('reportable-incidents-and-incident-management-what-ndis-providers-need-to-know'),
    label: 'Reportable incidents and incident management',
  },
  {
    term: 'Key personnel',
    definition: 'People who are responsible for executive decisions, or who have authority or significant influence over planning, directing or controlling a provider’s activities. That can include a CEO, executives, managers and board members. They are assessed when a provider applies for registration.',
    to: blog('how-to-become-a-registered-ndis-provider-the-steps-and-what-to-prepare'),
    label: 'How to become a registered provider',
  },
  {
    term: 'Local area coordinator (LAC)',
    definition: 'Where the NDIA works through them, a local area coordinator helps people understand the NDIS and prepare for planning. It is a different role from a support coordinator, who is funded in a plan to help use it.',
    to: blog('support-coordination-explained-do-you-need-it'),
    label: 'Support coordination explained',
  },
  {
    term: 'Maximum price (price limit)',
    definition: 'The highest amount that can be charged for an NDIS support, set out in the NDIA’s pricing schedules. The maximum prices apply to NDIA-managed and plan-managed participants. A price limit is a ceiling, not a target.',
    to: blog('setting-your-rates-ndis-price-limits-and-fair-pricing-for-independent-workers'),
    label: 'Price limits and fair pricing',
  },
  {
    term: 'My Aged Care',
    definition: 'The Australian Government’s gateway to government-funded aged care for older people, including help at home, residential care and short-term support. It is a separate system from the NDIS, with its own rules and eligibility.',
    to: blog('ndis-or-my-aged-care-which-system-supports-you'),
    label: 'NDIS or My Aged Care?',
  },
  {
    term: 'NDIA-managed funding',
    definition: 'Funding that the NDIA manages: providers claim directly from the NDIA and the participant does not handle the money. It involves the least paperwork, but the participant is generally limited to registered providers.',
    to: blog('self-managed-plan-managed-or-ndia-managed-how-to-decide'),
    label: 'Self-managed, plan-managed or NDIA-managed',
  },
  {
    term: 'NDIS Quality and Safeguards Commission',
    definition: 'The national regulator for the quality and safety of NDIS supports. It registers providers, oversees compliance with the Code of Conduct and the Practice Standards, and handles complaints about providers and workers.',
    to: blog('making-a-complaint-about-an-ndis-provider-or-worker'),
    label: 'Making a complaint',
  },
  {
    term: 'Nominee',
    definition: 'A person formally appointed with the NDIA to act on a participant’s behalf. There are different kinds: some nominees can make decisions about the plan and others can only receive correspondence. It is different from an informal supporter who helps without a formal role.',
    to: blog('nominees-and-supporters-helping-someone-with-their-ndis-plan'),
    label: 'Nominees and supporters',
  },
  {
    term: 'NDIA (National Disability Insurance Agency)',
    definition: 'The Australian Government agency that runs the NDIS. It approves plans and funding, and publishes the pricing arrangements for supports.',
    to: blog('ndis-jargon-explained-terms-you-will-hear'),
    label: 'NDIS jargon explained',
  },
  {
    term: 'NDIS Practice Standards',
    definition: 'The quality standards registered providers must meet. They are organised into modules, such as a core module for higher-risk supports and a verification module for lower-risk supports, each with outcomes and quality indicators that auditors use.',
    to: blog('ndis-practice-standards-in-plain-english-for-new-providers'),
    label: 'The Practice Standards in plain English',
  },
  {
    term: 'Participant',
    definition: 'A person with an approved NDIS plan.',
    to: blog('ndis-jargon-explained-terms-you-will-hear'),
    label: 'NDIS jargon explained',
  },
  {
    term: 'Plan',
    definition: 'The NDIS document that sets out a participant’s goals and the funding for supports to help them reach those goals. It also records how each part of the funding is managed.',
    to: blog('your-first-month-with-a-new-ndis-plan'),
    label: 'Your first month with a new plan',
  },
  {
    term: 'Plan manager (plan management)',
    definition: 'A person or business that pays a participant’s provider invoices from their NDIS funding, keeps track of the budget and gives regular statements. A plan manager does not choose supports, find providers or change the plan.',
    to: blog('what-does-an-ndis-plan-manager-do-and-how-to-choose-one'),
    label: 'What an NDIS plan manager does',
  },
  {
    term: 'Plan review',
    definition: 'A look at how a plan has worked and what has changed in a person’s life, so that the next plan reflects their needs. Arriving with recent reports and a clear picture of what was used and what was not makes it go better.',
    to: blog('how-to-prepare-for-an-ndis-plan-review'),
    label: 'How to prepare for a plan review',
  },
  {
    term: 'Plan variation',
    definition: 'A change to an existing plan. The NDIA says a participant can ask for a plan change when there has been a significant and ongoing change, such as in daily activities, living arrangements, education or employment, or available informal supports.',
    to: blog('ndis-budget-changes-october-2026-what-to-check'),
    label: 'NDIS budget changes from October 2026',
  },
  {
    term: 'Quality audit',
    definition: 'An independent assessment by an approved quality auditor against the relevant Practice Standards, carried out as part of NDIS provider registration. A verification audit is a desktop review for lower-risk supports; a certification audit is for higher-risk supports and includes an on-site stage.',
    to: blog('ndis-quality-audits-verification-or-certification-what-to-expect'),
    label: 'Verification or certification audits',
  },
  {
    term: 'Reasonable and necessary',
    definition: 'The test used to decide whether a support can be funded by the NDIS. Broadly, it asks whether the support relates to the person’s disability and helps them pursue their goals, among other criteria set by the NDIA.',
    to: blog('ndis-jargon-explained-terms-you-will-hear'),
    label: 'NDIS jargon explained',
  },
  {
    term: 'Registered NDIS provider',
    definition: 'A provider that has applied to the NDIS Commission, been audited against the relevant Practice Standards, been assessed as suitable (along with its key personnel) and been issued a certificate of registration. Registration is generally for three years, and registered providers appear on the NDIS Provider Register.',
    to: blog('registered-or-unregistered-ndis-provider-what-it-means'),
    label: 'Registered or unregistered providers',
  },
  {
    term: 'Registered supporter (aged care)',
    definition: 'Someone you choose to help you communicate your wishes and make decisions about aged care, and who is formally registered under the new Aged Care Act. A registered supporter is different from a person legally appointed as a decision-maker.',
    to: blog('registered-supporters-in-aged-care-helping-someone-decide'),
    label: 'Registered supporters in aged care',
  },
  {
    term: 'Reportable incident',
    definition: 'A defined kind of incident that registered providers must notify to the NDIS Commission. Deaths, serious injuries, abuse or neglect, unlawful sexual or physical contact or assault, and sexual misconduct must be reported within 24 hours; unauthorised use of a restrictive practice within five business days, or 24 hours if it caused harm.',
    to: blog('reportable-incidents-and-incident-management-what-ndis-providers-need-to-know'),
    label: 'Reportable incidents',
  },
  {
    term: 'Respite care',
    definition: 'A short break for the person receiving care and the person caring for them. It can be a few hours, days or weeks, at home, in the community or in an aged care home, and it is often planned in advance.',
    to: blog('respite-care-a-break-for-you-and-your-carer'),
    label: 'Respite care',
  },
  {
    term: 'Self-managed funding',
    definition: 'Funding that the participant manages: they pay providers, keep records and submit claims. It offers the most choice and flexibility, including the use of unregistered providers, and the most responsibility.',
    to: blog('self-managed-plan-managed-or-ndia-managed-how-to-decide'),
    label: 'Self-managed, plan-managed or NDIA-managed',
  },
  {
    term: 'Service agreement',
    definition: 'A written agreement between a provider and a participant on the supports to be provided and the conditions around them, including price, schedule, cancellations and how either side can end it.',
    to: blog('ndis-service-agreement-what-to-check-before-you-sign'),
    label: 'What to check before you sign',
  },
  {
    term: 'Specialist Disability Accommodation (SDA)',
    definition: 'Housing designed or modified for people with very high support needs or extreme functional impairment. SDA is about the building; it is funded separately from the support delivered inside the home.',
    to: blog('sda-and-sil-explained-the-difference'),
    label: 'SDA and SIL explained',
  },
  {
    term: 'Statement of Rights (aged care)',
    definition: 'The statement of rights under the new Aged Care Act, which began on 1 November 2025 and replaced the Charter of Aged Care Rights. Registered providers must give you a copy and help you understand it.',
    to: blog('aged-care-rights-and-making-a-complaint'),
    label: 'Aged care rights and complaints',
  },
  {
    term: 'Supported Independent Living (SIL)',
    definition: 'Help with daily tasks, such as personal care, meals and routines, in a shared or individual home. SIL is about the support rather than the building, and it is a support that must be delivered by a registered provider.',
    to: blog('sda-and-sil-explained-the-difference'),
    label: 'SDA and SIL explained',
  },
  {
    term: 'Support at Home',
    definition: 'The Australian Government program that helps older people keep living at home with services and equipment. It began in November 2025 and replaced the Home Care Packages Program and the Short-term Restorative Care Programme.',
    to: blog('support-at-home-explained-how-in-home-aged-care-works'),
    label: 'Support at Home explained',
  },
  {
    term: 'Support coordination',
    definition: 'Funding in an NDIS plan for a person to help put the plan into action: explaining what it allows, finding and arranging providers and helping with service agreements.',
    to: blog('support-coordination-explained-do-you-need-it'),
    label: 'Support coordination explained',
  },
  {
    term: 'Support item',
    definition: 'A line in the NDIA’s pricing schedules, with a support item number and name and separate national, remote and very remote maximum prices. Invoices for plan-managed supports usually refer to the support item.',
    to: blog('setting-your-rates-ndis-price-limits-and-fair-pricing-for-independent-workers'),
    label: 'Price limits and fair pricing',
  },
  {
    term: 'Unregistered NDIS provider',
    definition: 'A provider that has not gone through NDIS registration. It can deliver supports that do not require registration, but only to participants who self-manage or plan-manage their funding. The Code of Conduct still applies.',
    to: blog('registered-or-unregistered-which-path-suits-your-ndis-support-business'),
    label: 'Registered or unregistered?',
  },
  {
    term: 'Worker screening check (NDIS)',
    definition: 'An assessment, carried out by a state or territory worker screening unit, of whether a worker poses a risk to people with disability. The outcome is cleared or excluded. A check is national and is valid for up to five years.',
    to: blog('ndis-worker-screening-check-who-needs-one-and-how-it-works'),
    label: 'The Worker Screening Check explained',
  },
];
