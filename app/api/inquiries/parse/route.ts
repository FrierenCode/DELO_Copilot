import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseService } from "@/services/parse-service";
import { calculateQuote } from "@/services/quote-engine";
import { generateChecks } from "@/services/check-engine";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logInfo, logError } from "@/lib/logger";

const requestSchema = z.object({
  raw_text: z.string().min(1, "raw_text must not be empty"),
});

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

  const { raw_text } = parsed.data;

  try {
    logInfo("parse request received", { length: raw_text.length });

    const parsedInquiry = await parseService(raw_text);
    const quote = calculateQuote({
      followers_band: "50k_100k",
      avg_views_band: "20k_50k",
      category: "lifestyle",
      usage_rights: parsedInquiry.usage_rights !== "not specified",
      exclusivity: parsedInquiry.exclusivity !== "not specified",
      timeline_days: 14,
    });
    const checks = generateChecks(parsedInquiry);

    logInfo("parse request completed", { check_count: checks.length });

    return NextResponse.json(
      successResponse({ parsed_inquiry: parsedInquiry, quote, checks }),
    );
  } catch (err) {
    logError("parse request failed", { error: String(err) });
    return NextResponse.json(errorResponse("Failed to parse inquiry"), { status: 500 });
  }
}
