import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findProfileByUserId } from "@/repositories/creator-profiles-repo";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  // Auth check — redirect unauthenticated users.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Profile check — skip onboarding if already completed.
  const profile = await findProfileByUserId(user.id);
  if (profile) redirect("/dashboard/intake");

  return <OnboardingWizard />;
}
