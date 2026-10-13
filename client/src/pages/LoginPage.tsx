import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Lock, Mail, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();

  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await login(email, password);
      showToast('Welcome back to REELFLIX!', 'success');
      navigate(redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role: 'ADMIN' | 'USER') => {
    if (role === 'ADMIN') {
      setEmail('admin@reelflix.com');
      setPassword('Admin@1234');
    } else {
      setEmail('demo@reelflix.com');
      setPassword('User@1234');
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 pt-20 relative overflow-hidden">
      {/* Background Cinematic Artwork Overlay */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1600&auto=format&fit=crop"
          alt="Backdrop"
          className="w-full h-full object-cover filter blur-sm"
        />
        <div className="absolute inset-0 bg-[#080808]/85" />
      </div>

      <div className="relative z-10 max-w-md w-full bg-[#181818]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <img src="/logo.svg" alt="REELFLIX" className="h-8 mx-auto" />
          </Link>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Sign In to REELFLIX
          </h1>
          <p className="text-xs text-[#B3B3B3] mt-1">
            Stream your favorite movies and series in 4K HDR.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E50914]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E50914] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E50914] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#E50914] hover:bg-[#FF2934] text-white font-bold rounded-xl transition-all duration-300 cinematic-glow shadow-xl text-sm mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Fast-fill Buttons */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 text-center mb-3">
            Quick Fill Demo Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('ADMIN')}
              className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('USER')}
              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
              Subscriber Demo
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <p className="text-center text-xs text-[#B3B3B3] mt-6">
          New to REELFLIX?{' '}
          <Link to={`/register?redirect=${redirectUrl}`} className="text-white hover:text-[#E50914] font-semibold underline">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};
