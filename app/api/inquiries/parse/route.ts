import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { parseService } from "@/services/parse-service";
import { calculateQuote } from "@/services/quote-engine";
import { generateChecks } from "@/services/check-engine";
import { generateReplyDrafts } from "@/services/reply-generator";
import { checkUsageLimit, recordUsageEvent, getUserPlanForUser } from "@/services/usage-guard";
import { getPlanPolicy } from "@/lib/plan-policy";
import { findProfileByUserId } from "@/repositories/creator-profiles-repo";
import { DEFAULT_CREATOR_PROFILE } from "@/services/deal-service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { trackEvent } from "@/lib/analytics";
import { logInfo, logError } from "@/lib/logger";

const requestSchema = z.object({
  raw_text: z.string().min(1, "raw_text must not be empty"),
  source_type: z.enum(["email", "dm", "other"]),
});

export async function POST(req: NextRequest) {
  // Optional auth — unauthenticated callers are treated as free tier
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  const plan = userId ? await getUserPlanForUser(userId) : "free";
  const policy = getPlanPolicy(plan);
  const creator_profile = userId
    ? (await findProfileByUserId(userId)) ?? DEFAULT_CREATOR_PROFILE
    : DEFAULT_CREATOR_PROFILE;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", "Invalid JSON body"),
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", parsed.error.issues[0].message),
      { status: 400 },
    );
  }

  const { raw_text, source_type } = parsed.data;

  // Usage guard — only enforced for authenticated users
  if (userId) {
    try {
      await checkUsageLimit(userId, "PARSE");
    } catch (err) {
      const code = err instanceof Error ? err.message : "PLAN_LIMIT_PARSE_REACHED";
      trackEvent(userId, "paywall_viewed", { action: "PARSE", reason: code, plan });
      return NextResponse.json(
        errorResponse(code, "Monthly parse limit reached. Upgrade to Pro for more."),
        { status: 429 },
      );
    }
  }

  trackEvent(userId ?? "anon", "parse_started", { source_type, plan });

  try {
    logInfo("parse request received", { source_type, length: raw_text.length, plan });

    const { inquiry_id, parsed_json, missing_fields } = await parseService(
      { raw_text, source_type },
      userId,
    );

    if (userId) {
      await recordUsageEvent(userId, "PARSE");
    }

    trackEvent(userId ?? "anon", "parse_succeeded", {
      source_type,
      missing_fields_count: missing_fields.length,
      plan,
    });

    // Quote and checks — always computed deterministically server-side
    const quote_breakdown = calculateQuote({
      creator_profile,
      inquiry: parsed_json,
    });

    const checks = generateChecks(parsed_json);

    trackEvent(userId ?? "anon", "quote_viewed", {
      plan,
      source_type,
      checks_count: checks.length,
    });

    // Reply drafts — plan-gated
    const { strategy, drafts } = generateReplyDrafts({
      parsed_json,
      quote_breakdown,
      missing_fields,
      plan,
    });

    logInfo("parse request completed", {
      inquiry_id,
      source_type,
      check_count: checks.length,
      missing_count: missing_fields.length,
      plan,
      strategy,
    });

    return NextResponse.json(
      successResponse({
        inquiry_id,
        parsed_json,
        // FREE: simplified quote (target + explanation only)
        // PRO:  full breakdown with fee components
        quote_breakdown: policy.full_quote_breakdown
          ? quote_breakdown
          : { target: quote_breakdown.target, explanation: quote_breakdown.explanation },
        // FREE: empty checks list; PRO: full list
        checks: policy.full_checks_list ? checks : [],
        missing_fields,
        reply_drafts: drafts,
        reply_meta: {
          negotiation_ai_available: policy.negotiation_ai_enabled,
        },
      }),
    );
  } catch (err) {
    logError("parse request failed", { error: String(err), source_type, plan });
    trackEvent(userId ?? "anon", "parse_failed", {
      source_type,
      parse_failure_reason: String(err),
      plan,
    });
    return NextResponse.json(
      errorResponse("PARSE_FAILED", "Failed to parse inquiry"),
      { status: 500 },
    );
  }
}
