/**
 * Brings WordPress level with the site, in four steps:
 *   1. articles   the authored pages and articles (guides, topics, legal pages, blog, glossary, location pages) as "site_article" posts
 *   2. pages      a post for every service x suburb page and register state or suburb page (draft until its copy is approved)
 *   3. listings   a "register_listing" post for every register listing
 *   4. providers  the "provider" post for every SolDirectory member
 *
 * Usage (from apps/api):
 *   npx tsx src/scripts/syncAllToWordPress.ts --dry-run        # counts only
 *   npx tsx src/scripts/syncAllToWordPress.ts                  # everything
 *   npx tsx src/scripts/syncAllToWordPress.ts --only articles  # one step: articles | pages | listings | providers
 *   npx tsx src/scripts/syncAllToWordPress.ts --max 2000       # at most about 2000 posts in each step; run again to carry on
 *
 * Safe to stop and re-run: each step carries on where it stopped. Then run `npm run audit:wp-sync -w apps/api` to see WordPress against the site.
 * Not copied to WordPress, on purpose: participants, enquiries, independent workers' personal profiles, accounts and payments.
 * Needs WORDPRESS_URL, WORDPRESS_APP_USER, WORDPRESS_APP_PASSWORD and the updated soldirectory-content plugin.
 */
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import PageContent from '../models/PageContent.js';
import Provider from '../models/Provider.js';
import RegisterListing from '../models/RegisterListing.js';
import { listEligiblePages } from '../services/pageContent/facts.js';
import { syncPagesToWordPress, wordpressConfigured } from '../services/pageContent/wpSync.js';
import { syncRegisterListingToWordPress } from '../services/registerWordpressSync.service.js';
import { syncProviderToWordPress } from '../services/wordpressSync.service.js';
import { mirrorSiteContent } from '../services/wpMirror/siteContent.js';
import { mirrorablePaths } from '../controllers/sitemap.controller.js';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
const maxIdx = args.indexOf('--max');
const MAX = maxIdx >= 0 ? Number(args[maxIdx + 1]) || 500 : Infinity;
const want = (step: string) => !only || only === step;

async function pool<T>(items: T[], size: number, fn: (item: T) => Promise<void>, label: string) {
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < items.length) {
      await fn(items[next++]);
      done += 1;
      if (done % 200 === 0) console.log(`[sync-all-wp] ${label}: ${done}/${items.length}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
}

async function main() {
  await connectDB();

  const eligible = await listEligiblePages();
  const tracked = new Set((await PageContent.find({}).select('key').lean<{ key: string }[]>()).map((d) => d.key));
  const listingsTodo = await RegisterListing.countDocuments({ wpPostId: { $exists: false } });
  const providersTodo = await Provider.countDocuments({ wpPostId: { $exists: false }, $or: [{ tradingName: { $nin: [null, ''] } }, { legalEntityName: { $nin: [null, ''] } }] });
  const articlePaths = await mirrorablePaths();
  console.log(`[sync-all-wp] To do: ${articlePaths.length} articles to check, ${eligible.length - tracked.size} pages with no post, ${listingsTodo} register listings, ${providersTodo} providers.`);
  if (dryRun) { console.log('[sync-all-wp] --dry-run: not writing anything.'); process.exit(0); }
  if (!wordpressConfigured()) {
    console.log('[sync-all-wp] WordPress is not configured (WORDPRESS_URL/WORDPRESS_APP_USER/WORDPRESS_APP_PASSWORD): nothing to do.');
    process.exit(0);
  }

  let failures = 0;

  if (want('articles')) {
    const r = await mirrorSiteContent({ paths: articlePaths.slice(0, MAX) });
    failures += r.failed.length;
    console.log(`[sync-all-wp] articles: ${r.created} created, ${r.updated} updated, ${r.unchanged} unchanged, ${r.skipped.length} skipped, ${r.failed.length} failed.`);
    for (const f of r.failed.slice(0, 5)) console.log(`  failed ${f.path}: ${f.error}`);
  }

  if (want('pages')) {
    let total = 0;
    for (;;) {
      const r = await syncPagesToWordPress({ limit: 100, includeBaseline: true });
      total += r.considered;
      failures += r.failed.length;
      console.log(`[sync-all-wp] pages: ${total} done, ${r.remaining} left`);
      for (const f of r.failed.slice(0, 3)) console.log(`  failed ${f.key}: ${f.error}`);
      if (r.considered === 0 || r.remaining === 0 || total >= MAX || failures > 20) break;
    }
  }

  if (want('listings')) {
    const docs = await RegisterListing.find({ wpPostId: { $exists: false } }).limit(Number.isFinite(MAX) ? MAX : 0);
    await pool(docs, 6, (doc) => syncRegisterListingToWordPress(doc), 'listings');
    console.log(`[sync-all-wp] listings: ${docs.length} synced.`);
  }

  if (want('providers')) {
    const docs = await Provider.find({ wpPostId: { $exists: false } }).select('_id').lean<{ _id: unknown }[]>();
    await pool(docs.slice(0, MAX), 3, (d) => syncProviderToWordPress(String(d._id)), 'providers');
    console.log(`[sync-all-wp] providers: ${Math.min(docs.length, MAX)} checked.`);
  }

  console.log(failures ? `\n[sync-all-wp] Finished with ${failures} failure(s). Re-run to retry them.` : '\n[sync-all-wp] Finished. Run: npm run audit:wp-sync -w apps/api');
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error('[sync-all-wp] Fatal error:', err);
  process.exit(1);
});
