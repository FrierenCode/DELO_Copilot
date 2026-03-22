import "server-only";

import type { InquiryData } from "@/types/inquiry";
import type { ReplyGenerationResult, ReplyTemplateInput } from "@/types/reply";
import type { QuoteResult } from "@/services/quote-engine";
import type { PlanTier } from "@/lib/plan-policy";
import { getPlanPolicy } from "@/lib/plan-policy";
import { chooseReplyStrategy } from "@/services/reply-routing-service";
import {
  renderPoliteReply,
  renderQuickReply,
  renderNegotiationFallbackReply,
} from "@/services/reply-template-service";

type GenerateReplyDraftsParams = {
  parsed_json: InquiryData;
  quote_breakdown: QuoteResult;
  missing_fields: string[];
  /** Determines which tones are included; defaults to "free" */
  plan?: PlanTier;
};

/**
 * Returns deterministic reply drafts gated by plan:
 *   FREE  → polite only; quick = null, negotiation = null
 *   PRO   → all three tones
 *
 * This function never calls an LLM.
 * For AI-refined negotiation, the client calls POST /api/replies/negotiation-ai.
 */
export function generateReplyDrafts(
  params: GenerateReplyDraftsParams,
): ReplyGenerationResult {
  const { parsed_json, quote_breakdown, missing_fields, plan = "free" } = params;
  const policy = getPlanPolicy(plan);

  const templateInput: ReplyTemplateInput = {
    brand_name: parsed_json.brand_name,
    platform_requested: parsed_json.platform_requested,
    deliverables: parsed_json.deliverables,
    missing_fields,
    quote_floor: quote_breakdown.floor,
    quote_target: quote_breakdown.target,
    quote_premium: quote_breakdown.premium,
    contact_name: parsed_json.contact_name,
    compensation_type: parsed_json.compensation_type,
    timeline: parsed_json.timeline,
    usage_rights: parsed_json.usage_rights,
    exclusivity: parsed_json.exclusivity,
  };

  const strategy = chooseReplyStrategy({
    missingFields: missing_fields,
    quoteTarget: quote_breakdown.target,
    hasBudgetMentioned: parsed_json.budget_mentioned !== "not specified",
    hasUsageRights: parsed_json.usage_rights !== "not specified",
    hasExclusivity: parsed_json.exclusivity !== "not specified",
  });

  const tones = policy.reply_tones;

  return {
    strategy,
    drafts: {
      polite: renderPoliteReply(templateInput),
      quick: tones.includes("quick") ? renderQuickReply(templateInput) : null,
      negotiation: tones.includes("negotiation")
        ? renderNegotiationFallbackReply(templateInput)
        : null,
    },
  };
}
