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
    <div className="flex flex-col gap-8">
      <div className="h-px bg-gradient-to-r from-transparent via-[#6366F1]/35 to-transparent" />
      <header>
        <h1 className="text-2xl font-black text-[var(--d-h)]">설정</h1>
        <p className="mt-1 text-sm text-[var(--d-m)]">계정 및 구독을 관리합니다.</p>
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
