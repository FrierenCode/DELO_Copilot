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

describe("parseWithLlm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLlmClient.mockReturnValue({ generate: mockGenerate });
  });

  it("classifies missing provider config", async () => {
    mockGetLlmClient.mockImplementationOnce(() => {
      throw new Error("GOOGLE_AI_API_KEY is not set");
    });
    mockGetLlmClient.mockImplementationOnce(() => {
      throw new Error("OPENAI_API_KEY is not set");
    });

    await expect(
      parseWithLlm({ raw_text: "hello", source_type: "email" }),
    ).rejects.toMatchObject({
      code: "PROVIDER_CONFIG_ERROR",
      diagnostics: expect.objectContaining({
        provider: "openai",
        model: "gpt-4o-mini",
      }),
    } satisfies Partial<ParsePipelineError>);
  });

  it("classifies provider request failure", async () => {
    mockGenerate.mockRejectedValueOnce(new Error("rate limited"));
    mockGenerate.mockRejectedValueOnce(new Error("upstream timeout"));

    await expect(
      parseWithLlm({ raw_text: "hello", source_type: "email" }),
    ).rejects.toMatchObject({
      code: "PROVIDER_REQUEST_FAILED",
      diagnostics: expect.objectContaining({
        provider_called: true,
      }),
    } satisfies Partial<ParsePipelineError>);
  });

  it("classifies invalid JSON provider responses", async () => {
    mockGenerate.mockResolvedValueOnce({ text: "not json" });
    mockGenerate.mockResolvedValueOnce({ text: "still not json" });

    await expect(
      parseWithLlm({ raw_text: "hello", source_type: "email" }),
    ).rejects.toMatchObject({
      code: "PROVIDER_RESPONSE_INVALID",
    } satisfies Partial<ParsePipelineError>);
  });

  it("classifies schema validation failures", async () => {
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
      }),
    } satisfies Partial<ParsePipelineError>);

    parseSpy.mockRestore();
  });
});
