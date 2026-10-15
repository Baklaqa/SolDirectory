import type { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.middleware.js';
import UnlockReport from '../models/UnlockReport.js';
import UnlockLedger from '../models/UnlockLedger.js';
import Provider from '../models/Provider.js';
import Lead from '../models/Lead.js';
import ContactMessage from '../models/ContactMessage.js';
import AdminActivity from '../models/AdminActivity.js';

/** GET /api/admin/reports/unlocks: provider reports about unusable requests, open first. */
export async function listUnlockReports(_req: AuthedRequest, res: Response) {
  const reports = await UnlockReport.find().sort({ status: 1, createdAt: -1 }).limit(200).lean();
  const [providers, leads] = await Promise.all([
    Provider.find({ _id: { $in: reports.map((r) => r.providerId) } }).select('tradingName legalEntityName').lean(),
    Lead.find({ _id: { $in: reports.map((r) => r.leadId) } }).select('need suburb createdAt').lean(),
  ]);
  const pName = new Map(providers.map((p: any) => [String(p._id), p.tradingName || p.legalEntityName]));
  const lead = new Map(leads.map((l: any) => [String(l._id), l]));
  res.json(reports.map((r: any) => ({
    id: String(r._id),
    reason: r.reason,
    note: r.note ?? '',
    status: r.status,
    provider: pName.get(String(r.providerId)) ?? 'A provider',
    request: (() => { const l: any = lead.get(String(r.leadId)); return l ? `${l.need}${l.suburb ? ` in ${l.suburb}` : ''}` : 'A request'; })(),
    createdAt: r.createdAt,
    resolvedBy: r.resolvedBy ?? null,
  })));
}

async function resolve(req: AuthedRequest, res: Response, status: 'restored' | 'dismissed') {
  const report = await UnlockReport.findById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found.' });
  if (report.status !== 'open') return res.status(409).json({ error: 'This report has already been dealt with.' });

  if (status === 'restored') {
    const removed = await UnlockLedger.deleteOne({ leadId: report.leadId, providerId: report.providerId });
    if (removed.deletedCount) {
      // One unlock back on the provider's monthly allowance, never below zero.
      await Provider.updateOne({ _id: report.providerId, leadUnlocksUsedThisPeriod: { $gt: 0 } }, { $inc: { leadUnlocksUsedThisPeriod: -1 } });
    }
  }
  report.status = status;
  report.resolvedBy = req.user?.email ?? 'admin';
  report.resolvedAt = new Date();
  await report.save();
  AdminActivity.create({ type: 'unlock_report', summary: `Unlock report ${status} by ${report.resolvedBy} (request ${String(report.leadId).slice(-8).toUpperCase()})` }).catch(() => {});
  res.json({ id: String(report._id), status });
}

export const restoreUnlock = (req: AuthedRequest, res: Response) => resolve(req, res, 'restored');
export const dismissUnlockReport = (req: AuthedRequest, res: Response) => resolve(req, res, 'dismissed');

/** GET /api/admin/reports/messages: messages sent from the Contact page, newest first. */
export async function listContactMessages(_req: AuthedRequest, res: Response) {
  const items = await ContactMessage.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json(items.map((m: any) => ({ id: String(m._id), name: m.name, email: m.email, phone: m.phone ?? '', iAm: m.iAm, message: m.message, createdAt: m.createdAt })));
}
