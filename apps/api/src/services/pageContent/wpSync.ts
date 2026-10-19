import PageContent, { type PageContentDoc } from '../../models/PageContent.js';
import { buildFacts, listEligiblePages } from './facts.js';
import { parseKey, type PageKey } from './keys.js';

/**
 * Mirrors pages to WordPress as posts so editors can read, search and unpublish them there, and so the API's WordPress endpoints
 * (/wp-json/wp/v2/service-area-pages and /register-area-pages) list every page with its facts and its current copy.
 *
 * Needs the soldirectory-content plugin's includes/page-automation.php (it registers the meta as REST-writable).
 * Mongo stays the source of truth; a post is rewritten from it every time, so edits made in wp-admin are overwritten.
 */
const env = () => ({ url: process.env.WORDPRESS_URL, user: process.env.WORDPRESS_APP_USER, pass: process.env.WORDPRESS_APP_PASSWORD });

export const wordpressConfigured = (): boolean => {
  const e = env();
  return !!(e.url && e.user && e.pass);
};

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

export const restBaseOf = (k: PageKey) => (k.kind === 'service' ? 'service-area-pages' : 'register-area-pages');

/** service:plan-management:vic:preston -> plan-management-vic-preston; register:aged_care:vic -> aged-care-vic */
export function wpSlugOf(k: PageKey): string {
  if (k.kind === 'service') return `${k.serviceSlug}-${k.state}-${k.suburbSlug}`;
  return `${k.type === 'ndis' ? 'ndis' : 'aged-care'}-${k.state}${k.suburbSlug ? `-${k.suburbSlug}` : ''}`;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderHtml(c: PageContentDoc['content']): string {
  return [
    `<p>${esc(c.intro)}</p>`,
    ...c.sections.flatMap((s) => [`<h2>${esc(s.heading)}</h2>`, `<p>${esc(s.body)}</p>`]),
    ...(c.faqs.length ? ['<h2>Frequently asked questions</h2>', ...c.faqs.flatMap((f) => [`<h3>${esc(f.question)}</h3>`, `<p>${esc(f.answer)}</p>`])] : []),
  ].join('\n');
}

export interface SyncResult {
  considered: number; created: number; updated: number; failed: { key: string; error: string }[];
  published: number; drafts: number; remaining: number;
}

async function upsert(key: PageKey, fields: Record<string, unknown>, meta: Record<string, unknown>): Promise<{ id: number; created: boolean }> {
  const base = `/wp-json/wp/v2/${restBaseOf(key)}`;
  const found = await wp('GET', `${base}?slug=${encodeURIComponent(wpSlugOf(key))}&status=any&_fields=id`);
  const payload = { slug: wpSlugOf(key), ...fields, meta };
  if (Array.isArray(found) && found[0]?.id) {
    await wp('POST', `${base}/${found[0].id}`, payload);
    return { id: found[0].id, created: false };
  }
  const made = await wp('POST', base, payload);
  return { id: made.id, created: true };
}

/**
 * `resyncBefore`: push every tracked page again whose last sync is older than this moment (use the time the run started, so one run
 * visits each page once). Needed after the WordPress plugin is fixed, to write the meta that earlier syncs lost.
 */
export async function syncPagesToWordPress(opts: { keys?: string[]; limit?: number; includeBaseline?: boolean; resyncBefore?: Date }): Promise<SyncResult> {
  const limit = opts.limit ?? 100;
  const out: SyncResult = { considered: 0, created: 0, updated: 0, failed: [], published: 0, drafts: 0, remaining: 0 };

  // 1. Pages that have stored copy.
  const filter = opts.keys
    ? { key: { $in: opts.keys } }
    : opts.resyncBefore
      ? { status: { $in: ['baseline', 'approved', 'stale', 'unpublished'] }, $or: [{ wpSyncedAt: { $exists: false } }, { wpSyncedAt: { $lt: opts.resyncBefore } }] }
      : { status: { $in: ['approved', 'stale', 'unpublished'] }, $or: [{ wpSyncedAt: { $exists: false } }, { $expr: { $lt: ['$wpSyncedAt', '$updatedAt'] } }] };
  const total = await PageContent.countDocuments(filter);
  const docs = await PageContent.find(filter).limit(limit).lean<PageContentDoc[]>();
  out.remaining = Math.max(0, total - docs.length);

  const jobs: { key: string; run: () => Promise<void> }[] = [];
  for (const d of docs) {
    jobs.push({ key: d.key, run: async () => {
      const key = parseKey(d.key);
      if (!key) return;
      const live = d.status === 'approved';
      const facts = await buildFacts(key);
      if (d.status === 'baseline') {
        if (!facts) return;
        const b = await upsert(
          key,
          { title: facts.baseline.h1, content: '', status: 'draft' },
          { sd_page_key: d.key, sd_path: d.path, sd_status: 'baseline', sd_facts_json: JSON.stringify(facts) },
        );
        await PageContent.updateOne({ key: d.key }, { $set: { wpPostId: b.id, wpSyncedAt: new Date() } }, { timestamps: false });
        out.considered += 1;
        if (b.created) out.created += 1; else out.updated += 1;
        out.drafts += 1;
        return;
      }
      const r = await upsert(
        key,
        { title: d.content.seoTitle || d.path, content: renderHtml(d.content), status: live ? 'publish' : 'draft' },
        {
          sd_page_key: d.key, sd_path: d.path, sd_status: d.status, sd_score: d.score,
          sd_seo_title: d.content.seoTitle, sd_seo_description: d.content.metaDescription, sd_intro: d.content.intro,
          sd_sections_json: JSON.stringify(d.content.sections), sd_faqs_json: JSON.stringify(d.content.faqs),
          sd_facts_json: facts ? JSON.stringify(facts) : '', sd_score_breakdown_json: JSON.stringify(d.breakdown ?? []),
          sd_approved_at: d.approvedAt ? new Date(d.approvedAt).toISOString() : '',
        },
      );
      await PageContent.updateOne({ key: d.key }, { $set: { wpPostId: r.id, wpSyncedAt: new Date() } }, { timestamps: false });
      out.considered += 1;
      if (r.created) out.created += 1; else out.updated += 1;
      if (live) out.published += 1; else out.drafts += 1;
    } });
  }

  // 2. Pages with no copy yet: a draft post carrying the facts, so every page exists in WordPress and the facts can be read from the WordPress API.
  if (opts.includeBaseline && !opts.keys) {
    const have = new Set((await PageContent.find({}).select('key').lean<{ key: string }[]>()).map((d) => d.key));
    const missing = (await listEligiblePages()).filter((p) => !have.has(p.key));
    const todo = missing.slice(0, Math.max(0, limit - docs.length));
    out.remaining += missing.length - todo.length;
    for (const p of todo) {
      jobs.push({ key: p.key, run: async () => {
        const key = parseKey(p.key);
        const facts = key ? await buildFacts(key) : null;
        if (!key || !facts) return;
        const r = await upsert(
          key,
          { title: facts.baseline.h1, content: '', status: 'draft' },
          { sd_page_key: p.key, sd_path: p.path, sd_status: 'baseline', sd_facts_json: JSON.stringify(facts) },
        );
        await PageContent.updateOne(
          { key: p.key },
          { $setOnInsert: { kind: p.kind, path: p.path, status: 'baseline', score: 0, minScore: 0, source: 'baseline' }, $set: { wpPostId: r.id, wpSyncedAt: new Date() } },
          { upsert: true, timestamps: false },
        );
        out.considered += 1;
        if (r.created) out.created += 1; else out.updated += 1;
        out.drafts += 1;
      } });
    }
  }

  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      try { await job.run(); } catch (err) { out.failed.push({ key: job.key, error: err instanceof Error ? err.message : String(err) }); }
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, jobs.length) }, worker));
  return out;
}
