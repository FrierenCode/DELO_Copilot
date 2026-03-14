import { describe, it, expect, vi, beforeEach } from "vitest";

const maybeSingle = vi.fn();
const single = vi.fn();
const select = vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle })) }));
const upsert = vi.fn(() => ({ select: () => ({ single }) }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select,
      upsert,
    }),
  }),
}));

import { findProfileByUserId, upsertProfile } from "@/repositories/creator-profiles-repo";

describe("creator-profiles-repo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("finds a profile by user id", async () => {
    maybeSingle.mockResolvedValue({
      data: { user_id: "user-1", followers_band: "50k_100k" },
      error: null,
    });

    const profile = await findProfileByUserId("user-1");
    expect(profile?.user_id).toBe("user-1");
  });

  it("upserts the expanded PRD fields", async () => {
    single.mockResolvedValue({
      data: {
        user_id: "user-1",
        followers_band: "50k_100k",
        avg_views_band: "20k_50k",
        niche: "lifestyle",
        floor_rate: 300000,
        primary_platform: "instagram",
        geo_region: "KR",
        currency: "KRW",
      },
      error: null,
    });

    await upsertProfile("user-1", {
      followers_band: "50k_100k",
      avg_views_band: "20k_50k",
      niche: "lifestyle",
      floor_rate: 300000,
      primary_platform: "instagram",
      geo_region: "KR",
      currency: "KRW",
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        primary_platform: "instagram",
        geo_region: "KR",
        currency: "KRW",
      }),
      { onConflict: "user_id" },
    );
  });
});
