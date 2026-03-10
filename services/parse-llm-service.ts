import "server-only";
import { inquirySchema } from "@/schemas/inquiry.schema";
import type { InquiryData, ParseInput } from "@/types/inquiry";
import { getLlmClient } from "@/lib/llm/client-factory";
import { MODEL_POLICY } from "@/lib/llm/registry";
import { buildParseInquiryPrompt, PARSE_PROMPT_VERSION } from "@/lib/llm/prompts/parse-inquiry.prompt";
import { normalizeInquiryFields } from "@/lib/normalize-inquiry";
import { logInfo, logError } from "@/lib/logger";
import type { LlmModel } from "@/lib/llm/types";

export type ParseLlmResult = {
  parsed_json: InquiryData;
  parser_meta: {
    provider: string;
    model: string;
    fallback_used: boolean;
    prompt_version: string;
  };
};

// Patch 2: strip code fences before JSON.parse
function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  // Match ```json ... ``` or ``` ... ```
  const fenced = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

type AttemptStage = "PRIMARY" | "FALLBACK";

async function attemptParse(
  input: ParseInput,
  model: LlmModel,
  stage: AttemptStage,
): Promise<InquiryData> {
  const client = getLlmClient(model);
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
    logError("parse attempt provider error", {
      model,
      stage,
      reason_code: `${stage}_PROVIDER_ERROR`,
      prompt_version: PARSE_PROMPT_VERSION,
      source_type: input.source_type,
      reason: String(err),
    });
    throw err;
  }

  // Patch 1: null-safe text handling
  const text = (response.text ?? "").trim();

  if (!text) {
    const reason_code = `${stage}_EMPTY_RESPONSE`;
    logError("parse attempt empty response", {
      model,
      stage,
      reason_code,
      prompt_version: PARSE_PROMPT_VERSION,
      source_type: input.source_type,
    });
    throw new Error(reason_code);
  }

  // Patch 2: strip code fences
  const jsonText = extractJsonText(text);

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(jsonText) as Record<string, unknown>;
  } catch (err) {
    const reason_code = `${stage}_JSON_PARSE_FAILED`;
    logError("parse attempt json parse failed", {
      model,
      stage,
      reason_code,
      prompt_version: PARSE_PROMPT_VERSION,
      source_type: input.source_type,
      reason: String(err),
    });
    throw new Error(reason_code);
  }

  try {
    const normalized = normalizeInquiryFields(raw);
    return inquirySchema.parse(normalized);
  } catch (err) {
    const reason_code = `${stage}_SCHEMA_VALIDATION_FAILED`;
    logError("parse attempt schema validation failed", {
      model,
      stage,
      reason_code,
      prompt_version: PARSE_PROMPT_VERSION,
      source_type: input.source_type,
      reason: String(err),
    });
    throw new Error(reason_code);
  }
}

export async function parseWithLlm(input: ParseInput): Promise<ParseLlmResult> {
  const primaryModel = MODEL_POLICY.parse_inquiry.primary;
  const fallbackModel = MODEL_POLICY.parse_inquiry.fallback;

  logInfo("parse llm primary started", { model: primaryModel, prompt_version: PARSE_PROMPT_VERSION });

  try {
    const parsed_json = await attemptParse(input, primaryModel, "PRIMARY");

    logInfo("parse llm primary succeeded", { model: primaryModel });

    const provider = primaryModel.startsWith("gemini") ? "google" : "openai";
    return {
      parsed_json,
      parser_meta: {
        provider,
        model: primaryModel,
        fallback_used: false,
        prompt_version: PARSE_PROMPT_VERSION,
      },
    };
  } catch (primaryError) {
    logError("parse llm primary failed", {
      model: primaryModel,
      reason: String(primaryError),
    });
    logInfo("parse llm fallback started", { model: fallbackModel });

    try {
      const parsed_json = await attemptParse(input, fallbackModel, "FALLBACK");

      logInfo("parse llm fallback succeeded", { model: fallbackModel });

      const provider = fallbackModel.startsWith("gpt") ? "openai" : "google";
      return {
        parsed_json,
        parser_meta: {
          provider,
          model: fallbackModel,
          fallback_used: true,
          prompt_version: PARSE_PROMPT_VERSION,
        },
      };
    } catch (fallbackError) {
      logError("parse llm failed", {
        model: fallbackModel,
        reason: String(fallbackError),
      });
      throw new Error("PARSE_INQUIRY_FAILED");
    }
  }
}
