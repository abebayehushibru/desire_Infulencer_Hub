// ─────────────────────────────────────────────────────────────────────────────
// Auth Routes — All routes wired with validators, rate limiters, middleware
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../../../middleware/authenticate';
import { validate } from '../../../middleware/validate';
import {
  authRateLimiter,
  loginRateLimiter,
  otpRateLimiter,
} from '../../../middleware/rateLimiter';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  resendVerificationValidator,
  refreshTokenValidator,
} from '../validators/auth.validator';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/auth/register
 * @desc    FR01 — Register new user
 * @access  Public
 */
router.post(
  '/register',
  authRateLimiter,
  registerValidator,
  validate,
  authController.register.bind(authController)
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with email & password
 * @access  Public
 */
router.post(
  '/login',
  loginRateLimiter,
  loginValidator,
  validate,
  authController.login.bind(authController)
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    FR04 — Refresh access token using refresh token
 * @access  Public (requires valid refresh token)
 */
router.post(
  '/refresh',
  authRateLimiter,
  refreshTokenValidator,
  validate,
  authController.refresh.bind(authController)
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    FR02 — Request password reset OTP
 * @access  Public
 */
router.post(
  '/forgot-password',
  otpRateLimiter,
  forgotPasswordValidator,
  validate,
  authController.forgotPassword.bind(authController)
);

/**
 * @route   POST /api/v1/auth/verify-reset-code
 * @desc    FR02 — Verify password reset OTP
 * @access  Public
 */
router.post(
  '/verify-reset-code',
  authRateLimiter,
  verifyResetCodeValidator,
  validate,
  authController.verifyResetCode.bind(authController)
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    FR02 — Reset password with verified OTP
 * @access  Public
 */
router.post(
  '/reset-password',
  authRateLimiter,
  resetPasswordValidator,
  validate,
  authController.resetPassword.bind(authController)
);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    FR05 — Verify email with OTP
 * @access  Public
 */
router.post(
  '/verify-email',
  authRateLimiter,
  verifyEmailValidator,
  validate,
  authController.verifyEmail.bind(authController)
);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    FR05 — Resend email verification OTP
 * @access  Public
 */
router.post(
  '/resend-verification',
  otpRateLimiter,
  resendVerificationValidator,
  validate,
  authController.resendVerification.bind(authController)
);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES (require valid access token)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  authController.getMe.bind(authController)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    FR04 — Logout from current device
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    FR04 — Logout from all devices
 * @access  Private
 */
router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll.bind(authController)
);

export default router;
