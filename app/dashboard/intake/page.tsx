import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findProfileByUserId } from "@/repositories/creator-profiles-repo";
import { IntakeWorkspace } from "@/components/intake/IntakeWorkspace";

export default async function IntakePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Always require onboarding before analysis, even if the user skipped earlier.
  const profile = await findProfileByUserId(user.id);
  if (!profile) redirect("/onboarding");

  // Break out of the dashboard main's px-4 py-6 sm:px-6 padding
  return (
    <div className="-mx-4 -my-6 sm:-mx-6">
      <IntakeWorkspace />
    </div>
  );
}
