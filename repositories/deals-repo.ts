import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Deal, DealInsert, DealStatus, DealUpdate } from "@/types/deal";

export async function createDeal(data: DealInsert): Promise<Deal> {
  const db = createAdminClient();
  const { data: row, error } = await db
    .from("deals")
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(`deals.create failed: ${error.message}`);
  return row as Deal;
}

export async function updateDeal(id: string, data: DealUpdate): Promise<Deal> {
  const db = createAdminClient();
  const { data: row, error } = await db
    .from("deals")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`deals.update failed: ${error.message}`);
  return row as Deal;
}

export async function findDealById(id: string): Promise<Deal | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("deals")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`deals.findById failed: ${error.message}`);
  return data as Deal | null;
}

export async function findDealsByUserId(userId: string, status?: DealStatus): Promise<Deal[]> {
  const db = createAdminClient();
  let query = db
    .from("deals")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(`deals.findByUserId failed: ${error.message}`);
  return (data ?? []) as Deal[];
}

export async function deleteDeal(id: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from("deals").delete().eq("id", id);
  if (error) throw new Error(`deals.delete failed: ${error.message}`);
}
