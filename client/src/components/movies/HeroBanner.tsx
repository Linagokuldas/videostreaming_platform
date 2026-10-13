import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Plus, Check, Star, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Video } from '../../types';
import { watchlistService } from '../../services/watchlistService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface HeroBannerProps {
  video: Video;
  onWatchlistChange?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ video, onWatchlistChange }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [inList, setInList] = useState(video?.inWatchlist || false);
  const [isMuted, setIsMuted] = useState(true);

  if (!video) return null;

  const toggleWatchlist = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to save titles to your watchlist', 'info');
      navigate('/login');
      return;
    }

    try {
      if (inList) {
        await watchlistService.removeFromWatchlist(video.id);
        setInList(false);
        showToast(`Removed "${video.title}" from My List`, 'info');
      } else {
        await watchlistService.addToWatchlist(video.id);
        setInList(true);
        showToast(`Added "${video.title}" to My List`, 'success');
      }
      onWatchlistChange?.();
    } catch {
      showToast('Failed to update watchlist', 'error');
    }
  };

  const backdrop = video.backdropUrl || video.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop';

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[85vh] min-h-[550px] overflow-hidden select-none">
      {/* Background Cinematic Image */}
      <div className="absolute inset-0">
        <img
          src={backdrop}
          alt={video.title}
          className="w-full h-full object-cover object-center filter brightness-90 transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Gradients */}
        <div className="absolute inset-0 hero-side-gradient" />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Hero Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-24 z-20">
        <div className="max-w-2xl">
          {/* Top Tag & Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E50914] text-white cinematic-glow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Featured Premiere
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20">
              {video.contentType}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-black/60 backdrop-blur-md text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400" />
              {video.ratingScore || 8.8} / 10
            </span>
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-black/60 backdrop-blur-md text-white/80 border border-white/20">
              {video.contentRating || 'PG-13'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight mb-4 leading-tight drop-shadow-lg">
            {video.title}
          </h1>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-[#B3B3B3] line-clamp-3 mb-6 font-normal max-w-xl drop-shadow-md leading-relaxed">
            {video.description}
          </p>

          {/* Buttons: Play, More Info, Watchlist */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(`/watch/${video.id}`)}
              className="flex items-center gap-2.5 bg-[#E50914] hover:bg-[#FF2934] text-white font-bold px-7 py-3 rounded-xl transition-all duration-300 cinematic-glow hover:scale-105 shadow-xl"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Play Now</span>
            </button>

            <button
              onClick={() => navigate(`/movie/${video.id}`)}
              className="flex items-center gap-2 bg-neutral-900/80 hover:bg-neutral-800 text-white font-semibold px-6 py-3 rounded-xl backdrop-blur-md border border-white/20 transition-all duration-200 hover:border-white/50"
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>

            <button
              onClick={toggleWatchlist}
              className={`p-3 rounded-xl border backdrop-blur-md transition-all duration-200 ${
                inList
                  ? 'border-emerald-500 bg-emerald-950/70 text-emerald-400'
                  : 'border-white/20 bg-black/40 hover:bg-white/10 text-white'
              }`}
              title={inList ? 'In Watchlist' : 'Add to My List'}
            >
              {inList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Sound toggle button */}
        <div className="absolute right-4 sm:right-8 bottom-16 sm:bottom-24">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white border border-white/20 backdrop-blur-md transition-all"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
