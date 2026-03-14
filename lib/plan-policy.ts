/**
 * Single source of truth for plan feature gates and usage limits.
 * All server-side plan enforcement must read from this module.
 * Never trust client-supplied plan flags.
 */

export type PlanTier = "free" | "pro";

export type PlanPolicy = {
  /** Maximum parse calls per calendar month. Null = unlimited. */
  parse_per_month: number | null;
  /** Maximum saved deals (cumulative). Null = unlimited. */
  deal_save_limit: number | null;
  /** Maximum negotiation AI calls per calendar month. Null = unlimited; 0 = disabled. */
  negotiation_ai_per_month: number | null;
  /** Which reply tones are returned in parse response */
  reply_tones: ("polite" | "quick" | "negotiation")[];
  /** Whether dashboard alert panel is returned */
  alerts_enabled: boolean;
  /** Whether full quote breakdown (fee components) is returned */
  full_quote_breakdown: boolean;
  /** Whether full checks list is returned */
  full_checks_list: boolean;
  /** Whether the negotiation AI endpoint is accessible */
  negotiation_ai_enabled: boolean;
};

export const PLAN_POLICIES: Record<PlanTier, PlanPolicy> = {
  free: {
    parse_per_month: 5,
    deal_save_limit: 10,
    negotiation_ai_per_month: 0,
    reply_tones: ["polite"],
    alerts_enabled: false,
    full_quote_breakdown: false,
    full_checks_list: false,
    negotiation_ai_enabled: false,
  },
  pro: {
    parse_per_month: null,
    deal_save_limit: null,
    negotiation_ai_per_month: null,
    reply_tones: ["polite", "quick", "negotiation"],
    alerts_enabled: true,
    full_quote_breakdown: true,
    full_checks_list: true,
    negotiation_ai_enabled: true,
  },
};

export function getPlanPolicy(plan: PlanTier): PlanPolicy {
  return PLAN_POLICIES[plan];
}
