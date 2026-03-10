import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { parseService } from "@/services/parse-service";
import { buildDealPayload } from "@/services/deal-service";
import { computeAlerts } from "@/services/alert-engine";
import { checkUsageLimit, recordUsageEvent } from "@/services/usage-guard";
import { createDeal, findDealsByUserId } from "@/repositories/deals-repo";
import { createDealChecks } from "@/repositories/deal-checks-repo";
import { createReplyDrafts } from "@/repositories/reply-drafts-repo";
import { trackEvent } from "@/lib/analytics";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logInfo, logError } from "@/lib/logger";
import { inquirySchema } from "@/schemas/inquiry.schema";

// ------------------------------------------------------------------
// Request schema
// ------------------------------------------------------------------
const postSchema = z.object({
  raw_text: z.string().min(1, "raw_text must not be empty"),
  source_type: z.enum(["email", "dm", "other"]),
  parsed_json: z.record(z.string(), z.unknown()).optional(),
  selected_reply_tone: z.enum(["polite", "quick", "negotiation"]).optional(),
});

// ------------------------------------------------------------------
// GET /api/deals — dashboard
// ------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  try {
    // Usage guard — alerts are a Pro feature
    let alertsAllowed = true;
    try {
      await checkUsageLimit(user.id, "VIEW_ALERTS");
    } catch {
      alertsAllowed = false;
    }

    const deals = await findDealsByUserId(user.id);

    const alerts = alertsAllowed
      ? computeAlerts(deals)
      : { overdue_followups: 0, payment_overdue: 0, deadline_soon: 0, unresolved_checks: 0 };

    logInfo("deals dashboard fetched", {
      user_id: user.id,
      deal_count: deals.length,
      alerts_allowed: alertsAllowed,
    });

    return NextResponse.json(successResponse({ alerts, deals }));
  } catch (err) {
    logError("deals dashboard failed", { user_id: user.id, error: String(err) });
    return NextResponse.json(errorResponse("Failed to load deals"), { status: 500 });
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
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(errorResponse("Invalid JSON body"), { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const { raw_text, source_type, parsed_json: clientParsedJson } = parsed.data;

  // Usage guard — check before doing any work
  try {
    await checkUsageLimit(user.id, "SAVE_DEAL");
  } catch (err) {
    const code = err instanceof Error ? err.message : "USAGE_LIMIT_EXCEEDED";
    trackEvent(user.id, "paywall_viewed", { action: "SAVE_DEAL", reason: code });
    return NextResponse.json(errorResponse(code), { status: 402 });
  }

  try {
    await checkUsageLimit(user.id, "PARSE");
  } catch (err) {
    const code = err instanceof Error ? err.message : "USAGE_LIMIT_EXCEEDED";
    trackEvent(user.id, "paywall_viewed", { action: "PARSE", reason: code });
    return NextResponse.json(errorResponse(code), { status: 402 });
  }

  trackEvent(user.id, "deal_save_clicked", { source_type });

  // ------------------------------------------------------------------
  // 1. Parse — use provided parsed_json if valid, else run full pipeline
  // ------------------------------------------------------------------
  let parse_result: Awaited<ReturnType<typeof parseService>>;

  trackEvent(user.id, "parse_started", { source_type });

  try {
    if (clientParsedJson) {
      // Validate client-supplied parsed_json — never trust raw values
      const validated = inquirySchema.parse(clientParsedJson);
      const MISSING_SENTINEL = "not specified";
      const REQUIRED_FIELDS = [
        "brand_name", "contact_name", "platform_requested", "deliverables",
        "timeline", "compensation_type", "budget_mentioned", "usage_rights",
        "exclusivity", "revisions", "payment_terms",
      ] as const;
      const missing_fields = REQUIRED_FIELDS.filter(
        (f) => validated[f].toLowerCase().trim() === MISSING_SENTINEL,
      );
      parse_result = { parsed_json: validated, missing_fields };
    } else {
      parse_result = await parseService({ raw_text, source_type });
    }

    await recordUsageEvent(user.id, "PARSE");
    trackEvent(user.id, "parse_succeeded", {
      source_type,
      missing_fields_count: parse_result.missing_fields.length,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "PARSE_FAILED";
    logError("deal save: parse failed", { user_id: user.id, reason });
    trackEvent(user.id, "parse_failed", { source_type, parse_failure_reason: reason });
    return NextResponse.json(errorResponse("Failed to parse inquiry"), { status: 422 });
  }

  // ------------------------------------------------------------------
  // 2. Build deal payload (quote + checks + reply — all server-side)
  // ------------------------------------------------------------------
  let payload: Awaited<ReturnType<typeof buildDealPayload>>;

  try {
    payload = await buildDealPayload({
      user_id: user.id,
      parse_result,
      source_type,
    });

    trackEvent(user.id, "reply_generated", {
      source_type,
      missing_fields_count: parse_result.missing_fields.length,
      checks_count: payload.check_inserts.length,
    });
  } catch (err) {
    logError("deal save: payload build failed", { user_id: user.id, error: String(err) });
    return NextResponse.json(errorResponse("Failed to build deal"), { status: 500 });
  }

  // ------------------------------------------------------------------
  // 3. Persist deal → checks → drafts
  // ------------------------------------------------------------------
  try {
    const deal = await createDeal(payload.deal_insert);

    await Promise.all([
      createDealChecks(
        payload.check_inserts.map((c) => ({ ...c, deal_id: deal.id })),
      ),
      createReplyDrafts(
        payload.draft_inserts.map((d) => ({ ...d, deal_id: deal.id })),
      ),
    ]);

    await recordUsageEvent(user.id, "SAVE_DEAL");

    logInfo("deal saved", {
      user_id: user.id,
      deal_id: deal.id,
      status: deal.status,
      checks_count: payload.check_inserts.length,
    });

    trackEvent(user.id, "deal_saved", {
      source_type,
      checks_count: payload.check_inserts.length,
      missing_fields_count: parse_result.missing_fields.length,
    });

    return NextResponse.json(
      successResponse({
        deal_id: deal.id,
        status: deal.status,
        next_action: deal.next_action,
        next_action_due_at: deal.next_action_due_at,
      }),
    );
  } catch (err) {
    logError("deal save: persistence failed", { user_id: user.id, error: String(err) });
    return NextResponse.json(errorResponse("Failed to save deal"), { status: 500 });
  }
}
