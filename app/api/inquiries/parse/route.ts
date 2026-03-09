import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseService } from "@/services/parse-service";
import { calculateQuote } from "@/services/quote-engine";
import { generateChecks } from "@/services/check-engine";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logInfo, logError } from "@/lib/logger";

const requestSchema = z.object({
  raw_text: z.string().min(1, "raw_text must not be empty"),
  source_type: z.enum(["email", "dm", "other"]),
});

// Default creator profile used until auth + profile lookup is wired up
const DEFAULT_CREATOR_PROFILE = {
  followers_band: "50k_100k" as const,
  avg_views_band: "20k_50k" as const,
  niche: "lifestyle",
  floor_rate: 300000,
};

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(errorResponse("Invalid JSON body"), { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorResponse(parsed.error.issues[0].message), { status: 400 });
  }

  const { raw_text, source_type } = parsed.data;

  try {
    logInfo("parse request received", { source_type, length: raw_text.length });

    const { parsed_json, missing_fields } = await parseService({ raw_text, source_type });
    const quote_breakdown = calculateQuote({
      creator_profile: DEFAULT_CREATOR_PROFILE,
      inquiry: parsed_json,
    });
    const checks = generateChecks(parsed_json);

    logInfo("parse request completed", { check_count: checks.length, missing_count: missing_fields.length });

    return NextResponse.json(
      successResponse({ parsed_json, quote_breakdown, checks, missing_fields }),
    );
  } catch (err) {
    logError("parse request failed", { error: String(err) });
    return NextResponse.json(errorResponse("Failed to parse inquiry"), { status: 500 });
  }
}
