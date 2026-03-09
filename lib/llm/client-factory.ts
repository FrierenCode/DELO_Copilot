import type { LlmClient } from "./provider";
import type { LlmModel, LlmResponse, LlmRequest } from "./types";
import { OpenAiClient } from "./openai-client";
import { GoogleClient } from "./google-client";
import { AnthropicClient } from "./anthropic-client";

// Mock client — returns a deterministic response without any API call
const mockClient: LlmClient = {
  async generate(req: LlmRequest): Promise<LlmResponse> {
    return {
      text: "mock response",
      provider: "mock",
      model: "mock-template",
      latencyMs: 0,
    };
  },
};

export function getLlmClient(model: LlmModel): LlmClient {
  if (model.startsWith("gpt")) return new OpenAiClient();
  if (model.startsWith("gemini")) return new GoogleClient();
  if (model.startsWith("claude")) return new AnthropicClient();
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
