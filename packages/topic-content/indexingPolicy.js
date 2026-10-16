import { STATE_CENTRES } from './pageContent.js';

/**
 * Phased indexing (gap audit A1 to A3, 16 October 2026).
 *
 * About 58,000 pages were set to index, most of them built from the same template or from the public register. Search engines can
 * treat that as scaled content and mark the whole domain down. So indexing is phased:
 *
 *  - Suburb pages (register suburb hubs and service x suburb pages) are indexed only for the capital cities and regional centres in
 *    STATE_CENTRES. Every other suburb page still works and is linked, but carries "noindex, follow" and is left out of the sitemap.
 *  - Individual register profile pages (one per listed organisation) are noindex for now. They copy the public register and are
 *    thin. Member profiles and service pages carry the SEO instead.
 *
 * To widen the footprint later, after Search Console shows the first tier is indexed and ranking, add suburbs to EXTRA_INDEX_SUBURBS
 * below, set INDEX_ALL_SUBURBS to true, or set INDEX_REGISTER_PROFILES to true once the profile pages have more to say.
 * The API (sitemap and crawler HTML) and the web app (meta robots) both read this file, so they always agree.
 */
export const INDEX_ALL_SUBURBS = false;
export const INDEX_REGISTER_PROFILES = false;
/** Extra suburbs to index in the first phase, as 'STATE:Suburb' (for example 'NSW:Penrith'). */
export const EXTRA_INDEX_SUBURBS = [];

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const PRIORITY = new Set([
  ...STATE_CENTRES.flatMap((c) => [c.capital, ...c.centres].map((name) => `${c.code}:${norm(name)}`)),
  ...EXTRA_INDEX_SUBURBS.map((entry) => {
    const [code, ...rest] = String(entry).split(':');
    return `${code.trim().toUpperCase()}:${norm(rest.join(':'))}`;
  }),
]);

/** True if a suburb page for this state and suburb should be indexed in the current phase. */
export function isPriorityIndexSuburb(stateCode, suburbName) {
  if (INDEX_ALL_SUBURBS) return true;
  return PRIORITY.has(`${String(stateCode).toUpperCase()}:${norm(suburbName)}`);
}
