import 'dotenv/config';
import fs from 'node:fs';
import mongoose from 'mongoose';
import RegisterListing from '../models/RegisterListing.js';

/**
 * Brings people who unsubscribed (or whose address bounced) in the email tool back into the database, so SolDirectory never emails them again:
 *
 *   npm run import:outreach-optouts -w apps/api -- <file.csv> [--dry-run]
 *
 * In Mailchimp: Audience > All contacts > the "Unsubscribed" and "Cleaned" segments > Export. Any CSV with an "Email Address" (or "Email") column works.
 * Every register listing with that address is marked emailOptOut, which the export script and the site's own notices both respect permanently.
 * Run it before every new campaign.
 */
const file = process.argv[2];
if (!file || file.startsWith('--')) { console.error('Usage: npm run import:outreach-optouts -w apps/api -- <file.csv> [--dry-run]'); process.exit(1); }
const dryRun = process.argv.includes('--dry-run');

/** A small CSV reader: quoted fields, doubled quotes inside them, and line breaks inside quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; } else if (ch === '"') quoted = false; else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

async function main() {
  const rows = parseCsv(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
  const header = (rows.shift() ?? []).map((h) => h.trim().toLowerCase());
  const col = header.findIndex((h) => h === 'email address' || h === 'email');
  if (col < 0) { console.error(`No "Email Address" column found. Columns: ${header.join(', ')}`); process.exit(1); }
  const emails = [...new Set(rows.map((r) => (r[col] ?? '').trim().toLowerCase()).filter((e) => e.includes('@')))];
  await mongoose.connect(process.env.MONGODB_URI as string);
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let matched = 0;
  let changed = 0;
  for (let i = 0; i < emails.length; i += 200) {
    const batch = emails.slice(i, i + 200);
    const filter = { email: { $in: batch.map((e) => new RegExp(`^${escape(e)}$`, 'i')) } };
    matched += await RegisterListing.countDocuments(filter);
    if (!dryRun) changed += (await RegisterListing.updateMany({ ...filter, emailOptOut: { $ne: true } }, { $set: { emailOptOut: true } })).modifiedCount;
  }
  console.log(`${emails.length} addresses in the file; ${matched} register listings use one of them; ${dryRun ? 'dry run, nothing changed' : `${changed} newly marked as opted out`}.`);
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
