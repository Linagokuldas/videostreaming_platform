import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  webhook,
} from '../controllers/paymentController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/create-order', verifyToken, createPaymentOrder);
router.post('/verify', verifyToken, verifyPayment);
router.get('/history', verifyToken, getPaymentHistory);
router.post('/webhook', webhook);

export default router;
