import { STATE_CENTRES } from './pageContent.js';

/**
 * Phased indexing (gap audit A1 to A3, 16 October 2026).
 *
 * About 58,000 pages were set to index, most of them built from the same template or from the public register. Search engines can
 * treat that as scaled content and mark the whole domain down. So indexing grows in phases, and each phase is switched on only
 * after Search Console shows the one before it is indexed and ranking:
 *
 *  - PHASE 1: suburb pages (register suburb hubs and service x suburb pages) are indexed only for the capital cities and
 *    regional centres in STATE_CENTRES, plus anything in EXTRA_INDEX_SUBURBS.
 *  - PHASE 2 (now, from 16 October 2026, after the local content was added to every page): also any suburb with at least PHASE_2_MIN_LISTINGS register listings (the busy suburbs).
 *  - PHASE 3: every suburb page that meets the normal page minimum (MIN_SUBURB_LISTINGS, and 5 for service x suburb pages).
 *
 * Every other suburb page still works and is linked, but carries "noindex, follow" and is left out of the sitemap.
 * Individual register profile pages (one per listed organisation) are noindex for now. They copy the public register and are
 * thin. Member profiles and service pages carry the SEO instead. Set INDEX_REGISTER_PROFILES to true only once they say more.
 *
 * To move to the next phase, change INDEX_PHASE below and deploy. The API (sitemap and crawler HTML) and the web app (meta
 * robots) both read this file, so they always agree.
 */
export const INDEX_PHASE = 2;
export const PHASE_2_MIN_LISTINGS = 25;
export const INDEX_REGISTER_PROFILES = false;
/** Extra suburbs to index in every phase, as 'STATE:Suburb' (for example 'NSW:Penrith'). */
export const EXTRA_INDEX_SUBURBS = [];

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const PRIORITY = new Set([
  ...STATE_CENTRES.flatMap((c) => [c.capital, ...c.centres].map((name) => `${c.code}:${norm(name)}`)),
  ...EXTRA_INDEX_SUBURBS.map((entry) => {
    const [code, ...rest] = String(entry).split(':');
    return `${code.trim().toUpperCase()}:${norm(rest.join(':'))}`;
  }),
]);

/** True for the capital cities, regional centres and extra suburbs: the phase 1 set, and the "nearest town" a small suburb points to. */
export function isPriorityIndexSuburb(stateCode, suburbName) {
  return PRIORITY.has(`${String(stateCode).toUpperCase()}:${norm(suburbName)}`);
}

/**
 * True if the page for this suburb is indexed in the current phase. `count` is the number of register listings the page covers.
 * The caller still applies the page's own minimum (a page with too few listings is never indexed, whatever the phase).
 */
export function isIndexableSuburb(stateCode, suburbName, count, phase = INDEX_PHASE) {
  if (isPriorityIndexSuburb(stateCode, suburbName)) return true;
  if (phase >= 3) return true;
  if (phase === 2) return Number(count) >= PHASE_2_MIN_LISTINGS;
  return false;
}
