import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Shield, Globe, Award, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#080808] border-t border-[#292929] pt-16 pb-12 mt-20 text-[#B3B3B3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img src="/logo.svg" alt="REELFLIX" className="h-8" />
            </Link>
            <p className="text-sm text-[#B3B3B3] max-w-sm mb-4 leading-relaxed">
              Your next obsession starts here. Stream thousands of award-winning blockbusters, captivating series, and exclusive cinematic originals in 4K HDR.
            </p>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#E50914]" /> Global CDN
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#E50914]" /> Secure Streaming
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#E50914]" /> Dolby Atmos & 4K
              </span>
            </div>
          </div>

          {/* Navigation Column 1 */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase font-heading">
              Browse
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore?type=MOVIE" className="hover:text-white transition-colors">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/explore?type=SERIES" className="hover:text-white transition-colors">
                  TV Series
                </Link>
              </li>
              <li>
                <Link to="/explore?genre=action" className="hover:text-white transition-colors">
                  Action & Thrillers
                </Link>
              </li>
              <li>
                <Link to="/explore?genre=sci-fi" className="hover:text-white transition-colors">
                  Sci-Fi & Fantasy
                </Link>
              </li>
              <li>
                <Link to="/explore?genre=drama" className="hover:text-white transition-colors">
                  Drama & Romance
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase font-heading">
              Account & Plans
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/subscriptions" className="hover:text-white transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-white transition-colors">
                  My Watchlist
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Manage Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3 */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase font-heading">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Help Center
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Content Grievances
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#292929] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 REELFLIX Inc. All rights reserved. Cinematic streaming engineered for excellence.</p>
          <div className="flex items-center gap-6">
            <span className="text-[#B3B3B3]">Software Architecture & Engineering Demonstration</span>
            <span className="text-[#E50914] font-semibold">REELFLIX v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
