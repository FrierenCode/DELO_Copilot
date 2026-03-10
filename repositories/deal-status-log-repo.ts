import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DealStatusLog, DealStatusLogInsert } from "@/types/deal";

export async function createStatusLog(log: DealStatusLogInsert): Promise<DealStatusLog> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("deal_status_logs")
    .insert(log)
    .select()
    .single();
  if (error) throw new Error(`deal_status_logs.create failed: ${error.message}`);
  return data as DealStatusLog;
}

export async function findLogsByDealId(dealId: string): Promise<DealStatusLog[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("deal_status_logs")
    .select()
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`deal_status_logs.findByDealId failed: ${error.message}`);
  return (data ?? []) as DealStatusLog[];
}
