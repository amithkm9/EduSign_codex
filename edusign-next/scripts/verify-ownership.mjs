// Creates two temporary accounts, checks RLS through public clients, then removes them.
import assert from "node:assert/strict";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { supabaseConfig, databaseUrl, safeError } from "./env.mjs";
if (!process.argv.includes("--temporary-users"))
  throw new Error("Pass --temporary-users to run this integration test.");
const { url, key, secret } = supabaseConfig();
if (!secret) throw new Error("Supabase server secret is required.");
const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const admin = createClient(url, secret, options);
const sql = postgres(databaseUrl(), {
  prepare: false,
  max: 1,
  connect_timeout: 10,
  onnotice: () => {},
});
const accounts = [];
const checked = (r) => {
  if (r.error) throw r.error;
  return r.data;
};
async function snapshot() {
  const records = [];
  for (const table of [
    "courses",
    "packages",
    "profiles",
    "user_progress",
    "learning_events",
    "quiz_attempts",
  ]) {
    records.push(await sql`select * from ${sql(table)} order by id`);
  }
  return createHash("sha256").update(JSON.stringify(records)).digest("hex");
}
try {
  for (let i = 0; i < 2; i++) {
    const email = `edusign-rls-${randomUUID()}@example.com`;
    const password = `Edu9!${randomBytes(24).toString("base64url")}`;
    const created = checked(
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: "Vérification EduSign",
          user_type: "other",
          edusign_test: true,
        },
      }),
    );
    const account = {
      id: created.user.id,
      client: createClient(url, key, options),
    };
    accounts.push(account);
    checked(await account.client.auth.signInWithPassword({ email, password }));
  }
  const [a, b] = accounts;
  for (const [owner, other] of [
    [a, b],
    [b, a],
  ]) {
    const own = checked(
      await owner.client.from("profiles").select("id").eq("id", owner.id),
    );
    assert.equal(own.length, 1, "signup creates profile");
    const hidden = checked(
      await other.client.from("profiles").select("id").eq("id", owner.id),
    );
    assert.equal(hidden.length, 0, "other profile remains private");
    const changed = checked(
      await owner.client
        .from("profiles")
        .update({ name: "Profil vérifié" })
        .eq("id", owner.id)
        .select("id"),
    );
    assert.equal(changed.length, 1);
    const blocked = checked(
      await other.client
        .from("profiles")
        .update({ name: "Forbidden" })
        .eq("id", owner.id)
        .select("id"),
    );
    assert.equal(blocked.length, 0);
    for (const [table, fields] of [
      ["user_progress", { status: "in_progress" }],
      ["learning_events", { type: "start" }],
      ["quiz_attempts", { quiz_id: "rls-check" }],
    ]) {
      const payload = { user_id: owner.id, course_id: "001", ...fields };
      if (table === "learning_events") {
        const direct = await owner.client.from(table).insert(payload);
        assert.equal(
          direct.error?.code,
          "42501",
          "playback events require the server API",
        );
      }
      const rows = checked(
        await (table === "learning_events" ? admin : owner.client)
          .from(table)
          .insert(payload)
          .select("id"),
      );
      assert.equal(rows.length, 1);
      const foreignRead = checked(
        await other.client.from(table).select("id").eq("id", rows[0].id),
      );
      assert.equal(foreignRead.length, 0);
      const foreignWrite = await other.client
        .from(table)
        .insert({ ...payload, course_id: "002" });
      assert.equal(
        foreignWrite.error?.code,
        "42501",
        `${table} rejects foreign ownership`,
      );
      const foreignDelete = checked(
        await other.client
          .from(table)
          .delete()
          .eq("id", rows[0].id)
          .select("id"),
      );
      assert.equal(foreignDelete.length, 0);
      console.log("PASS owned access and cross-user isolation:", table);
    }
  }
  console.log("PASS automatic profiles and profile isolation");
  const before = await snapshot();
  for (const script of ["scripts/setup-db.mjs", "scripts/seed.mjs"])
    execFileSync(process.execPath, [script], { stdio: "pipe" });
  assert.equal(
    await snapshot(),
    before,
    "setup and seed preserve all existing records",
  );
  console.log(
    "PASS repeated schema setup and seeding preserve existing records",
  );
} catch (error) {
  console.error("Ownership verification failed:", safeError(error));
  process.exitCode = 1;
} finally {
  for (const account of accounts) {
    await account.client.auth.signOut();
    const result = await admin.auth.admin.deleteUser(account.id);
    if (result.error) {
      console.error(
        "Cleanup failed for temporary account:",
        account.id,
        safeError(result.error),
      );
      process.exitCode = 1;
    } else console.log("PASS temporary account removed");
  }
  await sql.end({ timeout: 5 });
}
