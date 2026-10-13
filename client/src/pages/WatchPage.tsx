import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CustomVideoPlayer } from '../components/player/CustomVideoPlayer';
import { playbackService } from '../services/playbackService';
import { subscriptionService } from '../services/subscriptionService';
import { catalogueService } from '../services/catalogueService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PlaybackAuthorization, Video } from '../types';
import { Sparkles, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, activeSubscription, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [authData, setAuthData] = useState<PlaybackAuthorization | null>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isActivatingDemo, setIsActivatingDemo] = useState(false);

  const initPlayback = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setAuthError(null);

      // Load basic video info for poster backdrop if blocked
      const vidInfo = await catalogueService.getVideoById(id).catch(() => null);
      setVideo(vidInfo);

      if (!isAuthenticated) {
        setAuthError('AUTH_REQUIRED');
        return;
      }

      // Call backend playback authorization
      const res = await playbackService.authorizePlayback(id);
      setAuthData(res);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status === 403 || msg?.includes('subscription')) {
        setAuthError('SUBSCRIPTION_REQUIRED');
      } else if (err.response?.status === 401) {
        setAuthError('AUTH_REQUIRED');
      } else {
        setAuthError(msg || 'Playback authorization failed');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initPlayback();
  }, [id, isAuthenticated]);

  // Quick 1-click Demo activation for smooth testing
  const handleQuickDemoSubscribe = async () => {
    try {
      setIsActivatingDemo(true);
      // Fetch plans and subscribe to Premium or Standard
      const plans = await subscriptionService.getPlans();
      const premiumPlan = plans.find((p) => p.name === 'PREMIUM') || plans[0];
      if (premiumPlan) {
        await subscriptionService.subscribe(premiumPlan.id, 'DEMO');
        await refreshUser();
        showToast('Demo Premium Subscription Activated!', 'success');
        await initPlayback();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to activate demo plan', 'error');
    } finally {
      setIsActivatingDemo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-neutral-400">
          Securing High-Definition Stream Authorization...
        </p>
      </div>
    );
  }

  // If Entitlement / Subscription is required
  if (authError === 'SUBSCRIPTION_REQUIRED' || authError === 'AUTH_REQUIRED') {
    return (
      <div className="relative min-h-screen bg-[#080808] flex items-center justify-center p-4">
        {/* Backdrop background */}
        {video?.backdropUrl && (
          <div className="absolute inset-0">
            <img
              src={video.backdropUrl}
              alt={video.title}
              className="w-full h-full object-cover filter blur-md opacity-20"
            />
            <div className="absolute inset-0 bg-black/80" />
          </div>
        )}

        {/* Modal Container */}
        <div className="relative z-10 max-w-lg w-full bg-[#181818] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-800/60 text-[#E50914] flex items-center justify-center mx-auto mb-6 cinematic-glow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E50914] px-3 py-1 rounded-full bg-red-950/40 border border-red-900/40">
            Subscription Required
          </span>

          <h2 className="text-2xl font-black text-white font-heading mt-3 mb-2">
            Unlock Full 4K Streaming
          </h2>

          <p className="text-sm text-neutral-300 mb-6 leading-relaxed">
            {authError === 'AUTH_REQUIRED'
              ? 'Please sign in or create a REELFLIX account to access full stream playback.'
              : `To stream "${video?.title || 'this title'}" in Ultra HD, an active REELFLIX subscription plan is required.`}
          </p>

          <div className="space-y-3">
            {authError === 'AUTH_REQUIRED' ? (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="w-full py-3.5 bg-[#E50914] hover:bg-[#FF2934] text-white font-bold rounded-xl transition-all cinematic-glow text-sm"
                >
                  Sign In to Watch
                </Link>
                <Link
                  to="/register"
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl border border-white/10 text-sm"
                >
                  Create New Account
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/subscriptions"
                  className="w-full py-3.5 bg-[#E50914] hover:bg-[#FF2934] text-white font-bold rounded-xl transition-all cinematic-glow text-sm"
                >
                  View Subscription Plans
                </Link>

                {/* Instant 1-Click Demo Pass Button for evaluators / local demo */}
                <button
                  onClick={handleQuickDemoSubscribe}
                  disabled={isActivatingDemo}
                  className="w-full py-3 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 font-semibold rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  {isActivatingDemo ? 'Activating Demo Pass...' : '⚡ Instant Demo Pass (Instant 4K Playback)'}
                </button>
              </div>
            )}

            <button
              onClick={() => navigate(-1)}
              className="text-xs text-neutral-400 hover:text-white pt-2 transition-colors block mx-auto"
            >
              Return to Previous Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If general error
  if (authError || !authData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-white">
        <h2 className="text-xl font-bold mb-2">Streaming Authorization Notice</h2>
        <p className="text-sm text-neutral-400 max-w-md mb-6">{authError || 'Unknown error'}</p>
        <button
          onClick={() => navigate('/explore')}
          className="px-6 py-2.5 bg-[#E50914] rounded-xl text-sm font-semibold"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  // Render Fullscreen Video Player
  return (
    <CustomVideoPlayer
      videoId={id!}
      videoTitle={authData.title || video?.title || 'Streaming Title'}
      mediaUrl={authData.mediaUrl}
      initialPosition={authData.resumePosition || 0}
      sessionToken={authData.sessionToken}
      maxResolution={authData.maxResolution || '1080p'}
      onClose={() => navigate(`/movie/${id}`)}
    />
  );
};
