import { describe, it, expect, vi, beforeEach } from "vitest";
import type { InquiryData } from "@/types/inquiry";
import { ParsePipelineError } from "@/lib/parse-error";

const mockFindInquiryByHash = vi.fn();
const mockCreateInquiry = vi.fn();
const mockGetCachedParse = vi.fn();
const mockStoreParse = vi.fn();
const mockParseWithLlm = vi.fn();

vi.mock("@/repositories/inquiries-repo", () => ({
  findInquiryByHash: (...args: unknown[]) => mockFindInquiryByHash(...args),
  createInquiry: (...args: unknown[]) => mockCreateInquiry(...args),
}));

vi.mock("@/repositories/parse-cache-repo", () => ({
  getCachedParse: (...args: unknown[]) => mockGetCachedParse(...args),
  storeParse: (...args: unknown[]) => mockStoreParse(...args),
}));

vi.mock("@/services/parse-llm-service", () => ({
  parseWithLlm: (...args: unknown[]) => mockParseWithLlm(...args),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

import { parseService } from "@/services/parse-service";

const parsedJson: InquiryData = {
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

const parserMeta = {
  provider: "google",
  model: "gemini-2.0-flash-lite",
  fallback_used: false,
  prompt_version: "parse_v1",
};

function makeInquiryRecord(overrides: Partial<{ id: string; user_id: string | null }> = {}) {
  return {
    id: "inquiry-123",
    user_id: null,
    input_hash: "abc",
    raw_text_preview: "Hi, we'd like to collab",
    sanitized_text: "Hi, we'd like to collab",
    source_type: "email",
    parsed_json: parsedJson,
    missing_fields: ["usage_rights", "exclusivity", "revisions", "payment_terms"],
    quote_breakdown_json: null,
    checks_json: [],
    parser_meta: parserMeta,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("parseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindInquiryByHash.mockResolvedValue(null);
    mockGetCachedParse.mockResolvedValue(null);
  });

  it("returns inquiry_id from user-scoped inquiry cache hit", async () => {
    mockFindInquiryByHash.mockResolvedValue(makeInquiryRecord({ user_id: "user-123" }));
    mockParseWithLlm.mockRejectedValue(new Error("LLM should not be called on cache hit"));

    const result = await parseService(
      { raw_text: "Hi, we'd like to collab", source_type: "email" },
      "user-123",
    );

    expect(result.inquiry_id).toBe("inquiry-123");
    expect(mockParseWithLlm).not.toHaveBeenCalled();
  });

  it("creates a canonical inquiry from global parse cache without calling LLM", async () => {
    mockGetCachedParse.mockResolvedValue({
      sanitized_text: "Hi, we'd like to collab",
      parsed_json: parsedJson,
      missing_fields: ["usage_rights", "exclusivity", "revisions", "payment_terms"],
      parser_meta: parserMeta,
    });
    mockCreateInquiry.mockResolvedValue(makeInquiryRecord({ id: "from-global-cache" }));

    const result = await parseService({ raw_text: "Hi, we'd like to collab", source_type: "email" });

    expect(result.inquiry_id).toBe("from-global-cache");
    expect(mockParseWithLlm).not.toHaveBeenCalled();
    expect(mockCreateInquiry).toHaveBeenCalledOnce();
  });

  it("calls LLM and creates inquiry on full cache miss", async () => {
    mockParseWithLlm.mockResolvedValue({ parsed_json: parsedJson, parser_meta: parserMeta });
    mockCreateInquiry.mockResolvedValue(makeInquiryRecord({ id: "new-inquiry-456" }));

    const result = await parseService({
      raw_text: "Hi, we'd like to collab on reels.",
      source_type: "email",
    });

    expect(mockParseWithLlm).toHaveBeenCalledOnce();
    expect(mockCreateInquiry).toHaveBeenCalledOnce();
    expect(result.inquiry_id).toBe("new-inquiry-456");
  });

  it("stores user_id on inquiry when userId is provided", async () => {
    mockParseWithLlm.mockResolvedValue({ parsed_json: parsedJson, parser_meta: parserMeta });
    mockCreateInquiry.mockResolvedValue(makeInquiryRecord({ user_id: "user-789" }));

    await parseService({ raw_text: "collab?", source_type: "dm" }, "user-789");

    const createCall = mockCreateInquiry.mock.calls[0][0];
    expect(createCall.user_id).toBe("user-789");
  });

  it("stores null user_id for anonymous parse", async () => {
    mockParseWithLlm.mockResolvedValue({ parsed_json: parsedJson, parser_meta: parserMeta });
    mockCreateInquiry.mockResolvedValue(makeInquiryRecord());

    await parseService({ raw_text: "collab?", source_type: "dm" });

    const createCall = mockCreateInquiry.mock.calls[0][0];
    expect(createCall.user_id).toBeNull();
  });

  it("caps raw_text_preview at 200 chars", async () => {
    const longText = "A".repeat(5000);
    mockParseWithLlm.mockResolvedValue({ parsed_json: parsedJson, parser_meta: parserMeta });
    mockCreateInquiry.mockResolvedValue(makeInquiryRecord());

    await parseService({ raw_text: longText, source_type: "email" });

    const createCall = mockCreateInquiry.mock.calls[0][0];
    expect(createCall.raw_text_preview.length).toBeLessThanOrEqual(200);
  });

  it("fire-and-forgets parse_cache writes after LLM parse", async () => {
    mockParseWithLlm.mockResolvedValue({ parsed_json: parsedJson, parser_meta: parserMeta });
    mockCreateInquiry.mockResolvedValue(makeInquiryRecord());
    mockStoreParse.mockResolvedValue(undefined);

    await parseService({ raw_text: "collab?", source_type: "email" });

    expect(mockStoreParse).toHaveBeenCalled();
  });

  it("logs and continues when parse_cache write fails", async () => {
    const { logError } = await import("@/lib/logger");
    mockParseWithLlm.mockResolvedValue({ parsed_json: parsedJson, parser_meta: parserMeta });
    mockCreateInquiry.mockResolvedValue(makeInquiryRecord());
    mockStoreParse.mockRejectedValue(new Error("parse_cache.write failed: boom"));

    const result = await parseService({ raw_text: "collab?", source_type: "email" });

    expect(result.inquiry_id).toBe("inquiry-123");
    expect(logError).toHaveBeenCalledWith(
      "parse cache store failed",
      expect.objectContaining({
        code: "PARSE_CACHE_ERROR",
        non_blocking: true,
        cache_lookup_stage: "parse_cache_store",
      }),
    );
  });

  it("throws INQUIRY_PERSIST_FAILED when inquiry insert fails", async () => {
    mockParseWithLlm.mockResolvedValue({ parsed_json: parsedJson, parser_meta: parserMeta });
    mockCreateInquiry.mockRejectedValue(new Error("inquiries.create failed: permission denied"));

    await expect(parseService({ raw_text: "collab?", source_type: "email" })).rejects.toMatchObject({
      code: "INQUIRY_PERSIST_FAILED",
    } satisfies Partial<ParsePipelineError>);
  });
});
