import 'dotenv/config';
import { runJob } from '../services/jobRunner.js';
import Worker from '../models/Worker.js';
import { EmailService } from '../services/email.service.js';
import { siteOrigin } from '../services/emailTokens.js';

/**
 * Emails a worker once per check when it is within 30 days of expiring, so they can upload the renewed evidence. An expired
 * check stops counting toward "Checks sighted on" on its own (workersPublic.controller.ts sightedChecks).
 */
const WITHIN_DAYS = 30;

async function main(): Promise<string> {
  const horizon = new Date(Date.now() + WITHIN_DAYS * 86_400_000);
  const workers = await Worker.find({ 'clearances.expiry': { $gt: new Date(), $lte: horizon }, email: { $exists: true, $ne: '' } });
  let sent = 0;
  for (const worker of workers) {
    let changed = false;
    for (const c of worker.clearances) {
      if (!c.expiry || c.expiry <= new Date() || c.expiry > horizon) continue;
      if (c.reminderSentFor && c.reminderSentFor.getTime() === c.expiry.getTime()) continue;
      const ok = await EmailService.sendCheckExpiring(worker.email!, {
        firstName: worker.firstName, checkName: c.name, expiry: c.expiry, link: `${siteOrigin()}/dashboard`,
      });
      c.reminderSentFor = c.expiry;
      changed = true;
      if (ok) sent += 1;
    }
    if (changed) await worker.save();
  }
  return `Sent ${sent} check-expiry reminder(s) across ${workers.length} worker(s).`;
}

void runJob('check-expiry', main);
