import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, User as UserIcon, LogOut, ShieldCheck, Heart, Film, Tv, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/explore?type=MOVIE' },
    { label: 'Series', path: '/explore?type=SERIES' },
    { label: 'My List', path: '/watchlist', requiresAuth: true },
    { label: 'Subscription', path: '/subscriptions' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#080808]/95 backdrop-blur-md shadow-2xl border-b border-white/5 py-3'
          : 'bg-gradient-to-b from-[#080808]/90 via-[#080808]/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="REELFLIX" className="h-8 md:h-9 object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              if (link.requiresAuth && !isAuthenticated) return null;
              const isActive = location.pathname + location.search === link.path || (link.path === '/' && location.pathname === '/');
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    isActive ? 'text-[#E50914] font-semibold' : 'text-[#B3B3B3]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons & Auth Profile */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Search Bar */}
          <div className="relative">
            {showSearch ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Titles, genres, actors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-[#181818]/90 border border-white/20 text-white text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#E50914] w-48 sm:w-64 transition-all"
                />
                <Search className="w-4 h-4 text-white/50 absolute left-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="text-white/40 hover:text-white ml-2 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="text-[#B3B3B3] hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors"
                title="Search titles"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Admin Badge Quick Link */}
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800/60 rounded-md hover:bg-red-900/80 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}

          {/* User Profile / Login */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1 rounded-full border border-white/10 hover:border-[#E50914] transition-all bg-[#181818]"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E50914] to-red-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-[#181818] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-[#B3B3B3] truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#B3B3B3] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Account Profile
                  </Link>

                  <Link
                    to="/watchlist"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#B3B3B3] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    My Watchlist
                  </Link>

                  <Link
                    to="/subscriptions"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#B3B3B3] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#E50914]" />
                    Plans & Billing
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-red-500" />
                      Admin Dashboard
                    </Link>
                  )}

                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-white hover:text-[#E50914] transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-semibold text-white bg-[#E50914] hover:bg-[#FF2934] px-4 py-1.5 rounded-lg transition-all cinematic-glow-sm shadow-md"
              >
                Join Now
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#B3B3B3] hover:text-white p-1"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111111] border-b border-white/10 px-4 pt-3 pb-6 flex flex-col gap-3">
          {navLinks.map((link) => {
            if (link.requiresAuth && !isAuthenticated) return null;
            return (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#B3B3B3] hover:text-[#E50914] py-1.5"
              >
                {link.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-red-400 py-1.5 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
