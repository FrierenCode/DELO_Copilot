import { createClient } from "@/lib/supabase/server";
import { getUserPlanForUser } from "@/services/usage-guard";
import { findSubscriptionByUserId } from "@/repositories/subscriptions-repo";
import { SettingsBillingPanel } from "@/components/settings/SettingsBillingPanel";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const plan = await getUserPlanForUser(user.id);
  const subscription = await findSubscriptionByUserId(user.id).catch(() => null);

  return (
    <div className="flex flex-col gap-8 min-h-screen bg-[#0A0A0F] px-4 py-6 sm:px-6 text-slate-100">
      <header>
        <h1 className="text-2xl font-bold text-white">설정</h1>
        <p className="mt-1 text-sm text-slate-400">계정 및 구독을 관리합니다.</p>
      </header>

      <SettingsBillingPanel
        plan={plan}
        email={user.email ?? ""}
        createdAt={user.created_at ?? null}
        subscriptionStatus={subscription?.status ?? null}
        currentPeriodEnd={subscription?.current_period_end ?? null}
      />
    </div>
  );
}
