import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
const WP_TIMEOUT_MS = 8000; // a slow or down WordPress must never leave visitors' requests (and our sockets) hanging

/**
 * Which WordPress REST paths the public proxy will fetch: the site's own content (posts, pages, the custom post types, categories and
 * other terms, the menus). WordPress also serves things that must not be readable through this site: /users (it lists every author's login
 * name), /settings, /comments, /plugins, /themes, application passwords, revisions and the block editor's internals. Those are refused,
 * and so is any path that is not plain letters, numbers, dashes and slashes (no "..", no encoded tricks).
 */
const WP_PATH = /^wp-json\/(wp\/v2|soldirectory\/v1)(\/[A-Za-z0-9_-]+)*\/?$/;
const WP_DENIED_SEGMENTS = new Set([
  'users', 'settings', 'comments', 'plugins', 'themes', 'application-passwords', 'revisions', 'autosaves', 'search', 'block-types', 'blocks',
  'block-directory', 'block-renderer', 'templates', 'template-parts', 'navigation', 'widgets', 'widget-types', 'sidebars', 'menu-locations',
  'global-styles', 'font-families', 'font-collections', 'pattern-directory', 'wp-site-health', 'site-health', 'oembed',
]);
const isAllowedWpPath = (path: string): boolean => WP_PATH.test(path) && !path.split('/').some((segment) => WP_DENIED_SEGMENTS.has(segment.toLowerCase()));
const WP_GRAPHQL_ENDPOINT = process.env.WORDPRESS_GRAPHQL_URL;
const WP_REST_BASE = process.env.WORDPRESS_URL; // e.g. http://46.250.242.208:8080

router.post('/graphql', requireAuth, requireRole('admin'), async (req, res) => {
  if (!WP_GRAPHQL_ENDPOINT) {
    return res.status(503).json({ error: 'WORDPRESS_GRAPHQL_URL is not set — see .env.example' });
  }
  try {
    const wpRes = await fetch(WP_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(WP_TIMEOUT_MS),
    });
    const data = await wpRes.json();
    res.status(wpRes.status).json(data);
  } catch (err: any) {
    console.error('[wp graphql]', err?.message);
    res.status(502).json({ error: 'Could not reach the WordPress GraphQL endpoint' });
  }
});

/**
 * REST proxy — added to permanently resolve the cross-origin problem
 * between the React app (port 80) and WordPress (port 8080), the
 * exact issue this whole conversation has been chasing. The browser
 * only ever talks to THIS API (already same-origin, already proven
 * working), which then fetches WordPress server-side — a server-to-
 * server request has no concept of CORS at all, since CORS is
 * exclusively a browser-enforced restriction.
 *
 * This is a better fix than any amount of WordPress-side CORS header
 * configuration, because it removes the cross-origin request from
 * existing in the first place, rather than trying to correctly
 * permit it.
 *
 * Matches any /wp-json/... path — the frontend calls
 * /api/wp/rest/wp-json/wp/v2/services?slug=test and this forwards
 * it, verbatim, to WORDPRESS_URL/wp-json/wp/v2/services?slug=test.
 */
router.get(/^\/rest\/(.*)$/, async (req, res) => {
  if (!WP_REST_BASE) {
    return res.status(503).json({ error: 'WORDPRESS_URL is not set — see .env.example' });
  }
  try {
    const path = req.params[0];
    if (!isAllowedWpPath(path)) return res.status(404).json({ error: 'Not found' });
    const qs = req.originalUrl.split('?')[1];
    const url = `${WP_REST_BASE.replace(/\/$/, '')}/${path}${qs ? `?${qs}` : ''}`;
    const wpRes = await fetch(url, { signal: AbortSignal.timeout(WP_TIMEOUT_MS) });
    const data = await wpRes.text(); // pass through raw — could be JSON or an error page, don't assume
    res.status(wpRes.status).set('Content-Type', wpRes.headers.get('content-type') ?? 'application/json');
    for (const name of ['x-wp-total', 'x-wp-totalpages']) {
      const value = wpRes.headers.get(name);
      if (value) res.set(name, value);
    }
    res.send(data);
  } catch (err: any) {
    console.error('[wp rest]', err?.message);
    res.status(502).json({ error: 'Could not reach the WordPress REST API' });
  }
});

export default router;
