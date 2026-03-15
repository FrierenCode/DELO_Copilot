import { redirect } from "next/navigation";
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

  // Layout already guards auth; this is defense-in-depth.
  if (!user) redirect("/login");

  const [deals, plan] = await Promise.all([
    findDealsByUserId(user.id),
    getUserPlanForUser(user.id),
  ]);

  const policy = PLAN_POLICIES[plan];

  // computeAlerts is server-only; only called here (server component).
  // Free users see no alerts — no partial data exposure.
  const alerts: AlertResult | null = policy.alerts_enabled ? computeAlerts(deals) : null;

  const summary = calcSummary(deals);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">딜 현황</h1>
        <p className="mt-1 text-sm text-neutral-500">브랜드 협업 딜을 관리합니다.</p>
      </div>

      {/* Alerts — Pro only, shown only when there are active alerts */}
      {alerts && alerts.items.length > 0 && <AlertPanel alerts={alerts} />}

      <SummaryCards summary={summary} />

      <DealList deals={deals} />
    </div>
  );
}
