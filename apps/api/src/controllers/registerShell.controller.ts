import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import type { Request, Response } from 'express';
import RegisterListing from '../models/RegisterListing.js';
import Provider from '../models/Provider.js';
import Worker from '../models/Worker.js';
import WorkerReview from '../models/WorkerReview.js';
import { MIN_INDEXABLE_SERVICE_LOCATION, MIN_SUBURB_LISTINGS, REAL_SERVICES, STATE_CODES, safeRegisterName, type RegisterType } from '../services/registerNormalise.js';
import { findProvidersPaidFirst } from '../services/providerPriority.js';
import { categoryListings, computeAreaSupports, computeCategoryOverview, computeHub, computeServiceSuburbs, serviceLinksFor } from './register.controller.js';
import { workersForService, workersInArea } from './workersPublic.controller.js';
import { MIN_INDEXABLE_PROVIDERS, VISIBLE_PROVIDER, areaRows, conditionRows, publicLogoUrl } from './providersPublic.controller.js';
import { serviceEditorialFor } from '@soldirectory/service-content';
import {
  CONDITION_TOPICS, EDITORIAL_BLOG_POSTS, FUNDING_TOPICS, GUIDE_DOCS, LANGUAGE_TOPICS, conditionShellEditorial, fundingShellEditorial, languageShellEditorial,
  relatedArticles,
  relatedToArticle,
  hubCopy,
  linkParagraph,
  linkScopeFor,
  newLinkState,
  COORDINATOR_PAGE,
  DIRECTORY_GUIDANCE,
  DIRECTORY_PAGE_DESCRIPTION,
  DIRECTORY_PAGE_HEADING,
  DIRECTORY_PAGE_SUBTITLE,
  DIRECTORY_PAGE_TITLE,
  DIRECTORY_PAGE_UPDATED,
  DIRECTORY_SUPPORTS,
  PROVIDER_PAGE_DESCRIPTION,
  PROVIDER_PAGE_UPDATED,
  STATE_CENTRES,
  WORKER_HERO_CHECKS,
  WORKER_PAGE_DESCRIPTION,
  WORKER_PAGE_TITLE,
  WORKER_PAGE_UPDATED,
  type EditorialBlogPost,
  type Topic, type ShellEditorial,
} from '@soldirectory/topic-content';

/**
 * Crawler-readable HTML for the public-register pages.
 *
 * The web app is a client-rendered SPA served as static files, so a
 * crawler that doesn't run JavaScript would see an empty <div id="root">
 * for all ~26,000 register pages. nginx sends /ndis-providers/* and
 * /aged-care-providers/* here instead: we return the SAME built
 * index.html the SPA uses, with this page's <title>, description,
 * canonical, robots, JSON-LD and a plain-HTML copy of its main content
 * (headline, facts, links to related pages) filled in. When the browser
 * runs the app it replaces #root, so people see the normal page; the
 * content is the same one, not something shown only to bots.
 *
 * The same shell also serves WordPress service pages (/services/:slug, content fetched
 * from WordPress), the public provider profile (/directory/:slug)
 * and the independent-worker pages (/independent-workers/find and
 * /independent-workers/:slug).
 *
 * Every rule here (titles, noindex, thin-page threshold) mirrors the
 * client pages in apps/web/src/pages/public (register/*, ProviderPublicPage,
 * WorkerFinder, WorkerPublicProfile) — keep them in step.
 */

const KINDS = {
  'ndis-providers': {
    type: 'ndis' as RegisterType, label: 'NDIS', plain: 'NDIS',
    register: 'NDIS Commission register of registered providers',
    officialUrl: 'https://www.ndiscommission.gov.au/provider-registration/find-registered-provider',
    officialName: 'NDIS Commission’s “Find a registered provider”',
    listedAs: 'listed as an NDIS registered provider',
  },
  'aged-care-providers': {
    type: 'aged_care' as RegisterType, label: 'Aged care', plain: 'aged care',
    register: 'My Aged Care provider register',
    officialUrl: 'https://www.myagedcare.gov.au/find-a-provider',
    officialName: 'My Aged Care “Find a provider”',
    listedAs: 'listed as an approved aged care provider',
  },
};

const registerName = (listing: { name?: unknown; slug: string }) => safeRegisterName(listing.name, listing.slug);
type KindPath = keyof typeof KINDS;

const STATE_NAMES: Record<string, string> = {
  NSW: 'New South Wales', VIC: 'Victoria', QLD: 'Queensland', WA: 'Western Australia',
  SA: 'South Australia', TAS: 'Tasmania', ACT: 'Australian Capital Territory', NT: 'Northern Territory',
};
const PAGE_SIZE = 12;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,200}$/;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const fmt = (n: number) => n.toLocaleString('en-AU');
const trimTo = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…`);
const seoTitle = (text: string) => `${trimTo(text, 50)} | SolDirectory`;

function siteUrl(req: Request): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = (req.get('x-forwarded-proto') || req.protocol).split(',')[0];
  return `${proto}://${req.get('host')}`;
}

// --- the built index.html, re-read when it changes on disk (a redeploy) ---
let shellCache: { html: string; mtimeMs: number; checkedAt: number } | null = null;
async function loadShell(): Promise<string> {
  const file = path.join(process.env.WEB_DIST_DIR || path.resolve(process.cwd(), '../web/dist'), 'index.html');
  if (shellCache && Date.now() - shellCache.checkedAt < 30_000) return shellCache.html;
  const stat = await fs.stat(file);
  if (!shellCache || stat.mtimeMs !== shellCache.mtimeMs) {
    shellCache = { html: await fs.readFile(file, 'utf8'), mtimeMs: stat.mtimeMs, checkedAt: Date.now() };
  } else {
    shellCache.checkedAt = Date.now();
  }
  return shellCache.html;
}

/** Pages the web build wrote as static HTML at <dist>/<slug>/index.html (apps/web/scripts/prerender.mjs). */
async function prerenderedPage(slug: string): Promise<string | null> {
  if (!SLUG_RE.test(slug)) return null;
  const file = path.join(process.env.WEB_DIST_DIR || path.resolve(process.cwd(), '../web/dist'), slug, 'index.html');
  try {
    return await fs.readFile(file, 'utf8');
  } catch {
    return null;
  }
}

/** "12 October 2026", in Australian time, so the page and its crawler HTML always print the same date. */
const registerDateLabel = (iso: string) => new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Sydney' });
/** The same day as YYYY-MM-DD (Australian time), for datetime attributes and dateModified. */
const registerDateIso = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' });

// --- hub numbers, cached: they're aggregated over every listing ---
const hubCache = new Map<RegisterType, { at: number; value: Awaited<ReturnType<typeof computeHub>> }>();
async function hubFor(type: RegisterType) {
  const hit = hubCache.get(type);
  if (hit && Date.now() - hit.at < 30 * 60 * 1000) return hit.value;
  const value = await computeHub(type);
  hubCache.set(type, { at: Date.now(), value });
  return value;
}

interface Page {
  status: number;
  title: string;
  description: string;
  canonical: string; // path
  noindex: boolean;
  jsonLd: { id: string; data: Record<string, unknown> }[];
  body: string;
  ogImage?: string; // absolute URL
  ogImageAlt?: string; // what the share image shows; the site's default image has its own
  ogType?: 'website' | 'article';
  /** For articles: ISO dates and section, written as article:* tags in link previews. */
  articleTimes?: { published?: string; modified?: string; section?: string };
}

/** Shared page copy writes links as [label](/path); this turns them into plain anchors (the web app renders the same markup). */
const inline = (text: string) => esc(text).replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, (_m, label: string, href: string) => `<a href="${href}">${label}</a>`);

// External links carry the same rel as the visible pages' (noopener noreferrer); internal links need none.
const li = (href: string, text: string, extra = '') => `<li><a href="${esc(href)}"${/^https?:\/\//i.test(href) ? ' rel="noopener noreferrer"' : ''}>${esc(text)}</a>${extra ? ` ${esc(extra)}` : ''}</li>`;

function breadcrumbLd(site: string, crumbs: { name: string; path: string }[]) {
  return {
    id: 'register-breadcrumbs',
    data: {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${site}${c.path}` })),
    },
  };
}

function notFound(): Page {
  return {
    status: 404, title: 'Provider not found | SolDirectory', description: 'This listing could not be found.',
    canonical: '', noindex: true, jsonLd: [], body: '<h1>Page not found</h1><p><a href="/ndis-providers">Browse NDIS providers</a></p>',
  };
}

async function hubPage(site: string, kindPath: KindPath): Promise<Page> {
  const kind = KINDS[kindPath];
  const hub = await hubFor(kind.type);
  const base = `/${kindPath}`;
  return {
    status: 200,
    title: kind.type === 'ndis'
      ? 'NDIS provider register Australia | SolDirectory'
      : 'Aged care provider register Australia | SolDirectory',
    description: trimTo(`Browse ${fmt(hub.total)} ${kind.plain} providers listed on the public register, by state and suburb. See the supports listed, then get matched for free.`, 158),
    canonical: base,
    noindex: hub.total === 0,
    jsonLd: [
      breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: `${kind.label} providers`, path: base }]),
      {
        id: 'register-page',
        data: {
          '@type': 'WebPage', name: `${kind.label} providers in Australia`, url: `${site}${base}`, inLanguage: 'en-AU',
          ...(hub.asOf ? { dateModified: registerDateIso(hub.asOf) } : {}),
          isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: site },
          publisher: { '@type': 'Organization', name: 'SolDirectory', url: `${site}/` },
        },
      },
    ],
    body:
      `<h1>${esc(kind.label)} providers in Australia</h1>` +
      `<p>Browse providers listed on the ${esc(kind.register)}, by state and suburb. See the supports each one lists and where it operates, then get matched with providers who have confirmed they can start.</p>` +
      `<p>${fmt(hub.total)} ${esc(kind.plain)} providers are listed on the ${esc(kind.register)}. Browse by state or suburb.</p>` +
      `<h2>Browse ${esc(kind.plain)} providers by state</h2><ul>${STATE_CODES.filter((c) => hub.states[c]).map((c) => li(`${base}/${c.toLowerCase()}`, `${kind.label} providers in ${STATE_NAMES[c]}`, `(${fmt(hub.states[c])})`)).join('')}</ul>` +
      `<h2>Suburbs with the most listings</h2><ul>${hub.suburbs.slice(0, 40).map((s) => li(`${base}/${s.state.toLowerCase()}/${s.slug}`, `${s.suburb}, ${s.state}`, `(${fmt(s.count)})`)).join('')}</ul>` +
      `<h2>What “listed on the register” means</h2><p>Each provider here appears on the ${esc(kind.register)}. That tells you what the provider was listed for and where — it is not a recommendation, a quality rating or a statement about availability. SolDirectory separately asks providers to confirm each week whether they can take on new people; that is what “Get matched” uses.</p>` +
      `<p><strong>Check before you engage.</strong> Listings are based on ${esc(kind.register)} data and may be out of date. To confirm a provider’s current status, search the official register at <a href="${esc(kind.officialUrl)}">${esc(kind.officialName)}</a>. A listing does not show whether a provider has capacity to take on new people.</p>` +
      (hub.asOf ? `<p>Register data last imported on <time datetime="${esc(registerDateIso(hub.asOf))}">${esc(registerDateLabel(hub.asOf))}</time>.</p>` : ''),
  };
}

async function listPage(site: string, kindPath: KindPath, stateSlug: string, suburbSlug: string | null, page: number, filtered: boolean): Promise<Page> {
  const kind = KINDS[kindPath];
  const code = stateSlug.toUpperCase();
  if (!STATE_CODES.includes(code as never)) return notFound();
  if (suburbSlug && !SLUG_RE.test(suburbSlug)) return notFound();

  const base = `/${kindPath}/${stateSlug}${suburbSlug ? `/${suburbSlug}` : ''}`;
  const filter = suburbSlug
    ? { type: kind.type, areas: { $elemMatch: { state: code, suburbSlug } } }
    : { type: kind.type, states: code };

  const [docs, total] = await Promise.all([
    RegisterListing.find(filter).select('slug name areas supportCategories').sort({ nameLower: 1, _id: 1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    RegisterListing.countDocuments(filter),
  ]);
  if (suburbSlug && total === 0) return { ...notFound(), title: `${kind.label} providers | SolDirectory` };

  // Same suburb spelling the register uses, taken from a real listing.
  const suburbName = suburbSlug
    ? docs[0]?.areas.find((a) => a.state === code && a.suburbSlug === suburbSlug)?.suburb
      ?? suburbSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : null;
  const areaName = suburbName ? `${suburbName}, ${code}` : STATE_NAMES[code];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const noindex = filtered || total === 0 || (!!suburbSlug && total < MIN_SUBURB_LISTINGS);

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: `${kind.label} providers`, path: `/${kindPath}` },
    { name: STATE_NAMES[code], path: `/${kindPath}/${stateSlug}` },
    ...(suburbSlug ? [{ name: suburbName as string, path: base }] : []),
  ];

  // The visible page (apps/web/src/pages/public/register/RegisterListPage.tsx) shows the supports listed in the area with
  // their counts, and more suburbs in the state. The crawler HTML says the same things, from the same data.
  const facets = (await RegisterListing.aggregate([
    { $match: filter },
    { $unwind: '$supportCategories' },
    { $group: { _id: '$supportCategories', n: { $sum: 1 } } },
    { $sort: { n: -1, _id: 1 } },
  ])) as { _id: string; n: number }[];
  const topFacets = facets.slice(0, 3);
  const hubForKind = await hubFor(kind.type);
  const nearby = hubForKind.suburbs.filter((s) => s.state === code && s.slug !== suburbSlug).slice(0, suburbSlug ? 18 : 40);
  const extra = nearby.length
    ? `<h2>${suburbSlug ? `More suburbs in ${esc(STATE_NAMES[code])}` : `Suburbs in ${esc(STATE_NAMES[code])} with the most listings`}</h2>` +
      `<ul>${nearby.map((s) => li(`/${kindPath}/${stateSlug}/${s.slug}`, s.suburb, `(${fmt(s.count)})`)).join('')}</ul>`
    : '';
  const supportsHtml = facets.length && !filtered
    ? `<h2>Supports listed in ${esc(areaName)}</h2><p>Each number is how many listings in this area list that support.</p>` +
      `<ul>${facets.slice(0, 12).map((f) => li(`${base}?category=${encodeURIComponent(f._id)}`, f._id, `(${fmt(f.n)})`)).join('')}</ul>`
    : '';
  let workersHtml = '';
  if (!filtered && total > 0) {
    try {
      const w = await workersInArea(code, suburbName ?? undefined, 6);
      if (w.total > 0) {
        workersHtml = `<h2>Independent support workers in ${esc(areaName)}</h2><p>${fmt(w.total)} independent ${w.total === 1 ? 'worker has' : 'workers have'} published a public profile for ${esc(areaName)}.</p><ul>${w.items.map((x) => li(`/independent-workers/${x.slug}`, `${x.firstName}${x.lastInitial ? ` ${x.lastInitial}.` : ''}`, [x.role, [x.suburb, x.state].filter(Boolean).join(', '), x.services.slice(0, 4).join(', ')].filter(Boolean).join(' - '))).join('')}</ul>`;
      }
    } catch { workersHtml = ''; }
  }
  const pager =
    (page > 1 ? `<a rel="prev" href="${esc(page === 2 ? base : `${base}?page=${page - 1}`)}">Previous page</a> ` : '') +
    (page < totalPages ? `<a rel="next" href="${esc(`${base}?page=${page + 1}`)}">Next page</a>` : '');

  return {
    status: 200,
    // "Australian Capital Territory" would push the title past what search results show, so the title says the ACT.
    title: `${kind.label} providers in ${areaName === 'Australian Capital Territory' ? 'the ACT' : areaName}${page > 1 ? ` (page ${page})` : ''} | SolDirectory`,
    description: trimTo(`${fmt(total)} ${kind.plain} ${total === 1 ? 'provider is' : 'providers are'} listed on the ${kind.register} for ${areaName}. See the supports listed and service areas, then get matched for free.`, 158),
    canonical: page > 1 && !filtered ? `${base}?page=${page}` : base,
    noindex,
    jsonLd: [
      breadcrumbLd(site, crumbs),
      {
        id: 'register-area',
        data: {
          '@type': 'CollectionPage', name: `${kind.label} providers in ${areaName}`, url: `${site}${base}`, inLanguage: 'en-AU',
          isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: site },
          mainEntity: {
            '@type': 'ItemList', numberOfItems: total,
            itemListElement: docs.map((d, i) => ({ '@type': 'ListItem', position: (page - 1) * PAGE_SIZE + i + 1, name: registerName(d), url: `${site}/${kindPath}/${d.slug}` })),
          },
        },
      },
    ],
    body:
      `<nav aria-label="Breadcrumb">${crumbs.map((c, i) => (i < crumbs.length - 1 ? `<a href="${esc(c.path)}">${esc(c.name)}</a>` : esc(c.name))).join(' / ')}</nav>` +
      `<h1>${esc(kind.label)} providers in ${esc(areaName)}</h1>` +
      `<p>${fmt(total)} ${total === 1 ? 'provider is' : 'providers are'} listed on the ${esc(kind.register)} for ${esc(areaName)}.` +
      `${topFacets.length && !filtered ? ` The supports listed most often here are ${topFacets.map((f) => `${esc(f._id.toLowerCase())} (${fmt(f.n)})`).join(', ')}.` : ''}</p>` +
      supportsHtml +
      `<ul>${docs.map((d) => li(`/${kindPath}/${d.slug}`, registerName(d), d.supportCategories.length ? `– ${d.supportCategories.slice(0, 3).join(', ')}` : '')).join('')}</ul>` +
      `<p>${pager}</p>${workersHtml}${extra}` +
      `<p><strong>Check before you engage.</strong> Listings are based on ${esc(kind.register)} data and may be out of date. To confirm a provider’s current status, search the official register at <a href="${esc(kind.officialUrl)}">${esc(kind.officialName)}</a>. A listing does not show whether a provider has capacity to take on new people.</p>`,
  };
}

async function providerPage(site: string, kindPath: KindPath, slug: string): Promise<Page> {
  const kind = KINDS[kindPath];
  if (!SLUG_RE.test(slug)) return notFound();
  const doc = await RegisterListing.findOne({ type: kind.type, slug }).lean();
  if (!doc) return notFound();

  const p = `/${kindPath}/${slug}`;
  const first = doc.areas[0];
  const where = first ? `${first.suburb}, ${first.state}` : 'Australia';
  const shown = doc.areas.slice(0, 2).map((a) => `${a.suburb}, ${a.state}`);
  const more = doc.areaCount - shown.length;
  const thin = doc.services.length === 0;
  const name = registerName(doc);
  const areaLabel = (a: { suburb: string; state: string }) => `${a.suburb}, ${a.state}`;

  // What the visible page shows (apps/web/src/pages/public/register/RegisterProviderPage.tsx), from the same data:
  // other providers in the first area, and the service pages that exist (and are indexed) for it.
  const [related, serviceLinks] = await Promise.all([
    first
      ? RegisterListing.find({ type: kind.type, areas: { $elemMatch: { state: first.state, suburbSlug: first.suburbSlug } }, _id: { $ne: doc._id } })
          .select('slug name').sort({ nameLower: 1 }).limit(6).lean()
      : Promise.resolve([] as { slug: string; name: string }[]),
    serviceLinksFor(doc as never),
  ]);

  const byState = new Map<string, typeof doc.areas>();
  for (const a of doc.areas.slice(0, 120)) byState.set(a.state, [...(byState.get(a.state) ?? []), a]);
  const areasHtml = byState.size
    ? `<h2>Where ${esc(name)} is listed</h2>` +
      [...byState.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([code, areas]) =>
        `<h3>${esc(STATE_NAMES[code] ?? code)}</h3><ul>${areas.map((a) => li(`/${kindPath}/${a.state.toLowerCase()}/${a.suburbSlug}`, a.suburb)).join('')}</ul>`).join('') +
      (doc.areaCount > Math.min(doc.areas.length, 120) ? `<p>Showing ${fmt(Math.min(doc.areas.length, 120))} of ${fmt(doc.areaCount)} areas.</p>` : '')
    : '';
  const host = doc.website ? doc.website.replace(/^https?:\/\//, '') : '';
  const glance =
    `<ul><li>Register: ${esc(kind.label)} provider register</li>` +
    `<li>${doc.states.length === 1 ? 'State' : 'States'}: ${esc(doc.states.map((s) => STATE_NAMES[s] ?? s).join(', '))}</li>` +
    `<li>Areas listed: ${fmt(doc.areaCount)}</li>` +
    `<li>Website: ${doc.website ? `<a href="${esc(doc.website)}" rel="nofollow noopener noreferrer">${esc(host)}</a>` : 'Not listed'}</li>` +
    `${doc.abn ? `<li>ABN: ${esc(doc.abn)}</li>` : ''}</ul>`;

  return {
    status: 200,
    title: providerTitle(name, kind.label, where),
    description: trimTo(
      `${name} is ${kind.listedAs}${shown.length ? ` for ${shown.join(' and ')}${more > 0 ? ` and ${more} more area${more === 1 ? '' : 's'}` : ''}` : ''}. See the supports listed, where it operates and how to check its current status.`,
      158
    ),
    canonical: p,
    noindex: thin,
    jsonLd: [
      {
        id: 'register-provider',
        data: {
          '@type': 'Organization',
          name,
          ...(doc.website ? { url: doc.website } : {}),
          areaServed: doc.states.map((s) => ({ '@type': 'AdministrativeArea', name: STATE_NAMES[s] ?? s })),
        },
      },
      breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: `${kind.label} providers`, path: `/${kindPath}` }, { name, path: p }]),
    ],
    body:
      `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/${kindPath}">${esc(kind.label)} providers</a> / ${esc(name)}</nav>` +
      `<h1>${esc(name)}</h1>` +
      `<p>${esc(name)} is ${esc(kind.listedAs)}${doc.areas.length ? ` for ${esc(doc.areas.slice(0, 3).map(areaLabel).join(', '))}${doc.areaCount > 3 ? ` and ${fmt(doc.areaCount - 3)} more area${doc.areaCount - 3 === 1 ? '' : 's'}` : ''}` : ''}.</p>` +
      glance +
      (doc.services.length ? `<h2>Supports listed</h2><ul>${doc.services.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : '') +
      areasHtml +
      (serviceLinks.length
        ? `<h2>Supports in ${esc(first!.suburb)}</h2><p>Where this provider lists these supports for ${esc(where)}, there is a page for the support in that suburb.</p>` +
          `<ul>${serviceLinks.map((l) => li(`/services/${l.slug}/${l.state.toLowerCase()}/${l.suburbSlug}`, `${l.service} in ${l.suburb}`, `(${fmt(l.count)} listings)`)).join('')}</ul>`
        : '') +
      `<h2>Before you engage a provider</h2><ul>` +
      `<li>Confirm the provider’s current status on <a href="${esc(kind.officialUrl)}">${esc(kind.officialName)}</a>.</li>` +
      `<li>Ask whether they have capacity to start, and when. This listing doesn’t say.</li>` +
      `<li>Ask how they screen and train their workers, and what they charge — see our <a href="/guides/choosing-a-provider">guide to choosing a provider</a>.</li></ul>` +
      `<p><strong>Check before you engage.</strong> Listings are based on ${esc(kind.register)} data and may be out of date. To confirm a provider’s current status, search the official register at <a href="${esc(kind.officialUrl)}">${esc(kind.officialName)}</a>. A listing does not show whether a provider has capacity to take on new people.</p>` +
      (related.length ? `<h2>Other providers listed in ${esc(where)}</h2><ul>${related.map((r) => li(`/${kindPath}/${r.slug}`, registerName(r))).join('')}</ul>` : '') +
      `<p><a href="/${kindPath}">Browse the full register</a> · <a href="/find-a-provider">Compare provider profiles</a> · <a href="/locations">Browse by location</a></p>`,
  };
}

/** "<name> | NDIS provider in <where>" within ~62 characters: only the business name gives way, so a long name can't push the title past what search results show. Mirrors the title in the web app's RegisterProviderPage — keep them in step. */
function providerTitle(name: string, label: string, where: string): string {
  const suffix = ` | ${label} provider in ${where}`;
  return `${trimTo(name, Math.max(20, 62 - suffix.length))}${suffix}`;
}

// Pages with no photo of their own still get a share card, from an image the site already uses.
const DEFAULT_SHARE_IMAGE = '/images/share-default.jpg';
const DEFAULT_SHARE_IMAGE_ALT = 'Two people holding hands, a moment of care and support';
const DEFAULT_SHARE_IMAGE_SIZE = { width: 1200, height: 630 };
// Blog covers are cut to this size by apps/web/scripts/build-blog-covers.mjs.
const BLOG_COVER_SIZE = { width: 1200, height: 675 };

/**
 * "Helpful reading" for crawlers: the same blog articles the website shows under each kind of page (see
 * relatedArticles in @soldirectory/topic-content), chosen from the page's address.
 */
function relatedShellHtml(originalUrl: string): string {
  const pathname = new URL(originalUrl, 'http://x').pathname;
  const parts = pathname.replace(/^\/seo-shell/, '').split('/').filter(Boolean).map((p) => p.toLowerCase());
  const top = parts[0];
  if (!top || top === 'blog') return '';
  let service: string | undefined;
  let themes: string[] | null = null;
  if (top === 'services' && (parts.length === 2 || parts.length === 4)) {
    service = REAL_SERVICES.find((name) => slugifyService(name) === parts[1]);
    themes = parts.length === 4 ? ['local', 'choosing'] : ['choosing'];
  } else if (top in KINDS) {
    themes = top === 'aged-care-providers'
      ? ['aged-care', 'choosing', parts.length === 1 ? 'registration' : 'local']
      : parts.length === 1 ? ['choosing', 'registration', 'local'] : ['local', 'choosing', 'registration'];
  } else if (top === 'directory') {
    themes = parts[1] === 'in' ? ['local', 'choosing'] : ['choosing', 'agreement', 'registration'];
  } else if (top === 'condition') {
    themes = ['assistive', 'choosing', 'funding'];
  } else if (top === 'funding') {
    themes = ['funding', 'plan', 'choosing'];
  } else if (top === 'language') {
    themes = ['choosing', 'registration'];
  } else if (top === 'independent-workers') {
    themes = ['workers', 'choosing'];
  } else if (top === 'support-coordinators') {
    service = 'Support coordination';
    themes = ['funding', 'plan'];
  } else if (top === 'guides') {
    themes = parts[1] === 'aged-care-support' ? ['aged-care', 'funding', 'choosing'] : ['choosing', 'funding'];
  } else if (['locations', 'services'].includes(top)) {
    themes = ['local', 'choosing'];
  }
  if (!themes) return '';
  const articles = relatedArticles({ service, themes, limit: 3 });
  if (!articles.length) return '';
  const heading = service ? `Reading about ${service}` : 'Helpful reading';
  return `<section><h2>${esc(heading)}</h2><ul>${articles.map((a) => `<li><a href="/blog/${esc(a.slug)}">${esc(a.title)}</a>: ${esc(a.summary)}</li>`).join('')}</ul><p><a href="/blog">All NDIS and aged care articles</a></p></section>`;
}

/**
 * The hub pages' reading copy (packages/topic-content/hubContent.js), as HTML. It is the same copy the website renders,
 * so the words a crawler gets match the words a visitor reads. Returns '' for a path with no such copy.
 */
function hubCopyShell(originalUrl: string): { html: string; faqLd: object | null } {
  const pathname = new URL(originalUrl, 'http://x').pathname.replace(/^\/seo-shell/, '') || '/';
  const copy = hubCopy(pathname.toLowerCase());
  if (!copy) return { html: '', faqLd: null };
  const item = (i: { text: string; title?: string; to?: string; label?: string }) =>
    `<li>${i.title ? `<strong>${esc(i.title)}.</strong> ` : ''}${esc(i.text)}${i.to ? ` <a href="${esc(i.to)}">${esc(i.label ?? i.to)}</a>` : ''}</li>`;
  const sections = copy.sections.map((s) =>
    `<section><h2>${esc(s.heading)}</h2>` +
    (s.paragraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join('') +
    (s.list?.length ? `<ul>${s.list.map(item).join('')}</ul>` : '') +
    (s.links?.length ? `<p>${s.links.map((l) => `<a href="${esc(l.to)}">${esc(l.label)}</a>`).join(' · ')}</p>` : '') +
    `</section>`).join('');
  const faqs = copy.faqs ?? [];
  const faqHtml = faqs.length
    ? `<section><h2>Frequently asked questions</h2>${faqs.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join('')}</section>`
    : '';
  const faqLd = faqs.length
    ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }
    : null;
  return { html: sections + faqHtml, faqLd };
}

/**
 * Page bodies write the breadcrumb as `<a>Home</a> / <a>Section</a> / Current page`. This turns each one into the list
 * the visible pages use (<ol><li>…), with the current page marked aria-current, in one place rather than at every call site.
 */
function breadcrumbLists(body: string): string {
  return body.replace(/<nav aria-label="Breadcrumb">([\s\S]*?)<\/nav>/g, (whole, inner: string) => {
    const items: string[] = [];
    let rest = inner;
    for (;;) {
      const link = /^<a [^>]*>[\s\S]*?<\/a> \/ /.exec(rest);
      if (!link) break;
      items.push(link[0].slice(0, -3));
      rest = rest.slice(link[0].length);
    }
    if (!items.length || !rest) return whole;
    return `<nav aria-label="Breadcrumb"><ol>${items.map((i) => `<li>${i}</li>`).join('')}<li aria-current="page">${rest}</li></ol></nav>`;
  });
}

function render(html: string, req: Request, page: Page, site: string): string {
  const shareImage = page.ogImage || `${site}${DEFAULT_SHARE_IMAGE}`;
  const usingDefaultImage = !page.ogImage;
  const imageAlt = page.ogImageAlt ?? (usingDefaultImage ? DEFAULT_SHARE_IMAGE_ALT : undefined);
  // Only an image whose real size is known gets width and height; a wrong size is worse than none.
  const shareSize = usingDefaultImage ? DEFAULT_SHARE_IMAGE_SIZE : /\/images\/blog\/[a-z0-9-]+\.jpg$/.test(shareImage) ? BLOG_COVER_SIZE : null;
  const head = [
    page.canonical ? `<link rel="canonical" href="${esc(site + page.canonical)}" />` : '',
    page.canonical ? `<meta property="og:url" content="${esc(site + page.canonical)}" />` : '',
    `<meta property="og:type" content="${page.ogType ?? 'website'}" />`,
    `<meta property="og:site_name" content="SolDirectory" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:locale" content="en_AU" />`,
    `<meta property="og:image" content="${esc(shareImage)}" />`,
    ...(shareSize ? [`<meta property="og:image:width" content="${shareSize.width}" />`, `<meta property="og:image:height" content="${shareSize.height}" />`] : []),
    ...(imageAlt ? [`<meta property="og:image:alt" content="${esc(imageAlt)}" />`] : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${esc(shareImage)}" />`,
    ...(imageAlt ? [`<meta name="twitter:image:alt" content="${esc(imageAlt)}" />`] : []),
    ...(page.ogType === 'article' && page.articleTimes
      ? [
        ...(page.articleTimes.published ? [`<meta property="article:published_time" content="${esc(page.articleTimes.published)}" />`] : []),
        ...(page.articleTimes.modified ? [`<meta property="article:modified_time" content="${esc(page.articleTimes.modified)}" />`] : []),
        ...(page.articleTimes.section ? [`<meta property="article:section" content="${esc(page.articleTimes.section)}" />`] : []),
      ]
      : []),
    ...page.jsonLd.map((j) =>
      // "<" is escaped so a business name can never close the script tag.
      `<script type="application/ld+json" id="jsonld-${j.id}">${JSON.stringify({ '@context': 'https://schema.org', ...j.data }).replace(/</g, '\\u003c')}</script>`
    ),
  ].join('\n    ');

  // Reading copy for hub pages, with its FAQ markup unless the page already carries some.
  const hub = page.canonical && !page.noindex && page.status === 200 ? hubCopyShell(req.originalUrl) : { html: '', faqLd: null };
  const alreadyHasFaq = page.jsonLd.some((j) => JSON.stringify(j.data).includes('FAQPage'));
  const hubFaqTag = hub.faqLd && !alreadyHasFaq
    ? `\n    <script type="application/ld+json" id="jsonld-hub-faq">${JSON.stringify(hub.faqLd).replace(/</g, '\\u003c')}</script>`
    : '';

  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(page.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${esc(page.description)}" />`);
  // Only ever tighten robots: an indexable page keeps the site-wide value
  // the build shipped with, so a staging build stays noindex.
  if (page.noindex) out = out.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, follow" />');
  out = out.replace('</head>', () => `    ${head}${hubFaqTag}\n  </head>`);
  const style = '<style>main[data-seo-shell]{max-width:860px;margin:0 auto;padding:24px 16px;font-family:system-ui,sans-serif;line-height:1.5}main[data-seo-shell] li{margin:2px 0}main[data-seo-shell] nav[aria-label=Breadcrumb] ol{list-style:none;margin:0 0 8px;padding:0;display:flex;flex-wrap:wrap}main[data-seo-shell] nav[aria-label=Breadcrumb] li+li::before{content:"/";margin:0 8px}</style>';
  const related = page.canonical && !page.noindex ? relatedShellHtml(req.originalUrl) : '';
  return out.replace('<div id="root"></div>', () => `<div id="root">${style}<main data-seo-shell>${breadcrumbLists(page.body)}${hub.html}${related}</main></div>`);
}

// ---------------------------------------------------------------
// Provider directory profile — /directory/:slug
// ---------------------------------------------------------------
const LEVEL_PAGE = 12;

async function providerProfilePage(site: string, slug: string): Promise<Page> {
  if (!SLUG_RE.test(slug)) return notFound();
  const p: any = await Provider.findOne({ slug, accountStatus: 'active', listingPaused: { $ne: true } })
    .select('legalEntityName tradingName slug registrationGroups acceptedFunding conditionExperience languages ageGroups serviceSuburbs businessAddress.suburb businessAddress.state logoUrl hasLogoUpload updatedAt')
    .lean();
  if (!p) return notFound();

  const name: string = p.tradingName || p.legalEntityName;
  const groups: string[] = p.registrationGroups ?? [];
  const suburbs: string[] = p.serviceSuburbs ?? [];
  const where = p.businessAddress?.suburb && p.businessAddress?.state ? `${p.businessAddress.suburb}, ${p.businessAddress.state}` : suburbs[0] ?? 'Australia';
  const offers = groups.slice(0, 3).join(', ');
  const path = `/directory/${p.slug}`;
  const section = (h: string, items: string[]) => (items.length ? `<h2>${esc(h)}</h2><ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '');

  return {
    status: 200,
    title: `${trimTo(name, 44)} | Provider in ${where}`,
    description: trimTo(
      `${name}${offers ? ` offers ${offers}` : ' is listed on SolDirectory'}${suburbs.length ? ` and supports people in ${suburbs.slice(0, 3).join(', ')}` : ''}. See supports, funding accepted and service areas, then get matched for free.`,
      158
    ),
    canonical: path,
    noindex: groups.length === 0,
    jsonLd: [
      { id: 'directory-provider', data: { '@type': 'Organization', name, ...(publicLogoUrl(p) ? { logo: publicLogoUrl(p)!.startsWith('/') ? `${site}${publicLogoUrl(p)}` : publicLogoUrl(p) } : {}), ...(suburbs.length ? { areaServed: suburbs.slice(0, 20).map((s) => ({ '@type': 'Place', name: s })) } : {}) } },
      { id: 'directory-breadcrumbs', data: { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
        { '@type': 'ListItem', position: 2, name: 'Provider directory', item: `${site}/find-a-provider` },
        { '@type': 'ListItem', position: 3, name, item: `${site}${path}` },
      ] } },
    ],
    body:
      `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/find-a-provider">Provider directory</a> / ${esc(name)}</nav><h1>${esc(name)}</h1>` +
      section('Supports offered', groups) + section('Service areas', suburbs) + section('Funding accepted', p.acceptedFunding ?? []) +
      section('Experience supporting', p.conditionExperience ?? []) + section('Age groups', p.ageGroups ?? []) + section('Languages', p.languages ?? []),
  };
}

// ---------------------------------------------------------------
// Independent workers — /independent-workers/find and /:slug
// ---------------------------------------------------------------
const workerVisible = () => ({ publicProfile: true, published: true, accountStatus: 'active', publicSlug: { $exists: true, $ne: null } });
const workerName = (w: any) => `${w.firstName}${w.lastName ? ` ${String(w.lastName).charAt(0).toUpperCase()}.` : ''}`;

async function workerProfilePage(site: string, slug: string): Promise<Page> {
  if (!SLUG_RE.test(slug)) return notFound();
  const w: any = await Worker.findOne({ ...workerVisible(), publicSlug: slug })
    .select('firstName lastName role suburb state services languages conditionExperience bio hasPhoto publicSlug updatedAt').lean();
  if (!w) return notFound();

  // Approved reviews only, same as the page itself.
  const reviews: any[] = await WorkerReview.find({ workerId: w._id, status: 'approved' }).sort({ createdAt: -1 }).limit(10).select('rating text reviewerName createdAt').lean();
  const reviewCount = await WorkerReview.countDocuments({ workerId: w._id, status: 'approved' });
  const average = reviewCount ? Math.round((await WorkerReview.aggregate([{ $match: { workerId: w._id, status: 'approved' } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]))[0].avg * 10) / 10 : null;

  const name = workerName(w);
  const where = [w.suburb, w.state].filter(Boolean).join(', ');
  const offers = (w.services ?? []).slice(0, 3).join(', ');
  const path = `/independent-workers/${w.publicSlug}`;
  const list = (h: string, items: string[]) => (items.length ? `<h2>${esc(h)}</h2><ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '');

  return {
    status: 200,
    title: `${name}${w.role ? `, ${trimTo(w.role, 30)}` : ''} | Independent worker${where ? ` in ${where}` : ''}`,
    description: trimTo(`${name} is an independent ${w.role ? String(w.role).toLowerCase() : 'support worker'}${where ? ` in ${where}` : ''}${offers ? ` offering ${offers}` : ''}. See supports, languages and availability.`, 158),
    canonical: path,
    noindex: false,
    ogImage: w.hasPhoto ? `${site}/api/workers/public/${w.publicSlug}/photo?v=${new Date(w.updatedAt).getTime()}` : undefined,
    jsonLd: [{ id: 'worker-breadcrumbs', data: { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
      { '@type': 'ListItem', position: 2, name: 'Independent workers', item: `${site}/independent-workers/find` },
      { '@type': 'ListItem', position: 3, name, item: `${site}${path}` },
    ] } }],
    body:
      `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/independent-workers/find">Independent workers</a> / ${esc(name)}</nav>` +
      `<h1>${esc(name)}</h1><p>${esc([w.role, where].filter(Boolean).join(' · '))}</p>` +
      (w.bio ? `<h2>About</h2><p>${esc(w.bio)}</p>` : '') +
      list('Supports offered', w.services ?? []) + list('Experience supporting', w.conditionExperience ?? []) + list('Languages', w.languages ?? []) +
      `<h2>Reviews</h2>` +
      (reviewCount
        ? `<p>${average!.toFixed(1)} out of 5 from ${fmt(reviewCount)} ${reviewCount === 1 ? 'review' : 'reviews'}.</p><ul>${reviews.map((r) => `<li>${r.rating}/5 - ${esc(r.text)} (${esc(r.reviewerName)})</li>`).join('')}</ul>`
        : '<p>No reviews yet.</p>'),
  };
}

async function workerListPage(site: string, page: number, filtered: boolean): Promise<Page> {
  const filter = workerVisible();
  const [docs, total] = await Promise.all([
    Worker.find(filter).select('firstName lastName role suburb state services publicSlug').sort({ firstName: 1, _id: 1 }).skip((page - 1) * LEVEL_PAGE).limit(LEVEL_PAGE).lean(),
    Worker.countDocuments(filter),
  ]);
  const base = '/independent-workers/find';
  const totalPages = Math.max(1, Math.ceil(total / LEVEL_PAGE));
  const pager =
    (page > 1 ? `<a rel="prev" href="${esc(page === 2 ? base : `${base}?page=${page - 1}`)}">Previous page</a> ` : '') +
    (page < totalPages ? `<a rel="next" href="${esc(`${base}?page=${page + 1}`)}">Next page</a>` : '');
  return {
    status: 200,
    title: `Independent support workers${page > 1 ? ` (page ${page})` : ''} | SolDirectory`,
    description: 'Browse independent support workers who have created a public profile: their supports, suburb, languages and availability.',
    canonical: page > 1 && !filtered ? `${base}?page=${page}` : base,
    noindex: filtered || total === 0,
    jsonLd: [],
    body:
      `<h1>Find an independent support worker</h1><p>${fmt(total)} ${total === 1 ? 'worker has' : 'workers have'} a public profile.</p>` +
      `<ul>${(docs as any[]).map((w) => li(`/independent-workers/${w.publicSlug}`, workerName(w), `– ${[w.role, [w.suburb, w.state].filter(Boolean).join(', ')].filter(Boolean).join(', ')}`)).join('')}</ul><p>${pager}</p>`,
  };
}

// ---------------------------------------------------------------
// Real-provider location and "experience supporting" pages
//   /directory/in/:suburb      /condition/:slug/      /condition
// ---------------------------------------------------------------
async function providerFilterPage(site: string, mode: 'area' | 'condition', slug: string, page: number): Promise<Page> {
  const rows = mode === 'area' ? await areaRows() : await conditionRows();
  const topic = mode === 'condition' ? CONDITION_TOPICS.find((item) => item.slug === slug) : undefined;
  const row = rows.find((r) => r.slug === slug) ?? (topic ? { slug: topic.slug, name: topic.name, count: 0 } : undefined);
  if (!row) return notFound();

  const field = mode === 'area' ? 'serviceSuburbs' : 'conditionExperience';
  const filter = { ...VISIBLE_PROVIDER, slug: { $exists: true, $ne: null }, [field]: new RegExp(`^\\s*${row.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') };
  const [docs, total] = await Promise.all([
    findProvidersPaidFirst<any>(filter, 'legalEntityName tradingName slug registrationGroups', { skip: (page - 1) * LEVEL_PAGE, limit: LEVEL_PAGE }),
    Provider.countDocuments(filter),
  ]);

  // Condition pages are permalink-style, their own top-level category
  // prefix (matches AppRoutes.tsx / ProviderListingPage.tsx) — area
  // pages stay nested under /directory as before.
  const base = mode === 'area' ? `/directory/in/${row.slug}` : `/condition/${row.slug}`;
  const parent = mode === 'area' ? { name: 'Provider directory', href: '/find-a-provider' } : { name: 'Condition', href: '/condition' };
  const totalPages = Math.max(1, Math.ceil(total / LEVEL_PAGE));
  const heading = mode === 'area' ? `Providers supporting people in ${row.name}` : `Providers with experience supporting ${row.name}`;
  const pager =
    (page > 1 ? `<a rel="prev" href="${esc(page === 2 ? base : `${base}?page=${page - 1}`)}">Previous page</a> ` : '') +
    (page < totalPages ? `<a rel="next" href="${esc(`${base}?page=${page + 1}`)}">Next page</a>` : '');
  const editorial = topic ? conditionShellEditorial(topic) : null;
  const siblings = topic ? CONDITION_TOPICS.filter((item) => item.categoryGroup === topic.categoryGroup && item.slug !== topic.slug) : [];
  const editorialBody = topic && editorial
    ? topicBody(topic, editorial, 'Planning and checking support', 'Questions to ask before choosing support') +
      `<h2>Planning support around the person</h2>${(editorial.deepDive ?? []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}` +
      `<h2>Review checklist</h2><ul>${(editorial.reviewChecklist ?? []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` +
      `<h2>Official sources and further support</h2><ul>${(editorial.sources ?? []).map((source) => li(source.href, source.label)).join('')}</ul>` +
      `<h2>Other conditions in ${esc(topic.categoryGroup)}</h2><ul>${siblings.map((item) => li(`/condition/${item.slug}/`, item.name)).join('')}</ul>`
    : '';

  return {
    status: 200,
    title: mode === 'condition'
      ? `${row.name} support providers${page > 1 ? ` (page ${page})` : ''} | SolDirectory`
      : `${heading}${page > 1 ? ` (page ${page})` : ''} | SolDirectory`,
    description: trimTo(`${fmt(total)} ${total === 1 ? 'provider lists' : 'providers list'} ${mode === 'area' ? `${row.name} as an area they support` : `experience supporting ${row.name}`} on SolDirectory. See their supports and service areas, then get matched for free.`, 158),
    canonical: page > 1 ? `${base}?page=${page}` : base,
    noindex: mode === 'area' && total < MIN_INDEXABLE_PROVIDERS,
    jsonLd: [{ id: 'directory-breadcrumbs', data: { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
      { '@type': 'ListItem', position: 2, name: parent.name, item: `${site}${parent.href}` },
      { '@type': 'ListItem', position: 3, name: row.name, item: `${site}${base}` },
    ] } },
    ...(editorial ? topicJsonLd(site, base, heading, editorial) : [])],
    body:
      `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="${parent.href}">${esc(parent.name)}</a> / ${esc(row.name)}</nav><h1>${esc(heading)}</h1>` +
      `<p>${fmt(total)} ${total === 1 ? 'provider' : 'providers'} on SolDirectory.</p>` +
      `<ul>${(docs as any[]).map((p) => li(`/directory/${p.slug}`, p.tradingName || p.legalEntityName, (p.registrationGroups ?? []).length ? `– ${(p.registrationGroups as string[]).slice(0, 3).join(', ')}` : '')).join('')}</ul><p>${pager}</p>` + editorialBody,
  };
}

async function conditionsHubPage(site: string): Promise<Page> {
  const rows = await conditionRows();
  const counts = new Map(rows.map((row) => [row.slug, row.count]));
  return {
    status: 200,
    title: 'Find providers by condition or support need | SolDirectory',
    description: 'Browse providers by the conditions and needs they say they have experience supporting. Providers write their own profiles.',
    canonical: '/condition',
    noindex: false,
    jsonLd: [breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Condition', path: '/condition' }])],
    body: `<h1>Find providers by condition or support need</h1><p>Browse general information and providers who say they have relevant experience. A provider writes its own profile, so confirm experience, staff, availability and fit directly.</p>` +
      `<h2>Use condition experience as a starting point</h2><p>A condition label cannot describe a person’s complete support needs, strengths or preferences. Start with the person’s goals, daily activities, communication, culture, environment and the specific tasks where assistance is wanted. A provider may have broad experience with a condition but no experience with the particular age group, equipment, communication method or support involved. Open the relevant guide to prepare questions, then ask who would actually deliver the service and how the proposed approach would be adapted to the individual.</p>` +
      `<h2>What provider-supplied information means</h2><p>Providers select the condition experience shown on their profiles. SolDirectory does not independently assess clinical expertise, service quality or personal suitability. Check qualifications, professional registration where relevant, worker screening, insurance, supervision and person-specific training directly. Ask for concrete examples of comparable work without requesting another person’s private information. Current availability, service area and funding acceptance must also be confirmed because a profile can be accurate in general while a suitable worker or appointment is not presently available.</p>` +
      `<h2>Separate treatment, functional support and funding</h2><p>Diagnosis and clinical treatment usually sit with qualified health professionals. Disability, aged care, education and community services may instead support daily function, participation, independence or implementation of an established plan. Clarify which role a provider is offering and who remains responsible for clinical decisions. A diagnosis does not automatically establish eligibility for the NDIS or another program. Funding bodies apply their current rules and may require evidence of functional impact, referrals, prior approval or use of particular providers. Obtain rates, travel, cancellation, report and administration charges in writing.</p>` +
      `<h2>Plan for consent, safety and review</h2><p>The person should be involved in choosing support and deciding what information can be shared. Record preferred communication, emergency contacts, health or behaviour plans, known risks and escalation responsibilities. Ask how the provider manages incidents, complaints, privacy, worker changes and continuity when a regular worker is unavailable. Agree on goals and review dates so the arrangement can change when health, living circumstances, equipment, informal support or preferences change. A directory search is not an emergency or clinical service; use 000 for immediate danger and the person’s established health or crisis pathways for urgent care.</p>` +
      `<h2>Browse condition and support guides</h2><ul>${CONDITION_TOPICS.map((topic) => li(`/condition/${topic.slug}`, topic.name, counts.has(topic.slug) ? `(${fmt(counts.get(topic.slug)!)})` : '')).join('')}</ul>`,
  };
}

function topicJsonLd(site: string, canonical: string, name: string, editorial: ShellEditorial): Page['jsonLd'] {
  return [
    { id: 'topic-page', data: { '@type': 'WebPage', name, url: `${site}${canonical}`, isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: site } } },
    { id: 'topic-faq', data: { '@type': 'FAQPage', mainEntity: editorial.faq.map((faq) => ({
      '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })) } },
  ];
}

function topicBody(topic: Topic, editorial: ShellEditorial, overviewHeading: string, checksHeading: string): string {
  return `<h2>${esc(overviewHeading)}</h2><p>${esc(editorial.overview)}</p>` +
    `<p>Every person’s circumstances, goals and existing supports are different. Use this information as a starting point, check current official requirements and obtain advice from the responsible funding or health body where needed.</p>` +
    `<h2>${esc(checksHeading)}</h2><ol>${editorial.checks.map((item) => `<li>${esc(item)}</li>`).join('')}</ol>` +
    `<h2>Frequently asked questions about ${esc(topic.name)}</h2>` +
    editorial.faq.map((faq) => `<h3>${esc(faq.question)}</h3><p>${esc(faq.answer)}</p>`).join('');
}

function fundingTopicPage(site: string, slug: string): Page {
  const topic = FUNDING_TOPICS.find((item) => item.slug === slug);
  if (!topic) return notFound();
  const base = `/funding/${topic.slug}`;
  const editorial = fundingShellEditorial(topic);
  const siblings = FUNDING_TOPICS.filter((item) => item.categoryGroup === topic.categoryGroup && item.slug !== topic.slug);
  const fundingDetails =
    `<h2>How to prepare before arranging support</h2><p>Start with the current approval, plan, policy or program guidance rather than relying on a provider’s general description. The same support may be paid differently depending on management, registration, referral, evidence and prior-approval requirements. Confirm who can make a binding decision and keep that decision with the service records.</p>` +
    `<ol>${(editorial.steps ?? []).map((item) => `<li>${esc(item)}</li>`).join('')}</ol>` +
    `<h2>What this page can and cannot confirm</h2><p>This guide explains the usual questions, records and safeguards connected with ${esc(topic.name.toLowerCase())}, but it cannot confirm an individual approval, available budget, current provider capacity or payment outcome. Check the current arrangement with the responsible funding body and ask the provider to put its role, complete fees, service scope and approval dependencies in writing before support begins.</p>` +
    `<h2>Information and records to have ready</h2><p>Organised records help a funding body or provider answer the right question, prepare an accurate quote and resolve billing issues before they interrupt support. Share sensitive information only with consent and only where it is needed.</p>` +
    `<ul>${(editorial.records ?? []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` +
    `<h2>Questions to ask providers</h2><p>A provider should explain its role, eligibility or approval dependencies, complete fees and billing process without implying that a directory listing guarantees funding. Compare answers in writing rather than relying on a headline rate.</p>` +
    `<ul>${(editorial.providerQuestions ?? []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` +
    `<h2>Common mistakes to avoid</h2><ul>${(editorial.pitfalls ?? []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` +
    `<h2>How to make and review the funding arrangement</h2>${(editorial.deepDive ?? []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}` +
    `<h2>Review checklist</h2><p>Recheck the arrangement at regular intervals and whenever services, circumstances, rates or program rules change. Record who confirmed each important decision and the date it was made. Before relying on an older approval or agreement, confirm that it remains current and still covers the service, provider and dates involved.</p>` +
    `<ul>${(editorial.reviewChecklist ?? []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` +
    `<h2>Official sources</h2><ul>${(editorial.sources ?? []).map((source) => li(source.href, source.label)).join('')}</ul>` +
    `<h2>Other ${esc(topic.categoryGroup)} topics</h2><ul>${siblings.map((item) => li(`/funding/${item.slug}`, item.name)).join('')}</ul>`;
  return {
    status: 200,
    title: `${topic.name} | Funding | SolDirectory`,
    description: trimTo(`Understand ${topic.name}, what to confirm with the responsible funding body, records to prepare and questions to ask providers before support begins.`, 158),
    canonical: `${base}/`,
    noindex: false,
    jsonLd: [
      breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Funding', path: '/funding' }, { name: topic.name, path: base }]),
      ...topicJsonLd(site, `${base}/`, topic.name, editorial),
    ],
    body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/funding">Funding</a> / ${esc(topic.name)}</nav>` +
      `<h1>${esc(topic.name)}</h1><p>This page provides general information about ${esc(topic.name)}. Program names, eligibility, amounts and payment rules can change, so confirm current details with the responsible official body.</p>` +
      topicBody(topic, editorial, `How to understand ${topic.name}`, 'What to confirm before arranging support') +
      fundingDetails +
      `<h2>Compare provider arrangements</h2><p>Ask for eligibility or approval requirements, the provider’s role, service rates, travel, cancellations, reports, administration, possible gaps and payment timing in writing. A public-register or directory listing does not prove that a provider accepts this funding arrangement or currently has capacity.</p>` +
      `<p><a href="/find-a-provider">Browse providers</a> or <a href="/funding">explore other funding topics</a>.</p>`,
  };
}

function fundingHubPage(site: string): Page {
  return {
    status: 200,
    title: 'NDIS, aged care and other funding | SolDirectory',
    description: 'Understand NDIS plan management, aged care, DVA, Medicare and private funding, with practical checks, records and provider questions.',
    canonical: '/funding',
    noindex: false,
    jsonLd: [breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Funding', path: '/funding' }])],
    body: `<h1>NDIS, aged care and other funding explained</h1><p>Understand common funding terms, prepare questions and confirm current rules with the responsible official body before comparing providers.</p>` +
      `<h2>Start with the funding arrangement</h2><p>Identify the program, plan, insurance policy, claim or private-payment arrangement that applies. Then check who controls approval, whether a referral or assessment is required, the dates covered and any provider eligibility rules. A provider can explain its services and billing process, but only the responsible funding body can make a binding eligibility or payment decision.</p>` +
      `<h2>Compare the complete cost</h2><p>Ask for service rates and every possible additional charge, including travel, reports, cancellations, administration, equipment and personal contributions. Confirm whether the provider bills the funder directly or expects payment before a claim. A rebate or capped benefit may leave a gap, while an available budget does not automatically make every proposed service eligible.</p>` +
      `<h2>Keep useful records</h2><p>Have the current plan or approval, relevant assessment or referral, written quote, service agreement and recent budget or claim information ready. Keep invoices, payment decisions and important provider answers together. Good records make it easier to monitor spending, correct errors and explain changed circumstances before support or funding is interrupted.</p>` +
      `<h2>Use directory information carefully</h2><p>A directory profile or public-register record can support a provider search, but it does not prove current capacity, funding acceptance or personal suitability. Confirm the legal entity, registration where required, service area, worker qualifications, safeguards and start date directly. Use each topic below to prepare questions, then <a href="/find-a-provider">compare provider profiles</a> or <a href="/locations">browse support by location</a>.</p>` +
      [...new Set(FUNDING_TOPICS.map((topic) => topic.categoryGroup))].map((group) => `<h2>${esc(group)}</h2><ul>${FUNDING_TOPICS.filter((topic) => topic.categoryGroup === group).map((topic) => li(`/funding/${topic.slug}`, topic.name)).join('')}</ul>`).join(''),
  };
}

function guidesHubPage(site: string): Page {
  const guides = Object.values(GUIDE_DOCS);
  return {
    status: 200,
    title: 'NDIS and aged care guides | SolDirectory',
    description: 'Practical guides to NDIS pricing, plan management, choosing a provider and finding aged care support, with current official sources.',
    canonical: '/guides',
    noindex: false,
    jsonLd: [breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }])],
    body:
      `<h1>NDIS and aged care guides</h1><p>Use these practical guides to understand common funding, pricing, provider and aged care terms before comparing support options. Each guide explains the decisions to prepare for, the records or questions that may help and where to confirm current rules with the responsible government body.</p>` +
      `<h2>Choose the guide for your next decision</h2><ul>${guides.map((guide) => li(`/guides/${guide.slug}`, guide.title, guide.summary)).join('')}</ul>` +
      `<h2>How to use these guides</h2><p>Start with the issue in front of you, then open the official source linked from the guide. Funding rules, program names, price limits and assessment pathways can change. General information can help you prepare questions, but it cannot determine a person's eligibility, budget, clinical needs or legal rights.</p>` +
      `<p>When comparing providers, confirm registration or approval requirements, worker qualifications, service areas, current capacity, complete rates, travel, cancellations and complaint processes directly. Keep significant answers, quotes and service terms in writing. Public-register records are useful for checking an organisation, but they do not prove live availability or personal fit.</p>` +
      `<h2>Move from information to options</h2><p>After identifying the relevant support and funding arrangement, <a href="/find-a-provider">compare provider profiles</a>, <a href="/locations">browse support by location</a>, check the <a href="/ndis-providers">NDIS provider register</a> or review <a href="/aged-care-providers">aged care listings</a>. SolDirectory is a directory and referral service and does not provide personal funding, medical, financial or legal advice.</p>`,
  };
}

function guidePage(site: string, slug: string): Page {
  const guide = GUIDE_DOCS[slug];
  if (!guide) return notFound();
  const path = `/guides/${guide.slug}`;
  const body = guide.sections.map((section) =>
    `<h2>${esc(section.heading)}</h2>` +
    section.body.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('') +
    (section.list?.length ? `<ul>${section.list.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : '')
  ).join('');
  return {
    status: 200,
    title: `${guide.title} | SolDirectory`,
    description: guide.summary,
    canonical: path,
    noindex: false,
    jsonLd: [
      breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }, { name: guide.title, path }]),
      { id: 'guide-page', data: { '@type': 'WebPage', name: guide.title, description: guide.summary, url: `${site}${path}`, isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: site } } },
    ],
    body:
      `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/guides">Guides</a> / ${esc(guide.title)}</nav>` +
      `<h1>${esc(guide.title)}</h1><p>${esc(guide.summary)}</p>` +
      `<p>This guide provides general information, not personal advice. Program names, prices, eligibility and service rules can change. Confirm the details that apply today with the official source and relevant funding body before making a decision.</p>` +
      body +
      `<h2>Continue your search</h2><ul>${guide.internalLinks.map((item) => li(item.href, item.label)).join('')}</ul>` +
      `<h2>Official source</h2><p><a href="${esc(guide.officialLink.href)}" rel="noopener nofollow">${esc(guide.officialLink.label)}</a></p>` +
      `<h2>Other guides</h2><ul>${Object.values(GUIDE_DOCS).filter((item) => item.slug !== guide.slug).map((item) => li(`/guides/${item.slug}`, item.title)).join('')}</ul>`,
  };
}

async function languageTopicPage(site: string, slug: string, page: number): Promise<Page> {
  const topic = LANGUAGE_TOPICS.find((item) => item.slug === slug);
  if (!topic) return notFound();
  const base = `/language/${topic.slug}`;
  const editorial = languageShellEditorial(topic);
  const filter = {
    ...VISIBLE_PROVIDER,
    slug: { $exists: true, $ne: null },
    languages: new RegExp(`^\\s*${topic.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i'),
  };
  const [docs, total] = await Promise.all([
    findProvidersPaidFirst<any>(filter, 'legalEntityName tradingName slug registrationGroups', { skip: (page - 1) * LEVEL_PAGE, limit: LEVEL_PAGE }),
    Provider.countDocuments(filter),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / LEVEL_PAGE));
  const pager =
    (page > 1 ? `<a rel="prev" href="${esc(page === 2 ? base : `${base}?page=${page - 1}`)}">Previous page</a> ` : '') +
    (page < totalPages ? `<a rel="next" href="${esc(`${base}?page=${page + 1}`)}">Next page</a>` : '');
  const heading = `${topic.name} speaking support providers`;

  return {
    status: 200,
    title: seoTitle(`${topic.name} language support providers`),
    description: trimTo(`Find providers that list ${topic.name} and learn what to confirm about fluency, interpreters, cultural safety, privacy, funding and communication before support begins.`, 158),
    canonical: page > 1 ? `${base}?page=${page}` : `${base}/`,
    noindex: false,
    jsonLd: [
      breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Language', path: '/language' }, { name: topic.name, path: base }]),
      ...topicJsonLd(site, `${base}/`, heading, editorial),
    ],
    body:
      `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/language">Language</a> / ${esc(topic.name)}</nav>` +
      `<h1>${esc(heading)}</h1><p>${esc(editorial.overview)}</p>` +
      `<h2>Providers that list ${esc(topic.name)}</h2><p>${fmt(total)} ${total === 1 ? 'provider lists' : 'providers list'} ${esc(topic.name)}. Providers supply their own language information, so confirm the specific worker, fluency, dialect, communication method and availability directly.</p>` +
      `<ul>${(docs as any[]).map((provider) => li(`/directory/${provider.slug}`, provider.tradingName || provider.legalEntityName, (provider.registrationGroups ?? []).slice(0, 3).join(', '))).join('')}</ul><p>${pager}</p>` +
      topicBody(topic, editorial, 'Planning clear communication', 'Questions to ask before support begins') +
      `<h2>Bilingual support and qualified interpreters</h2><p>A bilingual support worker and an interpreter have different roles. Direct language-matched support may help everyday communication and relationships. A qualified independent interpreter may still be important for assessment, consent, complaints, complex decisions or technical information.</p>` +
      `<h2>Privacy, consent and cultural safety</h2><p>Do not assume a family member should interpret, receive private information or make decisions. Confirm consent and decision-making arrangements directly. Cultural safety cannot be inferred from shared language alone; ask how the provider responds to community connections, gender preferences, faith, food, family roles and experiences of discrimination without stereotyping the person.</p>` +
      `<h2>Funding and written service terms</h2><p>Interpreter and translation costs depend on the program, purpose and current rules. Confirm approval, booking responsibility and fees before support begins. Request important terms in an accessible format and check rates, travel, cancellations, reports, interpreter arrangements and exit terms.</p>` +
      `<h2>Official sources</h2><ul>` +
      li('https://www.ndis.gov.au/contact/ndis-translations-and-interpreting', 'NDIS translations and interpreting') +
      li('https://www.tisnational.gov.au/', 'TIS National') +
      li('https://www.naati.com.au/online-directory/', 'NAATI practitioner directory') +
      li('https://www.ndiscommission.gov.au/participants', 'NDIS Quality and Safeguards Commission') +
      `</ul><p><a href="/language">Browse other language and communication guides</a></p>`,
  };
}

function languageHubPage(site: string): Page {
  const groups = [...new Set(LANGUAGE_TOPICS.map((topic) => topic.categoryGroup))];
  return {
    status: 200,
    title: 'Find support by language | SolDirectory',
    description: 'Browse providers by languages they list and learn how to check fluency, interpreting, accessible communication, privacy and cultural safety.',
    canonical: '/language',
    noindex: false,
    jsonLd: [breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Language', path: '/language' }])],
    body: `<h1>Find support by language</h1><p>Browse provider-supplied language information, then confirm the worker, fluency, dialect and communication method directly. A shared language does not prove interpreting credentials, cultural safety, specialist experience or current availability.</p>` +
      `<h2>Start with the person’s communication preference</h2><p>Ask the person how they want to communicate, which language or dialect they use in different settings and whether they prefer spoken, signed, written, visual or augmentative communication. Do not assume that a family member should interpret or make decisions. Communication preferences can differ for everyday support, health appointments, consent, complaints and complex choices. Record the preference in the service agreement and confirm the specific worker can meet it before the first appointment rather than relying on an organisation-wide language claim.</p>` +
      `<h2>Understand bilingual support and interpreting</h2><p>A bilingual support worker can make everyday routines and relationships easier, but being bilingual does not by itself make someone a qualified interpreter. Independent, credentialed interpreting may be important for assessments, legal or financial information, informed consent, complaints and clinical discussions. Ask who will book the interpreter, whether remote or in-person interpreting is appropriate, how confidentiality is protected and what happens if the preferred interpreter is unavailable. For Auslan, deafblind interpreting and other specialist communication, confirm the exact skill and accreditation needed.</p>` +
      `<h2>Check cultural safety without making assumptions</h2><p>Shared language can support rapport, but people who use the same language may have different cultures, faiths, genders, family roles and migration experiences. Ask the person what matters to them instead of expecting a provider to infer preferences from language or background. Discuss name pronunciation, gender preferences, food, personal care, community connections, significant dates and any past experiences that affect trust. A culturally safe provider should listen, avoid stereotypes, respond to feedback and respect the person’s control over private information.</p>` +
      `<h2>Confirm funding, privacy and service terms</h2><p>Interpreter, translation and accessible-information costs depend on the purpose, program and current funding rules. Confirm eligibility and prior approval with the responsible body before booking. Ask the provider for complete rates, minimum shifts, travel, cancellations, reports, interpreter charges and exit terms in writing and in an accessible format. Agree on who may receive information, what can be shared with family or coordinators and how translated records are stored. Recheck arrangements if the worker, interpreter, support needs or funding changes.</p>` +
      `<h2>Plan accessible information and backup communication</h2><p>Ask for service agreements, schedules, consent information and complaint pathways in a format the person can understand and use. Check that translated or Easy Read material is current and that the person has enough time to ask questions. Agree on a backup method for emergencies, technology failure or an unavailable interpreter, and record how staff should confirm understanding without speaking over the person or relying on unapproved family interpretation.</p>` +
      groups.map((group) => `<h2>${esc(group)}</h2><ul>${LANGUAGE_TOPICS.filter((topic) => topic.categoryGroup === group).map((topic) => li(`/language/${topic.slug}`, topic.name)).join('')}</ul>`).join(''),
  };
}

function supportCoordinatorsPage(site: string): Page {
  const path = '/support-coordinators';
  const P = COORDINATOR_PAGE;
  const paras = (list: string[]) => list.map((t) => `<p>${inline(t)}</p>`).join('');
  return {
    status: 200,
    title: P.seoTitle,
    description: P.seoDescription,
    canonical: path,
    noindex: false,
    jsonLd: [
      breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Support coordinators', path }]),
      {
        id: 'coordinator-page',
        data: {
          '@type': 'WebPage', name: P.heading, description: P.seoDescription, url: `${site}${path}`, inLanguage: 'en-AU', dateModified: P.updated,
          isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: site },
          publisher: { '@type': 'Organization', name: 'SolDirectory', url: `${site}/` },
        },
      },
      { id: 'coordinator-faq', data: { '@type': 'FAQPage', mainEntity: P.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) } },
    ],
    body:
      `<nav aria-label="Breadcrumb"><a href="/">Home</a> / Support coordinators</nav><h1>${esc(P.heading)}</h1><p>${esc(P.subtitle)}</p>` +
      `<h2>${esc(P.intro.heading)}</h2><p>${inline(P.intro.text)}</p>` +
      `<aside aria-label="${esc(P.glanceHeading)}"><h2>${esc(P.glanceHeading)}</h2><ul>${P.glance.map((g) => `<li>${esc(g)}</li>`).join('')}</ul><p>Last updated <time datetime="${esc(P.updated)}">${esc(P.updatedLabel)}</time></p></aside>` +
      `<h2>${esc(P.referral.heading)}</h2>${paras(P.referral.paragraphs)}<ol>${P.referral.steps.map((t) => `<li>${inline(t)}</li>`).join('')}</ol>` +
      `<h2>${esc(P.urgent.heading)}</h2>${paras(P.urgent.paragraphs)}` +
      `<h2>${esc(P.checks.heading)}</h2><p>${esc(P.checks.intro)}</p>${P.checks.cards.map((c) => `<h3>${esc(c.title)}</h3><p>${esc(c.text)}</p>`).join('')}<p>${inline(P.checks.note)}</p>` +
      `<h2>${esc(P.pricing.heading)}</h2>${paras(P.pricing.paragraphs)}` +
      `<h2>${esc(P.records.heading)}</h2>${paras(P.records.paragraphs)}<ul>${P.records.list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><p>${inline(P.records.after)}</p>` +
      `<h2>${esc(P.after.heading)}</h2>${paras(P.after.paragraphs)}` +
      `<h2>${esc(P.resources.heading)}</h2><p>${inline(P.resources.text)}</p>` +
      `<h2>${esc(P.faqsHeading)}</h2>${P.faqs.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join('')}` +
      `<h2>${esc(P.officialHeading)}</h2><ul>${P.official.map((l) => li(l.href, l.label)).join('')}</ul>` +
      `<p><a href="/find-a-provider">Find providers</a> or submit a provider enquiry through SolDirectory.</p>`,
  };
}

function publicMarketingPage(site: string, key: 'home' | 'find' | 'services' | 'locations' | 'providers'): Page {
  const pages: Record<typeof key, Omit<Page, 'status' | 'noindex'>> = {
    home: {
      title: 'SolDirectory | Find NDIS and aged care providers',
      description: 'Search NDIS and aged care provider profiles by support and location, compare public-register listings, or submit one free provider enquiry.',
      canonical: '/',
      jsonLd: [
        { id: 'organization', data: { '@type': 'Organization', name: 'SolDirectory', url: `${site}/`, logo: `${site}/images/sol-directory-logo-black-transparent-v2.png` } },
        { id: 'website', data: { '@type': 'WebSite', name: 'SolDirectory', url: `${site}/`, inLanguage: 'en-AU' } },
        { id: 'home-page', data: { '@type': 'WebPage', name: 'SolDirectory provider directory', url: `${site}/`, inLanguage: 'en-AU', isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: `${site}/` } } },
      ],
      body: `<h1>Find NDIS and aged care providers near you</h1>` +
        `<p>SolDirectory helps participants, families and support coordinators search provider profiles by support and location. You can browse directly or submit one free enquiry so relevant member providers can assess the support, funding arrangement, area and preferred timeframe.</p>` +
        `<h2>Search in the way that suits you</h2><p>Start with the <a href="/find-a-provider">provider directory</a> when you know the support or suburb. Browse the <a href="/services">service guides</a> to understand common options and questions, use <a href="/locations">location pages</a> to search nearby areas, or explore providers by <a href="/condition">condition and support need</a>. Funding guides explain common <a href="/funding">NDIS, aged care, DVA and private arrangements</a>.</p>` +
        `<h2>Member profiles and public registers are different</h2><p>SolDirectory member providers maintain profiles with their supports, service areas, funding arrangements and intake status. They are asked to reconfirm capacity regularly. The separate <a href="/ndis-providers">NDIS provider register</a> and <a href="/aged-care-providers">aged care provider register</a> pages reproduce public register information for reference. A register record does not show present capacity and is not an endorsement.</p>` +
        `<h2>Compare before choosing</h2><p>Ask who will deliver the support, what relevant experience and qualifications they hold, when services can begin and how continuity is managed. Confirm registration, worker screening, insurance and any person-specific training directly. Request complete rates, travel, cancellation, reporting and exit terms in writing before support begins.</p>` +
        `<h2>How provider enquiries work</h2><p>One enquiry records the requested support, location, funding and timing. Matching identifies member providers whose profile appears relevant; it does not rank quality or guarantee a response. Providers may contact the person who submitted the request, and that person decides whether to continue, compare alternatives or decline. SolDirectory does not deliver care or choose a provider.</p>` +
        `<p>For more preparation help, read the <a href="/guides/choosing-a-provider">provider selection guide</a>, learn about <a href="/guides/plan-management-basics">NDIS plan management</a>, or review the <a href="/support-coordinators">support coordinator referral guide</a>.</p>`,
    },
    find: {
      title: DIRECTORY_PAGE_TITLE,
      description: DIRECTORY_PAGE_DESCRIPTION,
      canonical: '/find-a-provider',
      jsonLd: [
        breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Find a provider', path: '/find-a-provider' }]),
        {
          id: 'find-a-provider-page',
          data: {
            '@type': 'WebPage', name: DIRECTORY_PAGE_HEADING, description: DIRECTORY_PAGE_DESCRIPTION, url: `${site}/find-a-provider`,
            inLanguage: 'en-AU', dateModified: DIRECTORY_PAGE_UPDATED,
            isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: site },
            publisher: { '@type': 'Organization', name: 'SolDirectory', url: `${site}/` },
          },
        },
      ],
      // Mirrors apps/web/src/pages/public/Directory.tsx and DirectoryExtras. The steps, the two kinds of listing, the
      // reading list, the state links and the questions arrive from the shared reading copy (hubCopy) appended to this body.
      body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / Find a provider</nav><h1>${esc(DIRECTORY_PAGE_HEADING)}</h1>` +
        `<p>${esc(DIRECTORY_PAGE_SUBTITLE)}</p>` +
        `<h2>Not sure where to start? Pick a support</h2><p>Choose a support to filter the results above. You can add a suburb afterwards.</p>` +
        `<ul>${DIRECTORY_SUPPORTS.map((s) => li(`/services/${slugifyService(s.name)}`, s.label)).join('')}</ul>` +
        `<h2>How to read the results</h2><p>${esc(DIRECTORY_GUIDANCE.intro)}</p>` +
        DIRECTORY_GUIDANCE.blocks.map((b) => `<h3>${esc(b.heading)}</h3><p>${esc(b.text)}</p>`).join('') +
        `<h3>${esc(DIRECTORY_GUIDANCE.questionsHeading)}</h3><ul>${DIRECTORY_GUIDANCE.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>` +
        `<h3>${esc(DIRECTORY_GUIDANCE.widerHeading)}</h3><p>${inline(DIRECTORY_GUIDANCE.wider)}</p>`,
    },
    services: {
      title: 'NDIS and aged care support services | SolDirectory',
      description: 'Browse disability and aged care service guides, understand common supports, and compare providers by service, location, availability and safeguards.',
      canonical: '/services',
      jsonLd: [breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }])],
      body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / Services</nav><h1>NDIS and aged care support services</h1>` +
        `<p>Browse service guides to understand common disability, aged care, therapy, nursing, housing and community supports before contacting providers. Each guide explains what to clarify, records to prepare and practical questions to ask. A service label is a starting point, not proof that a provider is suitable, available or funded for a particular person.</p>` +
        `<h2>Browse services</h2><ul>${REAL_SERVICES.map((service) => li(`/services/${slugifyService(service)}`, service)).join('')}</ul>` +
        `<h2>Start with the person’s actual needs</h2><p>Describe the tasks, goals, frequency, schedule, location, communication preferences, risks and equipment involved. Similar service names can cover very different work. Ask who will deliver the support, what experience and qualifications apply, how workers are supervised and what happens when a regular worker is unavailable.</p>` +
        `<h2>Check funding and provider requirements</h2><p>Confirm the current plan or program, available budget, management arrangement and whether registration is required. Ask for complete rates in writing, including travel, cancellations, reports, non-face-to-face work and minimum shifts. General directory information cannot confirm an individual approval or payment outcome.</p>` +
        `<h2>Compare safeguards and service terms</h2><p>Verify registration, screening, insurance and person-specific training directly where relevant. Review consent, privacy, incident, complaint and emergency processes. Before support begins, use a written service agreement that identifies scope, schedule, rates, responsibilities, changes and how either party may end the arrangement.</p>` +
        `<h2>Prepare information without oversharing</h2><p>Providers need enough detail to decide whether they can safely deliver the requested support, but an initial directory enquiry should not contain an entire medical record. Describe the required tasks, relevant risks, communication or accessibility needs, location, timing and funding arrangement. Share detailed assessments, health plans and identity documents only with an appropriate provider, through a suitable channel and with the person’s consent. Ask why information is needed, who can access it and how it will be stored.</p>` +
        `<h2>Confirm how support will work day to day</h2><p>Ask whether the same workers can attend regularly, how introductions and handovers happen and what backup is available for leave or unexpected absence. Clarify who supplies equipment, consumables or transport and which tasks require a qualified practitioner or person-specific competency assessment. Record preferred routines, communication, cultural requirements and escalation contacts. For supports delivered at home, discuss entry, pets, infection control, privacy and the boundaries of the agreed work.</p>` +
        `<h2>Review outcomes and change arrangements early</h2><p>Set a review date and identify what useful progress or stable support would look like for the person. Compare invoices with attendance and agreed rates, and raise missed services, unexplained charges or safety concerns promptly. Needs and availability can change, so update the service scope when goals, health, equipment, living arrangements or informal supports change. Keep copies of agreements and important decisions, and understand the complaint and exit process before a problem makes support difficult to change.</p>` +
        `<h2>Find providers</h2><p>Use the <a href="/find-a-provider">provider directory</a> to filter SolDirectory member profiles and public-register listings by support and location. You can also browse by <a href="/locations">location</a>, review <a href="/condition">condition-related guidance</a> or learn about <a href="/funding">funding arrangements</a>. SolDirectory does not recommend providers or guarantee capacity.</p>`,
    },
    locations: {
      title: 'Find providers by location | SolDirectory',
      description: 'Browse NDIS and aged care providers by Australian state, city and suburb, then confirm service areas, travel, availability and local delivery.',
      canonical: '/locations',
      jsonLd: [breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Locations', path: '/locations' }])],
      body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / Locations</nav><h1>Find providers near you</h1>` +
        `<p>Start with the suburb where support will be delivered, not only the provider's office address. Providers may travel across several service areas, operate mobile teams or offer suitable remote appointments. Search the exact suburb first and broaden to nearby areas when you need more options.</p>` +
        `<h2>What a location result means</h2><p>A SolDirectory location page is based on service areas entered by current member providers. A public-register location page is based on areas recorded in the imported NDIS Commission or My Aged Care data. Neither source guarantees that a provider has capacity, offers every service at that location or can meet a requested schedule.</p>` +
        `<h2>Confirm practical travel arrangements</h2><p>Ask whether the provider serves the precise address, how workers are allocated and whether travel time or kilometres are charged. Check minimum shift lengths, appointment windows, parking, transport responsibilities and what happens when a worker is delayed or unavailable. For regional and remote areas, discuss outreach schedules, telehealth and backup arrangements.</p>` +
        `<h2>Search Australia by register</h2><p>Browse the <a href="/ndis-providers">NDIS register by state and suburb</a> or the <a href="/aged-care-providers">aged care register by state and suburb</a>. These pages are useful for discovering organisations recorded in an area, while the <a href="/find-a-provider">member directory</a> is the place to review SolDirectory profiles and submit an enquiry.</p>` +
        `<h2>Location is only one part of fit</h2><p>Also compare the requested support, worker qualifications, relevant experience, communication preferences, cultural safety, funding, current availability and full written fees. Review the <a href="/services">service guides</a> and <a href="/guides/choosing-a-provider">provider checklist</a> before making a decision. Confirm registration, insurance and screening directly rather than assuming proximity proves suitability.</p>`,
    },
    providers: {
      title: 'List your provider business | SolDirectory',
      description: PROVIDER_PAGE_DESCRIPTION,
      canonical: '/providers',
      jsonLd: [
        breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'For providers', path: '/providers' }]),
        {
          id: 'providers-page',
          data: {
            '@type': 'WebPage', name: 'List your provider business on SolDirectory', description: PROVIDER_PAGE_DESCRIPTION, url: `${site}/providers`, inLanguage: 'en-AU', dateModified: PROVIDER_PAGE_UPDATED,
            isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: site },
            publisher: { '@type': 'Organization', name: 'SolDirectory', url: `${site}/` },
          },
        },
      ],
      body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / For providers</nav><h1>List your provider business on SolDirectory</h1>` +
        `<p>Create or claim a profile that explains your supports, service areas, accepted funding and current intake status. SolDirectory compares those details with enquiries submitted by participants, families and support coordinators so your team can assess relevant requests.</p>` +
        `<h2>Understand what an enquiry means</h2><p>An enquiry is a request for information, not an exclusive referral, confirmed client or booking. More than one relevant provider may be notified, and the person decides whether to respond or proceed. Enquiry volume depends on local demand, profile accuracy, services, funding compatibility and confirmed capacity; no plan guarantees leads or work.</p>` +
        `<h2>Keep profile information accurate</h2><p>List only services your organisation actually delivers and areas it genuinely covers. Keep the intake email, funding arrangements, languages and condition experience current. Providers are asked to reconfirm capacity regularly, and stale profiles may be paused until availability is confirmed again.</p>` +
        `<h2>Assess every request independently</h2><p>Before accepting work, confirm the person's support requirements, location, schedule, risks, communication preferences, funding and decision-making arrangements. Check whether registration or specialist qualifications are required. Agree scope, rates, travel, cancellations, privacy, incidents, complaints and exit terms in a written service agreement.</p>` +
        `<h2>Directory position and subscriptions</h2><p>Search filters determine which profiles qualify. Eligible Pro and Growth members are shown before Starter members, with alphabetical ordering inside each plan group. Priority placement is not an endorsement or quality rating, and no plan guarantees enquiries or work. SolDirectory does not take a percentage of fees agreed between a provider and participant.</p>` +
        `<p>People searching for support can use the <a href="/find-a-provider">provider directory</a>, browse <a href="/services">service guides</a> and review public <a href="/ndis-providers">NDIS</a> or <a href="/aged-care-providers">aged care</a> register records. Providers should describe their own status accurately and never imply that a listing is an endorsement.</p>`,
    },
  };
  return { status: 200, noindex: false, ...pages[key] };
}

// ---------------------------------------------------------------
// WordPress service pages - /services/:slug
// The content lives in WordPress; crawlers get it here as plain HTML.
// ---------------------------------------------------------------
class WordPressUnavailable extends Error {}

const WP_TTL_MS = 5 * 60 * 1000;
const wpItemCache = new Map<string, { at: number; item: any | null }>();

/**
 * Once WordPress has failed, further calls fail straight away for a short while. Without this, every page that needs
 * WordPress waits out the full timeout while it is slow or down, which is a slow page for crawlers and visitors alike.
 */
const WP_DOWN_MS = 30_000;
let wpDownUntil = 0;
function assertWordPressUp(): void {
  if (Date.now() < wpDownUntil) throw new WordPressUnavailable('WordPress was unavailable a moment ago');
}

/** WordPress returns titles with HTML entities ("&amp;", "&#8217;"). */
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, n) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[n as string] as string));
}
const plain = (html: string) => decodeEntities(String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

async function fetchWpItem(restBase: 'pages' | 'services' | 'locations' | 'posts', slug: string, timeoutMs = 6000): Promise<any | null> {
  const cacheKey = `${restBase}:${slug}`;
  const hit = wpItemCache.get(cacheKey);
  if (hit && Date.now() - hit.at < WP_TTL_MS) return hit.item;
  const base = process.env.WORDPRESS_URL;
  if (!base) throw new WordPressUnavailable('WORDPRESS_URL is not set');
  assertWordPressUp();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const embed = restBase === 'posts' ? '&_embed=1' : '';
    const res = await fetch(`${base.replace(/\/$/, '')}/wp-json/wp/v2/${restBase}?slug=${encodeURIComponent(slug)}${embed}`, { signal: ctrl.signal });
    if (!res.ok) throw new WordPressUnavailable(`WordPress responded ${res.status}`);
    const list = await res.json();
    if (!Array.isArray(list)) throw new WordPressUnavailable('Unexpected WordPress response');
    const item = list[0] ?? null;
    wpItemCache.set(cacheKey, { at: Date.now(), item }); // a failure is not cached as an answer, only remembered briefly (wpDownUntil)
    return item;
  } catch (e) {
    wpDownUntil = Date.now() + WP_DOWN_MS;
    throw e instanceof WordPressUnavailable ? e : new WordPressUnavailable(String((e as Error).message));
  } finally {
    clearTimeout(timer);
  }
}

const AGED_CARE_CATEGORIES = ['Dementia care', 'Palliative care', 'Residential aged care'];
const overviewCache = new Map<string, { at: number; value: Awaited<ReturnType<typeof computeCategoryOverview>> }>();
async function overviewFor(type: RegisterType, category: string) {
  const key = `${type}|${category}`;
  const hit = overviewCache.get(key);
  if (hit && Date.now() - hit.at < 30 * 60 * 1000) return hit.value;
  const value = await computeCategoryOverview(type, category);
  overviewCache.set(key, { at: Date.now(), value });
  return value;
}
const STATE_SLUGS: Record<string, string> = { NSW: 'nsw', VIC: 'vic', QLD: 'qld', WA: 'wa', SA: 'sa', TAS: 'tas', ACT: 'act', NT: 'nt' };

const jsonArr = (v: unknown): any[] => {
  if (Array.isArray(v)) return v;
  if (typeof v !== 'string' || !v.trim()) return [];
  try { const d = JSON.parse(v); return Array.isArray(d) ? d : []; } catch { return []; }
};

async function servicePage(site: string, slug: string): Promise<Page> {
  if (!SLUG_RE.test(slug)) return notFound();
  const item = await fetchWpItem('services', slug);
  if (!item) {
    const name = REAL_SERVICES.find((service) => slugifyService(service) === slug);
    const editorial = name ? serviceEditorialFor(name) : undefined;
    if (!name || !editorial) return { ...notFound(), title: 'Service not found | SolDirectory', body: '<h1>Page not found</h1><p><a href="/services">Browse services</a></p>' };
    const path = `/services/${slug}`;
    return {
      status: 200,
      title: `${name} guide | SolDirectory`,
      description: trimTo(editorial.shortAnswer, 158),
      canonical: path,
      noindex: false,
      jsonLd: [
        breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, { name, path }]),
        { id: 'service-guide', data: { '@type': 'Service', name, serviceType: name, url: `${site}${path}`, provider: { '@type': 'Organization', name: 'SolDirectory', url: `${site}/` } } },
      ],
      body:
        `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/services">Services</a> / ${esc(name)}</nav>` +
        `<h1>${esc(name)}</h1><p>${esc(editorial.shortAnswer)}</p>` +
        `<h2>Understanding ${esc(name.toLowerCase())}</h2>${editorial.overview.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}` +
        `<h2>What support may include</h2><ul>${editorial.includes.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` +
        `<h2>Plan the support</h2><ul>${editorial.planning.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` +
        `<h2>Questions to ask providers</h2><ul>${editorial.providerQuestions.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` +
        `<h2>Funding considerations</h2>${editorial.funding.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}` +
        `<h2>Safeguards and records</h2><ul>${editorial.safeguards.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` +
        `<h2>Official information</h2><ul>${editorial.sources.map((source) => li(source.href, source.label)).join('')}</ul>` +
        `<p><a href="/find-a-provider?service=${encodeURIComponent(name)}">Find ${esc(name.toLowerCase())} providers</a> or <a href="/services">browse all service guides</a>.</p>`,
    };
  }

  const meta = item.meta ?? {};
  const s = (k: string) => (typeof meta[k] === 'string' ? plain(meta[k]) : '');
  const title = plain(item.title?.rendered ?? '');
  const excerpt = plain(item.excerpt?.rendered ?? '');
  const seoTitle = s('seo_title') || title;
  const description = trimTo(s('seo_description') || excerpt || `${title} on SolDirectory.`, 160);
  const path = `/services/${item.slug}`;
  const faqs = jsonArr(meta.faq_json).filter((f: any) => f?.question && f?.answer);
  const related = (Array.isArray(meta.related_services) ? meta.related_services : []).filter((r: any) => r?.slug && r?.title);
  const cards = jsonArr(meta.regulator_cards_json).filter((c: any) => c?.title);
  const creds = jsonArr(meta.credentials_json).filter((c: any) => c?.title);
  const noindex = meta.seo_noindex === true || meta.seo_noindex === '1';

  const block = (h: string, text: string) => (text ? `<h2>${esc(h)}</h2><p>${esc(text)}</p>` : '');
  const paras = (k: string) => (typeof meta[k] === 'string' ? String(meta[k]).split(/\n{2,}/).map(plain).filter(Boolean) : []);
  const lines = (k: string) => (typeof meta[k] === 'string' ? String(meta[k]).split(/\r?\n/).map(plain).filter(Boolean) : []);
  const sources = jsonArr(meta.sources_json).filter((x: any) => x?.title && /^https?:\/\//i.test(String(x.url ?? '')));

  // Live register data for this service's category (facts from the imported register only).
  const category = s('register_category');
  let registerHtml = '';
  if (category) {
    const type: RegisterType = AGED_CARE_CATEGORIES.includes(category) ? 'aged_care' : 'ndis';
    const kind = KINDS[type === 'ndis' ? 'ndis-providers' : 'aged-care-providers'];
    const base = `/${type === 'ndis' ? 'ndis-providers' : 'aged-care-providers'}`;
    try {
      const [o, listings] = await Promise.all([overviewFor(type, category), categoryListings(type, category, 12)]);
      if (o.total > 0) {
        const stateRows = Object.entries(o.states).sort((a, b) => b[1] - a[1]);
        registerHtml =
          `<h2>${esc(category)} providers on the ${esc(kind.plain)} register</h2>` +
          `<p>${fmt(o.total)} ${esc(kind.plain)} ${o.total === 1 ? 'provider lists' : 'providers list'} ${esc(category.toLowerCase())} supports on the ${esc(kind.register)}. A register listing shows what the register says, not who has capacity.</p>` +
          (listings.length ? `<h3>Providers listing ${esc(category.toLowerCase())}</h3><ul>${listings.map((x) => li(`${base}/${x.slug}`, x.name, `- ${x.states.join(', ')}${x.areas.length ? `; includes ${x.areas.slice(0, 3).map((a) => `${a.suburb}, ${a.state}`).join('; ')}` : ''}`)).join('')}</ul><p><a href="${base}?category=${encodeURIComponent(category)}">See all ${fmt(o.total)} ${esc(category.toLowerCase())} providers</a></p>` : '') +
          `<h3>Listings by state and territory</h3><ul>${stateRows.map(([code, n]) => li(`${base}/${STATE_SLUGS[code] ?? code.toLowerCase()}?category=${encodeURIComponent(category)}`, STATE_NAMES[code] ?? code, `(${fmt(n)})`)).join('')}</ul>` +
          (o.topSuburbs.length ? `<h3>Suburbs with the most listings</h3><ul>${o.topSuburbs.slice(0, 12).map((x) => li(`${base}/${STATE_SLUGS[x.state] ?? x.state.toLowerCase()}/${x.slug}`, `${x.suburb}, ${x.state}`, `(${fmt(x.count)})`)).join('')}</ul>` : '') +
          (o.widest.length ? `<h3>Listings covering the most areas</h3><ul>${o.widest.slice(0, 8).map((x) => li(`${base}/${x.slug}`, x.name, `- ${fmt(x.areaCount)} areas`)).join('')}</ul>` : '');
      }
    } catch {
      registerHtml = ''; // the register data is an extra; never fail the page over it
    }
  }
  // Independent workers who published a profile for this service (opt-in, admin-approved only).
  let workersHtml = '';
  try {
    const w = await workersForService(title, category || undefined, { limit: 6 });
    if (w.total > 0) {
      workersHtml =
        `<h2>Independent support workers offering ${esc(title)}</h2>` +
        `<p>${fmt(w.total)} independent ${w.total === 1 ? 'worker has' : 'workers have'} published a public profile for ${w.level === 'service' ? esc(title.toLowerCase()) : `${esc(category.toLowerCase() || title.toLowerCase())} supports (the wider category this service falls under)`}. Contact details are not shown; organisations request contact through SolDirectory.</p>` +
        `<ul>${w.items.map((x) => li(`/independent-workers/${x.slug}`, `${x.firstName}${x.lastInitial ? ` ${x.lastInitial}.` : ''}`, `${[x.role, [x.suburb, x.state].filter(Boolean).join(', '), x.services.slice(0, 4).join(', ')].filter(Boolean).join(' - ')}`)).join('')}</ul>` +
        `<p><a href="/independent-workers/find?service=${encodeURIComponent(w.matchedNames[0] ?? title)}">Browse independent workers</a></p>`;
    }
  } catch {
    workersHtml = ''; // an extra: never fail the page over it
  }
  const body =
    `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/services">Services</a> / ${esc(title)}</nav>` +
    `<h1>${esc(s('hero_headline') || title)}</h1>` +
    (s('hero_eyebrow') ? `<p>${esc(s('hero_eyebrow'))}</p>` : '') +
    (s('hero_description') || excerpt ? `<p>${esc(s('hero_description') || excerpt)}</p>` : '') +
    (s('short_answer') ? `<h2>The short answer</h2><p>${esc(s('short_answer'))}</p>` : '') +
    (plain(item.content?.rendered ?? '') ? `<div>${esc(plain(item.content.rendered))}</div>` : '') +
    (paras('overview_content').length ? `<h2>${esc(s('overview_heading') || `About ${title}`)}</h2>${paras('overview_content').map((p) => `<p>${esc(p)}</p>`).join('')}` : '') +
    block('Who is this service for?', s('who_for')) +
    (paras('typical_session').length ? `<h2>What a typical session looks like</h2>${paras('typical_session').map((p) => `<p>${esc(p)}</p>`).join('')}` : '') +
    block('Who delivers this support', s('who_delivers')) +
    (lines('how_to_choose').length ? `<h2>How to choose a provider</h2><ul>${lines('how_to_choose').map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '') +
    (lines('questions_to_ask').length ? `<h2>Questions to ask a provider</h2><ul>${lines('questions_to_ask').map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '') +
    (lines('common_mistakes').length ? `<h2>Common mistakes to avoid</h2><ul>${lines('common_mistakes').map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '') +
    (lines('getting_started').length ? `<h2>Getting started</h2><ol>${lines('getting_started').map((l) => `<li>${esc(l)}</li>`).join('')}</ol>` : '') +
    block('How it fits with the rest of your plan', s('plan_fit')) +
    block('Eligibility', s('eligibility')) +
    block('Funding', [s('funding_info'), s('plan_management_info')].filter(Boolean).join(' ')) +
    block('What it costs', s('cost_info')) +
    registerHtml +
    workersHtml +
    (creds.length ? `<h2>Checking credentials</h2><ul>${creds.map((c: any) => `<li><strong>${esc(plain(c.title))}</strong> ${esc(plain(c.description ?? ''))}</li>`).join('')}</ul>` : '') +
    (cards.length ? `<h2>${esc(s('regulations_heading') || 'Regulation and safeguards')}</h2>${s('regulations_intro') ? `<p>${esc(s('regulations_intro'))}</p>` : ''}<ul>${cards.map((c: any) => `<li><strong>${esc(plain(c.title))}</strong> ${esc(plain(c.description ?? ''))}${c.phone ? ` Phone: ${esc(String(c.phone))}.` : ''}</li>`).join('')}</ul>` : '') +
    (related.length ? `<h2>Related services</h2><ul>${related.map((r: any) => li(`/services/${r.slug}`, plain(r.title))).join('')}</ul>` : '') +
    (faqs.length ? `<h2>Frequently asked questions</h2>${faqs.map((f: any) => `<h3>${esc(plain(f.question))}</h3><p>${esc(plain(f.answer))}</p>`).join('')}` : '') +
    (sources.length ? `<h2>Sources and further reading</h2><ul>${sources.map((x: any) => `<li><a href="${esc(String(x.url))}" rel="noopener nofollow">${esc(plain(x.title))}</a></li>`).join('')}</ul>` : '') +
    `<p><a href="/find-a-provider">Browse the provider directory</a></p>`;

  return {
    status: 200,
    title: seoTitle,
    description,
    canonical: path,
    noindex,
    ogImage: typeof meta.seo_og_image === 'string' && meta.seo_og_image ? meta.seo_og_image : undefined,
    jsonLd: [
      { ...breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, { name: title, path }]), id: 'cpt-breadcrumbs' },
      ...(faqs.length
        ? [{ id: 'cpt-faq', data: { '@type': 'FAQPage', mainEntity: faqs.map((f: any) => ({ '@type': 'Question', name: plain(f.question), acceptedAnswer: { '@type': 'Answer', text: plain(f.answer) } })) } }]
        : []),
    ],
    body,
  };
}

const BLOG_PAGE_SIZE = 12;

function contentDate(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function safeWordPressBlocks(markup: string): string {
  const $ = load(markup);
  $('script, style, iframe, form, svg').remove();
  const blocks: string[] = [];
  const blockTags = new Set(['h2', 'h3', 'h4', 'p', 'blockquote']);
  const listTags = new Set(['ul', 'ol']);

  $('body').children().each((_, element) => {
    const tag = element.tagName?.toLowerCase() ?? '';
    if (blockTags.has(tag)) {
      const content = $(element).text().trim();
      if (content) blocks.push(`<${tag}>${esc(content)}</${tag}>`);
    } else if (listTags.has(tag)) {
      const items = $(element).children('li').toArray()
        .map((item) => $(item).text().trim())
        .filter(Boolean)
        .map((item) => `<li>${esc(item)}</li>`)
        .join('');
      if (items) blocks.push(`<${tag}>${items}</${tag}>`);
    } else {
      const content = $(element).text().trim();
      if (content) blocks.push(`<p>${esc(content)}</p>`);
    }
  });

  if (!blocks.length) {
    const content = $('body').text().trim();
    if (content) blocks.push(`<p>${esc(content)}</p>`);
  }
  return blocks.join('');
}

let blogListCache: { at: number; posts: any[] } | null = null;

async function fetchPublishedBlogPosts(): Promise<any[]> {
  const base = process.env.WORDPRESS_URL;
  if (!base) throw new WordPressUnavailable('WORDPRESS_URL is not set');
  if (blogListCache && Date.now() - blogListCache.at < 2 * 60 * 1000) return blogListCache.posts;
  assertWordPressUp();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const params = new URLSearchParams({ status: 'publish', per_page: String(BLOG_PAGE_SIZE), page: '1', orderby: 'date', order: 'desc', _embed: '1' });
    const response = await fetch(`${base.replace(/\/$/, '')}/wp-json/wp/v2/posts?${params}`, { signal: ctrl.signal });
    if (!response.ok) throw new WordPressUnavailable(`WordPress responded ${response.status}`);
    const posts = await response.json();
    if (!Array.isArray(posts)) throw new WordPressUnavailable('Unexpected WordPress posts response');
    const published = posts.filter((post: any) => post.slug !== 'hello-world'
      && post.meta?.seo_noindex !== true
      && post.meta?.seo_noindex !== '1'
      && post.yoast_head_json?.robots?.index !== 'noindex');
    blogListCache = { at: Date.now(), posts: published };
    return published;
  } catch (error) {
    wpDownUntil = Date.now() + WP_DOWN_MS;
    throw error instanceof WordPressUnavailable ? error : new WordPressUnavailable(String((error as Error).message));
  } finally {
    clearTimeout(timer);
  }
}

function activeEditorialBlogPosts(): EditorialBlogPost[] {
  const now = Date.now();
  return EDITORIAL_BLOG_POSTS.filter((post) => !post.expiresAt || new Date(post.expiresAt).getTime() > now);
}

function editorialBlogContent(post: EditorialBlogPost): string {
  const keyPoints = post.keyPoints?.length
    ? `<aside><h2>In short</h2><ul>${post.keyPoints.map((point) => `<li>${esc(point)}</li>`).join('')}</ul></aside>`
    : '';
  // The same links the page carries: a phrase that names another article's subject links to it, once each.
  const linkState = newLinkState();
  const skip = post.category === 'For providers' ? ['registered-or-unregistered-ndis-provider-what-it-means'] : [];
  const sections = post.sections.map((section) =>
    `<section><h2>${esc(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${linkParagraph(paragraph, post.slug, linkState, linkScopeFor(post.category), skip)}</p>`).join('')}</section>`
  ).join('');
  const faq = post.faq?.length
    ? `<section><h2>Frequently asked questions</h2>${post.faq.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join('')}</section>`
    : '';
  const sources = [post.source, ...post.additionalSources];
  const nearby = relatedToArticle(post.slug, { limit: 4 });
  const keepLearning = nearby.length
    ? `<section><h2>Keep learning</h2><ul>${nearby.map((a) => `<li><a href="/blog/${esc(a.slug)}">${esc(a.title)}</a>: ${esc(a.summary)}</li>`).join('')}</ul>` +
      // Same destinations as the visible page's "Keep learning" list (RELATED_BY_CATEGORY in web blogSeo.ts).
      (post.category === 'Aged care'
        ? `<p>More in our <a href="/guides/aged-care-support">aged care support guide</a>, our <a href="/guides">step-by-step guides</a>, or the <a href="/aged-care-providers">aged care providers listed on the My Aged Care register</a>.</p></section>`
        : `<p>More in our <a href="/blog">NDIS updates and insights</a>, our <a href="/guides">step-by-step guides</a>, or the <a href="/find-a-provider">NDIS and aged care provider directory</a>.</p></section>`)
    : '';
  return keyPoints + sections + faq + keepLearning +
    `<section><h2>Official sources</h2><ul>${sources.map((source) => `<li><a href="${esc(source.url)}" rel="noopener noreferrer">${esc(source.label)}</a></li>`).join('')}</ul>` +
    `<p>Source checked ${esc(contentDate(post.checkedAt))}. Rules and guidance can change; verify current details with the responsible agency. <a href="/editorial-standards">How we write and check our guides</a>.</p></section>`;
}

async function blogArchivePage(site: string): Promise<Page> {
  const cmsPosts = await fetchPublishedBlogPosts().catch(() => []);
  const editorialPosts = activeEditorialBlogPosts();
  const cmsSlugs = new Set(cmsPosts.map((post: any) => post.slug));
  const posts = [
    ...cmsPosts,
    ...editorialPosts.filter((post) => !cmsSlugs.has(post.slug)),
  ].sort((left: any, right: any) => new Date(right.date ?? right.publishedAt).getTime() - new Date(left.date ?? left.publishedAt).getTime());
  const path = '/blog';
  const articleLinks = posts.map((post: any) => {
    const title = plain(post.title?.rendered ?? post.title ?? '');
    const excerpt = plain(post.excerpt?.rendered ?? post.summary ?? '');
    const date = post.date ?? post.publishedAt;
    const published = contentDate(date);
    return `<article><h2><a href="/blog/${esc(post.slug)}">${esc(title)}</a></h2>${published ? `<time datetime="${esc(date)}">${esc(published)}</time>` : ''}${excerpt ? `<p>${esc(excerpt)}</p>` : ''}</article>`;
  }).join('');

  return {
    status: 200,
    title: 'NDIS updates and practical insights | SolDirectory',
    description: 'Independent explainers on NDIS changes, provider responsibilities and practical support decisions, with links to official sources.',
    canonical: path,
    noindex: posts.length === 0,
    jsonLd: [
      breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Updates and insights', path }]),
      { id: 'blog-archive', data: { '@type': 'Blog', name: 'SolDirectory updates and insights', url: `${site}${path}`, blogPost: posts.map((post: any) => ({ '@type': 'BlogPosting', headline: plain(post.title?.rendered ?? post.title ?? ''), url: `${site}/blog/${post.slug}`, datePublished: post.date ?? post.publishedAt })) } },
    ],
    body:
      `<nav aria-label="Breadcrumb"><a href="/">Home</a> / Updates and insights</nav>` +
      `<h1>NDIS updates and practical insights</h1>` +
      `<p>Independent explainers and practical guidance for people navigating disability and aged care support in Australia. We link to official sources and note when guidance was published or updated. Confirm current rules directly with the responsible agency.</p>` +
      (articleLinks || `<p>New explainers and practical updates will appear here. In the meantime, <a href="/guides">browse our guides</a> and confirm current information with official sources.</p>`),
  };
}

function wordpressBlogArticlePage(site: string, post: any): Page {
  const title = plain(post.title?.rendered ?? '');
  if (!title) return notFound();
  const excerpt = plain(post.excerpt?.rendered ?? '');
  const description = trimTo(post.meta?.seo_description || post.yoast_head_json?.description || excerpt || `${title} | SolDirectory`, 158);
  const path = `/blog/${post.slug}`;
  const categories = (post._embedded?.['wp:term'] ?? []).flat()
    .filter((term: any) => term?.taxonomy === 'category' && term.name)
    .map((term: any) => term.name);
  const image = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const published = post.date || post.date_gmt;
  const modified = post.modified || published;

  return {
    status: 200,
    title: post.meta?.seo_title || post.yoast_head_json?.title || `${title} | SolDirectory`,
    description,
    canonical: path,
    noindex: post.meta?.seo_noindex === true || post.meta?.seo_noindex === '1' || post.yoast_head_json?.robots?.index === 'noindex',
    ogImage: post.meta?.seo_og_image || image,
    ogType: 'article',
    articleTimes: { published: published || undefined, modified: modified || undefined, section: categories[0] },
    jsonLd: [
      breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Updates and insights', path: '/blog' }, { name: title, path }]),
      { id: 'blog-post', data: {
        '@type': 'BlogPosting', headline: title, description, datePublished: published, dateModified: modified,
        inLanguage: 'en-AU', isAccessibleForFree: true,
        author: { '@type': 'Organization', name: 'SolDirectory' },
        publisher: { '@type': 'Organization', name: 'SolDirectory', url: `${site}/` },
        mainEntityOfPage: `${site}${path}`, url: `${site}${path}`,
        ...(image ? { image: [image] } : {}),
        ...(categories.length ? { articleSection: categories } : {}),
      } },
    ],
    body:
      `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog">Updates and insights</a> / ${esc(title)}</nav>` +
      `<article><h1>${esc(title)}</h1>` +
      `${published ? `<p><time datetime="${esc(published)}">Published ${esc(contentDate(published))}</time>${modified && modified !== published ? ` · Updated ${esc(contentDate(modified))}` : ''}</p>` : ''}` +
      `${categories.length ? `<p>${categories.map((category: string) => esc(category)).join(' · ')}</p>` : ''}` +
      `${safeWordPressBlocks(post.content?.rendered ?? '')}` +
      `<p>NDIS rules and support arrangements can change. <a href="/guides">Browse SolDirectory guides</a> and confirm current requirements with official sources.</p></article>`,
  };
}

function editorialBlogPage(site: string, editorial: EditorialBlogPost): Page {
  // A source can be checked earlier in the day than the article goes out; the modified time is never before the published time.
  const modifiedAt = Date.parse(editorial.checkedAt) >= Date.parse(editorial.publishedAt) ? editorial.checkedAt : editorial.publishedAt;
  const expired = !!editorial.expiresAt && new Date(editorial.expiresAt).getTime() <= Date.now();
  const path = `/blog/${editorial.slug}`;
  return {
    status: 200,
    title: `${editorial.seoTitle ?? editorial.title} | SolDirectory`,
    description: trimTo(editorial.seoDescription ?? editorial.summary, 158),
    canonical: path,
    noindex: expired,
    ogImage: `${site}${editorial.coverImage}`,
    ogImageAlt: editorial.coverAlt,
    ogType: 'article',
    articleTimes: { published: editorial.publishedAt, modified: modifiedAt, section: editorial.category },
    jsonLd: [
      breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Updates and insights', path: '/blog' }, { name: editorial.title, path }]),
      { id: 'blog-post', data: {
        '@type': 'BlogPosting', headline: editorial.title, description: editorial.summary,
        datePublished: editorial.publishedAt, dateModified: modifiedAt,
        inLanguage: 'en-AU', isAccessibleForFree: true,
        wordCount: editorial.sections.reduce((n, sec) => n + sec.paragraphs.join(' ').split(/\s+/).filter(Boolean).length, 0),
        author: { '@type': 'Organization', name: 'SolDirectory' },
        publisher: { '@type': 'Organization', name: 'SolDirectory', url: `${site}/` },
        mainEntityOfPage: `${site}${path}`, url: `${site}${path}`,
        publishingPrinciples: `${site}/editorial-standards`,
        image: [`${site}${editorial.coverImage}`], articleSection: editorial.category,
      } },
      ...(editorial.faq?.length
        ? [{ id: 'blog-faq', data: { '@type': 'FAQPage', mainEntity: editorial.faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) } }]
        : []),
    ],
    body:
      `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog">Updates and insights</a> / ${esc(editorial.title)}</nav>` +
      `<article><h1>${esc(editorial.title)}</h1>` +
      `<p><time datetime="${esc(editorial.publishedAt)}">Published ${esc(contentDate(editorial.publishedAt))}</time> · ${esc(editorial.category)} · Source checked ${esc(contentDate(editorial.checkedAt))}</p>` +
      `<p>${esc(editorial.summary)}</p>` +
      (expired ? `<p><strong>This time-sensitive notice has passed. Check the official source for current information.</strong></p>` : '') +
      editorialBlogContent(editorial) + `</article>`,
  };
}

async function blogArticlePage(site: string, slug: string): Promise<Page> {
  if (!SLUG_RE.test(slug) || slug === 'hello-world') return notFound();
  const editorial = EDITORIAL_BLOG_POSTS.find((item) => item.slug === slug);
  let post: any = null;
  try {
    // An article we hold ourselves never waits long for WordPress: if the CMS is slow, our own copy is served.
    post = await fetchWpItem('posts', slug, editorial ? 2500 : 6000);
  } catch (error) {
    if (!editorial) throw error;
  }
  if (post?.status === 'publish') return wordpressBlogArticlePage(site, post);
  return editorial ? editorialBlogPage(site, editorial) : notFound();
}

async function genericWpPage(site: string, restBase: 'pages' | 'locations', slug: string): Promise<Page> {
  if (!SLUG_RE.test(slug)) return notFound();
  const item = await fetchWpItem(restBase, slug);
  if (!item) return notFound();

  const meta = item.meta ?? {};
  const value = (key: string) => (typeof meta[key] === 'string' ? plain(meta[key]) : '');
  const title = plain(item.title?.rendered ?? '');
  if (!title) return notFound();
  const prefix = restBase === 'locations' ? '/locations' : '';
  const path = `${prefix}/${item.slug}`;
  const excerpt = plain(item.excerpt?.rendered ?? '');
  const authored = [
    plain(item.content?.rendered ?? ''), value('hero_description'), value('short_answer'),
    value('overview_content'), value('who_for'), value('eligibility'), value('funding_info'),
    value('plan_management_info'), value('cost_info'), value('typical_session'),
  ].filter((text, index, all) => text && all.indexOf(text) === index);
  const description = trimTo(value('seo_description') || excerpt || authored[0] || `${title} on SolDirectory.`, 160);
  const noindex = meta.seo_noindex === true || meta.seo_noindex === '1';
  const parentName = restBase === 'locations' ? 'Locations' : null;
  const crumbs = [
    { name: 'Home', path: '/' },
    ...(parentName ? [{ name: parentName, path: '/locations' }] : []),
    { name: title, path },
  ];

  return {
    status: 200,
    title: value('seo_title') || seoTitle(title),
    description,
    canonical: path,
    noindex,
    ogImage: typeof meta.seo_og_image === 'string' && meta.seo_og_image ? meta.seo_og_image : undefined,
    jsonLd: [
      breadcrumbLd(site, crumbs),
      { id: 'wp-page', data: { '@type': 'WebPage', name: title, description, url: `${site}${path}`, isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: site } } },
    ],
    body:
      `<nav aria-label="Breadcrumb">${crumbs.map((crumb, index) => index < crumbs.length - 1 ? `<a href="${esc(crumb.path)}">${esc(crumb.name)}</a>` : esc(crumb.name)).join(' / ')}</nav>` +
      `<h1>${esc(value('hero_headline') || title)}</h1>` +
      (excerpt ? `<p>${esc(excerpt)}</p>` : '') +
      authored.map((paragraph, index) => `${index === 0 ? '<h2>Overview</h2>' : ''}<p>${esc(paragraph)}</p>`).join('') +
      `<h2>Continue your search</h2><p><a href="/find-a-provider">Find providers</a>, <a href="/services">browse support services</a>, or <a href="/locations">explore provider locations</a>.</p>`,
  };
}

// ---------------------------------------------------------------
// Real service x suburb pages — /services/:serviceSlug/:state/:suburb
// (ServiceLocationPage.tsx). Only exists for a (service, suburb) pair
// with genuine register demand (computeServiceSuburbs, MIN_SUBURB_LISTINGS
// already applied) — a combination with no real demand 404s rather than
// serving a thin, content-free page. Real providers (Provider DB) and
// real register listings (both registers) are shown first; the rest is
// the same generic buyer-guidance content ServiceLocationPage.tsx shows
// as its own fallback (servicePageFixtures.ts) when no WordPress post
// has been authored for this exact combination — duplicated here in
// plain HTML rather than imported, since apps/api and apps/web are
// built and run separately.
// ---------------------------------------------------------------
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const slugifyService = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Same one-line service descriptions already published on the homepage
// (SupportFinder.tsx SUPPORTS array) — reused here rather than invented,
// so the wording matches what the site already says elsewhere.
const SVC_DESCRIPTION: Record<string, string> = {
  'Support coordination': 'Helps participants understand their plan, connect with providers and put supports in place.',
  'Personal care': 'Assistance with showering, dressing, medication and other daily personal activities.',
  'Domestic assistance': 'Help with cleaning, laundry, meal preparation and other household tasks.',
  'Therapy services': 'Occupational therapy, physiotherapy, speech pathology and other allied health supports.',
  Transport: 'Assistance to travel to appointments, work, study and community activities.',
  'Housing (SDA & SIL)': 'Specialist Disability Accommodation (SDA) and Supported Independent Living (SIL) providers.',
  Nursing: 'In-home clinical nursing, wound care and complex health supports.',
  'Plan management': 'Manages invoices, payments and budget tracking so you can use your funding with any provider.',
};

const SVC_COMPARE: [string, string, string][] = [
  ['Registration and qualifications', 'Check that the provider, and the worker who will attend, hold the registration and qualifications the support requires.', 'Who will deliver my supports, and what registration and qualifications do they hold?'],
  ['Worker screening and safeguards', 'Providers delivering NDIS supports are responsible for the screening of their workers and for how incidents and complaints are handled.', 'How do you screen your workers, and how do you handle incidents or complaints?'],
  ['Availability and continuity', 'A directory listing does not prove current capacity. Ask about start dates, rostering and cover when a regular worker is unavailable.', 'When could you start, and what happens if my regular worker is away?'],
  ['Pricing and funding', 'Rates and what is included can differ between providers. Ask for a written service agreement before supports begin.', 'What are your rates, what is included, and do you accept my funding type?'],
];

async function serviceLocationPage(site: string, serviceSlug: string, stateSlug: string, suburbSlug: string): Promise<Page> {
  const service = REAL_SERVICES.find((s) => slugifyService(s) === serviceSlug);
  if (!service) return notFound();
  const code = (Object.entries(STATE_SLUGS).find(([, slug]) => slug === stateSlug) ?? [])[0];
  if (!code || !SLUG_RE.test(suburbSlug)) return notFound();

  // Real demand only: a combination the register doesn't actually
  // support isn't given a page — same quality bar as the register's
  // own suburb hub pages (MIN_SUBURB_LISTINGS).
  const suburbs = await computeServiceSuburbs(service);
  const row = suburbs.find((s) => s.state === code && s.slug === suburbSlug);
  if (!row) return { ...notFound(), title: `${service} providers | SolDirectory` };

  const suburbName = row.suburb;
  const stateName = STATE_NAMES[code] ?? code;
  const serviceLower = service.toLowerCase();
  const path = `/services/${serviceSlug}/${stateSlug}/${suburbSlug}`;
  const editorial = serviceEditorialFor(service);

  const providerFilter = {
    accountStatus: 'active', listingPaused: { $ne: true },
    registrationGroups: new RegExp(`^${escapeRegex(service)}$`, 'i'),
    serviceSuburbs: new RegExp(`^\\s*${escapeRegex(suburbName)}\\s*$`, 'i'),
  };
  const [providerTotal, providerDocs, ndisListings, agedListings, ndisTotal, agedTotal] = await Promise.all([
    Provider.countDocuments(providerFilter),
    findProvidersPaidFirst<any>(providerFilter, 'legalEntityName tradingName slug registrationGroups', { limit: 12 }),
    RegisterListing.find({ type: 'ndis', supportCategories: service, areas: { $elemMatch: { state: code, suburbSlug } } }).select('slug name supportCategories areaCount').limit(6).lean(),
    RegisterListing.find({ type: 'aged_care', supportCategories: service, areas: { $elemMatch: { state: code, suburbSlug } } }).select('slug name supportCategories areaCount').limit(6).lean(),
    RegisterListing.countDocuments({ type: 'ndis', supportCategories: service, areas: { $elemMatch: { state: code, suburbSlug } } }),
    RegisterListing.countDocuments({ type: 'aged_care', supportCategories: service, areas: { $elemMatch: { state: code, suburbSlug } } }),
  ]);

  const registerTotal = row.count;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: service, path: `/services/${serviceSlug}` },
    { name: `${suburbName}, ${code}`, path },
  ];

  const providersHtml = providerTotal > 0
    ? `<h2>SolDirectory providers</h2><p>${fmt(providerTotal)} SolDirectory ${providerTotal === 1 ? 'provider offers' : 'providers offer'} ${esc(serviceLower)} and services ${esc(suburbName)}.</p><ul>${providerDocs.map((p: any) => li(`/directory/${p.slug}`, p.tradingName || p.legalEntityName, (p.registrationGroups ?? []).slice(0, 3).join(', '))).join('')}</ul>`
    : `<h2>SolDirectory providers</h2><p>No SolDirectory providers have registered ${esc(serviceLower)} for ${esc(suburbName)} yet. Send a free request and any provider who covers this area and support can respond.</p>`;

  // One section per register, as the page shows them (RegisterNearby.tsx), each with its own count and listings.
  const registerHtml = [
    { type: 'ndis' as const, kindPath: 'ndis-providers' as const, listings: ndisListings },
    { type: 'aged_care' as const, kindPath: 'aged-care-providers' as const, listings: agedListings },
  ].filter((r) => r.listings.length > 0).map((r) => {
    const k = KINDS[r.kindPath];
    return `<h2>${esc(k.label)} register listings for ${esc(serviceLower)} in ${esc(suburbName)}</h2>` +
      `<p>${fmt(r.type === 'ndis' ? ndisTotal : agedTotal)} ${esc(k.plain)} ${(r.type === 'ndis' ? ndisTotal : agedTotal) === 1 ? 'listing includes' : 'listings include'} ${esc(serviceLower)} among the supports recorded on the ${esc(k.register)} for ${esc(suburbName)}, ${esc(code)}. A register listing shows what the register says, not who currently has capacity.</p>` +
      `<ul>${r.listings.map((d: any) => li(`/${r.kindPath}/${d.slug}`, registerName(d), (d.supportCategories ?? []).slice(0, 3).join(', '))).join('')}</ul>` +
      `<p><a href="/${r.kindPath}/${stateSlug}/${suburbSlug}?category=${encodeURIComponent(service)}">See all ${fmt(r.type === 'ndis' ? ndisTotal : agedTotal)} ${esc(k.plain)} providers listed in ${esc(suburbName)}</a></p>`;
  }).join('');

  // Other supports with a page here: the register listings in this suburb, counted by support (computeAreaSupports),
  // limited to the supports that have an indexed page for this suburb.
  const areaSupports = await computeAreaSupports(code, suburbSlug);
  const supportRows = areaSupports
    .filter((r) => r.category !== service && r.count >= MIN_INDEXABLE_SERVICE_LOCATION && (REAL_SERVICES as readonly string[]).includes(r.category))
    .slice(0, 12);
  const relatedServicesHtml = supportRows.length
    ? `<h2>Other supports listed in ${esc(suburbName)}</h2><p>Each number is how many register listings in ${esc(suburbName)} list that support.</p>` +
      `<ul>${supportRows.map((r) => li(`/services/${slugifyService(r.category)}/${stateSlug}/${suburbSlug}`, `${r.category} in ${suburbName}`, `(${fmt(r.count)})`)).join('')}</ul>`
    : '';
  const otherSuburbs = suburbs.filter((s) => s.state === code && s.slug !== suburbSlug && s.count >= MIN_INDEXABLE_SERVICE_LOCATION).slice(0, 12);
  const otherSuburbsHtml = otherSuburbs.length
    ? `<h2>${esc(service)} in other ${esc(stateName)} suburbs</h2><ul>${otherSuburbs.map((s) => li(`/services/${serviceSlug}/${stateSlug}/${s.slug}`, `${service} in ${s.suburb}`, `(${fmt(s.count)})`)).join('')}</ul>`
    : '';

  const description = providerTotal > 0
    ? `${fmt(providerTotal)} SolDirectory ${providerTotal === 1 ? 'provider offers' : 'providers offer'} ${serviceLower} in ${suburbName}${registerTotal > 0 ? `, plus ${fmt(registerTotal)} organisations listed on the public register` : ''}. Compare options and get matched for free.`
    : `${fmt(registerTotal)} organisations on the public NDIS and My Aged Care registers list ${serviceLower} for ${suburbName}, ${code}. Browse supports, compare options and get matched for free.`;
  // The full guide lives on the service's own page (/services/<service>). Here: the short answer, what it may include, and
  // the link, so a suburb page is mostly about the suburb.
  const editorialHtml = editorial
    ? `<h2>${esc(service)} at a glance</h2>` +
      `<p>${esc(editorial.shortAnswer)}</p>` +
      `<h3>What ${esc(serviceLower)} may include</h3><ul>${editorial.includes.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` +
      `<p><a href="/services/${serviceSlug}">Read the full guide to ${esc(serviceLower)}</a>: planning, funding, questions to ask and official information.</p>`
    : '';

  const body =
    `<nav aria-label="Breadcrumb">${crumbs.map((c, i) => (i < crumbs.length - 1 ? `<a href="${esc(c.path)}">${esc(c.name)}</a>` : esc(c.name))).join(' / ')}</nav>` +
    `<h1>Home ${esc(serviceLower)} providers in ${esc(suburbName)}, ${esc(stateName)}</h1>` +
    `<p>This page lists ${esc(serviceLower)} providers and register listings covering ${esc(suburbName)}, ${esc(code)}` +
    `${registerTotal > 0 ? ` — ${fmt(registerTotal)} organisation${registerTotal === 1 ? '' : 's'} on the public NDIS and My Aged Care registers list ${esc(serviceLower)} among their supports for this area` : ''}` +
    `${providerTotal > 0 ? `, and ${fmt(providerTotal)} SolDirectory ${providerTotal === 1 ? 'provider currently offers' : 'providers currently offer'} it here` : ''}.` +
    ` Providers set their own supports, service areas and availability, and confirm their capacity each week. Before you engage a provider, confirm their registration, insurance and worker screening directly with them.</p>` +
    (SVC_DESCRIPTION[service] ? `<h2>About ${esc(serviceLower)}</h2><p>${esc(SVC_DESCRIPTION[service])} People in ${esc(suburbName)} and the surrounding ${esc(stateName)} area can search for a provider below, or send a free request and let providers who cover this area respond directly.</p>` : '') +
    providersHtml +
    `<p>Eligible Pro and Growth members are shown before Starter members, alphabetically within each group. Placement is not endorsement; compare suitability, safeguards, availability, fees and service terms directly.</p>` +
    registerHtml +
    editorialHtml +
    `<h2>What to compare before choosing</h2><p>Use these ${esc(serviceLower)}-specific checks when you contact providers in ${esc(suburbName)}. Confirm each answer directly: a directory listing does not prove current capacity.</p>` +
    SVC_COMPARE.map(([t, b, ask]) => `<h3>${esc(t)}</h3><p>${esc(b)}</p><p><strong>Ask:</strong> ${esc(ask)}</p>`).join('') +
    relatedServicesHtml + otherSuburbsHtml +
    `<p><a href="/find-a-provider?service=${encodeURIComponent(service)}">See all ${esc(serviceLower)} providers</a></p>`;

  return {
    status: 200,
    title: (() => {
      const fullTitle = `${service} providers in ${suburbName}, ${code}`;
      const compactTitle = `${service} in ${suburbName}, ${code}`;
      return seoTitle(fullTitle.length <= 50 ? fullTitle : compactTitle);
    })(),
    description: trimTo(description, 158),
    canonical: path,
    // Reachable and linked, but not indexed, until there are enough listings to add something to the suburb's own page.
    noindex: registerTotal < MIN_INDEXABLE_SERVICE_LOCATION,
    jsonLd: [
      breadcrumbLd(site, crumbs),
      { id: 'service-location', data: {
        '@type': 'Service', name: `${service} in ${suburbName}, ${code}`, serviceType: service,
        areaServed: { '@type': 'City', name: suburbName, containedInPlace: { '@type': 'State', name: stateName } },
        provider: { '@type': 'Organization', name: 'SolDirectory', url: `${site}/` },
      } },
    ],
    body,
  };
}

async function canonicalServiceLocationPath(serviceSlug: string, suburbSlug: string): Promise<string | null> {
  const service = REAL_SERVICES.find((item) => slugifyService(item) === serviceSlug);
  if (!service || !SLUG_RE.test(suburbSlug)) return null;
  const matches = (await computeServiceSuburbs(service)).filter((row) => row.slug === suburbSlug);
  if (matches.length !== 1) return null;
  return `/services/${serviceSlug}/${matches[0].state.toLowerCase()}/${suburbSlug}`;
}

const LEGACY_SERVICE_REDIRECTS: Record<string, string> = {
  'response-time-data': '/support-coordinators#provider-checks',
};

/** Supports offered as tiles on /independent-workers, and the three whose suburbs it lists. */
const WORKER_SUPPORTS = ['Personal care', 'Domestic assistance', 'Transport', 'Therapy services', 'Nursing'];
const WORKER_BY_SUPPORT = ['Personal care', 'Domestic assistance', 'Transport'];

/**
 * /independent-workers. Mirrors apps/web/src/pages/public/IndependentWorkers.tsx and its extras (WorkerExtras): the same
 * heading, introduction and data-driven sections. The profile, steps, safeguards, guides and questions arrive from the
 * shared reading copy (hubCopy), which is appended to this body.
 */
async function workersPage(site: string): Promise<Page> {
  const hub = await hubFor('ndis');
  const bySupport = await Promise.all(WORKER_BY_SUPPORT.map(async (service) => ({ service, rows: (await computeServiceSuburbs(service)).slice(0, 6) })));
  const shownBySupport = bySupport.filter((s) => s.rows.length > 0);
  const path = '/independent-workers';
  return {
    status: 200,
    title: WORKER_PAGE_TITLE,
    description: WORKER_PAGE_DESCRIPTION,
    canonical: path,
    noindex: false,
    jsonLd: [
      breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Independent workers', path }]),
      {
        id: 'independent-workers-page',
        data: {
          '@type': 'WebPage', name: 'Create a professional profile for independent support work', description: WORKER_PAGE_DESCRIPTION, url: `${site}${path}`,
          inLanguage: 'en-AU', dateModified: WORKER_PAGE_UPDATED,
          isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: site },
          publisher: { '@type': 'Organization', name: 'SolDirectory', url: `${site}/` },
        },
      },
    ],
    body:
      `<nav aria-label="Breadcrumb"><a href="/">Home</a> / Independent workers</nav><h1>Create a professional profile for independent support work</h1>` +
      `<p>Present your services, experience, location and availability in one profile. Eligible provider organisations can search the worker directory and contact you.</p>` +
      `<h2>Join the worker directory</h2><ul>${WORKER_HERO_CHECKS.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` +
      `<p><a href="/signup?type=worker">Create a worker profile</a>. Already registered? <a href="/login">Worker login</a> · <a href="/independent-workers/find">Browse worker profiles</a></p>` +
      `<h2>Supports you can offer</h2><p>Choose the supports that match your skills, experience and checks. Each page explains what the support involves and where organisations are listed for it.</p>` +
      `<ul>${WORKER_SUPPORTS.map((name) => li(`/services/${slugifyService(name)}`, name)).join('')}</ul>` +
      (hub.suburbs.length
        ? `<h2>Suburbs with the most organisations on the NDIS register</h2><p>The number beside each suburb is how many organisations the public NDIS register lists there. It shows where organisations are based, not how much work there is, and a busy suburb can also mean more workers looking for the same work.</p>` +
          `<ul>${hub.suburbs.slice(0, 18).map((s) => li(`/ndis-providers/${s.state.toLowerCase()}/${s.slug}`, `${s.suburb}, ${s.state}`, `(${fmt(s.count)})`)).join('')}</ul>`
        : '') +
      (shownBySupport.length
        ? `<h2>Where each kind of support is listed</h2>` +
          shownBySupport.map(({ service, rows }) =>
            `<h3>${esc(service)}</h3><ul>${rows.map((r) => li(`/services/${slugifyService(service)}/${r.state.toLowerCase()}/${r.slug}`, `${r.suburb}, ${r.state}`)).join('')}</ul>` +
            `<p><a href="/services/${slugifyService(service)}">About ${esc(service.toLowerCase())} →</a></p>`).join('')
        : '') +
      `<h2>Independent support work by state and territory</h2><p>Start with the state where you live, then look at its capital and regional centres to see which organisations are listed near you.</p>` +
      `<ul>${STATE_CENTRES.filter((c) => STATE_NAMES[c.code]).map((c) => `<li><a href="/ndis-providers/${c.code.toLowerCase()}">${esc(STATE_NAMES[c.code])}</a>: ${esc(c.capital)}${c.centres.length ? `, ${esc(c.centres.slice(0, 4).join(', '))} and more` : ''}</li>`).join('')}</ul>` +
      `<p>Prefer to search by suburb or postcode? <a href="/locations">Browse all locations</a>.</p>` +
      `<h2>Create your Independent Worker profile</h2><p>Register your professional details and make your profile available in the worker directory.</p>` +
      `<p><a href="/signup?type=worker">Register as an Independent Worker</a></p>`,
  };
}

/** GET /seo-shell/<original path>?<original query> — see the file comment. */
export async function registerShell(req: Request, res: Response) {
  const url = new URL(req.originalUrl, 'http://x');
  const parts = url.pathname.replace(/^\/seo-shell/, '').split('/').filter(Boolean).map((p) => p.toLowerCase());
  const site = siteUrl(req);
  const pageNum = /^\d{1,4}$/.test(url.searchParams.get('page') ?? '') ? Math.max(1, Number(url.searchParams.get('page'))) : 1;

  let page: Page;
  const root = parts[0];
  if (!root && parts.length === 0) {
    page = publicMarketingPage(site, 'home');
  } else if (root === 'find-a-provider' && parts.length === 1) {
    page = publicMarketingPage(site, 'find');
  } else if (root === 'services' && parts.length === 1) {
    page = publicMarketingPage(site, 'services');
  } else if (root === 'locations' && parts.length === 1) {
    page = publicMarketingPage(site, 'locations');
  } else if (root === 'locations' && parts.length === 2) {
    try {
      page = await genericWpPage(site, 'locations', parts[1]);
    } catch (e) {
      if (e instanceof WordPressUnavailable) return res.status(502).send('Content service unavailable');
      throw e;
    }
  } else if (root === 'providers' && parts.length === 1) {
    page = publicMarketingPage(site, 'providers');
  } else if (root === 'independent-workers' && parts.length === 1) {
    page = await workersPage(site);
  } else if (root === 'services' && parts.length === 2) {
    try {
      page = await servicePage(site, parts[1]);
    } catch (e) {
      // WordPress is down or broken: don't answer 404 (the page may well exist) - nginx then serves the plain app.
      if (e instanceof WordPressUnavailable) return res.status(502).send('Content service unavailable');
      throw e;
    }
  } else if (root === 'services' && parts.length === 4) {
    page = await serviceLocationPage(site, parts[1], parts[2], parts[3]);
  } else if (root === 'services' && parts.length === 3) {
    const legacyRedirect = LEGACY_SERVICE_REDIRECTS[parts[1]];
    if (legacyRedirect) return res.redirect(301, `${site}${legacyRedirect}`);
    const canonical = await canonicalServiceLocationPath(parts[1], parts[2]);
    if (!canonical) return res.status(404).send('Not found');
    return res.redirect(301, `${site}${canonical}`);
  } else if (root === 'condition' && parts.length === 2) {
    // Permalink-style: /condition/:slug/ (its own top-level category
    // prefix, not nested under /directory — see AppRoutes.tsx).
    page = await providerFilterPage(site, 'condition', parts[1], pageNum);
  } else if (root === 'condition' && parts.length === 1) {
    page = await conditionsHubPage(site);
  } else if (root === 'funding' && parts.length === 2) {
    page = fundingTopicPage(site, parts[1]);
  } else if (root === 'funding' && parts.length === 1) {
    page = fundingHubPage(site);
  } else if (root === 'guides' && parts.length === 2) {
    page = guidePage(site, parts[1]);
  } else if (root === 'guides' && parts.length === 1) {
    page = guidesHubPage(site);
  } else if (root === 'language' && parts.length === 2) {
    page = await languageTopicPage(site, parts[1], pageNum);
  } else if (root === 'language' && parts.length === 1) {
    page = languageHubPage(site);
  } else if (root === 'support-coordinators' && parts.length === 1) {
    page = supportCoordinatorsPage(site);
  } else if (root === 'blog' && parts.length === 1) {
    try {
      page = await blogArchivePage(site);
    } catch (error) {
      if (error instanceof WordPressUnavailable) return res.status(502).send('Content service unavailable');
      throw error;
    }
  } else if (root === 'blog' && parts.length === 2) {
    try {
      page = await blogArticlePage(site, parts[1]);
    } catch (error) {
      if (error instanceof WordPressUnavailable) return res.status(502).send('Content service unavailable');
      throw error;
    }
  } else if (root === 'directory' && parts.length === 3 && parts[1] === 'in') {
    page = await providerFilterPage(site, 'area', parts[2], pageNum);
  } else if (root === 'directory' && parts.length === 2) {
    page = await providerProfilePage(site, parts[1]);
  } else if (root === 'independent-workers' && parts.length === 2) {
    page = parts[1] === 'find'
      ? await workerListPage(site, pageNum, ['service', 'suburb', 'q'].some((k) => url.searchParams.has(k)))
      : await workerProfilePage(site, parts[1]);
  } else if (root in KINDS && parts.length <= 3) {
    const kindPath = root as KindPath;
    const filtered = ['category', 'q'].some((k) => url.searchParams.has(k));
    if (parts.length === 1) page = await hubPage(site, kindPath);
    else if (parts.length === 3 || STATE_CODES.includes(parts[1].toUpperCase() as never)) page = await listPage(site, kindPath, parts[1], parts[2] ?? null, pageNum, filtered);
    else page = await providerPage(site, kindPath, parts[1]);
  } else if (parts.length === 1 && (await prerenderedPage(parts[0]))) {
    // A page the web build wrote as static HTML (glossary, editorial standards): serve that file, with a 200.
    const html = await prerenderedPage(parts[0]);
    return res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' }).send(html);
  } else if (parts.length === 1 && parts[0] === 'photo-credits') {
    page = {
      status: 200,
      title: 'Photo credits | SolDirectory',
      description: 'Credits for the photographs used across SolDirectory.',
      canonical: '/photo-credits',
      noindex: false,
      jsonLd: [breadcrumbLd(site, [{ name: 'Home', path: '/' }, { name: 'Photo credits', path: '/photo-credits' }])],
      body: '<nav aria-label="Breadcrumb"><a href="/">Home</a> / Photo credits</nav><h1>Photo credits</h1><p>Credits for the photographs used across SolDirectory, with a link to each photographer and the photo it came from.</p>',
    };
  } else if (parts.length === 1) {
    try {
      page = await genericWpPage(site, 'pages', parts[0]);
    } catch (e) {
      if (e instanceof WordPressUnavailable) return res.status(502).send('Content service unavailable');
      throw e;
    }
  } else {
    return res.status(404).send('Not found');
  }

  let html: string;
  try { html = await loadShell(); } catch { return res.status(503).send('Web build not found'); }

  res.status(page.status).set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' });
  res.send(render(html, req, page, site));
}
