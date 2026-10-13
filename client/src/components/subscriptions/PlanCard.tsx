import React from 'react';
import { Check, Sparkles, Shield, Monitor, Tv, Smartphone } from 'lucide-react';
import { Plan, Subscription } from '../../types';

interface PlanCardProps {
  plan: Plan;
  currentSubscription?: Subscription | null;
  onSelect: (plan: Plan) => void;
  isLoading?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  currentSubscription,
  onSelect,
  isLoading,
}) => {
  const isCurrentPlan = currentSubscription?.planId === plan.id && currentSubscription?.status === 'ACTIVE';
  const isPremium = plan.name.toUpperCase() === 'PREMIUM';

  // Parse features if stored as JSON string or string array
  let featureList: string[] = [];
  if (Array.isArray(plan.features)) {
    featureList = plan.features;
  } else if (typeof plan.features === 'string') {
    try {
      featureList = JSON.parse(plan.features);
    } catch {
      featureList = plan.features.split(',').map((f) => f.trim());
    }
  }

  return (
    <div
      className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[#181818] border transition-all duration-300 ${
        isCurrentPlan
          ? 'border-emerald-500 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500'
          : isPremium
          ? 'border-[#E50914] shadow-2xl shadow-red-950/40 ring-1 ring-[#E50914]'
          : 'border-white/10 hover:border-white/30'
      }`}
    >
      {/* Top Banner Tag */}
      {isCurrentPlan ? (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-lg flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Current Plan
        </div>
      ) : isPremium ? (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E50914] text-white cinematic-glow-sm flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Most Popular
        </div>
      ) : null}

      <div>
        {/* Plan Header */}
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight mb-2">
            {plan.name}
          </h3>
          <p className="text-xs sm:text-sm text-[#B3B3B3] min-h-[40px] leading-relaxed">
            {plan.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="mb-6 pb-6 border-b border-white/10 flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black text-white font-heading">
            ${plan.price.toFixed(2)}
          </span>
          <span className="text-sm text-[#B3B3B3]">/{plan.billingInterval}</span>
        </div>

        {/* Key Specs */}
        <div className="space-y-3 mb-6 pb-6 border-b border-white/10 text-xs sm:text-sm text-[#B3B3B3]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-[#E50914]" /> Video Quality
            </span>
            <span className="font-semibold text-white">{plan.maxResolution}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[#E50914]" /> Simultaneous Screens
            </span>
            <span className="font-semibold text-white">{plan.maxDevices} Device{plan.maxDevices > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Included Benefits:</p>
          {featureList.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSelect(plan)}
        disabled={isCurrentPlan || isLoading}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 shadow-lg ${
          isCurrentPlan
            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 cursor-default'
            : isPremium
            ? 'bg-[#E50914] hover:bg-[#FF2934] text-white cinematic-glow hover:scale-[1.02]'
            : 'bg-white hover:bg-neutral-200 text-black hover:scale-[1.02]'
        }`}
      >
        {isCurrentPlan ? 'Active Plan' : currentSubscription ? 'Switch to Plan' : 'Select Plan'}
      </button>
    </div>
  );
};
