import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { playbackService } from '../../services/playbackService';

interface CustomVideoPlayerProps {
  videoId: string;
  videoTitle: string;
  mediaUrl: string;
  initialPosition?: number;
  sessionToken: string;
  maxResolution?: string;
  onClose?: () => void;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  videoId,
  videoTitle,
  mediaUrl,
  initialPosition = 0,
  sessionToken,
  maxResolution = '1080p',
  onClose,
}) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  // Resume playback position on load
  useEffect(() => {
    if (videoRef.current && initialPosition > 0) {
      videoRef.current.currentTime = initialPosition;
      setCurrentTime(initialPosition);
    }
  }, [initialPosition]);

  // Periodic heartbeat every 5 seconds to sync viewing progress with backend
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying && sessionToken) {
        const cur = Math.floor(videoRef.current.currentTime);
        const dur = Math.floor(videoRef.current.duration) || 0;
        const completed = dur > 0 && cur >= dur * 0.95;

        // Heartbeat to active session
        playbackService.sendHeartbeat(sessionToken, cur).catch(() => {});
        // Update viewing progress
        playbackService.updateProgress(videoId, cur, dur, completed).catch(() => {});
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [videoId, isPlaying, sessionToken]);

  // Stop session when leaving
  useEffect(() => {
    return () => {
      if (videoRef.current && sessionToken) {
        const cur = Math.floor(videoRef.current.currentTime);
        playbackService.stopPlayback(sessionToken, cur).catch(() => {});
      }
    };
  }, [sessionToken]);

  // Control auto-hide timer
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      Math.max(videoRef.current.currentTime + seconds, 0),
      duration
    );
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={mediaUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsBuffering(false);
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setHasError(true);
          setIsBuffering(false);
        }}
        onClick={togglePlay}
        playsInline
        autoPlay
      />

      {/* Buffering Spinner */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <div className="w-14 h-14 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080808] p-6 text-center z-30">
          <AlertTriangle className="w-16 h-16 text-[#E50914] mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white mb-2">Media Stream Unavailable</h2>
          <p className="text-[#B3B3B3] max-w-md text-sm mb-6">
            Unable to stream "{videoTitle}". The video resource may be temporarily offline or unreachable.
          </p>
          <button
            onClick={() => (onClose ? onClose() : navigate(-1))}
            className="px-6 py-2.5 bg-[#E50914] hover:bg-[#FF2934] text-white font-semibold rounded-xl transition-all"
          >
            Return to Catalogue
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-black/95 via-transparent to-black/80 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (onClose ? onClose() : navigate(-1))}
              className="p-2.5 rounded-full bg-black/60 hover:bg-[#E50914] text-white backdrop-blur-md transition-all shadow-lg"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-md">
                {videoTitle}
              </h1>
              <div className="flex items-center gap-2 text-xs text-[#B3B3B3]">
                <span className="px-1.5 py-0.5 rounded bg-black/80 border border-white/20 text-[#E50914] font-semibold">
                  {maxResolution}
                </span>
                <span>Dolby 5.1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Seek + Action Buttons */}
        <div className="space-y-4">
          {/* Progress / Seek Scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#B3B3B3] w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 group/scrub">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#E50914] focus:outline-none hover:h-2.5 transition-all"
              />
            </div>
            <span className="text-xs font-mono text-[#B3B3B3] w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-black text-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                )}
              </button>

              <button
                onClick={() => skip(-10)}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => skip(10)}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Forward 10 seconds"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-red-500" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#E50914]"
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block px-2 py-1 text-xs font-bold rounded bg-neutral-800 text-neutral-300 border border-white/10">
                {maxResolution} UHD
              </span>

              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
