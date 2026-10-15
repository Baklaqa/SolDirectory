import 'dotenv/config';
import { runJob } from '../services/jobRunner.js';
import Lead from '../models/Lead.js';
import { EmailService } from '../services/email.service.js';
import { trackUrl } from '../services/requestTracking.js';

/**
 * The "did you find the support you needed?" email: sent once, 7 days after a request, to people who have not said what
 * happened. Each answer is one tap; it lands on the tracker, which records it (requests.controller.ts setRequestOutcome).
 */
const AFTER_DAYS = Math.max(1, Number(process.env.OUTCOME_CHECK_AFTER_DAYS) || 7);
const GIVE_UP_DAYS = 30;
const PER_RUN = 200;

async function main(): Promise<string> {
  const now = Date.now();
  const leads = await Lead.find({
    status: { $in: ['matched', 'unlocked'] },
    createdAt: { $lte: new Date(now - AFTER_DAYS * 86_400_000), $gte: new Date(now - GIVE_UP_DAYS * 86_400_000) },
    outcome: { $exists: false },
    outcomeCheckSentAt: { $exists: false },
    emailOptOut: { $ne: true },
    requesterEmail: { $regex: /@/ },
  }).limit(PER_RUN);

  let sent = 0;
  for (const lead of leads) {
    const base = trackUrl(String(lead._id));
    const link = (v: string) => `${base}${base.includes('?') ? '&' : '?'}outcome=${v}`;
    const ok = await EmailService.sendOutcomeCheck(lead.requesterEmail, {
      need: lead.need,
      started: link('started'),
      looking: link('looking'),
      notNeeded: link('not_needed'),
    });
    // Marked either way so a failing address is not retried every day.
    await Lead.updateOne({ _id: lead._id }, { $set: { outcomeCheckSentAt: new Date() } });
    if (ok) sent += 1;
  }
  return `Sent ${sent} outcome check email(s); looked at ${leads.length} request(s).`;
}

void runJob('outcome-check', main);
