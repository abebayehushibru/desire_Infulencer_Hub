// ─────────────────────────────────────────────────────────────────────────────
// Global Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

import { Role, UserStatus } from '@prisma/client';
import { Request } from 'express';

// ── Authenticated Request ─────────────────────────────────────────────────────
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

// ── JWT Payload ───────────────────────────────────────────────────────────────
export interface JwtPayload {
  sub: string;        // userId
  email: string;
  role: Role;
  jti: string;        // unique token id (for blacklisting)
  iat?: number;
  exp?: number;
}

// ── Token Pair ────────────────────────────────────────────────────────────────
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

// ── Safe User (no passwordHash) ───────────────────────────────────────────────
export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  lastLogin: Date | null;
  profileImage: string | null;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// ── Request context ───────────────────────────────────────────────────────────
export interface RequestContext {
  ip: string;
  userAgent: string;
  userId?: string;
}
