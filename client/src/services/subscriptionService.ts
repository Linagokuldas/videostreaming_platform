import { api } from './api';
import { Plan, Subscription, Payment } from '../types';

export const subscriptionService = {
  async getPlans(): Promise<Plan[]> {
    const res = await api.get<Plan[]>('/plans');
    return res.data;
  },

  async getMySubscription(): Promise<Subscription | null> {
    const res = await api.get<{ subscription: Subscription | null }>('/subscriptions/me');
    return res.data.subscription;
  },

  async subscribe(planId: string, paymentMode: 'DEMO' | 'GATEWAY' = 'DEMO'): Promise<{ subscription: Subscription; payment: Payment }> {
    const res = await api.post('/subscriptions', { planId, paymentMode });
    return res.data;
  },

  async cancelSubscription(id: string): Promise<Subscription> {
    const res = await api.post<Subscription>(`/subscriptions/${id}/cancel`);
    return res.data;
  },

  async renewSubscription(id: string): Promise<Subscription> {
    const res = await api.post<Subscription>(`/subscriptions/${id}/renew`);
    return res.data;
  },

  async getPaymentHistory(): Promise<Payment[]> {
    const res = await api.get<Payment[]>('/payments/history');
    return res.data;
  },
};
