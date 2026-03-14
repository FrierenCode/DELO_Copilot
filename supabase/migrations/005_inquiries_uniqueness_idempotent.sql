-- Migration 005: Idempotent enforcement of per-user inquiry dedup constraints
--
-- Ensures the state that migration 003 intended is definitively applied:
--   1. The global UNIQUE(input_hash) constraint on inquiries is absent.
--   2. A partial unique index on (user_id, input_hash) WHERE user_id IS NOT NULL exists.
--   3. A non-unique plain index on input_hash exists for fast anonymous lookups.
--
-- All steps are guarded with IF EXISTS / IF NOT EXISTS so re-running is safe.

-- ---------------------------------------------------------------
-- Step 1: Drop global UNIQUE constraint if it somehow still exists
-- (migration 002 named it inquiries_input_hash_key)
-- ---------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name       = 'inquiries'
      AND constraint_name  = 'inquiries_input_hash_key'
      AND constraint_type  = 'UNIQUE'
  ) THEN
    ALTER TABLE inquiries DROP CONSTRAINT inquiries_input_hash_key;
  END IF;
END
$$;

-- ---------------------------------------------------------------
-- Step 2: Partial unique index — authenticated users only
-- CREATE UNIQUE INDEX IF NOT EXISTS is idempotent
-- ---------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS inquiries_user_hash_unique_idx
  ON inquiries (user_id, input_hash)
  WHERE user_id IS NOT NULL;

-- ---------------------------------------------------------------
-- Step 3: Non-unique index on input_hash for anonymous lookup speed
-- (migration 002 already creates inquiries_input_hash_idx; this
--  is a no-op if it exists)
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS inquiries_input_hash_idx
  ON inquiries (input_hash);
