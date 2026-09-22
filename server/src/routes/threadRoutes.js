import { Router } from 'express';
import { createThread, listThreads, getThreadTree } from '../controllers/threadsController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Leer hilos no requiere estar logueado — solo publicar.
router.get('/', asyncHandler(listThreads));
router.get('/:id/classic', asyncHandler(getThreadTree));
router.post('/', requireAuth, asyncHandler(createThread));

export default router;