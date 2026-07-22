// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests — Community Routes (FR11–FR15)
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
    createCommunity:              jest.fn(),
    findCommunityById:            jest.fn(),
    findCommunityByTitle:         jest.fn(),
    findCommunityByTitleExcluding:jest.fn(),
    listCommunities:              jest.fn(),
    updateCommunity:              jest.fn(),
    softDeleteCommunity:          jest.fn(),
    findActiveCommunityByLeader:  jest.fn(),
    addMember:                    jest.fn(),
    findMembership:               jest.fn(),
    findActiveMembership:         jest.fn(),
    removeMember:                 jest.fn(),
    listMembers:                  jest.fn(),
    getActiveMemberCount:         jest.fn(),
    getCommission:                jest.fn(),
    upsertCommission:             jest.fn(),
    createCommissionHistory:      jest.fn(),
    getCommissionHistory:         jest.fn(),
    sealLatestCommissionHistory:  jest.fn().mockResolvedValue(undefined),
    getLeaderboard:               jest.fn(),
    getCommunityRankings:         jest.fn(),
    findUserById:                 jest.fn(),
    createAuditLog:               jest.fn(),
    createNotification:           jest.fn().mockResolvedValue(undefined),
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
const adminToken   = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00', email: 'admin@x.com',   role: 'SYSTEM_ADMIN' });
const diamondToken = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', email: 'diamond@x.com', role: 'DIAMOND_INFLUENCER' });
const goldToken    = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', email: 'gold@x.com',    role: 'GOLD_INFLUENCER' });
const bizToken     = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', email: 'biz@x.com',     role: 'BUSINESS_OWNER' });

// ── Reusable fixture IDs ──────────────────────────────────────────────────────
const COMM_UUID     = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20';
const LEADER_UUID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
const MEMBER_UUID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
const MEMBER_ROW_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21';

const mockCommunity = () => ({
  id: COMM_UUID, title: 'Fashion Hub', status: 'ACTIVE',
  communityLeaderId: LEADER_UUID, createdBy: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00',
  createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
  leader: { id: LEADER_UUID, firstName: 'Diamond', lastName: 'User', email: 'diamond@x.com', role: 'DIAMOND_INFLUENCER' },
  commission: null,
  _count: { members: 2 },
});

const repo = () => require('../../modules/community/repositories/community.repository').communityRepository;

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// FR11 — RBAC Guards
// ─────────────────────────────────────────────────────────────────────────────
describe('FR11: RBAC — Community creation', () => {
  it('POST /communities — 401 without token', async () => {
    const res = await request(app).post('/api/v1/communities').send({ title: 'X' });
    expect(res.status).toBe(401);
  });

  it('POST /communities — 403 for BUSINESS_OWNER', async () => {
    const res = await request(app)
      .post('/api/v1/communities')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ title: 'New Community' });
    expect(res.status).toBe(403);
  });

  it('POST /communities — 403 for GOLD_INFLUENCER', async () => {
    const res = await request(app)
      .post('/api/v1/communities')
      .set('Authorization', `Bearer ${goldToken()}`)
      .send({ title: 'New Community' });
    expect(res.status).toBe(403);
  });

  it('POST /communities — 422 when title missing', async () => {
    const res = await request(app)
      .post('/api/v1/communities')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('POST /communities — 422 when title too short', async () => {
    const res = await request(app)
      .post('/api/v1/communities')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'AB' });
    expect(res.status).toBe(422);
  });

  it('GET /communities — 403 for GOLD_INFLUENCER', async () => {
    const res = await request(app)
      .get('/api/v1/communities')
      .set('Authorization', `Bearer ${goldToken()}`);
    expect(res.status).toBe(403);
  });

  it('DELETE /communities/:id — 403 for DIAMOND_INFLUENCER', async () => {
    const res = await request(app)
      .delete(`/api/v1/communities/${COMM_UUID}`)
      .set('Authorization', `Bearer ${diamondToken()}`);
    expect(res.status).toBe(403);
  });

  it('PATCH /communities/:id — 422 for non-UUID id', async () => {
    const res = await request(app)
      .patch('/api/v1/communities/not-a-uuid')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'Valid Title' });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR11 — Happy Path: Create, List, Get, Update, Deactivate, Delete
// ─────────────────────────────────────────────────────────────────────────────
describe('FR11: Community CRUD — happy path', () => {
  it('POST /communities — 201 creates community', async () => {
    repo().findCommunityByTitle.mockResolvedValue(null);
    repo().createCommunity.mockResolvedValue({ id: COMM_UUID });
    repo().findCommunityById.mockResolvedValue(mockCommunity());

    const res = await request(app)
      .post('/api/v1/communities')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'Fashion Hub', description: 'A great community' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Fashion Hub');
  });

  it('GET /communities — 200 returns paginated list', async () => {
    repo().listCommunities.mockResolvedValue({ communities: [mockCommunity()], total: 1 });

    const res = await request(app)
      .get('/api/v1/communities')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta.total).toBe(1);
  });

  it('GET /communities/:id — 200 returns community for SYSTEM_ADMIN', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());

    const res = await request(app)
      .get(`/api/v1/communities/${COMM_UUID}`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(COMM_UUID);
  });

  it('PATCH /communities/:id — 200 updates community', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().findCommunityByTitleExcluding.mockResolvedValue(null);
    repo().updateCommunity.mockResolvedValue({});

    const res = await request(app)
      .patch(`/api/v1/communities/${COMM_UUID}`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
  });

  it('POST /communities/:id/deactivate — 200 deactivates', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().updateCommunity.mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/communities/${COMM_UUID}/deactivate`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
  });

  it('DELETE /communities/:id — 200 soft-deletes', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().softDeleteCommunity.mockResolvedValue({});

    const res = await request(app)
      .delete(`/api/v1/communities/${COMM_UUID}`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR12 — Commission
// ─────────────────────────────────────────────────────────────────────────────
describe('FR12: Commission', () => {
  it('PATCH /communities/:id/commission — 403 for non-admin', async () => {
    const res = await request(app)
      .patch(`/api/v1/communities/${COMM_UUID}/commission`)
      .set('Authorization', `Bearer ${goldToken()}`)
      .send({ platformFee: 20, leaderPercentage: 30, memberPercentage: 70 });
    expect(res.status).toBe(403);
  });

  it('PATCH /communities/:id/commission — 422 missing required fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/communities/${COMM_UUID}/commission`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ platformFee: 20 });
    expect(res.status).toBe(422);
  });

  it('PATCH /communities/:id/commission — 422 platformFee > 100', async () => {
    const res = await request(app)
      .patch(`/api/v1/communities/${COMM_UUID}/commission`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ platformFee: 110, leaderPercentage: 30, memberPercentage: 70 });
    expect(res.status).toBe(422);
  });

  it('PATCH /communities/:id/commission — 200 sets commission', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().upsertCommission.mockResolvedValue({ platformFee: 20, leaderPercentage: 30, memberPercentage: 70 });
    repo().createCommissionHistory.mockResolvedValue({});

    const res = await request(app)
      .patch(`/api/v1/communities/${COMM_UUID}/commission`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ platformFee: 20, leaderPercentage: 30, memberPercentage: 70 });

    expect(res.status).toBe(200);
  });

  it('GET /communities/:id/commission — 200 for Community Leader', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().getCommission.mockResolvedValue({ platformFee: 20, leaderPercentage: 30, memberPercentage: 70 });

    const res = await request(app)
      .get(`/api/v1/communities/${COMM_UUID}/commission`)
      .set('Authorization', `Bearer ${diamondToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.platformFee).toBe(20);
  });

  it('GET /communities/:id/commission/history — 403 for non-admin', async () => {
    const res = await request(app)
      .get(`/api/v1/communities/${COMM_UUID}/commission/history`)
      .set('Authorization', `Bearer ${goldToken()}`);
    expect(res.status).toBe(403);
  });

  it('GET /communities/:id/commission/history — 200 for admin', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().getCommissionHistory.mockResolvedValue([
      { id: 'h-1', platformFee: 20, leaderPercentage: 30, memberPercentage: 70, effectiveFrom: new Date() },
    ]);

    const res = await request(app)
      .get(`/api/v1/communities/${COMM_UUID}/commission/history`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.history).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR13 — Members
// ─────────────────────────────────────────────────────────────────────────────
describe('FR13: Members', () => {
  it('POST /communities/:id/members — 403 for GOLD_INFLUENCER (non-leader)', async () => {
    const res = await request(app)
      .post(`/api/v1/communities/${COMM_UUID}/members`)
      .set('Authorization', `Bearer ${goldToken()}`)
      .send({ userId: MEMBER_UUID });
    expect(res.status).toBe(403);
  });

  it('POST /communities/:id/members — 422 for missing userId', async () => {
    const res = await request(app)
      .post(`/api/v1/communities/${COMM_UUID}/members`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('POST /communities/:id/members — 422 for non-UUID userId', async () => {
    const res = await request(app)
      .post(`/api/v1/communities/${COMM_UUID}/members`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ userId: 'not-a-uuid' });
    expect(res.status).toBe(422);
  });

  it('POST /communities/:id/members — 201 adds member', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().findUserById.mockResolvedValue({ id: MEMBER_UUID, role: 'GOLD_INFLUENCER', status: 'ACTIVE' });
    repo().findActiveMembership.mockResolvedValue(null);
    repo().addMember.mockResolvedValue({ id: MEMBER_ROW_ID, userId: MEMBER_UUID, status: 'ACTIVE', joinedAt: new Date() });

    const res = await request(app)
      .post(`/api/v1/communities/${COMM_UUID}/members`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ userId: MEMBER_UUID });

    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe(MEMBER_UUID);
  });

  it('GET /communities/:id/members — 403 for BUSINESS_OWNER', async () => {
    const res = await request(app)
      .get(`/api/v1/communities/${COMM_UUID}/members`)
      .set('Authorization', `Bearer ${bizToken()}`);
    expect(res.status).toBe(403);
  });

  it('GET /communities/:id/members — 200 for admin', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().listMembers.mockResolvedValue({
      members: [{ id: MEMBER_ROW_ID, userId: MEMBER_UUID, status: 'ACTIVE', joinedAt: new Date(), user: {} }],
      total: 1,
    });

    const res = await request(app)
      .get(`/api/v1/communities/${COMM_UUID}/members`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('DELETE /communities/:id/members/:memberId — 403 for GOLD_INFLUENCER', async () => {
    const res = await request(app)
      .delete(`/api/v1/communities/${COMM_UUID}/members/${MEMBER_ROW_ID}`)
      .set('Authorization', `Bearer ${goldToken()}`);
    expect(res.status).toBe(403);
  });

  it('DELETE /communities/:id/members/:memberId — 422 for non-UUID memberId', async () => {
    const res = await request(app)
      .delete(`/api/v1/communities/${COMM_UUID}/members/bad-id`)
      .set('Authorization', `Bearer ${adminToken()}`);
    expect(res.status).toBe(422);
  });

  it('DELETE /communities/:id/members/:memberId — 200 removes member', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().findMembership.mockResolvedValue({ id: MEMBER_ROW_ID, userId: MEMBER_UUID, status: 'ACTIVE' });
    repo().removeMember.mockResolvedValue({ id: MEMBER_ROW_ID, status: 'REMOVED', leftAt: new Date() });

    const res = await request(app)
      .delete(`/api/v1/communities/${COMM_UUID}/members/${MEMBER_ROW_ID}`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REMOVED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR14 — Leaderboard
// ─────────────────────────────────────────────────────────────────────────────
describe('FR14: Leaderboard', () => {
  it('GET /communities/:id/leaderboard — 403 for BUSINESS_OWNER', async () => {
    const res = await request(app)
      .get(`/api/v1/communities/${COMM_UUID}/leaderboard`)
      .set('Authorization', `Bearer ${bizToken()}`);
    expect(res.status).toBe(403);
  });

  it('GET /communities/:id/leaderboard — 422 for invalid sortBy', async () => {
    const res = await request(app)
      .get(`/api/v1/communities/${COMM_UUID}/leaderboard?sortBy=invalidField`)
      .set('Authorization', `Bearer ${adminToken()}`);
    expect(res.status).toBe(422);
  });

  it('GET /communities/:id/leaderboard — 200 for admin', async () => {
    repo().findCommunityById.mockResolvedValue(mockCommunity());
    repo().getLeaderboard.mockResolvedValue({
      entries: [{ rank: 1, userId: MEMBER_UUID, totalConversions: 0, totalEarnings: 0, campaignActivity: 0 }],
      total: 1,
    });

    const res = await request(app)
      .get(`/api/v1/communities/${COMM_UUID}/leaderboard`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR15 — Cross-Community Rankings
// ─────────────────────────────────────────────────────────────────────────────
describe('FR15: Community Rankings', () => {
  it('GET /communities/rankings — 403 for GOLD_INFLUENCER', async () => {
    const res = await request(app)
      .get('/api/v1/communities/rankings')
      .set('Authorization', `Bearer ${goldToken()}`);
    expect(res.status).toBe(403);
  });

  it('GET /communities/rankings — 401 without token', async () => {
    const res = await request(app).get('/api/v1/communities/rankings');
    expect(res.status).toBe(401);
  });

  it('GET /communities/rankings — 422 for invalid sortBy', async () => {
    const res = await request(app)
      .get('/api/v1/communities/rankings?sortBy=badField')
      .set('Authorization', `Bearer ${adminToken()}`);
    expect(res.status).toBe(422);
  });

  it('GET /communities/rankings — 200 returns paginated rankings', async () => {
    repo().getCommunityRankings.mockResolvedValue({
      rankings: [
        { rank: 1, communityId: COMM_UUID, title: 'Fashion Hub', memberCount: 5, totalEarnings: 0, totalConversions: 0 },
      ],
      total: 1,
    });

    const res = await request(app)
      .get('/api/v1/communities/rankings')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].rank).toBe(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('GET /communities/rankings — passes status filter', async () => {
    repo().getCommunityRankings.mockResolvedValue({ rankings: [], total: 0 });

    await request(app)
      .get('/api/v1/communities/rankings?status=ACTIVE')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(repo().getCommunityRankings).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ACTIVE' }),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Response Format Contract
// ─────────────────────────────────────────────────────────────────────────────
describe('Response Format Contract', () => {
  it('all community responses include success, message, data, timestamp', async () => {
    repo().getCommunityRankings.mockResolvedValue({ rankings: [], total: 0 });

    const res = await request(app)
      .get('/api/v1/communities/rankings')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('timestamp');
  });
});
