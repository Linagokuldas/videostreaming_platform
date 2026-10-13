import { api } from './api';
import { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', { name, email, password });
    return res.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  },

  async getCurrentUser(): Promise<{ user: User; activeSubscription?: any }> {
    const res = await api.get<{ user: User; activeSubscription?: any }>('/auth/me');
    return res.data;
  },
};
