import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanForUser } from "@/services/usage-guard";
import { PLAN_POLICIES } from "@/lib/plan-policy";
import { SidebarNav } from "@/components/dashboard/SidebarNav";

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

  const plan = await getUserPlanForUser(user.id);
  const isPro = PLAN_POLICIES[plan].alerts_enabled;
  const userName = (user.user_metadata?.full_name as string | undefined) ?? null;

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <SidebarNav userEmail={user.email ?? null} userName={userName} isPro={isPro} />
      <div className="flex flex-1 flex-col overflow-auto">
        <main className="flex-1 px-4 py-6 sm:px-6 text-slate-100">{children}</main>
      </div>
    </div>
  );
}
