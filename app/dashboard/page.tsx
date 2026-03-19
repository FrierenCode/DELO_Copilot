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
      {/* Page header */}
      <div className="h-16 border-b border-[#1E1E2E] flex items-center justify-between -mx-4 sm:-mx-6 px-8 mb-8 -mt-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Deal Pipeline</h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-400">
            {deals.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <SummaryCards summary={summary} />

        {/* Alerts — Pro only */}
        {alerts && alerts.items.length > 0 && <AlertPanel alerts={alerts} />}
        {!policy.alerts_enabled && (
          <div className="rounded-xl border border-[#1E1E2E] bg-[#13131A] px-4 py-3 text-sm text-slate-500">
            <span className="font-medium text-slate-300">운영 알림</span>은 Pro 전용 기능입니다.
            마감 임박, 미결 항목 등의 알림을 받으려면 Pro로 업그레이드하세요.
          </div>
        )}

        <DealList deals={deals} />
      </div>

      {/* FAB */}
      <Link
        href="/dashboard/intake"
        className="fixed bottom-10 right-10 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-4 px-7 rounded-full shadow-2xl shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95 z-50"
      >
        <span className="text-lg leading-none">+</span>
        <span className="text-sm tracking-tight">새 문의 분석하기</span>
      </Link>
    </>
  );
}
