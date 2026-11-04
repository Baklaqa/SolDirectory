import { useEffect, useRef, useState } from 'react';
import { applyPrefs, DEFAULT_PREFS, loadPrefs, TEXT_SCALES, type A11yPrefs, type Colours } from '../lib/accessibilityPrefs';
import './AccessibilityToolbar.css';

const COLOUR_CHOICES: { value: Colours; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High contrast' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light background' },
];

const SWITCHES: { key: 'grayscale' | 'underlineLinks' | 'readableFont' | 'textSpacing' | 'stillMotion'; label: string; hint: string }[] = [
  { key: 'underlineLinks', label: 'Underline links', hint: 'Every link is underlined' },
  { key: 'readableFont', label: 'Readable font', hint: 'A plain, wide font' },
  { key: 'textSpacing', label: 'Wider text spacing', hint: 'More space between lines, words and letters' },
  { key: 'stillMotion', label: 'Stop animations', hint: 'Stops moving and fading effects, including the picture slideshow' },
  { key: 'grayscale', label: 'Black and white', hint: 'Removes colour from the page' },
];

/**
 * The accessibility menu (bottom right of every page). Choices apply at once, are remembered in this browser, and are applied before the
 * page paints on the next visit (see lib/accessibilityPrefs.ts and the script in index.html). Nothing is sent anywhere.
 */
export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(loadPrefs);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => { applyPrefs(prefs); }, [prefs]);

  // Opening moves focus to the menu's heading so a screen reader announces it; closing returns focus to the button.
  useEffect(() => {
    if (open) titleRef.current?.focus();
    else if (wasOpen.current) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const set = <K extends keyof A11yPrefs>(key: K, value: A11yPrefs[K]) => setPrefs((p) => ({ ...p, [key]: value }));
  const percent = Math.round(TEXT_SCALES[prefs.textStep] * 100);
  const isDefault = JSON.stringify(prefs) === JSON.stringify(DEFAULT_PREFS);

  return (
    <div className={`accessibility-toolbar ${open ? 'is-open' : 'is-closed'}`}>
      <button
        ref={toggleRef}
        type="button"
        className="accessibility-toolbar__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="accessibility-panel"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="7.2" r="1.3" fill="currentColor" stroke="none" />
          <path d="M6.8 10.2c3.4 1 6 1 10.4 0M12 10.6v3.2M12 13.8l-2.4 4.4M12 13.8l2.4 4.4" />
        </svg>
        <span className="visually-hidden">Accessibility options</span>
      </button>

      {open && (
        <div id="accessibility-panel" className="accessibility-toolbar__panel" role="dialog" aria-modal="false" aria-labelledby="accessibility-title">
          <div className="accessibility-toolbar__head">
            <h2 id="accessibility-title" ref={titleRef} tabIndex={-1}>Accessibility options</h2>
            <button type="button" className="accessibility-toolbar__close" onClick={() => setOpen(false)}>Close</button>
          </div>

          <div className="accessibility-toolbar__group" role="group" aria-labelledby="a11y-size-label">
            <p id="a11y-size-label" className="accessibility-toolbar__label">Text size</p>
            <div className="accessibility-toolbar__size">
              <button type="button" onClick={() => set('textStep', prefs.textStep - 1)} disabled={prefs.textStep === 0} aria-label="Smaller text">A&minus;</button>
              <span aria-live="polite">{percent}%</span>
              <button type="button" onClick={() => set('textStep', prefs.textStep + 1)} disabled={prefs.textStep === TEXT_SCALES.length - 1} aria-label="Larger text">A+</button>
            </div>
          </div>

          <div className="accessibility-toolbar__group" role="group" aria-labelledby="a11y-colour-label">
            <p id="a11y-colour-label" className="accessibility-toolbar__label">Colours</p>
            <div className="accessibility-toolbar__choices">
              {COLOUR_CHOICES.map((c) => (
                <button key={c.value} type="button" className={prefs.colours === c.value ? 'is-on' : ''} aria-pressed={prefs.colours === c.value} onClick={() => set('colours', c.value)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="accessibility-toolbar__group" role="group" aria-labelledby="a11y-more-label">
            <p id="a11y-more-label" className="accessibility-toolbar__label">Reading and movement</p>
            {SWITCHES.map((s) => (
              <button key={s.key} type="button" className={`accessibility-toolbar__switch${prefs[s.key] ? ' is-on' : ''}`} aria-pressed={prefs[s.key]} aria-describedby={`a11y-hint-${s.key}`} onClick={() => set(s.key, !prefs[s.key])}>
                <span>
                  <strong>{s.label}</strong>
                  <small id={`a11y-hint-${s.key}`}>{s.hint}</small>
                </span>
                <span className="accessibility-toolbar__state" aria-hidden="true">{prefs[s.key] ? 'On' : 'Off'}</span>
              </button>
            ))}
          </div>

          <button type="button" className="accessibility-toolbar__reset" onClick={() => setPrefs(DEFAULT_PREFS)} disabled={isDefault}>
            Reset all
          </button>
          <p className="accessibility-toolbar__note">Your choices are saved in this browser only.</p>
        </div>
      )}
    </div>
  );
}
