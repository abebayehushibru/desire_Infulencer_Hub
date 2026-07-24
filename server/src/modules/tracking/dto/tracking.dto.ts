// ─────────────────────────────────────────────────────────────────────────────
// Tracking & Earnings DTOs — FR24–FR31
// ─────────────────────────────────────────────────────────────────────────────

import { WithdrawalStatus, EarningStatus } from '@prisma/client';

// ── FR24 — Click via unique link ──────────────────────────────────────────────
export interface TrackClickDto {
  code: string;           // tracking link code
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
}

// ── FR24 — Conversion via unique link ─────────────────────────────────────────
export interface TrackConversionDto {
  code: string;           // tracking link code that was used at click time
  ipAddress?: string;
  userAgent?: string;
}

// ── FR25 — Referral code usage ────────────────────────────────────────────────
export interface UseReferralCodeDto {
  code: string;           // referral code
  ipAddress?: string;
  userAgent?: string;
}

// ── FR26 — Earnings history query ─────────────────────────────────────────────
export interface EarningsHistoryQueryDto {
  campaignId?: string;
  status?: EarningStatus;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

// ── FR28 — Business analytics query ──────────────────────────────────────────
export interface BusinessAnalyticsQueryDto {
  campaignId?: string;
  communityId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

// ── FR29 — Member performance query ──────────────────────────────────────────
export interface MemberPerformanceQueryDto {
  page?: number;
  limit?: number;
  sortBy?: 'clicks' | 'conversions' | 'earnings' | 'joinedAt';
  sortOrder?: 'asc' | 'desc';
}

// ── FR30 — Withdrawal request ─────────────────────────────────────────────────
export interface CreateWithdrawalDto {
  amount: number;
  bankDetails: {
    accountName:   string;
    accountNumber: string;
    bankName:      string;
    bankCode?:     string;
    swiftCode?:    string;
    routingNumber?: string;
    country:       string;
  };
}

// ── FR31 — Withdrawal history query ──────────────────────────────────────────
export interface WithdrawalHistoryQueryDto {
  status?: WithdrawalStatus;
  page?: number;
  limit?: number;
}
