/**
 * Checks that every outside link in the shared content (guides, blog posts, funding pages, language resources, glossary) still opens.
 * The guides rely on official sources (NDIS, NDIA, NDIS Commission, My Aged Care, Services Australia and others), and an official
 * page that has moved is the most common way a guide goes out of date. Read-only.
 *
 *   node scripts/check-official-links.mjs            # all outside links, 8 at a time
 *   node scripts/check-official-links.mjs --json     # machine-readable
 *
 * A link counts as fine if it answers 200 to a GET (redirects followed). 403 and 429 from a government site's bot filter are listed
 * separately as "blocked", because they usually open fine in a browser; open those by hand.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const content = await import(pathToFileURL(path.resolve(here, '../../../packages/topic-content/index.js')).href);

const found = new Map(); // url -> where it is used (export name)
const walk = (value, source, seen = new Set()) => {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'string') for (const m of value.matchAll(/https?:\/\/[^\s'"`)<>\\]+/g)) { const u = m[0].replace(/[.,;:]+$/, ''); if (!found.has(u)) found.set(u, source); }
    return;
  }
  if (seen.has(value)) return;
  seen.add(value);
  for (const v of Object.values(value)) walk(v, source, seen);
};
for (const [name, value] of Object.entries(content)) walk(value, name);

// Links to our own site and to documentation or standards are not what this check is for.
const skip = /(^https?:\/\/(www\.)?(w3\.org|schema\.org|creativecommons\.org|directory\.solbusinessconsultant\.com\.au|example\.)|\{)/;
const urls = [...found.keys()].filter((u) => !skip.test(u)).sort();

async function check(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (SolDirectory link check)' }, signal: AbortSignal.timeout(25000) });
    return { url, status: res.status };
  } catch (err) {
    return { url, status: 0, error: String(err?.cause?.code ?? err?.name ?? err).slice(0, 40) };
  }
}

const results = [];
for (let i = 0; i < urls.length; i += 8) results.push(...(await Promise.all(urls.slice(i, i + 8).map(check))));

const bad = results.filter((r) => r.status !== 200 && r.status !== 403 && r.status !== 429);
const blocked = results.filter((r) => r.status === 403 || r.status === 429);
if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ checked: results.length, broken: bad.map((r) => ({ ...r, usedIn: found.get(r.url) })), blocked: blocked.map((r) => r.url) }, null, 2));
} else {
  console.log(`${results.length} outside links checked: ${results.length - bad.length - blocked.length} open, ${bad.length} broken, ${blocked.length} blocked (open by hand).`);
  for (const r of bad) console.log(`  BROKEN ${r.status || r.error}  ${r.url}   (${found.get(r.url)})`);
  for (const r of blocked) console.log(`  BLOCKED ${r.status}  ${r.url}`);
}
process.exit(bad.length ? 1 : 0);
