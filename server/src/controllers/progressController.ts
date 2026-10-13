import { Response } from 'express';
import { db } from '../services/db';
import { AuthRequest } from '../middleware/auth';

export const getProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const items = await db.getProgress(req.user.id);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching progress' });
  }
};

export const getVideoProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { videoId } = req.params;
    const progress = await db.getVideoProgress(req.user.id, videoId);
    res.json({ progress });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching video progress' });
  }
};

export const updateProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { videoId } = req.params;
    const { positionSeconds, durationSeconds, completed } = req.body;
    const item = await db.updateProgress(
      req.user.id,
      videoId,
      positionSeconds,
      durationSeconds,
      completed
    );
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating progress' });
  }
};
