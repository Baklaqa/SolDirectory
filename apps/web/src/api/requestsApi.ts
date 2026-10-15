import { ApiError } from './client';

const API_URL = ((import.meta as any).env?.VITE_API_URL ?? '/api').replace(/\/$/, '');

export type ProviderProgress = 'waiting' | 'viewed' | 'responded' | 'declined';

export interface TrackedRequest {
  id: string;
  reference: string;
  createdAt: string;
  need: string;
  suburb?: string;
  state?: string;
  careFor?: string;
  timeframe?: string;
  requestedProvider?: string;
  stage: 1 | 2 | 3 | 4;
  steps: { key: 'received' | 'sent' | 'viewed' | 'responded'; label: string; detail: string; at?: string; done: boolean }[];
  providers: { name: string; progress: ProviderProgress; at?: string }[];
  note?: string;
  searchUrl: string;
  trackingUrl?: string;
  /** The person closed the request, or deleted their details. */
  closed?: boolean;
  erased?: boolean;
}

/** A request on the "my requests" page, with the one-line position the weekly email also uses. */
export interface PersonRequest extends TrackedRequest {
  open: boolean;
  statusText: string;
  statusTone: 'good' | 'neutral';
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('sd_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/requests${path}`, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.error ?? 'Request failed', res.status);
  return body as T;
}

/** The link in the person's email carries a signed token: no account is needed to follow a request. */
export const getTrackedRequest = (id: string, token: string) => request<TrackedRequest>(`/${encodeURIComponent(id)}?t=${encodeURIComponent(token)}`);

export const attachRequest = (id: string, token: string) =>
  request<{ attached: boolean }>(`/${encodeURIComponent(id)}/attach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ t: token }),
  });

/** Closes the request so no further provider can open it. The link's signed token is the credential. */
export const closeTrackedRequest = (id: string, token: string) =>
  request<{ closed: boolean }>(`/${encodeURIComponent(id)}/close`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: token }),
  });

/** Clears the person's name, email, phone and notes from the request and closes it. */
export const deleteTrackedRequest = (id: string, token: string) =>
  request<{ erased: boolean }>(`/${encodeURIComponent(id)}/delete`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: token }),
  });

export const listMyRequests = () => request<{ items: TrackedRequest[] }>('/mine', { headers: authHeaders() });

/** Every request made with the same email address as request `id`, from the one-click link in the weekly summary email. */
export const getPersonRequests = (id: string, token: string) =>
  request<{ items: PersonRequest[] }>(`/person/${encodeURIComponent(id)}?t=${encodeURIComponent(token)}`);
