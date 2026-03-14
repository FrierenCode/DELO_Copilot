export type LlmTask = "parse_inquiry" | "reply_negotiation";

export type LlmProvider = "google" | "openai" | "anthropic" | "mock";

export type LlmModel =
  | "gemini-2.0-flash-lite"
  | "gemini-2.5-flash-lite"
  | "gpt-4o-mini"
  | "claude-sonnet-4-6"
  | "mock-template";

export type LlmRequest = {
  task: LlmTask;
  model: LlmModel;
  system: string;
  input: string;
  temperature?: number;
  maxOutputTokens?: number;
};

export type LlmResponse = {
  text: string;
  provider: LlmProvider;
  model: LlmModel;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  finishReason?: string;
};
