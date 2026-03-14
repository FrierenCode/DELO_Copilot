-- Migration 002: Add inquiries table (canonical parse record) and parse_cache table

-- ---------------------------------------------------------------
-- inquiries — canonical record of every parse request
-- Input data is stored here; parse_cache is a cost-optimization
-- auxiliary layer only.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inquiries (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Nullable: anonymous (unauthenticated) parses are allowed
  user_id              UUID        REFERENCES auth.users(id) ON DELETE SET NULL,

  -- SHA-256 of (sanitized_text | source_type | parser_version)
  -- Used for dedup: identical inquiry returns existing record without LLM call
  input_hash           TEXT        UNIQUE NOT NULL,

  -- First 200 chars of raw input only — never store full raw text
  raw_text_preview     TEXT        NOT NULL DEFAULT '',

  sanitized_text       TEXT        NOT NULL DEFAULT '',
  source_type          TEXT        NOT NULL DEFAULT 'other'
    CHECK (source_type IN ('email', 'dm', 'other')),

  parsed_json          JSONB       NOT NULL DEFAULT '{}',
  missing_fields       TEXT[]      NOT NULL DEFAULT '{}',

  -- Cached computed outputs (nullable — may be populated lazily)
  quote_breakdown_json JSONB,
  checks_json          JSONB       NOT NULL DEFAULT '[]',

  parser_meta          JSONB       NOT NULL DEFAULT '{}',

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inquiries_input_hash_idx  ON inquiries(input_hash);
CREATE INDEX IF NOT EXISTS inquiries_user_id_idx     ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx  ON inquiries(created_at);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Users can read their own inquiries; anonymous inquiries (user_id IS NULL) are
-- not directly selectable by clients (admin client used server-side)
CREATE POLICY "users_select_own_inquiries" ON inquiries
  FOR SELECT USING (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- parse_cache — auxiliary cost-optimization layer
-- Short-lived dedup index; may be flushed without data loss.
-- The inquiries table is the source of truth.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parse_cache (
  input_hash     TEXT        PRIMARY KEY,
  sanitized_text TEXT        NOT NULL DEFAULT '',
  parsed_json    JSONB       NOT NULL DEFAULT '{}',
  missing_fields TEXT[]      NOT NULL DEFAULT '{}',
  parser_meta    JSONB       NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: auto-expire cache entries after 30 days using pg_cron or manual cleanup
-- CREATE INDEX IF NOT EXISTS parse_cache_created_at_idx ON parse_cache(created_at);

-- No RLS on parse_cache — accessed via admin client only

-- ---------------------------------------------------------------
-- Add meta column to usage_events (for LLM call budget tracking)
-- ---------------------------------------------------------------
ALTER TABLE usage_events
  ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}';

-- ---------------------------------------------------------------
-- Add inquiry_id FK to deals (already defined as nullable UUID)
-- Add FK constraint now that inquiries table exists
-- ---------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'deals_inquiry_id_fkey'
  ) THEN
    ALTER TABLE deals
      ADD CONSTRAINT deals_inquiry_id_fkey
      FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL;
  END IF;
END
$$;
