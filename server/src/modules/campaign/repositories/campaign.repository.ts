// ─────────────────────────────────────────────────────────────────────────────
// Campaign Repository — FR16–FR23
// Pure data access. Zero business logic.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Campaign, CampaignApproval, TrackingLink, ReferralCode,
  ManualConversion, CampaignStatus, CampaignType,
  TrackingMethod, ApprovalStatus, Prisma, AuditAction,
} from '@prisma/client';
import prisma from '../../../config/prisma';

// ── Safe campaign select — never expose owner password hash ──────────────────
const CAMPAIGN_INCLUDE = {
  owner: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
  community: { select: { id: true, title: true, status: true, communityLeaderId: true } },
  approvals: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' as const }, take: 5 },
} as const;

export class CampaignRepository {

  // ─────────────────────────────────────────────────────────────────────────
  // CAMPAIGN CRUD — FR16
  // ─────────────────────────────────────────────────────────────────────────

  async createCampaign(data: Prisma.CampaignCreateInput): Promise<Campaign> {
    return prisma.campaign.create({ data, include: CAMPAIGN_INCLUDE });
  }

  async findCampaignById(id: string) {
    return prisma.campaign.findFirst({
      where: { id, deletedAt: null },
      include: CAMPAIGN_INCLUDE,
    });
  }

  async listCampaigns(params: {
    ownerId?: string;
    status?: CampaignStatus;
    type?: CampaignType;
    communityId?: string;
    search?: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ campaigns: any[]; total: number }> {
    const where: Prisma.CampaignWhereInput = {
      deletedAt: null,
      ...(params.ownerId     && { ownerId:     params.ownerId }),
      ...(params.status      && { status:      params.status }),
      ...(params.type        && { type:        params.type }),
      ...(params.communityId && { communityId: params.communityId }),
      ...(params.search && {
        OR: [
          { title:       { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy = this.buildOrderBy(params.sortBy, params.sortOrder);

    const [campaigns, total] = await prisma.$transaction([
      prisma.campaign.findMany({
        where,
        include: CAMPAIGN_INCLUDE,
        orderBy,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return { campaigns, total };
  }

  async updateCampaign(id: string, data: Prisma.CampaignUpdateInput): Promise<Campaign> {
    return prisma.campaign.update({
      where: { id },
      data,
      include: CAMPAIGN_INCLUDE,
    });
  }

  async softDeleteCampaign(id: string): Promise<Campaign> {
    return prisma.campaign.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'COMPLETED' },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATUS TRANSITIONS — FR22
  // ─────────────────────────────────────────────────────────────────────────

  async setCampaignStatus(id: string, status: CampaignStatus, extra?: Prisma.CampaignUpdateInput): Promise<Campaign> {
    return prisma.campaign.update({
      where: { id },
      data: { status, ...extra },
      include: CAMPAIGN_INCLUDE,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // APPROVALS — FR19 / FR20
  // ─────────────────────────────────────────────────────────────────────────

  async createApproval(data: {
    campaignId: string;
    reviewerId: string;
    reviewerRole: string;
    status: ApprovalStatus;
    reason?: string;
  }): Promise<CampaignApproval> {
    return prisma.campaignApproval.create({ data });
  }

  async findLatestApprovalByRole(campaignId: string, reviewerRole: string) {
    return prisma.campaignApproval.findFirst({
      where: { campaignId, reviewerRole, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TRACKING — FR21
  // ─────────────────────────────────────────────────────────────────────────

  async createTrackingLink(data: {
    campaignId: string;
    influencerId: string;
    code: string;
    url: string;
  }): Promise<TrackingLink> {
    return prisma.trackingLink.create({ data });
  }

  async findTrackingLink(campaignId: string, influencerId: string) {
    return prisma.trackingLink.findFirst({
      where: { campaignId, influencerId, deletedAt: null },
    });
  }

  async findTrackingLinkByCode(code: string) {
    return prisma.trackingLink.findFirst({
      where: { code, deletedAt: null },
    });
  }

  async createReferralCode(data: {
    campaignId: string;
    influencerId: string;
    code: string;
  }): Promise<ReferralCode> {
    return prisma.referralCode.create({ data });
  }

  async findReferralCode(campaignId: string, influencerId: string) {
    return prisma.referralCode.findFirst({
      where: { campaignId, influencerId, deletedAt: null },
    });
  }

  async findReferralCodeByCode(code: string) {
    return prisma.referralCode.findFirst({
      where: { code, deletedAt: null },
    });
  }

  async listCampaignTracking(campaignId: string) {
    const [links, codes] = await prisma.$transaction([
      prisma.trackingLink.findMany({
        where: { campaignId, deletedAt: null },
        include: {
          influencer: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.referralCode.findMany({
        where: { campaignId, deletedAt: null },
        include: {
          influencer: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);
    return { links, codes };
  }

  // Create tracking resources for ALL active community members in a single transaction
  async bulkCreateTrackingResources(items: Array<{
    type: 'link' | 'code';
    campaignId: string;
    influencerId: string;
    code: string;
    url?: string;
  }>): Promise<void> {
    const linkItems = items.filter(i => i.type === 'link');
    const codeItems = items.filter(i => i.type === 'code');

    await prisma.$transaction([
      ...(linkItems.length > 0
        ? [prisma.trackingLink.createMany({
            data: linkItems.map(i => ({
              campaignId:   i.campaignId,
              influencerId: i.influencerId,
              code:         i.code,
              url:          i.url!,
            })),
            skipDuplicates: true,
          })]
        : []),
      ...(codeItems.length > 0
        ? [prisma.referralCode.createMany({
            data: codeItems.map(i => ({
              campaignId:   i.campaignId,
              influencerId: i.influencerId,
              code:         i.code,
            })),
            skipDuplicates: true,
          })]
        : []),
    ]);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MANUAL CONVERSIONS — FR23
  // ─────────────────────────────────────────────────────────────────────────

  async createConversion(data: {
    campaignId: string;
    communityId: string;
    influencerId: string;
    amount: number;
    note?: string;
    convertedAt: Date;
    createdBy: string;
  }): Promise<ManualConversion> {
    return prisma.manualConversion.create({ data });
  }

  async findConversionById(id: string) {
    return prisma.manualConversion.findFirst({
      where: { id, deletedAt: null },
      include: {
        influencer: { select: { id: true, firstName: true, lastName: true, email: true } },
        community:  { select: { id: true, title: true } },
      },
    });
  }

  async listConversions(campaignId: string): Promise<ManualConversion[]> {
    return prisma.manualConversion.findMany({
      where: { campaignId, deletedAt: null },
      include: {
        influencer: { select: { id: true, firstName: true, lastName: true, email: true } },
        community:  { select: { id: true, title: true } },
      },
      orderBy: { convertedAt: 'desc' },
    });
  }

  async updateConversion(id: string, data: {
    amount?: number;
    note?: string;
    convertedAt?: Date;
  }): Promise<ManualConversion> {
    return prisma.manualConversion.update({ where: { id }, data });
  }

  async softDeleteConversion(id: string): Promise<ManualConversion> {
    return prisma.manualConversion.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COMMUNITY / USER LOOKUPS — needed for validation
  // ─────────────────────────────────────────────────────────────────────────

  async findCommunityById(id: string) {
    return prisma.community.findFirst({
      where: { id, deletedAt: null },
      include: {
        commission: true,
        _count: { select: { members: { where: { status: 'ACTIVE', deletedAt: null } } } },
      },
    });
  }

  async findActiveCommunityMembers(communityId: string) {
    return prisma.communityMember.findMany({
      where: { communityId, status: 'ACTIVE', deletedAt: null },
      select: { userId: true },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        businessProfile: { select: { id: true, businessName: true, verificationStatus: true } },
      },
    });
  }

  async findActiveMembership(communityId: string, userId: string) {
    return prisma.communityMember.findFirst({
      where: { communityId, userId, status: 'ACTIVE', deletedAt: null },
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
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await prisma.notification.create({ data: data as any });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  private buildOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): Prisma.CampaignOrderByWithRelationInput {
    switch (sortBy) {
      case 'title':     return { title:     sortOrder };
      case 'startDate': return { startDate: sortOrder };
      case 'budget':    return { budget:    sortOrder };
      case 'status':    return { status:    sortOrder };
      case 'createdAt':
      default:          return { createdAt: sortOrder };
    }
  }
}

export const campaignRepository = new CampaignRepository();
