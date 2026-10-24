import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

/** Routes that require an authenticated user. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/tutor",
  "/report",
  "/onboarding",
  "/auth/update-password",
];

/**
 * Refreshes the Supabase session cookie on every request and redirects
 * unauthenticated users away from protected routes. Edge-safe: uses only
 * @supabase/ssr (no DB/Drizzle imports here).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url: projectUrl, key } = getSupabaseConfig();

  const supabase = createServerClient(projectUrl, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: CookieOptions;
        }[],
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: getUser() (not getSession) revalidates the token with Supabase.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  function redirectWithCookies(url: URL) {
    const response = NextResponse.redirect(url);
    for (const cookie of supabaseResponse.cookies.getAll())
      response.cookies.set(cookie);
    return response;
  }

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirectTo", pathname + request.nextUrl.search);
    return redirectWithCookies(url);
  }

  // Logged-in users shouldn't see auth pages.
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return redirectWithCookies(url);
  }

  return supabaseResponse;
}
