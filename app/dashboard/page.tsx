import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { findDealsByUserId } from "@/repositories/deals-repo";
import { computeAlerts } from "@/services/alert-engine";
import { getUserPlanForUser } from "@/services/usage-guard";
import { PLAN_POLICIES } from "@/lib/plan-policy";
import { calcSummary } from "@/lib/dashboard-helpers";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { DealList } from "@/components/dashboard/DealList";
import type { AlertResult } from "@/types/dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [deals, plan] = await Promise.all([
    findDealsByUserId(user.id),
    getUserPlanForUser(user.id),
  ]);

  const policy = PLAN_POLICIES[plan];
  const alerts: AlertResult | null = policy.alerts_enabled ? computeAlerts(deals) : null;
  const summary = calcSummary(deals);

  return (
    <>
      <div className="relative mb-6 -mx-4 -mt-5 flex min-h-14 items-center justify-between border-b border-[var(--d-border)] px-4 sm:-mx-6 sm:mb-8 sm:-mt-6 sm:h-16 sm:px-8">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/20 to-transparent" />
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black tracking-tight text-[var(--d-h)]">Deal Pipeline</h1>
          <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#6366F1]/15 px-1.5 text-[10px] font-black tabular-nums text-[#a78bfa]">
            {deals.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <SummaryCards summary={summary} />

        {alerts && alerts.items.length > 0 && <AlertPanel alerts={alerts} />}
        {!policy.alerts_enabled && (
          <div className="relative overflow-hidden rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] px-5 py-4">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/30 to-transparent" />
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#6366F1]/15 text-[#a78bfa]">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </span>
              <p className="text-sm text-[var(--d-m)]">
                <span className="font-bold text-[var(--d-b)]">운영 알림</span>은 Standard 전용 기능입니다. 마감 임박과 미결 체크를 받으려면{" "}
                <Link href="/dashboard/settings" className="font-bold text-[#a78bfa] transition-all hover:brightness-110">
                  Standard로 업그레이드
                </Link>
                하세요.
              </p>
            </div>
          </div>
        )}

        <DealList deals={deals} />
      </div>

      <Link
        href="/dashboard/intake"
        className="btn-gradient fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-white shadow-xl shadow-[#6366F1]/25 hover:scale-105 active:scale-95 md:bottom-10 md:right-10 md:px-7 md:py-4"
      >
        <span className="text-lg leading-none">+</span>
        <span className="text-sm font-bold tracking-tight">새 문의 분석하기</span>
      </Link>
    </>
  );
}
