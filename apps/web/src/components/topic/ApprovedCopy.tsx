import type { ApprovedPageCopy } from '../../api/registerApi';

/** The intro and sections of approved, scored page copy (the FAQs are shown by each page's own FAQ block). Same words as the crawler HTML. */
export default function ApprovedCopy({ copy, h2Class, pClass }: { copy: ApprovedPageCopy; h2Class: string; pClass?: string }) {
  return (
    <section className="approved-copy">
      <p className={pClass}>{copy.intro}</p>
      {copy.sections.map((s) => (
        <div key={s.heading}>
          <h2 className={h2Class}>{s.heading}</h2>
          <p className={pClass}>{s.body}</p>
        </div>
      ))}
    </section>
  );
}
