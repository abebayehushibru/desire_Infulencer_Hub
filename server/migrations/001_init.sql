-- ============================================================
-- Migration 001 — Initial Schema
-- InfluencerHub Database
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone         VARCHAR(30),
  password_hash TEXT NOT NULL,
  role          VARCHAR(30) NOT NULL DEFAULT 'influencer', -- admin | influencer | business
  status        VARCHAR(30) NOT NULL DEFAULT 'Active',     -- Active | Pending | Suspended
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Influencer Profiles ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS influencer_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  main_platform   VARCHAR(50),
  profile_link    TEXT,
  followers_count INTEGER DEFAULT 0,
  level           VARCHAR(30),  -- Diamond | Gold | Silver
  bio             TEXT,
  address         TEXT,
  languages       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Influencer Audience Locations ────────────────────────────
CREATE TABLE IF NOT EXISTS influencer_audience_locations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id       UUID NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  country             VARCHAR(100) NOT NULL,
  city                VARCHAR(100),
  audience_percentage NUMERIC(5,2) DEFAULT 0
);

-- ── Communities ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(150) NOT NULL,
  location    VARCHAR(150),
  tier        VARCHAR(30),          -- Diamond | Gold | Silver
  status      VARCHAR(30) NOT NULL DEFAULT 'Active',
  about       TEXT,
  goals       TEXT,
  rules       TEXT,
  categories  TEXT[],               -- e.g. ARRAY['Beauty','Lifestyle']
  platforms   TEXT[],               -- e.g. ARRAY['TikTok','Instagram']
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Community Members ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          VARCHAR(30) NOT NULL DEFAULT 'member', -- owner | moderator | agent | member
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, user_id)
);

-- ── Campaigns ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(200) NOT NULL,
  type            VARCHAR(50),   -- Sales | Awareness | Growth
  description     TEXT,
  start_date      DATE,
  end_date        DATE,
  total_budget    NUMERIC(15,2) DEFAULT 0,
  amount          NUMERIC(15,2) DEFAULT 0,  -- per conversion / fixed amount
  fund_type       VARCHAR(30),   -- conversion | fixed
  run_type        VARCHAR(30),   -- manual | automatic | both
  status          VARCHAR(30) NOT NULL DEFAULT 'Draft',
  locations       TEXT[],
  platforms       JSONB,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Campaign Targets ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_targets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  target_type   VARCHAR(30) NOT NULL,  -- influencer | community
  target_id     UUID NOT NULL,
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Campaign Claims ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_claims (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        VARCHAR(30) NOT NULL DEFAULT 'Pending',  -- Pending | Active | Rejected
  claimed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campaign_id, user_id)
);

-- ── Conversions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_name VARCHAR(150),
  source        VARCHAR(100),
  amount        NUMERIC(15,2) DEFAULT 0,
  status        VARCHAR(30) NOT NULL DEFAULT 'Pending',  -- Pending | Confirmed | Rejected
  converted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Earnings / Payouts ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS payouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campaign_id   UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  amount        NUMERIC(15,2) NOT NULL,
  method        VARCHAR(100),   -- Bank Transfer | Telebirr
  status        VARCHAR(30) NOT NULL DEFAULT 'Pending',  -- Pending | Paid
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_campaigns_status      ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type        ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_influencer_profiles_user ON influencer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_comm ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_conversions_campaign  ON conversions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_payouts_influencer    ON payouts(influencer_id);
