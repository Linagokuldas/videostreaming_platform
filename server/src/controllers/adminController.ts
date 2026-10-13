import { Response } from 'express';
import { db } from '../services/db';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await db.getAdminStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching dashboard metrics' });
  }
};

export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await db.listUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching users' });
  }
};

export const createVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const newVideo = await db.createVideo(req.body);
    res.status(201).json(newVideo);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating video' });
  }
};

export const deleteVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.deleteVideo(id);
    res.json({ message: 'Video deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error deleting video' });
  }
};

export const updatePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await db.updatePlan(id, req.body);
    res.json(plan);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating plan' });
  }
};
