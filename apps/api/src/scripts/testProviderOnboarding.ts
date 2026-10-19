import 'dotenv/config';

/**
 * End-to-end check of provider onboarding against a RUNNING API and the demo accounts from `npm run db:seed:admin` (a throwaway database,
 * never production):
 *
 *   npx tsx src/scripts/testProviderOnboarding.ts --base http://localhost:4000
 *
 * It uploads the incident policy (and refuses a fake one), makes the declaration, and checks the automatic results: a matching ABN on the
 * NDIS register passes, a bad ABN needs fixing, expired insurance is refused, each result is emailed once, an administrator can open
 * the document, re-run the checks and approve, and a provider cannot use the administrator routes. Exits 1 if anything is wrong.
 */
const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const base = (arg('base') ?? 'http://localhost:4000').replace(/\/$/, '');
let failures = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok || !detail ? '' : `: ${detail}`}`);
  if (!ok) failures += 1;
};

async function api(path: string, token: string | null, init: RequestInit = {}) {
  const res = await fetch(`${base}/api${path}`, { ...init, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) } });
  const text = await res.text();
  let body: any = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body, headers: res.headers };
}
const json = (b: unknown): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');

async function main() {
  const { connectDB } = await import('../config/db.js');
  const { default: User } = await import('../models/User.js');
  const { default: Provider } = await import('../models/Provider.js');
  const { default: RegisterListing } = await import('../models/RegisterListing.js');
  const { default: EmailLog } = await import('../models/EmailLog.js');
  const { isValidAbn } = await import('../services/providerChecks.js');
  await connectDB();

  check(isValidAbn('51 824 753 556') && !isValidAbn('12 345 678 901') && !isValidAbn('123'), 'the ABN check-digit rule accepts a real ABN and refuses wrong ones');

  const owner: any = await User.findOne({ role: 'provider', email: /\.demo\.\d+@example\.com\.au$/ }).lean();
  const admin: any = await User.findOne({ role: 'admin', email: /\.demo\.\d+@example\.com\.au$/ }).lean();
  const listing: any = await RegisterListing.findOne({ type: 'ndis', abn: /^\d{11}$/, 'supportCategories.0': { $exists: true } }).lean();
  if (!owner || !admin || !listing) { console.error('Need the demo accounts and a register listing with an ABN. Run npm run db:seed:admin and the register import on a throwaway database first.'); process.exit(1); }
  const login = async (email: string) => (await api('/auth/login', null, json({ email, password: 'password123' }))).body.token as string;
  const token = await login(owner.email);
  const adminToken = await login(admin.email);
  const providerId = String(owner.providerId);
  await Provider.updateOne({ _id: providerId }, { $unset: { attestation: '', verification: '' }, $set: { onboarding: [] } });
  await EmailLog.deleteMany({ to: owner.email });
  const step = (key: string, data: unknown) => api(`/onboarding/${key}`, token, json({ data }));
  const upload = (name: string, body: Buffer, type = 'application/pdf') => api(`/onboarding/documents?kind=incident_policy&filename=${encodeURIComponent(name)}`, token, { method: 'POST', headers: { 'Content-Type': type }, body });

  // Upload
  check((await api('/onboarding/documents?kind=incident_policy&filename=p.pdf', null, { method: 'POST', headers: { 'Content-Type': 'application/pdf' }, body: PDF })).status === 401, 'an upload without a sign-in is refused with 401');
  check((await upload('fake.pdf', Buffer.from('not a pdf'))).status === 400, 'a file that is not really a PDF is refused');
  check((await upload('malware.exe', PDF, 'application/octet-stream')).status === 400, 'a file of another type is refused');
  const up = await upload('Incident Policy.pdf', PDF);
  check(up.status === 201 && up.body?.document?.filename === 'Incident Policy.pdf', 'a real PDF uploads in one signed-in request', `status ${up.status}`);
  const onb = await api('/onboarding', token);
  check(onb.body?.policyDocument?.filename === 'Incident Policy.pdf', 'the page can show the uploaded document again after a refresh');

  // Details, then the declaration
  const name = String(listing.name);
  await step('org', { legalEntityName: name, abn: listing.abn, tradingName: '' });
  await step('insurance', { registrationGroups: [listing.supportCategories[0]] });
  const future = new Date(Date.now() + 200 * 86_400_000).toISOString().slice(0, 10);
  const decl = { registrationStatus: 'registered', insuranceHeld: true, insuranceExpiry: future, workerScreening: true, codeOfConduct: true, truthful: true };
  check((await step('declaration', { ...decl, truthful: false })).status === 400, 'the declaration is refused until every statement is ticked');
  check((await step('declaration', { ...decl, insuranceExpiry: '2020-01-01' })).status === 400, 'insurance that has already expired is refused');
  const done = await step('declaration', decl);
  check(done.status === 200 && done.body?.verification?.status === 'checked', 'a matching ABN, policy, insurance and declaration are all checked', JSON.stringify(done.body?.verification?.checks?.filter((c: any) => c.result !== 'pass')));
  const passedMails = async () => EmailLog.countDocuments({ to: owner.email, subject: /confirmed/i });
  check((await passedMails()) === 1, 'the provider is emailed once that everything is confirmed');
  await step('team', { rosterSize: 3, afterHoursCover: 'On call' });
  check((await passedMails()) === 1, 'saving again with the same result sends no second email');

  // Something wrong
  await step('org', { legalEntityName: name, abn: '12345678901', tradingName: '' });
  const bad = (await api('/onboarding', token)).body?.verification;
  check(bad?.status === 'needs_attention' && bad.checks.some((c: any) => c.key === 'abn' && c.result === 'fail' && c.fixStep === 'org'), 'a wrong ABN is reported as something to fix, pointing at the right step');
  check((await EmailLog.countDocuments({ to: owner.email, subject: /Action needed/i })) === 1, 'the provider is emailed what to fix, with a link for each point');
  await step('org', { legalEntityName: name, abn: listing.abn, tradingName: '' });
  check((await api('/onboarding', token)).body?.verification?.status === 'checked', 'fixing the ABN brings the result back to checked');

  // A provider who says they are registered under an ABN the register does not show: a note for the team, not a failure
  const noMatch = await step('declaration', decl).then(async () => {
    await step('org', { legalEntityName: 'Zzyzx Unlisted Services', abn: '51824753556', tradingName: '' });
    return (await api('/onboarding', token)).body?.verification;
  });
  check(noMatch?.status === 'in_review' && noMatch.checks.some((c: any) => c.key === 'register' && c.result === 'warn'), 'an organisation not found on the register is "in review", never a failure');

  // Administrator
  check((await api(`/admin/providers/${providerId}/checks/run`, token, json({}))).status === 403, 'a provider cannot use the administrator checks route');
  const doc = await api(`/admin/providers/${providerId}/documents/incident_policy`, adminToken);
  check(doc.status === 200 && String(doc.headers.get('content-type')).includes('pdf') && /Incident Policy\.pdf/.test(String(doc.headers.get('content-disposition'))), 'an administrator can open the uploaded policy');
  check((await api(`/admin/providers/${providerId}/documents/incident_policy`, token)).status === 403, 'a provider cannot open documents through the administrator route');
  check((await api(`/admin/providers/${providerId}/checks/run`, adminToken, json({}))).status === 200, 'an administrator can run the checks again');
  const approved = await api(`/admin/providers/${providerId}/checks/approve`, adminToken, json({ note: 'Confirmed by phone' }));
  check(approved.status === 200 && (await api('/onboarding', token)).body?.verification?.status === 'checked', 'an administrator can approve a point that was in review');
  await step('org', { legalEntityName: 'Zzyzx Unlisted Services', abn: '12345678901', tradingName: '' });
  const refuse = await api(`/admin/providers/${providerId}/checks/approve`, adminToken, json({}));
  check(refuse.status === 400, 'an administrator cannot approve while the provider still has something to fix');

  // Remove
  check((await api('/onboarding/documents/incident_policy', token, { method: 'DELETE' })).body?.removed === true, 'the provider can remove their document');
  check((await api('/onboarding', token)).body?.policyDocument === null, 'the removed document no longer shows');

  console.log(failures ? `\n${failures} check(s) FAILED.` : '\nAll checks passed.');
  process.exit(failures ? 1 : 0);
}

main().catch((err) => { console.error('[test-provider-onboarding] Fatal error:', err); process.exit(1); });
