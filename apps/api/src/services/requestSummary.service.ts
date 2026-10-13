import Lead, { type LeadDoc } from '../models/Lead.js';
import LeadMatch from '../models/LeadMatch.js';
import { EmailService } from './email.service.js';
import { siteOrigin, unsubscribeUrl } from './emailTokens.js';
import { personUrl } from './requestTracking.js';
import { requestSummaryTemplate, type SummaryRow } from './followUpTemplates.js';

/**
 * The weekly "Where your requests stand" email: one message per person, covering every request of theirs that is still
 * open, with how many providers have looked at each and how many have taken it up (unlocked the contact details).
 *
 * Rules, so it is useful rather than noisy:
 *  - the first summary goes 7 days after the person's first open request, then every 7 days, at most MAX_SUMMARIES times,
 *    and never for a request older than 60 days;
 *  - one email per person, however many requests they have (people are grouped by email address);
 *  - never to someone who has stopped these emails (that covers every request they made);
 *  - not in a week the person already received a "your matches" reminder, so nobody gets two emails about the same thing;
 *  - safe to run twice: the week is claimed atomically before the send, and put back if the send fails.
 */
const DAY = 24 * 60 * 60 * 1000;
export const MAX_SUMMARIES = 8;
const CLAIM_GAP = 6.5 * DAY; // a little under a week, so a cron run that drifts by an hour is never skipped
const OPEN_FOR = 60 * DAY;
const MAX_ROWS = 8;

const hasEmail = (email?: string) => /.+@.+\..+/.test(email ?? '');
const normalise = (email: string) => email.trim().toLowerCase();

export interface SummaryResult { people: number; requests: number; sent: number; skipped: Record<string, number>; previews?: { to: string; subject: string; rows: SummaryRow[] }[] }

/** What the summary says about one request, from its matches. Used by the email and by the "my requests" page. */
export function describeProgress(input: { matched: number; viewed: number; unlocked: number; requestedProvider?: string }): { text: string; tone: 'good' | 'neutral' } {
  const s = (n: number) => (n === 1 ? '' : 's');
  if (input.unlocked > 0) return { text: `${input.unlocked} provider${s(input.unlocked)} unlocked details`, tone: 'good' };
  if (input.viewed > 0) return { text: `${input.viewed} provider${s(input.viewed)} ${input.viewed === 1 ? 'has' : 'have'} viewed it`, tone: 'neutral' };
  if (input.matched > 0) return { text: `Sent to ${input.matched} provider${s(input.matched)}, none has opened it yet`, tone: 'neutral' };
  if (input.requestedProvider) return { text: `Sent to ${input.requestedProvider}`, tone: 'neutral' };
  return { text: 'Still looking for matching providers', tone: 'neutral' };
}

const requestLabel = (lead: Pick<LeadDoc, 'need' | 'serviceContext' | 'suburb'>) => {
  const need = lead.need && !/^not sure yet$/i.test(lead.need) ? lead.need : lead.serviceContext || 'Support request';
  return lead.suburb ? `${need} (${lead.suburb})` : need;
};

export async function sendWeeklyRequestSummaries(opts: { now?: Date; limit?: number; dryRun?: boolean } = {}): Promise<SummaryResult> {
  const now = opts.now ?? new Date();
  const limit = opts.limit ?? 1000;
  const result: SummaryResult = { people: 0, requests: 0, sent: 0, skipped: {}, previews: opts.dryRun ? [] : undefined };
  const skip = (why: string) => { result.skipped[why] = (result.skipped[why] ?? 0) + 1; };

  const claimBefore = new Date(now.getTime() - CLAIM_GAP);
  const firstDue = claimBefore; // the earliest open request must be about a week old (same drift allowance)
  const open = await Lead.find({
    status: { $in: ['matched', 'unlocked'] },
    requesterEmail: { $exists: true, $ne: '' },
    createdAt: { $gte: new Date(now.getTime() - OPEN_FOR) },
  }).sort({ createdAt: -1 }).limit(limit * 5).lean();

  // Group by person.
  const people = new Map<string, typeof open>();
  for (const lead of open) {
    if (!hasEmail(lead.requesterEmail)) continue;
    const key = normalise(lead.requesterEmail);
    (people.get(key) ?? people.set(key, []).get(key)!).push(lead);
  }

  for (const [email, leads] of people) {
    if (result.people >= limit) break;
    result.people += 1;
    result.requests += leads.length;

    // Someone who stopped these emails on ANY request has stopped them for all of their requests.
    const optedOut = await Lead.exists({ requesterEmail: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), emailOptOut: true });
    if (optedOut) { skip('stopped these emails'); continue; }

    // The first summary is a week after the earliest open request.
    const oldest = leads[leads.length - 1];
    if (new Date(oldest.createdAt).getTime() > firstDue.getTime()) { skip('first request under a week old'); continue; }

    const sentBefore = Math.max(...leads.map((l) => l.summaryCount ?? 0));
    if (sentBefore >= MAX_SUMMARIES) { skip('reached the maximum'); continue; }
    const lastSent = Math.max(0, ...leads.map((l) => (l.lastSummaryAt ? new Date(l.lastSummaryAt).getTime() : 0)));
    if (lastSent && lastSent > claimBefore.getTime()) { skip('already sent this week'); continue; }
    const lastDigest = Math.max(0, ...leads.map((l) => (l.lastDigestAt ? new Date(l.lastDigestAt).getTime() : 0)));
    if (lastDigest && now.getTime() - lastDigest < 5 * DAY) { skip('received a matches reminder this week'); continue; }

    // Each request's position, from its matches.
    const ids = leads.map((l) => l._id);
    const matches = await LeadMatch.find({ leadId: { $in: ids } }).select('leadId status').lean();
    const byLead = new Map<string, { matched: number; viewed: number; unlocked: number }>();
    for (const m of matches) {
      const row = byLead.get(String(m.leadId)) ?? byLead.set(String(m.leadId), { matched: 0, viewed: 0, unlocked: 0 }).get(String(m.leadId))!;
      row.matched += 1;
      if (m.status === 'viewed' || m.status === 'contacted') row.viewed += 1;
      if (m.status === 'contacted') row.unlocked += 1;
    }
    const rows: SummaryRow[] = leads.map((lead) => {
      const p = byLead.get(String(lead._id)) ?? { matched: 0, viewed: 0, unlocked: 0 };
      const d = describeProgress({ ...p, requestedProvider: lead.preferredListing?.name });
      return { label: requestLabel(lead), status: d.text, tone: d.tone, sent: new Date(lead.createdAt) };
    });

    const anchor = leads[0]; // the newest request: its id anchors the person's links
    const anchorId = String(anchor._id);
    const firstName = (leads.find((l) => l.requesterName)?.requesterName ?? '').trim().split(/\s+/)[0] || undefined;
    const shown = rows.slice(0, MAX_ROWS);
    const mail = requestSummaryTemplate({
      firstName,
      rows: shown,
      moreCount: Math.max(0, rows.length - shown.length),
      viewUrl: personUrl(anchorId),
      unsubscribeUrl: unsubscribeUrl('person', anchorId),
      searchUrl: `${siteOrigin()}/find-a-provider`,
    });

    if (opts.dryRun) {
      result.previews!.push({ to: email, subject: mail.subject, rows: shown });
      continue;
    }

    // Claim the week on every open request of theirs, atomically, before sending.
    const claimed = await Lead.updateMany(
      { _id: { $in: ids }, $or: [{ lastSummaryAt: { $exists: false } }, { lastSummaryAt: { $lte: claimBefore } }] },
      { $set: { lastSummaryAt: now }, $inc: { summaryCount: 1 } },
    );
    if (!claimed.modifiedCount) { skip('claimed by another run'); continue; }

    try {
      const ok = await EmailService.sendTemplate(anchor.requesterEmail, mail, { unsubscribeUrl: unsubscribeUrl('person', anchorId) });
      if (ok) {
        result.sent += 1;
      } else {
        // Nothing went out, so this week must not count: put the claim back and let the next run try again.
        await Lead.updateMany({ _id: { $in: ids }, lastSummaryAt: now }, { $inc: { summaryCount: -1 }, $unset: { lastSummaryAt: 1 } });
        skip('send failed');
      }
    } catch (err) {
      console.error('[requestSummary] send failed for', email, err);
      await Lead.updateMany({ _id: { $in: ids }, lastSummaryAt: now }, { $inc: { summaryCount: -1 }, $unset: { lastSummaryAt: 1 } });
      skip('send failed');
    }
  }
  return result;
}
