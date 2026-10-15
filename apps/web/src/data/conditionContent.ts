import type { SUPPORT_CATEGORIES } from '../lib/registerMeta';
import { slugify } from '../lib/slugify';
import { CONDITION_CONTENT_GROUPS } from '@soldirectory/topic-content';

type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

/**
 * Real, general-information content for the 40 conditions/needs shown in
 * the mega menu's "Condition" tab (see staticMegaMenuFallback.ts, which
 * links each one to /condition/:slug/ — ProviderListingPage.tsx reads
 * this file to render the page, since a condition with no real provider
 * tagged yet still needs somewhere honest to send a visitor).
 *
 * Everything here is general educational information, not medical advice
 * or a diagnostic description — each entry says so. Nothing here claims
 * a provider count, a statistic, or a specific provider's experience:
 * that part of the page is always driven by real data (see
 * ProviderListingPage's provider list), separate from this file.
 *
 * `relatedCategories` are real, canonical register/service categories
 * (registerMeta.ts's SUPPORT_CATEGORIES) commonly relevant to the
 * condition — used to link to real, working /find-a-provider search filters,
 * never invented category names.
 */

export interface ConditionContent {
  slug: string;
  name: string;
  categoryGroup: string;
  /** General information only — not a diagnosis, not medical advice. */
  summary: string;
  relatedCategories: SupportCategory[];
}

export interface ConditionCategoryGroup {
  title: string;
  /** A short, general note shown once at the top of every page in this group. */
  note?: string;
  items: ConditionContent[];
}

// The text lives in packages/topic-content/conditionContent.js, so the server-rendered page and this one read the same copy.
export const CONDITION_CATEGORY_GROUPS: ConditionCategoryGroup[] = CONDITION_CONTENT_GROUPS as ConditionCategoryGroup[];

export const CONDITION_CONTENT: ConditionContent[] = CONDITION_CATEGORY_GROUPS.flatMap((g) => g.items);

// A hardcoded slug that silently drifts from slugify(name) means the mega
// menu link 404s instead of showing this content — surfaced loudly here
// (once, at module load) rather than discovered by a visitor.
for (const c of CONDITION_CONTENT) {
  if (c.slug !== slugify(c.name)) {
    // eslint-disable-next-line no-console
    console.error(`[conditionContent] slug mismatch for "${c.name}": stored "${c.slug}", expected "${slugify(c.name)}"`);
  }
}

export const conditionBySlug = (slug: string): ConditionContent | undefined =>
  CONDITION_CONTENT.find((c) => c.slug === slug.toLowerCase());
