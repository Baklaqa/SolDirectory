/**
 * Meta descriptions for the articles whose card summary is longer than a search snippet (158 characters). Each is a
 * complete sentence or two restating the same article, so the snippet never ends in a cut-off "…". An article that is
 * not listed here uses its summary as it is. The summary stays as the longer text shown on article cards.
 *
 * Keep each entry at 158 characters or fewer; the check lives in apps/api/scripts or run:
 *   node -e "import('@soldirectory/topic-content').then(m=>console.log(m.EDITORIAL_BLOG_POSTS.filter(p=>(p.seoDescription??p.summary).length>158).map(p=>p.slug)))"
 */
export const BLOG_SEO_DESCRIPTIONS = {
  'how-to-choose-an-ndis-provider-questions-to-ask':
    'A practical checklist of 12 questions for comparing NDIS providers, from how a service fits your plan to what happens when something goes wrong.',
  'ndis-budget-changes-october-2026-what-to-check':
    'Some budgets in two NDIS support categories are changing as plans are created, reassessed or renewed. Here is how to check what it means for a plan.',
  'ndis-claims-after-90-days-from-15-october-2026':
    'From 15 October 2026 the NDIA may apply extra checks to claims made over 90 days after a support. What participants, providers and plan managers should check.',
  'ndis-portal-maintenance-10-11-october-2026':
    'The NDIA scheduled a seven-hour overnight outage affecting participant and provider systems. Check the official notice before relying on portal access.',
  'registered-or-unregistered-ndis-provider-what-it-means':
    'Registered and unregistered providers can both be legitimate, but the rules, checks and options for your plan differ. Here is how to think about it.',
  'sda-and-sil-explained-the-difference':
    'Specialist Disability Accommodation and Supported Independent Living are often mentioned together but are different supports. Here is the difference, plainly.',
  'nursing-and-health-supports-at-home-what-the-ndis-covers':
    'The NDIS funds supports related to disability, while the health system covers other care. Here is where the boundary sits and what to ask a nurse or provider.',
  'starting-as-an-independent-support-worker-what-to-set-up-first':
    'Working for yourself brings freedom and responsibility. A checklist of the checks, paperwork and boundaries to get right before your first client.',
  'ndis-worker-screening-check-who-needs-one-and-how-it-works':
    'A plain-English guide to the NDIS Worker Screening Check for independent workers and small providers: who needs one, how to apply, and what happens next.',
  'ndis-code-of-conduct-for-support-workers-what-it-means-in-everyday-work':
    'The Code of Conduct applies to registered and unregistered providers and the workers who deliver NDIS supports. What it looks like on an ordinary shift.',
  'independent-contractor-or-employee-getting-your-support-work-arrangement-right':
    'Calling someone a contractor does not make them one. How the Fair Work Ombudsman describes the difference, and the questions to ask before you agree.',
  'service-agreements-notes-and-invoices-the-paperwork-independent-workers-need':
    'Good paperwork protects you and the person you support: an agreement, simple notes, a written incident process and invoices that match what was delivered.',
  'how-to-become-a-registered-ndis-provider-the-steps-and-what-to-prepare':
    'Registration is an application, an independent quality audit and a suitability assessment. The sequence, what to have ready, and where costs and delays sit.',
  'registered-or-unregistered-which-path-suits-your-ndis-support-business':
    'Some supports can only be delivered by registered providers, others either way. What each path allows, what it asks of you, and a third option.',
  'ndis-quality-audits-verification-or-certification-what-to-expect':
    'The audit is the part of registration most providers worry about. The two main audit types, what the auditor looks at, and how to prepare.',
  'ndis-practice-standards-in-plain-english-for-new-providers':
    'The Practice Standards are what registered providers are audited against. How they are organised, which modules apply to whom, and using them as a checklist.',
  'reportable-incidents-and-incident-management-what-ndis-providers-need-to-know':
    'How you respond to an incident is what is judged. Incident versus reportable incident, the timeframes, and a simple process to follow.',
  'handling-complaints-well-a-guide-for-ndis-providers':
    'A complaint handled well can strengthen a relationship. What the Commission expects, the “four As” approach, and why procedural fairness matters.',
  'writing-a-provider-profile-that-helps-people-choose-you':
    'People comparing providers want specific, checkable answers. What to put in a profile, what to keep current, and what to leave out to stay honest.',
  'responding-to-enquiries-a-practical-checklist-for-ndis-and-aged-care-providers':
    'An enquiry is a person asking for information, not a booking. How to reply quickly and respectfully, what to put in a first message, and how to decline well.',
};
