import type { InquiryData } from "@/types/inquiry";
import type { ReplyDrafts, ReplyTemplateInput } from "@/types/reply";
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

export async function generateReplyDrafts(
  params: GenerateReplyDraftsParams,
): Promise<ReplyDrafts> {
  const { parsed_json, quote_breakdown, missing_fields } = params;

  const templateInput: ReplyTemplateInput = {
    brand_name: parsed_json.brand_name,
    platform_requested: parsed_json.platform_requested,
    deliverables: parsed_json.deliverables,
    missing_fields,
    quote_target: quote_breakdown.target,
    contact_name: parsed_json.contact_name,
    compensation_type: parsed_json.compensation_type,
  };

  const strategy = chooseReplyStrategy({
    missingFields: missing_fields,
    quoteTarget: quote_breakdown.target,
    hasBudgetMentioned: parsed_json.budget_mentioned !== "not specified",
    hasUsageRights: parsed_json.usage_rights !== "not specified",
    hasExclusivity: parsed_json.exclusivity !== "not specified",
  });

  // polite and quick are always generated via template (no LLM)
  const polite = renderPoliteReply(templateInput);
  const quick = renderQuickReply(templateInput);

  // negotiation: template-based for both strategies in this step.
  // When real LLM integration is added, replace this block based on strategy:
  //   "mock_negotiation" => call LLM with reply_negotiation task
  //   "template_only"    => keep renderNegotiationFallbackReply
  const negotiation = renderNegotiationFallbackReply(templateInput);

  return { polite, negotiation, quick };
}
