import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanForUser } from "@/services/usage-guard";
import { PLAN_POLICIES } from "@/lib/plan-policy";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { findProfileByUserId } from "@/repositories/creator-profiles-repo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Onboarding gate: redirect to onboarding if profile not set up yet,
  // unless the user explicitly clicked "나중에 하기" (cookie flag).
  const cookieStore = await cookies();
  const onboardingSkipped = cookieStore.get("onboarding_skipped")?.value === "1";
  if (!onboardingSkipped) {
    const profile = await findProfileByUserId(user.id);
    if (!profile) redirect("/onboarding");
  }

  const plan = await getUserPlanForUser(user.id);
  const isPro = PLAN_POLICIES[plan].alerts_enabled;
  const userName = (user.user_metadata?.full_name as string | undefined) ?? null;

  return (
    <div className="dashboard-theme flex h-screen overflow-hidden">
      <SidebarNav userEmail={user.email ?? null} userName={userName} isPro={isPro} />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <main className="flex-1 px-4 py-6 sm:px-6 text-[var(--d-h)]">{children}</main>
      </div>
    </div>
  );
}
