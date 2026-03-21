-- Migration 007: Stripe subscriptions table
-- Stores Stripe billing state per user.
-- user_plans remains the canonical plan source;
-- billing-service syncs subscription state into user_plans on webhook.

create table if not exists subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id  text not null,
  stripe_sub_id       text unique,           -- null until first checkout.session.completed
  status              text not null default 'inactive',  -- active | canceled | past_due | inactive
  plan                text not null default 'free',      -- free | pro  (NOTE: 'pro' renamed to 'standard' in migration 009)
  current_period_end  timestamptz,
  stripe_event_id     text,                  -- last processed Stripe event id (idempotency)
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Row-level security: users can only read their own row.
alter table subscriptions enable row level security;

create policy "subscriptions: user read own"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Service role bypass is handled by admin client (bypasses RLS).

-- Index for customer lookups from webhook events.
create index if not exists subscriptions_stripe_customer_id_idx
  on subscriptions(stripe_customer_id);

create index if not exists subscriptions_stripe_sub_id_idx
  on subscriptions(stripe_sub_id);
