import "server-only";

import type { ParseResult, CreatorProfile } from "@/types/inquiry";
import type { DealInsert, DealCheckInsert, ReplyDraftInsert } from "@/types/deal";
import type { ReplyTone } from "@/types/reply";
import type { PlanTier } from "@/lib/plan-policy";
import { calculateQuote } from "@/services/quote-engine";
import { generateChecks } from "@/services/check-engine";
import { generateReplyDrafts } from "@/services/reply-generator";
import { logInfo } from "@/lib/logger";

export const DEFAULT_CREATOR_PROFILE: CreatorProfile = {
  followers_band: "50k_100k",
  avg_views_band: "20k_50k",
  niche: "lifestyle",
  floor_rate: 300000,
  primary_platform: "instagram",
  geo_region: "KR",
  currency: "KRW",
};

const DEFAULT_NEXT_ACTION = "Send reply";
const NEXT_ACTION_DAYS = 2;

export type DealServiceInput = {
  user_id: string;
  inquiry_id?: string;
  parse_result: ParseResult;
  source_type: "email" | "dm" | "other";
  selected_reply_tone?: ReplyTone;
  plan?: PlanTier;
  creator_profile?: CreatorProfile;
};

export type DealServiceOutput = {
  deal_insert: DealInsert;
  check_inserts: DealCheckInsert[];
  draft_inserts: Omit<ReplyDraftInsert, "deal_id">[];
};

/**
 * Orchestrates quote → check → reply pipeline and builds
 * insertion payloads for deals, deal_checks, and reply_drafts.
 *
 * All business logic runs server-side.
 * Client-provided quote/check values are never trusted.
 * Draft inserts only include tones allowed by the user's plan.
 */
export function buildDealPayload(input: DealServiceInput): DealServiceOutput {
  const { user_id, inquiry_id, parse_result, source_type, plan = "free" } = input;
  const creator_profile = input.creator_profile ?? DEFAULT_CREATOR_PROFILE;
  const { parsed_json, missing_fields } = parse_result;

  // 1. Quote engine — server-computed, never from client
  const quote_breakdown = calculateQuote({
    creator_profile,
    inquiry: parsed_json,
  });

  // 2. Check engine — server-computed
  const checks = generateChecks(parsed_json);
  const unresolved_checks_count = checks.filter((c) => !c.resolved).length;

  // 3. Reply generator — plan-gated, no LLM
  const { strategy, drafts } = generateReplyDrafts({
    parsed_json,
    quote_breakdown,
    missing_fields,
    plan,
  });

  logInfo("deal payload built", {
    user_id,
    inquiry_id,
    source_type,
    strategy,
    checks_count: checks.length,
    unresolved_checks_count,
    missing_fields_count: missing_fields.length,
    plan,
  });

  // 4. Compute next_action_due_at (now + 2 days)
  const next_action_due_at = new Date(
    Date.now() + NEXT_ACTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  // 5. Build deal insert
  const deal_insert: DealInsert = {
    user_id,
    inquiry_id,
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

  // 6. Build check inserts (deal_id filled by caller)
  const check_inserts: DealCheckInsert[] = checks.map((c) => ({
    deal_id: "",
    type: c.check_code,
    message: c.message,
    severity: c.priority,
    resolved: c.resolved,
  }));

  // 7. Build draft inserts — filter out null tones (plan-gated)
  const allDrafts: { tone: ReplyTone; body: string | null }[] = [
    { tone: "polite", body: drafts.polite },
    { tone: "quick", body: drafts.quick },
    { tone: "negotiation", body: drafts.negotiation },
  ];

  const draft_inserts: Omit<ReplyDraftInsert, "deal_id">[] = allDrafts
    .filter((d): d is { tone: ReplyTone; body: string } => d.body !== null)
    .map((d) => ({ tone: d.tone, body: d.body }));

  return { deal_insert, check_inserts, draft_inserts };
}
