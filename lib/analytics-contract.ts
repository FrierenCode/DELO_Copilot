export const ANALYTICS_EVENTS = [
  "alerts_viewed",
  "budget_guard_triggered",
  "dashboard_viewed",
  "deal_save_clicked",
  "deal_saved",
  "deal_status_changed",
  "deal_updated",
  "deal_viewed",
  "fallback_used",
  "negotiation_ai_requested",
  "parse_cache_hit",
  "parse_cache_miss",
  "parse_failed",
  "parse_started",
  "parse_succeeded",
  "paywall_viewed",
  "profile_saved",
  "profile_viewed",
  "quote_viewed",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsCommonProperties = {
  user_id: string;
  request_id: string;
  plan?: "free" | "pro";
  source_type?: "email" | "dm" | "other";
};
