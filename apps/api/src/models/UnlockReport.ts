import mongoose, { Schema, type Document, type Types } from 'mongoose';

/**
 * A provider telling us an unlocked request was not usable: the contact details were invalid, or it duplicated one they
 * had already unlocked. An administrator restores the unlock (credit-back) or dismisses the report, with the outcome logged.
 */
export interface UnlockReportDoc extends Document {
  leadId: Types.ObjectId;
  providerId: Types.ObjectId;
  reason: 'invalid_contact' | 'duplicate' | 'other';
  note?: string;
  status: 'open' | 'restored' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

const schema = new Schema<UnlockReportDoc>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'Provider', required: true },
    reason: { type: String, enum: ['invalid_contact', 'duplicate', 'other'], required: true },
    note: { type: String, maxlength: 1000 },
    status: { type: String, enum: ['open', 'restored', 'dismissed'], default: 'open', index: true },
    resolvedBy: String,
    resolvedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
schema.index({ leadId: 1, providerId: 1 }, { unique: true });

export default mongoose.model<UnlockReportDoc>('UnlockReport', schema);
