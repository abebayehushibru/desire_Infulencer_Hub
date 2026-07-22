// ─────────────────────────────────────────────────────────────────────────────
// User Management Service — FR06–FR10
// All business logic lives here. No DB code.
// ─────────────────────────────────────────────────────────────────────────────

import { InfluencerTier, Role, UserStatus } from '@prisma/client';
import { userManagementRepository as repo } from '../repositories/user-management.repository';
import { emailService } from '../../../common/email/email.service';
import { ApiError } from '../../../common/errors/ApiError';
import { hashPassword } from '../../../common/utils/password.util';
import { PaginatedResult, SafeUser } from '../../../common/types';
import logger from '../../../common/logger/logger';
import type {
  CreateBusinessOwnerDto, UpdateUserDto, AssignTierDto,
  ListUsersQueryDto, CreateBusinessProfileDto, UpdateBusinessProfileDto,
  ReviewBusinessDto, CreateInfluencerProfileDto, UpdateInfluencerProfileDto,
  CreateAgentProfileDto, UpdateAgentProfileDto, UploadDocumentDto,
} from '../dto/user-management.dto';

// ── Strip password hash ───────────────────────────────────────────────────────
const toSafeUser = (u: any): SafeUser => ({
  id: u.id, firstName: u.firstName, lastName: u.lastName,
  email: u.email, role: u.role, status: u.status,
  emailVerified: u.emailVerified, lastLogin: u.lastLogin,
  profileImage: u.profileImage, isSuspended: u.isSuspended,
  createdAt: u.createdAt, updatedAt: u.updatedAt,
});

// ── Allowed MIME types for documents ─────────────────────────────────────────
const ALLOWED_DOC_MIMETYPES = [
  'application/pdf', 'image/jpeg', 'image/png', 'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_DOC_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

class UserManagementService {

  // ── FR06 Admin creates a Business Owner ─────────────────────────────────────
  async createBusinessOwner(dto: CreateBusinessOwnerDto, adminId: string, ctx: { ip: string; userAgent: string }): Promise<SafeUser> {
    const existing = await repo.findUserByEmail(dto.email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const passwordHash = await hashPassword(dto.password);

    const user = await repo.createUser({
      firstName: dto.firstName.trim(),
      lastName:  dto.lastName.trim(),
      email:     dto.email.toLowerCase().trim(),
      passwordHash,
      role:          'BUSINESS_OWNER',
      status:        'ACTIVE',
      emailVerified: true,
      createdBy:     adminId,
    });

    // Bootstrap business profile if businessName provided
    if (dto.businessName) {
      await repo.createBusinessProfile({ userId: user.id, businessName: dto.businessName });
    }

    repo.createAuditLog({
      userId:    adminId,
      action:    'USER_CREATED',
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      metadata:  { createdUserId: user.id, email: user.email, role: 'BUSINESS_OWNER' },
    });

    logger.info('Admin created Business Owner', { adminId, newUserId: user.id, email: user.email });
    return toSafeUser(user);
  }

  // ── FR06 Get user with full profile ──────────────────────────────────────────
  async getUserWithProfile(id: string) {
    const user = await repo.findUserWithProfiles(id);
    if (!user) throw ApiError.notFound('User not found');
    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  // ── FR06 List users with pagination + filters ─────────────────────────────
  async listUsers(query: ListUsersQueryDto): Promise<PaginatedResult<SafeUser>> {
    const page  = Math.max(1, query.page  ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));

    const { users, total } = await repo.listUsers({
      role:   query.role   as Role | undefined,
      status: query.status as UserStatus | undefined,
      search: query.search,
      page, limit,
    });

    return {
      data: users.map(toSafeUser),
      meta: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  // ── FR06 Update user ──────────────────────────────────────────────────────
  async updateUser(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    await this.assertUserExists(id);
    const user = await repo.updateUser(id, {
      ...(dto.firstName     && { firstName: dto.firstName.trim() }),
      ...(dto.lastName      && { lastName:  dto.lastName.trim() }),
      ...(dto.profileImage  && { profileImage: dto.profileImage }),
    });
    repo.createAuditLog({
      userId:   id,
      action:   'USER_UPDATED',
      metadata: { fields: Object.keys(dto) },
    });
    return toSafeUser(user);
  }

  // ── FR06 Deactivate / Reactivate ──────────────────────────────────────────
  async deactivateUser(id: string, adminId: string): Promise<SafeUser> {
    const user = await this.assertUserExists(id);
    if (user.role === 'SYSTEM_ADMIN') throw ApiError.forbidden('Cannot deactivate a System Admin');
    if (user.status === 'INACTIVE')   throw ApiError.badRequest('User is already inactive');
    const updated = await repo.deactivateUser(id);
    repo.createAuditLog({
      userId:   adminId,
      action:   'USER_DEACTIVATED',
      metadata: { targetUserId: id, email: user.email },
    });
    logger.info('User deactivated', { adminId, userId: id });
    return toSafeUser(updated);
  }

  async reactivateUser(id: string, adminId: string): Promise<SafeUser> {
    const user = await this.assertUserExists(id);
    if (user.status === 'ACTIVE') throw ApiError.badRequest('User is already active');
    const updated = await repo.reactivateUser(id);
    // Send notification
    await repo.createNotification({
      userId:  id,
      type:    'ACCOUNT_STATUS_CHANGED',
      title:   'Account Reactivated',
      message: 'Your account has been reactivated. You can now log in.',
    });
    repo.createAuditLog({
      userId:   adminId,
      action:   'USER_REACTIVATED',
      metadata: { targetUserId: id, email: user.email },
    });
    logger.info('User reactivated', { adminId, userId: id });
    return toSafeUser(updated);
  }

  // ── FR07 Business Owner creates/updates their profile ────────────────────
  async createBusinessProfile(userId: string, dto: CreateBusinessProfileDto) {
    const user = await this.assertUserExists(userId);
    if (user.role !== 'BUSINESS_OWNER') throw ApiError.forbidden('Only Business Owners can create a business profile');

    const existing = await repo.findBusinessProfileByUserId(userId);
    if (existing) throw ApiError.conflict('Business profile already exists');

    const profile = await repo.createBusinessProfile({ userId, ...dto });
    // Set user status to PENDING_VERIFICATION until admin approves
    await repo.updateUser(userId, { status: 'PENDING_VERIFICATION' });
    return profile;
  }

  async updateBusinessProfile(userId: string, dto: UpdateBusinessProfileDto) {
    const profile = await repo.findBusinessProfileByUserId(userId);
    if (!profile) throw ApiError.notFound('Business profile not found');

    // If previously APPROVED, re-submit for review when profile data changes
    const updateData: any = { ...dto };
    if (profile.verificationStatus === 'APPROVED') {
      updateData.verificationStatus = 'PENDING';
      updateData.verifiedAt = null;
      updateData.rejectionReason = null;
    }

    return repo.updateBusinessProfile(profile.id, updateData);
  }

  async getMyBusinessProfile(userId: string) {
    const profile = await repo.findBusinessProfileByUserId(userId);
    if (!profile) throw ApiError.notFound('Business profile not found');
    return profile;
  }

  // ── FR07 Upload document ──────────────────────────────────────────────────
  async uploadDocument(userId: string, dto: UploadDocumentDto) {
    const profile = await repo.findBusinessProfileByUserId(userId);
    if (!profile) throw ApiError.notFound('Business profile not found. Create it first.');

    // Validate MIME type
    if (!ALLOWED_DOC_MIMETYPES.includes(dto.mimeType)) {
      throw ApiError.badRequest(`File type not allowed. Allowed: PDF, JPEG, PNG, WEBP, DOC, DOCX`);
    }

    // Validate file size
    if (dto.fileSize > MAX_DOC_SIZE_BYTES) {
      throw ApiError.badRequest('File size exceeds 10 MB limit');
    }

    // Security: reject path traversal attempts in storagePath
    const normalizedPath = dto.storagePath.replace(/\\/g, '/');
    if (normalizedPath.includes('../') || normalizedPath.includes('..\\')) {
      throw ApiError.badRequest('Invalid storage path');
    }

    return repo.createBusinessDocument({
      businessProfileId: profile.id,
      ...dto,
      storagePath: normalizedPath,
    });
  }

  // ── FR08 Admin reviews business ───────────────────────────────────────────
  async reviewBusiness(profileId: string, adminId: string, dto: ReviewBusinessDto) {
    const profile = await repo.findBusinessProfileById(profileId);
    if (!profile) throw ApiError.notFound('Business profile not found');

    if (profile.verificationStatus !== 'PENDING') {
      throw ApiError.badRequest(`Profile is already ${profile.verificationStatus.toLowerCase()}`);
    }

    if (dto.action === 'reject' && !dto.reason) {
      throw ApiError.badRequest('Rejection reason is mandatory');
    }

    let updated;
    if (dto.action === 'approve') {
      updated = await repo.approveBusinessProfile({ profileId, adminId });
      // Activate the user account
      await repo.updateUser(profile.userId, { status: 'ACTIVE' });
      // In-app notification
      await repo.createNotification({
        userId:  profile.userId,
        type:    'BUSINESS_APPROVED',
        title:   'Business Verified ✅',
        message: 'Congratulations! Your business has been verified. You can now access all features.',
        metadata: { profileId },
      });
      // Email notification
      await emailService.sendBusinessVerificationEmail({
        to:        profile.user.email,
        firstName: profile.user.firstName,
        action:    'approved',
        businessName: profile.businessName,
      });
      repo.createAuditLog({
        userId:    adminId,
        action:    'BUSINESS_APPROVED',
        metadata:  { profileId, businessName: profile.businessName, businessOwnerId: profile.userId },
      });
    } else {
      updated = await repo.rejectBusinessProfile({ profileId, adminId, reason: dto.reason! });
      // In-app notification
      await repo.createNotification({
        userId:  profile.userId,
        type:    'BUSINESS_REJECTED',
        title:   'Business Verification Rejected',
        message: `Your business verification was rejected. Reason: ${dto.reason}`,
        metadata: { profileId, reason: dto.reason },
      });
      // Email notification
      await emailService.sendBusinessVerificationEmail({
        to:        profile.user.email,
        firstName: profile.user.firstName,
        action:    'rejected',
        businessName: profile.businessName,
        reason:    dto.reason,
      });
      repo.createAuditLog({
        userId:    adminId,
        action:    'BUSINESS_REJECTED',
        metadata:  { profileId, businessName: profile.businessName, reason: dto.reason, businessOwnerId: profile.userId },
      });
    }

    logger.info(`Business profile ${dto.action}d`, { adminId, profileId });
    return updated;
  }

  // ── FR08 Admin lists pending businesses ───────────────────────────────────
  async listBusinessProfiles(status?: string) {
    const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
    if (status && !VALID_STATUSES.includes(status.toUpperCase())) {
      throw ApiError.badRequest(`Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    return repo.listBusinessProfiles(status ? (status.toUpperCase() as any) : undefined);
  }

  // ── FR09 Create influencer profile (auto-created on registration) ─────────
  async createInfluencerProfile(userId: string, dto: CreateInfluencerProfileDto) {
    const user = await this.assertUserExists(userId);
    if (!['DIAMOND_INFLUENCER', 'GOLD_INFLUENCER', 'SILVER_INFLUENCER'].includes(user.role)) {
      throw ApiError.forbidden('Only influencers can create an influencer profile');
    }
    const existing = await repo.findInfluencerProfileByUserId(userId);
    if (existing) throw ApiError.conflict('Influencer profile already exists');

    // Derive initial tier from the user's current role
    const tierMap: Record<string, InfluencerTier> = {
      DIAMOND_INFLUENCER: 'DIAMOND',
      GOLD_INFLUENCER:    'GOLD',
      SILVER_INFLUENCER:  'SILVER',
    };
    const initialTier = tierMap[user.role] ?? 'SILVER';

    return repo.createInfluencerProfile({
      userId,
      ...dto,
      currentTier: initialTier,
    });
  }

  async updateInfluencerProfile(userId: string, dto: UpdateInfluencerProfileDto) {
    const profile = await repo.findInfluencerProfileByUserId(userId);
    if (!profile) throw ApiError.notFound('Influencer profile not found');
    return repo.updateInfluencerProfile(profile.id, dto as any);
  }

  async getInfluencerProfile(userId: string) {
    const profile = await repo.findInfluencerProfileByUserId(userId);
    if (!profile) throw ApiError.notFound('Influencer profile not found');
    return profile;
  }

  // ── FR09 Admin assigns tier ───────────────────────────────────────────────
  async assignTier(targetUserId: string, adminId: string, dto: AssignTierDto): Promise<void> {
    const user = await this.assertUserExists(targetUserId);
    if (!['DIAMOND_INFLUENCER', 'GOLD_INFLUENCER', 'SILVER_INFLUENCER'].includes(user.role)) {
      throw ApiError.badRequest('User is not an influencer');
    }

    let profile = await repo.findInfluencerProfileByUserId(targetUserId);
    if (!profile) {
      // Auto-create profile if missing
      await repo.createInfluencerProfile({ userId: targetUserId });
      profile = await repo.findInfluencerProfileByUserId(targetUserId);
    }

    if (!profile) throw ApiError.internal('Failed to create influencer profile');

    const previousTier = profile.currentTier;

    if (previousTier === dto.tier) {
      throw ApiError.badRequest(`User already has ${dto.tier} tier`);
    }

    await repo.assignTier({
      userId:       targetUserId,
      profileId:    profile.id,
      previousTier: previousTier ?? null,
      newTier:      dto.tier,
      changedBy:    adminId,
      reason:       dto.reason,
    });

    // In-app notification
    await repo.createNotification({
      userId:  targetUserId,
      type:    'TIER_CHANGED',
      title:   `Influencer Tier Updated: ${dto.tier}`,
      message: `Your influencer tier has been updated from ${previousTier ?? 'none'} to ${dto.tier}.${dto.reason ? ` Reason: ${dto.reason}` : ''}`,
      metadata: { previousTier, newTier: dto.tier },
    });

    repo.createAuditLog({
      userId:    adminId,
      action:    'TIER_ASSIGNED',
      metadata:  { targetUserId, previousTier, newTier: dto.tier, reason: dto.reason },
    });

    logger.info('Influencer tier assigned', { adminId, targetUserId, previousTier, newTier: dto.tier });
  }

  // ── FR09 Community Leader (Diamond only) ─────────────────────────────────
  async setCommunityLeader(targetUserId: string, adminId: string, value: boolean): Promise<void> {
    const profile = await repo.findInfluencerProfileByUserId(targetUserId);
    if (!profile) throw ApiError.notFound('Influencer profile not found');
    if (profile.currentTier !== 'DIAMOND' && value) {
      throw ApiError.badRequest('Only Diamond influencers can be Community Leaders');
    }
    await repo.setCommunityLeader(profile.id, value);
    logger.info('Community leader status set', { adminId, targetUserId, value });
  }

  async getTierHistory(targetUserId: string) {
    const profile = await repo.findInfluencerProfileByUserId(targetUserId);
    if (!profile) throw ApiError.notFound('Influencer profile not found');
    return repo.getTierHistory(profile.id);
  }

  // ── FR10 Agent profile ────────────────────────────────────────────────────
  async createAgentProfile(userId: string, dto: CreateAgentProfileDto) {
    const user = await this.assertUserExists(userId);
    if (user.role !== 'AGENT') throw ApiError.forbidden('Only Agents can create an agent profile');
    const existing = await repo.findAgentProfileByUserId(userId);
    if (existing) throw ApiError.conflict('Agent profile already exists');
    return repo.createAgentProfile({ userId, ...dto });
  }

  async updateAgentProfile(userId: string, dto: UpdateAgentProfileDto) {
    const profile = await repo.findAgentProfileByUserId(userId);
    if (!profile) throw ApiError.notFound('Agent profile not found');
    return repo.updateAgentProfile(profile.id, dto as any);
  }

  async getAgentProfile(userId: string) {
    const profile = await repo.findAgentProfileByUserId(userId);
    if (!profile) throw ApiError.notFound('Agent profile not found');
    return profile;
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  async getNotifications(userId: string) {
    return repo.getNotifications(userId);
  }

  async markNotificationRead(id: string, userId: string) {
    await repo.markNotificationRead(id, userId);
  }

  async markAllNotificationsRead(userId: string) {
    await repo.markAllNotificationsRead(userId);
  }

  // ── Private helpers ───────────────────────────────────────────────────────
  private async assertUserExists(id: string) {
    const user = await repo.findUserById(id);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }
}

export const userManagementService = new UserManagementService();
