import 'dotenv/config';

/**
 * End-to-end check of the lead unlock rules against a RUNNING API and the demo accounts from `npm run db:seed:admin`
 * (password "password123", the demo password that seed script documents). Use a throwaway database, never production:
 *
 *   npx tsx src/scripts/testLeadUnlockFlow.ts --base http://localhost:4000
 *
 * It checks that contact details stay hidden until unlock, that three providers can unlock a request and the fourth is refused with
 * LEAD_FULL, that unlocking again is idempotent and uses no extra quota, that the Idempotency-Key header is required, and that a
 * provider on the free plan is told to choose a plan. Exits 1 if anything is wrong.
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
  const res = await fetch(`${base}/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body: body as any };
}

async function main() {
  const { connectDB } = await import('../config/db.js');
  const { default: User } = await import('../models/User.js');
  const { default: Provider } = await import('../models/Provider.js');
  const { default: Lead } = await import('../models/Lead.js');
  const { default: UnlockLedger } = await import('../models/UnlockLedger.js');
  await connectDB();

  const accounts: { email: string; plan: string; providerId: unknown }[] = [];
  for (const user of await User.find({ role: 'provider', email: /\.demo\.\d+@example\.com\.au$/ }).lean()) {
    const provider: any = user.providerId ? await Provider.findById(user.providerId).lean() : null;
    if (provider && provider.accountStatus === 'active') accounts.push({ email: user.email, plan: provider.plan, providerId: provider._id });
  }
  const paid = accounts.filter((a) => a.plan !== 'starter').slice(0, 4);
  const free = accounts.find((a) => a.plan === 'starter');
  if (paid.length < 4 || !free) { console.error('Need at least 4 paid and 1 free demo providers. Run npm run db:seed:admin on a throwaway database first.'); process.exit(1); }

  // A request nobody has unlocked yet.
  let lead: any = null;
  for (const l of await Lead.find({ status: { $ne: 'closed' } }).limit(200).lean()) {
    if ((await UnlockLedger.countDocuments({ leadId: l._id })) === 0) { lead = l; break; }
  }
  if (!lead) { console.error('No open, unlocked lead found.'); process.exit(1); }
  const leadId = String(lead._id);

  const tokens: string[] = [];
  for (const a of [...paid, free]) {
    const r = await api('/auth/login', null, { method: 'POST', body: JSON.stringify({ email: a.email, password: 'password123' }) });
    if (r.status !== 200) { console.error(`Login failed for a demo provider (${r.status}).`); process.exit(1); }
    tokens.push(r.body.token);
  }
  const quotaOf = async (providerId: unknown) => ((await Provider.findById(providerId as never).lean()) as any)?.leadUnlocksUsedThisPeriod ?? 0;

  // Contact details are hidden before unlock.
  const before = await api(`/leads/${leadId}`, tokens[0]);
  const name = String(lead.contactName ?? lead.requesterName ?? '');
  const phone = String(lead.contactPhone ?? '');
  const hasContact = (body: unknown) => {
    const text = JSON.stringify(body);
    return (!!phone && text.includes(phone)) || (!!name && text.includes(name));
  };
  const hidden = before.status === 200 && !hasContact(before.body) && !JSON.stringify(before.body).includes(String(lead.requesterEmail ?? '@@none@@'));
  check(hidden, 'contact details are not in the lead detail before unlock', `status ${before.status}`);

  // The header is required.
  const noKey = await api(`/leads/${leadId}/unlock`, tokens[0], { method: 'POST' });
  check(noKey.status === 400, 'unlock without an Idempotency-Key is refused', `got ${noKey.status}`);

  // Three providers can unlock.
  const quotaBefore = await quotaOf(paid[0].providerId);
  for (let i = 0; i < 3; i += 1) {
    const r = await api(`/leads/${leadId}/unlock`, tokens[i], { method: 'POST', headers: { 'Idempotency-Key': `gap-test-${leadId}-${i}` } });
    check(r.status === 200, `provider ${i + 1} can unlock`, `got ${r.status} ${JSON.stringify(r.body).slice(0, 120)}`);
  }
  check((await quotaOf(paid[0].providerId)) === quotaBefore + 1, 'one unlock used exactly one of the monthly unlocks');

  // The contact details are there after unlock.
  const after = await api(`/leads/${leadId}`, tokens[0]);
  check(after.status === 200 && hasContact(after.body), 'contact details are visible after unlock', `status ${after.status}`);

  // Unlocking again is idempotent and free.
  const again = await api(`/leads/${leadId}/unlock`, tokens[0], { method: 'POST', headers: { 'Idempotency-Key': `gap-test-again-${leadId}` } });
  check(again.status === 200 && (await quotaOf(paid[0].providerId)) === quotaBefore + 1, 'unlocking the same request again returns it and uses no extra unlock');

  // The fourth is refused, and uses no quota.
  const q4 = await quotaOf(paid[3].providerId);
  const fourth = await api(`/leads/${leadId}/unlock`, tokens[3], { method: 'POST', headers: { 'Idempotency-Key': `gap-test-${leadId}-3` } });
  check(fourth.status === 409 && fourth.body?.code === 'LEAD_FULL', 'the fourth provider is refused with LEAD_FULL', `got ${fourth.status} ${fourth.body?.code ?? ''}`);
  check((await quotaOf(paid[3].providerId)) === q4, 'the refused unlock used no quota');
  check((await UnlockLedger.countDocuments({ leadId: lead._id })) === 3, 'exactly 3 unlock records exist for the request');

  // The request screen (activity): full for an unlocking provider, no contact details and no other provider named for anyone else.
  const act = await api(`/leads/${leadId}/activity`, tokens[0]);
  const labels: string[] = (act.body?.events ?? []).map((e: { label: string }) => e.label);
  check(act.status === 200 && act.body?.state === 'filled' && act.body?.slots?.used === 3 && act.body?.slots?.youUnlocked === true, 'the request screen says the request is filled and that this provider unlocked it', JSON.stringify(act.body?.slots));
  check(labels.includes('Request filled') && labels[0] === 'Request came in', 'the history starts with the request and shows when it filled', labels.join(' | '));
  check(!paid.some((a) => JSON.stringify(act.body).includes(String(a.providerId))), 'the history does not name any provider');
  const outsider = await api(`/leads/${leadId}/activity`, tokens[3]);
  check(outsider.status === 404 || (!hasContact(outsider.body) && outsider.body?.state === 'filled'), 'a provider that did not unlock sees no contact details on the request screen', `got ${outsider.status}`);
  check((await api(`/leads/${leadId}/activity`, null)).status === 401, 'the request screen needs a login');

  // The free plan cannot unlock.
  let other: any = null;
  for (const l of await Lead.find({ status: { $ne: 'closed' }, _id: { $ne: lead._id } }).limit(200).lean()) {
    if ((await UnlockLedger.countDocuments({ leadId: l._id })) === 0) { other = l; break; }
  }
  if (other) {
    const r = await api(`/leads/${String(other._id)}/unlock`, tokens[4], { method: 'POST', headers: { 'Idempotency-Key': `gap-test-free-${String(other._id)}` } });
    check(r.status === 402 && r.body?.code === 'PLAN_REQUIRED', 'a provider on the free plan is told to choose a plan', `got ${r.status} ${r.body?.code ?? ''}`);
  }

  console.log(failures ? `\n${failures} check(s) FAILED.` : '\nAll checks passed.');
  process.exit(failures ? 1 : 0);
}

main().catch((err) => { console.error('[test-lead-unlock] Fatal error:', err); process.exit(1); });
