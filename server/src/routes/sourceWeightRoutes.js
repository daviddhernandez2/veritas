import { Router } from 'express';
import { listSourceWeights, updateSourceWeight } from '../controllers/sourceWeightsController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', asyncHandler(listSourceWeights));
router.patch('/:type', requireAuth, requireRole('admin'), asyncHandler(updateSourceWeight));

export default router;