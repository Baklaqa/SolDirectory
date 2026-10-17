import mongoose, { Schema } from 'mongoose';

/**
 * The copy the n8n automation wrote for one page (a service x suburb page, or a register state or suburb page), with the score the
 * site gave it. Keyed by the page key (see services/pageContent/keys.ts).
 *
 *   approved  scored at or above the minimum with no hard failure; the site shows it, and the page becomes indexable
 *   rejected  scored below the minimum or had a hard failure; kept for review, never shown
 *   stale     was approved, but the facts it relied on changed (a number it states is no longer true); not shown until rewritten
 *   unpublished  taken down by hand
 *   baseline  no rewrite yet; only a draft WordPress post carrying the facts exists (counts as "todo")
 */
export type PageContentStatus = 'baseline' | 'approved' | 'rejected' | 'stale' | 'unpublished';

export interface PageContentDoc {
  key: string;
  kind: 'service' | 'register';
  path: string;
  status: PageContentStatus;
  content: {
    seoTitle: string;
    metaDescription: string;
    intro: string;
    sections: { heading: string; body: string }[];
    faqs: { question: string; answer: string }[];
  };
  score: number;
  minScore: number;
  breakdown: { area: string; points: number; outOf: number }[];
  issues: { code: string; severity: string; message: string }[];
  /** The numbers in the facts when the copy was accepted; the copy is stale once one of the numbers it states is no longer a fact. */
  factNumbers: number[];
  source: string;
  runId?: string;
  attempts: number;
  approvedAt?: Date;
  /** When the stale check last compared this copy with today's facts. */
  checkedAt?: Date;
  wpPostId?: number;
  wpSyncedAt?: Date;
  history: { at: Date; status: string; score: number; source: string; runId?: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const pageContentSchema = new Schema<PageContentDoc>(
  {
    key: { type: String, required: true, unique: true },
    kind: { type: String, enum: ['service', 'register'], required: true },
    path: { type: String, required: true },
    status: { type: String, enum: ['baseline', 'approved', 'rejected', 'stale', 'unpublished'], required: true },
    content: {
      seoTitle: String,
      metaDescription: String,
      intro: String,
      sections: [{ _id: false, heading: String, body: String }],
      faqs: [{ _id: false, question: String, answer: String }],
    },
    score: { type: Number, required: true },
    minScore: { type: Number, required: true },
    breakdown: [{ _id: false, area: String, points: Number, outOf: Number }],
    issues: [{ _id: false, code: String, severity: String, message: String }],
    factNumbers: [Number],
    source: { type: String, default: 'n8n' },
    runId: String,
    attempts: { type: Number, default: 1 },
    approvedAt: Date,
    checkedAt: Date,
    wpPostId: Number,
    wpSyncedAt: Date,
    history: [{ _id: false, at: Date, status: String, score: Number, source: String, runId: String }],
  },
  { timestamps: true }
);
pageContentSchema.index({ status: 1, kind: 1 });
pageContentSchema.index({ path: 1 });

export default mongoose.models.PageContent || mongoose.model<PageContentDoc>('PageContent', pageContentSchema);
