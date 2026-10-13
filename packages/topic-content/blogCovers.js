/**
 * The cover photograph for every blog article: one real photo per article, never shared with another article.
 * `photo` is a file under apps/web/public/images (the site's licensed photo library, credited in
 * public/images/banners/credits.json). apps/web/scripts/build-blog-covers.mjs crops it to
 * public/images/blog/<slug>.jpg (article header and featured card) and public/images/blog-thumbs/<slug>.jpg (grids and
 * related-article cards). It refuses to run if two articles point at the same photo.
 *
 * To give an article a different photo, change its `photo` here (any image under public/images, or drop a new file in
 * public/images/blog-photos/ and point at that), then run `npm run images:blog-covers -w apps/web`.
 */
export const BLOG_COVERS = {
  // news
  'ndis-budget-changes-october-2026-what-to-check': { photo: 'banners/plan-management-6.jpg', alt: 'Hands working through paperwork with a calculator and a laptop' },
  'ndis-claims-after-90-days-from-15-october-2026': { photo: 'banners/plan-management-4.jpg', alt: 'A person writing in a notebook beside a calculator' },
  'ndis-portal-maintenance-10-11-october-2026': { photo: 'banners/plan-management.jpg', alt: 'A laptop and a card reader on a white desk, seen from above' },
  // choosing providers
  'how-to-choose-an-ndis-provider-questions-to-ask': { photo: 'banners/general-3.jpg', alt: 'Two women in conversation at a desk, one holding a tablet' },
  'registered-or-unregistered-ndis-provider-what-it-means': { photo: 'banners/plan-management-5.jpg', alt: 'Forms and a phone calculator laid out on a table' },
  'ndis-service-agreement-what-to-check-before-you-sign': { photo: 'banners/general-2.jpg', alt: 'Two men talking across a table' },
  'questions-to-ask-an-independent-ndis-support-worker': { photo: 'banners/general.jpg', alt: 'Two women talking at a table by a window' },
  'how-to-change-ndis-provider-without-losing-support': { photo: 'banners/support-coordination-2.jpg', alt: 'A man and a woman in a kitchen talking something through' },
  // plans and funding
  'self-managed-plan-managed-or-ndia-managed-how-to-decide': { photo: 'banners/plan-management-2.jpg', alt: 'A person at a table with a laptop, a calculator and a notebook' },
  'what-does-an-ndis-plan-manager-do-and-how-to-choose-one': { photo: 'banners/plan-management-3.jpg', alt: 'Documents, a calculator and a laptop on a desk' },
  'support-coordination-explained-do-you-need-it': { photo: 'banners/support-coordination.jpg', alt: 'A woman in a kitchen reading a letter with a happy surprise' },
  'how-to-prepare-for-an-ndis-plan-review': { photo: 'banners/funding-veterans.jpg', alt: 'A woman at a table by a window going through her papers' },
  'ndis-core-capacity-building-and-capital-supports-explained': { photo: 'banners/guides-2.jpg', alt: 'An open book and a cup of coffee on a table' },
  'ndis-jargon-explained-terms-you-will-hear': { photo: 'banners/guides-3.jpg', alt: 'A woman smiling as she reads a notebook in a café' },
  'keeping-records-of-your-ndis-supports-a-simple-system': { photo: 'reviews.jpg', alt: 'Hands typing on a laptop' },
  'your-first-month-with-a-new-ndis-plan': { photo: 'banners/condition-intellectual-2.jpg', alt: 'A woman smiling at the camera on a bench outdoors' },
  'ndis-or-my-aged-care-which-system-supports-you': { photo: 'banners/older-people-3.jpg', alt: 'Two older women smiling together in a park' },
  // rights
  'making-a-complaint-about-an-ndis-provider-or-worker': { photo: 'banners/mental-health-2.jpg', alt: 'Two women talking on a sofa' },
  'your-rights-as-an-ndis-participant-choice-control-and-safety': { photo: 'banners/employment-2.jpg', alt: 'A woman at her desk in a busy office, smiling with her arms crossed' },
  'nominees-and-supporters-helping-someone-with-their-ndis-plan': { photo: 'banners/condition-intellectual.jpg', alt: 'Three smiling women with their arms around each other' },
  // housing and living
  'sda-and-sil-explained-the-difference': { photo: 'banners/housing.jpg', alt: 'A man in a wheelchair in a bright kitchen' },
  // everyday supports
  'assistive-technology-and-the-ndis-where-to-start': { photo: 'banners/assistive-technology.jpg', alt: 'A man with a prosthetic arm working with colleagues at an office desk' },
  'personal-care-and-daily-living-supports-what-to-ask': { photo: 'banners/personal-care-2.jpg', alt: 'Two older women holding hands with a younger woman' },
  'transport-and-the-ndis-getting-to-appointments-and-activities': { photo: 'banners/transport.jpg', alt: 'A man in a wheelchair getting into a car' },
  'choosing-a-therapist-occupational-therapy-physiotherapy-speech-pathology': { photo: 'banners/therapy-2.jpg', alt: 'A physiotherapist helping a client stretch their shoulder' },
  'nursing-and-health-supports-at-home-what-the-ndis-covers': { photo: 'banners/older-people-2.jpg', alt: 'A nurse in a face mask beside a smiling older woman' },
  'a-back-up-plan-for-your-ndis-supports-emergencies-and-disruptions': { photo: 'banners/housing-2.jpg', alt: 'A support worker bringing a woman a hot drink at home' },
  'community-participation-and-social-supports-how-to-choose': { photo: 'banners/community.jpg', alt: 'Four friends walking together in a park' },
  // local
  'finding-ndis-supports-in-regional-and-remote-areas': { photo: 'banners/language-first-nations-2.jpg', alt: 'A lone tree and red ranges in the Australian outback' },
  'moving-to-a-new-town-or-state-with-the-ndis': { photo: 'banners/locations-tas.jpg', alt: 'A sunny waterfront with boats and a bridge in Tasmania' },
  // for workers
  'starting-as-an-independent-support-worker-what-to-set-up-first': { photo: 'banners/personal-care.jpg', alt: 'A support worker chatting with older residents in a common room' },
  // for workers
  'ndis-worker-screening-check-who-needs-one-and-how-it-works': { photo: 'banners/therapy-3.jpg', alt: 'Two professionals standing together in a therapy room' },
  'ndis-code-of-conduct-for-support-workers-what-it-means-in-everyday-work': { photo: 'banners/community-3.jpg', alt: 'A group of friends smiling together outdoors' },
  'abn-tax-and-insurance-for-independent-support-workers-what-to-sort-out': { photo: 'banners/employment-3.jpg', alt: 'A woman on the phone at her desk' },
  'independent-contractor-or-employee-getting-your-support-work-arrangement-right': { photo: 'banners/transport-3.jpg', alt: 'Three people talking beside a van' },
  'setting-your-rates-ndis-price-limits-and-fair-pricing-for-independent-workers': { photo: 'banners/employment.jpg', alt: 'A woman working at a laptop in a busy office' },
  'service-agreements-notes-and-invoices-the-paperwork-independent-workers-need': { photo: 'why-sol-directory.jpg', alt: 'A support worker and a woman using a walker looking at a notebook together' },
  // for providers
  'how-to-become-a-registered-ndis-provider-the-steps-and-what-to-prepare': { photo: 'login-hero.jpg', alt: 'A woman in a wheelchair at her desk while colleagues talk by a whiteboard' },
  'registered-or-unregistered-which-path-suits-your-ndis-support-business': { photo: 'banners/condition-sensory.jpg', alt: 'A smiling young woman outdoors' },
  'ndis-quality-audits-verification-or-certification-what-to-expect': { photo: 'banners/condition-neuro-2.jpg', alt: 'A doctor talking with a patient in a medical room' },
  'ndis-practice-standards-in-plain-english-for-new-providers': { photo: 'banners/condition-neuro.jpg', alt: 'A health professional fitting a wrist support to a patient’s hand' },
  'reportable-incidents-and-incident-management-what-ndis-providers-need-to-know': { photo: 'banners/condition-mobility-2.jpg', alt: 'A person sitting on a bench in a paved square with a wheelchair beside them' },
  'handling-complaints-well-a-guide-for-ndis-providers': { photo: 'banners/mental-health-3.jpg', alt: 'Two people talking on a sofa in a living room' },
  'writing-a-provider-profile-that-helps-people-choose-you': { photo: 'banners/condition-intellectual-3.jpg', alt: 'A smiling woman in a white t-shirt' },
  'responding-to-enquiries-a-practical-checklist-for-ndis-and-aged-care-providers': { photo: 'banners/language-asia-pacific.jpg', alt: 'Two women chatting and laughing by a lake' },
  // aged care
  'support-at-home-explained-how-in-home-aged-care-works': { photo: 'banners/personal-care-3.jpg', alt: 'Two older women sitting and talking' },
  'getting-an-aged-care-assessment-what-to-expect': { photo: 'banners/mental-health.jpg', alt: 'A woman and a man in a relaxed one-to-one conversation on a sofa' },
  'aged-care-costs-what-you-may-be-asked-to-contribute': { photo: 'banners/funding-veterans-3.jpg', alt: 'An older couple smiling together at home' },
  'choosing-an-aged-care-provider-or-home-what-to-compare': { photo: 'six-checks-on-every-provider.jpg', alt: 'A carer sharing a laugh with an older woman in a lounge' },
  'aged-care-rights-and-making-a-complaint': { photo: 'banners/condition-sensory-2.jpg', alt: 'A smiling older woman in a grey cardigan' },
  'respite-care-a-break-for-you-and-your-carer': { photo: 'banners/guides.jpg', alt: 'A woman sitting reading with a mug in her hand' },
  'registered-supporters-in-aged-care-helping-someone-decide': { photo: 'banners/funding-veterans-2.jpg', alt: 'Two older men smiling in a room' },
  'when-your-aged-care-needs-change-reviews-and-changing-providers': { photo: 'banners/condition-mobility-3.jpg', alt: 'A man on a mobility scooter in front of a house' },
  'moving-into-an-aged-care-home-what-to-expect': { photo: 'banners/condition-mobility.jpg', alt: 'An older man sitting on a walker outside in the sun' },
};
