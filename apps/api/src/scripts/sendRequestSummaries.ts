/**
 * The weekly "Where your requests stand" job. Run it once a day (it only sends to a person once a week) or weekly:
 *   - one email per person with every request of theirs that is still open, how many providers have looked at each and how
 *     many have taken it up, and a one-click link to their requests page;
 *   - first summary a week after the first request, then weekly, up to 8, never in a week they already had a
 *     "your matches" reminder, and never after they stop the emails.
 * Safe to run twice: the week is claimed before sending.
 *
 * Usage:
 *   npm run job:request-summaries -w apps/api
 *   npm run job:request-summaries -w apps/api -- --dry-run     (lists who would be emailed, sends nothing)
 */
import 'dotenv/config';
import { sendWeeklyRequestSummaries } from '../services/requestSummary.service.js';
import { runJob } from '../services/jobRunner.js';

const dryRun = process.argv.includes('--dry-run');

void runJob('request-summaries', async () => {
  const r = await sendWeeklyRequestSummaries({ dryRun });
  if (dryRun) {
    for (const p of r.previews ?? []) console.log(`would send "${p.subject}" to ${p.to}: ${p.rows.map((x) => `${x.label} - ${x.status}`).join(' | ')}`);
  }
  const skipped = Object.entries(r.skipped).map(([why, n]) => `${n} ${why}`).join(', ');
  return `${dryRun ? 'Dry run: ' : ''}${r.people} people with open requests (${r.requests} requests): ${dryRun ? `${r.previews?.length ?? 0} would be emailed` : `${r.sent} emailed`}${skipped ? `; skipped ${skipped}` : ''}.`;
});
