-- Migration 009: Rename plan identifier 'pro' → 'standard'
-- Applies to: user_plans.plan, subscriptions.plan
-- MVP stage — no live user data. Safe to run unconditionally.

-- ── 1. user_plans ────────────────────────────────────────────────────────────

ALTER TABLE user_plans DROP CONSTRAINT IF EXISTS user_plans_plan_check;
ALTER TABLE user_plans ADD CONSTRAINT user_plans_plan_check
  CHECK (plan IN ('free', 'standard'));

UPDATE user_plans SET plan = 'standard' WHERE plan = 'pro';

-- ── 2. subscriptions ─────────────────────────────────────────────────────────

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'standard'));

UPDATE subscriptions SET plan = 'standard' WHERE plan = 'pro';
