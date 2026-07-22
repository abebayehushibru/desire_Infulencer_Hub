// ─────────────────────────────────────────────────────────────────────────────
// Community Routes — FR11–FR15
// All routes authenticated. RBAC enforced per endpoint.
// ─────────────────────────────────────────────────────────────────────────────

import { Router, Request, Response, NextFunction } from 'express';
import { communityController as ctrl } from '../controllers/community.controller';
import { authenticate } from '../../../middleware/authenticate';
import { authorize } from '../../../middleware/authorize';
import { validate } from '../../../middleware/validate';
import {
  createCommunityValidator,
  updateCommunityValidator,
  communityIdParamValidator,
  listCommunitiesValidator,
  setCommissionValidator,
  addMemberValidator,
  removeMemberValidator,
  listMembersValidator,
  leaderboardValidator,
  communityRankingsValidator,
} from '../validators/community.validator';

const router = Router();

// All routes require a valid JWT
router.use(authenticate);

// ── Role helpers ─────────────────────────────────────────────────────────────
const adminOnly = (req: Request, res: Response, next: NextFunction) =>
  authorize('SYSTEM_ADMIN')(req as any, res, next);

const adminOrLeaderOrMember = (req: Request, res: Response, next: NextFunction) =>
  authorize(
    'SYSTEM_ADMIN',
    'DIAMOND_INFLUENCER',
    'GOLD_INFLUENCER',
    'SILVER_INFLUENCER',
  )(req as any, res, next);

const adminOrLeader = (req: Request, res: Response, next: NextFunction) =>
  authorize('SYSTEM_ADMIN', 'DIAMOND_INFLUENCER')(req as any, res, next);

// ─────────────────────────────────────────────────────────────────────────────
// FR11 — Community CRUD (SYSTEM_ADMIN only for write operations)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/communities
 * @desc    FR11 — Create a new community
 * @access  SYSTEM_ADMIN
 */
router.post(
  '/',
  adminOnly,
  createCommunityValidator, validate,
  ctrl.createCommunity.bind(ctrl),
);

/**
 * @route   GET /api/v1/communities
 * @desc    FR11 — List communities with filters, pagination, sorting
 * @access  SYSTEM_ADMIN
 */
router.get(
  '/',
  adminOnly,
  listCommunitiesValidator, validate,
  ctrl.listCommunities.bind(ctrl),
);

/**
 * @route   GET /api/v1/communities/rankings
 * @desc    FR15 — Cross-community platform-wide rankings
 * @access  SYSTEM_ADMIN
 * NOTE: This route must be declared BEFORE /:id to avoid param collision.
 */
router.get(
  '/rankings',
  adminOnly,
  communityRankingsValidator, validate,
  ctrl.getCommunityRankings.bind(ctrl),
);

/**
 * @route   GET /api/v1/communities/:id
 * @desc    FR11 — Get community details
 * @access  SYSTEM_ADMIN, DIAMOND_INFLUENCER (leader), GOLD/SILVER (members)
 */
router.get(
  '/:id',
  adminOrLeaderOrMember,
  communityIdParamValidator, validate,
  ctrl.getCommunity.bind(ctrl),
);

/**
 * @route   PATCH /api/v1/communities/:id
 * @desc    FR11 — Update community (title, description, rules, leader, status)
 * @access  SYSTEM_ADMIN
 */
router.patch(
  '/:id',
  adminOnly,
  updateCommunityValidator, validate,
  ctrl.updateCommunity.bind(ctrl),
);

/**
 * @route   POST /api/v1/communities/:id/deactivate
 * @desc    FR11 — Deactivate a community
 * @access  SYSTEM_ADMIN
 */
router.post(
  '/:id/deactivate',
  adminOnly,
  communityIdParamValidator, validate,
  ctrl.deactivateCommunity.bind(ctrl),
);

/**
 * @route   DELETE /api/v1/communities/:id
 * @desc    FR11 — Soft-delete a community
 * @access  SYSTEM_ADMIN
 */
router.delete(
  '/:id',
  adminOnly,
  communityIdParamValidator, validate,
  ctrl.deleteCommunity.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// FR12 — Commission Rules
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   PATCH /api/v1/communities/:id/commission
 * @desc    FR12 — Set/update commission rules. Creates history record.
 * @access  SYSTEM_ADMIN
 */
router.patch(
  '/:id/commission',
  adminOnly,
  setCommissionValidator, validate,
  ctrl.setCommission.bind(ctrl),
);

/**
 * @route   GET /api/v1/communities/:id/commission
 * @desc    FR12 — Get current commission rules
 * @access  SYSTEM_ADMIN, Community Leader
 */
router.get(
  '/:id/commission',
  adminOrLeader,
  communityIdParamValidator, validate,
  ctrl.getCommission.bind(ctrl),
);

/**
 * @route   GET /api/v1/communities/:id/commission/history
 * @desc    FR12 — Get commission change history for auditing
 * @access  SYSTEM_ADMIN
 */
router.get(
  '/:id/commission/history',
  adminOnly,
  communityIdParamValidator, validate,
  ctrl.getCommissionHistory.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// FR13 — Community Members
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/communities/:id/members
 * @desc    FR13 — Add a GOLD or SILVER influencer as a member
 * @access  SYSTEM_ADMIN, Community Leader (DIAMOND_INFLUENCER)
 */
router.post(
  '/:id/members',
  adminOrLeader,
  addMemberValidator, validate,
  ctrl.addMember.bind(ctrl),
);

/**
 * @route   GET /api/v1/communities/:id/members
 * @desc    FR13 — List community members
 * @access  SYSTEM_ADMIN, Community Leader, Community Members
 */
router.get(
  '/:id/members',
  adminOrLeaderOrMember,
  listMembersValidator, validate,
  ctrl.listMembers.bind(ctrl),
);

/**
 * @route   DELETE /api/v1/communities/:id/members/:memberId
 * @desc    FR13 — Remove a member (soft-remove, sets status REMOVED)
 * @access  SYSTEM_ADMIN, Community Leader
 */
router.delete(
  '/:id/members/:memberId',
  adminOrLeader,
  removeMemberValidator, validate,
  ctrl.removeMember.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// FR14 — Community Leaderboard
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/communities/:id/leaderboard
 * @desc    FR14 — Ranked member leaderboard
 * @access  SYSTEM_ADMIN, Community Leader, Community Members
 */
router.get(
  '/:id/leaderboard',
  adminOrLeaderOrMember,
  leaderboardValidator, validate,
  ctrl.getLeaderboard.bind(ctrl),
);

export default router;
