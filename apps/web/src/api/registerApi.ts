import { ApiError } from './client';
import type { RegisterType } from '../lib/registerMeta';
import type { AreaLocalData, ServiceLocalData } from '@soldirectory/topic-content';

/**
 * Public-register listings (api register.controller.ts). No login, no
 * auth header: the data is public-register facts only.
 */
const API_URL = ((import.meta as any).env?.VITE_API_URL ?? '/api').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/register${path}`, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.error ?? 'Request failed', res.status);
  return body as T;
}

export interface RegisterArea { suburb: string; suburbSlug: string; state: string }

export interface RegisterListItem {
  type: RegisterType;
  slug: string;
  name: string;
  states: string[];
  areaCount: number;
  areas: RegisterArea[];
  supportCategories: string[];
  hasWebsite: boolean;
  /** Only for a listing a member provider has claimed and uploaded a logo for; the registers publish none. */
  logoUrl?: string | null;
  /** The suburb centroid of the listing's first service area — a register listing has no street address, so this is never more precise than "somewhere in this suburb". Null until that suburb has been geocoded. */
  location: { lat: number; lng: number } | null;
  /** Australian Business Number — a public identifier, shown whenever known. */
  abn?: string;
  claimStatus: 'unclaimed' | 'requested' | 'claimed';
}

export interface RegisterSearchResult {
  items: RegisterListItem[]; page: number; limit: number; total: number;
  /** Present when facets were requested: how many listings in this area offer each category. */
  categories?: { category: string; count: number }[];
}

export function searchRegister(params: {
  type: RegisterType; state?: string; suburb?: string; category?: string; language?: string; q?: string; page?: number; limit?: number; facets?: boolean;
}): Promise<RegisterSearchResult> {
  const qs = new URLSearchParams({ type: params.type });
  if (params.state) qs.set('state', params.state);
  if (params.suburb) qs.set('suburb', params.suburb);
  if (params.category) qs.set('category', params.category);
  if (params.language) qs.set('language', params.language);
  if (params.q) qs.set('q', params.q);
  if (params.page && params.page > 1) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.facets) qs.set('facets', '1');
  return request(`/search?${qs.toString()}`);
}

export interface RegisterHub {
  total: number;
  /** When the register data was last imported (ISO), or null. */
  asOf?: string | null;
  states: Record<string, number>;
  categories: { category: string; count: number }[];
  suburbs: { state: string; slug: string; suburb: string; count: number }[];
}
// A page can ask for the same hub from several components (the providers page asks twice), and moving between hub
// pages asks again. One request is shared and reused for a few minutes; a failed one is not kept.
const HUB_TTL_MS = 5 * 60 * 1000;
const hubCache = new Map<RegisterType, { at: number; promise: Promise<RegisterHub> }>();
export const getRegisterHub = (type: RegisterType): Promise<RegisterHub> => {
  const hit = hubCache.get(type);
  if (hit && Date.now() - hit.at < HUB_TTL_MS) return hit.promise;
  const promise = request<RegisterHub>(`/hub?type=${type}`);
  hubCache.set(type, { at: Date.now(), promise });
  promise.catch(() => { if (hubCache.get(type)?.promise === promise) hubCache.delete(type); });
  return promise;
};

export interface ServiceSuburbs {
  category: string;
  suburbs: { state: string; slug: string; suburb: string; count: number }[];
}
/** Every suburb with genuine register demand for a support category, combined across both registers — the real data behind /services/:service/:state/:suburb (see ServiceLocationPage.tsx). */
export const getAreaLocal = (type: RegisterType, state: string, suburbSlug?: string): Promise<AreaLocalData> =>
  request(`/area-local?type=${encodeURIComponent(type)}&state=${encodeURIComponent(state)}${suburbSlug ? `&suburb=${encodeURIComponent(suburbSlug)}` : ''}`);
export const getServiceLocal = (service: string, state: string, suburbSlug: string): Promise<ServiceLocalData> =>
  request(`/service-local?service=${encodeURIComponent(service)}&state=${encodeURIComponent(state)}&suburb=${encodeURIComponent(suburbSlug)}`);
export const getServiceSuburbs = (category: string, limit?: number, state?: string): Promise<ServiceSuburbs> =>
  request(`/service-suburbs?category=${encodeURIComponent(category)}${limit ? `&limit=${limit}` : ''}${state ? `&state=${encodeURIComponent(state)}` : ''}`);

export interface AreaSupports {
  state: string;
  suburb: string;
  /** Listings in the suburb needed for a service x suburb page to exist, and for it to be indexed. */
  minPage: number;
  minIndexed: number;
  categories: { category: string; count: number }[];
}
/** For each support, how many register listings (NDIS and My Aged Care combined) in one suburb list it. */
export const getAreaSupports = (state: string, suburbSlug: string): Promise<AreaSupports> =>
  request(`/area-supports?state=${encodeURIComponent(state)}&suburb=${encodeURIComponent(suburbSlug)}`);

export interface CategoryOverview {
  total: number;
  states: Record<string, number>;
  topSuburbs: { state: string; slug: string; suburb: string; count: number }[];
  widest: { slug: string; name: string; states: string[]; areaCount: number }[];
}
/** Counts, top suburbs and widest-coverage listings for one support category on the register. */
export const getCategoryOverview = (type: RegisterType, category: string): Promise<CategoryOverview> =>
  request(`/category-overview?type=${type}&category=${encodeURIComponent(category)}`);

export interface CategoryCounts { total: number; states: Record<string, number> }
/** How many register listings list a support category, per state. */
export const getCategoryCounts = (type: RegisterType, category: string): Promise<CategoryCounts> =>
  request(`/category-counts?type=${type}&category=${encodeURIComponent(category)}`);

/** How many register listings state a language on their own website, per state. */
export const getLanguageCounts = (type: RegisterType, language: string): Promise<CategoryCounts> =>
  request(`/language-counts?type=${type}&language=${encodeURIComponent(language)}`);

export interface RegisterListing {
  type: RegisterType;
  slug: string;
  name: string;
  /** When this listing was last present in a register import (ISO). */
  asOf?: string | null;
  states: string[];
  areaCount: number;
  areas: RegisterArea[];
  website: string | null;
  services: string[];
  supportCategories: string[];
  claimStatus: 'unclaimed' | 'requested' | 'claimed';
  /** A claimed listing's own uploaded logo, else one found on the business's own website, else null (initials shown). */
  logoUrl: string | null;
  location: { lat: number; lng: number } | null;
  related: RegisterListItem[];
  /** Australian Business Number — a public identifier, shown whenever known. */
  abn: string | null;
  /** Service x suburb pages that exist (and are indexed) for this listing's first area, for the supports it lists. */
  serviceLinks?: { service: string; slug: string; state: string; suburbSlug: string; suburb: string; count: number }[];
}
export const getRegisterListing = (type: RegisterType, slug: string): Promise<RegisterListing> =>
  request(`/${type}/${encodeURIComponent(slug)}`);

export function submitClaimRequest(type: RegisterType, slug: string, input: {
  name: string; email: string; phone?: string; role: string; message?: string; website_url?: string;
}): Promise<{ ok: true }> {
  return request(`/${type}/${encodeURIComponent(slug)}/claim-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

/** Copy written by the content automation and approved by the API's score gate (api services/pageContent), for a page path. Null when the page has none. */
export interface ApprovedPageCopy {
  seoTitle: string;
  metaDescription: string;
  intro: string;
  sections: { heading: string; body: string }[];
  faqs: { question: string; answer: string }[];
}

export async function getApprovedPageCopy(path: string): Promise<ApprovedPageCopy | null> {
  try {
    const res = await fetch(`${API_URL}/page-content?path=${encodeURIComponent(path)}`);
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.content as ApprovedPageCopy) ?? null;
  } catch {
    return null;
  }
}
