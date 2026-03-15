-- ============================================================
-- Creator Deal Copilot — Schema Reference Snapshot
--
-- NOTE: supabase/migrations/ is the authoritative source of
-- truth for all applied database changes. This file is a
-- human-readable, point-in-time snapshot of the final schema
-- compiled from migrations 001–006. It is for local reference
-- and documentation only — do NOT run it against a database
-- that already has the migrations applied, as it will conflict.
--
-- To apply the schema to a fresh Supabase project, run the
-- migration files in order via the Supabase SQL editor or CLI.
-- ============================================================

-- ============================================================
-- Extensions (enabled by default in Supabase)
-- ============================================================
-- pgcrypto / gen_random_uuid() — provided by Supabase by default

-- ============================================================
-- Function: update_updated_at (from migration 001)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Table: deals (migration 001 + 002 FK)
-- ============================================================
CREATE TABLE deals (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inquiry_id              UUID,                        -- FK added by migration 002

  brand_name              TEXT        NOT NULL,
  contact_name            TEXT        NOT NULL DEFAULT '',
  contact_channel         TEXT        NOT NULL DEFAULT '',
  platform_requested      TEXT        NOT NULL DEFAULT '',
  deliverables_summary    TEXT        NOT NULL DEFAULT '',
  budget_mentioned        TEXT        NOT NULL DEFAULT 'not specified',

  quote_floor             INTEGER     NOT NULL DEFAULT 0,
  quote_target            INTEGER     NOT NULL DEFAULT 0,
  quote_premium           INTEGER     NOT NULL DEFAULT 0,
  quote_breakdown_json    JSONB       NOT NULL DEFAULT '{}',

  deadline                TIMESTAMPTZ,
  payment_due_date        TIMESTAMPTZ,

  next_action             TEXT        NOT NULL DEFAULT 'Send reply',
  next_action_due_at      TIMESTAMPTZ NOT NULL,

  followup_needed         BOOLEAN     NOT NULL DEFAULT FALSE,
  unresolved_checks_count INTEGER     NOT NULL DEFAULT 0,

  status                  TEXT        NOT NULL DEFAULT 'Lead'
    CHECK (status IN ('Lead','Replied','Negotiating','Confirmed','Delivered','Paid','ClosedLost')),

  notes                   TEXT,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX deals_user_id_idx         ON deals(user_id);
CREATE INDEX deals_status_idx          ON deals(status);
CREATE INDEX deals_next_action_due_idx ON deals(next_action_due_at);
CREATE INDEX deals_payment_due_idx     ON deals(payment_due_date);

CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_deals" ON deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_deals" ON deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_deals" ON deals FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- Table: deal_checks (migration 001)
-- ============================================================
CREATE TABLE deal_checks (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id    UUID        NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  severity   TEXT        NOT NULL CHECK (severity IN ('HIGH','MEDIUM','LOW')),
  resolved   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX deal_checks_deal_id_idx  ON deal_checks(deal_id);
CREATE INDEX deal_checks_resolved_idx ON deal_checks(resolved);

ALTER TABLE deal_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_checks" ON deal_checks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM deals WHERE deals.id = deal_checks.deal_id AND deals.user_id = auth.uid()
  ));

-- ============================================================
-- Table: deal_status_logs (migration 001)
-- ============================================================
CREATE TABLE deal_status_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     UUID        NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_status TEXT        NOT NULL,
  to_status   TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX deal_status_logs_deal_id_idx ON deal_status_logs(deal_id);

ALTER TABLE deal_status_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_status_logs" ON deal_status_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM deals WHERE deals.id = deal_status_logs.deal_id AND deals.user_id = auth.uid()
  ));

-- ============================================================
-- Table: reply_drafts (migration 001)
-- ============================================================
CREATE TABLE reply_drafts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id    UUID        NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  tone       TEXT        NOT NULL CHECK (tone IN ('polite','negotiation','quick')),
  body       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX reply_drafts_deal_id_idx ON reply_drafts(deal_id);

ALTER TABLE reply_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_reply_drafts" ON reply_drafts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM deals WHERE deals.id = reply_drafts.deal_id AND deals.user_id = auth.uid()
  ));

-- ============================================================
-- Table: user_plans (migration 001)
-- ============================================================
CREATE TABLE user_plans (
  user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan       TEXT        NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_plan" ON user_plans FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Table: usage_events (migration 001 + meta column from 002)
-- ============================================================
CREATE TABLE usage_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action     TEXT        NOT NULL,
  meta       JSONB       DEFAULT '{}',             -- added by migration 002
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX usage_events_user_action_idx ON usage_events(user_id, action);
CREATE INDEX usage_events_created_at_idx  ON usage_events(created_at);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_usage" ON usage_events FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Table: inquiries (migration 002 + 006)
-- ============================================================
CREATE TABLE inquiries (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable (anon allowed)

  input_hash          TEXT        NOT NULL,          -- SHA-256 of sanitized_text|source_type|parser_version
  raw_text_preview    TEXT        NOT NULL DEFAULT '',
  sanitized_text      TEXT        NOT NULL DEFAULT '',
  source_type         TEXT        NOT NULL DEFAULT 'other'
    CHECK (source_type IN ('email', 'dm', 'other')),

  parsed_json         JSONB       NOT NULL DEFAULT '{}',
  missing_fields      TEXT[]      NOT NULL DEFAULT '{}',

  quote_breakdown_json JSONB,
  checks_json         JSONB       NOT NULL DEFAULT '[]',

  parser_meta         JSONB       NOT NULL DEFAULT '{}',
  reply_drafts_json   JSONB       DEFAULT NULL,      -- added by migration 006

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Non-unique index on input_hash for fast anonymous lookups (migration 002/005)
CREATE INDEX inquiries_input_hash_idx ON inquiries(input_hash);
CREATE INDEX inquiries_user_id_idx    ON inquiries(user_id);
CREATE INDEX inquiries_created_at_idx ON inquiries(created_at);

-- Per-user dedup: authenticated parses only (migrations 003/005)
CREATE UNIQUE INDEX inquiries_user_hash_unique_idx
  ON inquiries (user_id, input_hash)
  WHERE user_id IS NOT NULL;

-- FK from deals.inquiry_id (migration 002)
ALTER TABLE deals
  ADD CONSTRAINT deals_inquiry_id_fkey
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL;

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_inquiries" ON inquiries
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Table: parse_cache (migration 002)
-- No RLS — accessed via admin client only.
-- ============================================================
CREATE TABLE parse_cache (
  input_hash     TEXT        PRIMARY KEY,
  sanitized_text TEXT        NOT NULL DEFAULT '',
  parsed_json    JSONB       NOT NULL DEFAULT '{}',
  missing_fields TEXT[]      NOT NULL DEFAULT '{}',
  parser_meta    JSONB       NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: creator_profiles (migration 003, fields from 003+004)
-- Migration 003 already defines primary_platform/geo_region/currency
-- inline; migration 004 repeats them with ADD COLUMN IF NOT EXISTS
-- (idempotent). Final state has all columns.
-- ============================================================
CREATE TABLE creator_profiles (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  followers_band   TEXT        NOT NULL DEFAULT '50k_100k'
    CHECK (followers_band IN ('under_10k', '10k_50k', '50k_100k', '100k_500k', 'over_500k')),
  avg_views_band   TEXT        NOT NULL DEFAULT '20k_50k'
    CHECK (avg_views_band IN ('under_5k', '5k_20k', '20k_50k', 'over_50k')),
  niche            TEXT        NOT NULL DEFAULT 'general',
  floor_rate       INTEGER     NOT NULL DEFAULT 0,

  primary_platform TEXT        NOT NULL DEFAULT 'instagram',
  geo_region       TEXT        NOT NULL DEFAULT 'KR',
  currency         TEXT        NOT NULL DEFAULT 'KRW',

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id)
);

ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_profile" ON creator_profiles
  FOR ALL USING (auth.uid() = user_id);
