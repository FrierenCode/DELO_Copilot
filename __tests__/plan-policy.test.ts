import { describe, it, expect } from "vitest";
import { getPlanPolicy, PLAN_POLICIES } from "@/lib/plan-policy";

describe("plan-policy", () => {
  describe("FREE policy", () => {
    const policy = getPlanPolicy("free");

    it("has a parse limit of 5 per month", () => {
      expect(policy.parse_per_month).toBe(5);
    });

    it("allows only polite reply tone", () => {
      expect(policy.reply_tones).toEqual(["polite"]);
      expect(policy.reply_tones).not.toContain("quick");
      expect(policy.reply_tones).not.toContain("negotiation");
    });

    it("has a deal save limit of 10", () => {
      expect(policy.deal_save_limit).toBe(10);
    });

    it("has alerts disabled", () => {
      expect(policy.alerts_enabled).toBe(false);
    });

    it("has negotiation AI disabled", () => {
      expect(policy.negotiation_ai_enabled).toBe(false);
      expect(policy.negotiation_ai_per_month).toBe(0);
    });

    it("has full quote breakdown disabled", () => {
      expect(policy.full_quote_breakdown).toBe(false);
    });

    it("has full checks list disabled", () => {
      expect(policy.full_checks_list).toBe(false);
    });
  });

  describe("PRO policy", () => {
    const policy = getPlanPolicy("pro");

    it("has a parse limit of 100 per month", () => {
      expect(policy.parse_per_month).toBe(100);
    });

    it("includes all three reply tones", () => {
      expect(policy.reply_tones).toContain("polite");
      expect(policy.reply_tones).toContain("quick");
      expect(policy.reply_tones).toContain("negotiation");
    });

    it("has a deal save limit of 200", () => {
      expect(policy.deal_save_limit).toBe(200);
    });

    it("has alerts enabled", () => {
      expect(policy.alerts_enabled).toBe(true);
    });

    it("has negotiation AI enabled", () => {
      expect(policy.negotiation_ai_enabled).toBe(true);
      expect(policy.negotiation_ai_per_month).toBeGreaterThan(0);
    });

    it("has full quote breakdown enabled", () => {
      expect(policy.full_quote_breakdown).toBe(true);
    });

    it("has full checks list enabled", () => {
      expect(policy.full_checks_list).toBe(true);
    });
  });

  it("getPlanPolicy returns a copy for each known tier", () => {
    expect(getPlanPolicy("free")).toBe(PLAN_POLICIES.free);
    expect(getPlanPolicy("pro")).toBe(PLAN_POLICIES.pro);
  });
});
