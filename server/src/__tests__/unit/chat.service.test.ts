// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests — Chat Service (FR32–FR37)
// ─────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';
process.env.BCRYPT_ROUNDS = '4';

jest.mock('../../modules/chat/repositories/chat.repository', () => ({
  chatRepository: {
    findUserById:                  jest.fn(),
    findCommunityById:             jest.fn(),
    findCommunityMember:           jest.fn(),
    findCampaignById:              jest.fn(),
    findCommunityConversation:     jest.fn(),
    createCommunityConversation:   jest.fn(),
    findDirectConversationBetweenUsers: jest.fn(),
    createDirectConversation:      jest.fn(),
    findConversationById:          jest.fn(),
    listUserDirectConversations:   jest.fn(),
    countUserDirectConversations:  jest.fn(),
    findParticipant:               jest.fn(),
    addParticipant:                jest.fn(),
    updateLastReadAt:              jest.fn(),
    createMessage:                 jest.fn(),
    findMessageById:               jest.fn(),
    listConversationMessages:      jest.fn(),
    countConversationMessages:     jest.fn(),
    softDeleteMessage:             jest.fn(),
    markMessageRead:               jest.fn(),
    createVoiceMessage:            jest.fn(),
    createCommunityVideo:          jest.fn(),
    listCommunityVideos:           jest.fn(),
    countCommunityVideos:          jest.fn(),
    findCommunityVideoById:        jest.fn(),
    createMeetingLink:             jest.fn(),
    listMeetingLinks:              jest.fn(),
    countMeetingLinks:             jest.fn(),
    findMeetingLinkById:           jest.fn(),
    createCampaignContent:         jest.fn(),
    findCampaignContentById:       jest.fn(),
    listCampaignContent:           jest.fn(),
    countCampaignContent:          jest.fn(),
    updateCampaignContentStatus:   jest.fn(),
    createCampaignContentReview:   jest.fn(),
    createAuditLog:                jest.fn(),
    createNotification:            jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../modules/users/repositories/user-management.repository', () => ({
  userManagementRepository: {
    findInfluencerProfileByUserId: jest.fn(),
  },
}));

import { ChatService } from '../../modules/chat/services/chat.service';
import { chatRepository as mockRepo } from '../../modules/chat/repositories/chat.repository';
import { ApiError } from '../../common/errors/ApiError';

// Instantiate fresh service for each test group
const svc = new ChatService();
const repo = mockRepo as jest.Mocked<typeof mockRepo>;
const ctx = { ip: '127.0.0.1', userAgent: 'jest' };

// ── UUIDs ─────────────────────────────────────────────────────────────────────
const ADMIN_ID    = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c00';
const LEADER_ID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01';
const MEMBER_ID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02';
const COMM_ID     = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03';
const CONV_ID     = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04';
const MSG_ID      = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05';
const CAMP_ID     = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c06';
const BIZ_ID      = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c07';

const makeCommunity = (overrides: Record<string, any> = {}) => ({
  id: COMM_ID, title: 'Tech Hub', status: 'ACTIVE',
  communityLeaderId: LEADER_ID, deletedAt: null,
  ...overrides,
});

const makeConversation = (overrides: Record<string, any> = {}) => ({
  id: CONV_ID, type: 'COMMUNITY', communityId: COMM_ID,
  participants: [], deletedAt: null,
  ...overrides,
});

const makeMessage = (overrides: Record<string, any> = {}) => ({
  id: MSG_ID, conversationId: CONV_ID, senderId: LEADER_ID,
  content: 'Hello world', messageType: 'TEXT',
  isDeleted: false, deletedAt: null, createdAt: new Date(),
  sender: { id: LEADER_ID, firstName: 'Leader', lastName: 'User', role: 'INFLUENCER' },
  readReceipts: [], voiceMessage: null,
  conversation: { id: CONV_ID },
  ...overrides,
});

const makeUser = (overrides: Record<string, any> = {}) => ({
  id: MEMBER_ID, role: 'INFLUENCER', status: 'ACTIVE',
  firstName: 'Gold', lastName: 'User', email: 'gold@x.com',
  influencerProfile: null, businessProfile: null, agentProfile: null,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// FR32 — Community Chat
// ─────────────────────────────────────────────────────────────────────────────
describe('FR32: sendCommunityMessage()', () => {
  it('sends a message as community leader', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findCommunityMember.mockResolvedValue(null); // leader, not regular member
    repo.findCommunityConversation.mockResolvedValue(makeConversation() as any);
    repo.findParticipant.mockResolvedValue({ id: 'p-1' } as any);
    repo.createMessage.mockResolvedValue(makeMessage() as any);
    repo.markMessageRead.mockResolvedValue({} as any);

    const result = await svc.sendCommunityMessage(
      COMM_ID, { content: 'Hello world' }, LEADER_ID, 'INFLUENCER', ctx,
    );

    expect(repo.createMessage).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: CONV_ID,
      senderId: LEADER_ID,
      content: 'Hello world',
    }));
    expect(repo.markMessageRead).toHaveBeenCalledWith(MSG_ID, LEADER_ID);
  });

  it('creates conversation if none exists', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findCommunityMember.mockResolvedValue({ id: 'm-1' } as any);
    repo.findCommunityConversation.mockResolvedValue(null);
    repo.createCommunityConversation.mockResolvedValue(makeConversation() as any);
    repo.findParticipant.mockResolvedValue(null);
    repo.addParticipant.mockResolvedValue({} as any);
    repo.createMessage.mockResolvedValue(makeMessage() as any);
    repo.markMessageRead.mockResolvedValue({} as any);

    await svc.sendCommunityMessage(COMM_ID, { content: 'Hi' }, MEMBER_ID, 'INFLUENCER', ctx);
    expect(repo.createCommunityConversation).toHaveBeenCalledWith(COMM_ID, expect.any(String));
  });

  it('throws 403 if user is not a member or leader', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findCommunityMember.mockResolvedValue(null);

    await expect(
      svc.sendCommunityMessage(COMM_ID, { content: 'Hi' }, BIZ_ID, 'BUSINESS', ctx)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 404 if community not found', async () => {
    repo.findCommunityById.mockResolvedValue(null);
    await expect(
      svc.sendCommunityMessage(COMM_ID, { content: 'Hi' }, LEADER_ID, 'INFLUENCER', ctx)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 if community is inactive', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity({ status: 'INACTIVE' }) as any);
    await expect(
      svc.sendCommunityMessage(COMM_ID, { content: 'Hi' }, LEADER_ID, 'INFLUENCER', ctx)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('allows SUPER_ADMIN to send messages regardless of membership', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findCommunityConversation.mockResolvedValue(makeConversation() as any);
    repo.findParticipant.mockResolvedValue({ id: 'p-1' } as any);
    repo.createMessage.mockResolvedValue(makeMessage() as any);
    repo.markMessageRead.mockResolvedValue({} as any);

    await svc.sendCommunityMessage(COMM_ID, { content: 'Admin msg' }, ADMIN_ID, 'SUPER_ADMIN', ctx);
    expect(repo.createMessage).toHaveBeenCalled();
  });
});

describe('FR32: listCommunityMessages()', () => {
  it('returns paginated messages for members', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findCommunityMember.mockResolvedValue({ id: 'm-1' } as any);
    repo.findCommunityConversation.mockResolvedValue(makeConversation() as any);
    repo.listConversationMessages.mockResolvedValue([makeMessage()] as any);
    repo.countConversationMessages.mockResolvedValue(1);

    const result = await svc.listCommunityMessages(COMM_ID, { page: 1, limit: 20 }, MEMBER_ID, 'INFLUENCER');
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('returns empty array if no conversation exists', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findCommunityMember.mockResolvedValue({ id: 'm-1' } as any);
    repo.findCommunityConversation.mockResolvedValue(null);

    const result = await svc.listCommunityMessages(COMM_ID, {}, MEMBER_ID, 'INFLUENCER');
    expect(result.data).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR33 — Direct Messaging
// ─────────────────────────────────────────────────────────────────────────────
describe('FR33: startOrSendDirectMessage()', () => {
  it('allows Agent → Business direct message', async () => {
    repo.findUserById.mockResolvedValue(makeUser({ id: BIZ_ID, role: 'BUSINESS' }) as any);
    repo.findDirectConversationBetweenUsers.mockResolvedValue(null);
    repo.createDirectConversation.mockResolvedValue({ id: CONV_ID, participants: [] } as any);
    repo.createMessage.mockResolvedValue(makeMessage({ senderId: 'agent-1' }) as any);
    repo.markMessageRead.mockResolvedValue({} as any);

    const result = await svc.startOrSendDirectMessage(
      { recipientId: BIZ_ID, content: 'Hello business' }, 'agent-1', 'AGENT', ctx,
    );
    expect(result.content).toBe('Hello world'); // from mock
  });

  it('throws 403 for Influencer → Business DM (not allowed)', async () => {
    repo.findUserById.mockResolvedValue(makeUser({ id: BIZ_ID, role: 'BUSINESS' }) as any);
    repo.findCommunityMember.mockResolvedValue(null); // no shared community

    await expect(
      svc.startOrSendDirectMessage(
        { recipientId: BIZ_ID, content: 'Hi' }, MEMBER_ID, 'INFLUENCER', ctx,
      )
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 400 for self-messaging', async () => {
    repo.findUserById.mockResolvedValue(makeUser({ id: MEMBER_ID }) as any);

    await expect(
      svc.startOrSendDirectMessage(
        { recipientId: MEMBER_ID, content: 'Hi' }, MEMBER_ID, 'INFLUENCER', ctx,
      )
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 404 if recipient not found', async () => {
    repo.findUserById.mockResolvedValue(null);
    await expect(
      svc.startOrSendDirectMessage(
        { recipientId: BIZ_ID, content: 'Hi' }, ADMIN_ID, 'SUPER_ADMIN', ctx,
      )
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('allows SUPER_ADMIN → any user DM', async () => {
    repo.findUserById.mockResolvedValue(makeUser() as any);
    repo.findDirectConversationBetweenUsers.mockResolvedValue({ id: CONV_ID, participants: [] } as any);
    repo.createMessage.mockResolvedValue(makeMessage() as any);
    repo.markMessageRead.mockResolvedValue({} as any);

    await svc.startOrSendDirectMessage(
      { recipientId: MEMBER_ID, content: 'Admin msg' }, ADMIN_ID, 'SUPER_ADMIN', ctx,
    );
    expect(repo.createMessage).toHaveBeenCalled();
  });
});

describe('FR33: markMessageRead()', () => {
  it('marks message as read for conversation participant', async () => {
    repo.findMessageById.mockResolvedValue(makeMessage() as any);
    repo.findParticipant.mockResolvedValue({ id: 'p-1' } as any);
    repo.markMessageRead.mockResolvedValue({} as any);
    repo.updateLastReadAt.mockResolvedValue({} as any);

    const result = await svc.markMessageRead(MSG_ID, MEMBER_ID);
    expect(result.messageId).toBe(MSG_ID);
    expect(repo.markMessageRead).toHaveBeenCalledWith(MSG_ID, MEMBER_ID);
  });

  it('throws 403 if user is not a conversation participant', async () => {
    repo.findMessageById.mockResolvedValue(makeMessage() as any);
    repo.findParticipant.mockResolvedValue(null);

    await expect(svc.markMessageRead(MSG_ID, BIZ_ID))
      .rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('FR33: softDeleteMessage()', () => {
  it('allows sender to delete own message', async () => {
    repo.findMessageById.mockResolvedValue(makeMessage({ senderId: LEADER_ID }) as any);
    repo.softDeleteMessage.mockResolvedValue(makeMessage({ isDeleted: true }) as any);

    await svc.softDeleteMessage(MSG_ID, LEADER_ID, 'INFLUENCER', ctx);
    expect(repo.softDeleteMessage).toHaveBeenCalledWith(MSG_ID);
  });

  it('allows SUPER_ADMIN to delete any message', async () => {
    repo.findMessageById.mockResolvedValue(makeMessage({ senderId: MEMBER_ID }) as any);
    repo.softDeleteMessage.mockResolvedValue(makeMessage({ isDeleted: true }) as any);

    await svc.softDeleteMessage(MSG_ID, ADMIN_ID, 'SUPER_ADMIN', ctx);
    expect(repo.softDeleteMessage).toHaveBeenCalled();
  });

  it('throws 403 if non-sender non-admin tries to delete', async () => {
    repo.findMessageById.mockResolvedValue(makeMessage({ senderId: LEADER_ID }) as any);

    await expect(svc.softDeleteMessage(MSG_ID, BIZ_ID, 'BUSINESS', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR34 — Voice Messages
// ─────────────────────────────────────────────────────────────────────────────
describe('FR34: uploadVoiceMessage()', () => {
  const dto = {
    conversationId: CONV_ID, fileUrl: 'https://cdn.example.com/voice.webm',
    fileSize: 1024 * 100, duration: 15, mimeType: 'audio/webm',
  };

  it('creates voice message in a conversation the user belongs to', async () => {
    repo.findConversationById.mockResolvedValue(makeConversation() as any);
    repo.findParticipant.mockResolvedValue({ id: 'p-1' } as any);
    repo.createMessage.mockResolvedValue(makeMessage({ messageType: 'VOICE' }) as any);
    repo.createVoiceMessage.mockResolvedValue({ id: 'vm-1', duration: 15 } as any);
    repo.markMessageRead.mockResolvedValue({} as any);

    const result = await svc.uploadVoiceMessage(dto, LEADER_ID, ctx);
    expect(repo.createVoiceMessage).toHaveBeenCalledWith(expect.objectContaining({
      messageId: MSG_ID,
      duration:  15,
      mimeType:  'audio/webm',
    }));
  });

  it('throws 403 if user is not a conversation participant', async () => {
    repo.findConversationById.mockResolvedValue(makeConversation() as any);
    repo.findParticipant.mockResolvedValue(null);

    await expect(svc.uploadVoiceMessage(dto, BIZ_ID, ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 404 if conversation not found', async () => {
    repo.findConversationById.mockResolvedValue(null);
    await expect(svc.uploadVoiceMessage(dto, LEADER_ID, ctx))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR35 — Community Videos
// ─────────────────────────────────────────────────────────────────────────────
describe('FR35: uploadCommunityVideo()', () => {
  const dto = {
    communityId: COMM_ID, title: 'Tutorial', description: 'How to',
    videoUrl: 'https://cdn.example.com/vid.mp4', duration: 120,
    fileSize: 1024 * 1024 * 10, mimeType: 'video/mp4',
  };

  it('allows community leader to upload video', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.createCommunityVideo.mockResolvedValue({ id: 'v-1', title: 'Tutorial' } as any);

    const result = await svc.uploadCommunityVideo(dto, LEADER_ID, 'INFLUENCER', ctx);
    expect(repo.createCommunityVideo).toHaveBeenCalledWith(expect.objectContaining({
      communityId: COMM_ID, uploadedById: LEADER_ID, title: 'Tutorial',
    }));
  });

  it('throws 403 for non-leader INFLUENCER', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);

    await expect(svc.uploadCommunityVideo(dto, MEMBER_ID, 'INFLUENCER', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 403 for BUSINESS user', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    await expect(svc.uploadCommunityVideo(dto, BIZ_ID, 'BUSINESS', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR36 — Meeting Links
// ─────────────────────────────────────────────────────────────────────────────
describe('FR36: createMeetingLink()', () => {
  const dto = {
    communityId: COMM_ID, title: 'Weekly Sync',
    meetingUrl: 'https://meet.google.com/abc-def-ghi',
    platform: 'GOOGLE_MEET' as const,
  };

  it('allows community leader to create meeting link', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.createMeetingLink.mockResolvedValue({ id: 'ml-1', title: 'Weekly Sync' } as any);

    await svc.createMeetingLink(dto, LEADER_ID, 'INFLUENCER', ctx);
    expect(repo.createMeetingLink).toHaveBeenCalled();
  });

  it('throws 403 for regular member', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    await expect(svc.createMeetingLink(dto, MEMBER_ID, 'INFLUENCER', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 404 for non-existent community', async () => {
    repo.findCommunityById.mockResolvedValue(null);
    await expect(svc.createMeetingLink(dto, LEADER_ID, 'INFLUENCER', ctx))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR37 — Campaign Content
// ─────────────────────────────────────────────────────────────────────────────
describe('FR37: uploadCampaignContent()', () => {
  const dto = {
    campaignId: CAMP_ID, title: 'Promo Video',
    videoUrl: 'https://cdn.example.com/promo.mp4',
    duration: 60, fileSize: 1024 * 1024 * 50, mimeType: 'video/mp4',
  };

  it('allows INFLUENCER to submit content', async () => {
    repo.findCampaignById.mockResolvedValue({
      id: CAMP_ID, title: 'Summer Sale', ownerId: BIZ_ID,
    } as any);
    repo.createCampaignContent.mockResolvedValue({
      id: 'cc-1', campaignId: CAMP_ID, influencerId: MEMBER_ID,
      campaign: { id: CAMP_ID, title: 'Summer Sale', ownerId: BIZ_ID },
      influencer: { id: MEMBER_ID },
    } as any);

    await svc.uploadCampaignContent(dto, MEMBER_ID, 'INFLUENCER', ctx);
    expect(repo.createCampaignContent).toHaveBeenCalledWith(expect.objectContaining({
      campaignId: CAMP_ID, influencerId: MEMBER_ID, title: 'Promo Video',
    }));
    expect(repo.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ userId: BIZ_ID })
    );
  });

  it('throws 403 for BUSINESS user submitting content', async () => {
    repo.findCampaignById.mockResolvedValue({ id: CAMP_ID, ownerId: BIZ_ID } as any);
    await expect(svc.uploadCampaignContent(dto, BIZ_ID, 'BUSINESS', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('FR37: reviewCampaignContent()', () => {
  it('allows campaign owner to approve content', async () => {
    repo.findCampaignContentById.mockResolvedValue({
      id: 'cc-1', influencerId: MEMBER_ID, campaignId: CAMP_ID,
      campaign: { id: CAMP_ID, title: 'Summer Sale', ownerId: BIZ_ID },
    } as any);
    repo.updateCampaignContentStatus.mockResolvedValue({ id: 'cc-1', status: 'APPROVED' } as any);
    repo.createCampaignContentReview.mockResolvedValue({} as any);

    await svc.reviewCampaignContent('cc-1', { status: 'APPROVED' as any }, BIZ_ID, 'BUSINESS', ctx);
    expect(repo.updateCampaignContentStatus).toHaveBeenCalledWith('cc-1', 'APPROVED');
  });

  it('throws 403 if non-owner tries to review', async () => {
    repo.findCampaignContentById.mockResolvedValue({
      id: 'cc-1', influencerId: MEMBER_ID, campaignId: CAMP_ID,
      campaign: { id: CAMP_ID, ownerId: BIZ_ID },
    } as any);

    await expect(svc.reviewCampaignContent('cc-1', { status: 'APPROVED' as any }, MEMBER_ID, 'INFLUENCER', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });
});
