import type { NextFunction, Request, Response } from 'express';

/**
 * Response headers every page and API answer carries. They are set here, in the app, so they travel with a normal deploy and
 * cover everything the API serves (every indexable page's crawler HTML included) without an nginx change.
 *
 *  - Strict-Transport-Security: only on HTTPS requests (nginx passes X-Forwarded-Proto) and without includeSubDomains,
 *    because other subdomains of the parent domain are not ours to commit to HTTPS.
 *  - X-Content-Type-Options / Referrer-Policy / X-Frame-Options: low-risk hardening; the site does not embed itself or others.
 *
 * A Content-Security-Policy is deliberately not set: pages embed WordPress content and inline styles, and an enforced policy
 * written without a report period would break them. Add one as Report-Only first.
 */
const HSTS_SECONDS = 15552000; // 180 days

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  const proto = (req.get('x-forwarded-proto') || req.protocol).split(',')[0].trim();
  if (proto === 'https') res.setHeader('Strict-Transport-Security', `max-age=${HSTS_SECONDS}`);
  next();
}
