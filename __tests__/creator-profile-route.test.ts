import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();
const mockFindProfileByUserId = vi.fn();
const mockUpsertProfile = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

vi.mock("@/repositories/creator-profiles-repo", () => ({
  findProfileByUserId: (...args: unknown[]) => mockFindProfileByUserId(...args),
  upsertProfile: (...args: unknown[]) => mockUpsertProfile(...args),
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

import { GET, POST, PUT } from "@/app/api/creator-profile/route";

describe("creator-profile route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await GET(new NextRequest("http://localhost/api/creator-profile"));
    expect(response.status).toBe(401);
  });

  it("returns profile on GET", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFindProfileByUserId.mockResolvedValue({ user_id: "user-1", primary_platform: "instagram" });

    const response = await GET(new NextRequest("http://localhost/api/creator-profile"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.profile.user_id).toBe("user-1");
  });

  it("POST validates and saves the expanded profile fields", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockUpsertProfile.mockResolvedValue({ user_id: "user-1", currency: "KRW" });

    const response = await POST(new NextRequest("http://localhost/api/creator-profile", {
      method: "POST",
      body: JSON.stringify({
        followers_band: "50k_100k",
        avg_views_band: "20k_50k",
        niche: "lifestyle",
        floor_rate: 300000,
        primary_platform: "instagram",
        geo_region: "KR",
        currency: "KRW",
      }),
    }));

    expect(response.status).toBe(200);
    expect(mockUpsertProfile).toHaveBeenCalled();
  });

  it("keeps PUT as backward-compatible alias", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockUpsertProfile.mockResolvedValue({ user_id: "user-1", currency: "KRW" });

    const response = await PUT(new NextRequest("http://localhost/api/creator-profile", {
      method: "PUT",
      body: JSON.stringify({
        followers_band: "50k_100k",
        avg_views_band: "20k_50k",
        niche: "lifestyle",
        floor_rate: 300000,
        primary_platform: "instagram",
        geo_region: "KR",
        currency: "KRW",
      }),
    }));

    expect(response.status).toBe(200);
  });
});
