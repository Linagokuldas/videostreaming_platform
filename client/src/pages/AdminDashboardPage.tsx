import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { adminService } from '../services/adminService';
import { catalogueService } from '../services/catalogueService';
import { AdminStats, Video, User } from '../types';
import {
  ShieldAlert,
  Users,
  Film,
  CreditCard,
  DollarSign,
  Plus,
  Trash2,
  Sparkles,
  TrendingUp,
  X,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'users'>('overview');
  const [loading, setLoading] = useState(true);

  // New Video Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'MOVIE' | 'SERIES'>('MOVIE');
  const [newPoster, setNewPoster] = useState('');
  const [newBackdrop, setNewBackdrop] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newRating, setNewRating] = useState('8.5');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [submittingVideo, setSubmittingVideo] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [sData, vData, uData] = await Promise.all([
        adminService.getDashboardStats().catch(() => null),
        catalogueService.getVideos({ limit: 50 }).catch(() => ({ videos: [] })),
        adminService.getUsers().catch(() => []),
      ]);
      setStats(sData);
      setVideos(vData.videos || []);
      setUsersList(uData);
    } catch {
      showToast('Error loading administrative data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isAdmin) {
        showToast('Unauthorized. Admin access required.', 'error');
        navigate('/');
        return;
      }
      fetchAdminData();
    }
  }, [isAuthenticated, isAdmin, isLoading]);

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newMediaUrl) {
      showToast('Please fill in title, synopsis, and media URL', 'error');
      return;
    }

    try {
      setSubmittingVideo(true);
      await adminService.createVideo({
        title: newTitle,
        description: newDesc,
        contentType: newType,
        posterUrl: newPoster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
        backdropUrl: newBackdrop || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop',
        mediaUrl: newMediaUrl,
        ratingScore: parseFloat(newRating) || 8.5,
        isFeatured,
        isTrending,
        releaseDate: new Date().toISOString(),
        durationSeconds: 7200,
      });

      showToast(`Created video "${newTitle}"`, 'success');
      setShowAddModal(false);
      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewMediaUrl('');
      setNewPoster('');
      setNewBackdrop('');
      fetchAdminData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create video', 'error');
    } finally {
      setSubmittingVideo(false);
    }
  };

  const handleDeleteVideo = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await adminService.deleteVideo(id);
      showToast(`Deleted "${title}"`, 'info');
      fetchAdminData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete video', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-400 border border-red-800/40">
              Admin Portal
            </span>
            <span className="text-xs text-neutral-400">Low-Level & High-Level Control</span>
          </div>
          <h1 className="text-3xl font-black text-white font-heading tracking-tight">
            REELFLIX Management Dashboard
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#FF2934] text-white font-bold text-xs uppercase tracking-wider transition-all cinematic-glow shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add New Title
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'overview'
              ? 'border-[#E50914] text-white'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          System KPIs & Revenue
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'videos'
              ? 'border-[#E50914] text-white'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Video Catalogue ({videos.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'users'
              ? 'border-[#E50914] text-white'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Subscribers ({usersList.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW KPIs */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#181818] border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400">Total Registered Users</span>
                <Users className="w-5 h-5 text-[#E50914]" />
              </div>
              <p className="text-3xl font-black text-white font-heading">{stats.totalUsers}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#181818] border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400">Active Subscriptions</span>
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white font-heading">{stats.activeSubscriptions}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#181818] border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400">Catalogue Titles</span>
                <Film className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-black text-white font-heading">{stats.totalVideos}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#181818] border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400">Subscription Revenue</span>
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white font-heading">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Recent Payments Table */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#181818] border border-white/10 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">Recent Verified Transactions</h3>
            {stats.recentPayments && stats.recentPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-neutral-400 uppercase text-[10px]">
                    <tr>
                      <th className="pb-3">Transaction ID</th>
                      <th className="pb-3">Provider</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-neutral-300">
                    {stats.recentPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 font-mono text-[11px] text-neutral-400">{p.id.slice(0, 8)}...</td>
                        <td className="py-3 font-semibold text-white">{p.provider}</td>
                        <td className="py-3 font-bold text-white">${p.amount.toFixed(2)}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 font-mono">{new Date(p.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No transactions recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VIDEOS MANAGEMENT */}
      {activeTab === 'videos' && (
        <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-neutral-400 uppercase text-[10px]">
              <tr>
                <th className="pb-3">Title</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Rating</th>
                <th className="pb-3">Featured / Trending</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {videos.map((vid) => (
                <tr key={vid.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={vid.posterUrl}
                        alt={vid.title}
                        className="w-8 h-12 object-cover rounded bg-neutral-800 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-white text-sm">{vid.title}</p>
                        <p className="text-[11px] text-neutral-400 line-clamp-1">{vid.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-900 border border-white/10">
                      {vid.contentType}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-amber-400">{vid.ratingScore}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {vid.isFeatured && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-400 border border-red-800/40">
                          Featured
                        </span>
                      )}
                      {vid.isTrending && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-400 border border-amber-800/40">
                          Trending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/movie/${vid.id}`)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                        title="View details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(vid.id, vid.title)}
                        className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-400 transition-colors"
                        title="Delete title"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: USERS LIST */}
      {activeTab === 'users' && (
        <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-neutral-400 uppercase text-[10px]">
              <tr>
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-bold text-white">{u.name}</td>
                  <td className="py-3 font-mono text-neutral-400">{u.email}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'ADMIN'
                          ? 'bg-red-950 text-red-400 border border-red-800/40'
                          : 'bg-neutral-900 text-neutral-300 border border-white/10'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE NEW VIDEO MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white font-heading mb-4">
              Add New Cinematic Title
            </h2>

            <form onSubmit={handleCreateVideo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk: Neon Horizon"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-neutral-400 mb-1">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Compelling plot synopsis..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-neutral-400 mb-1">Content Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="MOVIE">Movie</option>
                    <option value="SERIES">Series</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-neutral-400 mb-1">Rating Score</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-neutral-400 mb-1">Media URL (MP4 / Stream)</label>
                <input
                  type="url"
                  required
                  placeholder="https://.../sample.mp4"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-neutral-400 mb-1">Poster Image URL</label>
                <input
                  type="url"
                  placeholder="Optional image url"
                  value={newPoster}
                  onChange={(e) => setNewPoster(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-[#E50914]"
                  />
                  <span>Featured Hero</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="accent-[#E50914]"
                  />
                  <span>Trending Carousel</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submittingVideo}
                className="w-full py-3 bg-[#E50914] hover:bg-[#FF2934] text-white font-bold rounded-xl transition-all cinematic-glow text-xs uppercase tracking-wider mt-4"
              >
                {submittingVideo ? 'Saving to Database...' : 'Save & Publish Title'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
