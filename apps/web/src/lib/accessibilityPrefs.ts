import { useEffect, useState } from 'react';

/**
 * A visitor's accessibility choices (the toolbar in components/AccessibilityToolbar.tsx).
 *
 * They are kept in this browser only (localStorage), never sent anywhere, and applied to the <html> element: a CSS variable for the text size
 * and `a11y-*` classes for everything else (styles in AccessibilityToolbar.css). index.html runs a tiny script that applies the saved choices
 * before the page paints, so a page does not flash at the normal size first. That script reads the `scale` and `classes` saved here.
 */
export const A11Y_STORAGE_KEY = 'soldirectory.a11y';

/** Text sizes, as a multiple of the site's normal size. Up to 200% so people who need very large text can have it. */
export const TEXT_SCALES = [1, 1.15, 1.3, 1.5, 1.75, 2] as const;

export type Colours = 'standard' | 'high' | 'dark' | 'light';

export interface A11yPrefs {
  textStep: number;
  colours: Colours;
  grayscale: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
  textSpacing: boolean;
  stillMotion: boolean;
}

export const DEFAULT_PREFS: A11yPrefs = {
  textStep: 0,
  colours: 'standard',
  grayscale: false,
  underlineLinks: false,
  readableFont: false,
  textSpacing: false,
  stillMotion: false,
};

const COLOUR_CLASS: Record<Colours, string | null> = {
  standard: null,
  high: 'a11y-high-contrast',
  dark: 'a11y-dark',
  light: 'a11y-light',
};

/** The classes that should be on <html> for these choices. */
export function classesFor(p: A11yPrefs): string[] {
  return [
    COLOUR_CLASS[p.colours],
    p.grayscale ? 'a11y-grayscale' : null,
    p.underlineLinks ? 'a11y-underline' : null,
    p.readableFont ? 'a11y-font' : null,
    p.textSpacing ? 'a11y-spacing' : null,
    p.stillMotion ? 'a11y-still' : null,
  ].filter((c): c is string => !!c);
}

const ALL_CLASSES = ['a11y-high-contrast', 'a11y-dark', 'a11y-light', 'a11y-grayscale', 'a11y-underline', 'a11y-font', 'a11y-spacing', 'a11y-still'];

export function loadPrefs(): A11yPrefs {
  try {
    const saved = JSON.parse(localStorage.getItem(A11Y_STORAGE_KEY) ?? 'null')?.prefs;
    if (!saved || typeof saved !== 'object') return DEFAULT_PREFS;
    const step = Number(saved.textStep);
    return {
      textStep: Number.isInteger(step) && step >= 0 && step < TEXT_SCALES.length ? step : 0,
      colours: ['standard', 'high', 'dark', 'light'].includes(saved.colours) ? saved.colours : 'standard',
      grayscale: saved.grayscale === true,
      underlineLinks: saved.underlineLinks === true,
      readableFont: saved.readableFont === true,
      textSpacing: saved.textSpacing === true,
      stillMotion: saved.stillMotion === true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/** Puts the choices on the page and remembers them. Storage can be blocked (private windows), so failing to save is not an error. */
export function applyPrefs(p: A11yPrefs): void {
  const root = document.documentElement;
  const scale = TEXT_SCALES[p.textStep] ?? 1;
  const classes = classesFor(p);
  if (scale === 1) root.style.removeProperty('--a11y-text-scale');
  else root.style.setProperty('--a11y-text-scale', String(scale));
  ALL_CLASSES.forEach((c) => root.classList.toggle(c, classes.includes(c)));
  try {
    const isDefault = JSON.stringify(p) === JSON.stringify(DEFAULT_PREFS);
    if (isDefault) localStorage.removeItem(A11Y_STORAGE_KEY);
    else localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify({ v: 1, prefs: p, scale, classes }));
  } catch {
    /* choices still apply for this visit */
  }
}

/**
 * True when motion should stop: the visitor's device asks for reduced motion, or they chose "Stop animations" in the toolbar.
 * Components that move on a timer (the home page carousel) use this, because CSS alone cannot stop a script.
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
