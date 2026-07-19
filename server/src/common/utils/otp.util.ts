// ─────────────────────────────────────────────────────────────────────────────
// OTP Utility — Cryptographically secure 6-digit OTP
// Uses crypto.randomInt (Node.js built-in) for true randomness.
// OTPs are ALWAYS hashed before database storage.
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { env } from '../../config/env';

// ── Generate cryptographically secure 6-digit OTP ────────────────────────────
export const generateOtp = (): string => {
  // crypto.randomInt produces cryptographically strong random integers
  const otp = crypto.randomInt(100000, 999999);
  return otp.toString().padStart(6, '0');
};

// ── Hash OTP before storing in database ──────────────────────────────────────
export const hashOtp = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, env.BCRYPT_ROUNDS);
};

// ── Verify OTP against stored hash ───────────────────────────────────────────
// Uses bcrypt.compare to prevent timing attacks
export const verifyOtp = async (otp: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(otp, hash);
};

// ── Calculate OTP expiry ──────────────────────────────────────────────────────
export const getOtpExpiry = (minutes = 10): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

// ── Check if OTP has expired ──────────────────────────────────────────────────
export const isOtpExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};
