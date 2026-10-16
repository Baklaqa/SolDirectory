import 'dotenv/config';

/**
 * Takes a register listing off the site, and keeps it off at the next import. Use it for a removal or correction request
 * (for example a sole trader listed under their own name) or a provider that has been banned or lost its registration.
 *
 *   npx tsx src/scripts/removeRegisterListing.ts --slug some-provider-pty-ltd --reason request --note "Asked by email 2026-10-20" --dry-run
 *   npx tsx src/scripts/removeRegisterListing.ts --slug some-provider-pty-ltd --type ndis --reason compliance --note "Banning order"
 *   npx tsx src/scripts/removeRegisterListing.ts --abn "12 345 678 901" --reason compliance
 *
 * --reason is request, compliance or delisted. A listing a business has claimed is never deleted here; it is reported for review.
 */
const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

async function main() {
  const slug = arg('slug');
  const abn = arg('abn');
  const type = arg('type');
  const reasonArg = arg('reason');
  const note = arg('note');
  const dryRun = process.argv.includes('--dry-run');
  const reason = ({ request: 'removal_request', compliance: 'compliance_action', delisted: 'no_longer_listed' } as const)[reasonArg as 'request'];
  if ((!slug && !abn) || !reason) {
    console.error('Usage: removeRegisterListing.ts (--slug <slug> [--type ndis|aged_care] | --abn <abn>) --reason request|compliance|delisted [--note "..."] [--dry-run]');
    process.exit(1);
  }
  if (type && type !== 'ndis' && type !== 'aged_care') {
    console.error('--type must be ndis or aged_care.');
    process.exit(1);
  }

  const { connectDB } = await import('../config/db.js');
  const { default: RegisterListing } = await import('../models/RegisterListing.js');
  const { removeListings, digitsOnly } = await import('../services/registerRemoval.js');
  await connectDB();

  const filter: Record<string, unknown> = {};
  if (slug) filter.slug = slug.toLowerCase();
  if (type) filter.type = type;
  if (abn) filter.abn = digitsOnly(abn);
  const found = await RegisterListing.find(filter).select('type slug name abn claimStatus').lean();
  if (!found.length) {
    console.log('[remove-register-listing] No listing matches. Nothing to do.');
    return;
  }
  for (const l of found) {
    console.log(`  ${l.type} / ${l.slug}: ${l.name}${l.abn ? ` (ABN ${l.abn})` : ''}${l.claimStatus === 'claimed' ? '  [CLAIMED: will not be deleted]' : ''}`);
  }
  if (dryRun) {
    console.log('[remove-register-listing] --dry-run: nothing changed.');
    return;
  }

  const result = await removeListings(found as never[], reason, note);
  console.log(`[remove-register-listing] Removed ${result.removed}. They will be skipped by the next import.`);
  if (result.needsReview.length) {
    console.log(`[remove-register-listing] ${result.needsReview.length} claimed listing(s) left in place: review them with the business and the official register.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error('[remove-register-listing] Fatal error:', err); process.exit(1); });
