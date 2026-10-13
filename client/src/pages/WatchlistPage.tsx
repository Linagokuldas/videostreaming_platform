import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { watchlistService } from '../services/watchlistService';
import { Video, WatchlistItem } from '../types';
import { MovieCard } from '../components/movies/MovieCard';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Film } from 'lucide-react';

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await watchlistService.getWatchlist();
      setItems(res.map((item: WatchlistItem) => ({ ...item.video, inWatchlist: true })));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login?redirect=/watchlist');
      return;
    }
    if (isAuthenticated) {
      fetchWatchlist();
    }
  }, [isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight flex items-center gap-3">
            <Heart className="w-8 h-8 text-[#E50914] fill-[#E50914]" />
            My Watchlist
          </h1>
          <p className="text-sm text-[#B3B3B3] mt-1">
            Titles you've saved to stream later.
          </p>
        </div>
        <span className="text-xs font-semibold text-neutral-400 bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-full">
          {items.length} Saved {items.length === 1 ? 'Title' : 'Titles'}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-[#181818] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {items.map((video) => (
            <MovieCard key={video.id} video={video} onWatchlistChange={fetchWatchlist} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-[#111111] rounded-3xl border border-white/5 p-8 max-w-md mx-auto">
          <Film className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Your Watchlist is empty</h3>
          <p className="text-xs text-[#B3B3B3] mb-6 leading-relaxed">
            Explore the REELFLIX cinematic catalogue and tap the "+ Add to My List" button on any movie or series to save it here.
          </p>
          <Link
            to="/explore"
            className="inline-block px-6 py-2.5 bg-[#E50914] hover:bg-[#FF2934] text-white text-xs font-bold rounded-xl cinematic-glow"
          >
            Explore Catalogue
          </Link>
        </div>
      )}
    </div>
  );
};
