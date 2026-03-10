import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReplyDraftRecord, ReplyDraftInsert } from "@/types/deal";

export async function createReplyDrafts(drafts: ReplyDraftInsert[]): Promise<ReplyDraftRecord[]> {
  if (drafts.length === 0) return [];
  const db = createAdminClient();
  const { data, error } = await db
    .from("reply_drafts")
    .insert(drafts)
    .select();
  if (error) throw new Error(`reply_drafts.create failed: ${error.message}`);
  return (data ?? []) as ReplyDraftRecord[];
}

export async function findDraftsByDealId(dealId: string): Promise<ReplyDraftRecord[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("reply_drafts")
    .select()
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`reply_drafts.findByDealId failed: ${error.message}`);
  return (data ?? []) as ReplyDraftRecord[];
}
