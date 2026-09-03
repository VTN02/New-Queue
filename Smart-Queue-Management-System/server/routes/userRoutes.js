import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getProfile, updateProfile, getDashboard, getQueueHistory } from '../controllers/userController.js';

const router = Router();

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/dashboard', getDashboard);
router.get('/queue-history', getQueueHistory);

export default router;