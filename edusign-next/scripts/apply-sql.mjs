// Runs a .sql file against the database in DATABASE_URL (from .env).
// Used for the Supabase-specific RLS/trigger SQL that drizzle-kit can't generate.
//   node scripts/apply-sql.mjs drizzle/manual/0001_profiles_rls_trigger.sql
import { readFileSync } from "node:fs";
import { databaseUrl, safeError } from "./env.mjs";
import postgres from "postgres";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-sql.mjs <file.sql>");
  process.exit(1);
}

const url = databaseUrl({ migration: true });

const sqlText = readFileSync(file, "utf8");
const sql = postgres(url, { ssl: "require", prepare: false, max: 1 });

try {
  await sql.begin(async (tx) => {
    await tx.unsafe(sqlText);
  });
  console.log(`Applied ${file} ✓`);
} catch (e) {
  console.error(`Failed to apply ${file}:`, safeError(e));
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
