import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { chunkBlocks, collectReadableBlocks, selectedText, splitSentences, type ReadBlock, type ReadChunk } from '../lib/readAloudContent';
import './ReadAloudButton.css';

type ReadAloudButtonProps = {
  /** Kept for existing callers; the reader now finds the page's main content itself. */
  selector?: string;
  label?: string;
  compact?: boolean;
};

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75] as const;
const SPEED_KEY = 'soldirectory.readAloud.speed';
const WORDS_PER_MINUTE = 165;
const HIGHLIGHT = 'read-aloud-current';

type Status = 'idle' | 'playing' | 'paused';

function storedSpeed(): number {
  try {
    const v = Number(localStorage.getItem(SPEED_KEY));
    return (SPEEDS as readonly number[]).includes(v) ? v : 1;
  } catch {
    return 1;
  }
}

/** The most natural English voice available: Australian first, then other English, then whatever the browser defaults to. */
function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const rank = (v: SpeechSynthesisVoice) => {
    const lang = v.lang.replace('_', '-').toLowerCase();
    if (lang === 'en-au') return 0;
    if (lang === 'en-gb' || lang === 'en-nz') return 1;
    if (lang.startsWith('en')) return 2;
    return 9;
  };
  const english = voices.filter((v) => rank(v) < 9).sort((a, b) => rank(a) - rank(b) || Number(b.localService) - Number(a.localService));
  return english[0] ?? null;
}

export default function ReadAloudButton({ label = 'Listen', compact = false }: ReadAloudButtonProps) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [speed, setSpeed] = useState<number>(storedSpeed);
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [now, setNow] = useState('');
  const [section, setSection] = useState('');
  const [scope, setScope] = useState<'page' | 'selection'>('page');
  const [empty, setEmpty] = useState(false);
  // Where the panel sits, in pixels from the button's left edge, so it is always fully on screen.
  const [panelLeft, setPanelLeft] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const chunksRef = useRef<ReadChunk[]>([]);
  const blocksRef = useRef<ReadBlock[]>([]);
  const wordsAfterRef = useRef<number[]>([]);
  const tokenRef = useRef(0);
  const speedRef = useRef(speed);
  const selectionRef = useRef('');
  const highlightedRef = useRef<HTMLElement | null>(null);

  speedRef.current = speed;

  const clearHighlight = useCallback(() => {
    highlightedRef.current?.classList.remove(HIGHLIGHT);
    highlightedRef.current = null;
  }, []);

  const showChunk = useCallback((i: number) => {
    const chunk = chunksRef.current[i];
    if (!chunk) return;
    setIndex(i);
    setNow(chunk.text);
    let s = '';
    for (let k = i; k >= 0; k -= 1) {
      const c = chunksRef.current[k];
      if (c.sectionStart) { s = c.text.replace(/[.:]$/, ''); break; }
    }
    setSection(s);

    const el = blocksRef.current[chunk.block]?.el;
    if (el && el !== highlightedRef.current) {
      clearHighlight();
      // A selection has no element of its own, so only page reading highlights.
      if (el.isConnected) {
        el.classList.add(HIGHLIGHT);
        highlightedRef.current = el;
        const r = el.getBoundingClientRect();
        if (r.top < 90 || r.bottom > window.innerHeight - 40) {
          el.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }
      }
    }
  }, [clearHighlight]);

  const stopAll = useCallback((close: boolean) => {
    tokenRef.current += 1;
    if (supported) window.speechSynthesis.cancel();
    clearHighlight();
    setStatus('idle');
    setNow('');
    setSection('');
    setIndex(0);
    if (close) setOpen(false);
  }, [clearHighlight, supported]);

  /** Speaks sentence `i`, then carries on with the next one. */
  const speakFrom = useCallback((i: number) => {
    if (!supported) return;
    const chunks = chunksRef.current;
    window.speechSynthesis.cancel();
    tokenRef.current += 1;
    const mine = tokenRef.current;

    if (i >= chunks.length) {
      clearHighlight();
      setStatus('idle');
      setNow('');
      setIndex(0);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[i].text);
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? 'en-AU';
    utterance.rate = speedRef.current;
    utterance.onstart = () => { if (mine === tokenRef.current) showChunk(i); };
    utterance.onend = () => { if (mine === tokenRef.current) speakFrom(i + 1); };
    utterance.onerror = (event) => {
      if (mine !== tokenRef.current) return;
      // A cancel() from a pause, a skip or a speed change arrives here as "interrupted" or "canceled".
      if (event.error === 'interrupted' || event.error === 'canceled') return;
      stopAll(false);
    };

    setStatus('playing');
    showChunk(i);
    window.speechSynthesis.speak(utterance);
  }, [clearHighlight, showChunk, stopAll, supported]);

  const prepare = useCallback((): boolean => {
    const picked = selectionRef.current;
    selectionRef.current = '';
    if (picked) {
      const pieces = splitSentences(picked);
      blocksRef.current = [];
      chunksRef.current = pieces.map((text) => ({ text, block: -1, sectionStart: false }));
      setScope('selection');
    } else {
      const blocks = collectReadableBlocks();
      blocksRef.current = blocks;
      chunksRef.current = chunkBlocks(blocks);
      setScope('page');
    }
    const chunks = chunksRef.current;
    // Words left after each sentence, for the "minutes left" estimate.
    const after = new Array<number>(chunks.length).fill(0);
    let run = 0;
    for (let k = chunks.length - 1; k >= 0; k -= 1) {
      run += chunks[k].text.split(/\s+/).filter(Boolean).length;
      after[k] = run;
    }
    wordsAfterRef.current = after;
    setTotal(chunks.length);
    setEmpty(chunks.length === 0);
    return chunks.length > 0;
  }, []);

  const start = () => {
    if (!supported) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const width = Math.min(380, window.innerWidth * 0.86);
      const wanted = Math.min(Math.max(rect.left, 8), Math.max(8, window.innerWidth - width - 8));
      setPanelLeft(Math.round(wanted - rect.left));
    }
    setOpen(true);
    if (!prepare()) { setStatus('idle'); return; }
    speakFrom(0);
  };

  const togglePlay = () => {
    if (status === 'playing') {
      // Cancel and remember the sentence: pause/resume on the speech engine itself is unreliable across browsers.
      tokenRef.current += 1;
      window.speechSynthesis.cancel();
      setStatus('paused');
    } else if (status === 'paused') {
      speakFrom(index);
    } else {
      start();
    }
  };

  const jumpSection = (direction: 1 | -1) => {
    const chunks = chunksRef.current;
    if (!chunks.length) return;
    let target = -1;
    if (direction === 1) {
      for (let k = index + 1; k < chunks.length; k += 1) if (chunks[k].sectionStart) { target = k; break; }
      if (target === -1) return;
    } else {
      // First go to the start of the current section; pressing again goes to the one before.
      let cur = index;
      while (cur > 0 && !chunks[cur].sectionStart) cur -= 1;
      target = cur < index ? cur : -1;
      if (target === -1) {
        for (let k = cur - 1; k >= 0; k -= 1) if (chunks[k].sectionStart) { target = k; break; }
      }
      if (target === -1) target = 0;
    }
    speakFrom(target);
  };

  const jumpSentence = (direction: 1 | -1) => {
    const next = Math.min(Math.max(index + direction, 0), chunksRef.current.length - 1);
    speakFrom(next);
  };

  const changeSpeed = (value: number) => {
    setSpeed(value);
    speedRef.current = value;
    try { localStorage.setItem(SPEED_KEY, String(value)); } catch { /* private mode: the choice just is not remembered */ }
    // Speech rate cannot change mid-sentence, so carry on from the start of this one at the new speed.
    if (status === 'playing') speakFrom(index);
  };

  // Voices load asynchronously in some browsers; asking once wakes the list up.
  useEffect(() => {
    if (!supported) return undefined;
    window.speechSynthesis.getVoices();
    return undefined;
  }, [supported]);

  // Stop when the page changes or the button goes away.
  useEffect(() => () => {
    tokenRef.current += 1;
    if (supported) window.speechSynthesis.cancel();
    highlightedRef.current?.classList.remove(HIGHLIGHT);
  }, [supported]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') stopAll(true); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, stopAll]);

  const minutesLeft = useMemo(() => {
    const words = wordsAfterRef.current[index] ?? 0;
    return Math.max(0, Math.round(words / (WORDS_PER_MINUTE * speed)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, speed, total]);

  if (!supported) return null;

  const playing = status === 'playing';
  const progress = total > 1 ? Math.round((index / (total - 1)) * 100) : 0;

  return (
    <div className={`read-aloud${compact ? ' read-aloud--compact' : ''}`}>
      <button
        type="button"
        ref={buttonRef}
        className="read-aloud__button"
        // Taking the selection before the click keeps "read what I highlighted" working in every browser.
        onMouseDown={() => { selectionRef.current = selectedText(); }}
        onTouchStart={() => { selectionRef.current = selectedText(); }}
        onClick={() => {
          if (!selectionRef.current) selectionRef.current = selectedText();
          if (open && status !== 'idle') { stopAll(true); return; }
          if (open) { setOpen(false); return; }
          start();
        }}
        aria-label={open ? 'Close read aloud' : `${label}: read this page aloud`}
        aria-expanded={open}
        title="Read this page aloud. Select some text first to hear only that."
      >
        <span aria-hidden="true">{open ? '✕' : '🔊'}</span>
        {!compact && <span>{open ? 'Close' : label}</span>}
      </button>

      {open && (
        <div className="read-aloud__panel" style={{ left: panelLeft }} role="region" aria-label="Read aloud controls">
          <div className="read-aloud__panel-header">
            <span>{scope === 'selection' ? 'Reading your selection' : 'Read aloud'}</span>
            <button type="button" className="read-aloud__close" onClick={() => stopAll(true)} aria-label="Stop and close read aloud">✕</button>
          </div>

          {empty ? (
            <p className="read-aloud__empty">There is no text on this page to read aloud.</p>
          ) : (
            <>
              {scope === 'page' && section && <div className="read-aloud__section">{section}</div>}
              <p className="read-aloud__now" aria-live="off">{now || (status === 'idle' ? 'Finished. Press play to hear it again.' : '')}</p>

              <div className="read-aloud__bar" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <span style={{ width: `${progress}%` }} />
              </div>
              <div className="read-aloud__meta">
                <span>{status === 'idle' ? '' : minutesLeft <= 0 ? 'Less than a minute left' : `About ${minutesLeft} min left`}</span>
                <span>{total > 0 && status !== 'idle' ? `${index + 1} of ${total}` : ''}</span>
              </div>

              <div className="read-aloud__controls">
                {scope === 'page' && (
                  <button type="button" className="read-aloud__icon" onClick={() => jumpSection(-1)} aria-label="Previous section" title="Previous section">⏮</button>
                )}
                <button type="button" className="read-aloud__icon" onClick={() => jumpSentence(-1)} aria-label="Previous sentence" title="Previous sentence">◀</button>
                <button type="button" className="read-aloud__play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                  {playing ? '⏸ Pause' : '▶ Play'}
                </button>
                <button type="button" className="read-aloud__icon" onClick={() => jumpSentence(1)} aria-label="Next sentence" title="Next sentence">▶</button>
                {scope === 'page' && (
                  <button type="button" className="read-aloud__icon" onClick={() => jumpSection(1)} aria-label="Next section" title="Next section">⏭</button>
                )}
              </div>

              <div className="read-aloud__foot">
                <label className="read-aloud__speed">
                  <span>Speed</span>
                  <select aria-label="Speech speed" value={speed} onChange={(event) => changeSpeed(Number(event.target.value))}>
                    {SPEEDS.map((option) => <option key={option} value={option}>{option}x</option>)}
                  </select>
                </label>
                <button type="button" className="read-aloud__mini" onClick={() => stopAll(false)}>Stop</button>
              </div>
              <p className="read-aloud__hint">Select some text on the page before pressing Listen to hear only that.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
