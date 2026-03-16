-- Migration 008: Rename Stripe columns to Polar
-- Migrates billing provider from Stripe to Polar.
-- user_plans remains the canonical plan source.

ALTER TABLE subscriptions RENAME COLUMN stripe_customer_id TO polar_customer_id;
ALTER TABLE subscriptions RENAME COLUMN stripe_sub_id TO polar_subscription_id;
ALTER TABLE subscriptions RENAME COLUMN stripe_event_id TO polar_event_id;

-- Drop old Stripe indexes
DROP INDEX IF EXISTS subscriptions_stripe_customer_id_idx;
DROP INDEX IF EXISTS subscriptions_stripe_sub_id_idx;

-- Create new Polar indexes
CREATE INDEX IF NOT EXISTS subscriptions_polar_customer_id_idx
  ON subscriptions(polar_customer_id);

CREATE INDEX IF NOT EXISTS subscriptions_polar_subscription_id_idx
  ON subscriptions(polar_subscription_id);
