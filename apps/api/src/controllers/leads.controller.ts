import type { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.middleware.js';
import Lead, { MASKED_PROJECTION, toMaskedShape, toUnlockedShape } from '../models/Lead.js';
import Provider from '../models/Provider.js';
import UnlockLedger from '../models/UnlockLedger.js';
import UnlockReport from '../models/UnlockReport.js';
import PlanConfig from '../models/PlanConfig.js';
import { geocodeAddress } from '../services/geocoding.service.js';
import { scoreMatch, isGenuineMatch } from '../services/matching.service.js';
import LeadView from '../models/LeadView.js';
import LeadMatch from '../models/LeadMatch.js';
import { getActiveProviderForUser } from '../utils/getActiveProvider.js';
import { notifySearcherViewed, notifySearcherResponded } from '../services/leadFollowUp.service.js';

// "Genuine match" is defined once (isGenuineMatch in matching.service.ts)
// and shared with matchRequests.controller.ts, so "notified" and
// "browsable" mean the same thing — just without the notify-side cap here.

// getActiveProviderForUser is now imported from ../utils/getActiveProvider.js
// — see that file for why this was extracted during a security audit.

export async function listLeads(req: AuthedRequest, res: Response) {
  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No active provider profile for this account' });
  const unlockedIds = new Set(
    (await UnlockLedger.find({ providerId: provider._id }).select('leadId').lean()).map((u) => String(u.leadId))
  );

  // Fetch the masked projection for everyone, then re-fetch full
  // fields only for the specific leads this provider has actually
  // unlocked — never trust an in-memory flag to decide what to
  // serialize for a lead the query didn't already scope to.
  // Scoped to leads THIS provider was actually matched to (LeadMatch,
  // written by submitMatchRequest) plus any they've unlocked — this used
  // to be every non-draft lead in the database for every provider, so a
  // provider saw (masked) enquiries in suburbs/services nothing to do
  // with them. Leads they declined drop out unless already unlocked.
  // Broader discovery is the separate, paid-only "browse nearby" list
  // (listNearbyLeads). status != draft — a wizard-in-progress enquiry
  // is private, incomplete user data, never a real lead for providers.
  const myMatches = await LeadMatch.find({ providerId: provider._id, status: { $ne: 'declined' } }).select('leadId matchReason').lean();
  const matchedIds = myMatches.map((m) => String(m.leadId));
  const reasonByLead = new Map(myMatches.map((m) => [String(m.leadId), m.matchReason ?? '']));
  const visibleIds = [...new Set([...matchedIds, ...unlockedIds])];
  const allLeads = visibleIds.length
    ? await Lead.find({ _id: { $in: visibleIds }, status: { $ne: 'draft' } }).select(MASKED_PROJECTION).sort({ createdAt: -1 }).lean()
    : [];
  // A request that 3 providers have unlocked is full: it disappears for everyone who has not unlocked it themselves.
  const unlockCounts = await unlockCountsFor(allLeads.map((l) => l._id));
  const leads = allLeads.filter((l) => unlockedIds.has(String(l._id)) || (unlockCounts.get(String(l._id)) ?? 0) < MAX_UNLOCKS_PER_LEAD);
  const unlockedFull = unlockedIds.size
    ? await Lead.find({ _id: { $in: [...unlockedIds] } }).lean()
    : [];
  const unlockedById = new Map(unlockedFull.map((l) => [String(l._id), l]));

  // Viewed status is per-(lead, provider) — merged in after shaping,
  // since it's not an inherent property of the lead itself.
  const viewedIds = new Set(
    (await LeadView.find({ providerId: provider._id }).select('leadId').lean()).map((v) => String(v.leadId))
  );

  res.json(
    leads.map((l) => {
      const full = unlockedById.get(String(l._id));
      const shaped = full ? toUnlockedShape(full) : toMaskedShape(l);
      const reason = reasonByLead.get(String(l._id)) ?? '';
      return {
        ...shaped,
        unlocksUsed: unlockCounts.get(String(l._id)) ?? 0,
        viewed: viewedIds.has(String(l._id)),
        // How this enquiry reached the provider, so the dashboard can say so.
        origin: /^Asked for you by name/i.test(reason) ? 'named' : /^Shared by SolDirectory/i.test(reason) ? 'shared' : 'matched',
      };
    })
  );
}

// "Browse nearby requests" (developer brief / architecture doc's
// Referral Marketplace "Browse Requests" screen, Nearby tab) — a paid-
// only feature distinct from listLeads above. listLeads only ever
// shows leads this provider was actually auto-notified about (capped
// at MAX_NOTIFIED_PER_LEAD in matchRequests.controller.ts); this
// surfaces every OTHER open lead the provider would still score as a
// genuine match for, so a good-fit lead that missed the notify cap
// isn't invisible to a paying provider willing to look for it
// themselves. Free ('starter') providers get nothing here — matches
// the plan comparison table's "Browse nearby open requests: No/Yes".
export async function listNearbyLeads(req: AuthedRequest, res: Response) {
  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No active provider profile for this account' });

  if (provider.plan === 'starter') {
    return res.status(402).json({ error: 'Browsing nearby requests requires a paid plan', code: 'PLAN_REQUIRED' });
  }
  // A paused (unconfirmed capacity) provider shouldn't be discovering
  // and claiming new work either — they can still see/manage leads
  // already matched or unlocked (listLeads above), just not browse for
  // more until they confirm again.
  if (provider.listingPaused) {
    return res.status(403).json({ error: 'Confirm your capacity to browse new requests.', code: 'CAPACITY_UNCONFIRMED' });
  }

  // "Other" leads only: anything already in this provider's own list
  // (matched to them, declined, or unlocked) is excluded so a lead never
  // appears in both tabs. Only open leads (matched, not yet closed) —
  // dead/closed enquiries shouldn't show up as something new to browse.
  const [ownMatches, ownUnlocks] = await Promise.all([
    LeadMatch.find({ providerId: provider._id }).select('leadId').lean(),
    UnlockLedger.find({ providerId: provider._id }).select('leadId').lean(),
  ]);
  const alreadySeen = [...ownMatches, ...ownUnlocks].map((m) => m.leadId);
  const openLeads = await Lead.find({ status: 'matched', _id: { $nin: alreadySeen } }).lean();
  const openCounts = await unlockCountsFor(openLeads.map((l) => l._id));

  const nearby = openLeads
    .filter((l) => (openCounts.get(String(l._id)) ?? 0) < MAX_UNLOCKS_PER_LEAD)
    .map((l) => ({ lead: l, result: scoreMatch(l as any, provider as any) }))
    .filter(({ result }) => isGenuineMatch(result))
    .sort((a, b) => b.result.score - a.result.score)
    .map(({ lead }) => ({ ...toMaskedShape(lead), unlocksUsed: openCounts.get(String(lead._id)) ?? 0 }));

  res.json(nearby);
}

// Records a meaningful view — the frontend calls this when a
// provider actually opens a lead's details, not on every list
// render. The unique index on (leadId, providerId) means this is
// naturally idempotent: opening the same lead five times updates
// lastViewedAt, never creates five rows.
export async function markLeadViewed(req: AuthedRequest, res: Response) {
  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No active provider profile for this account' });
  const lead = await Lead.findById(req.params.id).select('_id').lean();
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  await LeadView.findOneAndUpdate(
    { leadId: lead._id, providerId: provider._id },
    { $set: { lastViewedAt: new Date(), ip: req.ip }, $setOnInsert: { firstViewedAt: new Date() } },
    { upsert: true }
  );

  // Feeds the audit trail + the public "median first reply" stat
  // (stats.controller.ts). Only ever advances 'notified' -> 'viewed'
  // and only the first time, so it never overwrites a later
  // 'contacted'/'declined' state. Best-effort — never blocks the view.
  LeadMatch.updateOne(
    { leadId: lead._id, providerId: provider._id, status: 'notified' },
    { $set: { status: 'viewed', viewedAt: new Date() } }
  ).then((result) => {
    // First time a matched provider opens it: tell the person who asked (once per enquiry).
    if (result.modifiedCount > 0) void notifySearcherViewed(lead._id);
  }).catch(() => {});

  res.json({ viewed: true });
}

/**
 * POST /api/leads/:id/report-problem { reason, note } — a provider that unlocked a request tells us its contact details
 * were invalid or that it duplicated one they already had. An administrator restores the unlock or dismisses the report.
 */
export async function reportLeadProblem(req: AuthedRequest, res: Response) {
  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No active provider profile for this account' });
  const unlocked = await UnlockLedger.findOne({ providerId: provider._id, leadId: req.params.id }).select('createdAt').lean();
  if (!unlocked) return res.status(404).json({ error: 'You have not unlocked this request.' });
  // 14 days from the unlock, as the provider agreement says.
  if (Date.now() - new Date((unlocked as any).createdAt).getTime() > 14 * 86_400_000) {
    return res.status(400).json({ error: 'Problems with an unlock need to be reported within 14 days.' });
  }
  const body = (req.body ?? {}) as { reason?: string; note?: string };
  const reason = ['invalid_contact', 'duplicate', 'other'].includes(String(body.reason)) ? (body.reason as 'invalid_contact' | 'duplicate' | 'other') : 'other';
  try {
    await UnlockReport.create({ leadId: req.params.id, providerId: provider._id, reason, note: typeof body.note === 'string' ? body.note.slice(0, 1000) : undefined });
  } catch (err: any) {
    if (err.code === 11000) return res.json({ reported: true, alreadyReported: true });
    throw err;
  }
  res.status(201).json({ reported: true });
}

/** Providers that can unlock one request. Stated in the collection notice and the privacy policy. */
export const MAX_UNLOCKS_PER_LEAD = 3;

/** How many providers have unlocked each of the given requests. */
async function unlockCountsFor(leadIds: unknown[]): Promise<Map<string, number>> {
  if (!leadIds.length) return new Map();
  const rows = await UnlockLedger.aggregate<{ _id: unknown; n: number }>([
    { $match: { leadId: { $in: leadIds } } },
    { $group: { _id: '$leadId', n: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.n]));
}

export async function unlockLead(req: AuthedRequest, res: Response) {
  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No active provider profile for this account' });
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency-Key header is required for this action' });
  }

  const existing = await UnlockLedger.findOne({ providerId: provider._id, leadId: lead._id });
  if (existing) {
    return res.json(toUnlockedShape(lead));
  }
  // The person closed their request (or deleted their details): providers that have not unlocked it can no longer do so.
  if (lead.status === 'closed') {
    return res.status(410).json({ error: 'The person closed this request, so it can no longer be unlocked.', code: 'LEAD_CLOSED' });
  }

  const planDoc = await PlanConfig.findOne({ key: provider.plan }).lean();
  const quota = planDoc?.quota ?? 0; // null in DB means unlimited — see below

  if (quota === 0 && planDoc?.quota !== null) {
    return res.status(402).json({ error: 'Choose a plan to unlock this lead', code: 'PLAN_REQUIRED' });
  }
  const isUnlimited = planDoc?.quota === null;
  if (!isUnlimited && provider.leadUnlocksUsedThisPeriod >= quota) {
    return res.status(402).json({ error: `You have used all ${quota} unlocks this month`, code: 'QUOTA_EXHAUSTED' });
  }

  // The collection notice tells the requester that up to 3 providers can see their contact details.
  if ((await UnlockLedger.countDocuments({ leadId: lead._id })) >= MAX_UNLOCKS_PER_LEAD) {
    return res.status(409).json({ error: `This request has already been unlocked by ${MAX_UNLOCKS_PER_LEAD} providers.`, code: 'LEAD_FULL' });
  }

  let ledgerEntry;
  try {
    ledgerEntry = await UnlockLedger.create({ providerId: provider._id, leadId: lead._id, idempotencyKey, ip: req.ip });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.json(toUnlockedShape(lead)); // race: already unlocked under a different key
    }
    throw err;
  }
  // Two providers can pass the count above together. Only the first MAX_UNLOCKS_PER_LEAD entries (by time, then id)
  // keep their unlock, so the cap holds under a race; the loser's entry is removed before any quota is used.
  const keepers = await UnlockLedger.find({ leadId: lead._id }).sort({ createdAt: 1, _id: 1 }).limit(MAX_UNLOCKS_PER_LEAD).select('_id').lean();
  if (!keepers.some((entry) => String(entry._id) === String(ledgerEntry._id))) {
    await UnlockLedger.deleteOne({ _id: ledgerEntry._id });
    return res.status(409).json({ error: `This request has already been unlocked by ${MAX_UNLOCKS_PER_LEAD} providers.`, code: 'LEAD_FULL' });
  }

  provider.leadUnlocksUsedThisPeriod += 1;
  await provider.save();

  // Unlocking is the provider actually acting on the enquiry (they now
  // hold the contact details) — record it as the reply moment. Only
  // sets respondedAt once; a lead unlocked via "browse nearby" (no
  // LeadMatch row) simply matches nothing, which is correct: that
  // wasn't a response to a notification.
  LeadMatch.updateOne(
    { leadId: lead._id, providerId: provider._id, respondedAt: { $exists: false } },
    { $set: { status: 'contacted', respondedAt: new Date() } }
  ).then((result) => {
    // First time a provider takes it up: tell the person who asked (once per enquiry).
    if (result.modifiedCount > 0) void notifySearcherResponded(lead._id, provider.tradingName || provider.legalEntityName);
  }).catch(() => {});

  // Geocode once, lazily, on first real unlock — there's no lead
  // creation endpoint in this codebase to do this at submission
  // time, and it's wasted work to geocode leads no provider ever
  // unlocks. Failure here never blocks the unlock response itself.
  if (!lead.location?.coordinates?.length && lead.suburb) {
    const geo = await geocodeAddress(`${lead.suburb}, Australia`);
    if (geo) {
      lead.location = { type: 'Point', coordinates: [geo.lng, geo.lat] };
      await lead.save();
    }
  }

  res.json(toUnlockedShape(lead));
}

// Full detail for a lead — powers the lead detail page. SECURITY:
// contact-level detail (name/phone/budget/note/location) must only
// ever be returned for a lead THIS provider has actually unlocked via
// UnlockLedger — the comment above this function used to claim that
// check already happened here, but it never did, meaning any
// authenticated provider could read any other provider's unlocked
// lead's full contact details just by guessing/enumerating an ID,
// completely bypassing the paid-unlock quota system. Mirrors the same
// UnlockLedger lookup unlockLead/listLeads already use.
export async function getLeadDetail(req: AuthedRequest, res: Response) {
  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No active provider profile for this account' });
  const lead = await Lead.findById(req.params.id).lean();
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const unlocked = await UnlockLedger.exists({ providerId: provider._id, leadId: lead._id });
  res.json(unlocked ? toUnlockedShape(lead) : toMaskedShape(lead));
}

// A real, previously-missing capability: a provider can explicitly
// decline a lead that was matched to them. Ownership check via
// LeadMatch — a provider can only decline a lead that was actually
// matched to them, not an arbitrary ID.
export async function declineLead(req: AuthedRequest, res: Response) {
  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No active provider profile for this account' });
  const match = await LeadMatch.findOneAndUpdate(
    { leadId: req.params.id, providerId: provider._id },
    { status: 'declined', respondedAt: new Date() },
    { new: true }
  );
  if (!match) return res.status(404).json({ error: 'This lead was not matched to your account.' });
  res.json({ id: String(match._id), status: match.status });
}
