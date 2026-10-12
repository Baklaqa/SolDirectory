/**
 * Cover art for every blog article: which topic icon it carries, and what the picture shows (its alt text).
 * The pictures themselves are drawn by apps/web/scripts/generate-blog-covers.mjs from this table and the article's slug,
 * so each article has its own cover and no photograph is reused from one article to another.
 *
 * icon keys are defined in the generator (house, heart, shield, document, pin, users, chat, calendar, car, clipboard,
 * compass, key, clock, book, megaphone, scale, bell, wallet, sun, lightbulb, cross, swap, folder, umbrella, flag, fork,
 * cup, briefcase).
 */
export const BLOG_COVERS = {
  // news
  'ndis-budget-changes-october-2026-what-to-check': { icon: 'wallet', alt: 'Illustration of a wallet on a blue background' },
  'ndis-claims-after-90-days-from-15-october-2026': { icon: 'clock', alt: 'Illustration of a clock on a blue background' },
  'ndis-portal-maintenance-10-11-october-2026': { icon: 'bell', alt: 'Illustration of a notification bell on a blue background' },
  // choosing providers
  'how-to-choose-an-ndis-provider-questions-to-ask': { icon: 'compass', alt: 'Illustration of a compass' },
  'registered-or-unregistered-ndis-provider-what-it-means': { icon: 'shield', alt: 'Illustration of a shield with a tick' },
  'ndis-service-agreement-what-to-check-before-you-sign': { icon: 'document', alt: 'Illustration of a document' },
  'questions-to-ask-an-independent-ndis-support-worker': { icon: 'users', alt: 'Illustration of two people' },
  'how-to-change-ndis-provider-without-losing-support': { icon: 'swap', alt: 'Illustration of two arrows swapping direction' },
  // plans and funding
  'self-managed-plan-managed-or-ndia-managed-how-to-decide': { icon: 'scale', alt: 'Illustration of balance scales' },
  'what-does-an-ndis-plan-manager-do-and-how-to-choose-one': { icon: 'clipboard', alt: 'Illustration of a clipboard with a tick' },
  'support-coordination-explained-do-you-need-it': { icon: 'link', alt: 'Illustration of linked chain pieces' },
  'how-to-prepare-for-an-ndis-plan-review': { icon: 'calendar', alt: 'Illustration of a calendar' },
  'ndis-core-capacity-building-and-capital-supports-explained': { icon: 'book', alt: 'Illustration of an open book' },
  'ndis-jargon-explained-terms-you-will-hear': { icon: 'chat', alt: 'Illustration of a speech bubble' },
  'keeping-records-of-your-ndis-supports-a-simple-system': { icon: 'folder', alt: 'Illustration of a folder' },
  'your-first-month-with-a-new-ndis-plan': { icon: 'flag', alt: 'Illustration of a flag on a pole' },
  'ndis-or-my-aged-care-which-system-supports-you': { icon: 'fork', alt: 'Illustration of a path splitting in two' },
  // rights
  'making-a-complaint-about-an-ndis-provider-or-worker': { icon: 'chat', alt: 'Illustration of a speech bubble with lines of text' },
  'your-rights-as-an-ndis-participant-choice-control-and-safety': { icon: 'megaphone', alt: 'Illustration of a megaphone' },
  'nominees-and-supporters-helping-someone-with-their-ndis-plan': { icon: 'users', alt: 'Illustration of two people side by side' },
  // housing and living
  'sda-and-sil-explained-the-difference': { icon: 'house', alt: 'Illustration of a house' },
  // everyday supports
  'assistive-technology-and-the-ndis-where-to-start': { icon: 'lightbulb', alt: 'Illustration of a light bulb' },
  'personal-care-and-daily-living-supports-what-to-ask': { icon: 'heart', alt: 'Illustration of a heart' },
  'transport-and-the-ndis-getting-to-appointments-and-activities': { icon: 'car', alt: 'Illustration of a car' },
  'choosing-a-therapist-occupational-therapy-physiotherapy-speech-pathology': { icon: 'sun', alt: 'Illustration of a sun' },
  'nursing-and-health-supports-at-home-what-the-ndis-covers': { icon: 'cross', alt: 'Illustration of a health cross' },
  'a-back-up-plan-for-your-ndis-supports-emergencies-and-disruptions': { icon: 'umbrella', alt: 'Illustration of an umbrella' },
  'community-participation-and-social-supports-how-to-choose': { icon: 'users', alt: 'Illustration of people together' },
  // local
  'finding-ndis-supports-in-regional-and-remote-areas': { icon: 'pin', alt: 'Illustration of a map pin' },
  'moving-to-a-new-town-or-state-with-the-ndis': { icon: 'key', alt: 'Illustration of a house key' },
  // for workers
  'starting-as-an-independent-support-worker-what-to-set-up-first': { icon: 'briefcase', alt: 'Illustration of a briefcase' },
  // aged care
  'support-at-home-explained-how-in-home-aged-care-works': { icon: 'house', alt: 'Illustration of a house' },
  'getting-an-aged-care-assessment-what-to-expect': { icon: 'clipboard', alt: 'Illustration of a clipboard with a tick' },
  'aged-care-costs-what-you-may-be-asked-to-contribute': { icon: 'wallet', alt: 'Illustration of a wallet' },
  'choosing-an-aged-care-provider-or-home-what-to-compare': { icon: 'compass', alt: 'Illustration of a compass' },
  'aged-care-rights-and-making-a-complaint': { icon: 'megaphone', alt: 'Illustration of a megaphone' },
  'respite-care-a-break-for-you-and-your-carer': { icon: 'cup', alt: 'Illustration of a cup' },
  'registered-supporters-in-aged-care-helping-someone-decide': { icon: 'users', alt: 'Illustration of two people' },
  'when-your-aged-care-needs-change-reviews-and-changing-providers': { icon: 'swap', alt: 'Illustration of two arrows swapping direction' },
  'moving-into-an-aged-care-home-what-to-expect': { icon: 'key', alt: 'Illustration of a house key' },
};
