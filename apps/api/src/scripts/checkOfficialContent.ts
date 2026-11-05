import 'dotenv/config';
import * as content from '@soldirectory/topic-content';
import { EDITORIAL_BLOG_POSTS } from '@soldirectory/topic-content';
import { runJob } from '../services/jobRunner.js';
import { politeFetch } from '../services/officialSources.js';
import { EmailService } from '../services/email.service.js';
import { siteOrigin } from '../services/emailTokens.js';
import { JOB_CATALOG } from '../services/jobCatalog.js';
import {
  DEFAULT_MAX_CHECK_AGE_DAYS, applyOutcome, buildFindings, classifyFailure, isGovernmentHost, isUncheckable, monitorHealth, outcomeFromHtml, renderWeeklyReport,
  type ArticleInfo, type CheckedUrl, type StoredCheck, type UsedBy,
} from '../services/officialContentCheck.js';
import SourceCheck from '../models/SourceCheck.js';
import JobRun from '../models/JobRun.js';
import CrawlState from '../models/CrawlState.js';
import SourceUpdate from '../models/SourceUpdate.js';

/**
 * Weekly check of the official pages our guides and articles rely on, plus a health report on the official-source monitor.
 * Runs every Monday (see services/jobCatalog.ts) and emails the admin one summary: links that broke, official pages that changed since an
 * article was last checked, articles whose "source checked" date is over CONTENT_MAX_CHECK_AGE_DAYS (30) old, pages that could not be
 * checked, and whether the monitor is running and getting through.
 *
 * It reads pages politely: robots.txt is obeyed, there is a pause between requests, and a site that turns it away is left alone (the same
 * crawler rules as the monitor; see CONTENT_RADAR.md). It never edits an article: a person re-reads the page and moves the checked date.
 *
 *   npm run job:official-content-check -w apps/api                 # the weekly run
 *   npm run job:official-content-check -w apps/api -- --dry-run    # reads pages, changes and sends nothing, prints the report
 *   npm run job:official-content-check -w apps/api -- --limit 20   # only the first 20 pages (a quick test)
 */
const dryRun = process.argv.includes('--dry-run');
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg >= 0 ? Number(process.argv[limitArg + 1]) || undefined : undefined;
const MAX_URLS = LIMIT ?? Math.max(20, Number(process.env.OFFICIAL_CHECK_MAX_URLS) || 400);
const MAX_AGE_DAYS = Math.max(1, Number(process.env.CONTENT_MAX_CHECK_AGE_DAYS) || DEFAULT_MAX_CHECK_AGE_DAYS);
const MONITOR_DAYS = 7;

function collect(): { cited: Map<string, UsedBy[]>; articles: ArticleInfo[] } {
  const cited = new Map<string, UsedBy[]>();
  const add = (raw: string, by: UsedBy) => {
    const url = raw.replace(/[.,;:]+$/, '').split('#')[0];
    if (!isGovernmentHost(url) || isUncheckable(url)) return;
    const list = cited.get(url) ?? [];
    if (!list.some((b) => b.title === by.title)) list.push(by);
    cited.set(url, list);
  };

  const articles: ArticleInfo[] = [];
  for (const p of EDITORIAL_BLOG_POSTS) {
    const checkedAt = new Date(p.checkedAt);
    articles.push({ title: p.title, slug: p.slug, checkedAt, expiresAt: p.expiresAt ? new Date(p.expiresAt) : undefined });
    const by: UsedBy = { kind: 'article', title: p.title, slug: p.slug, checkedAt };
    add(p.source.url, by);
    for (const s of p.additionalSources ?? []) add(s.url, by);
  }

  // Everything else in the shared content (guides, funding, language and condition pages) that links to an official site.
  const walk = (value: unknown, by: UsedBy, seen = new Set<unknown>()) => {
    if (typeof value === 'string') { for (const m of value.matchAll(/https?:\/\/[^\s'"`)<>\\]+/g)) add(m[0], by); return; }
    if (value === null || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    for (const v of Object.values(value)) walk(v, by, seen);
  };
  for (const [name, value] of Object.entries(content)) {
    if (name === 'EDITORIAL_BLOG_POSTS' || typeof value === 'function') continue;
    walk(value, { kind: 'page', title: name.replace(/_/g, ' ').toLowerCase() });
  }
  return { cited, articles };
}

const toStored = (doc: any): StoredCheck | null => doc && ({
  status: doc.status, detail: doc.detail, lastAttemptAt: doc.lastAttemptAt, lastOkAt: doc.lastOkAt, hash: doc.contentHash, words: doc.words,
  hashChangedAt: doc.hashChangedAt, changeCount: doc.changeCount ?? 0,
});

runJob('official-content-check', async () => {
  const now = new Date();
  const { cited, articles } = collect();
  // Pages cited by articles first, since those are the ones with a date to compare.
  const all = [...cited.entries()].sort((a, b) => Number(b[1].some((u) => u.kind === 'article')) - Number(a[1].some((u) => u.kind === 'article')));
  const chosen = all.slice(0, MAX_URLS);
  const truncated = all.length - chosen.length;

  const previous = new Map((await SourceCheck.find({ url: { $in: chosen.map(([u]) => u) } }).lean()).map((d) => [d.url, toStored(d)]));
  const checked: CheckedUrl[] = [];
  let firstReads = 0;
  for (let i = 0; i < chosen.length; i += 1) {
    const [url, usedBy] = chosen[i];
    let outcome;
    try { outcome = outcomeFromHtml(await politeFetch(url, 'detail')); } catch (err) { outcome = classifyFailure(err); }
    const prev = previous.get(url) ?? null;
    if (outcome.status === 'ok' && !prev?.hash) firstReads += 1;
    const state = applyOutcome(prev, outcome, now);
    checked.push({ url, state, usedBy });
    if (!dryRun) {
      await SourceCheck.updateOne({ url }, {
        $set: { status: state.status, detail: state.detail, lastAttemptAt: now, lastOkAt: state.lastOkAt, contentHash: state.hash, words: state.words, hashChangedAt: state.hashChangedAt, changeCount: state.changeCount },
      }, { upsert: true });
    }
    if ((i + 1) % 25 === 0) console.log(`[official-content-check] ${i + 1}/${chosen.length} pages`);
  }

  const findings = buildFindings({ urls: checked, articles, now, maxAgeDays: MAX_AGE_DAYS, firstReads });

  const since = new Date(now.getTime() - MONITOR_DAYS * 86_400_000);
  const monitorDef = JOB_CATALOG.find((j) => j.name === 'ndis-news-monitor');
  const [runs, blocks, sources, newItems, needsRecheck] = await Promise.all([
    JobRun.find({ name: 'ndis-news-monitor', startedAt: { $gte: since } }).select('startedAt status summary error').lean(),
    CrawlState.find({ blockedUntil: { $gt: now } }).lean(),
    SourceUpdate.aggregate([{ $group: { _id: '$source', lastSeenAt: { $max: '$lastSeenAt' } } }]),
    SourceUpdate.countDocuments({ firstSeenAt: { $gte: since } }),
    SourceUpdate.countDocuments({ needsRecheck: true }),
  ]);
  const monitor = monitorHealth({
    runs: runs.map((r) => ({ startedAt: r.startedAt, status: r.status, summary: r.summary, error: r.error })),
    now, everyHours: monitorDef?.everyHours ?? 6, days: MONITOR_DAYS,
    blocks: blocks.map((b) => ({ origin: b.origin, reason: b.reason, blockedUntil: b.blockedUntil as Date })),
    sources: sources.map((s: any) => ({ source: s._id, lastSeenAt: s.lastSeenAt })),
    newItems, needsRecheck,
  });

  const report = renderWeeklyReport({ findings, monitor, maxAgeDays: MAX_AGE_DAYS, siteUrl: siteOrigin(), truncated });
  const parts = [
    `${findings.checked} official pages checked (${findings.ok} read, ${findings.broken.length} broken, ${findings.changed.length} changed since an article was checked, ${findings.unverified.reduce((n, u) => n + u.count, 0)} could not be checked)`,
    `${findings.overdue.length} article(s) last checked over ${MAX_AGE_DAYS} days ago`,
    `monitor ran ${monitor.ran} of about ${monitor.expected} expected, ${monitor.issues.length} issue(s)`,
  ];
  if (dryRun) {
    console.log(report.title);
    console.log(report.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
    return `Dry run: ${parts.join('; ')}.`;
  }
  const sent = await EmailService.notifyAdmin(report.title, report.html, `${siteOrigin()}/admin/content`);
  return `${parts.join('; ')}. ${sent ? 'Admin emailed.' : 'No admin email address is set (ADMIN_NOTIFICATION_EMAIL), so nothing was sent.'}`;
});
