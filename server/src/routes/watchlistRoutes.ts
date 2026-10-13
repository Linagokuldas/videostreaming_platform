import { Router } from 'express';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkInWatchlist,
} from '../controllers/watchlistController';
import { verifyToken, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', verifyToken, getWatchlist);
router.get('/check/:videoId', optionalAuth, checkInWatchlist);
router.post('/:videoId', verifyToken, addToWatchlist);
router.delete('/:videoId', verifyToken, removeFromWatchlist);

export default router;
