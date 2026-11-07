import type { Request, RequestHandler } from 'express';

/**
 * A small in-memory rate limiter for the public endpoints that cost something when abused: sign-in (password guessing), sign-up,
 * "forgot password", the contact form, requests for support and search alerts (each of these can send an email to an address the
 * caller chooses). One API process serves the site, so counting in memory is enough; the counts reset when the process restarts.
 * The visitor's address is taken from X-Forwarded-For (app.set('trust proxy', 1) in index.ts).
 *
 * `key` can add something besides the address, such as the email being signed in to, so a guesser spread over many addresses is
 * still held to a few tries per account.
 */
interface Options {
  /** Name of the group, shown nowhere: it only keeps counts of different endpoints apart. */
  name: string;
  windowMs: number;
  max: number;
  /** What else besides the address identifies "one caller"; return nothing to count by address alone. */
  key?: (req: Request) => string | undefined;
  message?: string;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

// Forget old windows so the map cannot grow without limit.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}, 60_000).unref();

export function rateLimit(opts: Options): RequestHandler {
  return (req, res, next) => {
    if (process.env.RATE_LIMIT_OFF === 'true') return next(); // for automated tests against a throwaway database only
    const extra = opts.key?.(req);
    const id = `${opts.name}|${req.ip ?? 'unknown'}${extra ? `|${extra.slice(0, 120).toLowerCase()}` : ''}`;
    const now = Date.now();
    let bucket = buckets.get(id);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + opts.windowMs };
      buckets.set(id, bucket);
    }
    bucket.count += 1;
    if (bucket.count > opts.max) {
      const wait = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.set('Retry-After', String(wait));
      res.status(429).json({ error: opts.message ?? `Too many attempts. Please wait ${wait > 90 ? `${Math.ceil(wait / 60)} minutes` : `${wait} seconds`} and try again.` });
      return;
    }
    next();
  };
}

const MIN = 60_000;
const HOUR = 60 * MIN;
/** The email in a JSON body, when it is text (anything else is rejected by the handler itself). */
const bodyEmail = (req: Request): string | undefined => (typeof req.body?.email === 'string' ? req.body.email : undefined);

export const limits = {
  login: [rateLimit({ name: 'login-ip', windowMs: 15 * MIN, max: 30 }), rateLimit({ name: 'login-account', windowMs: 15 * MIN, max: 8, key: bodyEmail })],
  signup: rateLimit({ name: 'signup', windowMs: HOUR, max: 10 }),
  forgotPassword: [rateLimit({ name: 'forgot-ip', windowMs: HOUR, max: 10 }), rateLimit({ name: 'forgot-account', windowMs: HOUR, max: 3, key: bodyEmail })],
  resetPassword: rateLimit({ name: 'reset', windowMs: HOUR, max: 10 }),
  twoFactor: rateLimit({ name: '2fa', windowMs: 15 * MIN, max: 10 }),
  contact: rateLimit({ name: 'contact', windowMs: HOUR, max: 5 }),
  matchRequest: rateLimit({ name: 'match-request', windowMs: HOUR, max: 15 }),
  matchDraft: rateLimit({ name: 'match-draft', windowMs: HOUR, max: 90 }),
  searchAlert: rateLimit({ name: 'search-alert', windowMs: HOUR, max: 8 }),
  requestChange: rateLimit({ name: 'request-change', windowMs: HOUR, max: 40 }),
  token: rateLimit({ name: 'token', windowMs: HOUR, max: 40 }),
};
