import { Router } from 'express';
import { joinQueue, getQueue, getStatus, summary, dashboard, nextCustomer, completeCustomer, resetQueue } from '../controllers/queueController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.post('/join', protect, joinQueue);
router.get('/status/:queueNumber', getStatus);
router.get('/summary', summary);
router.get('/dashboard', protect, adminOnly, dashboard);
router.get('/', getQueue);
router.post('/next', protect, adminOnly, nextCustomer);
router.put('/:id/complete', protect, adminOnly, completeCustomer);
router.delete('/reset', protect, adminOnly, resetQueue);
export default router;
