import { Router } from 'express';
import { submitMatchRequest, saveMatchRequestDraft } from '../controllers/matchRequests.controller.js';
import { limits } from '../middleware/rateLimit.js';

const router = Router();
// Public — anonymous site visitors use the "Get Matched" wizard with
// no login, same as it's always worked.
router.post('/', limits.matchRequest, submitMatchRequest);
router.post('/draft', limits.matchDraft, saveMatchRequestDraft);
export default router;
