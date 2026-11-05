import mongoose, { Schema, type Document } from 'mongoose';

/**
 * What the weekly official-content check last saw at each official page our guides and articles cite (services/officialContentCheck.ts).
 * Only facts are kept: whether the page answered and a fingerprint of its readable text, so a later run can say "this page has changed
 * since you last read it". No page text is stored.
 */
export interface SourceCheckDoc extends Document {
  url: string;
  status: 'ok' | 'broken' | 'blocked' | 'error' | 'skipped';
  detail?: string;
  lastAttemptAt: Date;
  /** The last time the page answered and was read. */
  lastOkAt?: Date;
  contentHash?: string;
  words?: number;
  /** When the fingerprint last differed from the one before it. */
  hashChangedAt?: Date;
  changeCount: number;
}

const schema = new Schema<SourceCheckDoc>({
  url: { type: String, required: true, unique: true },
  status: { type: String, enum: ['ok', 'broken', 'blocked', 'error', 'skipped'], required: true },
  detail: String,
  lastAttemptAt: { type: Date, required: true },
  lastOkAt: Date,
  contentHash: String,
  words: Number,
  hashChangedAt: Date,
  changeCount: { type: Number, default: 0 },
});

export default mongoose.model<SourceCheckDoc>('SourceCheck', schema);
