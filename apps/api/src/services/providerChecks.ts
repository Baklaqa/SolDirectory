import DocumentAsset from '../models/DocumentAsset.js';
import Provider, { type ProviderDoc } from '../models/Provider.js';
import RegisterListing from '../models/RegisterListing.js';
import User from '../models/User.js';
import { EmailService } from './email.service.js';
import { siteOrigin } from './emailTokens.js';
import { REAL_SERVICES } from './registerNormalise.js';

/**
 * The automatic checks on a provider's details and their declaration (onboarding step "Confirm your details").
 *
 * What it can and cannot know: it cross-checks the ABN against the NDIS Commission register data SolDirectory holds, and checks that the
 * declaration, the policy document and the insurance date are all there. It does not read the policy, and it cannot see insurance or
 * worker screening: those are the provider's own declaration, kept with a date, and an administrator can ask for evidence. Our copy of
 * the register shows an ABN for only some listings, so "not found" is a note for the team, never a failure on its own.
 */
export type CheckResult = 'pass' | 'warn' | 'fail';
export interface Check { key: string; label: string; result: CheckResult; message: string; fixStep?: string }
export type Outcome = 'checked' | 'in_review' | 'needs_attention';

export const digitsOnly = (v: unknown) => String(v ?? '').replace(/\D/g, '');

/** The ABN check-digit rule: subtract 1 from the first digit, weight the 11 digits, and the sum must divide by 89. */
export function isValidAbn(abn: unknown): boolean {
  const d = digitsOnly(abn);
  if (d.length !== 11) return false;
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const sum = [...d].reduce((n, ch, i) => n + (Number(ch) - (i === 0 ? 1 : 0)) * weights[i], 0);
  return sum % 89 === 0;
}

const STOP = new Set(['pty', 'ltd', 'limited', 'inc', 'incorporated', 'the', 'and', 'of', 'p', 'l', 't', 'a', 'as', 'atf', 'trading', 'services', 'service', 'care', 'support']);
const tokens = (name: string) => name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w));
const normName = (name: string) => tokens(name).join(' ');
/** Share of the shorter name's words that also appear in the other (0 to 1). */
function nameOverlap(a: string, b: string): number {
  const ta = tokens(a), tb = new Set(tokens(b));
  if (!ta.length || !tb.size) return 0;
  return ta.filter((w) => tb.has(w)).length / Math.min(ta.length, tb.size);
}

const day = 86_400_000;
const fmtDate = (d: Date) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Sydney' });

export async function runProviderChecks(provider: ProviderDoc, now = new Date()): Promise<{ status: Outcome; checks: Check[] }> {
  const checks: Check[] = [];
  const att = provider.attestation;
  const abn = digitsOnly(provider.abn);

  // 1. ABN
  const abnOk = isValidAbn(abn);
  checks.push(abnOk
    ? { key: 'abn', label: 'ABN', result: 'pass', message: 'Your ABN is in the right format.' }
    : { key: 'abn', label: 'ABN', result: 'fail', message: abn ? 'Your ABN does not look right. It has 11 digits, and one of them may be wrong.' : 'Add your ABN.', fixStep: 'org' });

  // 2. The NDIS Commission register
  const names = [provider.legalEntityName, provider.tradingName].filter(Boolean) as string[];
  let listing: { name: string; abn?: string; supportCategories: string[] } | null = null;
  if (abnOk) listing = await RegisterListing.findOne({ type: 'ndis', abn }).select('name abn supportCategories').lean();
  let matchedBy: 'abn' | 'name' | null = listing ? 'abn' : null;
  if (!listing && names.length) {
    const candidates = await RegisterListing.find({ type: 'ndis', nameLower: { $in: names.map((n) => n.toLowerCase().trim()) } }).select('name abn supportCategories').limit(5).lean();
    // A name match counts only if the register shows no ABN for that listing, or the same one. A different ABN is a different business.
    const hit = candidates.find((c) => !c.abn || digitsOnly(c.abn) === abn);
    if (hit) { listing = hit; matchedBy = 'name'; }
  }

  if (att?.registrationStatus === 'registered') {
    if (!listing) {
      checks.push({
        key: 'register', label: 'NDIS Commission register', result: 'warn', fixStep: 'declaration',
        message: 'We could not find your organisation on the NDIS Commission register we hold. Our copy does not list every ABN, so our team will confirm this. If you are not registered, change your answer.',
      });
    } else {
      checks.push({
        key: 'register', label: 'NDIS Commission register', result: 'pass',
        message: matchedBy === 'abn' ? `Your ABN is on the NDIS Commission register as “${listing.name}”.` : `We found “${listing.name}” on the NDIS Commission register by name.`,
      });
      if (matchedBy === 'abn' && names.length && Math.max(...names.map((n) => nameOverlap(n, listing!.name))) < 0.5) {
        checks.push({ key: 'name', label: 'Business name', result: 'warn', fixStep: 'org', message: `The register shows “${listing.name}” for this ABN, but you entered “${names[0]}”. Check you used your legal entity name.` });
      }
      const wanted = (provider.registrationGroups ?? []).filter((g) => (REAL_SERVICES as readonly string[]).some((s) => s.toLowerCase() === g.toLowerCase()));
      const missing = wanted.filter((g) => !listing!.supportCategories.some((c) => c.toLowerCase() === g.toLowerCase()));
      if (missing.length) {
        checks.push({ key: 'groups', label: 'Registration groups', result: 'warn', fixStep: 'insurance', message: `The register does not show these supports for your organisation: ${missing.join(', ')}. Remove any you are not registered for, or tell us if the register is out of date.` });
      }
    }
  } else if (att?.registrationStatus === 'not_registered' && listing && matchedBy === 'abn') {
    checks.push({ key: 'register', label: 'NDIS Commission register', result: 'warn', fixStep: 'declaration', message: `Your ABN is on the NDIS Commission register (“${listing.name}”), but you said you are not registered. Please check your answer.` });
  } else if (att?.registrationStatus === 'not_registered') {
    checks.push({ key: 'register', label: 'NDIS Commission register', result: 'pass', message: 'You told us your organisation is not NDIS registered.' });
  }

  // 3. Incident and complaints policy
  const policy = await DocumentAsset.exists({ ownerId: provider._id, kind: 'incident_policy', status: 'complete' });
  checks.push(policy
    ? { key: 'policy', label: 'Incident and complaints policy', result: 'pass', message: 'Your policy document is uploaded.' }
    : { key: 'policy', label: 'Incident and complaints policy', result: 'fail', message: 'Upload your incident and complaints policy.', fixStep: 'policy' });

  // 4. Insurance
  if (!att?.insuranceHeld) {
    checks.push({ key: 'insurance', label: 'Insurance', result: 'fail', message: 'Confirm that you hold current insurance, and add the date it expires.', fixStep: 'declaration' });
  } else if (!att.insuranceExpiry) {
    checks.push({ key: 'insurance', label: 'Insurance', result: 'fail', message: 'Add the date your insurance expires.', fixStep: 'declaration' });
  } else if (new Date(att.insuranceExpiry).getTime() < now.getTime()) {
    checks.push({ key: 'insurance', label: 'Insurance', result: 'fail', message: `Your insurance expired on ${fmtDate(new Date(att.insuranceExpiry))}. Renew it and update the date.`, fixStep: 'declaration' });
  } else if (new Date(att.insuranceExpiry).getTime() - now.getTime() < 30 * day) {
    checks.push({ key: 'insurance', label: 'Insurance', result: 'warn', message: `Your insurance expires on ${fmtDate(new Date(att.insuranceExpiry))}. Renew it and update the date when you do.`, fixStep: 'declaration' });
  } else {
    checks.push({ key: 'insurance', label: 'Insurance', result: 'pass', message: `Insurance declared, expiring ${fmtDate(new Date(att.insuranceExpiry))}.` });
  }

  // 5. The rest of the declaration
  const declared = !!att && att.workerScreening && att.codeOfConduct && att.truthful;
  checks.push(declared
    ? { key: 'declaration', label: 'Declaration', result: 'pass', message: `Declared on ${fmtDate(new Date(att!.attestedAt))}.` }
    : { key: 'declaration', label: 'Declaration', result: 'fail', message: 'Tick each statement in the declaration to confirm it.', fixStep: 'declaration' });

  const status: Outcome = checks.some((c) => c.result === 'fail') ? 'needs_attention' : checks.some((c) => c.result === 'warn') ? 'in_review' : 'checked';
  return { status, checks };
}

/**
 * Runs the checks, saves the result on the provider, and emails the owner: once for each new result (all good, or what needs fixing).
 * Running it again with the same result sends nothing. Never throws; a failed check or email must not break the step being saved.
 */
export async function applyProviderChecks(provider: ProviderDoc): Promise<{ status: Outcome; checks: Check[] } | null> {
  try {
    const { status: raw, checks } = await runProviderChecks(provider);
    // An administrator's approval stands unless something is outright wrong.
    const approved = !!provider.verification?.approvedAt;
    const status: Outcome = approved && raw === 'in_review' ? 'checked' : raw;
    const key = `${status}:${checks.filter((c) => c.result !== 'pass').map((c) => `${c.key}=${c.message}`).join('|')}`;
    const emailedKey = provider.verification?.emailedKey;

    provider.verification = {
      status, checkedAt: new Date(), checks, emailedKey,
      approvedBy: provider.verification?.approvedBy, approvedAt: provider.verification?.approvedAt, approvalNote: provider.verification?.approvalNote,
    };
    await provider.save();

    if (key !== emailedKey) {
      await sendChecksEmail(provider, status, checks);
      await Provider.updateOne({ _id: provider._id }, { $set: { 'verification.emailedKey': key } });
      if (status === 'in_review') {
        EmailService.notifyAdmin('A provider needs a quick look', `${provider.tradingName || provider.legalEntityName || 'A provider'} finished onboarding with something for the team to confirm.`, `${siteOrigin()}/admin/providers/${provider._id}`).catch(() => {});
      }
    }
    return { status, checks };
  } catch (err) {
    console.error('[providerChecks] could not run the checks:', (err as Error).message);
    return null;
  }
}

export async function sendChecksEmail(provider: ProviderDoc, status: Outcome, checks: Check[]): Promise<void> {
  const owner = await User.findById(provider.userId).select('email').lean();
  if (!owner?.email) return;
  const name = provider.tradingName || provider.legalEntityName || 'there';
  if (status === 'checked') {
    await EmailService.sendProviderChecksPassed(owner.email, { name, registered: provider.attestation?.registrationStatus === 'registered', dashboardUrl: `${siteOrigin()}/dashboard` });
    return;
  }
  const items = checks.filter((c) => c.result !== 'pass').map((c) => ({
    message: c.message,
    severity: c.result as 'warn' | 'fail',
    fixUrl: `${siteOrigin()}/onboarding?step=${c.fixStep ?? 'org'}`,
  }));
  await EmailService.sendProviderChecksAttention(owner.email, { name, items, onlyConfirming: status === 'in_review' });
}
