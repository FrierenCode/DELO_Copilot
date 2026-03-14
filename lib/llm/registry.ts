import type { LlmModel, LlmTask } from "./types";

type ModelPolicy = Record<LlmTask, { primary: LlmModel; fallback: LlmModel }>;

export const MODEL_POLICY: ModelPolicy = {
  parse_inquiry: {
    primary: "gpt-4o-mini",
    fallback: "gemini-2.5-flash-lite",
  },
  reply_negotiation: {
    primary: "gpt-4o-mini",
    fallback: "claude-sonnet-4-6",
  },
};
