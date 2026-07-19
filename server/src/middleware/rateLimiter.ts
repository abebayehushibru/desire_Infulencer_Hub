// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiters — Protect auth endpoints from brute force
// ─────────────────────────────────────────────────────────────────────────────

import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { sendError } from '../common/helpers/response.helper';

// ── General API rate limiter ──────────────────────────────────────────────────
export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,       // 15 minutes
  max: env.RATE_LIMIT_MAX,                  // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (_req, res) => {
    sendError({
      res,
      statusCode: 429,
      message: 'Too many requests. Please try again later.',
    });
  },
});

// ── Auth endpoints — strict limiter ──────────────────────────────────────────
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,                     // 20 auth requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
  handler: (_req, res) => {
    sendError({
      res,
      statusCode: 429,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    });
  },
});

// ── Login — most strict ────────────────────────────────────────────────────────
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                     // 10 login attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per IP + email combination
    const email = (req.body?.email as string || '').toLowerCase();
    return `${req.ip}:${email}`;
  },
  handler: (_req, res) => {
    sendError({
      res,
      statusCode: 429,
      message: 'Too many login attempts. Please try again in 15 minutes.',
    });
  },
});

// ── OTP endpoints (forgot password, resend verification) ─────────────────────
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 5,                      // 5 OTP requests per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError({
      res,
      statusCode: 429,
      message: 'Too many OTP requests. Please wait 1 hour before trying again.',
    });
  },
});
