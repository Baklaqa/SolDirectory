import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  A11Y_HIDE_KEY, STEPS, applyToPage, domFor, dropProfiles, effective, loadState, saveState,
  type A11yChoices, type A11yState, type ProfileName, type StepKey,
} from '../lib/accessibilityPrefs';
import { A11Y_ICONS } from './accessibilityIcons';
import './AccessibilityMenu.css';

/**
 * The accessibility menu: a tab on the left edge that opens "Accessibility Adjustments". It is the same menu, with the same options and
 * behaviour, as the one on solbusinessconsultant.com.au (assets/js/sol-a11y.js there), written for this React app. Settings and what they
 * do are in lib/accessibilityPrefs.ts; the look is in AccessibilityMenu.css. Choices are kept in this browser only.
 */

const PROFILES: { name: ProfileName; title: string; sub: string; desc: string }[] = [
  { name: 'seizure', title: 'Seizure Safe', sub: 'Reduces flashing and motion', desc: 'Stops animations and tones down strong colours so flashing or moving content is less likely to cause discomfort.' },
  { name: 'vision', title: 'Low Vision', sub: 'Larger, clearer, higher contrast', desc: 'Increases text size and contrast, switches to an easy-to-read font and shows a clear outline around whatever has keyboard focus.' },
  { name: 'adhd', title: 'ADHD Friendly', sub: 'Fewer distractions, more focus', desc: 'Stops animations and adds a reading mask that dims everything except the lines you are reading.' },
  { name: 'cognitive', title: 'Reading & Cognitive', sub: 'Easier reading and navigation', desc: 'Highlights headings and links, uses an easy-to-read font and stops moving content.' },
  { name: 'keyboard', title: 'Keyboard Navigation', sub: 'Use the website with the keyboard', desc: 'Shows a strong focus outline and adds shortcuts: H headings, L links, B buttons, F form fields, G images, M menus. Hold Shift to go back.' },
  { name: 'screen', title: 'Screen Reader Support', sub: 'Hear the page read aloud', desc: "Reads text aloud when you click it or move to it with the keyboard. If you already use a screen reader such as JAWS, NVDA, VoiceOver or TalkBack, you don't need this." },
  { name: 'older', title: 'Older Adults', sub: 'Bigger text, calmer pages', desc: 'Increases text size, line spacing and contrast, and stops animations for a calmer, easier read.' },
];

const STEP_ROWS: { key: StepKey; label: string }[] = [
  { key: 'scale', label: 'Content scaling' },
  { key: 'font', label: 'Font size' },
  { key: 'line', label: 'Line height' },
  { key: 'space', label: 'Letter spacing' },
];

type Tile = { spec: string; label: string };
const CONTENT_TILES: Tile[] = [
  { spec: 'readable', label: 'Readable Font' }, { spec: 'titles', label: 'Highlight Titles' }, { spec: 'links', label: 'Highlight Links' },
  { spec: 'magnify', label: 'Text Magnifier' }, { spec: 'align=left', label: 'Align Left' }, { spec: 'align=center', label: 'Align Center' }, { spec: 'align=right', label: 'Align Right' },
];
const COLOUR_TILES: Tile[] = [
  { spec: 'color=dark', label: 'Dark Contrast' }, { spec: 'color=light', label: 'Light Contrast' }, { spec: 'color=contrast', label: 'High Contrast' },
  { spec: 'sat=high', label: 'High Saturation' }, { spec: 'sat=low', label: 'Low Saturation' }, { spec: 'sat=mono', label: 'Monochrome' },
];
const ORIENT_TILES: Tile[] = [
  { spec: 'read', label: 'Read Aloud' }, { spec: 'readmode', label: 'Read Mode' }, { spec: 'guide', label: 'Reading Guide' }, { spec: 'mask', label: 'Reading Mask' },
  { spec: 'still', label: 'Stop Animations' }, { spec: 'mute', label: 'Mute Sounds' }, { spec: 'noimg', label: 'Hide Images' }, { spec: 'hover', label: 'Highlight Hover' },
  { spec: 'focus', label: 'Highlight Focus' }, { spec: 'cursor=black', label: 'Big Black Cursor' }, { spec: 'cursor=white', label: 'Big White Cursor' },
];

const COLOURS: { hex: string; name: string }[] = [
  { hex: '#0f172a', name: 'Black' }, { hex: '#ffffff', name: 'White' }, { hex: '#b45309', name: 'Amber' }, { hex: '#b91c1c', name: 'Red' },
  { hex: '#15803d', name: 'Green' }, { hex: '#1d4ed8', name: 'Blue' }, { hex: '#6d28d9', name: 'Purple' }, { hex: '#fde047', name: 'Yellow' },
];
const COLOUR_ROWS: { key: 'txc' | 'ttc' | 'bgc'; label: string }[] = [
  { key: 'txc', label: 'Text colour' }, { key: 'ttc', label: 'Title colour' }, { key: 'bgc', label: 'Background colour' },
];

const READABLE = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, td, th, dt, dd, label, summary, a, button';
const JUMP: Record<string, string> = {
  h: 'h1, h2, h3, h4, h5, h6',
  l: 'a[href]',
  b: 'button, [role="button"], input[type="submit"], input[type="button"]',
  f: 'input:not([type="hidden"]), select, textarea',
  g: 'img, svg[role="img"], [role="img"]',
  m: 'nav, [role="navigation"], [role="menubar"], [role="menu"]',
};
const JUMP_NAMES: Record<string, string> = { h: 'heading', l: 'link', b: 'button', f: 'form field', g: 'image', m: 'menu' };
// Left out of read mode and the "on this page" list: navigation, forms, the cookie notice and the menu itself.
const SKIP = 'header, nav, footer, form, aside, script, style, noscript, [aria-hidden="true"], .sd-a11y, .cc';

const Ico = ({ name }: { name: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: A11Y_ICONS[name] ?? '' }} />
);

const visible = (el: Element) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
const mainArea = (): Element => document.querySelector('main, [role="main"], #main-content') ?? document.body;
const textOf = (el: Element) => el.getAttribute('aria-label') || (el as HTMLElement).innerText || el.textContent || el.getAttribute('alt') || '';

interface LinkChoice { label: string; value: string }

function buildLinks(): { here: LinkChoice[]; pages: LinkChoice[] } {
  const here: LinkChoice[] = [];
  let n = 0;
  mainArea().querySelectorAll<HTMLElement>('h2, h3').forEach((h) => {
    if (n > 30 || h.closest(SKIP) || !visible(h)) return;
    const text = (h.innerText || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    if (!h.id) h.id = `sd-a11y-section-${++n}`; else n++;
    here.push({ label: text.slice(0, 70), value: `#${h.id}` });
  });
  const pages: LinkChoice[] = [];
  const seen = new Set<string>();
  document.querySelectorAll<HTMLAnchorElement>('header a[href], nav a[href]').forEach((a) => {
    if (a.closest('.sd-a11y') || pages.length >= 40) return;
    const raw = a.getAttribute('href') ?? '';
    const path = raw.startsWith('/') && !raw.startsWith('//') ? raw : raw.startsWith(window.location.origin) ? raw.slice(window.location.origin.length) : '';
    const text = (a.innerText || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
    if (!path || !text || seen.has(path.split('#')[0])) return;
    seen.add(path.split('#')[0]);
    pages.push({ label: text.slice(0, 60), value: path });
  });
  return { here, pages };
}

export default function AccessibilityMenu() {
  const navigate = useNavigate();
  const [state, setState] = useState<A11yState>(loadState);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [links, setLinks] = useState<{ here: LinkChoice[]; pages: LinkChoice[] }>({ here: [], pages: [] });

  const eff = useMemo(() => effective(state), [state]);
  const effRef = useRef<A11yChoices>(eff);
  const prevRef = useRef<A11yChoices>({});
  const readyRef = useRef(false);
  const openRef = useRef(false);
  effRef.current = eff;
  openRef.current = open;

  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLElement>(null);
  const readerBodyRef = useRef<HTMLElement>(null);
  const readerCloseRef = useRef<HTMLButtonElement>(null);
  const speakRef = useRef<(text: string) => void>(() => {});

  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const hasActive = Object.keys(eff).some((k) => (eff as Record<string, unknown>)[k] && k !== 'readmode');

  /* ---------- Put the choices on the page and remember them ---------- */
  useEffect(() => {
    const { classes, vars } = domFor(eff);
    applyToPage(classes, vars);
    saveState(state, classes, vars);
  }, [state, eff]);

  /* ---------- Open and close ---------- */
  const openMenu = useCallback(() => {
    document.documentElement.classList.remove('a11y-ui-hidden');
    try { sessionStorage.removeItem(A11Y_HIDE_KEY); } catch { /* ignore */ }
    setLinks(buildLinks());
    setOpen(true);
  }, []);
  const closeMenu = useCallback((refocus: boolean) => {
    if (!openRef.current) return;
    setOpen(false);
    if (refocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const t = window.setTimeout(() => setShown(true), 16);
      const f = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true }), 40);
      return () => { window.clearTimeout(t); window.clearTimeout(f); };
    }
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), 220);
    return () => window.clearTimeout(t);
  }, [open]);

  /* ---------- Controls ---------- */
  const toggleOption = (spec: string) => {
    const [k, val] = spec.split('=');
    setState((prev) => {
      const e = effective(prev) as Record<string, unknown>;
      let next: Record<string, unknown> = { ...prev };
      if (val !== undefined) {
        if (e[k] === val) { next[k] = ''; next = dropProfiles(next as A11yState, k) as Record<string, unknown>; } else next[k] = val;
      } else if (e[k]) { next[k] = false; next = dropProfiles(next as A11yState, k) as Record<string, unknown>; } else next[k] = true;
      return next as A11yState;
    });
  };
  const step = (k: StepKey, by: number) => setState((prev) => {
    const e = effective(prev) as Record<string, number | undefined>;
    const n = Math.max(STEPS[k].min, Math.min(STEPS[k].max, (e[k] || 0) + by));
    const next = { ...prev, [k]: n } as A11yState;
    return by < 0 ? dropProfiles(next, k, n) : next;
  });
  const pickColour = (k: 'txc' | 'ttc' | 'bgc', hex: string) => setState((prev) => {
    const e = effective(prev) as Record<string, unknown>;
    return { ...prev, [k]: hex && e[k] !== hex ? hex : '' };
  });
  const toggleProfile = (name: ProfileName) => setState((prev) => ({ ...prev, p: { ...(prev.p ?? {}), [name]: !prev.p?.[name] } }));
  const resetAll = () => { if (canSpeak) window.speechSynthesis.cancel(); setState({}); };
  const hideMenu = () => {
    try { sessionStorage.setItem(A11Y_HIDE_KEY, '1'); } catch { /* ignore */ }
    closeMenu(false);
    document.documentElement.classList.add('a11y-ui-hidden');
  };
  const pickLink = (value: string) => {
    if (!value) return;
    closeMenu(false);
    if (value.startsWith('#')) {
      document.getElementById(value.slice(1))?.scrollIntoView({ block: 'start', behavior: effRef.current.still ? 'auto' : 'smooth' });
    } else navigate(value);
  };

  /* ---------- Things that need script, not just CSS: reading aloud, helpers drawn over the page, shortcuts, read mode ---------- */
  useEffect(() => {
    const html = document.documentElement;
    const synth = canSpeak ? window.speechSynthesis : null;
    let voice: SpeechSynthesisVoice | null = null;
    const pickVoice = () => {
      if (!synth) return;
      const v = synth.getVoices();
      voice = v.find((x) => /en-AU/i.test(x.lang)) ?? v.find((x) => /en-GB/i.test(x.lang)) ?? v.find((x) => /^en/i.test(x.lang)) ?? null;
    };
    if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }
    const speak = (text: string) => {
      if (!synth) return;
      const t = String(text || '').replace(/\s+/g, ' ').trim();
      if (!t) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(t.slice(0, 4000));
      if (voice) u.voice = voice;
      u.lang = voice ? voice.lang : 'en-AU';
      synth.speak(u);
    };
    speakRef.current = speak;

    const outside = (el: Element | null): el is Element => !!el && !rootRef.current?.contains(el);
    let lit: Element | null = null;
    const light = (el: Element | null) => {
      if (lit === el) return;
      lit?.classList.remove('sd-a11y-reading');
      lit = el;
      lit?.classList.add('sd-a11y-reading');
    };
    let hoverEl: Element | null = null;
    const hovered = (el: Element | null) => {
      if (hoverEl === el) return;
      hoverEl?.classList.remove('sd-a11y-hovered');
      hoverEl = el;
      hoverEl?.classList.add('sd-a11y-hovered');
    };
    const E = () => effRef.current;

    const onClick = (e: MouseEvent) => {
      if (rootRef.current && openRef.current && !rootRef.current.contains(e.target as Node)) closeMenu(false);
      if (!E().read) return;
      const sel = window.getSelection ? String(window.getSelection()) : '';
      if (sel.trim()) return;
      const el = (e.target as Element).closest?.(READABLE) ?? null;
      if (outside(el)) speak(textOf(el));
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!E().read || !outside(e.target as Element)) return;
      const sel = window.getSelection ? String(window.getSelection()) : '';
      if (sel.trim()) speak(sel);
    };
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Element;
      if (E().read && outside(t) && t.matches?.('a, button, input, select, textarea, [tabindex]')) speak(textOf(t) || t.getAttribute('placeholder') || '');
    };
    const onMouseOver = (e: MouseEvent) => {
      const t = e.target as Element;
      const el = E().read && t.closest ? t.closest(READABLE) : null;
      light(outside(el) ? el : null);
      if (E().hover) hovered(outside(t) && t !== document.body && t !== html ? t : null);
    };

    let frame = 0;
    let px = 0;
    let py = 0;
    let target: Element | null = null;
    const follow = () => {
      frame = 0;
      const e = E();
      const guide = guideRef.current;
      const mask = maskRef.current;
      const lens = lensRef.current;
      if (e.guide && guide) guide.style.transform = `translateY(${py - 6}px)`;
      if (e.mask && mask) {
        const band = 70;
        (mask.children[0] as HTMLElement).style.height = `${Math.max(0, py - band)}px`;
        (mask.children[1] as HTMLElement).style.top = `${py + band}px`;
      }
      if (e.magnify && lens) {
        const el = target && target.closest ? target.closest(READABLE) : null;
        const text = outside(el) ? textOf(el).replace(/\s+/g, ' ').trim() : '';
        if (!text) { lens.hidden = true; return; }
        lens.textContent = text.length > 280 ? `${text.slice(0, 280)}…` : text;
        lens.hidden = false;
        const w = lens.offsetWidth;
        const h = lens.offsetHeight;
        const x = Math.min(px + 18, window.innerWidth - w - 10);
        const y = py + 24 + h > window.innerHeight ? py - h - 16 : py + 24;
        lens.style.transform = `translate(${Math.max(10, x)}px,${Math.max(10, y)}px)`;
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      const f = E();
      if (!f.guide && !f.mask && !f.magnify) return;
      px = e.clientX; py = e.clientY; target = e.target as Element;
      if (!frame) frame = requestAnimationFrame(follow);
    };
    const onMouseLeave = () => { if (lensRef.current) lensRef.current.hidden = true; };

    const onKeyDown = (e: KeyboardEvent) => {
      // Alt + A opens or closes the menu (and brings it back after "Hide menu"); Escape closes read mode, then the menu.
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyA') {
        e.preventDefault();
        if (openRef.current) closeMenu(true); else openMenu();
        return;
      }
      if (e.key === 'Escape') {
        if (E().readmode) { setState((p) => ({ ...p, readmode: false })); toggleRef.current?.focus(); } else if (openRef.current) closeMenu(true);
        return;
      }
      // Keyboard shortcuts (Keyboard Navigation profile): H headings, L links, B buttons, F form fields, G images, M menus; Shift goes back.
      if (!E().kbd || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))) return;
      const k = String(e.key || '').toLowerCase();
      if (!JUMP[k]) return;
      const list = Array.from(document.querySelectorAll(JUMP[k])).filter((el) => outside(el) && visible(el)) as HTMLElement[];
      if (!list.length) return;
      e.preventDefault();
      const here = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
      let pick: HTMLElement | undefined;
      if (e.shiftKey) {
        for (let i = list.length - 1; i >= 0; i--) { if (here && (here.compareDocumentPosition(list[i]) & Node.DOCUMENT_POSITION_PRECEDING)) { pick = list[i]; break; } }
        pick = pick ?? list[list.length - 1];
      } else {
        for (let j = 0; j < list.length; j++) { if (!here || ((here.compareDocumentPosition(list[j]) & Node.DOCUMENT_POSITION_FOLLOWING) && !here.contains(list[j]))) { pick = list[j]; break; } }
        pick = pick ?? list[0];
      }
      if (!pick.matches('a[href], button, input, select, textarea, [tabindex]')) pick.setAttribute('tabindex', '-1');
      pick.focus({ preventScroll: true });
      pick.scrollIntoView({ block: 'center', behavior: E().still ? 'auto' : 'smooth' });
      if (E().read) speak(`${JUMP_NAMES[k]}: ${textOf(pick)}`);
    };

    const onPlay = (e: Event) => {
      const m = e.target as HTMLMediaElement;
      if (E().mute && m && !m.muted) { m.muted = true; m.setAttribute('data-a11y-muted', ''); }
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('play', onPlay, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('play', onPlay, true);
      if (frame) cancelAnimationFrame(frame);
      light(null);
      hovered(null);
      if (synth) { synth.cancel(); synth.onvoiceschanged = null; }
    };
  }, [canSpeak, closeMenu, openMenu]);

  /* ---------- When an option changes ---------- */
  useEffect(() => {
    const prev = prevRef.current;
    const html = document.documentElement;
    const synth = canSpeak ? window.speechSynthesis : null;
    if (readyRef.current && eff.read && !prev.read) speakRef.current('Read aloud is on. Click any text to hear it.');
    if (!eff.read && prev.read && synth) synth.cancel();
    // Mute sounds and pause moving video.
    document.querySelectorAll<HTMLMediaElement>('audio, video').forEach((m) => {
      if (eff.mute && !m.muted) { m.muted = true; m.setAttribute('data-a11y-muted', ''); }
      if (!eff.mute && m.hasAttribute('data-a11y-muted')) { m.muted = false; m.removeAttribute('data-a11y-muted'); }
      if (eff.still && !prev.still && !m.paused && (m.autoplay || m.loop)) m.pause();
    });
    if (!eff.hover) document.querySelectorAll('.sd-a11y-hovered').forEach((el) => el.classList.remove('sd-a11y-hovered'));
    if (!eff.magnify && lensRef.current) lensRef.current.hidden = true;

    // Read mode: the page's text in one calm column.
    if (eff.readmode && !prev.readmode) {
      const body = readerBodyRef.current;
      if (body) {
        body.innerHTML = '';
        const h = document.createElement('h1');
        h.textContent = ((document.querySelector<HTMLElement>('main h1, h1')?.innerText) || document.title).replace(/\s+/g, ' ').trim();
        body.appendChild(h);
        let last = h.textContent.trim();
        let count = 0;
        mainArea().querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, dt, dd').forEach((el) => {
          if (count > 500 || el.closest(SKIP) || !visible(el)) return;
          if (/^(LI|DD|BLOCKQUOTE)$/.test(el.tagName) && el.querySelector('p, li, h1, h2, h3, h4, h5, h6')) return; // its children are added instead
          const text = (el.innerText || '').replace(/\s+/g, ' ').trim();
          if (!text || text === last) return;
          last = text;
          const tag = /^H[1-6]$/.test(el.tagName) ? (el.tagName === 'H1' ? 'h2' : el.tagName.toLowerCase()) : 'p';
          const out = document.createElement(tag);
          out.textContent = text;
          if (el.tagName === 'LI') out.className = 'is-item';
          body.appendChild(out);
          count++;
        });
      }
      html.classList.add('a11y-reading-mode');
      if (readerRef.current) readerRef.current.scrollTop = 0;
      setOpen(false);
      window.setTimeout(() => readerCloseRef.current?.focus(), 30);
    }
    if (!eff.readmode && prev.readmode) html.classList.remove('a11y-reading-mode');

    prevRef.current = eff;
    readyRef.current = true;
  }, [eff, canSpeak]);

  // Back at the top of a new page, read mode is not kept from the one before.
  useEffect(() => () => { document.documentElement.classList.remove('a11y-reading-mode'); }, []);

  const pressed = (spec: string) => {
    const [k, val] = spec.split('=');
    const e = eff as Record<string, unknown>;
    return val !== undefined ? e[k] === val : !!e[k];
  };
  const value = (k: StepKey) => ((eff as Record<string, number | undefined>)[k] || 0);

  const tile = ({ spec, label }: Tile) => {
    if (!canSpeak && spec === 'read') return null;
    const on = pressed(spec);
    return (
      <button key={spec} type="button" className={`sd-a11y__opt${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => toggleOption(spec)}>
        <span className="sd-a11y__icon"><Ico name={`set:${spec}`} /></span>
        <span className="sd-a11y__label">{label}</span>
        <span className="sd-a11y__tick"><Ico name="check" /></span>
      </button>
    );
  };

  const node = (
    <div ref={rootRef} className={`sd-a11y${open ? ' is-open' : ''}${shown ? ' is-shown' : ''}${hasActive ? ' has-active' : ''}`}>
      <button ref={toggleRef} type="button" className="sd-a11y__launch" aria-expanded={open} aria-controls="sd-a11y-panel" aria-label="Accessibility menu (Alt + A)" onClick={() => (open ? closeMenu(false) : openMenu())}>
        <span className="sd-a11y__tile"><Ico name="access" /><span className="sd-a11y__dot" aria-hidden="true" /></span>
        <span className="sd-a11y__tab-label" aria-hidden="true">Accessibility</span>
      </button>

      {mounted && (
        <section ref={panelRef} className="sd-a11y__panel" id="sd-a11y-panel" role="dialog" aria-labelledby="sd-a11y-title">
          <header className="sd-a11y__head">
            <div className="sd-a11y__head-top">
              <span className="sd-a11y__badge"><Ico name="access" /></span>
              <div>
                <p className="sd-a11y__title" id="sd-a11y-title">Accessibility Adjustments</p>
                <p className="sd-a11y__sub">Shortcut: Alt + A</p>
              </div>
              <button type="button" className="sd-a11y__close" aria-label="Close accessibility menu" onClick={() => closeMenu(true)}><Ico name="close" /></button>
            </div>
            <div className="sd-a11y__actions">
              <button type="button" onClick={resetAll}><Ico name="reset" />Reset settings</button>
              <Link to="/accessibility" onClick={() => closeMenu(false)}><Ico name="statement" />Statement</Link>
              <button type="button" onClick={hideMenu}><Ico name="hide" />Hide menu</button>
            </div>
          </header>

          <div className="sd-a11y__body">
            <h2 className="sd-a11y__h">Choose a profile</h2>
            <div className="sd-a11y__profiles">
              {PROFILES.filter((p) => canSpeak || p.name !== 'screen').map((p) => {
                const on = !!state.p?.[p.name];
                return (
                  <div key={p.name} className={`sd-a11y__profile${on ? ' is-on' : ''}`}>
                    <button type="button" className="sd-a11y__switch" role="switch" aria-checked={on} aria-describedby={`sd-a11y-p-${p.name}`} onClick={() => toggleProfile(p.name)}>
                      <span className="sd-a11y__track" aria-hidden="true"><span>OFF</span><span>ON</span></span>
                      <span className="sd-a11y__p-icon"><Ico name={`profile:${p.name}`} /></span>
                      <span className="sd-a11y__p-text"><strong>{p.title}</strong><span>{p.sub}</span></span>
                    </button>
                    <p className="sd-a11y__p-desc" id={`sd-a11y-p-${p.name}`}>{p.desc}</p>
                  </div>
                );
              })}
            </div>

            <h2 className="sd-a11y__h">Content adjustments</h2>
            {STEP_ROWS.map((r) => {
              const n = value(r.key);
              return (
                <div key={r.key} className={`sd-a11y__size${n !== 0 ? ' is-on' : ''}`}>
                  <span className="sd-a11y__size-label"><Ico name={`step:${r.key}`} />{r.label}</span>
                  <div className="sd-a11y__stepper">
                    <button type="button" aria-label={`Decrease ${r.label.toLowerCase()}`} disabled={n <= STEPS[r.key].min} onClick={() => step(r.key, -1)}><Ico name="minus" /></button>
                    <output aria-live="polite">{n === 0 && r.key !== 'line' && r.key !== 'space' ? 'Default' : STEPS[r.key].show(n)}</output>
                    <button type="button" aria-label={`Increase ${r.label.toLowerCase()}`} disabled={n >= STEPS[r.key].max} onClick={() => step(r.key, 1)}><Ico name="plus" /></button>
                  </div>
                </div>
              );
            })}
            <div className="sd-a11y__grid">{CONTENT_TILES.map(tile)}</div>

            <h2 className="sd-a11y__h">Colour adjustments</h2>
            <div className="sd-a11y__grid">{COLOUR_TILES.map(tile)}</div>
            {COLOUR_ROWS.map((r) => {
              const current = (eff as Record<string, string | undefined>)[r.key];
              return (
                <div key={r.key} className="sd-a11y__colours" role="group" aria-label={r.label}>
                  <span className="sd-a11y__size-label"><Ico name="palette" />{r.label}</span>
                  <div className="sd-a11y__swatches">
                    {COLOURS.map((c) => (
                      <button key={c.hex} type="button" className="sd-a11y__swatch" style={{ '--sw': c.hex } as React.CSSProperties} aria-pressed={current === c.hex} aria-label={c.name} title={c.name} onClick={() => pickColour(r.key, c.hex)} />
                    ))}
                    <button type="button" className="sd-a11y__swatch-off" aria-label={`Cancel ${r.label.toLowerCase()}`} disabled={!current} onClick={() => pickColour(r.key, '')}>Cancel</button>
                  </div>
                </div>
              );
            })}

            <h2 className="sd-a11y__h">Orientation adjustments</h2>
            <label className="sd-a11y__links-pick">
              <span className="sd-a11y__size-label"><Ico name="links" />Useful links</span>
              <select value="" onChange={(e) => pickLink(e.target.value)}>
                <option value="">Select an option</option>
                {links.here.length > 0 && <optgroup label="On this page">{links.here.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}</optgroup>}
                {links.pages.length > 0 && <optgroup label="Pages">{links.pages.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}</optgroup>}
              </select>
            </label>
            <div className="sd-a11y__grid">{ORIENT_TILES.map(tile)}</div>
            {eff.read && <p className="sd-a11y__hint">Read Aloud is on. Click any text, or select some, to hear it.</p>}
            {eff.kbd && <p className="sd-a11y__hint">Keyboard shortcuts are on: H headings, L links, B buttons, F form fields, G images, M menus. Add Shift to go back.</p>}

            <button type="button" className="sd-a11y__reset" onClick={resetAll}><Ico name="reset" />Reset all settings</button>
            <p className="sd-a11y__foot">Your choices are saved in this browser only.</p>
          </div>
        </section>
      )}

      <div ref={guideRef} className="sd-a11y__guide" aria-hidden="true" hidden={!eff.guide} />
      <div ref={maskRef} className="sd-a11y__mask" aria-hidden="true" hidden={!eff.mask}><span /><span /></div>
      <div ref={lensRef} className="sd-a11y__lens" aria-hidden="true" hidden />
      <section ref={readerRef} className="sd-a11y__reader" role="dialog" aria-modal="true" aria-label="Read mode" hidden={!eff.readmode}>
        <div className="sd-a11y__reader-bar">
          <strong>Read mode</strong>
          <button ref={readerCloseRef} type="button" onClick={() => { setState((p) => ({ ...p, readmode: false })); toggleRef.current?.focus(); }}><Ico name="x" />Close read mode</button>
        </div>
        <article ref={readerBodyRef} className="sd-a11y__reader-body" />
      </section>
    </div>
  );

  return createPortal(node, document.body);
}
