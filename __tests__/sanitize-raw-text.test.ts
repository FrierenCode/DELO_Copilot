import { describe, it, expect } from "vitest";
import { sanitizeRawText } from "@/lib/inquiry/sanitize-raw-text";

describe("sanitizeRawText", () => {
  it("returns the original text unchanged when no noise is present", () => {
    const input = "Hi, we'd like to collaborate on two reels for Instagram. Budget is $500.";
    const { sanitized_text, removed_chars } = sanitizeRawText(input);
    expect(sanitized_text.trim()).toBe(input.trim());
    expect(removed_chars).toBe(0);
  });

  it("removes reply-chain separator and everything after", () => {
    const main = "We want to collab on YouTube. Let us know!";
    const chain = "\n\n-----Original Message-----\nFrom: someone@example.com\nThis was the old message.";
    const { sanitized_text } = sanitizeRawText(main + chain);
    expect(sanitized_text).toContain("YouTube");
    expect(sanitized_text).not.toContain("Original Message");
    expect(sanitized_text).not.toContain("someone@example.com");
  });

  it("removes quoted reply lines starting with >", () => {
    const input = "Thanks for your reply.\n> On Mon, Jane wrote:\n> Sure, let's do it.\nSee above.";
    const { sanitized_text } = sanitizeRawText(input);
    expect(sanitized_text).not.toContain("> On Mon");
    expect(sanitized_text).not.toContain("> Sure");
  });

  it("removes email signature after -- marker", () => {
    const input = "Hi, interested in a collab.\n\n--\nJohn Smith\nMarketing Director\nBrand Inc.";
    const { sanitized_text } = sanitizeRawText(input);
    expect(sanitized_text).toContain("collab");
    expect(sanitized_text).not.toContain("John Smith");
  });

  it("removes unsubscribe text", () => {
    const input =
      "We'd love to work with you!\n\nUnsubscribe from this list by clicking here.";
    const { sanitized_text } = sanitizeRawText(input);
    expect(sanitized_text).toContain("work with you");
    expect(sanitized_text).not.toContain("Unsubscribe");
  });

  it("caps output at 3000 characters", () => {
    const input = "A".repeat(5000);
    const { sanitized_text } = sanitizeRawText(input);
    expect(sanitized_text.length).toBeLessThanOrEqual(3000);
  });

  it("reports correct removed_chars count", () => {
    const input = "Hello world\n\n--\nSignature line";
    const { sanitized_text, removed_chars } = sanitizeRawText(input);
    expect(removed_chars).toBe(input.length - sanitized_text.length);
  });

  it("collapses multiple blank lines into at most two newlines", () => {
    const input = "Line one.\n\n\n\n\nLine two.";
    const { sanitized_text } = sanitizeRawText(input);
    expect(sanitized_text).not.toMatch(/\n{3,}/);
  });
});
