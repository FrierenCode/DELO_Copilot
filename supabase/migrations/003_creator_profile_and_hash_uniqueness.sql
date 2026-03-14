-- Migration 003: Creator profiles table + per-user inquiry dedup

-- ---------------------------------------------------------------
-- creator_profiles — one profile per authenticated user
-- Stores the creator's audience/pricing data used for quote engine
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS creator_profiles (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  followers_band TEXT        NOT NULL DEFAULT '50k_100k'
    CHECK (followers_band IN ('under_10k', '10k_50k', '50k_100k', '100k_500k', 'over_500k')),
  avg_views_band TEXT        NOT NULL DEFAULT '20k_50k'
    CHECK (avg_views_band IN ('under_5k', '5k_20k', '20k_50k', 'over_50k')),
  niche          TEXT        NOT NULL DEFAULT 'general',
  floor_rate     INTEGER     NOT NULL DEFAULT 0,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id)
);

ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and write their own profile only
CREATE POLICY "users_manage_own_profile" ON creator_profiles
  FOR ALL USING (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- Refactor inquiries.input_hash uniqueness
--
-- Old: UNIQUE(input_hash) — global, cross-user dedup
-- New: per-user dedup only (authenticated users)
--   • Partial unique index: (user_id, input_hash) WHERE user_id IS NOT NULL
--   • Anonymous parses (user_id IS NULL) get no dedup — always fresh
-- ---------------------------------------------------------------

-- Step 1: Drop the old global unique constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'inquiries'
      AND constraint_name = 'inquiries_input_hash_key'
      AND constraint_type = 'UNIQUE'
  ) THEN
    ALTER TABLE inquiries DROP CONSTRAINT inquiries_input_hash_key;
  END IF;
END
$$;

-- Step 2: Add partial composite unique index for authenticated users
CREATE UNIQUE INDEX IF NOT EXISTS inquiries_user_hash_unique_idx
  ON inquiries (user_id, input_hash)
  WHERE user_id IS NOT NULL;

-- Existing index on input_hash alone is kept for fast lookups
-- (now non-unique but still useful for query performance)
