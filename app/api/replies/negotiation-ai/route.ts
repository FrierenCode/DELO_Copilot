import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { getLlmClient } from "@/lib/llm/client-factory";
import { MODEL_POLICY } from "@/lib/llm/registry";
import { buildNegotiationReplyPrompt } from "@/lib/llm/prompts/negotiation-reply.prompt";
import { renderNegotiationFallbackReply } from "@/services/reply-template-service";
import { checkLlmBudget, recordLlmCall } from "@/services/llm-budget-guard";
import { successResponse, errorResponse } from "@/lib/api-response";
import { trackEvent } from "@/lib/analytics";
import { logInfo, logError } from "@/lib/logger";

const requestSchema = z.object({
  inquiry_id: z.string().optional(),
  parsed_json: z.object({
    brand_name: z.string(),
    contact_name: z.string(),
    platform_requested: z.string(),
    deliverables: z.string(),
    timeline: z.string(),
    compensation_type: z.string(),
    budget_mentioned: z.string(),
    usage_rights: z.string(),
    exclusivity: z.string(),
    revisions: z.string(),
    payment_terms: z.string(),
    contact_channel: z.string().optional().default(""),
  }),
  quote_breakdown: z.object({
    target: z.number(),
  }),
  missing_fields: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(errorResponse("Invalid JSON body"), { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"), {
      status: 400,
    });
  }

  const { parsed_json, quote_breakdown, missing_fields } = parsed.data;

  // Budget guard — prevent runaway LLM costs
  const budget = await checkLlmBudget();
  if (!budget.allowed) {
    logInfo("negotiation ai blocked by budget guard");
    trackEvent("system", "budget_guard_triggered", { endpoint: "negotiation-ai" });

    // Graceful fallback to template
    const fallback = renderNegotiationFallbackReply({
      brand_name: parsed_json.brand_name,
      platform_requested: parsed_json.platform_requested,
      deliverables: parsed_json.deliverables,
      missing_fields,
      quote_target: quote_breakdown.target,
      contact_name: parsed_json.contact_name,
      compensation_type: parsed_json.compensation_type,
      timeline: parsed_json.timeline,
      usage_rights: parsed_json.usage_rights,
      exclusivity: parsed_json.exclusivity,
    });

    return NextResponse.json(
      successResponse({ negotiation_reply: fallback, fallback_used: true }),
    );
  }

  const model = MODEL_POLICY.reply_negotiation.primary;
  const start = Date.now();

  try {
    const client = getLlmClient(model);
    const prompt = buildNegotiationReplyPrompt({
      brand_name: parsed_json.brand_name,
      platform_requested: parsed_json.platform_requested,
      deliverables: parsed_json.deliverables,
      missing_fields,
      quote_target: quote_breakdown.target,
      contact_name: parsed_json.contact_name,
      compensation_type: parsed_json.compensation_type,
      timeline: parsed_json.timeline,
      usage_rights: parsed_json.usage_rights,
      exclusivity: parsed_json.exclusivity,
    });

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

    if (!text) {
      throw new Error("EMPTY_RESPONSE");
    }

    // Record LLM call for budget tracking
    recordLlmCall("reply_negotiation");

    logInfo("negotiation ai reply generated", { model, latency_ms });
    trackEvent("system", "negotiation_ai_requested", {
      model,
      provider: model.startsWith("gpt") ? "openai" : "anthropic",
      latency_ms,
      fallback_used: false,
    });

    return NextResponse.json(
      successResponse({ negotiation_reply: text, fallback_used: false }),
    );
  } catch (err) {
    const latency_ms = Date.now() - start;
    logError("negotiation ai failed, using template fallback", {
      model,
      latency_ms,
      reason: String(err),
    });

    trackEvent("system", "fallback_used", {
      model,
      provider: model.startsWith("gpt") ? "openai" : "anthropic",
      latency_ms,
      fallback_used: true,
      endpoint: "negotiation-ai",
    });

    const fallback = renderNegotiationFallbackReply({
      brand_name: parsed_json.brand_name,
      platform_requested: parsed_json.platform_requested,
      deliverables: parsed_json.deliverables,
      missing_fields,
      quote_target: quote_breakdown.target,
      contact_name: parsed_json.contact_name,
      compensation_type: parsed_json.compensation_type,
      timeline: parsed_json.timeline,
      usage_rights: parsed_json.usage_rights,
      exclusivity: parsed_json.exclusivity,
    });

    return NextResponse.json(
      successResponse({ negotiation_reply: fallback, fallback_used: true }),
    );
  }
}
