/**
 * Tells the n8n automation that something happened on this side, so it can start its own work straight away instead of waiting for a timer.
 *
 * Today that is one event: a register import has finished. n8n's workflow for it then runs the stale-content check
 * (POST /api/automation/stale-check) so pages built on the old register data are looked at again.
 *
 * Off unless both N8N_REGISTER_IMPORT_WEBHOOK_URL and N8N_WEBHOOK_TOKEN are set. The token is sent as a Bearer token and is never logged.
 * A failure here must never fail the thing that called it (the import has already finished), so this returns a result and does not throw.
 */
export interface WebhookResult {
  sent: boolean;
  /** Why nothing was sent, or what went wrong. Never contains the token. */
  reason?: string;
  status?: number;
}

const TIMEOUT_MS = 15_000;

async function post(url: string, token: string, body: unknown): Promise<WebhookResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return res.ok ? { sent: true, status: res.status } : { sent: false, status: res.status, reason: `n8n answered ${res.status}` };
  } catch (err) {
    return { sent: false, reason: (err as Error).name === 'AbortError' ? `no answer within ${TIMEOUT_MS / 1000}s` : (err as Error).message };
  } finally {
    clearTimeout(timer);
  }
}

/** Called after a register import has been written. One retry, because n8n Cloud occasionally answers 5xx while a workflow is saved. */
export async function notifyRegisterImportCompleted(opts: { reason?: string } = {}): Promise<WebhookResult> {
  const url = (process.env.N8N_REGISTER_IMPORT_WEBHOOK_URL ?? '').trim();
  const token = (process.env.N8N_WEBHOOK_TOKEN ?? '').trim();
  if (!url || !token) return { sent: false, reason: 'N8N_REGISTER_IMPORT_WEBHOOK_URL / N8N_WEBHOOK_TOKEN not set' };
  if (!/^https:\/\//i.test(url) && !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/)/i.test(url)) return { sent: false, reason: 'N8N_REGISTER_IMPORT_WEBHOOK_URL must be an https address' };

  const limit = Math.min(Math.max(Number(process.env.N8N_STALE_CHECK_LIMIT) || 500, 1), 5000);
  const body = { limit, reason: opts.reason ?? 'register import completed' };

  let result = await post(url, token, body);
  if (!result.sent && (!result.status || result.status >= 500)) {
    await new Promise((r) => setTimeout(r, 3000));
    result = await post(url, token, body);
  }
  return result;
}
