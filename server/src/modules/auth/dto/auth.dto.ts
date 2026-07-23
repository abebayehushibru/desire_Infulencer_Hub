// ─────────────────────────────────────────────────────────────────────────────
// Auth DTOs — Data Transfer Objects for all auth endpoints
// These define the shape of incoming request bodies after validation.
// ─────────────────────────────────────────────────────────────────────────────

import { Role, UserStatus } from '@prisma/client';

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

// ─────────────────────────────────────────────────────────────────────────────
// AuthUserResponseDto — safe public user shape returned by every auth endpoint.
// Never includes passwords, tokens, OTPs, failed-login attempts, audit fields,
// or any other sensitive/internal data.
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthUserResponseDto {
  id:              string;
  firstName:       string;
  lastName:        string;
  fullName:        string;       // computed: firstName + ' ' + lastName
  email:           string;
  role:            Role;
  status:          UserStatus;
  avatar:          string | null; // alias for profileImage
  isEmailVerified: boolean;
}

// ── Mapper: Prisma User / SafeUser → AuthUserResponseDto ─────────────────────
// Accepts any object that has the required fields so it works with both
// the raw Prisma User model and our SafeUser interface.
export function toAuthUserResponse(user: {
  id:            string;
  firstName:     string;
  lastName:      string;
  email:         string;
  role:          Role;
  status:        UserStatus;
  profileImage:  string | null;
  emailVerified: boolean;
}): AuthUserResponseDto {
  return {
    id:              user.id,
    firstName:       user.firstName,
    lastName:        user.lastName,
    fullName:        `${user.firstName} ${user.lastName}`.trim(),
    email:           user.email,
    role:            user.role,
    status:          user.status,
    avatar:          user.profileImage,
    isEmailVerified: user.emailVerified,
  };
}
