// ─────────────────────────────────────────────────────────────────────────────
// Community Service — FR11–FR15
// All business logic lives here. No direct DB code.
// ─────────────────────────────────────────────────────────────────────────────

import { CommunityStatus, CommunityMemberStatus } from '@prisma/client';
import { communityRepository as repo } from '../repositories/community.repository';
import { ApiError } from '../../../common/errors/ApiError';
import { PaginatedResult } from '../../../common/types';
import logger from '../../../common/logger/logger';
import type {
  CreateCommunityDto, UpdateCommunityDto, ListCommunitiesQueryDto,
  SetCommissionDto, AddMemberDto, ListMembersQueryDto,
  LeaderboardQueryDto, CommunityRankingsQueryDto,
} from '../dto/community.dto';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const MEMBER_ELIGIBLE_ROLES = ['GOLD_INFLUENCER', 'SILVER_INFLUENCER'];
const LEADER_ELIGIBLE_ROLE   = 'DIAMOND_INFLUENCER';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Strip HTML tags to prevent stored XSS in community text fields */
const stripHtml = (input: string): string =>
  input.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();

const sanitizeText = (value?: string): string | undefined =>
  value !== undefined ? stripHtml(value) : undefined;

class CommunityService {

  // ─────────────────────────────────────────────────────────────────────────
  // FR11 — Community Creation (SYSTEM_ADMIN only)
  // ─────────────────────────────────────────────────────────────────────────

  async createCommunity(dto: CreateCommunityDto, adminId: string, ctx: { ip: string; userAgent: string }) {
    // Unique title check (case-insensitive)
    const existing = await repo.findCommunityByTitle(dto.title.trim());
    if (existing) throw ApiError.conflict(`A community named "${dto.title}" already exists`);

    // Validate leader if provided
    if (dto.communityLeaderId) {
      await this.assertValidLeader(dto.communityLeaderId);
      await this.assertLeaderNotAlreadyAssigned(dto.communityLeaderId);
    }

    const community = await repo.createCommunity({
      title:             stripHtml(dto.title.trim()),
      description:       sanitizeText(dto.description),
      rules:             sanitizeText(dto.rules),
      communityLeaderId: dto.communityLeaderId,
      createdBy:         adminId,
    });

    // Notify leader if assigned
    if (dto.communityLeaderId) {
      await this.notifyLeaderAssigned(dto.communityLeaderId, community.title);
    }

    repo.createAuditLog({
      userId:    adminId,
      action:    'COMMUNITY_CREATED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata:  { communityId: community.id, title: community.title },
    });

    logger.info('Community created', { adminId, communityId: community.id, title: community.title });
    return this.findOrThrow(community.id);
  }

  async getCommunity(id: string) {
    return this.findOrThrow(id);
  }

  async listCommunities(query: ListCommunitiesQueryDto): Promise<PaginatedResult<any>> {
    const page      = Math.max(1, query.page  ?? 1);
    const limit     = Math.min(100, Math.max(1, query.limit ?? 20));
    const sortBy    = query.sortBy    ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const { communities, total } = await repo.listCommunities({
      status: query.status,
      search: query.search,
      page, limit, sortBy, sortOrder,
    });

    return {
      data: communities,
      meta: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext:    page * limit < total,
        hasPrev:    page > 1,
      },
    };
  }

  async updateCommunity(id: string, dto: UpdateCommunityDto, adminId: string, ctx: { ip: string; userAgent: string }) {
    const community = await this.findOrThrow(id);

    // Title uniqueness check
    if (dto.title && dto.title.trim().toLowerCase() !== community.title.toLowerCase()) {
      const dup = await repo.findCommunityByTitleExcluding(dto.title.trim(), id);
      if (dup) throw ApiError.conflict(`A community named "${dto.title}" already exists`);
    }

    // Validate new leader if changing
    if (dto.communityLeaderId !== undefined) {
      if (dto.communityLeaderId !== null) {
        await this.assertValidLeader(dto.communityLeaderId);
        // Allow reassignment to same community — only block if leading a DIFFERENT community
        if (dto.communityLeaderId !== community.communityLeaderId) {
          await this.assertLeaderNotAlreadyAssigned(dto.communityLeaderId, id);
        }
      }
    }

    const updateData: Record<string, any> = {};
    if (dto.title       !== undefined) updateData.title            = stripHtml(dto.title.trim());
    if (dto.description !== undefined) updateData.description      = dto.description ? stripHtml(dto.description.trim()) : null;
    if (dto.rules       !== undefined) updateData.rules            = dto.rules ? stripHtml(dto.rules.trim()) : null;
    if (dto.status      !== undefined) updateData.status           = dto.status;
    if (dto.communityLeaderId !== undefined) updateData.communityLeaderId = dto.communityLeaderId ?? null;

    // Guard: at least one field must be changing
    if (Object.keys(updateData).length === 0) {
      throw ApiError.badRequest('At least one field must be provided to update');
    }

    const updated = await repo.updateCommunity(id, updateData);

    // Notify new leader if leadership changed
    if (dto.communityLeaderId && dto.communityLeaderId !== community.communityLeaderId) {
      await this.notifyLeaderAssigned(dto.communityLeaderId, updated.title);
    }

    repo.createAuditLog({
      userId:    adminId,
      action:    'COMMUNITY_UPDATED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata:  { communityId: id, changes: Object.keys(updateData) },
    });

    logger.info('Community updated', { adminId, communityId: id });
    return this.findOrThrow(id);
  }

  async deactivateCommunity(id: string, adminId: string, ctx: { ip: string; userAgent: string }) {
    const community = await this.findOrThrow(id);
    if (community.status === 'INACTIVE') throw ApiError.badRequest('Community is already inactive');

    await repo.updateCommunity(id, { status: 'INACTIVE' });

    repo.createAuditLog({
      userId:    adminId,
      action:    'COMMUNITY_DEACTIVATED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata:  { communityId: id, title: community.title },
    });

    logger.info('Community deactivated', { adminId, communityId: id });
    return this.findOrThrow(id);
  }

  async deleteCommunity(id: string, adminId: string, ctx: { ip: string; userAgent: string }) {
    await this.findOrThrow(id);

    await repo.softDeleteCommunity(id);

    repo.createAuditLog({
      userId:    adminId,
      action:    'COMMUNITY_DELETED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata:  { communityId: id },
    });

    logger.info('Community soft-deleted', { adminId, communityId: id });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR12 — Commission Rules
  // ─────────────────────────────────────────────────────────────────────────

  async setCommission(communityId: string, dto: SetCommissionDto, adminId: string, ctx: { ip: string; userAgent: string }) {
    await this.findOrThrow(communityId);

    // Business rule: leader% + member% must equal exactly 100
    // Use integer arithmetic to avoid IEEE 754 floating-point drift (e.g. 33.3 + 66.7 ≠ 100 exactly)
    const leaderCents = Math.round(dto.leaderPercentage * 100);
    const memberCents = Math.round(dto.memberPercentage * 100);
    if (leaderCents + memberCents !== 10000) {
      throw ApiError.badRequest(
        `leaderPercentage + memberPercentage must equal 100. Got ${((leaderCents + memberCents) / 100).toFixed(2)}.`
      );
    }

    // Platform fee must be 0–100
    if (dto.platformFee < 0 || dto.platformFee > 100) {
      throw ApiError.badRequest('platformFee must be between 0 and 100');
    }

    const now = new Date();

    // Seal existing history record
    await repo.sealLatestCommissionHistory(communityId, now);

    // Upsert the live commission row
    const commission = await repo.upsertCommission({
      communityId,
      platformFee:      dto.platformFee,
      leaderPercentage: dto.leaderPercentage,
      memberPercentage: dto.memberPercentage,
      updatedBy:        adminId,
      effectiveFrom:    now,
    });

    // Create immutable history record
    await repo.createCommissionHistory({
      communityId,
      platformFee:      dto.platformFee,
      leaderPercentage: dto.leaderPercentage,
      memberPercentage: dto.memberPercentage,
      effectiveFrom:    now,
      changedBy:        adminId,
      changeReason:     dto.changeReason,
    });

    // Notify community leader if one exists
    const community = await repo.findCommunityById(communityId);
    if (community?.communityLeaderId) {
      await repo.createNotification({
        userId:  community.communityLeaderId,
        type:    'COMMUNITY_COMMISSION_UPDATED',
        title:   'Community Commission Updated',
        message: `Commission rules for "${community.title}" have been updated. Platform fee: ${dto.platformFee}%, Leader: ${dto.leaderPercentage}%, Members: ${dto.memberPercentage}%.`,
        metadata: { communityId, platformFee: dto.platformFee, leaderPercentage: dto.leaderPercentage, memberPercentage: dto.memberPercentage },
      });
    }

    repo.createAuditLog({
      userId:    adminId,
      action:    'COMMUNITY_COMMISSION_UPDATED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata:  { communityId, platformFee: dto.platformFee, leaderPercentage: dto.leaderPercentage, memberPercentage: dto.memberPercentage },
    });

    logger.info('Community commission set', { adminId, communityId });
    return commission;
  }

  async getCommission(communityId: string, requesterId?: string, requesterRole?: string) {
    const community = await this.findOrThrow(communityId);
    // SYSTEM_ADMIN always allowed. DIAMOND must be the actual leader of THIS community.
    if (requesterRole !== 'SYSTEM_ADMIN') {
      if (community.communityLeaderId !== requesterId) {
        throw ApiError.forbidden('Only the community leader or SYSTEM_ADMIN can view commission rules');
      }
    }
    const commission = await repo.getCommission(communityId);
    if (!commission) throw ApiError.notFound('No commission rules found for this community');
    return commission;
  }

  async getCommissionHistory(communityId: string) {
    await this.findOrThrow(communityId);
    return repo.getCommissionHistory(communityId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR13 — Community Member Management
  // ─────────────────────────────────────────────────────────────────────────

  async addMember(communityId: string, dto: AddMemberDto, requesterId: string, requesterRole: string, ctx: { ip: string; userAgent: string }) {
    const community = await this.findOrThrow(communityId);
    if (community.status === 'INACTIVE') throw ApiError.badRequest('Cannot add members to an inactive community');

    // Requester must be SYSTEM_ADMIN or the community leader
    this.assertCanManageMembers(community, requesterId, requesterRole);

    // Validate the target user
    const targetUser = await repo.findUserById(dto.userId);
    if (!targetUser) throw ApiError.notFound('User not found');

    // Only GOLD and SILVER influencers can be members
    if (!MEMBER_ELIGIBLE_ROLES.includes(targetUser.role)) {
      throw ApiError.badRequest(
        `Only GOLD_INFLUENCER and SILVER_INFLUENCER users can become community members. User role: ${targetUser.role}`
      );
    }

    // DIAMOND influencers cannot be regular members
    if (targetUser.role === LEADER_ELIGIBLE_ROLE) {
      throw ApiError.badRequest('DIAMOND influencers cannot be added as regular members');
    }

    // Block suspended or inactive users
    if (targetUser.status === 'SUSPENDED' || targetUser.status === 'INACTIVE' || targetUser.status === 'PENDING_VERIFICATION') {
      throw ApiError.badRequest(`Cannot add a ${targetUser.status.toLowerCase()} user to a community`);
    }

    // Prevent duplicate active membership
    const existing = await repo.findActiveMembership(communityId, dto.userId);
    if (existing) throw ApiError.conflict('User is already an active member of this community');

    const member = await repo.addMember({
      communityId,
      userId:  dto.userId,
      addedBy: requesterId,
    });

    // In-app notification to the new member
    await repo.createNotification({
      userId:  dto.userId,
      type:    'COMMUNITY_MEMBER_ADDED',
      title:   `You joined "${community.title}"`,
      message: `You have been added to the community "${community.title}".`,
      metadata: { communityId, communityTitle: community.title },
    });

    repo.createAuditLog({
      userId:    requesterId,
      action:    'COMMUNITY_MEMBER_ADDED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata:  { communityId, targetUserId: dto.userId },
    });

    logger.info('Community member added', { requesterId, communityId, targetUserId: dto.userId });
    return member;
  }

  async removeMember(communityId: string, memberId: string, requesterId: string, requesterRole: string, ctx: { ip: string; userAgent: string }) {
    const community = await this.findOrThrow(communityId);

    // Requester must be SYSTEM_ADMIN or the community leader
    this.assertCanManageMembers(community, requesterId, requesterRole);

    // memberId is the CommunityMember row ID — look it up directly and verify it belongs to this community
    const membership = await repo.findMembershipById(memberId);
    if (!membership) throw ApiError.notFound('Membership not found');
    if (membership.communityId !== communityId) throw ApiError.notFound('Membership not found in this community');
    if (membership.status === 'REMOVED') throw ApiError.badRequest('Member has already been removed');

    const removed = await repo.removeMember(membership.id, requesterId);

    // In-app notification to the removed member
    await repo.createNotification({
      userId:  membership.userId,
      type:    'COMMUNITY_MEMBER_REMOVED',
      title:   `Removed from "${community.title}"`,
      message: `You have been removed from the community "${community.title}".`,
      metadata: { communityId, communityTitle: community.title },
    });

    repo.createAuditLog({
      userId:    requesterId,
      action:    'COMMUNITY_MEMBER_REMOVED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata:  { communityId, memberId, targetUserId: membership.userId },
    });

    logger.info('Community member removed', { requesterId, communityId, memberId });
    return removed;
  }

  async listMembers(communityId: string, query: ListMembersQueryDto, requesterId: string, requesterRole: string): Promise<PaginatedResult<any>> {
    const community = await this.findOrThrow(communityId);

    // Accessible by SYSTEM_ADMIN or community leader/member
    await this.assertCanViewCommunity(community, requesterId, requesterRole);

    const page  = Math.max(1, query.page  ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));

    const { members, total } = await repo.listMembers(communityId, {
      status: query.status,
      page, limit,
    });

    return {
      data: members,
      meta: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext:    page * limit < total,
        hasPrev:    page > 1,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR14 — Community Leaderboard
  // ─────────────────────────────────────────────────────────────────────────

  async getLeaderboard(communityId: string, query: LeaderboardQueryDto, requesterId: string, requesterRole: string): Promise<PaginatedResult<any>> {
    const community = await this.findOrThrow(communityId);

    // Visible to community leader, community members, and SYSTEM_ADMIN
    await this.assertCanViewCommunity(community, requesterId, requesterRole);

    const page      = Math.max(1, query.page  ?? 1);
    const limit     = Math.min(100, Math.max(1, query.limit ?? 20));
    const sortBy    = query.sortBy    ?? 'totalConversions';
    const sortOrder = query.sortOrder ?? 'desc';

    const { entries, total } = await repo.getLeaderboard(communityId, { page, limit, sortBy, sortOrder });

    return {
      data: entries,
      meta: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext:    page * limit < total,
        hasPrev:    page > 1,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR15 — Cross-Community Rankings (SYSTEM_ADMIN only)
  // ─────────────────────────────────────────────────────────────────────────

  async getCommunityRankings(query: CommunityRankingsQueryDto): Promise<PaginatedResult<any>> {
    const page      = Math.max(1, query.page  ?? 1);
    const limit     = Math.min(100, Math.max(1, query.limit ?? 20));
    const sortBy    = query.sortBy    ?? 'totalEarnings';
    const sortOrder = query.sortOrder ?? 'desc';

    const { rankings, total } = await repo.getCommunityRankings({
      page, limit, sortBy, sortOrder, status: query.status,
    });

    return {
      data: rankings,
      meta: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext:    page * limit < total,
        hasPrev:    page > 1,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  private async findOrThrow(id: string) {
    const community = await repo.findCommunityById(id);
    if (!community || community.deletedAt) throw ApiError.notFound('Community not found');
    return community;
  }

  private async assertValidLeader(leaderId: string): Promise<void> {
    const user = await repo.findUserById(leaderId);
    if (!user) throw ApiError.notFound('Proposed community leader user not found');
    if (user.role !== LEADER_ELIGIBLE_ROLE) {
      throw ApiError.badRequest(
        `Only DIAMOND influencers can be community leaders. User role: ${user.role}`
      );
    }
    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw ApiError.badRequest(`Cannot assign a ${user.status.toLowerCase()} user as community leader`);
    }
  }

  private async assertLeaderNotAlreadyAssigned(leaderId: string, excludeCommunityId?: string): Promise<void> {
    const existing = await repo.findActiveCommunityByLeader(leaderId, excludeCommunityId);
    if (existing) {
      throw ApiError.conflict(
        `This DIAMOND influencer is already leading community "${existing.title}". A leader can only lead one active community.`
      );
    }
  }

  private assertCanManageMembers(community: any, requesterId: string, requesterRole: string): void {
    if (requesterRole === 'SYSTEM_ADMIN') return;
    if (community.communityLeaderId === requesterId) return;
    throw ApiError.forbidden('Only SYSTEM_ADMIN or the Community Leader can manage members');
  }

  private async assertCanViewCommunity(community: any, requesterId: string, requesterRole: string): Promise<void> {
    if (requesterRole === 'SYSTEM_ADMIN') return;
    if (community.communityLeaderId === requesterId) return;
    // Check if user is an active member
    const membership = await repo.findActiveMembership(community.id, requesterId);
    if (membership) return;
    throw ApiError.forbidden('Access restricted to community leader, members, and administrators');
  }

  private async notifyLeaderAssigned(leaderId: string, communityTitle: string): Promise<void> {
    await repo.createNotification({
      userId:  leaderId,
      type:    'COMMUNITY_LEADER_ASSIGNED',
      title:   `You are now a Community Leader`,
      message: `You have been assigned as the leader of "${communityTitle}".`,
      metadata: { communityTitle },
    });
  }
}

export const communityService = new CommunityService();
