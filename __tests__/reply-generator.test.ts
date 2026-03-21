import { describe, it, expect } from "vitest";
import { generateReplyDrafts } from "@/services/reply-generator";
import type { InquiryData } from "@/types/inquiry";
import type { QuoteResult } from "@/services/quote-engine";

const INQUIRY: InquiryData = {
  brand_name: "Acme Corp",
  contact_name: "Jane Doe",
  contact_channel: "email",
  platform_requested: "instagram",
  deliverables: "2 reels",
  timeline: "2 weeks",
  compensation_type: "fixed",
  budget_mentioned: "not specified",
  usage_rights: "not specified",
  exclusivity: "not specified",
  revisions: "not specified",
  payment_terms: "not specified",
};

const QUOTE: QuoteResult = {
  base_fee: 550000,
  usage_rights_fee: 0,
  exclusivity_fee: 0,
  rush_fee: 0,
  floor: 440000,
  target: 550000,
  premium: 825000,
  explanation: "Based on 50k~100k followers.",
};

describe("generateReplyDrafts — plan-gated tones", () => {
  it("FREE: polite is always present", () => {
    const result = generateReplyDrafts({
      parsed_json: INQUIRY,
      quote_breakdown: QUOTE,
      missing_fields: [],
      plan: "free",
    });
    expect(result.drafts.polite).toBeTruthy();
  });

  it("FREE: quick is null", () => {
    const result = generateReplyDrafts({
      parsed_json: INQUIRY,
      quote_breakdown: QUOTE,
      missing_fields: [],
      plan: "free",
    });
    expect(result.drafts.quick).toBeNull();
  });

  it("FREE: negotiation is null", () => {
    const result = generateReplyDrafts({
      parsed_json: INQUIRY,
      quote_breakdown: QUOTE,
      missing_fields: [],
      plan: "free",
    });
    expect(result.drafts.negotiation).toBeNull();
  });

  it("STANDARD: all three drafts are non-null strings", () => {
    const result = generateReplyDrafts({
      parsed_json: INQUIRY,
      quote_breakdown: QUOTE,
      missing_fields: [],
      plan: "standard",
    });
    expect(result.drafts.polite).toBeTruthy();
    expect(result.drafts.quick).toBeTruthy();
    expect(result.drafts.negotiation).toBeTruthy();
  });

  it("does not call any LLM (function is synchronous and has no async await)", () => {
    // generateReplyDrafts is synchronous — verify return is not a Promise
    const result = generateReplyDrafts({
      parsed_json: INQUIRY,
      quote_breakdown: QUOTE,
      missing_fields: [],
      plan: "standard",
    });
    expect(result).not.toBeInstanceOf(Promise);
    expect(result.drafts).toBeDefined();
  });

  it("defaults to free plan when plan is omitted", () => {
    const result = generateReplyDrafts({
      parsed_json: INQUIRY,
      quote_breakdown: QUOTE,
      missing_fields: [],
    });
    expect(result.drafts.quick).toBeNull();
    expect(result.drafts.negotiation).toBeNull();
  });
});
