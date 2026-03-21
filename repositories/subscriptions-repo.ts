import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  polar_customer_id: string;
  polar_subscription_id: string | null;
  status: string;
  plan: string;
  current_period_end: string | null;
  polar_event_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionUpsert = {
  user_id: string;
  polar_customer_id: string;
  polar_subscription_id?: string | null;
  status: string;
  plan: string;
  current_period_end?: string | null;
  polar_event_id?: string | null;
};

export async function upsertSubscription(data: SubscriptionUpsert): Promise<SubscriptionRow> {
  const db = createAdminClient();
  const { data: row, error } = await db
    .from("subscriptions")
    .upsert(
      { ...data, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    )
    .select()
    .single();
  if (error) throw new Error(`subscriptions.upsert failed: ${error.message}`);
  return row as SubscriptionRow;
}

export async function findSubscriptionByCustomerId(
  polarCustomerId: string,
): Promise<SubscriptionRow | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("subscriptions")
    .select()
    .eq("polar_customer_id", polarCustomerId)
    .maybeSingle();
  if (error) throw new Error(`subscriptions.findByCustomerId failed: ${error.message}`);
  return data as SubscriptionRow | null;
}

export async function findSubscriptionByUserId(
  userId: string,
): Promise<SubscriptionRow | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("subscriptions")
    .select()
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`subscriptions.findByUserId failed: ${error.message}`);
  return data as SubscriptionRow | null;
}

/** Returns true if this Polar event has already been processed (idempotency). */
export async function isEventProcessed(polarEventId: string): Promise<boolean> {
  const db = createAdminClient();
  const { count } = await db
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("polar_event_id", polarEventId);
  return (count ?? 0) > 0;
}

/** Sync plan tier to user_plans table after subscription change. */
export async function syncUserPlan(userId: string, plan: "free" | "standard"): Promise<void> {
  const db = createAdminClient();
  const { error } = await db
    .from("user_plans")
    .upsert({ user_id: userId, plan, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw new Error(`user_plans.sync failed: ${error.message}`);
}
