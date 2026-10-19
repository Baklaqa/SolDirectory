import { createHash } from 'node:crypto';
import { mirrorablePaths } from '../../controllers/sitemap.controller.js';
import { renderSeoPage } from './renderPage.js';
import { wordpressConfigured } from '../pageContent/wpSync.js';

/**
 * Copies the site's authored pages and articles (guides, funding, condition and language topics, legal pages, glossary, blog posts and
 * location pages) into WordPress as "site_article" posts, with the same HTML a crawler sees. One-way: the code is the source, and a
 * post is rewritten when its page changes. Posts are not publicly routed, so they never compete with the real pages.
 */
const env = () => ({ url: process.env.WORDPRESS_URL, user: process.env.WORDPRESS_APP_USER, pass: process.env.WORDPRESS_APP_PASSWORD });

async function wp(method: 'GET' | 'POST', path: string, body?: unknown): Promise<any> {
  const e = env();
  const res = await fetch(`${e.url!.replace(/\/$/, '')}${path}`, {
    method,
    headers: { Authorization: 'Basic ' + Buffer.from(`${e.user}:${e.pass}`).toString('base64'), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`WordPress ${method} ${path} -> ${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

export const articleSlug = (path: string): string => (path === '/' ? 'home' : path.replace(/^\/+|\/+$/g, '').replace(/\//g, '--')).slice(0, 190);
const kindOf = (path: string): string => (path === '/' ? 'home' : path.split('/')[1] || 'page');

export interface MirrorResult { paths: number; created: number; updated: number; unchanged: number; skipped: string[]; failed: { path: string; error: string }[] }

export async function mirrorSiteContent(opts: { paths?: string[]; dryRun?: boolean } = {}): Promise<MirrorResult> {
  const paths = opts.paths ?? (await mirrorablePaths());
  const out: MirrorResult = { paths: paths.length, created: 0, updated: 0, unchanged: 0, skipped: [], failed: [] };
  if (opts.dryRun || !wordpressConfigured()) return out;

  let next = 0;
  const worker = async () => {
    while (next < paths.length) {
      const path = paths[next++];
      try {
        const page = await renderSeoPage(path);
        if (!page || !page.html) { out.skipped.push(path); continue; }
        const slug = articleSlug(path);
        const hash = createHash('sha1').update(JSON.stringify([page.title, page.description, page.robots, page.html])).digest('hex');
        const found = await wp('GET', `/wp-json/wp/v2/site-articles?slug=${encodeURIComponent(slug)}&status=any&_fields=id,meta`);
        const existing = Array.isArray(found) ? found[0] : null;
        if (existing?.meta?.sd_hash === hash) { out.unchanged += 1; continue; }
        const payload = {
          slug,
          title: page.h1 || page.title,
          content: page.html,
          status: 'publish',
          meta: {
            sd_kind: kindOf(path), sd_path: path, sd_title_tag: page.title, sd_seo_description: page.description,
            sd_canonical: page.canonical, sd_robots: page.robots, sd_jsonld_json: JSON.stringify(page.jsonLd), sd_hash: hash,
          },
        };
        if (existing?.id) { await wp('POST', `/wp-json/wp/v2/site-articles/${existing.id}`, payload); out.updated += 1; }
        else { await wp('POST', '/wp-json/wp/v2/site-articles', payload); out.created += 1; }
      } catch (err) {
        out.failed.push({ path, error: err instanceof Error ? err.message : String(err) });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(3, paths.length) }, worker));
  return out;
}
