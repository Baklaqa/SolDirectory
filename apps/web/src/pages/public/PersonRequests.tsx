import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PublicFooter, PublicHeader } from './PublicLayout';
import RequestProgress from '../../components/RequestProgress';
import { getPersonRequests, type PersonRequest } from '../../api/requestsApi';
import { ApiError } from '../../api/client';
import { useMatchModal } from '../../context/MatchModalContext';
import { applySeoTags } from '../../lib/seo';
import './TrackRequest.css';
import './PersonRequests.css';

const relative = (url?: string) => {
  if (!url) return '';
  try {
    const u = new URL(url, window.location.origin);
    return `${u.pathname}${u.search}`;
  } catch {
    return url;
  }
};

/**
 * /my-requests/:id?t=… — the page behind "View your requests" in the weekly summary email: every request made with the
 * same email address, each with where it stands. No login: the signed link is the key, and it opens only these requests.
 */
export default function PersonRequests() {
  const { id = '' } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const token = params.get('t') ?? '';
  const { openMatchModal } = useMatchModal();
  const [items, setItems] = useState<PersonRequest[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    applySeoTags({ title: 'Where your requests stand | SolDirectory', description: 'See who has looked at your requests.', noindex: true });
    let alive = true;
    getPersonRequests(id, token)
      .then((r) => { if (alive) setItems(r.items); })
      .catch((err) => { if (alive) setError(err instanceof ApiError ? err.message : 'We could not load your requests.'); });
    return () => { alive = false; };
  }, [id, token]);

  const open = (items ?? []).filter((r) => r.open);
  const closed = (items ?? []).filter((r) => !r.open);

  return (
    <>
      <PublicHeader />
      <main className="trk-page">
        <div className="trk-wrap pr-wrap">
          {error ? (
            <div className="trk-card trk-error" role="alert">
              <h1>We couldn’t open your requests</h1>
              <p>{error}</p>
              <Link className="sd-btn sd-btn-primary" to="/find-a-provider">Find a provider</Link>
            </div>
          ) : !items ? (
            <div className="trk-card" aria-busy="true"><div className="trk-skel" style={{ width: '45%', height: 26 }} /><div className="trk-skel" style={{ height: 14, marginTop: 18 }} /></div>
          ) : (
            <>
              <header className="trk-head">
                <span className="trk-eyebrow">Your requests</span>
                <h1>Where your {open.length === 1 ? 'request stands' : 'requests stand'}</h1>
                <p>{open.length === 0 ? 'You have no open requests.' : `${open.length} open ${open.length === 1 ? 'request' : 'requests'}, newest first.`}</p>
              </header>

              {open.map((r) => (
                <article className="trk-card pr-card" key={r.id} aria-label={r.need}>
                  <div className="pr-top">
                    <div>
                      <h2>{r.requestedProvider ? `${r.need} (${r.requestedProvider})` : r.need}{r.suburb ? ` in ${r.suburb}` : ''}</h2>
                      <span className="pr-meta">Reference {r.reference} · sent {new Date(r.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })}</span>
                    </div>
                    <span className={`pr-status pr-status-${r.statusTone}`}>{r.statusText}</span>
                  </div>
                  <RequestProgress request={r} compact />
                  <Link className="pr-link" to={relative(r.trackingUrl)}>See the full progress →</Link>
                </article>
              ))}

              {open.length > 0 && (
                <p className="trk-note pr-note">
                  An unlock means a provider opened the contact details you gave. It does not confirm they have called or emailed you.
                  Providers decide for themselves whether and how quickly to follow up.
                </p>
              )}

              {closed.length > 0 && (
                <section className="pr-closed" aria-label="Closed requests">
                  <h2>Closed requests</h2>
                  <ul>
                    {closed.map((r) => (
                      <li key={r.id}>{r.need}{r.suburb ? ` in ${r.suburb}` : ''} <span>· {new Date(r.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span></li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="trk-actions">
                <Link className="sd-btn sd-btn-primary sd-btn-lg" to="/find-a-provider">Compare providers yourself</Link>
                <button type="button" className="sd-btn sd-btn-outline sd-btn-lg" onClick={() => openMatchModal()}>Make a new request, free</button>
              </div>
            </>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
