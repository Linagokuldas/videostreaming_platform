import React, { useEffect, useState } from 'react';
import { HeroBanner } from '../components/movies/HeroBanner';
import { MovieCarousel } from '../components/movies/MovieCarousel';
import { catalogueService } from '../services/catalogueService';
import { playbackService } from '../services/playbackService';
import { watchlistService } from '../services/watchlistService';
import { Video, ViewingProgress, WatchlistItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Tv, Sparkles, Shield, Film, Award, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [featured, setFeatured] = useState<Video | null>(null);
  const [trending, setTrending] = useState<Video[]>([]);
  const [popularMovies, setPopularMovies] = useState<Video[]>([]);
  const [topSeries, setTopSeries] = useState<Video[]>([]);
  const [newReleases, setNewReleases] = useState<Video[]>([]);
  const [continueWatching, setContinueWatching] = useState<Video[]>([]);
  const [watchlist, setWatchlist] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch public catalogue
      const [featRes, trendRes, moviesRes, seriesRes, newRes] = await Promise.all([
        catalogueService.getFeatured().catch(() => null),
        catalogueService.getTrending().catch(() => []),
        catalogueService.getVideos({ contentType: 'MOVIE', sortBy: 'popularity', limit: 12 }).catch(() => ({ videos: [] })),
        catalogueService.getVideos({ contentType: 'SERIES', sortBy: 'popularity', limit: 12 }).catch(() => ({ videos: [] })),
        catalogueService.getVideos({ sortBy: 'newest', limit: 12 }).catch(() => ({ videos: [] })),
      ]);

      setFeatured(featRes || (trendRes && trendRes[0]) || null);
      setTrending(trendRes || []);
      setPopularMovies(moviesRes.videos || []);
      setTopSeries(seriesRes.videos || []);
      setNewReleases(newRes.videos || []);

      // If authenticated, load continue watching and watchlist
      if (isAuthenticated) {
        try {
          const [progRes, watchRes] = await Promise.all([
            playbackService.getProgress(),
            watchlistService.getWatchlist(),
          ]);

          const progVideos = progRes
            .filter((p: ViewingProgress) => p.video && !p.completed && p.positionSeconds > 5)
            .map((p: ViewingProgress) => ({ ...p.video!, progress: p }));
          setContinueWatching(progVideos);

          const listVideos = watchRes.map((w: WatchlistItem) => ({ ...w.video, inWatchlist: true }));
          setWatchlist(listVideos);
        } catch {
          // Ignore personal list errors
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#080808] pb-16">
      {/* Hero Banner */}
      {featured ? (
        <HeroBanner video={featured} onWatchlistChange={loadData} />
      ) : loading ? (
        <div className="w-full h-[70vh] bg-[#111111] animate-pulse flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : null}

      {/* Content Carousels Section */}
      <div className="relative -mt-12 sm:-mt-16 z-20 space-y-6">
        {/* Continue Watching (Only for authenticated users with progress) */}
        {continueWatching.length > 0 && (
          <MovieCarousel
            title="Continue Watching"
            subtitle="Pick up right where you left off"
            videos={continueWatching}
            onWatchlistChange={loadData}
          />
        )}

        {/* My List (If user has items) */}
        {watchlist.length > 0 && (
          <MovieCarousel
            title="My Watchlist"
            subtitle="Saved by you"
            videos={watchlist}
            onWatchlistChange={loadData}
          />
        )}

        {/* Trending Now */}
        <MovieCarousel
          title="Trending Now"
          subtitle="Most watched by subscribers this week"
          videos={trending}
          onWatchlistChange={loadData}
        />

        {/* Popular Movies */}
        <MovieCarousel
          title="Popular Blockbusters"
          subtitle="Top rated cinematic experiences"
          videos={popularMovies}
          onWatchlistChange={loadData}
        />

        {/* Top Series */}
        <MovieCarousel
          title="Binge-Worthy Series"
          subtitle="Critically acclaimed television & originals"
          videos={topSeries}
          onWatchlistChange={loadData}
        />

        {/* New Releases */}
        <MovieCarousel
          title="New Releases"
          subtitle="Freshly added titles to the catalogue"
          videos={newReleases}
          onWatchlistChange={loadData}
        />
      </div>

      {/* Premium Value Proposition Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-[#181818] via-[#111111] to-[#181818] p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E50914] text-white cinematic-glow-sm mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Ultimate Streaming Experience
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-heading tracking-tight mb-4">
              Ready to watch? Cancel anytime, stream everywhere.
            </h2>
            <p className="text-sm sm:text-base text-[#B3B3B3] mb-8 leading-relaxed">
              Join REELFLIX today to access an extensive library of 4K Ultra HD movies, series, and exclusives across all your phones, tablets, and smart TVs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-left">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/40 text-[#E50914]">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">4K UHD & HDR</h4>
                  <p className="text-xs text-[#B3B3B3]">Breathtaking picture clarity</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/40 text-[#E50914]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Dolby Atmos</h4>
                  <p className="text-xs text-[#B3B3B3]">Immersive spatial audio</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/40 text-[#E50914]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Zero Commercials</h4>
                  <p className="text-xs text-[#B3B3B3]">Pure uninterrupted playback</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/subscriptions"
                className="px-8 py-3.5 bg-[#E50914] hover:bg-[#FF2934] text-white font-bold rounded-xl transition-all duration-300 cinematic-glow hover:scale-105 shadow-xl text-sm"
              >
                Explore Subscription Plans
              </Link>
              <Link
                to="/explore"
                className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl border border-white/20 transition-all text-sm"
              >
                Browse Full Library
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
