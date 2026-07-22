// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests — User Management Service (FR06–FR10)
// ─────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';
process.env.BCRYPT_ROUNDS = '4';

jest.mock('../../modules/users/repositories/user-management.repository', () => ({
  userManagementRepository: {
    createUser:                     jest.fn(),
    findUserById:                   jest.fn(),
    findUserByEmail:                jest.fn(),
    findUserWithProfiles:           jest.fn(),
    listUsers:                      jest.fn(),
    updateUser:                     jest.fn(),
    deactivateUser:                 jest.fn(),
    reactivateUser:                 jest.fn(),
    createBusinessProfile:          jest.fn(),
    findBusinessProfileByUserId:    jest.fn(),
    findBusinessProfileById:        jest.fn(),
    listBusinessProfiles:           jest.fn(),
    updateBusinessProfile:          jest.fn(),
    createBusinessDocument:         jest.fn(),
    approveBusinessProfile:         jest.fn(),
    rejectBusinessProfile:          jest.fn(),
    createInfluencerProfile:        jest.fn(),
    findInfluencerProfileByUserId:  jest.fn(),
    updateInfluencerProfile:        jest.fn(),
    assignTier:                     jest.fn(),
    getTierHistory:                 jest.fn(),
    setCommunityLeader:             jest.fn(),
    createAgentProfile:             jest.fn(),
    findAgentProfileByUserId:       jest.fn(),
    updateAgentProfile:             jest.fn(),
    createNotification:             jest.fn().mockResolvedValue({}),
    getNotifications:               jest.fn(),
    markNotificationRead:           jest.fn(),
    markAllNotificationsRead:       jest.fn(),
    createAuditLog:                 jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../common/email/email.service', () => ({
  emailService: {
    sendVerificationEmail:            jest.fn().mockResolvedValue(undefined),
    sendBusinessVerificationEmail:    jest.fn().mockResolvedValue(undefined),
  },
}));

import { userManagementService } from '../../modules/users/services/user-management.service';
import { userManagementRepository as mockRepo } from '../../modules/users/repositories/user-management.repository';
import { ApiError } from '../../common/errors/ApiError';

const repo = mockRepo as jest.Mocked<typeof mockRepo>;
const ctx  = { ip: '127.0.0.1', userAgent: 'jest' };

const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1', firstName: 'John', lastName: 'Doe',
  email: 'john@example.com', passwordHash: '$hash',
  role: 'SILVER_INFLUENCER', status: 'ACTIVE',
  emailVerified: true, lastLogin: null,
  failedLoginAttempts: 0, lockedUntil: null,
  profileImage: null, isSuspended: false,
  createdBy: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// FR06 — Admin User Management
// ─────────────────────────────────────────────────────────────────────────────
describe('FR06: Admin User Management', () => {

  describe('createBusinessOwner()', () => {
    it('creates a Business Owner and returns safe user (no passwordHash)', async () => {
      repo.findUserByEmail.mockResolvedValue(null);
      repo.createUser.mockResolvedValue(makeUser({ role: 'BUSINESS_OWNER' }) as any);
      repo.createBusinessProfile.mockResolvedValue({} as any);

      const result = await userManagementService.createBusinessOwner(
        { firstName: 'Jane', lastName: 'Doe', email: 'jane@biz.com', password: 'Secure@Pass1', businessName: 'Acme' },
        'admin-1', ctx
      );

      expect(result.email).toBe('john@example.com');
      expect(result).not.toHaveProperty('passwordHash');
      expect(repo.createUser).toHaveBeenCalledTimes(1);
    });

    it('throws 409 if email already exists', async () => {
      repo.findUserByEmail.mockResolvedValue(makeUser() as any);
      await expect(
        userManagementService.createBusinessOwner(
          { firstName: 'J', lastName: 'D', email: 'exist@x.com', password: 'Secure@Pass1' },
          'admin-1', ctx
        )
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('deactivateUser()', () => {
    it('deactivates an active user', async () => {
      repo.findUserById.mockResolvedValue(makeUser() as any);
      repo.deactivateUser.mockResolvedValue(makeUser({ status: 'INACTIVE' }) as any);

      const result = await userManagementService.deactivateUser('user-1', 'admin-1');
      expect(repo.deactivateUser).toHaveBeenCalledWith('user-1');
    });

    it('throws 403 if trying to deactivate SYSTEM_ADMIN', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ role: 'SYSTEM_ADMIN' }) as any);
      await expect(userManagementService.deactivateUser('user-1', 'admin-1'))
        .rejects.toMatchObject({ statusCode: 403 });
    });

    it('throws 400 if user already inactive', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ status: 'INACTIVE' }) as any);
      await expect(userManagementService.deactivateUser('user-1', 'admin-1'))
        .rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('reactivateUser()', () => {
    it('reactivates an inactive user and sends notification', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ status: 'INACTIVE' }) as any);
      repo.reactivateUser.mockResolvedValue(makeUser({ status: 'ACTIVE' }) as any);

      await userManagementService.reactivateUser('user-1', 'admin-1');

      expect(repo.reactivateUser).toHaveBeenCalledWith('user-1');
      expect(repo.createNotification).toHaveBeenCalled();
    });

    it('throws 400 if user is already active', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ status: 'ACTIVE' }) as any);
      await expect(userManagementService.reactivateUser('user-1', 'admin-1'))
        .rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('listUsers()', () => {
    it('returns paginated users', async () => {
      repo.listUsers.mockResolvedValue({ users: [makeUser() as any], total: 1 });
      const result = await userManagementService.listUsers({ page: 1, limit: 10 });
      expect(result.meta.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('passwordHash');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR07 — Business Profile
// ─────────────────────────────────────────────────────────────────────────────
describe('FR07: Business Profile', () => {

  describe('createBusinessProfile()', () => {
    it('creates profile for Business Owner', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ role: 'BUSINESS_OWNER' }) as any);
      repo.findBusinessProfileByUserId.mockResolvedValue(null);
      repo.createBusinessProfile.mockResolvedValue({ id: 'bp-1', verificationStatus: 'PENDING' } as any);
      repo.updateUser.mockResolvedValue(makeUser({ status: 'PENDING_VERIFICATION' }) as any);

      const profile = await userManagementService.createBusinessProfile('user-1', { businessName: 'Acme Corp' });
      expect(repo.createBusinessProfile).toHaveBeenCalled();
      expect(repo.updateUser).toHaveBeenCalledWith('user-1', { status: 'PENDING_VERIFICATION' });
    });

    it('throws 403 if user is not Business Owner', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ role: 'SILVER_INFLUENCER' }) as any);
      await expect(
        userManagementService.createBusinessProfile('user-1', { businessName: 'X' })
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('throws 409 if profile already exists', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ role: 'BUSINESS_OWNER' }) as any);
      repo.findBusinessProfileByUserId.mockResolvedValue({ id: 'existing' } as any);
      await expect(
        userManagementService.createBusinessProfile('user-1', { businessName: 'X' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('uploadDocument()', () => {
    it('throws 400 for disallowed MIME type', async () => {
      repo.findBusinessProfileByUserId.mockResolvedValue({ id: 'bp-1' } as any);
      await expect(
        userManagementService.uploadDocument('user-1', {
          documentType: 'license', fileName: 'test.exe',
          fileSize: 1024, mimeType: 'application/exe', storagePath: '/uploads/test.exe',
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('throws 400 for file exceeding 10 MB', async () => {
      repo.findBusinessProfileByUserId.mockResolvedValue({ id: 'bp-1' } as any);
      await expect(
        userManagementService.uploadDocument('user-1', {
          documentType: 'license', fileName: 'big.pdf',
          fileSize: 11 * 1024 * 1024, mimeType: 'application/pdf', storagePath: '/uploads/big.pdf',
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('accepts valid PDF document', async () => {
      repo.findBusinessProfileByUserId.mockResolvedValue({ id: 'bp-1' } as any);
      repo.createBusinessDocument.mockResolvedValue({ id: 'doc-1' } as any);
      const doc = await userManagementService.uploadDocument('user-1', {
        documentType: 'business_license', fileName: 'license.pdf',
        fileSize: 2 * 1024 * 1024, mimeType: 'application/pdf', storagePath: '/private/uploads/license.pdf',
      });
      expect(doc).toBeDefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR08 — Business Verification
// ─────────────────────────────────────────────────────────────────────────────
describe('FR08: Business Verification', () => {

  const mockProfile = {
    id: 'bp-1', userId: 'user-1', businessName: 'Acme',
    verificationStatus: 'PENDING',
    user: { email: 'biz@example.com', firstName: 'Jane' },
  };

  describe('reviewBusiness()', () => {
    it('approves a pending business and sends notification + email', async () => {
      repo.findBusinessProfileById.mockResolvedValue(mockProfile as any);
      repo.approveBusinessProfile.mockResolvedValue({ ...mockProfile, verificationStatus: 'APPROVED' } as any);
      repo.updateUser.mockResolvedValue(makeUser({ status: 'ACTIVE' }) as any);

      await userManagementService.reviewBusiness('bp-1', 'admin-1', { action: 'approve' });

      expect(repo.approveBusinessProfile).toHaveBeenCalledWith({ profileId: 'bp-1', adminId: 'admin-1' });
      expect(repo.updateUser).toHaveBeenCalledWith('user-1', { status: 'ACTIVE' });
      expect(repo.createNotification).toHaveBeenCalled();
    });

    it('rejects with mandatory reason', async () => {
      repo.findBusinessProfileById.mockResolvedValue(mockProfile as any);
      repo.rejectBusinessProfile.mockResolvedValue({ ...mockProfile, verificationStatus: 'REJECTED' } as any);

      await userManagementService.reviewBusiness('bp-1', 'admin-1', {
        action: 'reject', reason: 'Documents are invalid and expired',
      });

      expect(repo.rejectBusinessProfile).toHaveBeenCalledWith({
        profileId: 'bp-1', adminId: 'admin-1', reason: 'Documents are invalid and expired',
      });
    });

    it('throws 400 if business is already approved', async () => {
      repo.findBusinessProfileById.mockResolvedValue({ ...mockProfile, verificationStatus: 'APPROVED' } as any);
      await expect(
        userManagementService.reviewBusiness('bp-1', 'admin-1', { action: 'approve' })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('throws 400 if reject without reason', async () => {
      repo.findBusinessProfileById.mockResolvedValue(mockProfile as any);
      await expect(
        userManagementService.reviewBusiness('bp-1', 'admin-1', { action: 'reject' })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR09 — Influencer Tiers
// ─────────────────────────────────────────────────────────────────────────────
describe('FR09: Influencer Tiers', () => {

  describe('assignTier()', () => {
    it('assigns tier, updates role, and creates tier history', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ role: 'SILVER_INFLUENCER' }) as any);
      repo.findInfluencerProfileByUserId
        .mockResolvedValueOnce({ id: 'ip-1', currentTier: 'SILVER', userId: 'user-1' } as any)
        .mockResolvedValue({ id: 'ip-1', currentTier: 'GOLD', userId: 'user-1' } as any);
      repo.assignTier.mockResolvedValue({ id: 'ip-1', currentTier: 'GOLD' } as any);

      await userManagementService.assignTier('user-1', 'admin-1', { tier: 'GOLD', reason: 'Promotion' });

      expect(repo.assignTier).toHaveBeenCalledWith(
        expect.objectContaining({ newTier: 'GOLD', previousTier: 'SILVER', changedBy: 'admin-1' })
      );
      expect(repo.createNotification).toHaveBeenCalled();
    });

    it('throws 400 if user already has that tier', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ role: 'GOLD_INFLUENCER' }) as any);
      repo.findInfluencerProfileByUserId.mockResolvedValue({ id: 'ip-1', currentTier: 'GOLD' } as any);
      await expect(
        userManagementService.assignTier('user-1', 'admin-1', { tier: 'GOLD' })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('throws 400 if user is not an influencer', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ role: 'BUSINESS_OWNER' }) as any);
      await expect(
        userManagementService.assignTier('user-1', 'admin-1', { tier: 'GOLD' })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('setCommunityLeader()', () => {
    it('sets Diamond influencer as community leader', async () => {
      repo.findInfluencerProfileByUserId.mockResolvedValue({ id: 'ip-1', currentTier: 'DIAMOND' } as any);
      repo.setCommunityLeader.mockResolvedValue({} as any);
      await userManagementService.setCommunityLeader('user-1', 'admin-1', true);
      expect(repo.setCommunityLeader).toHaveBeenCalledWith('ip-1', true);
    });

    it('throws 400 if non-Diamond tries to become community leader', async () => {
      repo.findInfluencerProfileByUserId.mockResolvedValue({ id: 'ip-1', currentTier: 'GOLD' } as any);
      await expect(
        userManagementService.setCommunityLeader('user-1', 'admin-1', true)
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR10 — Agent Role
// ─────────────────────────────────────────────────────────────────────────────
describe('FR10: Agent Role', () => {

  describe('createAgentProfile()', () => {
    it('creates agent profile for AGENT user', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ role: 'AGENT' }) as any);
      repo.findAgentProfileByUserId.mockResolvedValue(null);
      repo.createAgentProfile.mockResolvedValue({ id: 'ap-1', userId: 'user-1' } as any);

      const profile = await userManagementService.createAgentProfile('user-1', { agencyName: 'Top Agency' });
      expect(repo.createAgentProfile).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', agencyName: 'Top Agency' })
      );
    });

    it('throws 403 if non-AGENT tries to create agent profile', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ role: 'BUSINESS_OWNER' }) as any);
      await expect(
        userManagementService.createAgentProfile('user-1', {})
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('throws 409 if agent profile already exists', async () => {
      repo.findUserById.mockResolvedValue(makeUser({ role: 'AGENT' }) as any);
      repo.findAgentProfileByUserId.mockResolvedValue({ id: 'existing' } as any);
      await expect(
        userManagementService.createAgentProfile('user-1', {})
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('updateAgentProfile()', () => {
    it('updates an existing agent profile', async () => {
      repo.findAgentProfileByUserId.mockResolvedValue({ id: 'ap-1' } as any);
      repo.updateAgentProfile.mockResolvedValue({ id: 'ap-1', agencyName: 'New Agency' } as any);

      const result = await userManagementService.updateAgentProfile('user-1', { agencyName: 'New Agency' });
      expect(repo.updateAgentProfile).toHaveBeenCalledWith('ap-1', { agencyName: 'New Agency' });
    });

    it('throws 404 if agent profile does not exist', async () => {
      repo.findAgentProfileByUserId.mockResolvedValue(null);
      await expect(
        userManagementService.updateAgentProfile('user-1', { agencyName: 'X' })
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR06 — updateUser
// ─────────────────────────────────────────────────────────────────────────────
describe('FR06: updateUser()', () => {
  it('updates allowed fields and returns safe user', async () => {
    repo.findUserById.mockResolvedValue(makeUser() as any);
    repo.updateUser.mockResolvedValue(makeUser({ firstName: 'Updated' }) as any);

    const result = await userManagementService.updateUser('user-1', { firstName: 'Updated' });
    expect(result.firstName).toBe('Updated');
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('throws 404 if user does not exist', async () => {
    repo.findUserById.mockResolvedValue(null);
    await expect(userManagementService.updateUser('bad-id', { firstName: 'X' }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR09 — Tier history & influencer profile updates
// ─────────────────────────────────────────────────────────────────────────────
describe('FR09: getTierHistory()', () => {
  it('returns tier history for a valid influencer', async () => {
    repo.findInfluencerProfileByUserId.mockResolvedValue({ id: 'ip-1', currentTier: 'GOLD' } as any);
    repo.getTierHistory.mockResolvedValue([
      { id: 'h-1', newTier: 'GOLD', previousTier: 'SILVER', changedBy: 'admin-1', reason: 'Promoted', createdAt: new Date() },
    ] as any);

    const history = await userManagementService.getTierHistory('user-1');
    expect(history).toHaveLength(1);
    expect(history[0]).toHaveProperty('newTier', 'GOLD');
  });

  it('throws 404 if influencer profile not found', async () => {
    repo.findInfluencerProfileByUserId.mockResolvedValue(null);
    await expect(userManagementService.getTierHistory('user-1'))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('FR09: createInfluencerProfile() — tier derived from role', () => {
  it('creates DIAMOND profile for DIAMOND_INFLUENCER user', async () => {
    repo.findUserById.mockResolvedValue(makeUser({ role: 'DIAMOND_INFLUENCER' }) as any);
    repo.findInfluencerProfileByUserId.mockResolvedValue(null);
    repo.createInfluencerProfile.mockResolvedValue({ id: 'ip-1', currentTier: 'DIAMOND' } as any);

    await userManagementService.createInfluencerProfile('user-1', { bio: 'Top influencer' });

    expect(repo.createInfluencerProfile).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', currentTier: 'DIAMOND' })
    );
  });

  it('creates GOLD profile for GOLD_INFLUENCER user', async () => {
    repo.findUserById.mockResolvedValue(makeUser({ role: 'GOLD_INFLUENCER' }) as any);
    repo.findInfluencerProfileByUserId.mockResolvedValue(null);
    repo.createInfluencerProfile.mockResolvedValue({ id: 'ip-1', currentTier: 'GOLD' } as any);

    await userManagementService.createInfluencerProfile('user-1', {});

    expect(repo.createInfluencerProfile).toHaveBeenCalledWith(
      expect.objectContaining({ currentTier: 'GOLD' })
    );
  });

  it('creates SILVER profile for SILVER_INFLUENCER user', async () => {
    repo.findUserById.mockResolvedValue(makeUser({ role: 'SILVER_INFLUENCER' }) as any);
    repo.findInfluencerProfileByUserId.mockResolvedValue(null);
    repo.createInfluencerProfile.mockResolvedValue({ id: 'ip-1', currentTier: 'SILVER' } as any);

    await userManagementService.createInfluencerProfile('user-1', {});

    expect(repo.createInfluencerProfile).toHaveBeenCalledWith(
      expect.objectContaining({ currentTier: 'SILVER' })
    );
  });
});

describe('FR09: updateInfluencerProfile()', () => {
  it('updates influencer profile fields', async () => {
    repo.findInfluencerProfileByUserId.mockResolvedValue({ id: 'ip-1', currentTier: 'SILVER' } as any);
    repo.updateInfluencerProfile.mockResolvedValue({ id: 'ip-1', niche: 'fitness', bio: 'Updated bio' } as any);

    const result = await userManagementService.updateInfluencerProfile('user-1', { niche: 'fitness', bio: 'Updated bio' });
    expect(repo.updateInfluencerProfile).toHaveBeenCalledWith('ip-1', { niche: 'fitness', bio: 'Updated bio' });
  });

  it('throws 404 if influencer profile not found', async () => {
    repo.findInfluencerProfileByUserId.mockResolvedValue(null);
    await expect(
      userManagementService.updateInfluencerProfile('user-1', { niche: 'tech' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────────
describe('Notifications', () => {
  it('getNotifications() returns user notifications', async () => {
    repo.getNotifications.mockResolvedValue([
      { id: 'n-1', type: 'TIER_CHANGED', title: 'Tier Updated', message: 'Gold', isRead: false, createdAt: new Date() },
    ] as any);

    const result = await userManagementService.getNotifications('user-1');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('TIER_CHANGED');
  });

  it('markNotificationRead() calls repo correctly', async () => {
    repo.markNotificationRead.mockResolvedValue(undefined);
    await userManagementService.markNotificationRead('notif-1', 'user-1');
    expect(repo.markNotificationRead).toHaveBeenCalledWith('notif-1', 'user-1');
  });

  it('markAllNotificationsRead() calls repo correctly', async () => {
    repo.markAllNotificationsRead.mockResolvedValue(undefined);
    await userManagementService.markAllNotificationsRead('user-1');
    expect(repo.markAllNotificationsRead).toHaveBeenCalledWith('user-1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Audit logging
// ─────────────────────────────────────────────────────────────────────────────
describe('Audit logging', () => {
  it('createBusinessOwner() fires USER_CREATED audit log', async () => {
    repo.findUserByEmail.mockResolvedValue(null);
    repo.createUser.mockResolvedValue(makeUser({ role: 'BUSINESS_OWNER' }) as any);

    await userManagementService.createBusinessOwner(
      { firstName: 'Jane', lastName: 'Doe', email: 'jane@biz.com', password: 'Pass@123A' },
      'admin-1', ctx
    );

    expect(repo.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'USER_CREATED', userId: 'admin-1' })
    );
  });

  it('assignTier() fires TIER_ASSIGNED audit log', async () => {
    repo.findUserById.mockResolvedValue(makeUser({ role: 'SILVER_INFLUENCER' }) as any);
    repo.findInfluencerProfileByUserId
      .mockResolvedValueOnce({ id: 'ip-1', currentTier: 'SILVER', userId: 'user-1' } as any)
      .mockResolvedValue({ id: 'ip-1', currentTier: 'GOLD', userId: 'user-1' } as any);
    repo.assignTier.mockResolvedValue({ id: 'ip-1', currentTier: 'GOLD' } as any);

    await userManagementService.assignTier('user-1', 'admin-1', { tier: 'GOLD' });

    expect(repo.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'TIER_ASSIGNED', userId: 'admin-1' })
    );
  });

  it('updateUser() fires USER_UPDATED audit log', async () => {
    repo.findUserById.mockResolvedValue(makeUser() as any);
    repo.updateUser.mockResolvedValue(makeUser({ firstName: 'Updated' }) as any);

    await userManagementService.updateUser('user-1', { firstName: 'Updated' });

    expect(repo.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'USER_UPDATED' })
    );
  });

  it('deactivateUser() fires USER_DEACTIVATED audit log', async () => {
    repo.findUserById.mockResolvedValue(makeUser() as any);
    repo.deactivateUser.mockResolvedValue(makeUser({ status: 'INACTIVE' }) as any);

    await userManagementService.deactivateUser('user-1', 'admin-1');

    expect(repo.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'USER_DEACTIVATED', userId: 'admin-1' })
    );
  });

  it('reactivateUser() fires USER_REACTIVATED audit log', async () => {
    repo.findUserById.mockResolvedValue(makeUser({ status: 'INACTIVE' }) as any);
    repo.reactivateUser.mockResolvedValue(makeUser({ status: 'ACTIVE' }) as any);

    await userManagementService.reactivateUser('user-1', 'admin-1');

    expect(repo.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'USER_REACTIVATED', userId: 'admin-1' })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR07 — updateBusinessProfile single-write fix
// ─────────────────────────────────────────────────────────────────────────────
describe('FR07: updateBusinessProfile()', () => {
  it('updates profile without re-review when status is PENDING', async () => {
    repo.findBusinessProfileByUserId.mockResolvedValue({ id: 'bp-1', verificationStatus: 'PENDING' } as any);
    repo.updateBusinessProfile.mockResolvedValue({ id: 'bp-1', businessName: 'Updated' } as any);

    await userManagementService.updateBusinessProfile('user-1', { businessName: 'Updated' });

    // Only called ONCE — no double write
    expect(repo.updateBusinessProfile).toHaveBeenCalledTimes(1);
    expect(repo.updateBusinessProfile).toHaveBeenCalledWith('bp-1', { businessName: 'Updated' });
  });

  it('resets verification status to PENDING when updating an APPROVED profile (single write)', async () => {
    repo.findBusinessProfileByUserId.mockResolvedValue({ id: 'bp-1', verificationStatus: 'APPROVED' } as any);
    repo.updateBusinessProfile.mockResolvedValue({ id: 'bp-1', businessName: 'Updated', verificationStatus: 'PENDING' } as any);

    await userManagementService.updateBusinessProfile('user-1', { businessName: 'Updated' });

    // Called ONCE with merged data including verificationStatus reset
    expect(repo.updateBusinessProfile).toHaveBeenCalledTimes(1);
    expect(repo.updateBusinessProfile).toHaveBeenCalledWith('bp-1', expect.objectContaining({
      businessName: 'Updated',
      verificationStatus: 'PENDING',
      verifiedAt: null,
      rejectionReason: null,
    }));
  });

  it('throws 404 if business profile not found', async () => {
    repo.findBusinessProfileByUserId.mockResolvedValue(null);
    await expect(userManagementService.updateBusinessProfile('user-1', { businessName: 'X' }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR07 — uploadDocument security
// ─────────────────────────────────────────────────────────────────────────────
describe('FR07: uploadDocument() — security', () => {
  it('rejects path traversal in storagePath', async () => {
    repo.findBusinessProfileByUserId.mockResolvedValue({ id: 'bp-1' } as any);
    await expect(
      userManagementService.uploadDocument('user-1', {
        documentType: 'license', fileName: 'evil.pdf',
        fileSize: 1024, mimeType: 'application/pdf',
        storagePath: '/uploads/../../../etc/passwd',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects Windows-style path traversal', async () => {
    repo.findBusinessProfileByUserId.mockResolvedValue({ id: 'bp-1' } as any);
    await expect(
      userManagementService.uploadDocument('user-1', {
        documentType: 'license', fileName: 'evil.pdf',
        fileSize: 1024, mimeType: 'application/pdf',
        storagePath: 'C:\\..\\..\\Windows\\system32',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR08 — listBusinessProfiles invalid status
// ─────────────────────────────────────────────────────────────────────────────
describe('FR08: listBusinessProfiles()', () => {
  it('rejects invalid status string', async () => {
    await expect(userManagementService.listBusinessProfiles('INVALID_STATUS'))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('accepts valid PENDING status', async () => {
    repo.listBusinessProfiles.mockResolvedValue([]);
    const result = await userManagementService.listBusinessProfiles('PENDING');
    expect(repo.listBusinessProfiles).toHaveBeenCalledWith('PENDING');
  });

  it('returns all when no status provided', async () => {
    repo.listBusinessProfiles.mockResolvedValue([]);
    await userManagementService.listBusinessProfiles();
    expect(repo.listBusinessProfiles).toHaveBeenCalledWith(undefined);
  });
});
