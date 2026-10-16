import mongoose, { Schema } from 'mongoose';

/**
 * A register listing that has been taken off the site and must not come back on the next import: a removal or correction
 * request (for example a sole trader listed under their own name), a banning order or revoked registration, or a provider that
 * is no longer on the register. The importer reads this list and skips these listings.
 */
export interface RegisterRemovalDoc {
  type?: 'ndis' | 'aged_care';
  slug?: string;
  /** Digits only. When set, any listing with this ABN is removed. */
  abn?: string;
  name: string;
  reason: 'removal_request' | 'compliance_action' | 'no_longer_listed';
  note?: string;
  createdAt: Date;
}

const registerRemovalSchema = new Schema<RegisterRemovalDoc>(
  {
    type: { type: String, enum: ['ndis', 'aged_care'] },
    slug: String,
    abn: String,
    name: { type: String, required: true },
    reason: { type: String, enum: ['removal_request', 'compliance_action', 'no_longer_listed'], required: true },
    note: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
registerRemovalSchema.index({ abn: 1 });
registerRemovalSchema.index({ type: 1, slug: 1 });

export default mongoose.models.RegisterRemoval || mongoose.model<RegisterRemovalDoc>('RegisterRemoval', registerRemovalSchema);
