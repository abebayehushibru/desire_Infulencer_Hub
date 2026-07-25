// ─────────────────────────────────────────────────────────────────────────────
// Unit Tests — Tracking & Earnings Service (FR24–FR31)
// ─────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.APP_ENCRYPTION_KEY = '12345678901234567890123456789012';

jest.mock('../../config/redis', () => ({
  default: {
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
  },
}));

jest.mock('../../modules/tracking/repositories/tracking.repository', () => ({
  trackingRepository: {
    findTrackingLinkByCode: jest.fn(),
    findReferralCodeByCode: jest.fn(),
    incrementTrackingLinkClickCount: jest.fn().mockResolvedValue(undefined),
    incrementReferralCodeUseCount: jest.fn().mockResolvedValue(undefined),
    findTrackingEventByLinkAndIp: jest.fn(),
    findConversionByTrackingLink: jest.fn(),
    findConversionByReferralCode: jest.fn(),
    createTrackingEvent: jest.fn(),
    findCommunityWithCommission: jest.fn(),
    recordConversionTransaction: jest.fn(),
    recordManualConversionTransaction: jest.fn(),
    findEarningByManualConversionId: jest.fn(),
    getBalance: jest.fn(),
    sumEarnings: jest.fn(),
    getMonthlyEarnings: jest.fn(),
    getCampaignEarningsBreakdown: jest.fn(),
    findInfluencerProfileByUserId: jest.fn(),
    sumLeaderOverrideEarnings: jest.fn(),
    getCommunityEarningsForLeader: jest.fn(),
    listEarnings: jest.fn(),
    findCampaignById: jest.fn(),
    getEarningsByCampaign: jest.fn(),
    getBusinessAnalytics: jest.fn(),
    getCommunityMemberPerformance: jest.fn(),
    getMemberStats: jest.fn(),
    hasPendingWithdrawal: jest.fn(),
    createWithdrawalTransaction: jest.fn(),
    findWithdrawalById: jest.fn(),
    cancelWithdrawalTransaction: jest.fn(),
    listWithdrawals: jest.fn(),
    listAllWithdrawals: jest.fn(),
    approveWithdrawalTransaction: jest.fn(),
    rejectWithdrawalTransaction: jest.fn(),
    createNotification: jest.fn().mockResolvedValue({}),
    createAuditLog: jest.fn().mockResolvedValue(undefined),
  },
}));

import { trackingService } from '../../modules/tracking/services/tracking.service';
import { trackingRepository as mockRepo } from '../../modules/tracking/repositories/tracking.repository';
import { ApiError } from '../../common/errors/ApiError';

const repo = mockRepo as jest.Mocked<typeof mockRepo>;
const ctx = { ip: '192.168.1.1', userAgent: 'Jest/Test-Runner' };

describe('Module 5: Tracking & Earnings Service (FR24–FR31)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // FR24: Conversion Tracking via Unique Link
  // ─────────────────────────────────────────────────────────────────────────
  describe('FR24: Click & Conversion Tracking', () => {
    const mockLink = {
      id: 'link-1',
      code: 'TRK12345678',
      influencer: { id: 'inf-1' },
      campaign: {
        id: 'camp-1',
        title: 'Summer Promo',
        status: 'ACTIVE',
        trackingMethod: 'UNIQUE_LINK',
        payoutPerConversion: 100,
        communityId: 'comm-1',
        community: { id: 'comm-1', communityLeaderId: 'leader-1', commission: { platformFee: 10, leaderPercentage: 20, memberPercentage: 80 } },
      },
    };

    it('trackClick() records click event successfully', async () => {
      repo.findTrackingLinkByCode.mockResolvedValue(mockLink as any);
      repo.findTrackingEventByLinkAndIp.mockResolvedValue(null);
      repo.createTrackingEvent.mockResolvedValue({ id: 'evt-1', isDuplicate: false } as any);

      const result = await trackingService.trackClick({
        code: 'TRK12345678',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(repo.incrementTrackingLinkClickCount).toHaveBeenCalledWith('link-1');
      expect(result.eventId).toBe('evt-1');
      expect(result.isDuplicate).toBe(false);
    });

    it('trackClick() detects duplicate IP click within 30 minutes', async () => {
      repo.findTrackingLinkByCode.mockResolvedValue(mockLink as any);
      repo.findTrackingEventByLinkAndIp.mockResolvedValue({ id: 'evt-old' } as any);
      repo.createTrackingEvent.mockResolvedValue({ id: 'evt-2', isDuplicate: true } as any);

      const result = await trackingService.trackClick({
        code: 'TRK12345678',
        ipAddress: '192.168.1.1',
      });

      expect(result.isDuplicate).toBe(true);
    });

    it('trackClick() throws 404 for invalid code', async () => {
      repo.findTrackingLinkByCode.mockResolvedValue(null);
      await expect(trackingService.trackClick({ code: 'INVALID' }))
        .rejects.toThrow(ApiError);
    });

    it('trackConversion() calculates platform fee and leader/member commission split correctly', async () => {
      repo.findTrackingLinkByCode.mockResolvedValue(mockLink as any);
      repo.findConversionByTrackingLink.mockResolvedValue(null);
      repo.findCommunityWithCommission.mockResolvedValue({
        id: 'comm-1',
        communityLeaderId: 'leader-1',
        commission: { platformFee: 10, leaderPercentage: 20, memberPercentage: 80 },
      } as any);

      repo.recordConversionTransaction.mockResolvedValue({
        event: { id: 'evt-conv-1' } as any,
        earnings: [
          { id: 'earn-mem', influencerId: 'inf-1', influencerAmount: 72, isLeaderCommission: false },
          { id: 'earn-lead', influencerId: 'leader-1', influencerAmount: 18, isLeaderCommission: true },
        ] as any,
      });

      const res = await trackingService.trackConversion({ code: 'TRK12345678' }, ctx);

      expect(res.eventId).toBe('evt-conv-1');
      expect(res.amount).toBe(72);
      expect(repo.recordConversionTransaction).toHaveBeenCalled();
    });

    it('trackConversion() rejects duplicate conversion for same tracking link', async () => {
      repo.findTrackingLinkByCode.mockResolvedValue(mockLink as any);
      repo.findConversionByTrackingLink.mockResolvedValue({ id: 'already-converted' } as any);

      await expect(trackingService.trackConversion({ code: 'TRK12345678' }, ctx))
        .rejects.toThrow(ApiError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // FR25: Referral Code Tracking
  // ─────────────────────────────────────────────────────────────────────────
  describe('FR25: Referral Code Tracking', () => {
    const mockRef = {
      id: 'ref-1',
      code: 'REF12345',
      influencer: { id: 'inf-1' },
      campaign: {
        id: 'camp-1',
        title: 'Referral Campaign',
        status: 'ACTIVE',
        trackingMethod: 'REFERRAL_CODE',
        payoutPerConversion: 200,
        communityId: 'comm-1',
      },
    };

    it('trackReferral() records conversion using valid referral code', async () => {
      repo.findReferralCodeByCode.mockResolvedValue(mockRef as any);
      repo.findConversionByReferralCode.mockResolvedValue(null);
      repo.findCommunityWithCommission.mockResolvedValue({
        id: 'comm-1',
        communityLeaderId: 'inf-1', // converter is leader
        commission: { platformFee: 5, leaderPercentage: 30, memberPercentage: 70 },
      } as any);

      repo.recordConversionTransaction.mockResolvedValue({
        event: { id: 'evt-ref-1' } as any,
        earnings: [
          { id: 'earn-ref', influencerId: 'inf-1', influencerAmount: 57, isLeaderCommission: true },
        ] as any,
      });

      const res = await trackingService.trackReferral({ code: 'REF12345' }, ctx);

      expect(repo.incrementReferralCodeUseCount).toHaveBeenCalledWith('ref-1');
      expect(res.eventId).toBe('evt-ref-1');
      expect(res.amount).toBe(57);
    });

    it('trackReferral() normalizes lowercase referral code', async () => {
      repo.findReferralCodeByCode.mockResolvedValue(mockRef as any);
      repo.findConversionByReferralCode.mockResolvedValue(null);
      repo.findCommunityWithCommission.mockResolvedValue({
        id: 'comm-1',
        communityLeaderId: null,
        commission: { platformFee: 0, leaderPercentage: 0, memberPercentage: 100 },
      } as any);

      repo.recordConversionTransaction.mockResolvedValue({
        event: { id: 'evt-1' } as any,
        earnings: [{ id: 'e-1', influencerId: 'inf-1', influencerAmount: 200, isLeaderCommission: false }] as any,
      });

      await trackingService.trackReferral({ code: 'ref12345' }, ctx);
      expect(repo.findReferralCodeByCode).toHaveBeenCalledWith('REF12345');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // FR26: Earnings Dashboard for Influencers
  // ─────────────────────────────────────────────────────────────────────────
  describe('FR26: Earnings Dashboard & History', () => {
    it('getEarningsDashboard() returns metrics for standard influencer', async () => {
      repo.getBalance.mockResolvedValue({ availableBalance: 150, withdrawnAmount: 50 } as any);
      repo.sumEarnings.mockImplementation(async (_id, status) => {
        if (!status) return 500;
        if (status === 'PENDING') return 300;
        return 0;
      });
      repo.getMonthlyEarnings.mockResolvedValue([{ month: '2026-07', earnings: 200 }] as any);
      repo.getCampaignEarningsBreakdown.mockResolvedValue([]) as any;

      const res = await trackingService.getEarningsDashboard('inf-1', 'INFLUENCER');

      expect(res.totalEarnings).toBe(500);
      expect(res.pendingBalance).toBe(300);
      expect(res.availableBalance).toBe(150);
      expect(res.withdrawnAmount).toBe(50);
    });

    it('getEarningsDashboard() includes DIAMOND leader override stats', async () => {
      repo.getBalance.mockResolvedValue({ availableBalance: 500, withdrawnAmount: 100 } as any);
      repo.sumEarnings.mockResolvedValue(1000);
      repo.getMonthlyEarnings.mockResolvedValue([]);
      repo.getCampaignEarningsBreakdown.mockResolvedValue([]);
      repo.findInfluencerProfileByUserId.mockResolvedValue({ currentTier: 'DIAMOND' } as any);
      repo.sumLeaderOverrideEarnings.mockResolvedValue(120);
      repo.getCommunityEarningsForLeader.mockResolvedValue({ totalCommunityEarnings: 600 } as any);

      const res = await trackingService.getEarningsDashboard('leader-1', 'INFLUENCER');

      expect(res.overrideCommission).toBe(120);
      expect(res.communityEarnings).toEqual({ totalCommunityEarnings: 600 });
    });

    it('getEarningsHistory() returns paginated list', async () => {
      repo.listEarnings.mockResolvedValue({
        earnings: [{ id: 'earn-1', netAmount: 100 }] as any,
        total: 1,
      });

      const res = await trackingService.getEarningsHistory('inf-1', { page: 1, limit: 10 });
      expect(res.data).toHaveLength(1);
      expect(res.meta.total).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // FR28 & FR29: Analytics
  // ─────────────────────────────────────────────────────────────────────────
  describe('FR28 & FR29: Analytics', () => {
    it('getBusinessAnalytics() queries analytics for business owner', async () => {
      repo.getBusinessAnalytics.mockResolvedValue({
        totalCampaigns: 3,
        totalSpend: 1500,
        totalConversions: 45,
      } as any);

      const res = await trackingService.getBusinessAnalytics('biz-owner-1', { groupBy: 'month' });
      expect(res.totalCampaigns).toBe(3);
    });

    it('getCommunityMemberPerformance() allows Community Leader (INFLUENCER role)', async () => {
      repo.findCommunityWithCommission.mockResolvedValue({
        id: 'comm-1',
        communityLeaderId: 'leader-1',
      } as any);
      repo.getCommunityMemberPerformance.mockResolvedValue({ members: [], total: 0 });

      const res = await trackingService.getCommunityMemberPerformance(
        'comm-1',
        { page: 1, limit: 10 },
        'leader-1',
        'INFLUENCER'
      );

      expect(res.meta.total).toBe(0);
    });

    it('getCommunityMemberPerformance() rejects non-leader influencer with 403', async () => {
      repo.findCommunityWithCommission.mockResolvedValue({
        id: 'comm-1',
        communityLeaderId: 'leader-1',
      } as any);

      await expect(
        trackingService.getCommunityMemberPerformance('comm-1', {}, 'random-inf', 'INFLUENCER')
      ).rejects.toThrow(ApiError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // FR30 & FR31: Withdrawals
  // ─────────────────────────────────────────────────────────────────────────
  describe('FR30 & FR31: Withdrawal Operations', () => {
    const bankDetails = {
      accountName: 'John Doe',
      accountNumber: '1234567890',
      bankName: 'National Bank',
      country: 'USA',
    };

    it('createWithdrawal() creates pending withdrawal request', async () => {
      repo.getBalance.mockResolvedValue({ availableBalance: 500 } as any);
      repo.hasPendingWithdrawal.mockResolvedValue(false);
      repo.createWithdrawalTransaction.mockResolvedValue({
        id: 'w-1',
        amount: 200,
        status: 'PENDING',
        requestedAt: new Date(),
      } as any);

      const res = await trackingService.createWithdrawal('inf-1', { amount: 200, bankDetails }, ctx);

      expect(res.id).toBe('w-1');
      expect(res.amount).toBe(200);
      expect(res.status).toBe('PENDING');
    });

    it('createWithdrawal() prevents withdrawal exceeding available balance', async () => {
      repo.getBalance.mockResolvedValue({ availableBalance: 100 } as any);

      await expect(
        trackingService.createWithdrawal('inf-1', { amount: 200, bankDetails }, ctx)
      ).rejects.toThrow(ApiError);
    });

    it('createWithdrawal() prevents multiple pending withdrawal requests', async () => {
      repo.getBalance.mockResolvedValue({ availableBalance: 500 } as any);
      repo.hasPendingWithdrawal.mockResolvedValue(true);

      await expect(
        trackingService.createWithdrawal('inf-1', { amount: 200, bankDetails }, ctx)
      ).rejects.toThrow(ApiError);
    });

    it('cancelWithdrawal() restores available balance', async () => {
      repo.findWithdrawalById.mockResolvedValue({
        id: 'w-1',
        influencerId: 'inf-1',
        amount: 200,
        status: 'PENDING',
      } as any);

      await trackingService.cancelWithdrawal('w-1', 'inf-1', ctx);

      expect(repo.cancelWithdrawalTransaction).toHaveBeenCalledWith('w-1', 'inf-1', 200);
    });

    it('approveWithdrawal() admin approves withdrawal', async () => {
      repo.findWithdrawalById.mockResolvedValue({
        id: 'w-1',
        influencerId: 'inf-1',
        amount: 200,
        status: 'PENDING',
      } as any);
      repo.approveWithdrawalTransaction.mockResolvedValue({ id: 'w-1', status: 'APPROVED' } as any);

      const res = await trackingService.approveWithdrawal('w-1', 'admin-1', 'TX-REF-999');
      expect(res.status).toBe('APPROVED');
    });

    it('rejectWithdrawal() admin rejects withdrawal and restores balance', async () => {
      repo.findWithdrawalById.mockResolvedValue({
        id: 'w-1',
        influencerId: 'inf-1',
        amount: 200,
        status: 'PENDING',
      } as any);
      repo.rejectWithdrawalTransaction.mockResolvedValue({ id: 'w-1', status: 'REJECTED' } as any);

      const res = await trackingService.rejectWithdrawal('w-1', 'admin-1', 'Invalid bank details');
      expect(res.status).toBe('REJECTED');
      expect(repo.rejectWithdrawalTransaction).toHaveBeenCalledWith('w-1', 'inf-1', 200, 'admin-1', 'Invalid bank details');
    });
  });
});
