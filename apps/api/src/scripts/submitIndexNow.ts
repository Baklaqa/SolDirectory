import fs from 'node:fs';
import path from 'node:path';

/**
 * Tells Bing (and the other IndexNow search engines: Yandex, Seznam, Naver) which pages are new or changed, so they are crawled soon
 * instead of whenever a crawler next comes by:
 *
 *   npm run indexnow -w apps/api -- [--dry-run] [--limit 500] [--base https://directory.solbusinessconsultant.com.au]
 *
 * What is sent: only URLs that are in the site's own sitemap (so nothing noindex, private or invented), and only the ones that are new
 * or whose sitemap lastmod changed since the last run. The list of what was already sent is kept in apps/api/.indexnow-state.json.
 * Sending the whole site again every day is discouraged by the IndexNow rules, so the second run onward is usually small.
 *
 * The key is public by design: the file /<key>.txt on the site proves we own it (apps/web/public). Override with INDEXNOW_KEY only
 * together with a matching file.
 */
const arg = (name: string): string | undefined => { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const flag = (name: string) => process.argv.includes(`--${name}`);

const KEY = process.env.INDEXNOW_KEY || '58eaed0cc51ebf26daec4ee2af7491b4';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH = 10_000; // the IndexNow limit per request
const STATE_FILE = path.resolve(process.cwd(), '.indexnow-state.json');

const base = (arg('base') || process.env.SITE_URL || 'https://directory.solbusinessconsultant.com.au').replace(/\/$/, '');
const limit = Math.max(0, Number(arg('limit')) || 0);
const dryRun = flag('dry-run');

const getText = async (url: string) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'SolDirectory-IndexNow/1.0' }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
};
const locs = (xml: string) => [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)].map((m) => ({ url: m[1].replace(/&amp;/g, '&'), lastmod: m[2] ?? '' }));

async function main() {
  const host = new URL(base).host;
  const keyLocation = `${base}/${KEY}.txt`;

  // The key file has to be live and exact, or the search engines will refuse everything.
  const served = (await getText(keyLocation).catch(() => '')).trim();
  if (served !== KEY) {
    console.error(`The key file ${keyLocation} is not live (or does not hold the key). Deploy the web build first, then run this again.`);
    process.exitCode = 1;
    return;
  }

  const index = await getText(`${base}/sitemap.xml`);
  const parts = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  const entries: { url: string; lastmod: string }[] = [];
  for (const part of parts) entries.push(...locs(await getText(part)));
  console.log(`Sitemap lists ${entries.length.toLocaleString('en-AU')} pages in ${parts.length} files.`);

  const state: Record<string, string> = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : {};
  let todo = entries.filter((e) => e.url.startsWith(`${base}/`) && state[e.url] !== (e.lastmod || 'sent'));
  console.log(`${todo.length.toLocaleString('en-AU')} are new or changed since the last run.`);
  if (limit) todo = todo.slice(0, limit);
  if (dryRun || !todo.length) { console.log(dryRun ? `Dry run: would send ${todo.length.toLocaleString('en-AU')}. Nothing sent.` : 'Nothing to send.'); return; }

  let sent = 0;
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: KEY, keyLocation, urlList: batch.map((e) => e.url) }),
      signal: AbortSignal.timeout(60_000),
    });
    // 200 = received, 202 = received and the key is still being checked; both mean the URLs were accepted.
    if (res.status !== 200 && res.status !== 202) {
      console.error(`IndexNow refused a batch: ${res.status} ${(await res.text()).slice(0, 200)}. Stopping; ${sent} sent so far.`);
      break;
    }
    for (const e of batch) state[e.url] = e.lastmod || 'sent';
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
    sent += batch.length;
    console.log(`Sent ${sent.toLocaleString('en-AU')} of ${todo.length.toLocaleString('en-AU')} (status ${res.status}).`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
