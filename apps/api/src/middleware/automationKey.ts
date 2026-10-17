import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/**
 * Guards /api/automation/*. The n8n workflow sends the key in the X-Automation-Key header (or as a Bearer token).
 * If AUTOMATION_API_KEY is not set on the server the API is switched off, never open.
 */
export function requireAutomationKey(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.AUTOMATION_API_KEY;
  if (!expected || expected.length < 24) {
    return res.status(503).json({ error: 'The automation API is switched off. Set AUTOMATION_API_KEY (24 or more characters) on the server.' });
  }
  const bearer = /^Bearer (.+)$/i.exec(req.header('authorization') ?? '')?.[1];
  const given = Buffer.from(String(req.header('x-automation-key') ?? bearer ?? ''));
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    return res.status(401).json({ error: 'Missing or wrong automation key.' });
  }
  next();
}
