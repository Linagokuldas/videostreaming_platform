import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Info, Star } from 'lucide-react';
import { Video } from '../../types';
import { watchlistService } from '../../services/watchlistService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface MovieCardProps {
  video: Video;
  onWatchlistChange?: () => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ video, onWatchlistChange }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [isHovered, setIsHovered] = useState(false);
  const [inList, setInList] = useState(video.inWatchlist || false);
  const [imgError, setImgError] = useState(false);

  const fallbackPoster = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const formatDuration = (seconds: number) => {
    if (!seconds) return '2h 10m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const progressPercent = video.progress
    ? Math.min(100, Math.round((video.progress.positionSeconds / (video.progress.durationSeconds || 1)) * 100))
    : 0;

  return (
    <div
      className="relative flex-none w-[180px] sm:w-[220px] md:w-[250px] group cursor-pointer select-none rounded-xl overflow-hidden bg-[#181818] transition-all duration-300 hover:scale-[1.04] hover:z-20 hover:shadow-2xl hover:shadow-red-950/40 border border-transparent hover:border-red-900/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/movie/${video.id}`)}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#141414]">
        <img
          src={imgError ? fallbackPoster : (video.posterUrl || fallbackPoster)}
          alt={video.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Quality or Rating Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#E50914] text-white rounded shadow-md tracking-wider uppercase">
            {video.contentType}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20 rounded">
            4K UHD
          </span>
        </div>

        {/* Rating Score Top Right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-amber-400 text-[11px] font-bold border border-amber-500/30">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{video.ratingScore || 8.5}</span>
        </div>

        {/* Continue Watching Progress Bar */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
            <div
              className="h-full bg-[#E50914] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Hover Info Overlay */}
      <div
        className={`p-3 bg-[#181818] transition-all duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-90'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-sm text-white truncate" title={video.title}>
            {video.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#B3B3B3] mb-2.5">
          <span>{new Date(video.releaseDate).getFullYear() || 2024}</span>
          <span>•</span>
          <span className="border border-white/20 px-1 py-0.2 rounded text-[10px]">
            {video.contentRating || 'PG-13'}
          </span>
          <span>•</span>
          <span>{formatDuration(video.durationSeconds)}</span>
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/watch/${video.id}`);
              }}
              className="w-8 h-8 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition-all hover:scale-105 shadow-md"
              title="Stream Now"
            >
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            </button>

            <button
              onClick={toggleWatchlist}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                inList
                  ? 'border-emerald-500 bg-emerald-950/60 text-emerald-400'
                  : 'border-white/30 hover:border-white text-white hover:bg-white/10'
              }`}
              title={inList ? 'In Watchlist' : 'Add to Watchlist'}
            >
              {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/movie/${video.id}`);
            }}
            className="w-8 h-8 rounded-full border border-white/20 hover:border-white text-[#B3B3B3] hover:text-white flex items-center justify-center hover:bg-white/10 transition-all"
            title="More Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
