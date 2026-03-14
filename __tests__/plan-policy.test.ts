import { describe, it, expect } from "vitest";
import { getPlanPolicy, PLAN_POLICIES } from "@/lib/plan-policy";

describe("plan-policy", () => {
  describe("FREE policy", () => {
    const policy = getPlanPolicy("free");

    it("has a parse limit of 5 per month", () => {
      expect(policy.parse_per_month).toBe(5);
    });

    it("has a deal save limit of 10", () => {
      expect(policy.deal_save_limit).toBe(10);
    });

    it("allows only polite reply tone", () => {
      expect(policy.reply_tones).toEqual(["polite"]);
    });

    it("keeps alerts and negotiation AI disabled", () => {
      expect(policy.alerts_enabled).toBe(false);
      expect(policy.negotiation_ai_enabled).toBe(false);
      expect(policy.negotiation_ai_per_month).toBe(0);
    });
  });

  describe("PRO policy", () => {
    const policy = getPlanPolicy("pro");

    it("has unlimited parse volume", () => {
      expect(policy.parse_per_month).toBeNull();
    });

    it("has unlimited deal saves", () => {
      expect(policy.deal_save_limit).toBeNull();
    });

    it("has unlimited negotiation AI volume", () => {
      expect(policy.negotiation_ai_per_month).toBeNull();
    });

    it("includes all reply tones and full features", () => {
      expect(policy.reply_tones).toEqual(["polite", "quick", "negotiation"]);
      expect(policy.alerts_enabled).toBe(true);
      expect(policy.full_quote_breakdown).toBe(true);
      expect(policy.full_checks_list).toBe(true);
      expect(policy.negotiation_ai_enabled).toBe(true);
    });
  });

  it("returns the canonical policy table entries", () => {
    expect(getPlanPolicy("free")).toBe(PLAN_POLICIES.free);
    expect(getPlanPolicy("pro")).toBe(PLAN_POLICIES.pro);
  });
});
