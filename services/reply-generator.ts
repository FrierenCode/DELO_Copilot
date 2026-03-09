import type { InquiryData } from "@/types/inquiry";
import type { ReplyGenerationResult, ReplyStrategy, ReplyTemplateInput } from "@/types/reply";
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

async function generateNegotiationReply(
  input: ReplyTemplateInput,
  strategy: ReplyStrategy,
): Promise<string> {
  if (strategy === "template_only") {
    return renderNegotiationFallbackReply(input);
  }
  // strategy === "mock_negotiation"
  // Placeholder: real LLM call (reply_negotiation task) will replace this block
  return renderNegotiationFallbackReply(input);
}

export async function generateReplyDrafts(
  params: GenerateReplyDraftsParams,
): Promise<ReplyGenerationResult> {
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

  const polite = renderPoliteReply(templateInput);
  const quick = renderQuickReply(templateInput);
  const negotiation = await generateNegotiationReply(templateInput, strategy);

  return { strategy, drafts: { polite, negotiation, quick } };
}
