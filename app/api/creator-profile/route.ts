import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { findProfileByUserId, upsertProfile } from "@/repositories/creator-profiles-repo";
import { successResponse, errorResponse } from "@/lib/api-response";
import { trackEvent } from "@/lib/analytics";
import { logInfo, logError } from "@/lib/logger";

const profileSchema = z.object({
  followers_band: z.enum(["under_10k", "10k_50k", "50k_100k", "100k_500k", "over_500k"]),
  avg_views_band: z.enum(["under_5k", "5k_20k", "20k_50k", "over_50k"]),
  niche: z.string().min(1).max(100),
  floor_rate: z.number().int().min(0),
});

// ------------------------------------------------------------------
// GET /api/creator-profile — return profile or null (no 404)
// ------------------------------------------------------------------
export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
  }

  try {
    const profile = await findProfileByUserId(user.id);
    return NextResponse.json(successResponse({ profile }));
  } catch (err) {
    logError("creator profile fetch failed", { user_id: user.id, error: String(err) });
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch creator profile"),
      { status: 500 },
    );
  }
}

// ------------------------------------------------------------------
// PUT /api/creator-profile — create or update profile
// ------------------------------------------------------------------
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", "Invalid JSON body"),
      { status: 400 },
    );
  }

  const validated = profileSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", validated.error.issues[0].message),
      { status: 400 },
    );
  }

  try {
    const profile = await upsertProfile(user.id, validated.data);

    logInfo("creator profile saved", { user_id: user.id });
    trackEvent(user.id, "profile_saved", {
      followers_band: profile.followers_band,
      niche: profile.niche,
    });

    return NextResponse.json(successResponse({ profile }));
  } catch (err) {
    logError("creator profile save failed", { user_id: user.id, error: String(err) });
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to save creator profile"),
      { status: 500 },
    );
  }
}
