import { Request, Response } from 'express';
import { db } from '../services/db';

export const getVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { genre, contentType, search, sortBy, limit, page } = req.query;
    const result = await db.getVideos({
      genre: genre as string,
      contentType: contentType as string,
      search: search as string,
      sortBy: sortBy as any,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      page: page ? parseInt(page as string, 10) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching videos' });
  }
};

export const getVideoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const video = await db.getVideoById(id);
    if (!video) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }
    res.json(video);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching video' });
  }
};

export const getFeatured = async (_req: Request, res: Response): Promise<void> => {
  try {
    const video = await db.getFeaturedVideo();
    res.json(video);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching featured title' });
  }
};

export const getTrending = async (_req: Request, res: Response): Promise<void> => {
  try {
    const videos = await db.getTrendingVideos();
    res.json(videos);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching trending titles' });
  }
};

export const getGenres = async (_req: Request, res: Response): Promise<void> => {
  try {
    const genres = await db.getGenres();
    res.json(genres);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching genres' });
  }
};

export const getSimilar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const similar = await db.getSimilarVideos(id);
    res.json(similar);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching similar titles' });
  }
};
