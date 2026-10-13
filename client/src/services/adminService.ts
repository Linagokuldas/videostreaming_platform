import { api } from './api';
import { AdminStats, User, Video, Plan } from '../types';

export const adminService = {
  async getDashboardStats(): Promise<AdminStats> {
    const res = await api.get<AdminStats>('/admin/dashboard');
    return res.data;
  },

  async getUsers(): Promise<User[]> {
    const res = await api.get<User[]>('/admin/users');
    return res.data;
  },

  async createVideo(data: Partial<Video>): Promise<Video> {
    const res = await api.post<Video>('/admin/videos', data);
    return res.data;
  },

  async updateVideo(id: string, data: Partial<Video>): Promise<Video> {
    const res = await api.put<Video>(`/admin/videos/${id}`, data);
    return res.data;
  },

  async deleteVideo(id: string): Promise<void> {
    await api.delete(`/admin/videos/${id}`);
  },

  async updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
    const res = await api.put<Plan>(`/admin/plans/${id}`, data);
    return res.data;
  },
};
