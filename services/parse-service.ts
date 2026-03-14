import "server-only";

import type { InquiryData, ParseInput, ParseResult } from "@/types/inquiry";
import { parseWithLlm } from "@/services/parse-llm-service";
import { sanitizeRawText } from "@/lib/inquiry/sanitize-raw-text";
import { createInquiryHash } from "@/lib/inquiry/hash-input";
import { findInquiryByHash, createInquiry } from "@/repositories/inquiries-repo";
import { getCachedParse, storeParse } from "@/repositories/parse-cache-repo";
import { PARSE_PROMPT_VERSION } from "@/lib/llm/prompts/parse-inquiry.prompt";
import { trackEvent } from "@/lib/analytics";
import { logInfo } from "@/lib/logger";

const MISSING_SENTINEL = "not specified";
const MAX_RAW_TEXT = 10_000;
const RAW_PREVIEW_LEN = 200;

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

export type ParseServiceResult = ParseResult & {
  inquiry_id: string;
};

export async function parseService(
  input: ParseInput,
  userId?: string,
): Promise<ParseServiceResult> {
  const rawText = input.raw_text.slice(0, MAX_RAW_TEXT);
  const { sanitized_text, removed_chars } = sanitizeRawText(rawText);

  logInfo("parse input sanitised", {
    original_chars: rawText.length,
    sanitized_chars: sanitized_text.length,
    removed_chars,
  });

  const hash = await createInquiryHash(sanitized_text, input.source_type, PARSE_PROMPT_VERSION);

  const existing = userId ? await findInquiryByHash(hash, userId) : null;
  if (existing) {
    logInfo("parse inquiry cache hit", {
      hash: hash.slice(0, 8),
      inquiry_id: existing.id,
      source_type: input.source_type,
    });
    trackEvent(userId ?? "anon", "parse_cache_hit", {
      source_type: input.source_type,
      cache_hit: true,
      cache_layer: "inquiries",
      provider: existing.parser_meta.provider,
      model: existing.parser_meta.model,
    });
    return {
      inquiry_id: existing.id,
      parsed_json: existing.parsed_json,
      missing_fields: existing.missing_fields,
    };
  }

  const cached = await getCachedParse(hash);
  if (cached) {
    const inquiry = await createInquiry({
      user_id: userId ?? null,
      input_hash: hash,
      raw_text_preview: rawText.slice(0, RAW_PREVIEW_LEN),
      sanitized_text: cached.sanitized_text ?? sanitized_text,
      source_type: input.source_type,
      parsed_json: cached.parsed_json,
      missing_fields: cached.missing_fields,
      quote_breakdown_json: null,
      checks_json: [],
      parser_meta: cached.parser_meta,
    });

    logInfo("parse global cache hit", {
      hash: hash.slice(0, 8),
      inquiry_id: inquiry.id,
      source_type: input.source_type,
    });
    trackEvent(userId ?? "anon", "parse_cache_hit", {
      source_type: input.source_type,
      cache_hit: true,
      cache_layer: "parse_cache",
      provider: cached.parser_meta.provider,
      model: cached.parser_meta.model,
    });

    return {
      inquiry_id: inquiry.id,
      parsed_json: cached.parsed_json,
      missing_fields: cached.missing_fields,
    };
  }

  trackEvent(userId ?? "anon", "parse_cache_miss", {
    source_type: input.source_type,
    cache_hit: false,
  });

  const { parsed_json, parser_meta } = await parseWithLlm({
    raw_text: sanitized_text,
    source_type: input.source_type,
  });

  const missing_fields = REQUIRED_FIELDS.filter(
    (field) => parsed_json[field].toLowerCase().trim() === MISSING_SENTINEL,
  );

  logInfo("parse llm completed", {
    provider: parser_meta.provider,
    model: parser_meta.model,
    fallback_used: parser_meta.fallback_used,
    missing_count: missing_fields.length,
    source_type: input.source_type,
  });

  if (parser_meta.fallback_used) {
    trackEvent(userId ?? "anon", "fallback_used", {
      provider: parser_meta.provider,
      model: parser_meta.model,
      source_type: input.source_type,
    });
  }

  const inquiry = await createInquiry({
    user_id: userId ?? null,
    input_hash: hash,
    raw_text_preview: rawText.slice(0, RAW_PREVIEW_LEN),
    sanitized_text,
    source_type: input.source_type,
    parsed_json,
    missing_fields,
    quote_breakdown_json: null,
    checks_json: [],
    parser_meta,
  });

  storeParse(hash, sanitized_text, { parsed_json, missing_fields, parser_meta });

  return { inquiry_id: inquiry.id, parsed_json, missing_fields };
}
