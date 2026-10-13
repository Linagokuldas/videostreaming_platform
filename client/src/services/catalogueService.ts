import { api } from './api';
import { Video, Genre } from '../types';

export interface VideoQueryParams {
  genre?: string;
  contentType?: string;
  language?: string;
  search?: string;
  sortBy?: 'popularity' | 'newest' | 'rating';
  page?: number;
  limit?: number;
}

export const catalogueService = {
  async getVideos(params?: VideoQueryParams): Promise<{ videos: Video[]; total: number; page: number; totalPages: number }> {
    const res = await api.get('/videos', { params });
    return res.data;
  },

  async getVideoById(id: string): Promise<Video> {
    const res = await api.get<Video>(`/videos/${id}`);
    return res.data;
  },

  async getFeatured(): Promise<Video> {
    const res = await api.get<Video>('/videos/featured');
    return res.data;
  },

  async getTrending(): Promise<Video[]> {
    const res = await api.get<Video[]>('/videos/trending');
    return res.data;
  },

  async getGenres(): Promise<Genre[]> {
    const res = await api.get<Genre[]>('/videos/genres');
    return res.data;
  },

  async getSimilar(videoId: string): Promise<Video[]> {
    const res = await api.get<Video[]>(`/videos/${videoId}/similar`);
    return res.data;
  },
};
