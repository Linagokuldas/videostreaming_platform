import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, Clock, Calendar, Globe, Shield, Sparkles, ArrowLeft } from 'lucide-react';
import { catalogueService } from '../services/catalogueService';
import { watchlistService } from '../services/watchlistService';
import { playbackService } from '../services/playbackService';
import { Video, ViewingProgress } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { MovieCarousel } from '../components/movies/MovieCarousel';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [video, setVideo] = useState<Video | null>(null);
  const [similar, setSimilar] = useState<Video[]>([]);
  const [progress, setProgress] = useState<ViewingProgress | null>(null);
  const [inList, setInList] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [vid, simList] = await Promise.all([
        catalogueService.getVideoById(id),
        catalogueService.getSimilar(id).catch(() => []),
      ]);
      setVideo(vid);
      setSimilar(simList);

      if (isAuthenticated) {
        const [isSaved, prog] = await Promise.all([
          watchlistService.checkInWatchlist(id).catch(() => false),
          playbackService.getVideoProgress(id).catch(() => null),
        ]);
        setInList(isSaved);
        setProgress(prog);
      }
    } catch {
      showToast('Video not found or unavailable', 'error');
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    window.scrollTo(0, 0);
  }, [id, isAuthenticated]);

  const toggleWatchlist = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to add titles to your list', 'info');
      navigate('/login');
      return;
    }
    if (!video) return;

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
    } catch {
      showToast('Error updating watchlist', 'error');
    }
  };

  if (loading || !video) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '2h 14m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const backdrop = video.backdropUrl || video.posterUrl;
  const resumePos = progress?.positionSeconds || 0;

  return (
    <div className="min-h-screen bg-[#080808] pb-20">
      {/* Hero Backdrop Banner */}
      <div className="relative w-full h-[65vh] min-h-[500px] overflow-hidden">
        <img
          src={backdrop}
          alt={video.title}
          className="w-full h-full object-cover object-center filter brightness-75"
        />
        <div className="absolute inset-0 hero-side-gradient" />
        <div className="absolute inset-0 hero-gradient" />

        {/* Back Link */}
        <div className="absolute top-24 left-4 sm:left-8 z-30">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-[#E50914] text-white text-xs backdrop-blur-md transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Hero Title & Actions Overlay */}
        <div className="absolute bottom-12 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <div className="max-w-2xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-[#E50914] text-white">
                {video.contentType}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-black/70 border border-white/20 text-white">
                4K Ultra HD
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-black/70 border border-amber-500/40 text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {video.ratingScore} / 10
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-black/70 border border-white/20 text-neutral-300">
                {video.contentRating}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight mb-4 drop-shadow-lg">
              {video.title}
            </h1>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate(`/watch/${video.id}`)}
                className="flex items-center gap-2.5 bg-[#E50914] hover:bg-[#FF2934] text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-300 cinematic-glow hover:scale-105 shadow-xl text-sm"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>{resumePos > 30 ? `Resume (${formatDuration(resumePos)})` : 'Play Now'}</span>
              </button>

              <button
                onClick={toggleWatchlist}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border backdrop-blur-md transition-all ${
                  inList
                    ? 'border-emerald-500 bg-emerald-950/70 text-emerald-400'
                    : 'border-white/20 bg-black/40 hover:bg-white/10 text-white'
                }`}
              >
                {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{inList ? 'In Watchlist' : 'Add to My List'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left / Center: Synopsis, Genre tags, Tech specs */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-heading mb-3">About the Title</h2>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
                {video.description}
              </p>
            </div>

            {/* Genres */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Genres & Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(video.genres) &&
                  video.genres.map((gItem: any, idx: number) => {
                    const name = gItem.genre?.name || gItem.name || 'Cinema';
                    return (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-[#181818] border border-white/10 text-neutral-200"
                      >
                        {name}
                      </span>
                    );
                  })}
              </div>
            </div>

            {/* Viewing Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#111111] border border-white/5">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#E50914]" />
                <div>
                  <p className="text-[10px] text-neutral-400">Duration</p>
                  <p className="text-xs font-semibold text-white">{formatDuration(video.durationSeconds)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#E50914]" />
                <div>
                  <p className="text-[10px] text-neutral-400">Release Year</p>
                  <p className="text-xs font-semibold text-white">
                    {new Date(video.releaseDate).getFullYear() || 2024}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#E50914]" />
                <div>
                  <p className="text-[10px] text-neutral-400">Audio Language</p>
                  <p className="text-xs font-semibold text-white">{video.language || 'English'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#E50914]" />
                <div>
                  <p className="text-[10px] text-neutral-400">Maturity</p>
                  <p className="text-xs font-semibold text-white">{video.contentRating || 'PG-13'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Poster Card preview & stream perks */}
          <div>
            <div className="bg-[#181818] p-6 rounded-2xl border border-white/10 shadow-2xl space-y-5">
              <div className="aspect-[2/3] w-full rounded-xl overflow-hidden shadow-lg">
                <img
                  src={video.posterUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 text-xs text-neutral-300">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-neutral-400">Stream Availability:</span>
                  <span className="text-emerald-400 font-semibold">Instant Stream</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-neutral-400">Maximum Quality:</span>
                  <span className="text-white font-semibold">4K UHD + HDR</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Audio Format:</span>
                  <span className="text-white font-semibold">Spatial Dolby 5.1</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/watch/${video.id}`)}
                className="w-full py-3 bg-[#E50914] hover:bg-[#FF2934] text-white font-bold rounded-xl transition-all cinematic-glow text-xs uppercase tracking-wider"
              >
                Launch Streaming
              </button>
            </div>
          </div>
        </div>

        {/* Similar Recommendations Carousel */}
        {similar.length > 0 && (
          <div className="mt-16">
            <MovieCarousel
              title="More Like This"
              subtitle="Recommendations inspired by this title"
              videos={similar}
              onWatchlistChange={fetchDetails}
            />
          </div>
        )}
      </div>
    </div>
  );
};
