import { createBrowserClient } from "@supabase/ssr";

type PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

function readPublicEnv(): PublicEnv {
  if (typeof window !== "undefined") {
    const runtimeEnv = (window as Window & {
      __PUBLIC_ENV__?: PublicEnv;
    }).__PUBLIC_ENV__;

    if (runtimeEnv?.NEXT_PUBLIC_SUPABASE_URL && runtimeEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return runtimeEnv;
    }
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function createClient() {
  const publicEnv = readPublicEnv();
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing required public environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!anonKey) {
    throw new Error("Missing required public environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createBrowserClient(url, anonKey);
}
