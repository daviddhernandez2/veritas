import { Router } from 'express';
import { reply, report, appeal } from '../controllers/postsController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/:parentId/reply', requireAuth, asyncHandler(reply));
router.post('/:postId/report', requireAuth, asyncHandler(report));
router.post('/:postId/appeal', requireAuth, asyncHandler(appeal));

export default router;