import { Router } from 'express';
import { createSearchAlert, unsubscribeSearchAlert, verifySearchAlert } from '../controllers/searchAlerts.controller.js';
import { limits } from '../middleware/rateLimit.js';

const router = Router();
router.post('/', limits.searchAlert, createSearchAlert);
router.get('/verify', verifySearchAlert);
router.get('/unsubscribe', unsubscribeSearchAlert);
export default router;