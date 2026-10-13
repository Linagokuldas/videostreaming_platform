import { Response } from 'express';
import { db } from '../services/db';
import { AuthRequest } from '../middleware/auth';

export const getPlans = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plans = await db.getPlans();
    res.json(plans);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching plans' });
  }
};

export const getMySubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const subscription = await db.getUserActiveSubscription(req.user.id);
    res.json({ subscription });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching subscription' });
  }
};

export const createSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { planId, paymentMode } = req.body;
    if (!planId) {
      res.status(400).json({ message: 'Plan ID is required' });
      return;
    }

    const plan = await db.getPlanById(planId);
    if (!plan) {
      res.status(404).json({ message: 'Plan not found' });
      return;
    }

    // Create subscription
    const subscription = await db.createSubscription(req.user.id, planId);

    // Record verified transaction
    const provider = paymentMode === 'GATEWAY' ? 'RAZORPAY_TEST' : 'DEMO_SANDBOX';
    const payment = await db.createPayment(
      req.user.id,
      subscription.id,
      plan.price,
      provider
    );

    res.status(201).json({ subscription, payment });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating subscription' });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const subscription = await db.cancelSubscription(id);
    res.json(subscription);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error cancelling subscription' });
  }
};

export const renewSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const subscription = await db.renewSubscription(id);
    res.json(subscription);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error renewing subscription' });
  }
};
