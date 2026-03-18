import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IntakeWorkspace } from "@/components/intake/IntakeWorkspace";

export default async function IntakePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Break out of the dashboard main's px-4 py-6 sm:px-6 padding
  return (
    <div className="-mx-4 -my-6 sm:-mx-6">
      <IntakeWorkspace />
    </div>
  );
}
