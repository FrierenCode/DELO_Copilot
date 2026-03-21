import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { parseWithLlm } from "@/services/parse-llm-service";
import { calculateQuote } from "@/services/quote-engine";
import { generateChecks } from "@/services/check-engine";
import { generateReplyDrafts } from "@/services/reply-generator";
import { getPlanPolicy } from "@/lib/plan-policy";
import { DEFAULT_CREATOR_PROFILE } from "@/services/deal-service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { sanitizeRawText } from "@/lib/inquiry/sanitize-raw-text";
import {
  getParseErrorResponse,
  isParsePipelineError,
  summarizeError,
} from "@/lib/parse-error";
import type { InquiryData } from "@/types/inquiry";

// In-memory rate limiter — IP → { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const REQUIRED_FIELDS: (keyof InquiryData)[] = [
  "brand_name",
  "contact_name",
  "platform_requested",
  "deliverables",
  "timeline",
  "compensation_type",
  "budget_mentioned",
  "usage_rights",
  "exclusivity",
  "revisions",
  "payment_terms",
];

const MISSING_SENTINEL = "not specified";

const requestSchema = z.object({
  content: z.string().min(1, "content must not be empty"),
});

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", "잠시 후 다시 시도해주세요"),
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", "Invalid JSON body"),
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", parsed.error.issues[0].message),
      { status: 400 },
    );
  }

  const { sanitized_text } = sanitizeRawText(
    parsed.data.content.slice(0, 10_000),
  );

  const policy = getPlanPolicy("free");
  const creator_profile = DEFAULT_CREATOR_PROFILE;

  try {
    const { parsed_json } = await parseWithLlm({
      raw_text: sanitized_text,
      source_type: "other",
    });

    const missing_fields = REQUIRED_FIELDS.filter(
      (field) => parsed_json[field].toLowerCase().trim() === MISSING_SENTINEL,
    );

    const quote_breakdown = calculateQuote({ creator_profile, inquiry: parsed_json });
    const checks = generateChecks(parsed_json);
    const { drafts } = generateReplyDrafts({
      parsed_json,
      quote_breakdown,
      missing_fields,
      plan: "free",
    });

    return NextResponse.json(
      successResponse({
        inquiry_id: "demo",
        parsed_json,
        quote_breakdown: policy.full_quote_breakdown
          ? quote_breakdown
          : { target: quote_breakdown.target, explanation: quote_breakdown.explanation },
        checks: policy.full_checks_list ? checks : [],
        missing_fields,
        reply_drafts: drafts,
        reply_meta: {
          negotiation_ai_available: policy.negotiation_ai_enabled,
        },
      }),
    );
  } catch (err) {
    const details = isParsePipelineError(err)
      ? { code: err.code, ...err.diagnostics }
      : {
          code: "PARSE_FAILED" as const,
          route: "demo-parse" as const,
          source_type: "other" as const,
          ...summarizeError(err),
        };

    const parseErrorCode = details.code;
    const { status, message } = getParseErrorResponse(parseErrorCode);
    return NextResponse.json(errorResponse(parseErrorCode, message), { status });
  }
}
