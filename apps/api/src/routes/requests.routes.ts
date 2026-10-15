import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { attachRequest, closeRequest, deleteRequest, getPersonRequests, getTrackedRequest, listMyRequests } from '../controllers/requests.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
const safe = (fn: (req: any, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => { fn(req, res).catch(next); };

// Fixed paths before /:id.
router.get('/mine', requireAuth, safe(listMyRequests));
router.get('/person/:id', safe(getPersonRequests));
router.get('/:id', safe(getTrackedRequest));
router.post('/:id/attach', requireAuth, safe(attachRequest));
router.post('/:id/close', safe(closeRequest));
router.post('/:id/delete', safe(deleteRequest));

export default router;
