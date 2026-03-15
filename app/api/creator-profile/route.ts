import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { findProfileByUserId, upsertProfile } from "@/repositories/creator-profiles-repo";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAnalyticsTracker, getRequestId } from "@/lib/analytics";
import { logInfo, logError } from "@/lib/logger";

const profileSchema = z.object({
  followers_band: z.enum(["under_10k", "10k_50k", "50k_100k", "100k_500k", "over_500k"]),
  avg_views_band: z.enum(["under_5k", "5k_20k", "20k_50k", "over_50k"]),
  niche: z.string().min(1).max(100),
  floor_rate: z.number().int().min(0),
  primary_platform: z.string().min(1).max(50),
  geo_region: z.string().min(1).max(50),
  currency: z.string().min(1).max(10),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
  }

  const analytics = createAnalyticsTracker({
    user_id: user.id,
    request_id: getRequestId(req),
  });

  try {
    const profile = await findProfileByUserId(user.id);
    analytics.track("profile_viewed");
    return NextResponse.json(successResponse({ profile }));
  } catch (err) {
    logError("creator profile fetch failed", { user_id: user.id, error: String(err) });
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch creator profile"),
      { status: 500 },
    );
  }
}

async function saveProfile(req: NextRequest) {
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

  const analytics = createAnalyticsTracker({
    user_id: user.id,
    request_id: getRequestId(req),
  });

  try {
    const existingProfile = await findProfileByUserId(user.id);
    const profile = await upsertProfile(user.id, validated.data);

    logInfo("creator profile saved", { user_id: user.id });
    if (!existingProfile) {
      analytics.track("onboarding_completed");
    }
    analytics.track("profile_saved", {
      followers_band: profile.followers_band,
      niche: profile.niche,
      primary_platform: profile.primary_platform,
      geo_region: profile.geo_region,
      currency: profile.currency,
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

export async function POST(req: NextRequest) {
  return saveProfile(req);
}

export async function PUT(req: NextRequest) {
  return saveProfile(req);
}
