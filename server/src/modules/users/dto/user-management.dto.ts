// ─────────────────────────────────────────────────────────────────────────────
// User Management DTOs — FR06–FR10
// ─────────────────────────────────────────────────────────────────────────────

import { InfluencerTier, Role } from '@prisma/client';

// ── FR06 Admin User Management ────────────────────────────────────────────────

export interface CreateBusinessOwnerDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  // Optional business profile bootstrap
  businessName?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export interface AssignTierDto {
  tier: InfluencerTier;
  reason?: string;
}

export interface ListUsersQueryDto {
  role?: Role;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ── FR07 Business Profile ─────────────────────────────────────────────────────

export interface CreateBusinessProfileDto {
  businessName: string;
  businessType?: string;
  registrationNumber?: string;
  taxId?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
}

export interface UpdateBusinessProfileDto {
  businessName?: string;
  businessType?: string;
  registrationNumber?: string;
  taxId?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
}

export interface UploadDocumentDto {
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;  // set by server after upload
}

// ── FR08 Business Verification ────────────────────────────────────────────────

export interface ReviewBusinessDto {
  action: 'approve' | 'reject';
  reason?: string;  // mandatory for rejection
}

// ── FR09 Influencer Profile ───────────────────────────────────────────────────

export interface CreateInfluencerProfileDto {
  bio?: string;
  niche?: string;
  socialHandles?: Record<string, string>;
  followerCount?: number;
  engagementRate?: number;
  currentTier?: import('@prisma/client').InfluencerTier; // set by service from user role
}

export interface UpdateInfluencerProfileDto {
  bio?: string;
  niche?: string;
  socialHandles?: Record<string, string>;
  followerCount?: number;
  engagementRate?: number;
}

// ── FR10 Agent Profile ────────────────────────────────────────────────────────

export interface CreateAgentProfileDto {
  agencyName?: string;
  phone?: string;
  bio?: string;
}

export interface UpdateAgentProfileDto {
  agencyName?: string;
  phone?: string;
  bio?: string;
}
