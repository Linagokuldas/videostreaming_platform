import { Router } from 'express';
import {
  getPlans,
  getMySubscription,
  createSubscription,
  cancelSubscription,
  renewSubscription,
} from '../controllers/subscriptionController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/plans', getPlans); // public plans listing
router.get('/me', verifyToken, getMySubscription);
router.post('/', verifyToken, createSubscription);
router.post('/:id/cancel', verifyToken, cancelSubscription);
router.post('/:id/renew', verifyToken, renewSubscription);

export default router;
