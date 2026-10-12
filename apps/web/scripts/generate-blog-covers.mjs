/**
 * Draws a cover picture for every blog article.
 *
 *   npm run images:blog-covers -w apps/web
 *
 * Each cover is built from the article's slug (so it never changes between runs): a gradient in its topic's colours, soft
 * light orbs, one of four background patterns, a frosted medallion holding the topic icon, and a few accent shapes.
 * No photograph is involved, so no two articles share a picture and nothing here is licensed stock.
 * Writes public/images/blog/<slug>.jpg (1200x675) and public/images/blog-thumbs/<slug>.jpg (800x450, used on cards).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, '..');
const repoRoot = path.resolve(webRoot, '..', '..');
const { EDITORIAL_BLOG_POSTS } = await import(pathToFileURL(path.join(repoRoot, 'packages/topic-content/index.js')).href);
const { BLOG_COVERS } = await import(pathToFileURL(path.join(repoRoot, 'packages/topic-content/blogCovers.js')).href);

const W = 1200;
const H = 675;

// Colours per topic family: [gradient start, gradient end, accent]
const FAMILIES = {
  choosing: ['#0A2A5C', '#1769E0', '#62C1A0'],
  plans: ['#11275F', '#3566D6', '#9CC2FF'],
  rights: ['#2A1A5E', '#5E40C8', '#C3B2FF'],
  everyday: ['#0A4A66', '#18A0A0', '#A5E8CF'],
  housing: ['#5B2C0E', '#D0791C', '#FFD7A0'],
  local: ['#06404D', '#1198B0', '#A9F1F4'],
  aged: ['#1A4A38', '#3C9D7A', '#CDEFDD'],
  workers: ['#18284A', '#3C6CA8', '#F2B544'],
  news: ['#0B2D5C', '#3D5A80', '#E5A92B'],
};
const FAMILY_BY_CATEGORY = {
  'Choosing providers': 'choosing',
  'Plans and funding': 'plans',
  'Your rights': 'rights',
  'Everyday supports': 'everyday',
  'Housing and living': 'housing',
  'Local supports': 'local',
  'Aged care': 'aged',
  'For workers': 'workers',
  'Plan changes': 'news',
  'Provider updates': 'news',
  'Service notices': 'news',
};

// Icons on a 24x24 grid, drawn as outlines.
const ICONS = {
  house: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/>',
  shield: '<path d="M12 3 5 6v5.5c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6l-7-3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  document: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 12h6M9.5 15.5h6M9.5 8.5h2"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.5-3.2 2.8-5 5.5-5s5 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16 14.2c2.6-.2 4.5 1.4 5 4.3"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/><path d="M8.5 14h2M13.5 14h2"/>',
  car: '<path d="M4 15v-3l2-5h12l2 5v3"/><path d="M3.5 15h17v3h-17zM7 18v1.5M17 18v1.5"/><circle cx="8" cy="12.5" r=".8"/><circle cx="16" cy="12.5" r=".8"/>',
  clipboard: '<rect x="5.5" y="4.5" width="13" height="16.5" rx="2"/><path d="M9 4.5h6v2.5H9z"/><path d="m9 13 2 2 4-4.5"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  key: '<circle cx="8" cy="12" r="3.8"/><path d="M11.8 12H21M17.5 12v3M20 12v2"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.2 2"/>',
  book: '<path d="M4 5.5c3-1.2 6-1 8 1 2-2 5-2.2 8-1V19c-3-1.2-6-1-8 1-2-2-5-2.2-8-1z"/><path d="M12 6.5V20"/>',
  megaphone: '<path d="M4 10v4h3l8 4V6L7 10z"/><path d="M18 9.5c1.2.8 1.2 4.2 0 5"/>',
  scale: '<path d="M12 4v16M7 20h10M5 8h14"/><path d="M5 8 2.5 14h5zM19 8l-2.5 6h5z"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  wallet: '<rect x="3.5" y="6.5" width="17" height="12" rx="2"/><path d="M3.5 10h17"/><circle cx="16.5" cy="14" r="1"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  lightbulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3Z"/>',
  cross: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>',
  swap: '<path d="M5 8h13l-3-3M19 16H6l3 3"/>',
  folder: '<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
  umbrella: '<path d="M3.5 12a8.5 8.5 0 0 1 17 0z"/><path d="M12 12v6a2 2 0 0 0 4 0"/>',
  flag: '<path d="M6 21V4M6 5h12l-2.5 4 2.5 4H6"/>',
  fork: '<path d="M12 20v-7M12 13 6 6M12 13l6-7"/><circle cx="6" cy="5" r="1.5"/><circle cx="18" cy="5" r="1.5"/>',
  cup: '<path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 4.5v2M12 4.5v2"/>',
  briefcase: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5v-2h6v2M3.5 12.5h17"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
};

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const between = (r, lo, hi) => lo + r() * (hi - lo);
const pick = (r, list) => list[Math.floor(r() * list.length)];

function coverSvg(slug, family, iconKey) {
  const r = rng(hash(slug));
  const [c1, c2, accent] = FAMILIES[family];
  const angle = Math.floor(between(r, 15, 75));
  const rad = (angle * Math.PI) / 180;
  const gx = (Math.cos(rad) * 50).toFixed(1);
  const gy = (Math.sin(rad) * 50).toFixed(1);

  // the medallion sits right of centre, at a slightly different place for each article
  const cx = Math.round(between(r, 800, 940));
  const cy = Math.round(between(r, 270, 350));

  const orbs = Array.from({ length: 4 }, (_, i) => {
    const rad2 = Math.round(between(r, 150, 300));
    const fill = i === 0 ? '#FFFFFF' : pick(r, [accent, c2, accent]);
    const opacity = i === 0 ? between(r, 0.10, 0.18) : between(r, 0.20, 0.38);
    return `<circle cx="${Math.round(between(r, -40, W + 40))}" cy="${Math.round(between(r, -40, H * 0.8))}" r="${rad2}" fill="${fill}" opacity="${opacity.toFixed(2)}" filter="url(#blur)"/>`;
  }).join('');

  const patternChoice = Math.floor(r() * 4);
  let pattern = '';
  if (patternChoice === 0) {
    pattern = `<rect width="${W}" height="${H}" fill="url(#dots)" opacity="0.22" mask="url(#fadeL)"/>`;
  } else if (patternChoice === 1) {
    pattern = [250, 330, 410, 490, 570].map((rr) => `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="#fff" stroke-opacity="${(0.16 - rr / 5200).toFixed(3)}" stroke-width="2"/>`).join('');
  } else if (patternChoice === 2) {
    pattern = `<rect width="${W}" height="${H}" fill="url(#stripes)" opacity="0.9" mask="url(#fadeL)"/>`;
  } else {
    const waves = Array.from({ length: 6 }, (_, i) => {
      const y = 120 + i * 95 + between(r, -20, 20);
      const amp = between(r, 30, 70);
      return `<path d="M-20 ${y.toFixed(0)} C 200 ${(y - amp).toFixed(0)}, 400 ${(y + amp).toFixed(0)}, 640 ${y.toFixed(0)} S 1040 ${(y - amp).toFixed(0)}, 1240 ${y.toFixed(0)}" fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="2.5"/>`;
    }).join('');
    pattern = waves;
  }

  const chips = Array.from({ length: 3 }, () => {
    const x = Math.round(between(r, 60, W - 60));
    const y = Math.round(between(r, 50, H - 50));
    const size = Math.round(between(r, 16, 34));
    // keep chips clear of the medallion
    if (Math.hypot(x - cx, y - cy) < 230) return '';
    return r() > 0.5
      ? `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${accent}" opacity="0.9"/>`
      : `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size / 4}" fill="${accent}" opacity="0.85" transform="rotate(${Math.round(between(r, 10, 60))} ${x} ${y})"/>`;
  }).join('');

  // three layers of soft hills along the bottom give the picture depth
  const hills = [0, 1, 2].map((layer) => {
    const base = H - 150 + layer * 55;
    const a1 = between(r, 30, 80);
    const a2 = between(r, 30, 80);
    const x1 = between(r, 200, 500);
    const x2 = between(r, 650, 1000);
    const colours = [accent, c2, '#FFFFFF'];
    const opacities = [0.20, 0.30, 0.16];
    return `<path d="M-20 ${H + 20} L-20 ${base.toFixed(0)} C ${x1.toFixed(0)} ${(base - a1).toFixed(0)}, ${(x1 + 200).toFixed(0)} ${(base + a1 / 2).toFixed(0)}, 620 ${(base - a2 / 2).toFixed(0)} S ${x2.toFixed(0)} ${(base - a2).toFixed(0)}, ${W + 20} ${(base - 10).toFixed(0)} L${W + 20} ${H + 20} Z" fill="${colours[layer]}" opacity="${opacities[layer]}"/>`;
  }).join('');

  const iconScale = 14;
  const iconSize = 24 * iconScale;
  const icon = ICONS[iconKey] ?? ICONS.compass;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="${(50 - gx).toFixed(1)}%" y1="${(50 - gy).toFixed(1)}%" x2="${(50 + Number(gx)).toFixed(1)}%" y2="${(50 + Number(gy)).toFixed(1)}%">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="46"/></filter>
    <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.2" fill="#fff"/></pattern>
    <pattern id="stripes" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><rect width="9" height="30" fill="#fff" opacity="0.10"/></pattern>
    <linearGradient id="fadeLg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.1"/><stop offset="0.55" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <mask id="fadeL"><rect width="${W}" height="${H}" fill="url(#fadeLg)"/></mask>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/></linearGradient>
    <radialGradient id="medal" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity="0.34"/><stop offset="1" stop-color="#fff" stop-opacity="0.08"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${orbs}
  ${pattern}
  ${chips}
  ${hills}
  <circle cx="${cx}" cy="${cy + 14}" r="196" fill="#000" opacity="0.18" filter="url(#blur)"/>
  <circle cx="${cx}" cy="${cy}" r="250" fill="none" stroke="#fff" stroke-opacity="0.16" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="216" fill="none" stroke="#fff" stroke-opacity="0.26" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="190" fill="url(#medal)" stroke="#fff" stroke-opacity="0.55" stroke-width="3"/>
  <g transform="translate(${cx - iconSize / 2} ${cy - iconSize / 2}) scale(${iconScale})" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>
</svg>`;
}

const outFull = path.join(webRoot, 'public', 'images', 'blog');
const outThumb = path.join(webRoot, 'public', 'images', 'blog-thumbs');
fs.mkdirSync(outFull, { recursive: true });
fs.mkdirSync(outThumb, { recursive: true });

let made = 0;
const missing = [];
for (const post of EDITORIAL_BLOG_POSTS) {
  const spec = BLOG_COVERS[post.slug];
  if (!spec) { missing.push(post.slug); continue; }
  const family = FAMILY_BY_CATEGORY[post.category] ?? 'choosing';
  const svg = Buffer.from(coverSvg(post.slug, family, spec.icon));
  await sharp(svg).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(outFull, `${post.slug}.jpg`));
  await sharp(svg).resize(800, 450).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(outThumb, `${post.slug}.jpg`));
  made += 1;
}
console.log(`Drew ${made} covers.`);
if (missing.length) console.log('No cover entry for:', missing.join(', '));
