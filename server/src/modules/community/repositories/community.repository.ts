// ─────────────────────────────────────────────────────────────────────────────
// Community Repository — FR11–FR15
// Pure data access. Zero business logic.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Community, CommunityMember, CommunityCommission,
  CommunityCommissionHistory, CommunityStatus,
  CommunityMemberStatus, Prisma, AuditAction,
} from '@prisma/client';
import prisma from '../../../config/prisma';

export class CommunityRepository {

  // ─────────────────────────────────────────────────────────────────────────
  // COMMUNITY CRUD — FR11
  // ─────────────────────────────────────────────────────────────────────────

  async createCommunity(data: {
    title: string;
    description?: string;
    rules?: string;
    communityLeaderId?: string;
    createdBy: string;
  }): Promise<Community> {
    return prisma.community.create({ data });
  }

  async findCommunityById(id: string) {
    return prisma.community.findFirst({
      where: { id, deletedAt: null },
      include: {
        leader: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        },
        commission: true,
        _count: { select: { members: { where: { status: 'ACTIVE', deletedAt: null } } } },
      },
    });
  }

  async findCommunityByTitle(title: string): Promise<Community | null> {
    return prisma.community.findFirst({
      where: { title: { equals: title, mode: 'insensitive' }, deletedAt: null },
    });
  }

  async findCommunityByTitleExcluding(title: string, excludeId: string): Promise<Community | null> {
    return prisma.community.findFirst({
      where: {
        title: { equals: title, mode: 'insensitive' },
        deletedAt: null,
        id: { not: excludeId },
      },
    });
  }

  async listCommunities(params: {
    status?: CommunityStatus;
    search?: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ communities: any[]; total: number }> {
    const where: Prisma.CommunityWhereInput = {
      deletedAt: null,
      ...(params.status && { status: params.status }),
      ...(params.search && {
        OR: [
          { title:       { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy = this.buildCommunityOrderBy(params.sortBy, params.sortOrder);

    const [communities, total] = await prisma.$transaction([
      prisma.community.findMany({
        where,
        include: {
          leader: { select: { id: true, firstName: true, lastName: true, email: true } },
          commission: true,
          _count: { select: { members: { where: { status: 'ACTIVE', deletedAt: null } } } },
        },
        orderBy,
        skip:  (params.page - 1) * params.limit,
        take:  params.limit,
      }),
      prisma.community.count({ where }),
    ]);

    return { communities, total };
  }

  async updateCommunity(id: string, data: Prisma.CommunityUpdateInput): Promise<Community> {
    return prisma.community.update({ where: { id }, data });
  }

  async softDeleteCommunity(id: string): Promise<Community> {
    return prisma.community.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  // Check if a user is already leading another active community
  async findActiveCommunityByLeader(leaderId: string, excludeCommunityId?: string) {
    return prisma.community.findFirst({
      where: {
        communityLeaderId: leaderId,
        deletedAt: null,
        status: 'ACTIVE',
        ...(excludeCommunityId && { id: { not: excludeCommunityId } }),
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COMMUNITY MEMBERS — FR13
  // ─────────────────────────────────────────────────────────────────────────

  async addMember(data: {
    communityId: string;
    userId: string;
    addedBy: string;
  }): Promise<CommunityMember> {
    return prisma.communityMember.create({
      data: {
        communityId: data.communityId,
        userId:      data.userId,
        addedBy:     data.addedBy,
        status:      'ACTIVE',
        joinedAt:    new Date(),
      },
    });
  }

  async findMembership(communityId: string, userId: string) {
    return prisma.communityMember.findFirst({
      where: { communityId, userId, deletedAt: null },
    });
  }

  async findActiveMembership(communityId: string, userId: string) {
    return prisma.communityMember.findFirst({
      where: { communityId, userId, status: 'ACTIVE', deletedAt: null },
    });
  }

  async removeMember(memberId: string, removedBy: string): Promise<CommunityMember> {
    return prisma.communityMember.update({
      where: { id: memberId },
      data: {
        status:    'REMOVED',
        leftAt:    new Date(),
        removedBy,
      },
    });
  }

  async listMembers(communityId: string, params: {
    status?: CommunityMemberStatus;
    page: number;
    limit: number;
  }): Promise<{ members: any[]; total: number }> {
    const where: Prisma.CommunityMemberWhereInput = {
      communityId,
      deletedAt: null,
      ...(params.status && { status: params.status }),
    };

    const [members, total] = await prisma.$transaction([
      prisma.communityMember.findMany({
        where,
        include: {
          user: {
            select: {
              id: true, firstName: true, lastName: true, email: true,
              role: true, status: true, profileImage: true,
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.communityMember.count({ where }),
    ]);

    return { members, total };
  }

  async getActiveMemberCount(communityId: string): Promise<number> {
    return prisma.communityMember.count({
      where: { communityId, status: 'ACTIVE', deletedAt: null },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COMMISSION — FR12
  // ─────────────────────────────────────────────────────────────────────────

  async getCommission(communityId: string): Promise<CommunityCommission | null> {
    return prisma.communityCommission.findFirst({
      where: { communityId, deletedAt: null },
    });
  }

  async upsertCommission(data: {
    communityId: string;
    platformFee: number;
    leaderPercentage: number;
    memberPercentage: number;
    updatedBy: string;
    effectiveFrom?: Date;
  }): Promise<CommunityCommission> {
    return prisma.communityCommission.upsert({
      where: { communityId: data.communityId },
      create: {
        communityId:      data.communityId,
        platformFee:      data.platformFee,
        leaderPercentage: data.leaderPercentage,
        memberPercentage: data.memberPercentage,
        updatedBy:        data.updatedBy,
        effectiveFrom:    data.effectiveFrom ?? new Date(),
      },
      update: {
        platformFee:      data.platformFee,
        leaderPercentage: data.leaderPercentage,
        memberPercentage: data.memberPercentage,
        updatedBy:        data.updatedBy,
        effectiveFrom:    data.effectiveFrom ?? new Date(),
      },
    });
  }

  async createCommissionHistory(data: {
    communityId: string;
    platformFee: number;
    leaderPercentage: number;
    memberPercentage: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    changedBy: string;
    changeReason?: string;
  }): Promise<CommunityCommissionHistory> {
    return prisma.communityCommissionHistory.create({ data });
  }

  async getCommissionHistory(communityId: string): Promise<CommunityCommissionHistory[]> {
    return prisma.communityCommissionHistory.findMany({
      where: { communityId, deletedAt: null },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  // Seal the current commission history record (set effectiveTo)
  async sealLatestCommissionHistory(communityId: string, effectiveTo: Date): Promise<void> {
    await prisma.communityCommissionHistory.updateMany({
      where: { communityId, effectiveTo: null, deletedAt: null },
      data:  { effectiveTo },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LEADERBOARD — FR14
  // ─────────────────────────────────────────────────────────────────────────

  // Leaderboard is computed from community members and their activity.
  // Since Campaigns/Conversions/Earnings are not yet implemented (Module 4+),
  // we return member data with placeholders that are ready for real aggregation.
  async getLeaderboard(communityId: string, params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ entries: any[]; total: number }> {
    const where: Prisma.CommunityMemberWhereInput = {
      communityId,
      status: 'ACTIVE',
      deletedAt: null,
    };

    // Determine order — real aggregation (conversions, earnings) will be added in Module 4.
    // For now sort by joinedAt as a stable proxy.
    const orderBy: Prisma.CommunityMemberOrderByWithRelationInput =
      params.sortBy === 'totalConversions' ? { joinedAt: params.sortOrder } :
      params.sortBy === 'totalEarnings'    ? { joinedAt: params.sortOrder } :
      /* campaignActivity */                 { joinedAt: params.sortOrder };

    const [raw, total] = await prisma.$transaction([
      prisma.communityMember.findMany({
        where,
        include: {
          user: {
            select: {
              id: true, firstName: true, lastName: true,
              email: true, role: true, profileImage: true,
              influencerProfile: { select: { currentTier: true, niche: true } },
            },
          },
        },
        orderBy,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.communityMember.count({ where }),
    ]);

    // Enrich with placeholder metrics (Module 4 will fill real values)
    const entries = raw.map((m, idx) => ({
      rank:            (params.page - 1) * params.limit + idx + 1,
      memberId:        m.id,
      userId:          m.userId,
      user:            m.user,
      joinedAt:        m.joinedAt,
      totalConversions: 0,   // populated by Module 4
      totalEarnings:    0,   // populated by Module 4
      campaignActivity: 0,   // populated by Module 4
    }));

    return { entries, total };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CROSS-COMMUNITY RANKINGS — FR15
  // ─────────────────────────────────────────────────────────────────────────

  async getCommunityRankings(params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    status?: CommunityStatus;
  }): Promise<{ rankings: any[]; total: number }> {
    const where: Prisma.CommunityWhereInput = {
      deletedAt: null,
      ...(params.status && { status: params.status }),
    };

    const [raw, total] = await prisma.$transaction([
      prisma.community.findMany({
        where,
        include: {
          leader: { select: { id: true, firstName: true, lastName: true, email: true } },
          commission: true,
          _count: {
            select: { members: { where: { status: 'ACTIVE', deletedAt: null } } },
          },
        },
        orderBy: { createdAt: params.sortOrder },   // real metrics added in Module 4
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.community.count({ where }),
    ]);

    const rankings = raw.map((c, idx) => ({
      rank:            (params.page - 1) * params.limit + idx + 1,
      communityId:     c.id,
      title:           c.title,
      status:          c.status,
      leader:          c.leader,
      memberCount:     c._count.members,
      commission:      c.commission,
      totalEarnings:   0,   // populated by Module 4
      totalConversions:0,   // populated by Module 4
      activeCampaigns: 0,   // populated by Module 4
    }));

    return { rankings, total };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIT LOG — reuse pattern from user management
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

  // ─────────────────────────────────────────────────────────────────────────
  // NOTIFICATIONS — reuse pattern from user management
  // ─────────────────────────────────────────────────────────────────────────

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
  // USER LOOKUPS (needed for validation inside community service)
  // ─────────────────────────────────────────────────────────────────────────

  async findUserById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        influencerProfile: { select: { currentTier: true, isCommunityLeader: true } },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  private buildCommunityOrderBy(
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Prisma.CommunityOrderByWithRelationInput {
    switch (sortBy) {
      case 'title':     return { title: sortOrder };
      case 'status':    return { status: sortOrder };
      case 'createdAt':
      default:          return { createdAt: sortOrder };
    }
  }
}

export const communityRepository = new CommunityRepository();
