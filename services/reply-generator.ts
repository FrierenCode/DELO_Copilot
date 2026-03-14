import "server-only";

import type { InquiryData } from "@/types/inquiry";
import type { ReplyGenerationResult, ReplyTemplateInput } from "@/types/reply";
import type { QuoteResult } from "@/services/quote-engine";
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
};

/**
 * Generates all three reply drafts using deterministic templates only.
 *
 * The negotiation draft returned here is a high-quality template.
 * For an LLM-personalised negotiation reply, clients should call
 * POST /api/replies/negotiation-ai on demand.
 */
export function generateReplyDrafts(
  params: GenerateReplyDraftsParams,
): ReplyGenerationResult {
  const { parsed_json, quote_breakdown, missing_fields } = params;

  const templateInput: ReplyTemplateInput = {
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
  };

  const strategy = chooseReplyStrategy({
    missingFields: missing_fields,
    quoteTarget: quote_breakdown.target,
    hasBudgetMentioned: parsed_json.budget_mentioned !== "not specified",
    hasUsageRights: parsed_json.usage_rights !== "not specified",
    hasExclusivity: parsed_json.exclusivity !== "not specified",
  });

  return {
    strategy,
    drafts: {
      polite: renderPoliteReply(templateInput),
      quick: renderQuickReply(templateInput),
      negotiation: renderNegotiationFallbackReply(templateInput),
    },
  };
}
