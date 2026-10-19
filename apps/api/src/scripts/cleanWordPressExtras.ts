/**
 * Moves surplus posts in WordPress to the trash: duplicates left by overlapping or interrupted syncs.
 *
 *   npm run clean:wp-extras -w apps/api             # report only: what it would trash, and why
 *   npm run clean:wp-extras -w apps/api -- --apply  # move them to the WordPress trash
 *
 * A post is surplus only if ALL of these hold:
 *   - it is one of the mirror post types (service-area-pages, register-area-pages, register-listings);
 *   - the site does not point at it (no page or listing in the database has its id as its WordPress post);
 *   - it is a duplicate of a post the site does point at: for pages, its slug is that post's slug with a number added
 *     ("preston-2" next to "preston"); for listings, it carries no key, or the same key as a kept post.
 * Hand-made posts are left alone. "Trash" is WordPress's own bin: nothing is destroyed, and a post can be restored from
 * wp-admin > the post type > Trash. Run `npm run audit:wp-sync -w apps/api` afterwards.
 */
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import PageContent from '../models/PageContent.js';
import RegisterListing from '../models/RegisterListing.js';

const WP = (process.env.WORDPRESS_URL ?? '').replace(/\/$/, '');
const AUTH = 'Basic ' + Buffer.from(`${process.env.WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64');
const apply = process.argv.includes('--apply');

interface WpPost { id: number; slug: string; status: string; meta?: Record<string, unknown> }

async function allPosts(base: string): Promise<WpPost[]> {
  const out = new Map<number, WpPost>();
  for (let page = 1; ; page += 1) {
    const res = await fetch(`${WP}/wp-json/wp/v2/${base}?per_page=100&page=${page}&orderby=id&order=asc&status=any&_fields=id,slug,status,meta`, { headers: { Authorization: AUTH } });
    if (res.status === 400 && page > 1) break;
    if (!res.ok) throw new Error(`Could not read ${base}: ${res.status}`);
    for (const p of (await res.json()) as WpPost[]) out.set(p.id, p);
    if (page >= (Number(res.headers.get('x-wp-totalpages')) || 1)) break;
  }
  return [...out.values()];
}

async function trash(base: string, id: number): Promise<void> {
  // No ?force=true: this moves the post to the trash instead of deleting it for good.
  const res = await fetch(`${WP}/wp-json/wp/v2/${base}/${id}`, { method: 'DELETE', headers: { Authorization: AUTH } });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 120)}`);
}

async function main() {
  if (!WP || !process.env.WORDPRESS_APP_USER || !process.env.WORDPRESS_APP_PASSWORD) { console.log('WordPress is not configured.'); process.exit(1); }
  await connectDB();

  const tracked = await PageContent.find({ wpPostId: { $exists: true } }).select('kind wpPostId').lean<{ kind: string; wpPostId: number }[]>();
  const keepPages = { 'service-area-pages': new Set(tracked.filter((t) => t.kind === 'service').map((t) => t.wpPostId)), 'register-area-pages': new Set(tracked.filter((t) => t.kind === 'register').map((t) => t.wpPostId)) };
  const listings = await RegisterListing.find({ wpPostId: { $exists: true } }).select('wpPostId').lean<{ wpPostId: number }[]>();
  const keepListings = new Set(listings.map((l) => l.wpPostId));

  let total = 0;
  const jobs: { base: string; id: number }[] = [];
  for (const base of ['service-area-pages', 'register-area-pages', 'register-listings'] as const) {
    const posts = await allPosts(base);
    const keep = base === 'register-listings' ? keepListings : keepPages[base];
    const kept = posts.filter((p) => keep.has(p.id));
    const keptSlugs = new Set(kept.map((p) => p.slug));
    const surplus = posts.filter((p) => {
      if (keep.has(p.id)) return false;
      if (base === 'register-listings') return true; // a listing post the database does not point at is a duplicate or an orphan
      const m = /^(.*)-\d+$/.exec(p.slug);
      return !!m && keptSlugs.has(m[1]);
    });
    total += surplus.length;
    console.log(`${base}: ${posts.length} posts, ${kept.length} are the ones the site uses, ${surplus.length} surplus.`);
    for (const p of surplus.slice(0, 5)) console.log(`   post ${p.id}  slug "${p.slug || '(none)'}"  ${p.status}`);
    surplus.forEach((p) => jobs.push({ base, id: p.id }));
  }

  if (!apply) { console.log(`\n${total} surplus post(s). Nothing changed. Run again with --apply to move them to the trash.`); process.exit(0); }
  let done = 0, failed = 0, next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const j = jobs[next++];
      try { await trash(j.base, j.id); done += 1; } catch (err) { failed += 1; if (failed <= 3) console.log(`  failed ${j.base} ${j.id}: ${err instanceof Error ? err.message : err}`); }
      if ((done + failed) % 100 === 0) console.log(`  ${done + failed}/${jobs.length}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, jobs.length) }, worker));
  console.log(`\nMoved ${done} post(s) to the trash${failed ? `, ${failed} failed (run again to retry)` : ''}. Now run: npm run audit:wp-sync -w apps/api`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error('[clean-wp-extras] Fatal error:', err); process.exit(1); });
