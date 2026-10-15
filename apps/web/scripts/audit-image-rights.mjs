/**
 * Image rights check: every image the site can show must be one of
 *   - a banner photo credited in public/images/banners/credits.json (Unsplash, with photographer and page URL),
 *   - a blog cover or thumbnail, which build-blog-covers.mjs cuts from a credited banner (checked via BLOG_COVERS),
 *   - a support-card crop of a credited banner (SUPPORT_SOURCES below),
 *   - the default share image, cut from a credited banner (SHARE_SOURCE below), or
 *   - SolDirectory's own logo files.
 * Anything else is reported, and the script exits 1, so an image with no recorded source cannot slip in.
 *
 *   npm run images:audit-rights -w apps/web
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOG_COVERS } from '../../../packages/topic-content/blogCovers.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const pub = path.join(repo, 'apps/web/public/images');
const credits = JSON.parse(fs.readFileSync(path.join(pub, 'banners/credits.json'), 'utf8'));

// Crops of credited banners (apps/web/public/images/supports/*.jpg, 720x450). Source = banner key in credits.json.
const SUPPORT_SOURCES = {
  'personal-care': 'personal-care',
  'domestic-assistance': 'housing',
  'transport': 'transport',
  'therapy-services': 'therapy-2',
  'nursing': 'older-people-2',
  'support-coordination': 'support-coordination',
  'plan-management': 'plan-management-2',
  'housing-sda-sil': 'housing-2',
};
const SHARE_SOURCE = 'general-3'; // share-default.jpg is a 1200x630 crop of banners/general-3.jpg
const OWN = new Set([
  'sol-directory-logo-black-transparent-v2.png', 'sol-directory-logo-black-transparent-v2-640.png',
  'sol-directory-logo-white-transparent-v2.png', 'sol-directory-logo-white-transparent-v2-640.png', 'email-logo-white.png',
]);
// Credited, but not used: a visible third-party name or mark, a foreign tax form, a religious text, or an identifiable
// person who would be read as having a condition. Kept out of banners and covers.
const NOT_FOR_USE = new Set([
  'language-europe', 'language-europe-2', 'plan-management-5', 'plan-management-6', 'guides-2', 'personal-care-2',
  'condition-intellectual', 'condition-intellectual-2', 'condition-intellectual-3',
]);

const problems = [];
const note = (msg) => problems.push(msg);

// 1. banners: all credited, credit complete
for (const f of fs.readdirSync(path.join(pub, 'banners'))) {
  if (!f.endsWith('.jpg')) continue;
  const key = f.replace(/\.jpg$/, '');
  const c = credits[key];
  if (!c) note(`banners/${f}: no entry in credits.json`);
  else if (!c.photographer || !c.pageUrl || c.provider !== 'unsplash') note(`banners/${f}: credit is incomplete`);
}
for (const key of Object.keys(credits)) if (!fs.existsSync(path.join(pub, 'banners', `${key}.jpg`))) note(`credits.json: ${key} has no file`);

// 2. covers: each cut from a credited banner that is allowed
for (const [slug, v] of Object.entries(BLOG_COVERS)) {
  const m = /^banners\/(.+)\.jpg$/.exec(v.photo);
  if (!m || !credits[m[1]]) note(`blog cover ${slug}: source ${v.photo} is not a credited banner`);
  else if (NOT_FOR_USE.has(m[1])) note(`blog cover ${slug}: ${m[1]} is on the not-for-use list`);
}

// 3. supports crops
for (const f of fs.readdirSync(path.join(pub, 'supports'))) {
  const key = f.replace(/\.jpg$/, '');
  const src = SUPPORT_SOURCES[key];
  if (!src || !credits[src]) note(`supports/${f}: no credited source recorded`);
}

// 4. everything else at the top level
for (const f of fs.readdirSync(pub)) {
  const full = path.join(pub, f);
  if (fs.statSync(full).isDirectory()) continue;
  if (OWN.has(f)) continue;
  if (f === 'share-default.jpg') { if (!credits[SHARE_SOURCE]) note('share-default.jpg: source banner is not credited'); continue; }
  note(`images/${f}: no recorded source (add it to credits.json's banners, or remove it)`);
}

// 5. references in code point at something that exists and is covered above
const roots = ['apps/web/src', 'apps/web/scripts', 'packages/topic-content', 'apps/api/src'].map((r) => path.join(repo, r));
const refRx = /\/images\/[A-Za-z0-9_./-]+\.(?:jpe?g|png|webp|svg|gif)/g;
const walk = (d, out = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?|mjs|css|json|html)$/.test(e.name)) out.push(p);
  }
  return out;
};
for (const r of roots) {
  for (const file of walk(r)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(refRx)) {
      const ref = m[0];
      if (/^\/images\/(blog|blog-thumbs)\//.test(ref)) continue; // built from BLOG_COVERS (checked in step 2)
      const abs = path.join(pub, ref.replace(/^\/images\//, ''));
      if (!fs.existsSync(abs)) { note(`${path.relative(repo, file)}: ${ref} does not exist`); continue; }
      if (/^\/images\/banners\//.test(ref)) {
        const key = path.basename(ref, '.jpg');
        if (NOT_FOR_USE.has(key)) note(`${path.relative(repo, file)}: ${ref} is on the not-for-use list`);
      }
    }
  }
}

if (problems.length) {
  console.error(`Image rights check: ${problems.length} problem(s)\n` + [...new Set(problems)].map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`Image rights check passed: ${Object.keys(credits).length} credited banners, ${Object.keys(BLOG_COVERS).length} covers, ${Object.keys(SUPPORT_SOURCES).length} support crops.`);
