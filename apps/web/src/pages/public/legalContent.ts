/**
 * Legal page copy (developer brief: privacy policy, terms of use,
 * provider agreement, enquiry disclaimer).
 *
 * IMPORTANT — these are working DRAFTS written to describe what the
 * platform actually does today (30-day draft deletion, weekly capacity
 * confirmation, unlock quotas, and paid-plan priority). They have NOT been
 * reviewed by a lawyer. LEGAL_REVIEWED gates the on-page "draft"
 * banner; flip it to true only once counsel has signed the text off.
 * Legal-entity and contact details are injected from siteConfig, never
 * hardcoded here.
 */
export const LEGAL_REVIEWED = false;

export interface LegalSection { heading: string; body: string[] }
export interface LegalDoc { slug: string; title: string; summary: string; updated: string; sections: LegalSection[] }

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  privacy: {
    slug: 'privacy',
    title: 'Privacy policy',
    summary: 'How SolDirectory collects, uses and protects your personal information.',
    updated: 'Draft',
    sections: [
      {
        heading: 'Who we are',
        body: [
          'SolDirectory is an online directory and referral service that helps people find disability and aged-care providers. This policy explains how we handle personal information under the Privacy Act 1988 (Cth) and the Australian Privacy Principles.',
        ],
      },
      {
        heading: 'What we collect',
        body: [
          'When you use “Get matched”: your name, email address, optional phone number, the suburb where care is needed, who the care is for, your timeframe, your funding type and plan-management arrangement, the service you need, and any details you add. This can include information about a person’s disability or support needs, which is sensitive information.',
          'When you explicitly create a provider alert: your email address and the service, suburb or provider-name filters you chose. Simply searching does not create an alert or add your email to a marketing list.',
          'When a provider or worker registers: account details, business and registration details, service areas, capacity, and any logo or documents they upload.',
          'Automatically: basic technical data such as browser type and pages visited, used to keep the service secure and working.',
        ],
      },
      {
        heading: 'Information about businesses',
        body: [
          'The directory also shows public information about businesses and organisations: their name, ABN, the states and suburbs they service, the supports they list, their website address and, where the business publishes one, a link to its logo. It comes from public registers (such as the NDIS Commission and My Aged Care provider registers) and from the business’s own website. For a sole trader this may identify a person. A business can ask us to correct or remove its listing at any time; see the Terms of use.',
          'A logo shown from a business’s own website is loaded directly from that website; we do not copy it. Your browser asks for it without telling that site which page you were viewing.',
        ],
      },
      {
        heading: 'Why we collect it',
        body: [
          'To match your enquiry with suitable providers, to let those providers contact you, to send provider alerts you explicitly request and verify, to run provider accounts and billing, to keep the directory accurate, and to meet our legal obligations. We collect sensitive information only with your consent.',
        ],
      },
      {
        heading: 'Who sees your enquiry',
        body: [
          'Providers who are a genuine match can see the non-identifying parts of your enquiry (the service, suburb, who the care is for, timeframe and funding type). Your name, phone number, and free-text details are shown only to a provider who unlocks the enquiry. We limit how many providers are notified about each enquiry.',
          'We do not sell your personal information. Search filters determine which providers qualify; eligible Pro and Growth members are shown before Starter members. Priority placement is not an endorsement or quality rating.',
        ],
      },
      {
        heading: 'Service providers we use',
        body: [
          'We use third-party services to operate the platform: cloud hosting and database services, an email delivery service, a mapping and address-search service (the location you type is sent to it to suggest and locate suburbs), and a payment processor for provider subscriptions. Some of these may store or process data outside Australia.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          'Unfinished “Get matched” drafts are deleted automatically after 30 days. Provider-alert details are retained while the alert is active and suppressed after you unsubscribe so further alert emails are not sent. Submitted enquiries and account records are kept only as long as needed for the purposes above or as the law requires.',
        ],
      },
      {
        heading: 'Security',
        body: [
          'We use access controls and store passwords only in hashed form. No online service is perfectly secure; if a breach is likely to cause serious harm we will notify affected people and the Office of the Australian Information Commissioner as required.',
        ],
      },
      {
        heading: 'Access, correction and complaints',
        body: [
          'You can ask to see or correct the personal information we hold about you, or to have it deleted where we are not required to keep it. If you are unhappy with how we have handled your information, contact us first; you may also complain to the Office of the Australian Information Commissioner (oaic.gov.au).',
        ],
      },
    ],
  },

  terms: {
    slug: 'terms',
    title: 'Terms of use',
    summary: 'The rules for using the SolDirectory website and services.',
    updated: 'Draft',
    sections: [
      {
        heading: 'What SolDirectory is',
        body: [
          'SolDirectory is a directory and referral service. We help families, participants and support coordinators find providers, and we help providers receive enquiries. We do not provide care or support services, we are not a party to any arrangement between you and a provider, and we do not recommend any particular provider.',
        ],
      },
      {
        heading: 'Using the site',
        body: [
          'You must give accurate information, keep your account details secure, and use the service lawfully. You must not misuse the service, attempt to access data you are not entitled to, scrape the directory, or use enquiry information for any purpose other than responding to that enquiry.',
        ],
      },
      {
        heading: 'Provider information',
        body: [
          'Provider details are supplied by providers. We make reasonable efforts to keep listings current — for example by asking providers to confirm their capacity each week — but we do not guarantee that any listing is accurate, complete or up to date. Always confirm registration status, insurance, worker screening, availability and price directly with a provider before engaging them.',
        ],
      },
      {
        heading: 'Names, logos and register information',
        body: [
          'Business and organisation names, logos and trademarks shown on SolDirectory belong to their owners. They are shown only to identify the business, and their appearance does not mean the owner has joined, approved or recommended SolDirectory.',
          'SolDirectory is independent. It is not part of, and is not endorsed by, the National Disability Insurance Agency, the NDIS Quality and Safeguards Commission, My Aged Care, Services Australia or the Department of Veterans’ Affairs. Where we link to their pages or describe their programs, it is to point you to the official source.',
          'Some listings are built from public register information about registered providers. Registers change and our copy may be out of date. Check a provider’s current status on the official register before you rely on it.',
        ],
      },
      {
        heading: 'Our content and photographs',
        body: [
          'The guides, articles, design and original text on SolDirectory belong to SolDirectory or its licensors. You may link to our pages and quote short extracts with a link back. You must not copy or republish the directory or our guides in bulk without our written permission.',
          'Photographs on the site are used under the licence of the site they came from (mostly Unsplash) and are credited on the Photo credits page. The people shown are not SolDirectory providers, workers or participants, and a photo never means that a person has a particular condition or that a provider is recommended.',
        ],
      },
      {
        heading: 'Content you submit',
        body: [
          'If you upload a logo, photo, text or documents, you confirm that you own them or have permission to use them, that they do not infringe anyone’s rights and that they do not show a person without their consent. You give SolDirectory a non-exclusive, royalty-free licence to store and display that material to run your listing, for as long as the listing is active.',
        ],
      },
      {
        heading: 'Corrections, removals and copyright concerns',
        body: [
          'If a listing, image or piece of text on SolDirectory is wrong, infringes your rights or should not be shown, tell us. Give the page address, say what is wrong and, for a copyright or trademark concern, which work or mark it is and how you are connected to it. A business named in a register listing can ask us at any time to correct or remove its details or logo; the “Is this your business?” form on the listing is the quickest way.',
          'We review these requests promptly and remove or correct material where the concern is reasonable. We may keep a record of the request.',
        ],
      },
      {
        heading: 'Cost',
        body: [
          'Using “Get matched” and searching the directory is free for families, participants and coordinators. Providers may choose a paid plan; see the provider agreement.',
        ],
      },
      {
        heading: 'Limits on our responsibility',
        body: [
          'To the extent the law allows, we are not liable for the acts or omissions of providers, or for loss arising from your reliance on directory content. Nothing in these terms excludes rights you have under the Australian Consumer Law that cannot be excluded.',
        ],
      },
      {
        heading: 'Changes',
        body: ['We may update these terms from time to time. Continued use of the service after an update means you accept the updated terms.'],
      },
    ],
  },

  'provider-agreement': {
    slug: 'provider-agreement',
    title: 'Provider agreement',
    summary: 'The terms that apply to providers who list on SolDirectory.',
    updated: 'Draft',
    sections: [
      {
        heading: 'Your listing',
        body: [
          'You confirm that the information in your listing is accurate, that you are entitled to operate the services you list, and that you hold the registrations, insurance and worker screening your services require. You must keep your listing up to date and tell us promptly if anything changes.',
        ],
      },
      {
        heading: 'Your logo, photos and text',
        body: [
          'You may upload only a logo, photo or text that you own or have permission to use. You give SolDirectory a non-exclusive, royalty-free licence to display it on your listing while the listing is active, and you can remove it at any time. We may remove material that infringes someone’s rights or shows a person without their consent.',
        ],
      },
      {
        heading: 'Weekly capacity confirmation',
        body: [
          'Each week we ask you to confirm that you are still taking referrals. If you do not confirm within seven days, your listing is paused automatically and you will not appear in search results or receive new enquiries until you confirm again. Confirming is free and takes one click.',
        ],
      },
      {
        heading: 'Enquiries',
        body: [
          'We notify a limited number of well-matched providers about each enquiry. Paid plans let you unlock contact details for enquiries up to your plan’s monthly allowance, and browse nearby enquiries you were not notified about. Unlocked contact details may be used only to respond to that enquiry, and must be handled in line with the Privacy Act 1988 (Cth). You must not sell, share or reuse them for any other purpose.',
        ],
      },
      {
        heading: 'How listings are ordered',
        body: ['Search filters determine which providers qualify based on service, area and other selected criteria. Eligible Pro and Growth members are shown before Starter members, with alphabetical ordering inside each plan group. Priority placement is not an endorsement or quality rating.'],
      },
      {
        heading: 'Fees',
        body: [
          'Plan fees, allowances and billing periods are shown on the plans page at the time you subscribe. Subscriptions are processed by our payment provider and renew until cancelled.',
        ],
      },
      {
        heading: 'Suspension and removal',
        body: [
          'We may suspend or remove a listing that is inaccurate, that breaches this agreement, or that raises a safety or compliance concern. You may close your account at any time.',
        ],
      },
    ],
  },

  'lead-disclaimer': {
    slug: 'lead-disclaimer',
    title: 'Enquiry disclaimer',
    summary: 'What to know before you send an enquiry or act on one.',
    updated: 'Draft',
    sections: [
      {
        heading: 'For families, participants and coordinators',
        body: [
          'Sending an enquiry does not create a service arrangement, and being matched is not a recommendation or an endorsement. Providers decide for themselves whether to respond and whether they have capacity. Before you engage any provider, check their registration, insurance, worker screening, availability and pricing directly.',
          'If someone is in immediate danger, call 000. SolDirectory is not an emergency or crisis service.',
        ],
      },
      {
        heading: 'For providers',
        body: [
          'An enquiry is a request from a member of the public, not a guarantee of work. We do not verify the details an enquirer provides. You are responsible for your own assessment of whether you can safely and appropriately support the person, and for meeting your legal and registration obligations.',
        ],
      },
    ],
  },
};
