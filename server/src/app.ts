import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import catalogueRoutes from './routes/catalogueRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import paymentRoutes from './routes/paymentRoutes';
import playbackRoutes from './routes/playbackRoutes';
import watchlistRoutes from './routes/watchlistRoutes';
import progressRoutes from './routes/progressRoutes';
import adminRoutes from './routes/adminRoutes';
import { db } from './services/db';

export const app = express();

// Security and middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'REELFLIX Streaming Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Direct plans route for public convenience
app.get('/api/plans', async (_req: Request, res: Response) => {
  try {
    const plans = await db.getPlans();
    res.json(plans);
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching plans' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', catalogueRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/playback', playbackRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[REELFLIX API ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    status,
  });
});

export default app;
