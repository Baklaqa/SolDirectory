/**
 * Plain-language, general information for the 25 funding topics under /funding/:slug, in the groups the page shows.
 * Each topic has a short summary (two short paragraphs) and a few key points. Sentences are kept short on purpose:
 * the people reading this are often tired, stressed or reading English as a second language.
 *
 * General information only, not financial or funding advice. Program names, thresholds and processes change
 * (especially aged care, which has been through reform), so each topic says where the current answer lives.
 *
 * `fundingFilter` is set only for the three NDIS management types that map to a real provider field
 * (Provider.acceptedFunding); every other topic honestly has no provider filter.
 *
 * Moved here from apps/web/src/data/fundingContent.ts so the crawler HTML and the page read the same words.
 */
export const FUNDING_CONTENT_GROUPS = [
  {
    title: 'NDIS Plans',
    items: [
      {
        slug: 'agency-managed', name: 'Agency Managed', categoryGroup: 'NDIS Plans', fundingFilter: 'NDIA-managed',
        summary: [
          'Agency managed, also called NDIA-managed, means the National Disability Insurance Agency pays providers directly. A provider claims through the NDIA’s own payment system, and the participant does not handle invoices.',
          'It is the option with the least paperwork. The trade-off is choice: agency-managed funding can only be used with providers registered with the NDIS Commission. It is a common starting choice for a first plan, and it can be changed later.',
        ],
        keyPoints: [
          'The NDIA pays the provider on the participant’s behalf.',
          'Only NDIS-registered providers can be used.',
          'Least paperwork of the three management types.',
          'No single option is right for everyone. It depends on how much admin you want and how much provider choice matters.',
        ],
      },
      {
        slug: 'plan-managed', name: 'Plan Managed', categoryGroup: 'NDIS Plans', fundingFilter: 'Plan-managed',
        summary: [
          'Plan management means a separate plan manager pays providers for the participant and keeps track of the budget. The plan manager is a funded NDIS support in its own right.',
          'It is often described as a middle option. The plan manager handles invoices and records, and plan-managed funding can be used with registered and unregistered providers. Because plan management is its own funded item, it does not reduce the money available for supports.',
        ],
        keyPoints: [
          'A plan manager pays providers and tracks spending.',
          'Registered and unregistered providers can both be used.',
          'Plan management does not reduce the funding for supports.',
          'Ask a plan manager or support coordinator what the day-to-day experience is like.',
        ],
      },
      {
        slug: 'self-managed', name: 'Self Managed', categoryGroup: 'NDIS Plans', fundingFilter: 'Self-managed',
        summary: [
          'Self-management means the participant, or their nominee, pays providers directly and then claims the money back from the NDIA. They keep their own records of spending against the plan.',
          'It gives the most flexibility. Self-managed funding can be used with any provider, registered or not. It also means the most responsibility: paying invoices, keeping receipts and claiming correctly and on time. A participant does not have to self-manage the whole plan. Some funding can be self-managed and the rest plan-managed or agency-managed.',
        ],
        keyPoints: [
          'The participant or nominee pays providers, then claims.',
          'Any provider can be used, registered or not.',
          'Most flexibility, and the most record-keeping.',
          'You can self-manage some categories and not others.',
        ],
      },
      {
        slug: 'plan-reviews', name: 'Plan Reviews', categoryGroup: 'NDIS Plans',
        summary: [
          'An NDIS plan is not meant to stay the same forever. A plan review checks whether the plan still fits the participant’s goals, circumstances and support needs, and adjusts the funding if it does not.',
          'Reviews happen on a schedule, generally set when the plan is approved, and can be requested earlier if something significant changes. Preparation affects the outcome. Gather evidence of how supports are being used, any new reports from allied health professionals, and be clear about what has changed and why. The NDIA, through myplace or the contact centre, is the source for current review processes and timing.',
        ],
        keyPoints: [
          'Reviews are scheduled, and can be asked for earlier.',
          'Evidence of how supports are used helps the NDIA decide.',
          'New reports from allied health professionals can help.',
          'A support coordinator or plan manager can help you prepare.',
        ],
      },
      {
        slug: 'change-of-circumstances', name: 'Change of Circumstances', categoryGroup: 'NDIS Plans',
        summary: [
          'A change of circumstances report is how a participant tells the NDIA about a significant change since the plan was approved. Examples are a change in support needs, where they live, informal support (such as a carer becoming unavailable) or contact details.',
          'Reporting promptly matters, because a plan that no longer matches the person’s situation can mean funding that does not fit, in either direction. Day-to-day ups and downs are normal and do not need a report. A significant shift usually does. It is done through the NDIA, via myplace, the NDIS app or the contact centre. A support coordinator can help you decide whether a change is big enough to report.',
        ],
        keyPoints: [
          'Used between scheduled reviews.',
          'Covers changes in needs, living situation, informal support or contact details.',
          'Report significant changes promptly.',
          'Done through the NDIA: myplace, the NDIS app or the contact centre.',
        ],
      },
      {
        slug: 'first-plan-support', name: 'First Plan Support', categoryGroup: 'NDIS Plans',
        summary: [
          'A first NDIS plan can be a lot to take in. There is what is funded, a plan management option to choose, providers to find and supports to set up, often while you are still learning how the scheme works.',
          'Support coordination, which is a funded support in many first plans, exists partly for this reason. It helps a new participant understand the plan, connect with providers and get supports running, not just approved on paper. Useful first steps are to read the plan carefully, or have someone read it with you, to find out which budget categories are flexible and which are tied to a specific support, and to decide on a management option before booking services. The NDIS “Getting started” resources and contact centre have current guidance.',
        ],
        keyPoints: [
          'Support coordination can help you put the plan into action.',
          'Read the plan, or read it with someone.',
          'Find out which budgets are flexible and which are fixed.',
          'Choose a management option before rushing to book services.',
        ],
      },
    ],
  },
  {
    title: 'Aged Care',
    items: [
      {
        slug: 'home-care-packages', name: 'Home Care Packages', categoryGroup: 'Aged Care',
        summary: [
          'Home Care Packages have been the main Australian Government program for a coordinated package of in-home aged care. It covers support such as personal care, domestic assistance, nursing and allied health, at one of several funding levels based on assessed need, and is managed through an approved provider.',
          'Aged care funding has been through major reform, including changes to how in-home programs are structured and named. The program a person is assessed into, and its exact rules, can depend on when they are assessed. The starting point is an assessment through My Aged Care (1800 200 422), which is also the current source on what applies and what it covers.',
        ],
        keyPoints: [
          'A coordinated package of in-home support, at a funding level based on assessed need.',
          'Managed through an approved provider.',
          'Programs and names have changed through reform, so check what applies now.',
          'Start with an assessment through My Aged Care: 1800 200 422.',
        ],
      },
      {
        slug: 'commonwealth-home-support', name: 'Commonwealth Home Support', categoryGroup: 'Aged Care',
        summary: [
          'The Commonwealth Home Support Programme (CHSP) is an entry-level aged care program. It funds lower-level, often occasional support such as domestic assistance, transport, home maintenance or social support.',
          'It suits older people who are still largely independent but benefit from some help to stay at home safely. It is generally simpler to access than packaged care, and it funds specific services directly through CHSP providers rather than an individual budget. Structure and even names are still being reformed, so confirm current details with My Aged Care (1800 200 422).',
        ],
        keyPoints: [
          'Entry-level support, often occasional.',
          'Examples: domestic assistance, transport, home maintenance, social support.',
          'Funds specific services, not an individual budget.',
          'Confirm what applies now with My Aged Care: 1800 200 422.',
        ],
      },
      {
        slug: 'support-at-home', name: 'Support at Home', categoryGroup: 'Aged Care',
        summary: [
          'Support at Home is the Australian Government’s reformed approach to funding in-home aged care. It brings together and simplifies what used to be separate programs, such as Home Care Packages, into a more consistent system with needs-based funding classifications.',
          'Because this is a significant and recent change, the practical detail needs to be confirmed currently: exact funding levels, what is included, and how people already receiving support move across. Ask My Aged Care (1800 200 422) rather than relying on a general description, including this one. An aged care assessment through My Aged Care is the starting point whichever structure is current.',
        ],
        keyPoints: [
          'Reformed approach to in-home aged care funding.',
          'Brings together earlier programs, such as Home Care Packages.',
          'Detail changes, so confirm funding levels and inclusions with My Aged Care.',
          'An aged care assessment is still the starting point.',
        ],
      },
      {
        slug: 'residential-fees', name: 'Residential Fees', categoryGroup: 'Aged Care',
        summary: [
          'Moving into an aged care home involves several kinds of fees. These generally include a basic daily fee, a means-tested care fee based on an assessment of income and assets, and accommodation costs. Accommodation can be paid as a lump sum, a daily payment, or a combination. Some facilities also charge optional extra service fees.',
          'What a person actually pays depends on their own financial assessment through Services Australia or the Department of Veterans’ Affairs. A general description can explain the types of fee, not what one person will pay. A personal picture generally starts with an aged care assessment and a means assessment, and My Aged Care (1800 200 422) is the place to begin both.',
        ],
        keyPoints: [
          'Basic daily fee, means-tested care fee, and accommodation costs.',
          'Accommodation: lump sum, daily payment, or a combination.',
          'Optional extra service fees depend on the facility.',
          'Your own cost depends on your own financial assessment.',
        ],
      },
    ],
  },
  {
    title: 'Veterans',
    items: [
      {
        slug: 'dva-community-nursing', name: 'DVA Community Nursing', categoryGroup: 'Veterans',
        summary: [
          'DVA Community Nursing funds clinical nursing care at home for eligible veterans and war widows and widowers who hold a DVA Gold Card, or a White Card for accepted conditions. It covers things like medication management and wound care, delivered by a DVA-contracted nursing provider.',
          'It is a clinical service, separate from broader home-support programs. It is generally arranged through a referral, commonly from a GP, rather than organised directly with a nursing provider. Eligibility and referral steps are specific to DVA, so the Department of Veterans’ Affairs (1800 838 372) is the source for confirming them for a particular person.',
        ],
        keyPoints: [
          'In-home clinical nursing for eligible veterans and war widows or widowers.',
          'Gold Card, or White Card for accepted conditions.',
          'Examples: medication management and wound care.',
          'Generally arranged by referral, commonly from a GP.',
        ],
      },
      {
        slug: 'dva-home-care', name: 'DVA Home Care', categoryGroup: 'Veterans',
        summary: [
          'Beyond clinical nursing, DVA also funds broader home-care support for eligible veterans and war widows and widowers. This includes help with domestic tasks, personal care and home maintenance.',
          'It is generally accessed through an assessed program for Gold Card holders, with some support for eligible White Card holders for accepted conditions. Eligibility depends on card type and assessed need, and services are arranged through DVA’s own systems, not a general aged care pathway. Contact DVA (1800 838 372) to confirm current eligibility and get an assessment.',
        ],
        keyPoints: [
          'Domestic tasks, personal care and home maintenance.',
          'Assessed program, mainly for Gold Card holders.',
          'Some support for White Card holders, for accepted conditions.',
          'Arranged through DVA, not a general aged care pathway.',
        ],
      },
      {
        slug: 'veterans-home-care', name: 'Veterans’ Home Care', categoryGroup: 'Veterans',
        summary: [
          'Veterans’ Home Care (VHC) is DVA’s program for lighter, entry-level home support for eligible veterans and war widows and widowers. It covers things like domestic assistance, personal care, respite and home and garden maintenance.',
          'It is generally for people who need some help to stay safely and independently at home, but not the more intensive support covered by other DVA or aged care programs. It is assessed and coordinated through DVA, and services are delivered by contracted providers. Eligibility and scope are set by DVA policy and can change, so confirm current detail with DVA (1800 838 372).',
        ],
        keyPoints: [
          'Lighter, entry-level home support.',
          'Domestic assistance, personal care, respite, home and garden maintenance.',
          'Assessed and coordinated through DVA.',
          'Scope and eligibility are set by DVA and can change.',
        ],
      },
      {
        slug: 'rehabilitation-appliances', name: 'Rehabilitation Appliances', categoryGroup: 'Veterans',
        summary: [
          'The Rehabilitation Appliances Program (RAP) is how DVA funds aids and equipment for eligible veterans. Examples are mobility aids, continence products and home modifications, where they support independence and relate to an accepted condition or assessed need.',
          'Access generally goes through a health professional’s assessment and recommendation, such as from an occupational therapist, which is then submitted through DVA’s approval process. It is not usually a case of buying equipment first and claiming afterwards. Eligibility is tied to accepted conditions and DVA’s item schedules, which can change, so check with DVA (1800 838 372) what is available and how to start.',
        ],
        keyPoints: [
          'DVA funds aids and equipment for eligible veterans.',
          'Examples: mobility aids, continence products, home modifications.',
          'Usually needs a health professional’s assessment, such as an occupational therapist.',
          'Get approval first. Do not buy first and claim later.',
        ],
      },
      {
        slug: 'open-arms-referrals', name: 'Open Arms Referrals', categoryGroup: 'Veterans',
        summary: [
          'Open Arms – Veterans & Families Counselling is DVA’s free, confidential mental health and counselling service. It is for current and former Australian Defence Force members and their families, however long they served and whatever their discharge status.',
          'It offers individual, couples, family and group counselling, as well as crisis support. A referral can come from a GP or DVA, or a person can contact Open Arms themselves. A formal referral is not always needed to get started. It is a dedicated veteran and family service, separate from general mental health or disability services. Open Arms (1800 011 046, 24 hours a day) is the first contact for anyone who wants to use it or find out whether they qualify.',
        ],
        keyPoints: [
          'Free and confidential.',
          'For current and former ADF members and their families.',
          'Individual, couples, family and group counselling, plus crisis support.',
          'Phone 1800 011 046, 24 hours a day.',
        ],
      },
    ],
  },
  {
    title: 'Other Funding',
    items: [
      {
        slug: 'private-fee-for-service', name: 'Private Fee for Service', categoryGroup: 'Other Funding',
        summary: [
          'Private fee for service means paying a provider directly, out of pocket, without going through the NDIS, aged care, DVA or another funded scheme. People do this because they do not meet a scheme’s eligibility, to get a service faster than a funded pathway allows, or by choice, for flexibility or privacy.',
          'Providers who accept private fee for service set their own rates and terms with the client, not within a scheme’s price guide. Costs and inclusions can vary a lot, so ask for a clear, itemised quote before starting. None of the eligibility or claims processes of the funded schemes apply.',
        ],
        keyPoints: [
          'You pay the provider directly, outside any funded scheme.',
          'Providers set their own rates and terms.',
          'Costs vary, so ask for an itemised quote first.',
          'Scheme rules and claims processes do not apply.',
        ],
      },
      {
        slug: 'icare-workers-compensation', name: 'iCare & Workers Compensation', categoryGroup: 'Other Funding',
        summary: [
          'Workers compensation schemes can fund support and rehabilitation for people injured at work, where the injury has led to an ongoing need for care, therapy or support. icare is the scheme in NSW, and other states and territories have their own.',
          'What is funded, and for how long, depends on the claim, the injury and the scheme’s own case management. It is handled through the workers compensation insurer or scheme, not a general disability or aged care pathway. People with ongoing care needs usually work with a case manager from their insurer. That case manager is the first contact for what a particular claim covers, because rules differ by state and claim type.',
        ],
        keyPoints: [
          'For people injured at work, with an ongoing need for care or support.',
          'icare in NSW, with equivalent schemes in other states and territories.',
          'What is covered depends on the claim and the scheme.',
          'Your insurer’s case manager is the first contact.',
        ],
      },
      {
        slug: 'private-health-insurance', name: 'Private Health Insurance', categoryGroup: 'Other Funding',
        summary: [
          'Private health insurance, extras or ancillary cover in particular, can contribute to some allied health and support services such as physiotherapy, psychology and occupational therapy. It pays up to annual limits set by the policy, and those limits vary a lot between insurers and cover levels.',
          'It is a different system from the NDIS, aged care or DVA. There is no formal eligibility assessment. The money comes from a policy the person already holds, and claims go directly to the insurer, often on the spot at the session. Only the insurer can say what a policy covers and how much of the annual limit is left.',
        ],
        keyPoints: [
          'Extras cover can contribute to physiotherapy, psychology, occupational therapy and similar.',
          'Annual limits are set by the policy.',
          'Claims go to the insurer, often at the time of the session.',
          'Only your insurer can confirm what your policy covers.',
        ],
      },
      {
        slug: 'medicare-care-plans', name: 'Medicare Care Plans', categoryGroup: 'Other Funding',
        summary: [
          'Medicare care plans, most commonly a Chronic Disease Management plan or a GP Mental Health Treatment Plan, let a GP refer a patient for a set number of Medicare-rebated allied health sessions each calendar year. These can be physiotherapy, psychology, podiatry or dietetics, relevant to the condition.',
          'The plan is set up with a GP, who decides whether the person meets the criteria and prepares the plan and referral. The patient then books an eligible allied health provider and claims the Medicare rebate. It is a Medicare pathway, separate from the NDIS, aged care or DVA. A GP is the starting point for setting one up or finding out whether someone qualifies.',
        ],
        keyPoints: [
          'A GP sets up the plan and the referral.',
          'A set number of rebated allied health sessions each year.',
          'Examples: physiotherapy, psychology, podiatry, dietetics.',
          'Separate from the NDIS, aged care and DVA.',
        ],
      },
      {
        slug: 'state-funded-programs', name: 'State Funded Programs', categoryGroup: 'Other Funding',
        summary: [
          'Beyond the major national schemes (NDIS, aged care, DVA, Medicare), state and territory governments run smaller, more targeted funding programs. These can cover equipment subsidies, transport concessions, respite grants or community program funding.',
          'They vary a lot between states and change as programs start and end. There is no single national list, and each state or territory department sets its own eligibility and application process. Check with the relevant state or territory human services, disability or seniors department, or ask a local support coordinator or social worker. Do not assume a program in one state applies, or exists, in another.',
        ],
        keyPoints: [
          'Smaller, targeted programs run by states and territories.',
          'Examples: equipment subsidies, transport concessions, respite grants.',
          'Rules differ by state and change over time.',
          'Ask the state department or a local support coordinator.',
        ],
      },
    ],
  },
  {
    title: 'Help With Funding',
    items: [
      {
        slug: 'plan-managers', name: 'Plan Managers', categoryGroup: 'Help With Funding',
        summary: [
          'A plan manager is a funded NDIS support in their own right. They pay providers on the participant’s behalf, track spending against the plan’s budget and handle the financial admin of using NDIS funding.',
          'Choosing one is worth some care. Services differ in how quickly they respond, the reporting and visibility they give you about your own spending, and how early they flag budget problems. Plan management is a funded item, so using one does not reduce the money for other supports. A participant can generally change plan managers if it is not working well.',
        ],
        keyPoints: [
          'Pays providers, tracks the budget and handles invoices.',
          'A funded support, so it does not reduce your other funding.',
          'Compare responsiveness, reporting and how early problems are flagged.',
          'You can generally change plan managers.',
        ],
      },
      {
        slug: 'bookkeeping-invoicing', name: 'Bookkeeping & Invoicing', categoryGroup: 'Help With Funding',
        summary: [
          'For a self-managed participant, or a provider running its own finances, bookkeeping and invoicing matter. Accurate records support correct NDIS claims and reimbursements, help track spending so funding does not run out unexpectedly, and matter for tax and compliance on the provider side.',
          'This might be a bookkeeping service, accounting software suited to disability-sector invoicing, or, for a self-managing participant, a simple, consistent system for receipts and claim records. Good habits set up early save stress later: consistent file names, prompt invoice submission and regular reconciliation.',
        ],
        keyPoints: [
          'Accurate records support correct claims and reimbursements.',
          'They help you see spending against the budget.',
          'A simple, consistent system is enough for many self-managers.',
          'Set up early: file names, prompt invoicing, regular reconciliation.',
        ],
      },
      {
        slug: 'price-guide-explained', name: 'Price Guide Explained', categoryGroup: 'Help With Funding',
        summary: [
          'The NDIS Pricing Arrangements and Price Limits, still commonly called the “Price Guide”, set the most a registered provider can charge for many supports under agency-managed or plan-managed funding. They are organised by support item, with different limits for different states and territories and sometimes different circumstances, such as evenings, weekends or public holidays.',
          'Self-managed funding has more flexibility because the price limits do not apply in the same way, though value for money still matters. Prices and support item numbers are updated periodically, so a figure quoted from memory can be out of date. The NDIS’s own published document is the current source for any specific limit.',
        ],
        keyPoints: [
          'Sets maximum prices for many supports, by support item.',
          'Limits differ by state, and by time of day or public holidays.',
          'Self-managed funding has more flexibility.',
          'Prices are updated, so check the NDIS’s current document.',
        ],
      },
      {
        slug: 'funding-eligibility', name: 'Funding Eligibility', categoryGroup: 'Help With Funding',
        summary: [
          'Eligibility works differently for each funding scheme. The NDIS has its own disability and age-related access criteria. Aged care programs are accessed through an assessment with My Aged Care. DVA entitlements depend on service history and card type. Medicare care plans depend on a GP’s clinical assessment against set criteria.',
          'There is no single “am I eligible” test that covers all of them. That is a common source of confusion, especially when a person could fit more than one scheme. The reliable way to find out is to go to the body’s own process: the NDIS (1800 800 110), My Aged Care (1800 200 422) or DVA (1800 838 372).',
        ],
        keyPoints: [
          'Each scheme has its own eligibility.',
          'There is no single test that covers all of them.',
          'A person can fit more than one scheme.',
          'Ask the scheme directly: NDIS 1800 800 110, My Aged Care 1800 200 422, DVA 1800 838 372.',
        ],
      },
      {
        slug: 'budget-categories', name: 'Budget Categories', categoryGroup: 'Help With Funding',
        summary: [
          'An NDIS plan’s funding is generally organised into budget categories. Core supports cover day-to-day support and are often the most flexible. Capacity Building covers skill development, therapy and similar, and is generally tied to specific supports. Capital covers equipment and home or vehicle modifications, generally for a specific approved item.',
          'How strictly funding is tied to a category depends on the category and the plan. Core is typically the most flexible, and Capacity Building and Capital generally less so. A support coordinator or plan manager can walk through the actual breakdown with you. The plan documents, viewable through myplace or the NDIS app, are the record of what has been approved.',
        ],
        keyPoints: [
          'Core supports: day-to-day support, often the most flexible.',
          'Capacity Building: skills and therapy, generally tied to specific supports.',
          'Capital: equipment and modifications, generally for an approved item.',
          'Your plan documents are the record of what was approved.',
        ],
      },
    ],
  },
];

/**
 * One question each topic answers that no other topic does. Each answer restates only what the summary above already says.
 * Group-level questions (who confirms it, does a listing prove it, what if rules change) are added by fundingFaqs() in index.js.
 */
const TOPIC_FAQ = {
  'agency-managed': ['Can I use an unregistered provider with agency-managed funding?', 'No. Agency-managed funding can only be used with providers registered with the NDIS Commission. Plan-managed or self-managed funding is how you use unregistered providers.'],
  'plan-managed': ['Does paying a plan manager reduce my support funding?', 'No. Plan management is a funded item in its own right, so it does not come out of the money for your supports.'],
  'self-managed': ['Do I have to self-manage the whole plan?', 'No. You can self-manage some funding and use plan management or agency management for the rest.'],
  'plan-reviews': ['Can I ask for a review before the scheduled date?', 'Yes, if something significant has changed. Before you ask, gather evidence of how your supports are being used and any new reports from allied health professionals.'],
  'change-of-circumstances': ['Do I need to report every change?', 'No. Day-to-day ups and downs are normal. Report significant changes, such as in support needs, where you live, informal support or contact details.'],
  'first-plan-support': ['What does support coordination do in a first plan?', 'It helps a new participant understand the plan, connect with providers and get supports running, not just approved on paper. It is a funded support in many first plans.'],
  'home-care-packages': ['How do I start?', 'With an aged care assessment through My Aged Care on 1800 200 422. They can also tell you which program applies now, because aged care programs have changed through reform.'],
  'commonwealth-home-support': ['Who is the Commonwealth Home Support Programme for?', 'Older people who are still largely independent but benefit from some help to stay at home safely. It funds specific services through CHSP providers, not an individual budget.'],
  'support-at-home': ['Is Support at Home the same as Home Care Packages?', 'It is the reformed approach that brings together earlier programs such as Home Care Packages. Ask My Aged Care on 1800 200 422 how it applies to you, including how people already receiving support move across.'],
  'residential-fees': ['What fees apply in an aged care home?', 'A basic daily fee, a means-tested care fee and accommodation costs. Accommodation can be a lump sum, a daily payment or both. Some facilities also charge optional extra service fees.'],
  'dva-community-nursing': ['Who can get DVA Community Nursing?', 'Eligible veterans and war widows and widowers who hold a DVA Gold Card, or a White Card for accepted conditions. It is generally arranged by referral, commonly from a GP.'],
  'dva-home-care': ['Can White Card holders get home care from DVA?', 'Some support is available to eligible White Card holders for accepted conditions. Gold Card holders are the main group. Contact DVA on 1800 838 372 to confirm what applies.'],
  'veterans-home-care': ['What is Veterans’ Home Care for?', 'People who need some help to stay safely and independently at home, but not the more intensive support covered by other DVA or aged care programs.'],
  'rehabilitation-appliances': ['Can I buy equipment first and claim it later?', 'Not usually. Access generally starts with a health professional’s assessment and recommendation, such as from an occupational therapist, and then goes through DVA’s approval process. Check with DVA on 1800 838 372 first.'],
  'open-arms-referrals': ['Do I need a referral to use Open Arms?', 'A formal referral is not always needed. A GP or DVA can refer you, or you can contact Open Arms yourself on 1800 011 046, 24 hours a day.'],
  'private-fee-for-service': ['Why would someone pay privately?', 'They may not meet a scheme’s eligibility, may want a service faster than a funded pathway allows, or may prefer the flexibility or privacy.'],
  'icare-workers-compensation': ['Who do I ask what my claim covers?', 'The case manager at your insurer or scheme. What is funded depends on the claim, the injury and the scheme, and rules differ by state and claim type.'],
  'private-health-insurance': ['Who can tell me what my policy covers?', 'Only your insurer. Annual limits vary a lot between insurers and cover levels, so also ask how much of your annual limit is left.'],
  'medicare-care-plans': ['Who sets up a Medicare care plan?', 'A GP, who decides whether you meet the criteria and prepares the plan and referral. You then book an eligible allied health provider and claim the Medicare rebate.'],
  'state-funded-programs': ['Is there one national list of state programs?', 'No. Each state or territory department sets its own eligibility and application process. Do not assume a program in one state applies, or exists, in another.'],
  'plan-managers': ['Can I change my plan manager?', 'You can generally change plan managers if it is not working well.'],
  'bookkeeping-invoicing': ['What should a self-managing participant keep?', 'Receipts and claim records in a simple, consistent system. Consistent file names, prompt invoice submission and regular reconciliation save stress later.'],
  'price-guide-explained': ['Does the Price Guide apply to self-managed funding?', 'Not in the same way, so self-managed funding has more flexibility. Value for money still matters.'],
  'funding-eligibility': ['Is there one eligibility test for all schemes?', 'No. Each scheme has its own. Ask the scheme directly: NDIS on 1800 800 110, My Aged Care on 1800 200 422 or DVA on 1800 838 372.'],
  'budget-categories': ['Which budget category is the most flexible?', 'Core supports are typically the most flexible. Capacity Building and Capital are generally less so.'],
};

for (const group of FUNDING_CONTENT_GROUPS) {
  for (const item of group.items) {
    const faq = TOPIC_FAQ[item.slug];
    if (!faq) throw new Error(`fundingContent: no FAQ for ${item.slug}`);
    item.faq = { question: faq[0], answer: faq[1] };
  }
}
