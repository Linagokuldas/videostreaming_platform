import { Router } from 'express';
import {
  getProgress,
  getVideoProgress,
  updateProgress,
} from '../controllers/progressController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/', verifyToken, getProgress);
router.get('/:videoId', verifyToken, getVideoProgress);
router.put('/:videoId', verifyToken, updateProgress);

export default router;
