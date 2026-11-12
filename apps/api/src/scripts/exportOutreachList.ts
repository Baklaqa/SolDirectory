import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import RegisterListing from '../models/RegisterListing.js';
import User from '../models/User.js';
import Provider from '../models/Provider.js';

/**
 * Exports a CSV of businesses from the public NDIS Commission and My Aged Care registers that SolDirectory can invite to join, ready to import
 * into an email tool such as Mailchimp:
 *
 *   npm run export:outreach -w apps/api -- [--count] [--include-unverified] [--type ndis|aged_care] [--state VIC] [--out file.csv]
 *
 * Who is included, and why (the same rules the site's own "someone nearby is looking for support" notices follow):
 *   - the business has not joined or asked to claim its listing (nobody who is already a member is told to "join");
 *   - it has not opted out (the unsubscribe link in earlier notices, or importOutreachOptOuts.ts); an opt-out is permanent;
 *   - it has a contact email that was found on the business's OWN website and matches that website's domain (contactVerified). This is the
 *     publicly published business address the Spam Act's "conspicuously published" exemption is about. --include-unverified widens it to every
 *     email on file; read the note printed at the end before using that;
 *   - one row per email address, whatever number of listings share it; and never an address that already belongs to a SolDirectory account.
 * Nothing here is sent: it only writes a file. The file holds business contact details, so it is written to apps/api/exports (not committed)
 * and should be deleted once the campaign has been loaded.
 */
const arg = (name: string): string | undefined => { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const flag = (name: string) => process.argv.includes(`--${name}`);

const EMAIL = /^[^\s@,;"<>]+@[^\s@,;"<>]+\.[^\s@,;"<>]{2,}$/;
const REGISTER_LABEL: Record<string, string> = { ndis: 'NDIS', aged_care: 'Aged care' };
/** Spreadsheet programs run a cell that starts with = + - or @ as a formula; a leading apostrophe keeps a business name as text. */
const cell = (value: unknown): string => {
  let text = String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
  if (/^[=+\-@\t]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const type = arg('type');
  const state = arg('state')?.toUpperCase();
  const includeUnverified = flag('include-unverified');

  const total = await RegisterListing.countDocuments();
  const filter: Record<string, unknown> = {
    claimStatus: 'unclaimed',
    emailOptOut: { $ne: true },
    email: { $exists: true, $ne: '' },
    ...(includeUnverified ? {} : { contactVerified: true }),
    ...(type ? { type } : {}),
    ...(state ? { states: state } : {}),
  };
  const listings = await RegisterListing.find(filter).select('type name email states areas website supportCategories contactVerified').sort({ nameLower: 1 }).lean();

  // Addresses that already belong to a SolDirectory account are never "invited to join".
  const [userEmails, providerEmails] = await Promise.all([
    User.find({ email: { $exists: true } }).distinct('email'),
    Provider.find({ intakeEmail: { $exists: true } }).distinct('intakeEmail'),
  ]);
  const members = new Set([...userEmails, ...providerEmails].map((e) => String(e).trim().toLowerCase()));

  const seen = new Map<string, string[]>();
  const dropped = { badFormat: 0, member: 0, duplicate: 0 };
  for (const l of listings) {
    const email = String(l.email ?? '').trim().toLowerCase();
    if (!EMAIL.test(email)) { dropped.badFormat += 1; continue; }
    if (members.has(email)) { dropped.member += 1; continue; }
    if (seen.has(email)) { dropped.duplicate += 1; continue; }
    const mainState = (l.states ?? [])[0] ?? '';
    const suburb = (l.areas ?? []).find((a) => a.state === mainState)?.suburb ?? (l.areas ?? [])[0]?.suburb ?? '';
    seen.set(email, [email, l.name, REGISTER_LABEL[l.type] ?? l.type, mainState, suburb, (l.supportCategories ?? []).slice(0, 4).join('; '), l.website ?? '', l.contactVerified ? 'verified' : 'unverified']);
  }

  console.log(`Register listings in the database: ${total.toLocaleString('en-AU')}`);
  console.log(`Match the rules${type ? ` (${type})` : ''}${state ? ` (${state})` : ''}: ${listings.length.toLocaleString('en-AU')} listings`);
  console.log(`Left out: ${dropped.member} already have a SolDirectory account, ${dropped.badFormat} with a malformed address, ${dropped.duplicate} sharing an address already listed`);
  console.log(`Unique email addresses to contact: ${seen.size.toLocaleString('en-AU')}`);
  if (flag('count')) { await mongoose.disconnect(); return; }

  const header = ['Email Address', 'Business Name', 'Register', 'State', 'Suburb', 'Support categories', 'Website', 'Email check'];
  const lines = [header.map(cell).join(','), ...[...seen.values()].map((row) => row.map(cell).join(','))];
  const stamp = new Date().toISOString().slice(0, 10);
  const out = path.resolve(arg('out') ?? path.join(process.cwd(), 'exports', `outreach-${includeUnverified ? 'all' : 'verified'}-${stamp}.csv`));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `﻿${lines.join('\r\n')}\r\n`, 'utf8'); // BOM so Excel and Mailchimp read accented names correctly
  console.log(`Written: ${out}`);
  if (includeUnverified) {
    console.log("NOTE: --include-unverified adds addresses that were not matched to the business's own website domain (for example personal mailboxes of sole traders).");
    console.log('      The Spam Act allows unsolicited business messages only to addresses the business has conspicuously published for that purpose; check each batch.');
  }
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
