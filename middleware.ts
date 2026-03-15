import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Middleware: Supabase session refresh + /dashboard route protection.
 *
 * Uses process.env directly (not the utils/env helper) because middleware
 * runs in the Edge runtime where import order matters; lib/supabase/server.ts
 * carries "server-only" and cannot be imported here.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          // Write cookies to both the forwarded request and the response so
          // server components downstream see the refreshed session.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add any logic between createServerClient and getUser.
  // Supabase uses this call to refresh the session cookie when needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /dashboard and all sub-paths.
  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.delete("code"); // avoid leaking auth params
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all paths EXCEPT:
     *  - _next/static  (static assets)
     *  - _next/image   (image optimisation)
     *  - favicon.ico
     * Auth routes (/login, /auth/callback) are included so the session
     * cookie is refreshed there too — they just won't hit the redirect guard.
     */
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};
