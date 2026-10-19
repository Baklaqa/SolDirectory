/**
 * Compares what WordPress holds with what the site has, post type by post type, and says plainly what is missing.
 *
 *   npm run audit:wp-sync -w apps/api
 *
 * Uses the WordPress application password if it is set (so drafts are counted too); otherwise only published posts are counted.
 * Exits with 2 if anything is missing.
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
  console.log(missing ? '\nNot in step. Run: npx tsx src/scripts/syncAllToWordPress.ts' : '\nWordPress is in step with the site.');
  process.exit(missing ? 2 : 0);
}

main().catch((err) => { console.error('[audit-wp-sync] Fatal error:', err); process.exit(1); });
