import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LlmClient } from "./provider";
import type { LlmRequest, LlmResponse } from "./types";

const DEFAULT_TEMPERATURE = 0.3;
const DEFAULT_MAX_TOKENS = 300;

export class GoogleClient implements LlmClient {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not set");

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generate(req: LlmRequest): Promise<LlmResponse> {
    if (req.model !== "gemini-2.0-flash-lite" && req.model !== "gemini-2.5-flash-lite") {
      throw new Error(`Unsupported Google model: ${req.model}`);
    }

    const start = Date.now();

    const model = this.genAI.getGenerativeModel({
      model: req.model,
      systemInstruction: req.system,
      generationConfig: {
        temperature: req.temperature ?? DEFAULT_TEMPERATURE,
        maxOutputTokens: req.maxOutputTokens ?? DEFAULT_MAX_TOKENS,
      },
    });

    const result = await model.generateContent(req.input);
    const latencyMs = Date.now() - start;
    const response = result.response;

    return {
      text: response.text(),
      provider: "google",
      model: req.model,
      latencyMs,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      finishReason: response.candidates?.[0]?.finishReason ?? undefined,
    };
  }
}
