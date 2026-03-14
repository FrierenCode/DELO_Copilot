import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerate = vi.fn();
const mockGetLlmClient = vi.fn();

vi.mock("@/lib/llm/client-factory", () => ({
  getLlmClient: (...args: unknown[]) => mockGetLlmClient(...args),
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

import { ZodError } from "zod";

import { ParsePipelineError } from "@/lib/parse-error";
import { inquirySchema } from "@/schemas/inquiry.schema";
import { parseWithLlm } from "@/services/parse-llm-service";

// After registry swap: primary=gpt-4o-mini (openai), fallback=gemini-2.5-flash-lite (google)

describe("parseWithLlm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLlmClient.mockReturnValue({ generate: mockGenerate });
  });

  it("classifies missing provider config — error from fallback provider", async () => {
    // Primary (gpt-4o-mini) config failure
    mockGetLlmClient.mockImplementationOnce(() => {
      throw new Error("OPENAI_API_KEY is not set");
    });
    // Fallback (gemini-2.5-flash-lite) config failure
    mockGetLlmClient.mockImplementationOnce(() => {
      throw new Error("GOOGLE_AI_API_KEY is not set");
    });

    await expect(
      parseWithLlm({ raw_text: "hello", source_type: "email" }),
    ).rejects.toMatchObject({
      code: "PROVIDER_CONFIG_ERROR",
      diagnostics: expect.objectContaining({
        provider: "google",
        model: "gemini-2.5-flash-lite",
        failure_stage: "client_init",
      }),
    } satisfies Partial<ParsePipelineError>);
  });

  it("classifies provider request failure — error from fallback provider", async () => {
    mockGenerate.mockRejectedValueOnce(new Error("rate limited"));
    mockGenerate.mockRejectedValueOnce(new Error("upstream timeout"));

    await expect(
      parseWithLlm({ raw_text: "hello", source_type: "email" }),
    ).rejects.toMatchObject({
      code: "PROVIDER_REQUEST_FAILED",
      diagnostics: expect.objectContaining({
        provider_called: true,
        failure_stage: "generate",
      }),
    } satisfies Partial<ParsePipelineError>);
  });

  it("succeeds via fallback when primary generate fails", async () => {
    // Primary (gpt-4o-mini) fails at generate
    mockGenerate.mockRejectedValueOnce(new Error("primary timeout"));

    // Fallback (gemini-2.5-flash-lite) returns valid JSON — schema.parse will use real impl
    const validJson = JSON.stringify({
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
      payment_terms: "net-30",
    });
    mockGenerate.mockResolvedValueOnce({ text: validJson });

    const result = await parseWithLlm({ raw_text: "hello", source_type: "email" });

    expect(result.parser_meta.fallback_used).toBe(true);
    expect(result.parser_meta.provider).toBe("google");
    expect(result.parser_meta.model).toBe("gemini-2.5-flash-lite");
    expect(result.parsed_json.brand_name).toBe("Acme");
  });

  it("classifies invalid JSON provider responses — extract_json stage", async () => {
    mockGenerate.mockResolvedValueOnce({ text: "not json" });
    mockGenerate.mockResolvedValueOnce({ text: "still not json" });

    await expect(
      parseWithLlm({ raw_text: "hello", source_type: "email" }),
    ).rejects.toMatchObject({
      code: "PROVIDER_RESPONSE_INVALID",
      diagnostics: expect.objectContaining({
        failure_stage: "extract_json",
      }),
    } satisfies Partial<ParsePipelineError>);
  });

  it("classifies schema validation failures — schema_validate stage", async () => {
    const parseSpy = vi
      .spyOn(inquirySchema, "parse")
      .mockImplementation(() => {
        throw new ZodError([
          {
            code: "custom",
            message: "schema mismatch",
            path: ["brand_name"],
          },
        ]);
      });
    mockGenerate.mockResolvedValueOnce({ text: "{\"brand_name\":\"Acme\"}" });
    mockGenerate.mockResolvedValueOnce({ text: "{\"brand_name\":\"Acme\"}" });

    await expect(
      parseWithLlm({ raw_text: "hello", source_type: "email" }),
    ).rejects.toMatchObject({
      code: "PARSE_SCHEMA_INVALID",
      diagnostics: expect.objectContaining({
        validation_issues: expect.any(Array),
        failure_stage: "schema_validate",
      }),
    } satisfies Partial<ParsePipelineError>);

    parseSpy.mockRestore();
  });

  it("includes attempt diagnostics for both providers when both fail", async () => {
    mockGenerate.mockRejectedValueOnce(new Error("primary error"));
    mockGenerate.mockRejectedValueOnce(new Error("fallback error"));

    await expect(
      parseWithLlm({ raw_text: "hello", source_type: "email" }),
    ).rejects.toMatchObject({
      diagnostics: expect.objectContaining({
        attempts: expect.arrayContaining([
          expect.objectContaining({ stage: "PRIMARY", provider: "openai", model: "gpt-4o-mini" }),
          expect.objectContaining({ stage: "FALLBACK", provider: "google", model: "gemini-2.5-flash-lite" }),
        ]),
      }),
    } satisfies Partial<ParsePipelineError>);
  });

  it("strips fenced code blocks before JSON extraction", async () => {
    const validJson = JSON.stringify({
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
    });
    // Primary returns JSON wrapped in ```json fence
    mockGenerate.mockResolvedValueOnce({ text: `\`\`\`json\n${validJson}\n\`\`\`` });

    const result = await parseWithLlm({ raw_text: "hello", source_type: "email" });

    expect(result.parser_meta.fallback_used).toBe(false);
    expect(result.parsed_json.brand_name).toBe("Acme");
  });
});
