export type Role = 'USER' | 'ADMIN';

export type SubscriptionStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PAYMENT_FAILED';

export type ContentType = 'MOVIE' | 'SERIES';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  posterUrl: string;
  backdropUrl: string;
  mediaUrl: string;
  trailerUrl?: string;
  language: string;
  releaseDate: string;
  durationSeconds: number;
  contentRating: string;
  ratingScore: number;
  isPublished: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  viewCount: number;
  genres?: { genre: Genre }[] | Genre[];
  progress?: ViewingProgress;
  inWatchlist?: boolean;
}

export interface Plan {
  id: string;
  name: string; // BASIC, STANDARD, PREMIUM
  description: string;
  price: number;
  currency: string;
  billingInterval: string;
  maxResolution: string;
  maxDevices: number;
  features: string[] | string;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  cancelledAt?: string;
  autoRenew: boolean;
  plan?: Plan;
}

export interface Payment {
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
  subscription?: {
    plan?: {
      name: string;
    };
  };
}

export interface ViewingProgress {
  id: string;
  userId: string;
  videoId: string;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
  video?: Video;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  videoId: string;
  createdAt: string;
  video: Video;
}

export interface PlaybackAuthorization {
  sessionToken: string;
  mediaUrl: string;
  title: string;
  resumePosition: number;
  maxResolution: string;
  planName: string;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalVideos: number;
  totalRevenue: number;
  recentPayments: Payment[];
  popularVideos: Video[];
}
