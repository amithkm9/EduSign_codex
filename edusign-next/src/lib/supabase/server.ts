import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

/**
 * Supabase client for Server Components, route handlers and server actions.
 * Reads/writes the auth session via Next's cookie store (async in Next 15).
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: CookieOptions;
        }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `setAll` from a Server Component is a no-op; middleware refreshes
          // the session instead (added in Phase 1).
        }
      },
    },
  });
}
