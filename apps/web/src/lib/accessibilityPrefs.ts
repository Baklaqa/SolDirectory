import { useEffect, useState } from 'react';

/**
 * The accessibility menu's settings (components/AccessibilityMenu.tsx). The same model as the menu on solbusinessconsultant.com.au.
 *
 * Every adjustment becomes a class on <html> (`a11y-*`) and, for amounts and colours, a CSS variable (`--a11y-*`). They are kept in this
 * browser only (localStorage) and never sent anywhere. index.html copies the saved classes and variables onto <html> before the page paints.
 *
 * Profiles (Low Vision, ADHD Friendly...) switch on a bundle of options. A profile's options sit on top of the visitor's own choices, so
 * turning a profile off removes only what it added.
 */
export const A11Y_KEY = 'soldirectory-a11y';
export const A11Y_HIDE_KEY = 'soldirectory-a11y-hide';

export type ProfileName = 'seizure' | 'vision' | 'adhd' | 'cognitive' | 'keyboard' | 'screen' | 'older';

export interface A11yChoices {
  /** Steps: content scaling and font size -2..5 (10% each), line height and letter spacing 0..4. */
  scale?: number;
  font?: number;
  line?: number;
  space?: number;
  readable?: boolean;
  titles?: boolean;
  links?: boolean;
  magnify?: boolean;
  align?: '' | 'left' | 'center' | 'right';
  color?: '' | 'dark' | 'light' | 'contrast';
  sat?: '' | 'high' | 'low' | 'mono';
  txc?: string;
  ttc?: string;
  bgc?: string;
  read?: boolean;
  readmode?: boolean;
  guide?: boolean;
  mask?: boolean;
  still?: boolean;
  mute?: boolean;
  noimg?: boolean;
  hover?: boolean;
  focus?: boolean;
  kbd?: boolean;
  cursor?: '' | 'black' | 'white';
}

export interface A11yState extends A11yChoices {
  p?: Partial<Record<ProfileName, boolean>>;
}

export type StepKey = 'scale' | 'font' | 'line' | 'space';

export const STEPS: Record<StepKey, { min: number; max: number; show: (n: number) => string }> = {
  scale: { min: -2, max: 5, show: (n) => `${100 + n * 10}%` },
  font: { min: -2, max: 5, show: (n) => `${100 + n * 10}%` },
  line: { min: 0, max: 4, show: (n) => ['Default', '1.6', '1.9', '2.2', '2.5'][n] },
  space: { min: 0, max: 4, show: (n) => (n ? `Level ${n}` : 'Default') },
};

const LINE = [0, 1.6, 1.9, 2.2, 2.5];
const FILTER = { contrast: 'contrast(1.4)', high: 'saturate(2)', low: 'saturate(.45)', mono: 'grayscale(1)' } as const;
const VARS = ['--a11y-zoom', '--a11y-text-scale', '--a11y-lh', '--a11y-ls', '--a11y-ws', '--a11y-filter', '--a11y-txc', '--a11y-ttc', '--a11y-bgc'];

/** What each profile switches on. A number is a step to reach, a string a value to use, true an option to turn on. */
export const BUNDLES: Record<ProfileName, Record<string, number | string | boolean>> = {
  seizure: { still: 1, sat: 'low' },
  vision: { font: 2, color: 'contrast', readable: 1, focus: 1 },
  adhd: { still: 1, mask: 1 },
  cognitive: { titles: 1, links: 1, readable: 1, still: 1 },
  keyboard: { focus: 1, kbd: 1 },
  screen: { read: 1, focus: 1 },
  older: { font: 2, line: 1, color: 'contrast', still: 1 },
};

export function loadState(): A11yState {
  try {
    const saved = JSON.parse(localStorage.getItem(A11Y_KEY) ?? 'null');
    return saved && typeof saved.s === 'object' && saved.s ? (saved.s as A11yState) : {};
  } catch {
    return {};
  }
}

/** The options that are really on: the visitor's own choices plus whatever the switched-on profiles add. */
export function effective(state: A11yState): A11yChoices {
  const e: Record<string, unknown> = {};
  (Object.keys(state) as (keyof A11yState)[]).forEach((k) => { if (k !== 'p') e[k] = state[k]; });
  const profiles = state.p ?? {};
  (Object.keys(profiles) as ProfileName[]).forEach((name) => {
    const bundle = BUNDLES[name];
    if (!profiles[name] || !bundle) return;
    Object.keys(bundle).forEach((k) => {
      const v = bundle[k];
      if (k in STEPS) e[k] = Math.max((e[k] as number) || 0, v as number);
      else if (typeof v === 'string') { if (!(state as Record<string, unknown>)[k]) e[k] = v; }
      else e[k] = true;
    });
  });
  return e as A11yChoices;
}

/** Turning off something a profile switched on also switches that profile off. */
export function dropProfiles(state: A11yState, k: string, keepAtOrBelow?: number): A11yState {
  const p = { ...(state.p ?? {}) };
  (Object.keys(p) as ProfileName[]).forEach((name) => {
    const b = BUNDLES[name];
    if (!p[name] || !b || !(k in b)) return;
    if (keepAtOrBelow !== undefined && (b[k] as number) <= keepAtOrBelow) return;
    p[name] = false;
  });
  return { ...state, p };
}

/** The classes and CSS variables that show these options on the page. */
export function domFor(eff: A11yChoices): { classes: string[]; vars: Record<string, string> } {
  const c: string[] = [];
  const v: Record<string, string> = {};
  if (eff.scale) { c.push('a11y-scale'); v['--a11y-zoom'] = String(1 + eff.scale / 10); }
  // Font size multiplies every font-size in the site's CSS (the "sd-scale-text" step in vite.config.ts), not only the few written in rem.
  if (eff.font) { c.push('a11y-font'); v['--a11y-text-scale'] = String(1 + eff.font / 10); }
  if (eff.line) { c.push('a11y-line'); v['--a11y-lh'] = String(LINE[eff.line]); }
  if (eff.space) { c.push('a11y-space'); v['--a11y-ls'] = `${(eff.space * 0.04).toFixed(2)}em`; v['--a11y-ws'] = `${(eff.space * 0.08).toFixed(2)}em`; }
  (['readable', 'titles', 'links', 'noimg', 'still', 'hover', 'focus', 'read', 'magnify'] as const).forEach((k) => { if (eff[k]) c.push(`a11y-${k}`); });
  if (eff.align) c.push(`a11y-align-${eff.align}`);
  if (eff.color === 'dark' || eff.color === 'light') c.push(`a11y-${eff.color}`);
  if (eff.cursor) c.push(`a11y-cursor-${eff.cursor}`);
  const f: string[] = [];
  if (eff.color === 'contrast') f.push(FILTER.contrast);
  if (eff.sat) f.push(FILTER[eff.sat]);
  if (f.length) { c.push('a11y-filter'); v['--a11y-filter'] = f.join(' '); }
  (['txc', 'ttc', 'bgc'] as const).forEach((k) => { if (eff[k]) { c.push(`a11y-${k}`); v[`--a11y-${k}`] = eff[k] as string; } });
  return { classes: c, vars: v };
}

/** Puts the classes and variables on <html>, leaving the two classes the menu manages itself (hidden menu, read mode). */
export function applyToPage(classes: string[], vars: Record<string, string>): void {
  const html = document.documentElement;
  Array.from(html.classList).forEach((cl) => {
    if (/^a11y-/.test(cl) && cl !== 'a11y-ui-hidden' && cl !== 'a11y-reading-mode' && !classes.includes(cl)) html.classList.remove(cl);
  });
  classes.forEach((cl) => html.classList.add(cl));
  VARS.forEach((k) => { if (vars[k]) html.style.setProperty(k, vars[k]); else html.style.removeProperty(k); });
}

/** Remembers the choices (not read mode, which is for the moment). Storage can be blocked; the choices still apply for this visit. */
export function saveState(state: A11yState, classes: string[], vars: Record<string, string>): void {
  const s: Record<string, unknown> = {};
  (Object.keys(state) as (keyof A11yState)[]).forEach((k) => {
    if (k === 'readmode') return;
    if (k === 'p') {
      const on: Record<string, boolean> = {};
      Object.keys(state.p ?? {}).forEach((n) => { if (state.p?.[n as ProfileName]) on[n] = true; });
      if (Object.keys(on).length) s.p = on;
    } else if (state[k]) s[k] = state[k];
  });
  try {
    if (Object.keys(s).length) localStorage.setItem(A11Y_KEY, JSON.stringify({ s, c: classes, v: vars }));
    else localStorage.removeItem(A11Y_KEY);
  } catch {
    /* blocked storage */
  }
}

/**
 * True when motion should stop: the device asks for reduced motion, or "Stop Animations" is on (or a profile that includes it).
 * Components that move on a timer (the home page slideshow) use this, because CSS alone cannot stop a script.
 */
export function useStillMotion(): boolean {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const read = () => setStill(mq.matches || document.documentElement.classList.contains('a11y-still'));
    read();
    mq.addEventListener('change', read);
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { mq.removeEventListener('change', read); observer.disconnect(); };
  }, []);
  return still;
}
