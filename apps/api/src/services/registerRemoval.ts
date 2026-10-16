import RegisterListing from '../models/RegisterListing.js';
import RegisterRemoval, { type RegisterRemovalDoc } from '../models/RegisterRemoval.js';

type Reason = RegisterRemovalDoc['reason'];

export const digitsOnly = (abn: unknown): string => String(abn ?? '').replace(/\D/g, '');

/** What the importer must leave out: listings by (type, slug) and by ABN. */
export async function loadRemovals(): Promise<{ slugs: Set<string>; abns: Set<string> }> {
  const rows = await RegisterRemoval.find({}).select('type slug abn').lean();
  const slugs = new Set<string>();
  const abns = new Set<string>();
  for (const r of rows as unknown as RegisterRemovalDoc[]) {
    if (r.slug && r.type) slugs.add(`${r.type}|${r.slug}`);
    if (r.abn) abns.add(r.abn);
  }
  return { slugs, abns };
}

interface ListingRef { _id: unknown; type: 'ndis' | 'aged_care'; slug: string; name: string; abn?: string; claimStatus?: string }

/**
 * Takes listings off the site and records why, so the next import does not bring them back. A listing that a business has
 * claimed is never deleted here: it is returned in `needsReview`, because a claimed listing is linked to a real account.
 */
export async function removeListings(listings: ListingRef[], reason: Reason, note?: string): Promise<{ removed: number; needsReview: ListingRef[] }> {
  let removed = 0;
  const needsReview: ListingRef[] = [];
  for (const l of listings) {
    if (l.claimStatus === 'claimed') { needsReview.push(l); continue; }
    await RegisterRemoval.create({ type: l.type, slug: l.slug, abn: digitsOnly(l.abn) || undefined, name: l.name, reason, note });
    await RegisterListing.deleteOne({ _id: l._id as never });
    removed += 1;
  }
  return { removed, needsReview };
}

/** Deletes any unclaimed listing already on the site that matches a removal (by ABN or slug): covers removals recorded after the listing was imported. */
export async function purgeRemoved(removals: { slugs: Set<string>; abns: Set<string> }): Promise<number> {
  const or: Record<string, unknown>[] = [];
  if (removals.abns.size) or.push({ abn: { $in: [...removals.abns] } });
  for (const key of removals.slugs) { const [type, slug] = key.split('|'); or.push({ type, slug }); }
  if (!or.length) return 0;
  const res = await RegisterListing.deleteMany({ $or: or, claimStatus: { $ne: 'claimed' } });
  return res.deletedCount ?? 0;
}

/**
 * After a full import: unclaimed listings that were not in this import have left the register, so they come off the site.
 * Refuses to prune when the import looks partial (fewer than 80% of the listings already stored for that register type).
 */
export async function pruneUnseen(runStart: Date, importedCounts: Record<string, number>): Promise<{ pruned: number; skipped: string[]; claimedUnseen: number }> {
  let pruned = 0;
  let claimedUnseen = 0;
  const skipped: string[] = [];
  for (const type of ['ndis', 'aged_care'] as const) {
    const incoming = importedCounts[type] ?? 0;
    if (!incoming) continue; // this register type was not in the file
    const stored = await RegisterListing.countDocuments({ type });
    if (incoming < stored * 0.8) { skipped.push(`${type}: file has ${incoming}, ${stored} stored (under 80%): looks partial, nothing pruned`); continue; }
    const unseen = await RegisterListing.find({ type, $or: [{ lastSeenAt: { $lt: runStart } }, { lastSeenAt: { $exists: false } }] })
      .select('type slug name abn claimStatus').lean();
    claimedUnseen += unseen.filter((l) => l.claimStatus === 'claimed').length;
    const res = await removeListings(unseen.filter((l) => l.claimStatus !== 'claimed') as unknown as ListingRef[], 'no_longer_listed', `Not in the import of ${runStart.toISOString().slice(0, 10)}`);
    pruned += res.removed;
  }
  return { pruned, skipped, claimedUnseen };
}
