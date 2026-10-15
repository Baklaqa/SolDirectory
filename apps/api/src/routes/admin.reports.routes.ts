import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { dismissUnlockReport, listContactMessages, listUnlockReports, restoreUnlock } from '../controllers/admin.reports.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
const safe = (fn: (req: any, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => { fn(req, res).catch(next); };
const adminOnly = [requireAuth, requireRole('admin')] as const;

router.get('/unlocks', ...adminOnly, safe(listUnlockReports));
router.post('/unlocks/:id/restore', ...adminOnly, safe(restoreUnlock));
router.post('/unlocks/:id/dismiss', ...adminOnly, safe(dismissUnlockReport));
router.get('/messages', ...adminOnly, safe(listContactMessages));
export default router;
