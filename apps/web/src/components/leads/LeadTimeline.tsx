import { exactTime, laterBy, timeAgo } from '../../lib/timeAgo';

interface Props {
  events: { key: string; label: string; at: string }[];
}

/** What has happened to a request, in order. The first step says how long ago; each later step says how long after the one before. */
export default function LeadTimeline({ events }: Props) {
  if (!events.length) return null;
  return (
    <ol className="lx-timeline" aria-label="What has happened to this request">
      {events.map((e, i) => (
        <li key={`${e.key}-${e.at}`} className={`lx-timeline-step${i === events.length - 1 ? ' lx-timeline-step-last' : ''}`}>
          <span className="lx-timeline-dot" aria-hidden="true" />
          <span className="lx-timeline-label">{e.label}</span>
          <time className="lx-timeline-when" dateTime={e.at} title={exactTime(e.at)}>
            {i === 0 ? timeAgo(e.at) : laterBy(events[i - 1].at, e.at)}
          </time>
        </li>
      ))}
    </ol>
  );
}
