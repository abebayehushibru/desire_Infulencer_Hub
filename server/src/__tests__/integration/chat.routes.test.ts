// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests — Chat & Collaboration Routes (FR32–FR37)
// ─────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';
process.env.BCRYPT_ROUNDS = '4';

jest.mock('../../config/redis', () => ({
  default: { get: jest.fn().mockResolvedValue(null), setex: jest.fn(), on: jest.fn() },
}));
jest.mock('../../config/prisma', () => ({
  default: { $connect: jest.fn(), $disconnect: jest.fn(), $on: jest.fn(), $transaction: jest.fn((promises) => Promise.all(promises)) },
}));
jest.mock('../../modules/auth/repositories/auth.repository', () => ({
  authRepository: {
    findUserByEmail: jest.fn(), findUserById: jest.fn(), createUser: jest.fn(),
    createAuditLog: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../modules/users/repositories/user-management.repository', () => ({
  userManagementRepository: {
    findUserById: jest.fn(), findInfluencerProfileByUserId: jest.fn(),
  },
}));
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

import request from 'supertest';
import app from '../../app';
import { signAccessToken } from '../../common/utils/jwt.util';

// ── Token helpers ─────────────────────────────────────────────────────────────
const adminToken   = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00', email: 'admin@x.com',   role: 'SUPER_ADMIN' });
const leaderToken  = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', email: 'leader@x.com',  role: 'INFLUENCER' });
const memberToken  = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', email: 'member@x.com',  role: 'INFLUENCER' });
const bizToken     = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', email: 'biz@x.com',     role: 'BUSINESS' });
const agentToken   = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', email: 'agent@x.com',   role: 'AGENT' });

// ── Fixture IDs ───────────────────────────────────────────────────────────────
const COMM_UUID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20';
const CAMP_UUID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30';
const MSG_UUID    = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a40';
const CONTENT_UUID= 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a50';
const CONV_UUID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a60';
const MEMBER_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
const BIZ_UUID    = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';

const repo = () => require('../../modules/chat/repositories/chat.repository').chatRepository;

const mockCommunity = () => ({
  id: COMM_UUID, title: 'Tech Hub', status: 'ACTIVE', communityLeaderId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
});

beforeEach(() => jest.clearAllMocks());

describe('FR32: Community Chat Endpoints', () => {
  it('GET /chat/communities/:communityId/messages — 200 returns messages', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().findCommunityMember.mockResolvedValue({ id: 'mem-1' });
    repo().findCommunityConversation.mockResolvedValue({ id: CONV_UUID });
    repo().listConversationMessages.mockResolvedValue([{ id: MSG_UUID, content: 'Hello' }]);
    repo().countConversationMessages.mockResolvedValue(1);

    const res = await request(app)
      .get(`/api/v1/chat/communities/${COMM_UUID}/messages`)
      .set('Authorization', `Bearer ${memberToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('POST /chat/communities/:communityId/messages — 201 sends message', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().findCommunityMember.mockResolvedValue({ id: 'mem-1' });
    repo().findCommunityConversation.mockResolvedValue({ id: CONV_UUID });
    repo().findParticipant.mockResolvedValue({ id: 'part-1' });
    repo().createMessage.mockResolvedValue({ id: MSG_UUID, content: 'Welcome' });

    const res = await request(app)
      .post(`/api/v1/chat/communities/${COMM_UUID}/messages`)
      .set('Authorization', `Bearer ${memberToken()}`)
      .send({ content: 'Welcome' });

    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('Welcome');
  });
});

describe('FR33: Direct Messaging Endpoints', () => {
  it('GET /chat/direct — 200 returns direct conversations', async () => {
    repo().listUserDirectConversations.mockResolvedValue([{ id: CONV_UUID }]);
    repo().countUserDirectConversations.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/v1/chat/direct')
      .set('Authorization', `Bearer ${memberToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('POST /chat/direct — 201 sends direct message for Agent to Business', async () => {
    repo().findUserById.mockResolvedValue({ id: BIZ_UUID, role: 'BUSINESS', status: 'ACTIVE' });
    repo().findDirectConversationBetweenUsers.mockResolvedValue({ id: CONV_UUID });
    repo().createMessage.mockResolvedValue({ id: MSG_UUID, content: 'Hello biz' });

    const res = await request(app)
      .post('/api/v1/chat/direct')
      .set('Authorization', `Bearer ${agentToken()}`)
      .send({ recipientId: BIZ_UUID, content: 'Hello biz' });

    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('Hello biz');
  });

  it('PATCH /chat/messages/:id/read — 200 marks message read', async () => {
    repo().findMessageById.mockResolvedValue({ id: MSG_UUID, conversationId: CONV_UUID });
    repo().findParticipant.mockResolvedValue({ id: 'part-1' });

    const res = await request(app)
      .patch(`/api/v1/chat/messages/${MSG_UUID}/read`)
      .set('Authorization', `Bearer ${memberToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.messageId).toBe(MSG_UUID);
  });

  it('DELETE /chat/messages/:id — 200 soft deletes message', async () => {
    repo().findMessageById.mockResolvedValue({ id: MSG_UUID, senderId: MEMBER_UUID, conversationId: CONV_UUID });
    repo().softDeleteMessage.mockResolvedValue({ id: MSG_UUID, isDeleted: true });

    const res = await request(app)
      .delete(`/api/v1/chat/messages/${MSG_UUID}`)
      .set('Authorization', `Bearer ${memberToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isDeleted).toBe(true);
  });
});

describe('FR34: Voice Messages Endpoint', () => {
  it('POST /chat/voice — 201 uploads voice message', async () => {
    repo().findConversationById.mockResolvedValue({ id: CONV_UUID });
    repo().findParticipant.mockResolvedValue({ id: 'part-1' });
    repo().createMessage.mockResolvedValue({ id: MSG_UUID });
    repo().createVoiceMessage.mockResolvedValue({ id: 'vm-1', fileUrl: 'http://cdn/voice.mp3' });

    const res = await request(app)
      .post('/api/v1/chat/voice')
      .set('Authorization', `Bearer ${memberToken()}`)
      .send({
        conversationId: CONV_UUID,
        fileUrl: 'https://cdn.example.com/voice.mp3',
        fileSize: 45000,
        duration: 10,
        mimeType: 'audio/mp3',
      });

    expect(res.status).toBe(201);
  });
});

describe('FR35: Community Videos Endpoints', () => {
  it('POST /community/videos — 201 uploads video for leader', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().createCommunityVideo.mockResolvedValue({ id: 'vid-1', title: 'Onboarding' });

    const res = await request(app)
      .post('/api/v1/community/videos')
      .set('Authorization', `Bearer ${leaderToken()}`)
      .send({
        communityId: COMM_UUID,
        title: 'Onboarding',
        videoUrl: 'https://cdn.example.com/onboarding.mp4',
        duration: 180,
        fileSize: 5000000,
        mimeType: 'video/mp4',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Onboarding');
  });

  it('GET /community/videos — 200 lists videos', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().findCommunityMember.mockResolvedValue({ id: 'mem-1' });
    repo().listCommunityVideos.mockResolvedValue([{ id: 'vid-1' }]);
    repo().countCommunityVideos.mockResolvedValue(1);

    const res = await request(app)
      .get(`/api/v1/community/videos?communityId=${COMM_UUID}`)
      .set('Authorization', `Bearer ${memberToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('FR36: Meeting Links Endpoints', () => {
  it('POST /community/meetings — 201 creates meeting link for leader', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().createMeetingLink.mockResolvedValue({ id: 'meet-1', title: 'Q&A' });

    const res = await request(app)
      .post('/api/v1/community/meetings')
      .set('Authorization', `Bearer ${leaderToken()}`)
      .send({
        communityId: COMM_UUID,
        title: 'Q&A',
        meetingUrl: 'https://zoom.us/j/123456789',
        platform: 'ZOOM',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Q&A');
  });

  it('GET /community/meetings — 200 lists meeting links', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().findCommunityMember.mockResolvedValue({ id: 'mem-1' });
    repo().listMeetingLinks.mockResolvedValue([{ id: 'meet-1' }]);
    repo().countMeetingLinks.mockResolvedValue(1);

    const res = await request(app)
      .get(`/api/v1/community/meetings?communityId=${COMM_UUID}`)
      .set('Authorization', `Bearer ${memberToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('FR37: Campaign Content Endpoints', () => {
  it('POST /campaign-content — 201 submits campaign promotional content', async () => {
    repo().findCampaignById.mockResolvedValue({ id: CAMP_UUID, ownerId: BIZ_UUID, title: 'Campaign 1' });
    repo().createCampaignContent.mockResolvedValue({ id: CONTENT_UUID, title: 'My Reel' });

    const res = await request(app)
      .post('/api/v1/campaign-content')
      .set('Authorization', `Bearer ${memberToken()}`)
      .send({
        campaignId: CAMP_UUID,
        title: 'My Reel',
        videoUrl: 'https://cdn.example.com/reel.mp4',
        duration: 45,
        fileSize: 3000000,
        mimeType: 'video/mp4',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('My Reel');
  });

  it('GET /campaign-content — 200 lists submissions', async () => {
    repo().listCampaignContent.mockResolvedValue([{ id: CONTENT_UUID }]);
    repo().countCampaignContent.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/v1/campaign-content')
      .set('Authorization', `Bearer ${memberToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('PATCH /campaign-content/:id/review — 200 reviews submission for business owner', async () => {
    repo().findCampaignContentById.mockResolvedValue({
      id: CONTENT_UUID,
      campaignId: CAMP_UUID,
      campaign: { ownerId: BIZ_UUID, title: 'Campaign 1' },
      influencerId: MEMBER_UUID,
    });
    repo().updateCampaignContentStatus.mockResolvedValue({ id: CONTENT_UUID, status: 'APPROVED' });
    repo().createCampaignContentReview.mockResolvedValue({ id: 'rev-1', status: 'APPROVED' });

    const res = await request(app)
      .patch(`/api/v1/campaign-content/${CONTENT_UUID}/review`)
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ status: 'APPROVED', feedback: 'Awesome!' });

    expect(res.status).toBe(200);
  });
});
