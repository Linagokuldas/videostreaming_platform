import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Video } from '../../types';
import { MovieCard } from './MovieCard';

interface MovieCarouselProps {
  title: string;
  subtitle?: string;
  videos: Video[];
  onWatchlistChange?: () => void;
}

export const MovieCarousel: React.FC<MovieCarouselProps> = ({
  title,
  subtitle,
  videos,
  onWatchlistChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (!videos || videos.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.75;
    const newPos = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

    scrollRef.current.scrollTo({
      left: newPos,
      behavior: 'smooth',
    });
  };

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <div className="relative py-4 group/carousel">
      {/* Title & Subtitle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 flex items-baseline justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#E50914] rounded-full inline-block"></span>
            {title}
          </h2>
          {subtitle && <p className="text-xs text-[#B3B3B3] mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/80 hover:bg-[#E50914] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover/carousel:opacity-100 shadow-xl"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Horizontal Scroll Area */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1"
        >
          {videos.map((video) => (
            <MovieCard
              key={video.id}
              video={video}
              onWatchlistChange={onWatchlistChange}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/80 hover:bg-[#E50914] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover/carousel:opacity-100 shadow-xl"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
