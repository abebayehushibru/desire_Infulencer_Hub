// ─────────────────────────────────────────────────────────────────────────────
// Campaign Service — FR16–FR23
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'crypto';
import { CampaignStatus, CampaignType } from '@prisma/client';
import { campaignRepository as repo } from '../repositories/campaign.repository';
import { ApiError } from '../../../common/errors/ApiError';
import { PaginatedResult } from '../../../common/types';
import logger from '../../../common/logger/logger';
import type {
  CreateCampaignDto, UpdateCampaignDto, ListCampaignsQueryDto,
  AdminReviewDto, LeaderReviewDto,
  CreateConversionDto, UpdateConversionDto,
} from '../dto/campaign.dto';

// ─────────────────────────────────────────────────────────────────────────────
// State-machine: legal transitions
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  DRAFT:                    ['PENDING_ADMIN_APPROVAL'],
  PENDING_ADMIN_APPROVAL:   ['PENDING_LEADER_APPROVAL', 'REJECTED'],
  PENDING_LEADER_APPROVAL:  ['ACTIVE', 'REJECTED'],
  ACTIVE:                   ['PAUSED', 'COMPLETED'],
  PAUSED:                   ['ACTIVE', 'COMPLETED'],
  COMPLETED:                [],
  REJECTED:                 ['DRAFT'],   // owner can reset to DRAFT to revise
};

// ─────────────────────────────────────────────────────────────────────────────
// Secure random generation helpers
// ─────────────────────────────────────────────────────────────────────────────

/** 32-byte hex code — globally unique tracking link code */
const genLinkCode = (): string => crypto.randomBytes(32).toString('hex');

/** 8-char uppercase alphanumeric referral code — retry until exactly 8 valid chars */
const genReferralCode = (): string => {
  while (true) {
    const raw = crypto.randomBytes(8).toString('base64url').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (raw.length >= 8) return raw.slice(0, 8);
    // If fewer than 8 chars survived filtering, try again (rare but safe)
  }
};

/** Strip HTML tags to prevent stored XSS */
const stripHtml = (input: string): string =>
  input.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();

/** Build full tracking URL from code */
const buildTrackingUrl = (code: string): string =>
  `${process.env.APP_URL || 'https://app.influencehub.com'}/track/${code}`;

class CampaignService {

  // ─────────────────────────────────────────────────────────────────────────
  // FR16 — Campaign Creation (verified BUSINESS_OWNER only)
  // ─────────────────────────────────────────────────────────────────────────

  async createCampaign(dto: CreateCampaignDto, ownerId: string, ctx: { ip: string; userAgent: string }) {
    // Verify business owner has an APPROVED business profile
    const owner = await repo.findUserById(ownerId);
    if (!owner) throw ApiError.notFound('User not found');
    if (owner.role !== 'BUSINESS_OWNER') throw ApiError.forbidden('Only Business Owners can create campaigns');
    if (!owner.businessProfile || owner.businessProfile.verificationStatus !== 'APPROVED') {
      throw ApiError.forbidden('Only verified Business Owners can create campaigns. Please complete business verification first.');
    }

    const startDate = new Date(dto.startDate);
    const endDate   = new Date(dto.endDate);

    if (isNaN(startDate.getTime())) throw ApiError.badRequest('startDate is not a valid date');
    if (isNaN(endDate.getTime()))   throw ApiError.badRequest('endDate is not a valid date');
    if (endDate <= startDate)       throw ApiError.badRequest('endDate must be after startDate');
    if (dto.budget <= 0)            throw ApiError.badRequest('budget must be greater than 0');

    // FR17 — SALES campaign extra fields
    if (dto.type === 'SALES') {
      if (!dto.payoutPerConversion || dto.payoutPerConversion <= 0) {
        throw ApiError.badRequest('payoutPerConversion is required and must be > 0 for SALES campaigns');
      }
      if (!dto.trackingMethod) {
        throw ApiError.badRequest('trackingMethod is required for SALES campaigns');
      }
    }

    const campaign = await repo.createCampaign({
      title:              stripHtml(dto.title.trim()),
      description:        dto.description ? stripHtml(dto.description.trim()) : undefined,
      type:               dto.type,
      budget:             dto.budget,
      targetPlatform:     stripHtml(dto.targetPlatform.trim()),
      startDate,
      endDate,
      status:             'DRAFT',
      payoutPerConversion: dto.type === 'SALES' ? dto.payoutPerConversion : undefined,
      trackingMethod:      dto.type === 'SALES' ? dto.trackingMethod     : undefined,
      owner:               { connect: { id: ownerId } },
    });

    repo.createAuditLog({
      userId:    ownerId,
      action:    'CAMPAIGN_CREATED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata:  { campaignId: campaign.id, title: campaign.title, type: campaign.type },
    });

    logger.info('Campaign created', { ownerId, campaignId: campaign.id });
    return campaign;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR16 — Read / List
  // ─────────────────────────────────────────────────────────────────────────

  async getCampaign(id: string, requesterId: string, requesterRole: string) {
    const campaign = await this.findOrThrow(id);
    this.assertCanViewCampaign(campaign, requesterId, requesterRole);
    return campaign;
  }

  async listCampaigns(query: ListCampaignsQueryDto, requesterId: string, requesterRole: string): Promise<PaginatedResult<any>> {
    const page      = Math.max(1, query.page  ?? 1);
    const limit     = Math.min(100, Math.max(1, query.limit ?? 20));
    const sortBy    = query.sortBy    ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    // Non-admins only see their own campaigns
    const ownerId = requesterRole === 'SYSTEM_ADMIN' ? undefined : requesterId;

    const { campaigns, total } = await repo.listCampaigns({
      ownerId,
      status:      query.status,
      type:        query.type,
      communityId: query.communityId,
      search:      query.search,
      page, limit, sortBy, sortOrder,
    });

    return {
      data: campaigns,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR16 — Update (DRAFT only, by owner or admin)
  // ─────────────────────────────────────────────────────────────────────────

  async updateCampaign(id: string, dto: UpdateCampaignDto, requesterId: string, requesterRole: string, ctx: { ip: string; userAgent: string }) {
    const campaign = await this.findOrThrow(id);
    this.assertOwnerOrAdmin(campaign, requesterId, requesterRole);

    if (campaign.status !== 'DRAFT') {
      throw ApiError.badRequest('Only DRAFT campaigns can be updated. Withdraw and resubmit to make changes.');
    }

    const updateData: Record<string, any> = {};
    if (dto.title          !== undefined) updateData.title          = dto.title.trim();
    if (dto.description    !== undefined) updateData.description    = dto.description?.trim() ?? null;
    if (dto.type           !== undefined) updateData.type           = dto.type;
    if (dto.budget         !== undefined) {
      if (dto.budget <= 0) throw ApiError.badRequest('budget must be greater than 0');
      updateData.budget = dto.budget;
    }
    if (dto.targetPlatform !== undefined) updateData.targetPlatform = dto.targetPlatform.trim();

    if (dto.startDate !== undefined) {
      const d = new Date(dto.startDate);
      if (isNaN(d.getTime())) throw ApiError.badRequest('startDate is not a valid date');
      updateData.startDate = d;
    }
    if (dto.endDate !== undefined) {
      const d = new Date(dto.endDate);
      if (isNaN(d.getTime())) throw ApiError.badRequest('endDate is not a valid date');
      updateData.endDate = d;
    }

    const finalStart = updateData.startDate ?? campaign.startDate;
    const finalEnd   = updateData.endDate   ?? campaign.endDate;
    if (finalEnd <= finalStart) throw ApiError.badRequest('endDate must be after startDate');

    // FR17 — SALES type fields
    const effectiveType = (updateData.type ?? campaign.type) as CampaignType;
    if (effectiveType === 'SALES') {
      if (dto.payoutPerConversion !== undefined) {
        if (dto.payoutPerConversion <= 0) throw ApiError.badRequest('payoutPerConversion must be > 0');
        updateData.payoutPerConversion = dto.payoutPerConversion;
      }
      if (dto.trackingMethod !== undefined) updateData.trackingMethod = dto.trackingMethod;
    } else {
      // Clear SALES fields when changing away from SALES
      updateData.payoutPerConversion = null;
      updateData.trackingMethod      = null;
    }

    if (Object.keys(updateData).length === 0) throw ApiError.badRequest('No fields to update');

    const updated = await repo.updateCampaign(id, updateData);

    repo.createAuditLog({
      userId: requesterId, action: 'CAMPAIGN_UPDATED',
      ipAddress: ctx.ip, userAgent: ctx.userAgent,
      metadata: { campaignId: id, fields: Object.keys(updateData) },
    });

    return updated;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR16 — Delete (DRAFT only, owner or admin)
  // ─────────────────────────────────────────────────────────────────────────

  async deleteCampaign(id: string, requesterId: string, requesterRole: string, ctx: { ip: string; userAgent: string }) {
    const campaign = await this.findOrThrow(id);
    this.assertOwnerOrAdmin(campaign, requesterId, requesterRole);
    if (campaign.status !== 'DRAFT') throw ApiError.badRequest('Only DRAFT campaigns can be deleted');

    await repo.softDeleteCampaign(id);
    repo.createAuditLog({
      userId: requesterId, action: 'CAMPAIGN_DELETED',
      ipAddress: ctx.ip, userAgent: ctx.userAgent,
      metadata: { campaignId: id },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR18 — Assign community + FR22 submit for approval
  // ─────────────────────────────────────────────────────────────────────────

  async submitCampaign(id: string, communityId: string, requesterId: string, ctx: { ip: string; userAgent: string }) {
    const campaign = await this.findOrThrow(id);
    this.assertOwner(campaign, requesterId);
    this.assertTransition(campaign.status, 'PENDING_ADMIN_APPROVAL');

    // FR17 — Validate SALES fields are present before submission
    if (campaign.type === 'SALES') {
      if (!campaign.payoutPerConversion || campaign.payoutPerConversion <= 0) {
        throw ApiError.badRequest('SALES campaigns require payoutPerConversion > 0 before submission');
      }
      if (!campaign.trackingMethod) {
        throw ApiError.badRequest('SALES campaigns require a trackingMethod before submission');
      }
    }

    // FR18 — Validate community
    const community = await repo.findCommunityById(communityId);
    if (!community) throw ApiError.notFound('Community not found');
    if (community.status !== 'ACTIVE') throw ApiError.badRequest('Campaign can only be assigned to an ACTIVE community');
    if (!community.communityLeaderId) throw ApiError.badRequest('Community must have a leader before a campaign can be assigned');

    // Budget must be positive (already validated on create, but re-check in case admin modified)
    if (campaign.budget <= 0) throw ApiError.badRequest('Campaign budget must be greater than 0');

    const updated = await repo.updateCampaign(id, {
      status:      'PENDING_ADMIN_APPROVAL',
      community:   communityId ? { connect: { id: communityId } } : undefined,
    });

    // Notify admin (SYSTEM_ADMIN gets no targeted userId — use platform-wide audit)
    repo.createAuditLog({
      userId: requesterId, action: 'CAMPAIGN_SUBMITTED',
      ipAddress: ctx.ip, userAgent: ctx.userAgent,
      metadata: { campaignId: id, communityId },
    });

    logger.info('Campaign submitted', { campaignId: id, communityId });
    return updated;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR19 — Admin review
  // ─────────────────────────────────────────────────────────────────────────

  async adminReview(id: string, dto: AdminReviewDto, adminId: string, ctx: { ip: string; userAgent: string }) {
    const campaign = await this.findOrThrow(id);

    if (campaign.status !== 'PENDING_ADMIN_APPROVAL') {
      throw ApiError.badRequest(`Campaign is not pending admin approval (current: ${campaign.status})`);
    }
    if (dto.action === 'reject' && !dto.reason?.trim()) {
      throw ApiError.badRequest('Rejection reason is mandatory');
    }

    const newStatus: CampaignStatus = dto.action === 'approve' ? 'PENDING_LEADER_APPROVAL' : 'REJECTED';

    const updated = await repo.updateCampaign(id, {
      status: newStatus,
      ...(dto.action === 'reject' && { adminRejectionReason: dto.reason!.trim() }),
    });

    await repo.createApproval({
      campaignId:   id,
      reviewerId:   adminId,
      reviewerRole: 'SYSTEM_ADMIN',
      status:       dto.action === 'approve' ? 'APPROVED' : 'REJECTED',
      reason:       dto.reason?.trim(),
    });

    // Notify business owner
    const notifType = dto.action === 'approve' ? 'CAMPAIGN_APPROVED' : 'CAMPAIGN_REJECTED';
    const notifTitle = dto.action === 'approve' ? 'Campaign Approved by Admin' : 'Campaign Rejected by Admin';
    await repo.createNotification({
      userId:  campaign.ownerId,
      type:    notifType,
      title:   notifTitle,
      message: dto.action === 'approve'
        ? `Your campaign "${campaign.title}" has been approved by admin and is now pending leader review.`
        : `Your campaign "${campaign.title}" was rejected. Reason: ${dto.reason}`,
      metadata: { campaignId: id, reason: dto.reason },
    });

    // Notify community leader if approved
    if (dto.action === 'approve' && (campaign as any).community?.communityLeaderId) {
      await repo.createNotification({
        userId:  (campaign as any).community.communityLeaderId,
        type:    'CAMPAIGN_SUBMITTED',
        title:   'Campaign Awaiting Your Review',
        message: `Campaign "${campaign.title}" is awaiting your acceptance.`,
        metadata: { campaignId: id },
      });
    }

    repo.createAuditLog({
      userId: adminId,
      action: dto.action === 'approve' ? 'CAMPAIGN_ADMIN_APPROVED' : 'CAMPAIGN_ADMIN_REJECTED',
      ipAddress: ctx.ip, userAgent: ctx.userAgent,
      metadata: { campaignId: id, reason: dto.reason },
    });

    logger.info(`Campaign admin ${dto.action}d`, { adminId, campaignId: id });
    return updated;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR20 — Community Leader review
  // ─────────────────────────────────────────────────────────────────────────

  async leaderReview(id: string, dto: LeaderReviewDto, leaderId: string, ctx: { ip: string; userAgent: string }) {
    const campaign = await this.findOrThrow(id);

    if (campaign.status !== 'PENDING_LEADER_APPROVAL') {
      throw ApiError.badRequest(`Campaign is not pending leader approval (current: ${campaign.status})`);
    }
    if (dto.action === 'reject' && !dto.reason?.trim()) {
      throw ApiError.badRequest('Rejection reason is mandatory');
    }

    // Verify this user is the leader of the assigned community
    const community = (campaign as any).community;
    if (!community || community.communityLeaderId !== leaderId) {
      throw ApiError.forbidden('Only the assigned community leader can review this campaign');
    }

    const newStatus: CampaignStatus = dto.action === 'accept' ? 'ACTIVE' : 'REJECTED';

    const updated = await repo.updateCampaign(id, {
      status: newStatus,
      ...(dto.action === 'reject' && { leaderRejectionReason: dto.reason!.trim() }),
    });

    await repo.createApproval({
      campaignId:   id,
      reviewerId:   leaderId,
      reviewerRole: 'DIAMOND_INFLUENCER',
      status:       dto.action === 'accept' ? 'APPROVED' : 'REJECTED',
      reason:       dto.reason?.trim(),
    });

    // FR21 — If accepted → generate tracking resources for all active members
    if (dto.action === 'accept') {
      await this.generateTrackingResources(campaign, community.id);
    }

    // Notify business owner
    const notifType = dto.action === 'accept' ? 'CAMPAIGN_ACCEPTED' : 'CAMPAIGN_LEADER_REJECTED';
    await repo.createNotification({
      userId:  campaign.ownerId,
      type:    notifType,
      title:   dto.action === 'accept' ? `Campaign "${campaign.title}" is Now ACTIVE` : `Campaign Rejected by Community Leader`,
      message: dto.action === 'accept'
        ? `Your campaign "${campaign.title}" was accepted by the community leader and is now ACTIVE. Tracking resources have been generated.`
        : `Your campaign "${campaign.title}" was rejected by the community leader. Reason: ${dto.reason}`,
      metadata: { campaignId: id, reason: dto.reason },
    });

    if (dto.action === 'accept') {
      repo.createAuditLog({
        userId: leaderId, action: 'CAMPAIGN_LEADER_ACCEPTED',
        ipAddress: ctx.ip, userAgent: ctx.userAgent,
        metadata: { campaignId: id },
      });
      repo.createAuditLog({
        userId: leaderId, action: 'CAMPAIGN_ACTIVATED',
        ipAddress: ctx.ip, userAgent: ctx.userAgent,
        metadata: { campaignId: id },
      });
    } else {
      repo.createAuditLog({
        userId: leaderId, action: 'CAMPAIGN_LEADER_REJECTED',
        ipAddress: ctx.ip, userAgent: ctx.userAgent,
        metadata: { campaignId: id, reason: dto.reason },
      });
    }

    logger.info(`Campaign leader ${dto.action}ed`, { leaderId, campaignId: id });
    return updated;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR22 — Pause / Complete
  // ─────────────────────────────────────────────────────────────────────────

  async pauseCampaign(id: string, requesterId: string, requesterRole: string, ctx: { ip: string; userAgent: string }) {
    const campaign = await this.findOrThrow(id);
    this.assertOwnerOrAdmin(campaign, requesterId, requesterRole);
    this.assertTransition(campaign.status, 'PAUSED');

    const updated = await repo.setCampaignStatus(id, 'PAUSED');

    await repo.createNotification({
      userId: campaign.ownerId, type: 'CAMPAIGN_PAUSED',
      title: `Campaign "${campaign.title}" Paused`,
      message: `Campaign "${campaign.title}" has been paused.`,
      metadata: { campaignId: id },
    });

    repo.createAuditLog({
      userId: requesterId, action: 'CAMPAIGN_PAUSED',
      ipAddress: ctx.ip, userAgent: ctx.userAgent,
      metadata: { campaignId: id },
    });

    return updated;
  }

  async completeCampaign(id: string, requesterId: string, requesterRole: string, ctx: { ip: string; userAgent: string }) {
    const campaign = await this.findOrThrow(id);
    this.assertOwnerOrAdmin(campaign, requesterId, requesterRole);
    this.assertTransition(campaign.status, 'COMPLETED');

    const updated = await repo.setCampaignStatus(id, 'COMPLETED');

    await repo.createNotification({
      userId: campaign.ownerId, type: 'CAMPAIGN_COMPLETED',
      title: `Campaign "${campaign.title}" Completed`,
      message: `Campaign "${campaign.title}" has been marked as completed.`,
      metadata: { campaignId: id },
    });

    repo.createAuditLog({
      userId: requesterId, action: 'CAMPAIGN_COMPLETED',
      ipAddress: ctx.ip, userAgent: ctx.userAgent,
      metadata: { campaignId: id },
    });

    return updated;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR21 — Get tracking resources
  // ─────────────────────────────────────────────────────────────────────────

  async getCampaignTracking(id: string, requesterId: string, requesterRole: string) {
    const campaign = await this.findOrThrow(id);
    this.assertCanViewCampaign(campaign, requesterId, requesterRole);
    return repo.listCampaignTracking(id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR23 — Manual Conversions (MANUAL tracking + ACTIVE campaign)
  // ─────────────────────────────────────────────────────────────────────────

  async addConversion(campaignId: string, dto: CreateConversionDto, ownerId: string, ctx: { ip: string; userAgent: string }) {
    const campaign = await this.findOrThrow(campaignId);
    this.assertOwner(campaign, ownerId);

    if (campaign.status !== 'ACTIVE') throw ApiError.badRequest('Conversions can only be added to ACTIVE campaigns');
    if (campaign.trackingMethod !== 'MANUAL') throw ApiError.badRequest('Manual conversions are only allowed for MANUAL tracking campaigns');

    if (!campaign.communityId) throw ApiError.badRequest('Campaign has no assigned community');

    // Verify influencer is an active member of the campaign community
    const membership = await repo.findActiveMembership(campaign.communityId, dto.influencerId);
    if (!membership) throw ApiError.badRequest('Influencer is not an active member of the campaign community');

    const convertedAt = new Date(dto.convertedAt);
    if (isNaN(convertedAt.getTime())) throw ApiError.badRequest('convertedAt is not a valid date');
    if (dto.amount <= 0) throw ApiError.badRequest('Conversion amount must be greater than 0');

    const conversion = await repo.createConversion({
      campaignId,
      communityId: campaign.communityId,
      influencerId: dto.influencerId,
      amount:       dto.amount,
      note:         dto.note?.trim(),
      convertedAt,
      createdBy:    ownerId,
    });

    repo.createAuditLog({
      userId: ownerId, action: 'CONVERSION_ADDED',
      ipAddress: ctx.ip, userAgent: ctx.userAgent,
      metadata: { campaignId, conversionId: conversion.id, influencerId: dto.influencerId, amount: dto.amount },
    });

    return conversion;
  }

  async updateConversion(campaignId: string, conversionId: string, dto: UpdateConversionDto, ownerId: string, ctx: { ip: string; userAgent: string }) {
    const campaign = await this.findOrThrow(campaignId);
    this.assertOwner(campaign, ownerId);
    if (campaign.status !== 'ACTIVE') throw ApiError.badRequest('Conversions can only be updated on ACTIVE campaigns');

    const conversion = await repo.findConversionById(conversionId);
    if (!conversion) throw ApiError.notFound('Conversion not found');
    if ((conversion as any).campaignId !== campaignId) throw ApiError.notFound('Conversion does not belong to this campaign');

    const updateData: Record<string, any> = {};
    if (dto.amount !== undefined) {
      if (dto.amount <= 0) throw ApiError.badRequest('Conversion amount must be greater than 0');
      updateData.amount = dto.amount;
    }
    if (dto.note         !== undefined) updateData.note         = dto.note?.trim() ?? null;
    if (dto.convertedAt  !== undefined) {
      const d = new Date(dto.convertedAt);
      if (isNaN(d.getTime())) throw ApiError.badRequest('convertedAt is not a valid date');
      updateData.convertedAt = d;
    }

    if (Object.keys(updateData).length === 0) throw ApiError.badRequest('No fields to update');

    const updated = await repo.updateConversion(conversionId, updateData);

    repo.createAuditLog({
      userId: ownerId, action: 'CONVERSION_UPDATED',
      ipAddress: ctx.ip, userAgent: ctx.userAgent,
      metadata: { campaignId, conversionId, fields: Object.keys(updateData) },
    });

    return updated;
  }

  async deleteConversion(campaignId: string, conversionId: string, ownerId: string, ctx: { ip: string; userAgent: string }) {
    const campaign = await this.findOrThrow(campaignId);
    this.assertOwner(campaign, ownerId);
    if (campaign.status !== 'ACTIVE') throw ApiError.badRequest('Conversions can only be deleted on ACTIVE campaigns');

    const conversion = await repo.findConversionById(conversionId);
    if (!conversion) throw ApiError.notFound('Conversion not found');
    if ((conversion as any).campaignId !== campaignId) throw ApiError.notFound('Conversion does not belong to this campaign');

    await repo.softDeleteConversion(conversionId);

    repo.createAuditLog({
      userId: ownerId, action: 'CONVERSION_DELETED',
      ipAddress: ctx.ip, userAgent: ctx.userAgent,
      metadata: { campaignId, conversionId },
    });
  }

  async listConversions(campaignId: string, requesterId: string, requesterRole: string) {
    const campaign = await this.findOrThrow(campaignId);
    this.assertCanViewCampaign(campaign, requesterId, requesterRole);
    return repo.listConversions(campaignId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR21 — Internal: generate tracking resources on campaign activation
  // ─────────────────────────────────────────────────────────────────────────

  private async generateTrackingResources(campaign: any, communityId: string): Promise<void> {
    if (campaign.type !== 'SALES' || !campaign.trackingMethod) return;
    if (campaign.trackingMethod === 'MANUAL') return; // No automated resources for MANUAL

    const members = await repo.findActiveCommunityMembers(communityId);
    if (members.length === 0) return;

    const items = members.map(m => {
      const code = campaign.trackingMethod === 'UNIQUE_LINK' ? genLinkCode() : genReferralCode();
      return {
        type:        campaign.trackingMethod === 'UNIQUE_LINK' ? 'link' as const : 'code' as const,
        campaignId:  campaign.id,
        influencerId: m.userId,
        code,
        url:         campaign.trackingMethod === 'UNIQUE_LINK' ? buildTrackingUrl(code) : undefined,
      };
    });

    await repo.bulkCreateTrackingResources(items);
    logger.info('Tracking resources generated', { campaignId: campaign.id, count: items.length });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  private async findOrThrow(id: string) {
    const campaign = await repo.findCampaignById(id);
    if (!campaign || campaign.deletedAt) throw ApiError.notFound('Campaign not found');
    return campaign;
  }

  private assertTransition(from: CampaignStatus, to: CampaignStatus): void {
    if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
      throw ApiError.badRequest(`Invalid status transition: ${from} → ${to}`);
    }
  }

  private assertOwner(campaign: any, userId: string): void {
    if (campaign.ownerId !== userId) throw ApiError.forbidden('Only the campaign owner can perform this action');
  }

  private assertOwnerOrAdmin(campaign: any, userId: string, role: string): void {
    if (role === 'SYSTEM_ADMIN') return;
    if (campaign.ownerId !== userId) throw ApiError.forbidden('Access denied');
  }

  private assertCanViewCampaign(campaign: any, userId: string, role: string): void {
    if (role === 'SYSTEM_ADMIN') return;
    if (campaign.ownerId === userId) return;
    // Community leader of assigned community can view
    if (campaign.community?.communityLeaderId === userId) return;
    throw ApiError.forbidden('Access denied. You do not have permission to view this campaign.');
  }
}

export const campaignService = new CampaignService();
