/**
 * Links inside article text. A short, curated list of phrases that name another article's subject ("service agreement",
 * "worker screening", "Support at Home" …). In each article the first mention of a subject becomes a link to the article
 * that explains it, at most one link per paragraph and a handful per article, never to the article itself.
 *
 * Both the page and the crawler HTML build paragraphs through linkParagraph(), so the links are the same on both sides.
 */
// `scopes`: which kind of article may link here. NDIS guides are not linked from aged care articles, and the reverse.
const T = (re, slug, scopes = ['ndis']) => ({ re, slug, scopes });

export const LINK_TERMS = [
  // Articles name their own sibling guides in so many words.
  T(/\bguide to contractor and employee arrangements\b/i, 'independent-contractor-or-employee-getting-your-support-work-arrangement-right'),
  T(/\bguide to paperwork for independent workers\b/i, 'service-agreements-notes-and-invoices-the-paperwork-independent-workers-need'),

  T(/\bNDIS Worker Screening Checks?\b|\bworker screening checks?\b/i, 'ndis-worker-screening-check-who-needs-one-and-how-it-works'),
  T(/\bservice agreements?\b/i, 'ndis-service-agreement-what-to-check-before-you-sign'),
  T(/\bsupport coordinat(?:ion|ors?)\b/i, 'support-coordination-explained-do-you-need-it'),
  T(/\bplan managers?\b/i, 'what-does-an-ndis-plan-manager-do-and-how-to-choose-one'),
  T(/\bCode of Conduct\b/, 'ndis-code-of-conduct-for-support-workers-what-it-means-in-everyday-work'),
  T(/\bSupport at Home\b/, 'support-at-home-explained-how-in-home-aged-care-works', ['ndis', 'aged']),
  T(/\bunregistered providers?\b/i, 'registered-or-unregistered-ndis-provider-what-it-means'),
  T(/\bself-managed\b|\bplan-managed\b|\bNDIA-managed\b/i, 'self-managed-plan-managed-or-ndia-managed-how-to-decide'),
  T(/\baged care assessment\b/i, 'getting-an-aged-care-assessment-what-to-expect', ['ndis', 'aged']),
  T(/\bplan reviews?\b/i, 'how-to-prepare-for-an-ndis-plan-review'),
];

export const MAX_LINKS_PER_ARTICLE = 6;

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => s.replace(/[&<>"']/g, (c) => ESC[c]);

/** Which links an article may carry: aged care articles stay with aged care guides. */
export const linkScopeFor = (category) => (category === 'Aged care' ? 'aged' : 'ndis');

/** The state to pass for each article: { used: Set of slugs already linked, count }. */
export function newLinkState() {
  return { used: new Set(), count: 0 };
}

/**
 * One paragraph as HTML: escaped, with at most one phrase turned into a link. `state` is shared across the article's
 * paragraphs, so a subject is linked once.
 */
export function linkParagraph(text, selfSlug, state, scope = 'ndis', skipSlugs = []) {
  if (state.count < MAX_LINKS_PER_ARTICLE) {
    let best = null;
    for (const term of LINK_TERMS) {
      if (term.slug === selfSlug || state.used.has(term.slug) || skipSlugs.includes(term.slug) || !term.scopes.includes(scope)) continue;
      const m = term.re.exec(text);
      if (!m) continue;
      if (!best || m.index < best.index) best = { index: m.index, match: m[0], slug: term.slug };
    }
    if (best) {
      state.used.add(best.slug);
      state.count += 1;
      return `${esc(text.slice(0, best.index))}<a href="/blog/${best.slug}">${esc(best.match)}</a>${esc(text.slice(best.index + best.match.length))}`;
    }
  }
  return esc(text);
}

/** The questions as HTML for the article body (native details/summary: answers are in the page and need no script). */
export function faqHtml(faq) {
  if (!faq || !faq.length) return '';
  return `<section class="blog-faq-section" aria-label="Frequently asked questions"><h2>Frequently asked questions</h2>` +
    `<div class="blog-faq">${faq.map((f) => `<details class="blog-faq-item"><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('')}</div></section>`;
}
