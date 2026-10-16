import 'dotenv/config';
import { runJob } from '../services/jobRunner.js';
import RegisterListing from '../models/RegisterListing.js';
import { EmailService } from '../services/email.service.js';

/**
 * The register pages promise a monthly re-import (REGISTER_CORRECTION in packages/topic-content). This job runs every day and emails
 * the admin when the newest import of a register is older than REGISTER_MAX_AGE_DAYS (default 35), so a missed import is noticed
 * before the "data as at" date on the pages looks stale.
 */
const MAX_AGE_DAYS = Number(process.env.REGISTER_MAX_AGE_DAYS) || 35;

async function main(): Promise<string> {
  const stale: string[] = [];
  const lines: string[] = [];
  for (const type of ['ndis', 'aged_care'] as const) {
    const latest = await RegisterListing.aggregate([
      { $match: { type } },
      { $group: { _id: null, at: { $max: { $ifNull: ['$lastSeenAt', '$importedAt'] } } } },
    ]);
    const at: Date | undefined = latest[0]?.at;
    if (!at) { lines.push(`${type}: nothing loaded`); continue; }
    const days = Math.floor((Date.now() - new Date(at).getTime()) / 86_400_000);
    lines.push(`${type}: last imported ${days} day(s) ago`);
    if (days > MAX_AGE_DAYS) {
      stale.push(`${type === 'ndis' ? 'NDIS Commission register' : 'My Aged Care register'}: last imported ${days} days ago (${new Date(at).toISOString().slice(0, 10)})`);
    }
  }
  if (stale.length) {
    await EmailService.notifyAdmin(
      'Register data is out of date',
      `<p>The register pages say the data is re-imported every month, but:</p><ul>${stale.map((s) => `<li>${s}</li>`).join('')}</ul>` +
        '<p>Download the latest export, run importRegisterListings.ts with --prune, then run applyRegisterActions.ts with the latest NDIS Commission compliance actions list.</p>',
    );
  }
  return `${lines.join('; ')}${stale.length ? ' (admin emailed)' : ''}`;
}

void runJob('register-freshness', main);
