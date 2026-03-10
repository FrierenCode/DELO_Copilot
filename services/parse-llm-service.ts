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

async function attemptParse(
  input: ParseInput,
  model: LlmModel,
): Promise<InquiryData> {
  const client = getLlmClient(model);
  const prompt = buildParseInquiryPrompt(input);

  const response = await client.generate({
    task: "parse_inquiry",
    model,
    system: prompt.system,
    input: prompt.user,
    temperature: 0,
    maxOutputTokens: 400,
  });

  const raw = JSON.parse(response.text.trim()) as Record<string, unknown>;
  const normalized = normalizeInquiryFields(raw);
  return inquirySchema.parse(normalized);
}

export async function parseWithLlm(input: ParseInput): Promise<ParseLlmResult> {
  const primaryModel = MODEL_POLICY.parse_inquiry.primary;
  const fallbackModel = MODEL_POLICY.parse_inquiry.fallback;

  logInfo("parse llm primary started", { model: primaryModel, prompt_version: PARSE_PROMPT_VERSION });

  try {
    const parsed_json = await attemptParse(input, primaryModel);

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
      const parsed_json = await attemptParse(input, fallbackModel);

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
