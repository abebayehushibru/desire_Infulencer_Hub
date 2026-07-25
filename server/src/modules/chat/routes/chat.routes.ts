// ─────────────────────────────────────────────────────────────────────────────
// Chat & Collaboration Routes — Module 6 (FR32–FR37)
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { chatController as ctrl } from '../controllers/chat.controller';
import { authenticate } from '../../../middleware/authenticate';
import { validate } from '../../../middleware/validate';
import {
  sendCommunityMessageValidator,
  listCommunityMessagesValidator,
  startOrSendDirectMessageValidator,
  listDirectConversationsValidator,
  messageIdParamValidator,
  uploadVoiceMessageValidator,
  uploadCommunityVideoValidator,
  listCommunityVideosValidator,
  createMeetingLinkValidator,
  listMeetingLinksValidator,
  uploadCampaignContentValidator,
  listCampaignContentValidator,
  reviewCampaignContentValidator,
} from '../validators/chat.validator';

export const chatRouter = Router();
export const communityCollabRouter = Router();
export const campaignContentRouter = Router();

// All endpoints require authentication
chatRouter.use(authenticate);
communityCollabRouter.use(authenticate);
campaignContentRouter.use(authenticate);

// ─────────────────────────────────────────────────────────────────────────────
// /api/v1/chat
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route GET /api/v1/chat/communities/:communityId/messages
 * @desc  FR32 — List community chat messages
 */
chatRouter.get(
  '/communities/:communityId/messages',
  listCommunityMessagesValidator, validate,
  ctrl.getCommunityMessages.bind(ctrl),
);

/**
 * @route POST /api/v1/chat/communities/:communityId/messages
 * @desc  FR32 — Send message in community chat
 */
chatRouter.post(
  '/communities/:communityId/messages',
  sendCommunityMessageValidator, validate,
  ctrl.sendCommunityMessage.bind(ctrl),
);

/**
 * @route GET /api/v1/chat/direct
 * @desc  FR33 — List direct conversations
 */
chatRouter.get(
  '/direct',
  listDirectConversationsValidator, validate,
  ctrl.getDirectConversations.bind(ctrl),
);

/**
 * @route POST /api/v1/chat/direct
 * @desc  FR33 — Start or send a direct message
 */
chatRouter.post(
  '/direct',
  startOrSendDirectMessageValidator, validate,
  ctrl.startOrSendDirectMessage.bind(ctrl),
);

/**
 * @route PATCH /api/v1/chat/messages/:id/read
 * @desc  FR32/FR33 — Mark message as read
 */
chatRouter.patch(
  '/messages/:id/read',
  messageIdParamValidator, validate,
  ctrl.markMessageRead.bind(ctrl),
);

/**
 * @route DELETE /api/v1/chat/messages/:id
 * @desc  FR32 — Soft delete a message
 */
chatRouter.delete(
  '/messages/:id',
  messageIdParamValidator, validate,
  ctrl.softDeleteMessage.bind(ctrl),
);

/**
 * @route POST /api/v1/chat/voice
 * @desc  FR34 — Upload voice message metadata
 */
chatRouter.post(
  '/voice',
  uploadVoiceMessageValidator, validate,
  ctrl.uploadVoiceMessage.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// /api/v1/community (videos & meetings)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route POST /api/v1/community/videos
 * @desc  FR35 — Community Leader upload video
 */
communityCollabRouter.post(
  '/videos',
  uploadCommunityVideoValidator, validate,
  ctrl.uploadCommunityVideo.bind(ctrl),
);

/**
 * @route GET /api/v1/community/videos
 * @desc  FR35 — List community videos
 */
communityCollabRouter.get(
  '/videos',
  listCommunityVideosValidator, validate,
  ctrl.getCommunityVideos.bind(ctrl),
);

/**
 * @route POST /api/v1/community/meetings
 * @desc  FR36 — Community Leader share meeting link
 */
communityCollabRouter.post(
  '/meetings',
  createMeetingLinkValidator, validate,
  ctrl.createMeetingLink.bind(ctrl),
);

/**
 * @route GET /api/v1/community/meetings
 * @desc  FR36 — List meeting links
 */
communityCollabRouter.get(
  '/meetings',
  listMeetingLinksValidator, validate,
  ctrl.getMeetingLinks.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// /api/v1/campaign-content
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route POST /api/v1/campaign-content
 * @desc  FR37 — Influencer upload campaign content
 */
campaignContentRouter.post(
  '/',
  uploadCampaignContentValidator, validate,
  ctrl.uploadCampaignContent.bind(ctrl),
);

/**
 * @route GET /api/v1/campaign-content
 * @desc  FR37 — List campaign content submissions
 */
campaignContentRouter.get(
  '/',
  listCampaignContentValidator, validate,
  ctrl.getCampaignContent.bind(ctrl),
);

/**
 * @route PATCH /api/v1/campaign-content/:id/review
 * @desc  FR37 — Business Owner review campaign content
 */
campaignContentRouter.patch(
  '/:id/review',
  reviewCampaignContentValidator, validate,
  ctrl.reviewCampaignContent.bind(ctrl),
);
