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
}));

vi.mock("@/repositories/deals-repo", () => ({
  findDealsByUserId: (...args: unknown[]) => mockFindDealsByUserId(...args),
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

import { GET } from "@/app/api/deals/alerts/route";

describe("deals alerts route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserPlanForUser.mockResolvedValue("pro");
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await GET(new NextRequest("http://localhost/api/deals/alerts"));
    expect(response.status).toBe(401);
  });

  it("returns 402 when plan gate blocks alerts", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCheckUsageLimit.mockRejectedValue(new Error("ALERTS_NOT_AVAILABLE_ON_FREE"));

    const response = await GET(new NextRequest("http://localhost/api/deals/alerts"));
    expect(response.status).toBe(402);
  });

  it("returns structured alerts for pro users", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCheckUsageLimit.mockResolvedValue(undefined);
    mockFindDealsByUserId.mockResolvedValue([]);

    const response = await GET(new NextRequest("http://localhost/api/deals/alerts"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.alerts.items).toEqual([]);
  });
});
