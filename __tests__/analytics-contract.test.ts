import { describe, it, expect } from "vitest";
import { ANALYTICS_EVENTS } from "@/lib/analytics-contract";

const REQUIRED_PHASE5_EVENTS = [
  "landing_cta_clicked",
  "onboarding_started",
  "onboarding_completed",
  "inquiry_pasted",
  "parse_started",
  "parse_succeeded",
  "parse_failed",
  "quote_viewed",
  "checks_viewed",
  "reply_tab_changed",
  "reply_copied",
  "deal_save_clicked",
  "deal_saved",
  "deal_status_changed",
  "alert_clicked",
  "sample_inquiry_used",
  "paywall_viewed",
  "checkout_started",
  "upgraded_to_pro",
  "plan_cancelled",
  "error_occurred",
] as const;

const REQUIRED_ORIGINAL_EVENTS = [
  "alerts_viewed",
  "budget_guard_triggered",
  "dashboard_viewed",
  "deal_updated",
  "deal_viewed",
  "fallback_used",
  "negotiation_ai_failed",
  "negotiation_ai_requested",
  "negotiation_ai_succeeded",
  "parse_cache_hit",
  "parse_cache_miss",
  "profile_saved",
  "profile_viewed",
] as const;

describe("analytics-contract", () => {
  it("contains all required Phase 5 events", () => {
    for (const event of REQUIRED_PHASE5_EVENTS) {
      expect(ANALYTICS_EVENTS).toContain(event);
    }
  });

  it("preserves all original Phase 1–4 events (no breaking renames)", () => {
    for (const event of REQUIRED_ORIGINAL_EVENTS) {
      expect(ANALYTICS_EVENTS).toContain(event);
    }
  });

  it("has no duplicate entries", () => {
    const set = new Set(ANALYTICS_EVENTS);
    expect(set.size).toBe(ANALYTICS_EVENTS.length);
  });

  it("has at least 34 events total (21 original + 13 Phase 5)", () => {
    expect(ANALYTICS_EVENTS.length).toBeGreaterThanOrEqual(34);
  });
});
