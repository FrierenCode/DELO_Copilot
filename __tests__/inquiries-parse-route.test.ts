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

vi.mock("@/lib/analytics", async () => {
  const actual = await vi.importActual<typeof import("@/lib/analytics")>("@/lib/analytics");
  return {
    ...actual,
    createAnalyticsTracker: () => ({ track: vi.fn() }),
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
});
