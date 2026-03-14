import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanPolicy } from "@/lib/plan-policy";
import type { PlanTier } from "@/lib/plan-policy";
import { logInfo } from "@/lib/logger";

export type UserPlan = PlanTier;

export type GuardAction = "PARSE" | "SAVE_DEAL" | "VIEW_ALERTS" | "NEGOTIATION_AI";

async function getUserPlan(userId: string): Promise<UserPlan> {
  const db = createAdminClient();
  const { data } = await db
    .from("user_plans")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.plan as UserPlan) ?? "free";
}

export async function getUserPlanForUser(userId: string): Promise<UserPlan> {
  return getUserPlan(userId);
}

/**
 * Enforces plan-based usage limits.
 *
 * Error codes thrown:
 *   PLAN_LIMIT_PARSE_REACHED      — monthly parse quota exhausted
 *   PLAN_LIMIT_DEAL_SAVE_REACHED  — deal save limit exhausted
 *   FEATURE_NOT_AVAILABLE_ON_FREE — feature requires Pro plan
 *   ALERTS_NOT_AVAILABLE_ON_FREE  — dashboard alerts require Pro plan
 *   NEGOTIATION_AI_LIMIT_REACHED  — monthly negotiation AI quota exhausted
 */
export async function checkUsageLimit(
  userId: string,
  action: GuardAction,
): Promise<void> {
  const plan = await getUserPlan(userId);
  const policy = getPlanPolicy(plan);

  if (action === "VIEW_ALERTS") {
    if (!policy.alerts_enabled) {
      throw new Error("ALERTS_NOT_AVAILABLE_ON_FREE");
    }
    return;
  }

  if (action === "NEGOTIATION_AI") {
    if (!policy.negotiation_ai_enabled) {
      throw new Error("FEATURE_NOT_AVAILABLE_ON_FREE");
    }
    const startOfMonth = startOfCurrentMonth();
    const db = createAdminClient();
    const { count } = await db
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("action", "NEGOTIATION_AI")
      .gte("created_at", startOfMonth.toISOString());

    if ((count ?? 0) >= policy.negotiation_ai_per_month) {
      logInfo("usage limit reached", { userId, action, plan, count });
      throw new Error("NEGOTIATION_AI_LIMIT_REACHED");
    }
    return;
  }

  const db = createAdminClient();

  if (action === "PARSE") {
    const startOfMonth = startOfCurrentMonth();
    const { count } = await db
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("action", "PARSE")
      .gte("created_at", startOfMonth.toISOString());

    if ((count ?? 0) >= policy.parse_per_month) {
      logInfo("usage limit reached", { userId, action, plan, count });
      throw new Error("PLAN_LIMIT_PARSE_REACHED");
    }
  }

  if (action === "SAVE_DEAL") {
    const { count } = await db
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if ((count ?? 0) >= policy.deal_save_limit) {
      logInfo("usage limit reached", { userId, action, plan, count });
      throw new Error("PLAN_LIMIT_DEAL_SAVE_REACHED");
    }
  }
}

/**
 * Records a usage event for metering.
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

function startOfCurrentMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}
