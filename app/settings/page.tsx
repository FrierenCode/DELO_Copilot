import { redirect } from "next/navigation";
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

  if (!user) redirect("/login");

  const plan = await getUserPlanForUser(user.id);
  const subscription = await findSubscriptionByUserId(user.id).catch(() => null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Account and billing.</p>
      </div>

      <SettingsBillingPanel
        plan={plan}
        email={user.email ?? ""}
        subscriptionStatus={subscription?.status ?? null}
        currentPeriodEnd={subscription?.current_period_end ?? null}
      />
    </div>
  );
}
