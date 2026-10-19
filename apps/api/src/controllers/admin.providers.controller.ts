import type { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.middleware.js';
import Provider from '../models/Provider.js';
import { logActivity } from '../models/AdminActivity.js';
import { syncProviderToWordPress } from '../services/wordpressSync.service.js';
import DocumentAsset from '../models/DocumentAsset.js';
import { getStorageService } from '../services/s3.service.js';
import { applyProviderChecks, sendChecksEmail, type Check } from '../services/providerChecks.js';

const MAX_LIMIT = 50;

// Route-level requireRole('admin') already guarantees only admin
// reaches these — no additional role check needed inside the
// handlers themselves.

export async function listProvidersAdmin(req: AuthedRequest, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Number(req.query.limit) || 20);

  const filter: Record<string, unknown> = {};
  if (req.query.status === 'active' || req.query.status === 'suspended') {
    filter.accountStatus = req.query.status;
  } else if (req.query.status === 'paused') {
    // Providers dropped from search/matching for not confirming their
    // weekly capacity (distinct from an admin suspension).
    filter.accountStatus = 'active';
    filter.listingPaused = true;
  }

  const [docs, total] = await Promise.all([
    Provider.find(filter)
      .populate('userId', 'name email')
      .select('legalEntityName tradingName abn plan intakeStatus accountStatus listingPaused lastCapacityConfirmedAt createdAt userId')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    Provider.countDocuments(filter),
  ]);

  res.json({
    items: docs.map((p: any) => ({
      id: String(p._id),
      legalEntityName: p.legalEntityName,
      tradingName: p.tradingName,
      abn: p.abn,
      plan: p.plan,
      intakeStatus: p.intakeStatus,
      accountStatus: p.accountStatus,
      listingPaused: !!p.listingPaused,
      lastCapacityConfirmedAt: p.lastCapacityConfirmedAt ?? null,
      createdAt: p.createdAt,
      ownerName: p.userId?.name ?? null,
      ownerEmail: p.userId?.email ?? null,
    })),
    page,
    limit,
    total,
    hasMore: page * limit < total,
  });
}

export async function getProviderAdmin(req: AuthedRequest, res: Response) {
  const provider = await Provider.findById(req.params.id).populate('userId', 'name email mobile').lean();
  if (!provider) return res.status(404).json({ error: 'Provider not found' });
  res.json(provider);
}

export async function setProviderAccountStatus(req: AuthedRequest, res: Response) {
  const { status } = req.body as { status: string };
  if (status !== 'active' && status !== 'suspended') {
    return res.status(400).json({ error: 'status must be "active" or "suspended"' });
  }

  const provider = await Provider.findByIdAndUpdate(req.params.id, { accountStatus: status }, { new: true }).lean();
  if (!provider) return res.status(404).json({ error: 'Provider not found' });

  const name = provider.tradingName || provider.legalEntityName || 'A provider';
  await logActivity('provider_status_changed', `${name} was ${status === 'suspended' ? 'suspended' : 'reactivated'}`);

  // Suspending/reactivating flips the WP mirror post between
  // draft/publish (see wordpressSync.service.ts) — fire-and-forget,
  // same as every other sync trigger.
  syncProviderToWordPress(String(provider._id)).catch(() => {});

  res.json({ id: String(provider._id), accountStatus: provider.accountStatus });
}

/**
 * Admin override for the weekly-capacity pause (scripts/
 * weeklyCapacityCheck.ts). Unpausing does NOT fabricate a confirmation
 * (lastCapacityConfirmedAt is left alone) — it clears the outstanding
 * confirmation window instead, so the next weekly run sends a fresh
 * prompt rather than immediately re-pausing over the old, expired one.
 */
export async function setProviderListingPaused(req: AuthedRequest, res: Response) {
  const { paused } = req.body as { paused: unknown };
  if (typeof paused !== 'boolean') return res.status(400).json({ error: 'paused must be true or false' });

  const update = paused
    ? { $set: { listingPaused: true } }
    : { $set: { listingPaused: false }, $unset: { capacityConfirmTokenHash: 1, capacityConfirmExpiresAt: 1 } };

  const provider = await Provider.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
  if (!provider) return res.status(404).json({ error: 'Provider not found' });

  const name = provider.tradingName || provider.legalEntityName || 'A provider';
  await logActivity('provider_status_changed', `${name}'s listing was ${paused ? 'paused' : 'resumed'} by an admin`);

  res.json({ id: String(provider._id), listingPaused: !!provider.listingPaused });
}

/** POST /api/admin/providers/:id/checks/run — run the onboarding checks again (after the register data changed, or a provider says they fixed something). */
export async function runProviderChecksAdmin(req: AuthedRequest, res: Response) {
  const provider = await Provider.findById(req.params.id);
  if (!provider) return res.status(404).json({ error: 'Provider not found' });
  if (!provider.attestation) return res.status(400).json({ error: 'This provider has not made the declaration yet, so there is nothing to check.' });
  const result = await applyProviderChecks(provider);
  if (!result) return res.status(500).json({ error: 'The checks could not be run. Please try again.' });
  res.json(result);
}

/**
 * POST /api/admin/providers/:id/checks/approve { note } — the team has looked at the point that was raised and is happy.
 * Only for "in review": anything the provider still has to fix (needs attention) is theirs to fix first.
 */
export async function approveProviderChecksAdmin(req: AuthedRequest, res: Response) {
  const provider = await Provider.findById(req.params.id);
  if (!provider || !provider.verification) return res.status(404).json({ error: 'There are no checks to approve for this provider.' });
  if (provider.verification.status === 'needs_attention') return res.status(400).json({ error: 'The provider still has something to fix. Approve once they have fixed it, or ask them to.' });
  const note = typeof req.body?.note === 'string' ? req.body.note.slice(0, 500) : undefined;
  provider.verification.status = 'checked';
  provider.verification.approvedBy = req.user?.email;
  provider.verification.approvedAt = new Date();
  provider.verification.approvalNote = note;
  await provider.save();
  await logActivity('provider_checks_approved', `${provider.tradingName || provider.legalEntityName || 'A provider'}: onboarding checks approved by ${req.user?.email ?? 'an administrator'}`).catch(() => {});
  // The provider hears once that everything is confirmed, unless they were already told so.
  if (!provider.verification.emailedKey?.startsWith('checked:')) {
    await sendChecksEmail(provider, 'checked', provider.verification.checks as Check[]);
    await Provider.updateOne({ _id: provider._id }, { $set: { 'verification.emailedKey': 'checked:' } });
  }
  res.json({ status: 'checked' });
}

/** GET /api/admin/providers/:id/documents/:kind — an administrator opens a document the provider uploaded. */
export async function downloadProviderDocumentAdmin(req: AuthedRequest, res: Response) {
  const asset = await DocumentAsset.findOne({ ownerId: req.params.id, ownerType: 'Provider', kind: String(req.params.kind) }).lean();
  if (!asset) return res.status(404).json({ error: 'No document of that kind has been uploaded.' });
  try {
    const body = await getStorageService().getObject(asset.s3Key);
    res.setHeader('Content-Type', asset.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${(asset.originalFilename ?? 'document').replace(/[^a-zA-Z0-9._ -]/g, '_')}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.send(body);
  } catch (err) {
    console.error('[admin] could not read a provider document:', (err as Error).message);
    res.status(502).json({ error: 'The document could not be read from storage.' });
  }
}

/** GET /api/admin/providers/:id/policy-review — the uploaded policy with its security check and what the automatic read found. */
export async function getPolicyReviewAdmin(req: AuthedRequest, res: Response) {
  const asset = await DocumentAsset.findOne({ ownerId: req.params.id, ownerType: 'Provider', kind: 'incident_policy' })
    .select('originalFilename size uploadedAt scan analysis').lean();
  res.json(asset ? { filename: asset.originalFilename, size: asset.size, uploadedAt: asset.uploadedAt, scan: asset.scan ?? null, review: asset.analysis ?? null } : null);
}
