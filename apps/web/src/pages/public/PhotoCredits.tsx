import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applySeoTags } from '../../lib/seo';
import { PublicFooter, PublicHeader } from './PublicLayout';
import { Breadcrumbs } from './register/RegisterParts';
import './Home.css';
import './register/register.css';

interface Credit {
  provider?: string;
  photographer: string;
  photographerUrl: string;
  pageUrl: string;
}

const UTM = 'utm_source=soldirectory&utm_medium=referral';
const withUtm = (url: string) => (url.includes('?') ? `${url}&${UTM}` : `${url}?${UTM}`);

/** Credits for the banner photos, read from the same file the photo downloader writes, so it never drifts out of date. */
export default function PhotoCredits() {
  const [credits, setCredits] = useState<Credit[] | null>(null);

  useEffect(() => {
    applySeoTags({
      title: 'Photo credits | SolDirectory',
      description: 'The photographers behind the banner images used across SolDirectory.',
      canonicalUrl: `${window.location.origin}/photo-credits`,
    });
    window.scrollTo(0, 0);
    fetch('/images/banners/credits.json')
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: Record<string, Credit>) => setCredits(Object.values(data)))
      .catch(() => setCredits([]));
  }, []);

  // One line per photographer, however many of their photos are used.
  const byPhotographer = new Map<string, { url: string; count: number }>();
  for (const c of credits ?? []) {
    const entry = byPhotographer.get(c.photographer);
    byPhotographer.set(c.photographer, { url: c.photographerUrl, count: (entry?.count ?? 0) + 1 });
  }
  const people = [...byPhotographer.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <PublicHeader />
      <main className="reg-page">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Photo credits' }]} />
        <h1 className="section-heading" style={{ maxWidth: "none", margin: "8px 0 18px" }}>Photo credits</h1>
        <p>
          Many banner images on SolDirectory are photos from{' '}
          <a href={withUtm('https://unsplash.com/')} target="_blank" rel="noopener noreferrer">Unsplash</a>, used under the Unsplash licence. Thank you to the
          photographers below. The people in these photos are not SolDirectory providers, workers or participants, and no photo suggests that any provider is
          recommended.
        </p>
        <p>
          Blog covers, support cards and the default share image are cropped or resized versions of these same photographs, credited here to the original
          photographer. Pages about a specific condition, mental health, dementia or a language show hands, objects and places rather than identifiable
          people, because a photo of a real person next to a diagnosis or a language suggests that person has it or speaks it.
        </p>
        <p>
          Logos on register listings are loaded from each business&apos;s own website and are not copied. If you own a photo, logo or text shown on
          SolDirectory and want it corrected or removed, see <Link to="/terms#corrections-removals-and-copyright-concerns">how to report a concern</Link>.
        </p>
        {credits === null && <p>Loading…</p>}
        {credits !== null && people.length === 0 && <p>No photographer credits to show.</p>}
        <ul className="reg-linkgrid">
          {people.map(([name, { url, count }]) => (
            <li key={name}>
              <a href={withUtm(url)} target="_blank" rel="noopener noreferrer">
                <span>{name}{count > 1 ? ` (${count} photos)` : ''}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <PublicFooter />
    </>
  );
}
