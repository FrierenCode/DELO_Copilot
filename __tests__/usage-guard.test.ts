import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockGte = vi.fn();
const mockMaybeSingle = vi.fn();
const mockHead = vi.fn();
const mockInsert = vi.fn();

// Build a chainable mock Supabase client
function makeChain(finalValue: unknown) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(finalValue),
    insert: vi.fn().mockResolvedValue({ error: null }),
  };
  // For count queries (head: true), return the count directly
  chain.select.mockImplementation((fields: string, opts?: { count?: string; head?: boolean }) => {
    if (opts?.head) {
      return {
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        then: (resolve: (v: { count: number }) => void) => resolve({ count: 0 }),
      };
    }
    return chain;
  });
  return chain;
}

let mockCountValue = 0;
let mockPlan = "free";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: (_fields: string, opts?: { count?: string; head?: boolean }) => ({
        eq: (_col: string, _val: unknown) => ({
          eq: (_col2: string, _val2: unknown) => ({
            gte: () =>
              Promise.resolve({ count: mockCountValue, error: null }),
            then: (r: (v: { count: number }) => void) => r({ count: mockCountValue }),
          }),
          maybeSingle: () =>
            Promise.resolve(
              table === "user_plans"
                ? { data: { plan: mockPlan }, error: null }
                : { data: null, error: null },
            ),
          then: (r: (v: { count: number }) => void) => r({ count: mockCountValue }),
        }),
      }),
      insert: () => Promise.resolve({ error: null }),
    }),
  }),
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

// ---------------------------------------------------------------------------
import { checkUsageLimit, recordUsageEvent } from "@/services/usage-guard";
// ---------------------------------------------------------------------------

describe("usage-guard — plan limits", () => {
  beforeEach(() => {
    mockCountValue = 0;
    mockPlan = "free";
    vi.clearAllMocks();
  });

  describe("FREE plan — PARSE", () => {
    it("allows parse when under monthly limit (5)", async () => {
      mockCountValue = 4;
      await expect(checkUsageLimit("user-1", "PARSE")).resolves.not.toThrow();
    });

    it("throws PLAN_LIMIT_PARSE_REACHED when at limit", async () => {
      mockCountValue = 5;
      await expect(checkUsageLimit("user-1", "PARSE")).rejects.toThrow(
        "PLAN_LIMIT_PARSE_REACHED",
      );
    });
  });

  describe("FREE plan — SAVE_DEAL", () => {
    it("throws PLAN_LIMIT_DEAL_SAVE_REACHED when at limit (10)", async () => {
      mockCountValue = 10;
      await expect(checkUsageLimit("user-1", "SAVE_DEAL")).rejects.toThrow(
        "PLAN_LIMIT_DEAL_SAVE_REACHED",
      );
    });
  });

  describe("FREE plan — NEGOTIATION_AI", () => {
    it("throws FEATURE_NOT_AVAILABLE_ON_FREE", async () => {
      await expect(checkUsageLimit("user-1", "NEGOTIATION_AI")).rejects.toThrow(
        "FEATURE_NOT_AVAILABLE_ON_FREE",
      );
    });
  });

  describe("FREE plan — VIEW_ALERTS", () => {
    it("throws ALERTS_NOT_AVAILABLE_ON_FREE", async () => {
      await expect(checkUsageLimit("user-1", "VIEW_ALERTS")).rejects.toThrow(
        "ALERTS_NOT_AVAILABLE_ON_FREE",
      );
    });
  });

  describe("PRO plan", () => {
    beforeEach(() => {
      mockPlan = "pro";
    });

    it("allows PARSE regardless of count", async () => {
      mockCountValue = 99;
      await expect(checkUsageLimit("user-pro", "PARSE")).resolves.not.toThrow();
    });

    it("allows NEGOTIATION_AI when under monthly limit", async () => {
      mockCountValue = 0;
      await expect(checkUsageLimit("user-pro", "NEGOTIATION_AI")).resolves.not.toThrow();
    });

    it("allows VIEW_ALERTS", async () => {
      await expect(checkUsageLimit("user-pro", "VIEW_ALERTS")).resolves.not.toThrow();
    });
  });

  describe("recordUsageEvent", () => {
    it("does not throw on success", async () => {
      await expect(recordUsageEvent("user-1", "PARSE")).resolves.not.toThrow();
    });
  });
});
