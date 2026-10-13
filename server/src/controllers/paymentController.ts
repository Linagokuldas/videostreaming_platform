import { Response } from 'express';
import { db } from '../services/db';
import { AuthRequest } from '../middleware/auth';

export const createPaymentOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { planId } = req.body;
    const plan = await db.getPlanById(planId);
    if (!plan) {
      res.status(404).json({ message: 'Plan not found' });
      return;
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    res.json({
      orderId,
      amount: plan.price,
      currency: plan.currency,
      key: 'rzp_test_reelflix_mock_key',
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating payment order' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { planId, providerOrderId, providerPaymentId } = req.body;
    const plan = await db.getPlanById(planId);
    if (!plan) {
      res.status(404).json({ message: 'Plan not found' });
      return;
    }

    const subscription = await db.createSubscription(req.user.id, planId);
    const payment = await db.createPayment(
      req.user.id,
      subscription.id,
      plan.price,
      'RAZORPAY_TEST',
      providerOrderId,
      providerPaymentId
    );

    res.json({ success: true, subscription, payment });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Payment verification failed' });
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const history = await db.getPaymentsByUser(req.user.id);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching payment history' });
  }
};

export const webhook = async (req: any, res: Response): Promise<void> => {
  // Webhook endpoint acknowledging provider events idempotently
  res.status(200).json({ received: true });
};
