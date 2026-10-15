export interface Topic {
  slug: string;
  name: string;
  categoryGroup: string;
}

export interface ShellEditorial {
  overview: string;
  /** Funding topics only: the topic's own short paragraphs and key points. */
  summary?: string[];
  keyPoints?: string[];
  checks: string[];
  faq: { question: string; answer: string }[];
  steps?: string[];
  records?: string[];
  providerQuestions?: string[];
  pitfalls?: string[];
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
  /** Questions and answers shown under the guide and marked up as FAQPage. */
  faq?: { question: string; answer: string }[];
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
  /** Meta description when `summary` is longer than a search snippet (158 characters); a whole sentence, never cut off. */
  seoDescription?: string;
  /** Questions and answers shown under the article and marked up as FAQ structured data. */
  faq?: { question: string; answer: string }[];
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
export const DIRECTORY_PAGE_TITLE: string;
export const DIRECTORY_PAGE_HEADING: string;
export const DIRECTORY_PAGE_DESCRIPTION: string;
/** ISO date the /find-a-provider guidance last changed. */
export const DIRECTORY_PAGE_UPDATED: string;
export const DIRECTORY_PAGE_SUBTITLE: string;
export const DIRECTORY_SUPPORTS: readonly { name: string; label: string; photo: string }[];
export const DIRECTORY_GUIDANCE: {
  intro: string;
  blocks: { heading: string; text: string }[];
  questionsHeading: string;
  questions: string[];
  widerHeading: string;
  /** Inline links are written [label](/path). */
  wider: string;
};
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
export const ARTICLE_FAQS: Record<string, { question: string; answer: string }[]>;
/** Meta description for each /funding/:slug page, 158 characters or fewer. */
export const FUNDING_SEO_DESCRIPTIONS: Record<string, string>;
export interface ConditionContentItem { slug: string; name: string; categoryGroup: string; summary: string; relatedCategories: string[] }
export interface ConditionContentGroup { title: string; note?: string; items: ConditionContentItem[] }
/** General information for each /condition/:slug page, in display groups. */
export const CONDITION_CONTENT_GROUPS: ConditionContentGroup[];
export interface FundingTopicContent {
  slug: string;
  name: string;
  categoryGroup: string;
  summary: string[];
  keyPoints: string[];
  steps: string[];
  faq: { question: string; answer: string };
  fundingFilter?: 'NDIA-managed' | 'Plan-managed' | 'Self-managed';
}
export interface FundingContentGroup {
  title: string;
  items: FundingTopicContent[];
}
/** Written content for the 25 funding topics, in the order the page groups them. */
export const FUNDING_CONTENT_GROUPS: FundingContentGroup[];
export function fundingTopicContent(slug: string): FundingTopicContent | undefined;
/** A meta description that ends on a finished sentence and fits a search snippet. Only shortens existing text. */
export function metaDescription(text: string, max?: number, min?: number): string;
export function fundingFaqs(topic: Topic): { question: string; answer: string }[];
export function conditionFaqs(name: string, relatedCategories?: string[]): { question: string; answer: string }[];
export interface LanguageSpecifics {
  heading: string;
  about: string[];
  stepsHeading: string;
  steps: string[];
  forFamilies: string;
  sources: { label: string; href: string }[];
}
/** What is specific to the language and access topics that have no register data of their own (keyed by topic slug). */
export const LANGUAGE_SPECIFICS: Record<string, LanguageSpecifics>;
export type LegalBlock =
  | { t: 'p'; text: string; only?: string; unless?: string }
  | { t: 'note'; text: string; only?: string; unless?: string }
  | { t: 'ul'; items: (string | { text: string; only?: string; unless?: string })[] }
  | { t: 'table'; head: string[]; rows: string[][] };
export interface LegalSection { heading: string; blocks: LegalBlock[] }
export interface LegalPackDoc {
  slug: string;
  n: number;
  title: string;
  /** The laws the page is written to meet, for the reviewer. */
  meets: string;
  updated: string;
  sections: LegalSection[];
}
/** A doc after conditional blocks are resolved: list items are plain strings. */
export type ResolvedLegalBlock =
  | { t: 'p' | 'note'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'table'; head: string[]; rows: string[][] };
export interface ResolvedLegalDoc extends Omit<LegalPackDoc, 'sections'> {
  sections: { heading: string; blocks: ResolvedLegalBlock[] }[];
}
export const LEGAL_PACK: LegalPackDoc[];
export const LEGAL_PRACTICES: Record<string, boolean>;
export function resolveLegalDoc(doc: LegalPackDoc, practices?: Record<string, boolean>): ResolvedLegalDoc;
export function legalDocBySlug(slug: string, practices?: Record<string, boolean>): ResolvedLegalDoc | undefined;
export interface LanguageResource {
  agency: 'NDIS' | 'My Aged Care';
  label: string;
  href: string;
  /** The language's name as the agency writes it, where it gives one. */
  native?: string;
}
/** Official translated information, by language topic slug. Only languages the NDIS or My Aged Care name are present. */
export const LANGUAGE_RESOURCES: Record<string, LanguageResource[]>;
/** The date those links were last opened and confirmed. */
export const LANGUAGE_RESOURCES_CHECKED: string;
/** e.g. "the NDIS and My Aged Care" for a slug in LANGUAGE_RESOURCES, '' otherwise. */
export function languageResourceAgencies(slug: string): string;
export const LINK_TERMS: readonly { re: RegExp; slug: string; scopes: readonly string[] }[];
export const MAX_LINKS_PER_ARTICLE: number;
export interface LinkState { used: Set<string>; count: number }
export function newLinkState(): LinkState;
/** One paragraph as escaped HTML with at most one phrase linked to another article. */
export function linkParagraph(text: string, selfSlug: string, state: LinkState, scope?: 'ndis' | 'aged', skipSlugs?: string[]): string;
/** 'aged' for aged care articles (they only link to aged care guides), 'ndis' otherwise. */
export function linkScopeFor(category: string): 'ndis' | 'aged';
/** The article's questions as an HTML section (details/summary), or '' when it has none. */
export function faqHtml(faq?: { question: string; answer: string }[]): string;
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
