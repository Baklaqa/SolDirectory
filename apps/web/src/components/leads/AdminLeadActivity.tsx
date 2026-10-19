import { useEffect, useState } from 'react';
import ProviderMap from '../ProviderMap';
import LeadTimeline from './LeadTimeline';
import { getAdminLeadActivity, type AdminLeadActivity as Activity, type AdminProviderRow } from '../../api/adminLeads';
import { timeAgo } from '../../lib/timeAgo';
import './AdminLeadActivity.css';

const HOW: Record<AdminProviderRow['how'], string> = {
  matched: 'Matched by SolDirectory',
  named: 'Asked for by name',
  shared: 'Shared by an administrator',
  nearby: 'Found it by browsing nearby',
};
const STATUS: Record<AdminProviderRow['status'], string> = { waiting: 'Not opened yet', opened: 'Opened', unlocked: 'Unlocked the details', declined: 'Declined' };
const PROBLEM: Record<string, string> = { invalid_contact: 'Details invalid', duplicate: 'Duplicate', other: 'Other problem' };

const stamp = (iso?: string) => (iso ? `${timeAgo(iso)}` : '—');

/** The administrator's view of one enquiry: places taken, every provider that touched it by name, the suburb on a map, and what happened in order. */
export default function AdminLeadActivity({ leadId }: { leadId: string }) {
  const [data, setData] = useState<Activity | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setData(null);
    setError(false);
    getAdminLeadActivity(leadId).then((d) => { if (alive) setData(d); }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [leadId]);

  if (error) return <p className="ala-note ala-bad" role="alert">Could not load the activity for this enquiry.</p>;
  if (!data) return <p className="ala-note">Loading activity…</p>;

  const { places, fill, providers, events, area, lead } = data;
  const where = [lead.suburb, lead.state].filter(Boolean).join(', ');
  return (
    <section className="ala" aria-label="Activity on this enquiry">
      <div className="ala-head">
        <h4>Activity</h4>
        <span className={`ala-places ala-places-${fill}`}>
          {fill === 'closed' ? 'Closed by the person' : fill === 'filled' ? `Filled: ${places.used} of ${places.max}` : `${places.used} of ${places.max} places taken`}
        </span>
        {lead.outcome && <span className="ala-outcome">The person said: {({ started: 'support has started', looking: 'still looking', not_needed: 'no longer needed' } as const)[lead.outcome.value]}</span>}
      </div>

      <div className="ala-cols">
        <div className="ala-main">
          <h5>Providers</h5>
          {providers.length === 0 ? <p className="ala-note">No provider has been sent this enquiry, and none has opened it.</p> : (
            <div className="ala-table-wrap">
              <table className="ala-table">
                <thead><tr><th scope="col">Provider</th><th scope="col">How it reached them</th><th scope="col">Opened</th><th scope="col">Unlocked</th><th scope="col">Where it stands</th></tr></thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.providerId}>
                      <th scope="row"><span className="ala-name">{p.name}</span>{p.plan && <small className="ala-plan">{p.plan}</small>}</th>
                      <td>{HOW[p.how]}{p.score !== null && p.how === 'matched' && <small> · score {Math.round(p.score)}</small>}</td>
                      <td>{stamp(p.openedAt)}</td>
                      <td>{stamp(p.unlockedAt)}</td>
                      <td>
                        <span className={`ala-pill ala-pill-${p.status}`}>{STATUS[p.status]}</span>
                        {p.problem && <span className="ala-pill ala-pill-problem" title={`Reported ${timeAgo(p.problem.at)}, ${p.problem.status}`}>{PROBLEM[p.problem.reason] ?? 'Problem'} · {p.problem.status}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h5>History</h5>
          <LeadTimeline events={events} />
        </div>

        <aside className="ala-side" aria-label="Location">
          {area ? (
            <>
              <div className="ala-map">
                <ProviderMap providers={[{ id: lead.id, name: `Around ${area.suburb}`, suburb: area.suburb, location: { lat: area.lat, lng: area.lng } }]} address={where} areaRadiusKm={2.5} />
              </div>
              <p className="ala-note">The suburb, not an address. A request only records a suburb.</p>
            </>
          ) : (
            <p className="ala-note">{where || 'No location'} is not on the map yet.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
