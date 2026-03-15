import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();
const mockGetUserPlanForUser = vi.fn();
const mockCheckUsageLimit = vi.fn();
const mockFindDealsByUserId = vi.fn();
const mockCreateDeal = vi.fn();
const mockFindInquiryById = vi.fn();
const mockFindProfileByUserId = vi.fn();
const mockBuildDealPayload = vi.fn();

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
  createDeal: (...args: unknown[]) => mockCreateDeal(...args),
}));

vi.mock("@/repositories/deal-checks-repo", () => ({
  createDealChecks: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/repositories/reply-drafts-repo", () => ({
  createReplyDrafts: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/repositories/inquiries-repo", () => ({
  findInquiryById: (...args: unknown[]) => mockFindInquiryById(...args),
}));

vi.mock("@/repositories/creator-profiles-repo", () => ({
  findProfileByUserId: (...args: unknown[]) => mockFindProfileByUserId(...args),
}));

vi.mock("@/services/deal-service", () => ({
  buildDealPayload: (...args: unknown[]) => mockBuildDealPayload(...args),
  DEFAULT_CREATOR_PROFILE: {},
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

import { GET, POST } from "@/app/api/deals/route";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function makeInquiry(id: string, userId: string) {
  return {
    id,
    user_id: userId,
    parsed_json: { brand_name: "TestBrand" },
    missing_fields: [],
  };
}

function makeDealPayload(statusOverride?: string) {
  return {
    deal_insert: { user_id: "user-1", status: "Lead", ...(statusOverride ? { status: statusOverride } : {}) },
    check_inserts: [],
    draft_inserts: [],
  };
}

function postRequest(body: object) {
  return new NextRequest("http://localhost/api/deals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── GET tests ────────────────────────────────────────────────────────────────

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

// ─── POST tests ───────────────────────────────────────────────────────────────

describe("deals route POST — initial_status", () => {
  const userId = "user-1";
  // Zod v4 uuid() requires a valid RFC4122 UUID — version digit [1-8], variant [89abAB]
  const inquiryId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } } });
    mockGetUserPlanForUser.mockResolvedValue("pro");
    mockCheckUsageLimit.mockResolvedValue(undefined);
    mockFindProfileByUserId.mockResolvedValue(null);
    mockFindInquiryById.mockResolvedValue(makeInquiry(inquiryId, userId));
    mockBuildDealPayload.mockReturnValue(makeDealPayload());
    mockCreateDeal.mockResolvedValue({ id: "deal-1", status: "Lead", next_action: null, next_action_due_at: null });
  });

  it("defaults to Lead when no initial_status is provided", async () => {
    const res = await POST(postRequest({ inquiry_id: inquiryId }));
    expect(res.status).toBe(200);
    // createDeal receives the payload — status should be "Lead" (buildDealPayload default, not overridden)
    const callArg = mockCreateDeal.mock.calls[0][0] as { status: string };
    expect(callArg.status).toBe("Lead");
  });

  it("persists Replied when initial_status is Replied", async () => {
    const res = await POST(postRequest({ inquiry_id: inquiryId, initial_status: "Replied" }));
    expect(res.status).toBe(200);
    const callArg = mockCreateDeal.mock.calls[0][0] as { status: string };
    expect(callArg.status).toBe("Replied");
  });

  it("returns 400 for an invalid initial_status value", async () => {
    const res = await POST(postRequest({ inquiry_id: inquiryId, initial_status: "Delivered" }));
    expect(res.status).toBe(400);
  });
});
