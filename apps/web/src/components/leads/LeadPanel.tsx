import { useState } from 'react';
import { isLeadUnlocked } from '@soldirectory/shared-types';
import ProviderMap from '../ProviderMap';
import LeadTimeline from './LeadTimeline';
import type { LeadActivity } from '../../api/resources';
import { reportLeadProblem } from '../../api/resources';

interface Props {
  activity: LeadActivity;
  unlocking: boolean;
  error: { message: string; code?: string } | null;
  onUnlock: () => void;
  onDecline: () => void;
}

const Icon = ({ d }: { d: string }) => (
  <span className="lx-fact-icon" aria-hidden="true">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  </span>
);
const ICON = {
  who: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  wallet: 'M4 7h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7Zm0 0V6a1 1 0 0 1 1-1h11M16 13.5h.01',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2',
};

export default function LeadPanel({ activity, unlocking, error, onUnlock, onDecline }: Props) {
  const { lead, area, slots, state } = activity;
  const unlocked = isLeadUnlocked(lead);
  const [reported, setReported] = useState<'' | 'sent' | 'failed'>('');

  async function report(reason: 'invalid_contact' | 'duplicate') {
    try { await reportLeadProblem(lead.id, reason); setReported('sent'); } catch { setReported('failed'); }
  }

  const where = [lead.suburb, area?.state].filter(Boolean).join(', ');
  const funding = [lead.fundingType, lead.funding].filter(Boolean).join(' · ');

  let banner: { tone: 'open' | 'full' | 'done'; text: string };
  if (unlocked) banner = { tone: 'done', text: 'You unlocked this request. Please contact the person within one business day, and only about this request.' };
  else if (state === 'closed') banner = { tone: 'full', text: 'The person closed this request, so it can no longer be unlocked. Please don’t contact them.' };
  else if (state === 'filled') banner = { tone: 'full', text: `Filled. Up to ${slots.max} providers can respond to a request, and ${slots.max === slots.used ? 'they already have' : 'that many already have'}. Please don’t contact this person.` };
  else banner = { tone: 'open', text: `${slots.left} of ${slots.max} places left. Up to ${slots.max} providers can unlock a request, first come first served, and unlocking shows the contact details.` };

  const canUnlock = !unlocked && state === 'open';

  return (
    <article className="lx-panel" aria-label={lead.need}>
      <p className={`lx-banner lx-banner-${banner.tone}`} role="status">{banner.text}</p>

      <div className="lx-panel-grid">
        <div className="lx-panel-main">
          <h2 className="lx-title">{lead.need}</h2>
          <dl className="lx-facts">
            <div className="lx-fact"><Icon d={ICON.who} /><div><dt>Who it’s for</dt><dd>{lead.careFor || 'Not stated'}</dd></div></div>
            <div className="lx-fact"><Icon d={ICON.pin} /><div><dt>Location</dt><dd>{where || 'Not stated'}</dd></div></div>
            <div className="lx-fact"><Icon d={ICON.wallet} /><div><dt>Funding</dt><dd>{funding || 'Not stated'}</dd></div></div>
            <div className="lx-fact"><Icon d={ICON.clock} /><div><dt>Timing</dt><dd>{lead.timeframe || 'Not stated'}</dd></div></div>
          </dl>

          <dl className="lx-more">
            {lead.hoursPerWeek && <div><dt>Hours a week</dt><dd>{lead.hoursPerWeek}</dd></div>}
            {lead.planManagement && <div><dt>Plan management</dt><dd>{lead.planManagement}</dd></div>}
            {typeof lead.distanceKm === 'number' && <div><dt>From your service area</dt><dd>About {lead.distanceKm} km</dd></div>}
          </dl>

          {lead.conditions.length > 0 && (
            <div className="lx-needs">
              <h3 className="lx-h3">Support needs</h3>
              <ul className="lx-chips">{lead.conditions.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
          )}

          <section className="lx-contact" aria-labelledby="lx-contact-h">
            <h3 className="lx-h3" id="lx-contact-h">Contact details</h3>
            {unlocked ? (
              <>
                <p className="lx-contact-name">{lead.contactName}</p>
                {lead.contactPhone && <p><a href={`tel:${lead.contactPhone.replace(/[^+\d]/g, '')}`}>{lead.contactPhone}</a></p>}
                {lead.budget && <p>Budget: {lead.budget}</p>}
                {lead.note && <p className="lx-contact-note">{lead.note}</p>}
                {reported === 'sent' ? (
                  <p role="status" className="lx-small">Thank you. We’ll review it and restore the unlock if it was unusable.</p>
                ) : (
                  <p className="lx-small">
                    Details not working, or a request you already had?{' '}
                    <button type="button" className="link-btn" onClick={() => report('invalid_contact')}>Details are invalid</button>{' · '}
                    <button type="button" className="link-btn" onClick={() => report('duplicate')}>It’s a duplicate</button>
                    {reported === 'failed' && <span role="alert"> Could not send the report. Please try again.</span>}
                  </p>
                )}
              </>
            ) : (
              <p className="lx-muted">The person’s name, phone number and notes are shown once you unlock the request.</p>
            )}
          </section>
        </div>

        <aside className="lx-panel-side" aria-label="Location and history">
          <div className="lx-map">
            {area ? (
              <ProviderMap
                providers={[{ id: lead.id, name: `Around ${area.suburb}`, suburb: area.suburb, location: { lat: area.lat, lng: area.lng } }]}
                address={where}
                areaRadiusKm={2.5}
              />
            ) : (
              <div className="lx-map-none"><p>{where || 'Location not stated'}</p><p className="lx-small">This suburb is not on the map yet.</p></div>
            )}
            {area && <p className="lx-map-note">The circle is the area around {area.suburb}, not an address. A request only records a suburb.</p>}
          </div>

          {canUnlock ? (
            <button type="button" className="lx-action" disabled={unlocking} onClick={onUnlock}>{unlocking ? 'Unlocking…' : 'Unlock this request'}</button>
          ) : (
            <button type="button" className="lx-action" disabled>{unlocked ? 'Unlocked' : state === 'closed' ? 'Closed' : 'Filled'}</button>
          )}
          {error && (
            <p className="lx-error" role="alert">
              {error.message} {(error.code === 'QUOTA_EXHAUSTED' || error.code === 'PLAN_REQUIRED') && <a href="/plans">See plans</a>}
            </p>
          )}
          {canUnlock && !activity.declined && activity.origin !== 'nearby' && (
            <button type="button" className="link-btn lx-decline" onClick={onDecline}>Not a fit? Decline this request</button>
          )}
          {activity.declined && <p className="lx-small">You declined this request.</p>}

          <h3 className="lx-h3 lx-history-h">History</h3>
          <LeadTimeline events={activity.events} />
          <p className="lx-small lx-history-note">Other providers are counted, never named.</p>
        </aside>
      </div>
    </article>
  );
}
