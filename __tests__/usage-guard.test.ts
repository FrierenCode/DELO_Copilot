import { describe, it, expect, vi, beforeEach } from "vitest";

let mockCountValue = 0;
let mockPlan = "free";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: (_fields: string, opts?: { count?: string; head?: boolean }) => {
        if (opts?.head) {
          const countChain = {
            eq: () => countChain,
            gte: () => Promise.resolve({ count: mockCountValue, error: null }),
            then: (resolve: (value: { count: number; error: null }) => void) =>
              resolve({ count: mockCountValue, error: null }),
          };
          return countChain;
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
    }),
  }),
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

import { checkUsageLimit, recordUsageEvent } from "@/services/usage-guard";

describe("usage-guard", () => {
  beforeEach(() => {
    mockCountValue = 0;
    mockPlan = "free";
    vi.clearAllMocks();
  });

  it("enforces free parse quota", async () => {
    mockCountValue = 5;
    await expect(checkUsageLimit("user-1", "PARSE")).rejects.toThrow("PLAN_LIMIT_PARSE_REACHED");
  });

  it("enforces free deal save quota", async () => {
    mockCountValue = 10;
    await expect(checkUsageLimit("user-1", "SAVE_DEAL")).rejects.toThrow("PLAN_LIMIT_DEAL_SAVE_REACHED");
  });

  it("blocks free alerts and negotiation AI", async () => {
    await expect(checkUsageLimit("user-1", "VIEW_ALERTS")).rejects.toThrow("ALERTS_NOT_AVAILABLE_ON_FREE");
    await expect(checkUsageLimit("user-1", "NEGOTIATION_AI")).rejects.toThrow("FEATURE_NOT_AVAILABLE_ON_FREE");
  });

  it("treats pro parse and save quotas as unlimited", async () => {
    mockPlan = "pro";
    mockCountValue = 9_999;
    await expect(checkUsageLimit("user-pro", "PARSE")).resolves.not.toThrow();
    await expect(checkUsageLimit("user-pro", "SAVE_DEAL")).resolves.not.toThrow();
  });

  it("treats pro negotiation AI quota as unlimited", async () => {
    mockPlan = "pro";
    mockCountValue = 9_999;
    await expect(checkUsageLimit("user-pro", "NEGOTIATION_AI")).resolves.not.toThrow();
  });

  it("records usage events without throwing", async () => {
    await expect(recordUsageEvent("user-1", "PARSE")).resolves.not.toThrow();
  });
});
