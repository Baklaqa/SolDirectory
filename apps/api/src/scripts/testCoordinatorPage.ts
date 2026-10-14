/**
 * npm run test:coordinator-page -w apps/api
 *
 * Checks the shared copy behind /support-coordinators (every link points at a page or article that exists, the markup is well
 * formed, the visible date is the date in the data), the /providers description and questions, and the response-header
 * middleware. No database or network.
 */
import { COORDINATOR_PAGE as P, EDITORIAL_BLOG_POSTS, GUIDE_DOCS, hubCopy, PROVIDER_FAQS, PROVIDER_PAGE_DESCRIPTION, PROVIDER_PAGE_UPDATED, WORKER_HERO_CHECKS, WORKER_PAGE_DESCRIPTION, WORKER_PAGE_TITLE, WORKER_PAGE_UPDATED, INDEPENDENT_WORKER_FAQS, DIRECTORY_PAGE_DESCRIPTION, DIRECTORY_PAGE_HEADING, DIRECTORY_PAGE_TITLE, DIRECTORY_GUIDANCE, DIRECTORY_SUPPORTS } from '@soldirectory/topic-content';
import { securityHeaders } from '../middleware/securityHeaders.js';

let failed = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? `  -> ${detail}` : ''}`);
};

// ---- the copy ----
const texts: string[] = [
  P.subtitle, ...P.glance, P.intro.text, ...P.referral.paragraphs, ...P.referral.steps, ...P.urgent.paragraphs,
  P.checks.intro, ...P.checks.cards.map((c) => c.text), P.checks.note, ...P.pricing.paragraphs, ...P.records.paragraphs,
  ...P.records.list, P.records.after, ...P.after.paragraphs, P.resources.text, ...P.faqs.map((f) => f.answer), P.contact.text,
];

const links: { label: string; href: string }[] = [];
for (const t of texts) for (const m of t.matchAll(/\[([^\]]+)\]\(([^)]*)\)/g)) links.push({ label: m[1], href: m[2] });
check('the page has contextual links', links.length >= 10, `found ${links.length}`);

const STATIC = new Set(['/services', '/funding', '/condition', '/locations', '/glossary', '/find-a-provider']);
const now = Date.now();
const problems: string[] = [];
for (const { href } of links) {
  if (STATIC.has(href)) continue;
  const blog = href.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blog) {
    const post = EDITORIAL_BLOG_POSTS.find((p) => p.slug === blog[1]);
    if (!post) problems.push(`${href}: no such article`);
    else if (post.expiresAt && Date.parse(post.expiresAt) < now) problems.push(`${href}: article has expired`);
    continue;
  }
  const guide = href.match(/^\/guides\/([a-z0-9-]+)$/);
  if (guide) { if (!GUIDE_DOCS[guide[1]]) problems.push(`${href}: no such guide`); continue; }
  problems.push(`${href}: not a known page`);
}
check('every link points at a page or article that exists', problems.length === 0, problems.join('; '));

const stray = texts.filter((t) => t.replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, '').match(/[[\]]|\]\(/));
check('no half-written link markup', stray.length === 0, stray.join(' | ').slice(0, 200));
check('links never use a label that is just a URL or "click here"', links.every((l) => !/^(https?:|www\.)/i.test(l.label) && !/^(click here|here|read more|more)$/i.test(l.label.trim())));

check('the last-updated date and its label agree', new Date(`${P.updated}T12:00:00Z`).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) === P.updatedLabel, `${P.updated} vs ${P.updatedLabel}`);
check('the last-updated date is not in the future', Date.parse(`${P.updated}T00:00:00Z`) <= now + 24 * 3600 * 1000);

const questions = P.faqs.map((f) => f.question);
check('FAQ questions are unique', new Set(questions).size === questions.length);
check('every FAQ has an answer of a useful length', P.faqs.every((f) => f.answer.length > 60));
check('the title and description fit a search result', P.seoTitle.length <= 65 && P.seoDescription.length >= 70 && P.seoDescription.length <= 170, `${P.seoTitle.length} / ${P.seoDescription.length}`);
check('the section ids used by in-site links exist', [P.referral.id, P.urgent.id, P.checks.id].join() === 'referrals,urgent-referrals,provider-checks');

// ---- /providers ----
const providerQuestions = PROVIDER_FAQS.map((f) => f.question);
check('provider FAQ questions are unique', new Set(providerQuestions).size === providerQuestions.length);
check('provider FAQs include the listing how-to and the profile contents', providerQuestions.some((q) => /list my NDIS provider business/i.test(q)) && providerQuestions.some((q) => /provider profile include/i.test(q)));
check('the /providers description fits a search result (150-160 characters)', PROVIDER_PAGE_DESCRIPTION.length >= 150 && PROVIDER_PAGE_DESCRIPTION.length <= 160, String(PROVIDER_PAGE_DESCRIPTION.length));
check('the /providers date is a real, past date', !Number.isNaN(Date.parse(PROVIDER_PAGE_UPDATED)) && Date.parse(`${PROVIDER_PAGE_UPDATED}T00:00:00Z`) <= now + 24 * 3600 * 1000);

// ---- /find-a-provider ----
check('the find page title, heading and description fit a search result', DIRECTORY_PAGE_TITLE.length <= 65 && DIRECTORY_PAGE_DESCRIPTION.length >= 150 && DIRECTORY_PAGE_DESCRIPTION.length <= 160 && DIRECTORY_PAGE_HEADING.length >= 20, `${DIRECTORY_PAGE_TITLE.length} / ${DIRECTORY_PAGE_DESCRIPTION.length}`);
const guidanceLinks = [...DIRECTORY_GUIDANCE.wider.matchAll(/\[([^\]]+)\]\(([^)]*)\)/g)].map((m) => m[2]);
check('the find page guidance links to real pages', guidanceLinks.length >= 4 && guidanceLinks.every((h) => STATIC.has(h) || (h.startsWith('/guides/') && !!GUIDE_DOCS[h.slice('/guides/'.length)])), guidanceLinks.join(', '));
check('the find page offers eight supports', DIRECTORY_SUPPORTS.length === 8);

// ---- /independent-workers ----
check('the workers title and description fit a search result', WORKER_PAGE_TITLE.length <= 65 && WORKER_PAGE_DESCRIPTION.length >= 140 && WORKER_PAGE_DESCRIPTION.length <= 160, `${WORKER_PAGE_TITLE.length} / ${WORKER_PAGE_DESCRIPTION.length}`);
check('the workers date is a real, past date', !Number.isNaN(Date.parse(WORKER_PAGE_UPDATED)) && Date.parse(`${WORKER_PAGE_UPDATED}T00:00:00Z`) <= now + 24 * 3600 * 1000);
check('the workers hero has three points', WORKER_HERO_CHECKS.length === 3);
const workerQs = INDEPENDENT_WORKER_FAQS.map((f) => f.question);
check('worker FAQ questions are unique', new Set(workerQs).size === workerQs.length);
check('the workers reading copy explains how contact works', (hubCopy('/independent-workers')?.sections ?? []).some((s) => s.heading === 'How contact works'));

// ---- register hubs ----
for (const [path, host] of [['/ndis-providers', 'ndiscommission.gov.au'], ['/aged-care-providers', 'myagedcare.gov.au']] as const) {
  const copy = hubCopy(path);
  const urls = (copy?.sections ?? []).flatMap((s) => [...(s.list ?? []).map((i) => i.to ?? ''), ...(s.links ?? []).map((l) => l.to)]);
  check(`${path} links to the official source (${host})`, urls.some((u) => new URL(u, 'https://x').hostname.endsWith(host)));
  const qs = (copy?.faqs ?? []).map((f) => f.question);
  check(`${path} questions are unique and there are at least five`, new Set(qs).size === qs.length && qs.length >= 5, String(qs.length));
}

// ---- the headers ----
function run(headers: Record<string, string>, protocol = 'http') {
  const set: Record<string, string> = {};
  let called = false;
  const req = { get: (n: string) => headers[n.toLowerCase()], protocol } as never;
  const res = { setHeader: (k: string, v: string) => { set[k] = v; } } as never;
  securityHeaders(req, res, () => { called = true; });
  return { set, called };
}
const https = run({ 'x-forwarded-proto': 'https' });
check('HTTPS responses carry HSTS without subdomains or preload', /^max-age=\d+$/.test(https.set['Strict-Transport-Security'] ?? ''), https.set['Strict-Transport-Security']);
check('HSTS lasts at least 6 months', Number((https.set['Strict-Transport-Security'] ?? '').replace(/\D/g, '')) >= 15552000);
check('the request carries on to the next handler', https.called);
const plain = run({}, 'http');
check('plain HTTP responses do not carry HSTS', plain.set['Strict-Transport-Security'] === undefined);
check('nosniff and referrer policy are always set', https.set['X-Content-Type-Options'] === 'nosniff' && plain.set['X-Content-Type-Options'] === 'nosniff' && !!plain.set['Referrer-Policy']);
const chained = run({ 'x-forwarded-proto': 'https, http' });
check('the first protocol in a forwarded list wins', !!chained.set['Strict-Transport-Security']);

console.log(failed === 0 ? '\nAll checks passed.' : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
