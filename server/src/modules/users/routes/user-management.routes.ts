// ─────────────────────────────────────────────────────────────────────────────
// User Management Routes — FR06–FR10
// Every route has authentication + role-based authorization
// ─────────────────────────────────────────────────────────────────────────────

import { Router, Request, Response, NextFunction } from 'express';
import { userManagementController as ctrl } from '../controllers/user-management.controller';
import { authenticate } from '../../../middleware/authenticate';
import { authorize } from '../../../middleware/authorize';
import { validate } from '../../../middleware/validate';
import {
  createBusinessOwnerValidator, updateUserValidator, assignTierValidator,
  listUsersValidator, createBusinessProfileValidator, reviewBusinessValidator,
  createInfluencerProfileValidator, createAgentProfileValidator,
  uploadDocumentValidator, setCommunityLeaderValidator, userIdParamValidator,
} from '../validators/user-management.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ── Helper: cast authorize to RequestHandler ──────────────────────────────────
const adminOnly = (req: Request, res: Response, next: NextFunction) =>
  authorize('SYSTEM_ADMIN')(req as any, res, next);

const agentOrAdmin = (req: Request, res: Response, next: NextFunction) =>
  authorize('SYSTEM_ADMIN', 'AGENT')(req as any, res, next);

// ─────────────────────────────────────────────────────────────────────────────
// FR06 — Admin User Management (SYSTEM_ADMIN only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/users/admin/business-owners
 * @desc    FR06 — Admin creates a Business Owner account
 * @access  SYSTEM_ADMIN
 */
router.post(
  '/admin/business-owners',
  adminOnly,
  createBusinessOwnerValidator, validate,
  ctrl.createBusinessOwner.bind(ctrl)
);

/**
 * @route   GET /api/v1/users/admin/users
 * @desc    FR06 — List all users with filters
 * @access  SYSTEM_ADMIN
 */
router.get(
  '/admin/users',
  adminOnly,
  listUsersValidator, validate,
  ctrl.listUsers.bind(ctrl)
);

/**
 * @route   GET /api/v1/users/admin/users/:id
 * @desc    FR06 — Get user with full profile
 * @access  SYSTEM_ADMIN
 */
router.get('/admin/users/:id', adminOnly, userIdParamValidator, validate, ctrl.getUser.bind(ctrl));

/**
 * @route   PATCH /api/v1/users/admin/users/:id
 * @desc    FR06 — Update user basic info
 * @access  SYSTEM_ADMIN
 */
router.patch(
  '/admin/users/:id',
  adminOnly,
  updateUserValidator, validate,
  ctrl.updateUser.bind(ctrl)
);

/**
 * @route   POST /api/v1/users/admin/users/:id/deactivate
 * @desc    FR06 — Deactivate Business Owner account
 * @access  SYSTEM_ADMIN
 */
router.post('/admin/users/:id/deactivate', adminOnly, userIdParamValidator, validate, ctrl.deactivateUser.bind(ctrl));

/**
 * @route   POST /api/v1/users/admin/users/:id/reactivate
 * @desc    FR06 — Reactivate user account
 * @access  SYSTEM_ADMIN
 */
router.post('/admin/users/:id/reactivate', adminOnly, userIdParamValidator, validate, ctrl.reactivateUser.bind(ctrl));

/**
 * @route   POST /api/v1/users/admin/users/:id/assign-tier
 * @desc    FR06/FR09 — Admin assigns influencer tier
 * @access  SYSTEM_ADMIN
 */
router.post(
  '/admin/users/:id/assign-tier',
  adminOnly,
  assignTierValidator, validate,
  ctrl.assignTier.bind(ctrl)
);

/**
 * @route   POST /api/v1/users/admin/users/:id/community-leader
 * @desc    FR09 — Admin sets/removes Community Leader (DIAMOND only)
 * @access  SYSTEM_ADMIN
 */
router.post('/admin/users/:id/community-leader', adminOnly, setCommunityLeaderValidator, validate, ctrl.setCommunityLeader.bind(ctrl));

/**
 * @route   GET /api/v1/users/admin/users/:id/tier-history
 * @desc    FR09 — Get influencer tier history
 * @access  SYSTEM_ADMIN
 */
router.get('/admin/users/:id/tier-history', adminOnly, userIdParamValidator, validate, ctrl.getTierHistory.bind(ctrl));

// ─────────────────────────────────────────────────────────────────────────────
// FR08 — Business Verification (SYSTEM_ADMIN)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/users/admin/businesses
 * @desc    FR08 — List business profiles (filter by status)
 * @access  SYSTEM_ADMIN
 */
router.get('/admin/businesses', adminOnly, ctrl.listBusinessProfiles.bind(ctrl));

/**
 * @route   POST /api/v1/users/admin/businesses/:id/review
 * @desc    FR08 — Approve or reject business verification
 * @access  SYSTEM_ADMIN
 */
router.post(
  '/admin/businesses/:id/review',
  adminOnly,
  reviewBusinessValidator, validate,
  ctrl.reviewBusiness.bind(ctrl)
);

// ─────────────────────────────────────────────────────────────────────────────
// FR07 — Business Owner Profile (BUSINESS_OWNER)
// ─────────────────────────────────────────────────────────────────────────────

const businessOwnerOnly = (req: Request, res: Response, next: NextFunction) =>
  authorize('BUSINESS_OWNER')(req as any, res, next);

/**
 * @route   POST /api/v1/users/business/profile
 * @desc    FR07 — Business Owner creates their profile
 * @access  BUSINESS_OWNER
 */
router.post(
  '/business/profile',
  businessOwnerOnly,
  createBusinessProfileValidator, validate,
  ctrl.createBusinessProfile.bind(ctrl)
);

/**
 * @route   GET /api/v1/users/business/profile
 * @desc    FR07 — Get own business profile
 * @access  BUSINESS_OWNER, SYSTEM_ADMIN
 */
router.get(
  '/business/profile',
  (req, res, next) => authorize('BUSINESS_OWNER', 'SYSTEM_ADMIN')(req as any, res, next),
  ctrl.getMyBusinessProfile.bind(ctrl)
);

/**
 * @route   PATCH /api/v1/users/business/profile
 * @desc    FR07 — Update own business profile
 * @access  BUSINESS_OWNER
 */
router.patch('/business/profile', businessOwnerOnly, ctrl.updateMyBusinessProfile.bind(ctrl));

/**
 * @route   POST /api/v1/users/business/documents
 * @desc    FR07 — Upload verification document (metadata only)
 * @access  BUSINESS_OWNER
 */
router.post('/business/documents', businessOwnerOnly, uploadDocumentValidator, validate, ctrl.uploadDocument.bind(ctrl));

// ─────────────────────────────────────────────────────────────────────────────
// FR09 — Influencer Profile (all influencer tiers)
// ─────────────────────────────────────────────────────────────────────────────

const influencerOnly = (req: Request, res: Response, next: NextFunction) =>
  authorize('DIAMOND_INFLUENCER', 'GOLD_INFLUENCER', 'SILVER_INFLUENCER')(req as any, res, next);

/**
 * @route   POST /api/v1/users/influencer/profile
 * @desc    FR09 — Create influencer profile
 * @access  All influencer tiers
 */
router.post(
  '/influencer/profile',
  influencerOnly,
  createInfluencerProfileValidator, validate,
  ctrl.createInfluencerProfile.bind(ctrl)
);

/**
 * @route   GET /api/v1/users/influencer/profile
 * @desc    FR09 — Get own influencer profile
 * @access  All influencer tiers
 */
router.get('/influencer/profile', influencerOnly, ctrl.getMyInfluencerProfile.bind(ctrl));

/**
 * @route   PATCH /api/v1/users/influencer/profile
 * @desc    FR09 — Update own influencer profile
 * @access  All influencer tiers
 */
router.patch('/influencer/profile', influencerOnly, ctrl.updateMyInfluencerProfile.bind(ctrl));

// ─────────────────────────────────────────────────────────────────────────────
// FR10 — Agent Profile (AGENT)
// ─────────────────────────────────────────────────────────────────────────────

const agentOnly = (req: Request, res: Response, next: NextFunction) =>
  authorize('AGENT')(req as any, res, next);

/**
 * @route   POST /api/v1/users/agent/profile
 * @desc    FR10 — Create agent profile
 * @access  AGENT
 */
router.post(
  '/agent/profile',
  agentOnly,
  createAgentProfileValidator, validate,
  ctrl.createAgentProfile.bind(ctrl)
);

/**
 * @route   GET /api/v1/users/agent/profile
 * @desc    FR10 — Get own agent profile
 * @access  AGENT
 */
router.get('/agent/profile', agentOnly, ctrl.getMyAgentProfile.bind(ctrl));

/**
 * @route   PATCH /api/v1/users/agent/profile
 * @desc    FR10 — Update own agent profile
 * @access  AGENT
 */
router.patch('/agent/profile', agentOnly, ctrl.updateMyAgentProfile.bind(ctrl));

/**
 * @route   GET /api/v1/users/agent/businesses
 * @desc    FR10 — Agent views businesses (read only)
 * @access  AGENT, SYSTEM_ADMIN
 */
router.get(
  '/agent/businesses',
  agentOrAdmin,
  ctrl.listBusinessProfiles.bind(ctrl)
);

// ─────────────────────────────────────────────────────────────────────────────
// Notifications (all authenticated users)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/notifications',             ctrl.getNotifications.bind(ctrl));
router.patch('/notifications/:id/read',  ctrl.markNotificationRead.bind(ctrl));
router.patch('/notifications/read-all',  ctrl.markAllNotificationsRead.bind(ctrl));

export default router;
