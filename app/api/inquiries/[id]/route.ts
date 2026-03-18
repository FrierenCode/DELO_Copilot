import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { findInquiryById, patchInquiryReplies } from "@/repositories/inquiries-repo";
import { findProfileByUserId } from "@/repositories/creator-profiles-repo";
import { DEFAULT_CREATOR_PROFILE } from "@/services/deal-service";
import { calculateQuote } from "@/services/quote-engine";
import { generateChecks } from "@/services/check-engine";
import { generateReplyDrafts } from "@/services/reply-generator";
import { getUserPlanForUser } from "@/services/usage-guard";
import { successResponse, errorResponse } from "@/lib/api-response";

const patchSchema = z.object({
  reply_drafts: z.object({
    polite: z.string().optional(),
    quick: z.string().nullable().optional(),
    negotiation: z.string().nullable().optional(),
  }),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const inquiry = await findInquiryById(id);
    if (!inquiry) {
      return NextResponse.json(
        errorResponse("NOT_FOUND", "Inquiry not found."),
        { status: 404 },
      );
    }

    const plan = user?.id ? await getUserPlanForUser(user.id) : "free";
    const creator_profile = user?.id
      ? (await findProfileByUserId(user.id)) ?? DEFAULT_CREATOR_PROFILE
      : DEFAULT_CREATOR_PROFILE;

    const quote_breakdown = calculateQuote({ creator_profile, inquiry: inquiry.parsed_json });
    const checks = generateChecks(inquiry.parsed_json);
    const { drafts } = generateReplyDrafts({
      parsed_json: inquiry.parsed_json,
      quote_breakdown,
      missing_fields: inquiry.missing_fields,
      plan,
    });

    // Merge stored edits on top of generated drafts
    const stored = inquiry.reply_drafts_json;
    const reply_drafts = {
      polite: stored?.polite ?? drafts.polite,
      quick: stored?.quick !== undefined ? stored.quick : drafts.quick,
      negotiation: stored?.negotiation !== undefined ? stored.negotiation : drafts.negotiation,
    };

    return NextResponse.json(
      successResponse({
        inquiry_id: inquiry.id,
        parsed_json: inquiry.parsed_json,
        quote_breakdown,
        checks,
        missing_fields: inquiry.missing_fields,
        reply_drafts,
        reply_meta: { negotiation_ai_available: plan === "pro" },
        created_at: inquiry.created_at,
        raw_text_preview: inquiry.raw_text_preview,
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", message),
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const inquiry = await findInquiryById(id);
    if (!inquiry) {
      return NextResponse.json(
        errorResponse("NOT_FOUND", "Inquiry not found."),
        { status: 404 },
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

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("INVALID_REQUEST", parsed.error.issues[0].message),
        { status: 400 },
      );
    }

    await patchInquiryReplies(id, parsed.data.reply_drafts);

    return NextResponse.json(successResponse({ updated: true }));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", message),
      { status: 500 },
    );
  }
}
