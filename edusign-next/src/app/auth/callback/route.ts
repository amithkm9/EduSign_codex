import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/utils";

/**
 * Exchanges the `?code=` from email-confirmation / password-recovery /
 * OAuth links for a session, then redirects. `next` lets the recovery flow
 * land on /auth/update-password.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Validate `next` so a crafted link can't redirect off-site after sign-in.
  const next = safeRedirectPath(searchParams.get("next"), "/dashboard");

  if (searchParams.has("error")) {
    const target = new URL("/login", origin);
    target.searchParams.set(
      "notice",
      searchParams.get("error") === "access_denied"
        ? "oauth_cancelled"
        : "oauth_failed",
    );
    target.searchParams.set("redirectTo", next);
    return NextResponse.redirect(target);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth
      .exchangeCodeForSession(code)
      .catch(() => ({ error: true }));
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?notice=link_expired`);
}
