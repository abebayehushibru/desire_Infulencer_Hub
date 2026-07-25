// ─────────────────────────────────────────────────────────────────────────────
// Chat & Collaboration Repository — Module 6 (FR32–FR37)
// ─────────────────────────────────────────────────────────────────────────────

import prisma from '../../../config/prisma';
import {
  ConversationType,
  MessageType,
  MeetingPlatform,
  MeetingStatus,
  ContentSubmissionStatus,
  Prisma,
} from '@prisma/client';

export class ChatRepository {

  // ── User, Community, Campaign Lookups ─────────────────────────────────────
  async findUserById(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { influencerProfile: true, businessProfile: true, agentProfile: true },
    });
  }

  async findCommunityById(communityId: string) {
    return prisma.community.findFirst({
      where: { id: communityId, deletedAt: null },
    });
  }

  async findCommunityMember(communityId: string, userId: string) {
    return prisma.communityMember.findFirst({
      where: { communityId, userId, status: 'ACTIVE' },
    });
  }

  async findCampaignById(campaignId: string) {
    return prisma.campaign.findFirst({
      where: { id: campaignId, deletedAt: null },
    });
  }

  // ── Conversation Operations ───────────────────────────────────────────────
  async findCommunityConversation(communityId: string) {
    return prisma.conversation.findFirst({
      where: {
        type: ConversationType.COMMUNITY,
        communityId,
        deletedAt: null,
      },
      include: {
        participants: { where: { deletedAt: null } },
      },
    });
  }

  async createCommunityConversation(communityId: string, title?: string) {
    return prisma.conversation.create({
      data: {
        type: ConversationType.COMMUNITY,
        communityId,
        title: title || `Community Chat ${communityId}`,
      },
      include: {
        participants: { where: { deletedAt: null } },
      },
    });
  }

  async findDirectConversationBetweenUsers(userId1: string, userId2: string) {
    return prisma.conversation.findFirst({
      where: {
        type: ConversationType.DIRECT,
        deletedAt: null,
        AND: [
          { participants: { some: { userId: userId1, deletedAt: null } } },
          { participants: { some: { userId: userId2, deletedAt: null } } },
        ],
      },
      include: {
        participants: {
          where: { deletedAt: null },
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true, profileImage: true } } },
        },
      },
    });
  }

  async createDirectConversation(userId1: string, userId2: string) {
    return prisma.conversation.create({
      data: {
        type: ConversationType.DIRECT,
        participants: {
          create: [
            { userId: userId1 },
            { userId: userId2 },
          ],
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true, profileImage: true } } },
        },
      },
    });
  }

  async findConversationById(conversationId: string) {
    return prisma.conversation.findFirst({
      where: { id: conversationId, deletedAt: null },
      include: {
        participants: {
          where: { deletedAt: null },
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true, profileImage: true } } },
        },
      },
    });
  }

  async listUserDirectConversations(userId: string, skip: number, take: number) {
    return prisma.conversation.findMany({
      where: {
        type: ConversationType.DIRECT,
        deletedAt: null,
        participants: { some: { userId, deletedAt: null } },
      },
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: {
          where: { deletedAt: null },
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true, profileImage: true } } },
        },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, firstName: true, lastName: true } },
            voiceMessage: true,
          },
        },
      },
    });
  }

  async countUserDirectConversations(userId: string) {
    return prisma.conversation.count({
      where: {
        type: ConversationType.DIRECT,
        deletedAt: null,
        participants: { some: { userId, deletedAt: null } },
      },
    });
  }

  // ── Participant Operations ────────────────────────────────────────────────
  async findParticipant(conversationId: string, userId: string) {
    return prisma.conversationParticipant.findFirst({
      where: { conversationId, userId, deletedAt: null },
    });
  }

  async addParticipant(conversationId: string, userId: string) {
    return prisma.conversationParticipant.upsert({
      where: { conversationId_userId: { conversationId, userId } },
      create: { conversationId, userId },
      update: { deletedAt: null, leftAt: null },
    });
  }

  async updateLastReadAt(conversationId: string, userId: string, lastReadAt: Date = new Date()) {
    return prisma.conversationParticipant.updateMany({
      where: { conversationId, userId, deletedAt: null },
      data: { lastReadAt },
    });
  }

  // ── Message Operations ────────────────────────────────────────────────────
  async createMessage(data: {
    conversationId: string;
    senderId: string;
    content?: string;
    messageType?: MessageType;
  }) {
    const [msg] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          messageType: data.messageType || MessageType.TEXT,
        },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, role: true, profileImage: true } },
          readReceipts: true,
          voiceMessage: true,
        },
      }),
      prisma.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);
    return msg;
  }

  async findMessageById(messageId: string) {
    return prisma.message.findFirst({
      where: { id: messageId, deletedAt: null },
      include: {
        conversation: true,
        sender: { select: { id: true, firstName: true, lastName: true, role: true, profileImage: true } },
        readReceipts: true,
        voiceMessage: true,
      },
    });
  }

  async listConversationMessages(conversationId: string, skip: number, take: number) {
    return prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true, profileImage: true } },
        readReceipts: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
        voiceMessage: true,
      },
    });
  }

  async countConversationMessages(conversationId: string) {
    return prisma.message.count({
      where: { conversationId, deletedAt: null },
    });
  }

  async softDeleteMessage(messageId: string) {
    return prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true, content: '[Message deleted]', deletedAt: new Date() },
    });
  }

  async markMessageRead(messageId: string, userId: string) {
    return prisma.messageRead.upsert({
      where: { messageId_userId: { messageId, userId } },
      create: { messageId, userId },
      update: { readAt: new Date() },
    });
  }

  // ── Voice Message ─────────────────────────────────────────────────────────
  async createVoiceMessage(data: {
    messageId: string;
    fileUrl: string;
    fileSize: number;
    duration: number;
    mimeType: string;
  }) {
    return prisma.voiceMessage.create({
      data: {
        messageId: data.messageId,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        duration: data.duration,
        mimeType: data.mimeType,
      },
    });
  }

  // ── Community Video ───────────────────────────────────────────────────────
  async createCommunityVideo(data: {
    communityId: string;
    uploadedById: string;
    title: string;
    description?: string;
    videoUrl: string;
    duration: number;
    fileSize: number;
    mimeType: string;
  }) {
    return prisma.communityVideo.create({
      data,
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });
  }

  async listCommunityVideos(communityId: string, skip: number, take: number) {
    return prisma.communityVideo.findMany({
      where: { communityId, deletedAt: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });
  }

  async countCommunityVideos(communityId: string) {
    return prisma.communityVideo.count({
      where: { communityId, deletedAt: null },
    });
  }

  async findCommunityVideoById(id: string) {
    return prisma.communityVideo.findFirst({
      where: { id, deletedAt: null },
    });
  }

  // ── Meeting Links ─────────────────────────────────────────────────────────
  async createMeetingLink(data: {
    communityId: string;
    createdById: string;
    title: string;
    description?: string;
    meetingUrl: string;
    platform?: MeetingPlatform;
    scheduledAt?: Date;
  }) {
    return prisma.meetingLink.create({
      data: {
        communityId: data.communityId,
        createdById: data.createdById,
        title: data.title,
        description: data.description,
        meetingUrl: data.meetingUrl,
        platform: data.platform || MeetingPlatform.OTHER,
        scheduledAt: data.scheduledAt,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });
  }

  async listMeetingLinks(communityId: string, status: MeetingStatus | undefined, skip: number, take: number) {
    const where: Prisma.MeetingLinkWhereInput = { communityId, deletedAt: null };
    if (status) where.status = status;

    return prisma.meetingLink.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });
  }

  async countMeetingLinks(communityId: string, status?: MeetingStatus) {
    const where: Prisma.MeetingLinkWhereInput = { communityId, deletedAt: null };
    if (status) where.status = status;
    return prisma.meetingLink.count({ where });
  }

  async findMeetingLinkById(id: string) {
    return prisma.meetingLink.findFirst({
      where: { id, deletedAt: null },
    });
  }

  // ── Campaign Content & Review ─────────────────────────────────────────────
  async createCampaignContent(data: {
    campaignId: string;
    influencerId: string;
    title: string;
    description?: string;
    videoUrl: string;
    duration: number;
    fileSize: number;
    mimeType: string;
  }) {
    return prisma.campaignContent.create({
      data: {
        campaignId: data.campaignId,
        influencerId: data.influencerId,
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        duration: data.duration,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        status: ContentSubmissionStatus.PENDING,
      },
      include: {
        campaign: { select: { id: true, title: true, ownerId: true } },
        influencer: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });
  }

  async findCampaignContentById(id: string) {
    return prisma.campaignContent.findFirst({
      where: { id, deletedAt: null },
      include: {
        campaign: { select: { id: true, title: true, ownerId: true } },
        influencer: { select: { id: true, firstName: true, lastName: true, role: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { reviewer: { select: { id: true, firstName: true, lastName: true, role: true } } },
        },
      },
    });
  }

  async listCampaignContent(where: Prisma.CampaignContentWhereInput, skip: number, take: number) {
    return prisma.campaignContent.findMany({
      where: { ...where, deletedAt: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: { select: { id: true, title: true, ownerId: true } },
        influencer: { select: { id: true, firstName: true, lastName: true, role: true } },
        reviews: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { reviewer: { select: { id: true, firstName: true, lastName: true, role: true } } },
        },
      },
    });
  }

  async countCampaignContent(where: Prisma.CampaignContentWhereInput) {
    return prisma.campaignContent.count({
      where: { ...where, deletedAt: null },
    });
  }

  async updateCampaignContentStatus(id: string, status: ContentSubmissionStatus) {
    return prisma.campaignContent.update({
      where: { id },
      data: { status },
    });
  }

  async createCampaignContentReview(data: {
    contentId: string;
    reviewerId: string;
    status: ContentSubmissionStatus;
    feedback?: string;
  }) {
    return prisma.campaignContentReview.create({
      data: {
        contentId: data.contentId,
        reviewerId: data.reviewerId,
        status: data.status,
        feedback: data.feedback,
      },
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });
  }

  // ── Audit Logs & Notifications ────────────────────────────────────────────
  async createAuditLog(data: {
    userId: string;
    action: any;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        ipAddress: data.ipAddress || '127.0.0.1',
        userAgent: data.userAgent || 'system',
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  }

  async createNotification(data: {
    userId: string;
    type: any;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  }
}

export const chatRepository = new ChatRepository();
