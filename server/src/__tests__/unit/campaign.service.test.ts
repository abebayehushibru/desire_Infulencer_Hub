// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests — Campaign Service (FR16–FR23)
// ─────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz1234';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_long_abcdefghijklmnopqrstuvwxyz12';
process.env.BCRYPT_ROUNDS = '4';

jest.mock('../../modules/campaign/repositories/campaign.repository', () => ({
  campaignRepository: {
    createCampaign:               jest.fn(),
    findCampaignById:             jest.fn(),
    listCampaigns:                jest.fn(),
    updateCampaign:               jest.fn(),
    softDeleteCampaign:           jest.fn(),
    setCampaignStatus:            jest.fn(),
    createApproval:               jest.fn(),
    findLatestApprovalByRole:     jest.fn(),
    createTrackingLink:           jest.fn(),
    findTrackingLink:             jest.fn(),
    findTrackingLinkByCode:       jest.fn(),
    createReferralCode:           jest.fn(),
    findReferralCode:             jest.fn(),
    findReferralCodeByCode:       jest.fn(),
    listCampaignTracking:         jest.fn(),
    bulkCreateTrackingResources:  jest.fn().mockResolvedValue(undefined),
    createConversion:             jest.fn(),
    findConversionById:           jest.fn(),
    listConversions:              jest.fn(),
    updateConversion:             jest.fn(),
    softDeleteConversion:         jest.fn(),
    findCommunityById:            jest.fn(),
    findActiveCommunityMembers:   jest.fn(),
    findUserById:                 jest.fn(),
    findActiveMembership:         jest.fn(),
    createAuditLog:               jest.fn(),
    createNotification:           jest.fn().mockResolvedValue(undefined),
  },
}));

import { campaignService } from '../../modules/campaign/services/campaign.service';
import { campaignRepository as mockRepo } from '../../modules/campaign/repositories/campaign.repository';
import { ApiError } from '../../common/errors/ApiError';

const repo = mockRepo as jest.Mocked<typeof mockRepo>;
const ctx  = { ip: '127.0.0.1', userAgent: 'jest' };

// ── UUIDs ─────────────────────────────────────────────────────────────────────
const BIZ_ID      = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const ADMIN_ID    = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
const LEADER_ID   = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
const CAMP_ID     = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';
const COMM_ID     = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15';
const INFLU_ID    = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16';
const CONV_ID     = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17';

const makeOwner = (overrides: Record<string, any> = {}) => ({
  id: BIZ_ID, role: 'BUSINESS_OWNER', status: 'ACTIVE',
  businessProfile: { id: 'bp-1', verificationStatus: 'APPROVED' },
  ...overrides,
});

const makeCampaign = (overrides: Record<string, any> = {}) => ({
  id: CAMP_ID, ownerId: BIZ_ID, title: 'Summer Sale',
  type: 'SALES', budget: 1000, targetPlatform: 'Instagram',
  startDate: new Date('2026-08-01'), endDate: new Date('2026-09-01'),
  status: 'DRAFT', payoutPerConversion: 10, trackingMethod: 'UNIQUE_LINK',
  communityId: COMM_ID, adminRejectionReason: null, leaderRejectionReason: null,
  createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
  owner: { id: BIZ_ID, firstName: 'Jane', lastName: 'Biz', email: 'biz@x.com', role: 'BUSINESS_OWNER' },
  community: { id: COMM_ID, title: 'Fashion Hub', status: 'ACTIVE', communityLeaderId: LEADER_ID },
  approvals: [],
  ...overrides,
});

const makeCommunity = (overrides: Record<string, any> = {}) => ({
  id: COMM_ID, title: 'Fashion Hub', status: 'ACTIVE',
  communityLeaderId: LEADER_ID,
  commission: null,
  _count: { members: 3 },
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// FR16 — Campaign Creation
// ─────────────────────────────────────────────────────────────────────────────
describe('FR16: createCampaign()', () => {
  const dto = {
    title: 'Summer Sale', type: 'SALES' as const, budget: 1000,
    targetPlatform: 'Instagram',
    startDate: '2026-08-01T00:00:00Z', endDate: '2026-09-01T00:00:00Z',
    payoutPerConversion: 10, trackingMethod: 'UNIQUE_LINK' as const,
  };

  it('creates a SALES campaign for a verified Business Owner', async () => {
    repo.findUserById.mockResolvedValue(makeOwner() as any);
    repo.createCampaign.mockResolvedValue(makeCampaign() as any);

    const result = await campaignService.createCampaign(dto, BIZ_ID, ctx);
    expect(repo.createCampaign).toHaveBeenCalledTimes(1);
    expect(repo.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CAMPAIGN_CREATED', userId: BIZ_ID }),
    );
  });

  it('creates an AWARENESS campaign (no SALES fields required)', async () => {
    repo.findUserById.mockResolvedValue(makeOwner() as any);
    repo.createCampaign.mockResolvedValue(makeCampaign({ type: 'AWARENESS' }) as any);

    await campaignService.createCampaign({
      title: 'Awareness Push', type: 'AWARENESS', budget: 500,
      targetPlatform: 'TikTok',
      startDate: '2026-08-01T00:00:00Z', endDate: '2026-09-01T00:00:00Z',
    }, BIZ_ID, ctx);

    expect(repo.createCampaign).toHaveBeenCalled();
  });

  it('throws 403 if user is not a BUSINESS_OWNER', async () => {
    repo.findUserById.mockResolvedValue({ ...makeOwner(), role: 'AGENT' } as any);
    await expect(campaignService.createCampaign(dto, BIZ_ID, ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 403 if business profile is not APPROVED', async () => {
    repo.findUserById.mockResolvedValue(makeOwner({ businessProfile: { verificationStatus: 'PENDING' } }) as any);
    await expect(campaignService.createCampaign(dto, BIZ_ID, ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 400 if budget <= 0', async () => {
    repo.findUserById.mockResolvedValue(makeOwner() as any);
    await expect(campaignService.createCampaign({ ...dto, budget: 0 }, BIZ_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 if endDate <= startDate', async () => {
    repo.findUserById.mockResolvedValue(makeOwner() as any);
    await expect(campaignService.createCampaign({
      ...dto, startDate: '2026-09-01T00:00:00Z', endDate: '2026-08-01T00:00:00Z',
    }, BIZ_ID, ctx)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 for SALES without payoutPerConversion', async () => {
    repo.findUserById.mockResolvedValue(makeOwner() as any);
    await expect(campaignService.createCampaign(
      { ...dto, payoutPerConversion: undefined }, BIZ_ID, ctx,
    )).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 for SALES without trackingMethod', async () => {
    repo.findUserById.mockResolvedValue(makeOwner() as any);
    await expect(campaignService.createCampaign(
      { ...dto, trackingMethod: undefined }, BIZ_ID, ctx,
    )).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('FR16: deleteCampaign()', () => {
  it('soft-deletes a DRAFT campaign', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign() as any);
    repo.softDeleteCampaign.mockResolvedValue({} as any);

    await campaignService.deleteCampaign(CAMP_ID, BIZ_ID, 'BUSINESS_OWNER', ctx);
    expect(repo.softDeleteCampaign).toHaveBeenCalledWith(CAMP_ID);
  });

  it('throws 400 if campaign is not in DRAFT', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'ACTIVE' }) as any);
    await expect(campaignService.deleteCampaign(CAMP_ID, BIZ_ID, 'BUSINESS_OWNER', ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 403 if requester is not the owner', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign() as any);
    await expect(campaignService.deleteCampaign(CAMP_ID, 'other-user', 'BUSINESS_OWNER', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR18 — Community Assignment + Submit
// ─────────────────────────────────────────────────────────────────────────────
describe('FR18: submitCampaign()', () => {
  it('submits a DRAFT SALES campaign to a valid ACTIVE community', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign() as any);
    repo.findCommunityById.mockResolvedValue(makeCommunity() as any);
    repo.updateCampaign.mockResolvedValue(makeCampaign({ status: 'PENDING_ADMIN_APPROVAL' }) as any);

    await campaignService.submitCampaign(CAMP_ID, COMM_ID, BIZ_ID, ctx);
    expect(repo.updateCampaign).toHaveBeenCalledWith(CAMP_ID, expect.objectContaining({
      status: 'PENDING_ADMIN_APPROVAL',
    }));
  });

  it('throws 400 if campaign is not DRAFT', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'ACTIVE' }) as any);
    await expect(campaignService.submitCampaign(CAMP_ID, COMM_ID, BIZ_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 403 if requester is not the owner', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign() as any);
    await expect(campaignService.submitCampaign(CAMP_ID, COMM_ID, 'other', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 404 if community not found', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign() as any);
    repo.findCommunityById.mockResolvedValue(null);
    await expect(campaignService.submitCampaign(CAMP_ID, COMM_ID, BIZ_ID, ctx))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 if community is INACTIVE', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign() as any);
    repo.findCommunityById.mockResolvedValue(makeCommunity({ status: 'INACTIVE' }) as any);
    await expect(campaignService.submitCampaign(CAMP_ID, COMM_ID, BIZ_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR19 — Admin Review
// ─────────────────────────────────────────────────────────────────────────────
describe('FR19: adminReview()', () => {
  const pending = makeCampaign({ status: 'PENDING_ADMIN_APPROVAL' });

  it('approves campaign and moves to PENDING_LEADER_APPROVAL', async () => {
    repo.findCampaignById.mockResolvedValue(pending as any);
    repo.updateCampaign.mockResolvedValue(makeCampaign({ status: 'PENDING_LEADER_APPROVAL' }) as any);
    repo.createApproval.mockResolvedValue({} as any);

    await campaignService.adminReview(CAMP_ID, { action: 'approve' }, ADMIN_ID, ctx);
    expect(repo.updateCampaign).toHaveBeenCalledWith(CAMP_ID, expect.objectContaining({ status: 'PENDING_LEADER_APPROVAL' }));
    expect(repo.createApproval).toHaveBeenCalled();
    expect(repo.createNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'CAMPAIGN_APPROVED' }));
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'CAMPAIGN_ADMIN_APPROVED' }));
  });

  it('rejects campaign with mandatory reason', async () => {
    repo.findCampaignById.mockResolvedValue(pending as any);
    repo.updateCampaign.mockResolvedValue(makeCampaign({ status: 'REJECTED' }) as any);
    repo.createApproval.mockResolvedValue({} as any);

    await campaignService.adminReview(CAMP_ID, { action: 'reject', reason: 'Budget too low for market' }, ADMIN_ID, ctx);
    expect(repo.updateCampaign).toHaveBeenCalledWith(CAMP_ID, expect.objectContaining({
      status: 'REJECTED', adminRejectionReason: 'Budget too low for market',
    }));
    expect(repo.createNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'CAMPAIGN_REJECTED' }));
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'CAMPAIGN_ADMIN_REJECTED' }));
  });

  it('throws 400 if campaign is not PENDING_ADMIN_APPROVAL', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'DRAFT' }) as any);
    await expect(campaignService.adminReview(CAMP_ID, { action: 'approve' }, ADMIN_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 if rejecting without reason', async () => {
    repo.findCampaignById.mockResolvedValue(pending as any);
    await expect(campaignService.adminReview(CAMP_ID, { action: 'reject' }, ADMIN_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR20 — Leader Review
// ─────────────────────────────────────────────────────────────────────────────
describe('FR20: leaderReview()', () => {
  const pendingLeader = makeCampaign({ status: 'PENDING_LEADER_APPROVAL' });

  it('leader accepts campaign → ACTIVE + tracking generated', async () => {
    repo.findCampaignById.mockResolvedValue(pendingLeader as any);
    repo.updateCampaign.mockResolvedValue(makeCampaign({ status: 'ACTIVE' }) as any);
    repo.createApproval.mockResolvedValue({} as any);
    repo.findActiveCommunityMembers.mockResolvedValue([
      { userId: INFLU_ID }, { userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99' },
    ] as any);

    await campaignService.leaderReview(CAMP_ID, { action: 'accept' }, LEADER_ID, ctx);

    expect(repo.updateCampaign).toHaveBeenCalledWith(CAMP_ID, expect.objectContaining({ status: 'ACTIVE' }));
    expect(repo.bulkCreateTrackingResources).toHaveBeenCalled();
    expect(repo.createNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'CAMPAIGN_ACCEPTED' }));
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'CAMPAIGN_LEADER_ACCEPTED' }));
  });

  it('leader rejects with mandatory reason', async () => {
    repo.findCampaignById.mockResolvedValue(pendingLeader as any);
    repo.updateCampaign.mockResolvedValue(makeCampaign({ status: 'REJECTED' }) as any);
    repo.createApproval.mockResolvedValue({} as any);

    await campaignService.leaderReview(CAMP_ID, { action: 'reject', reason: 'Not suitable for our community brand' }, LEADER_ID, ctx);
    expect(repo.createNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'CAMPAIGN_LEADER_REJECTED' }));
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'CAMPAIGN_LEADER_REJECTED' }));
  });

  it('throws 403 if user is not the assigned community leader', async () => {
    repo.findCampaignById.mockResolvedValue(pendingLeader as any);
    await expect(campaignService.leaderReview(CAMP_ID, { action: 'accept' }, 'wrong-leader', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 400 if campaign is not PENDING_LEADER_APPROVAL', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'ACTIVE' }) as any);
    await expect(campaignService.leaderReview(CAMP_ID, { action: 'accept' }, LEADER_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 if rejecting without reason', async () => {
    repo.findCampaignById.mockResolvedValue(pendingLeader as any);
    await expect(campaignService.leaderReview(CAMP_ID, { action: 'reject' }, LEADER_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR22 — Lifecycle: state machine
// ─────────────────────────────────────────────────────────────────────────────
describe('FR22: State Machine', () => {
  it('pauses an ACTIVE campaign', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'ACTIVE' }) as any);
    repo.setCampaignStatus.mockResolvedValue(makeCampaign({ status: 'PAUSED' }) as any);

    await campaignService.pauseCampaign(CAMP_ID, BIZ_ID, 'BUSINESS_OWNER', ctx);
    expect(repo.setCampaignStatus).toHaveBeenCalledWith(CAMP_ID, 'PAUSED');
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'CAMPAIGN_PAUSED' }));
  });

  it('throws 400 when pausing a DRAFT (invalid transition)', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'DRAFT' }) as any);
    await expect(campaignService.pauseCampaign(CAMP_ID, BIZ_ID, 'BUSINESS_OWNER', ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('completes an ACTIVE campaign', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'ACTIVE' }) as any);
    repo.setCampaignStatus.mockResolvedValue(makeCampaign({ status: 'COMPLETED' }) as any);

    await campaignService.completeCampaign(CAMP_ID, BIZ_ID, 'BUSINESS_OWNER', ctx);
    expect(repo.setCampaignStatus).toHaveBeenCalledWith(CAMP_ID, 'COMPLETED');
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'CAMPAIGN_COMPLETED' }));
  });

  it('completes a PAUSED campaign', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'PAUSED' }) as any);
    repo.setCampaignStatus.mockResolvedValue(makeCampaign({ status: 'COMPLETED' }) as any);

    await campaignService.completeCampaign(CAMP_ID, BIZ_ID, 'BUSINESS_OWNER', ctx);
    expect(repo.setCampaignStatus).toHaveBeenCalledWith(CAMP_ID, 'COMPLETED');
  });

  it('throws 400 when completing a DRAFT', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'DRAFT' }) as any);
    await expect(campaignService.completeCampaign(CAMP_ID, BIZ_ID, 'BUSINESS_OWNER', ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('admin can pause a campaign', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'ACTIVE' }) as any);
    repo.setCampaignStatus.mockResolvedValue(makeCampaign({ status: 'PAUSED' }) as any);

    await campaignService.pauseCampaign(CAMP_ID, ADMIN_ID, 'SYSTEM_ADMIN', ctx);
    expect(repo.setCampaignStatus).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FR23 — Manual Conversions
// ─────────────────────────────────────────────────────────────────────────────
describe('FR23: addConversion()', () => {
  const activeManual = makeCampaign({ status: 'ACTIVE', trackingMethod: 'MANUAL', communityId: COMM_ID });
  const dto = { influencerId: INFLU_ID, amount: 50, convertedAt: '2026-08-15T10:00:00Z' };

  it('adds a manual conversion for an active member', async () => {
    repo.findCampaignById.mockResolvedValue(activeManual as any);
    repo.findActiveMembership.mockResolvedValue({ id: 'mem-1', status: 'ACTIVE' } as any);
    repo.createConversion.mockResolvedValue({ id: CONV_ID, amount: 50 } as any);

    await campaignService.addConversion(CAMP_ID, dto, BIZ_ID, ctx);
    expect(repo.createConversion).toHaveBeenCalledWith(expect.objectContaining({
      campaignId: CAMP_ID, influencerId: INFLU_ID, amount: 50,
    }));
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'CONVERSION_ADDED' }));
  });

  it('throws 400 if campaign is not ACTIVE', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'DRAFT', trackingMethod: 'MANUAL' }) as any);
    await expect(campaignService.addConversion(CAMP_ID, dto, BIZ_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 if tracking method is not MANUAL', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'ACTIVE', trackingMethod: 'UNIQUE_LINK' }) as any);
    await expect(campaignService.addConversion(CAMP_ID, dto, BIZ_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 403 if requester is not the owner', async () => {
    repo.findCampaignById.mockResolvedValue(activeManual as any);
    await expect(campaignService.addConversion(CAMP_ID, dto, 'other-user', ctx))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 400 if influencer is not an active community member', async () => {
    repo.findCampaignById.mockResolvedValue(activeManual as any);
    repo.findActiveMembership.mockResolvedValue(null);
    await expect(campaignService.addConversion(CAMP_ID, dto, BIZ_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws 400 if amount <= 0', async () => {
    repo.findCampaignById.mockResolvedValue(activeManual as any);
    repo.findActiveMembership.mockResolvedValue({ id: 'mem-1' } as any);
    await expect(campaignService.addConversion(CAMP_ID, { ...dto, amount: 0 }, BIZ_ID, ctx))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('FR23: deleteConversion()', () => {
  it('soft-deletes a conversion on an ACTIVE campaign', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'ACTIVE', trackingMethod: 'MANUAL' }) as any);
    repo.findConversionById.mockResolvedValue({ id: CONV_ID, campaignId: CAMP_ID } as any);
    repo.softDeleteConversion.mockResolvedValue({} as any);

    await campaignService.deleteConversion(CAMP_ID, CONV_ID, BIZ_ID, ctx);
    expect(repo.softDeleteConversion).toHaveBeenCalledWith(CONV_ID);
    expect(repo.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: 'CONVERSION_DELETED' }));
  });

  it('throws 404 if conversion does not belong to this campaign', async () => {
    repo.findCampaignById.mockResolvedValue(makeCampaign({ status: 'ACTIVE', trackingMethod: 'MANUAL' }) as any);
    repo.findConversionById.mockResolvedValue({ id: CONV_ID, campaignId: 'other-campaign' } as any);
    await expect(campaignService.deleteConversion(CAMP_ID, CONV_ID, BIZ_ID, ctx))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
