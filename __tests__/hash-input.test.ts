import { describe, it, expect } from "vitest";
import { createInquiryHash } from "@/lib/inquiry/hash-input";

describe("createInquiryHash", () => {
  it("returns a 64-character hex string (SHA-256)", async () => {
    const hash = await createInquiryHash("hello world", "email", "parse_v1");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("is deterministic for identical inputs", async () => {
    const a = await createInquiryHash("collab inquiry text", "email", "parse_v1");
    const b = await createInquiryHash("collab inquiry text", "email", "parse_v1");
    expect(a).toBe(b);
  });

  it("produces different hashes for different source_type", async () => {
    const a = await createInquiryHash("same text", "email", "parse_v1");
    const b = await createInquiryHash("same text", "dm", "parse_v1");
    expect(a).not.toBe(b);
  });

  it("produces different hashes for different parser_version", async () => {
    const a = await createInquiryHash("same text", "email", "parse_v1");
    const b = await createInquiryHash("same text", "email", "parse_v2");
    expect(a).not.toBe(b);
  });

  it("normalises whitespace — extra spaces produce same hash", async () => {
    const a = await createInquiryHash("collab   inquiry   text", "email", "parse_v1");
    const b = await createInquiryHash("collab inquiry text", "email", "parse_v1");
    expect(a).toBe(b);
  });

  it("normalises case — uppercase produces same hash as lowercase", async () => {
    const a = await createInquiryHash("Hello World", "email", "parse_v1");
    const b = await createInquiryHash("hello world", "email", "parse_v1");
    expect(a).toBe(b);
  });
});
