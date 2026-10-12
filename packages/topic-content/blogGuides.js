/**
 * Evergreen explainers for the blog. Each one is original writing that cites the official page it is based on.
 * Rules (the standing editorial policy for this file):
 *  - no copied text, images or logos from any source; the NDIA licenses its site CC BY-NC, so facts are restated in our own words;
 *  - nothing that changes often is stated as a number (prices, thresholds, deadlines); the reader is sent to the official page;
 *  - every source URL was opened and returned a page when it was added (see checkedAt);
 *  - nothing here is advice, and each article says what to check against the person’s own plan.
 */
const CHECKED = '2026-10-12T09:00:00+11:00';
const NDIS = 'https://www.ndis.gov.au';
const ndis = (path) => `${NDIS}${path}`;

export const GUIDE_POSTS = [
  {
    slug: 'how-to-choose-an-ndis-provider-questions-to-ask',
    title: 'How to choose an NDIS provider: 12 questions to ask before you commit',
    summary: 'A practical checklist for comparing providers, from how a service fits your plan to what happens when something goes wrong.',
    category: 'Choosing providers',
    publishedAt: '2026-10-12T11:00:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/general.jpg',
    coverAlt: 'Two women talking across a table',
    source: { label: 'NDIS: Working with providers', url: ndis('/participants/working-providers'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS provider finder', url: ndis('/participants/working-providers/finding-providers/provider-finder') },
    ],
    sections: [
      {
        heading: 'Start with what you want, not who is nearest',
        paragraphs: [
          'Before you contact anyone, write down the supports you are looking for, the days and times you need them, and the goals they should help with. A provider can only be a good fit for something you have described clearly, and a short written list makes every conversation easier and more comparable.',
          'Also decide what matters beyond the service itself: a worker who shares your language or culture, someone confident with a particular condition, a provider that is close to public transport, or one that can offer regular workers rather than a rotating roster.',
        ],
      },
      {
        heading: 'Questions about the support itself',
        paragraphs: [
          'Ask: 1) Do you provide exactly the support I need, and who would deliver it? 2) How many workers would I see, and can I meet them first? 3) What are your available days and times, and how much notice do you need to change them? 4) What happens if my regular worker is sick or leaves?',
          'A good answer is specific. “We’ll sort something out” is not an answer to the fourth question; “we call you before the shift and tell you who is covering” is.',
        ],
      },
      {
        heading: 'Questions about cost and paperwork',
        paragraphs: [
          'Ask: 5) How will you charge, and can I see the rates in writing before I agree? 6) Are there extra charges such as travel, cancellation or after-hours loadings? 7) How do you invoice, and how often? 8) Will you work with my plan manager, or do you need payment another way?',
          'Prices for many supports are capped by the NDIA’s pricing arrangements, so a provider’s rates should sit within those limits. If a figure is unclear, ask which line of the pricing arrangements it relates to and check it with your plan manager or support coordinator.',
        ],
      },
      {
        heading: 'Questions about people and safety',
        paragraphs: [
          'Ask: 9) Are you a registered NDIS provider, and are your workers screened? 10) How do you train and supervise your workers, especially for my kind of support? Registered providers are regulated by the NDIS Quality and Safeguards Commission, and you can check a provider’s registration on the Commission’s website rather than relying on what a brochure says.',
        ],
      },
      {
        heading: 'Questions about change and complaints',
        paragraphs: [
          'Ask: 11) What happens if I want to change or stop the service, and how much notice is needed? 12) How do I raise a concern, and who deals with it? You want to hear a named process, not just “call us”.',
          'Compare at least two providers, ask each the same questions, and take notes. You do not have to decide on the spot, and you can take someone you trust to the conversation. This article is general information; confirm anything that affects your plan with your plan manager, support coordinator or the NDIA.',
        ],
      },
    ],
  },
  {
    slug: 'registered-or-unregistered-ndis-provider-what-it-means',
    title: 'Registered or unregistered? What it means when you choose an NDIS provider',
    summary: 'Registered and unregistered providers can both be legitimate, but the rules, checks and options for your plan are not the same. Here is how to think about the difference.',
    category: 'Choosing providers',
    publishedAt: '2026-10-12T10:50:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/six-checks-on-every-provider.jpg',
    coverAlt: 'A support worker talking with an older person in a care setting',
    source: { label: 'NDIS: Working with providers', url: ndis('/participants/working-providers'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS provider finder', url: ndis('/participants/working-providers/finding-providers/provider-finder') },
      { label: 'NDIS Quality and Safeguards Commission', url: 'https://www.ndiscommission.gov.au/' },
    ],
    sections: [
      {
        heading: 'What “registered” actually means',
        paragraphs: [
          'A registered NDIS provider has applied to the NDIS Quality and Safeguards Commission and been approved to deliver certain types of support. In return it accepts extra obligations: meeting the NDIS Practice Standards, being checked through an audit process, and reporting some kinds of incidents to the Commission.',
          'Registration is about oversight. It does not tell you whether a provider is the right match for you, how good its staff are on a given day, or whether it has capacity to take on a new person.',
        ],
      },
      {
        heading: 'What “unregistered” means, and what it does not',
        paragraphs: [
          'An unregistered provider has not gone through that registration process. That does not make it unsafe or improper by itself, and many small businesses and independent workers operate this way. The NDIS Code of Conduct applies to workers and providers whether or not they are registered, and the Commission can look at complaints about both.',
          'What changes is the level of routine oversight and the checks you can rely on without asking. With an unregistered provider, you carry more of the job of asking for evidence yourself.',
        ],
      },
      {
        heading: 'When the choice is not yours to make',
        paragraphs: [
          'Some supports can only be delivered by registered providers, and whether you can use unregistered providers depends on how your plan is managed and on the support involved. If your funding is managed by the NDIA, providers generally need to be registered. Plans that are plan-managed or self-managed have had more flexibility, but the rules have been changing, so confirm the current position for your own plan before you commit.',
        ],
      },
      {
        heading: 'How to check, and what to ask',
        paragraphs: [
          'You can check a provider’s registration on the NDIS Commission’s provider register. Compare the name and the registered support types with what the provider tells you, and ask for their ABN and, if relevant, their insurance details.',
          'For an unregistered provider or independent worker, ask the questions that registration would otherwise answer: how workers are screened and supervised, what insurance is held, how incidents are handled and how you can complain. Whatever you decide, put the arrangement in writing. This is general information, not advice about your plan.',
        ],
      },
    ],
  },
  {
    slug: 'ndis-service-agreement-what-to-check-before-you-sign',
    title: 'NDIS service agreements: what to check before you sign',
    summary: 'A service agreement sets out what a provider will do, what it costs and how either side can change it. Read these points before you agree to anything.',
    category: 'Choosing providers',
    publishedAt: '2026-10-12T10:40:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/plan-management-5.jpg',
    coverAlt: 'Printed forms, a calculator and a phone on a table',
    source: { label: 'NDIS: Working with providers', url: ndis('/participants/working-providers'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Your rights and responsibilities', url: ndis('/participants/working-providers/your-rights-and-responsibilities') },

      { label: 'NDIS pricing arrangements', url: ndis('/providers/pricing-and-payments/pricing/pricing-arrangements') },
    ],
    sections: [
      {
        heading: 'What a service agreement is for',
        paragraphs: [
          'A service agreement is a written arrangement between you and a provider. It records which supports will be delivered, when, at what price and under what conditions. It is generally recommended rather than something you are forced to sign, and it protects both sides because it is easy to point to when expectations differ.',
          'Take it home. You should not feel pressured to sign at the first meeting, and you can ask a family member, advocate, support coordinator or plan manager to read it with you.',
        ],
      },
      {
        heading: 'The supports and the schedule',
        paragraphs: [
          'Check that the supports are described in words you understand, not just codes, and that they match what you discussed. Look at how often and when they happen, how long each session is, and where they are delivered.',
          'If the agreement lists a worker, a team or a type of qualification, check that it matches what you were told. If you were promised something in conversation, make sure it is in the document.',
        ],
      },
      {
        heading: 'Price, invoices and extra charges',
        paragraphs: [
          'The agreement should state the rates, how and when you are invoiced and who pays. Compare the rates with the NDIA’s pricing arrangements: they set maximum prices for many supports. Look for any separate charges such as travel, after-hours work or cancellation fees, and make sure you understand when each applies.',
          'If you use a plan manager, check that the provider is happy to invoice them. If you self-manage, check what records you will receive so you can claim accurately.',
        ],
      },
      {
        heading: 'Cancellation, changes and ending the agreement',
        paragraphs: [
          'Agreements should explain how much notice either side must give to cancel a session, and when you may be charged for a short-notice cancellation. They should also explain how to change the supports and how to end the agreement altogether.',
          'Look for how concerns are raised and who handles them. If you disagree with something in the agreement, ask for it to be changed before you sign. If the provider will not discuss reasonable changes, that is useful information about how the service will work with you later. This is general information, not legal advice.',
        ],
      },
    ],
  },
  {
    slug: 'questions-to-ask-an-independent-ndis-support-worker',
    title: 'Hiring an independent support worker: what to ask and check',
    summary: 'Some people choose to work directly with an independent worker rather than a larger provider. Here is what to look at first, and what to put in writing.',
    category: 'Choosing providers',
    publishedAt: '2026-10-12T10:30:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/personal-care-3.jpg',
    coverAlt: 'Two older women sitting together on a sofa',
    source: { label: 'NDIS: Working with providers', url: ndis('/participants/working-providers'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Support workers and recovery coaches', url: ndis('/participants/working-providers/support-workers-and-recovery-coaches') },

      { label: 'NDIS Quality and Safeguards Commission', url: 'https://www.ndiscommission.gov.au/' },
    ],
    sections: [
      {
        heading: 'Why people choose independent workers',
        paragraphs: [
          'Working with an individual can mean more continuity, more say over who comes into your home and a more personal relationship. For some supports it can also mean a simpler arrangement than a large organisation.',
          'It also means fewer built-in safeguards. A provider organisation usually handles screening, supervision, insurance, rosters and backup staff. With an independent worker, you or the person supporting you will often need to check these things directly.',
        ],
      },
      {
        heading: 'Things to check before you start',
        paragraphs: [
          'Ask to see photo identification and proof of any qualifications they mention. Ask whether they hold a current NDIS Worker Screening Check, and understand that what is required can depend on the role and on who engages the worker. Ask for references from previous clients or employers and contact them.',
          'Ask about insurance such as public liability and professional indemnity, and about first aid training and experience with your particular support needs. Ask for an ABN and how they invoice.',
        ],
      },
      {
        heading: 'What to put in writing',
        paragraphs: [
          'Agree in writing the supports, hours, locations, rate and what happens if a session is cancelled or the worker is unwell. Say who does what if something goes wrong, and how either of you can end the arrangement. A one-page agreement is far better than none.',
          'Check that the arrangement is allowed under how your plan is managed, and ask your plan manager or support coordinator how invoices should be handled so claims are paid without delay.',
        ],
      },
      {
        heading: 'Know the limits',
        paragraphs: [
          'If you engage someone directly, there may be legal obligations around tax, insurance and workplace safety, and the arrangement may be treated differently from buying a service from a business. Get advice from the relevant official bodies before you start rather than after a problem.',
          'The NDIS Code of Conduct applies to workers whether or not they are registered, and the NDIS Commission handles complaints. This is general information, not advice.',
        ],
      },
      {
        heading: 'Signs worth pausing for',
        paragraphs: [
          'Slow down if someone will not show identification, will not put anything in writing, asks for cash with no invoice or asks for your NDIS portal login, bank details or myGov access. Be cautious if they pressure you to sign quickly, suggest you do not tell your plan manager or coordinator, or discourage you from speaking to anyone else.',
          'None of these prove wrongdoing on their own, but a trustworthy worker will understand why you are asking and will not mind being checked. If something feels wrong, you can stop, talk to someone you trust and report it to the NDIS Commission.',
        ],
      },
    ],
  },
  {
    slug: 'self-managed-plan-managed-or-ndia-managed-how-to-decide',
    title: 'Self-managed, plan-managed or NDIA-managed: how to think about it',
    summary: 'The way your funding is managed affects which providers you can use and how much paperwork lands on you. Here is a plain-language way to compare the options.',
    category: 'Plans and funding',
    publishedAt: '2026-10-12T10:20:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/plan-management.jpg',
    coverAlt: 'A laptop, phone and notebook on a white desk',
    source: { label: 'NDIS: How to self-manage your funding', url: ndis('/participants/using-your-funding/self-managed-funding/how-self-manage-your-funding'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Plan-managed funding', url: ndis('/participants/using-your-funding/plan-managed-funding') },
      { label: 'NDIS: NDIA-managed funding', url: ndis('/participants/using-your-funding/ndia-managed') },

      { label: 'NDIS: Using your funding', url: ndis('/participants/using-your-funding') },
    ],
    sections: [
      {
        heading: 'Three ways funding can be managed',
        paragraphs: [
          'NDIS funding can be managed by the NDIA, by a plan manager, or by you (self-managed). Which one applies is recorded in your plan, and it can differ between parts of your plan. It affects who pays providers, how you track your budget and which providers you can use.',
        ],
      },
      {
        heading: 'NDIA-managed: the agency pays',
        paragraphs: [
          'With NDIA-managed funding, providers claim directly from the NDIA and you do not handle the money. It is the least paperwork for you. The trade-off is that you are generally limited to registered providers, and you rely on your budget statements from the NDIA to see what has been used.',
        ],
      },
      {
        heading: 'Plan-managed: a plan manager handles the money',
        paragraphs: [
          'A plan manager pays your providers’ invoices from your funding, keeps track of your budget and gives you regular statements. Plan management is usually funded in your plan as a separate support, so it does not normally reduce what is left for your actual supports; check how it appears in your own plan.',
          'Plan-managed participants have traditionally been able to use both registered and unregistered providers, but this is an area the NDIA has been changing, so confirm the current rules.',
        ],
      },
      {
        heading: 'Self-managed: you hold the reins',
        paragraphs: [
          'If you self-manage, you pay your providers, keep records and submit claims for reimbursement or direct payment. You have the most choice and flexibility, and also the most responsibility: you must keep invoices, follow the pricing rules and be able to show that purchases were allowed.',
          'Some people self-manage with help from a family member, nominee or bookkeeper. Read the official self-management page before deciding, and ask your support coordinator what a typical month looks like.',
        ],
      },
      {
        heading: 'A simple way to decide',
        paragraphs: [
          'Ask yourself three questions. How much time and confidence do I have for paperwork? How important is choice of provider, including unregistered ones? How much risk of an error am I comfortable carrying? Most people who want flexibility without the admin choose a plan manager. This is general information, not advice about your own plan.',
        ],
      },
    ],
  },
  {
    slug: 'what-does-an-ndis-plan-manager-do-and-how-to-choose-one',
    title: 'What does an NDIS plan manager do, and how do you choose one?',
    summary: 'A plan manager looks after the money side of your plan. Here is what the role covers, what it does not, and what to compare when you pick one.',
    category: 'Plans and funding',
    publishedAt: '2026-10-12T10:10:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/plan-management-2.jpg',
    coverAlt: 'A laptop showing a spreadsheet beside a calculator and notebooks',
    source: { label: 'NDIS: Using your funding', url: ndis('/participants/using-your-funding'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Support coordinators and plan managers', url: ndis('/participants/working-providers/support-coordinators-and-plan-managers') },

      { label: 'NDIS: What are NDIS supports?', url: ndis('/participants/using-your-funding/understanding-your-ndis-funding/what-are-ndis-supports') },
    ],
    sections: [
      {
        heading: 'What a plan manager does',
        paragraphs: [
          'A plan manager pays the invoices from your providers out of your NDIS funding, keeps track of your budget by category and gives you statements so you can see what has been spent. They can also help you understand which supports your plan can pay for and flag when you are running low.',
          'Because they are paid separately in your plan, using a plan manager normally does not reduce the money you have for your supports. Check how plan management appears in your own plan.',
        ],
      },
      {
        heading: 'What they do not do',
        paragraphs: [
          'A plan manager does not choose your supports, find you providers or decide what your plan includes. They are not a support coordinator, and they cannot change your plan. If you need help working out which supports to use or finding services, that is the role of a support coordinator or another adviser.',
        ],
      },
      {
        heading: 'What to compare',
        paragraphs: [
          'Ask how quickly they pay invoices and how you will know when a payment has been made. Ask how often you receive budget statements and whether you can see your spending online. Ask how they communicate, who you will deal with, and what happens if a provider’s invoice is rejected or queried.',
          'Ask whether they charge anything beyond what your plan provides, and ask for any fees in writing. Plan managers also differ in how well they work with the providers you already use, so ask whether they pay your current providers without fuss.',
        ],
      },
      {
        heading: 'Switching if it is not working',
        paragraphs: [
          'You can change plan manager if you are not happy with the service. Give notice as required in your agreement, and make sure the new manager receives your records. Keep copies of your statements so nothing is lost in the handover. This is general information, not advice about your plan.',
        ],
      },
      {
        heading: 'A sensible first month',
        paragraphs: [
          'After you sign up, check that your providers know to send invoices to your plan manager and that the first few have been paid without delay. Read your first statement and compare it with what you remember using; query anything that looks wrong straight away, while it is fresh.',
          'Note the date your plan ends and ask the plan manager to alert you when a category is running low. Keep a short list of who to call and how, so a problem does not become a delay in payment to a provider you rely on.',
        ],
      },
    ],
  },
  {
    slug: 'support-coordination-explained-do-you-need-it',
    title: 'Support coordination explained: do you need it?',
    summary: 'Support coordination helps you turn a plan into real services. Here is what it covers, who benefits most and what to ask a coordinator.',
    category: 'Plans and funding',
    publishedAt: '2026-10-12T10:00:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/support-coordination.jpg',
    coverAlt: 'A woman reading a letter at a kitchen table while another person looks on',
    source: { label: 'NDIS: What are NDIS supports?', url: ndis('/participants/using-your-funding/understanding-your-ndis-funding/what-are-ndis-supports'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Support coordinators and plan managers', url: ndis('/participants/working-providers/support-coordinators-and-plan-managers') },

      { label: 'NDIS: Using your funding', url: ndis('/participants/using-your-funding') },
    ],
    sections: [
      {
        heading: 'What support coordination is',
        paragraphs: [
          'Support coordination is funding in your plan for a person to help you put your plan into action. A support coordinator can explain what your plan allows, help you find and arrange providers, assist with service agreements and help you work out what to do when things are not going to plan.',
          'Plans can include different levels of support coordination, depending on how much help a person is judged to need. Your plan will show whether you have it and how many hours are funded.',
        ],
      },
      {
        heading: 'Who it tends to help most',
        paragraphs: [
          'It is most useful when you are new to the NDIS, when your needs are complex, when you have several providers to coordinate, or when you are moving between services or living arrangements. It can also help when you want to build your own skills to coordinate supports in future.',
          'If you already know what you need and how to arrange it, you may not need it. Plans are individual, and the NDIA decides what is funded.',
        ],
      },
      {
        heading: 'What a good coordinator does',
        paragraphs: [
          'A good coordinator listens to your goals, gives you options rather than a single provider, explains how decisions affect your budget and keeps you in control. They should be clear about how many hours they have used and what they have achieved with them.',
          'Be wary of any arrangement where one organisation steers you only to its own services without explaining the alternatives. You are entitled to ask a coordinator how they handle conflicts of interest.',
        ],
      },
      {
        heading: 'Questions to ask before you choose one',
        paragraphs: [
          'Ask how they work with people who have needs like yours, how often you will be in contact, how they report on the hours used, and how they will help you find and compare providers. Ask what happens at your plan review and whether they will help gather evidence. This is general information, not advice about your plan.',
        ],
      },
      {
        heading: 'How it differs from other roles',
        paragraphs: [
          'A plan manager looks after payments and budget tracking. A local area coordinator, in areas where the NDIA works through them, helps people understand the NDIS and prepare for planning. A support coordinator is funded in your plan to help you use it once it is approved.',
          'These roles can overlap in conversation, but they have different jobs and different funding. If you are not sure who to call about something, ask your support coordinator or the NDIA to explain who is responsible.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-prepare-for-an-ndis-plan-review',
    title: 'How to prepare for an NDIS plan review',
    summary: 'A plan review goes better when you arrive with your own evidence and a clear picture of what has changed. Here is a practical way to get ready.',
    category: 'Plans and funding',
    publishedAt: '2026-10-12T09:50:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/plan-management-6.jpg',
    coverAlt: 'Papers, a calculator and a cup of coffee on a desk',
    source: { label: 'NDIS: Changing your plan', url: ndis('/participants/changing-your-plan'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Preparing for your plan meeting', url: ndis('/participants/creating-plan/preparing-your-plan-meeting') },

      { label: 'NDIS: Creating your plan', url: ndis('/participants/creating-plan') },
    ],
    sections: [
      {
        heading: 'Start well before the date',
        paragraphs: [
          'Plan reviews and reassessments are easier when you do not rush them. Put the date in your diary, then work backwards: gather reports, check what has been spent and think about what has changed in your life since the plan began.',
        ],
      },
      {
        heading: 'Look at how the plan has worked',
        paragraphs: [
          'Check which supports you used, which you did not and why. If a support was too short, too hard to find or did not suit you, say so. If you underspent a category because the right service was unavailable, that is useful information and different from not needing the support.',
          'Write down what you have achieved against each goal, even small things. Concrete examples carry more weight than general statements.',
        ],
      },
      {
        heading: 'Gather your evidence',
        paragraphs: [
          'Collect recent reports from therapists, doctors or other professionals who know your needs, and ask them to state clearly what supports they recommend and why. Keep records of any significant changes in health, housing, family supports, education or work.',
          'If you are asking for something new, such as assistive technology or a different level of support, ask the relevant professional for a report that connects the item to your disability and your goals.',
        ],
      },
      {
        heading: 'On the day, and afterwards',
        paragraphs: [
          'You can bring a family member, advocate, support coordinator or other person you trust. Take a short list of the points that matter most so they are not forgotten. Ask how decisions will be communicated and when.',
          'If you disagree with a decision, there are processes to ask for it to be reviewed and there are time limits, so read the official guidance promptly and consider getting help from an independent advocacy service. This article is general information, not advice about your plan.',
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        paragraphs: [
          'Leaving evidence until the last week, describing needs in general terms rather than with examples, assuming the person assessing already knows your history, and not asking for the plan to be explained afterwards are all common. Another is not saying how an unspent budget came about: unspent money can look like unneeded money unless you explain the barriers.',
          'Keep a copy of everything you send and receive, and note the date and name of anyone you speak to. A short written summary after a meeting is a good habit.',
        ],
      },
    ],
  },
  {
    slug: 'ndis-core-capacity-building-and-capital-supports-explained',
    title: 'Core, Capacity Building and Capital supports explained',
    summary: 'NDIS plans have traditionally been organised into three kinds of budget. Here is what each is generally for, and why the difference matters when you spend.',
    category: 'Plans and funding',
    publishedAt: '2026-10-12T09:40:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/general-3.jpg',
    coverAlt: 'Two women reviewing a tablet at a meeting table',
    source: { label: 'NDIS: What are NDIS supports?', url: ndis('/participants/using-your-funding/understanding-your-ndis-funding/what-are-ndis-supports'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Using your funding', url: ndis('/participants/using-your-funding') },
    ],
    sections: [
      {
        heading: 'Three kinds of budget',
        paragraphs: [
          'NDIS funding has traditionally been grouped into Core supports, Capacity Building supports and Capital supports. Each has a different purpose and different rules about how it can be spent. The NDIA has been changing how budgets are described in some plans, so treat this as a guide and check what your own plan says.',
        ],
      },
      {
        heading: 'Core supports: everyday help',
        paragraphs: [
          'Core supports help with everyday activities: personal care, household tasks, consumables, transport and taking part in social and community life. This is usually the largest part of a budget. Core budgets are often the most flexible of the three, which means funds may be able to be used across several core categories, depending on your plan.',
        ],
      },
      {
        heading: 'Capacity Building: skills and independence',
        paragraphs: [
          'Capacity Building supports aim to build skills and independence over time. They include therapies, support coordination, help with finding work, and skills training. These budgets are typically more tightly tied to specific purposes, so funds in one category usually cannot be moved to another.',
        ],
      },
      {
        heading: 'Capital: equipment and modifications',
        paragraphs: [
          'Capital supports are larger, one-off or less frequent items: assistive technology, home modifications and specialist housing. They are usually funded for a specific item or purpose, and may need assessments or quotes before they are approved.',
        ],
      },
      {
        heading: 'Why this matters when you spend',
        paragraphs: [
          'Knowing which budget a support comes from helps you plan across the year, avoid running out early and understand why a provider may say a service is not available from a particular category. If you are unsure which budget a support belongs to, ask your plan manager, support coordinator or the NDIA. This is general information, not advice.',
        ],
      },
      {
        heading: 'When a support is declined',
        paragraphs: [
          'If a provider or plan manager says a support cannot be paid from a particular budget, ask which budget they believe it belongs to and why. Sometimes it is a matter of a different support item or category; sometimes it genuinely is not funded in your plan.',
          'If you think it should be, write down what you need and why, then ask your support coordinator or the NDIA how to request a change. Keep in mind that an item needs to be related to your disability and be reasonable and necessary, so evidence from a professional can make a real difference.',
        ],
      },
    ],
  },
  {
    slug: 'sda-and-sil-explained-the-difference',
    title: 'SDA and SIL explained: the difference between the home and the support',
    summary: 'Specialist Disability Accommodation and Supported Independent Living are often mentioned together, but they are different supports. Here is the difference in plain language.',
    category: 'Housing and living',
    publishedAt: '2026-10-12T09:30:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/housing-2.jpg',
    coverAlt: 'A support worker and a woman at home, with a wheelchair in the background',
    source: { label: 'NDIS: Home and living', url: ndis('/participants/home-and-living'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Life transitions', url: ndis('/participants/life-transitions') },
    ],
    sections: [
      {
        heading: 'Two different things',
        paragraphs: [
          'Specialist Disability Accommodation, or SDA, is about the building. It is housing designed or modified for people with very high support needs or extreme functional impairment. Supported Independent Living, or SIL, is about the help delivered inside a home: assistance with daily tasks, such as personal care, meals and routines.',
          'You can have one without the other. Some people live in SDA and receive SIL; others receive SIL in an ordinary rented house; others have neither.',
        ],
      },
      {
        heading: 'How SDA is funded and who can access it',
        paragraphs: [
          'SDA funding is included in a plan for people the NDIA decides meet specific criteria, usually involving very high support needs. It is paid to the SDA provider as part of the housing arrangement and is separate from the support funding used for day-to-day help. Having a disability, or needing a lot of support, does not by itself mean SDA will be funded.',
          'If you are considering SDA, ask the NDIA how eligibility is assessed and what evidence is needed. Official guidance sets out the process.',
        ],
      },
      {
        heading: 'How SIL works',
        paragraphs: [
          'SIL is funded as a support rather than as housing. It pays for the staff who help with daily living in a shared or individual home, so it is tied to a provider’s roster and the number of people in the household. SIL providers usually put together a quote that the NDIA considers when setting funding.',
          'You can choose your SIL provider independently of who owns or manages the home, and it is worth understanding where the housing provider’s role ends and the support provider’s begins.',
        ],
      },
      {
        heading: 'Questions to ask before you move',
        paragraphs: [
          'Ask who is responsible for the house and who is responsible for the support, how housemates are chosen, what your rights are as a tenant, and how you can change support providers without losing your home. Ask how repairs, visitors and changes to your routine are handled.',
          'Take your time. Visit the home if you can, meet the people who would support you and bring someone you trust. This is general information, not advice about your plan.',
        ],
      },
    ],
  },
  {
    slug: 'assistive-technology-and-the-ndis-where-to-start',
    title: 'Assistive technology and the NDIS: where to start',
    summary: 'From simple aids to complex equipment, assistive technology can make daily life easier. Here is how the process generally works and what to prepare.',
    category: 'Everyday supports',
    publishedAt: '2026-10-12T09:20:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/assistive-technology.jpg',
    coverAlt: 'Three colleagues looking at a laptop together, one using a prosthetic arm and a wheelchair',
    source: { label: 'NDIS: Assistive technology', url: ndis('/participants/assistive-technology'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: What are NDIS supports?', url: ndis('/participants/using-your-funding/understanding-your-ndis-funding/what-are-ndis-supports') },
    ],
    sections: [
      {
        heading: 'What counts as assistive technology',
        paragraphs: [
          'Assistive technology covers equipment that helps a person do something they would otherwise find difficult or impossible, from simple aids around the home to mobility equipment and communication devices. To be funded, an item generally has to be related to a person’s disability and be considered reasonable and necessary.',
        ],
      },
      {
        heading: 'Simple items and complex items',
        paragraphs: [
          'Lower-cost, lower-risk items are usually easier to arrange and may not need a formal assessment. Higher-cost or more complex equipment, especially if it needs to be fitted or set up for one person, usually needs an assessment by a suitably qualified professional and one or more quotes.',
          'Your plan may already include a budget for assistive technology, or it may need to be requested. The official page sets out what is expected for different types of item.',
        ],
      },
      {
        heading: 'Getting ready',
        paragraphs: [
          'Describe what you are trying to do and what makes it hard now. Ask your therapist or other health professional whether they can assess you or refer you to an assessor, and ask what evidence they will need to write. Note down what you have already tried and why it did not work.',
          'If possible, trial the equipment before it is purchased, so you know it suits your body, your home and your routine.',
        ],
      },
      {
        heading: 'After you have it',
        paragraphs: [
          'Ask about training, set-up, warranties and who to call for repairs or adjustments, and whether maintenance is funded. Equipment needs can change as your circumstances do, so keep records and review it from time to time. This is general information, not advice about your plan.',
        ],
      },
      {
        heading: 'Common pitfalls',
        paragraphs: [
          'Buying an item before it has been approved, relying on a salesperson’s description of what is “covered”, or choosing equipment without a trial are the most common mistakes. Another is forgetting about repairs and replacement, which can matter as much as the first purchase.',
          'Ask the provider to put the item, price and what is included in writing before you commit, and check with your plan manager or the NDIA if you are unsure whether it can be paid from your plan.',
        ],
      },
    ],
  },
  {
    slug: 'finding-ndis-supports-in-regional-and-remote-areas',
    title: 'Finding NDIS supports in regional and remote areas',
    summary: 'Fewer providers and longer distances change how you search. Here is a practical approach to widening the search, asking about travel and building a back-up.',
    category: 'Local supports',
    publishedAt: '2026-10-12T12:00:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/transport-2.jpg',
    coverAlt: 'A campervan parked outside a house on a quiet street',
    source: { label: 'NDIS: Working with providers', url: ndis('/participants/working-providers'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS provider finder', url: ndis('/participants/working-providers/finding-providers/provider-finder') },
      { label: 'NDIS: Using your funding', url: ndis('/participants/using-your-funding') },
    ],
    sections: [
      {
        heading: 'Widen the search before you narrow it',
        paragraphs: [
          'In smaller towns the right provider may be based in the nearest regional centre rather than in your own suburb or town. Search your town, then the closest larger centre, then the surrounding region. Providers often list the areas they travel to, so read the service area, not just the address.',
          'Search by the support you need as well as by place. A provider that does not appear under your town name may still visit it on set days, and a different type of provider may be able to deliver part of the support you are after.',
        ],
      },
      {
        heading: 'Ask how the service actually reaches you',
        paragraphs: [
          'Ask how often workers visit, which days, and how long a visit lasts. Ask what happens if a worker is unwell, if roads are closed or if weather stops a trip, and who will let you know. A provider that visits fortnightly is a very different service from one that visits weekly.',
          'Ask whether travel is charged and how, and have the answer written into your service agreement. Pricing rules allow travel to be charged in some situations, so the arrangement should be clear before the first visit rather than appearing on an invoice later.',
        ],
      },
      {
        heading: 'Consider supports delivered remotely',
        paragraphs: [
          'Some supports, such as certain therapy sessions, coordination and planning conversations, may be delivered by phone or video. These can widen your choice a great deal, but they do not suit everyone or every support. Ask whether it is appropriate for your needs and whether a mix of remote and in-person visits would work.',
        ],
      },
      {
        heading: 'Build a back-up and keep records',
        paragraphs: [
          'With few providers, losing one can leave a gap. Where you can, keep the details of a second provider or a local community organisation, and ask your current provider how they handle absences. Keep a note of the providers you contacted and what they said.',
          'If you cannot find the support your plan includes, tell your support coordinator or the NDIA, and keep your notes. That evidence can matter at your next plan review. This is general information, not advice about your plan.',
        ],
      },
    ],
  },
  {
    slug: 'moving-to-a-new-town-or-state-with-the-ndis',
    title: 'Moving to a new town or state with the NDIS: a practical checklist',
    summary: 'Your plan travels with you, but your providers may not. Here is what to sort out before, during and after a move.',
    category: 'Local supports',
    publishedAt: '2026-10-12T11:50:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/housing.jpg',
    coverAlt: 'A young man in a wheelchair at home in a kitchen',
    source: { label: 'NDIS: Changing your plan', url: ndis('/participants/changing-your-plan'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Life transitions', url: ndis('/participants/life-transitions') },
      { label: 'NDIS: Home and living', url: ndis('/participants/home-and-living') },
    ],
    sections: [
      {
        heading: 'Tell the right people, early',
        paragraphs: [
          'A move is a change in your circumstances, and it affects which providers can support you. Let the NDIA know your new address and plans as soon as you can, and tell your plan manager and support coordinator so invoices and contact details stay correct.',
          'Ask whether the move changes anything about how your plan should work. Moving can affect travel, the availability of particular supports and, sometimes, what you need. If you think your plan will no longer fit, ask about a change before the move rather than after it.',
        ],
      },
      {
        heading: 'Find supports at the other end before you go',
        paragraphs: [
          'Start looking for providers in the new area early, because some have waiting lists. Search the new suburb and the nearest larger centre, and contact a few. Ask whether they have capacity from your move date and what they need from you to begin.',
          'If you rely on a particular support worker or therapist, ask your current provider whether they can help with a handover, and whether a short overlap is possible so you are not left without support in the first weeks.',
        ],
      },
      {
        heading: 'Ending services you are leaving',
        paragraphs: [
          'Check the notice period in each service agreement and give notice in writing. Ask for any records you may need, such as reports or progress notes, and confirm the final invoice goes to the right place so it is paid from the correct budget.',
        ],
      },
      {
        heading: 'Housing, transport and equipment',
        paragraphs: [
          'If your move involves different housing, check whether the new home needs modifications or equipment, and whether those need assessments and approvals that take time. Think about how you will travel to appointments and activities from the new address.',
          'Moving can be unsettling, so build in extra support for the first weeks if you can. This is general information, not advice about your plan. Check the linked official pages and speak to the NDIA about your own circumstances.',
        ],
      },
      {
        heading: 'Questions to ask a new provider about the move',
        paragraphs: [
          'Ask when they could start, whether you would be placed on a waiting list, and who you would deal with first. Ask whether they already work with your plan manager, and whether they can provide a written service agreement before you arrive so there are no surprises on the first day.',
          'If you are moving because of a change in your needs or housing, say so. It helps a provider understand what you are likely to need over the first few months and whether they are the right fit.',
        ],
      },
    ],
  },
  {
    slug: 'personal-care-and-daily-living-supports-what-to-ask',
    title: 'Personal care and daily living supports: what to ask a provider',
    summary: 'Help with showering, dressing, meals and the household is personal. These are the questions that help you set routines, protect your dignity and keep control.',
    category: 'Everyday supports',
    publishedAt: '2026-10-12T11:40:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/personal-care-2.jpg',
    coverAlt: 'Two older women holding hands with a younger woman',
    source: { label: 'NDIS: What are NDIS supports?', url: ndis('/participants/using-your-funding/understanding-your-ndis-funding/what-are-ndis-supports'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Working with providers', url: ndis('/participants/working-providers') },
    ],
    sections: [
      {
        heading: 'What daily living supports are for',
        paragraphs: [
          'Personal care and daily living supports help with everyday tasks such as showering, dressing, preparing meals, taking medication as prescribed and looking after the home. The aim is for you to live as independently as you can, in the way you choose, rather than to do things for you that you can do yourself.',
          'What your plan includes is decided individually. Check how much support is funded and for which tasks before you ask a provider to quote.',
        ],
      },
      {
        heading: 'Describe the routine you want',
        paragraphs: [
          'Before the first visit, write down what happens on a good day: times, steps, products, preferences and anything that matters to you, such as privacy, the order of tasks or who is in the room. A provider can only respect a routine it has been told about.',
          'You can ask for a worker of a particular gender, for a small team of regular workers, or for someone who speaks your language. A good provider will say what it can and cannot do, rather than promising everything.',
        ],
      },
      {
        heading: 'Questions about the workers',
        paragraphs: [
          'Ask who will come, how workers are trained for this kind of support, and how they are supervised. Ask what happens if your regular worker is away and how you will be told who is covering.',
          'Ask how a worker will know your routine, whether notes are kept, and how you can see or correct them. Continuity matters most for personal care because you should not have to explain yourself to a stranger each time.',
        ],
      },
      {
        heading: 'Dignity, consent and feedback',
        paragraphs: [
          'You are entitled to be treated with respect, to say no to something, and to ask for a task to be done differently. Ask how the provider handles a request to change the routine and how you can raise a concern, including with someone other than the worker concerned.',
          'Review how things are going after the first few weeks, and again when your needs change. Keep notes of what is working and what is not so you can use them at your next plan review. This is general information, not advice about your plan.',
        ],
      },
    ],
  },
  {
    slug: 'transport-and-the-ndis-getting-to-appointments-and-activities',
    title: 'Transport and the NDIS: getting to appointments and activities',
    summary: 'Transport funding is set apart from other supports and works differently. Here is how to think about using it and what to ask a provider who drives.',
    category: 'Everyday supports',
    publishedAt: '2026-10-12T11:30:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/transport.jpg',
    coverAlt: 'A man in a wheelchair beside a car, smiling',
    source: { label: 'NDIS: What are NDIS supports?', url: ndis('/participants/using-your-funding/understanding-your-ndis-funding/what-are-ndis-supports'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Using your funding', url: ndis('/participants/using-your-funding') },
    ],
    sections: [
      {
        heading: 'Transport is usually its own budget',
        paragraphs: [
          'Where transport is included in a plan, it is generally funded separately from your other supports and is set according to your circumstances. It is not simply a share of your support budget, so check your plan to see whether you have it and how it is meant to be used.',
          'The amount and the rules differ from person to person. If you are unsure whether a particular journey is covered, ask your plan manager, support coordinator or the NDIA before you rely on it.',
        ],
      },
      {
        heading: 'What transport funding is for',
        paragraphs: [
          'Transport funding is intended to help you travel to activities connected to your goals and plan, such as community participation, work or study. It is generally not a general allowance for all travel. Everyday medical trips, for example, are often treated differently.',
          'Keep a simple record of journeys, purposes and costs so you can show how funding was used if asked.',
        ],
      },
      {
        heading: 'Options to think about',
        paragraphs: [
          'You might use public transport, taxis or ride-share, community transport, a support worker who drives, or your own or a family member’s vehicle. Each has different costs and suits different needs. If you use a wheelchair or need assistance getting in and out of a vehicle, check accessibility before you book.',
          'A support worker travelling with you may be charged for their time as well as the trip, so ask how the costs are split and how the journey is recorded.',
        ],
      },
      {
        heading: 'Questions to ask a provider who drives',
        paragraphs: [
          'Ask whose vehicle is used, how it is insured and whether it suits your equipment. Ask how time and distance are charged, whether there are minimum charges, and what happens if a trip is cancelled or delayed.',
          'Put the answers in your service agreement so the costs on your invoice match what you expected. This is general information, not advice about your plan.',
        ],
      },
      {
        heading: 'Plan ahead and have a back-up',
        paragraphs: [
          'Accessible vehicles and regular drivers can be booked out, so arrange regular trips as standing bookings where you can. Have a second option for when the first falls through, such as a different taxi service or a person who can step in, and ask what happens if weather or a vehicle breakdown affects a planned trip.',
          'Keep receipts and notes so that you can show what transport was used for, and review at the end of each period whether the budget is lasting the way you expected.',
        ],
      },
    ],
  },
  {
    slug: 'choosing-a-therapist-occupational-therapy-physiotherapy-speech-pathology',
    title: 'Choosing a therapist: occupational therapy, physiotherapy and speech pathology',
    summary: 'Three common therapies with different focuses. Here is how to work out where to start and what to ask before booking.',
    category: 'Everyday supports',
    publishedAt: '2026-10-12T11:20:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/therapy-2.jpg',
    coverAlt: 'A physiotherapist treating a woman on a treatment table',
    source: { label: 'NDIS: What are NDIS supports?', url: ndis('/participants/using-your-funding/understanding-your-ndis-funding/what-are-ndis-supports'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Assistive technology', url: ndis('/participants/assistive-technology') },
    ],
    sections: [
      {
        heading: 'Three therapies, three focuses',
        paragraphs: [
          'Occupational therapy generally focuses on doing everyday activities: daily routines, the home, equipment and how tasks are set up. Physiotherapy generally focuses on movement, strength, balance, mobility and pain. Speech pathology generally focuses on communication and, for some people, eating and swallowing.',
          'Many people benefit from more than one, and the lines overlap. A therapist should be able to tell you honestly when another discipline would be better placed to help.',
        ],
      },
      {
        heading: 'Start from the goal',
        paragraphs: [
          'Choose by what you want to be able to do, not by the name of the therapy. “Make it safer to shower”, “walk to the shops”, or “be understood by my family” each point to a different starting place. Write the goal down and take it to the first appointment.',
        ],
      },
      {
        heading: 'Questions to ask a therapist',
        paragraphs: [
          'Ask how much experience they have with your condition and your age group, how an assessment works, how many sessions to expect and how you will know whether it is working. Ask whether they work in your home or community or only in a clinic, and whether some sessions can be done by phone or video.',
          'Ask who else they will involve, such as family, support workers or school staff, and how they teach others to carry on the work between sessions. Ask what reports you will receive and when.',
        ],
      },
      {
        heading: 'Costs, reports and plan reviews',
        paragraphs: [
          'Ask about the charge for the session itself and for travel, report writing and preparation, and check how these will appear on invoices. Therapies usually sit in a particular part of your budget, so check which one and how much is left.',
          'Reports from therapists are among the most useful evidence at a plan review, so ask for one that links the recommendations to your goals. This is general information, not advice about your plan.',
        ],
      },
      {
        heading: 'Make the sessions count between appointments',
        paragraphs: [
          'Therapy usually works best when what is practised in the session carries on at home and in the community. Ask for a short written or visual plan that you and the people around you can follow, and agree who will do what.',
          'Tell the therapist plainly if something is not working, is too hard or does not fit your routine. A good therapist will adjust the plan rather than expect you to cope with one that does not suit you.',
        ],
      },
    ],
  },
  {
    slug: 'nursing-and-health-supports-at-home-what-the-ndis-covers',
    title: 'Nursing and health supports at home: where the NDIS fits',
    summary: 'The NDIS funds supports related to disability, while the health system covers other care. Here is how to make sense of the boundary and what to ask a nurse or provider.',
    category: 'Everyday supports',
    publishedAt: '2026-10-12T11:10:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/older-people-2.jpg',
    coverAlt: 'A carer in a face mask with an older woman, both smiling',
    source: { label: 'NDIS: What are NDIS supports?', url: ndis('/participants/using-your-funding/understanding-your-ndis-funding/what-are-ndis-supports'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Using your funding', url: ndis('/participants/using-your-funding') },
    ],
    sections: [
      {
        heading: 'Two systems, one person',
        paragraphs: [
          'The NDIS funds supports that are related to a person’s disability. Health care, such as treatment of illness and injury, is generally the responsibility of the health system, including GPs, hospitals and public health services. Some needs sit between the two, and the boundary is not always obvious.',
          'If a service is declined as a health responsibility, ask which system is expected to provide it and who you should speak to. A support coordinator can often help work out the answer.',
        ],
      },
      {
        heading: 'Where nursing may come in',
        paragraphs: [
          'Some plans include nursing support for needs that arise from a disability, for example help with continence, wound care, or other ongoing health tasks that cannot safely be done without clinical skills. Whether yours does depends on your needs and what the NDIA has decided is reasonable and necessary.',
        ],
      },
      {
        heading: 'Who should deliver it',
        paragraphs: [
          'Clinical tasks should be done by someone with the right qualifications. Ask whether the nurse is registered with the national regulator, what experience they have with your needs and what training other workers have for any tasks delegated to them.',
          'Ask how medication, health information and changes in condition are recorded and shared with your GP or specialists, so care is consistent across everyone involved.',
        ],
      },
      {
        heading: 'Questions to ask before you start',
        paragraphs: [
          'Ask how often the nurse will visit, what happens if there is an emergency and who you should call out of hours. Ask how the service will be charged, whether travel or after-hours rates apply and how those will appear on invoices.',
          'Keep your GP informed about the supports you use. This is general information, not medical or plan advice; speak to your health professionals and your plan manager or support coordinator about your own situation.',
        ],
      },
      {
        heading: 'When your needs change',
        paragraphs: [
          'Health needs can change after an illness, injury or hospital stay, and that can affect the supports you need. Keep letters or reports from your doctors and nurses that describe the change, and share them with your support coordinator or the NDIA when you ask about a change to your plan.',
          'If a hospital stay is planned, ask the hospital and your support coordinator early about arrangements for coming home, so supports are in place before discharge rather than arranged in a rush.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-change-ndis-provider-without-losing-support',
    title: 'How to change NDIS provider without losing support',
    summary: 'You are allowed to change providers. A little planning means the new service is ready before the old one ends, and nothing falls through the gap.',
    category: 'Choosing providers',
    publishedAt: '2026-10-12T13:00:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/general-2.jpg',
    coverAlt: 'Two men talking at a table in a bright room',
    source: { label: 'NDIS: Your rights and responsibilities', url: ndis('/participants/working-providers/your-rights-and-responsibilities'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Working with providers', url: ndis('/participants/working-providers') },
    ],
    sections: [
      {
        heading: 'You are allowed to change',
        paragraphs: [
          'Choice and control are central to the NDIS, which means you can choose your providers and change them. You do not usually need the current provider’s agreement to move on, although you do need to follow the notice terms in any service agreement you signed.',
          'Wanting to change does not mean something has gone badly wrong. Needs shift, workers leave and people simply find a better fit. What matters is doing it in a way that keeps you supported.',
        ],
      },
      {
        heading: 'Line up the new service before ending the old one',
        paragraphs: [
          'Contact the new provider first and ask when they could start, who would support you and what they need from you. Ask for their service agreement to read before you commit. Only end the existing service once you know when the new one begins, so there is no gap.',
          'If you rely on regular routines, medication prompts or personal care, plan a handover period of a few days or weeks where possible, so the new workers learn how you like things done.',
        ],
      },
      {
        heading: 'Check notice, charges and your budget',
        paragraphs: [
          'Read the notice period and any cancellation terms in your current agreement and give notice in writing, keeping a copy. Ask for a final invoice so it can be paid from the correct part of your plan, and ask your plan manager to confirm there are no outstanding claims.',
          'Tell your plan manager and support coordinator about the change so invoices go to the right place and your budget statements stay accurate.',
        ],
      },
      {
        heading: 'Sharing information and keeping records',
        paragraphs: [
          'With your consent, ask the current provider to pass on useful information such as routines, preferences, risks and recent reports. You decide what is shared. Take your own copies of anything you are given, and keep the emails and notes about the change.',
          'If you are changing because of a concern about safety or conduct, see our guide to making a complaint. This article is general information, not advice about your own agreement or plan.',
        ],
      },
    ],
  },
  {
    slug: 'making-a-complaint-about-an-ndis-provider-or-worker',
    title: 'Making a complaint about an NDIS provider or worker: where to start',
    summary: 'Raising a concern can feel daunting. Here is a clear order of steps, who deals with what, and how to keep a record as you go.',
    category: 'Your rights',
    publishedAt: '2026-10-12T12:50:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/mental-health-2.jpg',
    coverAlt: 'Two women talking on a sofa',
    source: { label: 'NDIS: Your rights and responsibilities', url: ndis('/participants/working-providers/your-rights-and-responsibilities'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Feedback and complaints about the NDIA', url: ndis('/contact/feedback-and-enquiries') },
      { label: 'NDIS Quality and Safeguards Commission', url: 'https://www.ndiscommission.gov.au/' },
    ],
    sections: [
      {
        heading: 'If someone is in danger',
        paragraphs: [
          'If a person is in immediate danger or needs urgent medical help, contact emergency services first. A complaint can wait; safety cannot.',
        ],
      },
      {
        heading: 'Start with the provider, if it is safe to',
        paragraphs: [
          'Most providers have a complaints process, and many problems are resolved by raising them there. Ask for the process in writing, say clearly what happened, when and what you would like to change, and ask when you can expect a response.',
          'If it is not safe or comfortable to raise it with the provider, or the concern is about something serious, you do not have to go through them first. You can go straight to the body that oversees providers.',
        ],
      },
      {
        heading: 'When to go to the NDIS Commission',
        paragraphs: [
          'The NDIS Quality and Safeguards Commission oversees the quality and safety of NDIS supports. It handles complaints about registered providers and also about workers and providers who are not registered. It can also take serious matters further. Contact the Commission if the provider does not respond, you are not satisfied with its response, or the concern is serious.',
          'Complaints about a decision or the service of the NDIA itself are handled differently, through the NDIA’s own feedback and complaints process.',
        ],
      },
      {
        heading: 'Keep a record, and get support',
        paragraphs: [
          'Write down what happened as soon as you can, with dates, names and who else was there. Keep emails, messages, invoices and any shift notes. A short timeline is easier for everyone to follow than a long account.',
          'You do not have to do this alone. An independent advocate, a support coordinator, a trusted family member or friend can help you prepare and attend meetings. This article is general information, not legal advice.',
        ],
      },
      {
        heading: 'What to expect afterwards',
        paragraphs: [
          'A provider or the Commission will usually acknowledge your complaint and may ask for more information. Ask how long a response is likely to take and ask for the outcome in writing. If you are not satisfied with the result, ask what options exist to have it looked at again.',
          'You should not be treated worse for raising a concern. If you think that is happening, say so in writing and tell the body overseeing the complaint.',
        ],
      },
    ],
  },
  {
    slug: 'your-rights-as-an-ndis-participant-choice-control-and-safety',
    title: 'Your rights as an NDIS participant: choice, control and safety',
    summary: 'Knowing what you can expect from providers and workers makes it easier to speak up. Here is a plain-language summary of rights and responsibilities.',
    category: 'Your rights',
    publishedAt: '2026-10-12T12:40:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/condition-intellectual.jpg',
    coverAlt: 'Three women smiling together against a red wall',
    source: { label: 'NDIS: Your rights and responsibilities', url: ndis('/participants/working-providers/your-rights-and-responsibilities'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Working with providers', url: ndis('/participants/working-providers') },
      { label: 'NDIS Quality and Safeguards Commission', url: 'https://www.ndiscommission.gov.au/' },
    ],
    sections: [
      {
        heading: 'Choice and control',
        paragraphs: [
          'You have the right to make decisions about your own life and supports, including which providers to use, what your supports look like day to day and when to change them. Other people can help you decide, but the decisions are yours unless a formal arrangement says otherwise.',
          'You can ask questions, ask for information in a format you can use, and take time to decide before you sign anything.',
        ],
      },
      {
        heading: 'Respect, privacy and dignity',
        paragraphs: [
          'You should be treated with respect, and your personal information should be kept private and shared only for good reasons and with your consent. That includes what is written in shift notes, shared with other services or passed to someone else in your life.',
        ],
      },
      {
        heading: 'Safe, competent support',
        paragraphs: [
          'The NDIS Code of Conduct sets expectations for providers and workers, whether or not they are registered. In summary, it asks them to act with respect for your rights, respect your privacy, provide supports safely and competently, act with honesty and transparency, raise and act on concerns about safety and quality, and take steps to prevent and respond to violence, exploitation, neglect, abuse and sexual misconduct.',
          'You should not accept less than that. If a worker or provider falls short, there are ways to raise it, set out in our guide to making a complaint.',
        ],
      },
      {
        heading: 'What is expected of you',
        paragraphs: [
          'Rights come with some responsibilities. These include giving accurate information, using your funding for the supports it was approved for, keeping records where required, and telling the NDIA about important changes in your circumstances. Check the official page for the current list.',
          'This is general information, not legal advice. If you need help understanding your rights in a particular situation, an independent advocacy service can help.',
        ],
      },
      {
        heading: 'Putting your rights into practice',
        paragraphs: [
          'Rights are easier to use when you have simple phrases ready. “I would like time to think about that.” “Please put that in writing.” “I would prefer a different worker.” “Please do not share that without asking me.” A good provider will take requests like these in its stride.',
          'Keep a note of anything that concerns you while it is fresh, and tell someone you trust. Speaking up early usually makes it easier to fix.',
        ],
      },
    ],
  },
  {
    slug: 'ndis-jargon-explained-terms-you-will-hear',
    title: 'NDIS jargon explained: the terms you will hear and what they mean',
    summary: 'Plans, supports, coordinators, managers, registered providers: a plain-language glossary of the words that come up most often.',
    category: 'Plans and funding',
    publishedAt: '2026-10-12T12:30:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/guides-3.jpg',
    coverAlt: 'A woman reading a notebook at a cafe table',
    source: { label: 'NDIS: What are NDIS supports?', url: ndis('/participants/using-your-funding/understanding-your-ndis-funding/what-are-ndis-supports'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Creating your plan', url: ndis('/participants/creating-plan') },
      { label: 'NDIS: Using your funding', url: ndis('/participants/using-your-funding') },
    ],
    sections: [
      {
        heading: 'About your plan',
        paragraphs: [
          'A participant is a person with an approved NDIS plan. Your plan sets out your goals and the funding for supports to help you reach them. “Reasonable and necessary” is the test used to decide whether a support can be funded: broadly, that it relates to your disability, helps you pursue your goals and is good value.',
          'A plan review or reassessment is a scheduled look at how your plan has worked and what should change. A plan variation is a change to an existing plan, usually when something has changed in your circumstances.',
        ],
      },
      {
        heading: 'About money',
        paragraphs: [
          'Funding has traditionally been grouped into Core, Capacity Building and Capital budgets. Pricing arrangements set the maximum amounts that can be charged for many supports. A claim is a request for payment for a support that has been delivered, usually made by a provider, plan manager or you if you self-manage.',
          'Management type describes who looks after the money: the NDIA, a plan manager, or you.',
        ],
      },
      {
        heading: 'About the people',
        paragraphs: [
          'A support coordinator helps you use your plan. A plan manager handles payments and budget tracking. A local area coordinator, where the NDIA works through them, helps people understand the NDIS and prepare for planning. A nominee is someone formally appointed to act for you or receive information on your behalf.',
          'A registered provider has been approved by the NDIS Quality and Safeguards Commission; an unregistered provider has not, but still must follow the Code of Conduct.',
        ],
      },
      {
        heading: 'About homes and equipment',
        paragraphs: [
          'Specialist Disability Accommodation (SDA) is a type of housing designed for people with very high support needs. Supported Independent Living (SIL) is help with daily tasks in a shared or individual home. Assistive technology means equipment that helps you do things you would otherwise find hard, and home modifications are changes to your home to make it safer or more accessible.',
          'If you hear a term you do not know, ask for it to be explained. A good provider or coordinator will not mind. This is general information, not advice about your plan.',
        ],
      },
    ],
  },
  {
    slug: 'keeping-records-of-your-ndis-supports-a-simple-system',
    title: 'Keeping records of your NDIS supports: a simple system',
    summary: 'Good records make plan reviews, claim queries and changes of provider far easier. Here is a light-touch way to keep them.',
    category: 'Plans and funding',
    publishedAt: '2026-10-12T12:20:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/funding-veterans.jpg',
    coverAlt: 'A woman sitting in an armchair going through papers',
    source: { label: 'NDIS: Using your funding', url: ndis('/participants/using-your-funding'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Self-managed funding', url: ndis('/participants/using-your-funding/self-managed-funding') },
      { label: 'NDIS: Plan-managed funding', url: ndis('/participants/using-your-funding/plan-managed-funding') },
    ],
    sections: [
      {
        heading: 'Why bother',
        paragraphs: [
          'Records are your evidence. They show what supports you used, what they cost and what difference they made. That helps at a plan review, when a claim is queried, when you change provider or when something goes wrong and you need to explain what happened.',
          'If you self-manage, there are record-keeping expectations for the funding you spend, so check the official page for what applies to you.',
        ],
      },
      {
        heading: 'What to keep',
        paragraphs: [
          'Keep a copy of your current plan and any earlier ones, and your service agreements. Keep invoices and receipts for supports and purchases, and any statements from your plan manager. Keep reports from therapists and doctors, and a log of important phone calls and emails with dates and names.',
          'Notes about how supports are going, such as what worked, what did not and what changed, are surprisingly useful at review time.',
        ],
      },
      {
        heading: 'A system that is easy to keep up',
        paragraphs: [
          'One folder, on paper or on a device, is enough. Inside, use a few simple sections: plan, agreements, invoices, reports and notes. Name files with the date first so they sort in order. Take a photo of paper documents as soon as you receive them.',
          'Set a monthly reminder to check that invoices match what was delivered and to compare your budget statement with what you expected. Small errors are easier to fix when they are fresh.',
        ],
      },
      {
        heading: 'Privacy and backups',
        paragraphs: [
          'These records contain private information, so keep them somewhere secure and share only what is needed. Keep a backup in a second place, and let a trusted person know where to find things if you are unwell or away. This is general information, not advice about your obligations.',
        ],
      },
      {
        heading: 'Using your records at a review',
        paragraphs: [
          'Before a plan review, sort your notes by goal. For each goal, write down what you did, what helped and what did not, with a date and a document to back it up. A one-page summary with reports attached is far more persuasive than a pile of invoices.',
          'Note also any supports you could not get, and why. That shows the difference between not needing something and not being able to find it.',
        ],
      },
    ],
  },
  {
    slug: 'nominees-and-supporters-helping-someone-with-their-ndis-plan',
    title: 'Nominees and supporters: helping someone with their NDIS plan',
    summary: 'Family and friends often help with the NDIS. Here is the difference between informal support and a formal nominee, and how to keep the person at the centre.',
    category: 'Your rights',
    publishedAt: '2026-10-12T12:10:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/older-people-3.jpg',
    coverAlt: 'Two older women standing together in a park, one using a wheelchair',
    source: { label: 'NDIS: Creating your plan', url: ndis('/participants/creating-plan'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Your rights and responsibilities', url: ndis('/participants/working-providers/your-rights-and-responsibilities') },
      { label: 'NDIS: Preparing for your plan meeting', url: ndis('/participants/creating-plan/preparing-your-plan-meeting') },
    ],
    sections: [
      {
        heading: 'Support without a formal role',
        paragraphs: [
          'Many people have a family member, friend or carer who comes to meetings, helps read letters and talks through decisions. That is informal support, and it does not need any special arrangement. The important thing is that the person still makes their own choices, with help to understand the options.',
        ],
      },
      {
        heading: 'What a nominee is',
        paragraphs: [
          'A nominee is a person formally appointed with the NDIA to act on a participant’s behalf. There are different kinds. Some nominees can make decisions about the plan, and others can only receive correspondence. The NDIA has a process for appointing and ending a nominee arrangement, and it can depend on the person’s circumstances.',
          'Appointing a nominee is a serious step. It is not needed just because someone wants help, and many people only need informal support.',
        ],
      },
      {
        heading: 'Keeping the person at the centre',
        paragraphs: [
          'Whether you are a supporter or a nominee, start with what the person wants. Ask, listen and explain choices in a way they can understand. Give them time. Check in about whether the plan reflects their goals, not just what is easiest for others.',
          'Agree what information can be shared with whom, and write it down. If the person can make some decisions but not others, work with them on which is which.',
        ],
      },
      {
        heading: 'Practical tips for supporters',
        paragraphs: [
          'Go to meetings prepared, with a short list of what matters most. Keep records of what is agreed. Take care of your own wellbeing too, because supporters who are exhausted make poorer decisions. If you are unsure about your role, ask the NDIA or an independent advocacy service to explain it. This is general information, not legal advice.',
        ],
      },
      {
        heading: 'Reviewing the arrangement over time',
        paragraphs: [
          'A person’s ability to make decisions can change, and so can their circumstances. Review any nominee arrangement from time to time and ask whether it is still needed, whether it should be narrower, or whether the person can take on more themselves.',
          'If an arrangement is no longer needed, contact the NDIA about how to end it. The person’s own wishes should guide this wherever possible.',
        ],
      },
    ],
  },
  {
    slug: 'a-back-up-plan-for-your-ndis-supports-emergencies-and-disruptions',
    title: 'A back-up plan for your supports: emergencies and disruptions',
    summary: 'Illness, a provider closing, bad weather or a power outage can all interrupt support. A short back-up plan makes those days easier.',
    category: 'Everyday supports',
    publishedAt: '2026-10-12T12:00:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/condition-mobility.jpg',
    coverAlt: 'A man sitting on a mobility walker outside a building',
    source: { label: 'NDIS: Working with providers', url: ndis('/participants/working-providers'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Using your funding', url: ndis('/participants/using-your-funding') },
    ],
    sections: [
      {
        heading: 'What can go wrong',
        paragraphs: [
          'A regular worker is unwell. A provider has a staffing gap or closes. A storm, fire, flood or heatwave makes travel unsafe. A power cut affects equipment that needs electricity. You or a family carer end up in hospital. These are all ordinary events, and a plan made in advance turns a crisis into an inconvenience.',
        ],
      },
      {
        heading: 'Write down the essentials',
        paragraphs: [
          'Put one page together with your key contacts, your providers and how to reach them, your health information and medication, the equipment you rely on, and the routines that matter most. Include who knows how you like things done, and how a new person could be shown quickly.',
          'Keep a copy where it can be found, share it with someone you trust and update it when things change.',
        ],
      },
      {
        heading: 'Ask providers about continuity',
        paragraphs: [
          'Ask each provider what they do when a worker is away or when conditions make visits unsafe, how you will be told and what they will and will not cover. Ask who to call out of hours and whether they have a plan for emergencies or extreme weather.',
          'If a support is critical, such as personal care or medication prompts, ask what the back-up is before you need it.',
        ],
      },
      {
        heading: 'People and options around you',
        paragraphs: [
          'Think about who could step in for a short time: a relative, neighbour, friend or another provider. Ask whether a second provider could be used on short notice. Check local services such as community transport, meal delivery or emergency information lines for your area.',
          'In an emergency, call emergency services first. Review your plan each year, and after anything that changes your supports. This is general information, not emergency or medical advice.',
        ],
      },
      {
        heading: 'A short checklist to finish',
        paragraphs: [
          'Have a one-page summary of your supports and health information. Know who your first and second contacts are. Know what each provider will do if they cannot attend. Keep spare medication, charging cables and essential items together. Check equipment that relies on power and know what you would do in an outage. Tell your support network where the plan is kept.',
        ],
      },
    ],
  },
  {
    slug: 'your-first-month-with-a-new-ndis-plan',
    title: 'Your first month with a new NDIS plan: what to do and in what order',
    summary: 'A new plan can feel like a pile of unknowns. Here is a sensible order for reading it, setting things up and starting supports.',
    category: 'Plans and funding',
    publishedAt: '2026-10-12T11:55:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/guides.jpg',
    coverAlt: 'A woman reading a book with a mug beside a plant',
    source: { label: 'NDIS: Creating your first plan', url: ndis('/participants/creating-plan/creating-your-first-plan'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Understanding your plan meeting', url: ndis('/participants/creating-plan/understanding-plan-meeting') },
      { label: 'NDIS: Using your funding', url: ndis('/participants/using-your-funding') },
    ],
    sections: [
      {
        heading: 'Week one: read it properly',
        paragraphs: [
          'Read your plan from start to finish, preferably with someone you trust. Note your goals, how long the plan runs, which budgets you have and how each is managed. Highlight anything that is unclear or that does not match what you discussed, and make a list of questions.',
          'If something looks wrong, ask early. There are time limits for asking for a review of some decisions, so do not leave it.',
        ],
      },
      {
        heading: 'Week two: set up the money side',
        paragraphs: [
          'Decide how you will manage each part of the plan if you have a choice, and set up a plan manager if you are using one. Make sure you know how to see your budget, whether through the portal, statements or your plan manager.',
          'If your plan includes support coordination, make contact and agree what you want help with first.',
        ],
      },
      {
        heading: 'Weeks three and four: start the supports that matter most',
        paragraphs: [
          'Choose two or three supports that will make the biggest difference and start with those, rather than everything at once. Contact a few providers for each, ask the same questions and agree a start date. Put each arrangement in a service agreement before supports begin.',
          'Spreading your start dates lets you see how each support is working and adjust.',
        ],
      },
      {
        heading: 'Then: keep an eye on it',
        paragraphs: [
          'Check your budget every month, compare it with what you expected to have used and note anything that looks off. Keep records as you go. Put the review date in your diary with a reminder a few months ahead so you have time to gather evidence. This is general information, not advice about your plan.',
        ],
      },
      {
        heading: 'If something is not working',
        paragraphs: [
          'Do not wait for the review date if a support is not suiting you. Talk to the provider first, then your support coordinator, and ask the NDIA how to change something if you need to. Keep notes of what you tried and what you were told so you can explain the situation clearly.',
          'It is normal for the first few weeks to include adjustments. The aim is to end the month with supports that fit, not to get everything perfect immediately.',
        ],
      },
    ],
  },
  {
    slug: 'community-participation-and-social-supports-how-to-choose',
    title: 'Community and social supports: how to choose what suits you',
    summary: 'Social and community participation supports are about doing things you enjoy, with the right amount of help. Here is how to match the support to the person.',
    category: 'Everyday supports',
    publishedAt: '2026-10-12T11:45:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/multicultural.jpg',
    coverAlt: 'Three friends laughing together outdoors',
    source: { label: 'NDIS: What are NDIS supports?', url: ndis('/participants/using-your-funding/understanding-your-ndis-funding/what-are-ndis-supports'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Working with providers', url: ndis('/participants/working-providers') },
    ],
    sections: [
      {
        heading: 'Start with what you enjoy',
        paragraphs: [
          'Community and social supports work best when they start with your interests, not with what a provider happens to run. Write down things you have enjoyed, things you would like to try, and places you would like to go. Think about people as well as activities.',
          'The aim is usually to take part in community life, build skills and confidence, and meet people, with a level of help that suits you.',
        ],
      },
      {
        heading: 'One-to-one or group',
        paragraphs: [
          'A support worker who goes with you to an activity gives you personal attention and flexibility. A group program can be more social and may be more affordable, but it follows a set programme. Some people use both. Think about how much help you need, how you feel in groups and how important choice of activity is.',
        ],
      },
      {
        heading: 'Questions to ask',
        paragraphs: [
          'Ask what a typical session involves, who else attends, how many staff there are and how activities are chosen. Ask about transport, costs beyond the support itself such as entry fees, and what happens if you want to stop or change.',
          'Ask whether you can try it once before committing, and how the provider will check that it is working for you.',
        ],
      },
      {
        heading: 'Mainstream and local options',
        paragraphs: [
          'Not everything has to be an NDIS service. Libraries, clubs, community centres, councils, sporting groups and volunteering organisations may all offer ways to take part, sometimes with a support worker alongside. Mixing funded supports with local community options can make life more varied and sustainable.',
          'Tell your coordinator or plan manager what you plan to do so you know how it will be funded. This is general information, not advice about your plan.',
        ],
      },
      {
        heading: 'Start small and review',
        paragraphs: [
          'Try an activity for a few weeks before deciding whether to continue. Set one simple goal, such as “go once a week” or “introduce myself to someone new”, and check in on it. Ask the worker or provider how they think it is going, and tell them what you think.',
          'It is fine to change your mind. Interests shift, and the best arrangements are the ones that keep changing as you do.',
        ],
      },
    ],
  },
  {
    slug: 'starting-as-an-independent-support-worker-what-to-set-up-first',
    title: 'Starting as an independent support worker: what to set up first',
    summary: 'Working for yourself brings freedom and responsibility. This checklist covers the checks, paperwork and boundaries to get right before you take on your first client.',
    category: 'For workers',
    publishedAt: '2026-10-12T11:35:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/employment.jpg',
    coverAlt: 'People working at laptops in a bright shared workspace',
    source: { label: 'NDIS: Support workers and recovery coaches', url: ndis('/participants/working-providers/support-workers-and-recovery-coaches'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Working with providers', url: ndis('/participants/working-providers') },
      { label: 'NDIS Quality and Safeguards Commission', url: 'https://www.ndiscommission.gov.au/' },
    ],
    sections: [
      {
        heading: 'Know what you are agreeing to',
        paragraphs: [
          'The NDIS Code of Conduct applies to workers whether or not they are registered, and it sets expectations about respect, privacy, safety, honesty and preventing harm. Read it before your first shift and make sure you can meet it, including knowing when to ask for help.',
          'Decide which supports you are qualified and comfortable delivering. Some tasks need specific training or qualifications, so be honest about your limits.',
        ],
      },
      {
        heading: 'Checks and training',
        paragraphs: [
          'Find out what screening applies to your role and your state or territory, including NDIS worker screening, and complete it before you start. Keep your first aid and any other training current, and consider training in areas you will meet often, such as manual handling, infection control or supporting people with particular conditions.',
        ],
      },
      {
        heading: 'Business basics',
        paragraphs: [
          'Working independently usually means you are running a small business. Check what you need for tax, an ABN, record keeping and insurance, and get advice from the relevant official bodies or a professional. Do not assume a client or a provider will cover these for you.',
          'Agree rates and invoicing in writing before the first session, and check how clients will pay you, whether directly or through a plan manager.',
        ],
      },
      {
        heading: 'Agreements, boundaries and records',
        paragraphs: [
          'Put the arrangement in a short written agreement covering the supports, times, price, cancellations and how either side can end it. Keep clear professional boundaries, and keep notes of what you did and anything that happened.',
          'Make your profile accurate and specific about what you offer and where you work. This is general information, not legal, tax or financial advice.',
        ],
      },
      {
        heading: 'Looking after yourself',
        paragraphs: [
          'Support work can be rewarding and demanding. Plan how you will handle difficult days, who you can talk to, and how you will say no when a request is outside your skills or comfort. Working alone is a safety consideration too: tell someone where you are working and when you expect to finish.',
          'Consider connecting with other workers for peer support, and keep learning. Good workers are those who know when to ask for help.',
        ],
      },
    ],
  },
  {
    slug: 'ndis-or-my-aged-care-which-system-supports-you',
    title: 'NDIS or My Aged Care: which system supports you?',
    summary: 'Two government systems support people with disability and older people. Here is how to think about which one applies and what to do if you are not sure.',
    category: 'Plans and funding',
    publishedAt: '2026-10-12T11:25:00+11:00',
    checkedAt: CHECKED,
    coverImage: '/images/banners/older-people.jpg',
    coverAlt: 'An older woman and a younger woman laughing together in a garden',
    source: { label: 'NDIS: Where to begin', url: ndis('/understanding-ndis/where-begin'), date: 'Current guidance page' },
    additionalSources: [
      { label: 'NDIS: Life transitions', url: ndis('/participants/life-transitions') },
      { label: 'My Aged Care', url: 'https://www.myagedcare.gov.au/' },
    ],
    sections: [
      {
        heading: 'Two systems, different purposes',
        paragraphs: [
          'The NDIS provides funding for supports related to a permanent and significant disability. My Aged Care is the gateway to government-funded supports for older people, including help at home, residential care and short-term support. They are separate systems with separate rules, eligibility and providers.',
        ],
      },
      {
        heading: 'Age matters, but it is not everything',
        paragraphs: [
          'The NDIS generally applies to people who are under 65 when they first apply, while My Aged Care generally applies to older people who need support. People who are already NDIS participants when they turn 65 are generally able to choose whether to stay or to move to aged care. These rules are specific, so confirm how they apply to your situation.',
          'If you are close to the age threshold, or if disability and ageing both play a part, it is worth asking before making a decision, because the supports available are not identical.',
        ],
      },
      {
        heading: 'You cannot have the same support funded twice',
        paragraphs: [
          'The two systems are not designed to pay for the same support. If you receive a service through one, you usually cannot also have it funded through the other. A support coordinator, or the NDIA or My Aged Care, can explain which system is responsible for a particular support.',
        ],
      },
      {
        heading: 'What to do if you are not sure',
        paragraphs: [
          'Contact both services to ask what is available to you, and keep notes of what you are told. Ask a family member, advocate or support coordinator to help you compare. Look at the providers each system uses, because a provider listed on one register may or may not deliver the other’s supports.',
          'This is general information, not advice about your eligibility. Check the linked official pages and speak to the relevant agency about your own circumstances.',
        ],
      },
      {
        heading: 'Questions to ask when comparing',
        paragraphs: [
          'Ask each system what supports you could receive, how they are arranged, who the providers are, what it might cost you and how long the process takes. Ask what would happen to your current supports if you moved from one to the other.',
          'Take notes, ask for answers in writing where you can, and consider having an advocate or a family member with you. The decision is a big one, and you are entitled to take your time.',
        ],
      },
    ],
  },
];
