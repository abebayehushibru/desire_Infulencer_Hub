import { Router } from 'express';
import {
  getCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  getCommunityMembers,
  addCommunityMember,
} from '../controllers/communityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', getCommunities);
router.get('/:id', getCommunityById);
router.post('/', createCommunity);
router.put('/:id', updateCommunity);
router.delete('/:id', deleteCommunity);
router.get('/:id/members', getCommunityMembers);
router.post('/:id/members', addCommunityMember);

export default router;
