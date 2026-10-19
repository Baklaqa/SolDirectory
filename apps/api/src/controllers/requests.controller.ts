import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import LeadMatch from '../models/LeadMatch.js';
import Provider from '../models/Provider.js';
import type { AuthedRequest } from '../middleware/auth.middleware.js';
import { buildTrackedRequest, verifyTrackToken, verifyPersonToken, trackUrl } from '../services/requestTracking.js';
import { describeProgress } from '../services/requestSummary.service.js';
import { forLead, loadActivityData } from '../services/requestActivity.js';
import UnlockLedger from '../models/UnlockLedger.js';
import Notification from '../models/Notification.js';

/** Tells the providers that had this request (or unlocked it) that the person has withdrawn it. */
async function notifyWithdrawn(leadId: unknown, need: string | undefined, suburb: string | undefined): Promise<void> {
  const [matches, unlocks] = await Promise.all([
    LeadMatch.find({ leadId }).select('providerId').lean(),
    UnlockLedger.find({ leadId }).select('providerId').lean(),
  ]);
  const providerIds = [...new Set([...matches, ...unlocks].map((m: any) => String(m.providerId)))];
  if (!providerIds.length) return;
  const providers = await Provider.find({ _id: { $in: providerIds } }).select('userId').lean();
  await Promise.all(providers.filter((p: any) => p.userId).map((p: any) => Notification.create({
    userId: p.userId,
    type: 'new_lead',
    message: `A request for ${need && !/^not sure yet$/i.test(need) ? need : 'support'}${suburb ? ` in ${suburb}` : ''} was withdrawn by the person. Please do not contact them about it.`,
    link: '/leads',
  }).catch(() => {})));
}

async function loadTracked(leadId: string) {
  const lead = await Lead.findOne({ _id: leadId, status: { $ne: 'draft' } }).lean();
  if (!lead) return null;
  const data = await loadActivityData([lead._id]);
  return buildTrackedRequest(lead, data.matches as any, data.names, data.unlocks);
}

/** GET /api/requests/:id?t=<signed token> — the link in the person's emails. No account needed. */
export async function getTrackedRequest(req: Request, res: Response) {
  const id = req.params.id;
  const token = String(req.query.t ?? '');
  if (!mongoose.isValidObjectId(id) || !verifyTrackToken(id, token)) return res.status(404).json({ error: 'We could not find that request. Please use the link from your email.' });
  const tracked = await loadTracked(id);
  if (!tracked) return res.status(404).json({ error: 'We could not find that request.' });
  res.set('Cache-Control', 'no-store');
  res.json(tracked);
}

/**
 * POST /api/requests/:id/close { t } — the person closes their own request. No further provider can unlock it; providers
 * that already unlocked it keep what they were given. Reversible only by sending a new request.
 */
export async function closeRequest(req: Request, res: Response) {
  const id = req.params.id;
  const token = String((req.body as { t?: unknown })?.t ?? '');
  if (!mongoose.isValidObjectId(id) || !verifyTrackToken(id, token)) return res.status(404).json({ error: 'We could not find that request.' });
  const lead = await Lead.findOneAndUpdate({ _id: id, status: { $ne: 'draft' } }, { $set: { status: 'closed' } }, { new: true }).select('_id need suburb');
  if (!lead) return res.status(404).json({ error: 'We could not find that request.' });
  void notifyWithdrawn(lead._id, (lead as any).need, (lead as any).suburb).catch(() => {});
  res.json({ closed: true });
}

/**
 * POST /api/requests/:id/delete { t } — the person asks us to delete their details. Name, email, phone, free-text notes
 * and the map point are cleared and the request is closed, so no provider can unlock it. What stays is what the privacy
 * policy says is kept: the record that consent was given, and the log of who viewed the request.
 */
export async function deleteRequest(req: Request, res: Response) {
  const id = req.params.id;
  const token = String((req.body as { t?: unknown })?.t ?? '');
  if (!mongoose.isValidObjectId(id) || !verifyTrackToken(id, token)) return res.status(404).json({ error: 'We could not find that request.' });
  const lead = await Lead.findOneAndUpdate(
    { _id: id, status: { $ne: 'draft' } },
    {
      $set: {
        requesterName: '', requesterEmail: '', contactName: '', contactPhone: '', note: '', status: 'closed', erasedAt: new Date(),
        requesterUserId: null, emailOptOut: true,
      },
      $unset: { location: '' },
    },
    { new: false },
  ).select('_id need suburb');
  if (!lead) return res.status(404).json({ error: 'We could not find that request.' });
  void notifyWithdrawn(lead._id, (lead as any).need, (lead as any).suburb).catch(() => {});
  res.json({ erased: true });
}

/**
 * POST /api/requests/:id/outcome { t, outcome } — the person says whether support started, they are still looking, or they
 * no longer need it. Feeds the provider "started" figures; a request that is no longer needed is closed.
 */
export async function setRequestOutcome(req: Request, res: Response) {
  const id = req.params.id;
  const body = (req.body ?? {}) as { t?: unknown; outcome?: unknown };
  const token = String(body.t ?? '');
  const outcome = String(body.outcome ?? '');
  if (!mongoose.isValidObjectId(id) || !verifyTrackToken(id, token)) return res.status(404).json({ error: 'We could not find that request.' });
  if (!['started', 'looking', 'not_needed'].includes(outcome)) return res.status(400).json({ error: 'Choose one of the three answers.' });
  const set: Record<string, unknown> = { outcome: { value: outcome, at: new Date() } };
  if (outcome === 'not_needed') set.status = 'closed';
  const lead = await Lead.findOneAndUpdate({ _id: id, status: { $ne: 'draft' } }, { $set: set }, { new: true }).select('_id');
  if (!lead) return res.status(404).json({ error: 'We could not find that request.' });
  res.json({ outcome });
}

/** POST /api/requests/:id/attach { t } — a signed-in person adds a request they opened by link to their own account. */
export async function attachRequest(req: AuthedRequest, res: Response) {
  const id = req.params.id;
  const token = String((req.body as { t?: unknown })?.t ?? '');
  if (!mongoose.isValidObjectId(id) || !verifyTrackToken(id, token)) return res.status(404).json({ error: 'We could not find that request.' });
  const lead = await Lead.findOneAndUpdate(
    { _id: id, status: { $ne: 'draft' }, $or: [{ requesterUserId: { $exists: false } }, { requesterUserId: null }, { requesterUserId: req.user!.id }] },
    { $set: { requesterUserId: req.user!.id } },
    { new: true },
  ).select('_id');
  if (!lead) return res.status(409).json({ error: 'This request is already saved to another account.' });
  res.json({ attached: true });
}

/** GET /api/requests/mine — the requests saved to the signed-in account, newest first. */
export async function listMyRequests(req: AuthedRequest, res: Response) {
  const leads = await Lead.find({ requesterUserId: req.user!.id, status: { $ne: 'draft' } }).sort({ createdAt: -1 }).limit(50).lean();
  const data = await loadActivityData(leads.map((l) => l._id));
  res.set('Cache-Control', 'no-store');
  res.json({
    items: leads.map((lead) => ({
      ...buildTrackedRequest(lead, forLead(data.matches, lead._id) as any, data.names, forLead(data.unlocks, lead._id)),
      trackingUrl: trackUrl(String(lead._id)),
    })),
  });
}

/**
 * GET /api/requests/person/:id?t=<signed token> — every request made with the same email address as request :id, newest
 * first. This is the page behind "View your requests" in the weekly summary email. No account is needed; the link is the
 * key, and it only works for the one person it was sent to. The email address itself is never returned.
 */
export async function getPersonRequests(req: Request, res: Response) {
  const id = req.params.id;
  const token = String(req.query.t ?? '');
  if (!mongoose.isValidObjectId(id) || !verifyPersonToken(id, token)) return res.status(404).json({ error: 'We could not find your requests. Please use the link from your email.' });
  const anchor = await Lead.findOne({ _id: id, status: { $ne: 'draft' } }).select('requesterEmail').lean();
  const email = anchor?.requesterEmail?.trim();
  if (!email) return res.status(404).json({ error: 'We could not find your requests.' });

  const since = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
  const leads = await Lead.find({
    requesterEmail: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    status: { $ne: 'draft' },
    createdAt: { $gte: since },
  }).sort({ createdAt: -1 }).limit(20).lean();
  const data = await loadActivityData(leads.map((l) => l._id));

  res.set('Cache-Control', 'no-store');
  res.json({
    items: leads.map((lead) => {
      const own = forLead(data.matches, lead._id);
      const unlocks = forLead(data.unlocks, lead._id);
      const tracked = buildTrackedRequest(lead, own as any, data.names, unlocks);
      const progress = describeProgress({
        matched: own.length,
        viewed: own.filter((m: any) => m.status === 'viewed' || m.status === 'contacted').length,
        unlocked: Math.max(unlocks.length, own.filter((m: any) => m.status === 'contacted').length),
        requestedProvider: tracked.requestedProvider,
      });
      return { ...tracked, open: lead.status !== 'closed', statusText: progress.text, statusTone: progress.tone, trackingUrl: trackUrl(String(lead._id)) };
    }),
  });
}
