import 'dotenv/config';

/**
 * Shows how many pages each indexing phase would put in the sitemap, so the next phase can be chosen with real numbers
 * (gap audit A1, packages/topic-content/indexingPolicy.js). Read-only.
 *
 *   npx tsx src/scripts/auditIndexing.ts
 *   npx tsx src/scripts/auditIndexing.ts --sitemap http://localhost:4000     also fetch the live sitemap and check it matches the current phase
 */
const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

async function countSitemap(base: string) {
  const text = async (path: string) => (await fetch(`${base}${path}`)).text();
  const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''));
  const index = locs(await text('/sitemap.xml'));
  let registerSuburbs = 0;
  let registerProfiles = 0;
  let services = 0;
  for (const part of index) {
    const paths = locs(await text(part));
    if (/sitemap-services-/.test(part)) services += paths.length;
    if (/sitemap-register-/.test(part)) {
      for (const p of paths) {
        const segs = p.split('/').filter(Boolean);
        if (segs.length === 3) registerSuburbs += 1;
        else if (segs.length === 2 && !/^(nsw|vic|qld|wa|sa|tas|act|nt)$/.test(segs[1])) registerProfiles += 1;
      }
    }
  }
  return { registerSuburbs, registerProfiles, services };
}

async function main() {
  const { connectDB } = await import('../config/db.js');
  const { computeHub, computeServiceSuburbs } = await import('../controllers/register.controller.js');
  const { REAL_SERVICES, REGISTER_TYPES, MIN_INDEXABLE_SERVICE_LOCATION } = await import('../services/registerNormalise.js');
  const { INDEX_PHASE, INDEX_REGISTER_PROFILES, PHASE_2_MIN_LISTINGS, isIndexableSuburb } = await import('@soldirectory/topic-content');
  const { censusFor } = await import('../services/census.js');
  const { default: RegisterListing } = await import('../models/RegisterListing.js');
  await connectDB();

  const hubSuburbs: { state: string; slug: string; suburb: string; count: number }[] = [];
  for (const type of REGISTER_TYPES) hubSuburbs.push(...(await computeHub(type)).suburbs);
  const servicePages: { state: string; slug: string; suburb: string; count: number }[] = [];
  for (const service of REAL_SERVICES) servicePages.push(...(await computeServiceSuburbs(service)).filter((s) => s.count >= MIN_INDEXABLE_SERVICE_LOCATION));
  const profiles = await RegisterListing.countDocuments({ 'services.0': { $exists: true } });

  const row = (phase: number) => {
    const reg = hubSuburbs.filter((s) => isIndexableSuburb(s.state, s.suburb, s.count, phase, !!censusFor(s.state, s.slug))).length;
    const svc = servicePages.filter((s) => isIndexableSuburb(s.state, s.suburb, s.count, phase, !!censusFor(s.state, s.slug))).length;
    return { reg, svc };
  };

  console.log(`Current phase: ${INDEX_PHASE}. Phase 2 adds suburbs with ${PHASE_2_MIN_LISTINGS}+ listings. Register profile pages indexed: ${INDEX_REGISTER_PROFILES ? 'yes' : 'no'}.\n`);
  console.log('Phase                      register suburb pages   service x suburb pages   total suburb pages');
  for (const [phase, label] of [[1, '1 centres only'], [2, `2 plus ${PHASE_2_MIN_LISTINGS}+ listings`], [3, '3 plus eligible with Census'], [4, '4 every eligible page']] as const) {
    const r = row(phase);
    console.log(`${label.padEnd(26)} ${String(r.reg).padStart(21)}   ${String(r.svc).padStart(22)}   ${String(r.reg + r.svc).padStart(18)}${phase === INDEX_PHASE ? '   <- current' : ''}`);
  }
  console.log(`\nRegister profile pages that exist (each has at least one service): ${profiles} (${INDEX_REGISTER_PROFILES ? 'indexed' : 'noindex, not in the sitemap'})`);

  const base = arg('sitemap');
  if (base) {
    const found = await countSitemap(base.replace(/\/$/, ''));
    const now = row(INDEX_PHASE);
    const ok = found.registerSuburbs === now.reg && found.services === now.svc && (INDEX_REGISTER_PROFILES || found.registerProfiles === 0);
    console.log(`\nSitemap at ${base}: ${found.registerSuburbs} register suburb pages, ${found.services} service pages, ${found.registerProfiles} register profile pages.`);
    console.log(ok ? 'The sitemap matches the current phase.' : 'MISMATCH: the sitemap does not match the current phase. It may be cached for up to 30 minutes after a change.');
    if (!ok) process.exitCode = 2;
  }
}

main().then(() => process.exit(process.exitCode ?? 0)).catch((err) => { console.error('[audit-indexing] Fatal error:', err); process.exit(1); });
