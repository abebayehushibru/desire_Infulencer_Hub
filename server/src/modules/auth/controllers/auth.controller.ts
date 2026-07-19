// ─────────────────────────────────────────────────────────────────────────────
// Auth Controller — Validates request → calls service → returns response
// NO business logic here. Controllers are thin.
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../../../common/helpers/response.helper';
import { getIpAddress, getUserAgent } from '../../../common/utils/request.util';
import { extractBearerToken } from '../../../common/utils/jwt.util';
import { AuthenticatedRequest } from '../../../common/types';
import { COOKIE, AUTH } from '../../../common/constants';
import { env } from '../../../config/env';

// Helper to build context from request
const ctx = (req: Request) => ({
  ip: getIpAddress(req),
  userAgent: getUserAgent(req),
});

class AuthController {
  // ── POST /api/v1/auth/register ─────────────────────────────────────────────
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firstName, lastName, email, password } = req.body;
      const result = await authService.register(
        { firstName, lastName, email, password },
        ctx(req)
      );

      sendSuccess({
        res,
        statusCode: 201,
        message: 'Registration successful. Please check your email for the verification code.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ── POST /api/v1/auth/login ────────────────────────────────────────────────
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(
        { email, password },
        { ...ctx(req), deviceInfo: getUserAgent(req) }
      );

      // Set refresh token as HttpOnly cookie
      res.cookie(COOKIE.REFRESH_TOKEN, result.tokens.refreshToken, {
        ...COOKIE.OPTIONS,
        maxAge: AUTH.REFRESH_TOKEN_EXPIRES_MS,
      });

      sendSuccess({
        res,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          accessTokenExpiresAt: result.tokens.accessTokenExpiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ── POST /api/v1/auth/logout ───────────────────────────────────────────────
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user.sub;

      // Get refresh token from cookie or body
      const refreshToken: string =
        req.cookies?.[COOKIE.REFRESH_TOKEN] ||
        req.body?.refreshToken;

      const accessToken = extractBearerToken(req.headers.authorization) || '';

      if (refreshToken) {
        await authService.logout(userId, refreshToken, accessToken, ctx(req));
      }

      // Clear cookie
      res.clearCookie(COOKIE.REFRESH_TOKEN, { ...COOKIE.OPTIONS });

      sendSuccess({ res, message: 'Logged out successfully', data: null });
    } catch (error) {
      next(error);
    }
  }

  // ── POST /api/v1/auth/logout-all ──────────────────────────────────────────
  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      await authService.logoutAll(authReq.user.sub, ctx(req));

      res.clearCookie(COOKIE.REFRESH_TOKEN, { ...COOKIE.OPTIONS });

      sendSuccess({ res, message: 'Logged out from all devices successfully', data: null });
    } catch (error) {
      next(error);
    }
  }

  // ── POST /api/v1/auth/refresh ──────────────────────────────────────────────
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Accept from cookie or body
      const rawToken: string =
        req.cookies?.[COOKIE.REFRESH_TOKEN] ||
        req.body?.refreshToken;

      if (!rawToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token is required',
          data: null,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const tokens = await authService.refreshTokens(rawToken, ctx(req));

      // Rotate cookie
      res.cookie(COOKIE.REFRESH_TOKEN, tokens.refreshToken, {
        ...COOKIE.OPTIONS,
        maxAge: AUTH.REFRESH_TOKEN_EXPIRES_MS,
      });

      sendSuccess({
        res,
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ── POST /api/v1/auth/forgot-password ─────────────────────────────────────
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.forgotPassword({ email }, ctx(req));

      // Always return success — never reveal email existence
      sendSuccess({
        res,
        message: 'If an account with that email exists, you will receive a reset code shortly.',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // ── POST /api/v1/auth/verify-reset-code ───────────────────────────────────
  async verifyResetCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      await authService.verifyResetCode({ email, otp }, ctx(req));

      sendSuccess({
        res,
        message: 'Reset code verified successfully',
        data: { valid: true },
      });
    } catch (error) {
      next(error);
    }
  }

  // ── POST /api/v1/auth/reset-password ──────────────────────────────────────
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;
      await authService.resetPassword({ email, otp, newPassword }, ctx(req));

      sendSuccess({
        res,
        message: 'Password reset successfully. Please log in with your new password.',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // ── POST /api/v1/auth/verify-email ────────────────────────────────────────
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyEmail({ email, otp }, ctx(req));

      sendSuccess({
        res,
        message: 'Email verified successfully. You can now log in.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ── POST /api/v1/auth/resend-verification ─────────────────────────────────
  async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.resendVerification({ email }, ctx(req));

      sendSuccess({
        res,
        message: 'If an unverified account exists, a new verification code has been sent.',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  // ── GET /api/v1/auth/me ────────────────────────────────────────────────────
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await authService.getMe(authReq.user.sub);

      sendSuccess({ res, message: 'User profile retrieved', data: user });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
