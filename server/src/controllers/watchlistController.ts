import { Response } from 'express';
import { db } from '../services/db';
import { AuthRequest } from '../middleware/auth';

export const getWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const items = await db.getWatchlist(req.user.id);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching watchlist' });
  }
};

export const addToWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { videoId } = req.params;
    const item = await db.addToWatchlist(req.user.id, videoId);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error adding to watchlist' });
  }
};

export const removeFromWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { videoId } = req.params;
    await db.removeFromWatchlist(req.user.id, videoId);
    res.json({ message: 'Removed from watchlist' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error removing from watchlist' });
  }
};

export const checkInWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.json({ inWatchlist: false });
      return;
    }
    const { videoId } = req.params;
    const inWatchlist = await db.isInWatchlist(req.user.id, videoId);
    res.json({ inWatchlist });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error checking watchlist' });
  }
};
