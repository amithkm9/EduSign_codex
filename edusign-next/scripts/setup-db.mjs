import { readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { appRoot, databaseUrl, safeError } from "./env.mjs";

const sql = postgres(databaseUrl({ migration: true }), {
  prepare: false,
  max: 1,
  connect_timeout: 10,
});
try {
  await migrate(drizzle(sql), { migrationsFolder: join(appRoot, "drizzle") });
  for (const file of [
    "0001_profiles_rls_trigger.sql",
    "0002_courses_packages_rls.sql",
    "0003_progress_rls.sql",
    "0004_oauth_profile.sql",
    "0005_video_progress.sql",
  ]) {
    const source = await readFile(
      join(appRoot, "drizzle/manual", file),
      "utf8",
    );
    await sql.begin(async (tx) => {
      await tx.unsafe(source);
    });
    console.log("Applied:", file);
  }
  console.log("Database schema and Supabase ownership policies ready.");
} catch (error) {
  console.error("Database setup failed:", safeError(error));
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
