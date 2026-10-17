import PageContent, { type PageContentDoc, type PageContentStatus } from '../../models/PageContent.js';
import { buildFacts, type PageFacts } from './facts.js';
import { formatKey, parseKey, pathOf, type PageKey } from './keys.js';
import { copyText, DEFAULT_MIN_SCORE, numbersIn, scoreCopy, structureErrors, type PageCopy, type ScoreResult } from './score.js';

export const minScore = (): number => {
  const v = Number(process.env.AUTOMATION_MIN_SCORE);
  return Number.isFinite(v) && v >= 50 && v <= 100 ? v : DEFAULT_MIN_SCORE;
};

/** Plain-text clean-up before scoring: trims, collapses whitespace, drops empty sections and questions. */
export function cleanCopy(raw: PageCopy): PageCopy {
  const t = (s: unknown) => String(s ?? '').replace(/\s+/g, ' ').trim();
  return {
    seoTitle: t(raw.seoTitle),
    metaDescription: t(raw.metaDescription),
    intro: t(raw.intro),
    sections: (raw.sections ?? []).map((s) => ({ heading: t(s.heading), body: t(s.body) })).filter((s) => s.heading || s.body),
    faqs: (raw.faqs ?? []).map((f) => ({ question: t(f.question), answer: t(f.answer) })).filter((f) => f.question || f.answer),
  };
}

/** The key for a page in the form `service:plan-management:vic:preston`, or null if it is not a page that exists. */
export const keyOf = (raw: string): PageKey | null => parseKey(raw);

/** Copy already live on neighbouring pages (same service or register, same state), for the uniqueness check. */
async function siblingTexts(key: PageKey, limit = 60): Promise<string[]> {
  const prefix = key.kind === 'service' ? `service:${key.serviceSlug}:${key.state}:` : `register:${key.type}:${key.state}`;
  const docs = await PageContent.find({ status: 'approved', key: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $ne: formatKey(key) } })
    .select('content').sort({ approvedAt: -1 }).limit(limit).lean<PageContentDoc[]>();
  return docs.map((d) => [d.content.intro, ...d.content.sections.map((s) => s.body)].join('\n'));
}

export interface Evaluation { facts: PageFacts; copy: PageCopy; result: ScoreResult }

export type EvaluateOutcome = { ok: true; value: Evaluation } | { ok: false; status: number; error: string; details?: string[] };

export async function evaluate(rawKey: string, rawContent: unknown): Promise<EvaluateOutcome> {
  const key = parseKey(rawKey);
  if (!key) return { ok: false, status: 400, error: 'Unknown page key.' };
  const errs = structureErrors(rawContent);
  if (errs.length) return { ok: false, status: 422, error: 'The content is not in the expected shape.', details: errs };
  const facts = await buildFacts(key);
  if (!facts) return { ok: false, status: 404, error: 'That page does not exist (not enough register listings, or an unknown suburb).' };
  const copy = cleanCopy(rawContent as PageCopy);
  const result = scoreCopy(copy, facts, await siblingTexts(key), minScore());
  return { ok: true, value: { facts, copy, result } };
}

export async function saveEvaluated(
  ev: Evaluation, meta: { source?: string; runId?: string; attempts?: number },
): Promise<{ stored: boolean; status: PageContentStatus; reason?: string }> {
  const { facts, copy, result } = ev;
  const existing = await PageContent.findOne({ key: facts.key }).lean<PageContentDoc | null>();
  const status: PageContentStatus = result.passed ? 'approved' : 'rejected';
  const entry = { at: new Date(), status, score: result.score, source: meta.source ?? 'n8n', runId: meta.runId };
  // A failed rewrite never replaces copy that is already live.
  if (!result.passed && existing?.status === 'approved') {
    await PageContent.updateOne({ key: facts.key }, { $push: { history: { $each: [entry], $slice: -20 } } });
    return { stored: false, status: 'approved', reason: 'The page already has approved copy; the failed rewrite was logged and not stored.' };
  }
  await PageContent.updateOne(
    { key: facts.key },
    {
      $set: {
        kind: facts.kind, path: facts.path, status, content: copy, score: result.score, minScore: result.minScore,
        breakdown: result.breakdown, issues: result.issues.map(({ code, severity, message }) => ({ code, severity, message })),
        factNumbers: facts.numbers, source: meta.source ?? 'n8n', runId: meta.runId, attempts: meta.attempts ?? 1,
        ...(result.passed ? { approvedAt: new Date() } : {}),
      },
      $push: { history: { $each: [entry], $slice: -20 } },
    },
    { upsert: true },
  );
  approvedCache = null;
  return { stored: true, status };
}

export async function unpublish(rawKey: string): Promise<boolean> {
  const key = parseKey(rawKey);
  if (!key) return false;
  const r = await PageContent.updateOne({ key: formatKey(key) }, { $set: { status: 'unpublished' } });
  approvedCache = null;
  return r.matchedCount > 0;
}

/**
 * Re-checks approved copy against today's facts. A page whose copy states a number that is no longer true (a listing count that
 * changed after a register import, for example) is marked stale so the site stops showing it until it is rewritten.
 */
export async function staleCheck(limit = 200): Promise<{ checked: number; stale: string[] }> {
  const docs = await PageContent.find({ status: 'approved' }).sort({ checkedAt: 1 }).limit(limit).lean<PageContentDoc[]>();
  const stale: string[] = [];
  for (const d of docs) {
    const key = parseKey(d.key);
    const facts = key ? await buildFacts(key) : null;
    const allowed = new Set(facts?.numbers ?? []);
    const bad = !facts || numbersIn(copyText(d.content as PageCopy)).some((n) => !allowed.has(n));
    if (bad) {
      stale.push(d.key);
      await PageContent.updateOne({ key: d.key }, { $set: { status: 'stale' }, $push: { history: { $each: [{ at: new Date(), status: 'stale', score: d.score, source: 'stale-check' }], $slice: -20 } } });
    } else {
      await PageContent.updateOne({ key: d.key }, { $set: { checkedAt: new Date() } }, { timestamps: false });
    }
  }
  if (stale.length) approvedCache = null;
  return { checked: docs.length, stale };
}

// --- Read side used by the site (crawler HTML, sitemap, the SPA) ---

let approvedCache: { at: number; paths: Set<string> } | null = null;

/** Paths of pages with approved copy that scores at least the minimum. Cached for a minute. */
export async function approvedPaths(): Promise<Set<string>> {
  if (approvedCache && Date.now() - approvedCache.at < 60_000) return approvedCache.paths;
  const docs = await PageContent.find({ status: 'approved', score: { $gte: minScore() } }).select('path').lean<{ path: string }[]>();
  approvedCache = { at: Date.now(), paths: new Set(docs.map((d) => d.path)) };
  return approvedCache.paths;
}

export async function approvedContentFor(path: string): Promise<(PageContentDoc & { ok: true }) | null> {
  const clean = path.replace(/\/+$/, '').toLowerCase() || '/';
  const doc = await PageContent.findOne({ path: clean, status: 'approved', score: { $gte: minScore() } }).lean<PageContentDoc | null>();
  return doc ? { ...doc, ok: true } : null;
}

export { pathOf };
