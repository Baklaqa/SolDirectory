import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface DocumentAssetDoc extends Document {
  ownerId: Types.ObjectId; // Worker or Provider
  ownerType: 'Worker' | 'Provider';
  kind: string; // 'ndis_worker_check' | 'police_check' | 'insurance_pl' | 'incident_policy' | ...
  contentType: string;
  s3Key: string;
  originalFilename: string;
  size: number;
  status: 'complete';
  uploadedAt: Date;
  /** The security check done before the file was stored (services/documentSecurity.ts). Only files that passed are ever stored. */
  scan?: { engine: string; sha256: string; scannedAt: Date };
  /** What the automatic read of the policy found (services/policyReview.ts). */
  analysis?: {
    status: 'ok' | 'gaps' | 'unreadable';
    readAt: Date;
    words: number;
    found: string[];
    missing: { key: string; label: string; advice: string; essential: boolean }[];
    note?: string;
  };
}

const documentAssetSchema = new Schema<DocumentAssetDoc>({
  ownerId: { type: Schema.Types.ObjectId, required: true, refPath: 'ownerType' },
  ownerType: { type: String, enum: ['Worker', 'Provider'], required: true },
  kind: { type: String, required: true },
  contentType: { type: String, required: true },
  s3Key: { type: String, required: true },
  originalFilename: String,
  size: { type: Number, required: true },
  status: { type: String, enum: ['complete'], required: true },
  uploadedAt: { type: Date, default: Date.now },
  scan: { type: new Schema({ engine: String, sha256: String, scannedAt: Date }, { _id: false }), default: undefined },
  analysis: {
    type: new Schema({
      status: { type: String, enum: ['ok', 'gaps', 'unreadable'] },
      readAt: Date,
      words: Number,
      found: [String],
      missing: [new Schema({ key: String, label: String, advice: String, essential: Boolean }, { _id: false })],
      note: String,
    }, { _id: false }),
    default: undefined,
  },
});

documentAssetSchema.index({ ownerId: 1, kind: 1 });

export default mongoose.model<DocumentAssetDoc>('DocumentAsset', documentAssetSchema);
