import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { escapeHtml } from './emailTemplates.js';

/**
 * The weekly check of the official sources our guides and articles rely on (scripts/checkOfficialContent.ts). The logic is here, with no
 * network or database, so it can be tested.
 *
 * It answers four questions each week:
 *  1. Does every official page we cite still open? (a moved page is the most common way a guide goes out of date)
 *  2. Has any cited page changed since we last read it? (the fingerprint of its readable text differs)
 *  3. Is any article's "source checked" date more than CONTENT_MAX_CHECK_AGE_DAYS (30) old, or any time-limited notice past its end?
 *  4. Is the official-source monitor (scripts/monitorNdisNews.ts) really running and getting through, or being turned away?
 *
 * What it cannot do: tell that an article is still right. A page that answers, or even one that has not changed, does not prove the
 * article matches it; only a person reading the page can say so, and that is when they move the article's checkedAt date. Pages whose
 * site turns automated requests away are listed as "could not be checked", never reported as fine.
 */

export const DEFAULT_MAX_CHECK_AGE_DAYS = 30;
const DAY = 86_400_000;

/** Files (spreadsheets, PDFs) cannot be fingerprinted as pages. */
export const isUncheckable = (url: string): boolean => /\.(pdf|xlsx?|docx?|csv|zip)(\?|$)/i.test(url) || /\/download(\?|$)/i.test(url);

export const isGovernmentHost = (url: string): boolean => {
  try { return /\.gov\.au$/i.test(new URL(url).hostname); } catch { return false; }
};

/** A fingerprint of what a reader sees on the page: menus, scripts and forms are left out so they do not look like changes. */
export function fingerprintHtml(html: string): { hash: string; words: number } {
  const $ = load(html);
  $('script, style, noscript, nav, header, footer, aside, form, [aria-hidden="true"]').remove();
  const root = $('main').first().length ? $('main').first() : $('[role="main"]').first().length ? $('[role="main"]').first() : $('body');
  const text = root.text().replace(/\s+/g, ' ').trim();
  return { hash: createHash('sha256').update(text).digest('hex'), words: text ? text.split(' ').length : 0 };
}

export type CheckStatus = 'ok' | 'broken' | 'blocked' | 'error' | 'skipped';
export interface CheckOutcome { status: CheckStatus; detail?: string; hash?: string; words?: number }

/** What went wrong when a page could not be read. `blocked` means the site turned automated requests away (or did not answer). */
export function classifyFailure(err: unknown): CheckOutcome {
  const message = String((err as Error)?.message ?? err);
  if ((err as { name?: string })?.name === 'BlockedError' || /refused automated|did not respond|paused until|backing off/i.test(message)) return { status: 'blocked', detail: message.slice(0, 200) };
  if (/HTTP (404|410)\b/.test(message)) return { status: 'broken', detail: /HTTP (\d+)/.exec(message)?.[0] ?? 'not found' };
  if (/robots\.txt asks/i.test(message)) return { status: 'skipped', detail: 'robots.txt asks crawlers not to fetch this page' };
  return { status: 'error', detail: message.slice(0, 200) };
}

/** A page with almost no readable text is usually built by JavaScript, so a fingerprint would mean nothing. */
export function outcomeFromHtml(html: string): CheckOutcome {
  const { hash, words } = fingerprintHtml(html);
  if (words < 30) return { status: 'skipped', detail: 'the page has no readable text without JavaScript, so it cannot be fingerprinted', words };
  return { status: 'ok', hash, words };
}

export interface StoredCheck {
  status: CheckStatus;
  detail?: string;
  lastAttemptAt: Date;
  lastOkAt?: Date;
  hash?: string;
  words?: number;
  hashChangedAt?: Date;
  changeCount: number;
}

/** The new stored state after a check. A failed or skipped check keeps the last good fingerprint, so one bad week does not lose it. */
export function applyOutcome(prev: StoredCheck | null, outcome: CheckOutcome, now: Date): StoredCheck {
  const next: StoredCheck = { ...(prev ?? { changeCount: 0 }), status: outcome.status, detail: outcome.detail, lastAttemptAt: now } as StoredCheck;
  if (outcome.status === 'ok') {
    next.lastOkAt = now;
    next.words = outcome.words;
    if (prev?.hash && prev.hash !== outcome.hash) { next.hashChangedAt = now; next.changeCount = (prev.changeCount ?? 0) + 1; }
    next.hash = outcome.hash;
  }
  return next;
}

export interface UsedBy { kind: 'article' | 'page'; title: string; slug?: string; checkedAt?: Date }
export interface CheckedUrl { url: string; state: StoredCheck; usedBy: UsedBy[] }
export interface ArticleInfo { title: string; slug: string; checkedAt: Date; expiresAt?: Date }

export interface Findings {
  checked: number;
  ok: number;
  broken: { url: string; detail?: string; usedBy: UsedBy[] }[];
  /** Pages that changed after an article that cites them was last checked, so the article needs re-reading. */
  changed: { url: string; changedAt: Date; articles: UsedBy[] }[];
  /** Pages that could not be checked, grouped by site. */
  unverified: { host: string; count: number; why: string }[];
  /** Articles whose source check is older than maxAgeDays. */
  overdue: { title: string; slug: string; checkedAt: Date; ageDays: number }[];
  /** Time-limited notices whose end has passed (the site already marks them "notice has passed"). */
  expired: { title: string; slug: string; expiresAt: Date }[];
  baseline: number;
}

export function buildFindings(input: { urls: CheckedUrl[]; articles: ArticleInfo[]; now: Date; maxAgeDays: number; /** Pages read for the first time this run, so there is nothing yet to compare them with. */ firstReads?: number }): Findings {
  const { urls, articles, now, maxAgeDays } = input;
  const f: Findings = { checked: urls.length, ok: 0, broken: [], changed: [], unverified: [], overdue: [], expired: [], baseline: input.firstReads ?? 0 };
  const byHost = new Map<string, { count: number; why: string }>();
  for (const u of urls) {
    const s = u.state;
    if (s.status === 'ok') {
      f.ok += 1;
      if (s.hashChangedAt) {
        // Only the articles last checked before the change need re-reading; once an editor moves checkedAt, the flag clears by itself.
        // Guides and topic pages have no checked date to compare with, so a change is reported for them only in the week it is seen.
        const recent = now.getTime() - s.hashChangedAt.getTime() < 10 * DAY;
        const stale = u.usedBy.filter((b) => (b.kind === 'page' ? recent : !b.checkedAt || b.checkedAt.getTime() < s.hashChangedAt!.getTime()));
        if (stale.length) f.changed.push({ url: u.url, changedAt: s.hashChangedAt, articles: stale });
      }
    } else if (s.status === 'broken') {
      f.broken.push({ url: u.url, detail: s.detail, usedBy: u.usedBy });
    } else {
      let host = u.url;
      try { host = new URL(u.url).hostname; } catch { /* keep the raw value */ }
      const entry = byHost.get(host) ?? { count: 0, why: s.detail ?? s.status };
      entry.count += 1;
      byHost.set(host, entry);
    }
  }
  f.unverified = [...byHost.entries()].map(([host, v]) => ({ host, ...v })).sort((a, b) => b.count - a.count);
  for (const a of articles) {
    const ageDays = Math.floor((now.getTime() - a.checkedAt.getTime()) / DAY);
    if (a.expiresAt && a.expiresAt.getTime() <= now.getTime()) f.expired.push({ title: a.title, slug: a.slug, expiresAt: a.expiresAt });
    else if (ageDays > maxAgeDays) f.overdue.push({ title: a.title, slug: a.slug, checkedAt: a.checkedAt, ageDays });
  }
  f.overdue.sort((a, b) => b.ageDays - a.ageDays);
  return f;
}

// ---------- the monitor's health ----------------------------------------------------------------------------------------

export interface MonitorRun { startedAt: Date; status: 'running' | 'ok' | 'failed'; summary?: string; error?: string }
export interface MonitorHealth {
  days: number;
  ran: number;
  expected: number;
  failed: number;
  /** Runs where a source turned the crawler away or did not answer. */
  turnedAway: number;
  lastCleanRunAt?: Date;
  newItems: number;
  needsRecheck: number;
  issues: string[];
}

const TURNED_AWAY = /backed off|refused|paused|did not respond|could not be read|being refused/i;

export function monitorHealth(input: {
  runs: MonitorRun[];
  now: Date;
  everyHours: number;
  days: number;
  blocks: { origin: string; reason?: string; blockedUntil: Date }[];
  sources: { source: string; lastSeenAt: Date }[];
  newItems: number;
  needsRecheck: number;
}): MonitorHealth {
  const { runs, now, everyHours, days } = input;
  const finished = runs.filter((r) => r.status !== 'running');
  const expected = Math.round((days * 24) / everyHours);
  const failed = finished.filter((r) => r.status === 'failed');
  const turnedAway = finished.filter((r) => r.status === 'ok' && TURNED_AWAY.test(r.summary ?? ''));
  const clean = finished.filter((r) => r.status === 'ok' && !TURNED_AWAY.test(r.summary ?? '')).sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  const issues: string[] = [];

  if (finished.length === 0) {
    issues.push(`The monitor did not run at all in the last ${days} days. Check that its cron line is installed (it should run every ${everyHours} hours).`);
  } else if (finished.length < expected * 0.5) {
    issues.push(`The monitor ran ${finished.length} times in ${days} days; about ${expected} were expected. Check the cron line and the server's clock.`);
  }
  if (failed.length) issues.push(`${failed.length} run${failed.length === 1 ? '' : 's'} failed. The latest error: ${(failed.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0].error ?? 'no message').slice(0, 160)}`);
  if (finished.length && turnedAway.length >= Math.ceil(finished.length / 2)) {
    issues.push(`An official site turned the crawler away or did not answer on ${turnedAway.length} of ${finished.length} runs, so little or nothing new was read. If ndis.gov.au keeps refusing this server, ask the NDIA web team to allow the user agent SolDirectoryBot from the server's address, or to provide a feed. The crawler does not work round a refusal.`);
  }
  if (finished.length && clean.length === 0) issues.push(`No run in the last ${days} days read the official lists cleanly.`);
  for (const s of input.sources) {
    const age = Math.floor((now.getTime() - s.lastSeenAt.getTime()) / DAY);
    if (age >= days) issues.push(`Nothing from "${s.source}" has been seen for ${age} days (last on ${s.lastSeenAt.toISOString().slice(0, 10)}).`);
  }
  for (const b of input.blocks) if (b.blockedUntil.getTime() > now.getTime()) issues.push(`${b.origin.replace(/#(list|detail)$/, ' ($1 pages)')} is paused until ${b.blockedUntil.toISOString().slice(0, 16).replace('T', ' ')} UTC${b.reason ? ` (${b.reason})` : ''}.`);

  return { days, ran: finished.length, expected, failed: failed.length, turnedAway: turnedAway.length, lastCleanRunAt: clean[0]?.startedAt, newItems: input.newItems, needsRecheck: input.needsRecheck, issues };
}

// ---------- the weekly email ------------------------------------------------------------------------------------------------

const fmt = (d: Date) => d.toISOString().slice(0, 10);

export function renderWeeklyReport(input: { findings: Findings; monitor: MonitorHealth; maxAgeDays: number; siteUrl: string; truncated?: number }): { title: string; html: string; actions: number } {
  const { findings: f, monitor: m, maxAgeDays, siteUrl } = input;
  const articleLink = (slug: string, title: string) => `<a href="${escapeHtml(`${siteUrl}/blog/${slug}`)}">${escapeHtml(title)}</a>`;
  const list = (items: string[], max = 15) => `<ul>${items.slice(0, max).map((i) => `<li>${i}</li>`).join('')}${items.length > max ? `<li>…and ${items.length - max} more.</li>` : ''}</ul>`;
  const usedByText = (u: UsedBy[]) => u.slice(0, 3).map((b) => (b.slug ? articleLink(b.slug, b.title) : escapeHtml(b.title))).join(', ') + (u.length > 3 ? ` and ${u.length - 3} more` : '');
  const actions = f.broken.length + f.changed.length + f.overdue.length + m.issues.length;
  const sections: string[] = [];

  sections.push(`<p>This is the weekly check of the official pages our guides and articles rely on, and of the official-source monitor. ${f.checked} official pages were looked at: ${f.ok} opened and were read.${f.baseline === f.ok && f.ok > 0 ? ' This was the first read of each, so changes are reported from next week.' : ''}</p>`);

  sections.push(`<h3>Official links that no longer open (${f.broken.length})</h3>` + (f.broken.length
    ? list(f.broken.map((b) => `<a href="${escapeHtml(b.url)}">${escapeHtml(b.url)}</a> (${escapeHtml(b.detail ?? 'not found')}). Used by: ${usedByText(b.usedBy)}.`))
    : '<p>None.</p>'));

  sections.push(`<h3>Official pages that changed after an article was last checked (${f.changed.length})</h3>` + (f.changed.length
    ? `<p>Re-read each page. If the article is still right, move its checked date to today so this stops showing.</p>${list(f.changed.map((c) => `<a href="${escapeHtml(c.url)}">${escapeHtml(c.url)}</a> changed on ${fmt(c.changedAt)}. Cited by: ${usedByText(c.articles)}.`))}`
    : '<p>None.</p>'));

  sections.push(`<h3>Articles last checked more than ${maxAgeDays} days ago (${f.overdue.length})</h3>` + (f.overdue.length
    ? `<p>A person needs to re-read the official page for each one and update its checked date.</p>${list(f.overdue.map((a) => `${articleLink(a.slug, a.title)}, checked ${fmt(a.checkedAt)} (${a.ageDays} days ago)`), 20)}`
    : '<p>None. Every article was checked within the last ' + maxAgeDays + ' days.</p>'));

  if (f.expired.length) sections.push(`<h3>Time-limited notices that have passed (${f.expired.length})</h3><p>The site already marks these as passed. Remove them when they are no use.</p>${list(f.expired.map((a) => `${articleLink(a.slug, a.title)}, ended ${fmt(a.expiresAt)}`))}`);

  if (f.unverified.length) {
    sections.push(`<h3>Pages that could not be checked automatically (${f.unverified.reduce((n, u) => n + u.count, 0)})</h3><p>These sites turn automated requests away or give no readable page, so nothing is reported as fine for them. Open them in a browser now and then.</p>` +
      list(f.unverified.map((u) => `${escapeHtml(u.host)}: ${u.count} page${u.count === 1 ? '' : 's'} (${escapeHtml(u.why)})`)));
  }

  sections.push(`<h3>Official-source monitor, last ${m.days} days</h3>` +
    `<p>It ran ${m.ran} time${m.ran === 1 ? '' : 's'} (about ${m.expected} expected). ${m.newItems} new official item${m.newItems === 1 ? '' : 's'} found; ${m.needsRecheck} post${m.needsRecheck === 1 ? '' : 's'} waiting because an official page changed after it was briefed.${m.lastCleanRunAt ? ` Last clean run: ${m.lastCleanRunAt.toISOString().slice(0, 16).replace('T', ' ')} UTC.` : ''}</p>` +
    (m.issues.length ? list(m.issues.map(escapeHtml)) : '<p>No problems found.</p>'));

  if (input.truncated) sections.push(`<p>${input.truncated} further official pages were not checked this week because of the per-run limit (OFFICIAL_CHECK_MAX_URLS).</p>`);

  const title = actions ? `Weekly official-content check: ${actions} thing${actions === 1 ? '' : 's'} to look at` : 'Weekly official-content check: all clear';
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>${sections.join('')}</td></tr></table>`;
  return { title, html, actions };
}
