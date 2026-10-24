/** Only these two values may be exposed to the browser. Never return a secret key. */
export function publicSupabaseConfig(env) {
  const first = (...values) =>
    values.find((value) => typeof value === "string" && value.trim())?.trim();
  const url = first(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_URL);
  const key = first(
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    env.SUPABASE_PUBLISHABLE_KEY,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!url || !key)
    throw new Error("Supabase: project URL and publishable key are required.");
  const parsed = new URL(url);
  if (
    !["https:", "http:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error("Supabase: invalid project URL.");
  }
  let role;
  if (key.split(".").length === 3) {
    try {
      role = JSON.parse(
        atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ).role;
    } catch {
      /* Validated by Supabase. */
    }
  }
  if (key.startsWith("sb_secret_") || role === "service_role") {
    throw new Error(
      "Supabase: a server secret cannot be used as a publishable key.",
    );
  }
  return { url: url.replace(/\/$/, ""), key };
}
