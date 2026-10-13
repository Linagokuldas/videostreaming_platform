import { Response } from 'express';
import { db } from '../services/db';
import { AuthRequest } from '../middleware/auth';

export const authorizePlayback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required for video streaming.' });
      return;
    }

    const { videoId } = req.params;
    const video = await db.getVideoById(videoId);
    if (!video) {
      res.status(404).json({ message: 'Video not found.' });
      return;
    }

    // Check active subscription
    const activeSub = await db.getUserActiveSubscription(req.user.id);
    if (!activeSub) {
      res.status(403).json({
        message: 'Active subscription required. Please choose a subscription plan to stream this title.',
        code: 'SUBSCRIPTION_REQUIRED',
      });
      return;
    }

    // Retrieve previous viewing progress
    const progress = await db.getVideoProgress(req.user.id, videoId);
    const resumePosition = progress ? progress.positionSeconds : 0;

    // Create session token
    const session = await db.createSession(req.user.id, videoId);

    // Return playback authorization
    res.json({
      sessionToken: session.sessionToken,
      mediaUrl: video.mediaUrl,
      title: video.title,
      resumePosition,
      maxResolution: activeSub.plan?.maxResolution || '1080p',
      planName: activeSub.plan?.name || 'Standard',
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error authorizing playback.' });
  }
};

export const heartbeat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionToken, positionSeconds } = req.body;
    if (!sessionToken) {
      res.status(400).json({ message: 'sessionToken is required' });
      return;
    }
    await db.heartbeatSession(sessionToken);
    res.json({ status: 'OK' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error processing heartbeat' });
  }
};

export const stopPlayback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionToken, positionSeconds } = req.body;
    if (sessionToken) {
      await db.stopSession(sessionToken);
    }
    res.json({ status: 'STOPPED' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error stopping session' });
  }
};
