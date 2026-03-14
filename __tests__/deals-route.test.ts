import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();
const mockGetUserPlanForUser = vi.fn();
const mockCheckUsageLimit = vi.fn();
const mockFindDealsByUserId = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}));

vi.mock("@/services/usage-guard", () => ({
  checkUsageLimit: (...args: unknown[]) => mockCheckUsageLimit(...args),
  getUserPlanForUser: (...args: unknown[]) => mockGetUserPlanForUser(...args),
  recordUsageEvent: vi.fn(),
}));

vi.mock("@/repositories/deals-repo", () => ({
  findDealsByUserId: (...args: unknown[]) => mockFindDealsByUserId(...args),
  createDeal: vi.fn(),
}));

vi.mock("@/lib/analytics", async () => {
  const actual = await vi.importActual<typeof import("@/lib/analytics")>("@/lib/analytics");
  return {
    ...actual,
    createAnalyticsTracker: () => ({ track: vi.fn() }),
  };
});

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

import { GET } from "@/app/api/deals/route";

describe("deals route GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserPlanForUser.mockResolvedValue("pro");
    mockFindDealsByUserId.mockResolvedValue([]);
    mockCheckUsageLimit.mockResolvedValue(undefined);
  });

  it("returns 400 for invalid status filters", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await GET(new NextRequest("http://localhost/api/deals?status=invalid"));
    expect(response.status).toBe(400);
  });

  it("passes status filter through to repository", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await GET(new NextRequest("http://localhost/api/deals?status=Confirmed"));
    expect(response.status).toBe(200);
    expect(mockFindDealsByUserId).toHaveBeenCalledWith("user-1", "Confirmed");
  });
});
