import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { trackEvent } from "@/lib/analytics";
import { logInfo } from "@/lib/logger";

// Maximum LLM calls allowed per day before negotiation AI is throttled
const DAILY_LLM_CALL_LIMIT = 200;

export type BudgetGuardResult =
  | { allowed: true }
  | { allowed: false; reason: string };

/**
 * Records one LLM call in the usage_events table for budget tracking.
 * Non-throwing — failures are silently ignored.
 */
export async function recordLlmCall(task: string): Promise<void> {
  try {
    const db = createAdminClient();
    await db.from("usage_events").insert({ user_id: "system", action: "LLM_CALL", meta: { task } });
  } catch {
    // Non-critical
  }
}

/**
 * Checks whether the daily LLM budget allows further negotiation AI calls.
 * Returns { allowed: false } when the threshold is exceeded and emits a
 * budget_guard_triggered analytics event.
 */
export async function checkLlmBudget(): Promise<BudgetGuardResult> {
  try {
    const db = createAdminClient();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count } = await db
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("action", "LLM_CALL")
      .gte("created_at", startOfDay.toISOString());

    const dailyCount = count ?? 0;

    if (dailyCount >= DAILY_LLM_CALL_LIMIT) {
      logInfo("budget guard triggered", { daily_count: dailyCount, limit: DAILY_LLM_CALL_LIMIT });
      trackEvent("system", "budget_guard_triggered", {
        daily_count: dailyCount,
        limit: DAILY_LLM_CALL_LIMIT,
      });
      return { allowed: false, reason: "DAILY_BUDGET_EXCEEDED" };
    }

    return { allowed: true };
  } catch {
    // If we cannot check, allow the call to proceed (fail open)
    return { allowed: true };
  }
}
