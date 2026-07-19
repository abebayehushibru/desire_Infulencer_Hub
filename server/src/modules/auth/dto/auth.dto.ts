// ─────────────────────────────────────────────────────────────────────────────
// Auth DTOs — Data Transfer Objects for all auth endpoints
// These define the shape of incoming request bodies after validation.
// ─────────────────────────────────────────────────────────────────────────────

import { Role } from '@prisma/client';

// ── FR01 Registration ─────────────────────────────────────────────────────────
export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// ── Login ─────────────────────────────────────────────────────────────────────
export interface LoginDto {
  email: string;
  password: string;
}

// ── FR02 Forgot Password ──────────────────────────────────────────────────────
export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyResetCodeDto {
  email: string;
  otp: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}

// ── FR05 Email Verification ───────────────────────────────────────────────────
export interface VerifyEmailDto {
  email: string;
  otp: string;
}

export interface ResendVerificationDto {
  email: string;
}

// ── Token Refresh ─────────────────────────────────────────────────────────────
export interface RefreshTokenDto {
  refreshToken?: string; // optional — also read from cookie
}

// ── Logout ────────────────────────────────────────────────────────────────────
export interface LogoutDto {
  refreshToken?: string;
}

// ── Create User (admin) ───────────────────────────────────────────────────────
export interface CreateUserDto extends RegisterDto {
  role?: Role;
}
