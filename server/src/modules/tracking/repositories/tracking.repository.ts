// ─────────────────────────────────────────────────────────────────────────────
// Tracking & Earnings Repository — FR24–FR31
// Pure data access. Zero business logic.
// ─────────────────────────────────────────────────────────────────────────────

import {
  TrackingEvent, Earning, CommissionCalculation,
  InfluencerBalance, WithdrawalRequest,
  TrackingEventType, EarningStatus, WithdrawalStatus,
  Prisma, AuditAction,
} from '@prisma/client';
import prisma from '../../../config/prisma';

export class TrackingRepository {

  // ─────────────────────────────────────────────────────────────────────────
  // TRACKING EVENTS — FR24 / FR25
  // ─────────────────────────────────────────────────────────────────────────

  async createTrackingEvent(data: {
    campaignId: string;
    communityId: string;
    influencerId: string;
    trackingLinkId?: string;
    referralCodeId?: string;
    eventType: TrackingEventType;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
    clickedAt: Date;
    isDuplicate?: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<TrackingEvent> {
    return prisma.trackingEvent.create({ data: data as any });
  }

  async markEventConverted(eventId: string): Promise<TrackingEvent> {
    return prisma.trackingEvent.update({
      where: { id: eventId },
      data: { isConverted: true, convertedAt: new Date() },
    });
  }

  async findTrackingEventByLinkAndIp(
    trackingLinkId: string,
    ipAddress: string,
    windowMs = 30 * 60 * 1000,  // 30-minute dedup window
  ) {
    const since = new Date(Date.now() - windowMs);
    return prisma.trackingEvent.findFirst({
      where: {
        trackingLinkId,
        ipAddress,
        clickedAt: { gte: since },
        isDuplicate: false,
        deletedAt: null,
      },
      orderBy: { clickedAt: 'desc' },
    });
  }

  async findConversionByTrackingLink(trackingLinkId: string, influencerId: string) {
    return prisma.trackingEvent.findFirst({
      where: {
        trackingLinkId,
        influencerId,
        isConverted: true,
        deletedAt: null,
      },
    });
  }

  async findConversionByReferralCode(referralCodeId: string) {
    return prisma.trackingEvent.findFirst({
      where: {
        referralCodeId,
        isConverted: true,
        deletedAt: null,
      },
    });
  }

  async findInfluencerProfileByUserId(userId: string) {
    return prisma.influencerProfile.findUnique({
      where: { userId },
    });
  }

  async getTrackingEventsByCampaign(campaignId: string, params: {
    page: number;
    limit: number;
    eventType?: TrackingEventType;
    influencerId?: string;
  }) {
    const where: Prisma.TrackingEventWhereInput = {
      campaignId,
      isDuplicate: false,
      deletedAt: null,
      ...(params.eventType    && { eventType:    params.eventType }),
      ...(params.influencerId && { influencerId: params.influencerId }),
    };

    const [events, total] = await prisma.$transaction([
      prisma.trackingEvent.findMany({
        where,
        include: {
          influencer: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { clickedAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.trackingEvent.count({ where }),
    ]);

    return { events, total };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TRACKING LINK & REFERRAL CODE LOOKUPS (reused from campaign module)
  // ─────────────────────────────────────────────────────────────────────────

  async findTrackingLinkByCode(code: string) {
    return prisma.trackingLink.findFirst({
      where: { code, deletedAt: null },
      include: {
        campaign: {
          select: {
            id: true, title: true, status: true, type: true, payoutPerConversion: true,
            trackingMethod: true, communityId: true,
            community: { select: { id: true, communityLeaderId: true, commission: true } },
          },
        },
        influencer: { select: { id: true } },
      },
    });
  }

  async findReferralCodeByCode(code: string) {
    return prisma.referralCode.findFirst({
      where: { code, deletedAt: null },
      include: {
        campaign: {
          select: {
            id: true, title: true, status: true, type: true, payoutPerConversion: true,
            trackingMethod: true, communityId: true,
            community: { select: { id: true, communityLeaderId: true, commission: true } },
          },
        },
        influencer: { select: { id: true } },
      },
    });
  }

  async incrementTrackingLinkClickCount(id: string): Promise<void> {
    await prisma.trackingLink.update({
      where: { id },
      data: { clickCount: { increment: 1 } },
    });
  }

  async incrementReferralCodeUseCount(id: string): Promise<void> {
    await prisma.referralCode.update({
      where: { id },
      data: { useCount: { increment: 1 } },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EARNINGS — FR26 / FR27
  // ─────────────────────────────────────────────────────────────────────────

  async findEarningByManualConversionId(manualConversionId: string) {
    return prisma.earning.findFirst({
      where: { manualConversionId, deletedAt: null },
    });
  }

  private async createEarningWithCalcTx(
    tx: Prisma.TransactionClient,
    earningData: {
      influencerId: string;
      campaignId: string;
      communityId: string;
      trackingEventId?: string;
      manualConversionId?: string;
      grossAmount: number;
      platformFeeAmount: number;
      netAmount: number;
      leaderCommission: number;
      memberCommission: number;
      influencerAmount: number;
      status: EarningStatus;
      platformFeeRate: number;
      leaderPercentageRate: number;
      memberPercentageRate: number;
      isLeaderCommission: boolean;
    },
  ): Promise<Earning> {
    const earning = await tx.earning.create({ data: earningData });

    await tx.commissionCalculation.create({
      data: {
        earningId:         earning.id,
        campaignId:        earningData.campaignId,
        communityId:       earningData.communityId,
        influencerId:      earningData.influencerId,
        grossAmount:       earningData.grossAmount,
        platformFeeRate:   earningData.platformFeeRate,
        platformFeeAmount: earningData.platformFeeAmount,
        netAmount:         earningData.netAmount,
        leaderRate:        earningData.leaderPercentageRate,
        leaderAmount:      earningData.leaderCommission,
        memberRate:        earningData.memberPercentageRate,
        memberAmount:      earningData.memberCommission,
        influencerAmount:  earningData.influencerAmount,
      },
    });

    return earning;
  }

  async createEarningWithCalc(earningData: Parameters<TrackingRepository['createEarningWithCalcTx']>[1]): Promise<Earning> {
    return prisma.$transaction((tx) => this.createEarningWithCalcTx(tx, earningData));
  }

  /** Atomic conversion: tracking event + earnings + balance updates in one transaction */
  async recordConversionTransaction(params: {
    event: {
      campaignId: string;
      communityId: string;
      influencerId: string;
      trackingLinkId?: string;
      referralCodeId?: string;
      eventType: TrackingEventType;
      ipAddress?: string;
      userAgent?: string;
      deviceInfo?: string;
      clickedAt: Date;
      convertedAt: Date;
    };
    earnings: Array<{
      influencerId: string;
      campaignId: string;
      communityId: string;
      trackingEventId?: string;
      manualConversionId?: string;
      grossAmount: number;
      platformFeeAmount: number;
      netAmount: number;
      leaderCommission: number;
      memberCommission: number;
      influencerAmount: number;
      status: EarningStatus;
      platformFeeRate: number;
      leaderPercentageRate: number;
      memberPercentageRate: number;
      isLeaderCommission: boolean;
    }>;
    balanceUpdates: Array<{ influencerId: string; amount: number }>;
  }): Promise<{ event: TrackingEvent; earnings: Earning[] }> {
    return prisma.$transaction(async (tx) => {
      const event = await tx.trackingEvent.create({
        data: {
          ...params.event,
          convertedAt: params.event.convertedAt,
          isConverted: true,
          isDuplicate: false,
        },
      });

      const earnings: Earning[] = [];
      for (const earningData of params.earnings) {
        earnings.push(await this.createEarningWithCalcTx(tx, {
          ...earningData,
          trackingEventId: earningData.trackingEventId ?? event.id,
        }));
      }

      for (const { influencerId, amount } of params.balanceUpdates) {
        await tx.influencerBalance.upsert({
          where: { influencerId },
          create: {
            influencerId,
            totalEarnings:    amount,
            availableBalance: amount,
          },
          update: {
            totalEarnings:    { increment: amount },
            availableBalance: { increment: amount },
          },
        });
      }

      return { event, earnings };
    });
  }

  /** Atomic manual conversion earning without tracking event */
  async recordManualConversionTransaction(params: {
    manualConversionId: string;
    earnings: Array<Parameters<TrackingRepository['createEarningWithCalcTx']>[1]>;
    balanceUpdates: Array<{ influencerId: string; amount: number }>;
  }): Promise<Earning[]> {
    return prisma.$transaction(async (tx) => {
      const earnings: Earning[] = [];
      for (const earningData of params.earnings) {
        earnings.push(await this.createEarningWithCalcTx(tx, earningData));
      }

      for (const { influencerId, amount } of params.balanceUpdates) {
        await tx.influencerBalance.upsert({
          where: { influencerId },
          create: {
            influencerId,
            totalEarnings:    amount,
            availableBalance: amount,
          },
          update: {
            totalEarnings:    { increment: amount },
            availableBalance: { increment: amount },
          },
        });
      }

      return earnings;
    });
  }

  async listEarnings(influencerId: string, params: {
    campaignId?: string;
    status?: EarningStatus;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
  }): Promise<{ earnings: any[]; total: number }> {
    const where: Prisma.EarningWhereInput = {
      influencerId,
      deletedAt: null,
      ...(params.campaignId && { campaignId: params.campaignId }),
      ...(params.status     && { status:     params.status }),
      ...(params.startDate || params.endDate ? {
        createdAt: {
          ...(params.startDate && { gte: params.startDate }),
          ...(params.endDate   && { lte: params.endDate }),
        },
      } : {}),
    };

    const [earnings, total] = await prisma.$transaction([
      prisma.earning.findMany({
        where,
        include: {
          campaign:  { select: { id: true, title: true, type: true } },
          community: { select: { id: true, title: true } },
          commissionCalc: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.earning.count({ where }),
    ]);

    return { earnings, total };
  }

  async getEarningsByCampaign(influencerId: string, campaignId: string) {
    return prisma.earning.findMany({
      where: { influencerId, campaignId, deletedAt: null },
      include: { commissionCalc: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sumEarnings(influencerId: string, status?: EarningStatus): Promise<number> {
    const result = await prisma.earning.aggregate({
      where: { influencerId, deletedAt: null, ...(status && { status }) },
      _sum: { influencerAmount: true },
    });
    return result._sum.influencerAmount ?? 0;
  }

  async getMonthlyEarnings(influencerId: string): Promise<any[]> {
    // Raw aggregation grouped by year-month
    const rows = await prisma.$queryRaw<any[]>`
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        SUM(influencer_amount)           AS total_earnings,
        COUNT(*)                         AS conversion_count
      FROM earnings
      WHERE influencer_id = ${influencerId}::uuid
        AND deleted_at IS NULL
        AND status != 'CANCELLED'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `;
    return rows;
  }

  async settleEarning(earningId: string): Promise<Earning> {
    return prisma.earning.update({
      where: { id: earningId },
      data: { status: 'AVAILABLE', settledAt: new Date() },
    });
  }

  async settleEarningsByTrackingEvent(trackingEventId: string): Promise<void> {
    await prisma.earning.updateMany({
      where: { trackingEventId, status: 'PENDING', deletedAt: null },
      data:  { status: 'AVAILABLE', settledAt: new Date() },
    });
  }

  async markEarningsWithdrawn(influencerId: string, earningIds: string[]): Promise<void> {
    await prisma.earning.updateMany({
      where: { id: { in: earningIds }, influencerId, status: 'AVAILABLE', deletedAt: null },
      data:  { status: 'WITHDRAWN' },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INFLUENCER BALANCE — FR26
  // ─────────────────────────────────────────────────────────────────────────

  async getBalance(influencerId: string): Promise<InfluencerBalance | null> {
    return prisma.influencerBalance.findFirst({
      where: { influencerId, deletedAt: null },
    });
  }

  async upsertBalance(influencerId: string, data: {
    totalEarnings?:    number;
    pendingBalance?:   number;
    availableBalance?: number;
    withdrawnAmount?:  number;
  }): Promise<InfluencerBalance> {
    return prisma.influencerBalance.upsert({
      where: { influencerId },
      create: {
        influencerId,
        totalEarnings:    data.totalEarnings    ?? 0,
        pendingBalance:   data.pendingBalance   ?? 0,
        availableBalance: data.availableBalance ?? 0,
        withdrawnAmount:  data.withdrawnAmount  ?? 0,
      },
      update: {
        ...(data.totalEarnings    !== undefined && { totalEarnings:    { increment: data.totalEarnings } }),
        ...(data.pendingBalance   !== undefined && { pendingBalance:   { increment: data.pendingBalance } }),
        ...(data.availableBalance !== undefined && { availableBalance: { increment: data.availableBalance } }),
        ...(data.withdrawnAmount  !== undefined && { withdrawnAmount:  { increment: data.withdrawnAmount } }),
      },
    });
  }

  /** Reserve funds for a pending withdrawal — does not increment withdrawnAmount */
  async reserveAvailableBalance(influencerId: string, amount: number): Promise<InfluencerBalance> {
    return prisma.influencerBalance.update({
      where: { influencerId },
      data: { availableBalance: { decrement: amount } },
    });
  }

  /** Restore reserved funds when a pending withdrawal is cancelled */
  async releaseAvailableBalance(influencerId: string, amount: number): Promise<InfluencerBalance> {
    return prisma.influencerBalance.update({
      where: { influencerId },
      data: { availableBalance: { increment: amount } },
    });
  }

  async debitAvailableBalance(influencerId: string, amount: number): Promise<InfluencerBalance> {
    return prisma.influencerBalance.update({
      where: { influencerId },
      data: {
        availableBalance: { decrement: amount },
        withdrawnAmount:  { increment: amount },
      },
    });
  }

  async getCampaignEarningsBreakdown(influencerId: string) {
    return prisma.earning.groupBy({
      by: ['campaignId'],
      where: { influencerId, deletedAt: null, status: { not: 'CANCELLED' } },
      _sum: { influencerAmount: true, grossAmount: true },
      _count: { id: true },
    });
  }

  async getCommunityEarningsForLeader(leaderId: string) {
    const communities = await prisma.community.findMany({
      where: { communityLeaderId: leaderId, deletedAt: null },
      select: { id: true, title: true },
    });

    return Promise.all(communities.map(async (c) => {
      const agg = await prisma.earning.aggregate({
        where: {
          communityId: c.id,
          deletedAt: null,
          status: { not: 'CANCELLED' },
        },
        _sum: { influencerAmount: true, grossAmount: true },
        _count: { id: true },
      });
      return {
        communityId:    c.id,
        communityTitle: c.title,
        totalEarnings:  agg._sum.influencerAmount ?? 0,
        grossAmount:    agg._sum.grossAmount ?? 0,
        conversionCount: agg._count.id,
      };
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WITHDRAWALS — FR30 / FR31
  // ─────────────────────────────────────────────────────────────────────────

  async createWithdrawal(data: {
    influencerId:   string;
    amount:         number;
    bankDetailsEnc: string;
  }): Promise<WithdrawalRequest> {
    return prisma.withdrawalRequest.create({ data });
  }

  async findWithdrawalById(id: string) {
    return prisma.withdrawalRequest.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async listWithdrawals(influencerId: string, params: {
    status?: WithdrawalStatus;
    page:    number;
    limit:   number;
  }): Promise<{ withdrawals: WithdrawalRequest[]; total: number }> {
    const where: Prisma.WithdrawalRequestWhereInput = {
      influencerId,
      deletedAt: null,
      ...(params.status && { status: params.status }),
    };

    const [withdrawals, total] = await prisma.$transaction([
      prisma.withdrawalRequest.findMany({
        where,
        orderBy: { requestedAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.withdrawalRequest.count({ where }),
    ]);

    return { withdrawals, total };
  }

  async updateWithdrawalStatus(id: string, data: {
    status:        WithdrawalStatus;
    reviewedBy?:   string;
    reviewNote?:   string;
    transactionRef?: string;
    processedAt?:  Date;
  }): Promise<WithdrawalRequest> {
    return prisma.withdrawalRequest.update({
      where: { id },
      data: {
        status:         data.status,
        reviewedAt:     data.reviewedBy ? new Date() : undefined,
        reviewedBy:     data.reviewedBy,
        reviewNote:     data.reviewNote,
        transactionRef: data.transactionRef,
        processedAt:    data.processedAt,
      },
    });
  }

  async sumLeaderOverrideEarnings(influencerId: string): Promise<number> {
    const result = await prisma.earning.aggregate({
      where: {
        influencerId,
        isLeaderCommission: true,
        deletedAt: null,
        status: { not: 'CANCELLED' },
      },
      _sum: { influencerAmount: true },
    });
    return result._sum.influencerAmount ?? 0;
  }

  async createWithdrawalTransaction(params: {
    influencerId:   string;
    amount:         number;
    bankDetailsEnc: string;
  }): Promise<WithdrawalRequest> {
    return prisma.$transaction(async (tx) => {
      await tx.influencerBalance.update({
        where: { influencerId: params.influencerId },
        data:  { availableBalance: { decrement: params.amount } },
      });
      return tx.withdrawalRequest.create({ data: params });
    });
  }

  async cancelWithdrawalTransaction(
    withdrawalId: string,
    influencerId: string,
    amount: number,
  ): Promise<WithdrawalRequest> {
    return prisma.$transaction(async (tx) => {
      await tx.influencerBalance.update({
        where: { influencerId },
        data:  { availableBalance: { increment: amount } },
      });
      return tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data:  { status: 'CANCELLED' },
      });
    });
  }

  async hasPendingWithdrawal(influencerId: string): Promise<boolean> {
    const count = await prisma.withdrawalRequest.count({
      where: { influencerId, status: 'PENDING', deletedAt: null },
    });
    return count > 0;
  }

  async listAllWithdrawals(params: {
    status?: WithdrawalStatus;
    influencerId?: string;
    page: number;
    limit: number;
  }): Promise<{ withdrawals: WithdrawalRequest[]; total: number }> {
    const where: Prisma.WithdrawalRequestWhereInput = {
      deletedAt: null,
      ...(params.status && { status: params.status }),
      ...(params.influencerId && { influencerId: params.influencerId }),
    };

    const [withdrawals, total] = await prisma.$transaction([
      prisma.withdrawalRequest.findMany({
        where,
        include: {
          influencer: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { requestedAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.withdrawalRequest.count({ where }),
    ]);

    return { withdrawals, total };
  }

  async approveWithdrawalTransaction(
    withdrawalId: string,
    influencerId: string,
    amount: number,
    adminId: string,
    transactionRef?: string,
    reviewNote?: string,
  ): Promise<WithdrawalRequest> {
    return prisma.$transaction(async (tx) => {
      await tx.influencerBalance.update({
        where: { influencerId },
        data: { withdrawnAmount: { increment: amount } },
      });
      return tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: 'APPROVED',
          reviewedBy: adminId,
          reviewedAt: new Date(),
          processedAt: new Date(),
          transactionRef,
          reviewNote,
        },
      });
    });
  }

  async rejectWithdrawalTransaction(
    withdrawalId: string,
    influencerId: string,
    amount: number,
    adminId: string,
    reviewNote: string,
  ): Promise<WithdrawalRequest> {
    return prisma.$transaction(async (tx) => {
      await tx.influencerBalance.update({
        where: { influencerId },
        data: { availableBalance: { increment: amount } },
      });
      return tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: 'REJECTED',
          reviewedBy: adminId,
          reviewedAt: new Date(),
          reviewNote,
        },
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ANALYTICS — FR28 / FR29
  // ─────────────────────────────────────────────────────────────────────────

  async getBusinessAnalytics(ownerId: string, params: {
    campaignId?: string;
    communityId?: string;
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    const campaignWhere: Prisma.CampaignWhereInput = {
      ownerId,
      deletedAt: null,
      ...(params.campaignId  && { id:          params.campaignId }),
      ...(params.communityId && { communityId: params.communityId }),
    };

    // Total campaigns
    const totalCampaigns = await prisma.campaign.count({ where: campaignWhere });

    const dateFilter = (params.startDate || params.endDate) ? {
      createdAt: {
        ...(params.startDate && { gte: params.startDate }),
        ...(params.endDate   && { lte: params.endDate }),
      },
    } : {};

    // All campaign IDs for this owner
    const campaigns = await prisma.campaign.findMany({
      where: campaignWhere,
      select: { id: true },
    });
    const campaignIds = campaigns.map(c => c.id);

    if (campaignIds.length === 0) {
      return {
        totalCampaigns: 0,
        totalConversions: 0,
        totalClicks: 0,
        totalSpend: 0,
        conversionRate: 0,
        costPerConversion: 0,
        campaignBreakdown: [],
        communityPerformance: [],
        influencerPerformance: [],
        timeSeries: [],
      };
    }

    const eventWhere: Prisma.TrackingEventWhereInput = {
      campaignId: { in: campaignIds },
      isDuplicate: false,
      deletedAt: null,
      ...dateFilter,
    };

    const [totalClicks, totalConversions, spendAgg] = await prisma.$transaction([
      prisma.trackingEvent.count({ where: { ...eventWhere, eventType: 'CLICK' } }),
      prisma.trackingEvent.count({ where: { ...eventWhere, isConverted: true } }),
      prisma.earning.aggregate({
        where: { campaignId: { in: campaignIds }, deletedAt: null, status: { not: 'CANCELLED' }, ...dateFilter },
        _sum: { grossAmount: true },
      }),
    ]);

    const totalSpend       = spendAgg._sum.grossAmount ?? 0;
    const conversionRate   = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const costPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;

    // Per-campaign breakdown
    const campaignBreakdown = await Promise.all(
      campaignIds.slice(0, 20).map(async (cid) => {
        const [clicks, conversions, spend] = await prisma.$transaction([
          prisma.trackingEvent.count({ where: { campaignId: cid, eventType: 'CLICK', isDuplicate: false, deletedAt: null, ...dateFilter } }),
          prisma.trackingEvent.count({ where: { campaignId: cid, isConverted: true, isDuplicate: false, deletedAt: null, ...dateFilter } }),
          prisma.earning.aggregate({ where: { campaignId: cid, deletedAt: null, status: { not: 'CANCELLED' }, ...dateFilter }, _sum: { grossAmount: true } }),
        ]);
        return {
          campaignId:  cid,
          clicks,
          conversions,
          totalSpend:  spend._sum.grossAmount ?? 0,
          conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
        };
      })
    );

    const communityPerformance = await this.getCommunityPerformance(campaignIds, dateFilter);
    const influencerPerformance = await this.getInfluencerPerformance(campaignIds, dateFilter);
    const timeSeries = params.groupBy
      ? await this.getAnalyticsTimeSeries(campaignIds, params.groupBy, dateFilter)
      : [];

    return {
      totalCampaigns,
      totalConversions,
      totalClicks,
      totalSpend,
      conversionRate,
      costPerConversion,
      campaignBreakdown,
      communityPerformance,
      influencerPerformance,
      timeSeries,
    };
  }

  private async getCommunityPerformance(
    campaignIds: string[],
    dateFilter: Record<string, unknown>,
  ) {
    const campaigns = await prisma.campaign.findMany({
      where: { id: { in: campaignIds }, deletedAt: null },
      select: { id: true, communityId: true, community: { select: { id: true, title: true } } },
    });

    const byCommunity = new Map<string, { communityId: string; communityTitle: string; campaignIds: string[] }>();
    for (const c of campaigns) {
      if (!c.communityId) continue;
      const existing = byCommunity.get(c.communityId);
      if (existing) {
        existing.campaignIds.push(c.id);
      } else {
        byCommunity.set(c.communityId, {
          communityId:    c.communityId,
          communityTitle: c.community?.title ?? 'Unknown',
          campaignIds:    [c.id],
        });
      }
    }

    return Promise.all([...byCommunity.values()].map(async (entry) => {
      const [clicks, conversions, spend] = await prisma.$transaction([
        prisma.trackingEvent.count({
          where: { campaignId: { in: entry.campaignIds }, eventType: 'CLICK', isDuplicate: false, deletedAt: null, ...dateFilter },
        }),
        prisma.trackingEvent.count({
          where: { campaignId: { in: entry.campaignIds }, isConverted: true, isDuplicate: false, deletedAt: null, ...dateFilter },
        }),
        prisma.earning.aggregate({
          where: { campaignId: { in: entry.campaignIds }, deletedAt: null, status: { not: 'CANCELLED' }, ...dateFilter },
          _sum: { grossAmount: true },
        }),
      ]);
      return {
        communityId:    entry.communityId,
        communityTitle: entry.communityTitle,
        clicks,
        conversions,
        totalSpend:     spend._sum.grossAmount ?? 0,
        conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      };
    }));
  }

  private async getInfluencerPerformance(
    campaignIds: string[],
    dateFilter: Record<string, unknown>,
  ) {
    const earnings = await prisma.earning.groupBy({
      by: ['influencerId'],
      where: { campaignId: { in: campaignIds }, deletedAt: null, status: { not: 'CANCELLED' }, ...dateFilter },
      _sum: { influencerAmount: true, grossAmount: true },
      _count: { id: true },
    });

    const influencerIds = earnings.map(e => e.influencerId);
    const users = influencerIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: influencerIds } },
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        })
      : [];
    const userMap = new Map(users.map(u => [u.id, u]));

    return Promise.all(earnings.map(async (e) => {
      const [clicks, conversions] = await prisma.$transaction([
        prisma.trackingEvent.count({
          where: { campaignId: { in: campaignIds }, influencerId: e.influencerId, eventType: 'CLICK', isDuplicate: false, deletedAt: null, ...dateFilter },
        }),
        prisma.trackingEvent.count({
          where: { campaignId: { in: campaignIds }, influencerId: e.influencerId, isConverted: true, isDuplicate: false, deletedAt: null, ...dateFilter },
        }),
      ]);
      return {
        influencerId: e.influencerId,
        influencer:   userMap.get(e.influencerId) ?? null,
        clicks,
        conversions,
        earnings:     e._sum.influencerAmount ?? 0,
        totalSpend:   e._sum.grossAmount ?? 0,
        conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      };
    }));
  }

  private async getAnalyticsTimeSeries(
    campaignIds: string[],
    groupBy: 'day' | 'week' | 'month',
    _dateFilter: Record<string, unknown>,
  ) {
    type TimeRow = { period: Date; conversions: bigint; total_spend: number | null };

    let rows: TimeRow[];
    if (groupBy === 'day') {
      rows = await prisma.$queryRaw<TimeRow[]>`
        SELECT DATE_TRUNC('day', e.created_at) AS period,
               COUNT(DISTINCT e.id)::bigint AS conversions,
               SUM(e.gross_amount) AS total_spend
        FROM earnings e
        WHERE e.campaign_id = ANY(${campaignIds}::uuid[])
          AND e.deleted_at IS NULL AND e.status != 'CANCELLED'
        GROUP BY DATE_TRUNC('day', e.created_at)
        ORDER BY period DESC LIMIT 90`;
    } else if (groupBy === 'week') {
      rows = await prisma.$queryRaw<TimeRow[]>`
        SELECT DATE_TRUNC('week', e.created_at) AS period,
               COUNT(DISTINCT e.id)::bigint AS conversions,
               SUM(e.gross_amount) AS total_spend
        FROM earnings e
        WHERE e.campaign_id = ANY(${campaignIds}::uuid[])
          AND e.deleted_at IS NULL AND e.status != 'CANCELLED'
        GROUP BY DATE_TRUNC('week', e.created_at)
        ORDER BY period DESC LIMIT 90`;
    } else {
      rows = await prisma.$queryRaw<TimeRow[]>`
        SELECT DATE_TRUNC('month', e.created_at) AS period,
               COUNT(DISTINCT e.id)::bigint AS conversions,
               SUM(e.gross_amount) AS total_spend
        FROM earnings e
        WHERE e.campaign_id = ANY(${campaignIds}::uuid[])
          AND e.deleted_at IS NULL AND e.status != 'CANCELLED'
        GROUP BY DATE_TRUNC('month', e.created_at)
        ORDER BY period DESC LIMIT 90`;
    }

    return rows.map(r => ({
      period:      r.period,
      conversions: Number(r.conversions),
      totalSpend:  r.total_spend ?? 0,
    }));
  }

  async getCommunityMemberPerformance(communityId: string, params: {
    page:      number;
    limit:     number;
    sortBy:    string;
    sortOrder: 'asc' | 'desc';
  }) {
    const members = await prisma.communityMember.findMany({
      where: { communityId, status: 'ACTIVE', deletedAt: null },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true, profileImage: true } },
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    const total = await prisma.communityMember.count({
      where: { communityId, status: 'ACTIVE', deletedAt: null },
    });

    const enriched = await Promise.all(members.map(async (m) => {
      const [clicks, conversions, earningsAgg, activeCampaigns] = await prisma.$transaction([
        prisma.trackingEvent.count({
          where: { communityId, influencerId: m.userId, eventType: 'CLICK', isDuplicate: false, deletedAt: null },
        }),
        prisma.trackingEvent.count({
          where: { communityId, influencerId: m.userId, isConverted: true, isDuplicate: false, deletedAt: null },
        }),
        prisma.earning.aggregate({
          where: { communityId, influencerId: m.userId, deletedAt: null, status: { not: 'CANCELLED' } },
          _sum: { influencerAmount: true },
        }),
        prisma.trackingLink.count({
          where: {
            influencerId: m.userId,
            campaign: { communityId, status: 'ACTIVE', deletedAt: null },
            deletedAt: null,
          },
        }),
      ]);

      return {
        memberId:       m.id,
        userId:         m.userId,
        user:           m.user,
        joinedAt:       m.joinedAt,
        clicks,
        conversions,
        earnings:       earningsAgg._sum.influencerAmount ?? 0,
        activeCampaigns,
        conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      };
    }));

    // Sort in-memory after enrichment (DB aggregation across tables)
    enriched.sort((a, b) => {
      const field = params.sortBy as keyof typeof a;
      const aVal  = (a[field] as number) ?? 0;
      const bVal  = (b[field] as number) ?? 0;
      return params.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return { members: enriched, total };
  }

  async getMemberStats(communityId: string, memberId: string) {
    const member = await prisma.communityMember.findFirst({
      where: { communityId, userId: memberId, deletedAt: null },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    });
    if (!member) return null;

    const [clicks, conversions, earningsAgg, activeCampaigns] = await prisma.$transaction([
      prisma.trackingEvent.count({
        where: { communityId, influencerId: memberId, eventType: 'CLICK', isDuplicate: false, deletedAt: null },
      }),
      prisma.trackingEvent.count({
        where: { communityId, influencerId: memberId, isConverted: true, isDuplicate: false, deletedAt: null },
      }),
      prisma.earning.aggregate({
        where: { communityId, influencerId: memberId, deletedAt: null, status: { not: 'CANCELLED' } },
        _sum: { influencerAmount: true },
      }),
      prisma.trackingLink.count({
        where: {
          influencerId: memberId,
          campaign: { communityId, status: 'ACTIVE', deletedAt: null },
          deletedAt: null,
        },
      }),
    ]);

    return {
      member: member.user,
      joinedAt: member.joinedAt,
      clicks,
      conversions,
      earnings:       earningsAgg._sum.influencerAmount ?? 0,
      activeCampaigns,
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COMMUNITY LOOKUPS
  // ─────────────────────────────────────────────────────────────────────────

  async findCommunityWithCommission(communityId: string) {
    return prisma.community.findFirst({
      where: { id: communityId, deletedAt: null },
      include: { commission: true },
    });
  }

  async findCampaignById(id: string) {
    return prisma.campaign.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true, status: true, type: true, payoutPerConversion: true,
        trackingMethod: true, communityId: true, ownerId: true, title: true,
        community: { select: { id: true, communityLeaderId: true, commission: true } },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIT + NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────

  createAuditLog(params: {
    userId?: string;
    action: AuditAction;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
    success?: boolean;
  }): void {
    prisma.auditLog.create({
      data: {
        userId:    params.userId,
        action:    params.action,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata:  params.metadata as any,
        success:   params.success ?? true,
      },
    }).catch(() => { /* fire-and-forget */ });
  }

  async createNotification(data: {
    userId:    string;
    type:      string;
    title:     string;
    message:   string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await prisma.notification.create({ data: data as any });
  }
}

export const trackingRepository = new TrackingRepository();
