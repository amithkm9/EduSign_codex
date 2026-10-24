import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { publicSupabaseConfig } from "../src/lib/config/supabase-env.mjs";

export const appRoot = fileURLToPath(new URL("../", import.meta.url));
// Match Next's precedence. Existing process variables take priority.
config({
  path: fileURLToPath(new URL("../.env.local", import.meta.url)),
  quiet: true,
});
config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});

export function databaseUrl({ migration = false } = {}) {
  const value = (
    migration
      ? process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL
      : process.env.DATABASE_URL
  )?.trim();
  if (!value)
    throw new Error(
      "DATABASE_URL is missing. Add the Supabase connection string to .env.local or .env.",
    );
  const parsed = new URL(value);
  if (
    !["postgres:", "postgresql:"].includes(parsed.protocol) ||
    !parsed.password ||
    /YOUR-|\[.*\]/i.test(value)
  ) {
    throw new Error(
      "DATABASE_URL must be a complete PostgreSQL URL with its password filled in.",
    );
  }
  return value;
}

export function supabaseConfig() {
  return {
    ...publicSupabaseConfig(process.env),
    secret:
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function safeError(error) {
  // Driver messages may contain connection strings. Log codes, never raw config.
  return error?.code || error?.cause?.code || error?.name || "UnknownError";
}
