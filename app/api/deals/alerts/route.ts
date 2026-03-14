import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { findDealsByUserId } from "@/repositories/deals-repo";
import { computeAlerts } from "@/services/alert-engine";
import { checkUsageLimit } from "@/services/usage-guard";
import { successResponse, errorResponse } from "@/lib/api-response";
import { trackEvent } from "@/lib/analytics";
import { logInfo, logError } from "@/lib/logger";

// ------------------------------------------------------------------
// GET /api/deals/alerts — PRO-only query-computed alert summary
// ------------------------------------------------------------------
export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
  }

  // Plan gate — alerts are PRO only
  try {
    await checkUsageLimit(user.id, "VIEW_ALERTS");
  } catch (err) {
    const code = err instanceof Error ? err.message : "ALERTS_NOT_AVAILABLE_ON_FREE";
    return NextResponse.json(
      errorResponse(code, "Alerts are available on Pro plan. Upgrade to unlock."),
      { status: 402 },
    );
  }

  try {
    const deals = await findDealsByUserId(user.id);
    const alerts = computeAlerts(deals);

    logInfo("alerts fetched", { user_id: user.id, deal_count: deals.length });
    trackEvent(user.id, "alerts_viewed", { deal_count: deals.length });

    return NextResponse.json(successResponse({ alerts }));
  } catch (err) {
    logError("alerts fetch failed", { user_id: user.id, error: String(err) });
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to compute alerts"),
      { status: 500 },
    );
  }
}
