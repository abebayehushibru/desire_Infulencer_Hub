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
  default: { $connect: jest.fn(), $disconnect: jest.fn(), $on: jest.fn() },
}));
jest.mock('../../modules/auth/repositories/auth.repository', () => ({
  authRepository: {
    findUserByEmail: jest.fn(), findUserById: jest.fn(), createUser: jest.fn(),
    updateLastLogin: jest.fn(), incrementFailedAttempts: jest.fn(), lockUserAccount: jest.fn(),
    resetFailedAttempts: jest.fn(), markEmailVerified: jest.fn(), updatePassword: jest.fn(),
    createRefreshToken: jest.fn(), findRefreshTokenByHash: jest.fn(), revokeRefreshToken: jest.fn(),
    revokeTokenFamily: jest.fn(), revokeAllUserRefreshTokens: jest.fn(),
    invalidatePreviousPasswordResets: jest.fn().mockResolvedValue(undefined),
    createPasswordReset: jest.fn().mockResolvedValue({}),
    findLatestPasswordReset: jest.fn(), markPasswordResetUsed: jest.fn(),
    invalidatePreviousVerifications: jest.fn().mockResolvedValue(undefined),
    createEmailVerification: jest.fn().mockResolvedValue({}),
    findLatestEmailVerification: jest.fn(), markEmailVerificationUsed: jest.fn(),
    createAuditLog: jest.fn().mockResolvedValue(undefined),
    findAllUsers: jest.fn().mockResolvedValue([]),
  },
}));
jest.mock('../../modules/users/repositories/user-management.repository', () => ({
  userManagementRepository: {
    createUser: jest.fn(), findUserById: jest.fn(), findUserByEmail: jest.fn(),
    findUserWithProfiles: jest.fn(), listUsers: jest.fn(), updateUser: jest.fn(),
    deactivateUser: jest.fn(), reactivateUser: jest.fn(),
    createBusinessProfile: jest.fn(), findBusinessProfileByUserId: jest.fn(),
    findBusinessProfileById: jest.fn(), listBusinessProfiles: jest.fn(),
    updateBusinessProfile: jest.fn(), createBusinessDocument: jest.fn(),
    approveBusinessProfile: jest.fn(), rejectBusinessProfile: jest.fn(),
    createInfluencerProfile: jest.fn(), findInfluencerProfileByUserId: jest.fn(),
    updateInfluencerProfile: jest.fn(), assignTier: jest.fn(), getTierHistory: jest.fn(),
    setCommunityLeader: jest.fn(), createAgentProfile: jest.fn(),
    findAgentProfileByUserId: jest.fn(), updateAgentProfile: jest.fn(),
    createNotification: jest.fn().mockResolvedValue({}),
    getNotifications: jest.fn().mockResolvedValue([]),
    markNotificationRead: jest.fn().mockResolvedValue(undefined),
    markAllNotificationsRead: jest.fn().mockResolvedValue(undefined),
    createAuditLog: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../modules/community/repositories/community.repository', () => ({
  communityRepository: {
    createCommunity: jest.fn(), findCommunityById: jest.fn(), findCommunityByTitle: jest.fn(),
    findCommunityByTitleExcluding: jest.fn(), listCommunities: jest.fn(),
    updateCommunity: jest.fn(), softDeleteCommunity: jest.fn(),
    findActiveCommunityByLeader: jest.fn(), addMember: jest.fn(),
    findMembership: jest.fn(), findMembershipById: jest.fn(), findActiveMembership: jest.fn(),
    removeMember: jest.fn(), listMembers: jest.fn(), getActiveMemberCount: jest.fn(),
    getCommission: jest.fn(), upsertCommission: jest.fn(), createCommissionHistory: jest.fn(),
    getCommissionHistory: jest.fn(), sealLatestCommissionHistory: jest.fn().mockResolvedValue(undefined),
    getLeaderboard: jest.fn(), getCommunityRankings: jest.fn(),
    findUserById: jest.fn(), createAuditLog: jest.fn(),
    createNotification: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../modules/campaign/repositories/campaign.repository', () => ({
  campaignRepository: {
    createCampaign: jest.fn(), findCampaignById: jest.fn(), listCampaigns: jest.fn(),
    updateCampaign: jest.fn(), softDeleteCampaign: jest.fn(), setCampaignStatus: jest.fn(),
    createApproval: jest.fn(), findLatestApprovalByRole: jest.fn(),
    createTrackingLink: jest.fn(), findTrackingLink: jest.fn(), findTrackingLinkByCode: jest.fn(),
    createReferralCode: jest.fn(), findReferralCode: jest.fn(), findReferralCodeByCode: jest.fn(),
    listCampaignTracking: jest.fn(), bulkCreateTrackingResources: jest.fn().mockResolvedValue(undefined),
    createConversion: jest.fn(), findConversionById: jest.fn(), listConversions: jest.fn(),
    updateConversion: jest.fn(), softDeleteConversion: jest.fn(),
    findCommunityById: jest.fn(), findActiveCommunityMembers: jest.fn(),
    findUserById: jest.fn(), findActiveMembership: jest.fn(),
    createAuditLog: jest.fn(), createNotification: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../modules/tracking/repositories/tracking.repository', () => ({
  trackingRepository: {
    createTrackingEvent: jest.fn(), markEventConverted: jest.fn(),
    findTrackingEventByLinkAndIp: jest.fn(), findConversionByTrackingLink: jest.fn(),
    findConversionByReferralCode: jest.fn(), getTrackingEventsByCampaign: jest.fn(),
    findTrackingLinkByCode: jest.fn(), findReferralCodeByCode: jest.fn(),
    incrementTrackingLinkClickCount: jest.fn(), incrementReferralCodeUseCount: jest.fn(),
    createEarningWithCalc: jest.fn(), listEarnings: jest.fn(), getEarningsByCampaign: jest.fn(),
    sumEarnings: jest.fn().mockResolvedValue(0), getMonthlyEarnings: jest.fn().mockResolvedValue([]),
    settleEarning: jest.fn(), settleEarningsByTrackingEvent: jest.fn(), markEarningsWithdrawn: jest.fn(),
    getBalance: jest.fn().mockResolvedValue(null), upsertBalance: jest.fn(),
    debitAvailableBalance: jest.fn(), createWithdrawal: jest.fn(), findWithdrawalById: jest.fn(),
    listWithdrawals: jest.fn(), updateWithdrawalStatus: jest.fn(), hasPendingWithdrawal: jest.fn(),
    getBusinessAnalytics: jest.fn(), getCommunityMemberPerformance: jest.fn(), getMemberStats: jest.fn(),
    findCommunityWithCommission: jest.fn(), findCampaignById: jest.fn(),
    createAuditLog: jest.fn(), createNotification: jest.fn().mockResolvedValue(undefined),
    cancelWithdrawalTransaction: jest.fn(),
  },
}));
jest.mock('../../modules/chat/repositories/chat.repository', () => ({
  chatRepository: {
    findUserById: jest.fn(), findCommunityById: jest.fn(), findCommunityMember: jest.fn(),
    findCampaignById: jest.fn(), findCommunityConversation: jest.fn(),
    createCommunityConversation: jest.fn(), findDirectConversationBetweenUsers: jest.fn(),
    createDirectConversation: jest.fn(), findConversationById: jest.fn(),
    listUserDirectConversations: jest.fn(), countUserDirectConversations: jest.fn(),
    findParticipant: jest.fn(), addParticipant: jest.fn(), updateLastReadAt: jest.fn(),
    createMessage: jest.fn(), findMessageById: jest.fn(), listConversationMessages: jest.fn(),
    countConversationMessages: jest.fn(), softDeleteMessage: jest.fn(), markMessageRead: jest.fn(),
    createVoiceMessage: jest.fn(), createCommunityVideo: jest.fn(), listCommunityVideos: jest.fn(),
    countCommunityVideos: jest.fn(), findCommunityVideoById: jest.fn(), createMeetingLink: jest.fn(),
    listMeetingLinks: jest.fn(), countMeetingLinks: jest.fn(), findMeetingLinkById: jest.fn(),
    createCampaignContent: jest.fn(), findCampaignContentById: jest.fn(),
    listCampaignContent: jest.fn(), countCampaignContent: jest.fn(),
    updateCampaignContentStatus: jest.fn(), createCampaignContentReview: jest.fn(),
    createAuditLog: jest.fn(), createNotification: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../common/email/email.service', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendBusinessVerificationEmail: jest.fn().mockResolvedValue(undefined),
    verifyConnection: jest.fn().mockResolvedValue(true),
  },
}));

import request from 'supertest';
import app from '../../app';
import { signAccessToken } from '../../common/utils/jwt.util';

// ── Token helpers ─────────────────────────────────────────────────────────────
const adminToken    = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d00', email: 'admin@x.com',    role: 'SUPER_ADMIN' });
const influencerToken = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', email: 'inf@x.com',   role: 'INFLUENCER' });
const bizToken      = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02', email: 'biz@x.com',     role: 'BUSINESS' });
const agentToken    = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d03', email: 'agent@x.com',   role: 'AGENT' });

const COMM_UUID  = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d10';
const MSG_UUID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11';
const CONV_UUID  = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d12';
const CAMP_UUID  = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d13';
const INF_UUID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01';
const BIZ_UUID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02';
const CONT_UUID  = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380d14';

const chatRepo   = () => require('../../modules/chat/repositories/chat.repository').chatRepository;

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// FR32 — Community Chat
// ─────────────────────────────────────────────────────────────────────────────
describe('FR32: Community Chat', () => {
  it('GET /chat/communities/:id/messages — 401 without token', async () => {
    const res = await request(app).get(`/api/v1/chat/communities/${COMM_UUID}/messages`);
    expect(res.status).toBe(401);
  });

  it('GET /chat/communities/:id/messages — 422 for non-UUID communityId', async () => {
    const res = await request(app)
      .get('/api/v1/chat/communities/bad-uuid/messages')
      .set('Authorization', `Bearer ${adminToken()}`);
    expect(res.status).toBe(422);
  });

  it('GET /chat/communities/:id/messages — 200 for SUPER_ADMIN', async () => {
    chatRepo().findCommunityById.mockResolvedValue({
      id: COMM_UUID, status: 'ACTIVE', communityLeaderId: INF_UUID, deletedAt: null,
    });
    chatRepo().findCommunityMember.mockResolvedValue(null);
    chatRepo().findCommunityConversation.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/v1/chat/communities/${COMM_UUID}/messages`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('POST /chat/communities/:id/messages — 422 for missing content', async () => {
    const res = await request(app)
      .post(`/api/v1/chat/communities/${COMM_UUID}/messages`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('POST /chat/communities/:id/messages — 201 sends message', async () => {
    chatRepo().findCommunityById.mockResolvedValue({
      id: COMM_UUID, status: 'ACTIVE', communityLeaderId: INF_UUID, deletedAt: null,
    });
    chatRepo().findCommunityMember.mockResolvedValue(null); // leader
    chatRepo().findCommunityConversation.mockResolvedValue({ id: CONV_UUID, participants: [] });
    chatRepo().findParticipant.mockResolvedValue({ id: 'p-1' });
    chatRepo().createMessage.mockResolvedValue({
      id: MSG_UUID, content: 'Hello', messageType: 'TEXT',
      sender: { id: INF_UUID, firstName: 'Inf', lastName: 'User', role: 'INFLUENCER' },
      readReceipts: [], voiceMessage: null,
    });
    chatRepo().markMessageRead.mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/chat/communities/${COMM_UUID}/messages`)
      .set('Authorization', `Bearer ${influencerToken()}`)
      .send({ content: 'Hello' });

    expect(res.status).toBe(201);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR33 — Direct Messages
// ─────────────────────────────────────────────────────────────────────────────
describe('FR33: Direct Messages', () => {
  it('GET /chat/direct — 401 without token', async () => {
    const res = await request(app).get('/api/v1/chat/direct');
    expect(res.status).toBe(401);
  });

  it('GET /chat/direct — 200 returns empty list', async () => {
    chatRepo().listUserDirectConversations.mockResolvedValue([]);
    chatRepo().countUserDirectConversations.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/v1/chat/direct')
      .set('Authorization', `Bearer ${bizToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('POST /chat/direct — 422 for missing recipientId', async () => {
    const res = await request(app)
      .post('/api/v1/chat/direct')
      .set('Authorization', `Bearer ${agentToken()}`)
      .send({ content: 'Hi there' });
    expect(res.status).toBe(422);
  });

  it('POST /chat/direct — 422 for non-UUID recipientId', async () => {
    const res = await request(app)
      .post('/api/v1/chat/direct')
      .set('Authorization', `Bearer ${agentToken()}`)
      .send({ recipientId: 'not-a-uuid', content: 'Hi' });
    expect(res.status).toBe(422);
  });

  it('PATCH /chat/messages/:id/read — 422 for non-UUID messageId', async () => {
    const res = await request(app)
      .patch('/api/v1/chat/messages/not-uuid/read')
      .set('Authorization', `Bearer ${influencerToken()}`);
    expect(res.status).toBe(422);
  });

  it('DELETE /chat/messages/:id — 401 without token', async () => {
    const res = await request(app).delete(`/api/v1/chat/messages/${MSG_UUID}`);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR34 — Voice Messages
// ─────────────────────────────────────────────────────────────────────────────
describe('FR34: Voice Messages', () => {
  it('POST /chat/voice — 422 for missing fileUrl', async () => {
    const res = await request(app)
      .post('/api/v1/chat/voice')
      .set('Authorization', `Bearer ${influencerToken()}`)
      .send({ conversationId: CONV_UUID, fileSize: 1024, duration: 10, mimeType: 'audio/webm' });
    expect(res.status).toBe(422);
  });

  it('POST /chat/voice — 422 for invalid mimeType', async () => {
    const res = await request(app)
      .post('/api/v1/chat/voice')
      .set('Authorization', `Bearer ${influencerToken()}`)
      .send({
        conversationId: CONV_UUID, fileUrl: 'https://cdn.example.com/v.mp4',
        fileSize: 1024, duration: 10, mimeType: 'video/mp4',
      });
    expect(res.status).toBe(422);
  });

  it('POST /chat/voice — 422 for fileSize > 10MB', async () => {
    const res = await request(app)
      .post('/api/v1/chat/voice')
      .set('Authorization', `Bearer ${influencerToken()}`)
      .send({
        conversationId: CONV_UUID, fileUrl: 'https://cdn.example.com/v.webm',
        fileSize: 15 * 1024 * 1024, duration: 10, mimeType: 'audio/webm',
      });
    expect(res.status).toBe(422);
  });

  it('POST /chat/voice — 401 without token', async () => {
    const res = await request(app).post('/api/v1/chat/voice').send({});
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR35 — Community Videos
// ─────────────────────────────────────────────────────────────────────────────
describe('FR35: Community Videos', () => {
  it('POST /community/videos — 401 without token', async () => {
    const res = await request(app).post('/api/v1/community/videos').send({});
    expect(res.status).toBe(401);
  });

  it('POST /community/videos — 422 for missing title', async () => {
    const res = await request(app)
      .post('/api/v1/community/videos')
      .set('Authorization', `Bearer ${influencerToken()}`)
      .send({ communityId: COMM_UUID, videoUrl: 'https://cdn.example.com/v.mp4', duration: 60, fileSize: 1024, mimeType: 'video/mp4' });
    expect(res.status).toBe(422);
  });

  it('POST /community/videos — 422 for invalid mimeType', async () => {
    const res = await request(app)
      .post('/api/v1/community/videos')
      .set('Authorization', `Bearer ${influencerToken()}`)
      .send({
        communityId: COMM_UUID, title: 'My Video',
        videoUrl: 'https://cdn.example.com/v.mp4',
        duration: 60, fileSize: 1024, mimeType: 'audio/webm',
      });
    expect(res.status).toBe(422);
  });

  it('GET /community/videos — 422 when communityId missing', async () => {
    const res = await request(app)
      .get('/api/v1/community/videos')
      .set('Authorization', `Bearer ${influencerToken()}`);
    expect(res.status).toBe(422);
  });

  it('GET /community/videos — 200 returns paginated list', async () => {
    chatRepo().findCommunityById.mockResolvedValue({
      id: COMM_UUID, status: 'ACTIVE', communityLeaderId: INF_UUID, deletedAt: null,
    });
    chatRepo().findCommunityMember.mockResolvedValue({ id: 'mem-1' });
    chatRepo().listCommunityVideos.mockResolvedValue([]);
    chatRepo().countCommunityVideos.mockResolvedValue(0);

    const res = await request(app)
      .get(`/api/v1/community/videos?communityId=${COMM_UUID}`)
      .set('Authorization', `Bearer ${influencerToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR36 — Meeting Links
// ─────────────────────────────────────────────────────────────────────────────
describe('FR36: Meeting Links', () => {
  it('POST /community/meetings — 401 without token', async () => {
    const res = await request(app).post('/api/v1/community/meetings').send({});
    expect(res.status).toBe(401);
  });

  it('POST /community/meetings — 422 for invalid meetingUrl', async () => {
    const res = await request(app)
      .post('/api/v1/community/meetings')
      .set('Authorization', `Bearer ${influencerToken()}`)
      .send({ communityId: COMM_UUID, title: 'Meeting', meetingUrl: 'not-a-url' });
    expect(res.status).toBe(422);
  });

  it('POST /community/meetings — 422 for invalid platform', async () => {
    const res = await request(app)
      .post('/api/v1/community/meetings')
      .set('Authorization', `Bearer ${influencerToken()}`)
      .send({
        communityId: COMM_UUID, title: 'Sync',
        meetingUrl: 'https://meet.google.com/abc',
        platform: 'SLACK',
      });
    expect(res.status).toBe(422);
  });

  it('GET /community/meetings — 422 when communityId missing', async () => {
    const res = await request(app)
      .get('/api/v1/community/meetings')
      .set('Authorization', `Bearer ${influencerToken()}`);
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR37 — Campaign Content
// ─────────────────────────────────────────────────────────────────────────────
describe('FR37: Campaign Content', () => {
  it('POST /campaign-content — 401 without token', async () => {
    const res = await request(app).post('/api/v1/campaign-content').send({});
    expect(res.status).toBe(401);
  });

  it('POST /campaign-content — 422 for non-UUID campaignId', async () => {
    const res = await request(app)
      .post('/api/v1/campaign-content')
      .set('Authorization', `Bearer ${influencerToken()}`)
      .send({ campaignId: 'bad-id', title: 'Test', videoUrl: 'https://cdn.example.com/v.mp4', duration: 60, fileSize: 1024, mimeType: 'video/mp4' });
    expect(res.status).toBe(422);
  });

  it('POST /campaign-content — 201 creates content submission', async () => {
    chatRepo().findCampaignById.mockResolvedValue({
      id: CAMP_UUID, title: 'Summer Sale', ownerId: BIZ_UUID,
    });
    chatRepo().createCampaignContent.mockResolvedValue({
      id: CONT_UUID, campaignId: CAMP_UUID, influencerId: INF_UUID,
      campaign: { id: CAMP_UUID, title: 'Summer Sale', ownerId: BIZ_UUID },
      influencer: { id: INF_UUID },
    });

    const res = await request(app)
      .post('/api/v1/campaign-content')
      .set('Authorization', `Bearer ${influencerToken()}`)
      .send({
        campaignId: CAMP_UUID, title: 'My Promo',
        videoUrl: 'https://cdn.example.com/promo.mp4',
        duration: 60, fileSize: 1024 * 1024, mimeType: 'video/mp4',
      });

    expect(res.status).toBe(201);
  });

  it('PATCH /campaign-content/:id/review — 403 for INFLUENCER', async () => {
    const res = await request(app)
      .patch(`/api/v1/campaign-content/${CONT_UUID}/review`)
      .set('Authorization', `Bearer ${influencerToken()}`)
      .send({ status: 'APPROVED' });
    expect(res.status).toBe(403);
  });

  it('PATCH /campaign-content/:id/review — 422 for invalid status', async () => {
    const res = await request(app)
      .patch(`/api/v1/campaign-content/${CONT_UUID}/review`)
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ status: 'MAYBE' });
    expect(res.status).toBe(422);
  });

  it('GET /campaign-content — 200 returns content list', async () => {
    chatRepo().listCampaignContent.mockResolvedValue([]);
    chatRepo().countCampaignContent.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/v1/campaign-content')
      .set('Authorization', `Bearer ${bizToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('Response format — has success, message, data, timestamp', async () => {
    chatRepo().listCampaignContent.mockResolvedValue([]);
    chatRepo().countCampaignContent.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/v1/campaign-content')
      .set('Authorization', `Bearer ${bizToken()}`);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('timestamp');
  });
});
