import { Router } from 'express';
import { getAdminDocs } from '../controllers/docsController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), asyncHandler(getAdminDocs));

export default router;
