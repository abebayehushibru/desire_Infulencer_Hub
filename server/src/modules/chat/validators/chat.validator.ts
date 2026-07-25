// ─────────────────────────────────────────────────────────────────────────────
// Chat & Collaboration Validators — Module 6 (FR32–FR37)
// ─────────────────────────────────────────────────────────────────────────────

import { body, param, query } from 'express-validator';

const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
  'audio/m4a',
  'audio/ogg',
  'audio/x-m4a',
  'audio/aac',
];

const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/mkv',
];

export const communityIdParamValidator = [
  param('communityId')
    .isUUID().withMessage('communityId must be a valid UUID'),
];

export const messageIdParamValidator = [
  param('id')
    .isUUID().withMessage('messageId must be a valid UUID'),
];

export const contentIdParamValidator = [
  param('id')
    .isUUID().withMessage('contentId must be a valid UUID'),
];

export const sendCommunityMessageValidator = [
  ...communityIdParamValidator,
  body('content')
    .optional()
    .isString().withMessage('content must be a string')
    .trim()
    .isLength({ max: 5000 }).withMessage('content cannot exceed 5000 characters'),
  body('messageType')
    .optional()
    .isIn(['TEXT', 'VOICE', 'VIDEO', 'FILE', 'SYSTEM'])
    .withMessage('Invalid messageType'),
  body().custom((b) => {
    if (!b.content && !b.messageType) {
      throw new Error('Message content or messageType is required');
    }
    return true;
  }),
];

export const listCommunityMessagesValidator = [
  ...communityIdParamValidator,
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

export const startOrSendDirectMessageValidator = [
  body('recipientId')
    .notEmpty().withMessage('recipientId is required')
    .isUUID().withMessage('recipientId must be a valid UUID'),
  body('content')
    .notEmpty().withMessage('content is required')
    .isString().withMessage('content must be a string')
    .trim()
    .isLength({ min: 1, max: 5000 }).withMessage('content must be between 1 and 5000 characters'),
];

export const listDirectConversationsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

export const uploadVoiceMessageValidator = [
  body('conversationId')
    .notEmpty().withMessage('conversationId is required')
    .isUUID().withMessage('conversationId must be a valid UUID'),
  body('fileUrl')
    .notEmpty().withMessage('fileUrl is required')
    .isURL().withMessage('fileUrl must be a valid URL'),
  body('fileSize')
    .notEmpty().withMessage('fileSize is required')
    .isInt({ min: 1, max: 10 * 1024 * 1024 }).withMessage('fileSize must be between 1 byte and 10MB'),
  body('duration')
    .notEmpty().withMessage('duration is required')
    .isInt({ min: 1, max: 600 }).withMessage('duration must be between 1 and 600 seconds'),
  body('mimeType')
    .notEmpty().withMessage('mimeType is required')
    .custom((val) => {
      if (!ALLOWED_AUDIO_MIME_TYPES.includes(val)) {
        throw new Error(`mimeType must be one of: ${ALLOWED_AUDIO_MIME_TYPES.join(', ')}`);
      }
      return true;
    }),
];

export const uploadCommunityVideoValidator = [
  body('communityId')
    .notEmpty().withMessage('communityId is required')
    .isUUID().withMessage('communityId must be a valid UUID'),
  body('title')
    .notEmpty().withMessage('title is required')
    .isString().withMessage('title must be a string')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('title must be between 2 and 255 characters'),
  body('description')
    .optional()
    .isString().withMessage('description must be a string')
    .trim()
    .isLength({ max: 2000 }).withMessage('description cannot exceed 2000 characters'),
  body('videoUrl')
    .notEmpty().withMessage('videoUrl is required')
    .isURL().withMessage('videoUrl must be a valid URL'),
  body('duration')
    .notEmpty().withMessage('duration is required')
    .isInt({ min: 1, max: 7200 }).withMessage('duration must be between 1 and 7200 seconds'),
  body('fileSize')
    .notEmpty().withMessage('fileSize is required')
    .isInt({ min: 1, max: 100 * 1024 * 1024 }).withMessage('fileSize must be between 1 byte and 100MB'),
  body('mimeType')
    .notEmpty().withMessage('mimeType is required')
    .custom((val) => {
      if (!ALLOWED_VIDEO_MIME_TYPES.includes(val)) {
        throw new Error(`mimeType must be one of: ${ALLOWED_VIDEO_MIME_TYPES.join(', ')}`);
      }
      return true;
    }),
];

export const listCommunityVideosValidator = [
  query('communityId')
    .notEmpty().withMessage('communityId query param is required')
    .isUUID().withMessage('communityId must be a valid UUID'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

export const createMeetingLinkValidator = [
  body('communityId')
    .notEmpty().withMessage('communityId is required')
    .isUUID().withMessage('communityId must be a valid UUID'),
  body('title')
    .notEmpty().withMessage('title is required')
    .isString().withMessage('title must be a string')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('title must be between 2 and 255 characters'),
  body('description')
    .optional()
    .isString().withMessage('description must be a string')
    .trim()
    .isLength({ max: 2000 }).withMessage('description cannot exceed 2000 characters'),
  body('meetingUrl')
    .notEmpty().withMessage('meetingUrl is required')
    .isURL().withMessage('meetingUrl must be a valid URL'),
  body('platform')
    .optional()
    .isIn(['GOOGLE_MEET', 'ZOOM', 'TEAMS', 'OTHER'])
    .withMessage('Invalid platform'),
  body('scheduledAt')
    .optional()
    .isISO8601().withMessage('scheduledAt must be a valid ISO 8601 date string'),
];

export const listMeetingLinksValidator = [
  query('communityId')
    .notEmpty().withMessage('communityId query param is required')
    .isUUID().withMessage('communityId must be a valid UUID'),
  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('status must be ACTIVE or INACTIVE'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

export const uploadCampaignContentValidator = [
  body('campaignId')
    .notEmpty().withMessage('campaignId is required')
    .isUUID().withMessage('campaignId must be a valid UUID'),
  body('title')
    .notEmpty().withMessage('title is required')
    .isString().withMessage('title must be a string')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('title must be between 2 and 255 characters'),
  body('description')
    .optional()
    .isString().withMessage('description must be a string')
    .trim()
    .isLength({ max: 2000 }).withMessage('description cannot exceed 2000 characters'),
  body('videoUrl')
    .notEmpty().withMessage('videoUrl is required')
    .isURL().withMessage('videoUrl must be a valid URL'),
  body('duration')
    .notEmpty().withMessage('duration is required')
    .isInt({ min: 1, max: 7200 }).withMessage('duration must be between 1 and 7200 seconds'),
  body('fileSize')
    .notEmpty().withMessage('fileSize is required')
    .isInt({ min: 1, max: 100 * 1024 * 1024 }).withMessage('fileSize must be between 1 byte and 100MB'),
  body('mimeType')
    .notEmpty().withMessage('mimeType is required')
    .custom((val) => {
      if (!ALLOWED_VIDEO_MIME_TYPES.includes(val)) {
        throw new Error(`mimeType must be one of: ${ALLOWED_VIDEO_MIME_TYPES.join(', ')}`);
      }
      return true;
    }),
];

export const listCampaignContentValidator = [
  query('campaignId')
    .optional()
    .isUUID().withMessage('campaignId must be a valid UUID'),
  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED'])
    .withMessage('status must be PENDING, APPROVED, or REJECTED'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

export const reviewCampaignContentValidator = [
  ...contentIdParamValidator,
  body('status')
    .notEmpty().withMessage('status is required')
    .isIn(['APPROVED', 'REJECTED'])
    .withMessage('status must be APPROVED or REJECTED'),
  body('feedback')
    .optional()
    .isString().withMessage('feedback must be a string')
    .trim()
    .isLength({ max: 1000 }).withMessage('feedback cannot exceed 1000 characters'),
];
