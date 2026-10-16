import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader, PublicFooter } from './PublicLayout';
import { siteConfig, phoneHref } from '../../config/siteConfig';
import { applySeoTags } from '../../lib/seo';
import { useMatchModal } from '../../context/MatchModalContext';
import './LegalPage.css';

const API_URL = ((import.meta as any).env?.VITE_API_URL ?? '/api').replace(/\/$/, '');
const I_AM = [
  { value: 'participant or family', label: 'A participant or family member' },
  { value: 'provider', label: 'A provider' },
  { value: 'worker', label: 'An independent worker' },
  { value: 'other', label: 'Something else' },
];

/** /contact: phone, email, post and a form. */
export default function ContactPage() {
  const { openMatchModal } = useMatchModal();
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    applySeoTags({
      title: 'Contact SolDirectory',
      description: 'Phone, email and post details for SolDirectory, and a form to ask for help, update a listing or raise a concern.',
      canonicalUrl: `${window.location.origin}/contact`,
    });
    window.scrollTo(0, 0);
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setState('sending');
    setError('');
    try {
      const res = await fetch(`${API_URL}/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? 'Something went wrong. Please try again, or call us.');
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again, or call us.');
      setState('error');
    }
  }

  return (
    <>
      <PublicHeader />
      <main className="legal-page">
        <nav className="legal-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Contact</span>
        </nav>
        <h1>Get in touch</h1>
        <p className="legal-summary">Last updated: 15 October 2026</p>
        <p className="legal-summary">We’re here to help you use SolDirectory, update a listing, or raise a concern.</p>

        <section className="legal-section">
          <ul className="guide-list">
            <li><strong>Phone:</strong> <a href={phoneHref(siteConfig.contactPhone)}>{siteConfig.contactPhone}</a>, {siteConfig.supportHours}</li>
            <li><strong>Email:</strong> <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a></li>
            <li><strong>Post:</strong> SolDirectory, {siteConfig.contactAddress}</li>
          </ul>
          <p>
            Looking for support right now? <button type="button" className="link-btn" onClick={() => openMatchModal()}>Get matched for free</button>.
          </p>
          <p>Need to make a complaint? See our <Link to="/complaints">complaints policy</Link>.</p>
          <p>If someone is in immediate danger, call 000. SolDirectory is not an emergency service.</p>
        </section>

        <section className="legal-section">
          <h2>Send us a message</h2>
          {state === 'sent' ? (
            <p role="status"><strong>Thank you.</strong> We’ve received your message and will reply by email, usually within one business day.</p>
          ) : (
            <form onSubmit={submit} className="contact-form">
              <label>Name<input name="name" required autoComplete="name" maxLength={120} /></label>
              <label>Email<input name="email" type="email" required autoComplete="email" maxLength={200} /></label>
              <label>Phone (optional)<input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
              <label>I am
                <select name="iAm" defaultValue="participant or family">
                  {I_AM.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <label>Message<textarea name="message" required rows={5} maxLength={4000} /></label>
              {/* Real people never see or fill this in. */}
              <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
              </div>
              {error && <p role="alert" className="contact-error">{error}</p>}
              <button type="submit" className="btn-gradient" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message'}</button>
            </form>
          )}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
