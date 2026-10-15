import type { PipelineStage } from 'mongoose';
import Provider from '../models/Provider.js';

/**
 * Order of providers in search results and lists (the "Listing and ranking policy" page describes this):
 *  1. Member profiles that are taking new people (the weekly capacity check is confirmed and intake is not closed or
 *     waitlist-only) come first. Everyone else follows.
 *  2. Alphabetical by name within each group.
 * A paid plan changes neither the order nor whether a profile appears. Plans differ in how many requests a provider
 * can unlock, not in where it is listed. Distance ordering applies where a page already filters by area.
 */
export const TAKING_NEW_PEOPLE = {
  $and: [
    { $ne: ['$listingPaused', true] },
    { $not: [{ $in: ['$intakeStatus', ['Closed', 'Waitlist only']] }] },
  ],
};

function project(fields: string): Record<string, 1> {
  return Object.fromEntries(fields.split(/\s+/).filter(Boolean).map((field) => [field, 1]));
}

export async function findProvidersOrdered<T>(
  filter: Record<string, unknown>,
  fields: string,
  options: { skip?: number; limit: number },
): Promise<T[]> {
  const pipeline: PipelineStage[] = [
    { $match: filter },
    { $set: { _taking: { $cond: [TAKING_NEW_PEOPLE, 1, 0] } } },
    { $sort: { _taking: -1, tradingName: 1, legalEntityName: 1, _id: 1 } },
    ...(options.skip ? [{ $skip: options.skip } as PipelineStage] : []),
    { $limit: options.limit },
    // The caller's fields, plus what the "Taking new people" label is computed from.
    { $project: { ...project(fields), _taking: 1 } },
  ];

  return Provider.aggregate<T>(pipeline);
}
