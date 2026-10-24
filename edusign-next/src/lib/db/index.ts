import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  _eduDb?: PostgresJsDatabase<typeof schema>;
};

function getDatabase() {
  if (globalForDb._eduDb) return globalForDb._eduDb;
  const connection = process.env.DATABASE_URL?.trim();
  // Do not let an empty URL silently connect to a default local database.
  if (!connection)
    throw new Error("DATABASE_URL is required for learning data.");
  const client = postgres(connection, {
    prepare: false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 1800,
  });
  globalForDb._eduDb = drizzle(client, { schema });
  return globalForDb._eduDb;
}

// Auth and public pages can render before the learning database is configured.
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, property) {
    const database = getDatabase();
    const value = Reflect.get(database, property, database);
    return typeof value === "function" ? value.bind(database) : value;
  },
});
