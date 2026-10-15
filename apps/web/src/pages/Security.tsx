import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import { ApiError } from '../api/client';
import './Plans.css';

interface Me { user: { id: string; name: string; role: string; twoFactorEnabled?: boolean } }

/** /security: switch two-factor sign-in (an authenticator app) on or off. Required for administrators; offered to everyone else. */
export default function Security() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Me>('/auth/me').then((r) => setEnabled(!!r.user.twoFactorEnabled)).catch(() => setEnabled(false));
  }, []);

  const fail = (err: unknown) => setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');

  async function start() {
    setBusy(true); setError(''); setMessage('');
    try { setSetup(await api.post<{ secret: string; otpauthUrl: string }>('/auth/2fa/setup')); } catch (err) { fail(err); } finally { setBusy(false); }
  }

  async function enable(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.post('/auth/2fa/enable', { code });
      setEnabled(true); setSetup(null); setCode('');
      setMessage('Two-factor sign-in is on. You will be asked for a code each time you sign in.');
    } catch (err) { fail(err); } finally { setBusy(false); }
  }

  async function disable(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.post('/auth/2fa/disable', { password, code });
      setEnabled(false); setCode(''); setPassword('');
      setMessage('Two-factor sign-in is off.');
    } catch (err) { fail(err); } finally { setBusy(false); }
  }

  return (
    <div className="plans-page">
      <div className="plans-header"><h1 className="page-title">Security</h1></div>
      {message && <div className="plans-notice plans-notice-ok" role="status">{message}</div>}
      {error && <div className="plans-notice plans-notice-warn" role="alert">{error}</div>}

      <section className="plan-card" style={{ maxWidth: 560 }}>
        <h2>Two-factor sign-in</h2>
        {enabled === null ? <p>Loading…</p> : enabled ? (
          <form onSubmit={disable}>
            <p>Two-factor sign-in is <strong>on</strong>. To turn it off, enter your password and a current code.</p>
            <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
            <label>6-digit code<input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" required /></label>
            <button type="submit" className="btn btn-primary" disabled={busy}>Turn off</button>
          </form>
        ) : setup ? (
          <form onSubmit={enable}>
            <p>
              In an authenticator app (such as Google Authenticator, Microsoft Authenticator or 1Password), add an account using this key, or{' '}
              <a href={setup.otpauthUrl}>open it in your app</a>:
            </p>
            <p><code style={{ wordBreak: 'break-all' }}>{setup.secret}</code></p>
            <label>Then enter the 6-digit code it shows<input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" required /></label>
            <button type="submit" className="btn btn-primary" disabled={busy}>Turn on</button>
          </form>
        ) : (
          <>
            <p>Two-factor sign-in asks for a code from an authenticator app as well as your password. It is required for administrators and recommended for providers.</p>
            <button type="button" className="btn btn-primary" onClick={start} disabled={busy}>Set up</button>
          </>
        )}
      </section>
    </div>
  );
}
