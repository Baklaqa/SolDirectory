import LeadMatch from '../models/LeadMatch.js';
import LeadView from '../models/LeadView.js';
import Provider from '../models/Provider.js';
import UnlockLedger from '../models/UnlockLedger.js';
import UnlockReport from '../models/UnlockReport.js';
import { MAX_UNLOCKS_PER_LEAD } from './leadLimits.js';

/**
 * What happened to requests, from the records the system already keeps: who was told (LeadMatch), who opened it (LeadView / LeadMatch),
 * who unlocked the contact details (UnlockLedger) and what was reported afterwards (UnlockReport). Used by the administrator's request
 * screen (everyone named) and by the person who made a request (providers named, no one else's details).
 */
export interface MatchRow { leadId: unknown; providerId: unknown; score?: number; matchReason?: string; status: string; notifiedAt?: Date; viewedAt?: Date; respondedAt?: Date }
export interface UnlockRow { leadId: unknown; providerId: unknown; createdAt: Date }
export interface ViewRow { leadId: unknown; providerId: unknown; firstViewedAt: Date }
export interface ReportRow { leadId: unknown; providerId: unknown; reason: string; status: string; createdAt: Date }

export interface ActivityData {
  matches: MatchRow[];
  unlocks: UnlockRow[];
  views: ViewRow[];
  reports: ReportRow[];
  names: Map<string, string>;
  plans: Map<string, string>;
}

const key = (v: unknown) => String(v);

export async function loadActivityData(leadIds: unknown[]): Promise<ActivityData> {
  if (!leadIds.length) return { matches: [], unlocks: [], views: [], reports: [], names: new Map(), plans: new Map() };
  const [matches, unlocks, views, reports] = await Promise.all([
    LeadMatch.find({ leadId: { $in: leadIds } }).select('leadId providerId score matchReason status notifiedAt viewedAt respondedAt').lean<MatchRow[]>(),
    UnlockLedger.find({ leadId: { $in: leadIds } }).sort({ createdAt: 1, _id: 1 }).select('leadId providerId createdAt').lean<UnlockRow[]>(),
    LeadView.find({ leadId: { $in: leadIds } }).select('leadId providerId firstViewedAt').lean<ViewRow[]>(),
    UnlockReport.find({ leadId: { $in: leadIds } }).select('leadId providerId reason status createdAt').lean<ReportRow[]>(),
  ]);
  const providerIds = [...new Set([...matches, ...unlocks, ...views, ...reports].map((r) => key(r.providerId)))];
  const providers = providerIds.length
    ? await Provider.find({ _id: { $in: providerIds } }).select('tradingName legalEntityName plan').lean<{ _id: unknown; tradingName?: string; legalEntityName?: string; plan?: string }[]>()
    : [];
  return {
    matches, unlocks, views, reports,
    names: new Map(providers.map((p) => [key(p._id), p.tradingName || p.legalEntityName || 'A provider'])),
    plans: new Map(providers.map((p) => [key(p._id), p.plan ?? ''])),
  };
}

export const forLead = <T extends { leadId: unknown }>(rows: T[], leadId: unknown): T[] => rows.filter((r) => key(r.leadId) === key(leadId));

export interface HistoryEvent { key: string; label: string; at: string }
const iso = (d: Date | string | undefined) => (d ? new Date(d).toISOString() : '');
const byTime = (a: HistoryEvent, b: HistoryEvent) => new Date(a.at).getTime() - new Date(b.at).getTime();

/** How many of the places on a request are taken, and whether it is open, filled, or closed by the person. */
export function placesFor(lead: { status?: string }, unlockCount: number) {
  const used = unlockCount;
  return {
    places: { used, max: MAX_UNLOCKS_PER_LEAD, left: Math.max(0, MAX_UNLOCKS_PER_LEAD - used) },
    fill: (lead.status === 'closed' ? 'closed' : used >= MAX_UNLOCKS_PER_LEAD ? 'filled' : 'open') as 'open' | 'filled' | 'closed',
  };
}

export interface AdminProviderRow {
  providerId: string;
  name: string;
  plan: string;
  /** How the request reached this provider. */
  how: 'matched' | 'named' | 'shared' | 'nearby';
  reason: string;
  score: number | null;
  status: 'waiting' | 'opened' | 'unlocked' | 'declined';
  notifiedAt?: string;
  openedAt?: string;
  unlockedAt?: string;
  declinedAt?: string;
  problem?: { reason: string; status: string; at: string };
}

/** Everything the administrator's request screen shows for one request: every provider that touched it, by name, and the history in order. */
export function adminActivity(lead: any, data: ActivityData) {
  const id = lead._id;
  const matches = forLead(data.matches, id);
  const unlocks = forLead(data.unlocks, id);
  const views = forLead(data.views, id);
  const reports = forLead(data.reports, id);
  const providerIds = [...new Set([...matches, ...unlocks, ...views].map((r) => key(r.providerId)))];

  const providers: AdminProviderRow[] = providerIds.map((pid) => {
    const m = matches.find((x) => key(x.providerId) === pid);
    const u = unlocks.find((x) => key(x.providerId) === pid);
    const v = views.find((x) => key(x.providerId) === pid);
    const rep = reports.find((x) => key(x.providerId) === pid);
    const openedAt = v?.firstViewedAt ?? m?.viewedAt;
    const reason = m?.matchReason ?? '';
    return {
      providerId: pid,
      name: data.names.get(pid) ?? 'A provider',
      plan: data.plans.get(pid) ?? '',
      how: !m ? 'nearby' : /^Asked for you by name/i.test(reason) ? 'named' : /^Shared by SolDirectory/i.test(reason) ? 'shared' : 'matched',
      reason,
      score: m?.score ?? null,
      status: u ? 'unlocked' : m?.status === 'declined' ? 'declined' : openedAt ? 'opened' : 'waiting',
      notifiedAt: m?.notifiedAt ? iso(m.notifiedAt) : undefined,
      openedAt: openedAt ? iso(openedAt) : undefined,
      unlockedAt: u ? iso(u.createdAt) : undefined,
      declinedAt: m?.status === 'declined' && m.respondedAt ? iso(m.respondedAt) : undefined,
      problem: rep ? { reason: rep.reason, status: rep.status, at: iso(rep.createdAt) } : undefined,
    };
  });

  const events: HistoryEvent[] = [{ key: 'came_in', label: 'Request came in', at: iso(lead.createdAt) }];
  if (lead.consent?.recordedAt) events.push({ key: 'consent', label: 'The person agreed to share their details with matched providers', at: iso(lead.consent.recordedAt) });
  for (const p of providers) {
    if (p.notifiedAt) events.push({ key: `notified-${p.providerId}`, label: p.how === 'shared' ? `Shared with ${p.name} by SolDirectory` : p.how === 'named' ? `Sent to ${p.name}, who was asked for by name` : `Sent to ${p.name}`, at: p.notifiedAt });
    if (p.openedAt) events.push({ key: `opened-${p.providerId}`, label: `${p.name} opened it`, at: p.openedAt });
    if (p.unlockedAt) events.push({ key: `unlocked-${p.providerId}`, label: `${p.name} unlocked the contact details`, at: p.unlockedAt });
    if (p.declinedAt) events.push({ key: `declined-${p.providerId}`, label: `${p.name} declined it`, at: p.declinedAt });
    if (p.problem) events.push({ key: `problem-${p.providerId}`, label: `${p.name} reported a problem (${p.problem.reason.replace('_', ' ')}), ${p.problem.status}`, at: p.problem.at });
  }
  if (unlocks.length >= MAX_UNLOCKS_PER_LEAD) events.push({ key: 'filled', label: `Request filled: ${MAX_UNLOCKS_PER_LEAD} providers have the contact details`, at: iso(unlocks[MAX_UNLOCKS_PER_LEAD - 1].createdAt) });
  if (lead.viewedNoticeAt) events.push({ key: 'notice-viewed', label: 'The person was emailed that a provider looked at it', at: iso(lead.viewedNoticeAt) });
  if (lead.respondedNoticeAt) events.push({ key: 'notice-responded', label: 'The person was emailed that a provider took it up', at: iso(lead.respondedNoticeAt) });
  if (lead.outcome?.at) events.push({ key: 'outcome', label: `The person said: ${({ started: 'support has started', looking: 'still looking', not_needed: 'no longer needed' } as Record<string, string>)[lead.outcome.value] ?? lead.outcome.value}`, at: iso(lead.outcome.at) });
  events.sort(byTime);

  return { providers, events, unlockCount: unlocks.length, ...placesFor(lead, unlocks.length) };
}

/** What the person who made a request sees of its history: providers named, times, and how many places are taken. No scores, plans or reports. */
export function personHistory(lead: any, matches: MatchRow[], unlocks: UnlockRow[], names: Map<string, string>) {
  const name = (pid: unknown) => names.get(key(pid)) ?? 'A provider';
  const events: HistoryEvent[] = [{ key: 'received', label: 'Request received', at: iso(lead.createdAt) }];
  const notified = matches.map((m) => m.notifiedAt).filter(Boolean) as Date[];
  if (notified.length) {
    events.push({ key: 'sent', label: `Sent to ${matches.length} matching provider${matches.length === 1 ? '' : 's'}`, at: iso(new Date(Math.min(...notified.map((d) => new Date(d).getTime())))) });
  }
  for (const m of matches) {
    const opened = m.viewedAt;
    if (opened) events.push({ key: `opened-${key(m.providerId)}`, label: `${name(m.providerId)} opened your request`, at: iso(opened) });
    if (m.status === 'declined' && m.respondedAt) events.push({ key: `declined-${key(m.providerId)}`, label: `${name(m.providerId)} said they are not available`, at: iso(m.respondedAt) });
  }
  for (const u of unlocks) events.push({ key: `unlocked-${key(u.providerId)}`, label: `${name(u.providerId)} unlocked your contact details`, at: iso(u.createdAt) });
  if (unlocks.length >= MAX_UNLOCKS_PER_LEAD) events.push({ key: 'filled', label: `Your request is full: ${MAX_UNLOCKS_PER_LEAD} providers have your contact details`, at: iso(unlocks[MAX_UNLOCKS_PER_LEAD - 1].createdAt) });
  if (lead.outcome?.at) events.push({ key: 'outcome', label: `You said: ${({ started: 'support has started', looking: 'still looking', not_needed: 'no longer needed' } as Record<string, string>)[lead.outcome.value] ?? lead.outcome.value}`, at: iso(lead.outcome.at) });
  events.sort(byTime);
  return { history: events, ...placesFor(lead, unlocks.length) };
}
