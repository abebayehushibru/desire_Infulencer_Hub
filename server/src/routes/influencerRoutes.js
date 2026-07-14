import { Router } from 'express';
import {
  getInfluencers,
  getInfluencerById,
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
} from '../controllers/influencerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', getInfluencers);
router.get('/:id', getInfluencerById);
router.post('/', createInfluencer);
router.put('/:id', updateInfluencer);
router.delete('/:id', deleteInfluencer);

export default router;
