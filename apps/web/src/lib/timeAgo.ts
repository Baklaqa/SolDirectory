const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

function span(ms: number): string {
  if (ms < MIN) return 'less than a minute';
  if (ms < HOUR) { const n = Math.floor(ms / MIN); return `${n} minute${n === 1 ? '' : 's'}`; }
  if (ms < DAY) { const n = Math.floor(ms / HOUR); return `${n} hour${n === 1 ? '' : 's'}`; }
  const n = Math.floor(ms / DAY);
  return `${n} day${n === 1 ? '' : 's'}`;
}

/** "8 hours ago", "3 days ago", "just now". */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const ms = Math.max(0, now - new Date(iso).getTime());
  return ms < MIN ? 'just now' : `${span(ms)} ago`;
}

/** "3 minutes later": how long after `fromIso` the event at `toIso` happened. */
export function laterBy(fromIso: string, toIso: string): string {
  const ms = Math.max(0, new Date(toIso).getTime() - new Date(fromIso).getTime());
  return `${span(ms)} later`;
}

/** "Sat 17 Oct, 3:04 pm" in Sydney time, for a tooltip on a timeline step. */
export function exactTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Australia/Sydney' });
}
