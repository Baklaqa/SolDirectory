/**
 * The legal and policy pages themselves live in packages/topic-content/legalPack.js (twelve pages, from the owner's
 * "SolDirectory Legal and Policy Pages" document of 15 October 2026), so the web app and the crawler HTML read the same
 * words. Some statements in the pack describe how the service runs and the people who run it (not the code) have to
 * confirm them: see apps/web/LEGAL_CLAIMS.md.
 */

/** Order of the legal pages in the footer and "other legal pages" list. */
export const LEGAL_PAGE_ORDER = [
  'privacy', 'collection-notice', 'cookies', 'terms', 'provider-agreement', 'worker-terms', 'complaints',
  'statement-of-rights', 'listing-and-ranking-policy', 'editorial-policy', 'accessibility', 'data-sources',
] as const;
