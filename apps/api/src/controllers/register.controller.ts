import type { Request, Response } from 'express';
import type { FilterQuery } from 'mongoose';
import RegisterListing, { type RegisterListingDoc } from '../models/RegisterListing.js';
import ClaimRequest from '../models/ClaimRequest.js';
import Provider from '../models/Provider.js';
import SuburbGeo from '../models/SuburbGeo.js';
import { VISIBLE_PROVIDER, publicLogoUrl } from './providersPublic.controller.js';
import { EmailService } from '../services/email.service.js';
import { LANGUAGE_TOPICS, isPriorityIndexSuburb } from '@soldirectory/topic-content';
import {
  MIN_INDEXABLE_SERVICE_LOCATION, MIN_SUBURB_LISTINGS, REAL_SERVICES, REGISTER_SUPPORT_CATEGORIES, REGISTER_TYPES, STATE_CODES, safeRegisterName,
  type RegisterType, type StateCode,
} from '../services/registerNormalise.js';

/**
 * Public read API for register listings. Everything here is safe to serve
 * to anyone: names, states, suburbs, services and a business's own public
 * website. Phone and email are deliberately not returned; enquiries go
 * through the matching flow so consent and lead capture stay in one place.
 */

const MAX_LIMIT = 30;
const AREAS_IN_LIST = 6;
const AREAS_IN_DETAIL = 120;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function parseType(v: unknown): RegisterType | null {
  return REGISTER_TYPES.includes(v as RegisterType) ? (v as RegisterType) : null;
}
function parseState(v: unknown): StateCode | null {
  const s = str(v).toUpperCase();
  return STATE_CODES.includes(s as StateCode) ? (s as StateCode) : null;
}

function toListItem(
  d: Pick<RegisterListingDoc, 'type' | 'slug' | 'name' | 'states' | 'areaCount' | 'areas' | 'supportCategories' | 'website' | 'abn' | 'claimStatus'>,
  logoUrl: string | null = null,
  location: { lat: number; lng: number } | null = null
) {
  return {
    logoUrl,
    location,
    type: d.type,
    slug: d.slug,
    name: safeRegisterName(d.name, d.slug),
    states: d.states,
    areaCount: d.areaCount,
    areas: d.areas.slice(0, AREAS_IN_LIST),
    claimStatus: d.claimStatus,
    supportCategories: d.supportCategories,
    hasWebsite: !!d.website,
    ...(d.abn ? { abn: d.abn } : {}),
  };
}

/**
 * The registers publish no logos. A listing a member provider has claimed can
 * show that provider's own uploaded logo, so list items for claimed listings get it.
 */
async function listItemsWithLogos(docs: any[], preferredArea?: { state?: string; suburbSlug?: string }) {
  const ids = docs.filter((d) => d.providerId && d.claimStatus === 'claimed').map((d) => d.providerId);
  const logos = new Map<string, string>();
  if (ids.length) {
    const providers: any[] = await Provider.find({ _id: { $in: ids }, hasLogoUpload: true, ...VISIBLE_PROVIDER }).select('slug logoUrl hasLogoUpload updatedAt').lean();
    for (const p of providers) { const u = publicLogoUrl(p); if (u) logos.set(String(p._id), u); }
  }
  const locations = await primaryLocations(docs, preferredArea);
  // Priority: a claimed listing's real Provider-uploaded logo, then a logo
  // found on the business's own website (fetchRegisterLogos.ts), else none
  // (the frontend shows initials) — never a competitor's image.
  return docs.map((d) => toListItem(d as never, (d.providerId && logos.get(String(d.providerId))) || d.logoUrl || null, locations.get(String(d._id)) ?? null));
}

/**
 * A register listing has no street address, only suburbs — so its map point
 * is one of its areas' suburb centroids (see SuburbGeo / geocodeSuburbs.ts),
 * batch-looked-up here rather than once per listing. When the caller is
 * showing results filtered to a state/suburb, that area is used (so a
 * wide-coverage listing's pin sits in the suburb the user actually searched,
 * not wherever the listing's first area happens to be) — otherwise the
 * first area.
 */
async function primaryLocations(docs: { _id: unknown; areas: { state: string; suburbSlug: string }[] }[], preferredArea?: { state?: string; suburbSlug?: string }): Promise<Map<string, { lat: number; lng: number }>> {
  const pick = (areas: { state: string; suburbSlug: string }[]) => {
    if (preferredArea?.state || preferredArea?.suburbSlug) {
      const match = areas.find((a) => (!preferredArea.state || a.state === preferredArea.state) && (!preferredArea.suburbSlug || a.suburbSlug === preferredArea.suburbSlug));
      if (match) return match;
    }
    return areas[0];
  };
  const pairs = new Map<string, { state: string; suburbSlug: string }>();
  for (const d of docs) { const a = pick(d.areas); if (a) pairs.set(`${a.state}|${a.suburbSlug}`, a); }
  const out = new Map<string, { lat: number; lng: number }>();
  if (!pairs.size) return out;
  const geos = await SuburbGeo.find({ $or: [...pairs.values()].map((a) => ({ state: a.state, suburbSlug: a.suburbSlug })) })
    .select('state suburbSlug location').lean();
  const bySuburb = new Map<string, { lat: number; lng: number }>();
  for (const g of geos) {
    if (!g.location?.coordinates) continue;
    const [lng, lat] = g.location.coordinates;
    bySuburb.set(`${g.state}|${g.suburbSlug}`, { lat, lng });
  }
  for (const d of docs) {
    const a = pick(d.areas);
    if (!a) continue;
    const loc = bySuburb.get(`${a.state}|${a.suburbSlug}`);
    if (loc) out.set(String(d._id), loc);
  }
  return out;
}

// ---------------------------------------------------------------
// GET /api/register/search?type=&state=&suburb=&category=&q=&page=&limit=
// ---------------------------------------------------------------
export async function searchRegister(req: Request, res: Response) {
  const type = parseType(req.query.type);
  if (!type) return res.status(400).json({ error: 'type must be "ndis" or "aged_care".' });

  const filter: FilterQuery<RegisterListingDoc> = { type };
  const state = parseState(req.query.state);
  const suburb = str(req.query.suburb).toLowerCase();

  if (str(req.query.state) && !state) return res.status(400).json({ error: 'Unknown state.' });
  if (suburb) {
    // A suburb slug is only meaningful within a state ("Richmond" exists in several).
    if (!state) return res.status(400).json({ error: 'suburb requires state.' });
    if (!/^[a-z0-9-]{1,80}$/.test(suburb)) return res.status(400).json({ error: 'Invalid suburb.' });
    filter.areas = { $elemMatch: { state, suburbSlug: suburb } } as never;
  } else if (state) {
    filter.states = state;
  }

  // Category counts describe the AREA, so they're computed before the
  // category / name filters narrow it down.
  const areaFilter: FilterQuery<RegisterListingDoc> = { ...filter };

  const category = str(req.query.category);
  if (category) {
    if (!(REGISTER_SUPPORT_CATEGORIES as readonly string[]).includes(category)) return res.status(400).json({ error: 'Unknown category.' });
    filter.supportCategories = category;
  }

  const language = str(req.query.language);
  if (language) {
    if (!LANGUAGE_NAMES.has(language)) return res.status(400).json({ error: 'Unknown language.' });
    filter.languages = language;
  }

  const q = str(req.query.q).toLowerCase().slice(0, 80);
  if (q) filter.nameLower = new RegExp(escapeRegex(q));

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || 12));

  const wantFacets = req.query.facets === '1';
  const [docs, total, facets] = await Promise.all([
    RegisterListing.find(filter)
      .select('type slug name states areaCount areas supportCategories website providerId claimStatus logoUrl abn')
      .sort({ nameLower: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    RegisterListing.countDocuments(filter),
    wantFacets
      ? RegisterListing.aggregate([
          { $match: areaFilter },
          { $unwind: '$supportCategories' },
          { $group: { _id: '$supportCategories', n: { $sum: 1 } } },
          { $sort: { n: -1, _id: 1 } },
        ])
      : Promise.resolve(null),
  ]);

  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    items: await listItemsWithLogos(docs, { state: state ?? undefined, suburbSlug: suburb || undefined }),
    page,
    limit,
    total,
    minIndexable: MIN_SUBURB_LISTINGS,
    ...(facets ? { categories: (facets as { _id: string; n: number }[]).map((f) => ({ category: f._id, count: f.n })) } : {}),
  });
}

// ---------------------------------------------------------------
// GET /api/register/language-counts?type=&language=
// How many register listings state this language on their own website, per state.
// Feeds the "public-register providers that mention this language" block on /language pages.
// ---------------------------------------------------------------
const LANGUAGE_NAMES = new Set<string>(LANGUAGE_TOPICS.map((t) => t.name));

export async function languageCounts(req: Request, res: Response) {
  const type = parseType(req.query.type);
  if (!type) return res.status(400).json({ error: 'type must be "ndis" or "aged_care".' });
  const language = str(req.query.language);
  if (!LANGUAGE_NAMES.has(language)) return res.status(400).json({ error: 'Unknown language.' });

  const [byState, total] = await Promise.all([
    RegisterListing.aggregate([{ $match: { type, languages: language } }, { $unwind: '$states' }, { $group: { _id: '$states', n: { $sum: 1 } } }]),
    RegisterListing.countDocuments({ type, languages: language }),
  ]);
  res.set('Cache-Control', 'public, max-age=600');
  res.json({ total, states: Object.fromEntries((byState as { _id: string; n: number }[]).map((s) => [s._id, s.n])) });
}

// ---------------------------------------------------------------
// What the registers say about one language, for the language pages' crawler HTML: for each register, how many
// listings mention it (their own website does), in which states and suburbs, and the broadest-coverage listings.
// The same filter as /language-counts, so the numbers match what the page shows.
// ---------------------------------------------------------------
export interface LanguageSnapshot {
  type: RegisterType;
  total: number;
  states: { state: string; n: number }[];
  suburbs: { state: string; slug: string; suburb: string; n: number }[];
  listings: { slug: string; name: string }[];
}
const languageSnapshotCache = new Map<string, { at: number; value: LanguageSnapshot[] }>();
const LANGUAGE_SNAPSHOT_TTL_MS = 30 * 60 * 1000;

export async function computeLanguageSnapshot(language: string): Promise<LanguageSnapshot[]> {
  const hit = languageSnapshotCache.get(language);
  if (hit && Date.now() - hit.at < LANGUAGE_SNAPSHOT_TTL_MS) return hit.value;
  const types: RegisterType[] = ['ndis', 'aged_care'];
  const value = await Promise.all(types.map(async (type): Promise<LanguageSnapshot> => {
    const match = { type, languages: language };
    const [total, states, suburbs, listings] = await Promise.all([
      RegisterListing.countDocuments(match),
      RegisterListing.aggregate([{ $match: match }, { $unwind: '$states' }, { $group: { _id: '$states', n: { $sum: 1 } } }, { $sort: { n: -1, _id: 1 } }]),
      RegisterListing.aggregate([
        { $match: match }, { $unwind: '$areas' },
        { $group: { _id: { state: '$areas.state', slug: '$areas.suburbSlug', suburb: '$areas.suburb' }, n: { $sum: 1 } } },
        { $sort: { n: -1, '_id.suburb': 1 } }, { $limit: 8 },
      ]),
      RegisterListing.find(match).sort({ areaCount: -1, nameLower: 1 }).limit(8).select('slug name').lean(),
    ]);
    return {
      type,
      total,
      states: (states as { _id: string; n: number }[]).map((s) => ({ state: s._id, n: s.n })),
      suburbs: (suburbs as { _id: { state: string; slug: string; suburb: string }; n: number }[]).map((s) => ({ ...s._id, n: s.n })),
      listings: (listings as { slug: string; name: string }[]).map((l) => ({ slug: l.slug, name: l.name })),
    };
  }));
  languageSnapshotCache.set(language, { at: Date.now(), value });
  return value;
}

// ---------------------------------------------------------------
// GET /api/register/category-counts?type=&category=
// How many register listings list this support category, per state. Feeds the
// "listed on the public register" block on the WordPress service pages.
// ---------------------------------------------------------------
export async function categoryCounts(req: Request, res: Response) {
  const type = parseType(req.query.type);
  if (!type) return res.status(400).json({ error: 'type must be "ndis" or "aged_care".' });
  const category = str(req.query.category);
  if (!(REGISTER_SUPPORT_CATEGORIES as readonly string[]).includes(category)) return res.status(400).json({ error: 'Unknown category.' });

  const [byState, total] = await Promise.all([
    RegisterListing.aggregate([{ $match: { type, supportCategories: category } }, { $unwind: '$states' }, { $group: { _id: '$states', n: { $sum: 1 } } }]),
    RegisterListing.countDocuments({ type, supportCategories: category }),
  ]);
  res.set('Cache-Control', 'public, max-age=600');
  res.json({ total, states: Object.fromEntries((byState as { _id: string; n: number }[]).map((s) => [s._id, s.n])) });
}

// ---------------------------------------------------------------
// GET /api/register/category-overview?type=&category=
// Everything a service page needs about one support category on the register:
// the total, listings per state, the suburbs with the most listings, and the
// listings with the widest service area. Facts only - counts and names from the
// register data, no ranking of quality. Cached: it aggregates over every area.
// ---------------------------------------------------------------
const overviewCache = new Map<string, { at: number; value: unknown }>();

export async function computeCategoryOverview(type: RegisterType, category: string) {
  const [byState, total, suburbs, widest] = await Promise.all([
    RegisterListing.aggregate([{ $match: { type, supportCategories: category } }, { $unwind: '$states' }, { $group: { _id: '$states', n: { $sum: 1 } } }]),
    RegisterListing.countDocuments({ type, supportCategories: category }),
    RegisterListing.aggregate([
      { $match: { type, supportCategories: category } },
      { $unwind: '$areas' },
      { $group: { _id: { state: '$areas.state', slug: '$areas.suburbSlug', suburb: '$areas.suburb' }, n: { $sum: 1 } } },
      { $sort: { n: -1, '_id.suburb': 1 } },
      { $limit: 24 },
    ]),
    RegisterListing.find({ type, supportCategories: category })
      .select('slug name states areaCount')
      .sort({ areaCount: -1, nameLower: 1 })
      .limit(10)
      .lean(),
  ]);
  return {
    total,
    states: Object.fromEntries((byState as { _id: string; n: number }[]).map((s) => [s._id, s.n])),
    topSuburbs: (suburbs as { _id: { state: string; slug: string; suburb: string }; n: number }[]).map((s) => ({ state: s._id.state, slug: s._id.slug, suburb: s._id.suburb, count: s.n })),
    widest: widest.map((w) => ({ slug: w.slug, name: w.name, states: w.states, areaCount: w.areaCount })),
  };
}

/** First listings (A-Z) for one support category, in the list-card shape; used by the crawler HTML of service pages. */
export async function categoryListings(type: RegisterType, category: string, limit = 12) {
  const docs = await RegisterListing.find({ type, supportCategories: category })
    .select('type slug name states areaCount areas supportCategories website providerId claimStatus logoUrl abn')
    .sort({ nameLower: 1, _id: 1 })
    .limit(limit)
    .lean();
  return listItemsWithLogos(docs);
}

export async function getCategoryOverview(req: Request, res: Response) {
  const type = parseType(req.query.type);
  if (!type) return res.status(400).json({ error: 'type must be "ndis" or "aged_care".' });
  const category = str(req.query.category);
  if (!(REGISTER_SUPPORT_CATEGORIES as readonly string[]).includes(category)) return res.status(400).json({ error: 'Unknown category.' });

  const key = `${type}|${category}`;
  const hit = overviewCache.get(key);
  if (hit && Date.now() - hit.at < HUB_TTL_MS) { res.set('Cache-Control', 'public, max-age=600'); return res.json(hit.value); }
  const value = await computeCategoryOverview(type, category);
  overviewCache.set(key, { at: Date.now(), value });
  res.set('Cache-Control', 'public, max-age=600');
  res.json(value);
}

// ---------------------------------------------------------------
// GET /api/register/service-suburbs?category=
// The full (uncapped) list of suburbs with genuine demand for one
// support category, combined across both registers — the real-data
// source for which /services/:service/:state/:suburb pages exist at
// all (see ServiceLocationPage.tsx and sitemap.controller.ts). Unlike
// computeCategoryOverview's topSuburbs (capped at 24, one register
// type), this returns every qualifying suburb so the page set is
// driven entirely by real listings, never a guessed or curated list.
// ---------------------------------------------------------------
async function computeCategorySuburbs(type: RegisterType, category: string) {
  const suburbs = await RegisterListing.aggregate([
    { $match: { type, supportCategories: category } },
    { $unwind: '$areas' },
    { $group: { _id: { state: '$areas.state', slug: '$areas.suburbSlug', suburb: '$areas.suburb' }, n: { $sum: 1 } } },
    { $sort: { n: -1, '_id.suburb': 1 } },
  ]);
  return (suburbs as { _id: { state: string; slug: string; suburb: string }; n: number }[]).map((s) => ({
    state: s._id.state, slug: s._id.slug, suburb: s._id.suburb, count: s.n,
  }));
}

const serviceSuburbsCache = new Map<string, { at: number; value: { state: string; slug: string; suburb: string; count: number }[] }>();
const SERVICE_SUBURBS_TTL_MS = 30 * 60 * 1000;

/** Real-demand suburbs for one category, NDIS and My Aged Care counts combined per suburb, filtered to MIN_SUBURB_LISTINGS. Cached: aggregates over every listing's areas, for both registers. */
export async function computeServiceSuburbs(category: string) {
  const hit = serviceSuburbsCache.get(category);
  if (hit && Date.now() - hit.at < SERVICE_SUBURBS_TTL_MS) return hit.value;

  const [ndis, agedCare] = await Promise.all([
    computeCategorySuburbs('ndis', category),
    computeCategorySuburbs('aged_care', category),
  ]);
  const merged = new Map<string, { state: string; slug: string; suburb: string; count: number }>();
  for (const s of [...ndis, ...agedCare]) {
    const key = `${s.state}|${s.slug}`;
    const existing = merged.get(key);
    merged.set(key, existing ? { ...existing, count: existing.count + s.count } : s);
  }
  const value = [...merged.values()].filter((s) => s.count >= MIN_SUBURB_LISTINGS).sort((a, b) => b.count - a.count);
  serviceSuburbsCache.set(category, { at: Date.now(), value });
  return value;
}

// ---------------------------------------------------------------
// Local detail for one service x suburb page (gap audit A2)
// GET /api/register/service-local?service=&state=&suburb=
// The closest suburbs with listings for the service, the nearest larger centre (for a suburb that is not indexed), and the languages
// listings here say they support. All from the register data and the suburb coordinates we already hold; nothing written by hand.
// ---------------------------------------------------------------
const NEARBY_MAX_KM = 60;
const TOWN_MAX_KM = 150;
const serviceLocalCache = new Map<string, { at: number; value: ServiceLocal }>();
const SERVICE_LOCAL_TTL_MS = 30 * 60 * 1000;

export interface ServiceLocal {
  nearby: { slug: string; suburb: string; count: number; km: number }[];
  nearestTown: { slug: string; suburb: string; count: number; km: number } | null;
  languages: { language: string; count: number }[];
  /** A summary of the register listings that cover this suburb and list this service. */
  profile: {
    total: number;
    ndis: number;
    agedCare: number;
    /** How many areas each listing covers: 5 or fewer, 6 to 25, 26 to 100, more than 100. */
    reach: { local: number; district: number; regional: number; wide: number };
    multiState: number;
    withWebsite: number;
    /** Listings that record this service as their only support. */
    specialists: number;
    /** The middle number of supports a listing here records. */
    typicalSupports: number;
    /** A few of the listings that cover 5 or fewer areas (the most local), by name. */
    localNames: string[];
    topSupports: { category: string; count: number }[];
  };
}

const kmBetween = (a: [number, number], b: [number, number]): number => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
};

export async function computeServiceLocal(service: string, state: string, suburbSlug: string): Promise<ServiceLocal> {
  const key = `${service}|${state}|${suburbSlug}`;
  const hit = serviceLocalCache.get(key);
  if (hit && Date.now() - hit.at < SERVICE_LOCAL_TTL_MS) return hit.value;

  const inState = (await computeServiceSuburbs(service)).filter((s) => s.state === state);
  const geos = await SuburbGeo.find({ state, suburbSlug: { $in: inState.map((s) => s.slug) }, failed: { $ne: true } }).select('suburbSlug location').lean();
  const pos = new Map<string, [number, number]>();
  for (const g of geos) if (g.location?.coordinates?.length === 2) pos.set(g.suburbSlug, g.location.coordinates as [number, number]);
  const here = pos.get(suburbSlug);

  const others = here
    ? inState
        .filter((s) => s.slug !== suburbSlug && pos.has(s.slug))
        .map((s) => ({ slug: s.slug, suburb: s.suburb, count: s.count, km: kmBetween(here, pos.get(s.slug)!) }))
        .sort((a, b) => a.km - b.km || b.count - a.count)
    : [];
  const nearby = others.filter((s) => s.km <= NEARBY_MAX_KM).slice(0, 6);
  const nearestTown = others.find((s) => s.km <= TOWN_MAX_KM && s.count >= MIN_INDEXABLE_SERVICE_LOCATION && isPriorityIndexSuburb(state, s.suburb)) ?? null;

  const langRows = await RegisterListing.aggregate([
    { $match: { areas: { $elemMatch: { state, suburbSlug } }, supportCategories: service, 'languages.0': { $exists: true } } },
    { $unwind: '$languages' },
    { $group: { _id: '$languages', n: { $sum: 1 } } },
    { $sort: { n: -1, _id: 1 } },
    { $limit: 5 },
  ]);
  const languages = (langRows as { _id: string; n: number }[]).map((r) => ({ language: r._id, count: r.n }));

  const docs = await RegisterListing.find({ areas: { $elemMatch: { state, suburbSlug } }, supportCategories: service })
    .select('type slug name nameLower areaCount states website supportCategories').lean();
  const profile: ServiceLocal['profile'] = {
    total: docs.length,
    ndis: docs.filter((d) => d.type === 'ndis').length,
    agedCare: docs.filter((d) => d.type === 'aged_care').length,
    reach: {
      local: docs.filter((d) => d.areaCount <= 5).length,
      district: docs.filter((d) => d.areaCount > 5 && d.areaCount <= 25).length,
      regional: docs.filter((d) => d.areaCount > 25 && d.areaCount <= 100).length,
      wide: docs.filter((d) => d.areaCount > 100).length,
    },
    multiState: docs.filter((d) => (d.states ?? []).length > 1).length,
    withWebsite: docs.filter((d) => !!d.website).length,
    specialists: docs.filter((d) => (d.supportCategories ?? []).length === 1).length,
    typicalSupports: (() => {
      const sizes = docs.map((d) => (d.supportCategories ?? []).length).sort((a, b) => a - b);
      return sizes.length ? sizes[Math.floor(sizes.length / 2)] : 0;
    })(),
    localNames: [...docs]
      .filter((d) => d.areaCount <= 5)
      .sort((a, b) => a.areaCount - b.areaCount || String(a.nameLower ?? '').localeCompare(String(b.nameLower ?? '')))
      .slice(0, 4)
      .map((d) => safeRegisterName(d.name, d.slug)),
    topSupports: [],
  };
  const supportCounts = new Map<string, number>();
  for (const d of docs) for (const c of d.supportCategories ?? []) if (c !== service) supportCounts.set(c, (supportCounts.get(c) ?? 0) + 1);
  profile.topSupports = [...supportCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 6).map(([category, count]) => ({ category, count }));

  const value: ServiceLocal = { nearby, nearestTown, languages, profile };
  serviceLocalCache.set(key, { at: Date.now(), value });
  return value;
}

export async function getServiceLocal(req: Request, res: Response) {
  const service = str(req.query.service);
  const state = parseState(req.query.state);
  const suburb = str(req.query.suburb).toLowerCase();
  if (!(REGISTER_SUPPORT_CATEGORIES as readonly string[]).includes(service) || !state || !/^[a-z0-9-]{1,80}$/.test(suburb)) {
    return res.status(400).json({ error: 'service, state and suburb are required.' });
  }
  res.set('Cache-Control', 'public, max-age=600');
  res.json(await computeServiceLocal(service, state, suburb));
}

export async function getServiceSuburbs(req: Request, res: Response) {
  const category = str(req.query.category);
  if (!(REGISTER_SUPPORT_CATEGORIES as readonly string[]).includes(category)) return res.status(400).json({ error: 'Unknown category.' });
  const all = await computeServiceSuburbs(category);
  // Optional ?state= keeps the answer to one state, for pages that only list suburbs in their own state.
  const state = parseState(req.query.state);
  const suburbs = state ? all.filter((s) => s.state === state) : all;
  // Optional cap for callers that only need the top few (e.g. a homepage
  // teaser) — omitting ?limit at all returns the full, uncapped list
  // (already sorted by count), which is what the sitemap, route
  // validation and any bulk export need.
  const rawLimit = Number(req.query.limit);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(5000, Math.floor(rawLimit)) : null;
  res.set('Cache-Control', 'public, max-age=600');
  res.json({ category, suburbs: limit ? suburbs.slice(0, limit) : suburbs });
}


// ---------------------------------------------------------------
// Supports listed in one suburb, across both registers
// GET /api/register/area-supports?state=&suburb=
// For each support category, how many register listings in this suburb list it (NDIS and My Aged Care combined). Feeds
// "Supports listed in <suburb>" on the service x suburb pages, and the links from a provider to the service pages
// that exist for its suburb. A category with at least MIN_SUBURB_LISTINGS listings has a service x suburb page.
// ---------------------------------------------------------------
const areaSupportsCache = new Map<string, { at: number; value: { category: string; count: number }[] }>();
const AREA_SUPPORTS_TTL_MS = 30 * 60 * 1000;

export async function computeAreaSupports(state: string, suburbSlug: string) {
  const key = `${state}|${suburbSlug}`;
  const hit = areaSupportsCache.get(key);
  if (hit && Date.now() - hit.at < AREA_SUPPORTS_TTL_MS) return hit.value;
  const rows = await RegisterListing.aggregate([
    { $match: { areas: { $elemMatch: { state, suburbSlug } } } },
    { $unwind: '$supportCategories' },
    { $group: { _id: '$supportCategories', n: { $sum: 1 } } },
    { $sort: { n: -1, _id: 1 } },
  ]);
  const value = (rows as { _id: string; n: number }[]).map((r) => ({ category: r._id, count: r.n }));
  areaSupportsCache.set(key, { at: Date.now(), value });
  return value;
}

export async function getAreaSupports(req: Request, res: Response) {
  const state = parseState(req.query.state);
  const suburb = str(req.query.suburb).toLowerCase();
  if (!state || !/^[a-z0-9-]{1,80}$/.test(suburb)) return res.status(400).json({ error: 'state and suburb are required.' });
  const categories = await computeAreaSupports(state, suburb);
  res.set('Cache-Control', 'public, max-age=600');
  res.json({ state, suburb, minPage: MIN_SUBURB_LISTINGS, minIndexed: MIN_INDEXABLE_SERVICE_LOCATION, categories });
}

/** Service x suburb pages that exist (and are indexed) for a listing's first area, for its own support categories. */
export async function serviceLinksFor(doc: { supportCategories: string[]; areas: { state: string; suburbSlug: string; suburb: string }[] }) {
  const first = doc.areas[0];
  if (!first) return [];
  const supports = await computeAreaSupports(first.state, first.suburbSlug);
  const counts = new Map(supports.map((s) => [s.category, s.count]));
  return doc.supportCategories
    // Only the supports that have a service x suburb page at all (REAL_SERVICES), and only the indexed ones.
    .filter((c) => (REAL_SERVICES as readonly string[]).includes(c) && (counts.get(c) ?? 0) >= MIN_INDEXABLE_SERVICE_LOCATION)
    .slice(0, 8)
    .map((c) => ({
      service: c,
      slug: c.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      state: first.state,
      suburbSlug: first.suburbSlug,
      suburb: first.suburb,
      count: counts.get(c) ?? 0,
    }));
}

// ---------------------------------------------------------------
// GET /api/register/hub?type=
// State counts, category counts and the suburbs that have enough real
// listings to deserve their own page. Computed from the collection and
// cached — it's aggregated over every listing's areas.
// ---------------------------------------------------------------
const HUB_TTL_MS = 30 * 60 * 1000;
const hubCache = new Map<RegisterType, { at: number; value: unknown }>();

export async function computeHub(type: RegisterType) {
  const [states, categories, suburbs, total, latest] = await Promise.all([
    RegisterListing.aggregate([{ $match: { type } }, { $unwind: '$states' }, { $group: { _id: '$states', n: { $sum: 1 } } }]),
    RegisterListing.aggregate([{ $match: { type } }, { $unwind: '$supportCategories' }, { $group: { _id: '$supportCategories', n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
    RegisterListing.aggregate([
      { $match: { type } },
      { $unwind: '$areas' },
      { $group: { _id: { state: '$areas.state', slug: '$areas.suburbSlug', suburb: '$areas.suburb' }, n: { $sum: 1 } } },
      { $match: { n: { $gte: MIN_SUBURB_LISTINGS } } },
      // Ties are broken by name, so "the top forty" is the same list every time it is computed.
      { $sort: { n: -1, '_id.state': 1, '_id.suburb': 1 } },
    ]),
    RegisterListing.countDocuments({ type }),
    RegisterListing.aggregate([{ $match: { type } }, { $group: { _id: null, at: { $max: { $ifNull: ['$lastSeenAt', '$importedAt'] } } } }]),
  ]);

  const importedAt = (latest as { at?: Date }[])[0]?.at;
  return {
    total,
    /** When the register data was last imported (ISO), or null when nothing is loaded. */
    asOf: importedAt ? new Date(importedAt).toISOString() : null,
    states: Object.fromEntries((states as { _id: string; n: number }[]).map((s) => [s._id, s.n])),
    categories: (categories as { _id: string; n: number }[]).map((c) => ({ category: c._id, count: c.n })),
    suburbs: (suburbs as { _id: { state: string; slug: string; suburb: string }; n: number }[]).map((s) => ({
      state: s._id.state, slug: s._id.slug, suburb: s._id.suburb, count: s.n,
    })),
  };
}

export async function getRegisterHub(req: Request, res: Response) {
  const type = parseType(req.query.type);
  if (!type) return res.status(400).json({ error: 'type must be "ndis" or "aged_care".' });

  const cached = hubCache.get(type);
  if (cached && Date.now() - cached.at < HUB_TTL_MS) {
    res.set('Cache-Control', 'public, max-age=600');
    return res.json(cached.value);
  }
  const value = await computeHub(type);
  hubCache.set(type, { at: Date.now(), value });
  res.set('Cache-Control', 'public, max-age=600');
  res.json(value);
}

// ---------------------------------------------------------------
// GET /api/register/:type/:slug
// ---------------------------------------------------------------
export async function getRegisterListing(req: Request, res: Response) {
  const type = parseType(req.params.type);
  const slug = str(req.params.slug).toLowerCase();
  if (!type || !/^[a-z0-9][a-z0-9-]{0,200}$/.test(slug)) return res.status(404).json({ error: 'Not found.' });

  const doc = await RegisterListing.findOne({ type, slug }).lean();
  if (!doc) return res.status(404).json({ error: 'Not found.' });

  // Genuinely related listings for internal linking: other providers on
  // the register in this provider's first area.
  const first = doc.areas[0];
  const related = first
    ? await RegisterListing.find({ type, areas: { $elemMatch: { state: first.state, suburbSlug: first.suburbSlug } }, _id: { $ne: doc._id } })
        .select('type slug name states areaCount areas supportCategories website logoUrl abn')
        .sort({ nameLower: 1 })
        .limit(6)
        .lean()
    : [];

  // Same priority as listItemsWithLogos: a claimed listing's real
  // Provider-uploaded logo first, then one found on the business's own
  // website, else none.
  let logoUrl: string | null = doc.logoUrl ?? null;
  if (doc.providerId && doc.claimStatus === 'claimed') {
    const p: any = await Provider.findOne({ _id: doc.providerId, hasLogoUpload: true, ...VISIBLE_PROVIDER }).select('slug logoUrl hasLogoUpload updatedAt').lean();
    if (p) logoUrl = publicLogoUrl(p) || logoUrl;
  }

  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    type: doc.type,
    slug: doc.slug,
    name: safeRegisterName(doc.name, doc.slug),
    /** When this listing was last present in a register import (ISO). */
    asOf: new Date(doc.lastSeenAt ?? doc.importedAt).toISOString(),
    states: doc.states,
    areaCount: doc.areaCount,
    areas: doc.areas.slice(0, AREAS_IN_DETAIL),
    website: doc.website ?? null,
    services: doc.services,
    supportCategories: doc.supportCategories,
    claimStatus: doc.claimStatus,
    logoUrl,
    abn: doc.abn ?? null,
    location: (await primaryLocations([doc as never])).get(String(doc._id)) ?? null,
    related: await listItemsWithLogos(related as never[], first ? { state: first.state, suburbSlug: first.suburbSlug } : undefined),
    serviceLinks: await serviceLinksFor(doc as never),
  });
}

// ---------------------------------------------------------------
// POST /api/register/:type/:slug/claim-request
// ---------------------------------------------------------------
const CLAIM_ROLES = ['owner', 'director', 'manager', 'staff', 'other'];
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 8; // claim requests per IP per hour
const RATE_WINDOW_MS = 60 * 60 * 1000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = rateBuckets.get(ip);
  if (!b || b.resetAt < now) { rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS }); return false; }
  b.count++;
  return b.count > RATE_LIMIT;
}
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export async function submitClaimRequest(req: Request, res: Response) {
  const type = parseType(req.params.type);
  const slug = str(req.params.slug).toLowerCase();
  if (!type || !slug) return res.status(404).json({ error: 'Not found.' });

  const body = (req.body ?? {}) as Record<string, unknown>;
  // Honeypot: a real person never sees or fills this field.
  if (str(body.website_url)) return res.json({ ok: true });

  if (rateLimited(req.ip ?? 'unknown')) return res.status(429).json({ error: 'Too many requests. Please try again later.' });

  const name = str(body.name).slice(0, 100);
  const email = str(body.email).toLowerCase().slice(0, 160);
  const phone = str(body.phone).slice(0, 30);
  const role = str(body.role).toLowerCase();
  const message = str(body.message).slice(0, 1000);

  if (name.length < 2) return res.status(400).json({ error: 'Please enter your name.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (!CLAIM_ROLES.includes(role)) return res.status(400).json({ error: 'Please choose your role at this business.' });

  const listing = await RegisterListing.findOne({ type, slug }).select('_id name type slug claimStatus').lean();
  if (!listing) return res.status(404).json({ error: 'Listing not found.' });
  if (listing.claimStatus === 'claimed') return res.status(409).json({ error: 'This listing has already been claimed.' });
  const listingName = safeRegisterName(listing.name, listing.slug);

  // The same person asking twice about the same listing is one request.
  const duplicate = await ClaimRequest.findOne({ listingId: listing._id, email, status: 'new' }).select('_id').lean();
  if (!duplicate) {
    await ClaimRequest.create({ listingId: listing._id, type, slug, listingName, name, email, phone: phone || undefined, role, message: message || undefined });
    await RegisterListing.updateOne({ _id: listing._id, claimStatus: 'unclaimed' }, { $set: { claimStatus: 'requested' } });

    const notify = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL;
    if (notify) {
      EmailService.sendAdminNotification(
        notify,
        `Claim request: ${listingName}`,
        `${escapeHtml(name)} (${escapeHtml(role)}) asked to claim the ${type === 'ndis' ? 'NDIS' : 'aged care'} register listing for <strong>${escapeHtml(listingName)}</strong>.<br>` +
          `Email: ${escapeHtml(email)}${phone ? `<br>Phone: ${escapeHtml(phone)}` : ''}${message ? `<br>Message: ${escapeHtml(message)}` : ''}<br>` +
          'Verify against the business’s own website or ABN before linking it to an account.'
      ).catch(() => {});
    }
  }

  res.status(201).json({ ok: true });
}
