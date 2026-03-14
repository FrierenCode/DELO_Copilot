import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { parseService } from "@/services/parse-service";
import { buildDealPayload, DEFAULT_CREATOR_PROFILE } from "@/services/deal-service";
import { computeAlerts } from "@/services/alert-engine";
import { checkUsageLimit, recordUsageEvent, getUserPlanForUser } from "@/services/usage-guard";
import { findInquiryById } from "@/repositories/inquiries-repo";
import { findProfileByUserId } from "@/repositories/creator-profiles-repo";
import { createDeal, findDealsByUserId } from "@/repositories/deals-repo";
import { createDealChecks } from "@/repositories/deal-checks-repo";
import { createReplyDrafts } from "@/repositories/reply-drafts-repo";
import { trackEvent } from "@/lib/analytics";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logInfo, logError } from "@/lib/logger";
import { inquirySchema } from "@/schemas/inquiry.schema";
import type { ParseResult } from "@/types/inquiry";

// ------------------------------------------------------------------
// Request schema
// Preferred: inquiry_id (reuse canonical parsed data, no re-parse cost)
// Fallback:  raw_text + source_type (legacy path, triggers parse)
// ------------------------------------------------------------------
const postSchema = z
  .object({
    inquiry_id: z.string().uuid().optional(),
    raw_text: z.string().min(1).optional(),
    source_type: z.enum(["email", "dm", "other"]).optional(),
    parsed_json: z.record(z.string(), z.unknown()).optional(),
    selected_reply_tone: z.enum(["polite", "quick", "negotiation"]).optional(),
  })
  .refine(
    (d) => d.inquiry_id || (d.raw_text && d.source_type),
    "Provide either inquiry_id or raw_text + source_type",
  );

// ------------------------------------------------------------------
// GET /api/deals — dashboard
// ------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
  }

  const plan = await getUserPlanForUser(user.id);

  try {
    const deals = await findDealsByUserId(user.id);

    // Alerts are a Pro-only feature
    let alertsAllowed = false;
    try {
      await checkUsageLimit(user.id, "VIEW_ALERTS");
      alertsAllowed = true;
    } catch {
      alertsAllowed = false;
    }

    const alerts = alertsAllowed
      ? computeAlerts(deals)
      : { overdue_followups: 0, payment_overdue: 0, deadline_soon: 0, unresolved_checks: 0 };

    logInfo("deals dashboard fetched", {
      user_id: user.id,
      deal_count: deals.length,
      alerts_allowed: alertsAllowed,
      plan,
    });

    trackEvent(user.id, "dashboard_viewed", { plan, deal_count: deals.length });

    return NextResponse.json(successResponse({ alerts, deals }));
  } catch (err) {
    logError("deals dashboard failed", { user_id: user.id, error: String(err) });
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to load deals"),
      { status: 500 },
    );
  }
}

// ------------------------------------------------------------------
// POST /api/deals — save deal
// ------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
  }

  const plan = await getUserPlanForUser(user.id);
  const creator_profile =
    (await findProfileByUserId(user.id)) ?? DEFAULT_CREATOR_PROFILE;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", "Invalid JSON body"),
      { status: 400 },
    );
  }

  const validated = postSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", validated.error.issues[0].message),
      { status: 400 },
    );
  }

  const {
    inquiry_id: requestedInquiryId,
    raw_text,
    source_type,
    parsed_json: clientParsedJson,
    selected_reply_tone,
  } = validated.data;

  // Usage guard — check before doing any work
  try {
    await checkUsageLimit(user.id, "SAVE_DEAL");
  } catch (err) {
    const code = err instanceof Error ? err.message : "PLAN_LIMIT_DEAL_SAVE_REACHED";
    trackEvent(user.id, "paywall_viewed", { action: "SAVE_DEAL", reason: code, plan });
    return NextResponse.json(
      errorResponse(code, "Deal save limit reached. Upgrade to Pro for more."),
      { status: 402 },
    );
  }

  trackEvent(user.id, "deal_save_clicked", { source_type: source_type ?? "inquiry_id", plan });

  // ------------------------------------------------------------------
  // Resolve parse_result from inquiry_id (preferred) or raw_text (fallback)
  // ------------------------------------------------------------------
  let parse_result: ParseResult;
  let resolved_inquiry_id: string | undefined;

  if (requestedInquiryId) {
    // Primary path: reuse canonical inquiry data — no re-parse cost
    const inquiry = await findInquiryById(requestedInquiryId);

    if (!inquiry) {
      return NextResponse.json(
        errorResponse("INQUIRY_NOT_FOUND", "Inquiry not found"),
        { status: 404 },
      );
    }

    // Ownership check: anonymous inquiries (user_id = null) are claimable;
    // user-owned inquiries must match the requester
    if (inquiry.user_id !== null && inquiry.user_id !== user.id) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "You do not own this inquiry"),
        { status: 403 },
      );
    }

    parse_result = {
      parsed_json: inquiry.parsed_json,
      missing_fields: inquiry.missing_fields,
    };
    resolved_inquiry_id = inquiry.id;

    logInfo("deal save: inquiry resolved", {
      user_id: user.id,
      inquiry_id: inquiry.id,
    });
  } else {
    // Fallback path: run full parse pipeline (counts against parse quota)
    try {
      await checkUsageLimit(user.id, "PARSE");
    } catch (err) {
      const code = err instanceof Error ? err.message : "PLAN_LIMIT_PARSE_REACHED";
      trackEvent(user.id, "paywall_viewed", { action: "PARSE", reason: code, plan });
      return NextResponse.json(
        errorResponse(code, "Monthly parse limit reached"),
        { status: 429 },
      );
    }

    trackEvent(user.id, "parse_started", { source_type, plan });

    try {
      if (clientParsedJson) {
        // Validate client-supplied parsed_json — never trust raw values
        const validated_json = inquirySchema.parse(clientParsedJson);
        const MISSING_SENTINEL = "not specified";
        const REQUIRED = [
          "brand_name", "contact_name", "platform_requested", "deliverables",
          "timeline", "compensation_type", "budget_mentioned", "usage_rights",
          "exclusivity", "revisions", "payment_terms",
        ] as const;
        parse_result = {
          parsed_json: validated_json,
          missing_fields: REQUIRED.filter(
            (f) => validated_json[f].toLowerCase().trim() === MISSING_SENTINEL,
          ),
        };
      } else {
        const result = await parseService(
          { raw_text: raw_text!, source_type: source_type! },
          user.id,
        );
        parse_result = { parsed_json: result.parsed_json, missing_fields: result.missing_fields };
        resolved_inquiry_id = result.inquiry_id;
      }

      await recordUsageEvent(user.id, "PARSE");
      trackEvent(user.id, "parse_succeeded", {
        source_type,
        missing_fields_count: parse_result.missing_fields.length,
        plan,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "PARSE_FAILED";
      logError("deal save: parse failed", { user_id: user.id, reason });
      trackEvent(user.id, "parse_failed", { source_type, parse_failure_reason: reason, plan });
      return NextResponse.json(
        errorResponse("PARSE_FAILED", "Failed to parse inquiry"),
        { status: 422 },
      );
    }
  }

  // ------------------------------------------------------------------
  // Build deal payload — all values computed server-side
  // ------------------------------------------------------------------
  let payload: ReturnType<typeof buildDealPayload>;

  try {
    payload = buildDealPayload({
      user_id: user.id,
      inquiry_id: resolved_inquiry_id,
      parse_result,
      source_type: source_type ?? "other",
      selected_reply_tone,
      plan,
      creator_profile,
    });
  } catch (err) {
    logError("deal save: payload build failed", { user_id: user.id, error: String(err) });
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to build deal"),
      { status: 500 },
    );
  }

  // ------------------------------------------------------------------
  // Persist deal → checks → drafts
  // ------------------------------------------------------------------
  try {
    const deal = await createDeal(payload.deal_insert);

    await Promise.all([
      createDealChecks(payload.check_inserts.map((c) => ({ ...c, deal_id: deal.id }))),
      createReplyDrafts(payload.draft_inserts.map((d) => ({ ...d, deal_id: deal.id }))),
    ]);

    await recordUsageEvent(user.id, "SAVE_DEAL");

    logInfo("deal saved", {
      user_id: user.id,
      deal_id: deal.id,
      inquiry_id: resolved_inquiry_id,
      status: deal.status,
      checks_count: payload.check_inserts.length,
      plan,
    });

    trackEvent(user.id, "deal_saved", {
      source_type: source_type ?? "inquiry_id",
      checks_count: payload.check_inserts.length,
      missing_fields_count: parse_result.missing_fields.length,
      plan,
    });

    return NextResponse.json(
      successResponse({
        deal_id: deal.id,
        inquiry_id: resolved_inquiry_id ?? null,
        status: deal.status,
        next_action: deal.next_action,
        next_action_due_at: deal.next_action_due_at,
      }),
    );
  } catch (err) {
    logError("deal save: persistence failed", { user_id: user.id, error: String(err) });
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to save deal"),
      { status: 500 },
    );
  }
}
