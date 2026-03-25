import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { findDealById, updateDeal } from "@/repositories/deals-repo";
import { findChecksByDealId } from "@/repositories/deal-checks-repo";
import { findDraftsByDealId } from "@/repositories/reply-drafts-repo";
import { findLogsByDealId, createStatusLog } from "@/repositories/deal-status-log-repo";
import { validateStatusTransition } from "@/services/status-transition";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createAnalyticsTracker, getRequestId } from "@/lib/analytics";
import { logInfo, logError } from "@/lib/logger";
import type { DealStatus } from "@/types/deal";

const dealStatuses: [DealStatus, ...DealStatus[]] = [
  "Lead", "Replied", "Negotiating", "Confirmed", "Delivered", "Paid", "ClosedLost",
];

const patchSchema = z.object({
  status: z.enum(dealStatuses).optional(),
  notes: z.string().max(2000).optional(),
  memo: z.string().max(5000).nullable().optional(),
  next_action: z.string().max(500).optional(),
  next_action_due_at: z.string().datetime().optional(),
  followup_needed: z.boolean().optional(),
  deadline: z.string().datetime().optional(),
  payment_due_date: z.string().datetime().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
  }

  const analytics = createAnalyticsTracker({
    user_id: user.id,
    request_id: getRequestId(req),
  });

  try {
    const deal = await findDealById(id);

    if (!deal) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Deal not found"), { status: 404 });
    }

    if (deal.user_id !== user.id) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "You do not own this deal"),
        { status: 403 },
      );
    }

    const [checks, drafts, status_logs] = await Promise.all([
      findChecksByDealId(id),
      findDraftsByDealId(id),
      findLogsByDealId(id),
    ]);

    logInfo("deal viewed", { user_id: user.id, deal_id: id });
    analytics.track("deal_viewed", { deal_id: id, status: deal.status });

    return NextResponse.json(successResponse({ deal, checks, drafts, status_logs }));
  } catch (err) {
    logError("deal fetch failed", { user_id: user.id, deal_id: id, error: String(err) });
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to fetch deal"),
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
  }

  const analytics = createAnalyticsTracker({
    user_id: user.id,
    request_id: getRequestId(req),
  });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", "Invalid JSON body"),
      { status: 400 },
    );
  }

  const validated = patchSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", validated.error.issues[0].message),
      { status: 400 },
    );
  }

  try {
    const deal = await findDealById(id);

    if (!deal) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Deal not found"), { status: 404 });
    }

    if (deal.user_id !== user.id) {
      return NextResponse.json(
        errorResponse("UNAUTHORIZED", "You do not own this deal"),
        { status: 403 },
      );
    }

    const { status: newStatus, memo, ...rest } = validated.data;

    if (newStatus && newStatus !== deal.status) {
      try {
        validateStatusTransition(deal.status, newStatus);
      } catch {
        return NextResponse.json(
          errorResponse(
            "INVALID_STATUS_TRANSITION",
            `Cannot transition from ${deal.status} to ${newStatus}`,
          ),
          { status: 422 },
        );
      }
    }

    const memoUpdate = memo !== undefined ? { memo: memo === "" ? null : memo } : {};
    const updates = { ...rest, ...memoUpdate, ...(newStatus ? { status: newStatus } : {}) };
    const updated = await updateDeal(id, updates);

    if (newStatus && newStatus !== deal.status) {
      await createStatusLog({
        deal_id: id,
        from_status: deal.status,
        to_status: newStatus,
      });

      analytics.track("deal_status_changed", {
        deal_id: id,
        from_status: deal.status,
        to_status: newStatus,
      });
    }

    logInfo("deal updated", {
      user_id: user.id,
      deal_id: id,
      status_changed: newStatus !== undefined && newStatus !== deal.status,
    });
    analytics.track("deal_updated", { deal_id: id, status: updated.status });

    return NextResponse.json(successResponse({ deal: updated }));
  } catch (err) {
    logError("deal update failed", { user_id: user.id, deal_id: id, error: String(err) });
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to update deal"),
      { status: 500 },
    );
  }
}
