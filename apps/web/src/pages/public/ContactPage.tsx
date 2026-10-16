import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader, PublicFooter } from './PublicLayout';
import { siteConfig, phoneHref } from '../../config/siteConfig';
import { applySeoTags } from '../../lib/seo';
import { useMatchModal } from '../../context/MatchModalContext';
import './LegalPage.css';
import './AboutContact.css';

const API_URL = ((import.meta as any).env?.VITE_API_URL ?? '/api').replace(/\/$/, '');
const I_AM = [
  { value: 'participant or family', label: 'A participant or family member' },
  { value: 'provider', label: 'A provider' },
  { value: 'worker', label: 'An independent worker' },
  { value: 'other', label: 'Something else' },
];

const iconProps = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const PhoneIcon = () => (
  <svg {...iconProps}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>
);
const MailIcon = () => (
  <svg {...iconProps}><rect x="2.5" y="4.5" width="19" height="15" rx="2" /><path d="m3 6.5 9 6 9-6" /></svg>
);
const PinIcon = () => (
  <svg {...iconProps}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);

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

  const methods = [
    siteConfig.contactPhone && {
      key: 'phone', icon: <PhoneIcon />, title: 'Phone',
      body: <><a href={phoneHref(siteConfig.contactPhone)}>{siteConfig.contactPhone}</a>{siteConfig.supportHours ? <><br />{siteConfig.supportHours}</> : null}</>,
    },
    siteConfig.contactEmail && {
      key: 'email', icon: <MailIcon />, title: 'Email',
      body: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail.split('@')[0]}@<wbr />{siteConfig.contactEmail.split('@').slice(1).join('@')}</a>,
    },
    siteConfig.contactAddress && {
      key: 'post', icon: <PinIcon />, title: 'Post',
      body: <>SolDirectory, {siteConfig.contactAddress}</>,
    },
  ].filter(Boolean) as { key: string; icon: JSX.Element; title: string; body: JSX.Element }[];

  return (
    <>
      <PublicHeader />
      <main>
        <div className="ac-hero">
          <div className="ac-hero-inner">
            <nav className="ac-crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Contact</span>
            </nav>
            <span className="ac-eyebrow">Contact SolDirectory</span>
            <h1>Get in touch</h1>
            <p className="ac-lead">We’re here to help you use SolDirectory, update a listing, or raise a concern.</p>
            <p className="ac-updated">Last updated: 15 October 2026</p>
          </div>
        </div>

        <div className="ac-wrap">
          {methods.length > 0 && (
            <div className="ac-methods">
              {methods.map((m) => (
                <section key={m.key} className="ac-method">
                  <span className="ac-method-icon">{m.icon}</span>
                  <div>
                    <h2>{m.title}</h2>
                    <p>{m.body}</p>
                  </div>
                </section>
              ))}
            </div>
          )}

          <div className="ac-contact-grid">
            <section className="ac-form-card" aria-labelledby="ac-form-heading">
              <h2 id="ac-form-heading">Send us a message</h2>
              {state === 'sent' ? (
                <p role="status"><strong>Thank you.</strong> We’ve received your message and will reply by email, usually within one business day.</p>
              ) : (
                <>
                  <p>Tell us what you need and we’ll reply by email.</p>
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
                </>
              )}
            </section>

            <div className="ac-side">
              <section className="ac-side-card">
                <h2>Looking for support right now?</h2>
                <p>Tell us what you need once and providers who are taking new people can respond.</p>
                <button type="button" className="btn-gradient" onClick={() => openMatchModal()}>Get matched for free</button>
              </section>
              <section className="ac-side-card">
                <h2>Need to make a complaint?</h2>
                <p>See our <Link to="/complaints">complaints policy</Link> for how we handle them and how long it takes.</p>
              </section>
              <section className="ac-side-card ac-side-urgent">
                <h2>In immediate danger?</h2>
                <p>Call 000. SolDirectory is not an emergency service.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
