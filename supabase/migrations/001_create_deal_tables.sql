-- Migration 001: Create deal tables for Creator Deal Copilot MVP

-- ---------------------------------------------------------------
-- deals
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deals (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inquiry_id             UUID,

  brand_name             TEXT        NOT NULL,
  contact_name           TEXT        NOT NULL DEFAULT '',
  contact_channel        TEXT        NOT NULL DEFAULT '',
  platform_requested     TEXT        NOT NULL DEFAULT '',
  deliverables_summary   TEXT        NOT NULL DEFAULT '',
  budget_mentioned       TEXT        NOT NULL DEFAULT 'not specified',

  quote_floor            INTEGER     NOT NULL DEFAULT 0,
  quote_target           INTEGER     NOT NULL DEFAULT 0,
  quote_premium          INTEGER     NOT NULL DEFAULT 0,
  quote_breakdown_json   JSONB       NOT NULL DEFAULT '{}',

  deadline               TIMESTAMPTZ,
  payment_due_date       TIMESTAMPTZ,

  next_action            TEXT        NOT NULL DEFAULT 'Send reply',
  next_action_due_at     TIMESTAMPTZ NOT NULL,

  followup_needed        BOOLEAN     NOT NULL DEFAULT FALSE,
  unresolved_checks_count INTEGER    NOT NULL DEFAULT 0,

  status                 TEXT        NOT NULL DEFAULT 'Lead'
    CHECK (status IN ('Lead','Replied','Negotiating','Confirmed','Delivered','Paid','ClosedLost')),

  notes                  TEXT,

  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS deals_user_id_idx         ON deals(user_id);
CREATE INDEX IF NOT EXISTS deals_status_idx          ON deals(status);
CREATE INDEX IF NOT EXISTS deals_next_action_due_idx ON deals(next_action_due_at);
CREATE INDEX IF NOT EXISTS deals_payment_due_idx     ON deals(payment_due_date);

-- ---------------------------------------------------------------
-- deal_checks
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deal_checks (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id    UUID        NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  severity   TEXT        NOT NULL CHECK (severity IN ('HIGH','MEDIUM','LOW')),
  resolved   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS deal_checks_deal_id_idx  ON deal_checks(deal_id);
CREATE INDEX IF NOT EXISTS deal_checks_resolved_idx ON deal_checks(resolved);

-- ---------------------------------------------------------------
-- deal_status_logs
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deal_status_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     UUID        NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_status TEXT        NOT NULL,
  to_status   TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS deal_status_logs_deal_id_idx ON deal_status_logs(deal_id);

-- ---------------------------------------------------------------
-- reply_drafts
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reply_drafts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id    UUID        NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  tone       TEXT        NOT NULL CHECK (tone IN ('polite','negotiation','quick')),
  body       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reply_drafts_deal_id_idx ON reply_drafts(deal_id);

-- ---------------------------------------------------------------
-- user_plans  (needed for usage guard)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_plans (
  user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan       TEXT        NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- usage_events  (needed for usage guard — parse count per month)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usage_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action     TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS usage_events_user_action_idx ON usage_events(user_id, action);
CREATE INDEX IF NOT EXISTS usage_events_created_at_idx  ON usage_events(created_at);

-- ---------------------------------------------------------------
-- updated_at trigger for deals
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------
ALTER TABLE deals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_checks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_drafts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events     ENABLE ROW LEVEL SECURITY;

-- deals
CREATE POLICY "users_select_own_deals" ON deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_deals" ON deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_deals" ON deals FOR UPDATE USING (auth.uid() = user_id);

-- deal_checks (scoped through deals)
CREATE POLICY "users_select_own_checks" ON deal_checks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM deals WHERE deals.id = deal_checks.deal_id AND deals.user_id = auth.uid()
  ));

-- deal_status_logs (scoped through deals)
CREATE POLICY "users_select_own_status_logs" ON deal_status_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM deals WHERE deals.id = deal_status_logs.deal_id AND deals.user_id = auth.uid()
  ));

-- reply_drafts (scoped through deals)
CREATE POLICY "users_select_own_reply_drafts" ON reply_drafts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM deals WHERE deals.id = reply_drafts.deal_id AND deals.user_id = auth.uid()
  ));

-- user_plans
CREATE POLICY "users_select_own_plan" ON user_plans FOR SELECT USING (auth.uid() = user_id);

-- usage_events
CREATE POLICY "users_select_own_usage" ON usage_events FOR SELECT USING (auth.uid() = user_id);
