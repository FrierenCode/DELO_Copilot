import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function IntakePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
        You&apos;re all set
      </h1>
      <p className="text-sm text-neutral-500">
        Your creator profile has been saved. Head to the{" "}
        <a
          href="/parse"
          className="font-medium text-neutral-900 underline underline-offset-2 hover:opacity-75"
        >
          parse workspace
        </a>{" "}
        to analyse your first brand inquiry.
      </p>
    </div>
  );
}
