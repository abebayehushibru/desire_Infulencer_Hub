// ─────────────────────────────────────────────────────────────────────────────
// User Management Repository — FR06–FR10
// Pure data access. Zero business logic.
// ─────────────────────────────────────────────────────────────────────────────

import {
  User, BusinessProfile, BusinessDocument,
  InfluencerProfile, InfluencerTierHistory,
  AgentProfile, Notification, Prisma,
  InfluencerTier, VerificationStatus, Role, UserStatus,
} from '@prisma/client';
import prisma from '../../../config/prisma';

export class UserManagementRepository {

  // ─────────────────────────────────────────────────────────────────────────
  // USER QUERIES — FR06
  // ─────────────────────────────────────────────────────────────────────────

  async createUser(data: {
    firstName: string; lastName: string; email: string;
    passwordHash: string; role: Role; status?: UserStatus;
    emailVerified?: boolean; createdBy?: string;
  }): Promise<User> {
    return prisma.user.create({ data: { ...data, status: data.status ?? 'ACTIVE', emailVerified: data.emailVerified ?? true } });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { email: email.toLowerCase().trim(), deletedAt: null } });
  }

  async findUserWithProfiles(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        businessProfile: { include: { documents: { where: { deletedAt: null } } } },
        influencerProfile: { include: { tierHistory: { orderBy: { createdAt: 'desc' }, take: 10 } } },
        agentProfile: true,
      },
    });
  }

  async listUsers(params: {
    role?: Role; status?: UserStatus; search?: string;
    page: number; limit: number;
  }): Promise<{ users: User[]; total: number }> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(params.role   && { role:   params.role }),
      ...(params.status && { status: params.status }),
      ...(params.search && {
        OR: [
          { firstName: { contains: params.search, mode: 'insensitive' } },
          { lastName:  { contains: params.search, mode: 'insensitive' } },
          { email:     { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async deactivateUser(id: string): Promise<User> {
    return prisma.user.update({ where: { id }, data: { status: 'INACTIVE' } });
  }

  async reactivateUser(id: string): Promise<User> {
    return prisma.user.update({ where: { id }, data: { status: 'ACTIVE' } });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BUSINESS PROFILE — FR07
  // ─────────────────────────────────────────────────────────────────────────

  async createBusinessProfile(data: {
    userId: string; businessName: string; businessType?: string;
    registrationNumber?: string; taxId?: string; website?: string;
    phone?: string; address?: string; city?: string; country?: string;
    description?: string;
  }): Promise<BusinessProfile> {
    return prisma.businessProfile.create({ data });
  }

  async findBusinessProfileByUserId(userId: string) {
    return prisma.businessProfile.findFirst({
      where: { userId, deletedAt: null },
      include: { documents: { where: { deletedAt: null } } },
    });
  }

  async findBusinessProfileById(id: string) {
    return prisma.businessProfile.findFirst({
      where: { id, deletedAt: null },
      include: { documents: { where: { deletedAt: null } }, user: true },
    });
  }

  async listBusinessProfiles(status?: VerificationStatus) {
    return prisma.businessProfile.findMany({
      where: { deletedAt: null, ...(status && { verificationStatus: status }) },
      include: { user: true, documents: { where: { deletedAt: null } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateBusinessProfile(id: string, data: Prisma.BusinessProfileUpdateInput): Promise<BusinessProfile> {
    return prisma.businessProfile.update({ where: { id }, data });
  }

  async createBusinessDocument(data: {
    businessProfileId: string; documentType: string; fileName: string;
    fileSize: number; mimeType: string; storagePath: string;
  }): Promise<BusinessDocument> {
    return prisma.businessDocument.create({ data });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BUSINESS VERIFICATION — FR08
  // ─────────────────────────────────────────────────────────────────────────

  async approveBusinessProfile(params: {
    profileId: string; adminId: string;
  }): Promise<BusinessProfile> {
    return prisma.businessProfile.update({
      where: { id: params.profileId },
      data: {
        verificationStatus: 'APPROVED',
        verifiedAt:  new Date(),
        verifiedBy:  params.adminId,
        rejectionReason: null,
      },
    });
  }

  async rejectBusinessProfile(params: {
    profileId: string; adminId: string; reason: string;
  }): Promise<BusinessProfile> {
    return prisma.businessProfile.update({
      where: { id: params.profileId },
      data: {
        verificationStatus: 'REJECTED',
        verifiedAt:      new Date(),
        verifiedBy:      params.adminId,
        rejectionReason: params.reason,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INFLUENCER PROFILE — FR09
  // ─────────────────────────────────────────────────────────────────────────

  async createInfluencerProfile(data: {
    userId: string; bio?: string; niche?: string;
    socialHandles?: Record<string, string>; followerCount?: number;
    engagementRate?: number; currentTier?: import('@prisma/client').InfluencerTier;
  }): Promise<InfluencerProfile> {
    return prisma.influencerProfile.create({ data });
  }

  async findInfluencerProfileByUserId(userId: string) {
    return prisma.influencerProfile.findFirst({
      where: { userId, deletedAt: null },
      include: { tierHistory: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async updateInfluencerProfile(id: string, data: Prisma.InfluencerProfileUpdateInput): Promise<InfluencerProfile> {
    return prisma.influencerProfile.update({ where: { id }, data });
  }

  // Assign tier — transaction: update profile + create history + update user role
  async assignTier(params: {
    userId: string; profileId: string; previousTier: InfluencerTier | null;
    newTier: InfluencerTier; changedBy: string; reason?: string;
  }): Promise<InfluencerProfile> {
    const newRole = params.newTier === 'DIAMOND'
      ? 'DIAMOND_INFLUENCER'
      : params.newTier === 'GOLD'
        ? 'GOLD_INFLUENCER'
        : 'SILVER_INFLUENCER';

    const [profile] = await prisma.$transaction([
      prisma.influencerProfile.update({
        where: { id: params.profileId },
        data: {
          currentTier: params.newTier,
          // If demoted from DIAMOND, revoke community leader status
          ...(params.newTier !== 'DIAMOND' && { isCommunityLeader: false }),
        },
      }),
      prisma.influencerTierHistory.create({
        data: {
          influencerProfileId: params.profileId,
          previousTier:        params.previousTier ?? undefined,
          newTier:             params.newTier,
          changedBy:           params.changedBy,
          reason:              params.reason,
        },
      }),
      prisma.user.update({
        where: { id: params.userId },
        data:  { role: newRole },
      }),
    ]);

    return profile;
  }

  async getTierHistory(profileId: string): Promise<InfluencerTierHistory[]> {
    return prisma.influencerTierHistory.findMany({
      where: { influencerProfileId: profileId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setCommunityLeader(profileId: string, value: boolean): Promise<InfluencerProfile> {
    return prisma.influencerProfile.update({
      where: { id: profileId },
      data: { isCommunityLeader: value },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AGENT PROFILE — FR10
  // ─────────────────────────────────────────────────────────────────────────

  async createAgentProfile(data: {
    userId: string; agencyName?: string; phone?: string; bio?: string;
  }): Promise<AgentProfile> {
    return prisma.agentProfile.create({ data });
  }

  async findAgentProfileByUserId(userId: string): Promise<AgentProfile | null> {
    return prisma.agentProfile.findFirst({ where: { userId, deletedAt: null } });
  }

  async updateAgentProfile(id: string, data: Prisma.AgentProfileUpdateInput): Promise<AgentProfile> {
    return prisma.agentProfile.update({ where: { id }, data });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NOTIFICATIONS — FR08 In-app
  // ─────────────────────────────────────────────────────────────────────────

  async createNotification(data: {
    userId: string; type: string; title: string; message: string;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    return prisma.notification.create({ data: data as any });
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markNotificationRead(id: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIT LOG — FR06–FR10
  // ─────────────────────────────────────────────────────────────────────────

  async createAuditLog(params: {
    userId?: string;
    action: import('@prisma/client').AuditAction;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
    success?: boolean;
  }): Promise<void> {
    // Fire-and-forget — never block the main flow
    prisma.auditLog.create({
      data: {
        userId:    params.userId,
        action:    params.action,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata:  params.metadata as any,
        success:   params.success ?? true,
      },
    }).catch(() => { /* swallow — audit log is non-critical */ });
  }
}

export const userManagementRepository = new UserManagementRepository();
