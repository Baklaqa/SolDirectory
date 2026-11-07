/**
 * Express 4 does not catch errors thrown inside `async` route handlers: the rejected promise goes unhandled and Node ends the whole API
 * process (a single request such as {"email":{"$gt":""}} to /api/auth/login was enough to take the site's API down until PM2 restarted it).
 * This makes every route handler, existing and future, pass a rejected promise on to Express's error handler instead, so the visitor gets a
 * clean error response and the server keeps running. It must be imported before any router is created (see index.ts).
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Layer = require('express/lib/router/layer') as { prototype: { handle_request: (req: unknown, res: unknown, next: (err?: unknown) => void) => void; handle: (...args: unknown[]) => unknown } };

Layer.prototype.handle_request = function handleRequest(this: typeof Layer.prototype, req, res, next) {
  const fn = this.handle;
  if (fn.length > 3) return next(); // an error handler: only called with an error
  try {
    const result = fn(req, res, next);
    if (result && typeof (result as Promise<unknown>).catch === 'function') (result as Promise<unknown>).catch(next);
  } catch (err) {
    next(err);
  }
};
