import { load } from 'cheerio';
import type { Request, Response } from 'express';
import { registerShell } from '../../controllers/registerShell.controller.js';

export interface RenderedPage {
  path: string;
  title: string;
  h1: string;
  description: string;
  canonical: string;
  /** 'index' or 'noindex' as the page's own robots rule says. */
  robots: 'index' | 'noindex';
  /** The page's main content as the crawler HTML has it. */
  html: string;
  jsonLd: unknown[];
}

/**
 * Renders a public page exactly as the crawler HTML does (the SEO shell), by calling the same handler, so WordPress gets the same
 * words a search engine sees. Returns null when the page does not exist or is a redirect.
 */
export async function renderSeoPage(path: string): Promise<RenderedPage | null> {
  let status = 200;
  let body: string | null = null;
  let redirected = false;
  const res = {
    status(n: number) { status = n; return res; },
    set() { return res; },
    send(b: unknown) { body = String(b); return res; },
    redirect() { redirected = true; return res; },
  } as unknown as Response;
  const host = process.env.SITE_URL ? new URL(process.env.SITE_URL).host : 'localhost';
  const req = {
    originalUrl: `/seo-shell${path}`,
    protocol: 'https',
    get: (h: string) => (h.toLowerCase() === 'host' ? host : undefined),
    header: () => undefined,
  } as unknown as Request;
  await registerShell(req, res);
  if (redirected || status !== 200 || !body) return null;

  const $ = load(body);
  const main = $('main[data-seo-shell]');
  if (!main.length) return null;
  const robots = $('meta[name="robots"]').attr('content') ?? '';
  return {
    path,
    title: $('title').first().text().trim(),
    h1: main.find('h1').first().text().trim(),
    description: $('meta[name="description"]').attr('content')?.trim() ?? '',
    canonical: $('link[rel="canonical"]').attr('href') ?? '',
    robots: /noindex/i.test(robots) ? 'noindex' : 'index',
    html: (main.html() ?? '').trim(),
    jsonLd: $('script[type="application/ld+json"]').toArray().flatMap((el) => {
      try { return [JSON.parse($(el).text())]; } catch { return []; }
    }),
  };
}
