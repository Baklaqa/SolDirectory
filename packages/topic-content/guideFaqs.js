/**
 * Questions and answers under each evergreen guide (/guides/:slug). Each answer restates what the guide itself says, in
 * a few sentences, so a reader who wants the short version gets it and the guide stays the place for the detail.
 * General information only. Rendered on the page and marked up as FAQPage structured data.
 */
export const GUIDE_FAQS = {
  'ndis-price-guide': [
    {
      question: 'Is the NDIS price limit the amount a provider must charge?',
      answer: 'No. A price limit is a maximum for many supports, not an entitlement to charge the maximum. The provider and participant still agree a rate and what will be delivered, and self-managed participants can agree different rates.',
    },
    {
      question: 'Do price limits apply to every support and every budget?',
      answer: 'They generally cap many supports paid from NDIA-managed and plan-managed budgets. Some supports use quotes or separate rules instead of a simple hourly cap, so confirm the support item, unit and claim type before work starts.',
    },
    {
      question: 'Can a provider charge for travel and cancellations?',
      answer: 'Sometimes. Whether travel, reports, preparation or short-notice cancellations can be claimed depends on the support item and the current rules, so ask for each charge separately and have the service agreement say how it is calculated.',
    },
    {
      question: 'How do I check an invoice is right?',
      answer: 'Compare it with attendance records and the written agreement. Look for duplicate claims, unexpected duration, travel you did not agree to, or a rate above the applicable limit, and raise it with the provider promptly in writing.',
    },
  ],
  'plan-management-basics': [
    {
      question: 'What is the difference between plan management and support coordination?',
      answer: 'Plan management is about who handles provider payments and claims for a budget. Support coordination helps a participant understand and put a plan into action. They are separate supports.',
    },
    {
      question: 'Can I use a provider who is not NDIS registered?',
      answer: 'Generally yes with a plan-managed or self-managed budget, where the support and provider meet the relevant rules. NDIA-managed funding can generally be used only with registered providers, and some higher-risk supports require a registered provider whatever the management type.',
    },
    {
      question: 'Does choosing plan management reduce the money available for supports?',
      answer: 'No. Management type changes how eligible supports are paid and claimed, not what the plan funds. Plan management is funded separately when it is included in a plan.',
    },
    {
      question: 'Can I change how my plan is managed?',
      answer: 'You can discuss a different approach with the NDIA when circumstances or preferences change. Timing depends on the plan and current rules, so identify unpaid invoices and tell providers where future invoices should go before changing.',
    },
  ],
  'choosing-a-provider': [
    {
      question: 'Does registration mean a provider is a good fit?',
      answer: 'No. Registration is one eligibility or safeguarding check. It does not show live availability, personal compatibility, or the experience of the worker who will actually attend.',
    },
    {
      question: 'What should be in a service agreement?',
      answer: 'The support, schedule, rates and extra fees, invoicing, cancellation notice, responsibilities, how it will be reviewed and how either side can end it. Check that it matches the quote and what was said, and ask for a plain-language explanation of anything unclear.',
    },
    {
      question: 'Can I meet the worker before I commit?',
      answer: 'Yes, and it is worth asking. The organisation can meet every requirement while the allocated worker is still not the right match, so ask who is likely to attend and whether you can meet them first.',
    },
    {
      question: 'Can I change provider if it is not working?',
      answer: 'A person can change providers, subject to the reasonable notice in the agreement. Raise concerns early and in writing, and keep records of missed services and agreed fixes. Serious safety or misconduct concerns may need immediate escalation.',
    },
  ],
  'aged-care-support': [
    {
      question: 'Where do I start with aged care?',
      answer: 'My Aged Care is the Australian Government entry point. A person, family member or authorised representative can make contact online or by phone, and it can arrange an assessment when appropriate. Asking for an assessment does not commit you to any provider.',
    },
    {
      question: 'Does an approval mean a provider can start straight away?',
      answer: 'No. Approval and service commencement may not happen at the same time, and an approval does not guarantee that a preferred provider has capacity. Ask for a realistic start date and what interim options exist.',
    },
    {
      question: 'Will government funding cover all the costs?',
      answer: 'Not always. Contributions can depend on the program, the service, and income or assets. Ask for an individual written estimate showing service prices, management charges, travel, cancellation terms and anything not subsidised.',
    },
    {
      question: 'What if the person’s needs change?',
      answer: 'Tell the provider and My Aged Care when health, safety, mobility, carer availability or living arrangements change. A new assessment or an urgent pathway may be appropriate, and an existing approval does not automatically expand to cover a new need.',
    },
  ],
};
