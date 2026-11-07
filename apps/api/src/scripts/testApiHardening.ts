/**
 * Checks, against a RUNNING API (use a throwaway database), that hostile input cannot take the API down or reach a database query:
 *   npx tsx src/scripts/testApiHardening.ts --base http://localhost:4000
 * It sends a few deliberately bad requests, so keep it away from production. The rate-limit check makes about ten failed sign-in attempts for
 * one made-up address, which is why it must run on a server whose limiter is on (the default).
 */
const arg = (name: string): string | undefined => { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const base = (arg('base') ?? 'http://localhost:4000').replace(/\/$/, '');
let failures = 0;
const check = (ok: boolean, label: string, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok || !detail ? '' : `: ${detail}`}`); if (!ok) failures += 1; };

async function post(path: string, body: unknown, raw = false): Promise<{ status: number; text: string }> {
  const res = await fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: raw ? String(body) : JSON.stringify(body) });
  return { status: res.status, text: await res.text() };
}
async function alive(): Promise<boolean> {
  try { return (await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(5000) })).ok; } catch { return false; }
}

async function main() {
  check(await alive(), 'the API is running');

  // A sign-in whose fields are not text used to end the whole API process.
  for (const body of [{ email: { $gt: '' }, password: 'x' }, { email: ['a@b.co'], password: 'x' }, { email: 'a@b.co', password: { a: 1 } }, null, []]) {
    const r = await post('/api/auth/login', body);
    check(r.status === 400 && (await alive()), `login with ${JSON.stringify(body)} is a clean 400 and the API stays up`, `${r.status} ${r.text.slice(0, 80)}`);
  }
  const signup = await post('/api/auth/signup', { name: { x: 1 }, email: 'a@b.co', mobile: '0400000000', password: 'password123', role: 'worker' });
  check(signup.status === 400 && (await alive()), 'sign-up with a non-text name is a clean 400');
  const reset = await post('/api/auth/reset-password', { email: 'a@b.co', token: 'x', newPassword: { length: 99 } });
  check(reset.status === 400 && (await alive()), 'reset-password with a non-text password is a clean 400');
  const bad = await post('/api/auth/login', '{bad json', true);
  check(bad.status === 400 && !/at .*:\d+:\d+/.test(bad.text), 'broken JSON is a clean 400 without a stack trace');

  // The wizard's draft id must be a real id; an operator object must never select somebody else's draft.
  const draft = await post('/api/match-requests/draft', { draftId: { $ne: null }, suburb: 'Hardening Test', careFor: { a: 1 }, name: ['x'] });
  const draftId = (() => { try { return JSON.parse(draft.text).draftId as string; } catch { return ''; } })();
  check(draft.status === 200 && /^[a-f0-9]{24}$/.test(draftId), 'a draft saved with odd fields still works and gets its own new id', `${draft.status} ${draft.text.slice(0, 100)}`);
  const submit = await post('/api/match-requests', { draftId: { $ne: null }, location: { a: 1 }, careFor: 'Myself', timeframe: 'Soon', funding: 'NDIS', email: ['x@y.co'], name: 'T' });
  check(submit.status === 400 && (await alive()), 'a request with a non-text location is a clean 400');

  // WordPress must not be readable through the proxy beyond the site's own content.
  const users = await fetch(`${base}/api/wp/rest/wp-json/wp/v2/users`);
  check(users.status === 404, 'the WordPress /users list (author login names) is not served through the proxy', String(users.status));
  const gql = await post('/api/wp/graphql', { query: '{ users { nodes { name } } }' });
  check(gql.status === 401, 'the GraphQL proxy needs an administrator sign-in', String(gql.status));

  // The limiter: the ninth wrong password for one address in 15 minutes is refused.
  const email = `ratelimit-${Date.now()}@example.invalid`;
  let limited = 0;
  for (let i = 0; i < 12; i++) if ((await post('/api/auth/login', { email, password: 'wrong-password-1' })).status === 429) limited += 1;
  check(limited >= 3, 'repeated wrong sign-ins for one address are rate limited (429)', `${limited} refused of 12`);
  check(await alive(), 'the API is still running at the end');

  console.log(failures ? `\n${failures} check(s) FAILED.` : '\nAll checks passed.');
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
