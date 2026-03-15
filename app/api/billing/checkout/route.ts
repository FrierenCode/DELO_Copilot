import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/services/billing-service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logError } from "@/lib/logger";
import { captureException } from "@/lib/sentry";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  cancel_path: z.string().optional().default("/settings"),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(errorResponse("UNAUTHORIZED", "Login required"), { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json().catch(() => ({}));
  } catch {
    body = {};
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", parsed.error.issues[0].message),
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const successUrl = `${appUrl}/dashboard?upgraded=true`;

  try {
    const result = await createCheckoutSession(
      user.id,
      user.email ?? "",
      parsed.data.cancel_path,
      successUrl,
    );
    return NextResponse.json(successResponse({ url: result.url }));
  } catch (err) {
    logError("checkout session creation failed", { userId: user.id });
    captureException(err, { userId: user.id, route: "billing/checkout" });
    return NextResponse.json(
      errorResponse("INTERNAL_ERROR", "Failed to create checkout session"),
      { status: 500 },
    );
  }
}
