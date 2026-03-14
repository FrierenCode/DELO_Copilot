import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { getLlmClient } from "@/lib/llm/client-factory";
import { MODEL_POLICY } from "@/lib/llm/registry";
import { buildNegotiationReplyPrompt } from "@/lib/llm/prompts/negotiation-reply.prompt";
import { renderNegotiationFallbackReply } from "@/services/reply-template-service";
import { checkUsageLimit, recordUsageEvent, getUserPlanForUser } from "@/services/usage-guard";
import { checkLlmBudget, recordLlmCall } from "@/services/llm-budget-guard";
import { findInquiryById } from "@/repositories/inquiries-repo";
import { findDealById } from "@/repositories/deals-repo";
import { createReplyDrafts } from "@/repositories/reply-drafts-repo";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAnalyticsTracker, getRequestId } from "@/lib/analytics";
import { logInfo, logError } from "@/lib/logger";
import type { ReplyTemplateInput } from "@/types/reply";

const requestSchema = z.object({
  inquiry_id: z.string().uuid(),
  deal_id: z.string().uuid().optional(),
  quote_target: z.number().positive().optional(),
  missing_fields: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      errorResponse("UNAUTHORIZED", "Authentication required"),
      { status: 401 },
    );
  }

  const plan = await getUserPlanForUser(user.id);
  const analytics = createAnalyticsTracker({
    user_id: user.id,
    plan,
    request_id: requestId,
  });

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

  const { inquiry_id, deal_id, quote_target, missing_fields } = parsed.data;

  try {
    await checkUsageLimit(user.id, "NEGOTIATION_AI");
  } catch (err) {
    const code = err instanceof Error ? err.message : "FEATURE_NOT_AVAILABLE_ON_FREE";
    analytics.track("paywall_viewed", { action: "NEGOTIATION_AI", reason: code });
    return NextResponse.json(
      errorResponse(
        code,
        code === "FEATURE_NOT_AVAILABLE_ON_FREE"
          ? "Negotiation AI is a Pro feature. Upgrade to access it."
          : "Monthly negotiation AI limit reached.",
      ),
      { status: 402 },
    );
  }

  const inquiry = await findInquiryById(inquiry_id);
  if (!inquiry) {
    return NextResponse.json(
      errorResponse("INQUIRY_NOT_FOUND", "Inquiry not found"),
      { status: 404 },
    );
  }

  if (inquiry.user_id !== null && inquiry.user_id !== user.id) {
    return NextResponse.json(
      errorResponse("UNAUTHORIZED", "You do not own this inquiry"),
      { status: 403 },
    );
  }

  if (deal_id) {
    const deal = await findDealById(deal_id);
    if (!deal || deal.user_id !== user.id) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "You do not own this deal"),
        { status: 403 },
      );
    }
  }

  const budget = await checkLlmBudget();
  if (!budget.allowed) {
    logInfo("negotiation ai blocked by budget guard", { user_id: user.id });
    analytics.track("budget_guard_triggered", { endpoint: "negotiation-ai" });
    return NextResponse.json(
      errorResponse(
        "DAILY_BUDGET_GUARD_TRIGGERED",
        "Service temporarily throttled. Please try again later.",
      ),
      { status: 503 },
    );
  }

  const { parsed_json } = inquiry;
  const effectiveQuoteTarget = quote_target ?? inquiry.quote_breakdown_json?.target ?? 0;
  const templateInput: ReplyTemplateInput = {
    brand_name: parsed_json.brand_name,
    platform_requested: parsed_json.platform_requested,
    deliverables: parsed_json.deliverables,
    missing_fields,
    quote_target: effectiveQuoteTarget,
    contact_name: parsed_json.contact_name,
    compensation_type: parsed_json.compensation_type,
    timeline: parsed_json.timeline,
    usage_rights: parsed_json.usage_rights,
    exclusivity: parsed_json.exclusivity,
  };

  const model = MODEL_POLICY.reply_negotiation.primary;
  const provider = model.startsWith("gpt") ? "openai" : "anthropic";
  const start = Date.now();

  // Track intent before LLM call
  analytics.track("negotiation_ai_requested", { model, provider });

  try {
    const client = getLlmClient(model);
    const prompt = buildNegotiationReplyPrompt(templateInput);

    const response = await client.generate({
      task: "reply_negotiation",
      model,
      system: prompt.system,
      input: prompt.user,
      temperature: 0.4,
      maxOutputTokens: 300,
    });

    const text = (response.text ?? "").trim();
    const latency_ms = Date.now() - start;

    if (!text) throw new Error("EMPTY_RESPONSE");

    recordLlmCall("reply_negotiation");
    await recordUsageEvent(user.id, "NEGOTIATION_AI");

    logInfo("negotiation ai reply generated", {
      user_id: user.id,
      inquiry_id,
      model,
      latency_ms,
    });

    analytics.track("negotiation_ai_succeeded", { model, provider, latency_ms });

    if (deal_id) {
      await createReplyDrafts([{ deal_id, tone: "negotiation", body: text }]);
    }

    return NextResponse.json(
      successResponse({
        negotiation_reply: text,
        fallback_used: false,
      }),
    );
  } catch (err) {
    const latency_ms = Date.now() - start;
    logError("negotiation ai failed, using template fallback", {
      user_id: user.id,
      inquiry_id,
      model,
      latency_ms,
      reason: String(err),
    });

    analytics.track("negotiation_ai_failed", {
      model,
      provider,
      latency_ms,
      endpoint: "negotiation-ai",
    });

    const fallback = renderNegotiationFallbackReply(templateInput);
    return NextResponse.json(
      successResponse({ negotiation_reply: fallback, fallback_used: true }),
    );
  }
}
