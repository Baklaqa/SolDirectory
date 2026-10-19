import type { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.middleware.js';
import Provider from '../models/Provider.js';
import DocumentAsset from '../models/DocumentAsset.js';
import { getStorageService, StorageNotConfiguredError } from '../services/s3.service.js';
import { logActivity } from '../models/AdminActivity.js';
import { geocodeAddress } from '../services/geocoding.service.js';
import { generateUniqueProviderSlug } from '../utils/slugify.js';
import { getActiveProviderForUser } from '../utils/getActiveProvider.js';
import { syncProviderToWordPress } from '../services/wordpressSync.service.js';
import { applyProviderChecks } from '../services/providerChecks.js';

const STEP_KEYS = ['org', 'insurance', 'areas', 'team', 'policy', 'declaration', 'billing'];
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const POLICY_KIND = 'incident_policy';
const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function validatePolicyDocument(input: { kind: string; contentType: string; filename: string; size: number }) {
  if (input.kind !== POLICY_KIND) return 'Unsupported document kind';
  if (!ALLOWED_DOCUMENT_TYPES.has(input.contentType)) return 'Upload a PDF, DOC, or DOCX document';
  if (!input.filename || input.filename.length > 180) return 'Filename is required and must be under 180 characters';
  if (!Number.isInteger(input.size) || input.size < 1 || input.size > MAX_DOCUMENT_BYTES) {
    return 'Document must be no larger than 10 MB';
  }
  return null;
}

const EXTENSION_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/** The first bytes of a real PDF, Word 97-2003 or Word document. Stops a renamed file of another kind being stored as a policy. */
function looksLikeDocument(type: string, body: Buffer): boolean {
  if (type === 'application/pdf') return body.subarray(0, 5).toString('latin1') === '%PDF-';
  if (type === 'application/msword') return body.length > 4 && body[0] === 0xd0 && body[1] === 0xcf && body[2] === 0x11 && body[3] === 0xe0;
  return body.length > 4 && body[0] === 0x50 && body[1] === 0x4b && body[2] === 0x03 && body[3] === 0x04;
}

/**
 * POST /api/onboarding/documents?kind=incident_policy&filename=policy.pdf   (body: the file itself)
 * One signed-in request: the API checks the file and stores it, so there is no second step against a storage service for the provider
 * to get stuck on. Replaces any earlier document of the same kind.
 */
export async function uploadDocument(req: AuthedRequest, res: Response) {
  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No provider profile for this account' });
  const kind = String(req.query.kind ?? '');
  const filename = String(req.query.filename ?? '').slice(0, 180);
  const body = req.body as Buffer;
  if (!Buffer.isBuffer(body) || body.length === 0) return res.status(400).json({ error: 'No file was received. Please choose the document again.' });

  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const declared = String(req.headers['content-type'] ?? '').split(';')[0].trim();
  // Some browsers send no type, or a generic one, for Word files: the file name decides then.
  const contentType = ALLOWED_DOCUMENT_TYPES.has(declared) ? declared : EXTENSION_TYPES[ext] ?? declared;
  const validationError = validatePolicyDocument({ kind, contentType, filename, size: body.length });
  if (validationError) return res.status(400).json({ error: validationError });
  if (!looksLikeDocument(contentType, body)) return res.status(400).json({ error: 'That file does not look like a PDF or Word document. Please choose the original file.' });

  const key = `providers/${provider._id}/${kind}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storage = getStorageService();
  const previous = await DocumentAsset.findOne({ ownerId: provider._id, kind }).select('s3Key').lean();
  try {
    // A storage problem must come back as a clear message in seconds, never as a request that hangs until the web server gives up (504).
    await Promise.race([
      storage.putObject(key, body, contentType),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('storage did not answer in 20 seconds')), 20_000)),
    ]);
  } catch (error) {
    console.error('[onboarding] document upload could not be stored:', (error as Error).message);
    return res.status(503).json({ error: 'We could not save your document just now. Please try again in a minute.' });
  }
  const asset = await DocumentAsset.findOneAndUpdate(
    { ownerId: provider._id, kind },
    { ownerId: provider._id, ownerType: 'Provider', kind, contentType, s3Key: key, originalFilename: filename, size: body.length, status: 'complete', uploadedAt: new Date() },
    { upsert: true, new: true },
  );
  if (previous?.s3Key && previous.s3Key !== key) storage.deleteObject(previous.s3Key).catch(() => {});
  res.status(201).json({ status: 'complete', document: { filename: asset.originalFilename, size: asset.size, uploadedAt: asset.uploadedAt } });
}

/** DELETE /api/onboarding/documents/:kind — the provider removes the document they uploaded (so they can choose another). */
export async function deleteDocument(req: AuthedRequest, res: Response) {
  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No provider profile for this account' });
  const kind = String(req.params.kind);
  if (kind !== POLICY_KIND) return res.status(400).json({ error: 'Unsupported document kind' });
  const asset = await DocumentAsset.findOneAndDelete({ ownerId: provider._id, kind });
  if (asset?.s3Key) getStorageService().deleteObject(asset.s3Key).catch(() => {});
  res.json({ removed: !!asset });
}

export async function getOnboarding(req: AuthedRequest, res: Response) {
  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No provider profile for this account' });
  const policy = await DocumentAsset.findOne({ ownerId: provider._id, kind: POLICY_KIND, status: 'complete' }).select('originalFilename size uploadedAt').lean();
  // Previously only returned the step-completion array — the
  // frontend had nothing to pre-fill actual field values with, so a
  // page refresh mid-onboarding looked like data loss even though
  // it was saved. Now returns the real top-level fields too.
  res.json({
    steps: provider.onboarding,
    attestation: provider.attestation ? {
      registrationStatus: provider.attestation.registrationStatus,
      insuranceHeld: provider.attestation.insuranceHeld,
      insuranceExpiry: provider.attestation.insuranceExpiry ? new Date(provider.attestation.insuranceExpiry).toISOString().slice(0, 10) : '',
      workerScreening: provider.attestation.workerScreening,
      codeOfConduct: provider.attestation.codeOfConduct,
      truthful: provider.attestation.truthful,
      attestedAt: provider.attestation.attestedAt,
    } : null,
    verification: provider.verification ? { status: provider.verification.status, checkedAt: provider.verification.checkedAt, checks: provider.verification.checks } : null,
    policyDocument: policy ? { filename: policy.originalFilename, size: policy.size, uploadedAt: policy.uploadedAt } : null,
    provider: {
      legalEntityName: provider.legalEntityName,
      abn: provider.abn,
      tradingName: provider.tradingName,
      registrationGroups: provider.registrationGroups,
      serviceSuburbs: provider.serviceSuburbs,
      travelRadiusKm: provider.travelRadiusKm,
      weeklyCapacityHours: provider.weeklyCapacityHours,
      rosterSize: provider.rosterSize,
      afterHoursCover: provider.afterHoursCover,
      incidentPolicyEscalation: provider.incidentPolicyEscalation,
      plan: provider.plan,
      lastCapacityConfirmedAt: provider.lastCapacityConfirmedAt ?? null,
      listingPaused: provider.listingPaused,
      smsNotifications: !!provider.smsNotifications,
    },
  });
}

export async function saveStep(req: AuthedRequest, res: Response) {
  const { stepKey } = req.params;
  const { data } = req.body as { data: Record<string, unknown> };
  if (!STEP_KEYS.includes(stepKey)) return res.status(400).json({ error: 'Unknown step' });

  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No provider profile for this account' });

  if (stepKey === 'org' && data?.abn) {
    const digits = String(data.abn).replace(/\D/g, '');
    if (digits.length !== 11) {
      return res.status(400).json({
        error: `That ABN has ${digits.length} digits. Enter all eleven so we can match your entity on the Commission register.`,
      });
    }
  }
  if (stepKey === 'policy') {
    const hasPolicyDoc = await DocumentAsset.exists({ ownerId: provider._id, kind: POLICY_KIND, status: 'complete' });
    if (!hasPolicyDoc) {
      return res.status(400).json({ error: 'Upload the incident and complaints policy before marking this step complete.' });
    }
  }

  if (stepKey === 'declaration') {
    const d = (data ?? {}) as Record<string, unknown>;
    if (d.registrationStatus !== 'registered' && d.registrationStatus !== 'not_registered') {
      return res.status(400).json({ error: 'Tell us whether your organisation is registered with the NDIS Commission.' });
    }
    const expiry = d.insuranceExpiry ? new Date(String(d.insuranceExpiry)) : null;
    if (d.insuranceHeld !== true) return res.status(400).json({ error: 'Please confirm that you hold current insurance.' });
    if (!expiry || Number.isNaN(expiry.getTime())) return res.status(400).json({ error: 'Add the date your insurance expires.' });
    if (expiry.getTime() < Date.now() - 86_400_000) return res.status(400).json({ error: 'That insurance date has passed. Renew your insurance first, then add the new date.' });
    if (expiry.getTime() > Date.now() + 5 * 366 * 86_400_000) return res.status(400).json({ error: 'That insurance date is too far ahead. Please check it.' });
    if (d.workerScreening !== true || d.codeOfConduct !== true || d.truthful !== true) {
      return res.status(400).json({ error: 'Please tick each statement to confirm it.' });
    }
    provider.attestation = {
      registrationStatus: d.registrationStatus, insuranceHeld: true, insuranceExpiry: expiry,
      workerScreening: true, codeOfConduct: true, truthful: true, attestedAt: new Date(), attestedBy: req.user?.email, ip: req.ip,
    };
  }

  // Write real values onto the provider's actual top-level fields —
  // previously this only ever happened for nothing (data sat inside
  // onboarding[].data and nowhere else), so provider.abn and friends
  // stayed empty forever even after "completing" these steps.
  if (stepKey === 'org') {
    if (data.abn) provider.abn = String(data.abn);
    if (data.legalEntityName) provider.legalEntityName = String(data.legalEntityName);
    if (data.tradingName) provider.tradingName = String(data.tradingName);

    // Real structured address (spec item 15) — each part stored
    // separately so it's independently queryable (e.g. "providers in
    // NSW") rather than needing to parse a single free-text string.
    const addr = data.businessAddress as Record<string, string> | undefined;
    if (addr && typeof addr === 'object') {
      provider.businessAddress = {
        address: addr.address ? String(addr.address) : undefined,
        suburb: addr.suburb ? String(addr.suburb) : undefined,
        state: addr.state ? String(addr.state) : undefined,
        postcode: addr.postcode ? String(addr.postcode) : undefined,
        country: addr.country ? String(addr.country) : 'Australia',
      };

      // Geocode the real structured address — more precise than the
      // areas step's suburb-only fallback below. Never blocks saving
      // the step if it fails, same principle as every other
      // geocodeAddress call in this codebase.
      const fullAddress = [addr.address, addr.suburb, addr.state, addr.postcode, addr.country || 'Australia']
        .filter(Boolean)
        .join(', ');
      if (fullAddress) {
        const geo = await geocodeAddress(fullAddress);
        if (geo) provider.location = { type: 'Point', coordinates: [geo.lng, geo.lat] };
      }
    }

    // Generate the public slug once a real business name exists —
    // never regenerate it on subsequent edits, since that would
    // break any link/bookmark already pointing at the old slug.
    if (!provider.slug) {
      const name = provider.tradingName || provider.legalEntityName;
      if (name) provider.slug = await generateUniqueProviderSlug(name);
    }
  }
  if (stepKey === 'insurance' && Array.isArray(data.registrationGroups)) {
    provider.registrationGroups = data.registrationGroups as string[];
  }
  if (stepKey === 'areas') {
    if (Array.isArray(data.serviceSuburbs)) provider.serviceSuburbs = data.serviceSuburbs as string[];
    if (data.travelRadiusKm !== undefined) provider.travelRadiusKm = Number(data.travelRadiusKm);
    if (data.weeklyCapacityHours !== undefined) provider.weeklyCapacityHours = Number(data.weeklyCapacityHours);

    // Geocode the first listed suburb as a fallback ONLY if the org
    // step's real structured business address didn't already produce
    // a more precise geocode — never overwrite a precise address
    // geocode with a less precise suburb-only one. Failure here must
    // never block saving the step — geocodeAddress already returns
    // null rather than throwing.
    if (!provider.location?.coordinates?.length) {
      const firstSuburb = provider.serviceSuburbs?.[0];
      if (firstSuburb) {
        const geo = await geocodeAddress(`${firstSuburb}, Australia`);
        if (geo) provider.location = { type: 'Point', coordinates: [geo.lng, geo.lat] };
      }
    }
  }
  if (stepKey === 'team') {
    if (data.rosterSize !== undefined) provider.rosterSize = Number(data.rosterSize);
    if (data.afterHoursCover) provider.afterHoursCover = String(data.afterHoursCover);
  }
  if (stepKey === 'policy' && data.incidentPolicyEscalation) {
    provider.incidentPolicyEscalation = String(data.incidentPolicyEscalation);
  }

  const existing = provider.onboarding.find((s) => s.key === stepKey);
  if (existing) {
    existing.complete = true;
    existing.data = data;
  } else {
    provider.onboarding.push({ key: stepKey as any, complete: true, data });
  }
  await provider.save();

  // Once the declaration has been made, every save re-checks the details. The provider gets one email for each new result: all good, or what to fix.
  const verification = provider.attestation ? await applyProviderChecks(provider) : null;

  // Fire-and-forget — a WordPress outage must never block saving an
  // onboarding step. Only worth attempting once the provider has a
  // real name (buildMetaPayload's own guard skips it otherwise).
  syncProviderToWordPress(String(provider._id)).catch(() => {});

  const name = provider.tradingName || provider.legalEntityName || 'A provider';
  const allDone = STEP_KEYS.every((k) => provider.onboarding.find((s) => s.key === k)?.complete);
  await logActivity(
    allDone ? 'onboarding_completed' : 'onboarding_step_completed',
    allDone ? `${name} completed onboarding` : `${name} completed the "${stepKey}" onboarding step`
  );

  res.json({ status: 'saved', verification });
}

export async function getUploadUrl(req: AuthedRequest, res: Response) {
  const { kind, contentType, filename, size } = req.body as {
    kind: string; contentType: string; filename: string; size: number;
  };
  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No provider profile for this account' });

  const validationError = validatePolicyDocument({ kind, contentType, filename, size });
  if (validationError) return res.status(400).json({ error: validationError });

  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `providers/${provider._id}/${kind}/${Date.now()}-${safeFilename}`;
  try {
    const { uploadUrl } = await getStorageService().getUploadUrl(key, contentType);
    return res.json({ uploadUrl, key });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return res.status(503).json({ error: 'Document uploads are temporarily unavailable. Please contact support.' });
    }
    throw error;
  }
}

export async function completeUpload(req: AuthedRequest, res: Response) {
  const { kind, contentType, filename, size, key } = req.body as {
    kind: string; contentType: string; filename: string; size: number; key: string;
  };
  const provider = await getActiveProviderForUser(req.user!.id);
  if (!provider) return res.status(403).json({ error: 'No provider profile for this account' });

  const validationError = validatePolicyDocument({ kind, contentType, filename, size });
  if (validationError) return res.status(400).json({ error: validationError });

  const expectedPrefix = `providers/${provider._id}/${kind}/`;
  if (!key?.startsWith(expectedPrefix)) return res.status(400).json({ error: 'Invalid upload key' });

  try {
    const metadata = await getStorageService().getObjectMetadata(key);
    if (metadata.size !== size || metadata.size > MAX_DOCUMENT_BYTES || metadata.contentType !== contentType) {
      return res.status(400).json({ error: 'Uploaded document does not match the requested file' });
    }

    await DocumentAsset.findOneAndUpdate(
      { ownerId: provider._id, kind },
      {
        ownerId: provider._id,
        ownerType: 'Provider',
        kind,
        contentType,
        s3Key: key,
        originalFilename: filename,
        size,
        status: 'complete',
        uploadedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    return res.json({ status: 'complete' });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return res.status(503).json({ error: 'Document uploads are temporarily unavailable. Please contact support.' });
    }
    return res.status(400).json({ error: 'Upload could not be verified. Please try again.' });
  }
}
