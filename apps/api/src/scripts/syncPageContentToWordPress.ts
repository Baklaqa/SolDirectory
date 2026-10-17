/**
 * Creates or updates a WordPress post for every page the site builds from the register (service x suburb pages, and register state and
 * suburb pages), so every page exists in WordPress and the facts and approved copy can be read from the WordPress REST API.
 *
 * Usage (from apps/api):
 *   npx tsx src/scripts/syncPageContentToWordPress.ts --dry-run        # report only
 *   npx tsx src/scripts/syncPageContentToWordPress.ts --baseline       # also create a draft post for every page that has no copy yet
 *   npx tsx src/scripts/syncPageContentToWordPress.ts                  # only pages with approved (or stale / unpublished) copy that changed
 *   npx tsx src/scripts/syncPageContentToWordPress.ts --baseline --max 2000   # stop after about 2000 posts, run again to continue
 *
 * Needs WORDPRESS_URL, WORDPRESS_APP_USER and WORDPRESS_APP_PASSWORD, and the soldirectory-content plugin including
 * includes/page-automation.php. Safe to re-run and to interrupt: it carries on where it stopped.
 */
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import PageContent from '../models/PageContent.js';
import { listEligiblePages } from '../services/pageContent/facts.js';
import { syncPagesToWordPress, wordpressConfigured } from '../services/pageContent/wpSync.js';

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(n);
const maxIdx = args.indexOf('--max');
const MAX = maxIdx >= 0 ? Number(args[maxIdx + 1]) || 500 : Infinity;

async function main() {
  await connectDB();
  const eligible = await listEligiblePages();
  const have = new Set((await PageContent.find({}).select('key').lean<{ key: string }[]>()).map((d) => d.key));
  console.log(`[sync-pages-wp] ${eligible.length} pages exist; ${have.size} already tracked; ${eligible.length - have.size} have no WordPress post yet.`);
  if (flag('--dry-run')) { console.log('[sync-pages-wp] --dry-run: not writing anything.'); process.exit(0); }
  if (!wordpressConfigured()) {
    console.log('[sync-pages-wp] WordPress is not configured (WORDPRESS_URL/WORDPRESS_APP_USER/WORDPRESS_APP_PASSWORD): nothing to do.');
    process.exit(0);
  }

  let total = 0;
  let failed = 0;
  for (;;) {
    const r = await syncPagesToWordPress({ limit: 100, includeBaseline: flag('--baseline') });
    total += r.considered;
    failed += r.failed.length;
    console.log(`[sync-pages-wp] ${total} done (${r.created} created, ${r.updated} updated this batch, ${r.remaining} left)`);
    for (const f of r.failed.slice(0, 3)) console.log(`  failed ${f.key}: ${f.error}`);
    if (r.considered === 0 || r.remaining === 0 || total >= MAX || failed > 20) break;
  }
  console.log(`\n[sync-pages-wp] Finished: ${total} post(s) synced, ${failed} failed.`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('[sync-pages-wp] Fatal error:', err);
  process.exit(1);
});
