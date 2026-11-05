/**
 * Checks the weekly official-content check's logic (services/officialContentCheck.ts) without any network or database:
 *   npx tsx src/scripts/testOfficialContent.ts
 */
import {
  applyOutcome, buildFindings, classifyFailure, fingerprintHtml, isGovernmentHost, isUncheckable, monitorHealth, outcomeFromHtml, renderWeeklyReport,
  type CheckedUrl, type StoredCheck, type UsedBy,
} from '../services/officialContentCheck.js';

let failures = 0;
const check = (ok: boolean, label: string, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok || !detail ? '' : `: ${detail}`}`); if (!ok) failures += 1; };

const DAY = 86_400_000;
const now = new Date('2026-11-09T06:00:00Z');
const daysAgo = (n: number) => new Date(now.getTime() - n * DAY);
const words = (n: number, w = 'support') => Array.from({ length: n }, () => w).join(' ');
const page = (body: string, chrome = '') => `<html><head><script>var token="${chrome}";</script></head><body><nav>Menu ${chrome}</nav><main><h1>Title</h1><p>${body}</p></main><footer>Footer ${chrome}</footer></body></html>`;

// ---- fingerprint ----
const a = fingerprintHtml(page(words(60), 'one'));
const b = fingerprintHtml(page(words(60), 'two'));
const c = fingerprintHtml(page(words(60) + ' changed'));
check(a.hash === b.hash, 'a change to the menu, footer or a script does not look like a change to the page');
check(a.hash !== c.hash, 'a change to the readable text does');
check(outcomeFromHtml(page(words(10))).status === 'skipped' && outcomeFromHtml(page(words(60))).status === 'ok', 'a page with almost no readable text is skipped, a real one is read');
check(isUncheckable('https://www.ndis.gov.au/media/8853/download?attachment') && isUncheckable('https://x.gov.au/a.pdf') && !isUncheckable('https://www.ndis.gov.au/news/1'), 'files are not fingerprinted as pages');
check(isGovernmentHost('https://www.ndis.gov.au/x') && isGovernmentHost('https://ndiscommission.gov.au') && !isGovernmentHost('https://example.com/x.gov.au'), 'only government sites are checked');

// ---- failures ----
check(classifyFailure(new Error('https://www.ndis.gov.au refused automated requests (HTTP 403). The crawler is backing off for 360 minutes')).status === 'blocked', 'a refusal is "blocked", not "broken"');
check(classifyFailure(new Error('https://www.ndis.gov.au did not respond (no answer within 25 seconds).')).status === 'blocked', 'no answer is "blocked" too');
check(classifyFailure(new Error('https://x.gov.au/p returned HTTP 404')).status === 'broken' && classifyFailure(new Error('https://x.gov.au/p returned HTTP 410')).status === 'broken', '404 and 410 are broken links');
check(classifyFailure(new Error('https://x.gov.au/p returned HTTP 500')).status === 'error', 'other errors are errors, not broken');
check(classifyFailure(new Error('robots.txt asks crawlers not to fetch /x')).status === 'skipped', 'a page robots.txt rules out is skipped');

// ---- state over weeks ----
let s: StoredCheck | null = null;
s = applyOutcome(s, { status: 'ok', hash: 'h1', words: 100 }, daysAgo(21));
check(s.hash === 'h1' && !s.hashChangedAt && s.changeCount === 0, 'the first read only records the page');
s = applyOutcome(s, { status: 'ok', hash: 'h1', words: 100 }, daysAgo(14));
check(!s.hashChangedAt, 'an unchanged page is not reported');
s = applyOutcome(s, { status: 'ok', hash: 'h2', words: 100 }, daysAgo(7));
check(s.hashChangedAt?.getTime() === daysAgo(7).getTime() && s.changeCount === 1, 'a changed page records when it changed');
s = applyOutcome(s, { status: 'blocked', detail: 'refused' }, daysAgo(3));
check(s.hash === 'h2' && s.status === 'blocked' && s.hashChangedAt?.getTime() === daysAgo(7).getTime(), 'a week when the site turns us away keeps the last good fingerprint');
s = applyOutcome(s, { status: 'ok', hash: 'h2', words: 100 }, now);
check(s.status === 'ok' && s.changeCount === 1 && s.hashChangedAt?.getTime() === daysAgo(7).getTime(), 'when it opens again with the same text, the earlier change is still remembered');

// ---- findings ----
const art = (title: string, slug: string, checked: number): UsedBy => ({ kind: 'article', title, slug, checkedAt: daysAgo(checked) });
const base = (over: Partial<StoredCheck>): StoredCheck => ({ status: 'ok', lastAttemptAt: now, lastOkAt: now, hash: 'h', changeCount: 0, ...over });
const urls: CheckedUrl[] = [
  { url: 'https://www.ndis.gov.au/changed', state: base({ hashChangedAt: daysAgo(5), changeCount: 1 }), usedBy: [art('Checked before the change', 'before', 20), art('Checked after the change', 'after', 2)] },
  { url: 'https://www.ndis.gov.au/guide-page', state: base({ hashChangedAt: daysAgo(3), changeCount: 1 }), usedBy: [{ kind: 'page', title: 'guide docs' }] },
  { url: 'https://www.ndis.gov.au/old-guide-page', state: base({ hashChangedAt: daysAgo(40), changeCount: 1 }), usedBy: [{ kind: 'page', title: 'funding groups' }] },
  { url: 'https://www.ndis.gov.au/gone', state: base({ status: 'broken', detail: 'HTTP 404' }), usedBy: [art('Uses a dead link', 'dead', 5)] },
  { url: 'https://www.ndiscommission.gov.au/a', state: base({ status: 'blocked', detail: 'refused' }), usedBy: [] },
  { url: 'https://www.ndiscommission.gov.au/b', state: base({ status: 'blocked', detail: 'refused' }), usedBy: [] },
  { url: 'https://www.ndis.gov.au/fine', state: base({}), usedBy: [art('Fine', 'fine', 1)] },
];
const articles = [
  { title: 'Exactly 30 days', slug: 'thirty', checkedAt: daysAgo(30) },
  { title: 'Thirty-one days', slug: 'thirtyone', checkedAt: daysAgo(31) },
  { title: 'Ninety days', slug: 'ninety', checkedAt: daysAgo(90) },
  { title: 'Fresh', slug: 'fresh', checkedAt: daysAgo(2) },
  { title: 'Notice that ended', slug: 'ended', checkedAt: daysAgo(60), expiresAt: daysAgo(40) },
];
const f = buildFindings({ urls, articles, now, maxAgeDays: 30, firstReads: 0 });
check(f.broken.length === 1 && f.broken[0].url.endsWith('/gone'), 'broken links are listed with what uses them');
const changedUrls = f.changed.map((x) => x.url.split('/').pop());
check(changedUrls.includes('changed') && changedUrls.includes('guide-page') && !changedUrls.includes('old-guide-page'), 'changes are listed for pages with an older checked date and for recent changes to guide pages, not for old ones', changedUrls.join(','));
check(f.changed.find((x) => x.url.endsWith('/changed'))?.articles.map((x) => x.slug).join() === 'before', 'an article checked after the change is not listed; one checked before it is');
check(f.unverified.length === 1 && f.unverified[0].host === 'www.ndiscommission.gov.au' && f.unverified[0].count === 2, 'pages that could not be checked are counted by site, never reported as fine');
check(f.overdue.map((x) => x.slug).join() === 'ninety,thirtyone', 'articles over 30 days are listed oldest first; exactly 30 days is not', f.overdue.map((x) => x.slug).join());
check(f.expired.length === 1 && f.expired[0].slug === 'ended' && !f.overdue.some((x) => x.slug === 'ended'), 'an ended notice is listed once, as ended, not as overdue');

// ---- the monitor ----
const run = (hoursAgo: number, status: 'ok' | 'failed', summary = '3 item(s) seen, 1 new', error?: string) => ({ startedAt: new Date(now.getTime() - hoursAgo * 3_600_000), status, summary, error });
const healthy = Array.from({ length: 28 }, (_, i) => run(i * 6 + 1, 'ok'));
const m1 = monitorHealth({ runs: healthy, now, everyHours: 6, days: 7, blocks: [], sources: [{ source: 'ndis-news', lastSeenAt: daysAgo(0) }], newItems: 4, needsRecheck: 0 });
check(m1.issues.length === 0 && m1.ran === 28 && m1.expected === 28, 'a monitor that ran every 6 hours and got through has no issues');
const m2 = monitorHealth({ runs: [], now, everyHours: 6, days: 7, blocks: [], sources: [], newItems: 0, needsRecheck: 0 });
check(m2.issues.length === 1 && /did not run at all/.test(m2.issues[0]), 'a monitor that never ran is reported, with what to check');
const refused = Array.from({ length: 28 }, (_, i) => run(i * 6 + 1, 'ok', '0 item(s) seen; no news list could be read right now, so the crawler backed off'));
const m3 = monitorHealth({ runs: refused, now, everyHours: 6, days: 7, blocks: [{ origin: 'https://www.ndis.gov.au#list', reason: 'HTTP 403', blockedUntil: new Date(now.getTime() + 3_600_000) }], sources: [{ source: 'ndis-news', lastSeenAt: daysAgo(12) }], newItems: 0, needsRecheck: 0 });
check(m3.turnedAway === 28 && m3.lastCleanRunAt === undefined && m3.issues.some((i) => /turned the crawler away/.test(i) && /SolDirectoryBot/.test(i)), 'a monitor that is turned away on most runs says so and what to ask the NDIA for');
check(m3.issues.some((i) => /No run in the last 7 days read the official lists cleanly/.test(i)) && m3.issues.some((i) => /ndis-news.*12 days/.test(i)) && m3.issues.some((i) => /paused until/.test(i)), 'it also reports no clean run, the source that has gone quiet, and the active pause');
const m4 = monitorHealth({ runs: [...healthy.slice(0, 20), run(30, 'failed', '', 'connect ECONNREFUSED 127.0.0.1:27017')], now, everyHours: 6, days: 7, blocks: [], sources: [], newItems: 0, needsRecheck: 2 });
check(m4.failed === 1 && m4.issues.some((i) => /1 run failed.*ECONNREFUSED/.test(i)), 'a failed run is reported with its error');

// ---- the email ----
const hostile = '<img src=x onerror=alert(1)>Evil & "Co"';
const f2 = buildFindings({ urls: [{ url: 'https://www.ndis.gov.au/gone', state: base({ status: 'broken', detail: 'HTTP 404' }), usedBy: [{ kind: 'article', title: hostile, slug: 'x"y', checkedAt: daysAgo(1) }] }], articles: [{ title: hostile, slug: 'x"y', checkedAt: daysAgo(50) }], now, maxAgeDays: 30 });
const r = renderWeeklyReport({ findings: f2, monitor: m1, maxAgeDays: 30, siteUrl: 'https://directory.example' });
check(!r.html.includes('<img src=x') && !r.html.includes('x"y'), 'article titles and addresses are escaped in the email');
check(r.actions === 2 && /2 things to look at/.test(r.title), 'the title says how many things need a look', r.title);
const clean = renderWeeklyReport({ findings: buildFindings({ urls: [{ url: 'https://www.ndis.gov.au/fine', state: base({}), usedBy: [art('Fine', 'fine', 1)] }], articles: [{ title: 'Fine', slug: 'fine', checkedAt: daysAgo(1) }], now, maxAgeDays: 30, firstReads: 1 }), monitor: m1, maxAgeDays: 30, siteUrl: 'https://directory.example' });
check(/all clear/.test(clean.title) && /first read of each/.test(clean.html) && /No problems found/.test(clean.html), 'a quiet week says "all clear", and the first week says changes are reported from next week');
check(r.html.startsWith('<table'), 'the report is sent as a block, so the admin email does not wrap it in a paragraph');

console.log(failures ? `\n${failures} check(s) FAILED.` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);
