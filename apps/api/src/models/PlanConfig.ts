import mongoose, { Schema, type Document } from 'mongoose';

export interface PlanConfigDoc extends Document {
  key: 'starter' | 'growth' | 'pro';
  name: string;
  priceCents: number;
  quota: number | null; // null = unlimited
  seats?: number;
  features: string[];
  popular?: boolean;
}

const planConfigSchema = new Schema<PlanConfigDoc>({
  key: { type: String, enum: ['starter', 'growth', 'pro'], required: true, unique: true },
  name: { type: String, required: true },
  priceCents: { type: Number, required: true },
  quota: { type: Number, default: null }, // null stored, not Infinity — Mongo can't store Infinity
  seats: Number,
  features: [String],
  popular: Boolean,
});

const PlanConfig = mongoose.model<PlanConfigDoc>('PlanConfig', planConfigSchema);

/**
 * Seeds the two provisional values from the design handoff README —
 * pricing ($0/$249/$649) and quota (0/15/unlimited) — as DB rows an
 * admin can edit later, rather than a hardcoded constants file.
 * Idempotent: safe to call on every server start.
 */
export async function ensureDefaultPlans(): Promise<void> {
  // Provider.plan calls the top tier 'pro'; this collection used to seed it as
  // 'scale' (see scripts/migratePlanConfigScaleToPro.ts). Rename a leftover
  // 'scale' row in place — keeping whatever price/quota an admin set — so the
  // upsert below doesn't create a second top tier.
  const legacy = await PlanConfig.collection.findOne({ key: 'scale' });
  if (legacy && !(await PlanConfig.collection.findOne({ key: 'pro' }))) {
    await PlanConfig.collection.updateOne({ key: 'scale' }, { $set: { key: 'pro' } });
  }

  const defaults: Omit<PlanConfigDoc, keyof Document>[] = [
    {
      key: 'starter',
      name: 'Listed',
      priceCents: 0,
      quota: 0,
      features: ['Claimed and verified profile', 'Weekly capacity check', 'Email notification of matching requests (headline only)', 'Worker directory search'],
    },
    {
      key: 'growth',
      name: 'Connect',
      priceCents: 24900,
      quota: 15,
      seats: 3,
      popular: true,
      features: ['Everything in Listed', '15 unlocks a month (unused unlocks do not roll over)', 'SMS alerts', '3 team seats', 'Response-time reporting', 'Profile photos'],
    },
    {
      key: 'pro',
      name: 'Connect Plus',
      priceCents: 64900,
      quota: null,
      seats: 10,
      // Higher allowance and more seats for multi-site providers. It never buys a higher position in results.
      features: ['Everything in Connect', 'Unlimited unlocks', 'Ten team seats', 'Named account manager'],
    },
  ];

  for (const plan of defaults) {
    await PlanConfig.updateOne({ key: plan.key }, { $setOnInsert: plan }, { upsert: true });
  }
  // Plans were renamed (Starter, Growth, Pro -> Listed, Connect, Connect Plus). Only rows still on the old default name are
  // renamed, so an administrator's own edits are kept. Leads are no longer exported, so that feature is not advertised.
  await PlanConfig.updateOne({ key: 'starter', name: 'Starter' }, { $set: { name: 'Listed', features: ['Claimed and verified profile', 'Weekly capacity check', 'Email notification of matching requests (headline only)', 'Worker directory search'] } });
  await PlanConfig.updateOne({ key: 'growth', name: 'Growth' }, { $set: { name: 'Connect', features: ['Everything in Listed', '15 unlocks a month (unused unlocks do not roll over)', 'SMS alerts', '3 team seats', 'Response-time reporting', 'Profile photos'] } });
  await PlanConfig.updateOne({ key: 'pro', name: 'Pro' }, { $set: { name: 'Connect Plus', features: ['Everything in Connect', 'Unlimited unlocks', 'Ten team seats', 'Named account manager'] } });
  await PlanConfig.updateMany({}, { $pull: { features: 'CSV export and webhook feed' } });
  // A paid plan does not change where a provider is listed (listing and ranking policy), so a stored plan row must not advertise it.
  await PlanConfig.updateMany({}, { $pull: { features: 'Priority placement in participant search' } });
}

export default PlanConfig;
