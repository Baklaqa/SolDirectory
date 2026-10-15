import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PublicFooter, PublicHeader } from './PublicLayout';
import RequestProgress from '../../components/RequestProgress';
import { attachRequest, closeTrackedRequest, deleteTrackedRequest, getTrackedRequest, setRequestOutcome, type TrackedRequest } from '../../api/requestsApi';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useMatchModal } from '../../context/MatchModalContext';
import { siteConfig } from '../../config/siteConfig';
import { applySeoTags } from '../../lib/seo';
import './TrackRequest.css';

/** /track/:id?t=… — the page behind "Follow your request" in the emails. No login needed; the link itself is the key. */
export default function TrackRequest() {
  const { id = '' } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const token = params.get('t') ?? '';
  const { user } = useAuth();
  const { openMatchModal } = useMatchModal();
  const [request, setRequest] = useState<TrackedRequest | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<'idle' | 'saving' | 'done' | 'taken'>('idle');
  const [choice, setChoice] = useState<'idle' | 'working' | 'confirm-delete' | 'closed' | 'erased' | 'failed'>('idle');
  const [outcome, setOutcome] = useState<'' | 'started' | 'looking' | 'not_needed'>('');

  useEffect(() => {
    applySeoTags({ title: 'Follow your request | SolDirectory', description: 'See who has received and opened your request.', noindex: true });
    let alive = true;
    const load = () => getTrackedRequest(id, token)
      .then((r) => { if (alive) { setRequest(r); setError(''); } })
      .catch((err) => { if (alive && !request) setError(err instanceof ApiError ? err.message : 'We could not load this request.'); });
    // A one-tap answer from the "did you find support?" email arrives as ?outcome=…; record it once, then load.
    const answer = params.get('outcome');
    if (token && (answer === 'started' || answer === 'looking' || answer === 'not_needed')) {
      setRequestOutcome(id, token, answer).then(() => { if (alive) { setOutcome(answer); setChoice(answer === 'not_needed' ? 'closed' : 'idle'); } }).catch(() => {}).finally(load);
    } else {
      load();
    }
    // Keeps itself current while the page is open.
    const t = setInterval(() => { if (!document.hidden) load(); }, 60_000);
    return () => { alive = false; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  async function closeIt() {
    setChoice('working');
    try { await closeTrackedRequest(id, token); setChoice('closed'); } catch { setChoice('failed'); }
  }

  async function deleteIt() {
    setChoice('working');
    try { await deleteTrackedRequest(id, token); setChoice('erased'); } catch { setChoice('failed'); }
  }

  async function saveToAccount() {
    setSaved('saving');
    try {
      await attachRequest(id, token);
      setSaved('done');
    } catch (err) {
      setSaved(err instanceof ApiError && err.status === 409 ? 'taken' : 'idle');
    }
  }

  return (
    <>
      <PublicHeader />
      <main className="trk-page">
        <div className="trk-wrap">
          {error ? (
            <div className="trk-card trk-error" role="alert">
              <h1>We couldn’t open that request</h1>
              <p>{error}</p>
              <Link className="sd-btn sd-btn-primary" to="/find-a-provider">Find a provider</Link>
            </div>
          ) : !request ? (
            <div className="trk-card" aria-busy="true"><div className="trk-skel" style={{ width: '40%', height: 26 }} /><div className="trk-skel" style={{ height: 14, marginTop: 18 }} /><div className="trk-skel" style={{ height: 14, marginTop: 10, width: '80%' }} /></div>
          ) : (
            <>
              <header className="trk-head">
                <span className="trk-eyebrow">Your request · reference {request.reference}</span>
                <h1>{request.requestedProvider ? `Your request for ${request.requestedProvider}` : `Your request for ${request.need.toLowerCase()}`}</h1>
                <p>
                  {[request.suburb, request.state].filter(Boolean).join(', ')}
                  {request.careFor ? ` · for ${request.careFor.toLowerCase()}` : ''}
                  {request.timeframe ? ` · ${request.timeframe.toLowerCase()}` : ''}
                  {' · sent '}{new Date(request.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })}
                </p>
              </header>

              <section className="trk-card" aria-label="Progress">
                <RequestProgress request={request} />
                {request.note && <p className="trk-note">{request.note}</p>}
              </section>

              <div className="trk-actions">
                <Link className="sd-btn sd-btn-primary sd-btn-lg" to={request.searchUrl.replace(window.location.origin, '') || '/find-a-provider'}>Compare providers near you</Link>
                <button type="button" className="sd-btn sd-btn-outline sd-btn-lg" onClick={() => openMatchModal()}>Get matched, free</button>
              </div>

              <section className="trk-card trk-save">
                {user ? (
                  saved === 'done' ? (
                    <p><strong>Saved.</strong> You can follow this request from your dashboard. <Link to="/dashboard">Open dashboard →</Link></p>
                  ) : saved === 'taken' ? (
                    <p>This request is already saved to another account.</p>
                  ) : (
                    <>
                      <div><strong>Keep it with your account</strong><span>Follow this request from your dashboard, along with any others.</span></div>
                      <button type="button" className="sd-btn sd-btn-outline" onClick={saveToAccount} disabled={saved === 'saving'}>{saved === 'saving' ? 'Saving…' : 'Save to my dashboard'}</button>
                    </>
                  )
                ) : (
                  <>
                    <div><strong>Want to follow it from a dashboard?</strong><span>Create a free account or log in, then open this link again to save it.</span></div>
                    <Link className="sd-btn sd-btn-outline" to={`/login?returnTo=${encodeURIComponent(`/track/${id}?t=${token}`)}`}>Log in</Link>
                  </>
                )}
              </section>

              {(outcome || request.outcome) && (
                <section className="trk-card" aria-label="Outcome" role="status">
                  <strong>Thank you for letting us know.</strong>{' '}
                  {{ started: 'Great: your support has started.', looking: 'We’ll keep your request open while you look.', not_needed: 'We’ve closed your request.' }[(outcome || request.outcome) as 'started' | 'looking' | 'not_needed']}
                </section>
              )}

              <section className="trk-card trk-choices" aria-label="Your choices">
                <div>
                  <strong>Your choices</strong>
                  <span>
                    You can close this request at any time, and providers who have not yet opened it will not be able to. You can also ask us to
                    delete your details. Our <Link to="/privacy">privacy policy</Link> explains what we keep and for how long. You can also{' '}
                    <a href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`Please review how request ${request.reference} was matched`)}`}>ask for a person</a>{' '}
                    to review how your request was matched, or <Link to="/complaints">make a complaint</Link>.
                  </span>
                </div>
                {request.erased || choice === 'erased' ? (
                  <p role="status"><strong>Your details have been deleted.</strong> Your request is closed.</p>
                ) : request.closed || choice === 'closed' ? (
                  <>
                    <p role="status"><strong>This request is closed.</strong> No other provider can open it.</p>
                    <button type="button" className="sd-btn sd-btn-outline" onClick={() => setChoice('confirm-delete')}>Delete my details</button>
                  </>
                ) : choice === 'confirm-delete' ? (
                  <>
                    <p role="alert">This clears your name, email address, phone number and notes from the request, and closes it. It cannot be undone.</p>
                    <button type="button" className="sd-btn sd-btn-primary" onClick={deleteIt}>Yes, delete my details</button>{' '}
                    <button type="button" className="sd-btn sd-btn-outline" onClick={() => setChoice('idle')}>Keep my request</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="sd-btn sd-btn-outline" onClick={closeIt} disabled={choice === 'working'}>Close this request</button>{' '}
                    <button type="button" className="sd-btn sd-btn-outline" onClick={() => setChoice('confirm-delete')} disabled={choice === 'working'}>Delete my details</button>
                    {choice === 'failed' && <p role="alert">Something went wrong. Please try again, or contact us.</p>}
                  </>
                )}
              </section>

              <p className="trk-foot">Providers decide for themselves whether and how quickly to follow up. We never give a provider your contact details unless they take your request up.</p>
            </>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
