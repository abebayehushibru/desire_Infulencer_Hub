// ─────────────────────────────────────────────────────────────────────────────
// Community DTOs — FR11–FR15
// ─────────────────────────────────────────────────────────────────────────────

import { CommunityStatus, CommunityMemberStatus } from '@prisma/client';

// ── FR11 Community ────────────────────────────────────────────────────────────

export interface CreateCommunityDto {
  title: string;
  description?: string;
  rules?: string;
  communityLeaderId?: string; // must be a DIAMOND_INFLUENCER user id
}

export interface UpdateCommunityDto {
  title?: string;
  description?: string;
  rules?: string;
  communityLeaderId?: string;
  status?: CommunityStatus;
}

export interface ListCommunitiesQueryDto {
  status?: CommunityStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// ── FR12 Commission ───────────────────────────────────────────────────────────

export interface SetCommissionDto {
  platformFee: number;        // 0–100 %
  leaderPercentage: number;   // of post-platform-fee remainder; leaderPercentage + memberPercentage = 100
  memberPercentage: number;
  changeReason?: string;
}

// ── FR13 Members ──────────────────────────────────────────────────────────────

export interface AddMemberDto {
  userId: string;
}

export interface ListMembersQueryDto {
  status?: CommunityMemberStatus;
  page?: number;
  limit?: number;
}

// ── FR14 Leaderboard ──────────────────────────────────────────────────────────

export interface LeaderboardQueryDto {
  page?: number;
  limit?: number;
  sortBy?: 'totalConversions' | 'totalEarnings' | 'campaignActivity';
  sortOrder?: 'asc' | 'desc';
}

// ── FR15 Cross-Community Ranking ──────────────────────────────────────────────

export interface CommunityRankingsQueryDto {
  page?: number;
  limit?: number;
  sortBy?: 'totalEarnings' | 'totalConversions' | 'activeCampaigns' | 'memberCount';
  sortOrder?: 'asc' | 'desc';
  status?: CommunityStatus;
}
