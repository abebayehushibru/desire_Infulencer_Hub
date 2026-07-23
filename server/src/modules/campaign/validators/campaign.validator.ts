// ─────────────────────────────────────────────────────────────────────────────
// Campaign Validators — FR16–FR23
// ─────────────────────────────────────────────────────────────────────────────

import { body, query, param } from 'express-validator';

const uuidParam = (name: string) =>
  param(name).isUUID(4).withMessage(`${name} must be a valid UUID`);

const CAMPAIGN_TYPES    = ['SALES', 'AWARENESS', 'GROWTH'];
const CAMPAIGN_STATUSES = ['DRAFT', 'PENDING_ADMIN_APPROVAL', 'PENDING_LEADER_APPROVAL', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED'];
const TRACKING_METHODS  = ['UNIQUE_LINK', 'REFERRAL_CODE', 'MANUAL'];

// ── FR16 — Create campaign ────────────────────────────────────────────────────
export const createCampaignValidator = [
  body('title').trim().notEmpty().withMessage('title is required')
    .isLength({ min: 3, max: 255 }).withMessage('title must be 3–255 characters'),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('type').notEmpty().withMessage('type is required')
    .isIn(CAMPAIGN_TYPES).withMessage(`type must be one of: ${CAMPAIGN_TYPES.join(', ')}`),
  body('budget')
    .notEmpty().withMessage('budget is required')
    .isFloat({ min: 0.01 }).withMessage('budget must be greater than 0'),
  body('targetPlatform').trim().notEmpty().withMessage('targetPlatform is required')
    .isLength({ min: 2, max: 100 }).withMessage('targetPlatform must be 2–100 characters'),
  body('startDate').notEmpty().withMessage('startDate is required')
    .isISO8601().withMessage('startDate must be a valid ISO 8601 date'),
  body('endDate').notEmpty().withMessage('endDate is required')
    .isISO8601().withMessage('endDate must be a valid ISO 8601 date'),
  // FR17 — SALES-only fields (validated in service for type-dependency)
  body('payoutPerConversion').optional()
    .isFloat({ min: 0.01 }).withMessage('payoutPerConversion must be greater than 0'),
  body('trackingMethod').optional()
    .isIn(TRACKING_METHODS).withMessage(`trackingMethod must be one of: ${TRACKING_METHODS.join(', ')}`),
];

// ── FR16 — Update campaign ────────────────────────────────────────────────────
export const updateCampaignValidator = [
  uuidParam('id'),
  body('title').optional().trim().isLength({ min: 3, max: 255 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 5000 }),
  body('type').optional().isIn(CAMPAIGN_TYPES),
  body('budget').optional().isFloat({ min: 0.01 }).withMessage('budget must be greater than 0'),
  body('targetPlatform').optional().trim().isLength({ min: 2, max: 100 }),
  body('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO 8601 date'),
  body('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO 8601 date'),
  body('payoutPerConversion').optional({ nullable: true })
    .isFloat({ min: 0.01 }).withMessage('payoutPerConversion must be greater than 0'),
  body('trackingMethod').optional({ nullable: true }).isIn(TRACKING_METHODS),
];

// ── Campaign ID param ─────────────────────────────────────────────────────────
export const campaignIdParamValidator = [ uuidParam('id') ];

// ── FR16 — List campaigns query ───────────────────────────────────────────────
export const listCampaignsValidator = [
  query('status').optional().isIn(CAMPAIGN_STATUSES).withMessage('Invalid status'),
  query('type').optional().isIn(CAMPAIGN_TYPES).withMessage('Invalid type'),
  query('communityId').optional().isUUID(4).withMessage('communityId must be a valid UUID'),
  query('search').optional().trim().isLength({ max: 100 }),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  query('sortBy').optional()
    .isIn(['title', 'createdAt', 'startDate', 'budget', 'status'])
    .withMessage('Invalid sortBy'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
];

// ── FR18 — Submit / assign community ─────────────────────────────────────────
export const submitCampaignValidator = [
  uuidParam('id'),
  body('communityId').notEmpty().withMessage('communityId is required')
    .isUUID(4).withMessage('communityId must be a valid UUID'),
];

// ── FR19 — Admin review ───────────────────────────────────────────────────────
export const adminReviewValidator = [
  uuidParam('id'),
  body('action').notEmpty().withMessage('action is required')
    .isIn(['approve', 'reject']).withMessage('action must be approve or reject'),
  body('reason').if(body('action').equals('reject'))
    .notEmpty().withMessage('reason is required when rejecting')
    .isLength({ min: 10, max: 1000 }).withMessage('reason must be 10–1000 characters'),
  body('reason').if(body('action').equals('approve'))
    .optional().trim().isLength({ max: 500 }),
];

// ── FR20 — Leader review ──────────────────────────────────────────────────────
export const leaderReviewValidator = [
  uuidParam('id'),
  body('action').notEmpty().withMessage('action is required')
    .isIn(['accept', 'reject']).withMessage('action must be accept or reject'),
  body('reason').if(body('action').equals('reject'))
    .notEmpty().withMessage('reason is required when rejecting')
    .isLength({ min: 10, max: 1000 }).withMessage('reason must be 10–1000 characters'),
  body('reason').if(body('action').equals('accept'))
    .optional().trim().isLength({ max: 500 }),
];

// ── FR23 — Conversion validators ──────────────────────────────────────────────
export const createConversionValidator = [
  uuidParam('id'),
  body('influencerId').notEmpty().withMessage('influencerId is required')
    .isUUID(4).withMessage('influencerId must be a valid UUID'),
  body('amount').notEmpty().withMessage('amount is required')
    .isFloat({ min: 0.01 }).withMessage('amount must be greater than 0'),
  body('note').optional().trim().isLength({ max: 500 }),
  body('convertedAt').notEmpty().withMessage('convertedAt is required')
    .isISO8601().withMessage('convertedAt must be a valid ISO 8601 date'),
];

export const updateConversionValidator = [
  uuidParam('id'),
  uuidParam('conversionId'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('amount must be greater than 0'),
  body('note').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('convertedAt').optional().isISO8601().withMessage('convertedAt must be a valid ISO 8601 date'),
];

export const conversionParamValidator = [
  uuidParam('id'),
  uuidParam('conversionId'),
];
