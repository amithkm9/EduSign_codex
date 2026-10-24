import { defineConfig } from "drizzle-kit";
import { databaseUrl } from "./scripts/env.mjs";

// Load Next-style env files. .env.local wins if present; .env fills the rest.

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl({ migration: true }),
  },
  strict: true,
  verbose: true,
});
