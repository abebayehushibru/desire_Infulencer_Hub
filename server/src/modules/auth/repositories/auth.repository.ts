// ─────────────────────────────────────────────────────────────────────────────
// Auth Repository — All database operations for the auth module
// No business logic here. Pure data access only.
// All queries are optimized with proper indexes.
// ─────────────────────────────────────────────────────────────────────────────

import { User, RefreshToken, PasswordReset, EmailVerification, AuditLog, AuditAction, Prisma } from '@prisma/client';
import prisma from '../../../config/prisma';
import { RegisterDto } from '../dto/auth.dto';
import { hashPassword } from '../../../common/utils/password.util';
import { normalizeEmail } from '../../../common/utils/request.util';

// ─────────────────────────────────────────────────────────────────────────────
// USER QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export class AuthRepository {
  // ── Find user by email (active, not deleted) ──────────────────────────────
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email: normalizeEmail(email),
        deletedAt: null,
      },
    });
  }

  // ── Find user by id ───────────────────────────────────────────────────────
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  // ── Create user ───────────────────────────────────────────────────────────
  async createUser(dto: RegisterDto): Promise<User> {
    const passwordHash = await hashPassword(dto.password);

    return prisma.user.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: normalizeEmail(dto.email),
        passwordHash,
      },
    });
  }

  // ── Update user last login ─────────────────────────────────────────────────
  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  // ── Increment failed login attempts ───────────────────────────────────────
  async incrementFailedAttempts(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
      },
    });
  }

  // ── Lock user account ─────────────────────────────────────────────────────
  async lockUserAccount(userId: string, lockUntilMinutes: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: new Date(Date.now() + lockUntilMinutes * 60 * 1000),
        isSuspended: true,
      },
    });
  }

  // ── Reset failed login attempts ───────────────────────────────────────────
  async resetFailedAttempts(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        isSuspended: false,
      },
    });
  }

  // ── Mark email as verified ─────────────────────────────────────────────────
  async markEmailVerified(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        status: 'ACTIVE',
      },
    });
  }

  // ── Update user password ───────────────────────────────────────────────────
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  // ── Soft delete user ───────────────────────────────────────────────────────
  async softDeleteUser(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REFRESH TOKEN QUERIES — FR04 Session Management
  // ─────────────────────────────────────────────────────────────────────────

  // ── Store refresh token ───────────────────────────────────────────────────
  async createRefreshToken(params: {
    userId: string;
    tokenHash: string;
    family: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId: params.userId,
        tokenHash: params.tokenHash,
        family: params.family,
        expiresAt: params.expiresAt,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        deviceInfo: params.deviceInfo,
      },
    });
  }

  // ── Find refresh token by hash ────────────────────────────────────────────
  async findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        isRevoked: false,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  // ── Find all tokens in a family (for stolen token detection) ─────────────
  async findRefreshTokensByFamily(family: string): Promise<RefreshToken[]> {
    return prisma.refreshToken.findMany({
      where: { family, deletedAt: null },
    });
  }

  // ── Revoke a single refresh token ────────────────────────────────────────
  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    });
  }

  // ── Revoke entire token family (stolen token detection) ──────────────────
  async revokeTokenFamily(family: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { family },
      data: { isRevoked: true },
    });
  }

  // ── Revoke all refresh tokens for a user (logout all) ────────────────────
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  // ── Count active sessions for a user ─────────────────────────────────────
  async countActiveSessionsByUser(userId: string): Promise<number> {
    return prisma.refreshToken.count({
      where: {
        userId,
        isRevoked: false,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASSWORD RESET QUERIES — FR02
  // ─────────────────────────────────────────────────────────────────────────

  // ── Invalidate previous OTPs before creating new one ─────────────────────
  async invalidatePreviousPasswordResets(userId: string): Promise<void> {
    await prisma.passwordReset.updateMany({
      where: { userId, isUsed: false },
      data: { isUsed: true },
    });
  }

  // ── Create password reset OTP ─────────────────────────────────────────────
  async createPasswordReset(params: {
    userId: string;
    otpHash: string;
    expiresAt: Date;
  }): Promise<PasswordReset> {
    return prisma.passwordReset.create({
      data: {
        userId: params.userId,
        otpHash: params.otpHash,
        expiresAt: params.expiresAt,
      },
    });
  }

  // ── Find latest valid password reset OTP ─────────────────────────────────
  async findLatestPasswordReset(userId: string): Promise<PasswordReset | null> {
    return prisma.passwordReset.findFirst({
      where: {
        userId,
        isUsed: false,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Mark password reset OTP as used ──────────────────────────────────────
  async markPasswordResetUsed(id: string): Promise<void> {
    await prisma.passwordReset.update({
      where: { id },
      data: { isUsed: true },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EMAIL VERIFICATION QUERIES — FR05
  // ─────────────────────────────────────────────────────────────────────────

  // ── Invalidate previous verifications before creating new ─────────────────
  async invalidatePreviousVerifications(userId: string): Promise<void> {
    await prisma.emailVerification.updateMany({
      where: { userId, isUsed: false },
      data: { isUsed: true },
    });
  }

  // ── Create email verification OTP ────────────────────────────────────────
  async createEmailVerification(params: {
    userId: string;
    otpHash: string;
    expiresAt: Date;
  }): Promise<EmailVerification> {
    return prisma.emailVerification.create({
      data: {
        userId: params.userId,
        otpHash: params.otpHash,
        expiresAt: params.expiresAt,
      },
    });
  }

  // ── Find latest valid email verification OTP ─────────────────────────────
  async findLatestEmailVerification(userId: string): Promise<EmailVerification | null> {
    return prisma.emailVerification.findFirst({
      where: {
        userId,
        isUsed: false,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Mark email verification OTP as used ──────────────────────────────────
  async markEmailVerificationUsed(id: string): Promise<void> {
    await prisma.emailVerification.update({
      where: { id },
      data: { isUsed: true },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIT LOG QUERIES
  // ─────────────────────────────────────────────────────────────────────────

  async createAuditLog(params: {
    userId?: string;
    action: AuditAction;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Prisma.JsonObject;
    success?: boolean;
  }): Promise<void> {
    // Fire-and-forget — audit logs should never block the main flow
    prisma.auditLog
      .create({
        data: {
          userId: params.userId,
          action: params.action,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          metadata: params.metadata,
          success: params.success ?? true,
        },
      })
      .catch((err: Error) => {
        // Audit log failure must never crash the app
        console.error('Audit log failed:', err.message);
      });
  }
}

export const authRepository = new AuthRepository();
