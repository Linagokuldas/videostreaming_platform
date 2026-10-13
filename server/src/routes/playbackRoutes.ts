import { Router } from 'express';
import {
  authorizePlayback,
  heartbeat,
  stopPlayback,
} from '../controllers/playbackController';
import { verifyToken, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/:videoId/authorize', verifyToken, authorizePlayback);
router.post('/heartbeat', optionalAuth, heartbeat);
router.post('/stop', optionalAuth, stopPlayback);

export default router;
