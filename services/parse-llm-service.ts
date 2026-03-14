import "server-only";
import { inquirySchema } from "@/schemas/inquiry.schema";
import type { InquiryData, ParseInput } from "@/types/inquiry";
import { getLlmClient } from "@/lib/llm/client-factory";
import { MODEL_POLICY } from "@/lib/llm/registry";
import { buildParseInquiryPrompt, PARSE_PROMPT_VERSION } from "@/lib/llm/prompts/parse-inquiry.prompt";
import { normalizeInquiryFields } from "@/lib/normalize-inquiry";
import { extractFirstJSONObject } from "@/lib/llm/extract-json";
import { logInfo, logError } from "@/lib/logger";
import type { LlmModel } from "@/lib/llm/types";
import {
  ParsePipelineError,
  getProviderForModel,
  getValidationIssues,
  summarizeError,
} from "@/lib/parse-error";

export type ParseLlmResult = {
  parsed_json: InquiryData;
  parser_meta: {
    provider: string;
    model: string;
    fallback_used: boolean;
    prompt_version: string;
  };
};

type AttemptStage = "PRIMARY" | "FALLBACK";

async function attemptParse(
  input: ParseInput,
  model: LlmModel,
  stage: AttemptStage,
): Promise<InquiryData> {
  const provider = getProviderForModel(model);
  let client: ReturnType<typeof getLlmClient>;
  try {
    client = getLlmClient(model);
  } catch (err) {
    const details = summarizeError(err);
    logError("parse provider configuration failed", {
      route: "parse",
      provider,
      model,
      stage,
      cache_lookup_stage: "llm_parse",
      provider_called: false,
      prompt_version: PARSE_PROMPT_VERSION,
      source_type: input.source_type,
      ...details,
    });
    throw new ParsePipelineError(
      "PROVIDER_CONFIG_ERROR",
      "Parse provider is not configured correctly.",
      {
        route: "parse",
        provider,
        model,
        stage,
        failure_stage: "client_init",
        cache_lookup_stage: "llm_parse",
        provider_called: false,
        prompt_version: PARSE_PROMPT_VERSION,
        source_type: input.source_type,
        ...details,
      },
      err,
    );
  }

  const prompt = buildParseInquiryPrompt(input);

  let response: Awaited<ReturnType<typeof client.generate>>;
  try {
    response = await client.generate({
      task: "parse_inquiry",
      model,
      system: prompt.system,
      input: prompt.user,
      temperature: 0,
      maxOutputTokens: 400,
    });
  } catch (err) {
    const details = summarizeError(err);
    logError("parse attempt provider error", {
      route: "parse",
      provider,
      model,
      stage,
      code: "PROVIDER_REQUEST_FAILED",
      cache_lookup_stage: "llm_parse",
      provider_called: true,
      prompt_version: PARSE_PROMPT_VERSION,
      source_type: input.source_type,
      ...details,
    });
    throw new ParsePipelineError(
      "PROVIDER_REQUEST_FAILED",
      "Parse provider request failed.",
      {
        route: "parse",
        provider,
        model,
        stage,
        failure_stage: "generate",
        cache_lookup_stage: "llm_parse",
        provider_called: true,
        prompt_version: PARSE_PROMPT_VERSION,
        source_type: input.source_type,
        ...details,
      },
      err,
    );
  }

  // Patch 1: null-safe text handling
  const text = (response.text ?? "").trim();

  if (!text) {
    logError("parse attempt empty response", {
      route: "parse",
      provider,
      model,
      stage,
      code: "PROVIDER_RESPONSE_INVALID",
      cache_lookup_stage: "llm_parse",
      provider_called: true,
      prompt_version: PARSE_PROMPT_VERSION,
      source_type: input.source_type,
    });
    throw new ParsePipelineError("PROVIDER_RESPONSE_INVALID", "Parse provider returned an empty response.", {
      route: "parse",
      provider,
      model,
      stage,
      failure_stage: "generate",
      cache_lookup_stage: "llm_parse",
      provider_called: true,
      prompt_version: PARSE_PROMPT_VERSION,
      source_type: input.source_type,
      error_name: "EmptyProviderResponse",
      error_message: "Provider returned empty text.",
    });
  }

  // Step 10: use extractFirstJSONObject for robust extraction
  let raw: Record<string, unknown>;
  try {
    raw = extractFirstJSONObject(text);
  } catch (err) {
    const details = summarizeError(err);
    logError("parse attempt json extraction failed", {
      route: "parse",
      provider,
      model,
      stage,
      code: "PROVIDER_RESPONSE_INVALID",
      cache_lookup_stage: "llm_parse",
      provider_called: true,
      prompt_version: PARSE_PROMPT_VERSION,
      source_type: input.source_type,
      ...details,
    });
    throw new ParsePipelineError(
      "PROVIDER_RESPONSE_INVALID",
      "Parse provider returned non-JSON output.",
      {
        route: "parse",
        provider,
        model,
        stage,
        failure_stage: "extract_json",
        cache_lookup_stage: "llm_parse",
        provider_called: true,
        prompt_version: PARSE_PROMPT_VERSION,
        source_type: input.source_type,
        ...details,
      },
      err,
    );
  }

  try {
    const normalized = normalizeInquiryFields(raw);
    return inquirySchema.parse(normalized);
  } catch (err) {
    const details = summarizeError(err);
    const validation_issues = getValidationIssues(err);
    logError("parse attempt schema validation failed", {
      route: "parse",
      provider,
      model,
      stage,
      code: "PARSE_SCHEMA_INVALID",
      cache_lookup_stage: "llm_parse",
      provider_called: true,
      prompt_version: PARSE_PROMPT_VERSION,
      source_type: input.source_type,
      validation_issues,
      ...details,
    });
    throw new ParsePipelineError(
      "PARSE_SCHEMA_INVALID",
      "Parsed inquiry did not match the expected schema.",
      {
        route: "parse",
        provider,
        model,
        stage,
        failure_stage: "schema_validate",
        cache_lookup_stage: "llm_parse",
        provider_called: true,
        prompt_version: PARSE_PROMPT_VERSION,
        source_type: input.source_type,
        validation_issues,
        ...details,
      },
      err,
    );
  }
}

export async function parseWithLlm(input: ParseInput): Promise<ParseLlmResult> {
  const primaryModel = MODEL_POLICY.parse_inquiry.primary;
  const fallbackModel = MODEL_POLICY.parse_inquiry.fallback;
  const primaryProvider = getProviderForModel(primaryModel);
  const fallbackProvider = getProviderForModel(fallbackModel);

  logInfo("parse llm provider path selected", {
    route: "parse",
    primary_provider: primaryProvider,
    primary_model: primaryModel,
    fallback_provider: fallbackProvider,
    fallback_model: fallbackModel,
    prompt_version: PARSE_PROMPT_VERSION,
    source_type: input.source_type,
  });

  logInfo("parse llm primary started", { model: primaryModel, prompt_version: PARSE_PROMPT_VERSION });

  try {
    const parsed_json = await attemptParse(input, primaryModel, "PRIMARY");

    logInfo("parse llm primary succeeded", { model: primaryModel });

    return {
      parsed_json,
      parser_meta: {
        provider: primaryProvider,
        model: primaryModel,
        fallback_used: false,
        prompt_version: PARSE_PROMPT_VERSION,
      },
    };
  } catch (primaryError) {
    const primaryDetails = summarizeError(primaryError);
    logError("parse llm primary failed", {
      route: "parse",
      provider: primaryProvider,
      model: primaryModel,
      ...primaryDetails,
    });
    logInfo("parse llm fallback started", { model: fallbackModel });

    try {
      const parsed_json = await attemptParse(input, fallbackModel, "FALLBACK");

      logInfo("parse llm fallback succeeded", { model: fallbackModel });

      return {
        parsed_json,
        parser_meta: {
          provider: fallbackProvider,
          model: fallbackModel,
          fallback_used: true,
          prompt_version: PARSE_PROMPT_VERSION,
        },
      };
    } catch (fallbackError) {
      const fallbackDetails = summarizeError(fallbackError);
      logError("parse llm failed", {
        route: "parse",
        provider: fallbackProvider,
        model: fallbackModel,
        ...fallbackDetails,
        attempts: [
          {
            provider: primaryProvider,
            model: primaryModel,
            code: primaryError instanceof ParsePipelineError ? primaryError.code : undefined,
            stage: "PRIMARY",
          },
          {
            provider: fallbackProvider,
            model: fallbackModel,
            code: fallbackError instanceof ParsePipelineError ? fallbackError.code : undefined,
            stage: "FALLBACK",
          },
        ],
      });
      if (fallbackError instanceof ParsePipelineError) {
        throw new ParsePipelineError(
          fallbackError.code,
          fallbackError.message,
          {
            ...fallbackError.diagnostics,
            attempts: [
              {
                provider: primaryProvider,
                model: primaryModel,
                code: primaryError instanceof ParsePipelineError ? primaryError.code : undefined,
                stage: "PRIMARY",
              },
              {
                provider: fallbackProvider,
                model: fallbackModel,
                code: fallbackError.code,
                stage: "FALLBACK",
              },
            ],
          },
          fallbackError,
        );
      }

      throw new ParsePipelineError("PARSE_FAILED", "Failed to parse inquiry.", {
        route: "parse",
        provider: fallbackProvider,
        model: fallbackModel,
        cache_lookup_stage: "llm_parse",
        provider_called: true,
        prompt_version: PARSE_PROMPT_VERSION,
        source_type: input.source_type,
        attempts: [
          {
            provider: primaryProvider,
            model: primaryModel,
            code: primaryError instanceof ParsePipelineError ? primaryError.code : undefined,
            stage: "PRIMARY",
          },
          {
            provider: fallbackProvider,
            model: fallbackModel,
            stage: "FALLBACK",
          },
        ],
        ...fallbackDetails,
      }, fallbackError);
    }
  }
}
