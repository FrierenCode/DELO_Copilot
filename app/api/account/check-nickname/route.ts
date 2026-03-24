import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json(errorResponse("UNAUTHORIZED"), { status: 401 });

  const nickname = req.nextUrl.searchParams.get("nickname")?.trim() ?? "";
  if (nickname.length < 2 || nickname.length > 20) {
    return NextResponse.json(errorResponse("INVALID_REQUEST", "유효하지 않은 닉네임입니다"), { status: 400 });
  }

  const admin = createAdminClient();

  // Scan auth.users for nickname uniqueness (suitable for early-stage user counts)
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return NextResponse.json(errorResponse("INTERNAL_ERROR"), { status: 500 });

    const taken = data.users.some(
      (u) => u.id !== user.id && u.user_metadata?.full_name === nickname
    );
    if (taken) return NextResponse.json(successResponse({ available: false }));
    if (data.users.length < 1000) break;
    page++;
  }

  return NextResponse.json(successResponse({ available: true }));
}
