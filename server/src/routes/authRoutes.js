import { Router } from 'express';
import { register, login, me, getProfile, getMyPosts } from '../controllers/authController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));
router.get('/profile', requireAuth, asyncHandler(getProfile));
router.get('/my-posts', requireAuth, asyncHandler(getMyPosts));

export default router;