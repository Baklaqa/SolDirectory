import type { Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage.js';
import { EmailService } from '../services/email.service.js';
import { BUSINESS } from '../config/business.js';

const I_AM = ['participant or family', 'provider', 'worker', 'other'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A small in-memory limit per address: enough to stop a script, with no new infrastructure.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function limited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) { hits.set(key, recent); return true; }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

/** POST /api/contact — the Contact page form. Public. */
export async function submitContactMessage(req: Request, res: Response) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const phone = str(body.phone, 40);
  const iAm = str(body.iAm, 60).toLowerCase();
  const message = str(body.message, 4000);
  // A hidden field real people never fill in.
  if (str(body.website, 100)) return res.status(201).json({ received: true });

  if (!name) return res.status(400).json({ error: 'Please enter your name.' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (!message) return res.status(400).json({ error: 'Please tell us how we can help.' });
  if (limited(req.ip || 'unknown')) return res.status(429).json({ error: 'You have sent a few messages already. Please call us on ' + BUSINESS.phone + '.' });

  await ContactMessage.create({ name, email, phone: phone || undefined, iAm: I_AM.includes(iAm) ? iAm : 'other', message, ip: req.ip });
  EmailService.sendAdminNotification(
    BUSINESS.email,
    `Contact form: ${name}`,
    `${name} (${email}${phone ? `, ${phone}` : ''}) — ${iAm || 'other'}\n\n${message}`,
  ).catch(() => {});
  res.status(201).json({ received: true });
}
