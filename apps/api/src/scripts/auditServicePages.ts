import 'dotenv/config';

/**
 * Checks the service x suburb pages against the gap audit (A1, A2). Read-only; needs the API running.
 *
 *   npx tsx src/scripts/auditServicePages.ts --base http://localhost:4000 [--sample 80] [--pages service|register]
 *
 * --pages register audits the register suburb pages (/ndis-providers/vic/preston) the same way instead of the service x suburb pages.
 *
 * 1. Indexing: a sample of pages is fetched as a crawler sees it, and each page's robots tag is compared with the current
 *    phase (indexed if and only if it is in the sitemap).
 * 2. Template share: for the indexed sample, the page text is split into sentences with the page's own suburb, service and
 *    state names replaced by placeholders, which is how the audit counted "identical once the names are swapped".
 *    The script prints the share of sentences that also appear on another page in the sample, with and without the local
 *    sections added for A2.
 */
const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

// A small seeded generator so two runs sample the same pages.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');

/** The page body as sections: the lead (before the first h2), then one entry per h2, each with its visible text one block per line. */
function sections(html: string): { heading: string; lines: string[] }[] {
  const body = html.slice(html.indexOf('<h1')).split('</main>')[0].replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
  const toLines = (chunk: string) =>
    decode(chunk.replace(/<\/(p|li|h[1-6]|div|section|tr|dd|dt)>/g, '\n').replace(/<[^>]+>/g, ' '))
      .split('\n')
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  return body.split(/<h2[^>]*>/).map((part, i) => {
    if (i === 0) return { heading: '', lines: toLines(part) };
    const end = part.indexOf('</h2>');
    return { heading: decode(part.slice(0, end).replace(/<[^>]+>/g, '')).trim(), lines: toLines(part.slice(end + 5)) };
  });
}

async function main() {
  const base = (arg('base') ?? 'http://localhost:4000').replace(/\/$/, '');
  const sampleSize = Number(arg('sample')) || 80;
  const { connectDB } = await import('../config/db.js');
  const { computeServiceSuburbs } = await import('../controllers/register.controller.js');
  const { REAL_SERVICES, MIN_INDEXABLE_SERVICE_LOCATION } = await import('../services/registerNormalise.js');
  const { isIndexableSuburb } = await import('@soldirectory/topic-content');
  const { censusFor } = await import('../services/census.js');
  await connectDB();

  const slugify = (t: string) => t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const STATE_NAMES: Record<string, string> = {
    NSW: 'New South Wales', VIC: 'Victoria', QLD: 'Queensland', WA: 'Western Australia', SA: 'South Australia',
    TAS: 'Tasmania', ACT: 'Australian Capital Territory', NT: 'Northern Territory',
  };

  const pages: { service: string; state: string; suburb: string; slug: string; count: number; indexed: boolean; path?: string; localHeadings?: string[] }[] = [];
  if (arg('pages') === 'register') {
    const { computeHub } = await import('../controllers/register.controller.js');
    const { MIN_SUBURB_LISTINGS } = await import('../services/registerNormalise.js');
    for (const [type, path] of [['ndis', 'ndis-providers'], ['aged_care', 'aged-care-providers']] as const) {
      for (const s of (await computeHub(type)).suburbs) {
        pages.push({
          service: '', state: s.state, suburb: s.suburb, slug: s.slug, count: s.count,
          indexed: s.count >= MIN_SUBURB_LISTINGS && isIndexableSuburb(s.state, s.suburb, s.count, undefined, !!censusFor(s.state, s.slug)),
          path: `/seo-shell/${path}/${s.state.toLowerCase()}/${s.slug}`,
          localHeadings: [`Who is listed in ${s.suburb}`],
        });
      }
    }
  } else {
    for (const service of REAL_SERVICES) {
      for (const s of await computeServiceSuburbs(service)) {
        pages.push({ service, state: s.state, suburb: s.suburb, slug: s.slug, count: s.count, indexed: s.count >= MIN_INDEXABLE_SERVICE_LOCATION && isIndexableSuburb(s.state, s.suburb, s.count, undefined, !!censusFor(s.state, s.slug)) });
      }
    }
  }
  const rand = rng(20261016);
  const pick = (list: typeof pages, n: number) => [...list].sort(() => rand() - 0.5).slice(0, n);
  const indexedSample = pick(pages.filter((p) => p.indexed), sampleSize);
  const otherSample = pick(pages.filter((p) => !p.indexed && p.count >= MIN_INDEXABLE_SERVICE_LOCATION), Math.max(10, Math.floor(sampleSize / 4)));
  const urlFor = (p: (typeof pages)[number]) => `${base}${p.path ?? `/seo-shell/services/${slugify(p.service)}/${p.state.toLowerCase()}/${p.slug}`}`;

  // 1. Indexing
  let wrong = 0;
  for (const p of [...indexedSample, ...otherSample]) {
    const html = await (await fetch(urlFor(p))).text();
    const robots = /name="robots" content="([^"]*)"/.exec(html)?.[1] ?? '';
    if (/^index/.test(robots) !== p.indexed) {
      wrong += 1;
      console.log(`  WRONG robots on ${urlFor(p)}: "${robots}", expected ${p.indexed ? 'index' : 'noindex'}`);
    }
  }
  console.log(`Indexing: ${indexedSample.length} indexed-phase pages and ${otherSample.length} other pages checked, ${wrong} with the wrong robots tag.`);

  // 2. Template share
  const texts: { all: string[]; withoutLocal: string[]; blocksAll: string[]; blocksWithoutLocal: string[] }[] = [];
  for (const p of indexedSample) {
    const html = await (await fetch(urlFor(p))).text();
    const own = [p.suburb, p.service, p.service.toLowerCase(), STATE_NAMES[p.state] ?? p.state, p.state].filter(Boolean).sort((a, b) => b.length - a.length);
    const norm = (line: string) => {
      let out = line;
      for (const name of own) out = out.split(name).join('§');
      return out.toLowerCase();
    };
    const all: string[] = [];
    const withoutLocal: string[] = [];
    const blocksAll: string[] = [];
    const blocksWithoutLocal: string[] = [];
    for (const sec of sections(html)) {
      // The sections added for A2: where the suburb ranks, the closest suburbs (with the nearest-town note and languages line), who lists the service here, and the questions.
      const isLocal = p.localHeadings ? p.localHeadings.includes(sec.heading) : [`${p.suburb} at a glance`, `${p.service} near ${p.suburb}`, `Who lists ${p.service.toLowerCase()} in ${p.suburb}`, `Questions about ${p.service.toLowerCase()} in ${p.suburb}`].includes(sec.heading);
      const parts = [sec.heading, ...sec.lines].flatMap((line) => line.split(/(?<=[.!?])\s+/)).filter((x) => x.length >= 40 && /[.!?]$/.test(x)).map(norm);
      all.push(...parts);
      if (!isLocal) withoutLocal.push(...parts);
      const wholeLines = [sec.heading, ...sec.lines].filter(Boolean).map(norm);
      blocksAll.push(...wholeLines);
      if (!isLocal) blocksWithoutLocal.push(...wholeLines);
    }
    texts.push({ all, withoutLocal, blocksAll, blocksWithoutLocal });
  }
  const share = (get: (t: (typeof texts)[number]) => string[]) => {
    const seen = new Map<string, number>();
    for (const t of texts) for (const s of new Set(get(t))) seen.set(s, (seen.get(s) ?? 0) + 1);
    let total = 0;
    let dup = 0;
    for (const t of texts) {
      for (const s of new Set(get(t))) {
        total += 1;
        if ((seen.get(s) ?? 0) > 1) dup += 1;
      }
    }
    return { total, dup, pct: total ? Math.round((dup / total) * 100) : 0 };
  };
  const without = share((t) => t.withoutLocal);
  const words = (labelAll: boolean) => {
    const seen = new Map<string, number>();
    for (const t of texts) for (const l of new Set(labelAll ? t.blocksAll : t.blocksWithoutLocal)) seen.set(l, (seen.get(l) ?? 0) + 1);
    let total = 0;
    let unique = 0;
    for (const t of texts) {
      for (const l of new Set(labelAll ? t.blocksAll : t.blocksWithoutLocal)) {
        const n = l.split(' ').length;
        total += n;
        if ((seen.get(l) ?? 0) === 1) unique += n;
      }
    }
    return total ? Math.round((unique / total) * 100) : 0;
  };
  const withLocal = share((t) => t.all);
  console.log(`\nTemplate share over ${texts.length} indexed-phase pages (prose sentences, not headings or link lists, identical on another page once only the page's own suburb, service and state names are swapped, which is how the audit counted; numbers are kept):`);
  console.log(`  without the A2 local sections: ${without.dup} of ${without.total} sentences (${without.pct}%)`);
  console.log(`  with them:                     ${withLocal.dup} of ${withLocal.total} sentences (${withLocal.pct}%)`);
  console.log(`
Words on the page that appear on no other page in the sample (headings, lists and prose, names swapped as above):`);
  console.log(`  without the A2 local sections: ${words(false)}%`);
  console.log(`  with them:                     ${words(true)}%`);
}

main().then(() => process.exit(0)).catch((err) => { console.error('[audit-service-pages] Fatal error:', err); process.exit(1); });
