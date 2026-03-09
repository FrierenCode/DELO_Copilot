import type { LlmModel, LlmTask } from "./types";

type ModelPolicy = Record<LlmTask, { primary: LlmModel; fallback: LlmModel }>;

export const MODEL_POLICY: ModelPolicy = {
  parse_inquiry: {
    primary: "gemini-2.0-flash-lite",
    fallback: "gpt-4o-mini",
  },
  reply_negotiation: {
    primary: "gpt-4o-mini",
    fallback: "claude-sonnet-4-6",
  },
};
