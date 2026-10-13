import { LOCATION_FAQS as SHARED_LOCATION_FAQS, STATE_CENTRES } from '@soldirectory/topic-content';
/**
 * Plain geography for the /locations page: each state or territory's capital and its larger regional centres.
 * These are place names only (no claims about providers); counts and provider links come from live data.
 */
export interface StateInfo {
  code: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';
  capital: string;
  centres: string[];
}

export const STATE_INFO: StateInfo[] = STATE_CENTRES as StateInfo[];

export interface LocationFaq { q: string; a: string }

/** General, durable answers. Anything that can change (rules, prices) points the reader to the official source instead of stating a figure. */
export const LOCATION_FAQS: LocationFaq[] = SHARED_LOCATION_FAQS.map((f) => ({ q: f.question, a: f.answer }));
