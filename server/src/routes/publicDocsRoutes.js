import { Router } from 'express';
import { getPublicDocs } from '../controllers/docsController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Cualquier usuario logueado, sin requireRole — a diferencia de
// docsRoutes.js (/api/admin/docs), que sí exige rol admin.
router.get('/', requireAuth, asyncHandler(getPublicDocs));

export default router;
