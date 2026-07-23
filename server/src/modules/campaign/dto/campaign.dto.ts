// ─────────────────────────────────────────────────────────────────────────────
// Campaign DTOs — FR16–FR23
// ─────────────────────────────────────────────────────────────────────────────

import { CampaignType, CampaignStatus, TrackingMethod } from '@prisma/client';

// ── FR16 — Create Campaign ────────────────────────────────────────────────────

export interface CreateCampaignDto {
  title: string;
  description?: string;
  type: CampaignType;
  budget: number;
  targetPlatform: string;
  startDate: string;   // ISO string — parsed to Date in service
  endDate: string;     // ISO string
  // FR17 — SALES only
  payoutPerConversion?: number;
  trackingMethod?: TrackingMethod;
}

export interface UpdateCampaignDto {
  title?: string;
  description?: string;
  type?: CampaignType;
  budget?: number;
  targetPlatform?: string;
  startDate?: string;
  endDate?: string;
  // FR17 — SALES only
  payoutPerConversion?: number;
  trackingMethod?: TrackingMethod;
}

export interface ListCampaignsQueryDto {
  status?: CampaignStatus;
  type?: CampaignType;
  communityId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'startDate' | 'budget' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// ── FR18 — Community Assignment ───────────────────────────────────────────────

export interface AssignCommunityDto {
  communityId: string;
}

// ── FR19 — Admin Review ───────────────────────────────────────────────────────

export interface AdminReviewDto {
  action: 'approve' | 'reject';
  reason?: string;   // mandatory on rejection
}

// ── FR20 — Leader Review ──────────────────────────────────────────────────────

export interface LeaderReviewDto {
  action: 'accept' | 'reject';
  reason?: string;   // mandatory on rejection
}

// ── FR23 — Manual Conversion ──────────────────────────────────────────────────

export interface CreateConversionDto {
  influencerId: string;
  amount: number;
  note?: string;
  convertedAt: string;   // ISO string
}

export interface UpdateConversionDto {
  amount?: number;
  note?: string;
  convertedAt?: string;
}
