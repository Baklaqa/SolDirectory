import 'dotenv/config';
import fs from 'fs';

/**
 * Checks the register listings against the NDIS Commission's published compliance actions (banning orders, revoked or
 * suspended registrations), so a provider that has been banned or lost its registration is not shown as registered.
 *
 * Staff save the current list from the NDIS Commission website as a CSV with a header row and at least one of the columns
 * `abn` and `name` (an `action` column is optional and is kept as the note). Then:
 *
 *   npx tsx src/scripts/applyRegisterActions.ts actions-2026-11.csv            # report only (default)
 *   npx tsx src/scripts/applyRegisterActions.ts actions-2026-11.csv --apply    # remove the ABN matches
 *   npx tsx src/scripts/applyRegisterActions.ts actions-2026-11.csv --apply --include-name-matches
 *
 * An ABN match is certain, so it is removed with --apply. A match on name alone could be a different business with a similar
 * name, so it is only listed unless --include-name-matches is given. A claimed listing is never deleted: it is reported for review.
 * Removed listings are recorded, so the next register import does not bring them back.
 */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const input = text.replace(/^﻿/, '');
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && input[i + 1] === '\n') i += 1;
      row.push(cell);
      cell = '';
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    if (row.some((c) => c.trim())) rows.push(row);
  }
  const head = (rows.shift() ?? []).map((h) => h.trim().toLowerCase());
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

const nameKey = (s: string) =>
  s.toLowerCase().replace(/\b(pty|ltd|limited|the|and|trust)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function main() {
  const file = process.argv.slice(2).find((a) => !a.startsWith('--'));
  const apply = process.argv.includes('--apply');
  const includeNames = process.argv.includes('--include-name-matches');
  if (!file) {
    console.error('Usage: applyRegisterActions.ts <actions.csv> [--apply] [--include-name-matches]');
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(file, 'utf8'));
  const { connectDB } = await import('../config/db.js');
  const { default: RegisterListing } = await import('../models/RegisterListing.js');
  const { removeListings, digitsOnly } = await import('../services/registerRemoval.js');
  await connectDB();

  type Hit = { listing: any; note: string };
  const certain: Hit[] = [];
  const maybe: Hit[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    const note = `Compliance action list ${file.split(/[\\/]/).pop()}${r.action ? `: ${r.action}` : ''}`;
    const abn = digitsOnly(r.abn);
    if (abn.length === 11) {
      for (const l of await RegisterListing.find({ abn }).select('type slug name abn claimStatus').lean()) {
        if (!seen.has(String(l._id))) { seen.add(String(l._id)); certain.push({ listing: l, note }); }
      }
    }
    if (r.name && !abn) {
      const key = nameKey(r.name);
      if (key.length < 6) continue;
      for (const l of await RegisterListing.find({ nameLower: new RegExp(`^${escapeRegex(key)}$`, 'i') }).select('type slug name abn claimStatus').lean()) {
        if (!seen.has(String(l._id))) { seen.add(String(l._id)); maybe.push({ listing: l, note }); }
      }
    }
  }

  const show = (label: string, list: Hit[]) => {
    console.log(`\n${label}: ${list.length}`);
    for (const { listing: l } of list) {
      console.log(`  ${l.type} / ${l.slug}: ${l.name}${l.abn ? ` (ABN ${l.abn})` : ''}${l.claimStatus === 'claimed' ? '  [CLAIMED]' : ''}`);
    }
  };
  console.log(`[register-actions] ${rows.length} row(s) read from ${file}.`);
  show('Matched by ABN (certain)', certain);
  show('Matched by name only (check by hand)', maybe);
  if (!apply) {
    console.log('\n[register-actions] Report only. Add --apply to remove the ABN matches.');
    return;
  }

  let removed = 0;
  let review = 0;
  for (const t of includeNames ? [...certain, ...maybe] : certain) {
    const res = await removeListings([t.listing], 'compliance_action', t.note);
    removed += res.removed;
    review += res.needsReview.length;
  }
  console.log(`\n[register-actions] Removed ${removed}. ${review} claimed listing(s) need a manual check.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error('[register-actions] Fatal error:', err); process.exit(1); });
