import { api } from './api';
import { PlaybackAuthorization, ViewingProgress } from '../types';

export const playbackService = {
  async authorizePlayback(videoId: string): Promise<PlaybackAuthorization> {
    const res = await api.post<PlaybackAuthorization>(`/playback/${videoId}/authorize`);
    return res.data;
  },

  async sendHeartbeat(sessionToken: string, positionSeconds: number): Promise<void> {
    await api.post(`/playback/heartbeat`, { sessionToken, positionSeconds });
  },

  async stopPlayback(sessionToken: string, positionSeconds: number): Promise<void> {
    await api.post(`/playback/stop`, { sessionToken, positionSeconds });
  },

  async getProgress(): Promise<ViewingProgress[]> {
    const res = await api.get<ViewingProgress[]>('/progress');
    return res.data;
  },

  async getVideoProgress(videoId: string): Promise<ViewingProgress | null> {
    const res = await api.get<{ progress: ViewingProgress | null }>(`/progress/${videoId}`);
    return res.data.progress;
  },

  async updateProgress(videoId: string, positionSeconds: number, durationSeconds: number, completed = false): Promise<void> {
    await api.put(`/progress/${videoId}`, { positionSeconds, durationSeconds, completed });
  },
};
