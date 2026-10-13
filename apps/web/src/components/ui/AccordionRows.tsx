import { useId, useState, type ReactNode } from 'react';
import './AccordionRows.css';

export interface AccordionItem {
  title: string;
  body: ReactNode;
}

/**
 * A stack of rows that open and close with a short slide, for a section where a heading sits on one side and several
 * titled points on the other. One row is open at a time (the first, to begin with); clicking an open row closes it.
 * The text is always in the page, so nothing is hidden from search engines or screen readers while it is collapsed
 * (collapsed rows are hidden visually and from the accessibility tree only).
 */
export default function AccordionRows({
  items,
  marker = 'number',
  tone = 'light',
  defaultOpen = 0,
  label,
}: {
  items: AccordionItem[];
  marker?: 'number' | 'check';
  tone?: 'light' | 'dark';
  defaultOpen?: number | null;
  label?: string;
}) {
  const base = useId();
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className={`acc acc-${tone}`} role="list" aria-label={label}>
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${base}-p${index}`;
        const buttonId = `${base}-b${index}`;
        return (
          <div className={`acc-row${isOpen ? ' is-open' : ''}`} key={item.title} role="listitem">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
              >
                <span className="acc-mark" aria-hidden="true">{marker === 'check' ? '✓' : String(index + 1).padStart(2, '0')}</span>
                <span className="acc-title">{item.title}</span>
                <span className="acc-chevron" aria-hidden="true" />
              </button>
            </h3>
            <div className="acc-panel" id={panelId} role="region" aria-labelledby={buttonId}>
              <div className="acc-panel-inner">
                <p>{item.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
