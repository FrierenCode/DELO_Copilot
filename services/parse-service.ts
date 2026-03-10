import "server-only";

import type { InquiryData, ParseInput, ParseResult } from "@/types/inquiry";
import { parseWithLlm } from "@/services/parse-llm-service";
import { logInfo } from "@/lib/logger";

const MISSING_SENTINEL = "not specified";

const REQUIRED_FIELDS: (keyof InquiryData)[] = [
  "brand_name",
  "contact_name",
  "platform_requested",
  "deliverables",
  "timeline",
  "compensation_type",
  "budget_mentioned",
  "usage_rights",
  "exclusivity",
  "revisions",
  "payment_terms",
];

export async function parseService(input: ParseInput): Promise<ParseResult> {
  // Patch 3: destructure parser_meta for logging
  const { parsed_json, parser_meta } = await parseWithLlm(input);

  const missing_fields = REQUIRED_FIELDS.filter(
    (field) => parsed_json[field].toLowerCase().trim() === MISSING_SENTINEL,
  );

  logInfo("parse service completed", {
    provider: parser_meta.provider,
    model: parser_meta.model,
    fallback_used: parser_meta.fallback_used,
    prompt_version: parser_meta.prompt_version,
    missing_count: missing_fields.length,
    source_type: input.source_type,
  });

  return { parsed_json, missing_fields };
}
