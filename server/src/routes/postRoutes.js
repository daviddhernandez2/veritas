import { Router } from 'express';
import { reply } from '../controllers/postsController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/:parentId/reply', requireAuth, asyncHandler(reply));

export default router;