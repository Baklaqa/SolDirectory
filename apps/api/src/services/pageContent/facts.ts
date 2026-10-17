import Provider from '../../models/Provider.js';
import RegisterListing from '../../models/RegisterListing.js';
import {
  computeAreaLocal, computeAreaSupports, computeHub, computeServiceLocal, computeServiceSuburbs, type AreaLocal, type ServiceLocal,
} from '../../controllers/register.controller.js';
import { MIN_INDEXABLE_SERVICE_LOCATION, MIN_SUBURB_LISTINGS, REAL_SERVICES, REGISTER_TYPES, STATE_CODES, STATE_NAMES, type RegisterType } from '../registerNormalise.js';
import { censusFor } from '../census.js';
import { formatKey, pathOf, slugifyService, type PageKey } from './keys.js';
import { isIndexableSuburb, CENSUS_CREDIT } from '@soldirectory/topic-content';
import { serviceEditorialFor } from '@soldirectory/service-content';

/**
 * Everything the copywriter (an LLM in n8n) is allowed to state about a page, and nothing else. Every number in a rewrite must be one of
 * `numbers` (see score.ts), every suburb it names must be in `names` or `nearby`, and it may link only to `links`.
 */
export interface PageFacts {
  key: string;
  kind: PageKey['kind'];
  path: string;
  names: { service: string | null; suburb: string | null; state: string; stateName: string; area: string; register: string | null };
  /** What the page says now, so the rewrite can improve on it rather than repeat it. */
  baseline: { h1: string; title: string };
  counts: Record<string, number>;
  rank: { position: number; of: number; topSuburb: string; topCount: number } | null;
  nearby: { suburb: string; slug: string; listings: number; km: number }[];
  nearestTown: { suburb: string; listings: number; km: number } | null;
  reach: { fewAreas: number; someAreas: number; manyAreas: number; widest: number; multiState: number } | null;
  topSupports: { support: string; listings: number }[];
  languages: { language: string; listings: number }[];
  localListings: string[];
  census: Record<string, number | string> | null;
  censusCredit: string | null;
  serviceGuidance: { shortAnswer: string; includes: string[]; officialSources: { label: string; url: string }[] } | null;
  links: { label: string; path: string }[];
  /** Every number a rewrite may use. */
  numbers: number[];
}

/** Numbers the site's own wording uses: the reach bands (5, 6, 25, 26), the 10 and 3 provider limits, 100, and 65 as the age band the Census reports. */
const WORDING_NUMBERS = [3, 5, 6, 10, 25, 26, 65, 100];

const STATE_SLUG = (code: string) => code.toLowerCase();
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** All the numbers in a facts object (counts, kilometres, percentages, years), so a rewrite can be checked against them. */
function collectNumbers(value: unknown, out: Set<number>) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    out.add(value);
    out.add(Math.round(value));
    if (!Number.isInteger(value)) out.add(Math.round(value * 10) / 10);
  } else if (Array.isArray(value)) {
    for (const v of value) collectNumbers(v, out);
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value as object)) collectNumbers(v, out);
  }
}

const reachOf = (p: ServiceLocal['profile']) => ({
  fewAreas: p.reach.local, someAreas: p.reach.district, manyAreas: p.reach.regional, widest: p.reach.wide, multiState: p.multiState,
});

function censusObject(state: string, suburbSlug: string | null) {
  const c = censusFor(state.toUpperCase(), suburbSlug);
  if (!c) return null;
  return {
    population: c.population,
    ...(c.medianAge ? { medianAge: c.medianAge } : {}),
    ...(c.medianWeeklyHouseholdIncome ? { medianWeeklyHouseholdIncomeDollars: c.medianWeeklyHouseholdIncome } : {}),
    peopleNeedingHelpWithCoreActivities: c.needHelp,
    percentNeedingHelp: c.needHelpPct,
    percentNeedingHelpInState: c.stateNeedHelpPct,
    percentNeedingHelpAustralia: c.australiaNeedHelpPct,
    percentAged65Plus: c.over65Pct,
    percentAged65PlusInState: c.stateOver65Pct,
    percentAged65PlusAustralia: c.australiaOver65Pct,
    year: 2021,
  };
}

export async function buildFacts(key: PageKey): Promise<PageFacts | null> {
  const code = key.state.toUpperCase();
  const stateName = STATE_NAMES[code as keyof typeof STATE_NAMES] ?? code;
  const numbers = new Set<number>([2021]);

  if (key.kind === 'service') {
    const { service, serviceSlug, suburbSlug } = key;
    const rows = (await computeServiceSuburbs(service)).filter((s) => s.state === code);
    const row = rows.find((s) => s.slug === suburbSlug);
    if (!row) return null;
    const suburb = row.suburb;
    const local = await computeServiceLocal(service, code, suburbSlug);
    const areaSupports = await computeAreaSupports(code, suburbSlug);
    const solMembers = await Provider.countDocuments({
      accountStatus: 'active',
      registrationGroups: new RegExp(`^${escapeRegex(service)}$`, 'i'),
      serviceSuburbs: new RegExp(`^\\s*${escapeRegex(suburb)}\\s*$`, 'i'),
    });
    const sorted = [...rows].sort((a, b) => b.count - a.count || a.suburb.localeCompare(b.suburb));
    const position = 1 + rows.filter((s) => s.count > row.count).length;
    const editorial = serviceEditorialFor(service) as { shortAnswer: string; includes: string[]; sources?: { label: string; href: string }[] } | undefined;
    const links = [
      { label: `${service} guide`, path: `/services/${serviceSlug}` },
      { label: `NDIS providers in ${stateName}`, path: `/ndis-providers/${STATE_SLUG(code)}` },
      { label: `NDIS providers in ${suburb}`, path: `/ndis-providers/${STATE_SLUG(code)}/${suburbSlug}` },
      { label: `Aged care providers in ${suburb}`, path: `/aged-care-providers/${STATE_SLUG(code)}/${suburbSlug}` },
      ...local.nearby.slice(0, 4).map((n) => ({ label: `${service} in ${n.suburb}`, path: `/services/${serviceSlug}/${STATE_SLUG(code)}/${n.slug}` })),
      { label: 'Find a provider', path: '/find-a-provider' },
    ];
    const facts: PageFacts = {
      key: formatKey(key),
      kind: 'service',
      path: pathOf(key),
      names: { service, suburb, state: code, stateName, area: `${suburb}, ${code}`, register: null },
      baseline: { h1: `${service} providers in ${suburb}, ${stateName}`, title: `${service} providers in ${suburb}, ${code}` },
      counts: {
        registerListings: row.count,
        ndisListings: local.profile.ndis,
        agedCareListings: local.profile.agedCare,
        solDirectoryMembers: solMembers,
        suburbsInStateWithListings: rows.length,
        supportsListedInSuburb: areaSupports.length,
        listingsWithWebsite: local.profile.withWebsite,
        listingsListingOnlyThisService: local.profile.specialists,
        typicalSupportsPerListing: local.profile.typicalSupports,
      },
      rank: rows.length > 1 ? { position, of: rows.length, topSuburb: sorted[0].suburb, topCount: sorted[0].count } : null,
      nearby: local.nearby.map((n) => ({ suburb: n.suburb, slug: n.slug, listings: n.count, km: Math.round(n.km) })),
      nearestTown: local.nearestTown ? { suburb: local.nearestTown.suburb, listings: local.nearestTown.count, km: Math.round(local.nearestTown.km) } : null,
      reach: reachOf(local.profile),
      topSupports: local.profile.topSupports.map((t) => ({ support: t.category, listings: t.count })),
      languages: local.languages.map((l) => ({ language: l.language, listings: l.count })),
      localListings: local.profile.localNames,
      census: censusObject(code, suburbSlug),
      censusCredit: censusFor(code, suburbSlug) ? CENSUS_CREDIT : null,
      serviceGuidance: editorial
        ? { shortAnswer: editorial.shortAnswer, includes: editorial.includes.slice(0, 6), officialSources: (editorial.sources ?? []).map((s) => ({ label: s.label, url: s.href })) }
        : null,
      links,
      numbers: [],
    };
    collectNumbers([facts.counts, facts.rank, facts.nearby, facts.nearestTown, facts.reach, facts.topSupports, facts.languages, facts.census], numbers);
    collectNumbers(WORDING_NUMBERS, numbers); // the reach bands and the 10 and 3 provider limits are wording the site already uses
    facts.numbers = [...numbers].sort((a, b) => a - b);
    return facts;
  }

  // Register state or suburb page.
  const { type, suburbSlug } = key;
  const label = type === 'ndis' ? 'NDIS' : 'aged care';
  const registerName = type === 'ndis' ? 'NDIS Commission register of registered providers' : 'My Aged Care provider register';
  const hub = await computeHub(type);
  const inState = hub.suburbs.filter((s) => s.state === code);
  let suburb: string | null = null;
  if (suburbSlug) {
    const row = inState.find((s) => s.slug === suburbSlug);
    if (!row) return null;
    suburb = row.suburb;
  } else if (!hub.states[code]) {
    return null;
  }
  const local: AreaLocal = await computeAreaLocal(type, code, suburbSlug);
  const supports = suburbSlug ? await computeAreaSupports(code, suburbSlug) : [];
  const total = suburbSlug ? inState.find((s) => s.slug === suburbSlug)!.count : hub.states[code];
  const base = type === 'ndis' ? 'ndis-providers' : 'aged-care-providers';
  const facts: PageFacts = {
    key: formatKey(key),
    kind: 'register',
    path: pathOf(key),
    names: { service: null, suburb, state: code, stateName, area: suburb ? `${suburb}, ${code}` : stateName, register: registerName },
    baseline: {
      h1: `${type === 'ndis' ? 'NDIS' : 'Aged care'} providers in ${suburb ? `${suburb}, ${code}` : stateName}`,
      title: `${type === 'ndis' ? 'NDIS' : 'Aged care'} providers in ${suburb ? `${suburb}, ${code}` : stateName}`,
    },
    counts: {
      listings: total,
      ...(suburbSlug ? { supportsListedInSuburb: supports.length, suburbsInStateWithListings: inState.length } : { suburbsWithTheirOwnPage: local.suburbsCovered }),
      listingsWithWebsite: local.profile.withWebsite,
      listingsListingOnlyOneSupport: local.profile.specialists,
      typicalSupportsPerListing: local.profile.typicalSupports,
    },
    rank: local.rank ? { position: local.rank.position, of: local.rank.of, topSuburb: local.rank.top.suburb, topCount: local.rank.top.count } : null,
    nearby: local.nearby.map((n) => ({ suburb: n.suburb, slug: n.slug, listings: n.count, km: Math.round(n.km) })),
    nearestTown: null,
    reach: reachOf(local.profile),
    topSupports: local.profile.topSupports.map((t) => ({ support: t.category, listings: t.count })),
    languages: local.languages.map((l) => ({ language: l.language, listings: l.count })),
    localListings: local.profile.localNames,
    census: censusObject(code, suburbSlug),
    censusCredit: censusFor(code, suburbSlug) ? CENSUS_CREDIT : null,
    serviceGuidance: null,
    links: [
      { label: `${label} providers in ${stateName}`, path: `/${base}/${STATE_SLUG(code)}` },
      ...local.nearby.slice(0, 4).map((n) => ({ label: `${label} providers in ${n.suburb}`, path: `/${base}/${STATE_SLUG(code)}/${n.slug}` })),
      ...local.busiest.slice(0, 3).map((b) => ({ label: `${label} providers in ${b.suburb}`, path: `/${base}/${STATE_SLUG(code)}/${b.slug}` })),
      { label: 'Find a provider', path: '/find-a-provider' },
    ],
    numbers: [],
  };
  if (!suburbSlug) (facts as PageFacts & { busiest?: unknown }).busiest = local.busiest;
  collectNumbers([facts.counts, facts.rank, facts.nearby, facts.reach, facts.topSupports, facts.languages, facts.census, local.busiest], numbers);
  collectNumbers(WORDING_NUMBERS, numbers);
  facts.numbers = [...numbers].sort((a, b) => a - b);
  return facts;
}

export interface EligiblePage { key: string; kind: 'service' | 'register'; path: string; listings: number; phaseIndexable: boolean; label: string }

let listCache: { at: number; value: EligiblePage[] } | null = null;

/** Every page that exists today (a suburb or state with enough register listings), busiest first. Cached for ten minutes. */
export async function listEligiblePages(): Promise<EligiblePage[]> {
  if (listCache && Date.now() - listCache.at < 10 * 60_000) return listCache.value;
  const out: EligiblePage[] = [];
  for (const service of REAL_SERVICES) {
    const slug = slugifyService(service);
    for (const s of await computeServiceSuburbs(service)) {
      const key: PageKey = { kind: 'service', service, serviceSlug: slug, state: s.state.toLowerCase(), suburbSlug: s.slug };
      out.push({
        key: formatKey(key), kind: 'service', path: pathOf(key), listings: s.count, label: `${service} in ${s.suburb}, ${s.state}`,
        phaseIndexable: s.count >= MIN_INDEXABLE_SERVICE_LOCATION && isIndexableSuburb(s.state, s.suburb, s.count),
      });
    }
  }
  for (const type of REGISTER_TYPES as readonly RegisterType[]) {
    const hub = await computeHub(type);
    for (const state of STATE_CODES) {
      if (hub.states[state]) {
        const key: PageKey = { kind: 'register', type, state: state.toLowerCase(), suburbSlug: null };
        out.push({ key: formatKey(key), kind: 'register', path: pathOf(key), listings: hub.states[state], label: `${type === 'ndis' ? 'NDIS' : 'Aged care'} providers in ${STATE_NAMES[state]}`, phaseIndexable: true });
      }
    }
    for (const s of hub.suburbs) {
      const key: PageKey = { kind: 'register', type, state: s.state.toLowerCase(), suburbSlug: s.slug };
      out.push({
        key: formatKey(key), kind: 'register', path: pathOf(key), listings: s.count, label: `${type === 'ndis' ? 'NDIS' : 'Aged care'} providers in ${s.suburb}, ${s.state}`,
        phaseIndexable: s.count >= MIN_SUBURB_LISTINGS && isIndexableSuburb(s.state, s.suburb, s.count),
      });
    }
  }
  out.sort((a, b) => b.listings - a.listings || a.key.localeCompare(b.key));
  listCache = { at: Date.now(), value: out };
  return out;
}

/** Used by tests that need the listing collection loaded. */
export const listingCount = () => RegisterListing.estimatedDocumentCount();
