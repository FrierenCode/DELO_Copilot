import { describe, it, expect, vi, beforeEach } from "vitest";

let mockCount = 0;
let shouldThrow = false;

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => {
        if (shouldThrow) {
          throw new Error("DB unavailable");
        }

        const chain = {
          eq: () => chain,
          gte: () => Promise.resolve({ count: mockCount, error: null }),
        };

        return chain;
      },
      insert: () => Promise.resolve({ error: null }),
    }),
  }),
}));

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logInfo: vi.fn(), logError: vi.fn() }));

import { checkLlmBudget } from "@/services/llm-budget-guard";

describe("checkLlmBudget", () => {
  beforeEach(() => {
    mockCount = 0;
    shouldThrow = false;
    vi.clearAllMocks();
  });

  it("allows when daily count is below threshold", async () => {
    mockCount = 50;
    const result = await checkLlmBudget();
    expect(result.allowed).toBe(true);
  });

  it("blocks when daily count reaches or exceeds threshold (200)", async () => {
    mockCount = 200;
    const result = await checkLlmBudget();
    expect(result.allowed).toBe(false);
    expect((result as { allowed: false; reason: string }).reason).toBe("DAILY_BUDGET_EXCEEDED");
  });

  it("blocks at exactly the threshold", async () => {
    mockCount = 200;
    const result = await checkLlmBudget();
    expect(result.allowed).toBe(false);
  });

  it("fails open (allows) when DB is unavailable", async () => {
    shouldThrow = true;
    const result = await checkLlmBudget();
    expect(result.allowed).toBe(true);
  });
});
