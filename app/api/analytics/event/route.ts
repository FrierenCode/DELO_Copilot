import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { trackEvent, getRequestId } from "@/lib/analytics";
import type { AnalyticsEventName } from "@/lib/analytics-contract";

export const dynamic = "force-dynamic";

const schema = z.object({
  event: z.string().min(1),
  properties: z.record(z.string(), z.unknown()).optional().default({}),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { event, properties } = parsed.data;
  const requestId = getRequestId(req);

  // Best-effort user resolution — anonymous if not authenticated.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  const userId = user?.id ?? "anon";

  trackEvent(userId, event as AnalyticsEventName, {
    ...properties,
    request_id: requestId,
    source: "client",
  });

  return NextResponse.json({ ok: true });
}
