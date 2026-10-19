import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  declineLead, getLeadActivity, listLeads, listMissedLeads, listNearbyLeads, markLeadOpened, unlockLead,
  type LeadActivity, type MissedLead,
} from '../api/resources';
import { ApiError } from '../api/client';
import { useToast } from '../components/ui/Toast';
import LeadPanel from '../components/leads/LeadPanel';
import { isLeadUnlocked, type Lead } from '@soldirectory/shared-types';
import { timeAgo } from '../lib/timeAgo';
import './Leads.css';
import './LeadsInbox.css';
import '../components/ui/Chip.css';

type Tab = 'matches' | 'unlocked' | 'nearby' | 'missed';
type LeadRow = Lead & { viewed?: boolean; origin?: string; createdAt?: string };
type LoadState = 'idle' | 'loading' | 'loaded' | 'plan-required' | 'capacity' | 'error';

const TABS: { id: Tab; label: string }[] = [
  { id: 'matches', label: 'Matches' },
  { id: 'unlocked', label: 'Unlocked' },
  { id: 'nearby', label: 'All nearby' },
  { id: 'missed', label: 'Missed' },
];

export default function Leads() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [nearby, setNearby] = useState<LeadRow[]>([]);
  const [nearbyState, setNearbyState] = useState<LoadState>('idle');
  const [missed, setMissed] = useState<MissedLead[]>([]);
  const [missedState, setMissedState] = useState<LoadState>('idle');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [params, setParams] = useSearchParams();
  const tab = (TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'matches') as Tab;
  const selectedId = params.get('lead');

  const [activity, setActivity] = useState<LeadActivity | null>(null);
  const [activityState, setActivityState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [unlocking, setUnlocking] = useState(false);
  const [actionError, setActionError] = useState<{ message: string; code?: string } | null>(null);
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    listLeads().then((items) => setLeads(items as LeadRow[])).catch(() => setLoadError(true)).finally(() => setLoading(false));
  }, []);

  // The other two lists are only fetched when looked at: browsing nearby needs a paid plan, and "missed" is rarely opened.
  useEffect(() => {
    if (tab !== 'nearby' || nearbyState !== 'idle') return;
    setNearbyState('loading');
    listNearbyLeads()
      .then((items) => { setNearby(items as LeadRow[]); setNearbyState('loaded'); })
      .catch((err) => setNearbyState(err instanceof ApiError && err.code === 'PLAN_REQUIRED' ? 'plan-required' : err instanceof ApiError && err.code === 'CAPACITY_UNCONFIRMED' ? 'capacity' : 'error'));
  }, [tab, nearbyState]);
  useEffect(() => {
    if (tab !== 'missed' || missedState !== 'idle') return;
    setMissedState('loading');
    listMissedLeads().then((items) => { setMissed(items); setMissedState('loaded'); }).catch(() => setMissedState('error'));
  }, [tab, missedState]);

  const matches = useMemo(() => leads.filter((l) => !isLeadUnlocked(l)), [leads]);
  const unlockedList = useMemo(() => leads.filter((l) => isLeadUnlocked(l)), [leads]);
  const rows: LeadRow[] = tab === 'matches' ? matches : tab === 'unlocked' ? unlockedList : tab === 'nearby' ? nearby : missed;
  const listState: LoadState = tab === 'nearby' ? nearbyState : tab === 'missed' ? missedState : 'loaded';

  const select = useCallback((id: string | null, nextTab?: Tab) => {
    const next = new URLSearchParams(params);
    if (id) next.set('lead', id); else next.delete('lead');
    if (nextTab) next.set('tab', nextTab);
    setParams(next, { replace: false });
  }, [params, setParams]);

  function chooseTab(t: Tab) {
    const next = new URLSearchParams();
    next.set('tab', t);
    setParams(next);
  }

  // Opening a request records that this provider looked at it (the person who made it is told once, the first time any matched provider
  // does). Nothing opens by itself: a request is only "opened" when its owner clicks it. A missed request is not recorded.
  useEffect(() => {
    setActionError(null);
    if (!selectedId) { setActivity(null); setActivityState('idle'); return undefined; }
    let alive = true;
    setActivityState('loading');
    const record = tab === 'missed' ? Promise.resolve() : markLeadOpened(selectedId).then(() => {
      if (alive) setLeads((prev) => prev.map((l) => (l.id === selectedId ? { ...l, viewed: true } : l)));
    }).catch(() => {});
    record
      .then(() => getLeadActivity(selectedId))
      .then((a) => { if (alive) { setActivity(a); setActivityState('idle'); } })
      .catch(() => { if (alive) setActivityState('error'); });
    return () => { alive = false; };
  }, [selectedId, tab]);

  async function handleUnlock() {
    if (!activity) return;
    const id = activity.lead.id;
    setUnlocking(true);
    setActionError(null);
    try {
      const updated = await unlockLead(id);
      setLeads((prev) => (prev.some((l) => l.id === id) ? prev.map((l) => (l.id === id ? { ...l, ...updated } : l)) : [{ ...updated } as LeadRow, ...prev]));
      setNearby((prev) => prev.filter((l) => l.id !== id));
      showToast('Request unlocked. The contact details are now visible.');
      select(id, 'unlocked');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'PLAN_REQUIRED') { navigate('/plans'); return; }
      if (err instanceof ApiError) {
        setActionError({ message: err.message, code: err.code });
        if (err.code === 'LEAD_FULL' || err.code === 'LEAD_CLOSED') getLeadActivity(id).then(setActivity).catch(() => {});
      } else showToast('Could not unlock that request.');
    } finally {
      setUnlocking(false);
    }
  }

  async function handleDecline() {
    if (!activity) return;
    const id = activity.lead.id;
    try {
      await declineLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      showToast('Request declined.');
      select(null);
    } catch {
      showToast('Could not decline that request.');
    }
  }

  if (loading) return <div className="leads-page">Loading…</div>;
  if (loadError) return <div className="leads-page"><p className="lead-veil-error" role="alert">Could not load your requests. Try again shortly.</p></div>;

  return (
    <div className="leads-page lx-page">
      <h1 className="page-title lx-page-title">Requests</h1>
      <div className={`lx-layout${selectedId ? ' lx-layout-open' : ''}`}>
        <section className="lx-list-col" aria-label="Requests">
          <div className="lx-tabs" role="tablist">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={`lx-tab${tab === t.id ? ' lx-tab-active' : ''}`} onClick={() => chooseTab(t.id)}>
                {t.label}
                {t.id === 'matches' && matches.length > 0 && <span className="lx-count">{matches.length}</span>}
              </button>
            ))}
          </div>

          {tab === 'nearby' && nearbyState === 'loading' && <p className="lx-note">Loading nearby requests…</p>}
          {tab === 'nearby' && nearbyState === 'plan-required' && (
            <div className="lx-note lx-note-box">
              <p>Browsing nearby requests is a Connect-plan feature. Beyond the requests matched straight to you, you can find and unlock other genuine matches yourself.</p>
              <button className="lead-unlock-btn" onClick={() => navigate('/plans')}>View plans</button>
            </div>
          )}
          {tab === 'nearby' && nearbyState === 'capacity' && <p className="lx-note">Confirm your capacity to browse new requests.</p>}
          {tab === 'nearby' && nearbyState === 'error' && <p className="lx-note lead-veil-error">Could not load nearby requests. Try again shortly.</p>}
          {tab === 'missed' && missedState === 'loading' && <p className="lx-note">Loading…</p>}
          {tab === 'missed' && missedState === 'error' && <p className="lx-note lead-veil-error">Could not load missed requests. Try again shortly.</p>}

          {listState === 'loaded' && rows.length === 0 && (
            <p className="lx-note">
              {tab === 'matches' && 'No open requests are matched to you right now. New ones appear here and in your email.'}
              {tab === 'unlocked' && 'You have not unlocked any requests yet.'}
              {tab === 'nearby' && 'No other open requests match your services and areas right now.'}
              {tab === 'missed' && 'Nothing missed in the last 90 days: no request matched to you filled up or closed before you opened it.'}
            </p>
          )}

          <ul className="lx-list">
            {listState === 'loaded' && rows.map((l) => {
              const created = (l as { createdAt?: string }).createdAt;
              const isNew = tab === 'matches' && !(l as LeadRow).viewed;
              return (
                <li key={l.id}>
                  <button type="button" className={`lx-item${selectedId === l.id ? ' lx-item-active' : ''}`} aria-current={selectedId === l.id ? 'true' : undefined} onClick={() => select(l.id)}>
                    <span className="lx-item-title">
                      {isNew && <span className="lx-new" aria-label="New">●</span>}
                      {l.need}
                    </span>
                    <span className="lx-item-meta">
                      {[l.suburb, l.fundingType, created ? timeAgo(created) : ''].filter(Boolean).join(' · ')}
                    </span>
                    {(l as LeadRow).origin === 'named' && <span className="pill pill-ok lx-item-pill">Asked for you by name</span>}
                    {(l as LeadRow).origin === 'shared' && <span className="pill pill-flat lx-item-pill">Referred by SolDirectory</span>}
                    {tab === 'missed' && <span className="pill pill-flat lx-item-pill">{(l as MissedLead).missedBecause === 'closed' ? 'Closed by the person' : 'Filled'}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="lx-detail-col" aria-label="Request details" aria-live="polite">
          {selectedId && (
            <button type="button" className="lx-back" onClick={() => select(null)}>← Back to requests</button>
          )}
          {!selectedId && <div className="lx-empty"><p>Select a request to see where it is, what was asked, and what has happened to it.</p></div>}
          {selectedId && activityState === 'loading' && <p className="lx-note">Loading…</p>}
          {selectedId && activityState === 'error' && <p className="lx-note lead-veil-error" role="alert">That request is not available to you any more.</p>}
          {selectedId && activity && activityState === 'idle' && activity.lead.id === selectedId && (
            <LeadPanel activity={activity} unlocking={unlocking} error={actionError} onUnlock={handleUnlock} onDecline={handleDecline} />
          )}
        </section>
      </div>
    </div>
  );
}
