/**
 * Brings WordPress level with the site, in four steps:
 *   1. articles   the authored pages and articles (guides, topics, legal pages, blog, glossary, location pages) as "site_article" posts
 *   2. pages      a post for every service x suburb page and register state or suburb page (draft until its copy is approved)
 *   3. listings   a "register_listing" post for every register listing
 *   4. providers  the "provider" post for every SolDirectory member
 *
 * Usage (from apps/api):
 *   npx tsx src/scripts/syncAllToWordPress.ts --status         # is the full resync finished? how much is left? (read-only)
 *   npx tsx src/scripts/syncAllToWordPress.ts --dry-run        # counts only (for a resync, use --status: a dry run does not know about the saved run)
 *   npx tsx src/scripts/syncAllToWordPress.ts                  # everything that has no post yet
 *   npx tsx src/scripts/syncAllToWordPress.ts --resync         # push EVERYTHING again, carrying on where an interrupted run stopped
 *   npx tsx src/scripts/syncAllToWordPress.ts --resync --restart   # throw the unfinished run away and start a new full one
 *   npx tsx src/scripts/syncAllToWordPress.ts --only articles  # one step: articles | pages | listings | providers
 *   npx tsx src/scripts/syncAllToWordPress.ts --max 2000       # at most about 2000 posts in each step; run again to carry on
 *
 * It never starts over by itself. Every post records when it was pushed, so after a dropped connection or a restart, running the same
 * command carries on from the next post that has not been done. A --resync run is remembered in the database (WpSyncRun) until every
 * step has finished.
 *
 * It also ignores the hang-up signal, so closing the terminal does not stop it; output then goes nowhere, so for a long run use
 *   nohup npx tsx src/scripts/syncAllToWordPress.ts --resync > /var/log/wp-sync.log 2>&1 &
 * and watch it with `tail -f /var/log/wp-sync.log`.
 *
 * Not copied to WordPress, on purpose: participants, enquiries, independent workers' personal profiles, accounts and payments.
 * Needs WORDPRESS_URL, WORDPRESS_APP_USER, WORDPRESS_APP_PASSWORD and the updated soldirectory-content plugin.
 */
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import PageContent from '../models/PageContent.js';
import Provider from '../models/Provider.js';
import RegisterListing from '../models/RegisterListing.js';
import WpSyncRun from '../models/WpSyncRun.js';
import { listEligiblePages } from '../services/pageContent/facts.js';
import { syncPagesToWordPress, wordpressConfigured } from '../services/pageContent/wpSync.js';
import { syncRegisterListingToWordPress } from '../services/registerWordpressSync.service.js';
import { syncProviderToWordPress } from '../services/wordpressSync.service.js';
import { mirrorSiteContent } from '../services/wpMirror/siteContent.js';
import { mirrorablePaths } from '../controllers/sitemap.controller.js';

// A dropped terminal must not kill a long run, and a closed terminal must not crash it when it next prints.
process.on('SIGHUP', () => {});
process.stdout.on('error', () => {});
process.stderr.on('error', () => {});

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
const maxIdx = args.indexOf('--max');
const MAX = maxIdx >= 0 ? Number(args[maxIdx + 1]) || 500 : Infinity;
const want = (step: string) => !only || only === step;
const resync = args.includes('--resync');
const restart = args.includes('--restart');
const log = (msg: string) => console.log(`[sync-all-wp] ${msg}`);

/** Prints how far a step has got, how fast, and roughly how long is left. */
function progress(label: string, done: number, left: number, since: number) {
  const secs = Math.max(1, (Date.now() - since) / 1000);
  const rate = done / secs;
  const eta = rate > 0 && left > 0 ? ` about ${Math.max(1, Math.round(left / rate / 60))} min left` : '';
  log(`${label}: ${done} done this run (${rate.toFixed(1)}/s), ${left} left${eta}`);
}

/** The moment a full resync began. An unfinished earlier run is continued, so posts it already pushed are not pushed again. */
async function resyncStart(): Promise<Date> {
  const existing = await WpSyncRun.findOne({ name: 'resync' }).lean<{ startedAt: Date; finishedAt?: Date } | null>();
  if (existing && !existing.finishedAt && !restart) {
    log(`Continuing the full resync that began ${existing.startedAt.toISOString()}. Posts already pushed in it are skipped. (Use --restart to begin again.)`);
    return existing.startedAt;
  }
  const startedAt = new Date();
  await WpSyncRun.updateOne({ name: 'resync' }, { $set: { startedAt }, $unset: { finishedAt: '' } }, { upsert: true });
  log(`Starting a new full resync (${startedAt.toISOString()}).`);
  return startedAt;
}

const providerFilter = { $or: [{ tradingName: { $nin: [null, ''] } }, { legalEntityName: { $nin: [null, ''] } }] };

/** Read-only: is the full resync finished, and if not, how much is left? Changes nothing. */
async function status() {
  const run = await WpSyncRun.findOne({ name: 'resync' }).lean<{ startedAt: Date; finishedAt?: Date } | null>();
  if (!run) { log('No full resync has been started. Start one with: npm run sync:all-wp -w apps/api -- --resync'); return; }
  const since = { $or: [{ wpSyncedAt: { $exists: false } }, { wpSyncedAt: { $lt: run.startedAt } }] };
  const [pagesTotal, pagesLeft, listingsTotal, listingsLeft, providersTotal, providersLeft] = await Promise.all([
    PageContent.countDocuments({ status: { $in: ['baseline', 'approved', 'stale', 'unpublished'] } }),
    PageContent.countDocuments({ status: { $in: ['baseline', 'approved', 'stale', 'unpublished'] }, ...since }),
    RegisterListing.estimatedDocumentCount(),
    RegisterListing.countDocuments(since),
    Provider.countDocuments(providerFilter),
    Provider.countDocuments({ ...providerFilter, ...since }),
  ]);
  const eligible = (await listEligiblePages()).length;
  const row = (name: string, left: number, total: number) => `  ${name.padEnd(10)} ${String(total - left).padStart(7)} of ${String(total).padStart(7)} pushed   ${left === 0 ? 'done' : `${left} left`}`;
  log(`Full resync started ${run.startedAt.toISOString()}.`);
  console.log(row('pages', pagesLeft, pagesTotal));
  console.log(row('listings', listingsLeft, listingsTotal));
  console.log(row('providers', providersLeft, providersTotal));
  const noPostYet = Math.max(0, eligible - pagesTotal);
  if (noPostYet) console.log(`  ${noPostYet} page(s) have no post yet (the next run creates them).`);
  const done = pagesLeft + listingsLeft + providersLeft + noPostYet === 0;
  if (run.finishedAt) log(`COMPLETE: finished ${run.finishedAt.toISOString()}.`);
  else if (done) log('Everything is pushed, but the run is not marked finished: run the resync command once more and it will close the run.');
  else log('NOT FINISHED. Run the same --resync command again to carry on.');
}

async function main() {
  await connectDB();
  if (args.includes('--status')) { await status(); process.exit(0); }
  const startedAt = resync && !dryRun ? await resyncStart() : new Date();
  const notDoneSince = { $or: [{ wpSyncedAt: { $exists: false } }, { wpSyncedAt: { $lt: startedAt } }] };

  const eligible = await listEligiblePages();
  const tracked = new Set((await PageContent.find({}).select('key').lean<{ key: string }[]>()).map((d) => d.key));
  const listingsFilter = resync ? notDoneSince : { wpPostId: { $exists: false } };
  const providersFilter = resync ? { ...providerFilter, ...notDoneSince } : { ...providerFilter, wpPostId: { $exists: false } };
  const articlePaths = await mirrorablePaths();
  log(`To do: ${articlePaths.length} articles to check, ${eligible.length - tracked.size} pages with no post${resync ? `, ${await PageContent.countDocuments({ status: { $in: ['baseline', 'approved', 'stale', 'unpublished'] }, ...notDoneSince })} pages to push again` : ''}, ${await RegisterListing.countDocuments(listingsFilter)} register listings, ${await Provider.countDocuments(providersFilter)} providers.`);
  if (dryRun) { log('--dry-run: not writing anything.'); process.exit(0); }
  if (!wordpressConfigured()) {
    log('WordPress is not configured (WORDPRESS_URL/WORDPRESS_APP_USER/WORDPRESS_APP_PASSWORD): nothing to do.');
    process.exit(0);
  }

  let failures = 0;
  let cutShort = false;

  if (want('articles')) {
    const r = await mirrorSiteContent({ paths: articlePaths.slice(0, MAX) });
    failures += r.failed.length;
    log(`articles: ${r.created} created, ${r.updated} updated, ${r.unchanged} unchanged, ${r.skipped.length} skipped, ${r.failed.length} failed.`);
    for (const f of r.failed.slice(0, 5)) log(`  failed ${f.path}: ${f.error}`);
  }

  if (want('pages')) {
    const since = Date.now();
    let total = 0;
    for (;;) {
      const r = await syncPagesToWordPress({ limit: 100, includeBaseline: true, ...(resync ? { resyncBefore: startedAt } : {}) });
      total += r.considered;
      failures += r.failed.length;
      progress('pages', total, r.remaining, since);
      for (const f of r.failed.slice(0, 3)) log(`  failed ${f.key}: ${f.error}`);
      if (r.considered === 0 || r.remaining === 0) break;
      if (total >= MAX) { cutShort = true; break; }
      if (failures > 20) { cutShort = true; log('Stopping: more than 20 failures. Fix the cause and run the same command again; it carries on from here.'); break; }
    }
  }

  // Listings and providers are done in batches. Each success stamps the record, so the next batch (or the next run) skips it.
  // `tried` keeps a record that keeps failing from being picked again in this run, so one bad post cannot hold the run up.
  if (want('listings')) {
    const since = Date.now();
    const tried: unknown[] = [];
    let done = 0;
    for (;;) {
      const docs = await RegisterListing.find({ ...listingsFilter, _id: { $nin: tried } }).limit(300);
      if (!docs.length) break;
      tried.push(...docs.map((d) => d._id));
      await pool(docs, 6, (doc) => syncRegisterListingToWordPress(doc));
      done += docs.length;
      const left = await RegisterListing.countDocuments({ ...listingsFilter, _id: { $nin: tried } });
      progress('listings', done, left, since);
      if (done >= MAX) { cutShort = true; break; }
    }
    const notPushed = await RegisterListing.countDocuments({ ...listingsFilter, _id: { $in: tried } });
    failures += notPushed;
    log(`listings: ${done - notPushed} pushed${notPushed ? `, ${notPushed} failed (they are tried again next run)` : ''}.`);
  }

  if (want('providers')) {
    const since = Date.now();
    const tried: unknown[] = [];
    let done = 0;
    for (;;) {
      const docs = await Provider.find({ ...providersFilter, _id: { $nin: tried } }).select('_id').limit(100).lean<{ _id: unknown }[]>();
      if (!docs.length) break;
      tried.push(...docs.map((d) => d._id));
      await pool(docs, 3, (d) => syncProviderToWordPress(String(d._id)));
      done += docs.length;
      progress('providers', done, await Provider.countDocuments({ ...providersFilter, _id: { $nin: tried } }), since);
      if (done >= MAX) { cutShort = true; break; }
    }
    const notPushed = await Provider.countDocuments({ ...providersFilter, _id: { $in: tried } });
    failures += notPushed;
    log(`providers: ${done - notPushed} pushed${notPushed ? `, ${notPushed} failed` : ''}.`);
  }

  if (resync && !only && !cutShort && !failures) {
    await WpSyncRun.updateOne({ name: 'resync' }, { $set: { finishedAt: new Date() } });
    log('The full resync is complete.');
  } else if (resync) {
    log('The full resync is not finished. Run the same command again to carry on.');
  }
  log(failures ? `Finished with ${failures} failure(s). Run the same command again to retry them.` : 'Finished. Run: npm run audit:wp-sync -w apps/api');
  process.exit(failures ? 1 : 0);
}

async function pool<T>(items: T[], size: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  const worker = async () => { while (next < items.length) await fn(items[next++]); };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
}

main().catch((err) => {
  console.error('[sync-all-wp] Fatal error:', err);
  process.exit(1);
});
