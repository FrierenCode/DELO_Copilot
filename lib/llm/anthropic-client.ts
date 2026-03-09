import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { LlmClient } from "./provider";
import type { LlmRequest, LlmResponse } from "./types";

const DEFAULT_TEMPERATURE = 0.4;
const DEFAULT_MAX_TOKENS = 300;

export class AnthropicClient implements LlmClient {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

    this.client = new Anthropic({ apiKey });
  }

  async generate(req: LlmRequest): Promise<LlmResponse> {
    if (req.model !== "claude-sonnet-4-6") {
      throw new Error(`Unsupported Anthropic model: ${req.model}`);
    }

    const start = Date.now();

    const message = await this.client.messages.create({
      model: req.model,
      max_tokens: req.maxOutputTokens ?? DEFAULT_MAX_TOKENS,
      temperature: req.temperature ?? DEFAULT_TEMPERATURE,
      system: req.system,
      messages: [{ role: "user", content: req.input }],
    });

    const latencyMs = Date.now() - start;
    const firstBlock = message.content[0];
    const text = firstBlock?.type === "text" ? firstBlock.text : "";

    return {
      text,
      provider: "anthropic",
      model: req.model,
      latencyMs,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      finishReason: message.stop_reason ?? undefined,
    };
  }
}
