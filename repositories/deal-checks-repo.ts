import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DealCheck, DealCheckInsert } from "@/types/deal";

export async function createDealChecks(checks: DealCheckInsert[]): Promise<DealCheck[]> {
  if (checks.length === 0) return [];
  const db = createAdminClient();
  const { data, error } = await db
    .from("deal_checks")
    .insert(checks)
    .select();
  if (error) throw new Error(`deal_checks.create failed: ${error.message}`);
  return (data ?? []) as DealCheck[];
}

export async function findChecksByDealId(dealId: string): Promise<DealCheck[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("deal_checks")
    .select()
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`deal_checks.findByDealId failed: ${error.message}`);
  return (data ?? []) as DealCheck[];
}

export async function resolveCheck(id: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db
    .from("deal_checks")
    .update({ resolved: true })
    .eq("id", id);
  if (error) throw new Error(`deal_checks.resolve failed: ${error.message}`);
}
