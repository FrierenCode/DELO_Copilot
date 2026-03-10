const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

type RequiredEnv = (typeof requiredEnv)[number];

function readEnv(name: RequiredEnv): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

// Use getters so env vars are read at access time (runtime), not at module
// load time (build time). This prevents build failures when env vars are
// absent from the CI / build environment.
export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() { return readEnv("NEXT_PUBLIC_SUPABASE_URL"); },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() { return readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"); },
  get SUPABASE_SERVICE_ROLE_KEY() { return readEnv("SUPABASE_SERVICE_ROLE_KEY"); },
};
