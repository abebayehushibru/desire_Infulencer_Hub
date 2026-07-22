// ─────────────────────────────────────────────────────────────────────────────
// Community Validators — FR11–FR15
// ─────────────────────────────────────────────────────────────────────────────

import { body, query, param } from 'express-validator';

// ── Reusable ──────────────────────────────────────────────────────────────────
const uuidParam = (name: string) =>
  param(name).isUUID(4).withMessage(`${name} must be a valid UUID`);

const optionalUUID = (field: string) =>
  body(field).optional({ nullable: true })
    .custom((v) => v === null || (typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)))
    .withMessage(`${field} must be a valid UUID or null`);

// ── FR11 Create community ─────────────────────────────────────────────────────
export const createCommunityValidator = [
  body('title')
    .trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 255 }).withMessage('Title must be 3–255 characters'),
  body('description')
    .optional().trim()
    .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
  body('rules')
    .optional().trim()
    .isLength({ max: 5000 }).withMessage('Rules must not exceed 5000 characters'),
  body('communityLeaderId')
    .optional({ nullable: true })
    .isUUID(4).withMessage('communityLeaderId must be a valid UUID'),
];

// ── FR11 Update community ─────────────────────────────────────────────────────
export const updateCommunityValidator = [
  uuidParam('id'),
  body('title')
    .optional().trim()
    .isLength({ min: 3, max: 255 }).withMessage('Title must be 3–255 characters'),
  body('description')
    .optional({ nullable: true }).trim()
    .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),
  body('rules')
    .optional({ nullable: true }).trim()
    .isLength({ max: 5000 }).withMessage('Rules must not exceed 5000 characters'),
  optionalUUID('communityLeaderId'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE'),
];

// ── FR11 UUID-only param ──────────────────────────────────────────────────────
export const communityIdParamValidator = [ uuidParam('id') ];

// ── FR11 List communities query ───────────────────────────────────────────────
export const listCommunitiesValidator = [
  query('status').optional()
    .isIn(['ACTIVE', 'INACTIVE']).withMessage('status must be ACTIVE or INACTIVE'),
  query('search').optional().trim().isLength({ max: 100 }),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  query('sortBy').optional()
    .isIn(['title', 'createdAt', 'status']).withMessage('sortBy must be title, createdAt, or status'),
  query('sortOrder').optional()
    .isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
];

// ── FR12 Commission ───────────────────────────────────────────────────────────
export const setCommissionValidator = [
  uuidParam('id'),
  body('platformFee')
    .notEmpty().withMessage('platformFee is required')
    .isFloat({ min: 0, max: 100 }).withMessage('platformFee must be between 0 and 100'),
  body('leaderPercentage')
    .notEmpty().withMessage('leaderPercentage is required')
    .isFloat({ min: 0, max: 100 }).withMessage('leaderPercentage must be between 0 and 100'),
  body('memberPercentage')
    .notEmpty().withMessage('memberPercentage is required')
    .isFloat({ min: 0, max: 100 }).withMessage('memberPercentage must be between 0 and 100'),
  body('changeReason')
    .optional().trim()
    .isLength({ max: 500 }).withMessage('changeReason must not exceed 500 characters'),
];

// ── FR13 Add member ───────────────────────────────────────────────────────────
export const addMemberValidator = [
  uuidParam('id'),
  body('userId')
    .notEmpty().withMessage('userId is required')
    .isUUID(4).withMessage('userId must be a valid UUID'),
];

// ── FR13 Remove member ────────────────────────────────────────────────────────
export const removeMemberValidator = [
  uuidParam('id'),
  uuidParam('memberId'),
];

// ── FR13 List members query ───────────────────────────────────────────────────
export const listMembersValidator = [
  uuidParam('id'),
  query('status').optional()
    .isIn(['ACTIVE', 'REMOVED']).withMessage('status must be ACTIVE or REMOVED'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
];

// ── FR14 Leaderboard query ────────────────────────────────────────────────────
export const leaderboardValidator = [
  uuidParam('id'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  query('sortBy').optional()
    .isIn(['totalConversions', 'totalEarnings', 'campaignActivity'])
    .withMessage('sortBy must be totalConversions, totalEarnings, or campaignActivity'),
  query('sortOrder').optional()
    .isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
];

// ── FR15 Rankings query ───────────────────────────────────────────────────────
export const communityRankingsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  query('sortBy').optional()
    .isIn(['totalEarnings', 'totalConversions', 'activeCampaigns', 'memberCount'])
    .withMessage('sortBy must be totalEarnings, totalConversions, activeCampaigns, or memberCount'),
  query('sortOrder').optional()
    .isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
  query('status').optional()
    .isIn(['ACTIVE', 'INACTIVE']).withMessage('status must be ACTIVE or INACTIVE'),
];
