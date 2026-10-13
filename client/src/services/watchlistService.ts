import { api } from './api';
import { WatchlistItem } from '../types';

export const watchlistService = {
  async getWatchlist(): Promise<WatchlistItem[]> {
    const res = await api.get<WatchlistItem[]>('/watchlist');
    return res.data;
  },

  async addToWatchlist(videoId: string): Promise<WatchlistItem> {
    const res = await api.post<WatchlistItem>(`/watchlist/${videoId}`);
    return res.data;
  },

  async removeFromWatchlist(videoId: string): Promise<void> {
    await api.delete(`/watchlist/${videoId}`);
  },

  async checkInWatchlist(videoId: string): Promise<boolean> {
    const res = await api.get<{ inWatchlist: boolean }>(`/watchlist/check/${videoId}`);
    return res.data.inWatchlist;
  },
};
