import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  createVideo,
  deleteVideo,
  updatePlan,
} from '../controllers/adminController';
import { verifyToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Protect all admin endpoints with authentication and ADMIN role check
router.use(verifyToken, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.post('/videos', createVideo);
router.delete('/videos/:id', deleteVideo);
router.put('/plans/:id', updatePlan);

export default router;
