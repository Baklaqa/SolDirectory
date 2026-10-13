/**
 * The editorial standards page (/editorial-standards): how SolDirectory writes and checks its guides. One copy, used by
 * the website page and by the build step that writes the page's static HTML. Every statement describes a practice that
 * is built into how the articles in this package are written and published.
 */
export const EDITORIAL_STANDARDS = {
  intro: 'People use our guides to make decisions about support, money and safety, so they should be able to see where each statement comes from and when it was last checked. This page explains how the articles on our blog and the guides on this site are written.',
  sections: [
    {
      heading: 'What SolDirectory is, and is not',
      paragraphs: [
        'SolDirectory is an independent directory and enquiry service. It is not the NDIA, the NDIS Quality and Safeguards Commission, My Aged Care or any other government body, and nothing here is an official decision about your plan or eligibility.',
        'The information is general, so confirm what applies to you with your plan manager, support coordinator, the responsible agency or a professional.',
      ],
    },
    {
      heading: 'How an article is written',
      list: [
        { title: 'Original writing', text: 'We do not copy text, images or logos from other sites. Official content is restated in our own words and the source is cited. The NDIA licenses its website content for non-commercial use, which is one reason we write our own explanations and link to the original.' },
        { title: 'One official source at the centre', text: 'Each article names the official page it is based on and lists any further pages it draws on, so you can read the original yourself.' },
        { title: 'The pages were opened', text: 'Sources are read when an article is written or updated, and the date they were last checked is shown on the article.' },
        { title: 'Things that change are not stated as figures', text: 'Prices, thresholds and deadlines change, so where we can we describe how something works and send you to the official page for the current number. Time-sensitive notices carry an expiry and are marked once they have passed.' },
        { title: 'Plain statements of limits', text: 'Articles say what to confirm for your own plan, and do not tell you what you are entitled to.' },
        { title: 'A summary you can trust', text: 'The “In short” points at the top of an article restate what the article says. They add nothing that is not in the text below.' },
      ],
    },
    {
      heading: 'Where the information comes from',
      sources: [
        { name: 'National Disability Insurance Agency (NDIS)', use: 'Plans, funding, pricing arrangements and participant guidance.', href: 'https://www.ndis.gov.au' },
        { name: 'NDIS Quality and Safeguards Commission', use: 'Provider registration, the Practice Standards, the Code of Conduct, worker screening, incidents and complaints.', href: 'https://www.ndiscommission.gov.au' },
        { name: 'My Aged Care', use: 'Assessments, Support at Home, costs, rights and choosing aged care.', href: 'https://www.myagedcare.gov.au' },
        { name: 'Fair Work Ombudsman', use: 'Independent contractors and employees.', href: 'https://www.fairwork.gov.au' },
        { name: 'Australian Business Register and the ATO', use: 'ABNs and business and tax basics for independent workers.', href: 'https://www.abr.gov.au' },
      ],
    },
    {
      heading: 'Monitoring official announcements',
      paragraphs: [
        'An automated monitor reads the NDIS and My Aged Care news pages, politely and within each site’s published rules, and notes when something new appears. It records only facts such as a title, date and category, and it prepares a private brief for an editor.',
        'It never publishes anything: a person writes each article, and nothing is released without being read.',
      ],
    },
    {
      heading: 'Keeping articles current',
      paragraphs: [
        'Guidance changes. Articles show when their source was last checked, and we review them against the official pages when we are told something has moved. If a notice is only relevant for a short time, it expires instead of staying up as if it were current.',
      ],
    },
    {
      heading: 'Photographs',
      paragraphs: [
        'Article and page photographs come from a licensed photo library and are credited on our photo credits page. They illustrate a topic; they are not pictures of the people or organisations an article mentions.',
      ],
      links: [{ to: '/photo-credits', label: 'Photo credits' }],
    },
    {
      heading: 'Independence from the directory',
      paragraphs: [
        'Guides explain how things work and how to compare options. They are not recommendations of a particular provider, and a listing in the directory is not an endorsement. Register listings are shown as the public registers publish them.',
      ],
    },
    {
      heading: 'Reporting a mistake',
      paragraphs: [
        'If you think something is wrong, unclear or out of date, tell us which page and what you saw, using the contact details in the footer. We will compare it with the official source and correct the page if it needs it.',
      ],
    },
  ],
  see: [
    { to: '/glossary', label: 'NDIS and aged care glossary' },
    { to: '/guides', label: 'Guides' },
    { to: '/blog', label: 'Blog' },
  ],
};
