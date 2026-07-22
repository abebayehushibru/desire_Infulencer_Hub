// ─────────────────────────────────────────────────────────────────────────────
// Admin Service — Admin-only user management operations
// ─────────────────────────────────────────────────────────────────────────────

import { authRepository } from '../repositories/auth.repository';
import { ApiError } from '../../../common/errors/ApiError';
import { SafeUser } from '../../../common/types';
import { securityLogger } from '../../../common/logger/logger';

class AdminService {
  // ── Unlock a locked/suspended user account ────────────────────────────────
  async unlockUser(
    targetUserId: string,
    adminId: string,
    context: { ip: string; userAgent: string }
  ): Promise<SafeUser> {
    const user = await authRepository.findUserById(targetUserId);
    if (!user) throw ApiError.notFound('User not found');

    // Reset failed attempts, clear lock, clear suspension
    await authRepository.resetFailedAttempts(targetUserId);

    // Audit
    await authRepository.createAuditLog({
      userId: adminId,
      action: 'ACCOUNT_UNLOCKED',
      ipAddress: context.ip,
      userAgent: context.userAgent,
      metadata: { targetUserId, targetEmail: user.email },
    });

    securityLogger.suspiciousActivity(
      adminId,
      context.ip,
      `Admin manually unlocked account: ${user.email}`
    );

    // Return fresh user state
    const updated = await authRepository.findUserById(targetUserId);
    if (!updated) throw ApiError.notFound('User not found after update');

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      role: updated.role,
      status: updated.status,
      emailVerified: updated.emailVerified,
      lastLogin: updated.lastLogin,
      profileImage: updated.profileImage,
      isSuspended: updated.isSuspended,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  // ── List all users (admin only) ───────────────────────────────────────────
  async listUsers(
    adminId: string,
    context: { ip: string; userAgent: string }
  ): Promise<SafeUser[]> {
    const users = await authRepository.findAllUsers();

    await authRepository.createAuditLog({
      userId: adminId,
      action: 'PROFILE_UPDATED', // LIST_USERS view — reusing closest action (no dedicated LIST_USERS audit action)
      ipAddress: context.ip,
      userAgent: context.userAgent,
      metadata: { action: 'ADMIN_LIST_USERS', count: users.length },
    });

    return users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      status: u.status,
      emailVerified: u.emailVerified,
      lastLogin: u.lastLogin,
      profileImage: u.profileImage,
      isSuspended: u.isSuspended,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }
}

export const adminService = new AdminService();
