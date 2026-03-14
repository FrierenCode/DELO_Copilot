import "server-only";

import type { InquiryData, ParseInput, ParseResult } from "@/types/inquiry";
import { parseWithLlm } from "@/services/parse-llm-service";
import { sanitizeRawText } from "@/lib/inquiry/sanitize-raw-text";
import { createInquiryHash } from "@/lib/inquiry/hash-input";
import { getCachedParse, storeParse } from "@/repositories/parse-cache-repo";
import { PARSE_PROMPT_VERSION } from "@/lib/llm/prompts/parse-inquiry.prompt";
import { trackEvent } from "@/lib/analytics";
import { logInfo } from "@/lib/logger";

const MISSING_SENTINEL = "not specified";

const MAX_RAW_TEXT = 10_000; // hard cap before sanitisation

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
  // Step 10: reject oversized input
  const rawText = input.raw_text.slice(0, MAX_RAW_TEXT);

  // Step 1: sanitise — removes signatures, quoted chains, footers
  const { sanitized_text, removed_chars } = sanitizeRawText(rawText);

  logInfo("parse input sanitised", {
    original_chars: rawText.length,
    sanitized_chars: sanitized_text.length,
    removed_chars,
  });

  // Step 2: hash
  const hash = await createInquiryHash(sanitized_text, input.source_type, PARSE_PROMPT_VERSION);

  // Step 3: cache lookup
  const cached = await getCachedParse(hash);
  if (cached) {
    logInfo("parse cache hit", { hash: hash.slice(0, 8), source_type: input.source_type });
    trackEvent("system", "parse_cache_hit", {
      source_type: input.source_type,
      cache_hit: true,
      provider: cached.parser_meta.provider,
      model: cached.parser_meta.model,
    });
    return {
      parsed_json: cached.parsed_json,
      missing_fields: cached.missing_fields,
    };
  }

  trackEvent("system", "parse_cache_miss", {
    source_type: input.source_type,
    cache_hit: false,
  });

  // Step 4: call LLM with sanitised text
  const { parsed_json, parser_meta } = await parseWithLlm({
    raw_text: sanitized_text,
    source_type: input.source_type,
  });

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

  if (parser_meta.fallback_used) {
    trackEvent("system", "fallback_used", {
      provider: parser_meta.provider,
      model: parser_meta.model,
      source_type: input.source_type,
    });
  }

  // Step 5: store result in cache (fire-and-forget)
  storeParse(hash, sanitized_text, { parsed_json, missing_fields, parser_meta });

  return { parsed_json, missing_fields };
}
