import { Router } from 'express';
import express from 'express';
import { completeUpload, deleteDocument, getOnboarding, saveStep, getUploadUrl, uploadDocument } from '../controllers/onboarding.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', requireAuth, requireRole('provider'), getOnboarding);
// The file arrives as the raw request body (up to 10 MB), whatever its type.
router.post('/documents', requireAuth, requireRole('provider'), express.raw({ type: () => true, limit: '10mb' }), uploadDocument);
router.delete('/documents/:kind', requireAuth, requireRole('provider'), deleteDocument);
router.post('/upload-url', requireAuth, requireRole('provider'), getUploadUrl);
router.post('/upload-complete', requireAuth, requireRole('provider'), completeUpload);
router.post('/:stepKey', requireAuth, requireRole('provider'), saveStep);
export default router;
