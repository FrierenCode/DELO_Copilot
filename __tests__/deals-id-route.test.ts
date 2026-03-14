import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();
const mockFindDealById = vi.fn();
const mockFindChecksByDealId = vi.fn();
const mockFindDraftsByDealId = vi.fn();
const mockFindLogsByDealId = vi.fn();
const mockUpdateDeal = vi.fn();
const mockCreateStatusLog = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}));

vi.mock("@/repositories/deals-repo", () => ({
  findDealById: (...args: unknown[]) => mockFindDealById(...args),
  updateDeal: (...args: unknown[]) => mockUpdateDeal(...args),
}));

vi.mock("@/repositories/deal-checks-repo", () => ({
  findChecksByDealId: (...args: unknown[]) => mockFindChecksByDealId(...args),
}));

vi.mock("@/repositories/reply-drafts-repo", () => ({
  findDraftsByDealId: (...args: unknown[]) => mockFindDraftsByDealId(...args),
}));

vi.mock("@/repositories/deal-status-log-repo", () => ({
  findLogsByDealId: (...args: unknown[]) => mockFindLogsByDealId(...args),
  createStatusLog: (...args: unknown[]) => mockCreateStatusLog(...args),
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

import { GET, PATCH } from "@/app/api/deals/[id]/route";

const deal = {
  id: "deal-1",
  user_id: "user-1",
  brand_name: "Acme",
  contact_name: "Jane",
  contact_channel: "email",
  platform_requested: "instagram",
  deliverables_summary: "1 reel",
  budget_mentioned: "500000",
  quote_floor: 300000,
  quote_target: 500000,
  quote_premium: 750000,
  quote_breakdown_json: {
    base_fee: 500000,
    usage_rights_fee: 0,
    exclusivity_fee: 0,
    rush_fee: 0,
    floor: 300000,
    target: 500000,
    premium: 750000,
    explanation: "test",
  },
  next_action: "Follow up",
  next_action_due_at: new Date().toISOString(),
  followup_needed: false,
  unresolved_checks_count: 0,
  status: "Lead" as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("deals/:id route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await GET(new NextRequest("http://localhost/api/deals/deal-1"), {
      params: Promise.resolve({ id: "deal-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("GET returns 403 for non-owner", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-2" } } });
    mockFindDealById.mockResolvedValue(deal);

    const response = await GET(new NextRequest("http://localhost/api/deals/deal-1"), {
      params: Promise.resolve({ id: "deal-1" }),
    });
    expect(response.status).toBe(403);
  });

  it("GET returns deal with related records for owner", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFindDealById.mockResolvedValue(deal);
    mockFindChecksByDealId.mockResolvedValue([]);
    mockFindDraftsByDealId.mockResolvedValue([]);
    mockFindLogsByDealId.mockResolvedValue([]);

    const response = await GET(new NextRequest("http://localhost/api/deals/deal-1"), {
      params: Promise.resolve({ id: "deal-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.deal.id).toBe("deal-1");
  });

  it("PATCH rejects invalid status transitions", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFindDealById.mockResolvedValue(deal);

    const response = await PATCH(new NextRequest("http://localhost/api/deals/deal-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "Paid" }),
    }), {
      params: Promise.resolve({ id: "deal-1" }),
    });

    expect(response.status).toBe(422);
  });

  it("PATCH updates owner deal and writes status log", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFindDealById.mockResolvedValue(deal);
    mockUpdateDeal.mockResolvedValue({ ...deal, status: "Replied" });

    const response = await PATCH(new NextRequest("http://localhost/api/deals/deal-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "Replied" }),
    }), {
      params: Promise.resolve({ id: "deal-1" }),
    });

    expect(response.status).toBe(200);
    expect(mockCreateStatusLog).toHaveBeenCalledWith({
      deal_id: "deal-1",
      from_status: "Lead",
      to_status: "Replied",
    });
  });
});
