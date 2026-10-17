import { REAL_SERVICES, REGISTER_TYPES, STATE_CODES, type RegisterType } from '../registerNormalise.js';

/**
 * Page keys for the pages whose copy the n8n automation rewrites (apps/api/src/controllers/automation.controller.ts).
 *
 *   service:<service-slug>:<state>:<suburb-slug>     /services/plan-management/vic/preston
 *   register:<ndis|aged_care>:<state>:<suburb-slug>  /ndis-providers/vic/preston
 *   register:<ndis|aged_care>:<state>                /ndis-providers/vic          (a state page)
 *
 * State is the lowercase code (vic). A key is stable: the same page always has the same key.
 */
export type PageKey =
  | { kind: 'service'; service: string; serviceSlug: string; state: string; suburbSlug: string }
  | { kind: 'register'; type: RegisterType; state: string; suburbSlug: string | null };

export const slugifyService = (text: string): string =>
  text.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const SLUG = /^[a-z0-9][a-z0-9-]{0,80}$/;

export function formatKey(k: PageKey): string {
  return k.kind === 'service'
    ? `service:${k.serviceSlug}:${k.state}:${k.suburbSlug}`
    : `register:${k.type}:${k.state}${k.suburbSlug ? `:${k.suburbSlug}` : ''}`;
}

export function parseKey(raw: string): PageKey | null {
  const parts = String(raw ?? '').toLowerCase().split(':');
  const state = (s: string | undefined) => (s && STATE_CODES.includes(s.toUpperCase() as never) ? s : null);
  if (parts[0] === 'service' && parts.length === 4) {
    const service = REAL_SERVICES.find((name) => slugifyService(name) === parts[1]);
    const st = state(parts[2]);
    if (!service || !st || !SLUG.test(parts[3])) return null;
    return { kind: 'service', service, serviceSlug: parts[1], state: st, suburbSlug: parts[3] };
  }
  if (parts[0] === 'register' && (parts.length === 3 || parts.length === 4)) {
    const type = (REGISTER_TYPES as readonly string[]).includes(parts[1]) ? (parts[1] as RegisterType) : null;
    const st = state(parts[2]);
    if (!type || !st) return null;
    if (parts.length === 4 && !SLUG.test(parts[3])) return null;
    return { kind: 'register', type, state: st, suburbSlug: parts.length === 4 ? parts[3] : null };
  }
  return null;
}

/** The public path of the page a key stands for. */
export function pathOf(k: PageKey): string {
  if (k.kind === 'service') return `/services/${k.serviceSlug}/${k.state}/${k.suburbSlug}`;
  const base = k.type === 'ndis' ? '/ndis-providers' : '/aged-care-providers';
  return `${base}/${k.state}${k.suburbSlug ? `/${k.suburbSlug}` : ''}`;
}
