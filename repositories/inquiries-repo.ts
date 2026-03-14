import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { InquiryData } from "@/types/inquiry";
import type { QuoteResult } from "@/services/quote-engine";
import type { CheckItem } from "@/services/check-engine";

export type StoredReplyDrafts = {
  polite?: string;
  quick?: string | null;
  negotiation?: string | null;
};

export type InquiryRecord = {
  id: string;
  user_id: string | null;
  input_hash: string;
  /** First 200 chars of raw input — never the full text */
  raw_text_preview: string;
  sanitized_text: string;
  source_type: string;
  parsed_json: InquiryData;
  missing_fields: string[];
  quote_breakdown_json: QuoteResult | null;
  checks_json: CheckItem[];
  reply_drafts_json?: StoredReplyDrafts | null;
  parser_meta: {
    provider: string;
    model: string;
    fallback_used: boolean;
    prompt_version: string;
  };
  created_at: string;
};

export type InquiryInsert = Omit<InquiryRecord, "id" | "created_at">;

/**
 * Dedup lookup scoped to a specific user.
 * Anonymous users (no userId) always get a fresh parse — no dedup.
 */
export async function findInquiryByHash(
  hash: string,
  userId: string,
): Promise<InquiryRecord | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("inquiries")
    .select()
    .eq("input_hash", hash)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`inquiries.findByHash failed: ${error.message}`);
  if (!data) return null;
  return data as InquiryRecord;
}

/** Ownership-safe lookup by primary key. */
export async function findInquiryById(id: string): Promise<InquiryRecord | null> {
  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from("inquiries")
      .select()
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as InquiryRecord;
  } catch {
    return null;
  }
}

export type InquirySummaryRow = {
  id: string;
  parsed_json: InquiryData;
  quote_breakdown_json: QuoteResult | null;
  created_at: string;
};

export async function listRecentInquiries(
  userId: string | null,
  limit = 50,
): Promise<InquirySummaryRow[]> {
  const db = createAdminClient();
  let query = db
    .from("inquiries")
    .select("id, parsed_json, quote_breakdown_json, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    // anonymous: return nothing — no cross-user data leakage
    return [];
  }

  const { data, error } = await query;
  if (error) throw new Error(`inquiries.list failed: ${error.message}`);
  return (data ?? []) as InquirySummaryRow[];
}

export async function patchInquiryReplies(
  id: string,
  replies: StoredReplyDrafts,
): Promise<void> {
  const db = createAdminClient();
  const { error } = await db
    .from("inquiries")
    .update({ reply_drafts_json: replies })
    .eq("id", id);
  if (error) throw new Error(`inquiries.patchReplies failed: ${error.message}`);
}

export async function createInquiry(data: InquiryInsert): Promise<InquiryRecord> {
  const db = createAdminClient();
  const { data: row, error } = await db
    .from("inquiries")
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(`inquiries.create failed: ${error.message}`);
  return row as InquiryRecord;
}
