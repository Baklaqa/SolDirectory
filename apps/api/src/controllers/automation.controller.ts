import type { Request, Response } from 'express';
import PageContent from '../models/PageContent.js';
import { INDEX_PHASE } from '@soldirectory/topic-content';
import { buildFacts, listEligiblePages } from '../services/pageContent/facts.js';
import { parseKey } from '../services/pageContent/keys.js';
import { BANNED_RULES, DEFAULT_MIN_SCORE, LIMITS } from '../services/pageContent/score.js';
import { approvedContentFor, evaluate, minScore, saveEvaluated, staleCheck, unpublish } from '../services/pageContent/store.js';
import { syncPagesToWordPress, wordpressConfigured } from '../services/pageContent/wpSync.js';

const str = (v: unknown) => (typeof v === 'string' ? v : Array.isArray(v) ? String(v[0] ?? '') : '');
const int = (v: unknown, d: number, max: number) => Math.min(max, Math.max(1, Math.floor(Number(v)) || d));

/** GET /api/automation/health: confirms the key works and shows the settings the workflow should respect. */
export async function health(_req: Request, res: Response) {
  const counts = await PageContent.aggregate<{ _id: string; n: number }>([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
  res.json({
    ok: true,
    minScore: minScore(),
    indexPhase: INDEX_PHASE,
    wordpressConfigured: wordpressConfigured(),
    stored: Object.fromEntries(counts.map((c) => [c._id, c.n])),
  });
}

/** GET /api/automation/rules: the schema, limits and banned wording. The workflow can build its prompt from this so the two never drift. */
export function rules(_req: Request, res: Response) {
  res.json({
    minScore: minScore(),
    defaultMinScore: DEFAULT_MIN_SCORE,
    limits: LIMITS,
    contentSchema: {
      seoTitle: 'string, the page part of the <title> (the site adds " | SolDirectory")',
      metaDescription: 'string',
      intro: 'string, plain text paragraph',
      sections: '[{ heading: string, body: string }]',
      faqs: '[{ question: string (ends in ?), answer: string }]',
    },
    banned: BANNED_RULES.map((b) => b.why),
    scoring: [
      { area: 'Structure', outOf: 20 }, { area: 'Keywords', outOf: 15 }, { area: 'Length', outOf: 10 }, { area: 'Uniqueness', outOf: 20 },
      { area: 'Grounded in the facts', outOf: 20 }, { area: 'Readability', outOf: 10 }, { area: 'Compliance', outOf: 5 },
    ],
    hardFailures: ['banned_phrase', 'markup', 'contact_details', 'unsupported_number', 'intro_missing_names'],
    note: 'A hard failure caps the score at 49 and the copy is never shown, whatever the rest scores.',
  });
}

/** GET /api/automation/stats: how many pages exist, how many have approved copy, and how many are still to do. */
export async function stats(_req: Request, res: Response) {
  const eligible = await listEligiblePages();
  const docs = await PageContent.find({}).select('key status').lean<{ key: string; status: string }[]>();
  const byKey = new Map(docs.map((d) => [d.key, d.status]));
  const out = { totalPages: eligible.length, approved: 0, rejected: 0, stale: 0, unpublished: 0, todo: 0, todoInCurrentIndexPhase: 0 };
  for (const p of eligible) {
    const s = byKey.get(p.key);
    if (s === 'approved' || s === 'rejected' || s === 'stale' || s === 'unpublished') out[s] += 1;
    else {
      out.todo += 1;
      if (p.phaseIndexable) out.todoInCurrentIndexPhase += 1;
    }
  }
  res.json({ minScore: minScore(), indexPhase: INDEX_PHASE, ...out });
}

/**
 * GET /api/automation/pages: the pages to work on, busiest first.
 *   status   todo (default: no approved copy yet) | approved | rejected | stale | unpublished | all
 *   kind     service | register
 *   state    vic, nsw, ...
 *   service  plan-management, ... (service pages)
 *   minListings, indexable=1 (only pages in the current index phase), limit (max 500), offset
 */
export async function pages(req: Request, res: Response) {
  const status = str(req.query.status) || 'todo';
  const kind = str(req.query.kind);
  const state = str(req.query.state).toLowerCase();
  const service = str(req.query.service).toLowerCase();
  const minListings = Number(req.query.minListings) || 0;
  const onlyIndexable = str(req.query.indexable) === '1';
  const limit = int(req.query.limit, 100, 500);
  const offset = Math.max(0, Math.floor(Number(req.query.offset)) || 0);

  const docs = await PageContent.find({}).select('key status score updatedAt').lean<{ key: string; status: string; score: number; updatedAt: Date }[]>();
  const byKey = new Map(docs.map((d) => [d.key, d]));
  const rows = (await listEligiblePages())
    .filter((p) => (!kind || p.kind === kind) && (!minListings || p.listings >= minListings) && (!onlyIndexable || p.phaseIndexable))
    .filter((p) => (!state || p.key.split(':')[2] === state) && (!service || p.key.startsWith(`service:${service}:`)))
    .map((p) => {
      const d = byKey.get(p.key);
      return { ...p, status: !d || d.status === 'baseline' ? 'todo' : d.status, score: d && d.status !== 'baseline' ? d.score : null, updatedAt: d?.updatedAt ?? null };
    })
    .filter((p) => status === 'all' || p.status === status);
  res.json({ total: rows.length, offset, limit, minScore: minScore(), pages: rows.slice(offset, offset + limit) });
}

/** GET /api/automation/pages/:key: the facts the copy may use, what the page says today, and any stored rewrite. */
export async function page(req: Request, res: Response) {
  const key = parseKey(str(req.params.key));
  if (!key) return res.status(400).json({ error: 'Unknown page key.' });
  const facts = await buildFacts(key);
  if (!facts) return res.status(404).json({ error: 'That page does not exist (not enough register listings, or an unknown suburb).' });
  const stored = await PageContent.findOne({ key: facts.key }).lean();
  res.json({ minScore: minScore(), facts, stored: stored ?? null });
}

/** POST /api/automation/pages/:key/validate  { content }: scores a draft without saving it. */
export async function validate(req: Request, res: Response) {
  const ev = await evaluate(str(req.params.key), req.body?.content);
  if (!ev.ok) return res.status(ev.status).json({ error: ev.error, details: ev.details });
  const { result } = ev.value;
  res.json({ ...result, wouldBeApproved: result.passed });
}

/** PUT /api/automation/pages/:key/content  { content, runId?, attempts?, source? }: scores a draft and saves it (approved or rejected). */
export async function putContent(req: Request, res: Response) {
  const ev = await evaluate(str(req.params.key), req.body?.content);
  if (!ev.ok) return res.status(ev.status).json({ error: ev.error, details: ev.details });
  const saved = await saveEvaluated(ev.value, {
    source: str(req.body?.source) || 'n8n',
    runId: str(req.body?.runId) || undefined,
    attempts: Number(req.body?.attempts) || 1,
  });
  const { result, facts } = ev.value;
  res.status(saved.stored ? 200 : 202).json({ key: facts.key, path: facts.path, ...saved, ...result });
}

export async function unpublishPage(req: Request, res: Response) {
  const ok = await unpublish(str(req.params.key));
  if (!ok) return res.status(404).json({ error: 'No stored copy for that key.' });
  res.json({ ok: true });
}

/** POST /api/automation/stale-check  { limit? }: marks approved copy stale when a number it states is no longer a fact. */
export async function runStaleCheck(req: Request, res: Response) {
  res.json(await staleCheck(int(req.body?.limit, 200, 2000)));
}

/**
 * POST /api/automation/sync  { keys?: string[], limit?, includeBaseline? }
 * Mirrors pages to WordPress (service-area pages and register-area pages) using the site's WordPress application password.
 * With no keys it syncs approved pages that have not been synced since they last changed.
 */
export async function sync(req: Request, res: Response) {
  if (!wordpressConfigured()) return res.status(503).json({ error: 'WordPress is not configured. Set WORDPRESS_URL, WORDPRESS_APP_USER and WORDPRESS_APP_PASSWORD.' });
  const keys = Array.isArray(req.body?.keys) ? (req.body.keys as unknown[]).map(String).slice(0, 500) : undefined;
  res.json(await syncPagesToWordPress({ keys, limit: int(req.body?.limit, 100, 500), includeBaseline: req.body?.includeBaseline === true }));
}

/** GET /api/page-content?path=/services/plan-management/vic/preston: approved copy for the site's own pages. Public. */
export async function publicContent(req: Request, res: Response) {
  const doc = await approvedContentFor(str(req.query.path));
  if (!doc) return res.status(404).json({ error: 'No approved copy for that page.' });
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ path: doc.path, content: doc.content, score: doc.score, approvedAt: doc.approvedAt });
}
