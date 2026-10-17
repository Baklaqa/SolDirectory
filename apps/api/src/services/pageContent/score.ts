import type { PageFacts } from './facts.js';

/**
 * The copy the automation writes for one page, and the rules and score that decide whether it goes live.
 *
 * The score is deterministic (no AI involved), so the n8n workflow can call /validate, read the issues, ask the model to fix them and
 * try again, and the site can trust a stored score. A copy goes live only if it has no hard failure AND scores at least the minimum.
 */
export interface PageCopy {
  /** The page part of the <title>, without the brand. The site adds " | SolDirectory". */
  seoTitle: string;
  metaDescription: string;
  /** Opening paragraph shown under the H1. */
  intro: string;
  sections: { heading: string; body: string }[];
  faqs: { question: string; answer: string }[];
}

export const DEFAULT_MIN_SCORE = 80;

export const LIMITS = {
  seoTitle: { min: 25, max: 46 },
  metaDescription: { min: 110, max: 160 },
  introWords: { min: 70, max: 150 },
  sections: { min: 3, max: 5 },
  sectionWords: { min: 50, max: 170 },
  headingChars: { max: 70 },
  faqs: { min: 4, max: 6 },
  faqAnswerWords: { min: 20, max: 90 },
  totalWords: { min: 450, max: 1000 },
  /** Largest share of 5-word phrases the copy may share with the copy of another page. */
  maxSimilarity: 0.25,
  minReadingEase: 45,
};

/** Words and claims the site never makes (see feedback: real data only, no endorsement, no invented reviews or prices). */
export const BANNED_RULES: { re: RegExp; why: string }[] = [
  { re: /\b(best|top[- ]rated|top[- ]ranked|leading|premier|finest|number one|no\.? ?1|#1)\b/i, why: 'ranking or superlative claim' },
  { re: /\b(affordable|cheap(est)?|low[- ]cost|budget[- ]friendly|bargain|discount(ed)?|free quote)\b/i, why: 'price claim' },
  { re: /\b(trusted|reputable|award[- ]winning|accredited by us|highly rated|five[- ]star|5[- ]star|recommended by)\b/i, why: 'endorsement claim' },
  { re: /\b(guarantee[sd]?|guaranteed|100% (safe|satisfaction)|risk[- ]free)\b/i, why: 'guarantee' },
  { re: /\b(testimonial|reviews? (say|show)|customers? (say|love)|rated by)\b/i, why: 'invented reviews' },
  { re: /\b(call (us )?now|act now|limited time|don'?t miss)\b/i, why: 'pressure language' },
  { re: /\b(cure[sd]?|miracle|breakthrough)\b/i, why: 'medical claim' },
  { re: /\b(unclaimed|not yet claimed)\b/i, why: 'wording the site avoids' },
  { re: /\bwe (will|can) (find|match|get) you (a|the|an?)\b.*\b(minutes?|hours?|today)\b/i, why: 'a service-time promise' },
];

const US_SPELLING = /\b(center|centers|organization|organizations|behavior|behaviors|color|favorite|labor|neighbor|neighborhood|program's|license|licensed)\b/i;
const HAS_HTML = /<\/?[a-z][^>]*>|&[a-z]+;|\[[^\]]+\]\([^)]+\)|^\s*#{1,6}\s|\*\*|__/m;
const HAS_CONTACT = /(https?:\/\/|www\.|\b[\w.+-]+@[\w-]+\.[\w.]+\b|(\+?61|0)[ -]?[2-478]([ -]?\d){8}\b|\b1[38]00[ -]?\d{3}[ -]?\d{3}\b)/i;

export interface Issue {
  code: string;
  severity: 'hard' | 'soft';
  message: string;
  /** What to change. Written for the model that will rewrite the copy. */
  fix: string;
  field?: string;
}

export interface ScoreResult {
  score: number;
  minScore: number;
  passed: boolean;
  hardFail: boolean;
  breakdown: { area: string; points: number; outOf: number }[];
  issues: Issue[];
  stats: { totalWords: number; introWords: number; sections: number; faqs: number; readingEase: number; maxSimilarity: number; factNumbersUsed: number };
}

const words = (s: string) => (s.match(/[A-Za-z0-9’'$%.,-]+/g) ?? []).filter((w) => /[A-Za-z0-9]/.test(w));
const wordCount = (s: string) => words(s).length;
const sentences = (s: string) => s.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  const groups = w.replace(/e$/, '').match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Flesch reading ease: higher is easier. About 60 is plain English; below 30 is very hard. */
export function readingEase(text: string): number {
  const ws = words(text).filter((w) => /[A-Za-z]/.test(w));
  const ss = sentences(text);
  if (!ws.length || !ss.length) return 0;
  const syl = ws.reduce((n, w) => n + syllables(w), 0);
  return Math.round(206.835 - 1.015 * (ws.length / ss.length) - 84.6 * (syl / ws.length));
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
function shingles(text: string, n = 5): Set<string> {
  const w = norm(text).split(' ').filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + n <= w.length; i += 1) out.add(w.slice(i, i + n).join(' '));
  return out;
}
/** The share of this copy's 5-word phrases that also appear in `other` (0 to 1). */
export function overlap(a: Set<string>, other: Set<string>): number {
  if (!a.size) return 0;
  let shared = 0;
  for (const s of a) if (other.has(s)) shared += 1;
  return shared / a.size;
}

export const copyText = (c: PageCopy): string =>
  [c.seoTitle, c.metaDescription, c.intro, ...c.sections.flatMap((s) => [s.heading, s.body]), ...c.faqs.flatMap((f) => [f.question, f.answer])].join('\n');

/** The numbers written in the copy (1,234 becomes 1234, 6.4% becomes 6.4). Numbers under 10 are not checked. */
export function numbersIn(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(/(?<![\w.])\$?(\d[\d,]*(?:\.\d+)?)(?![\w])/g)) {
    const v = Number(m[1].replace(/,/g, ''));
    if (Number.isFinite(v) && v >= 10) out.push(v);
  }
  return out;
}

export function structureErrors(raw: unknown): string[] {
  const errs: string[] = [];
  const c = raw as Partial<PageCopy> | null;
  if (!c || typeof c !== 'object') return ['The content must be an object.'];
  for (const f of ['seoTitle', 'metaDescription', 'intro'] as const) if (typeof c[f] !== 'string' || !c[f]!.trim()) errs.push(`${f} is required and must be text.`);
  if (!Array.isArray(c.sections) || c.sections.some((s) => !s || typeof s.heading !== 'string' || typeof s.body !== 'string')) errs.push('sections must be a list of { heading, body } with text values.');
  if (!Array.isArray(c.faqs) || c.faqs.some((f) => !f || typeof f.question !== 'string' || typeof f.answer !== 'string')) errs.push('faqs must be a list of { question, answer } with text values.');
  return errs;
}

/**
 * Scores one copy against its page's facts. `siblingTexts` is the copy already live on neighbouring pages (same kind, same service or register,
 * nearby), used to check that this page does not repeat them.
 */
export function scoreCopy(copy: PageCopy, facts: PageFacts, siblingTexts: string[], minScore = DEFAULT_MIN_SCORE): ScoreResult {
  const issues: Issue[] = [];
  const add = (i: Issue) => issues.push(i);
  const text = copyText(copy);
  const body = [copy.intro, ...copy.sections.map((s) => s.body)].join('\n');
  const suburb = facts.names.suburb ?? facts.names.stateName;
  const service = facts.names.service;
  const lc = (s: string) => s.toLowerCase();
  const has = (haystack: string, needle: string | null) => !needle || lc(haystack).includes(lc(needle));
  const stateMentioned = (s: string) => has(s, facts.names.stateName) || new RegExp(`\\b${facts.names.state}\\b`).test(s);

  // --- Hard failures: any one of these stops the copy going live whatever its score. ---
  for (const { re, why } of BANNED_RULES) {
    const m = text.match(re);
    if (m) add({ code: 'banned_phrase', severity: 'hard', message: `Contains "${m[0]}" (${why}).`, fix: `Remove "${m[0]}" and say it plainly using only the facts supplied. The site does not make ${why}s.` });
  }
  if (HAS_HTML.test(text)) add({ code: 'markup', severity: 'hard', message: 'Contains HTML, markdown or special markup.', fix: 'Return plain text only: no tags, no markdown, no asterisks or hash signs.' });
  const contact = text.match(HAS_CONTACT);
  if (contact) add({ code: 'contact_details', severity: 'hard', message: `Contains a web address, email address or phone number ("${contact[0]}").`, fix: 'Remove it. Internal links are added by the site; never write URLs, emails or phone numbers.' });
  const allowed = new Set(facts.numbers);
  const unsupported = [...new Set(numbersIn(text).filter((n) => !allowed.has(n)))];
  if (unsupported.length) {
    add({
      code: 'unsupported_number', severity: 'hard', message: `Uses numbers that are not in the facts: ${unsupported.slice(0, 8).join(', ')}.`,
      fix: 'Use only numbers listed in facts.numbers. Delete or reword anything that depends on a number you cannot find there.',
    });
  }
  if (!has(copy.intro, suburb) || (service && !has(copy.intro, service))) {
    add({ code: 'intro_missing_names', severity: 'hard', message: `The intro must name ${service ? `"${service}" and ` : ''}"${suburb}".`, fix: `Mention ${service ? `${service} and ` : ''}${suburb} in the first two sentences of the intro.`, field: 'intro' });
  }
  if (US_SPELLING.test(text)) add({ code: 'us_spelling', severity: 'soft', message: 'Uses US spelling.', fix: 'Use Australian English (centre, organisation, behaviour, colour, neighbour).' });

  // --- Structure (20) ---
  const struct = { max: 20, got: 0 };
  const titleOk = copy.seoTitle.length >= LIMITS.seoTitle.min && copy.seoTitle.length <= LIMITS.seoTitle.max;
  const titleNames = has(copy.seoTitle, suburb) && (!service || has(copy.seoTitle, service));
  if (!titleOk) add({ code: 'title_length', severity: 'soft', message: `seoTitle is ${copy.seoTitle.length} characters.`, fix: `Make seoTitle ${LIMITS.seoTitle.min} to ${LIMITS.seoTitle.max} characters (the site adds " | SolDirectory").`, field: 'seoTitle' });
  if (!titleNames) add({ code: 'title_names', severity: 'soft', message: 'seoTitle does not name the service and the suburb.', fix: `Include ${service ? `"${service}" and ` : ''}"${suburb}" in seoTitle.`, field: 'seoTitle' });
  struct.got += (titleOk ? 3 : 0) + (titleNames ? 2 : 0);
  const mdOk = copy.metaDescription.length >= LIMITS.metaDescription.min && copy.metaDescription.length <= LIMITS.metaDescription.max;
  const mdNames = has(copy.metaDescription, suburb) && (!service || has(copy.metaDescription, service));
  const mdEnds = /[.!?]$/.test(copy.metaDescription.trim());
  if (!mdOk) add({ code: 'meta_length', severity: 'soft', message: `metaDescription is ${copy.metaDescription.length} characters.`, fix: `Make metaDescription ${LIMITS.metaDescription.min} to ${LIMITS.metaDescription.max} characters.`, field: 'metaDescription' });
  if (!mdNames) add({ code: 'meta_names', severity: 'soft', message: 'metaDescription does not name the service and the suburb.', fix: 'Name both in the first sentence.', field: 'metaDescription' });
  if (!mdEnds) add({ code: 'meta_ending', severity: 'soft', message: 'metaDescription does not end on a full sentence.', fix: 'End metaDescription with a full stop, never an ellipsis.', field: 'metaDescription' });
  struct.got += (mdOk ? 2 : 0) + (mdNames ? 1 : 0) + (mdEnds ? 1 : 0);
  const introWords = wordCount(copy.intro);
  const introOk = introWords >= LIMITS.introWords.min && introWords <= LIMITS.introWords.max;
  if (!introOk) add({ code: 'intro_length', severity: 'soft', message: `The intro is ${introWords} words.`, fix: `Make the intro ${LIMITS.introWords.min} to ${LIMITS.introWords.max} words.`, field: 'intro' });
  struct.got += introOk ? 3 : 0;
  const nSec = copy.sections.length;
  const secOk = nSec >= LIMITS.sections.min && nSec <= LIMITS.sections.max;
  const secLen = copy.sections.every((s) => wordCount(s.body) >= LIMITS.sectionWords.min && wordCount(s.body) <= LIMITS.sectionWords.max);
  const headOk = copy.sections.every((s) => s.heading.length > 0 && s.heading.length <= LIMITS.headingChars.max);
  if (!secOk) add({ code: 'section_count', severity: 'soft', message: `There are ${nSec} sections.`, fix: `Write ${LIMITS.sections.min} to ${LIMITS.sections.max} sections.`, field: 'sections' });
  if (!secLen) add({ code: 'section_length', severity: 'soft', message: `Section body lengths (words): ${copy.sections.map((s) => wordCount(s.body)).join(', ')}.`, fix: `Keep each section body between ${LIMITS.sectionWords.min} and ${LIMITS.sectionWords.max} words.`, field: 'sections' });
  if (!headOk) add({ code: 'heading_length', severity: 'soft', message: 'A section heading is empty or too long.', fix: `Keep headings under ${LIMITS.headingChars.max} characters.`, field: 'sections' });
  struct.got += (secOk ? 2 : 0) + (secLen ? 1 : 0) + (headOk ? 1 : 0);
  const nFaq = copy.faqs.length;
  const faqOk = nFaq >= LIMITS.faqs.min && nFaq <= LIMITS.faqs.max && copy.faqs.every((f) => /\?$/.test(f.question.trim()) && wordCount(f.answer) >= LIMITS.faqAnswerWords.min && wordCount(f.answer) <= LIMITS.faqAnswerWords.max);
  const faqProblems = [
    ...(nFaq < LIMITS.faqs.min || nFaq > LIMITS.faqs.max ? [`there are ${nFaq} questions`] : []),
    ...copy.faqs.flatMap((f, i) => [
      ...(/\?$/.test(f.question.trim()) ? [] : [`question ${i + 1} does not end in "?"`]),
      ...(wordCount(f.answer) < LIMITS.faqAnswerWords.min || wordCount(f.answer) > LIMITS.faqAnswerWords.max ? [`answer ${i + 1} is ${wordCount(f.answer)} words`] : []),
    ]),
  ];
  if (!faqOk) add({ code: 'faq_shape', severity: 'soft', message: `FAQ problems: ${faqProblems.join('; ')}.`, fix: `Write ${LIMITS.faqs.min} to ${LIMITS.faqs.max} questions that end in "?", each answer ${LIMITS.faqAnswerWords.min} to ${LIMITS.faqAnswerWords.max} words.`, field: 'faqs' });
  struct.got += faqOk ? 4 : 0;

  // --- Keywords (15) ---
  const kw = { max: 15, got: 0 };
  const intro25 = words(copy.intro).slice(0, 30).join(' ');
  const earlyOk = has(intro25, suburb) && (!service || has(intro25, service));
  if (!earlyOk) add({ code: 'keyword_early', severity: 'soft', message: 'The service and suburb are not in the first 30 words of the intro.', fix: 'Put the service and the suburb in the first sentence.', field: 'intro' });
  kw.got += earlyOk ? 5 : 0;
  const headHits = copy.sections.filter((s) => has(s.heading, suburb) || (service && has(s.heading, service))).length;
  const headOkKw = headHits >= 2;
  if (!headOkKw) add({ code: 'keyword_headings', severity: 'soft', message: 'Fewer than two section headings name the suburb or the service.', fix: 'Name the suburb or the service in at least two headings, naturally.', field: 'sections' });
  kw.got += headOkKw ? 5 : 0;
  const phrase = service ? new RegExp(`${service.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} (in|for) ${suburb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi') : null;
  const repeats = phrase ? (body.match(phrase) ?? []).length : 0;
  const stuffed = repeats > 3;
  if (stuffed) add({ code: 'keyword_stuffing', severity: 'soft', message: `"${service} in ${suburb}" appears ${repeats} times.`, fix: 'Use the exact phrase at most three times; vary the wording.', field: 'sections' });
  kw.got += stuffed ? 0 : 3;
  const stateOk = stateMentioned(body);
  if (!stateOk) add({ code: 'state_missing', severity: 'soft', message: 'The state is never mentioned.', fix: `Mention ${facts.names.stateName} once.` });
  kw.got += stateOk ? 2 : 0;

  // --- Length (10) ---
  const total = wordCount(text);
  const lengthPts = total >= LIMITS.totalWords.min && total <= LIMITS.totalWords.max ? 10 : total >= LIMITS.totalWords.min * 0.8 && total <= LIMITS.totalWords.max * 1.15 ? 5 : 0;
  if (lengthPts < 10) add({ code: 'total_length', severity: 'soft', message: `The copy is ${total} words.`, fix: `Aim for ${LIMITS.totalWords.min} to ${LIMITS.totalWords.max} words in total.` });

  // --- Uniqueness (20) ---
  const mine = shingles(body);
  let maxSim = 0;
  for (const s of siblingTexts) maxSim = Math.max(maxSim, overlap(mine, shingles(s)));
  const simPts = Math.round(20 * Math.max(0, Math.min(1, (0.3 - maxSim) / 0.2)));
  if (maxSim > LIMITS.maxSimilarity) add({ code: 'too_similar', severity: 'soft', message: `${Math.round(maxSim * 100)}% of its 5-word phrases appear on another page.`, fix: 'Rewrite with this suburb\'s own facts (nearby suburbs, counts, reach, languages, census) rather than wording shared with other pages.' });

  // --- Grounding (20) ---
  const used = new Set(numbersIn(text).filter((n) => allowed.has(n)));
  const nearbyNames = [...facts.nearby.map((n) => n.suburb), ...(facts.nearestTown ? [facts.nearestTown.suburb] : [])];
  const namesUsed = nearbyNames.filter((n) => has(text, n)).length;
  const groundPts = Math.min(12, used.size * 3) + Math.min(8, namesUsed * 2);
  if (used.size < 4) add({ code: 'few_facts', severity: 'soft', message: `Only ${used.size} of the supplied numbers are used.`, fix: 'Use at least four different numbers from the facts (listings, reach, rank, census, distances) in the sections and answers.' });

  // --- Readability (10) ---
  const ease = readingEase(body);
  const easePts = Math.round(10 * Math.max(0, Math.min(1, (ease - 30) / (LIMITS.minReadingEase + 15 - 30))));
  if (ease < LIMITS.minReadingEase) add({ code: 'readability', severity: 'soft', message: `Reading ease is ${ease} (aim for ${LIMITS.minReadingEase} or more).`, fix: 'Use shorter sentences (under 22 words) and everyday words.' });

  // --- Compliance (5) ---
  const compPts = issues.some((i) => i.severity === 'hard') ? 0 : 5;

  const breakdown = [
    { area: 'Structure', points: struct.got, outOf: struct.max },
    { area: 'Keywords', points: kw.got, outOf: kw.max },
    { area: 'Length', points: lengthPts, outOf: 10 },
    { area: 'Uniqueness', points: simPts, outOf: 20 },
    { area: 'Grounded in the facts', points: groundPts, outOf: 20 },
    { area: 'Readability', points: easePts, outOf: 10 },
    { area: 'Compliance', points: compPts, outOf: 5 },
  ];
  let score = breakdown.reduce((n, b) => n + b.points, 0);
  const hardFail = issues.some((i) => i.severity === 'hard');
  if (hardFail) score = Math.min(score, 49);
  return {
    score, minScore, passed: !hardFail && score >= minScore, hardFail, breakdown, issues,
    stats: { totalWords: total, introWords, sections: nSec, faqs: nFaq, readingEase: ease, maxSimilarity: Math.round(maxSim * 100) / 100, factNumbersUsed: used.size },
  };
}
