import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Builds apps/api/data/census-2021-suburbs.json from the ABS 2021 Census General Community Profile data pack for
 * Suburbs and Localities ("2021_GCP_SAL_for_AUS_short-header.zip", about 100 MB, from
 * https://www.abs.gov.au/census/find-census-data/datapacks). Only a few figures are kept for each suburb:
 *
 *   [population, median age, aged 65 and over, needs help with a core activity, base for that count, median weekly household income]
 *
 * The data is published by the Australian Bureau of Statistics under Creative Commons Attribution 4.0 (CC BY 4.0).
 * The pages that use it carry the credit line (CENSUS_CREDIT in packages/topic-content). Percentages are calculated by us.
 *
 *   npx tsx src/scripts/buildCensusData.ts path/to/2021_GCP_SAL_for_AUS_short-header.zip [--match]
 *
 * --match also connects to the database and prints how many of our suburbs found Census figures.
 * The ABS file only changes at the next Census, so this runs once.
 */

/** Reads one file out of a zip without any library: finds the central directory, then inflates the entry. */
function readZipEntry(zip: Buffer, wanted: string): Buffer {
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 70000); i -= 1) {
    if (zip.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a zip file.');
  const count = zip.readUInt16LE(eocd + 10);
  let p = zip.readUInt32LE(eocd + 16);
  for (let n = 0; n < count; n += 1) {
    if (zip.readUInt32LE(p) !== 0x02014b50) throw new Error('Bad zip directory.');
    const method = zip.readUInt16LE(p + 10);
    const compressed = zip.readUInt32LE(p + 20);
    const nameLen = zip.readUInt16LE(p + 28);
    const extraLen = zip.readUInt16LE(p + 30);
    const commentLen = zip.readUInt16LE(p + 32);
    const local = zip.readUInt32LE(p + 42);
    const name = zip.toString('utf8', p + 46, p + 46 + nameLen);
    if (name === wanted) {
      const dataStart = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
      const raw = zip.subarray(dataStart, dataStart + compressed);
      return method === 0 ? raw : zlib.inflateRawSync(raw);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`${wanted} is not in the zip.`);
}

const CSV_DIR = '2021 Census GCP Suburbs and Localities for AUS';
function readCsv(zip: Buffer, table: string): { header: string[]; rows: string[][] } {
  const text = readZipEntry(zip, `${CSV_DIR}/2021Census_${table}_AUST_SAL.csv`).toString('utf8').replace(/^﻿/, '');
  const lines = text.split(/\r?\n/).filter(Boolean);
  return { header: lines[0].split(','), rows: lines.slice(1).map((l) => l.split(',')) };
}

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");

/** SAL code -> suburb name, from the geography sheet of the metadata workbook (an .xlsx is a zip of XML). */
function readSalNames(zip: Buffer): Map<string, string> {
  const book = readZipEntry(zip, 'Metadata/2021Census_geog_desc_1st_2nd_3rd_release.xlsx');
  const shared = readZipEntry(book, 'xl/sharedStrings.xml').toString('utf8');
  const strings = [...shared.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => decode([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join('')));
  const names = new Map<string, string>();
  for (let sheet = 1; sheet <= 7; sheet += 1) {
    const xml = readZipEntry(book, `xl/worksheets/sheet${sheet}.xml`).toString('utf8');
    for (const row of xml.matchAll(/<row [^>]*>([\s\S]*?)<\/row>/g)) {
      const values = [...row[1].matchAll(/<c r="[A-Z]+\d+"([^>]*)>(?:<v>([\s\S]*?)<\/v>)?/g)]
        .filter((c) => c[2] !== undefined && c[2] !== '')
        .map((c) => (/t="s"/.test(c[1]) ? strings[Number(c[2])] : c[2]));
      if (values[0] === 'SAL' && /^SAL\d+$/.test(values[1] ?? '')) names.set(values[1], values[3]);
    }
  }
  return names;
}

const STATE_BY_DIGIT: Record<string, string> = { '1': 'NSW', '2': 'VIC', '3': 'QLD', '4': 'SA', '5': 'WA', '6': 'TAS', '7': 'NT', '8': 'ACT' };
const slugify = (name: string) =>
  name.toLowerCase().replace(/\s*\((nsw|vic\.?|qld|sa|wa|tas\.?|nt|act|ot)\)\s*$/i, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main() {
  const file = process.argv.slice(2).find((a) => !a.startsWith('--'));
  if (!file) { console.error('Usage: buildCensusData.ts <2021_GCP_SAL_for_AUS_short-header.zip> [--match]'); process.exit(1); }
  const zip = fs.readFileSync(file);

  const names = readSalNames(zip);
  const g01 = readCsv(zip, 'G01');
  const g02 = readCsv(zip, 'G02');
  const g18 = readCsv(zip, 'G18');
  const col = (t: { header: string[] }, name: string) => { const i = t.header.indexOf(name); if (i < 0) throw new Error(`Column ${name} missing.`); return i; };
  const byCode = (t: { rows: string[][] }) => new Map(t.rows.map((r) => [r[0], r]));
  const m02 = byCode(g02);
  const m18 = byCode(g18);
  const iPop = col(g01, 'Tot_P_P');
  const iOver = ['Age_65_74_yr_P', 'Age_75_84_yr_P', 'Age_85ov_P'].map((c) => col(g01, c));
  const iAge = col(g02, 'Median_age_persons');
  const iInc = col(g02, 'Median_tot_hhd_inc_weekly');
  const iNeed = col(g18, 'P_Tot_Need_for_assistance');
  const iBase = col(g18, 'P_Tot_Tot');

  const suburbs: Record<string, number[]> = {};
  const states: Record<string, { pop: number; over65: number; need: number; base: number }> = {};
  const total = { pop: 0, over65: 0, need: 0, base: 0 };
  let skipped = 0;
  for (const r of g01.rows) {
    const code = r[0];
    const name = names.get(code);
    const state = STATE_BY_DIGIT[code.replace(/^SAL/, '')[0]];
    if (!name || !state || /^(no usual address|migratory|unincorporated)/i.test(name)) { skipped += 1; continue; }
    const pop = Number(r[iPop]);
    const over = iOver.reduce((sum, i) => sum + Number(r[i]), 0);
    const age = Number(m02.get(code)?.[iAge] ?? 0);
    const inc = Number(m02.get(code)?.[iInc] ?? 0);
    const need = Number(m18.get(code)?.[iNeed] ?? 0);
    const base = Number(m18.get(code)?.[iBase] ?? 0);
    const s = (states[state] ??= { pop: 0, over65: 0, need: 0, base: 0 });
    s.pop += pop; s.over65 += over; s.need += need; s.base += base;
    total.pop += pop; total.over65 += over; total.need += need; total.base += base;
    if (pop <= 0) { skipped += 1; continue; }
    suburbs[`${state}|${slugify(name)}`] = [pop, age, over, need, base, inc];
  }

  const out = {
    source: 'Australian Bureau of Statistics, 2021 Census of Population and Housing, General Community Profile (suburbs and localities)',
    licence: 'CC BY 4.0',
    fields: ['population', 'medianAge', 'aged65AndOver', 'needHelpWithCoreActivity', 'baseForNeedHelp', 'medianWeeklyHouseholdIncome'],
    states: { ...states, AUS: total },
    suburbs,
  };
  const target = path.resolve(process.cwd(), 'data', 'census-2021-suburbs.json');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(out));
  console.log(`[census] ${Object.keys(suburbs).length} suburbs written to ${target} (${skipped} skipped: no name, no people, or not a suburb). ${(fs.statSync(target).size / 1024).toFixed(0)} KB.`);

  if (process.argv.includes('--match')) {
    const { connectDB } = await import('../config/db.js');
    const { default: SuburbGeo } = await import('../models/SuburbGeo.js');
    await connectDB();
    const ours = await SuburbGeo.find({}).select('state suburbSlug').lean();
    const found = ours.filter((s) => suburbs[`${s.state}|${s.suburbSlug}`]).length;
    console.log(`[census] ${found} of ${ours.length} of our suburbs have Census figures (${Math.round((found / ours.length) * 100)}%).`);
    const missing = ours.filter((s) => !suburbs[`${s.state}|${s.suburbSlug}`]).slice(0, 15).map((s) => `${s.state}|${s.suburbSlug}`);
    console.log('[census] examples without figures:', missing.join(', '));
  }
}

main().then(() => process.exit(0)).catch((err) => { console.error('[census] Fatal error:', err); process.exit(1); });
