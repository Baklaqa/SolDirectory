import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { approveProviderChecksAdmin, downloadProviderDocument, getProviderAdmin, runProviderChecksAdmin, setProviderAccountStatus } from '../../api/adminResources';
import { ApiError } from '../../api/client';
import { useToast } from '../../components/ui/Toast';
import './AdminProviders.css';

interface AdminProviderDetailData {
  _id: string;
  legalEntityName?: string;
  tradingName?: string;
  abn?: string;
  plan: string;
  intakeStatus: string;
  accountStatus: 'active' | 'suspended';
  serviceSuburbs?: string[];
  travelRadiusKm?: number;
  weeklyCapacityHours?: number;
  rosterSize?: number;
  onboarding?: { key: string; complete: boolean }[];
  attestation?: { registrationStatus: string; insuranceHeld: boolean; insuranceExpiry?: string; workerScreening: boolean; codeOfConduct: boolean; truthful: boolean; attestedAt: string; attestedBy?: string };
  verification?: {
    status: 'checked' | 'in_review' | 'needs_attention'; checkedAt: string; approvedBy?: string; approvedAt?: string; approvalNote?: string;
    checks: { key: string; label: string; result: 'pass' | 'warn' | 'fail'; message: string }[];
  };
  userId?: { name: string; email: string; mobile?: string };
}

export default function AdminProviderDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<AdminProviderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    getProviderAdmin(id)
      .then((data) => setProvider(data as unknown as AdminProviderDetailData))
      .catch((err) => showToast(err instanceof ApiError ? err.message : 'Could not load this provider.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function reload() {
    const data = await getProviderAdmin(id);
    setProvider(data as unknown as AdminProviderDetailData);
  }

  async function rerunChecks() {
    setUpdating(true);
    try { await runProviderChecksAdmin(id); await reload(); showToast('Checks run again.'); }
    catch (err) { showToast(err instanceof ApiError ? err.message : 'Could not run the checks.'); }
    finally { setUpdating(false); }
  }

  async function approveChecks() {
    setUpdating(true);
    try { await approveProviderChecksAdmin(id); await reload(); showToast('Approved. The provider has been emailed that their details are confirmed.'); }
    catch (err) { showToast(err instanceof ApiError ? err.message : 'Could not approve.'); }
    finally { setUpdating(false); }
  }

  async function openPolicy() {
    try { await downloadProviderDocument(id, 'incident_policy'); }
    catch (err) { showToast(err instanceof ApiError ? err.message : 'Could not open the document.'); }
  }

  async function toggleStatus() {
    if (!provider) return;
    const next = provider.accountStatus === 'active' ? 'suspended' : 'active';
    setUpdating(true);
    try {
      await setProviderAccountStatus(provider._id, next);
      setProvider({ ...provider, accountStatus: next });
      showToast(next === 'suspended' ? 'Provider suspended.' : 'Provider reactivated.');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update this provider.');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (!provider) return <p>Provider not found. <Link to="/admin/providers">Back to providers</Link></p>;

  return (
    <div className="admin-providers-page">
      <Link to="/admin/providers" className="admin-providers-back">← All providers</Link>
      <div className="admin-providers-header">
        <div>
          <h1 className="page-title">{provider.tradingName || provider.legalEntityName || 'Unnamed provider'}</h1>
          <span className={`admin-status-pill admin-status-pill-${provider.accountStatus}`}>{provider.accountStatus}</span>
        </div>
        <button
          className={`admin-toggle-btn ${provider.accountStatus === 'active' ? 'admin-toggle-btn-suspend' : 'admin-toggle-btn-activate'}`}
          disabled={updating}
          onClick={toggleStatus}
        >
          {updating ? 'Saving…' : provider.accountStatus === 'active' ? 'Suspend account' : 'Reactivate account'}
        </button>
      </div>

      <div className="admin-detail-grid">
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Owner</h2>
          <p>{provider.userId?.name ?? '—'}</p>
          <p>{provider.userId?.email ?? '—'}</p>
          <p>{provider.userId?.mobile ?? '—'}</p>
        </div>
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Business</h2>
          <p>ABN: {provider.abn || 'Not provided'}</p>
          <p>Plan: {provider.plan}</p>
          <p>Intake status: {provider.intakeStatus}</p>
        </div>
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Coverage</h2>
          <p>{provider.serviceSuburbs?.length ? provider.serviceSuburbs.join(', ') : 'No suburbs set'}</p>
          <p>{provider.travelRadiusKm ? `${provider.travelRadiusKm}km radius` : 'No radius set'}</p>
        </div>
        <div className="admin-detail-card admin-detail-card-wide">
          <h2 className="admin-detail-card-title">Onboarding checks</h2>
          {!provider.attestation ? (
            <p>This provider has not made the declaration yet.</p>
          ) : (
            <>
              <p>
                {provider.verification && (
                  <span className={`admin-status-pill admin-status-pill-${provider.verification.status === 'checked' ? 'active' : 'suspended'}`}>
                    {provider.verification.status === 'checked' ? 'Checked' : provider.verification.status === 'in_review' ? 'Needs a look' : 'Provider to fix'}
                  </span>
                )}{' '}
                Declared {new Date(provider.attestation.attestedAt).toLocaleDateString('en-AU')}
                {provider.attestation.attestedBy ? ` by ${provider.attestation.attestedBy}` : ''}: {provider.attestation.registrationStatus === 'registered' ? 'NDIS registered' : 'not NDIS registered'},
                insurance {provider.attestation.insuranceHeld ? `to ${provider.attestation.insuranceExpiry ? new Date(provider.attestation.insuranceExpiry).toLocaleDateString('en-AU') : 'no date'}` : 'not held'}.
              </p>
              {provider.verification && (
                <ul className="admin-onboarding-list">
                  {provider.verification.checks.map((c) => (
                    <li key={c.key + c.message}>{c.result === 'pass' ? '✓' : c.result === 'warn' ? '!' : '✗'} <strong>{c.label}:</strong> {c.message}</li>
                  ))}
                </ul>
              )}
              {provider.verification?.approvedAt && <p>Approved by {provider.verification.approvedBy} on {new Date(provider.verification.approvedAt).toLocaleDateString('en-AU')}.</p>}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                <button className="admin-toggle-btn admin-toggle-btn-activate" disabled={updating} onClick={rerunChecks}>Run the checks again</button>
                {provider.verification?.status === 'in_review' && <button className="admin-toggle-btn admin-toggle-btn-activate" disabled={updating} onClick={approveChecks}>Approve: I have looked at this</button>}
                <button className="admin-toggle-btn admin-toggle-btn-activate" onClick={openPolicy}>Open the policy document</button>
              </div>
            </>
          )}
        </div>
        <div className="admin-detail-card">
          <h2 className="admin-detail-card-title">Onboarding</h2>
          {provider.onboarding?.length ? (
            <ul className="admin-onboarding-list">
              {provider.onboarding.map((s) => (
                <li key={s.key}>{s.key} — {s.complete ? 'complete' : 'incomplete'}</li>
              ))}
            </ul>
          ) : (
            <p>Not started</p>
          )}
        </div>
      </div>
    </div>
  );
}
