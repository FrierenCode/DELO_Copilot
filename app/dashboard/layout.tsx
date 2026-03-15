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

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <SidebarNav userEmail={user.email ?? null} isPro={isPro} />
      {/* On mobile, sidebar collapses to a horizontal strip above content.
          At md+ breakpoint it stays fixed-width on the left. */}
      <div className="flex flex-1 flex-col overflow-auto">
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
