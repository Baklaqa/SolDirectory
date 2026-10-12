import { Link } from 'react-router-dom';
import { EDITORIAL_BLOG_POSTS } from '@soldirectory/topic-content';
import { STATE_INFO } from '../../data/locationInfo';
import { stateByCode } from '../../lib/registerMeta';
import type { RegisterHub } from '../../api/registerApi';
import './LocationsExtras.css';
import { blogThumb, fullImageFallback } from '../blog/blogThumb';

/**
 * Extra reading on /locations: how the public register is spread across the states (real counts from the register
 * hubs), shortcuts by support, and the guides about finding support in a particular kind of place. Nothing here is
 * invented: the chart is computed from the loaded counts and says what those counts do and do not mean.
 */

const SUPPORTS: { name: string; label: string; photo: string }[] = [
  { name: 'Personal care', label: 'Personal care', photo: 'personal-care' },
  { name: 'Domestic assistance', label: 'Domestic assistance', photo: 'domestic-assistance' },
  { name: 'Transport', label: 'Transport', photo: 'transport' },
  { name: 'Therapy services', label: 'Therapy services', photo: 'therapy-services' },
  { name: 'Nursing', label: 'Nursing', photo: 'nursing' },
  { name: 'Support coordination', label: 'Support coordination', photo: 'support-coordination' },
  { name: 'Plan management', label: 'Plan management', photo: 'plan-management' },
  { name: 'Housing (SDA & SIL)', label: 'Housing, SDA & SIL', photo: 'housing-sda-sil' },
];

const GUIDE_SLUGS = [
  'finding-ndis-supports-in-regional-and-remote-areas',
  'moving-to-a-new-town-or-state-with-the-ndis',
  'registered-or-unregistered-ndis-provider-what-it-means',
  'ndis-service-agreement-what-to-check-before-you-sign',
];

const fmt = (n: number) => n.toLocaleString('en-AU');

export default function LocationsExtras({ ndis, aged }: { ndis: RegisterHub | null; aged: RegisterHub | null }) {
  const rows = STATE_INFO.map((info) => ({
    code: info.code,
    name: stateByCode(info.code)?.name ?? info.code,
    ndis: ndis?.states[info.code] ?? 0,
    aged: aged?.states[info.code] ?? 0,
  }));
  const ndisTotal = rows.reduce((n, r) => n + r.ndis, 0);
  const agedTotal = rows.reduce((n, r) => n + r.aged, 0);
  const maxNdis = Math.max(1, ...rows.map((r) => r.ndis));
  const sorted = [...rows].sort((a, b) => b.ndis - a.ndis);

  const guides = GUIDE_SLUGS
    .map((slug) => EDITORIAL_BLOG_POSTS.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      {ndisTotal > 0 && (
        <section className="lx-section" aria-labelledby="lx-spread">
          <span className="directory-section-label">The register, state by state</span>
          <h2 className="reg-h2" id="lx-spread">How the NDIS register is spread across Australia</h2>
          <p className="reg-lede">
            Each bar shows the number of organisations listed on the public NDIS register in that state or territory, and its share of the
            national total of {fmt(ndisTotal)}.
          </p>
          <ul className="lx-bars">
            {sorted.map((r) => {
              const share = ndisTotal > 0 ? (r.ndis / ndisTotal) * 100 : 0;
              return (
                <li key={r.code}>
                  <span className="lx-bar-label"><strong>{r.code}</strong><span>{r.name}</span></span>
                  <span className="lx-bar-track" aria-hidden="true">
                    <span className="lx-bar-fill" style={{ width: `${Math.max(2, (r.ndis / maxNdis) * 100)}%` }} />
                  </span>
                  <span className="lx-bar-value">
                    <strong>{fmt(r.ndis)}</strong>
                    <span>{share < 1 ? '<1%' : `${Math.round(share)}%`} of listings</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="lx-note">
            These are counts of listings, not of people supported or of providers with space today. A state with more listings usually offers more
            choice, which is not the same as better quality or shorter waits.
            {agedTotal > 0 && <> The My Aged Care register lists {fmt(agedTotal)} organisations across the same areas.</>}
          </p>
        </section>
      )}

      <section className="lx-section" aria-labelledby="lx-supports">
        <span className="directory-section-label">Start from the support</span>
        <h2 className="reg-h2" id="lx-supports">Pick a support, then add your suburb</h2>
        <p className="reg-lede">Choose the support you are looking for to open the provider search with it already selected. Add your suburb there.</p>
        <ul className="lx-tiles">
          {SUPPORTS.map((s) => (
            <li key={s.name}>
              <Link className="lx-tile" to={`/find-a-provider?service=${encodeURIComponent(s.name)}`}>
                <span className="lx-tile-photo"><img src={`/images/supports/${s.photo}.jpg`} alt="" width={720} height={450} loading="lazy" decoding="async" /></span>
                <span className="lx-tile-label">{s.label} <span aria-hidden="true">→</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {guides.length > 0 && (
        <section className="lx-section" aria-labelledby="lx-guides">
          <div className="lx-head-row">
            <div>
              <span className="directory-section-label">Guides for different places</span>
              <h2 className="reg-h2" id="lx-guides">Regional, remote or moving? Read these first</h2>
            </div>
            <Link className="lx-all" to="/blog">All articles →</Link>
          </div>
          <ul className="lx-guides">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link className="lx-guide" to={`/blog/${g.slug}`}>
                  <span className="lx-guide-photo"><img src={blogThumb(g.coverImage)} onError={fullImageFallback(g.coverImage)} alt="" width={800} height={450} loading="lazy" decoding="async" /></span>
                  <span className="lx-guide-body">
                    <span className="lx-guide-cat">{g.category}</span>
                    <strong>{g.title}</strong>
                    <span>{g.summary}</span>
                    <span className="lx-guide-read">Read the guide →</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
