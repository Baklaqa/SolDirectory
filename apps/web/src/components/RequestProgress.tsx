import type { TrackedRequest, ProviderProgress } from '../api/requestsApi';
import LeadTimeline from './leads/LeadTimeline';
import './RequestProgress.css';

const PROGRESS_LABEL: Record<ProviderProgress, string> = {
  waiting: 'Waiting to open it',
  viewed: 'Has looked at it',
  responded: 'Has taken it up',
  declined: 'Not available right now',
};

/** One plain line: how many providers have the contact details, out of how many can. */
function placesLine(request: TrackedRequest): string | null {
  if (!request.places) return null;
  const { used, max } = request.places;
  if (request.fill === 'closed') return used === 0 ? 'You closed this request. No provider has your contact details.' : `You closed this request. ${used} provider${used === 1 ? ' has' : 's have'} your contact details.`;
  if (used === 0) return `No provider has your contact details yet. Up to ${max} can.`;
  if (used >= max) return `${max} of ${max} providers have your contact details. No more can unlock your request.`;
  return `${used} of ${max} providers have your contact details.`;
}

const when = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';

/** The four-step timeline and the list of providers for one request. Shared by the tracking page and the dashboard. */
export default function RequestProgress({ request, compact = false }: { request: TrackedRequest; compact?: boolean }) {
  return (
    <div className={`rp${compact ? ' rp-compact' : ''}`}>
      <ol className="rp-steps" aria-label="Progress of this request">
        {request.steps.map((step, i) => {
          const state = step.done ? 'done' : i === request.stage ? 'next' : 'todo';
          return (
            <li key={step.key} className={`rp-step rp-step-${state}`} aria-current={i === request.stage - 1 ? 'step' : undefined}>
              <span className="rp-dot" aria-hidden="true">{step.done ? '✓' : i + 1}</span>
              <div className="rp-step-body">
                <strong>{step.label}</strong>
                {!compact && <span>{step.detail}</span>}
                {step.at && <time dateTime={step.at}>{when(step.at)}</time>}
              </div>
            </li>
          );
        })}
      </ol>

      {placesLine(request) && <p className={`rp-places rp-places-${request.fill ?? 'open'}`}>{placesLine(request)}</p>}

      {!compact && request.providers.length > 0 && (
        <div className="rp-providers">
          <h3>Who has your request</h3>
          <ul>
            {request.providers.map((p, i) => (
              <li key={`${p.name}-${i}`}>
                <span className="rp-provider-name">{p.name}</span>
                <span className={`rp-chip rp-chip-${p.progress}`}>{PROGRESS_LABEL[p.progress]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!compact && request.history && request.history.length > 1 && (
        <div className="rp-history">
          <h3>What has happened</h3>
          <LeadTimeline events={request.history} />
        </div>
      )}
    </div>
  );
}
