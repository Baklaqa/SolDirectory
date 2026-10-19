/**
 * Compares what WordPress holds with what the site has, post type by post type, and says plainly what is missing.
 *
 *   npm run audit:wp-sync -w apps/api
 *
 * Uses the WordPress application password if it is set (so drafts are counted too); otherwise only published posts are counted.
 * A count can hide a problem (extra posts cancel out missing ones), so by default it also reads every post of the three mirrored types
 * and matches them one by one: posts the site expects but WordPress lacks (missing), posts WordPress has twice (duplicates), and
 * posts for pages or listings the site no longer has (extras). Pass --quick to skip that and only compare counts.
 * It changes nothing. Exits with 2 if anything is missing, duplicated or extra.
 */
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Provider from '../models/Provider.js';
import RegisterListing from '../models/RegisterListing.js';
import { listEligiblePages } from '../services/pageContent/facts.js';
import { mirrorablePaths } from '../controllers/sitemap.controller.js';

const WP = (process.env.WORDPRESS_URL ?? '').replace(/\/$/, '');
const auth: Record<string, string> = process.env.WORDPRESS_APP_USER && process.env.WORDPRESS_APP_PASSWORD
  ? { Authorization: 'Basic ' + Buffer.from(`${process.env.WORDPRESS_APP_USER}:${process.env.WORDPRESS_APP_PASSWORD}`).toString('base64') }
  : {};

async function wpTotal(restBase: string): Promise<number | null> {
  try {
    const res = await fetch(`${WP}/wp-json/wp/v2/${restBase}?per_page=1${auth.Authorization ? '&status=any' : ''}`, { headers: auth });
    if (!res.ok) return null;
    return Number(res.headers.get('x-wp-total'));
  } catch {
    return null;
  }
}

interface WpPost { id: number; slug: string; status: string; meta?: Record<string, unknown> }

async function allPosts(restBase: string): Promise<WpPost[] | null> {
  // Fixed order (by id): with the default order (by date) posts made in the same second swap places between pages, so some are
  // listed twice and some not at all. A post is also only counted once however many times it is returned.
  const out = new Map<number, WpPost>();
  for (let page = 1; ; page += 1) {
    const res = await fetch(`${WP}/wp-json/wp/v2/${restBase}?per_page=100&page=${page}&orderby=id&order=asc&status=any&_fields=id,slug,status,meta`, { headers: auth });
    if (res.status === 400 && page > 1) break; // past the last page
    if (!res.ok) return null;
    for (const p of (await res.json()) as WpPost[]) out.set(p.id, p);
    if (page >= (Number(res.headers.get('x-wp-totalpages')) || 1)) break;
  }
  return [...out.values()];
}

const pageKey = (p: WpPost) => (typeof p.meta?.sd_page_key === 'string' && p.meta.sd_page_key ? p.meta.sd_page_key : null);

/** Matches WordPress posts to the keys the site expects. `keyOf` reads the key from a post (null when it has none). Returns the number of problems. */
async function deepCheck(label: string, restBase: string, expected: Set<string>, keyOf: (p: WpPost) => string | null): Promise<number> {
  const posts = await allPosts(restBase);
  if (!posts) { console.log(`  ${label}: could not read the posts.`); return 1; }
  const seen = new Map<string, WpPost[]>();
  const unkeyed: WpPost[] = [];
  for (const p of posts) {
    const k = keyOf(p);
    if (!k) unkeyed.push(p);
    else seen.set(k, [...(seen.get(k) ?? []), p]);
  }
  const missing = [...expected].filter((k) => !seen.has(k));
  const duplicates = [...seen.entries()].filter(([, v]) => v.length > 1);
  const extras = [...seen.keys()].filter((k) => !expected.has(k));
  const show = (xs: string[]) => xs.slice(0, 5).map((x) => `      ${x}`).join('\n');
  const surplus = duplicates.reduce((n, [, v]) => n + v.length - 1, 0);
  console.log(`  ${label}: ${posts.length} posts. Missing ${missing.length}, duplicated ${duplicates.length} (${surplus} surplus posts), for pages the site no longer has ${extras.length}, without a key ${unkeyed.length}.`);
  if (posts.length > 20 && unkeyed.length > posts.length * 0.9) {
    console.log('    Almost no post carries its key, so WordPress is not saving the meta the sync sends. Deploy the updated soldirectory-content plugin\n    (includes/page-automation.php) to the WordPress server, then run: npx tsx src/scripts/syncAllToWordPress.ts --resync');
    return posts.length;
  }
  if (missing.length) console.log(`    missing, for example:\n${show(missing)}`);
  if (duplicates.length) console.log(`    duplicated, for example:\n${show(duplicates.map(([k, v]) => `${k}  (post ids ${v.map((p) => p.id).join(', ')})`))}`);
  if (extras.length) console.log(`    no longer on the site, for example:\n${show(extras)}`);
  const numbered = unkeyed.filter((p) => /-\d+$/.test(p.slug));
  if (unkeyed.length) console.log(`    without a key: ${unkeyed.length}${numbered.length ? `, of which ${numbered.length} have a slug ending in a number (duplicates left by overlapping runs; clean them with: npm run clean:wp-extras -w apps/api)` : ''}. Examples: ${unkeyed.slice(0, 4).map((p) => p.slug || '(no slug)').join(', ')}`);
  return missing.length + duplicates.length + extras.length;
}

async function main() {
  if (!WP) { console.log('WORDPRESS_URL is not set.'); process.exit(1); }
  await connectDB();
  const eligible = await listEligiblePages();
  const rows: { name: string; expected: number | null; wp: number | null; note: string }[] = [
    { name: 'service-area-pages', expected: eligible.filter((p) => p.kind === 'service').length, wp: await wpTotal('service-area-pages'), note: 'service x suburb pages' },
    { name: 'register-area-pages', expected: eligible.filter((p) => p.kind === 'register').length, wp: await wpTotal('register-area-pages'), note: 'register state and suburb pages' },
    { name: 'register-listings', expected: await RegisterListing.estimatedDocumentCount(), wp: await wpTotal('register-listings'), note: 'one per register listing' },
    { name: 'site-articles', expected: (await mirrorablePaths()).length, wp: await wpTotal('site-articles'), note: 'guides, topics, legal pages, blog, glossary, location pages' },
    { name: 'providers', expected: await Provider.countDocuments({ $or: [{ tradingName: { $nin: [null, ''] } }, { legalEntityName: { $nin: [null, ''] } }] }), wp: await wpTotal('providers'), note: 'SolDirectory members with a name' },
    { name: 'services', expected: null, wp: await wpTotal('services'), note: 'written in WordPress (not mirrored)' },
    { name: 'locations', expected: null, wp: await wpTotal('locations'), note: 'written in WordPress (not mirrored)' },
  ];
  let missing = 0;
  console.log(`WordPress at ${WP}${auth.Authorization ? '' : ' (published posts only; no application password set)'}\n`);
  console.log('Post type             site      WordPress   status');
  for (const r of rows) {
    const gap = r.expected === null ? null : r.expected - (r.wp ?? 0);
    const status = r.wp === null ? 'cannot read (is the plugin deployed?)' : gap === null ? 'n/a' : gap <= 0 ? 'in step' : `MISSING ${gap.toLocaleString('en-AU')}`;
    if (r.wp === null || (gap !== null && gap > 0)) missing += 1;
    console.log(`${r.name.padEnd(21)} ${String(r.expected ?? '-').padStart(7)}   ${String(r.wp ?? '?').padStart(9)}   ${status}   (${r.note})`);
  }
  let problems = 0;
  if (!process.argv.includes('--quick')) {
    console.log('\nPost by post (this reads every post, so it takes a minute or two):');
    problems += await deepCheck('service-area-pages', 'service-area-pages', new Set(eligible.filter((p) => p.kind === 'service').map((p) => p.key)), pageKey);
    problems += await deepCheck('register-area-pages', 'register-area-pages', new Set(eligible.filter((p) => p.kind === 'register').map((p) => p.key)), pageKey);
    const listings = await RegisterListing.find({}).select('type slug').lean<{ type: string; slug: string }[]>();
    problems += await deepCheck('register-listings', 'register-listings', new Set(listings.map((l) => `${l.type}:${l.slug}`)), (p) => (p.meta?.mongo_slug ? `${p.meta.register_type}:${p.meta.mongo_slug}` : null));
  }
  console.log(missing || problems ? '\nNot in step. To add what is missing run: npx tsx src/scripts/syncAllToWordPress.ts' : '\nWordPress is in step with the site, post by post.');
  process.exit(missing || problems ? 2 : 0);
}

main().catch((err) => { console.error('[audit-wp-sync] Fatal error:', err); process.exit(1); });
