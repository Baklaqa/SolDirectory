import mongoose, { Schema } from 'mongoose';

/**
 * Marks one "push everything to WordPress again" run, so that a run which is interrupted (a dropped connection, a restart) carries on
 * where it stopped instead of starting over: a post counts as done for the run if it was synced after `startedAt`.
 * `npm run sync:all-wp -- --resync` continues the unfinished run; `--restart` begins a new one.
 */
export interface WpSyncRunDoc {
  name: string;
  startedAt: Date;
  finishedAt?: Date;
}

const schema = new Schema<WpSyncRunDoc>({
  name: { type: String, required: true, unique: true },
  startedAt: { type: Date, required: true },
  finishedAt: Date,
});

export default mongoose.models.WpSyncRun || mongoose.model<WpSyncRunDoc>('WpSyncRun', schema);
