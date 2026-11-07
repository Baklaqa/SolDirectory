import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { attachRequest, closeRequest, deleteRequest, getPersonRequests, getTrackedRequest, listMyRequests, setRequestOutcome } from '../controllers/requests.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { limits } from '../middleware/rateLimit.js';

const router = Router();
const safe = (fn: (req: any, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => { fn(req, res).catch(next); };

// Fixed paths before /:id.
router.get('/mine', requireAuth, safe(listMyRequests));
router.get('/person/:id', limits.token, safe(getPersonRequests));
router.get('/:id', limits.token, safe(getTrackedRequest));
router.post('/:id/attach', requireAuth, safe(attachRequest));
router.post('/:id/close', limits.requestChange, safe(closeRequest));
router.post('/:id/outcome', limits.requestChange, safe(setRequestOutcome));
router.post('/:id/delete', limits.requestChange, safe(deleteRequest));

export default router;
