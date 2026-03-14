import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CreatorProfile } from "@/types/inquiry";

export type CreatorProfileRecord = CreatorProfile & {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

/** Returns the creator's profile, or null if they haven't set one yet. */
export async function findProfileByUserId(
  userId: string,
): Promise<CreatorProfileRecord | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("creator_profiles")
    .select()
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`creator_profiles.findByUserId failed: ${error.message}`);
  return data as CreatorProfileRecord | null;
}

/** Creates or updates the creator's profile (one profile per user). */
export async function upsertProfile(
  userId: string,
  profile: CreatorProfile,
): Promise<CreatorProfileRecord> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("creator_profiles")
    .upsert(
      { user_id: userId, ...profile, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    )
    .select()
    .single();
  if (error) throw new Error(`creator_profiles.upsert failed: ${error.message}`);
  return data as CreatorProfileRecord;
}
