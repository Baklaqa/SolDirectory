import 'dotenv/config';
import { runJob } from '../services/jobRunner.js';
import Lead from '../models/Lead.js';

/**
 * The privacy policy (section 2.11) says submitted requests are kept while open and de-identified 12 months after they
 * close. This clears the name, email, phone, free-text notes and map point of closed requests untouched for 12 months.
 * The record that consent was given and the log of who viewed the request are kept (they are retained for 7 years).
 */
const MONTHS = Math.max(1, Number(process.env.REQUEST_DEIDENTIFY_AFTER_MONTHS) || 12);

async function main(): Promise<string> {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - MONTHS);
  const result = await Lead.updateMany(
    { status: 'closed', updatedAt: { $lt: cutoff }, erasedAt: { $exists: false } },
    {
      $set: { requesterName: '', requesterEmail: '', contactName: '', contactPhone: '', note: '', requesterUserId: null, emailOptOut: true, erasedAt: new Date() },
      $unset: { location: '' },
    },
  );
  return `De-identified ${result.modifiedCount} request(s) closed more than ${MONTHS} months ago.`;
}

void runJob('request-deidentify', main);
