import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionService } from '../services/subscriptionService';
import { Payment } from '../types';
import { User, Shield, CreditCard, Sparkles, Clock, LogOut, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSubscription, isAuthenticated, isLoading, logout } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      setLoadingPayments(true);
      subscriptionService
        .getPaymentHistory()
        .then(setPayments)
        .catch(() => [])
        .finally(() => setLoadingPayments(false));
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight mb-2">
          Account Profile & Billing
        </h1>
        <p className="text-sm text-[#B3B3B3]">
          Manage your personal details, membership tier, and transaction receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* User Card */}
        <div className="bg-[#181818] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#E50914] to-red-600 flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
            <p className="text-xs text-[#B3B3B3] mb-4">{user.email}</p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-neutral-900 border border-white/10 text-neutral-300">
              <Shield className="w-3.5 h-3.5 text-[#E50914]" />
              Role: {user.role}
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-900/40 bg-red-950/30 hover:bg-red-900/40 text-red-400 text-xs font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Subscription Card */}
        <div className="md:col-span-2 bg-[#181818] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E50914]" />
                Current Membership Tier
              </h3>
              {activeSubscription ? (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                  {activeSubscription.status}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-neutral-800 text-neutral-400">
                  No Active Plan
                </span>
              )}
            </div>

            {activeSubscription ? (
              <div className="space-y-3 text-sm text-neutral-300">
                <div className="p-4 rounded-2xl bg-[#111111] border border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">
                      REELFLIX {activeSubscription.plan?.name || 'Standard'}
                    </h4>
                    <p className="text-xs text-[#B3B3B3] mt-0.5">
                      Max Quality: {activeSubscription.plan?.maxResolution || '1080p'} UHD • {activeSubscription.plan?.maxDevices || 2} Screens
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-white font-heading">
                      ${activeSubscription.plan?.price.toFixed(2) || '13.99'}
                    </span>
                    <span className="text-xs text-[#B3B3B3]">/mo</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-400 pt-2">
                  <Clock className="w-4 h-4 text-[#E50914]" />
                  <span>
                    Valid through: <strong className="text-white">{new Date(activeSubscription.endDate).toLocaleDateString()}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#111111] border border-white/5 text-center my-2">
                <p className="text-sm text-neutral-300 mb-4">
                  You do not currently have an active subscription plan. Upgrade now to stream movies and series in 4K HDR.
                </p>
                <Link
                  to="/subscriptions"
                  className="inline-block px-6 py-2.5 bg-[#E50914] hover:bg-[#FF2934] text-white text-xs font-bold rounded-xl cinematic-glow"
                >
                  View Plans & Subscribe
                </Link>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-neutral-400">Want to upgrade or change screens?</span>
            <Link
              to="/subscriptions"
              className="text-xs font-bold text-[#E50914] hover:underline"
            >
              Modify Subscription Plan →
            </Link>
          </div>
        </div>
      </div>

      {/* Transaction & Billing History */}
      <div className="bg-[#181818] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h3 className="text-lg font-bold text-white font-heading mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#E50914]" />
          Verified Billing & Transaction Receipts
        </h3>

        {loadingPayments ? (
          <div className="py-8 text-center text-xs text-neutral-400">Loading payment history...</div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Gateway Provider</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-300">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 font-mono">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 font-semibold text-white">
                      REELFLIX {p.subscription?.plan?.name || 'Subscription'} Plan
                    </td>
                    <td className="py-3.5 font-mono text-neutral-400">{p.provider}</td>
                    <td className="py-3.5 font-bold text-white">
                      ${p.amount.toFixed(2)} {p.currency}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-neutral-500">
            No transactions found on this account yet.
          </div>
        )}
      </div>
    </div>
  );
};
