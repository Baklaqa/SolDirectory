import { FUNDING_CONTENT_GROUPS, type FundingContentGroup, type FundingTopicContent } from '@soldirectory/topic-content';
import { slugify } from '../lib/slugify';

/**
 * Real, general-information content for the 25 funding topics shown in
 * the mega menu's "Funding" tab (see staticMegaMenuFallback.ts, which
 * links each one to /funding/:slug).
 *
 * Unlike conditions, most of these topics have no matching Provider
 * field at all — "Home Care Packages" or "DVA Home Care" describe a
 * funding SCHEME, not something a provider tags on their profile.
 * Only the 3 NDIS plan-management-style topics map to a real,
 * filterable field (Provider.acceptedFunding — the exact same
 * 'Plan-managed' / 'Self-managed' / 'NDIA-managed' values Lead.funding
 * uses). `fundingFilter` is set ONLY for those 3; every other page
 * honestly has no provider filter and says so, rather than pretending
 * to filter on something SolDirectory doesn't actually track.
 *
 * General information only, not financial or funding advice — every
 * page says so. Program names, thresholds and processes described here
 * change over time (especially aged care, which has had recent reform);
 * always confirm current detail with the relevant official body
 * (Services Australia, the NDIS, My Aged Care, DVA) before relying on it.
 *
 * The words themselves live in packages/topic-content/fundingContent.js, so the crawler HTML, the prerendered pages and
 * this page all read the same text. This file only types them and builds the lookups the page needs.
 */

export type FundingContent = FundingTopicContent;
export type FundingCategoryGroup = FundingContentGroup;

export const FUNDING_CATEGORY_GROUPS: FundingCategoryGroup[] = FUNDING_CONTENT_GROUPS;

export const FUNDING_CONTENT: FundingContent[] = FUNDING_CATEGORY_GROUPS.flatMap((g) => g.items);

export const fundingBySlug = (slug: string): FundingContent | undefined =>
  FUNDING_CONTENT.find((f) => f.slug === slug.toLowerCase());

for (const f of FUNDING_CONTENT) {
  if (f.slug !== slugify(f.name)) {
    // eslint-disable-next-line no-console
    console.error(`[fundingContent] slug mismatch for "${f.name}": stored "${f.slug}", expected "${slugify(f.name)}"`);
  }
}
