import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function DELETE() {
  // 1. Get the current authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(errorResponse("UNAUTHORIZED", "로그인이 필요합니다."), {
      status: 401,
    });
  }

  try {
    // 2. Delete the auth user via admin client (cascades to all user data via DB constraints)
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      console.error("[account/delete] admin.deleteUser error:", error);
      return NextResponse.json(
        errorResponse("DELETE_FAILED", "계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요."),
        { status: 500 }
      );
    }

    // 3. Sign out the current session
    await supabase.auth.signOut();

    return NextResponse.json(successResponse({ deleted: true }));
  } catch (err) {
    console.error("[account/delete] unexpected error:", err);
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "서버 오류가 발생했습니다."),
      { status: 500 }
    );
  }
}
