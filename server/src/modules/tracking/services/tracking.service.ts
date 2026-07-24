// ─────────────────────────────────────────────────────────────────────────────
// Tracking & Earnings Service — FR24–FR31
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'crypto';
import { EarningStatus } from '@prisma/client';
import { trackingRepository as repo } from '../repositories/tracking.repository';
import { ApiError } from '../../../common/errors/ApiError';
import { PaginatedResult } from '../../../common/types';
import logger from '../../../common/logger/logger';
import type {
  TrackClickDto, TrackConversionDto, UseReferralCodeDto,
  EarningsHistoryQueryDto, BusinessAnalyticsQueryDto,
  MemberPerformanceQueryDto, CreateWithdrawalDto, WithdrawalHistoryQueryDto,
} from '../dto/tracking.dto';

import { env } from '../../../config/env';

// ─────────────────────────────────────────────────────────────────────────────
// Bank detail encryption (AES-256-CBC)
// Key derived from APP_ENCRYPTION_KEY env var (must be 32 bytes)
// ─────────────────────────────────────────────────────────────────────────────
const ENCRYPTION_KEY = Buffer.from(env.APP_ENCRYPTION_KEY, 'utf-8').slice(0, 32);

const ALGORITHM = 'aes-256-cbc';

function encryptBankDetails(data: object): string {
  const iv         = crypto.randomBytes(16);
  const cipher     = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted  = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptBankDetails(enc: string): object {
  const [ivHex, dataHex] = enc.split(':');
  const iv        = Buffer.from(ivHex, 'hex');
  const data      = Buffer.from(dataHex, 'hex');
  const decipher  = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Commission calculation — FR27
// Uses snapshots of rates at the time of conversion (immutable history).
// ─────────────────────────────────────────────────────────────────────────────

interface CommissionResult {
  grossAmount:         number;
  platformFeeRate:     number;
  platformFeeAmount:   number;
  netAmount:           number;
  leaderPercentageRate:number;
  leaderCommission:    number;
  memberPercentageRate:number;
  memberCommission:    number;
  influencerAmount:    number;
}

function calculateCommission(
  payout:             number,
  platformFeeRate:    number,
  leaderPercentage:   number,
  memberPercentage:   number,
  isLeader:           boolean,
): CommissionResult {
  // Step 1: deduct platform fee
  const platformFeeAmount = Math.round(payout * (platformFeeRate / 100) * 100) / 100;
  const netAmount         = Math.round((payout - platformFeeAmount) * 100) / 100;

  // Step 2: split net amount between leader and members
  const leaderCommission = Math.round(netAmount * (leaderPercentage / 100) * 100) / 100;
  const memberCommission = Math.round(netAmount * (memberPercentage / 100) * 100) / 100;

  // Step 3: what THIS influencer gets
  const influencerAmount = isLeader ? leaderCommission : memberCommission;

  return {
    grossAmount:          payout,
    platformFeeRate,
    platformFeeAmount,
    netAmount,
    leaderPercentageRate: leaderPercentage,
    leaderCommission,
    memberPercentageRate: memberPercentage,
    memberCommission,
    influencerAmount,
  };
}

type ConversionContext = {
  campaignId:            string;
  communityId:           string;
  campaignTitle?:        string;
  converterInfluencerId: string;
  leaderInfluencerId:    string | null;
  payout:                number;
  platformFee:           number;
  leaderPercentage:      number;
  memberPercentage:      number;
};

type EarningInput = {
  influencerId:         string;
  campaignId:           string;
  communityId:          string;
  trackingEventId?:     string;
  manualConversionId?:  string;
  grossAmount:          number;
  platformFeeAmount:    number;
  netAmount:            number;
  leaderCommission:     number;
  memberCommission:     number;
  influencerAmount:     number;
  status:               EarningStatus;
  platformFeeRate:      number;
  leaderPercentageRate: number;
  memberPercentageRate: number;
  isLeaderCommission:   boolean;
};

function buildConversionEarnings(ctx: ConversionContext, calc: CommissionResult) {
  const converterIsLeader = ctx.leaderInfluencerId === ctx.converterInfluencerId;
  const base = {
    campaignId:           ctx.campaignId,
    communityId:          ctx.communityId,
    grossAmount:          calc.grossAmount,
    platformFeeAmount:    calc.platformFeeAmount,
    netAmount:            calc.netAmount,
    leaderCommission:     calc.leaderCommission,
    memberCommission:     calc.memberCommission,
    status:               'AVAILABLE' as EarningStatus,
    platformFeeRate:      calc.platformFeeRate,
    leaderPercentageRate: calc.leaderPercentageRate,
    memberPercentageRate: calc.memberPercentageRate,
  };

  const earnings: EarningInput[] = [];
  const balanceUpdates: Array<{ influencerId: string; amount: number }> = [];

  if (converterIsLeader) {
    earnings.push({
      ...base,
      influencerId:       ctx.converterInfluencerId,
      influencerAmount:   calc.leaderCommission,
      isLeaderCommission: true,
    });
    balanceUpdates.push({ influencerId: ctx.converterInfluencerId, amount: calc.leaderCommission });
  } else {
    earnings.push({
      ...base,
      influencerId:       ctx.converterInfluencerId,
      influencerAmount:   calc.memberCommission,
      isLeaderCommission: false,
    });
    balanceUpdates.push({ influencerId: ctx.converterInfluencerId, amount: calc.memberCommission });

    if (ctx.leaderInfluencerId && calc.leaderCommission > 0) {
      earnings.push({
        ...base,
        influencerId:       ctx.leaderInfluencerId,
        influencerAmount:   calc.leaderCommission,
        isLeaderCommission: true,
      });
      balanceUpdates.push({ influencerId: ctx.leaderInfluencerId, amount: calc.leaderCommission });
    }
  }

  return { earnings, balanceUpdates, converterIsLeader };
}

class TrackingService {

  private async finalizeConversionNotifications(params: {
    converterInfluencerId: string;
    leaderInfluencerId:    string | null;
    converterIsLeader:     boolean;
    campaignId:            string;
    campaignTitle?:        string;
    eventId?:              string;
    manualConversionId?:   string;
    earnings:              Array<{ id: string; influencerId: string; influencerAmount: number; isLeaderCommission: boolean }>;
    auditAction:           'TRACKING_CONVERSION' | 'REFERRAL_USED' | 'CONVERSION_ADDED';
    ctx:                   { ip: string; userAgent: string };
    code?:                 string;
  }) {
    const title = params.campaignTitle ?? 'campaign';

    for (const earning of params.earnings) {
      const isOverride = earning.isLeaderCommission && earning.influencerId !== params.converterInfluencerId;
      await repo.createNotification({
        userId:  earning.influencerId,
        type:    isOverride ? 'EARNINGS_UPDATED' : 'NEW_CONVERSION',
        title:   isOverride ? 'Override Commission Earned' : 'New Conversion',
        message: isOverride
          ? `You earned ${earning.influencerAmount.toFixed(2)} override commission from a member conversion on "${title}".`
          : `You earned ${earning.influencerAmount.toFixed(2)} from a conversion on "${title}".`,
        metadata: { earningId: earning.id, campaignId: params.campaignId, amount: earning.influencerAmount },
      });

      repo.createAuditLog({
        userId:    earning.influencerId,
        action:    'COMMISSION_CALCULATED',
        ipAddress: params.ctx.ip,
        userAgent: params.ctx.userAgent,
        metadata:  {
          earningId: earning.id,
          eventId: params.eventId,
          manualConversionId: params.manualConversionId,
          campaignId: params.campaignId,
          amount: earning.influencerAmount,
        },
      });

      repo.createAuditLog({
        userId:    earning.influencerId,
        action:    'EARNINGS_UPDATED',
        ipAddress: params.ctx.ip,
        userAgent: params.ctx.userAgent,
        metadata:  { earningId: earning.id, amount: earning.influencerAmount },
      });
    }

    repo.createAuditLog({
      userId:    params.converterInfluencerId,
      action:    params.auditAction,
      ipAddress: params.ctx.ip,
      userAgent: params.ctx.userAgent,
      metadata:  {
        eventId: params.eventId,
        manualConversionId: params.manualConversionId,
        campaignId: params.campaignId,
        earningIds: params.earnings.map(e => e.id),
        ...(params.code && { code: params.code }),
      },
    });
  }

  private async assertCommunityAccess(communityId: string, requesterId: string, requesterRole: string): Promise<void> {
    if (requesterRole === 'SYSTEM_ADMIN') return;
    const community = await repo.findCommunityWithCommission(communityId);
    if (!community) throw ApiError.notFound('Community not found');
    if (community.communityLeaderId !== requesterId) {
      throw ApiError.forbidden('Only SYSTEM_ADMIN or community leader can access this resource');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR24 — Track click via unique link
  // ─────────────────────────────────────────────────────────────────────────

  async trackClick(dto: TrackClickDto) {
    const link = await repo.findTrackingLinkByCode(dto.code);
    if (!link) throw ApiError.notFound('Invalid tracking link');

    const campaign = link.campaign as any;
    if (!campaign || campaign.status !== 'ACTIVE') {
      throw ApiError.badRequest('Campaign is not active');
    }
    if (campaign.trackingMethod !== 'UNIQUE_LINK') {
      throw ApiError.badRequest('This code is not a tracking link');
    }

    // Duplicate click detection (same IP within 30 min)
    const isDuplicate = dto.ipAddress
      ? !!(await repo.findTrackingEventByLinkAndIp(link.id, dto.ipAddress))
      : false;

    await repo.incrementTrackingLinkClickCount(link.id);

    const event = await repo.createTrackingEvent({
      campaignId:    campaign.id,
      communityId:   campaign.communityId,
      influencerId:  link.influencer.id,
      trackingLinkId: link.id,
      eventType:     'CLICK',
      ipAddress:     dto.ipAddress,
      userAgent:     dto.userAgent,
      deviceInfo:    dto.deviceInfo,
      clickedAt:     new Date(),
      isDuplicate,
    });

    repo.createAuditLog({
      action:    'TRACKING_CLICK',
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      metadata:  { eventId: event.id, campaignId: campaign.id, code: dto.code, isDuplicate },
    });

    logger.info('Click tracked', { campaignId: campaign.id, influencerId: link.influencer.id, isDuplicate });
    return { eventId: event.id, isDuplicate, campaignId: campaign.id };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR24 — Record conversion via unique link
  // ─────────────────────────────────────────────────────────────────────────

  async trackConversion(dto: TrackConversionDto, ctx: { ip: string; userAgent: string }) {
    const link = await repo.findTrackingLinkByCode(dto.code);
    if (!link) throw ApiError.notFound('Invalid tracking link');

    const campaign = link.campaign as any;
    if (!campaign || campaign.status !== 'ACTIVE') {
      throw ApiError.badRequest('Campaign is not active');
    }
    if (!campaign.payoutPerConversion) {
      throw ApiError.badRequest('Campaign does not have a payout configured');
    }

    const existing = await repo.findConversionByTrackingLink(link.id, link.influencer.id);
    if (existing) throw ApiError.conflict('Conversion already recorded for this tracking link');

    const community = await repo.findCommunityWithCommission(campaign.communityId);
    if (!community?.commission) {
      throw ApiError.badRequest('Community commission rules are not configured');
    }

    const comm = community.commission;
    const calc = calculateCommission(
      campaign.payoutPerConversion,
      comm.platformFee,
      comm.leaderPercentage,
      comm.memberPercentage,
      community.communityLeaderId === link.influencer.id,
    );

    const conversionCtx: ConversionContext = {
      campaignId:            campaign.id,
      communityId:           campaign.communityId,
      campaignTitle:         campaign.title,
      converterInfluencerId: link.influencer.id,
      leaderInfluencerId:    community.communityLeaderId,
      payout:                campaign.payoutPerConversion,
      platformFee:           comm.platformFee,
      leaderPercentage:      comm.leaderPercentage,
      memberPercentage:      comm.memberPercentage,
    };

    const { earnings, balanceUpdates } = buildConversionEarnings(conversionCtx, calc);
    const now = new Date();

    const { event, earnings: createdEarnings } = await repo.recordConversionTransaction({
      event: {
        campaignId:     campaign.id,
        communityId:    campaign.communityId,
        influencerId:   link.influencer.id,
        trackingLinkId: link.id,
        eventType:      'CONVERSION',
        ipAddress:      dto.ipAddress ?? ctx.ip,
        userAgent:      dto.userAgent ?? ctx.userAgent,
        clickedAt:      now,
        convertedAt:    now,
      },
      earnings,
      balanceUpdates,
    });

    await this.finalizeConversionNotifications({
      converterInfluencerId: link.influencer.id,
      leaderInfluencerId:    community.communityLeaderId,
      converterIsLeader:     community.communityLeaderId === link.influencer.id,
      campaignId:            campaign.id,
      campaignTitle:         campaign.title,
      eventId:               event.id,
      earnings:              createdEarnings,
      auditAction:           'TRACKING_CONVERSION',
      ctx,
    });

    const primary = createdEarnings.find(e => e.influencerId === link.influencer.id)!;
    logger.info('Conversion tracked', { campaignId: campaign.id, influencerId: link.influencer.id, amount: primary.influencerAmount });
    return { eventId: event.id, earningId: primary.id, amount: primary.influencerAmount, earnings: createdEarnings.map(e => ({ id: e.id, influencerId: e.influencerId, amount: e.influencerAmount })) };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR25 — Referral code usage tracking
  // ─────────────────────────────────────────────────────────────────────────

  async trackReferral(dto: UseReferralCodeDto, ctx: { ip: string; userAgent: string }) {
    const refCode = await repo.findReferralCodeByCode(dto.code);
    if (!refCode) throw ApiError.notFound('Invalid referral code');

    const campaign = refCode.campaign as any;
    if (!campaign || campaign.status !== 'ACTIVE') {
      throw ApiError.badRequest('Campaign is not active');
    }
    if (campaign.trackingMethod !== 'REFERRAL_CODE') {
      throw ApiError.badRequest('This code is not a referral code');
    }
    if (!campaign.payoutPerConversion) {
      throw ApiError.badRequest('Campaign does not have a payout configured');
    }

    // Prevent duplicate referral conversion per code
    const existing = await repo.findConversionByReferralCode(refCode.id);
    if (existing) throw ApiError.conflict('This referral code has already been used for a conversion');

    // Commission config
    const community = await repo.findCommunityWithCommission(campaign.communityId);
    if (!community?.commission) {
      throw ApiError.badRequest('Community commission rules are not configured');
    }

    const comm = community.commission;
    const calc = calculateCommission(
      campaign.payoutPerConversion,
      comm.platformFee,
      comm.leaderPercentage,
      comm.memberPercentage,
      community.communityLeaderId === refCode.influencer.id,
    );

    await repo.incrementReferralCodeUseCount(refCode.id);

    const conversionCtx: ConversionContext = {
      campaignId:            campaign.id,
      communityId:           campaign.communityId,
      campaignTitle:         campaign.title,
      converterInfluencerId: refCode.influencer.id,
      leaderInfluencerId:    community.communityLeaderId,
      payout:                campaign.payoutPerConversion,
      platformFee:           comm.platformFee,
      leaderPercentage:      comm.leaderPercentage,
      memberPercentage:      comm.memberPercentage,
    };

    const { earnings, balanceUpdates } = buildConversionEarnings(conversionCtx, calc);
    const now = new Date();

    const { event, earnings: createdEarnings } = await repo.recordConversionTransaction({
      event: {
        campaignId:     campaign.id,
        communityId:    campaign.communityId,
        influencerId:   refCode.influencer.id,
        referralCodeId: refCode.id,
        eventType:      'CONVERSION',
        ipAddress:      dto.ipAddress ?? ctx.ip,
        userAgent:      dto.userAgent ?? ctx.userAgent,
        clickedAt:      now,
        convertedAt:    now,
      },
      earnings,
      balanceUpdates,
    });

    await this.finalizeConversionNotifications({
      converterInfluencerId: refCode.influencer.id,
      leaderInfluencerId:    community.communityLeaderId,
      converterIsLeader:     community.communityLeaderId === refCode.influencer.id,
      campaignId:            campaign.id,
      campaignTitle:         campaign.title,
      eventId:               event.id,
      earnings:              createdEarnings,
      auditAction:           'REFERRAL_USED',
      ctx,
      code:                  dto.code,
    });

    const primary = createdEarnings.find(e => e.influencerId === refCode.influencer.id)!;
    logger.info('Referral used', { campaignId: campaign.id, influencerId: refCode.influencer.id });
    return { eventId: event.id, earningId: primary.id, amount: primary.influencerAmount, earnings: createdEarnings.map(e => ({ id: e.id, influencerId: e.influencerId, amount: e.influencerAmount })) };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR23 bridge — Manual conversion → earnings (called from campaign module)
  // ─────────────────────────────────────────────────────────────────────────

  async processManualConversion(
    conversion: { id: string; campaignId: string; communityId: string; influencerId: string; amount: number },
    campaign: { id: string; title: string; communityId: string | null },
    ctx: { ip: string; userAgent: string },
  ) {
    const existing = await repo.findEarningByManualConversionId(conversion.id);
    if (existing) return existing;

    const community = await repo.findCommunityWithCommission(conversion.communityId);
    if (!community?.commission) {
      throw ApiError.badRequest('Community commission rules are not configured');
    }

    const comm = community.commission;
    const calc = calculateCommission(
      conversion.amount,
      comm.platformFee,
      comm.leaderPercentage,
      comm.memberPercentage,
      community.communityLeaderId === conversion.influencerId,
    );

    const conversionCtx: ConversionContext = {
      campaignId:            conversion.campaignId,
      communityId:           conversion.communityId,
      campaignTitle:         campaign.title,
      converterInfluencerId: conversion.influencerId,
      leaderInfluencerId:    community.communityLeaderId,
      payout:                conversion.amount,
      platformFee:           comm.platformFee,
      leaderPercentage:      comm.leaderPercentage,
      memberPercentage:      comm.memberPercentage,
    };

    const { earnings, balanceUpdates } = buildConversionEarnings(conversionCtx, calc);
    const earningsWithManual = earnings.map(e => ({ ...e, manualConversionId: conversion.id }));

    const createdEarnings = await repo.recordManualConversionTransaction({
      manualConversionId: conversion.id,
      earnings:           earningsWithManual,
      balanceUpdates,
    });

    await this.finalizeConversionNotifications({
      converterInfluencerId: conversion.influencerId,
      leaderInfluencerId:    community.communityLeaderId,
      converterIsLeader:     community.communityLeaderId === conversion.influencerId,
      campaignId:            conversion.campaignId,
      campaignTitle:         campaign.title,
      manualConversionId:    conversion.id,
      earnings:              createdEarnings,
      auditAction:           'CONVERSION_ADDED',
      ctx,
    });

    return createdEarnings.find(e => e.influencerId === conversion.influencerId)!;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR26 — Earnings dashboard
  // ─────────────────────────────────────────────────────────────────────────

  async getEarningsDashboard(influencerId: string, role: string) {
    const balance = await repo.getBalance(influencerId);

    const [totalEarnings, pendingBalance, availableBalance, withdrawnAmount, monthlyEarnings, campaignBreakdown] = await Promise.all([
      repo.sumEarnings(influencerId),
      repo.sumEarnings(influencerId, 'PENDING'),
      balance?.availableBalance ?? repo.sumEarnings(influencerId, 'AVAILABLE'),
      balance?.withdrawnAmount ?? repo.sumEarnings(influencerId, 'WITHDRAWN'),
      repo.getMonthlyEarnings(influencerId),
      repo.getCampaignEarningsBreakdown(influencerId),
    ]);

    const dashboard: Record<string, unknown> = {
      totalEarnings,
      pendingBalance,
      availableBalance,
      withdrawnAmount,
      monthlyEarnings,
      campaignBreakdown,
    };

    if (role === 'DIAMOND_INFLUENCER') {
      const [overrideAgg, communityEarnings] = await Promise.all([
        repo.sumLeaderOverrideEarnings(influencerId),
        repo.getCommunityEarningsForLeader(influencerId),
      ]);
      dashboard.overrideCommission = overrideAgg;
      dashboard.communityEarnings  = communityEarnings;
    }

    return dashboard;
  }

  async getEarningsHistory(influencerId: string, query: EarningsHistoryQueryDto): Promise<PaginatedResult<any>> {
    const page  = Math.max(1, query.page  ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate   = query.endDate   ? new Date(query.endDate)   : undefined;

    const { earnings, total } = await repo.listEarnings(influencerId, {
      campaignId: query.campaignId,
      status:     query.status,
      startDate,
      endDate,
      page,
      limit,
    });

    return {
      data: earnings,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    };
  }

  async getEarningsByCampaign(influencerId: string, campaignId: string) {
    const campaign = await repo.findCampaignById(campaignId);
    if (!campaign) throw ApiError.notFound('Campaign not found');
    return repo.getEarningsByCampaign(influencerId, campaignId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR28 — Business Owner analytics
  // ─────────────────────────────────────────────────────────────────────────

  async getBusinessAnalytics(ownerId: string, query: BusinessAnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate   = query.endDate   ? new Date(query.endDate)   : undefined;

    return repo.getBusinessAnalytics(ownerId, {
      campaignId:  query.campaignId,
      communityId: query.communityId,
      startDate,
      endDate,
      groupBy:     query.groupBy,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR29 — Community member performance
  // ─────────────────────────────────────────────────────────────────────────

  async getCommunityMemberPerformance(
    communityId: string,
    query: MemberPerformanceQueryDto,
    requesterId: string,
    requesterRole: string,
  ): Promise<PaginatedResult<any>> {
    await this.assertCommunityAccess(communityId, requesterId, requesterRole);

    const page      = Math.max(1, query.page  ?? 1);
    const limit     = Math.min(100, Math.max(1, query.limit ?? 20));
    const sortBy    = query.sortBy    ?? 'conversions';
    const sortOrder = query.sortOrder ?? 'desc';

    const { members, total } = await repo.getCommunityMemberPerformance(communityId, { page, limit, sortBy, sortOrder });

    return {
      data: members,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    };
  }

  async getMemberStats(communityId: string, memberId: string, requesterId: string, requesterRole: string) {
    await this.assertCommunityAccess(communityId, requesterId, requesterRole);

    const stats = await repo.getMemberStats(communityId, memberId);
    if (!stats) throw ApiError.notFound('Member not found in this community');
    return stats;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR30 — Withdrawal requests
  // ─────────────────────────────────────────────────────────────────────────

  async createWithdrawal(influencerId: string, dto: CreateWithdrawalDto, ctx: { ip: string; userAgent: string }) {
    if (dto.amount <= 0) throw ApiError.badRequest('Withdrawal amount must be greater than 0');

    // Validate available balance
    const balance = await repo.getBalance(influencerId);
    const available = balance?.availableBalance ?? 0;

    if (dto.amount > available) {
      throw ApiError.badRequest(
        `Insufficient balance. Available: ${available.toFixed(2)}, Requested: ${dto.amount.toFixed(2)}`
      );
    }

    // Prevent overdraft — prevent multiple pending at once
    const hasPending = await repo.hasPendingWithdrawal(influencerId);
    if (hasPending) {
      throw ApiError.conflict('You already have a pending withdrawal request. Cancel it before submitting a new one.');
    }

    // Encrypt bank details before storing
    const bankDetailsEnc = encryptBankDetails(dto.bankDetails);

    const withdrawal = await repo.createWithdrawalTransaction({
      influencerId,
      amount: dto.amount,
      bankDetailsEnc,
    });

    await repo.createNotification({
      userId:  influencerId,
      type:    'WITHDRAWAL_SUBMITTED',
      title:   'Withdrawal Request Submitted',
      message: `Your withdrawal request for ${dto.amount.toFixed(2)} has been submitted and is pending review.`,
      metadata: { withdrawalId: withdrawal.id, amount: dto.amount },
    });

    repo.createAuditLog({
      userId:    influencerId,
      action:    'WITHDRAWAL_SUBMITTED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata:  { withdrawalId: withdrawal.id, amount: dto.amount },
    });

    // Return withdrawal without the encrypted bank details in the response
    return {
      id:          withdrawal.id,
      amount:      withdrawal.amount,
      status:      withdrawal.status,
      requestedAt: withdrawal.requestedAt,
    };
  }

  async cancelWithdrawal(withdrawalId: string, influencerId: string, ctx: { ip: string; userAgent: string }) {
    const withdrawal = await repo.findWithdrawalById(withdrawalId);
    if (!withdrawal) throw ApiError.notFound('Withdrawal request not found');
    if (withdrawal.influencerId !== influencerId) throw ApiError.forbidden('Access denied');
    if (withdrawal.status !== 'PENDING') {
      throw ApiError.badRequest(`Cannot cancel a withdrawal with status: ${withdrawal.status}`);
    }

    await repo.cancelWithdrawalTransaction(withdrawalId, influencerId, withdrawal.amount);

    await repo.createNotification({
      userId:  influencerId,
      type:    'WITHDRAWAL_CANCELLED',
      title:   'Withdrawal Cancelled',
      message: `Your withdrawal request of ${withdrawal.amount.toFixed(2)} has been cancelled. Your balance has been restored.`,
      metadata: { withdrawalId, amount: withdrawal.amount },
    });

    repo.createAuditLog({
      userId:    influencerId,
      action:    'WITHDRAWAL_CANCELLED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata:  { withdrawalId, amount: withdrawal.amount },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR31 — Withdrawal history
  // ─────────────────────────────────────────────────────────────────────────

  async getWithdrawalHistory(influencerId: string, query: WithdrawalHistoryQueryDto): Promise<PaginatedResult<any>> {
    const page  = Math.max(1, query.page  ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));

    const { withdrawals, total } = await repo.listWithdrawals(influencerId, {
      status: query.status,
      page,
      limit,
    });

    // Strip encrypted bank details from the response, return safe fields only
    const safeWithdrawals = withdrawals.map(w => {
      let bankName: string | undefined;
      try {
        const details = decryptBankDetails(w.bankDetailsEnc) as { bankName?: string };
        bankName = details.bankName;
      } catch { /* omit bank on decrypt failure */ }

      return {
        id:             w.id,
        amount:         w.amount,
        status:         w.status,
        bankName,
        transactionRef: w.transactionRef,
        requestedAt:    w.requestedAt,
        processedAt:    w.processedAt,
        reviewNote:     w.reviewNote,
      };
    });

    return {
      data: safeWithdrawals,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    };
  }

  async getWithdrawalById(withdrawalId: string, influencerId: string) {
    const withdrawal = await repo.findWithdrawalById(withdrawalId);
    if (!withdrawal) throw ApiError.notFound('Withdrawal not found');
    if (withdrawal.influencerId !== influencerId) throw ApiError.forbidden('Access denied');

    // Decrypt bank details for display to owner
    const bankDetails = decryptBankDetails(withdrawal.bankDetailsEnc);

    return {
      id:             withdrawal.id,
      amount:         withdrawal.amount,
      status:         withdrawal.status,
      bankDetails,
      transactionRef: withdrawal.transactionRef,
      requestedAt:    withdrawal.requestedAt,
      processedAt:    withdrawal.processedAt,
      reviewNote:     withdrawal.reviewNote,
    };
  }
}

export const trackingService = new TrackingService();
