/**
 * Build step that runs after `vite build`: writes a real HTML file, with the
 * page's own <title>, description, canonical, social tags, JSON-LD and a plain
 * copy of its content, for every page that never changes per request — home,
 * the hub pages, the guides and the funding topics.
 *
 * Why: the app is a client-rendered SPA, so for these pages a crawler (or a
 * link-preview scraper) that doesn't run JavaScript got one generic empty
 * shell. The pages that DO vary (register listings, providers, services,
 * conditions) are rendered per request by the API instead — see
 * apps/api/src/controllers/registerShell.controller.ts.
 *
 * Files are written to dist/<path>/index.html and served by nginx's
 * `try_files $uri $uri/index.html /index.html` (deploy/nginx-soldirectory.conf),
 * which answers /funding/x and /funding/x/ alike with no redirect. The home
 * page is written to dist/home.html (NOT dist/index.html, which the API reuses
 * as the generic template for every other page) and picked up by
 * `location = / { try_files /home.html /index.html; }`. The app replaces #root when it starts, so people see
 * the normal page — the content is the same, not something shown only to bots.
 *
 * Content comes from the same shared package and data files the pages read,
 * bundled on the fly with esbuild, so there is one copy of the words.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';
import { build } from 'esbuild';
import { loadEnv } from 'vite';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(webRoot, 'dist');
const env = loadEnv('production', webRoot, 'VITE_');
const site = (process.env.SITE_URL || env.VITE_SITE_URL || '').replace(/\/$/, '');

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('[prerender] dist/index.html not found — run `vite build` first.');
  process.exit(1);
}
if (!site) {
  console.warn('[prerender] No SITE_URL / VITE_SITE_URL set: skipping, because canonical and social URLs must be absolute.');
  process.exit(0);
}

/** Bundles a TS data module (and what it imports) to a temp ESM file and loads it. */
async function loadTs(relPath) {
  const out = path.join(os.tmpdir(), `prerender-${path.basename(relPath)}-${process.pid}.mjs`);
  await build({ entryPoints: [path.join(webRoot, relPath)], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'silent' });
  const mod = await import(`${pathToFileURL(out).href}?t=${Date.now()}`);
  fs.rmSync(out, { force: true });
  return mod;
}

const {
  GUIDE_DOCS, fundingShellEditorial, FUNDING_SEO_DESCRIPTIONS, EDITORIAL_BLOG_POSTS, GLOSSARY, EDITORIAL_STANDARDS,
  INDEPENDENT_WORKER_FAQS, PROVIDER_FAQS, WORKER_PAGE_GUIDES, PROVIDER_PAGE_GUIDES, WORKER_SETUP_STEPS, PROVIDER_LISTING_CHECKS,
} = await import(pathToFileURL(path.resolve(webRoot, '../../packages/topic-content/index.js')).href);
const { FUNDING_CATEGORY_GROUPS, FUNDING_CONTENT } = await loadTs('src/data/fundingContent.ts');
const { STATIC_MEGA_MENU_FALLBACK } = await loadTs('src/data/staticMegaMenuFallback.ts');

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const trim = (s, n) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…`);
const a = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;
const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
// The breadcrumb is a list, with the current page marked, as on the visible pages.
const crumbs = (items) => `<nav aria-label="Breadcrumb"><ol>${items.map((c, i) => (c.to ? `<li>${a(c.to, c.label)}</li>` : `<li${i === items.length - 1 ? ' aria-current="page"' : ''}>${esc(c.label)}</li>`)).join('')}</ol></nav>`;

// Links to another site carry rel="noopener noreferrer", as on the visible pages; other rel tokens are kept.
const externalLinkRel = (html, siteUrl) => html.replace(/<a ([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/g, (whole, pre, href, post) => {
  if (href.startsWith(siteUrl)) return whole;
  const attrs = `${pre}${post}`;
  const existing = /rel="([^"]*)"/.exec(attrs);
  const tokens = new Set((existing ? existing[1] : '').split(/\s+/).filter(Boolean));
  tokens.add('noopener');
  tokens.add('noreferrer');
  const others = attrs.replace(/\s*rel="[^"]*"/, '').trim();
  return `<a href="${href}" rel="${[...tokens].join(' ')}"${others ? ` ${others}` : ''}>`;
});
const SHARE_IMAGE = `${site}/images/share-default.jpg`;

const STATES = [['nsw', 'New South Wales'], ['vic', 'Victoria'], ['qld', 'Queensland'], ['wa', 'Western Australia'], ['sa', 'South Australia'], ['tas', 'Tasmania'], ['act', 'Australian Capital Territory'], ['nt', 'Northern Territory']];
const serviceTab = STATIC_MEGA_MENU_FALLBACK.find((t) => t.key === 'service');
const allServiceLinks = serviceTab.columns.flatMap((c) => c.links);
const breadcrumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${site}${it.path}` })),
});


// Blog articles a page links to, as "title: summary" links, and its questions as FAQ markup, from the same copy the page reads.
const articleList = (slugs) => ul(slugs
  .map((slug) => EDITORIAL_BLOG_POSTS.find((post) => post.slug === slug))
  .filter(Boolean)
  .map((post) => `${a(`/blog/${post.slug}`, post.title)}: ${esc(post.summary)}`));
const faqHtml = (faqs) => faqs.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join('');
const faqLd = (faqs) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
});

const pages = [];

// ---- Home ----
pages.push({
  file: 'home.html',
  path: '/',
  title: 'SolDirectory — Find NDIS and aged care providers',
  description: 'Find disability and aged care providers who have capacity, matched to your suburb, funding and support needs. Free for families, participants and coordinators.',
  jsonLd: [
    { '@type': 'WebSite', name: 'SolDirectory', url: `${site}/` },
    { '@type': 'Organization', name: 'SolDirectory', url: `${site}/`, logo: `${site}/images/sol-directory-logo-black-transparent-v2.png` },
  ],
  body:
    '<h1>Find NDIS &amp; aged care providers near you</h1>' +
    '<p>Search provider profiles by support and location, or submit a free request to identify providers serving your area. SolDirectory is an independent directory and enquiry service for people looking for NDIS and aged care provider information in Australia.</p>' +
    `<p>${a('/find-a-provider', 'Find a provider')} &middot; ${a('/ndis-providers', 'NDIS provider register')} &middot; ${a('/aged-care-providers', 'Aged care provider register')}</p>` +
    '<h2>Browse by support</h2>' + ul(allServiceLinks.slice(0, 12).map((l) => a(l.url, l.label))) + `<p>${a('/services', 'See every service')}</p>` +
    '<h2>Browse by location</h2>' + ul(STATES.map(([slug, name]) => a(`/ndis-providers/${slug}`, `NDIS providers in ${name}`))) +
    '<h2>Understand your options</h2>' + ul([a('/funding', 'NDIS, aged care and other funding explained'), a('/condition', 'Providers by condition or support need'), a('/guides', 'NDIS and aged care guides'), a('/independent-workers', 'Independent support workers')]) +
    '<h2>How it works</h2><p>Tell us what support you need and where. Relevant providers review your request and respond through SolDirectory. It is free to submit, and you decide whether to go ahead.</p>' +
    `<p>${a('/providers', 'List your business')}</p>`,
});

// ---- Hubs ----
pages.push({
  path: '/find-a-provider',
  title: 'Find a provider — SolDirectory',
  description: 'Search NDIS and aged care providers by support, suburb or name, using the public provider registers and SolDirectory profiles.',
  crumbs: [{ name: 'Home', path: '/' }, { name: 'Find a provider', path: '/find-a-provider' }],
  body: (c) => `${c}<h1>Find a provider</h1>` +
    '<p>Search for the support you need and where you need it. Results come from the public registers of NDIS registered providers and approved aged care providers, alongside SolDirectory provider profiles. A register listing shows what the register says, not who has capacity, so use "Get matched" to reach providers who have confirmed they can start.</p>' +
    ul([a('/ndis-providers', 'NDIS provider register'), a('/aged-care-providers', 'Aged care provider register'), a('/services', 'Browse by service'), a('/locations', 'Browse by location'), a('/condition', 'Browse by condition or support need')]),
});

pages.push({
  path: '/services',
  title: 'NDIS and aged care support services | SolDirectory',
  description: 'Browse personal care, therapy, nursing, transport, support coordination, housing and other supports, then compare providers serving your area.',
  crumbs: [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }],
  body: (c) => `${c}<h1>NDIS and aged care support services</h1>` +
    '<p>Browse the supports people ask for most, then see the providers listing them. Each service page explains what the support is, how to choose a provider, what to ask and where funding comes from.</p>' +
    serviceTab.columns.map((col) => `<h2>${esc(col.title)}</h2>${ul(col.links.map((l) => a(l.url, l.label)))}`).join(''),
});

pages.push({
  path: '/locations',
  title: 'Find NDIS and aged care providers by location | SolDirectory',
  description: 'Browse providers by Australian state, city and suburb. Search current SolDirectory profiles or reference public NDIS and aged care register listings.',
  crumbs: [{ name: 'Home', path: '/' }, { name: 'Locations', path: '/locations' }],
  body: (c) => `${c}<h1>Find NDIS and aged care providers by location</h1>` +
    '<p>Choose a state or territory to see the suburbs with provider listings.</p>' +
    '<h2>NDIS providers</h2>' + ul(STATES.map(([slug, name]) => a(`/ndis-providers/${slug}`, name))) +
    '<h2>Aged care providers</h2>' + ul(STATES.map(([slug, name]) => a(`/aged-care-providers/${slug}`, name))),
});

pages.push({
  path: '/providers',
  title: 'List your business on SolDirectory',
  description: 'Providers can create an account to list their supports and service areas and receive enquiries from people looking for NDIS and aged care support.',
  crumbs: [{ name: 'Home', path: '/' }, { name: 'List your business', path: '/providers' }],
  jsonLd: [faqLd(PROVIDER_FAQS)],
  body: (c) => `${c}<h1>List your business on SolDirectory</h1>` +
    '<p>SolDirectory is a directory and enquiry service. Providers create an account, describe the supports they deliver and the areas they cover, confirm their availability, and respond to enquiries from people looking for support.</p>' +
    ul([a('/signup', 'Create a provider account'), a('/login', 'Log in'), a('/guides/choosing-a-provider', 'How people choose a provider'), a('/lead-disclaimer', 'Enquiry disclaimer'), a('/provider-agreement', 'Provider agreement')]) +
    '<h2>What a strong listing includes</h2>' + ul(PROVIDER_LISTING_CHECKS.map((c2) => `<strong>${esc(c2.title)}.</strong> ${esc(c2.body)}`)) +
    '<h2>Guides for running a provider business</h2>' + articleList(PROVIDER_PAGE_GUIDES) +
    '<h2>The public NDIS register by state</h2>' + ul(STATES.map(([slug, name]) => a(`/ndis-providers/${slug}`, `NDIS providers in ${name}`))) +
    '<h2>Frequently asked questions</h2>' + faqHtml(PROVIDER_FAQS),
});

pages.push({
  path: '/independent-workers',
  title: 'Independent Support Workers | SolDirectory',
  description: 'Create an independent worker profile with your services, experience, location and availability so eligible organisations can find and contact you.',
  crumbs: [{ name: 'Home', path: '/' }, { name: 'Independent workers', path: '/independent-workers' }],
  jsonLd: [faqLd(INDEPENDENT_WORKER_FAQS)],
  body: (c) => `${c}<h1>Independent support workers</h1>` +
    '<p>Independent support workers can create a profile with their services, experience, location and availability, so eligible organisations can find and contact them. A profile is only shown publicly if the worker opts in and it is approved.</p>' +
    ul([a('/signup', 'Create a worker profile'), a('/independent-workers/find', 'Find a worker'), a('/login', 'Log in')]) +
    '<h2>Six things to settle before your first shift</h2>' + ul(WORKER_SETUP_STEPS.map((st) => `${a(st.link.to, st.title)}: ${esc(st.body)}`)) +
    '<h2>Guides for independent workers</h2>' + articleList(WORKER_PAGE_GUIDES) +
    '<h2>Supports you can offer</h2>' + ul([a('/services/personal-care', 'Personal care'), a('/services/domestic-assistance', 'Domestic assistance'), a('/services/transport', 'Transport'), a('/services/therapy-services', 'Therapy services'), a('/services/nursing', 'Nursing')]) +
    '<h2>Independent support work by state and territory</h2>' + ul(STATES.map(([slug, name]) => a(`/ndis-providers/${slug}`, name))) +
    '<h2>Independent worker questions</h2>' + faqHtml(INDEPENDENT_WORKER_FAQS),
});

// ---- Reference pages ----
{
  const terms = [...GLOSSARY].sort((x, y) => x.term.localeCompare(y.term, 'en-AU'));
  const termId = (t) => t.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  pages.push({
    path: '/glossary',
    title: 'NDIS and aged care glossary: terms explained | SolDirectory',
    description: 'Plain-English definitions of NDIS and aged care terms, from plan management and SIL to Support at Home and the Code of Conduct, each linked to a guide.',
    crumbs: [{ name: 'Home', path: '/' }, { name: 'Glossary', path: '/glossary' }],
    jsonLd: [{
      '@type': 'DefinedTermSet',
      name: 'NDIS and aged care glossary',
      url: `${site}/glossary`,
      hasDefinedTerm: terms.map((t) => ({ '@type': 'DefinedTerm', name: t.term, description: t.definition, url: `${site}/glossary#${termId(t)}`, inDefinedTermSet: `${site}/glossary` })),
    }],
    // Grouped by letter with a jump list, as the visible page is (GlossaryPage.tsx), so the static HTML has the same headings.
    body: (c) => {
      const groups = new Map();
      for (const t of terms) {
        const letter = t.term[0].toUpperCase();
        groups.set(letter, [...(groups.get(letter) ?? []), t]);
      }
      return `${c}<h1>NDIS and aged care glossary</h1>` +
        '<p>The terms you will hear from the NDIA, providers, plan managers and My Aged Care, explained in plain language. Each one links to the guide that covers it properly. Definitions are general information, not advice about a particular plan.</p>' +
        `<nav aria-label="Jump to a letter">${[...groups.keys()].map((letter) => `<a href="#letter-${letter}">${letter}</a>`).join(' ')}</nav>` +
        [...groups].map(([letter, items]) =>
          `<section id="letter-${letter}"><h2>${letter}</h2><dl>` +
          items.map((t) => `<dt id="${termId(t)}">${esc(t.term)}</dt><dd>${esc(t.definition)} ${a(t.to, t.label)}</dd>`).join('') +
          '</dl></section>').join('');
    },
  });
  pages.push({
    path: '/editorial-standards',
    title: 'Editorial standards: how we check our guides | SolDirectory',
    description: 'How SolDirectory writes, sources and checks its NDIS and aged care guides: original writing, official sources cited, dates shown, and how to report a mistake.',
    crumbs: [{ name: 'Home', path: '/' }, { name: 'Editorial standards', path: '/editorial-standards' }],
    jsonLd: [{ '@type': 'AboutPage', name: 'Editorial standards', url: `${site}/editorial-standards`, about: { '@type': 'Organization', name: 'SolDirectory', url: site } }],
    body: (c) => `${c}<h1>Editorial standards</h1><p>${esc(EDITORIAL_STANDARDS.intro)}</p>` +
      EDITORIAL_STANDARDS.sections.map((sec) =>
        `<h2>${esc(sec.heading)}</h2>` +
        (sec.paragraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join('') +
        (sec.list ? ul(sec.list.map((i) => `<strong>${esc(i.title)}.</strong> ${esc(i.text)}`)) : '') +
        (sec.sources ? ul(sec.sources.map((src) => `${a(src.href, src.name)}: ${esc(src.use)}`)) : '') +
        (sec.links ? `<p>${sec.links.map((l) => a(l.to, l.label)).join(' &middot; ')}</p>` : '')
      ).join('') +
      `<p>${EDITORIAL_STANDARDS.see.map((l) => a(l.to, l.label)).join(' &middot; ')}</p>`,
  });
}

// ---- Guides ----
pages.push({
  path: '/guides',
  title: 'NDIS and aged care guides | SolDirectory',
  description: 'Practical guides to NDIS pricing, plan management, choosing a provider and finding aged care support, with links to current official sources.',
  crumbs: [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }],
  body: (c) => `${c}<h1>NDIS and aged care guides</h1><p>Plain-language guides that explain the concepts and point to the official source for current figures.</p>` +
    ul(Object.values(GUIDE_DOCS).map((g) => `${a(`/guides/${g.slug}`, g.title)} — ${esc(g.summary)}`)),
});

for (const g of Object.values(GUIDE_DOCS)) {
  pages.push({
    path: `/guides/${g.slug}`,
    title: `${g.title} | SolDirectory`,
    description: g.summary,
    crumbs: [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }, { name: g.title, path: `/guides/${g.slug}` }],
    jsonLd: [{ '@type': 'Article', headline: g.title, description: g.summary, mainEntityOfPage: `${site}/guides/${g.slug}`, publisher: { '@type': 'Organization', name: 'SolDirectory' } }],
    body: (c) => `${c}<h1>${esc(g.title)}</h1><p>${esc(g.summary)}</p>` +
      g.sections.map((s) => `<h2>${esc(s.heading)}</h2>${s.body.map((p) => `<p>${esc(p)}</p>`).join('')}${s.list ? ul(s.list.map(esc)) : ''}`).join('') +
      `<p>Official source: <a href="${esc(g.officialLink.href)}" rel="noopener">${esc(g.officialLink.label)}</a></p>`,
  });
}

// ---- Funding ----
pages.push({
  path: '/funding',
  title: 'NDIS, aged care, DVA and private funding explained | SolDirectory',
  description: 'General information on NDIS plan management, aged care programs, DVA funding, Medicare and private options — and which providers accept each, where SolDirectory tracks it.',
  crumbs: [{ name: 'Home', path: '/' }, { name: 'Funding', path: '/funding' }],
  body: (c) => `${c}<h1>NDIS, aged care and other funding explained</h1>` +
    '<p>Use these general guides to understand common terms and prepare questions for the relevant official body or provider. They are general information, not financial advice, and program rules change.</p>' +
    FUNDING_CATEGORY_GROUPS.map((g) => `<h2>${esc(g.title)}</h2>${ul(g.items.map((f) => a(`/funding/${f.slug}/`, f.name)))}`).join(''),
});

for (const f of FUNDING_CONTENT) {
  const siblings = FUNDING_CATEGORY_GROUPS.find((g) => g.title === f.categoryGroup)?.items.filter((s) => s.slug !== f.slug) ?? [];
  const editorial = fundingShellEditorial(f);
  pages.push({
    path: `/funding/${f.slug}`,
    canonical: `/funding/${f.slug}/`, // the form the menu and FundingTopicPage's own canonical use
    title: `${f.name} | Funding | SolDirectory`,
    description: trim(FUNDING_SEO_DESCRIPTIONS[f.slug] ?? f.summary[0], 155),
    crumbs: [{ name: 'Home', path: '/' }, { name: 'Funding', path: '/funding' }, { name: f.name, path: `/funding/${f.slug}` }],
    body: (c) => `${c}<h1>${esc(f.name)}</h1>` +
      `<h2>About ${esc(f.name)}</h2>${f.summary.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}` +
      `<h3>At a glance</h3>${ul(f.keyPoints.map(esc))}` +
      '<p>This is general information, not financial or funding advice. Program names, amounts and eligibility rules change over time. Always confirm current detail with the relevant official body before relying on it.</p>' +
      `<h2>How to prepare before arranging support</h2>${ul((editorial.steps ?? []).map(esc))}` +
      `<h2>Information and records to have ready</h2><p>Having the relevant records available makes it easier to confirm eligibility, obtain an accurate quote and resolve payment questions before they interrupt support.</p>${ul((editorial.records ?? []).map(esc))}` +
      `<h2>Questions to ask a provider</h2><p>A provider should be able to explain its role, fees and billing process without implying that a directory listing guarantees funding approval.</p>${ul((editorial.providerQuestions ?? []).map(esc))}` +
      `<h2>Common mistakes to avoid</h2>${ul((editorial.pitfalls ?? []).map(esc))}` +
      `<h2>Reviewing the arrangement</h2><p>Recheck it when services, circumstances, rates or program rules change, and note who confirmed each decision and when.</p>${ul((editorial.reviewChecklist ?? []).map(esc))}` +
      `<h2>Frequently asked questions</h2>${editorial.faq.map((item) => `<h3>${esc(item.question)}</h3><p>${esc(item.answer)}</p>`).join('')}` +
      `<h2>Official sources</h2>${ul((editorial.sources ?? []).map((source) => `<a href="${esc(source.href)}" rel="noopener noreferrer">${esc(source.label)}</a>`))}` +
      (siblings.length ? `<h2>Other topics in ${esc(f.categoryGroup)}</h2>${ul(siblings.map((s) => a(`/funding/${s.slug}/`, s.name)))}` : '') +
      `<p>${a('/find-a-provider', 'Find a provider')} &middot; ${a('/funding', 'All funding topics')}</p>`,
  });
}

// ---- Write ----
const style = '<style>main[data-seo-shell]{max-width:860px;margin:0 auto;padding:24px 16px;font-family:system-ui,sans-serif;line-height:1.5}main[data-seo-shell] li{margin:2px 0}main[data-seo-shell] nav[aria-label=Breadcrumb] ol{list-style:none;margin:0 0 8px;padding:0;display:flex;flex-wrap:wrap}main[data-seo-shell] nav[aria-label=Breadcrumb] li+li::before{content:"/";margin:0 8px}</style>';
let written = 0;
for (const page of pages) {
  const canonical = `${site}${page.canonical ?? page.path}`;
  const crumbHtml = page.crumbs ? crumbs(page.crumbs.map((c, i) => ({ label: c.name, to: i < page.crumbs.length - 1 ? c.path : undefined }))) : '';
  const body = typeof page.body === 'function' ? page.body(crumbHtml) : page.body;
  const ld = [...(page.jsonLd ?? []), ...(page.crumbs ? [breadcrumbLd(page.crumbs)] : [])];
  const head = [
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="SolDirectory" />',
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:image" content="${esc(SHARE_IMAGE)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="Two people holding hands, a moment of care and support" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    ...ld.map((d, i) => `<script type="application/ld+json" id="jsonld-prerender-${i}">${JSON.stringify({ '@context': 'https://schema.org', ...d }).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ');

  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(page.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${esc(page.description)}" />`)
    .replace('</head>', () => `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${style}<main data-seo-shell>${externalLinkRel(body, site)}</main></div>`);

  const out = page.file ? path.join(dist, page.file) : path.join(dist, page.path, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  written += 1;
}
console.log(`[prerender] wrote ${written} static pages for ${site}`);
