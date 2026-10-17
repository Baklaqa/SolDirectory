/**
 * Checks the content score gate (services/pageContent/score.ts) without a database: a good rewrite passes, each kind of bad rewrite
 * is caught, and a page that repeats another page's wording loses its uniqueness points.
 *
 *   npm run test:page-score -w apps/api
 *
 * The facts below are a made-up fixture, not site content.
 */
import assert from 'node:assert/strict';
import type { PageFacts } from '../services/pageContent/facts.js';
import { scoreCopy, readingEase, type PageCopy } from '../services/pageContent/score.js';

const facts: PageFacts = {
  key: 'service:plan-management:vic:testville', kind: 'service', path: '/services/plan-management/vic/testville',
  names: { service: 'Plan management', suburb: 'Testville', state: 'VIC', stateName: 'Victoria', area: 'Testville, VIC', register: null },
  baseline: { h1: 'Plan management providers in Testville, Victoria', title: 'Plan management providers in Testville, VIC' },
  counts: { registerListings: 20, ndisListings: 19, agedCareListings: 1, supportsListedInSuburb: 18, listingsWithWebsite: 18, typicalSupportsPerListing: 13 },
  rank: { position: 13, of: 267, topSuburb: 'Melbourne', topCount: 98 },
  nearby: [{ suburb: 'Alphaton', slug: 'alphaton', listings: 9, km: 3 }, { suburb: 'Betaville', slug: 'betaville', listings: 19, km: 4 }],
  nearestTown: { suburb: 'Melbourne', listings: 98, km: 9 },
  reach: { fewAreas: 10, someAreas: 3, manyAreas: 5, widest: 2, multiState: 6 },
  topSupports: [], languages: [], localListings: [], census: { population: 33790, percentNeedingHelp: 6.4 }, censusCredit: null,
  serviceGuidance: null, links: [],
  numbers: [0, 1, 2, 3, 5, 6, 9, 10, 13, 18, 19, 20, 25, 26, 65, 98, 100, 267, 2021, 6.4, 33790],
};

const good: PageCopy = {
  seoTitle: 'Plan management in Testville, VIC',
  metaDescription: 'See how plan management is listed in Testville, VIC: 20 register listings, nearby suburbs, and what to check before you choose a plan manager.',
  intro: 'Plan management in Testville is listed by 20 providers on the public NDIS and My Aged Care registers, which puts the suburb 13th of 267 Victorian suburbs for this support. A plan manager pays your NDIS invoices and keeps your budget records, so you do not have to track every claim yourself. This page sets out who lists the support around Testville, how far their listed service areas reach, and what the 2021 Census says about the people who live here. Use it to build a shortlist, then confirm each provider\'s registration, fees and availability directly with them before you sign anything.',
  sections: [
    { heading: 'Who lists plan management in Testville', body: 'Of the 20 listings that cover Testville, 19 appear on the NDIS register and 1 on the My Aged Care register. Eighteen of them have a website. Most are broader businesses: a typical listing records 13 supports, so many plan managers also offer support coordination or personal care. A listing tells you what the register says. It does not show who has room for new participants this month, so ask each provider about capacity before you decide.' },
    { heading: 'How far these providers travel', body: 'The register records how many areas each provider says it serves. For plan management around Testville, 10 listings name only a few areas, 3 name a handful, and 5 cover many areas across the state. Two list a very wide area and 6 operate in more than one state. Online providers can serve you from anywhere, so a listing outside Testville may still suit you. Ask whether a provider offers phone or video appointments.' },
    { heading: 'Nearby suburbs to compare', body: 'If the shortlist for Testville is thin, look at the closest suburbs. Alphaton is about 3 km away with 9 listings and Betaville is 4 km away with 19. Melbourne, the nearest larger centre at 9 km, has 98 listings. Many plan managers work across several suburbs, so the same business can appear on more than one of these pages, and the totals should not be added together.' },
  ],
  faqs: [
    { question: 'How many plan management providers are listed in Testville?', answer: 'The public registers list 20 organisations that include plan management among their supports for Testville, VIC. That is a count of register listings, not of providers who are taking new people, so contact a few to confirm.' },
    { question: 'What does a plan manager do?', answer: 'A plan manager pays the invoices from your NDIS providers, tracks your budget by support category and sends you statements. They do not choose your supports for you. Check the fee and the reporting you receive before you agree.' },
    { question: 'Do I have to choose a provider in Testville?', answer: 'No. Many plan managers work online or across several suburbs, so you can pick one from Alphaton, Betaville or further away. Ask about phone or video appointments and how quickly they pay invoices.' },
    { question: 'How do I check that a provider is registered?', answer: 'Search the NDIS Commission register for the provider name or ABN and confirm the registration groups match what they offer. Listings on this page come from that register but can be out of date.' },
  ],
};

const run = (copy: PageCopy, siblings: string[] = []) => scoreCopy(copy, facts, siblings, 80);
const clone = (c: PageCopy): PageCopy => JSON.parse(JSON.stringify(c));
const has = (r: ReturnType<typeof run>, code: string) => r.issues.some((i) => i.code === code);
const checks: [string, () => void][] = [];
const check = (name: string, fn: () => void) => checks.push([name, fn]);

check('a good rewrite passes with no hard failure', () => {
  const r = run(good);
  assert.equal(r.hardFail, false, JSON.stringify(r.issues));
  assert.ok(r.passed && r.score >= 90, `score ${r.score}: ${JSON.stringify(r.issues)}`);
  assert.equal(r.breakdown.reduce((n, b) => n + b.outOf, 0), 100, 'the areas add up to 100');
  assert.ok(r.breakdown.every((b) => b.points <= b.outOf), 'no area scores above its maximum');
});
check('a number that is not in the facts is a hard failure', () => {
  const c = clone(good); c.sections[0].body += ' There are 77 providers in total.';
  const r = run(c);
  assert.ok(has(r, 'unsupported_number') && r.hardFail && !r.passed && r.score <= 49);
});
check('ranking, price and endorsement words are hard failures', () => {
  for (const word of ['the best', 'affordable', 'trusted', 'guaranteed']) {
    const c = clone(good); c.intro = c.intro.replace('Plan management in Testville', `${word} plan management in Testville`);
    assert.ok(has(run(c), 'banned_phrase'), word);
  }
});
check('a web address, email or phone number is a hard failure', () => {
  for (const text of ['Visit https://example.com today.', 'Email help@example.com.', 'Call 03 9123 4567 now.', 'Ring 1800 123 456.']) {
    const c = clone(good); c.sections[1].body += ` ${text}`;
    assert.ok(has(run(c), 'contact_details'), text);
  }
});
check('markup is a hard failure', () => {
  const c = clone(good); c.sections[2].body = `**${c.sections[2].body}**`;
  assert.ok(has(run(c), 'markup'));
});
check('an intro that does not name the service and suburb is a hard failure', () => {
  const c = clone(good); c.intro = c.intro.replaceAll('Testville', 'this area');
  assert.ok(has(run(c), 'intro_missing_names'));
});
check('thin copy scores below the minimum', () => {
  const c = clone(good); c.sections = c.sections.slice(0, 1); c.faqs = c.faqs.slice(0, 1); c.intro = 'Plan management in Testville, Victoria.';
  const r = run(c);
  assert.ok(!r.passed && r.score < 80, `score ${r.score}`);
});
check('copy that repeats another page loses uniqueness points', () => {
  const sibling = [good.intro, ...good.sections.map((s) => s.body)].join('\n');
  const r = run(good, [sibling]);
  assert.ok(has(r, 'too_similar') && r.breakdown.find((b) => b.area === 'Uniqueness')!.points < 5, JSON.stringify(r.breakdown));
});
check('keyword stuffing is flagged', () => {
  const c = clone(good); c.sections[0].body += ' Plan management in Testville. Plan management in Testville. Plan management in Testville.';
  assert.ok(has(run(c), 'keyword_stuffing'));
});
check('reading ease is higher for short plain sentences', () => {
  assert.ok(readingEase('The cat sat on the mat. It was warm. We ate lunch.') > readingEase('Notwithstanding administrative considerations, organisational accountability necessitates comprehensive documentation.'));
});

let failed = 0;
for (const [name, fn] of checks) {
  try { fn(); console.log(`ok   ${name}`); } catch (err) { failed += 1; console.log(`FAIL ${name}\n     ${err instanceof Error ? err.message : err}`); }
}
console.log(failed ? `\n${failed} of ${checks.length} checks failed.` : `\nAll ${checks.length} checks passed.`);
process.exit(failed ? 1 : 0);
