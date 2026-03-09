import "server-only";
import type { LlmClient } from "./provider";
import type { LlmModel, LlmResponse, LlmRequest } from "./types";
import { OpenAiClient } from "./openai-client";
import { GoogleClient } from "./google-client";
import { AnthropicClient } from "./anthropic-client";

// Mock client — returns a deterministic response without any API call
const mockClient: LlmClient = {
  async generate(_req: LlmRequest): Promise<LlmResponse> {
    return {
      text: "mock response",
      provider: "mock",
      model: "mock-template",
      latencyMs: 0,
    };
  },
};

// Lazy singletons — constructed on first use, not at module import time.
// Eager construction would throw at next build because API keys are absent
// from the build environment. Lazy init defers the env check to runtime.
let openAiClient: OpenAiClient | null = null;
let googleClient: GoogleClient | null = null;
let anthropicClient: AnthropicClient | null = null;

function getOpenAiClient(): OpenAiClient {
  if (!openAiClient) openAiClient = new OpenAiClient();
  return openAiClient;
}

function getGoogleClient(): GoogleClient {
  if (!googleClient) googleClient = new GoogleClient();
  return googleClient;
}

function getAnthropicClient(): AnthropicClient {
  if (!anthropicClient) anthropicClient = new AnthropicClient();
  return anthropicClient;
}

export function getLlmClient(model: LlmModel): LlmClient {
  if (model.startsWith("gpt")) return getOpenAiClient();
  if (model.startsWith("gemini")) return getGoogleClient();
  if (model.startsWith("claude")) return getAnthropicClient();
  return mockClient;
}

// Developer reference — not for production use
// const client = getLlmClient("gpt-4o-mini");
// const res = await client.generate({
//   task: "reply_negotiation",
//   model: "gpt-4o-mini",
//   system: "You are a helpful negotiation assistant.",
//   input: "Draft a polite counter-offer for a brand deal.",
// });
// console.log(res.text);
