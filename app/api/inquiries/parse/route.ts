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
import { createAnalyticsTracker, getRequestId } from "@/lib/analytics";
import { logInfo, logError } from "@/lib/logger";
import { captureException } from "@/lib/sentry";
import {
  getParseErrorResponse,
  isParsePipelineError,
  summarizeError,
} from "@/lib/parse-error";

const requestSchema = z.object({
  raw_text: z.string().min(1, "raw_text must not be empty"),
  source_type: z.enum(["email", "dm", "other"]),
});

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  const plan = userId ? await getUserPlanForUser(userId) : "free";
  const policy = getPlanPolicy(plan);

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
  const creator_profile = userId
    ? (await findProfileByUserId(userId)) ?? DEFAULT_CREATOR_PROFILE
    : DEFAULT_CREATOR_PROFILE;
  const analytics = createAnalyticsTracker({
    user_id: userId ?? "anon",
    plan,
    request_id: requestId,
    source_type,
  });

  if (userId) {
    try {
      await checkUsageLimit(userId, "PARSE");
    } catch (err) {
      const code = err instanceof Error ? err.message : "PLAN_LIMIT_PARSE_REACHED";
      analytics.track("paywall_viewed", { action: "PARSE", reason: code });
      return NextResponse.json(
        errorResponse(code, "Monthly parse limit reached. Upgrade to Pro for more."),
        { status: 429 },
      );
    }
  }

  analytics.track("parse_started");

  try {
    logInfo("parse request received", { source_type, length: raw_text.length, plan });

    const { inquiry_id, parsed_json, missing_fields } = await parseService(
      { raw_text, source_type },
      userId,
    );

    if (userId) {
      await recordUsageEvent(userId, "PARSE");
    }

    analytics.track("parse_succeeded", {
      missing_fields_count: missing_fields.length,
    });

    const quote_breakdown = calculateQuote({
      creator_profile,
      inquiry: parsed_json,
    });

    const checks = generateChecks(parsed_json);

    analytics.track("quote_viewed", {
      checks_count: checks.length,
    });

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
        quote_breakdown: policy.full_quote_breakdown
          ? quote_breakdown
          : { target: quote_breakdown.target, explanation: quote_breakdown.explanation },
        checks: policy.full_checks_list ? checks : [],
        missing_fields,
        reply_drafts: drafts,
        reply_meta: {
          negotiation_ai_available: policy.negotiation_ai_enabled,
        },
      }),
    );
  } catch (err) {
    const details = isParsePipelineError(err)
      ? {
          code: err.code,
          ...err.diagnostics,
        }
      : {
          code: "PARSE_FAILED" as const,
          route: "parse" as const,
          source_type,
          ...summarizeError(err),
        };
    const parseErrorCode = details.code;
    const { status, message } = getParseErrorResponse(parseErrorCode);
    const provider = "provider" in details ? details.provider : undefined;
    const model = "model" in details ? details.model : undefined;

    logError("parse request failed", { source_type, plan, ...details });
    captureException(err, { route: "inquiries/parse", source_type, plan });
    analytics.track("parse_failed", {
      parse_failure_code: parseErrorCode,
      provider,
      model,
    });
    return NextResponse.json(
      errorResponse(parseErrorCode, message),
      { status },
    );
  }
}
