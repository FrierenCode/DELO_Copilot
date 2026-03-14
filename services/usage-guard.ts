import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { logInfo } from "@/lib/logger";

export type UserPlan = "free" | "pro";

export type GuardAction = "PARSE" | "SAVE_DEAL" | "GENERATE_REPLY" | "VIEW_ALERTS" | "NEGOTIATION_AI";

const FREE_LIMITS = {
  PARSE_PER_MONTH: 20,
  SAVED_DEALS_TOTAL: 5,
  NEGOTIATION_AI_PER_MONTH: 3,
} as const;

async function getUserPlan(userId: string): Promise<UserPlan> {
  const db = createAdminClient();
  const { data } = await db
    .from("user_plans")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.plan as UserPlan) ?? "free";
}

/**
 * Enforces usage limits per action.
 * Throws:
 *   "USAGE_LIMIT_EXCEEDED"            — user has hit their plan limit
 *   "ALERTS_DISABLED_ON_FREE_PLAN"    — free plan cannot access alerts
 */
export async function checkUsageLimit(
  userId: string,
  action: GuardAction,
): Promise<void> {
  const plan = await getUserPlan(userId);

  if (plan === "pro") return; // unlimited

  if (action === "VIEW_ALERTS") {
    throw new Error("ALERTS_DISABLED_ON_FREE_PLAN");
  }

  const db = createAdminClient();

  if (action === "PARSE") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await db
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("action", "PARSE")
      .gte("created_at", startOfMonth.toISOString());

    if ((count ?? 0) >= FREE_LIMITS.PARSE_PER_MONTH) {
      logInfo("usage limit reached", { userId, action, plan, count });
      throw new Error("USAGE_LIMIT_EXCEEDED");
    }
  }

  if (action === "SAVE_DEAL") {
    const { count } = await db
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if ((count ?? 0) >= FREE_LIMITS.SAVED_DEALS_TOTAL) {
      logInfo("usage limit reached", { userId, action, plan, count });
      throw new Error("USAGE_LIMIT_EXCEEDED");
    }
  }

  if (action === "NEGOTIATION_AI") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await db
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("action", "NEGOTIATION_AI")
      .gte("created_at", startOfMonth.toISOString());

    if ((count ?? 0) >= FREE_LIMITS.NEGOTIATION_AI_PER_MONTH) {
      logInfo("usage limit reached", { userId, action, plan, count });
      throw new Error("USAGE_LIMIT_EXCEEDED");
    }
  }
}

/**
 * Records a usage event for metering purposes.
 * Non-throwing — failures are silently ignored to avoid blocking user actions.
 */
export async function recordUsageEvent(
  userId: string,
  action: GuardAction,
): Promise<void> {
  try {
    const db = createAdminClient();
    await db.from("usage_events").insert({ user_id: userId, action });
  } catch {
    // Non-critical — do not propagate
  }
}
