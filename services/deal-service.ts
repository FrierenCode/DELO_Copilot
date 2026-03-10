import "server-only";
import type { ParseResult } from "@/types/inquiry";
import type { DealInsert, DealCheckInsert, ReplyDraftInsert } from "@/types/deal";
import type { ReplyTone } from "@/types/reply";
import { calculateQuote } from "@/services/quote-engine";
import { generateChecks } from "@/services/check-engine";
import { generateReplyDrafts } from "@/services/reply-generator";
import { logInfo } from "@/lib/logger";

// Same stub profile used in the parse route — will be replaced by per-user profile lookup
const DEFAULT_CREATOR_PROFILE = {
  followers_band: "50k_100k" as const,
  avg_views_band: "20k_50k" as const,
  niche: "lifestyle",
  floor_rate: 300000,
};

const DEFAULT_NEXT_ACTION = "Send reply";
const NEXT_ACTION_DAYS = 2;

export type DealServiceInput = {
  user_id: string;
  parse_result: ParseResult;
  source_type: "email" | "dm" | "other";
  selected_reply_tone?: ReplyTone;
};

export type DealServiceOutput = {
  deal_insert: DealInsert;
  check_inserts: DealCheckInsert[];
  draft_inserts: Omit<ReplyDraftInsert, "deal_id">[];
};

/**
 * Orchestrates quote → check → reply pipeline and builds
 * the insertion payloads for deals, deal_checks, and reply_drafts.
 *
 * All business logic runs server-side.
 * Client-provided quote/check values are never trusted.
 */
export async function buildDealPayload(
  input: DealServiceInput,
): Promise<DealServiceOutput> {
  const { user_id, parse_result, source_type } = input;
  const { parsed_json, missing_fields } = parse_result;

  // 1. Quote engine — server-computed, never from client
  const quote_breakdown = calculateQuote({
    creator_profile: DEFAULT_CREATOR_PROFILE,
    inquiry: parsed_json,
  });

  // 2. Check engine — server-computed
  const checks = generateChecks(parsed_json);
  const unresolved_checks_count = checks.filter((c) => !c.resolved).length;

  // 3. Reply generator — server-computed
  const { strategy, drafts } = await generateReplyDrafts({
    parsed_json,
    quote_breakdown,
    missing_fields,
  });

  logInfo("deal payload built", {
    user_id,
    source_type,
    strategy,
    checks_count: checks.length,
    unresolved_checks_count,
    missing_fields_count: missing_fields.length,
  });

  // 4. Compute next_action_due_at (now + 2 days)
  const next_action_due_at = new Date(
    Date.now() + NEXT_ACTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  // 5. Build deal insert
  const deal_insert: DealInsert = {
    user_id,
    brand_name: parsed_json.brand_name,
    contact_name: parsed_json.contact_name,
    contact_channel: parsed_json.contact_channel,
    platform_requested: parsed_json.platform_requested,
    deliverables_summary: parsed_json.deliverables,
    budget_mentioned: parsed_json.budget_mentioned,
    quote_floor: quote_breakdown.floor,
    quote_target: quote_breakdown.target,
    quote_premium: quote_breakdown.premium,
    quote_breakdown_json: quote_breakdown,
    next_action: DEFAULT_NEXT_ACTION,
    next_action_due_at,
    followup_needed: false,
    unresolved_checks_count,
    status: "Lead",
  };

  // 6. Build check inserts (deal_id filled in by caller after deal is created)
  const check_inserts: DealCheckInsert[] = checks.map((c) => ({
    deal_id: "", // placeholder — caller sets this
    type: c.check_code,
    message: c.message,
    severity: c.priority,
    resolved: c.resolved,
  }));

  // 7. Build draft inserts (deal_id filled in by caller)
  const draft_inserts: Omit<ReplyDraftInsert, "deal_id">[] = [
    { tone: "polite",      body: drafts.polite },
    { tone: "negotiation", body: drafts.negotiation },
    { tone: "quick",       body: drafts.quick },
  ];

  return { deal_insert, check_inserts, draft_inserts };
}
