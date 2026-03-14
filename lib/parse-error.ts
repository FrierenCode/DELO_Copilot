import { ZodError, type ZodIssue } from "zod";

import type { LlmModel, LlmProvider } from "@/lib/llm/types";

export type ParseErrorCode =
  | "PROVIDER_CONFIG_ERROR"
  | "PROVIDER_REQUEST_FAILED"
  | "PROVIDER_RESPONSE_INVALID"
  | "PARSE_SCHEMA_INVALID"
  | "PARSE_CACHE_ERROR"
  | "INQUIRY_PERSIST_FAILED"
  | "PARSE_FAILED";

export type CacheLookupStage =
  | "inquiries_lookup"
  | "parse_cache_lookup"
  | "parse_cache_hit_persist"
  | "llm_parse"
  | "inquiry_persist"
  | "parse_cache_store";

export type ParseValidationIssue = Pick<ZodIssue, "code" | "message" | "path">;

export type ParseDiagnostics = {
  route: "parse";
  provider?: LlmProvider | string;
  model?: LlmModel | string;
  cache_lookup_stage?: CacheLookupStage;
  provider_called?: boolean;
  error_name?: string;
  error_message?: string;
  safe_stack?: string;
  validation_issues?: ParseValidationIssue[];
  prompt_version?: string;
  source_type?: string;
  stage?: "PRIMARY" | "FALLBACK";
  attempts?: Array<{
    provider?: string;
    model?: string;
    code?: string;
    stage?: string;
  }>;
  non_blocking?: boolean;
};

export class ParsePipelineError extends Error {
  readonly code: ParseErrorCode;
  readonly diagnostics: ParseDiagnostics;

  constructor(code: ParseErrorCode, message: string, diagnostics: ParseDiagnostics, cause?: unknown) {
    super(message);
    this.name = "ParsePipelineError";
    this.code = code;
    this.diagnostics = diagnostics;
    if (cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

export function isParsePipelineError(err: unknown): err is ParsePipelineError {
  return err instanceof ParsePipelineError;
}

export function getProviderForModel(model: string): LlmProvider | "mock" {
  if (model.startsWith("gpt")) return "openai";
  if (model.startsWith("gemini")) return "google";
  if (model.startsWith("claude")) return "anthropic";
  return "mock";
}

export function getSafeStackSnippet(err: unknown, maxLines = 3): string | undefined {
  if (!(err instanceof Error) || !err.stack) return undefined;
  return err.stack
    .split("\n")
    .slice(0, maxLines)
    .join("\n");
}

export function getValidationIssues(err: unknown): ParseValidationIssue[] | undefined {
  if (!(err instanceof ZodError)) return undefined;
  return err.issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path: issue.path,
  }));
}

export function summarizeError(err: unknown) {
  if (err instanceof Error) {
    return {
      error_name: err.name,
      error_message: err.message,
      safe_stack: getSafeStackSnippet(err),
    };
  }

  return {
    error_name: typeof err,
    error_message: String(err),
    safe_stack: undefined,
  };
}

export function toParsePipelineError(
  err: unknown,
  code: ParseErrorCode,
  message: string,
  diagnostics: ParseDiagnostics,
): ParsePipelineError {
  if (isParsePipelineError(err)) {
    return err;
  }

  return new ParsePipelineError(code, message, {
    ...diagnostics,
    ...summarizeError(err),
  }, err);
}

export function getParseErrorResponse(code: ParseErrorCode) {
  switch (code) {
    case "PROVIDER_CONFIG_ERROR":
      return { status: 500, message: "Parse provider is not configured correctly." };
    case "PROVIDER_REQUEST_FAILED":
      return { status: 502, message: "Parse provider request failed." };
    case "PROVIDER_RESPONSE_INVALID":
      return { status: 502, message: "Parse provider returned an invalid response." };
    case "PARSE_SCHEMA_INVALID":
      return { status: 502, message: "Parsed inquiry did not match the expected schema." };
    case "PARSE_CACHE_ERROR":
      return { status: 500, message: "Parse cache operation failed." };
    case "INQUIRY_PERSIST_FAILED":
      return { status: 500, message: "Failed to persist parsed inquiry." };
    case "PARSE_FAILED":
    default:
      return { status: 500, message: "Failed to parse inquiry." };
  }
}
