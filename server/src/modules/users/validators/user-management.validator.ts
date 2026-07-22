// ─────────────────────────────────────────────────────────────────────────────
// User Management Validators — FR06–FR10
// ─────────────────────────────────────────────────────────────────────────────

import { body, query, param } from 'express-validator';

// ── Reusable ──────────────────────────────────────────────────────────────────
const uuidParam = (name: string) =>
  param(name).isUUID(4).withMessage(`${name} must be a valid UUID`);

// ── FR06 Admin create Business Owner ─────────────────────────────────────────
export const createBusinessOwnerValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 100 }).withMessage('First name must be 2–100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name contains invalid characters'),
  body('lastName').trim().notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Last name must be 2–100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name contains invalid characters'),
  body('email').trim().toLowerCase().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('businessName').optional().trim()
    .isLength({ min: 2, max: 255 }).withMessage('Business name must be 2–255 characters'),
];

// ── FR06 Update user ─────────────────────────────────────────────────────────
export const updateUserValidator = [
  uuidParam('id'),
  body('firstName').optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage('First name must be 2–100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Invalid characters in first name'),
  body('lastName').optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage('Last name must be 2–100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Invalid characters in last name'),
  body('profileImage').optional().isURL().withMessage('Profile image must be a valid URL'),
];

// ── FR06 Assign tier ─────────────────────────────────────────────────────────
export const assignTierValidator = [
  uuidParam('id'),
  body('tier').notEmpty().withMessage('Tier is required')
    .isIn(['DIAMOND', 'GOLD', 'SILVER']).withMessage('Tier must be DIAMOND, GOLD, or SILVER'),
  body('reason').optional().trim()
    .isLength({ max: 500 }).withMessage('Reason must not exceed 500 characters'),
];

// ── FR06 List users ───────────────────────────────────────────────────────────
export const listUsersValidator = [
  query('role').optional()
    .isIn(['SYSTEM_ADMIN', 'BUSINESS_OWNER', 'AGENT', 'DIAMOND_INFLUENCER', 'GOLD_INFLUENCER', 'SILVER_INFLUENCER'])
    .withMessage('Invalid role filter'),
  query('status').optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'])
    .withMessage('Invalid status filter'),
  query('search').optional().trim().isLength({ max: 100 }),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
];

// ── FR06 UUID-only route param validators ─────────────────────────────────────
export const userIdParamValidator = [ uuidParam('id') ];

// ── FR07 Business profile ─────────────────────────────────────────────────────
export const createBusinessProfileValidator = [
  body('businessName').trim().notEmpty().withMessage('Business name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Business name must be 2–255 characters'),
  body('businessType').optional().trim().isLength({ max: 100 }),
  body('registrationNumber').optional().trim().isLength({ max: 100 }),
  body('taxId').optional().trim().isLength({ max: 100 }),
  body('website').optional().trim().isURL().withMessage('Website must be a valid URL'),
  body('phone').optional().trim()
    .matches(/^\+?[\d\s\-().]{7,20}$/).withMessage('Invalid phone number format'),
  body('address').optional().trim().isLength({ max: 500 }),
  body('city').optional().trim().isLength({ max: 100 }),
  body('country').optional().trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 2000 }),
];

export const updateBusinessProfileValidator = [
  ...createBusinessProfileValidator.map((v) => {
    const cloned = v;
    return cloned;
  }),
];

// ── FR07 Upload document ─────────────────────────────────────────────────────
export const uploadDocumentValidator = [
  body('documentType').trim().notEmpty().withMessage('Document type is required')
    .isLength({ min: 2, max: 100 }).withMessage('Document type must be 2–100 characters')
    .matches(/^[a-z_]+$/).withMessage('Document type must be lowercase letters and underscores only'),
  body('fileName').trim().notEmpty().withMessage('File name is required')
    .isLength({ min: 1, max: 255 }).withMessage('File name must be 1–255 characters')
    // Reject path traversal characters in file names
    .not().matches(/[/\\<>:"|?*\x00-\x1f]/).withMessage('File name contains invalid characters'),
  body('fileSize')
    .notEmpty().withMessage('File size is required')
    .isInt({ min: 1 }).withMessage('File size must be a positive integer'),
  body('mimeType').trim().notEmpty().withMessage('MIME type is required')
    .isIn([
      'application/pdf', 'image/jpeg', 'image/png', 'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]).withMessage('MIME type not allowed. Allowed: PDF, JPEG, PNG, WEBP, DOC, DOCX'),
  body('storagePath').trim().notEmpty().withMessage('Storage path is required')
    .isLength({ min: 1, max: 1000 }).withMessage('Storage path must be 1–1000 characters')
    // Reject path traversal
    .not().matches(/\.\./).withMessage('Storage path must not contain path traversal sequences'),
];

// ── FR08 Business review ──────────────────────────────────────────────────────
export const reviewBusinessValidator = [
  uuidParam('id'),
  body('action').notEmpty().withMessage('Action is required')
    .isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('reason').if(body('action').equals('reject'))
    .notEmpty().withMessage('Rejection reason is mandatory')
    .isLength({ min: 10, max: 1000 }).withMessage('Reason must be 10–1000 characters'),
  body('reason').if(body('action').equals('approve'))
    .optional().trim().isLength({ max: 500 }),
];

// ── FR09 Influencer profile ───────────────────────────────────────────────────
export const createInfluencerProfileValidator = [
  body('bio').optional().trim().isLength({ max: 2000 }),
  body('niche').optional().trim().isLength({ max: 100 }),
  body('socialHandles').optional().isObject().withMessage('Social handles must be an object'),
  body('followerCount').optional().isInt({ min: 0 }).withMessage('Follower count must be non-negative'),
  body('engagementRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Engagement rate must be 0–100'),
];

// ── FR09 Set community leader ─────────────────────────────────────────────────
export const setCommunityLeaderValidator = [
  uuidParam('id'),
  body('value').notEmpty().withMessage('value is required')
    .isBoolean().withMessage('value must be a boolean (true or false)'),
];

// ── FR10 Agent profile ────────────────────────────────────────────────────────
export const createAgentProfileValidator = [
  body('agencyName').optional().trim().isLength({ max: 255 }),
  body('phone').optional().trim()
    .matches(/^\+?[\d\s\-().]{7,20}$/).withMessage('Invalid phone number format'),
  body('bio').optional().trim().isLength({ max: 2000 }),
];
