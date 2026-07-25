// ─────────────────────────────────────────────────────────────────────────────
// Chat & Collaboration Service — Module 6 (FR32–FR37)
// ─────────────────────────────────────────────────────────────────────────────

import { MessageType, MeetingPlatform, MeetingStatus, ContentSubmissionStatus } from '@prisma/client';
import { chatRepository as repo } from '../repositories/chat.repository';
import { ApiError } from '../../../common/errors/ApiError';
import { PaginatedResult, PaginationMeta } from '../../../common/types';
import logger from '../../../common/logger/logger';
import type {
  SendCommunityMessageDto, ListCommunityMessagesQueryDto,
  StartOrSendDirectMessageDto, ListDirectConversationsQueryDto,
  UploadVoiceMessageDto, UploadCommunityVideoDto, ListCommunityVideosQueryDto,
  CreateMeetingLinkDto, ListMeetingLinksQueryDto,
  UploadCampaignContentDto, ListCampaignContentQueryDto, ReviewCampaignContentDto,
} from '../dto/chat.dto';

function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export class ChatService {

  // ───────────────────────────────────────────────────────────────────────────
  // Helper: Verify Direct Message Permission (FR33)
  // Allowed pairs: Leader ↔ Member, Agent ↔ Business, Admin ↔ Any User
  // ───────────────────────────────────────────────────────────────────────────
  private async assertDirectMessagingAllowed(senderId: string, senderRole: string, recipientId: string, recipientRole: string): Promise<void> {
    if (senderId === recipientId) {
      throw ApiError.badRequest('Cannot send a direct message to yourself');
    }

    // 1. Admin ↔ Any User
    if (['SUPER_ADMIN', 'ADMIN'].includes(senderRole) || ['SUPER_ADMIN', 'ADMIN'].includes(recipientRole)) {
      return;
    }

    // 2. Agent ↔ Business
    if (
      (senderRole === 'AGENT' && recipientRole === 'BUSINESS') ||
      (senderRole === 'BUSINESS' && recipientRole === 'AGENT')
    ) {
      return;
    }

    // 3. Leader ↔ Member
    const isSenderLeaderRecipientMember = await this.checkLeaderMemberPair(senderId, recipientId);
    if (isSenderLeaderRecipientMember) return;

    const isRecipientLeaderSenderMember = await this.checkLeaderMemberPair(recipientId, senderId);
    if (isRecipientLeaderSenderMember) return;

    throw ApiError.forbidden(
      'Direct messaging is restricted to Leader-Member, Agent-Business, or Admin-User conversations.'
    );
  }

  private async checkLeaderMemberPair(leaderId: string, memberId: string): Promise<boolean> {
    const user = await repo.findUserById(leaderId);
    if (!user) return false;

    const communityMember = await repo.findCommunityMember(leaderId, memberId);
    if (communityMember) return true;

    return false;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // FR32 — Real-Time Community Chat
  // ───────────────────────────────────────────────────────────────────────────

  async sendCommunityMessage(
    communityId: string,
    dto: SendCommunityMessageDto,
    senderId: string,
    senderRole: string,
    ctx: { ip: string; userAgent: string },
  ) {
    const community = await repo.findCommunityById(communityId);
    if (!community) throw ApiError.notFound('Community not found');
    if (community.status === 'INACTIVE') throw ApiError.badRequest('Community is inactive');

    const isLeader = community.communityLeaderId === senderId;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(senderRole);
    const member = await repo.findCommunityMember(communityId, senderId);

    if (!isAdmin && !isLeader && !member) {
      throw ApiError.forbidden('Only active community members or leaders can send messages in this chat');
    }

    let conversation = await repo.findCommunityConversation(communityId);
    if (!conversation) {
      conversation = await repo.createCommunityConversation(communityId, `Chat - ${community.title}`);
    }

    const conversationId = conversation.id;

    const participant = await repo.findParticipant(conversationId, senderId);
    if (!participant) {
      await repo.addParticipant(conversationId, senderId);
    }

    const message = await repo.createMessage({
      conversationId,
      senderId,
      content: dto.content,
      messageType: dto.messageType || MessageType.TEXT,
    });

    await repo.markMessageRead(message.id, senderId);

    await repo.createAuditLog({
      userId: senderId,
      action: 'MESSAGE_SENT',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata: { messageId: message.id, communityId, conversationId },
    });

    return message;
  }

  async listCommunityMessages(
    communityId: string,
    query: ListCommunityMessagesQueryDto,
    requesterId: string,
    requesterRole: string,
  ): Promise<PaginatedResult<any>> {
    const community = await repo.findCommunityById(communityId);
    if (!community) throw ApiError.notFound('Community not found');

    const isLeader = community.communityLeaderId === requesterId;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(requesterRole);
    const member = await repo.findCommunityMember(communityId, requesterId);

    if (!isAdmin && !isLeader && !member) {
      throw ApiError.forbidden('Access restricted to community members and leaders');
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const conversation = await repo.findCommunityConversation(communityId);
    if (!conversation) {
      return { data: [], meta: buildPaginationMeta(page, limit, 0) };
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      repo.listConversationMessages(conversation.id, skip, limit),
      repo.countConversationMessages(conversation.id),
    ]);

    return {
      data: messages,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // FR33 — Direct Messaging
  // ───────────────────────────────────────────────────────────────────────────

  async startOrSendDirectMessage(
    dto: StartOrSendDirectMessageDto,
    senderId: string,
    senderRole: string,
    ctx: { ip: string; userAgent: string },
  ) {
    const recipient = await repo.findUserById(dto.recipientId);
    if (!recipient) throw ApiError.notFound('Recipient user not found');
    if (recipient.status === 'SUSPENDED' || recipient.status === 'INACTIVE') {
      throw ApiError.badRequest(`Cannot message a ${recipient.status.toLowerCase()} user`);
    }

    await this.assertDirectMessagingAllowed(senderId, senderRole, recipient.id, recipient.role);

    let conversation = await repo.findDirectConversationBetweenUsers(senderId, recipient.id);
    if (!conversation) {
      conversation = await repo.createDirectConversation(senderId, recipient.id);
    }

    const message = await repo.createMessage({
      conversationId: conversation.id,
      senderId,
      content: dto.content,
      messageType: MessageType.TEXT,
    });

    await repo.markMessageRead(message.id, senderId);

    await Promise.all([
      repo.createAuditLog({
        userId: senderId,
        action: 'MESSAGE_SENT',
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        metadata: { messageId: message.id, recipientId: recipient.id, conversationId: conversation.id },
      }),
      repo.createNotification({
        userId: recipient.id,
        type: 'NEW_MESSAGE',
        title: 'New Direct Message',
        message: `You received a message from ${senderId}`,
        metadata: { conversationId: conversation.id, senderId, messageId: message.id },
      }),
    ]);

    return message;
  }

  async listDirectConversations(
    query: ListDirectConversationsQueryDto,
    userId: string,
  ): Promise<PaginatedResult<any>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      repo.listUserDirectConversations(userId, skip, limit),
      repo.countUserDirectConversations(userId),
    ]);

    return {
      data: conversations,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async markMessageRead(messageId: string, userId: string) {
    const message = await repo.findMessageById(messageId);
    if (!message) throw ApiError.notFound('Message not found');

    const participant = await repo.findParticipant(message.conversationId, userId);
    if (!participant) {
      throw ApiError.forbidden('You are not a participant in this conversation');
    }

    await repo.markMessageRead(messageId, userId);
    await repo.updateLastReadAt(message.conversationId, userId);

    return { messageId, userId, readAt: new Date() };
  }

  async softDeleteMessage(messageId: string, userId: string, userRole: string, ctx: { ip: string; userAgent: string }) {
    const message = await repo.findMessageById(messageId);
    if (!message) throw ApiError.notFound('Message not found');

    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);
    if (message.senderId !== userId && !isAdmin) {
      throw ApiError.forbidden('Only the message sender or an administrator can delete this message');
    }

    const deleted = await repo.softDeleteMessage(messageId);

    await repo.createAuditLog({
      userId,
      action: 'MESSAGE_DELETED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata: { messageId, conversationId: message.conversationId },
    });

    return deleted;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // FR34 — Voice Messages
  // ───────────────────────────────────────────────────────────────────────────

  async uploadVoiceMessage(
    dto: UploadVoiceMessageDto,
    senderId: string,
    ctx: { ip: string; userAgent: string },
  ) {
    const conversation = await repo.findConversationById(dto.conversationId);
    if (!conversation) throw ApiError.notFound('Conversation not found');

    const participant = await repo.findParticipant(dto.conversationId, senderId);
    if (!participant) {
      throw ApiError.forbidden('You must be a participant in the conversation to send a voice message');
    }

    const message = await repo.createMessage({
      conversationId: dto.conversationId,
      senderId,
      content: '[Voice Message]',
      messageType: MessageType.VOICE,
    });

    const voiceMsg = await repo.createVoiceMessage({
      messageId: message.id,
      fileUrl: dto.fileUrl,
      fileSize: dto.fileSize,
      duration: dto.duration,
      mimeType: dto.mimeType,
    });

    await repo.markMessageRead(message.id, senderId);

    await repo.createAuditLog({
      userId: senderId,
      action: 'VOICE_MESSAGE_CREATED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata: { messageId: message.id, voiceMessageId: voiceMsg.id, conversationId: dto.conversationId },
    });

    return { ...message, voiceMessage: voiceMsg };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // FR35 — Community Video Uploads
  // ───────────────────────────────────────────────────────────────────────────

  async uploadCommunityVideo(
    dto: UploadCommunityVideoDto,
    uploadedById: string,
    userRole: string,
    ctx: { ip: string; userAgent: string },
  ) {
    const community = await repo.findCommunityById(dto.communityId);
    if (!community) throw ApiError.notFound('Community not found');
    if (community.status === 'INACTIVE') throw ApiError.badRequest('Community is inactive');

    const isLeader = community.communityLeaderId === uploadedById;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);

    if (!isAdmin && !isLeader) {
      throw ApiError.forbidden('Only Community Leaders or Administrators can upload community videos');
    }

    const video = await repo.createCommunityVideo({
      communityId: dto.communityId,
      uploadedById,
      title: dto.title,
      description: dto.description,
      videoUrl: dto.videoUrl,
      duration: dto.duration,
      fileSize: dto.fileSize,
      mimeType: dto.mimeType,
    });

    await repo.createAuditLog({
      userId: uploadedById,
      action: 'COMMUNITY_VIDEO_UPLOADED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata: { videoId: video.id, communityId: dto.communityId },
    });

    return video;
  }

  async listCommunityVideos(
    query: ListCommunityVideosQueryDto,
    requesterId: string,
    requesterRole: string,
  ): Promise<PaginatedResult<any>> {
    const community = await repo.findCommunityById(query.communityId);
    if (!community) throw ApiError.notFound('Community not found');

    const isLeader = community.communityLeaderId === requesterId;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(requesterRole);
    const member = await repo.findCommunityMember(query.communityId, requesterId);

    if (!isAdmin && !isLeader && !member) {
      throw ApiError.forbidden('Access restricted to community members and leaders');
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [videos, total] = await Promise.all([
      repo.listCommunityVideos(query.communityId, skip, limit),
      repo.countCommunityVideos(query.communityId),
    ]);

    return {
      data: videos,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // FR36 — Meeting Link Sharing
  // ───────────────────────────────────────────────────────────────────────────

  async createMeetingLink(
    dto: CreateMeetingLinkDto,
    createdById: string,
    userRole: string,
    ctx: { ip: string; userAgent: string },
  ) {
    const community = await repo.findCommunityById(dto.communityId);
    if (!community) throw ApiError.notFound('Community not found');
    if (community.status === 'INACTIVE') throw ApiError.badRequest('Community is inactive');

    const isLeader = community.communityLeaderId === createdById;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);

    if (!isAdmin && !isLeader) {
      throw ApiError.forbidden('Only Community Leaders or Administrators can share meeting links');
    }

    const meeting = await repo.createMeetingLink({
      communityId: dto.communityId,
      createdById,
      title: dto.title,
      description: dto.description,
      meetingUrl: dto.meetingUrl,
      platform: dto.platform,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    });

    await repo.createAuditLog({
      userId: createdById,
      action: 'MEETING_LINK_CREATED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata: { meetingId: meeting.id, communityId: dto.communityId },
    });

    return meeting;
  }

  async listMeetingLinks(
    query: ListMeetingLinksQueryDto,
    requesterId: string,
    requesterRole: string,
  ): Promise<PaginatedResult<any>> {
    const community = await repo.findCommunityById(query.communityId);
    if (!community) throw ApiError.notFound('Community not found');

    const isLeader = community.communityLeaderId === requesterId;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(requesterRole);
    const member = await repo.findCommunityMember(query.communityId, requesterId);

    if (!isAdmin && !isLeader && !member) {
      throw ApiError.forbidden('Access restricted to community members and leaders');
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [meetings, total] = await Promise.all([
      repo.listMeetingLinks(query.communityId, query.status, skip, limit),
      repo.countMeetingLinks(query.communityId, query.status),
    ]);

    return {
      data: meetings,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // FR37 — Campaign Content Upload & Review
  // ───────────────────────────────────────────────────────────────────────────

  async uploadCampaignContent(
    dto: UploadCampaignContentDto,
    influencerId: string,
    userRole: string,
    ctx: { ip: string; userAgent: string },
  ) {
    const campaign = await repo.findCampaignById(dto.campaignId);
    if (!campaign) throw ApiError.notFound('Campaign not found');

    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);
    if (userRole !== 'INFLUENCER' && !isAdmin) {
      throw ApiError.forbidden('Only Influencers can submit campaign content');
    }

    const content = await repo.createCampaignContent({
      campaignId: dto.campaignId,
      influencerId,
      title: dto.title,
      description: dto.description,
      videoUrl: dto.videoUrl,
      duration: dto.duration,
      fileSize: dto.fileSize,
      mimeType: dto.mimeType,
    });

    await Promise.all([
      repo.createAuditLog({
        userId: influencerId,
        action: 'CAMPAIGN_CONTENT_SUBMITTED',
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        metadata: { contentId: content.id, campaignId: dto.campaignId },
      }),
      repo.createNotification({
        userId: campaign.ownerId,
        type: 'NEW_CAMPAIGN_CONTENT',
        title: 'New Campaign Content Submission',
        message: `Content submitted for campaign "${campaign.title}"`,
        metadata: { contentId: content.id, campaignId: dto.campaignId },
      }),
    ]);

    return content;
  }

  async listCampaignContent(
    query: ListCampaignContentQueryDto,
    requesterId: string,
    requesterRole: string,
  ): Promise<PaginatedResult<any>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.campaignId) where.campaignId = query.campaignId;
    if (query.status) where.status = query.status;

    if (requesterRole === 'BUSINESS') {
      where.campaign = { ownerId: requesterId };
    } else if (requesterRole === 'INFLUENCER') {
      where.influencerId = requesterId;
    }

    const [contents, total] = await Promise.all([
      repo.listCampaignContent(where, skip, limit),
      repo.countCampaignContent(where),
    ]);

    return {
      data: contents,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async reviewCampaignContent(
    contentId: string,
    dto: ReviewCampaignContentDto,
    reviewerId: string,
    reviewerRole: string,
    ctx: { ip: string; userAgent: string },
  ) {
    const content = await repo.findCampaignContentById(contentId);
    if (!content) throw ApiError.notFound('Campaign content not found');

    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(reviewerRole);
    const isOwner = content.campaign.ownerId === reviewerId;

    if (!isAdmin && !isOwner) {
      throw ApiError.forbidden('Only the campaign owner or an administrator can review submitted content');
    }

    const [updatedContent, review] = await Promise.all([
      repo.updateCampaignContentStatus(contentId, dto.status),
      repo.createCampaignContentReview({
        contentId,
        reviewerId,
        status: dto.status,
        feedback: dto.feedback,
      }),
    ]);

    await Promise.all([
      repo.createAuditLog({
        userId: reviewerId,
        action: 'CAMPAIGN_CONTENT_REVIEWED',
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        metadata: { contentId, status: dto.status, campaignId: content.campaignId },
      }),
      repo.createNotification({
        userId: content.influencerId,
        type: 'CAMPAIGN_CONTENT_REVIEWED',
        title: `Campaign Content ${dto.status}`,
        message: `Your content submission for "${content.campaign.title}" was ${dto.status.toLowerCase()}`,
        metadata: { contentId, status: dto.status, feedback: dto.feedback },
      }),
    ]);

    return { ...updatedContent, latestReview: review };
  }
}

export const chatService = new ChatService();
