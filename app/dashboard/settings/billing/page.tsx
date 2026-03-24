import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanForUser } from "@/services/usage-guard";
import { findSubscriptionByUserId } from "@/repositories/subscriptions-repo";
import { SettingsBillingPanel } from "@/components/settings/SettingsBillingPanel";

export const dynamic = "force-dynamic";

export default async function BillingSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const plan = await getUserPlanForUser(user.id);
  const subscription = await findSubscriptionByUserId(user.id).catch(() => null);

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto">
      {/* Back + Header */}
      <div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--d-m)] transition-colors hover:text-[var(--d-h)] mb-3"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          설정으로 돌아가기
        </Link>
        <h1 className="text-xl font-black text-[var(--d-h)]">구독 & 결제</h1>
        <p className="mt-0.5 text-sm text-[var(--d-m)]">현재 플랜을 확인하고 업그레이드합니다.</p>
      </div>

      <SettingsBillingPanel
        plan={plan}
        subscriptionStatus={subscription?.status ?? null}
        currentPeriodEnd={subscription?.current_period_end ?? null}
      />
    </div>
  );
}
