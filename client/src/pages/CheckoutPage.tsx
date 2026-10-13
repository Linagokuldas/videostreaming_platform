import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { subscriptionService } from '../services/subscriptionService';
import { Plan } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ShieldCheck, CreditCard, Sparkles, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();
  const { showToast } = useToast();

  const planId = searchParams.get('planId');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'DEMO' | 'CARD'>('DEMO');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/checkout?planId=${planId}`);
      return;
    }

    if (!planId) {
      navigate('/subscriptions');
      return;
    }

    subscriptionService
      .getPlans()
      .then((plans) => {
        const p = plans.find((item) => item.id === planId);
        if (p) setSelectedPlan(p);
        else navigate('/subscriptions');
      })
      .finally(() => setLoading(false));
  }, [planId, isAuthenticated]);

  const handleProcessPayment = async () => {
    if (!selectedPlan) return;
    try {
      setProcessing(true);
      // Execute payment and subscription creation
      await subscriptionService.subscribe(selectedPlan.id, paymentMethod === 'DEMO' ? 'DEMO' : 'GATEWAY');
      await refreshUser();
      setSuccess(true);
      showToast('Subscription activated successfully!', 'success');
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Payment processing error', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !selectedPlan) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/subscriptions')}
        className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Plans
      </button>

      {success ? (
        <div className="bg-[#181818] border border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-white font-heading mb-3">
            Welcome to {selectedPlan.name}!
          </h2>
          <p className="text-sm text-neutral-300 max-w-md mx-auto mb-8">
            Your payment was verified. Your account is now upgraded with full 4K HDR streaming access and multiple device entitlements.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Redirecting to home streaming feed...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left Column: Payment Form */}
          <div className="md:col-span-3 bg-[#181818] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Secure 256-bit Encrypted Checkout
              </span>
            </div>

            <h2 className="text-2xl font-black text-white font-heading mb-6">
              Select Payment Method
            </h2>

            {/* Payment Method Selector */}
            <div className="space-y-3 mb-6">
              <label
                onClick={() => setPaymentMethod('DEMO')}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'DEMO'
                    ? 'border-[#E50914] bg-red-950/20 shadow-md'
                    : 'border-white/10 bg-[#141414] hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'DEMO'}
                  onChange={() => setPaymentMethod('DEMO')}
                  className="mt-1 accent-[#E50914]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Instant Demo Sandbox</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      Zero Friction
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Simulates a verified transaction gateway response for presentation & testing.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('CARD')}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-[#E50914] bg-red-950/20 shadow-md'
                    : 'border-white/10 bg-[#141414] hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="mt-1 accent-[#E50914]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Razorpay / Card Test Mode</span>
                    <CreditCard className="w-4 h-4 text-neutral-400" />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Simulates test order token generation and signature verification.
                  </p>
                </div>
              </label>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={processing}
              className="w-full py-4 bg-[#E50914] hover:bg-[#FF2934] text-white font-bold rounded-xl transition-all duration-300 cinematic-glow hover:scale-[1.02] shadow-xl text-sm flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Payment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Authorize & Subscribe (${selectedPlan.price.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Order Summary */}
          <div className="md:col-span-2 bg-[#111111] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-heading mb-4 pb-3 border-b border-white/10">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-neutral-300 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Plan Tier:</span>
                  <span className="font-bold text-white">{selectedPlan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Resolution:</span>
                  <span className="font-bold text-[#E50914]">{selectedPlan.maxResolution} UHD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Billing Interval:</span>
                  <span className="text-white capitalize">{selectedPlan.billingInterval}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Devices:</span>
                  <span className="text-white">{selectedPlan.maxDevices} screens</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-baseline justify-between">
                <span className="text-base font-bold text-white">Total Due Today:</span>
                <span className="text-2xl font-black text-white font-heading">
                  ${selectedPlan.price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3 text-xs text-neutral-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Cancel anytime from your profile with zero cancellation fees.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
