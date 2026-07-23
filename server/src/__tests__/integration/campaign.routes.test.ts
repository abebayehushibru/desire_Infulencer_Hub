// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests — Campaign Routes (FR16–FR23)
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
    findCommunityByTitleExcluding: jest.fn(), listCommunities: jest.fn(), updateCommunity: jest.fn(),
    softDeleteCommunity: jest.fn(), findActiveCommunityByLeader: jest.fn(),
    addMember: jest.fn(), findMembership: jest.fn(), findMembershipById: jest.fn(),
    findActiveMembership: jest.fn(), removeMember: jest.fn(), listMembers: jest.fn(),
    getActiveMemberCount: jest.fn(), getCommission: jest.fn(), upsertCommission: jest.fn(),
    createCommissionHistory: jest.fn(), getCommissionHistory: jest.fn(),
    sealLatestCommissionHistory: jest.fn().mockResolvedValue(undefined),
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
const adminToken   = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b00', email: 'admin@x.com',   role: 'SYSTEM_ADMIN' });
const bizToken     = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', email: 'biz@x.com',     role: 'BUSINESS_OWNER' });
const diamondToken = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', email: 'diamond@x.com', role: 'DIAMOND_INFLUENCER' });
const goldToken    = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', email: 'gold@x.com',    role: 'GOLD_INFLUENCER' });
const agentToken   = () => signAccessToken({ sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', email: 'agent@x.com',   role: 'AGENT' });

const BIZ_UUID    = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01';
const CAMP_UUID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b10';
const COMM_UUID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11';
const INFLU_UUID  = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12';
const CONV_UUID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13';
const LEADER_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02';

const mockCampaign = (overrides: Record<string, any> = {}) => ({
  id: CAMP_UUID, ownerId: BIZ_UUID, title: 'Summer Sale', type: 'SALES',
  budget: 1000, targetPlatform: 'Instagram', status: 'DRAFT',
  payoutPerConversion: 10, trackingMethod: 'UNIQUE_LINK', communityId: COMM_UUID,
  startDate: new Date('2026-08-01'), endDate: new Date('2026-09-01'),
  createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
  owner: { id: BIZ_UUID, firstName: 'Jane', role: 'BUSINESS_OWNER' },
  community: { id: COMM_UUID, title: 'Fashion Hub', status: 'ACTIVE', communityLeaderId: LEADER_UUID },
  approvals: [],
  ...overrides,
});

const repo = () => require('../../modules/campaign/repositories/campaign.repository').campaignRepository;

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// FR16 — RBAC Guards
// ─────────────────────────────────────────────────────────────────────────────
describe('FR16: RBAC guards', () => {
  it('POST /campaigns — 401 without token', async () => {
    const res = await request(app).post('/api/v1/campaigns').send({ title: 'Test' });
    expect(res.status).toBe(401);
  });

  it('POST /campaigns — 403 for GOLD_INFLUENCER', async () => {
    const res = await request(app)
      .post('/api/v1/campaigns')
      .set('Authorization', `Bearer ${goldToken()}`)
      .send({ title: 'Test', type: 'SALES', budget: 100, targetPlatform: 'IG',
               startDate: '2026-08-01', endDate: '2026-09-01' });
    expect(res.status).toBe(403);
  });

  it('POST /campaigns — 403 for AGENT', async () => {
    const res = await request(app)
      .post('/api/v1/campaigns')
      .set('Authorization', `Bearer ${agentToken()}`)
      .send({ title: 'Test', type: 'SALES', budget: 100, targetPlatform: 'IG',
               startDate: '2026-08-01', endDate: '2026-09-01' });
    expect(res.status).toBe(403);
  });

  it('POST /campaigns — 422 when title missing', async () => {
    const res = await request(app)
      .post('/api/v1/campaigns')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ type: 'SALES', budget: 100, targetPlatform: 'IG',
               startDate: '2026-08-01', endDate: '2026-09-01' });
    expect(res.status).toBe(422);
  });

  it('POST /campaigns — 422 when budget is missing', async () => {
    const res = await request(app)
      .post('/api/v1/campaigns')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ title: 'Test', type: 'SALES', targetPlatform: 'IG',
               startDate: '2026-08-01', endDate: '2026-09-01' });
    expect(res.status).toBe(422);
  });

  it('POST /campaigns — 422 for invalid campaign type', async () => {
    const res = await request(app)
      .post('/api/v1/campaigns')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ title: 'Test', type: 'INVALID_TYPE', budget: 100, targetPlatform: 'IG',
               startDate: '2026-08-01', endDate: '2026-09-01' });
    expect(res.status).toBe(422);
  });

  it('PATCH /campaigns/:id — 422 for non-UUID id', async () => {
    const res = await request(app)
      .patch('/api/v1/campaigns/not-a-uuid')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ title: 'Updated' });
    expect(res.status).toBe(422);
  });

  it('DELETE /campaigns/:id — 403 for GOLD_INFLUENCER', async () => {
    const res = await request(app)
      .delete(`/api/v1/campaigns/${CAMP_UUID}`)
      .set('Authorization', `Bearer ${goldToken()}`);
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR16 — Happy path CRUD
// ─────────────────────────────────────────────────────────────────────────────
describe('FR16: Campaign CRUD — happy path', () => {
  it('POST /campaigns — 201 creates a SALES campaign', async () => {
    repo().findUserById.mockResolvedValue({
      id: BIZ_UUID, role: 'BUSINESS_OWNER', status: 'ACTIVE',
      businessProfile: { verificationStatus: 'APPROVED' },
    });
    repo().createCampaign.mockResolvedValue(mockCampaign());

    const res = await request(app)
      .post('/api/v1/campaigns')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({
        title: 'Summer Sale', type: 'SALES', budget: 1000, targetPlatform: 'Instagram',
        startDate: '2026-08-01T00:00:00Z', endDate: '2026-09-01T00:00:00Z',
        payoutPerConversion: 10, trackingMethod: 'UNIQUE_LINK',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Summer Sale');
  });

  it('GET /campaigns — 200 returns paginated list for owner', async () => {
    repo().listCampaigns.mockResolvedValue({ campaigns: [mockCampaign()], total: 1 });

    const res = await request(app)
      .get('/api/v1/campaigns')
      .set('Authorization', `Bearer ${bizToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body).toHaveProperty('meta');
  });

  it('GET /campaigns/:id — 200 returns campaign', async () => {
    repo().findCampaignById.mockResolvedValue(mockCampaign());

    const res = await request(app)
      .get(`/api/v1/campaigns/${CAMP_UUID}`)
      .set('Authorization', `Bearer ${bizToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(CAMP_UUID);
  });

  it('PATCH /campaigns/:id — 200 updates DRAFT campaign', async () => {
    repo().findCampaignById.mockResolvedValue(mockCampaign());
    repo().updateCampaign.mockResolvedValue(mockCampaign({ title: 'Updated Title' }));

    const res = await request(app)
      .patch(`/api/v1/campaigns/${CAMP_UUID}`)
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
  });

  it('DELETE /campaigns/:id — 200 soft-deletes DRAFT campaign', async () => {
    repo().findCampaignById.mockResolvedValue(mockCampaign());
    repo().softDeleteCampaign.mockResolvedValue({});

    const res = await request(app)
      .delete(`/api/v1/campaigns/${CAMP_UUID}`)
      .set('Authorization', `Bearer ${bizToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR18 — Submit
// ─────────────────────────────────────────────────────────────────────────────
describe('FR18: Submit campaign', () => {
  it('POST /campaigns/:id/submit — 403 for non-owner', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/submit`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ communityId: COMM_UUID });
    expect(res.status).toBe(403);
  });

  it('POST /campaigns/:id/submit — 422 for missing communityId', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/submit`)
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('POST /campaigns/:id/submit — 200 submits campaign', async () => {
    repo().findCampaignById.mockResolvedValue(mockCampaign());
    repo().findCommunityById.mockResolvedValue({
      id: COMM_UUID, status: 'ACTIVE', communityLeaderId: LEADER_UUID, _count: { members: 2 },
    });
    repo().updateCampaign.mockResolvedValue(mockCampaign({ status: 'PENDING_ADMIN_APPROVAL' }));

    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/submit`)
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ communityId: COMM_UUID });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDING_ADMIN_APPROVAL');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR19 — Admin Review
// ─────────────────────────────────────────────────────────────────────────────
describe('FR19: Admin review', () => {
  it('POST /campaigns/:id/admin-review — 403 for BUSINESS_OWNER', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/admin-review`)
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ action: 'approve' });
    expect(res.status).toBe(403);
  });

  it('POST /campaigns/:id/admin-review — 422 for invalid action', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/admin-review`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ action: 'maybe' });
    expect(res.status).toBe(422);
  });

  it('POST /campaigns/:id/admin-review — 422 reject without reason', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/admin-review`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ action: 'reject' });
    expect(res.status).toBe(422);
  });

  it('POST /campaigns/:id/admin-review — 200 approves campaign', async () => {
    repo().findCampaignById.mockResolvedValue(mockCampaign({ status: 'PENDING_ADMIN_APPROVAL' }));
    repo().updateCampaign.mockResolvedValue(mockCampaign({ status: 'PENDING_LEADER_APPROVAL' }));
    repo().createApproval.mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/admin-review`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ action: 'approve' });

    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR20 — Leader Review
// ─────────────────────────────────────────────────────────────────────────────
describe('FR20: Leader review', () => {
  it('POST /campaigns/:id/leader-review — 403 for BUSINESS_OWNER', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/leader-review`)
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ action: 'accept' });
    expect(res.status).toBe(403);
  });

  it('POST /campaigns/:id/leader-review — 422 for invalid action', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/leader-review`)
      .set('Authorization', `Bearer ${diamondToken()}`)
      .send({ action: 'maybe' });
    expect(res.status).toBe(422);
  });

  it('POST /campaigns/:id/leader-review — 422 reject without reason', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/leader-review`)
      .set('Authorization', `Bearer ${diamondToken()}`)
      .send({ action: 'reject' });
    expect(res.status).toBe(422);
  });

  it('POST /campaigns/:id/leader-review — 200 leader accepts', async () => {
    repo().findCampaignById.mockResolvedValue(mockCampaign({ status: 'PENDING_LEADER_APPROVAL' }));
    repo().updateCampaign.mockResolvedValue(mockCampaign({ status: 'ACTIVE' }));
    repo().createApproval.mockResolvedValue({});
    repo().findActiveCommunityMembers.mockResolvedValue([{ userId: INFLU_UUID }]);

    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/leader-review`)
      .set('Authorization', `Bearer ${diamondToken()}`)
      .send({ action: 'accept' });

    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR22 — Lifecycle
// ─────────────────────────────────────────────────────────────────────────────
describe('FR22: Campaign lifecycle', () => {
  it('POST /campaigns/:id/pause — 403 for GOLD_INFLUENCER', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/pause`)
      .set('Authorization', `Bearer ${goldToken()}`);
    expect(res.status).toBe(403);
  });

  it('POST /campaigns/:id/pause — 200 pauses ACTIVE campaign', async () => {
    repo().findCampaignById.mockResolvedValue(mockCampaign({ status: 'ACTIVE' }));
    repo().setCampaignStatus.mockResolvedValue(mockCampaign({ status: 'PAUSED' }));

    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/pause`)
      .set('Authorization', `Bearer ${bizToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PAUSED');
  });

  it('POST /campaigns/:id/complete — 200 completes ACTIVE campaign', async () => {
    repo().findCampaignById.mockResolvedValue(mockCampaign({ status: 'ACTIVE' }));
    repo().setCampaignStatus.mockResolvedValue(mockCampaign({ status: 'COMPLETED' }));

    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/complete`)
      .set('Authorization', `Bearer ${bizToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR21 — Tracking
// ─────────────────────────────────────────────────────────────────────────────
describe('FR21: Tracking resources', () => {
  it('GET /campaigns/:id/tracking — 403 for GOLD_INFLUENCER', async () => {
    const res = await request(app)
      .get(`/api/v1/campaigns/${CAMP_UUID}/tracking`)
      .set('Authorization', `Bearer ${goldToken()}`);
    expect(res.status).toBe(403);
  });

  it('GET /campaigns/:id/tracking — 200 returns tracking data', async () => {
    repo().findCampaignById.mockResolvedValue(mockCampaign({ status: 'ACTIVE' }));
    repo().listCampaignTracking.mockResolvedValue({ links: [], codes: [] });

    const res = await request(app)
      .get(`/api/v1/campaigns/${CAMP_UUID}/tracking`)
      .set('Authorization', `Bearer ${bizToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('links');
    expect(res.body.data).toHaveProperty('codes');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR23 — Manual Conversions
// ─────────────────────────────────────────────────────────────────────────────
describe('FR23: Manual conversions', () => {
  it('POST /campaigns/:id/conversions — 403 for ADMIN', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/conversions`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ influencerId: INFLU_UUID, amount: 50, convertedAt: '2026-08-15' });
    expect(res.status).toBe(403);
  });

  it('POST /campaigns/:id/conversions — 422 for missing influencerId', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/conversions`)
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ amount: 50, convertedAt: '2026-08-15' });
    expect(res.status).toBe(422);
  });

  it('POST /campaigns/:id/conversions — 422 for non-UUID influencerId', async () => {
    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/conversions`)
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ influencerId: 'bad-id', amount: 50, convertedAt: '2026-08-15' });
    expect(res.status).toBe(422);
  });

  it('POST /campaigns/:id/conversions — 201 records manual conversion', async () => {
    repo().findCampaignById.mockResolvedValue(mockCampaign({ status: 'ACTIVE', trackingMethod: 'MANUAL' }));
    repo().findActiveMembership.mockResolvedValue({ id: 'mem-1', status: 'ACTIVE' });
    repo().createConversion.mockResolvedValue({
      id: CONV_UUID, campaignId: CAMP_UUID, influencerId: INFLU_UUID, amount: 50,
    });

    const res = await request(app)
      .post(`/api/v1/campaigns/${CAMP_UUID}/conversions`)
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ influencerId: INFLU_UUID, amount: 50, convertedAt: '2026-08-15T10:00:00Z' });

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe(50);
  });

  it('PATCH /campaigns/:id/conversions/:conversionId — 422 for non-UUID conversionId', async () => {
    const res = await request(app)
      .patch(`/api/v1/campaigns/${CAMP_UUID}/conversions/not-uuid`)
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ amount: 75 });
    expect(res.status).toBe(422);
  });

  it('DELETE /campaigns/:id/conversions/:conversionId — 422 for non-UUID params', async () => {
    const res = await request(app)
      .delete(`/api/v1/campaigns/${CAMP_UUID}/conversions/bad`)
      .set('Authorization', `Bearer ${bizToken()}`);
    expect(res.status).toBe(422);
  });

  it('DELETE /campaigns/:id/conversions/:conversionId — 200 deletes conversion', async () => {
    repo().findCampaignById.mockResolvedValue(mockCampaign({ status: 'ACTIVE', trackingMethod: 'MANUAL' }));
    repo().findConversionById.mockResolvedValue({ id: CONV_UUID, campaignId: CAMP_UUID });
    repo().softDeleteConversion.mockResolvedValue({});

    const res = await request(app)
      .delete(`/api/v1/campaigns/${CAMP_UUID}/conversions/${CONV_UUID}`)
      .set('Authorization', `Bearer ${bizToken()}`);

    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Response Format Contract
// ─────────────────────────────────────────────────────────────────────────────
describe('Response format', () => {
  it('all campaign responses include success, message, data, timestamp', async () => {
    repo().listCampaigns.mockResolvedValue({ campaigns: [], total: 0 });

    const res = await request(app)
      .get('/api/v1/campaigns')
      .set('Authorization', `Bearer ${bizToken()}`);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('timestamp');
  });
});
