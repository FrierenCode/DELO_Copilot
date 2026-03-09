import { createClient } from "@/lib/supabase/client";

export async function sendMagicLink(email: string) {
  const supabase = createClient();

  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    },
  });
}
