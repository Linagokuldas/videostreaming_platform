import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../services/db';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      return;
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      res.status(400).json({ message: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.createUser(name, email, passwordHash, 'USER');

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
      expiresIn: '7d',
    });

    const { passwordHash: _, ...userSafe } = user;
    res.status(201).json({ user: userSafe, token });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating user account.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials. User not found.' });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
      expiresIn: '7d',
    });

    const { passwordHash: _, ...userSafe } = user;
    res.json({ user: userSafe, token });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error processing login.' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Logged out successfully.' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await db.findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const activeSubscription = await db.getUserActiveSubscription(user.id);
    const { passwordHash: _, ...userSafe } = user;
    res.json({ user: userSafe, activeSubscription });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching user profile.' });
  }
};
