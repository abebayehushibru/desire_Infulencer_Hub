// ─────────────────────────────────────────────────────────────────────────────
// Campaign Routes — FR16–FR23
// ─────────────────────────────────────────────────────────────────────────────

import { Router, Request, Response, NextFunction } from 'express';
import { campaignController as ctrl } from '../controllers/campaign.controller';
import { authenticate } from '../../../middleware/authenticate';
import { authorize } from '../../../middleware/authorize';
import { validate } from '../../../middleware/validate';
import {
  createCampaignValidator,
  updateCampaignValidator,
  campaignIdParamValidator,
  listCampaignsValidator,
  submitCampaignValidator,
  adminReviewValidator,
  leaderReviewValidator,
  createConversionValidator,
  updateConversionValidator,
  conversionParamValidator,
} from '../validators/campaign.validator';

const router = Router();

// All routes require a valid JWT
router.use(authenticate);

// ── Role helpers ─────────────────────────────────────────────────────────────
const adminOnly       = (req: Request, res: Response, next: NextFunction) =>
  authorize('SUPER_ADMIN')(req as any, res, next);

const bizOnly         = (req: Request, res: Response, next: NextFunction) =>
  authorize('BUSINESS')(req as any, res, next);

const adminOrBiz      = (req: Request, res: Response, next: NextFunction) =>
  authorize('SUPER_ADMIN', 'ADMIN', 'BUSINESS')(req as any, res, next);

const adminOrLeader   = (req: Request, res: Response, next: NextFunction) =>
  authorize('SUPER_ADMIN', 'ADMIN')(req as any, res, next);

const adminOrBizOrLeader = (req: Request, res: Response, next: NextFunction) =>
  authorize('SUPER_ADMIN', 'ADMIN', 'BUSINESS', 'INFLUENCER')(req as any, res, next);

// ─────────────────────────────────────────────────────────────────────────────
// FR16 — Campaign CRUD
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/v1/campaigns — FR16: Create campaign (verified BUSINESS) */
router.post(
  '/business',
  bizOnly,
  createCampaignValidator, validate,
  ctrl.createCampaign.bind(ctrl),
);

/** GET /api/v1/campaigns — List campaigns (admin sees all, owner sees own) */
router.get(
  '/business',
  adminOrBizOrLeader,
  listCampaignsValidator, validate,
  ctrl.listCampaigns.bind(ctrl),
);

/** GET /api/v1/campaigns/:id — Get campaign */
router.get(
  '/:id',
  adminOrBizOrLeader,
  campaignIdParamValidator, validate,
  ctrl.getCampaign.bind(ctrl),
);

/** PATCH /api/v1/campaigns/:id — Update DRAFT campaign */
router.patch(
  '/:id',
  adminOrBiz,
  updateCampaignValidator, validate,
  ctrl.updateCampaign.bind(ctrl),
);

/** DELETE /api/v1/campaigns/:id — Soft-delete DRAFT campaign */
router.delete(
  '/:id',
  adminOrBiz,
  campaignIdParamValidator, validate,
  ctrl.deleteCampaign.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// FR18 + FR22 — Submit for approval
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/v1/campaigns/:id/submit — FR18: Assign community + submit */
router.post(
  '/:id/submit',
  bizOnly,
  submitCampaignValidator, validate,
  ctrl.submitCampaign.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// FR19 — Admin review
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/v1/campaigns/:id/admin-review — FR19: Admin approve/reject */
router.post(
  '/:id/admin-review',
  adminOnly,
  adminReviewValidator, validate,
  ctrl.adminReview.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// FR20 — Community Leader review
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/v1/campaigns/:id/leader-review — FR20: Leader accept/reject */
router.post(
  '/:id/leader-review',
  authorize('INFLUENCER') as any,
  leaderReviewValidator, validate,
  ctrl.leaderReview.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// FR22 — Lifecycle: pause / complete
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/v1/campaigns/:id/pause — FR22: Pause ACTIVE campaign */
router.post(
  '/:id/pause',
  adminOrBiz,
  campaignIdParamValidator, validate,
  ctrl.pauseCampaign.bind(ctrl),
);

/** POST /api/v1/campaigns/:id/complete — FR22: Complete ACTIVE/PAUSED campaign */
router.post(
  '/:id/complete',
  adminOrBiz,
  campaignIdParamValidator, validate,
  ctrl.completeCampaign.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// FR21 — Tracking resources
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/v1/campaigns/:id/tracking — FR21: Get all tracking links/codes */
router.get(
  '/:id/tracking',
  adminOrBizOrLeader,
  campaignIdParamValidator, validate,
  ctrl.getCampaignTracking.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// FR23 — Manual Conversions
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/v1/campaigns/:id/conversions — FR23: Add manual conversion */
router.post(
  '/:id/conversions',
  bizOnly,
  createConversionValidator, validate,
  ctrl.addConversion.bind(ctrl),
);

/** GET /api/v1/campaigns/:id/conversions — FR23: List conversions */
router.get(
  '/:id/conversions',
  adminOrBizOrLeader,
  campaignIdParamValidator, validate,
  ctrl.listConversions.bind(ctrl),
);

/** PATCH /api/v1/campaigns/:id/conversions/:conversionId — FR23: Update conversion */
router.patch(
  '/:id/conversions/:conversionId',
  bizOnly,
  updateConversionValidator, validate,
  ctrl.updateConversion.bind(ctrl),
);

/** DELETE /api/v1/campaigns/:id/conversions/:conversionId — FR23: Delete conversion */
router.delete(
  '/:id/conversions/:conversionId',
  bizOnly,
  conversionParamValidator, validate,
  ctrl.deleteConversion.bind(ctrl),
);

export default router;
