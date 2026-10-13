import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../services/subscriptionService';
import { Plan, Subscription } from '../types';
import { PlanCard } from '../components/subscriptions/PlanCard';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Sparkles, Shield, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, activeSubscription, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getPlans();
      setPlans(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    if (!isAuthenticated) {
      showToast('Please sign in or create an account to subscribe', 'info');
      navigate('/login?redirect=/subscriptions');
      return;
    }
    navigate(`/checkout?planId=${plan.id}`);
  };

  const handleCancel = async () => {
    if (!activeSubscription) return;
    if (!window.confirm('Are you sure you want to cancel your active subscription?')) return;

    try {
      setActionLoading(true);
      await subscriptionService.cancelSubscription(activeSubscription.id);
      await refreshUser();
      showToast('Subscription has been cancelled', 'info');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!activeSubscription) return;
    try {
      setActionLoading(true);
      await subscriptionService.renewSubscription(activeSubscription.id);
      await refreshUser();
      showToast('Subscription renewed successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to renew', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E50914] text-white cinematic-glow-sm mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Flexible Membership
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight mb-4">
          Choose the plan that's right for you.
        </h1>
        <p className="text-sm sm:text-base text-[#B3B3B3] leading-relaxed">
          Watch anywhere. Cancel anytime. Switch plans whenever your entertainment needs change.
        </p>
      </div>

      {/* Current Active Subscription Callout */}
      {activeSubscription && (
        <div className="mb-12 p-6 rounded-2xl bg-[#181818] border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Active Plan: {activeSubscription.plan?.name || 'Standard'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {activeSubscription.status}
                </span>
              </div>
              <p className="text-xs text-[#B3B3B3] mt-0.5">
                Current period valid until: <strong className="text-white">{new Date(activeSubscription.endDate).toLocaleDateString()}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleRenew}
              disabled={actionLoading}
              className="flex-1 md:flex-none px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Renew
            </button>
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="flex-1 md:flex-none px-4 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 text-xs font-semibold rounded-xl border border-red-800/40 flex items-center justify-center gap-1.5 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel Membership
            </button>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-[#181818] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentSubscription={activeSubscription}
              onSelect={handleSelectPlan}
              isLoading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Demo Mode Notice */}
      <div className="mt-16 p-4 rounded-xl bg-neutral-900/60 border border-white/5 text-center max-w-2xl mx-auto text-xs text-neutral-400">
        <p>
          <strong className="text-white">College Demonstration Mode:</strong> All subscriptions feature an instant 1-click sandbox checkout mode that does not charge real currency. Razorpay test mode can also be linked in backend configuration.
        </p>
      </div>
    </div>
  );
};
