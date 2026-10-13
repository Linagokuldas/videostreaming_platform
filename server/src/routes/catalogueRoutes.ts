import { Router } from 'express';
import {
  getVideos,
  getVideoById,
  getFeatured,
  getTrending,
  getGenres,
  getSimilar,
} from '../controllers/catalogueController';

const router = Router();

router.get('/', getVideos);
router.get('/featured', getFeatured);
router.get('/trending', getTrending);
router.get('/genres', getGenres);
router.get('/:id', getVideoById);
router.get('/:id/similar', getSimilar);

export default router;
