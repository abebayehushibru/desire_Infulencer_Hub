// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests — User Management Routes (FR06–FR10)
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
  default: { $connect: jest.fn().mockResolvedValue(undefined), $disconnect: jest.fn(), $on: jest.fn() },
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
    createUser:                   jest.fn(),
    findUserById:                 jest.fn(),
    findUserByEmail:              jest.fn(),
    findUserWithProfiles:         jest.fn(),
    listUsers:                    jest.fn(),
    updateUser:                   jest.fn(),
    deactivateUser:               jest.fn(),
    reactivateUser:               jest.fn(),
    createBusinessProfile:        jest.fn(),
    findBusinessProfileByUserId:  jest.fn(),
    findBusinessProfileById:      jest.fn(),
    listBusinessProfiles:         jest.fn(),
    updateBusinessProfile:        jest.fn(),
    createBusinessDocument:       jest.fn(),
    approveBusinessProfile:       jest.fn(),
    rejectBusinessProfile:        jest.fn(),
    createInfluencerProfile:      jest.fn(),
    findInfluencerProfileByUserId: jest.fn(),
    updateInfluencerProfile:      jest.fn(),
    assignTier:                   jest.fn(),
    getTierHistory:               jest.fn(),
    setCommunityLeader:           jest.fn(),
    createAgentProfile:           jest.fn(),
    findAgentProfileByUserId:     jest.fn(),
    updateAgentProfile:           jest.fn(),
    createNotification:           jest.fn().mockResolvedValue({}),
    getNotifications:             jest.fn().mockResolvedValue([]),
    markNotificationRead:         jest.fn().mockResolvedValue(undefined),
    markAllNotificationsRead:     jest.fn().mockResolvedValue(undefined),
    createAuditLog:               jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../common/email/email.service', () => ({
  emailService: {
    sendVerificationEmail:           jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail:          jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail:                jest.fn().mockResolvedValue(undefined),
    sendPasswordChangedEmail:        jest.fn().mockResolvedValue(undefined),
    sendBusinessVerificationEmail:   jest.fn().mockResolvedValue(undefined),
    verifyConnection:                jest.fn().mockResolvedValue(true),
  },
}));

import request from 'supertest';
import app from '../../app';
import { signAccessToken } from '../../common/utils/jwt.util';

// ── Token helpers ─────────────────────────────────────────────────────────────
const adminToken  = () => signAccessToken({ sub: 'admin-1',  email: 'admin@x.com',  role: 'SYSTEM_ADMIN' });
const bizToken    = () => signAccessToken({ sub: 'biz-1',    email: 'biz@x.com',    role: 'BUSINESS_OWNER' });
const agentToken  = () => signAccessToken({ sub: 'agent-1',  email: 'agent@x.com',  role: 'AGENT' });
const silverToken = () => signAccessToken({ sub: 'silver-1', email: 'silver@x.com', role: 'SILVER_INFLUENCER' });

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// FR06 — Admin User Management RBAC
// ─────────────────────────────────────────────────────────────────────────────
describe('FR06: Admin routes RBAC', () => {

  it('GET /admin/users — 401 without token', async () => {
    const res = await request(app).get('/api/v1/users/admin/users');
    expect(res.status).toBe(401);
  });

  it('GET /admin/users — 403 for non-admin role', async () => {
    const res = await request(app)
      .get('/api/v1/users/admin/users')
      .set('Authorization', `Bearer ${bizToken()}`);
    expect(res.status).toBe(403);
  });

  it('GET /admin/users — 200 for SYSTEM_ADMIN', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.listUsers.mockResolvedValue({ users: [], total: 0 });

    const res = await request(app)
      .get('/api/v1/users/admin/users')
      .set('Authorization', `Bearer ${adminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('meta');
  });

  it('POST /admin/business-owners — 403 for AGENT', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/business-owners')
      .set('Authorization', `Bearer ${agentToken()}`)
      .send({ firstName: 'Jane', lastName: 'Doe', email: 'j@x.com', password: 'Pass@123A' });
    expect(res.status).toBe(403);
  });

  it('POST /admin/business-owners — 422 for missing password', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/business-owners')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ firstName: 'Jane', lastName: 'Doe', email: 'j@x.com' });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR07 — Business Profile
// ─────────────────────────────────────────────────────────────────────────────
describe('FR07: Business Profile', () => {

  it('POST /business/profile — 403 for SILVER_INFLUENCER', async () => {
    const res = await request(app)
      .post('/api/v1/users/business/profile')
      .set('Authorization', `Bearer ${silverToken()}`)
      .send({ businessName: 'My Biz' });
    expect(res.status).toBe(403);
  });

  it('POST /business/profile — 422 when businessName missing', async () => {
    const res = await request(app)
      .post('/api/v1/users/business/profile')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('POST /business/profile — 401 without token', async () => {
    const res = await request(app).post('/api/v1/users/business/profile').send({ businessName: 'X' });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR08 — Business Verification
// ─────────────────────────────────────────────────────────────────────────────
describe('FR08: Business Verification', () => {

  it('POST /admin/businesses/:id/review — 403 for non-admin', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/businesses/some-uuid/review')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ action: 'approve' });
    expect(res.status).toBe(403);
  });

  it('POST /admin/businesses/:id/review — 422 reject without reason', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/businesses/some-uuid/review')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ action: 'reject' });
    expect(res.status).toBe(422);
  });

  it('POST /admin/businesses/:id/review — 422 invalid action', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/businesses/some-uuid/review')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ action: 'maybe' });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR09 — Influencer Tiers
// ─────────────────────────────────────────────────────────────────────────────
describe('FR09: Influencer Tiers', () => {

  it('POST /admin/users/:id/assign-tier — 422 for invalid tier', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/users/some-uuid/assign-tier')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ tier: 'PLATINUM' });
    expect(res.status).toBe(422);
  });

  it('POST /admin/users/:id/assign-tier — 403 for non-admin', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/users/some-uuid/assign-tier')
      .set('Authorization', `Bearer ${silverToken()}`)
      .send({ tier: 'GOLD' });
    expect(res.status).toBe(403);
  });

  it('GET /influencer/profile — 403 for BUSINESS_OWNER', async () => {
    const res = await request(app)
      .get('/api/v1/users/influencer/profile')
      .set('Authorization', `Bearer ${bizToken()}`);
    expect(res.status).toBe(403);
  });

  it('GET /influencer/profile — 401 without token', async () => {
    const res = await request(app).get('/api/v1/users/influencer/profile');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR10 — Agent Role
// ─────────────────────────────────────────────────────────────────────────────
describe('FR10: Agent Role', () => {

  it('GET /agent/businesses — 200 for AGENT', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.listBusinessProfiles.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/v1/users/agent/businesses')
      .set('Authorization', `Bearer ${agentToken()}`);
    expect(res.status).toBe(200);
  });

  it('GET /agent/businesses — 403 for SILVER_INFLUENCER', async () => {
    const res = await request(app)
      .get('/api/v1/users/agent/businesses')
      .set('Authorization', `Bearer ${silverToken()}`);
    expect(res.status).toBe(403);
  });

  it('POST /agent/profile — 403 for BUSINESS_OWNER', async () => {
    const res = await request(app)
      .post('/api/v1/users/agent/profile')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ agencyName: 'Top Agency' });
    expect(res.status).toBe(403);
  });

  it('PATCH /admin/users/:id — 403 for AGENT (cannot modify admin resources)', async () => {
    const res = await request(app)
      .patch('/api/v1/users/admin/users/some-id')
      .set('Authorization', `Bearer ${agentToken()}`)
      .send({ firstName: 'Hacker' });
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────────
describe('Notifications', () => {

  it('GET /notifications — 200 for any authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/users/notifications')
      .set('Authorization', `Bearer ${silverToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.data.notifications).toBeDefined();
  });

  it('GET /notifications — 401 without token', async () => {
    const res = await request(app).get('/api/v1/users/notifications');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Response Format
// ─────────────────────────────────────────────────────────────────────────────
describe('Response Format Contract', () => {
  it('all responses have success, message, data, timestamp', async () => {
    const res = await request(app)
      .get('/api/v1/users/notifications')
      .set('Authorization', `Bearer ${silverToken()}`);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('timestamp');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Happy-Path: FR06 Admin creates Business Owner
// ─────────────────────────────────────────────────────────────────────────────
describe('FR06: Admin creates Business Owner — happy path', () => {
  it('POST /admin/business-owners — 201 with valid payload', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findUserByEmail.mockResolvedValue(null);
    r.createUser.mockResolvedValue({
      id: 'new-biz-user', firstName: 'Jane', lastName: 'Doe',
      email: 'jane@bizco.com', passwordHash: '$2b$hash',
      role: 'BUSINESS_OWNER', status: 'ACTIVE',
      emailVerified: true, lastLogin: null,
      failedLoginAttempts: 0, lockedUntil: null,
      profileImage: null, isSuspended: false,
      createdBy: 'admin-1', createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });

    const res = await request(app)
      .post('/api/v1/users/admin/business-owners')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ firstName: 'Jane', lastName: 'Doe', email: 'jane@bizco.com', password: 'Secure@Pass1' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('jane@bizco.com');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('GET /admin/users/:id — 200 returns user with full profile', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findUserWithProfiles.mockResolvedValue({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', firstName: 'Jane', lastName: 'Doe',
      email: 'jane@bizco.com', role: 'BUSINESS_OWNER', status: 'ACTIVE',
      passwordHash: '$hash',
      businessProfile: { id: 'bp-1', businessName: 'Acme', verificationStatus: 'PENDING', documents: [] },
      influencerProfile: null,
      agentProfile: null,
    });

    const res = await request(app)
      .get('/api/v1/users/admin/users/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.businessProfile).toBeDefined();
    // password hash must not be in response
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  it('POST /admin/users/:id/deactivate — 200 deactivates user', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findUserById.mockResolvedValue({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', role: 'BUSINESS_OWNER', status: 'ACTIVE',
      email: 'biz@x.com', isSuspended: false, deletedAt: null,
    });
    r.deactivateUser.mockResolvedValue({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', firstName: 'Jane', lastName: 'Doe',
      email: 'biz@x.com', role: 'BUSINESS_OWNER', status: 'INACTIVE',
      emailVerified: true, lastLogin: null, profileImage: null,
      isSuspended: false, createdAt: new Date(), updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/v1/users/admin/users/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/deactivate')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.status).toBe('INACTIVE');
  });

  it('POST /admin/users/:id/reactivate — 200 reactivates user', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findUserById.mockResolvedValue({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', role: 'BUSINESS_OWNER', status: 'INACTIVE',
      email: 'biz@x.com', isSuspended: false, deletedAt: null,
    });
    r.reactivateUser.mockResolvedValue({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', firstName: 'Jane', lastName: 'Doe',
      email: 'biz@x.com', role: 'BUSINESS_OWNER', status: 'ACTIVE',
      emailVerified: true, lastLogin: null, profileImage: null,
      isSuspended: false, createdAt: new Date(), updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/v1/users/admin/users/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/reactivate')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.status).toBe('ACTIVE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Happy-Path: FR07 Business Owner creates profile + document
// ─────────────────────────────────────────────────────────────────────────────
describe('FR07: Business Owner profile — happy path', () => {
  it('POST /business/profile — 201 with valid payload', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findUserById.mockResolvedValue({ id: 'biz-1', role: 'BUSINESS_OWNER', status: 'ACTIVE', email: 'biz@x.com', deletedAt: null });
    r.findBusinessProfileByUserId.mockResolvedValue(null);
    r.createBusinessProfile.mockResolvedValue({
      id: 'bp-1', userId: 'biz-1', businessName: 'Acme Corp',
      verificationStatus: 'PENDING', createdAt: new Date(), updatedAt: new Date(), documents: [],
    });
    r.updateUser.mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/users/business/profile')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({ businessName: 'Acme Corp', businessType: 'E-Commerce', city: 'New York', country: 'US' });

    expect(res.status).toBe(201);
    expect(res.body.data.businessName).toBe('Acme Corp');
    expect(res.body.data.verificationStatus).toBe('PENDING');
  });

  it('GET /business/profile — 200 returns own profile', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findBusinessProfileByUserId.mockResolvedValue({
      id: 'bp-1', userId: 'biz-1', businessName: 'Acme Corp',
      verificationStatus: 'APPROVED', documents: [],
    });

    const res = await request(app)
      .get('/api/v1/users/business/profile')
      .set('Authorization', `Bearer ${bizToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.businessName).toBe('Acme Corp');
  });

  it('POST /business/documents — 201 for valid PDF metadata', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findBusinessProfileByUserId.mockResolvedValue({ id: 'bp-1', userId: 'biz-1' });
    r.createBusinessDocument.mockResolvedValue({
      id: 'doc-1', businessProfileId: 'bp-1', documentType: 'business_license',
      fileName: 'license.pdf', fileSize: 1024 * 500, mimeType: 'application/pdf',
      storagePath: '/private/uploads/license.pdf', uploadedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/v1/users/business/documents')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({
        documentType: 'business_license',
        fileName: 'license.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        storagePath: '/private/uploads/license.pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.documentType).toBe('business_license');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Happy-Path: FR08 Admin approves / rejects business
// ─────────────────────────────────────────────────────────────────────────────
describe('FR08: Admin business review — happy path', () => {
  it('POST /admin/businesses/:id/review — 200 on approve', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findBusinessProfileById.mockResolvedValue({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', userId: 'biz-1', businessName: 'Acme', verificationStatus: 'PENDING',
      user: { email: 'biz@x.com', firstName: 'Jane' },
    });
    r.approveBusinessProfile.mockResolvedValue({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', businessName: 'Acme', verificationStatus: 'APPROVED', verifiedAt: new Date(),
    });
    r.updateUser.mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/users/admin/businesses/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/review')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ action: 'approve' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /admin/businesses/:id/review — 200 on reject with reason', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findBusinessProfileById.mockResolvedValue({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', userId: 'biz-1', businessName: 'Acme', verificationStatus: 'PENDING',
      user: { email: 'biz@x.com', firstName: 'Jane' },
    });
    r.rejectBusinessProfile.mockResolvedValue({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', businessName: 'Acme', verificationStatus: 'REJECTED',
      rejectionReason: 'Documents are expired and illegible',
    });

    const res = await request(app)
      .post('/api/v1/users/admin/businesses/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/review')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ action: 'reject', reason: 'Documents are expired and illegible' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /admin/businesses — 200 lists all business profiles', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.listBusinessProfiles.mockResolvedValue([
      { id: 'bp-1', businessName: 'Acme', verificationStatus: 'PENDING', user: { email: 'biz@x.com' }, documents: [] },
      { id: 'bp-2', businessName: 'Beta Corp', verificationStatus: 'APPROVED', user: { email: 'beta@x.com' }, documents: [] },
    ]);

    const res = await request(app)
      .get('/api/v1/users/admin/businesses')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Happy-Path: FR09 Influencer profile + tier assignment
// ─────────────────────────────────────────────────────────────────────────────
describe('FR09: Influencer profile + tier — happy path', () => {
  it('POST /influencer/profile — 201 for SILVER_INFLUENCER', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findUserById.mockResolvedValue({ id: 'silver-1', role: 'SILVER_INFLUENCER', status: 'ACTIVE', deletedAt: null });
    r.findInfluencerProfileByUserId.mockResolvedValue(null);
    r.createInfluencerProfile.mockResolvedValue({
      id: 'ip-1', userId: 'silver-1', currentTier: 'SILVER',
      isCommunityLeader: false, bio: 'Fashion blogger', niche: 'fashion',
      createdAt: new Date(), updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/v1/users/influencer/profile')
      .set('Authorization', `Bearer ${silverToken()}`)
      .send({ bio: 'Fashion blogger', niche: 'fashion', followerCount: 15000 });

    expect(res.status).toBe(201);
    expect(res.body.data.niche).toBe('fashion');
  });

  it('GET /admin/users/:id/tier-history — 200 returns history array', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findInfluencerProfileByUserId.mockResolvedValue({ id: 'ip-1', currentTier: 'GOLD' });
    r.getTierHistory.mockResolvedValue([
      { id: 'th-1', newTier: 'GOLD', previousTier: 'SILVER', changedBy: 'admin-1', reason: 'Growth', createdAt: new Date() },
    ]);

    const res = await request(app)
      .get('/api/v1/users/admin/users/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/tier-history')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.history).toHaveLength(1);
    expect(res.body.data.history[0].newTier).toBe('GOLD');
  });

  it('POST /admin/users/:id/assign-tier — 200 assigns tier to influencer', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findUserById.mockResolvedValue({ id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', role: 'SILVER_INFLUENCER', status: 'ACTIVE', email: 'silver@x.com', deletedAt: null });
    r.findInfluencerProfileByUserId.mockResolvedValue({ id: 'ip-1', currentTier: 'SILVER', userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });
    r.assignTier.mockResolvedValue({ id: 'ip-1', currentTier: 'GOLD' });

    const res = await request(app)
      .post('/api/v1/users/admin/users/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/assign-tier')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ tier: 'GOLD', reason: 'Exceeded growth target' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Happy-Path: FR10 Agent creates profile and assists with onboarding
// ─────────────────────────────────────────────────────────────────────────────
describe('FR10: Agent — happy path', () => {
  it('POST /agent/profile — 201 creates agent profile', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findUserById.mockResolvedValue({ id: 'agent-1', role: 'AGENT', status: 'ACTIVE', deletedAt: null });
    r.findAgentProfileByUserId.mockResolvedValue(null);
    r.createAgentProfile.mockResolvedValue({
      id: 'ap-1', userId: 'agent-1', agencyName: 'Top Agents LLC',
      phone: '+1 555 000 1111', bio: 'Specialist in brand onboarding',
      createdAt: new Date(), updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/v1/users/agent/profile')
      .set('Authorization', `Bearer ${agentToken()}`)
      .send({ agencyName: 'Top Agents LLC', bio: 'Specialist in brand onboarding' });

    expect(res.status).toBe(201);
    expect(res.body.data.agencyName).toBe('Top Agents LLC');
  });

  it('GET /agent/profile — 200 returns own agent profile', async () => {
    const { userManagementRepository: r } = require('../../modules/users/repositories/user-management.repository');
    r.findAgentProfileByUserId.mockResolvedValue({
      id: 'ap-1', userId: 'agent-1', agencyName: 'Top Agents LLC', bio: 'Onboarding specialist',
      createdAt: new Date(), updatedAt: new Date(),
    });

    const res = await request(app)
      .get('/api/v1/users/agent/profile')
      .set('Authorization', `Bearer ${agentToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.agencyName).toBe('Top Agents LLC');
  });

  it('Agent cannot modify admin-only resources (FR10 enforcement)', async () => {
    // Agents have NO access to admin routes
    const routes = [
      { method: 'post', path: '/api/v1/users/admin/business-owners' },
      { method: 'patch', path: '/api/v1/users/admin/users/some-id' },
      { method: 'post', path: '/api/v1/users/admin/users/some-id/deactivate' },
      { method: 'post', path: '/api/v1/users/admin/businesses/some-id/review' },
    ];

    for (const route of routes) {
      const res = await (request(app) as any)[route.method](route.path)
        .set('Authorization', `Bearer ${agentToken()}`)
        .send({ action: 'approve', firstName: 'X', lastName: 'Y', email: 'x@x.com', password: 'P@ss1234A' });
      expect(res.status).toBe(403);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Validator coverage: new validators
// ─────────────────────────────────────────────────────────────────────────────
describe('New validator coverage', () => {

  it('POST /business/documents — 422 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/users/business/documents')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({});
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e: any) => e.field === 'documentType')).toBe(true);
  });

  it('POST /business/documents — 422 for disallowed MIME type', async () => {
    const res = await request(app)
      .post('/api/v1/users/business/documents')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({
        documentType: 'license', fileName: 'evil.exe',
        fileSize: 1024, mimeType: 'application/exe',
        storagePath: '/safe/path/file.exe',
      });
    expect(res.status).toBe(422);
  });

  it('POST /business/documents — 422 for path traversal in storagePath', async () => {
    const res = await request(app)
      .post('/api/v1/users/business/documents')
      .set('Authorization', `Bearer ${bizToken()}`)
      .send({
        documentType: 'license', fileName: 'evil.pdf',
        fileSize: 1024, mimeType: 'application/pdf',
        storagePath: '/uploads/../../../etc/passwd',
      });
    expect(res.status).toBe(422);
  });

  it('POST /admin/users/:id/community-leader — 422 when value missing', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/users/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/community-leader')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('POST /admin/users/:id/community-leader — 422 for non-boolean value', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/users/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/community-leader')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ value: 'yes' });
    expect(res.status).toBe(422);
  });

  it('GET /admin/users/:id — 422 for non-UUID id param', async () => {
    const res = await request(app)
      .get('/api/v1/users/admin/users/not-a-uuid')
      .set('Authorization', `Bearer ${adminToken()}`);
    expect(res.status).toBe(422);
  });

  it('POST /admin/users/:id/deactivate — 422 for non-UUID id param', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/users/not-a-uuid/deactivate')
      .set('Authorization', `Bearer ${adminToken()}`);
    expect(res.status).toBe(422);
  });

  it('POST /admin/users/:id/reactivate — 422 for non-UUID id param', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/users/not-a-uuid/reactivate')
      .set('Authorization', `Bearer ${adminToken()}`);
    expect(res.status).toBe(422);
  });

  it('GET /admin/users/:id/tier-history — 422 for non-UUID id param', async () => {
    const res = await request(app)
      .get('/api/v1/users/admin/users/not-a-uuid/tier-history')
      .set('Authorization', `Bearer ${adminToken()}`);
    expect(res.status).toBe(422);
  });
});
