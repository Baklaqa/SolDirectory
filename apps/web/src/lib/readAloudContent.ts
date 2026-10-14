/**
 * What "Listen" reads. The page's own words, in order: the headline, introductions, headings, paragraphs, lists and
 * questions with their answers. It leaves out everything that is a control or navigation rather than content: menus,
 * breadcrumbs, buttons and their arrows, forms, provider cards, link grids, "related reading" cards, call-to-action
 * boxes, icons and numbered badges.
 *
 * Anything else that should never be read can carry data-read-aloud="skip".
 */

export interface ReadBlock {
  /** The element to highlight while this block is read. */
  el: HTMLElement;
  text: string;
  heading: boolean;
}

export interface ReadChunk {
  text: string;
  /** Index into the blocks this sentence came from. */
  block: number;
  /** Whether this chunk is the first one of a heading (used for "next section"). */
  sectionStart: boolean;
}

/** Whole subtrees that are never read. */
const SKIP = [
  'script', 'style', 'noscript', 'template', 'svg', 'canvas', 'iframe', 'video', 'audio', 'picture', 'img', 'map',
  'nav', 'form', 'dialog', 'select', 'textarea', 'input', 'footer',
  '[aria-hidden="true"]', '[hidden]', '[role="dialog"]', '[role="navigation"]', '[role="search"]', '[role="alert"]', '[role="status"]',
  '[data-read-aloud="skip"]',
  // site chrome
  '.public-header', '.public-footer', '.app-header', '.utility-bar', '.skip-link', '.read-aloud', '.public-back-to-top',
  '.accessibility-toolbar', '.visually-hidden', '.sr-only',
  // navigation-like and card-like blocks
  '.reg-crumbs', '.breadcrumbs', '.pagination', '.reg-search', '.dir-search', '.dir-alert',
  '.dir-grid', '.dir-card', '.reg-linkgrid', '.xp-links', '.xp-states', '.xp-chips', '.xp-cols', '.dx-tiles', '.dx-states', '.dx-guides', '.ra',
  '.hr-pills', '.acc-mark', '.acc-chevron', '.eyebrow',
  // blog article: sharing, side rail, related cards, category chips
  '.blog-share', '.blog-related', '.blog-card-grid', '.blog-rail', '.blog-bottom-actions', '.blog-bottom-band', '.blog-back-link',
  '.blog-article-categories', '.blog-kicker', '.blog-progress', '.blog-breadcrumb', '.blog-categories', '.blog-guides', '.blog-search', '.blog-load-more',
  // calls to action
  '.reg-cta', '.directory-content-cta', '.iw-cta', '.wp-cpt-cta', '.dir-help', '.dir-empty-actions',
].join(',');

/** Elements that only decorate a run of text. */
const INLINE = new Set(['a', 'abbr', 'b', 'bdi', 'cite', 'code', 'em', 'i', 'mark', 'q', 's', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'wbr', 'br', 'button']);

/** Elements that are one readable block of their own. */
const LEAF = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'summary', 'figcaption', 'blockquote', 'dt', 'dd', 'caption', 'th', 'td']);

const BLOCK_CHILD = ':scope > p, :scope > ul, :scope > ol, :scope > div, :scope > section, :scope > article, :scope > table, :scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > details';

function isHidden(el: Element): boolean {
  if ((el as HTMLElement).hidden) return true;
  // Collapsed question rows are hidden with visibility, not display, and their answers are part of the page.
  return getComputedStyle(el).display === 'none';
}

function skipped(el: Element): boolean {
  return el.matches(SKIP) || isHidden(el);
}

/** Tidies text so a voice reads it naturally. */
export function cleanForSpeech(raw: string): string {
  return raw
    .replace(/[→←↗↖↑↓✓✔✕✖›»«▸▾▴]/g, ' ')
    .replace(/\s·\s/g, ', ')
    .replace(/\s&\s/g, ' and ')
    .replace(/\be\.g\./gi, 'for example')
    .replace(/\bi\.e\./gi, 'that is')
    .replace(/\bvs\.?\s/gi, 'versus ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The readable text inside an element, leaving out anything skipped. Buttons count only inside headings (question rows). */
function textOf(el: Element, inHeading: boolean): string {
  let out = '';
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.nodeValue ?? '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element;
      if (skipped(child)) return;
      const tag = child.tagName.toLowerCase();
      if (tag === 'button' && !inHeading) return;
      if (tag === 'br') { out += ' '; return; }
      out += ` ${textOf(child, inHeading)} `;
    }
  });
  return out;
}

/** A list whose every item is just a link (a grid of states or suburbs): useful to look at, tiring to hear. */
function isLinkList(list: Element): boolean {
  const items = Array.from(list.children).filter((c) => c.tagName.toLowerCase() === 'li');
  if (items.length < 4) return false;
  return items.every((li) => {
    const total = (li.textContent ?? '').replace(/\s+/g, '').length;
    const linked = Array.from(li.querySelectorAll('a, button')).reduce((n, a) => n + (a.textContent ?? '').replace(/\s+/g, '').length, 0);
    return total > 0 && linked / total >= 0.8;
  });
}

/** A short line made only of link text: "All articles", "Read the guide", "Worker login". */
function linkOnly(text: string, linkChars: number): boolean {
  const total = text.replace(/\s+/g, '').length;
  const words = text.split(/\s+/).filter(Boolean).length;
  return total > 0 && words <= 12 && linkChars / total >= 0.9;
}

function linkChars(el: Element): number {
  return Array.from(el.querySelectorAll('a')).reduce((n, a) => n + (a.textContent ?? '').replace(/\s+/g, '').length, 0)
    + (el.tagName.toLowerCase() === 'a' ? (el.textContent ?? '').replace(/\s+/g, '').length : 0);
}

function emit(out: ReadBlock[], el: HTMLElement, raw: string, heading: boolean, links = 0) {
  let text = cleanForSpeech(raw);
  if (text.length < 2) return;
  if (!heading && linkOnly(text, links)) return;
  if (heading && !/[.!?:]$/.test(text)) text += '.';
  const last = out[out.length - 1];
  if (last && last.text === text) return;
  out.push({ el, text, heading });
}

function walk(el: Element, out: ReadBlock[]) {
  if (skipped(el)) return;
  const tag = el.tagName.toLowerCase();
  if (tag === 'button' || tag === 'input') return;

  // A sliding question row: the question as a heading, then its answer.
  if (el.classList.contains('acc-row')) {
    const title = el.querySelector('.acc-title');
    const heading = el.querySelector('h1, h2, h3, h4') as HTMLElement | null;
    if (title) emit(out, heading ?? (el as HTMLElement), title.textContent ?? '', true);
    const panel = el.querySelector('.acc-panel-inner');
    if (panel) Array.from(panel.children).forEach((c) => walk(c, out));
    return;
  }

  if ((tag === 'ul' || tag === 'ol') && isLinkList(el)) return;

  if (LEAF.has(tag) && !(tag === 'li' && el.querySelector(BLOCK_CHILD))) {
    const isHeading = /^h[1-6]$/.test(tag) || tag === 'summary';
    emit(out, el as HTMLElement, textOf(el, isHeading), isHeading, linkChars(el));
    return;
  }

  // A container: read its block children in order, and any loose text between them as its own run.
  let run = '';
  let runLinks = 0;
  const flush = () => {
    emit(out, el as HTMLElement, run, false, runLinks);
    run = '';
    runLinks = 0;
  };
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      run += node.nodeValue ?? '';
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const child = node as Element;
    if (skipped(child)) return;
    const childTag = child.tagName.toLowerCase();
    if (INLINE.has(childTag)) {
      if (childTag !== 'button') {
        run += ` ${textOf(child, false)} `;
        runLinks += linkChars(child);
      }
      return;
    }
    flush();
    walk(child, out);
  });
  flush();
}

/** The page's readable blocks, in order. */
export function collectReadableBlocks(): ReadBlock[] {
  const root = (document.querySelector('main') ?? document.querySelector('[role="main"]') ?? document.getElementById('root') ?? document.body) as HTMLElement;
  const out: ReadBlock[] = [];

  // Many pages put their headline and introduction in a banner above <main>.
  const h1 = document.querySelector('h1') as HTMLElement | null;
  if (h1 && !root.contains(h1) && !skipped(h1)) {
    emit(out, h1, textOf(h1, true), true);
    const sub = h1.parentElement?.querySelector('.directory-page-subtitle, .page-subtitle, .hero-subtitle, p') as HTMLElement | null;
    if (sub && !skipped(sub)) emit(out, sub, textOf(sub, false), false);
  }

  walk(root, out);
  return out;
}

const MAX_CHUNK = 230;

/** Splits text into sentence-sized pieces. Long single utterances are cut off by some browsers and cannot be resumed. */
export function splitSentences(text: string): string[] {
  const parts = text.replace(/([.!?]["')\]]*)\s+/g, '$1\u0001').split('\u0001').map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    let rest = part;
    while (rest.length > MAX_CHUNK) {
      let cut = Math.max(rest.lastIndexOf(', ', MAX_CHUNK), rest.lastIndexOf('; ', MAX_CHUNK), rest.lastIndexOf(': ', MAX_CHUNK));
      if (cut < 80) cut = rest.lastIndexOf(' ', MAX_CHUNK);
      if (cut < 40) cut = MAX_CHUNK;
      out.push(rest.slice(0, cut + 1).trim());
      rest = rest.slice(cut + 1).trim();
    }
    if (rest) out.push(rest);
  }
  return out;
}

export function chunkBlocks(blocks: ReadBlock[]): ReadChunk[] {
  const chunks: ReadChunk[] = [];
  blocks.forEach((block, i) => {
    splitSentences(block.text).forEach((text, n) => {
      chunks.push({ text, block: i, sectionStart: block.heading && n === 0 });
    });
  });
  return chunks;
}

/** Text the person selected on the page, if they selected a sentence or more. */
export function selectedText(): string {
  const sel = window.getSelection?.();
  const text = sel ? cleanForSpeech(sel.toString()) : '';
  return text.length >= 20 ? text : '';
}
