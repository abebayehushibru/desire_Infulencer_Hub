// ─────────────────────────────────────────────────────────────────────────────
// Chat & Collaboration DTOs — Module 6 (FR32–FR37)
// ─────────────────────────────────────────────────────────────────────────────

import { MessageType, MeetingPlatform, MeetingStatus, ContentSubmissionStatus } from '@prisma/client';

export interface SendCommunityMessageDto {
  content?: string;
  messageType?: MessageType;
}

export interface ListCommunityMessagesQueryDto {
  page?: number;
  limit?: number;
}

export interface StartOrSendDirectMessageDto {
  recipientId: string;
  content: string;
}

export interface ListDirectConversationsQueryDto {
  page?: number;
  limit?: number;
}

export interface UploadVoiceMessageDto {
  conversationId: string;
  fileUrl: string;
  fileSize: number; // in bytes
  duration: number; // in seconds
  mimeType: string;
}

export interface UploadCommunityVideoDto {
  communityId: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number; // in seconds
  fileSize: number; // in bytes
  mimeType: string;
}

export interface ListCommunityVideosQueryDto {
  communityId: string;
  page?: number;
  limit?: number;
}

export interface CreateMeetingLinkDto {
  communityId: string;
  title: string;
  description?: string;
  meetingUrl: string;
  platform?: MeetingPlatform;
  scheduledAt?: string;
}

export interface ListMeetingLinksQueryDto {
  communityId: string;
  status?: MeetingStatus;
  page?: number;
  limit?: number;
}

export interface UploadCampaignContentDto {
  campaignId: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number; // in seconds
  fileSize: number; // in bytes
  mimeType: string;
}

export interface ListCampaignContentQueryDto {
  campaignId?: string;
  status?: ContentSubmissionStatus;
  page?: number;
  limit?: number;
}

export interface ReviewCampaignContentDto {
  status: ContentSubmissionStatus;
  feedback?: string;
}
