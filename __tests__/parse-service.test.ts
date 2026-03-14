import { describe, it, expect, vi, beforeEach } from "vitest";
import type { InquiryData } from "@/types/inquiry";

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing modules that use them
// ---------------------------------------------------------------------------

const mockFindInquiryByHash = vi.fn();
const mockCreateInquiry = vi.fn();

vi.mock("@/repositories/inquiries-repo", () => ({
  findInquiryByHash: (...args: unknown[]) => mockFindInquiryByHash(...args),
  createInquiry: (...args: unknown[]) => mockCreateInquiry(...args),
}));

const mockStoreParse = vi.fn();
vi.mock("@/repositories/parse-cache-repo", () => ({
  storeParse: (...args: unknown[]) => mockStoreParse(...args),
}));

const mockParseWithLlm = vi.fn();
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

// ---------------------------------------------------------------------------
import { parseService } from "@/services/parse-service";
// ---------------------------------------------------------------------------

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

const PARSER_META = {
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
    parsed_json: PARSED_JSON,
    missing_fields: ["usage_rights", "exclusivity", "revisions", "payment_terms"],
    quote_breakdown_json: null,
    checks_json: [],
    parser_meta: PARSER_META,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("parseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns inquiry_id from cache on hash hit", async () => {
    mockFindInquiryByHash.mockResolvedValue(makeInquiryRecord());
    // LLM must NOT be called on cache hit
    mockParseWithLlm.mockRejectedValue(new Error("LLM should not be called on cache hit"));

    const result = await parseService(
      { raw_text: "Hi, we'd like to collab", source_type: "email" },
      "user-123",
    );

    expect(result.inquiry_id).toBe("inquiry-123");
    expect(mockParseWithLlm).not.toHaveBeenCalled();
  });

  it("returns cached parsed_json on hash hit without calling LLM", async () => {
    mockFindInquiryByHash.mockResolvedValue(makeInquiryRecord());

    const result = await parseService(
      { raw_text: "Hi, we'd like to collab", source_type: "email" },
      "user-123",
    );

    expect(result.parsed_json).toEqual(PARSED_JSON);
    expect(mockParseWithLlm).not.toHaveBeenCalled();
  });

  it("calls LLM and creates inquiry on cache miss", async () => {
    mockFindInquiryByHash.mockResolvedValue(null);
    mockParseWithLlm.mockResolvedValue({ parsed_json: PARSED_JSON, parser_meta: PARSER_META });
    mockCreateInquiry.mockResolvedValue(makeInquiryRecord({ id: "new-inquiry-456" }));

    const result = await parseService({
      raw_text: "Hi, we'd like to collab on reels.",
      source_type: "email",
    });

    expect(mockParseWithLlm).toHaveBeenCalledOnce();
    expect(mockCreateInquiry).toHaveBeenCalledOnce();
    expect(result.inquiry_id).toBe("new-inquiry-456");
  });

  it("stores user_id on the inquiry when userId is provided", async () => {
    mockFindInquiryByHash.mockResolvedValue(null);
    mockParseWithLlm.mockResolvedValue({ parsed_json: PARSED_JSON, parser_meta: PARSER_META });
    mockCreateInquiry.mockResolvedValue(makeInquiryRecord({ user_id: "user-789" }));

    await parseService({ raw_text: "collab?", source_type: "dm" }, "user-789");

    const createCall = mockCreateInquiry.mock.calls[0][0];
    expect(createCall.user_id).toBe("user-789");
  });

  it("stores null user_id for anonymous parse", async () => {
    mockFindInquiryByHash.mockResolvedValue(null);
    mockParseWithLlm.mockResolvedValue({ parsed_json: PARSED_JSON, parser_meta: PARSER_META });
    mockCreateInquiry.mockResolvedValue(makeInquiryRecord());

    await parseService({ raw_text: "collab?", source_type: "dm" });

    const createCall = mockCreateInquiry.mock.calls[0][0];
    expect(createCall.user_id).toBeNull();
  });

  it("raw_text_preview is capped at 200 chars and never the full text", async () => {
    const longText = "A".repeat(5000);
    mockFindInquiryByHash.mockResolvedValue(null);
    mockParseWithLlm.mockResolvedValue({ parsed_json: PARSED_JSON, parser_meta: PARSER_META });
    mockCreateInquiry.mockResolvedValue(makeInquiryRecord());

    await parseService({ raw_text: longText, source_type: "email" });

    const createCall = mockCreateInquiry.mock.calls[0][0];
    expect(createCall.raw_text_preview.length).toBeLessThanOrEqual(200);
  });

  it("fire-and-forgets parse_cache store (does not await)", async () => {
    mockFindInquiryByHash.mockResolvedValue(null);
    mockParseWithLlm.mockResolvedValue({ parsed_json: PARSED_JSON, parser_meta: PARSER_META });
    mockCreateInquiry.mockResolvedValue(makeInquiryRecord());
    mockStoreParse.mockResolvedValue(undefined);

    await parseService({ raw_text: "collab?", source_type: "email" });

    // storeParse should have been called but not awaited (fire-and-forget)
    // Verify it was called at least once (timing may vary)
    expect(mockStoreParse).toHaveBeenCalled();
  });
});
