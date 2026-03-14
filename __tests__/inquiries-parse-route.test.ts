import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { ParsePipelineError } from "@/lib/parse-error";

const mockGetUser = vi.fn();
const mockGetUserPlanForUser = vi.fn();
const mockFindProfileByUserId = vi.fn();
const mockCheckUsageLimit = vi.fn();
const mockRecordUsageEvent = vi.fn();
const mockParseService = vi.fn();
const mockCalculateQuote = vi.fn();
const mockGenerateChecks = vi.fn();
const mockGenerateReplyDrafts = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

vi.mock("@/services/parse-service", () => ({
  parseService: (...args: unknown[]) => mockParseService(...args),
}));

vi.mock("@/services/usage-guard", () => ({
  checkUsageLimit: (...args: unknown[]) => mockCheckUsageLimit(...args),
  recordUsageEvent: (...args: unknown[]) => mockRecordUsageEvent(...args),
  getUserPlanForUser: (...args: unknown[]) => mockGetUserPlanForUser(...args),
}));

vi.mock("@/repositories/creator-profiles-repo", () => ({
  findProfileByUserId: (...args: unknown[]) => mockFindProfileByUserId(...args),
}));

vi.mock("@/services/quote-engine", () => ({
  calculateQuote: (...args: unknown[]) => mockCalculateQuote(...args),
}));

vi.mock("@/services/check-engine", () => ({
  generateChecks: (...args: unknown[]) => mockGenerateChecks(...args),
}));

vi.mock("@/services/reply-generator", () => ({
  generateReplyDrafts: (...args: unknown[]) => mockGenerateReplyDrafts(...args),
}));

const mockTrack = vi.fn();

vi.mock("@/lib/analytics", async () => {
  const actual = await vi.importActual<typeof import("@/lib/analytics")>("@/lib/analytics");
  return {
    ...actual,
    createAnalyticsTracker: () => ({ track: mockTrack }),
  };
});

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

import { POST } from "@/app/api/inquiries/parse/route";

describe("inquiries parse route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTrack.mockReset();
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockCheckUsageLimit.mockResolvedValue(undefined);
    mockRecordUsageEvent.mockResolvedValue(undefined);
    mockGetUserPlanForUser.mockResolvedValue("free");
    mockFindProfileByUserId.mockResolvedValue(null);
    mockCalculateQuote.mockReturnValue({ target: 500, explanation: "base" });
    mockGenerateChecks.mockReturnValue([]);
    mockGenerateReplyDrafts.mockReturnValue({ strategy: "default", drafts: [] });
  });

  it("returns PROVIDER_CONFIG_ERROR when parse provider config is missing", async () => {
    mockParseService.mockRejectedValue(
      new ParsePipelineError("PROVIDER_CONFIG_ERROR", "missing key", {
        route: "parse",
        provider: "google",
        model: "gemini-2.0-flash-lite",
        cache_lookup_stage: "llm_parse",
        provider_called: false,
      }),
    );

    const response = await POST(new NextRequest("http://localhost/api/inquiries/parse", {
      method: "POST",
      body: JSON.stringify({ raw_text: "hello", source_type: "email" }),
    }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: "PROVIDER_CONFIG_ERROR",
        message: "Parse provider is not configured correctly.",
      },
    });
  });

  it("returns PARSE_SCHEMA_INVALID instead of generic PARSE_FAILED", async () => {
    mockParseService.mockRejectedValue(
      new ParsePipelineError("PARSE_SCHEMA_INVALID", "schema mismatch", {
        route: "parse",
        provider: "google",
        model: "gemini-2.0-flash-lite",
        cache_lookup_stage: "llm_parse",
        provider_called: true,
        validation_issues: [{ code: "invalid_type", message: "Required", path: ["brand_name"] }],
      }),
    );

    const response = await POST(new NextRequest("http://localhost/api/inquiries/parse", {
      method: "POST",
      body: JSON.stringify({ raw_text: "hello", source_type: "email" }),
    }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: "PARSE_SCHEMA_INVALID",
        message: "Parsed inquiry did not match the expected schema.",
      },
    });
  });

  it("falls back to PARSE_FAILED for unexpected errors", async () => {
    mockParseService.mockRejectedValue(new Error("boom"));

    const response = await POST(new NextRequest("http://localhost/api/inquiries/parse", {
      method: "POST",
      body: JSON.stringify({ raw_text: "hello", source_type: "email" }),
    }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: "PARSE_FAILED",
        message: "Failed to parse inquiry.",
      },
    });
  });

  it("returns 502 for PROVIDER_REQUEST_FAILED", async () => {
    mockParseService.mockRejectedValue(
      new ParsePipelineError("PROVIDER_REQUEST_FAILED", "rate limited", {
        route: "parse",
        provider: "openai",
        model: "gpt-4o-mini",
        cache_lookup_stage: "llm_parse",
        provider_called: true,
        failure_stage: "generate",
      }),
    );

    const response = await POST(new NextRequest("http://localhost/api/inquiries/parse", {
      method: "POST",
      body: JSON.stringify({ raw_text: "hello", source_type: "email" }),
    }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: "PROVIDER_REQUEST_FAILED",
        message: "Parse provider request failed.",
      },
    });
  });

  it("returns 500 for INQUIRY_PERSIST_FAILED", async () => {
    mockParseService.mockRejectedValue(
      new ParsePipelineError("INQUIRY_PERSIST_FAILED", "db write failed", {
        route: "parse",
        provider: "openai",
        model: "gpt-4o-mini",
        cache_lookup_stage: "inquiry_persist",
        provider_called: true,
      }),
    );

    const response = await POST(new NextRequest("http://localhost/api/inquiries/parse", {
      method: "POST",
      body: JSON.stringify({ raw_text: "hello", source_type: "email" }),
    }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: "INQUIRY_PERSIST_FAILED",
        message: "Failed to persist parsed inquiry.",
      },
    });
  });

  it("returns 200 and full response shape for a valid parse", async () => {
    const parsedJson = {
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
    mockParseService.mockResolvedValue({
      inquiry_id: "inq-abc",
      parsed_json: parsedJson,
      missing_fields: ["usage_rights", "exclusivity", "revisions", "payment_terms"],
    });
    mockCalculateQuote.mockReturnValue({ target: 800, explanation: "standard rate" });
    mockGenerateChecks.mockReturnValue([{ id: "check-1", label: "Low budget", passed: false }]);
    mockGenerateReplyDrafts.mockReturnValue({ strategy: "negotiate", drafts: [{ tone: "polite", body: "Hi" }] });

    const response = await POST(new NextRequest("http://localhost/api/inquiries/parse", {
      method: "POST",
      body: JSON.stringify({ raw_text: "Hi we'd like to collab", source_type: "email" }),
    }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.inquiry_id).toBe("inq-abc");
    expect(body.data.parsed_json).toEqual(parsedJson);
    expect(body.data.missing_fields).toHaveLength(4);
  });

  it("emits parse_failed analytics with parse_failure_code field", async () => {
    mockParseService.mockRejectedValue(
      new ParsePipelineError("PARSE_SCHEMA_INVALID", "schema mismatch", {
        route: "parse",
        provider_called: true,
      }),
    );

    await POST(new NextRequest("http://localhost/api/inquiries/parse", {
      method: "POST",
      body: JSON.stringify({ raw_text: "hello", source_type: "email" }),
    }));

    const failedCall = mockTrack.mock.calls.find((c) => c[0] === "parse_failed");
    expect(failedCall).toBeDefined();
    expect(failedCall![1]).toEqual(expect.objectContaining({
      parse_failure_code: "PARSE_SCHEMA_INVALID",
    }));
  });

  it("returns 400 for missing source_type", async () => {
    const response = await POST(new NextRequest("http://localhost/api/inquiries/parse", {
      method: "POST",
      body: JSON.stringify({ raw_text: "hello" }),
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: "INVALID_REQUEST" },
    });
  });

  it("returns 400 for empty raw_text", async () => {
    const response = await POST(new NextRequest("http://localhost/api/inquiries/parse", {
      method: "POST",
      body: JSON.stringify({ raw_text: "", source_type: "email" }),
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: "INVALID_REQUEST" },
    });
  });
});
