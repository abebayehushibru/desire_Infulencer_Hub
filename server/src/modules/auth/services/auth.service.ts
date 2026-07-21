// ─────────────────────────────────────────────────────────────────────────────
// Auth Service — All auth business logic (FR01–FR05)
// NO database code here. All DB ops go through authRepository.
// ─────────────────────────────────────────────────────────────────────────────

import { User } from '@prisma/client';
import { authRepository } from '../repositories/auth.repository';
import { emailService } from '../../../common/email/email.service';
import { ApiError } from '../../../common/errors/ApiError';
import { generateTokenPair, hashRefreshToken, verifyRefreshToken, verifyAccessToken } from '../../../common/utils/jwt.util';
import { comparePassword } from '../../../common/utils/password.util';
import { generateOtp, hashOtp, verifyOtp, getOtpExpiry, isOtpExpired } from '../../../common/utils/otp.util';
import { securityLogger } from '../../../common/logger/logger';
import redisClient from '../../../config/redis';
import { REDIS_KEYS, AUTH } from '../../../common/constants';
import { SafeUser, TokenPair } from '../../../common/types';

import type {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from '../dto/auth.dto';

// ── Strip sensitive fields from user ─────────────────────────────────────────
const toSafeUser = (user: User): SafeUser => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  status: user.status,
  emailVerified: user.emailVerified,
  lastLogin: user.lastLogin,
  profileImage: user.profileImage,
  isSuspended: user.isSuspended,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

class AuthService {
  // ── FR01 Register ────────────────────────────────────────────────────────────
  async register(
    dto: RegisterDto,
    context: { ip: string; userAgent: string }
  ): Promise<{ user: SafeUser }> {
    // Check for duplicate email
    const existing = await authRepository.findUserByEmail(dto.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    // Create user (password is hashed inside repository)
    const user = await authRepository.createUser(dto);

    // Generate and send verification OTP
    await this.sendVerificationOtp(user);

    // Audit
    await authRepository.createAuditLog({
      userId: user.id,
      action: 'REGISTER',
      ipAddress: context.ip,
      userAgent: context.userAgent,
      metadata: { email: user.email, role: user.role },
    });

    securityLogger.register(user.id, user.email, context.ip);

    return { user: toSafeUser(user) };
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  async login(
    dto: LoginDto,
    context: { ip: string; userAgent: string; deviceInfo?: string }
  ): Promise<{ user: SafeUser; tokens: TokenPair }> {
    // Find user — always fetch (timing-safe: we do password check regardless)
    const user = await authRepository.findUserByEmail(dto.email);

    // Generic error — never reveal whether email exists
    if (!user) {
      securityLogger.loginFailed(dto.email, context.ip, 'User not found');
      await authRepository.createAuditLog({
        action: 'FAILED_LOGIN',
        ipAddress: context.ip,
        userAgent: context.userAgent,
        metadata: { email: dto.email, reason: 'user_not_found' },
        success: false,
      });
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check account lock
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const unlockAt = user.lockedUntil.toISOString();
      throw ApiError.unauthorized(`Account is temporarily locked. Try again after ${unlockAt}`);
    }

    // Auto-unlock if lock period has expired (reset suspension flag)
    if (user.isSuspended && user.lockedUntil && new Date() >= user.lockedUntil) {
      await authRepository.resetFailedAttempts(user.id);
    }

    // Check permanent suspension (no lock time = admin-suspended)
    if (user.isSuspended && !user.lockedUntil) {
      throw ApiError.forbidden('Your account has been suspended. Contact support.');
    }

    // Verify password
    const passwordValid = await comparePassword(dto.password, user.passwordHash);

    if (!passwordValid) {
      // Increment failed attempts
      const updated = await authRepository.incrementFailedAttempts(user.id);

      securityLogger.loginFailed(dto.email, context.ip, 'Invalid password');

      await authRepository.createAuditLog({
        userId: user.id,
        action: 'FAILED_LOGIN',
        ipAddress: context.ip,
        userAgent: context.userAgent,
        metadata: { reason: 'invalid_password', attempt: updated.failedLoginAttempts },
        success: false,
      });

      // Lock account after max attempts
      if (updated.failedLoginAttempts >= AUTH.MAX_LOGIN_ATTEMPTS) {
        await authRepository.lockUserAccount(user.id, AUTH.LOCK_TIME_MINUTES);

        securityLogger.accountLocked(user.id, context.ip, updated.failedLoginAttempts);

        await authRepository.createAuditLog({
          userId: user.id,
          action: 'ACCOUNT_LOCKED',
          ipAddress: context.ip,
          userAgent: context.userAgent,
          metadata: { attempts: updated.failedLoginAttempts },
        });

        throw ApiError.unauthorized(
          `Account locked after ${AUTH.MAX_LOGIN_ATTEMPTS} failed attempts. Try again in ${AUTH.LOCK_TIME_MINUTES} minutes.`
        );
      }

      const remaining = AUTH.MAX_LOGIN_ATTEMPTS - updated.failedLoginAttempts;
      throw ApiError.unauthorized(`Invalid email or password. ${remaining} attempt(s) remaining.`);
    }

    // Check email verification — FR05: Cannot login until verified
    if (!user.emailVerified) {
      throw ApiError.forbidden(
        'Please verify your email address before logging in. Check your inbox for the verification code.'
      );
    }

    // Check user status
    if (user.status === 'INACTIVE') {
      throw ApiError.forbidden('Your account is inactive. Contact support.');
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await authRepository.resetFailedAttempts(user.id);
    }

    // Generate token pair — each login = new device session
    const tokens = generateTokenPair(user.id, user.email, user.role);
    const tokenHash = hashRefreshToken(tokens.refreshToken);

    // Store refresh token in DB
    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      family: tokenHash, // Initial family = hash of first token
      expiresAt: tokens.refreshTokenExpiresAt,
      ipAddress: context.ip,
      userAgent: context.userAgent,
      deviceInfo: context.deviceInfo,
    });

    // Update last login
    await authRepository.updateLastLogin(user.id);

    // Audit
    await authRepository.createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      ipAddress: context.ip,
      userAgent: context.userAgent,
      metadata: { email: user.email },
    });

    securityLogger.loginSuccess(user.id, context.ip, user.email);

    return { user: toSafeUser(user), tokens };
  }

  // ── Logout ────────────────────────────────────────────────────────────────────
  async logout(
    userId: string,
    refreshToken: string,
    accessToken: string,
    context: { ip: string; userAgent: string }
  ): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);

    // Revoke the specific refresh token
    await authRepository.revokeRefreshToken(tokenHash);

    // Blacklist the ACCESS token in Redis until it expires
    try {
      if (accessToken) {
        const decoded = verifyAccessToken(accessToken);
        if (decoded.jti) {
          const ttl = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 900;
          if (ttl > 0) {
            await redisClient.setex(
              REDIS_KEYS.blacklistToken(decoded.jti),
              ttl,
              '1'
            );
          }
        }
      }
    } catch {
      // Token already expired or Redis unavailable — no need to blacklist
    }

    // Audit
    await authRepository.createAuditLog({
      userId,
      action: 'LOGOUT',
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });

    securityLogger.logout(userId, context.ip);
  }

  // ── Logout All Devices ────────────────────────────────────────────────────────
  async logoutAll(
    userId: string,
    accessToken: string,
    context: { ip: string; userAgent: string }
  ): Promise<void> {
    // Revoke all stored refresh tokens
    await authRepository.revokeAllUserRefreshTokens(userId);

    // Also blacklist the current access token so it cannot be reused
    try {
      if (accessToken) {
        const decoded = verifyAccessToken(accessToken);
        if (decoded.jti) {
          const ttl = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 900;
          if (ttl > 0) {
            await redisClient.setex(REDIS_KEYS.blacklistToken(decoded.jti), ttl, '1');
          }
        }
      }
    } catch {
      // Token expired or Redis unavailable — safe to ignore
    }

    await authRepository.createAuditLog({
      userId,
      action: 'LOGOUT_ALL',
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });

    securityLogger.logoutAll(userId, context.ip);
  }

  // ── FR04 Refresh Token with Rotation ─────────────────────────────────────────
  async refreshTokens(
    rawRefreshToken: string,
    context: { ip: string; userAgent: string }
  ): Promise<TokenPair> {
    // Verify token signature & expiry
    const decoded = verifyRefreshToken(rawRefreshToken);
    const tokenHash = hashRefreshToken(rawRefreshToken);

    // Find token in DB
    const storedToken = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!storedToken) {
      // Token not found — may be a stolen token reuse attempt
      if (decoded.family) {
        // Revoke entire token family to protect the user
        await authRepository.revokeTokenFamily(decoded.family);

        await authRepository.createAuditLog({
          userId: decoded.sub,
          action: 'SUSPICIOUS_ACTIVITY',
          ipAddress: context.ip,
          userAgent: context.userAgent,
          metadata: { reason: 'refresh_token_reuse', family: decoded.family },
          success: false,
        });

        securityLogger.suspiciousActivity(
          decoded.sub,
          context.ip,
          'Refresh token reuse detected — possible token theft. Family revoked.'
        );
      }

      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // Fetch user
    const user = await authRepository.findUserById(decoded.sub);
    if (!user || user.isSuspended || user.status !== 'ACTIVE') {
      throw ApiError.unauthorized('Account is not active');
    }

    // Revoke old refresh token
    await authRepository.revokeRefreshToken(tokenHash);

    // Generate new token pair (token rotation)
    const newTokens = generateTokenPair(user.id, user.email, user.role, storedToken.family ?? undefined);
    const newTokenHash = hashRefreshToken(newTokens.refreshToken);

    // Store new refresh token
    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: newTokenHash,
      family: storedToken.family ?? newTokenHash,
      expiresAt: newTokens.refreshTokenExpiresAt,
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });

    await authRepository.createAuditLog({
      userId: user.id,
      action: 'REFRESH_TOKEN',
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });

    securityLogger.tokenRefreshed(user.id, context.ip);

    return newTokens;
  }

  // ── FR02 Forgot Password ──────────────────────────────────────────────────────
  async forgotPassword(
    dto: ForgotPasswordDto,
    context: { ip: string; userAgent: string }
  ): Promise<void> {
    // Always return success — never reveal whether email exists (security)
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user) return; // Silently ignore

    // Invalidate previous OTPs
    await authRepository.invalidatePreviousPasswordResets(user.id);

    // Generate new OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = getOtpExpiry(AUTH.OTP_EXPIRES_MINUTES);

    await authRepository.createPasswordReset({ userId: user.id, otpHash, expiresAt });

    // Send email
    await emailService.sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      otp,
    });

    await authRepository.createAuditLog({
      userId: user.id,
      action: 'FORGOT_PASSWORD',
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });
  }

  // ── FR02 Verify Reset Code ────────────────────────────────────────────────────
  async verifyResetCode(
    dto: VerifyResetCodeDto,
    context: { ip: string; userAgent: string }
  ): Promise<{ valid: boolean }> {
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user) throw ApiError.badRequest('Invalid or expired reset code');

    const resetRecord = await authRepository.findLatestPasswordReset(user.id);
    if (!resetRecord) throw ApiError.badRequest('No active reset code found. Please request a new one.');

    if (isOtpExpired(resetRecord.expiresAt)) {
      throw ApiError.badRequest('Reset code has expired. Please request a new one.');
    }

    const valid = await verifyOtp(dto.otp, resetRecord.otpHash);
    if (!valid) throw ApiError.badRequest('Invalid reset code');

    await authRepository.createAuditLog({
      userId: user.id,
      action: 'VERIFY_RESET_CODE',
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });

    return { valid: true };
  }

  // ── FR02 Reset Password ───────────────────────────────────────────────────────
  async resetPassword(
    dto: ResetPasswordDto,
    context: { ip: string; userAgent: string }
  ): Promise<void> {
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user) throw ApiError.badRequest('Invalid reset request');

    const resetRecord = await authRepository.findLatestPasswordReset(user.id);
    if (!resetRecord) throw ApiError.badRequest('No active reset code found');

    if (isOtpExpired(resetRecord.expiresAt)) {
      throw ApiError.badRequest('Reset code has expired');
    }

    const valid = await verifyOtp(dto.otp, resetRecord.otpHash);
    if (!valid) throw ApiError.badRequest('Invalid reset code');

    // Mark OTP as used — single use
    await authRepository.markPasswordResetUsed(resetRecord.id);

    // Update password
    await authRepository.updatePassword(user.id, dto.newPassword);

    // Revoke all sessions on password change (security best practice)
    await authRepository.revokeAllUserRefreshTokens(user.id);

    // Notify user
    await emailService.sendPasswordChangedEmail({
      to: user.email,
      firstName: user.firstName,
      ip: context.ip,
    });

    await authRepository.createAuditLog({
      userId: user.id,
      action: 'RESET_PASSWORD',
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });

    securityLogger.passwordReset(user.id, context.ip);
  }

  // ── FR05 Verify Email ─────────────────────────────────────────────────────────
  async verifyEmail(
    dto: VerifyEmailDto,
    context: { ip: string; userAgent: string }
  ): Promise<{ user: SafeUser }> {
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user) throw ApiError.badRequest('Invalid verification request');

    if (user.emailVerified) {
      throw ApiError.badRequest('Email is already verified');
    }

    const verification = await authRepository.findLatestEmailVerification(user.id);
    if (!verification) {
      throw ApiError.badRequest('No active verification code. Please request a new one.');
    }

    if (isOtpExpired(verification.expiresAt)) {
      throw ApiError.badRequest('Verification code has expired. Please request a new one.');
    }

    const valid = await verifyOtp(dto.otp, verification.otpHash);
    if (!valid) throw ApiError.badRequest('Invalid verification code');

    // Mark OTP as used
    await authRepository.markEmailVerificationUsed(verification.id);

    // Mark email as verified
    const updatedUser = await authRepository.markEmailVerified(user.id);

    // Send welcome email
    await emailService.sendWelcomeEmail({
      to: updatedUser.email,
      firstName: updatedUser.firstName,
      role: updatedUser.role,
    });

    await authRepository.createAuditLog({
      userId: user.id,
      action: 'VERIFY_EMAIL',
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });

    securityLogger.emailVerified(user.id, context.ip);

    return { user: toSafeUser(updatedUser) };
  }

  // ── FR05 Resend Verification ──────────────────────────────────────────────────
  async resendVerification(
    dto: ResendVerificationDto,
    context: { ip: string; userAgent: string }
  ): Promise<void> {
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user) return; // Silently ignore — don't reveal if email exists

    if (user.emailVerified) {
      throw ApiError.badRequest('Email is already verified');
    }

    await this.sendVerificationOtp(user);

    await authRepository.createAuditLog({
      userId: user.id,
      action: 'RESEND_VERIFICATION',
      ipAddress: context.ip,
      userAgent: context.userAgent,
      metadata: { email: user.email },
    });
  }

  // ── Get Current User (me) ─────────────────────────────────────────────────────
  async getMe(userId: string): Promise<SafeUser> {
    const user = await authRepository.findUserById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return toSafeUser(user);
  }

  // ── Internal: send verification OTP helper ────────────────────────────────────
  private async sendVerificationOtp(user: User): Promise<void> {
    // Invalidate previous OTPs
    await authRepository.invalidatePreviousVerifications(user.id);

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = getOtpExpiry(AUTH.OTP_EXPIRES_MINUTES);

    await authRepository.createEmailVerification({
      userId: user.id,
      otpHash,
      expiresAt,
    });

    await emailService.sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      otp,
    });
  }
}

export const authService = new AuthService();
