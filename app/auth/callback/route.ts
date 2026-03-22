import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    // Build the redirect response first so we can attach cookies directly to it.
    // Using createClient() from lib/supabase/server writes cookies to Next.js's
    // internal cookie store which does NOT propagate into a NextResponse.redirect(),
    // causing the session to be lost and the user to be redirected back to /login.
    const response = NextResponse.redirect(`${origin}/onboarding`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: { name: string; value: string; options: CookieOptions }[]
          ) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }
  }

  // Missing code or exchange failure — send back to login with error hint.
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
