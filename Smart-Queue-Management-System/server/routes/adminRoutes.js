import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  listUsers, listPending, approveUser, rejectUser, deactivateUser, deleteUser, getStats
} from '../controllers/adminUserController.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/users', listUsers);
router.get('/users/pending', listPending);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/reject', rejectUser);
router.put('/users/:id/deactivate', deactivateUser);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);

export default router;