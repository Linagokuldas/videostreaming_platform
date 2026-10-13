import bcrypt from 'bcryptjs';
import { seedGenres, seedPlans, seedVideos } from '../data/seedData';

// User structure
export interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAYMENT_FAILED';
  startDate: string;
  endDate: string;
  cancelledAt?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DBPayment {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  provider: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  status: string;
  createdAt: string;
}

export interface DBWatchlistItem {
  id: string;
  userId: string;
  videoId: string;
  createdAt: string;
}

export interface DBViewingProgress {
  id: string;
  userId: string;
  videoId: string;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
  updatedAt: string;
}

export interface DBPlaybackSession {
  id: string;
  userId: string;
  videoId: string;
  sessionToken: string;
  status: 'ACTIVE' | 'STOPPED' | 'EXPIRED';
  startedAt: string;
  lastHeartbeatAt: string;
}

class DatabaseService {
  private users: DBUser[] = [];
  private genres = [...seedGenres];
  private plans = [...seedPlans];
  private videos: any[] = [];
  private subscriptions: DBSubscription[] = [];
  private payments: DBPayment[] = [];
  private watchlist: DBWatchlistItem[] = [];
  private progress: DBViewingProgress[] = [];
  private sessions: DBPlaybackSession[] = [];

  constructor() {
    this.seed();
  }

  private async seed() {
    // Hash default admin and user passwords
    const adminHash = await bcrypt.hash('Admin@1234', 10);
    const userHash = await bcrypt.hash('User@1234', 10);

    // Seed default admin account
    this.users.push({
      id: 'user-admin-1',
      name: 'System Administrator',
      email: 'admin@reelflix.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed default demo subscriber
    this.users.push({
      id: 'user-demo-1',
      name: 'Alex Mercer',
      email: 'demo@reelflix.com',
      passwordHash: userHash,
      role: 'USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed active Premium subscription for demo user
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    this.subscriptions.push({
      id: 'sub-demo-1',
      userId: 'user-demo-1',
      planId: 'plan-premium',
      status: 'ACTIVE',
      startDate: now.toISOString(),
      endDate: expiry.toISOString(),
      autoRenew: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    // Seed verified transaction receipt for demo user
    this.payments.push({
      id: 'pay-tx-demo-1',
      userId: 'user-demo-1',
      subscriptionId: 'sub-demo-1',
      amount: 19.99,
      currency: 'USD',
      provider: 'DEMO_SANDBOX',
      providerOrderId: 'order_demo_982348',
      providerPaymentId: 'pay_demo_verified_123',
      status: 'SUCCESS',
      createdAt: now.toISOString(),
    });

    // Seed videos with genre relationships
    this.videos = seedVideos.map((v) => {
      const vidGenres = (v.genreIds || []).map((gid) => {
        const g = this.genres.find((gen) => gen.id === gid);
        return { genre: g || { id: gid, name: 'Cinema', slug: 'cinema' } };
      });
      return { ...v, genres: vidGenres };
    });
  }

  // User queries
  async findUserByEmail(email: string): Promise<DBUser | undefined> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id: string): Promise<DBUser | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async createUser(name: string, email: string, passwordHash: string, role: 'USER' | 'ADMIN' = 'USER'): Promise<DBUser> {
    const newUser: DBUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async listUsers(): Promise<Omit<DBUser, 'passwordHash'>[]> {
    return this.users.map(({ passwordHash, ...rest }) => rest);
  }

  // Catalogue queries
  async getVideos(options: {
    genre?: string;
    contentType?: string;
    search?: string;
    sortBy?: 'popularity' | 'newest' | 'rating';
    limit?: number;
    page?: number;
  }) {
    let result = [...this.videos];

    if (options.contentType) {
      result = result.filter((v) => v.contentType === options.contentType);
    }

    if (options.genre) {
      result = result.filter((v) =>
        v.genres.some((g: any) => g.genre?.slug === options.genre || g.genre?.name.toLowerCase().includes(options.genre!.toLowerCase()))
      );
    }

    if (options.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.genres.some((g: any) => g.genre?.name.toLowerCase().includes(q))
      );
    }

    if (options.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    } else if (options.sortBy === 'rating') {
      result.sort((a, b) => b.ratingScore - a.ratingScore);
    } else {
      result.sort((a, b) => b.viewCount - a.viewCount);
    }

    const total = result.length;
    const page = options.page || 1;
    const limit = options.limit || 20;
    const paginated = result.slice((page - 1) * limit, page * limit);

    return {
      videos: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getVideoById(id: string) {
    return this.videos.find((v) => v.id === id);
  }

  async getFeaturedVideo() {
    return this.videos.find((v) => v.isFeatured) || this.videos[0];
  }

  async getTrendingVideos() {
    return this.videos.filter((v) => v.isTrending);
  }

  async getGenres() {
    return this.genres;
  }

  async getSimilarVideos(videoId: string) {
    const current = await this.getVideoById(videoId);
    if (!current) return [];
    return this.videos.filter((v) => v.id !== videoId).slice(0, 8);
  }

  async createVideo(data: any) {
    const id = `vid-${Date.now()}`;
    const newVideo = {
      id,
      ...data,
      genres: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.videos.unshift(newVideo);
    return newVideo;
  }

  async deleteVideo(id: string) {
    this.videos = this.videos.filter((v) => v.id !== id);
  }

  // Plans & Subscriptions
  async getPlans() {
    return this.plans;
  }

  async getPlanById(id: string) {
    return this.plans.find((p) => p.id === id);
  }

  async updatePlan(id: string, data: any) {
    const plan = this.plans.find((p) => p.id === id);
    if (plan) {
      Object.assign(plan, data);
    }
    return plan;
  }

  async getUserActiveSubscription(userId: string) {
    const sub = this.subscriptions.find(
      (s) => s.userId === userId && s.status === 'ACTIVE' && new Date(s.endDate) > new Date()
    );
    if (!sub) return null;
    const plan = await this.getPlanById(sub.planId);
    return { ...sub, plan };
  }

  async createSubscription(userId: string, planId: string) {
    // Invalidate existing active subscriptions for this user
    this.subscriptions.forEach((s) => {
      if (s.userId === userId && s.status === 'ACTIVE') {
        s.status = 'CANCELLED';
      }
    });

    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const newSub: DBSubscription = {
      id: `sub-${Date.now()}`,
      userId,
      planId,
      status: 'ACTIVE',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    this.subscriptions.push(newSub);
    const plan = await this.getPlanById(planId);
    return { ...newSub, plan };
  }

  async cancelSubscription(subId: string) {
    const sub = this.subscriptions.find((s) => s.id === subId);
    if (sub) {
      sub.status = 'CANCELLED';
      sub.cancelledAt = new Date().toISOString();
      sub.autoRenew = false;
    }
    return sub;
  }

  async renewSubscription(subId: string) {
    const sub = this.subscriptions.find((s) => s.id === subId);
    if (sub) {
      sub.status = 'ACTIVE';
      const curEnd = new Date(sub.endDate) > new Date() ? new Date(sub.endDate) : new Date();
      sub.endDate = new Date(curEnd.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      sub.autoRenew = true;
    }
    return sub;
  }

  // Payments
  async createPayment(userId: string, subscriptionId: string, amount: number, provider = 'DEMO', orderId?: string, paymentId?: string) {
    const newPayment: DBPayment = {
      id: `pay-${Date.now()}`,
      userId,
      subscriptionId,
      amount,
      currency: 'USD',
      provider,
      providerOrderId: orderId || `ord_${Date.now()}`,
      providerPaymentId: paymentId || `pay_${Date.now()}`,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    this.payments.unshift(newPayment);
    return newPayment;
  }

  async getPaymentsByUser(userId: string) {
    return this.payments
      .filter((p) => p.userId === userId)
      .map((p) => {
        const sub = this.subscriptions.find((s) => s.id === p.subscriptionId);
        const plan = sub ? this.plans.find((pl) => pl.id === sub.planId) : undefined;
        return { ...p, subscription: { plan } };
      });
  }

  async getAllPayments() {
    return this.payments;
  }

  // Watchlist
  async getWatchlist(userId: string) {
    const items = this.watchlist.filter((w) => w.userId === userId);
    return items.map((w) => {
      const video = this.videos.find((v) => v.id === w.videoId);
      return { ...w, video };
    });
  }

  async addToWatchlist(userId: string, videoId: string) {
    const exists = this.watchlist.find((w) => w.userId === userId && w.videoId === videoId);
    if (exists) return exists;
    const newItem: DBWatchlistItem = {
      id: `watch-${Date.now()}`,
      userId,
      videoId,
      createdAt: new Date().toISOString(),
    };
    this.watchlist.push(newItem);
    return newItem;
  }

  async removeFromWatchlist(userId: string, videoId: string) {
    this.watchlist = this.watchlist.filter((w) => !(w.userId === userId && w.videoId === videoId));
  }

  async isInWatchlist(userId: string, videoId: string) {
    return this.watchlist.some((w) => w.userId === userId && w.videoId === videoId);
  }

  // Viewing Progress
  async getProgress(userId: string) {
    const items = this.progress.filter((p) => p.userId === userId);
    return items.map((p) => {
      const video = this.videos.find((v) => v.id === p.videoId);
      return { ...p, video };
    });
  }

  async getVideoProgress(userId: string, videoId: string) {
    return this.progress.find((p) => p.userId === userId && p.videoId === videoId) || null;
  }

  async updateProgress(userId: string, videoId: string, positionSeconds: number, durationSeconds: number, completed = false) {
    let item = this.progress.find((p) => p.userId === userId && p.videoId === videoId);
    const now = new Date().toISOString();
    if (item) {
      item.positionSeconds = positionSeconds;
      item.durationSeconds = durationSeconds;
      item.completed = completed;
      item.lastWatchedAt = now;
      item.updatedAt = now;
    } else {
      item = {
        id: `prog-${Date.now()}`,
        userId,
        videoId,
        positionSeconds,
        durationSeconds,
        completed,
        lastWatchedAt: now,
        updatedAt: now,
      };
      this.progress.push(item);
    }
    return item;
  }

  // Playback Sessions
  async createSession(userId: string, videoId: string) {
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const session: DBPlaybackSession = {
      id: `sess-${Date.now()}`,
      userId,
      videoId,
      sessionToken,
      status: 'ACTIVE',
      startedAt: new Date().toISOString(),
      lastHeartbeatAt: new Date().toISOString(),
    };
    this.sessions.push(session);
    return session;
  }

  async heartbeatSession(sessionToken: string) {
    const session = this.sessions.find((s) => s.sessionToken === sessionToken);
    if (session) {
      session.lastHeartbeatAt = new Date().toISOString();
    }
    return session;
  }

  async stopSession(sessionToken: string) {
    const session = this.sessions.find((s) => s.sessionToken === sessionToken);
    if (session) {
      session.status = 'STOPPED';
    }
    return session;
  }

  // Admin Dashboard stats
  async getAdminStats() {
    const totalUsers = this.users.length;
    const activeSubscriptions = this.subscriptions.filter(
      (s) => s.status === 'ACTIVE' && new Date(s.endDate) > new Date()
    ).length;
    const totalVideos = this.videos.length;
    const totalRevenue = this.payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalUsers,
      activeSubscriptions,
      totalVideos,
      totalRevenue,
      recentPayments: this.payments.slice(0, 10),
      popularVideos: this.videos.slice(0, 5),
    };
  }
}

export const db = new DatabaseService();
