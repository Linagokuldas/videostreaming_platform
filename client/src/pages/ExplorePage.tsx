import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Film, Tv, Sparkles, X } from 'lucide-react';
import { catalogueService } from '../services/catalogueService';
import { Video, Genre } from '../types';
import { MovieCard } from '../components/movies/MovieCard';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [videos, setVideos] = useState<Video[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters from URL params or state
  const currentSearch = searchParams.get('search') || '';
  const currentGenre = searchParams.get('genre') || '';
  const currentType = searchParams.get('type') || '';
  const currentSort = (searchParams.get('sort') as any) || 'popularity';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    catalogueService.getGenres().then(setGenres).catch(() => []);
  }, []);

  const fetchCatalogue = async () => {
    try {
      setLoading(true);
      const res = await catalogueService.getVideos({
        search: currentSearch || undefined,
        genre: currentGenre || undefined,
        contentType: currentType || undefined,
        sortBy: currentSort,
        limit: 30,
      });
      setVideos(res.videos || []);
      setTotalCount(res.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogue();
  }, [currentSearch, currentGenre, currentType, currentSort]);

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (!val) {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header & Title */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight mb-2">
          Explore Catalogue
        </h1>
        <p className="text-sm text-[#B3B3B3]">
          Browse our cinematic library of films, TV series, documentaries, and originals.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4 mb-8 bg-[#111111] p-4 sm:p-6 rounded-2xl border border-white/5 shadow-xl">
        {/* Search input & Sort dropdown */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-5 h-5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, character, or director..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-xl pl-11 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#E50914] transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateParam('search', '');
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#B3B3B3]" />
            <span className="text-xs text-[#B3B3B3] hidden sm:inline">Sort:</span>
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-[#181818] border border-white/10 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E50914]"
            >
              <option value="popularity">Most Popular</option>
              <option value="newest">Release Date (Newest)</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <button
            onClick={() => updateParam('type', '')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !currentType
                ? 'bg-[#E50914] text-white shadow-md'
                : 'bg-[#181818] text-[#B3B3B3] hover:text-white hover:bg-white/5'
            }`}
          >
            All Titles
          </button>
          <button
            onClick={() => updateParam('type', 'MOVIE')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentType === 'MOVIE'
                ? 'bg-[#E50914] text-white shadow-md'
                : 'bg-[#181818] text-[#B3B3B3] hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> Movies
          </button>
          <button
            onClick={() => updateParam('type', 'SERIES')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentType === 'SERIES'
                ? 'bg-[#E50914] text-white shadow-md'
                : 'bg-[#181818] text-[#B3B3B3] hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> TV Series
          </button>
        </div>

        {/* Genre Pill Chips */}
        {genres.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
            <button
              onClick={() => updateParam('genre', '')}
              className={`px-3 py-1 rounded-full text-xs shrink-0 transition-colors ${
                !currentGenre
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#181818] text-[#B3B3B3] hover:text-white border border-white/10'
              }`}
            >
              All Genres
            </button>
            {genres.map((g) => (
              <button
                key={g.id}
                onClick={() => updateParam('genre', g.slug)}
                className={`px-3 py-1 rounded-full text-xs shrink-0 transition-colors ${
                  currentGenre === g.slug
                    ? 'bg-[#E50914] text-white font-semibold'
                    : 'bg-[#181818] text-[#B3B3B3] hover:text-white border border-white/10'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filter summary */}
      {(currentSearch || currentGenre || currentType) && (
        <div className="flex items-center justify-between mb-6 text-xs text-[#B3B3B3]">
          <span>
            Found <strong className="text-white">{totalCount}</strong> titles matching criteria
          </span>
          <button
            onClick={clearAllFilters}
            className="text-[#E50914] hover:underline font-semibold flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      )}

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-[#181818] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {videos.map((video) => (
            <MovieCard key={video.id} video={video} onWatchlistChange={fetchCatalogue} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-[#111111] rounded-2xl border border-white/5 p-8">
          <Film className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No titles matched your search</h3>
          <p className="text-sm text-[#B3B3B3] mb-6">
            Try adjusting your search terms or genre filter options.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-2 bg-[#E50914] hover:bg-[#FF2934] text-white text-xs font-semibold rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
