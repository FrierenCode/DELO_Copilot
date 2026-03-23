-- Migration 010: Add notified_at to deals for unanswered-deal cron alert
ALTER TABLE deals ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS deals_notified_at_idx ON deals(notified_at);
