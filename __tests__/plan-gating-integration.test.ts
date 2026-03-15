import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Integration tests for plan gating enforcement:
 * - Free parse limit blocks at 5 uses
 * - Free deal save limit blocks at 10 saves
 * - Free tone gate blocks negotiation tone
 * These call into the same usage-guard module used by the API routes.
 */

let mockCountValue = 0;
let mockPlan = "free";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: (_fields: string, opts?: { count?: string; head?: boolean }) => {
        if (opts?.head) {
          const chain: Record<string, unknown> = {};
          chain["eq"] = () => chain;
          chain["gte"] = () => Promise.resolve({ count: mockCountValue, error: null });
          // Make the chain itself thenable so `await db.from(...).select(...).eq(...)` works.
          chain["then"] = (resolve: (v: { count: number; error: null }) => void) =>
            resolve({ count: mockCountValue, error: null });
          return chain;
        }
        return {
          eq: () => ({
            eq: () => ({
              gte: () => Promise.resolve({ count: mockCountValue, error: null }),
            }),
            maybeSingle: () =>
              Promise.resolve(
                table === "user_plans"
                  ? { data: { plan: mockPlan }, error: null }
                  : { data: null, error: null },
              ),
          }),
        };
      },
      insert: () => Promise.resolve({ error: null }),
      upsert: () => Promise.resolve({ error: null }),
    }),
  }),
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

import { checkUsageLimit } from "@/services/usage-guard";
import { getPlanPolicy } from "@/lib/plan-policy";

describe("plan gating — free tier", () => {
  beforeEach(() => {
    mockCountValue = 0;
    mockPlan = "free";
    vi.clearAllMocks();
  });

  it("blocks parse at exactly 5 monthly uses", async () => {
    mockCountValue = 5;
    await expect(checkUsageLimit("user-free", "PARSE")).rejects.toThrow(
      "PLAN_LIMIT_PARSE_REACHED",
    );
  });

  it("allows parse below the limit", async () => {
    mockCountValue = 4;
    await expect(checkUsageLimit("user-free", "PARSE")).resolves.not.toThrow();
  });

  it("blocks deal save at exactly 10 deals", async () => {
    mockCountValue = 10;
    await expect(checkUsageLimit("user-free", "SAVE_DEAL")).rejects.toThrow(
      "PLAN_LIMIT_DEAL_SAVE_REACHED",
    );
  });

  it("blocks negotiation AI for free users", async () => {
    await expect(checkUsageLimit("user-free", "NEGOTIATION_AI")).rejects.toThrow(
      "FEATURE_NOT_AVAILABLE_ON_FREE",
    );
  });

  it("free policy allows only polite tone", () => {
    const policy = getPlanPolicy("free");
    expect(policy.reply_tones).toEqual(["polite"]);
    expect(policy.reply_tones).not.toContain("negotiation");
    expect(policy.reply_tones).not.toContain("quick");
  });

  it("free policy disables full quote breakdown and checks", () => {
    const policy = getPlanPolicy("free");
    expect(policy.full_quote_breakdown).toBe(false);
    expect(policy.full_checks_list).toBe(false);
    expect(policy.alerts_enabled).toBe(false);
  });
});

describe("plan gating — pro tier", () => {
  beforeEach(() => {
    mockPlan = "pro";
    mockCountValue = 9999;
    vi.clearAllMocks();
  });

  it("allows unlimited parse for pro", async () => {
    await expect(checkUsageLimit("user-pro", "PARSE")).resolves.not.toThrow();
  });

  it("allows unlimited deal saves for pro", async () => {
    await expect(checkUsageLimit("user-pro", "SAVE_DEAL")).resolves.not.toThrow();
  });

  it("allows negotiation AI for pro", async () => {
    await expect(checkUsageLimit("user-pro", "NEGOTIATION_AI")).resolves.not.toThrow();
  });

  it("pro policy enables all tones and features", () => {
    const policy = getPlanPolicy("pro");
    expect(policy.reply_tones).toContain("negotiation");
    expect(policy.full_quote_breakdown).toBe(true);
    expect(policy.full_checks_list).toBe(true);
    expect(policy.alerts_enabled).toBe(true);
  });
});
