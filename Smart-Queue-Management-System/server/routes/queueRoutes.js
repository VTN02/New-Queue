import { Router } from 'express';
import { body } from 'express-validator';
import { joinQueue, getQueue, getStatus, dashboard, nextCustomer, completeCustomer, resetQueue } from '../controllers/queueController.js';

const router=Router();
router.post('/join', [body('name').trim().isLength({min:2,max:60}), body('serviceType').notEmpty()], joinQueue);
router.get('/status/:queueNumber', getStatus);
router.get('/dashboard', dashboard);
router.get('/', getQueue);
router.post('/next', nextCustomer);
router.put('/:id/complete', completeCustomer);
router.delete('/reset', resetQueue);
export default router;
