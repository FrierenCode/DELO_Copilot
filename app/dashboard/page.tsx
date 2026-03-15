import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already guards this route, but defend in depth.
  if (!user) redirect("/login");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
        Dashboard
      </h1>
      <p className="text-sm text-neutral-500">Auth working — signed in as {user.email}.</p>
    </div>
  );
}
