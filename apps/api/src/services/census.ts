import fs from 'fs';
import path from 'path';

/**
 * ABS 2021 Census figures for a suburb, from apps/api/data/census-2021-suburbs.json (built by scripts/buildCensusData.ts).
 * Source: Australian Bureau of Statistics, 2021 Census of Population and Housing, General Community Profile. CC BY 4.0.
 * The credit line is CENSUS_CREDIT in packages/topic-content and appears wherever these figures are used.
 */
interface CensusFile {
  states: Record<string, { pop: number; over65: number; need: number; base: number }>;
  /** "STATE|suburb-slug" -> [population, median age, aged 65+, needs help with a core activity, base for that count, median weekly household income] */
  suburbs: Record<string, number[]>;
}

export interface CensusFacts {
  /** 'suburb' for a suburb page, 'state' when the figures are for the whole state. */
  level: 'suburb' | 'state';
  population: number;
  medianAge: number | null;
  medianWeeklyHouseholdIncome: number | null;
  over65: number;
  over65Pct: number;
  needHelp: number;
  needHelpPct: number;
  /** The same two percentages for the state (suburb level) and for Australia, to compare against. */
  stateOver65Pct: number;
  stateNeedHelpPct: number;
  australiaOver65Pct: number;
  australiaNeedHelpPct: number;
}

let cache: CensusFile | null | undefined;
function load(): CensusFile | null {
  if (cache !== undefined) return cache;
  try {
    const file = process.env.CENSUS_DATA_FILE || path.resolve(process.cwd(), 'data', 'census-2021-suburbs.json');
    cache = JSON.parse(fs.readFileSync(file, 'utf8')) as CensusFile;
  } catch {
    cache = null; // no file: pages simply have no Census paragraph
  }
  return cache;
}

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);
/** Below this many residents the ABS adds so much random noise that a percentage means little, so no Census paragraph is shown. */
const MIN_POPULATION = 300;

export function censusFor(state: string, suburbSlug: string | null): CensusFacts | null {
  const data = load();
  if (!data) return null;
  const st = data.states[state];
  const au = data.states.AUS;
  if (!st || !au) return null;
  const base = {
    stateOver65Pct: pct(st.over65, st.pop),
    stateNeedHelpPct: pct(st.need, st.base),
    australiaOver65Pct: pct(au.over65, au.pop),
    australiaNeedHelpPct: pct(au.need, au.base),
  };
  if (!suburbSlug) {
    return { level: 'state', population: st.pop, medianAge: null, medianWeeklyHouseholdIncome: null, over65: st.over65, over65Pct: base.stateOver65Pct, needHelp: st.need, needHelpPct: base.stateNeedHelpPct, ...base };
  }
  const row = data.suburbs[`${state}|${suburbSlug}`];
  if (!row || row[0] < MIN_POPULATION) return null;
  const [population, medianAge, over65, needHelp, needBase, income] = row;
  return {
    level: 'suburb',
    population,
    medianAge: medianAge > 0 ? medianAge : null,
    medianWeeklyHouseholdIncome: income > 0 ? income : null,
    over65,
    over65Pct: pct(over65, population),
    needHelp,
    needHelpPct: pct(needHelp, needBase),
    ...base,
  };
}
