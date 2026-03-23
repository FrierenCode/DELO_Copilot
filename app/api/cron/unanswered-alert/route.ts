import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  findUnansweredDealsForCron,
  markDealsNotified,
} from "@/repositories/deals-repo";
import { sendEmail } from "@/lib/email";
import { errorResponse } from "@/lib/api-response";

// ─── Email template ──────────────────────────────────────────────────────────

function buildEmailHtml(
  deals: Array<{ id: string; brand_name: string; budget_mentioned: string; created_at: string }>,
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://delo-app.com";
  const rows = deals
    .map(
      (d) => `
    <tr style="border-bottom:1px solid #e5e7eb">
      <td style="padding:12px 16px;font-size:14px;color:#111827">${d.brand_name}</td>
      <td style="padding:12px 16px;font-size:14px;color:#6b7280">${d.budget_mentioned}</td>
      <td style="padding:12px 16px;font-size:14px;color:#6b7280">${new Date(d.created_at).toLocaleDateString("ko-KR")}</td>
      <td style="padding:12px 16px">
        <a href="${appUrl}/dashboard/deals/${d.id}"
           style="color:#6366f1;font-size:13px;text-decoration:none;font-weight:600">
          확인하기 →
        </a>
      </td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8" /><title>미응답 브랜드 딜 알림</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px">
      <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px">DELO</span>
      <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,.85)">
        답장하지 않은 브랜드 협찬 문의가 있어요
      </p>
    </div>
    <!-- Body -->
    <div style="padding:32px 40px">
      <p style="margin:0 0 20px;font-size:15px;color:#374151">
        아래 딜에 아직 답장하지 않으셨어요. 빠르게 확인하고 기회를 놓치지 마세요.
      </p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:10px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em">브랜드</th>
            <th style="padding:10px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em">제안 금액</th>
            <th style="padding:10px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em">수신일</th>
            <th style="padding:10px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:28px;text-align:center">
        <a href="${appUrl}/dashboard"
           style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:12px 32px;border-radius:9999px;font-size:14px;font-weight:700">
          대시보드에서 전체 보기
        </a>
      </div>
    </div>
    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid #f3f4f6">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
        DELO · 이 메일은 Standard 플랜 사용자에게 발송됩니다
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  // 1. Auth check
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/unanswered-alert] CRON_SECRET is not set");
    return NextResponse.json(errorResponse("INTERNAL_ERROR"), { status: 500 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json(errorResponse("UNAUTHORIZED"), { status: 401 });
  }

  // 2. Fetch all Standard plan users
  const db = createAdminClient();
  const { data: planRows, error: planError } = await db
    .from("user_plans")
    .select("user_id")
    .eq("plan", "standard");

  if (planError) {
    console.error("[cron/unanswered-alert] user_plans query failed:", planError.message);
    return NextResponse.json(errorResponse("INTERNAL_ERROR"), { status: 500 });
  }

  const standardUserIds = (planRows ?? []).map((r: { user_id: string }) => r.user_id);
  if (standardUserIds.length === 0) {
    return NextResponse.json({ processed: 0, skipped: 0 });
  }

  // 3. Fetch unanswered deals (Lead, 7+ days old, not yet notified)
  const unansweredDeals = await findUnansweredDealsForCron(standardUserIds, 7);
  if (unansweredDeals.length === 0) {
    return NextResponse.json({ processed: 0, skipped: 0 });
  }

  // 4. Group by user_id
  const byUser = new Map<string, typeof unansweredDeals>();
  for (const deal of unansweredDeals) {
    const list = byUser.get(deal.user_id) ?? [];
    list.push(deal);
    byUser.set(deal.user_id, list);
  }

  // 5. Resolve emails for each user
  const userIds = Array.from(byUser.keys());
  const { data: authUsers, error: authError } = await db.auth.admin.listUsers();
  if (authError) {
    console.error("[cron/unanswered-alert] auth.admin.listUsers failed:", authError.message);
    return NextResponse.json(errorResponse("INTERNAL_ERROR"), { status: 500 });
  }
  const emailMap = new Map<string, string>(
    (authUsers.users ?? [])
      .filter((u: { id: string; email?: string }) => userIds.includes(u.id) && !!u.email)
      .map((u: { id: string; email?: string }) => [u.id, u.email as string]),
  );

  // 6. Send one email per user; update notified_at for successfully notified deals
  let processed = 0;
  let skipped = 0;

  for (const [userId, deals] of byUser.entries()) {
    const email = emailMap.get(userId);
    if (!email) {
      skipped += deals.length;
      continue;
    }

    try {
      await sendEmail({
        to: email,
        subject: `[DELO] 답장하지 않은 브랜드 딜이 ${deals.length}건 있어요`,
        html: buildEmailHtml(deals),
      });

      await markDealsNotified(deals.map((d) => d.id));
      processed += deals.length;
    } catch (err) {
      console.error(`[cron/unanswered-alert] failed for user ${userId}:`, err);
      skipped += deals.length;
      // Continue to next user — don't abort the whole job
    }
  }

  return NextResponse.json({ processed, skipped });
}

/*
 * Deployment note:
 * - Vercel: add the crons entry in vercel.json (already done). Vercel calls this endpoint
 *   automatically and injects the CRON_SECRET via the Authorization header.
 *
 * - Cloudflare Workers (@opennextjs/cloudflare): Vercel Cron does NOT run in Cloudflare.
 *   Use Cloudflare Cron Triggers instead:
 *     1. Add to wrangler.toml:
 *          [triggers]
 *          crons = ["0 0 * * *"]   # UTC 00:00 = KST 09:00
 *     2. In your Worker entry, handle the scheduled() event and call this endpoint with the
 *        Authorization: Bearer <CRON_SECRET> header.
 */
