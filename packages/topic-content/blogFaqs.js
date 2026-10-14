/**
 * Questions and answers for the articles people search about most. Each answer restates what its article already says
 * (nothing here is a new claim about money, tax, eligibility or rules), in the shorter form a search result or an answer
 * box needs. The page shows them under "Frequently asked questions" and marks them up as FAQ structured data; the
 * crawler HTML carries the same words.
 *
 * Keyed by article slug. When an article's wording or its source changes, change its questions here in the same edit.
 */
export const ARTICLE_FAQS = {
  'abn-tax-and-insurance-for-independent-support-workers-what-to-sort-out': [
    {
      question: 'Do I need an ABN to work as an independent support worker?',
      answer: 'If you invoice the people you work for instead of being paid wages, you decide how the work is done and you can take on more than one client, you are likely to need an Australian Business Number. Not everyone is entitled to one, though: the Australian Business Register warns that applying when you are not entitled can lead to prosecution or criminal charges, and that your entitlement can be reviewed at any time.',
    },
    {
      question: 'How do I get an ABN?',
      answer: 'You apply through the Australian Business Register. If the application is successful you receive the number straight away, and you can then apply for other registrations such as GST. If the register needs to check something you receive a reference number instead, and it aims to review within 20 business days.',
    },
    {
      question: 'Do I have to register for GST?',
      answer: 'It depends on your turnover and your circumstances. The rules, thresholds and dates are set by the Australian Taxation Office, so confirm them there rather than relying on a figure from an article.',
    },
    {
      question: 'What insurance does an independent support worker need?',
      answer: 'The article has not found a single national rule it can cite for every independent arrangement. Organisations and participants commonly ask about public liability and professional indemnity cover, so ask whoever engages you what they expect, and ask an insurance broker or insurer what is appropriate for your work.',
    },
    {
      question: 'Who looks after my tax and super when I work for myself?',
      answer: 'You do. Without an employer taking tax out of every payment, setting money aside becomes your job, and as a sole trader you are responsible for your own superannuation. A registered tax agent can set you up correctly the first time. This is general information, not tax advice.',
    },
  ],

  'aged-care-costs-what-you-may-be-asked-to-contribute': [
    {
      question: 'What decides how much I pay for aged care?',
      answer: 'The type of help you need, the provider you choose, your financial situation and the services you actually receive. The government pays part or all of the cost for providers listed on the official Find a provider tool, but different providers set different prices.',
    },
    {
      question: 'Do I pay anything for the Commonwealth Home Support Programme?',
      answer: 'You agree fees with your provider before services start, and you do not need an income and assets assessment.',
    },
    {
      question: 'How are Support at Home costs worked out?',
      answer: 'What you contribute depends on the provider’s prices, the services you receive and an assessment of your income and assets. The government pays the rest, and there is no contribution for clinical supports.',
    },
    {
      question: 'What should I ask a provider about costs?',
      answer: 'Ask for a written list of every charge, what each covers and how often prices can change. Ask how you will be told about a price change and whether you can say no, and what you would pay for the specific mix of services you expect to use. Compare more than one provider using the same list.',
    },
    {
      question: 'What if I am worried about affording care?',
      answer: 'You can ask to be considered for financial hardship assistance, and the government may then pay some or all of your costs. Independent financial advice is recommended before deciding how to pay for care, and Services Australia offers free information and education about aged care finances.',
    },
  ],

  'how-to-choose-an-ndis-provider-questions-to-ask': [
    {
      question: 'What should I ask before choosing an NDIS provider?',
      answer: 'The article suggests twelve questions. They cover the support itself (who delivers it, how many workers you would see, available days and times, what happens if your worker is sick), cost and paperwork, people and safety, and what happens if you want to change or stop the service or raise a concern.',
    },
    {
      question: 'How do I know a provider’s prices are within the limits?',
      answer: 'Prices for many supports are capped by the NDIA’s pricing arrangements, so a provider’s rates should sit within those limits. If a figure is unclear, ask which line of the pricing arrangements it relates to and check it with your plan manager or support coordinator.',
    },
    {
      question: 'How can I check whether a provider is registered?',
      answer: 'Registered providers are regulated by the NDIS Quality and Safeguards Commission, and you can check a provider’s registration on the Commission’s website rather than relying on what a brochure says.',
    },
    {
      question: 'How many providers should I compare?',
      answer: 'Compare at least two, ask each the same questions and take notes. You do not have to decide on the spot, and you can take someone you trust to the conversation.',
    },
  ],

  'ndis-service-agreement-what-to-check-before-you-sign': [
    {
      question: 'Do I have to sign an NDIS service agreement?',
      answer: 'A service agreement is generally recommended rather than something you are forced to sign. You should not feel pressured to sign at the first meeting, you can take it home, and you can ask a family member, advocate, support coordinator or plan manager to read it with you.',
    },
    {
      question: 'What should a service agreement include?',
      answer: 'It should record which supports will be delivered, when, at what price and under what conditions: how often, how long each session is and where, the rates, how and when you are invoiced and who pays, any separate charges such as travel, after-hours work or cancellation fees, and how to cancel, change or end the agreement.',
    },
    {
      question: 'Can I ask for changes before I sign?',
      answer: 'Yes. If you disagree with something in the agreement, ask for it to be changed before you sign. If the provider will not discuss reasonable changes, that is useful information about how the service will work with you later.',
    },
    {
      question: 'What should I check about cancellations?',
      answer: 'Check how much notice either side must give to cancel a session and when you may be charged for a short-notice cancellation. Look also for how concerns are raised and who handles them.',
    },
  ],

  'registered-or-unregistered-ndis-provider-what-it-means': [
    {
      question: 'What does it mean for an NDIS provider to be registered?',
      answer: 'A registered provider has applied to the NDIS Quality and Safeguards Commission and been approved to deliver certain types of support. In return it accepts extra obligations: meeting the NDIS Practice Standards, being checked through an audit process, and reporting some kinds of incidents. Registration is about oversight; it does not tell you whether a provider is the right match for you or has capacity.',
    },
    {
      question: 'Is an unregistered provider safe to use?',
      answer: 'Being unregistered does not make a provider unsafe or improper by itself, and many small businesses and independent workers operate this way. The NDIS Code of Conduct applies whether or not they are registered. What changes is that you carry more of the job of asking for evidence yourself.',
    },
    {
      question: 'Can I use an unregistered provider?',
      answer: 'It depends on how your plan is managed and on the support involved. If your funding is managed by the NDIA, providers generally need to be registered. Plan-managed and self-managed plans have had more flexibility, but the rules have been changing, so confirm the current position for your own plan.',
    },
    {
      question: 'How do I check a provider’s registration?',
      answer: 'Use the NDIS Commission’s provider register. Compare the name and the registered support types with what the provider tells you, and ask for their ABN and, if relevant, their insurance details.',
    },
  ],

  'support-coordination-explained-do-you-need-it': [
    {
      question: 'What is support coordination?',
      answer: 'It is funding in your plan for a person to help you put your plan into action. A support coordinator can explain what your plan allows, help you find and arrange providers, assist with service agreements and help you work out what to do when things are not going to plan.',
    },
    {
      question: 'Do I need support coordination?',
      answer: 'It is most useful when you are new to the NDIS, when your needs are complex, when you have several providers to coordinate, or when you are moving between services or living arrangements. If you already know what you need and how to arrange it, you may not need it. Plans are individual, and the NDIA decides what is funded.',
    },
    {
      question: 'What does a good support coordinator do?',
      answer: 'A good coordinator listens to your goals, gives you options rather than a single provider, explains how decisions affect your budget and keeps you in control. They should be clear about how many hours they have used and what they have achieved with them.',
    },
    {
      question: 'How is a support coordinator different from a plan manager?',
      answer: 'A plan manager looks after payments and budget tracking. A local area coordinator, in areas where the NDIA works through them, helps people understand the NDIS and prepare for planning. A support coordinator is funded in your plan to help you use it once it is approved.',
    },
  ],

  'ndis-worker-screening-check-who-needs-one-and-how-it-works': [
    {
      question: 'Do I need an NDIS Worker Screening Check?',
      answer: 'It depends on who engages you. Workers need one if they work for a registered provider in a risk-assessed role or key personnel role, or for a provider that has decided every worker needs one. Unregistered providers are not legally required to ask for a check, although the Commission recommends they do, and self-managed and plan-managed participants can decide whether the workers who support them must have one. Ask what the person or organisation engaging you requires before you apply.',
    },
    {
      question: 'How do I apply for an NDIS Worker Screening Check?',
      answer: 'Apply or renew with the worker screening unit in your state or territory. The application asks for your employer’s details, which you either enter as the employer’s NDIS Commission employer ID or search for in the online form. Sole traders and self-employed workers follow separate instructions from the Commission for this step.',
    },
    {
      question: 'How long does an NDIS Worker Screening Check last?',
      answer: 'A check is valid for up to five years unless it is cancelled or revoked, and you can renew up to 90 days before it expires. It is nationally recognised, so you do not need to reapply if you move to another state or territory.',
    },
    {
      question: 'Is it the same as a Working with Children Check?',
      answer: 'No. The NDIS check is not the same thing as a Working with Children Check, and your state or territory unit can tell you whether your role needs both.',
    },
  ],

  'support-at-home-explained-how-in-home-aged-care-works': [
    {
      question: 'What is Support at Home?',
      answer: 'It is the Australian Government program that helps older people keep living at home with services and equipment. It began in November 2025 and replaced the Home Care Packages Program and the Short-term Restorative Care Programme.',
    },
    {
      question: 'What services can Support at Home include?',
      answer: 'Services fall into three broad groups: clinical supports such as nursing care, occupational therapy and podiatry; supports for independence such as transport, respite and help to attend appointments; and everyday living help such as cleaning, gardening, shopping and meals. There are also short-term pathways, including restorative care, assistive technology and home modifications, and an end-of-life pathway.',
    },
    {
      question: 'How do I get Support at Home?',
      answer: 'You first have an aged care assessment. If you are approved, you receive a letter that explains the services and funding you are approved for. When funding is available you choose a provider, agree a service agreement and decide with them the mix of services that fits your needs and budget.',
    },
    {
      question: 'Do I have to pay towards Support at Home services?',
      answer: 'You usually contribute towards the cost of services, based on the type of service and your income and assets, and you do not contribute to clinical supports. From 1 October 2026, personal care services that are approved in your support plan, and funded within your budget, no longer need a contribution; other services such as domestic help and gardening may still involve one. Check the linked official pages for your own situation.',
    },
  ],

  'self-managed-plan-managed-or-ndia-managed-how-to-decide': [
    {
      question: 'What is the difference between NDIA-managed, plan-managed and self-managed funding?',
      answer: 'NDIS funding can be managed by the NDIA, by a plan manager, or by you. It affects who pays providers, how you track your budget and which providers you can use. Which one applies is recorded in your plan, and it can differ between parts of your plan.',
    },
    {
      question: 'Which option has the least paperwork?',
      answer: 'NDIA-managed funding: providers claim directly from the NDIA and you do not handle the money. The trade-off is that you are generally limited to registered providers.',
    },
    {
      question: 'Does using a plan manager reduce my budget?',
      answer: 'Plan management is usually funded in your plan as a separate support, so it does not normally reduce what is left for your actual supports. Check how it appears in your own plan.',
    },
    {
      question: 'How do I decide how to manage my funding?',
      answer: 'Ask yourself how much time and confidence you have for paperwork, how important choice of provider is (including unregistered ones), and how much risk of an error you are comfortable carrying. Most people who want flexibility without the admin choose a plan manager. This is general information, not advice about your own plan.',
    },
  ],

  'a-back-up-plan-for-your-ndis-supports-emergencies-and-disruptions': [
    {
      question: 'What should an NDIS back-up plan include?',
      answer: 'One page with your key contacts, your providers and how to reach them, your health information and medication, the equipment you rely on, and the routines that matter most. Include who knows how you like things done, and how a new person could be shown quickly.',
    },
    {
      question: 'What should I ask my providers about emergencies?',
      answer: 'Ask what they do when a worker is away or when conditions make visits unsafe, how you will be told and what they will and will not cover. Ask who to call out of hours and whether they have a plan for emergencies or extreme weather. If a support is critical, ask what the back-up is before you need it.',
    },
    {
      question: 'Who can step in if my regular support is not available?',
      answer: 'Think about a relative, neighbour, friend or another provider who could help for a short time, and ask whether a second provider could be used on short notice. Check local services such as community transport, meal delivery or emergency information lines for your area.',
    },
    {
      question: 'How often should I review my back-up plan?',
      answer: 'Each year, and after anything that changes your supports. Keep a copy where it can be found and share it with someone you trust. In an emergency, call emergency services first.',
    },
  ],

  'independent-contractor-or-employee-getting-your-support-work-arrangement-right': [
    {
      question: 'What is the difference between an independent contractor and an employee?',
      answer: 'The Fair Work Ombudsman explains that independent contractors provide services to another person or business instead of being employed by them. They usually negotiate their own fees and working arrangements, can work for more than one client at a time, and do not have the same rights and obligations as employees.',
    },
    {
      question: 'How do I know whether I am a contractor or an employee?',
      answer: 'The Ombudsman lists factors that are looked at together: how much control the business has over how the work is performed, who holds the financial responsibility and risk, who supplies the tools and equipment, whether the worker can delegate or subcontract, how hours are set, and whether the work is expected to continue indefinitely. The Ombudsman cannot decide for you, and recommends legal advice if you need a firm answer.',
    },
    {
      question: 'What should I ask before I agree to work as a contractor?',
      answer: 'Who decides how and when the work is done, and whether you can say no to a shift without consequences. Whether you can send someone else or take on other clients, who supplies equipment, and who pays if a participant cancels at short notice. Write the answers into the agreement and keep a copy.',
    },
    {
      question: 'What changes if I work under another provider’s registration?',
      answer: 'The NDIS Commission says the registered provider must be the one that claims payment, is responsible for all supports delivered under its registration, and must make sure everyone delivering them complies with the conditions of registration, including the Code of Conduct. These arrangements must be transparent to participants.',
    },
  ],

  'ndis-or-my-aged-care-which-system-supports-you': [
    {
      question: 'What is the difference between the NDIS and My Aged Care?',
      answer: 'The NDIS provides funding for supports related to a permanent and significant disability. My Aged Care is the gateway to government-funded supports for older people, including help at home, residential care and short-term support. They are separate systems with separate rules, eligibility and providers.',
    },
    {
      question: 'Which system applies to me?',
      answer: 'The NDIS generally applies to people who are under 65 when they first apply, while My Aged Care generally applies to older people who need support. People who are already NDIS participants when they turn 65 are generally able to choose whether to stay or to move to aged care. These rules are specific, so confirm how they apply to your situation.',
    },
    {
      question: 'Can the same support be funded by both systems?',
      answer: 'The two systems are not designed to pay for the same support. If you receive a service through one, you usually cannot also have it funded through the other.',
    },
    {
      question: 'What should I do if I am not sure which one applies?',
      answer: 'Contact both services to ask what is available to you, and keep notes of what you are told. Ask a family member, advocate or support coordinator to help you compare, and look at the providers each system uses.',
    },
  ],
};
