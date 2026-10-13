/**
 * Builds the blog cover photographs. Every article has its own photo (see packages/topic-content/blogCovers.js):
 *   public/images/blog/<slug>.jpg         1200x675  article header and featured card
 *   public/images/blog-thumbs/<slug>.jpg   800x450  article grids and related-article cards
 * Each is a crop of a real photo from the site's licensed library (credits: public/images/banners/credits.json).
 * The script refuses to run if two articles share a photo, so covers cannot repeat from one article to another.
 *
 *   npm run images:blog-covers -w apps/web
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const images = path.join(root, 'public/images');
const { BLOG_COVERS } = await import(pathToFileURL(path.join(root, '../../packages/topic-content/blogCovers.js')).href);
const { EDITORIAL_BLOG_POSTS } = await import(pathToFileURL(path.join(root, '../../packages/topic-content/blog.js')).href);

const problems = [];
const seen = new Map();
for (const post of EDITORIAL_BLOG_POSTS) {
  const cover = BLOG_COVERS[post.slug];
  if (!cover) { problems.push(`${post.slug}: no entry in blogCovers.js`); continue; }
  const file = path.join(images, cover.photo);
  if (!existsSync(file)) problems.push(`${post.slug}: photo not found (${cover.photo})`);
  if (seen.has(cover.photo)) problems.push(`${post.slug}: shares ${cover.photo} with ${seen.get(cover.photo)}`);
  seen.set(cover.photo, post.slug);
}
for (const slug of Object.keys(BLOG_COVERS)) {
  if (!EDITORIAL_BLOG_POSTS.some((p) => p.slug === slug)) problems.push(`${slug}: in blogCovers.js but not an article`);
}
if (problems.length) {
  console.error(`Not built:\n - ${problems.join('\n - ')}`);
  process.exit(1);
}

await mkdir(path.join(images, 'blog'), { recursive: true });
await mkdir(path.join(images, 'blog-thumbs'), { recursive: true });

let bytes = 0;
for (const post of EDITORIAL_BLOG_POSTS) {
  const source = path.join(images, BLOG_COVERS[post.slug].photo);
  const crop = (w, h, quality) => sharp(source).rotate().resize(w, h, { fit: 'cover', position: sharp.strategy.attention }).jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer();
  const [full, thumb] = await Promise.all([crop(1200, 675, 80), crop(800, 450, 76)]);
  await writeFile(path.join(images, 'blog', `${post.slug}.jpg`), full);
  await writeFile(path.join(images, 'blog-thumbs', `${post.slug}.jpg`), thumb);
  bytes += full.length + thumb.length;
}
console.log(`Built ${EDITORIAL_BLOG_POSTS.length} covers from ${seen.size} different photos (${Math.round(bytes / 1024)} KB).`);
