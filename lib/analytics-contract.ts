export const ANALYTICS_EVENTS = [
  // ── existing events (Phase 1–4) ──────────────────────────────────────
  "alerts_viewed",
  "budget_guard_triggered",
  "dashboard_viewed",
  "deal_save_clicked",
  "deal_saved",
  "deal_status_changed",
  "deal_updated",
  "deal_viewed",
  "fallback_used",
  "negotiation_ai_failed",
  "negotiation_ai_requested",
  "negotiation_ai_succeeded",
  "parse_cache_hit",
  "parse_cache_miss",
  "parse_failed",
  "parse_started",
  "parse_succeeded",
  "paywall_viewed",
  "profile_saved",
  "profile_viewed",
  "quote_viewed",
  // ── Phase 5 additions ────────────────────────────────────────────────
  "alert_clicked",
  "checkout_started",
  "checks_viewed",
  "error_occurred",
  "inquiry_pasted",
  "landing_cta_clicked",
  "onboarding_completed",
  "onboarding_started",
  "plan_cancelled",
  "reply_copied",
  "reply_tab_changed",
  "sample_inquiry_used",
  "upgraded_to_pro",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsCommonProperties = {
  user_id: string;
  request_id: string;
  plan?: "free" | "standard";
  source_type?: "email" | "dm" | "other";
};
