// ─────────────────────────────────────────────────────────────────────────────
// Tracking & Earnings Routes — FR24–FR31
// ─────────────────────────────────────────────────────────────────────────────

import { Router, Request, Response, NextFunction } from 'express';
import { trackingController as ctrl } from '../controllers/tracking.controller';
import { authenticate } from '../../../middleware/authenticate';
import { authorize } from '../../../middleware/authorize';
import { validate } from '../../../middleware/validate';
import {
  trackClickValidator,
  trackConversionValidator,
  trackReferralValidator,
  earningsHistoryValidator,
  campaignIdParamValidator,
  businessAnalyticsValidator,
  communityIdParamValidator,
  memberStatsParamsValidator,
  memberPerformanceQueryValidator,
  createWithdrawalValidator,
  withdrawalIdParamValidator,
  withdrawalHistoryValidator,
  approveWithdrawalValidator,
  rejectWithdrawalValidator,
} from '../validators/tracking.validator';

// ── Separate routers for different base paths ─────────────────────────────────
export const trackingRouter  = Router();
export const earningsRouter  = Router();
export const analyticsRouter = Router();
export const withdrawalRouter = Router();

// ─────────────────────────────────────────────────────────────────────────────
// /api/v1/tracking — FR24/FR25  (public — no JWT required for click/referral)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route POST /api/v1/tracking/click
 * @desc  FR24 — Record a click on a unique tracking link
 * @access Public (no auth — tracking happens when visitor clicks the link)
 */
trackingRouter.post('/click', trackClickValidator, validate, ctrl.trackClick.bind(ctrl));

/**
 * @route POST /api/v1/tracking/conversion
 * @desc  FR24 — Record a conversion via tracking link code
 * @access Public (called by campaign landing page / conversion pixel)
 */
trackingRouter.post('/conversion', trackConversionValidator, validate, ctrl.trackConversion.bind(ctrl));

/**
 * @route POST /api/v1/tracking/referral
 * @desc  FR25 — Record a conversion via referral code
 * @access Public
 */
trackingRouter.post('/referral', trackReferralValidator, validate, ctrl.trackReferral.bind(ctrl));

// ─────────────────────────────────────────────────────────────────────────────
// /api/v1/earnings — FR26  (influencers only)
// ─────────────────────────────────────────────────────────────────────────────

earningsRouter.use(authenticate);

const influencerOnly = (req: Request, res: Response, next: NextFunction) =>
  authorize('INFLUENCER')(req as any, res, next);

const adminOnly = (req: Request, res: Response, next: NextFunction) =>
  authorize('SUPER_ADMIN', 'ADMIN')(req as any, res, next);

/**
 * @route GET /api/v1/earnings/dashboard
 * @desc  FR26 — Earnings dashboard (total, pending, available, withdrawn, monthly)
 * @access Influencers
 */
earningsRouter.get(
  '/dashboard',
  influencerOnly,
  ctrl.getEarningsDashboard.bind(ctrl),
);

/**
 * @route GET /api/v1/earnings/history
 * @desc  FR26 — Paginated earnings history with filters
 * @access Influencers
 */
earningsRouter.get(
  '/history',
  influencerOnly,
  earningsHistoryValidator, validate,
  ctrl.getEarningsHistory.bind(ctrl),
);

/**
 * @route GET /api/v1/earnings/campaigns/:campaignId
 * @desc  FR26 — Earnings breakdown for a specific campaign
 * @access Influencers
 */
earningsRouter.get(
  '/campaigns/:campaignId',
  influencerOnly,
  campaignIdParamValidator, validate,
  ctrl.getEarningsByCampaign.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// /api/v1/analytics — FR28/FR29
// ─────────────────────────────────────────────────────────────────────────────

analyticsRouter.use(authenticate);

const adminOrBiz = (req: Request, res: Response, next: NextFunction) =>
  authorize('SUPER_ADMIN', 'ADMIN', 'BUSINESS')(req as any, res, next);

const adminOrLeader = (req: Request, res: Response, next: NextFunction) =>
  authorize('SUPER_ADMIN', 'ADMIN', 'INFLUENCER')(req as any, res, next);

/**
 * @route GET /api/v1/analytics/business
 * @desc  FR28 — Business campaign analytics
 * @access SUPER_ADMIN, ADMIN, BUSINESS
 */
analyticsRouter.get(
  '/business',
  adminOrBiz,
  businessAnalyticsValidator, validate,
  ctrl.getBusinessAnalytics.bind(ctrl),
);

/**
 * @route GET /api/v1/analytics/community/:communityId
 * @desc  FR29 — Community member performance list
 * @access SUPER_ADMIN, ADMIN, DIAMOND tier (community leader)
 */
analyticsRouter.get(
  '/community/:communityId',
  adminOrLeader,
  memberPerformanceQueryValidator, validate,
  ctrl.getCommunityMemberPerformance.bind(ctrl),
);

/**
 * @route GET /api/v1/analytics/member/:communityId/:memberId
 * @desc  FR29 — Individual member stats
 * @access SUPER_ADMIN, ADMIN, DIAMOND tier (community leader)
 */
analyticsRouter.get(
  '/member/:communityId/:memberId',
  adminOrLeader,
  memberStatsParamsValidator, validate,
  ctrl.getMemberStats.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// /api/v1/withdrawals — FR30/FR31
// ─────────────────────────────────────────────────────────────────────────────

withdrawalRouter.use(authenticate);

/**
 * @route GET /api/v1/withdrawals/admin/all
 * @desc  FR31 — Admin list all withdrawal requests across system
 * @access SUPER_ADMIN, ADMIN
 */
withdrawalRouter.get(
  '/admin/all',
  adminOnly,
  withdrawalHistoryValidator, validate,
  ctrl.getAllWithdrawals.bind(ctrl),
);

/**
 * @route PATCH /api/v1/withdrawals/admin/:id/approve
 * @desc  FR30 — Admin approve withdrawal request
 * @access SUPER_ADMIN, ADMIN
 */
withdrawalRouter.patch(
  '/admin/:id/approve',
  adminOnly,
  approveWithdrawalValidator, validate,
  ctrl.approveWithdrawal.bind(ctrl),
);

/**
 * @route PATCH /api/v1/withdrawals/admin/:id/reject
 * @desc  FR30 — Admin reject withdrawal request and restore balance
 * @access SUPER_ADMIN, ADMIN
 */
withdrawalRouter.patch(
  '/admin/:id/reject',
  adminOnly,
  rejectWithdrawalValidator, validate,
  ctrl.rejectWithdrawal.bind(ctrl),
);

/**
 * @route POST /api/v1/withdrawals
 * @desc  FR30 — Submit a withdrawal request
 * @access Influencers (all tiers)
 */
withdrawalRouter.post(
  '/',
  influencerOnly,
  createWithdrawalValidator, validate,
  ctrl.createWithdrawal.bind(ctrl),
);

/**
 * @route GET /api/v1/withdrawals
 * @desc  FR31 — Withdrawal history
 * @access Influencers
 */
withdrawalRouter.get(
  '/',
  influencerOnly,
  withdrawalHistoryValidator, validate,
  ctrl.getWithdrawalHistory.bind(ctrl),
);

/**
 * @route GET /api/v1/withdrawals/:id
 * @desc  FR31 — Get single withdrawal (includes decrypted bank details)
 * @access Influencers (own only)
 */
withdrawalRouter.get(
  '/:id',
  influencerOnly,
  withdrawalIdParamValidator, validate,
  ctrl.getWithdrawalById.bind(ctrl),
);

/**
 * @route PATCH /api/v1/withdrawals/:id/cancel
 * @desc  FR30 — Cancel a pending withdrawal and restore balance
 * @access Influencers (own only)
 */
withdrawalRouter.patch(
  '/:id/cancel',
  influencerOnly,
  withdrawalIdParamValidator, validate,
  ctrl.cancelWithdrawal.bind(ctrl),
);
