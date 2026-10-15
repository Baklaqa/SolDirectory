import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import {
  signup, login, me, forgotPassword, resetPassword, setupTwoFactor, enableTwoFactor, disableTwoFactor,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
const safe = (fn: (req: any, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => { fn(req, res).catch(next); };

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/2fa/setup', requireAuth, safe(setupTwoFactor));
router.post('/2fa/enable', requireAuth, safe(enableTwoFactor));
router.post('/2fa/disable', requireAuth, safe(disableTwoFactor));
export default router;
