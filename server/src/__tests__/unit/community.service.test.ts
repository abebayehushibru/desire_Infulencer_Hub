// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests — Community Service (FR11–FR15)
// ─────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';
process.env.BCRYPT_ROUNDS = '4';

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
    sealLatestCommissionHistory:  jest.fn(),
    getLeaderboard:               jest.fn(),
    getCommunityRankings:         jest.fn(),
    findUserById:                 jest.fn(),
    createAuditLog:               jest.fn(),
    createNotification:           jest.fn().mockResolvedValue(undefined),
  },
}));

import { communityService } from '../../modules/community/services/community.service';
import { communityRepository as mockRepo } from '../../modules/community/repositories/community.repository';
import { ApiError } from '../../common/errors/ApiError';

const repo = mockRepo as jest.Mocked<typeof mockRepo>;
const ctx  = { ip: '127.0.0.1', userAgent: 'jest' };

// ── UUIDs used as test fixtures ───────────────────────────────────────────────
const ADMIN_ID    = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const LEADER_ID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
const MEMBER_ID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
const COMM_ID     = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';
const MEMBERSHIP_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15';

const makeCommunity = (overrides: Record<string, any> = {}) => ({
  id: COMM_ID, title: 'Fashion Hub', description: 'Desc', rules: 'Rules',
  status: 'ACTIVE', communityLeaderId: LEADER_ID, createdBy: ADMIN_ID,
  createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
  leader: { id: LEADER_ID, firstName: 'Diamond', lastName: 'User', email: 'diamond@x.com', role: 'DIAMOND_INFLUENCER' },
  commission: null,
  _count: { members: 0 },
  ...overrides,
});

const makeUser = (overrides: Record<string, any> = {}) => ({
  id: LEADER_ID, firstName: 'Diamond', lastName: 'User', email: 'diamond@x.com',
  role: 'DIAMOND_INFLUENCER', status: 'ACTIVE',
  influencerProfile: { currentTier: 'DIAMOND', isCommunityLeader: true },
  ...overrides,
});

const makeMemberUser = (overrides: Record<string, any> = {}) => ({
  id: MEMBER_ID, firstName: 'Gold', lastName: 'User', email: 'gold@x.com',
  role: 'GOLD_INFLUENCER', status: 'ACTIVE',
  influencerProfile: { currentTier: 'GOLD', isCommunityLeader: false },
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// FR11 — Community Creation
// ─────────────────────────────────────────────────────────────────────────────
describe('FR11: createCommunity()', () => {
  it('creates a community with no leader', async () => {
    repo.findCommunityByTitle.mockResolvedValue(null);
    repo.createCommunity.mockResolvedValue({ id: COMM_ID, title: 'Fashion Hub' } as any);
    repo.findCommunityById.mockResolvedValue(makeCommunity({ communityLeaderId: null, leader: null }) as any);

    const result = await communityService.createCommunity({ title: 'Fashion Hub' }, ADMIN_ID, ctx);
    expect(repo.createCommunity).toHaveBeenCalledWith(expect.objectContaining({ title: 'Fashion Hub', createdBy: ADMIN_ID }));
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'COMMUNITY_CREATED' }));
  });

  it('creates a community and assigns DIAMOND leader', async () => {
    repo.findCommunityByTitle.mockResolvedValue(null);
    repo.findUserById.mockResolvedValue(makeUser() as any);
    repo.findActiveCommunityByLeader.mockResolvedValue(null);
    repo.createCommunity.mockResolvedValue({ id: COMM_ID } as any);
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);

    await communityService.createCommunity({ title: 'Fashion Hub', communityLeaderId: LEADER_ID }, ADMIN_ID, ctx);
    expect(repo.createNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'COMMUNITY_LEADER_ASSIGNED' }));
  });

  it('throws 409 if title already exists', async () => {
    repo.findCommunityByTitle.mockResolvedValue(makeCommunity() as any);
    await expect(communityService.createCommunity({ title: 'Fashion Hub' }, ADMIN_ID, ctx))
      .rejects.toMatchObject({ statusCode: 409 });
  });

  it('throws 400 if proposed leader is not DIAMOND_INFLUENCER', async () => {
    repo.findCommunityByTitle.mockResolvedValue(null);
    repo.findUserById.mockResolvedValue(makeUser({ role: 'GOLD_INFLUENCER' }) as any);
    await expect(communityService.createCommunity({ title: 'New', communityLeaderId: LEADER_ID }, ADMIN_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 409 if leader already leads another community', async () => {
    repo.findCommunityByTitle.mockResolvedValue(null);
    repo.findUserById.mockResolvedValue(makeUser() as any);
    repo.findActiveCommunityByLeader.mockResolvedValue(makeCommunity({ id: 'other-id' }) as any);
    await expect(communityService.createCommunity({ title: 'New', communityLeaderId: LEADER_ID }, ADMIN_ID, ctx))
      .rejects.toMatchObject({ statusCode: 409 });
  });

  it('throws 400 if proposed leader is suspended', async () => {
    repo.findCommunityByTitle.mockResolvedValue(null);
    repo.findUserById.mockResolvedValue(makeUser({ status: 'SUSPENDED' }) as any);
    await expect(communityService.createCommunity({ title: 'New', communityLeaderId: LEADER_ID }, ADMIN_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('FR11: updateCommunity()', () => {
  it('updates title and fires audit log', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findCommunityByTitleExcluding.mockResolvedValue(null);
    repo.updateCommunity.mockResolvedValue({} as any);

    await communityService.updateCommunity(COMM_ID, { title: 'New Title' }, ADMIN_ID, ctx);
    expect(repo.updateCommunity).toHaveBeenCalledWith(COMM_ID, expect.objectContaining({ title: 'New Title' }));
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'COMMUNITY_UPDATED' }));
  });

  it('throws 409 on duplicate title', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findCommunityByTitleExcluding.mockResolvedValue({ id: 'other', title: 'Taken' } as any);
    await expect(communityService.updateCommunity(COMM_ID, { title: 'Taken' }, ADMIN_ID, ctx))
      .rejects.toMatchObject({ statusCode: 409 });
  });

  it('throws 404 if community not found', async () => {
    repo.findCommunityById.mockResolvedValue(null);
    await expect(communityService.updateCommunity(COMM_ID, { title: 'X' }, ADMIN_ID, ctx))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('FR11: deactivateCommunity()', () => {
  it('deactivates an active community', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.updateCommunity.mockResolvedValue({} as any);

    await communityService.deactivateCommunity(COMM_ID, ADMIN_ID, ctx);
    expect(repo.updateCommunity).toHaveBeenCalledWith(COMM_ID, { status: 'INACTIVE' });
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'COMMUNITY_DEACTIVATED' }));
  });

  it('throws 400 if already inactive', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity({ status: 'INACTIVE' }) as any);
    await expect(communityService.deactivateCommunity(COMM_ID, ADMIN_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('FR11: deleteCommunity()', () => {
  it('soft-deletes a community and audits', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.softDeleteCommunity.mockResolvedValue({} as any);

    await communityService.deleteCommunity(COMM_ID, ADMIN_ID, ctx);
    expect(repo.softDeleteCommunity).toHaveBeenCalledWith(COMM_ID);
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'COMMUNITY_DELETED' }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR12 — Commission Rules
// ─────────────────────────────────────────────────────────────────────────────
describe('FR12: setCommission()', () => {
  it('sets commission when leaderPct + memberPct = 100', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.sealLatestCommissionHistory.mockResolvedValue(undefined);
    repo.upsertCommission.mockResolvedValue({ id: 'c-1', platformFee: 20, leaderPercentage: 30, memberPercentage: 70 } as any);
    repo.createCommissionHistory.mockResolvedValue({} as any);

    const result = await communityService.setCommission(COMM_ID, {
      platformFee: 20, leaderPercentage: 30, memberPercentage: 70,
    }, ADMIN_ID, ctx);

    expect(repo.upsertCommission).toHaveBeenCalledWith(expect.objectContaining({
      platformFee: 20, leaderPercentage: 30, memberPercentage: 70,
    }));
    expect(repo.createCommissionHistory).toHaveBeenCalled();
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'COMMUNITY_COMMISSION_UPDATED' }));
  });

  it('throws 400 when leaderPct + memberPct != 100', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    await expect(communityService.setCommission(COMM_ID, {
      platformFee: 20, leaderPercentage: 40, memberPercentage: 40,
    }, ADMIN_ID, ctx)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 when platformFee out of range', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    await expect(communityService.setCommission(COMM_ID, {
      platformFee: 110, leaderPercentage: 30, memberPercentage: 70,
    }, ADMIN_ID, ctx)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('notifies community leader on commission change', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.sealLatestCommissionHistory.mockResolvedValue(undefined);
    repo.upsertCommission.mockResolvedValue({} as any);
    repo.createCommissionHistory.mockResolvedValue({} as any);

    await communityService.setCommission(COMM_ID, {
      platformFee: 15, leaderPercentage: 25, memberPercentage: 75,
    }, ADMIN_ID, ctx);

    expect(repo.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'COMMUNITY_COMMISSION_UPDATED', userId: LEADER_ID }),
    );
  });

  it('seals previous commission history before creating new record', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.sealLatestCommissionHistory.mockResolvedValue(undefined);
    repo.upsertCommission.mockResolvedValue({} as any);
    repo.createCommissionHistory.mockResolvedValue({} as any);

    await communityService.setCommission(COMM_ID, {
      platformFee: 10, leaderPercentage: 50, memberPercentage: 50,
    }, ADMIN_ID, ctx);

    expect(repo.sealLatestCommissionHistory).toHaveBeenCalledWith(COMM_ID, expect.any(Date));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR13 — Member Management
// ─────────────────────────────────────────────────────────────────────────────
describe('FR13: addMember()', () => {
  it('adds a GOLD influencer as member', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findUserById.mockResolvedValue(makeMemberUser() as any);
    repo.findActiveMembership.mockResolvedValue(null);
    repo.addMember.mockResolvedValue({ id: MEMBERSHIP_ID, userId: MEMBER_ID } as any);

    const result = await communityService.addMember(COMM_ID, { userId: MEMBER_ID }, ADMIN_ID, 'SYSTEM_ADMIN', ctx);

    expect(repo.addMember).toHaveBeenCalledWith(expect.objectContaining({ communityId: COMM_ID, userId: MEMBER_ID }));
    expect(repo.createNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'COMMUNITY_MEMBER_ADDED', userId: MEMBER_ID }));
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'COMMUNITY_MEMBER_ADDED' }));
  });

  it('throws 400 if DIAMOND_INFLUENCER tries to become regular member', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findUserById.mockResolvedValue(makeUser({ role: 'DIAMOND_INFLUENCER' }) as any);

    await expect(communityService.addMember(COMM_ID, { userId: LEADER_ID }, ADMIN_ID, 'SYSTEM_ADMIN', ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 if user is BUSINESS_OWNER (ineligible role)', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findUserById.mockResolvedValue({ id: MEMBER_ID, role: 'BUSINESS_OWNER', status: 'ACTIVE' } as any);

    await expect(communityService.addMember(COMM_ID, { userId: MEMBER_ID }, ADMIN_ID, 'SYSTEM_ADMIN', ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 409 if user is already an active member', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findUserById.mockResolvedValue(makeMemberUser() as any);
    repo.findActiveMembership.mockResolvedValue({ id: MEMBERSHIP_ID, status: 'ACTIVE' } as any);

    await expect(communityService.addMember(COMM_ID, { userId: MEMBER_ID }, ADMIN_ID, 'SYSTEM_ADMIN', ctx))
      .rejects.toMatchObject({ statusCode: 409 });
  });

  it('throws 400 if adding to an inactive community', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity({ status: 'INACTIVE' }) as any);

    await expect(communityService.addMember(COMM_ID, { userId: MEMBER_ID }, ADMIN_ID, 'SYSTEM_ADMIN', ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 if target user is suspended', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findUserById.mockResolvedValue(makeMemberUser({ status: 'SUSPENDED' }) as any);

    await expect(communityService.addMember(COMM_ID, { userId: MEMBER_ID }, ADMIN_ID, 'SYSTEM_ADMIN', ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('allows Community Leader (DIAMOND) to add members', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity({ communityLeaderId: LEADER_ID }) as any);
    repo.findUserById.mockResolvedValue(makeMemberUser() as any);
    repo.findActiveMembership.mockResolvedValue(null);
    repo.addMember.mockResolvedValue({ id: MEMBERSHIP_ID } as any);

    await communityService.addMember(COMM_ID, { userId: MEMBER_ID }, LEADER_ID, 'DIAMOND_INFLUENCER', ctx);
    expect(repo.addMember).toHaveBeenCalled();
  });

  it('throws 403 if non-admin non-leader tries to add member', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity({ communityLeaderId: LEADER_ID }) as any);

    await expect(communityService.addMember(COMM_ID, { userId: MEMBER_ID }, MEMBER_ID, 'GOLD_INFLUENCER', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('FR13: removeMember()', () => {
  it('removes an active member', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findMembership.mockResolvedValue({ id: MEMBERSHIP_ID, userId: MEMBER_ID, status: 'ACTIVE' } as any);
    repo.removeMember.mockResolvedValue({ id: MEMBERSHIP_ID, status: 'REMOVED' } as any);

    await communityService.removeMember(COMM_ID, MEMBERSHIP_ID, ADMIN_ID, 'SYSTEM_ADMIN', ctx);

    expect(repo.removeMember).toHaveBeenCalledWith(MEMBERSHIP_ID, ADMIN_ID);
    expect(repo.createNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'COMMUNITY_MEMBER_REMOVED' }));
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'COMMUNITY_MEMBER_REMOVED' }));
  });

  it('throws 400 if member already removed', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findMembership.mockResolvedValue({ id: MEMBERSHIP_ID, status: 'REMOVED' } as any);

    await expect(communityService.removeMember(COMM_ID, MEMBERSHIP_ID, ADMIN_ID, 'SYSTEM_ADMIN', ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 404 if membership not found', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.findMembership.mockResolvedValue(null);

    await expect(communityService.removeMember(COMM_ID, MEMBERSHIP_ID, ADMIN_ID, 'SYSTEM_ADMIN', ctx))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR14 — Leaderboard
// ─────────────────────────────────────────────────────────────────────────────
describe('FR14: getLeaderboard()', () => {
  it('returns paginated leaderboard for SYSTEM_ADMIN', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.getLeaderboard.mockResolvedValue({
      entries: [{ rank: 1, userId: MEMBER_ID, totalConversions: 0, totalEarnings: 0 }],
      total: 1,
    });

    const result = await communityService.getLeaderboard(COMM_ID, { page: 1, limit: 10 }, ADMIN_ID, 'SYSTEM_ADMIN');
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('allows community leader to view leaderboard', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity({ communityLeaderId: LEADER_ID }) as any);
    repo.getLeaderboard.mockResolvedValue({ entries: [], total: 0 });

    await communityService.getLeaderboard(COMM_ID, {}, LEADER_ID, 'DIAMOND_INFLUENCER');
    expect(repo.getLeaderboard).toHaveBeenCalled();
  });

  it('allows active member to view leaderboard', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity({ communityLeaderId: LEADER_ID }) as any);
    repo.findActiveMembership.mockResolvedValue({ id: MEMBERSHIP_ID, status: 'ACTIVE' } as any);
    repo.getLeaderboard.mockResolvedValue({ entries: [], total: 0 });

    await communityService.getLeaderboard(COMM_ID, {}, MEMBER_ID, 'GOLD_INFLUENCER');
    expect(repo.getLeaderboard).toHaveBeenCalled();
  });

  it('throws 403 for non-member non-admin', async () => {
    repo.findCommunityById.mockResolvedValue(makeCommunity({ communityLeaderId: LEADER_ID }) as any);
    repo.findActiveMembership.mockResolvedValue(null);

    await expect(communityService.getLeaderboard(COMM_ID, {}, MEMBER_ID, 'GOLD_INFLUENCER'))
      .rejects.toMatchObject({ statusCode: 403 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR15 — Cross-Community Rankings
// ─────────────────────────────────────────────────────────────────────────────
describe('FR15: getCommunityRankings()', () => {
  it('returns paginated rankings', async () => {
    repo.getCommunityRankings.mockResolvedValue({
      rankings: [{ rank: 1, communityId: COMM_ID, title: 'Fashion Hub', memberCount: 5 }],
      total: 1,
    });

    const result = await communityService.getCommunityRankings({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toHaveProperty('rank', 1);
    expect(result.meta.total).toBe(1);
  });

  it('passes status filter to repository', async () => {
    repo.getCommunityRankings.mockResolvedValue({ rankings: [], total: 0 });

    await communityService.getCommunityRankings({ status: 'ACTIVE' });
    expect(repo.getCommunityRankings).toHaveBeenCalledWith(expect.objectContaining({ status: 'ACTIVE' }));
  });
});
