/**
 * Verifies the weekly "Where your requests stand" automation end to end against a THROWAWAY database (never the real
 * one): who is emailed and who is skipped, what each email says, that a repeat run sends nothing, that a failed send
 * does not use up the week, that unsubscribing stops every request, and that the one-click link opens only that person's
 * requests. Email sending is stubbed, so nothing leaves the machine.
 *
 *   npm run test:request-summaries -w apps/api              (add  -- --html out.html  to save a sample email)
 */
import 'dotenv/config';
import fs from 'node:fs';
import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import LeadMatch from '../models/LeadMatch.js';
import { EmailService } from '../services/email.service.js';
import { sendWeeklyRequestSummaries, describeProgress, MAX_SUMMARIES } from '../services/requestSummary.service.js';
import { personUrl, trackUrl } from '../services/requestTracking.js';
import { getPersonRequests } from '../controllers/requests.controller.js';
import { unsubscribe } from '../controllers/emailPreferences.controller.js';

process.env.JWT_SECRET ||= 'throwaway-secret-for-the-summary-test';
process.env.CLIENT_ORIGIN ||= 'https://directory.example.test';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-10-19T10:00:00+11:00');
const daysAgo = (n: number, from = NOW) => new Date(from.getTime() - n * DAY);

let passed = 0;
const failures: string[] = [];
const check = (name: string, ok: boolean, detail?: unknown) => {
  if (ok) { passed += 1; console.log(`  ok   ${name}`); } else { failures.push(name); console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

const sent: { to: string; subject: string; html: string; unsub?: string }[] = [];
const isA = (s: { to: string }) => s.to.toLowerCase() === 'a@example.test'; // the address as typed on the newest request
let sendResult = true;
(EmailService as any).sendTemplate = async (to: string, email: { subject: string; html: string }, opts?: { unsubscribeUrl?: string }) => {
  if (sendResult) sent.push({ to, subject: email.subject, html: email.html, unsub: opts?.unsubscribeUrl });
  return sendResult;
};

/** Backdates createdAt, which mongoose would otherwise stamp with the real time. */
async function lead(fields: Record<string, unknown>, createdDaysAgo: number) {
  const doc = await Lead.create({ status: 'matched', ...fields });
  await Lead.collection.updateOne({ _id: doc._id }, { $set: { createdAt: daysAgo(createdDaysAgo), updatedAt: daysAgo(createdDaysAgo) } });
  return doc;
}
const match = (leadId: unknown, status: 'notified' | 'viewed' | 'contacted') =>
  LeadMatch.create({ leadId, providerId: new mongoose.Types.ObjectId(), score: 80, matchReason: 'test', status, notifiedAt: daysAgo(6), ...(status !== 'notified' ? { viewedAt: daysAgo(5) } : {}), ...(status === 'contacted' ? { respondedAt: daysAgo(4) } : {}) } as never);

function fakeRes() {
  const r: any = { code: 200, body: undefined as unknown, headers: {} as Record<string, string> };
  r.status = (c: number) => { r.code = c; return r; };
  r.json = (b: unknown) => { r.body = b; return r; };
  r.send = (b: unknown) => { r.body = b; return r; };
  r.set = (k: string, v: string) => { r.headers[k] = v; return r; };
  return r;
}

async function main() {
  const base = process.env.MONGODB_URI;
  if (!base) throw new Error('MONGODB_URI is not set');
  const dbName = `soldirectory_summary_test_${Date.now()}`;
  await mongoose.connect(base, { dbName });
  console.log(`Using throwaway database ${dbName}\n`);

  try {
    // ---- Seed ----
    const A1 = await lead({ requesterEmail: 'a@example.test', requesterName: 'Zainab Abbas', need: 'Personal care', suburb: 'Brisbane' }, 9);
    const A2 = await lead({ requesterEmail: 'A@Example.test', requesterName: 'Zainab Abbas', need: 'Transport', suburb: 'Sydney' }, 3);
    const A3 = await lead({ requesterEmail: 'a@example.test', requesterName: 'Zainab Abbas', need: 'Plan management', suburb: 'Perth' }, 8);
    const ADraft = await lead({ requesterEmail: 'a@example.test', need: 'Nursing', status: 'draft' }, 8);
    const AClosed = await lead({ requesterEmail: 'a@example.test', need: 'Therapy services', suburb: 'Hobart', status: 'closed' }, 10);
    await match(A1._id, 'contacted'); await match(A1._id, 'viewed'); await match(A1._id, 'notified');
    await match(A2._id, 'notified'); await match(A2._id, 'notified');
    const B = await lead({ requesterEmail: 'b@example.test', need: 'Personal care', suburb: 'Perth', emailOptOut: true }, 10);
    const C = await lead({ requesterEmail: 'c@example.test', need: 'Personal care', suburb: 'Perth' }, 3);
    const D = await lead({ requesterEmail: 'd@example.test', need: 'Personal care', suburb: 'Perth', lastDigestAt: daysAgo(2) }, 10);
    const E = await lead({ requesterEmail: 'e@example.test', need: 'Personal care', suburb: 'Perth', summaryCount: MAX_SUMMARIES }, 10);
    const G = await lead({ requesterEmail: 'g@example.test', need: 'Personal care', suburb: 'Perth' }, 70);
    void [ADraft, AClosed, B, C, D, E, G];

    // ---- 1. Who gets one, and what it says ----
    console.log('First run');
    const r1 = await sendWeeklyRequestSummaries({ now: NOW });
    check('only person A is emailed', r1.sent === 1 && sent.length === 1 && isA(sent[0]), { r1, to: sent.map((s) => s.to) });
    check('one email covers all of A\'s open requests, whatever the address casing', (sent[0]?.html.match(/Sent \d+ \w+/g) ?? []).length === 3, sent[0]?.html.match(/Sent \d+ \w+/g));
    check('draft and closed requests are left out', !/Nursing|Therapy services/.test(sent[0]?.html ?? ''));
    check('an unlocked request says how many unlocked', /1 provider unlocked details/.test(sent[0]?.html ?? ''));
    check('an unopened request says it has not been opened', /Sent to 2 providers, none has opened it yet/.test(sent[0]?.html ?? ''));
    check('a request with no matches says we are still looking', /Still looking for matching providers/.test(sent[0]?.html ?? ''));
    check('the subject is "Where your requests stand"', sent[0]?.subject === 'Where your requests stand', sent[0]?.subject);
    check('greets by first name', /Hi Zainab,/.test(sent[0]?.html ?? ''));
    check('explains what an unlock means', /does not confirm they have called or emailed you/.test(sent[0]?.html ?? ''));
    check('has a "View your requests" link to the person page', new RegExp(`/my-requests/[a-f0-9]{24}\\?t=`).test(sent[0]?.html ?? '') && /View your requests/.test(sent[0]?.html ?? ''));
    check('has a stop link and a List-Unsubscribe header value', /api\/email\/unsubscribe\?kind=person/.test(sent[0]?.html ?? '') && /kind=person/.test(sent[0]?.unsub ?? ''));
    check('the opted-out person was skipped', (r1.skipped['stopped these emails'] ?? 0) === 1, r1.skipped);
    check('a request under a week old was skipped', (r1.skipped['first request under a week old'] ?? 0) === 1, r1.skipped);
    check('a person who just had a matches reminder was skipped', (r1.skipped['received a matches reminder this week'] ?? 0) === 1, r1.skipped);
    check('a person at the maximum was skipped', (r1.skipped['reached the maximum'] ?? 0) === 1, r1.skipped);
    check('a request older than 60 days is not considered', r1.people === 5, r1.people);

    const aLeads = await Lead.find({ requesterEmail: /^a@example\.test$/i, status: 'matched' }).lean();
    check('the week is recorded on each open request', aLeads.every((l) => l.summaryCount === 1 && !!l.lastSummaryAt), aLeads.map((l) => [l.summaryCount, l.lastSummaryAt]));

    const htmlArg = process.argv.indexOf('--html');
    if (htmlArg > 0 && process.argv[htmlArg + 1]) fs.writeFileSync(process.argv[htmlArg + 1], sent[0].html, 'utf8');

    // ---- 2. Safe to run twice ----
    console.log('\nRepeat run, same moment');
    sent.length = 0;
    const r2 = await sendWeeklyRequestSummaries({ now: NOW });
    check('nothing is sent twice', r2.sent === 0 && sent.length === 0, r2);

    // ---- 3. A week later ----
    console.log('\nOne week later');
    const week = new Date(NOW.getTime() + 7 * DAY);
    const r3 = await sendWeeklyRequestSummaries({ now: week });
    check('A gets the next weekly summary', sent.some(isA), { r3, to: sent.map((s) => s.to) });
    const count2 = (await Lead.findById(A1._id).lean())?.summaryCount;
    check('the count goes up to 2', count2 === 2, count2);

    // ---- 4. A failed send does not use up the week ----
    console.log('\nFailed send');
    sent.length = 0;
    sendResult = false;
    const twoWeeks = new Date(NOW.getTime() + 14 * DAY);
    const r4 = await sendWeeklyRequestSummaries({ now: twoWeeks });
    sendResult = true;
    const afterFail = await Lead.findById(A1._id).lean();
    check('the failure is reported', (r4.skipped['send failed'] ?? 0) >= 1 && r4.sent === 0, r4);
    check('the week is given back', afterFail?.summaryCount === 2, afterFail?.summaryCount);
    const r5 = await sendWeeklyRequestSummaries({ now: twoWeeks });
    check('the next run sends it', r5.sent >= 1 && sent.some(isA), { r5 });

    // ---- 5. Dry run changes nothing ----
    console.log('\nDry run');
    const beforeDry = (await Lead.findById(A1._id).lean())?.summaryCount;
    const dry = await sendWeeklyRequestSummaries({ now: new Date(NOW.getTime() + 21 * DAY), dryRun: true });
    const afterDry = (await Lead.findById(A1._id).lean())?.summaryCount;
    check('a dry run lists people but sends and records nothing', (dry.previews?.length ?? 0) >= 1 && beforeDry === afterDry, { beforeDry, afterDry });

    // ---- 6. The one-click page ----
    console.log('\nThe "View your requests" page');
    const link = new URL(personUrl(String(A2._id)));
    const id = link.pathname.split('/').pop() as string;
    const token = link.searchParams.get('t') as string;
    const ok = fakeRes();
    await getPersonRequests({ params: { id }, query: { t: token } } as any, ok);
    const items = (ok.body as { items: any[] }).items ?? [];
    check('opens with the signed link', ok.code === 200 && items.length === 4, { code: ok.code, n: items.length });
    check('includes closed requests but not drafts', items.some((i) => i.need === 'Therapy services' && i.open === false) && !items.some((i) => i.need === 'Nursing'));
    check('never includes the email address', !JSON.stringify(ok.body).includes('example.test'));
    check('each request has a status line', items.every((i) => typeof i.statusText === 'string' && i.statusText.length > 0));
    const unlocked = items.find((i) => i.need === 'Personal care');
    check('the unlocked request shows green', unlocked?.statusTone === 'good' && /unlocked/.test(unlocked?.statusText), unlocked?.statusText);

    const bad = fakeRes();
    await getPersonRequests({ params: { id }, query: { t: 'x'.repeat(32) } } as any, bad);
    check('a wrong token is refused', bad.code === 404, bad.code);
    const trackToken = new URL(trackUrl(id)).searchParams.get('t') as string;
    const wrongKind = fakeRes();
    await getPersonRequests({ params: { id }, query: { t: trackToken } } as any, wrongKind);
    check('a single-request link cannot open the whole list', wrongKind.code === 404, wrongKind.code);
    const other = fakeRes();
    await getPersonRequests({ params: { id: String(C._id) }, query: { t: token } } as any, other);
    check('A\'s token does not open someone else\'s requests', other.code === 404, other.code);

    // ---- 7. Unsubscribing ----
    console.log('\nUnsubscribe');
    const unsubLink = new URL((sent.find(isA) as { unsub: string }).unsub);
    const ures = fakeRes();
    await unsubscribe({ method: 'GET', query: Object.fromEntries(unsubLink.searchParams) } as any, ures);
    const optedOut = await Lead.find({ requesterEmail: /^a@example\.test$/i }).lean();
    check('stopping the emails covers every request of theirs', optedOut.length === 5 && optedOut.every((l) => l.emailOptOut === true), optedOut.map((l) => l.emailOptOut));
    sent.length = 0;
    const r6 = await sendWeeklyRequestSummaries({ now: new Date(NOW.getTime() + 28 * DAY) });
    check('nothing more is sent to them', !sent.some(isA), r6);

    // ---- 8. The wording ----
    console.log('\nWording');
    check('plural and singular read correctly', describeProgress({ matched: 3, viewed: 1, unlocked: 0 }).text === '1 provider has viewed it' && describeProgress({ matched: 3, viewed: 2, unlocked: 0 }).text === '2 providers have viewed it' && describeProgress({ matched: 1, viewed: 1, unlocked: 1 }).text === '1 provider unlocked details' && describeProgress({ matched: 4, viewed: 4, unlocked: 3 }).text === '3 providers unlocked details');
  } finally {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    console.log(`\nThrowaway database dropped.`);
  }

  console.log(`\n${passed} checks passed, ${failures.length} failed.`);
  if (failures.length) { console.log('Failed:', failures.join('; ')); process.exit(1); }
}

main().catch((err) => { console.error(err); process.exit(1); });
