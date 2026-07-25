// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests — Chat & Collaboration Service (FR32–FR37)
// ─────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';
process.env.BCRYPT_ROUNDS = '4';

jest.mock('../../modules/chat/repositories/chat.repository', () => ({
  chatRepository: {
    findUserById: jest.fn(),
    findCommunityById: jest.fn(),
    findCommunityMember: jest.fn(),
    findCampaignById: jest.fn(),
    findCommunityConversation: jest.fn(),
    createCommunityConversation: jest.fn(),
    findDirectConversationBetweenUsers: jest.fn(),
    createDirectConversation: jest.fn(),
    findConversationById: jest.fn(),
    listUserDirectConversations: jest.fn(),
    countUserDirectConversations: jest.fn(),
    findParticipant: jest.fn(),
    addParticipant: jest.fn(),
    updateLastReadAt: jest.fn(),
    createMessage: jest.fn(),
    findMessageById: jest.fn(),
    listConversationMessages: jest.fn(),
    countConversationMessages: jest.fn(),
    softDeleteMessage: jest.fn(),
    markMessageRead: jest.fn(),
    createVoiceMessage: jest.fn(),
    createCommunityVideo: jest.fn(),
    listCommunityVideos: jest.fn(),
    countCommunityVideos: jest.fn(),
    findCommunityVideoById: jest.fn(),
    createMeetingLink: jest.fn(),
    listMeetingLinks: jest.fn(),
    countMeetingLinks: jest.fn(),
    findMeetingLinkById: jest.fn(),
    createCampaignContent: jest.fn(),
    findCampaignContentById: jest.fn(),
    listCampaignContent: jest.fn(),
    countCampaignContent: jest.fn(),
    updateCampaignContentStatus: jest.fn(),
    createCampaignContentReview: jest.fn(),
    createAuditLog: jest.fn().mockResolvedValue(undefined),
    createNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

import { chatService } from '../../modules/chat/services/chat.service';
import { chatRepository as mockRepo } from '../../modules/chat/repositories/chat.repository';

const repo = mockRepo as jest.Mocked<typeof mockRepo>;
const ctx = { ip: '127.0.0.1', userAgent: 'jest' };

const ADMIN_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00';
const LEADER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
const MEMBER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
const BIZ_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';
const AGENT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15';
const COMM_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20';
const CAMP_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30';

const makeCommunity = (overrides: Record<string, any> = {}) => ({
  id: COMM_ID, title: 'Tech Hub', status: 'ACTIVE', communityLeaderId: LEADER_ID, createdBy: ADMIN_ID,
  createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('FR32: Community Chat', () => {
  it('allows active member to send message in community chat', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findCommunityMember.mockResolvedValue({ id: 'mem-1', status: 'ACTIVE' } as any);
    repo.findCommunityConversation.mockResolvedValue({ id: 'conv-1' } as any);
    repo.findParticipant.mockResolvedValue({ id: 'part-1' } as any);
    repo.createMessage.mockResolvedValue({ id: 'msg-1', content: 'Hello world' } as any);

    const res = await chatService.sendCommunityMessage(COMM_ID, { content: 'Hello world' }, MEMBER_ID, 'INFLUENCER', ctx);

    expect(res).toBeDefined();
    expect(repo.createMessage).toHaveBeenCalledWith(expect.objectContaining({ conversationId: 'conv-1', senderId: MEMBER_ID }));
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'MESSAGE_SENT' }));
  });

  it('throws 403 if non-member tries to send message in community chat', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findCommunityMember.mockResolvedValue(null);

    await expect(chatService.sendCommunityMessage(COMM_ID, { content: 'Intruder' }, 'outsider-id', 'INFLUENCER', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('lists paginated community messages for members', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findCommunityMember.mockResolvedValue({ id: 'mem-1' } as any);
    repo.findCommunityConversation.mockResolvedValue({ id: 'conv-1' } as any);
    repo.listConversationMessages.mockResolvedValue([{ id: 'msg-1' }] as any);
    repo.countConversationMessages.mockResolvedValue(1);

    const res = await chatService.listCommunityMessages(COMM_ID, { page: 1, limit: 10 }, MEMBER_ID, 'INFLUENCER');

    expect(res.data).toHaveLength(1);
    expect(res.meta.total).toBe(1);
  });
});

describe('FR33: Direct Messaging (Allowed Conversation Pairs)', () => {
  it('allows Admin ↔ Any User direct messaging', async () => {
    repo.findUserById.mockResolvedValue({ id: MEMBER_ID, role: 'INFLUENCER', status: 'ACTIVE' } as any);
    repo.findDirectConversationBetweenUsers.mockResolvedValue(null);
    repo.createDirectConversation.mockResolvedValue({ id: 'conv-direct-1' } as any);
    repo.createMessage.mockResolvedValue({ id: 'msg-1', content: 'Admin notice' } as any);

    const res = await chatService.startOrSendDirectMessage({ recipientId: MEMBER_ID, content: 'Admin notice' }, ADMIN_ID, 'SUPER_ADMIN', ctx);

    expect(res).toBeDefined();
    expect(repo.createNotification).toHaveBeenCalled();
  });

  it('allows Agent ↔ Business direct messaging', async () => {
    repo.findUserById.mockResolvedValue({ id: BIZ_ID, role: 'BUSINESS', status: 'ACTIVE' } as any);
    repo.findDirectConversationBetweenUsers.mockResolvedValue({ id: 'conv-direct-2' } as any);
    repo.createMessage.mockResolvedValue({ id: 'msg-2', content: 'Business inquiry' } as any);

    const res = await chatService.startOrSendDirectMessage({ recipientId: BIZ_ID, content: 'Business inquiry' }, AGENT_ID, 'AGENT', ctx);

    expect(res).toBeDefined();
  });

  it('allows Leader ↔ Member direct messaging', async () => {
    repo.findUserById.mockResolvedValue({ id: MEMBER_ID, role: 'INFLUENCER', status: 'ACTIVE' } as any);
    repo.findCommunityMember.mockResolvedValue({ id: 'mem-1' } as any);
    repo.findDirectConversationBetweenUsers.mockResolvedValue({ id: 'conv-direct-3' } as any);
    repo.createMessage.mockResolvedValue({ id: 'msg-3', content: 'Leader message' } as any);

    const res = await chatService.startOrSendDirectMessage({ recipientId: MEMBER_ID, content: 'Leader message' }, LEADER_ID, 'INFLUENCER', ctx);

    expect(res).toBeDefined();
  });

  it('blocks unauthorized direct messaging pairs (e.g. Influencer ↔ Business)', async () => {
    repo.findUserById.mockResolvedValue({ id: BIZ_ID, role: 'BUSINESS', status: 'ACTIVE' } as any);
    repo.findCommunityMember.mockResolvedValue(null);

    await expect(chatService.startOrSendDirectMessage({ recipientId: BIZ_ID, content: 'Unauthorized' }, MEMBER_ID, 'INFLUENCER', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('marks message as read', async () => {
    repo.findMessageById.mockResolvedValue({ id: 'msg-1', conversationId: 'conv-1' } as any);
    repo.findParticipant.mockResolvedValue({ id: 'part-1' } as any);

    const res = await chatService.markMessageRead('msg-1', MEMBER_ID);

    expect(res.messageId).toBe('msg-1');
    expect(repo.markMessageRead).toHaveBeenCalledWith('msg-1', MEMBER_ID);
  });

  it('soft deletes message by sender', async () => {
    repo.findMessageById.mockResolvedValue({ id: 'msg-1', senderId: MEMBER_ID, conversationId: 'conv-1' } as any);
    repo.softDeleteMessage.mockResolvedValue({ id: 'msg-1', isDeleted: true } as any);

    const res = await chatService.softDeleteMessage('msg-1', MEMBER_ID, 'INFLUENCER', ctx);

    expect(res.isDeleted).toBe(true);
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'MESSAGE_DELETED' }));
  });
});

describe('FR34: Voice Messages', () => {
  it('creates voice message attachment', async () => {
    repo.findConversationById.mockResolvedValue({ id: 'conv-1' } as any);
    repo.findParticipant.mockResolvedValue({ id: 'part-1' } as any);
    repo.createMessage.mockResolvedValue({ id: 'msg-voice-1' } as any);
    repo.createVoiceMessage.mockResolvedValue({ id: 'vm-1', fileUrl: 'http://cdn/audio.mp3', fileSize: 50000, duration: 15 } as any);

    const res = await chatService.uploadVoiceMessage({
      conversationId: 'conv-1',
      fileUrl: 'http://cdn/audio.mp3',
      fileSize: 50000,
      duration: 15,
      mimeType: 'audio/mp3',
    }, MEMBER_ID, ctx);

    expect(res).toBeDefined();
    expect(repo.createVoiceMessage).toHaveBeenCalled();
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'VOICE_MESSAGE_CREATED' }));
  });
});

describe('FR35: Community Video Uploads', () => {
  it('allows Community Leader to upload video', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.createCommunityVideo.mockResolvedValue({ id: 'vid-1', title: 'Tutorial' } as any);

    const res = await chatService.uploadCommunityVideo({
      communityId: COMM_ID,
      title: 'Tutorial',
      videoUrl: 'http://cdn/video.mp4',
      duration: 120,
      fileSize: 1000000,
      mimeType: 'video/mp4',
    }, LEADER_ID, 'INFLUENCER', ctx);

    expect(res.title).toBe('Tutorial');
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'COMMUNITY_VIDEO_UPLOADED' }));
  });

  it('throws 403 if regular member tries to upload community video', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);

    await expect(chatService.uploadCommunityVideo({
      communityId: COMM_ID,
      title: 'Member Video',
      videoUrl: 'http://cdn/video.mp4',
      duration: 60,
      fileSize: 500000,
      mimeType: 'video/mp4',
    }, MEMBER_ID, 'INFLUENCER', ctx)).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('FR36: Meeting Link Sharing', () => {
  it('allows Community Leader to share Google Meet link', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.createMeetingLink.mockResolvedValue({ id: 'meet-1', meetingUrl: 'https://meet.google.com/abc-defg-hij' } as any);

    const res = await chatService.createMeetingLink({
      communityId: COMM_ID,
      title: 'Weekly Sync',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      platform: 'GOOGLE_MEET',
    }, LEADER_ID, 'INFLUENCER', ctx);

    expect(res.meetingUrl).toBe('https://meet.google.com/abc-defg-hij');
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'MEETING_LINK_CREATED' }));
  });
});

describe('FR37: Campaign Content Upload & Review', () => {
  it('allows Influencer to submit promotional campaign content', async () => {
    repo.findCampaignById.mockResolvedValue({ id: CAMP_ID, title: 'Summer Promo', ownerId: BIZ_ID } as any);
    repo.createCampaignContent.mockResolvedValue({ id: 'content-1', status: 'PENDING' } as any);

    const res = await chatService.uploadCampaignContent({
      campaignId: CAMP_ID,
      title: 'Instagram Reel',
      videoUrl: 'http://cdn/promo.mp4',
      duration: 30,
      fileSize: 2000000,
      mimeType: 'video/mp4',
    }, MEMBER_ID, 'INFLUENCER', ctx);

    expect(res.status).toBe('PENDING');
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'CAMPAIGN_CONTENT_SUBMITTED' }));
    expect(repo.createNotification).toHaveBeenCalled();
  });

  it('allows Business Owner to review and approve campaign content', async () => {
    repo.findCampaignContentById.mockResolvedValue({ id: 'content-1', campaignId: CAMP_ID, campaign: { ownerId: BIZ_ID, title: 'Summer Promo' }, influencerId: MEMBER_ID } as any);
    repo.updateCampaignContentStatus.mockResolvedValue({ id: 'content-1', status: 'APPROVED' } as any);
    repo.createCampaignContentReview.mockResolvedValue({ id: 'rev-1', status: 'APPROVED', feedback: 'Great job!' } as any);

    const res = await chatService.reviewCampaignContent('content-1', { status: 'APPROVED', feedback: 'Great job!' }, BIZ_ID, 'BUSINESS', ctx);

    expect(res.status).toBe('APPROVED');
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'CAMPAIGN_CONTENT_REVIEWED' }));
    expect(repo.createNotification).toHaveBeenCalled();
  });
});
