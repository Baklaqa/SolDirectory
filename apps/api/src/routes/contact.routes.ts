import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { submitContactMessage } from '../controllers/contact.controller.js';
import { limits } from '../middleware/rateLimit.js';

const router = Router();
const safe = (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => { fn(req, res).catch(next); };

router.post('/', limits.contact, safe(submitContactMessage));
export default router;
