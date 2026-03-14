import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { InquiryData } from "@/types/inquiry";

export type ParseCacheEntry = {
  sanitized_text?: string;
  parsed_json: InquiryData;
  missing_fields: string[];
  parser_meta: {
    provider: string;
    model: string;
    fallback_used: boolean;
    prompt_version: string;
  };
};

export async function getCachedParse(hash: string): Promise<ParseCacheEntry | null> {
  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from("parse_cache")
      .select("sanitized_text, parsed_json, missing_fields, parser_meta")
      .eq("input_hash", hash)
      .maybeSingle();

    if (error || !data) return null;
    return data as ParseCacheEntry;
  } catch {
    return null;
  }
}

export async function storeParse(
  hash: string,
  sanitizedText: string,
  entry: ParseCacheEntry,
): Promise<void> {
  try {
    const db = createAdminClient();
    await db.from("parse_cache").upsert({
      input_hash: hash,
      sanitized_text: sanitizedText,
      parsed_json: entry.parsed_json,
      missing_fields: entry.missing_fields,
      parser_meta: entry.parser_meta,
    });
  } catch {
    // Non-critical — cache write failures must not block the response
  }
}
