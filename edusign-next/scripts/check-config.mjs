import { supabaseConfig, databaseUrl, safeError } from "./env.mjs";

let failed = false;
try {
  const { url, key, secret } = supabaseConfig();
  console.log("Supabase public configuration: present");
  const response = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: key },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Auth settings HTTP ${response.status}`);
  const settings = await response.json();
  console.log("Supabase Auth: reachable");
  console.log(
    "Email login:",
    settings.external?.email ? "enabled" : "disabled",
  );
  console.log(
    "Email confirmation:",
    settings.mailer_autoconfirm ? "disabled" : "enabled",
  );
  const schema = await fetch(`${url}/rest/v1/profiles?select=id&limit=0`, {
    headers: { apikey: secret || key },
    signal: AbortSignal.timeout(15_000),
  });
  console.log(
    "Profiles API:",
    schema.ok ? "reachable" : `not ready (HTTP ${schema.status})`,
  );
  if (!schema.ok) failed = true;
} catch (error) {
  console.error("Supabase preflight failed:", safeError(error));
  failed = true;
}
try {
  databaseUrl();
  console.log("Database connection configuration: present");
} catch {
  console.error("Database connection configuration: missing or incomplete");
  failed = true;
}
process.exitCode = failed ? 1 : 0;
