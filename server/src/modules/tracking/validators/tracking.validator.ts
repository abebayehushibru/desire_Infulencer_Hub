// ─────────────────────────────────────────────────────────────────────────────
// Tracking & Earnings Validators — FR24–FR31
// ─────────────────────────────────────────────────────────────────────────────

import { body, query, param } from 'express-validator';

const uuidParam = (name: string) =>
  param(name).isUUID(4).withMessage(`${name} must be a valid UUID`);

const EARNING_STATUSES   = ['PENDING', 'AVAILABLE', 'WITHDRAWN', 'CANCELLED'];
const WITHDRAWAL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'PROCESSED'];

// ── FR24 — Track click ────────────────────────────────────────────────────────
export const trackClickValidator = [
  body('code').trim().notEmpty().withMessage('code is required')
    .isLength({ min: 8, max: 128 }).withMessage('code must be 8–128 characters'),
];

// ── FR24 — Track conversion ───────────────────────────────────────────────────
export const trackConversionValidator = [
  body('code').trim().notEmpty().withMessage('code is required')
    .isLength({ min: 8, max: 128 }).withMessage('code must be 8–128 characters'),
];

// ── FR25 — Referral code ──────────────────────────────────────────────────────
export const trackReferralValidator = [
  body('code').trim().notEmpty().withMessage('code is required')
    .isLength({ min: 8, max: 32 }).withMessage('referral code must be 8–32 characters')
    .matches(/^[A-Z0-9]+$/).withMessage('referral code must be uppercase alphanumeric'),
];

// ── FR26 — Earnings history query ─────────────────────────────────────────────
export const earningsHistoryValidator = [
  query('campaignId').optional().isUUID(4).withMessage('campaignId must be a valid UUID'),
  query('status').optional().isIn(EARNING_STATUSES).withMessage(`status must be one of: ${EARNING_STATUSES.join(', ')}`),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO 8601 date'),
];

// ── FR26 — Earnings by campaign param ────────────────────────────────────────
export const campaignIdParamValidator = [ uuidParam('campaignId') ];

// ── FR28 — Business analytics query ──────────────────────────────────────────
export const businessAnalyticsValidator = [
  query('campaignId').optional().isUUID(4).withMessage('campaignId must be a valid UUID'),
  query('communityId').optional().isUUID(4).withMessage('communityId must be a valid UUID'),
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO 8601 date'),
  query('groupBy').optional().isIn(['day', 'week', 'month']).withMessage('groupBy must be day, week, or month'),
];

// ── FR29 — Member performance params ─────────────────────────────────────────
export const communityIdParamValidator = [ uuidParam('communityId') ];

export const memberStatsParamsValidator = [
  uuidParam('communityId'),
  uuidParam('memberId'),
];

export const memberPerformanceQueryValidator = [
  uuidParam('communityId'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  query('sortBy').optional()
    .isIn(['clicks', 'conversions', 'earnings', 'joinedAt'])
    .withMessage('sortBy must be clicks, conversions, earnings, or joinedAt'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
];

// ── FR30 — Withdrawal request ─────────────────────────────────────────────────
export const createWithdrawalValidator = [
  body('amount')
    .notEmpty().withMessage('amount is required')
    .isFloat({ min: 0.01 }).withMessage('amount must be greater than 0'),
  body('bankDetails').notEmpty().withMessage('bankDetails is required')
    .isObject().withMessage('bankDetails must be an object'),
  body('bankDetails.accountName').trim().notEmpty().withMessage('bankDetails.accountName is required')
    .isLength({ min: 2, max: 255 }).withMessage('accountName must be 2–255 characters'),
  body('bankDetails.accountNumber').trim().notEmpty().withMessage('bankDetails.accountNumber is required')
    .isLength({ min: 5, max: 50 }).withMessage('accountNumber must be 5–50 characters'),
  body('bankDetails.bankName').trim().notEmpty().withMessage('bankDetails.bankName is required')
    .isLength({ min: 2, max: 255 }).withMessage('bankName must be 2–255 characters'),
  body('bankDetails.country').trim().notEmpty().withMessage('bankDetails.country is required')
    .isLength({ min: 2, max: 100 }).withMessage('country must be 2–100 characters'),
  body('bankDetails.bankCode').optional().trim().isLength({ max: 50 }),
  body('bankDetails.swiftCode').optional().trim().isLength({ max: 20 }),
  body('bankDetails.routingNumber').optional().trim().isLength({ max: 20 }),
];

// ── FR30/FR31 — Withdrawal param ──────────────────────────────────────────────
export const withdrawalIdParamValidator = [ uuidParam('id') ];

// ── FR31 — Withdrawal history query ──────────────────────────────────────────
export const withdrawalHistoryValidator = [
  query('status').optional().isIn(WITHDRAWAL_STATUSES).withMessage(`status must be one of: ${WITHDRAWAL_STATUSES.join(', ')}`),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
];
