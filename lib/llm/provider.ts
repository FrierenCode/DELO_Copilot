import type { LlmRequest, LlmResponse } from "./types";

export interface LlmClient {
  generate(req: LlmRequest): Promise<LlmResponse>;
}
