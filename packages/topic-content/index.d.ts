export interface Topic {
  slug: string;
  name: string;
  categoryGroup: string;
}

export interface ShellEditorial {
  overview: string;
  checks: string[];
  faq: { question: string; answer: string }[];
  steps?: string[];
  records?: string[];
  providerQuestions?: string[];
  pitfalls?: string[];
  deepDive?: string[];
  reviewChecklist?: string[];
  sources?: { label: string; href: string }[];
}

export interface GuideSection {
  heading: string;
  body: string[];
  list?: string[];
}

export interface GuideDoc {
  slug: string;
  title: string;
  summary: string;
  sections: GuideSection[];
  internalLinks: { label: string; href: string }[];
  officialLink: { label: string; href: string };
}

export const GUIDE_DOCS: Record<string, GuideDoc>;

export const CONDITION_TOPICS: readonly Topic[];
export const FUNDING_TOPICS: readonly Topic[];
export const LANGUAGE_TOPICS: readonly Topic[];
export function conditionShellEditorial(topic: Topic): ShellEditorial;
export function fundingShellEditorial(topic: Topic): ShellEditorial;
export function languageShellEditorial(topic: Topic): ShellEditorial;

export interface EditorialBlogSection {
  heading: string;
  paragraphs: string[];
}

export interface EditorialBlogSource {
  label: string;
  url: string;
  date: string;
}

export interface EditorialBlogPost {
  slug: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  checkedAt: string;
  expiresAt?: string;
  coverImage: string;
  coverAlt: string;
  /** A few short bullets shown in an “In short” box above the article. */
  keyPoints?: string[];
  /** Shorter title for search results and link previews (the page heading stays `title`). */
  seoTitle?: string;
  source: EditorialBlogSource;
  additionalSources: { label: string; url: string }[];
  sections: EditorialBlogSection[];
}

export const EDITORIAL_BLOG_POSTS: readonly EditorialBlogPost[];

/** Articles that sit closest to a given article, for “keep learning” links. */
export function relatedToArticle(slug: string, options?: { limit?: number; now?: number }): EditorialBlogPost[];

export interface RelatedArticlesQuery {
  /** A service name from the catalogue, e.g. "Personal care". */
  service?: string;
  /** Themes: choosing, registration, agreement, workers, funding, plan, housing, assistive, local, regional, moving, news, worker-business, provider-business. */
  themes?: string[];
  exclude?: string[];
  limit?: number;
  now?: number;
}
export function relatedArticles(query?: RelatedArticlesQuery): EditorialBlogPost[];

export interface PageFaq { question: string; answer: string }
export const INDEPENDENT_WORKER_FAQS: readonly PageFaq[];
export const PROVIDER_FAQS: readonly PageFaq[];
/** ISO date the /providers guidance last changed. */
export const WORKER_PAGE_TITLE: string;
export const WORKER_PAGE_DESCRIPTION: string;
/** ISO date the /independent-workers guidance last changed. */
export const WORKER_PAGE_UPDATED: string;
export const WORKER_HERO_CHECKS: readonly string[];
export const PROVIDER_PAGE_UPDATED: string;
export const PROVIDER_PAGE_DESCRIPTION: string;
export const WORKER_PAGE_GUIDES: readonly string[];
export const PROVIDER_PAGE_GUIDES: readonly string[];
export const WORKER_SETUP_STEPS: readonly { title: string; body: string; link: { to: string; label: string } }[];
export const PROVIDER_LISTING_CHECKS: readonly { title: string; body: string }[];

export interface GlossaryTerm { term: string; definition: string; to: string; label: string }
export const GLOSSARY: readonly GlossaryTerm[];

export const DIRECTORY_STEPS: readonly { title: string; body: string; link?: { to: string; label: string } }[];
export const DIRECTORY_FAQS: readonly PageFaq[];
export const LOCATION_FAQS: readonly PageFaq[];
export const STATE_CENTRES: readonly { code: string; capital: string; centres: string[] }[];
export const PROVIDER_UNDERSTAND: readonly { title: string; body: string }[];
export const PROVIDER_REACH: readonly { title: string; body: string }[];
export const PROVIDER_STEPS: readonly { title: string; body: string }[];
export const PROVIDER_PATHS: readonly { title: string; body: string; link: { to: string; label: string }; tint?: boolean }[];
export const PROVIDER_SAFEGUARDS: readonly { title: string; body: string; link: { to: string; label: string } }[];
export const WORKER_PROFILE_DETAILS: readonly (readonly [string, string])[];
export const WORKER_HOW_IT_WORKS: readonly (readonly [string, string])[];
export const WORKER_SAFEGUARDS: readonly { title: string; text: string }[];
export const PROVIDER_PLANS: { starter: { name: string; price: string; features: readonly string[] }; growth: { name: string; price: string; features: readonly string[] } };

export interface HubListItem { text: string; title?: string; to?: string; label?: string }
export interface HubSection { heading: string; paragraphs?: string[]; list?: HubListItem[]; links?: { to: string; label: string }[] }
export interface HubCopy { sections: HubSection[]; faqs?: PageFaq[] }
/** The reading copy for a hub or landing page, by its path, or null when the page has none. */
export function hubCopy(path: string): HubCopy | null;
export const DIRECTORY_KINDS: { member: { title: string; body: string }; register: { title: string; body: string }; note: string };

export interface EditorialStandardsSection {
  heading: string;
  paragraphs?: string[];
  list?: { title: string; text: string }[];
  sources?: { name: string; use: string; href: string }[];
  links?: { to: string; label: string }[];
}
export const EDITORIAL_STANDARDS: { intro: string; sections: EditorialStandardsSection[]; see: { to: string; label: string }[] };

/** The words on /support-coordinators. Inline links are written [label](/path). */
export interface CoordinatorPage {
  seoTitle: string;
  seoDescription: string;
  heading: string;
  subtitle: string;
  /** ISO date the guidance was last changed, and the same date as shown on the page. */
  updated: string;
  updatedLabel: string;
  glanceHeading: string;
  glance: string[];
  intro: { label: string; heading: string; text: string };
  referral: { id: string; heading: string; paragraphs: string[]; steps: string[] };
  urgent: { id: string; heading: string; paragraphs: string[] };
  checks: { id: string; heading: string; intro: string; cards: { title: string; text: string }[]; note: string };
  pricing: { heading: string; paragraphs: string[] };
  records: { heading: string; paragraphs: string[]; list: string[]; after: string };
  after: { heading: string; paragraphs: string[] };
  resources: { heading: string; text: string };
  faqsHeading: string;
  faqs: PageFaq[];
  officialHeading: string;
  official: { label: string; href: string }[];
  contact: { heading: string; text: string };
}
export const COORDINATOR_PAGE: CoordinatorPage;
