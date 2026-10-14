import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WORKER_PAGE_GUIDES, WORKER_SETUP_STEPS } from '@soldirectory/topic-content';
import { getRegisterHub, getServiceSuburbs, type RegisterHub } from '../../api/registerApi';
import { STATE_INFO } from '../../data/locationInfo';
import { slugify } from '../../data/slugHelpers';
import { KIND_BY_TYPE, STATES, registerPath, stateByCode } from '../../lib/registerMeta';
import ArticleCards from '../blog/ArticleCards';
import './PageExtras.css';

/**
 * The reading part of /independent-workers, below the profile pitch: how to set up as an independent worker, the
 * guides written for it, the supports and places where organisations are listed, and where participants should go
 * instead. Counts and suburbs come from the public registers already loaded elsewhere on the site; nothing here
 * promises work or claims a number of workers.
 */

const SUPPORTS: { name: string; photo: string }[] = [
  { name: 'Personal care', photo: 'personal-care' },
  { name: 'Domestic assistance', photo: 'domestic-assistance' },
  { name: 'Transport', photo: 'transport' },
  { name: 'Therapy services', photo: 'therapy-services' },
  { name: 'Nursing', photo: 'nursing' },
];

const SETUP = WORKER_SETUP_STEPS as { title: string; body: string; link: { to: string; label: string } }[];

const GUIDE_SLUGS = WORKER_PAGE_GUIDES as string[];

const BY_SUPPORT = ['Personal care', 'Domestic assistance', 'Transport'];
const fmt = (n: number) => n.toLocaleString('en-AU');

export default function WorkerExtras() {
  const [hub, setHub] = useState<RegisterHub | null>(null);
  const [byService, setByService] = useState<Record<string, { state: string; slug: string; suburb: string; count: number }[]>>({});
  const [state, setState] = useState('');

  useEffect(() => {
    let alive = true;
    getRegisterHub('ndis').then((r) => { if (alive) setHub(r); }).catch(() => {});
    Promise.all(BY_SUPPORT.map((s) => getServiceSuburbs(s, 6).then((r) => [s, r.suburbs] as const).catch(() => [s, []] as const)))
      .then((pairs) => { if (alive) setByService(Object.fromEntries(pairs)); });
    return () => { alive = false; };
  }, []);

  const suburbs = useMemo(
    () => (hub?.suburbs ?? []).filter((s) => !state || s.state === state).slice(0, 18),
    [hub, state],
  );
  const statesWithData = useMemo(() => new Set((hub?.suburbs ?? []).map((s) => s.state)), [hub]);

  return (
    <div className="xp">
      <div className="dx">
        <section className="dx-section" aria-labelledby="xw-setup">
          <span className="eyebrow"><span className="eyebrow-rule" />Getting set up</span>
          <h2 id="xw-setup" className="dx-h2">Six things to settle before your first shift</h2>
          <p className="dx-lede">Working for yourself puts the business side in your hands. Each step links to a plain-English guide written from the official sources.</p>
          <ol className="dx-steps">
            {SETUP.map((step, i) => (
              <li key={step.title} className="dx-step">
                <span className="dx-step-num" aria-hidden="true">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <Link to={step.link.to}>{step.link.label} →</Link>
              </li>
            ))}
          </ol>
        </section>

        <ArticleCards
          slugs={GUIDE_SLUGS}
          headingId="xw-guides"
          eyebrow="From the blog"
          heading="Guides for independent workers"
          lede="Written for people working for themselves in disability and aged care support, and updated against the official pages they rely on."
        />

        <section className="dx-section" aria-labelledby="xw-supports">
          <span className="eyebrow"><span className="eyebrow-rule" />The work</span>
          <h2 id="xw-supports" className="dx-h2">Supports you can offer</h2>
          <p className="dx-lede">Choose the supports that match your skills, experience and checks. Each page explains what the support involves and where organisations are listed for it.</p>
          <ul className="dx-tiles">
            {SUPPORTS.map((s) => (
              <li key={s.name}>
                <Link className="dx-tile" to={`/services/${slugify(s.name)}`}>
                  <span className="dx-tile-photo">
                    <img src={`/images/supports/${s.photo}.jpg`} alt="" width={720} height={450} loading="lazy" decoding="async" />
                  </span>
                  <span className="dx-tile-label">{s.name} <span aria-hidden="true">→</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {(hub?.suburbs.length ?? 0) > 0 && (
          <section className="dx-section" aria-labelledby="xw-places">
            <span className="eyebrow"><span className="eyebrow-rule" />Where organisations are listed</span>
            <h2 id="xw-places" className="dx-h2">Suburbs with the most organisations on the NDIS register</h2>
            <p className="dx-lede">
              The number beside each suburb is how many organisations the public NDIS register lists there. It shows where organisations are based, not how much
              work there is, and a busy suburb can also mean more workers looking for the same work.
            </p>
            <ul className="xp-chips" aria-label="Filter by state">
              <li><button type="button" className="xp-chip" aria-pressed={state === ''} onClick={() => setState('')}>All states</button></li>
              {STATES.filter((s) => statesWithData.has(s.code)).map((s) => (
                <li key={s.code}><button type="button" className="xp-chip" aria-pressed={state === s.code} onClick={() => setState(s.code)}>{s.code}</button></li>
              ))}
            </ul>
            {suburbs.length > 0 ? (
              <ul className="xp-links">
                {suburbs.map((s) => (
                  <li key={`${s.state}-${s.slug}`}>
                    <Link to={registerPath(KIND_BY_TYPE.ndis, stateByCode(s.state)?.slug, s.slug)}>
                      <span>{s.suburb}, {s.state}</span><span className="xp-count">{fmt(s.count)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="xp-empty">No suburbs in that state meet the minimum number of listings yet.</p>
            )}
          </section>
        )}

        {BY_SUPPORT.some((s) => (byService[s] ?? []).length > 0) && (
          <section className="dx-section" aria-labelledby="xw-bysupport">
            <span className="eyebrow"><span className="eyebrow-rule" />Support by suburb</span>
            <h2 id="xw-bysupport" className="dx-h2">Where each kind of support is listed</h2>
            <div className="xp-cols">
              {BY_SUPPORT.filter((s) => (byService[s] ?? []).length > 0).map((s) => (
                <div className="xp-col" key={s}>
                  <h3>{s}</h3>
                  <ul>
                    {byService[s].map((r) => (
                      <li key={`${r.state}-${r.slug}`}>
                        <Link to={`/services/${slugify(s)}/${r.state.toLowerCase()}/${r.slug}`}>{r.suburb}, {r.state}</Link>
                      </li>
                    ))}
                  </ul>
                  <Link className="xp-more" to={`/services/${slugify(s)}`}>About {s.toLowerCase()} →</Link>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="dx-section" aria-labelledby="xw-states">
          <span className="eyebrow"><span className="eyebrow-rule" />Browse by place</span>
          <h2 id="xw-states" className="dx-h2">Independent support work by state and territory</h2>
          <p className="dx-lede">Start with the state where you live, then look at its capital and regional centres to see which organisations are listed near you.</p>
          <ul className="xp-states">
            {STATE_INFO.map((info) => {
              const meta = stateByCode(info.code);
              if (!meta) return null;
              return (
                <li key={info.code}>
                  <Link className="xp-state" to={`/ndis-providers/${meta.slug}`}>
                    <strong>{meta.name}</strong>
                    <span>{info.capital}{info.centres.length ? `, ${info.centres.slice(0, 4).join(', ')} and more` : ''}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="dx-note">Prefer to search by suburb or postcode? <Link to="/locations">Browse all locations</Link>.</p>
        </section>

        <aside className="xp-aside" aria-labelledby="xw-participants">
          <div>
            <h2 id="xw-participants">Looking for a worker rather than offering work?</h2>
            <p>This page is for workers. Participants and families can search the public directory, send one request to matched providers, and read what to ask before choosing.</p>
          </div>
          <div className="xp-aside-links">
            <Link to="/find-a-provider">Search the provider directory →</Link>
            <Link to="/blog/questions-to-ask-an-independent-ndis-support-worker">Questions to ask a worker →</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
