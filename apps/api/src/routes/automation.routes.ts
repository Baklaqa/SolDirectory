import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { requireAutomationKey } from '../middleware/automationKey.js';
import { health, page, pages, putContent, rules, runStaleCheck, stats, sync, unpublishPage, validate } from '../controllers/automation.controller.js';

const router = Router();

// Express 4 does not forward a rejected promise from an async handler to the error middleware.
const safe = (fn: (req: Request, res: Response) => unknown): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => { Promise.resolve(fn(req, res)).catch(next); };

// Every route needs the automation key (X-Automation-Key header, or Authorization: Bearer).
router.use(requireAutomationKey);
router.get('/health', safe(health));
router.get('/rules', safe(rules));
router.get('/stats', safe(stats));
router.get('/pages', safe(pages));
router.get('/pages/:key', safe(page));
router.post('/pages/:key/validate', safe(validate));
router.put('/pages/:key/content', safe(putContent));
router.post('/pages/:key/unpublish', safe(unpublishPage));
router.post('/stale-check', safe(runStaleCheck));
router.post('/sync', safe(sync));

export default router;
