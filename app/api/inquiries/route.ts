import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { listRecentInquiries } from "@/repositories/inquiries-repo";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const rows = await listRecentInquiries(user?.id ?? null);

    const data = rows.map((row) => ({
      id: row.id,
      brand: row.parsed_json.brand_name,
      platform: row.parsed_json.platform_requested,
      deliverables: row.parsed_json.deliverables,
      suggested_price: row.quote_breakdown_json?.target ?? null,
      created_at: row.created_at,
    }));

    return NextResponse.json(successResponse(data));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", message),
      { status: 500 },
    );
  }
}
