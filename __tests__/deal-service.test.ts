import { describe, it, expect, vi } from "vitest";
import { buildDealPayload } from "@/services/deal-service";
import type { InquiryData } from "@/types/inquiry";

vi.mock("@/lib/logger", () => ({ logInfo: vi.fn(), logError: vi.fn() }));

const PARSED_JSON: InquiryData = {
  brand_name: "Acme",
  contact_name: "Jane",
  contact_channel: "email",
  platform_requested: "instagram",
  deliverables: "2 reels",
  timeline: "2 weeks",
  compensation_type: "fixed",
  budget_mentioned: "500 USD",
  usage_rights: "not specified",
  exclusivity: "not specified",
  revisions: "not specified",
  payment_terms: "not specified",
};

const PARSE_RESULT = {
  parsed_json: PARSED_JSON,
  missing_fields: ["usage_rights", "exclusivity", "revisions", "payment_terms"],
};

describe("buildDealPayload — plan-gated drafts", () => {
  it("FREE: draft_inserts contains only polite tone", () => {
    const payload = buildDealPayload({
      user_id: "user-1",
      parse_result: PARSE_RESULT,
      source_type: "email",
      plan: "free",
    });
    const tones = payload.draft_inserts.map((d) => d.tone);
    expect(tones).toContain("polite");
    expect(tones).not.toContain("quick");
    expect(tones).not.toContain("negotiation");
  });

  it("PRO: draft_inserts contains all three tones", () => {
    const payload = buildDealPayload({
      user_id: "user-pro",
      parse_result: PARSE_RESULT,
      source_type: "email",
      plan: "standard",
    });
    const tones = payload.draft_inserts.map((d) => d.tone);
    expect(tones).toContain("polite");
    expect(tones).toContain("quick");
    expect(tones).toContain("negotiation");
  });

  it("deal_insert status is Lead", () => {
    const payload = buildDealPayload({
      user_id: "user-1",
      parse_result: PARSE_RESULT,
      source_type: "email",
      plan: "free",
    });
    expect(payload.deal_insert.status).toBe("Lead");
  });

  it("deal_insert links inquiry_id when provided", () => {
    const payload = buildDealPayload({
      user_id: "user-1",
      inquiry_id: "inq-abc",
      parse_result: PARSE_RESULT,
      source_type: "email",
      plan: "free",
    });
    expect(payload.deal_insert.inquiry_id).toBe("inq-abc");
  });

  it("all draft bodies are non-empty strings (no null bodies in inserts)", () => {
    const payload = buildDealPayload({
      user_id: "user-pro",
      parse_result: PARSE_RESULT,
      source_type: "email",
      plan: "standard",
    });
    for (const draft of payload.draft_inserts) {
      expect(typeof draft.body).toBe("string");
      expect(draft.body.length).toBeGreaterThan(0);
    }
  });

  it("unresolved_checks_count is deterministically computed", () => {
    const payload = buildDealPayload({
      user_id: "user-1",
      parse_result: PARSE_RESULT,
      source_type: "email",
      plan: "free",
    });
    // missing_fields includes payment_terms and usage_rights which are HIGH checks
    expect(payload.deal_insert.unresolved_checks_count).toBeGreaterThan(0);
    expect(payload.deal_insert.unresolved_checks_count).toBe(payload.check_inserts.length);
  });

  it("quote values are positive numbers computed server-side", () => {
    const payload = buildDealPayload({
      user_id: "user-1",
      parse_result: PARSE_RESULT,
      source_type: "email",
      plan: "free",
    });
    expect(payload.deal_insert.quote_target).toBeGreaterThan(0);
    expect(payload.deal_insert.quote_floor).toBeGreaterThan(0);
    expect(payload.deal_insert.quote_premium).toBeGreaterThan(0);
  });
});
