import { EDITORIAL_BLOG_POSTS } from './blog.js';

/**
 * Which blog articles belong under which page. Shared by the website and the crawler-readable (SEO shell) pages so
 * both always show the same list.
 *
 * Each article is tagged with the services it is about and a few themes. A page asks for articles by service and/or
 * theme and gets the best matches, newest first, topped up with the general "how to choose" guides so a page never
 * shows an empty "related reading" box.
 *
 * Themes: choosing, registration, agreement, workers, funding, plan, housing, assistive, local, regional, moving, news.
 */
const META = {
  'how-to-choose-an-ndis-provider-questions-to-ask': { themes: ['choosing', 'agreement'], boost: 2 },
  'registered-or-unregistered-ndis-provider-what-it-means': { themes: ['choosing', 'registration'], boost: 1 },
  'ndis-service-agreement-what-to-check-before-you-sign': { themes: ['choosing', 'agreement'] },
  'questions-to-ask-an-independent-ndis-support-worker': {
    services: ['Personal care', 'Domestic assistance', 'Transport'],
    themes: ['workers', 'choosing'],
  },
  'self-managed-plan-managed-or-ndia-managed-how-to-decide': { services: ['Plan management'], themes: ['funding'] },
  'what-does-an-ndis-plan-manager-do-and-how-to-choose-one': { services: ['Plan management'], themes: ['funding'] },
  'support-coordination-explained-do-you-need-it': { services: ['Support coordination'], themes: ['funding', 'plan'] },
  'how-to-prepare-for-an-ndis-plan-review': { themes: ['plan', 'funding'] },
  'ndis-core-capacity-building-and-capital-supports-explained': { themes: ['funding', 'plan'] },
  'sda-and-sil-explained-the-difference': { services: ['Housing (SDA & SIL)'], themes: ['housing'] },
  'assistive-technology-and-the-ndis-where-to-start': { services: ['Therapy services'], themes: ['assistive'] },
  'finding-ndis-supports-in-regional-and-remote-areas': { themes: ['local', 'regional'] },
  'moving-to-a-new-town-or-state-with-the-ndis': { themes: ['local', 'moving', 'housing'] },
  'personal-care-and-daily-living-supports-what-to-ask': { services: ['Personal care', 'Domestic assistance'], themes: ['workers', 'choosing'] },
  'transport-and-the-ndis-getting-to-appointments-and-activities': { services: ['Transport'], themes: ['choosing'] },
  'choosing-a-therapist-occupational-therapy-physiotherapy-speech-pathology': { services: ['Therapy services'], themes: ['assistive', 'choosing'] },
  'nursing-and-health-supports-at-home-what-the-ndis-covers': { services: ['Nursing'], themes: ['plan', 'choosing'] },
  'how-to-change-ndis-provider-without-losing-support': { themes: ['choosing', 'agreement', 'rights'] },
  'making-a-complaint-about-an-ndis-provider-or-worker': { themes: ['rights', 'registration', 'choosing'] },
  'your-rights-as-an-ndis-participant-choice-control-and-safety': { themes: ['rights', 'choosing'] },
  'ndis-jargon-explained-terms-you-will-hear': { themes: ['funding', 'plan', 'choosing'] },
  'keeping-records-of-your-ndis-supports-a-simple-system': { themes: ['plan', 'funding', 'rights'] },
  'nominees-and-supporters-helping-someone-with-their-ndis-plan': { themes: ['rights', 'plan'] },
  'a-back-up-plan-for-your-ndis-supports-emergencies-and-disruptions': { themes: ['regional', 'choosing'] },
  'your-first-month-with-a-new-ndis-plan': { themes: ['plan', 'funding'] },
  'community-participation-and-social-supports-how-to-choose': { themes: ['choosing'] },
  'starting-as-an-independent-support-worker-what-to-set-up-first': { themes: ['workers'] },
  'ndis-or-my-aged-care-which-system-supports-you': { themes: ['funding', 'plan', 'choosing', 'aged-care'], both: true },
  'support-at-home-explained-how-in-home-aged-care-works': { services: ['Personal care', 'Domestic assistance', 'Nursing', 'Transport'], themes: ['aged-care', 'funding', 'choosing'] },
  'getting-an-aged-care-assessment-what-to-expect': { themes: ['aged-care', 'plan'] },
  'aged-care-costs-what-you-may-be-asked-to-contribute': { themes: ['aged-care', 'funding'] },
  'choosing-an-aged-care-provider-or-home-what-to-compare': { themes: ['aged-care', 'choosing', 'registration'] },
  'aged-care-rights-and-making-a-complaint': { themes: ['aged-care', 'rights'] },
  'respite-care-a-break-for-you-and-your-carer': { themes: ['aged-care', 'local'] },
  'registered-supporters-in-aged-care-helping-someone-decide': { themes: ['aged-care', 'rights'] },
  'when-your-aged-care-needs-change-reviews-and-changing-providers': { themes: ['aged-care', 'plan', 'choosing'] },
  'moving-into-an-aged-care-home-what-to-expect': { themes: ['aged-care', 'housing', 'choosing'] },
  'ndis-budget-changes-october-2026-what-to-check': { themes: ['funding', 'plan', 'news'] },
  'ndis-claims-after-90-days-from-15-october-2026': { services: ['Plan management'], themes: ['funding', 'news'] },
  'ndis-portal-maintenance-10-11-october-2026': { themes: ['news'] },
};

const FALLBACK = ['how-to-choose-an-ndis-provider-questions-to-ask', 'registered-or-unregistered-ndis-provider-what-it-means', 'ndis-service-agreement-what-to-check-before-you-sign'];

const time = (value) => new Date(value).getTime();

export function relatedArticles({ service, themes = [], exclude = [], limit = 3, now = Date.now() } = {}) {
  const live = EDITORIAL_BLOG_POSTS.filter((p) => !p.expiresAt || time(p.expiresAt) > now);
  const scored = live
    .filter((p) => !exclude.includes(p.slug))
    .map((p) => {
      const meta = META[p.slug] ?? {};
      let score = 0;
      // Aged-care-only guides are kept for aged care pages; the ones marked `both` suit either.
      if (meta.themes?.includes('aged-care') && !meta.both && !themes.includes('aged-care')) return { p, score: -1 };
      if (service && meta.services?.includes(service)) score += 10;
      // The first theme a page asks for is its main one and counts for more.
      themes.forEach((t, i) => { if (meta.themes?.includes(t)) score += i === 0 ? 5 : 3; });
      // The two core "how to choose" guides edge ahead of other equally relevant articles.
      if (score > 0) score += meta.boost ?? 0;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score || time(b.p.publishedAt) - time(a.p.publishedAt));

  const picked = scored.filter((s) => s.score > 0).slice(0, limit).map((s) => s.p);
  if (picked.length < limit) {
    for (const slug of FALLBACK) {
      const post = live.find((p) => p.slug === slug);
      if (post && !picked.includes(post) && !exclude.includes(slug)) picked.push(post);
      if (picked.length >= limit) break;
    }
  }
  return picked.slice(0, limit);
}
