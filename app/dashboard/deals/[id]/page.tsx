import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findDealById } from "@/repositories/deals-repo";
import { findChecksByDealId } from "@/repositories/deal-checks-repo";
import { findDraftsByDealId } from "@/repositories/reply-drafts-repo";
import { findLogsByDealId } from "@/repositories/deal-status-log-repo";
import { DealDetailForm } from "@/components/dashboard/DealDetailForm";

export default async function DashboardDealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const deal = await findDealById(id);

  // Treat missing or unauthorized as 404 to avoid leaking ownership
  if (!deal || deal.user_id !== user.id) notFound();

  const [checks, drafts, statusLogs] = await Promise.all([
    findChecksByDealId(id),
    findDraftsByDealId(id),
    findLogsByDealId(id),
  ]);

  return (
    // key forces DealDetailForm to remount after router.refresh() when updated_at changes,
    // ensuring form state is reset from fresh server props.
    <DealDetailForm
      key={deal.updated_at}
      deal={deal}
      checks={checks}
      drafts={drafts}
      statusLogs={statusLogs}
    />
  );
}
