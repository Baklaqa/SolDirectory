import 'dotenv/config';
import { runJob } from '../services/jobRunner.js';
import RegisterListing from '../models/RegisterListing.js';
import { EmailService } from '../services/email.service.js';

/**
 * The register data should be refreshed every week; the pages themselves promise at least a monthly re-import (REGISTER_CORRECTION in
 * packages/topic-content), so that sentence stays true even if a week is missed. This job runs every Monday and emails the admin when the
 * newest import of a register is older than REGISTER_MAX_AGE_DAYS (default 8: a week and a day), so a missed import is noticed straight
 * away. The import itself is still run by hand from a downloaded export (see REGISTER_IMPORT.md); this job only notices when it is late.
 */
const MAX_AGE_DAYS = Number(process.env.REGISTER_MAX_AGE_DAYS) || 8;

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
      `<p>The register data should be refreshed every week (the pages promise at least every month), and it is now older than ${MAX_AGE_DAYS} days:</p><ul>${stale.map((s) => `<li>${s}</li>`).join('')}</ul>` +
        '<p>Download the latest export, run importRegisterListings.ts with --prune, then run applyRegisterActions.ts with the latest NDIS Commission compliance actions list. When the import finishes, n8n is told so the stale-content check runs.</p>',
    );
  }
  return `${lines.join('; ')}${stale.length ? ' (admin emailed)' : ''}`;
}

void runJob('register-freshness', main);
