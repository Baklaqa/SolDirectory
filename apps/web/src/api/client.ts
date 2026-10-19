const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getToken(): string | null {
  return localStorage.getItem('sd_token');
}

/** Fired when the server says the sign-in is no longer valid (logged out, expired, or removed elsewhere). */
export const SESSION_ENDED_EVENT = 'sd:session-ended';

let guardInstalled = false;
/**
 * Watches every request to the site's own API. If one comes back "401 not signed in", the stored sign-in is
 * removed and the app is told, so a page that needs an account sends the person to the login page (and back afterwards) instead of
 * staying on screen with buttons that fail with "Missing bearer token". Sign-in attempts themselves (/auth/...) are left alone.
 */
export function installSessionGuard() {
  if (guardInstalled || typeof window === 'undefined') return;
  guardInstalled = true;
  const original = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await original(input, init);
    if (res.status === 401) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      // Any "not signed in" answer counts, including one to a request that carried no sign-in because it was already gone.
      if (url.includes(API_URL) && !/\/auth\//.test(url)) {
        localStorage.removeItem('sd_token');
        window.dispatchEvent(new Event(SESSION_ENDED_EVENT));
      }
    }
    return res;
  };
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('sd_token', token);
  else localStorage.removeItem('sd_token');
}

interface RequestOptions extends RequestInit {
  idempotencyKey?: string;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status, data.code);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
};
