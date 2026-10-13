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
export const WORKER_PAGE_GUIDES: readonly string[];
export const PROVIDER_PAGE_GUIDES: readonly string[];
export const WORKER_SETUP_STEPS: readonly { title: string; body: string; link: { to: string; label: string } }[];
export const PROVIDER_LISTING_CHECKS: readonly { title: string; body: string }[];

export interface GlossaryTerm { term: string; definition: string; to: string; label: string }
export const GLOSSARY: readonly GlossaryTerm[];
