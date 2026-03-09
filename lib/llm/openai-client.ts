import OpenAI from "openai";
import type { LlmClient } from "./provider";
import type { LlmRequest, LlmResponse } from "./types";

const DEFAULT_TEMPERATURE = 0.4;
const DEFAULT_MAX_TOKENS = 300;

export class OpenAiClient implements LlmClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(req: LlmRequest): Promise<LlmResponse> {
    const start = Date.now();

    const completion = await this.client.chat.completions.create({
      model: req.model,
      temperature: req.temperature ?? DEFAULT_TEMPERATURE,
      max_tokens: req.maxOutputTokens ?? DEFAULT_MAX_TOKENS,
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.input },
      ],
    });

    const latencyMs = Date.now() - start;
    const choice = completion.choices[0];

    return {
      text: choice.message.content ?? "",
      provider: "openai",
      model: req.model,
      latencyMs,
      inputTokens: completion.usage?.prompt_tokens,
      outputTokens: completion.usage?.completion_tokens,
      finishReason: choice.finish_reason ?? undefined,
    };
  }
}
