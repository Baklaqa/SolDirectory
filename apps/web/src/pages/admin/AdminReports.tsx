import { useEffect, useState } from 'react';
import { ApiError } from '../../api/client';
import './AdminEnquiries.css';

const API_URL = ((import.meta as any).env?.VITE_API_URL ?? '/api').replace(/\/$/, '');
const headers = (): Record<string, string> => {
  const token = localStorage.getItem('sd_token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};
async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/admin/reports${path}`, { ...init, headers: headers() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status);
  return body as T;
}

interface UnlockReportRow { id: string; reason: string; note: string; status: 'open' | 'restored' | 'dismissed'; provider: string; request: string; createdAt: string; resolvedBy: string | null }
interface MessageRow { id: string; name: string; email: string; phone: string; iAm: string; message: string; createdAt: string }

const REASON: Record<string, string> = { invalid_contact: 'Contact details invalid', duplicate: 'Duplicate request', other: 'Other' };
const when = (iso: string) => new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });

/** Admin: provider reports about unusable unlocks (restore or dismiss), and messages from the Contact page. */
export default function AdminReports() {
  const [reports, setReports] = useState<UnlockReportRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = () => {
    call<UnlockReportRow[]>('/unlocks').then(setReports).catch((e) => setError(e.message));
    call<MessageRow[]>('/messages').then(setMessages).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  async function resolve(id: string, action: 'restore' | 'dismiss') {
    setBusy(id);
    setError('');
    try { await call(`/unlocks/${id}/${action}`, { method: 'POST' }); load(); } catch (e) { setError((e as Error).message); } finally { setBusy(''); }
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Reports and messages</h1>
      {error && <p role="alert" style={{ color: '#B4232F' }}>{error}</p>}

      <h2 className="dashboard-card-title" style={{ marginTop: 24 }}>Unlock reports</h2>
      <p style={{ fontSize: 14 }}>A provider says a request they unlocked had invalid contact details or duplicated one they had. Restoring gives the unlock back.</p>
      {reports.length === 0 ? <p>No reports.</p> : (
        <table className="legal-table" style={{ width: '100%' }}>
          <thead><tr><th>When</th><th>Provider</th><th>Request</th><th>Reason</th><th>Status</th><th /></tr></thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{when(r.createdAt)}</td>
                <td>{r.provider}</td>
                <td>{r.request}</td>
                <td>{REASON[r.reason] ?? r.reason}{r.note ? `: ${r.note}` : ''}</td>
                <td>{r.status}{r.resolvedBy ? ` by ${r.resolvedBy}` : ''}</td>
                <td>
                  {r.status === 'open' && (
                    <>
                      <button type="button" className="btn btn-primary" disabled={busy === r.id} onClick={() => resolve(r.id, 'restore')}>Restore unlock</button>{' '}
                      <button type="button" className="btn" disabled={busy === r.id} onClick={() => resolve(r.id, 'dismiss')}>Dismiss</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="dashboard-card-title" style={{ marginTop: 32 }}>Contact messages</h2>
      {messages.length === 0 ? <p>No messages.</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {messages.map((m) => (
            <li key={m.id} className="dashboard-card" style={{ marginBottom: 12 }}>
              <p style={{ margin: 0 }}><strong>{m.name}</strong> ({m.iAm}) · <a href={`mailto:${m.email}`}>{m.email}</a>{m.phone ? ` · ${m.phone}` : ''} · {when(m.createdAt)}</p>
              <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
