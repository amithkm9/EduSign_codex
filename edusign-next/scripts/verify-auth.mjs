// Explicit opt-in: creates and removes one isolated test account; sends no email.
import { randomUUID, randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig, safeError } from "./env.mjs";

if (!process.argv.includes("--temporary-user")) {
  console.error("Usage: node scripts/verify-auth.mjs --temporary-user");
  process.exit(1);
}
const { url, key, secret } = supabaseConfig();
if (!secret)
  throw new Error(
    "A Supabase server secret is required for this isolated test.",
  );
const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const admin = createClient(url, secret, options);
const client = createClient(url, key, options);
const email = `edusign-check-${randomUUID()}@example.com`;
const password = `Edu9!${randomBytes(24).toString("base64url")}`;
let createdId;
try {
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: "Vérification EduSign",
      user_type: "other",
      edusign_test: true,
    },
  });
  if (created.error) throw created.error;
  createdId = created.data.user.id;
  console.log("PASS temporary account creation");
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) throw login.error;
  assert.equal(login.data.user.id, createdId);
  console.log("PASS email/password sign-in");
  const identity = await client.auth.getUser();
  assert.equal(identity.data.user?.id, createdId);
  console.log("PASS server-confirmed identity");
  const refreshed = await client.auth.refreshSession();
  if (refreshed.error) throw refreshed.error;
  assert.ok(refreshed.data.session?.refresh_token);
  console.log("PASS session refresh");
  const nextPassword = `Edu9!${randomBytes(24).toString("base64url")}`;
  const updated = await client.auth.updateUser({ password: nextPassword });
  if (updated.error) throw updated.error;
  console.log("PASS password update for temporary account");
  const logout = await client.auth.signOut();
  if (logout.error) throw logout.error;
  assert.equal((await client.auth.getSession()).data.session, null);
  console.log("PASS sign-out clears session");
  const rejected = await client.auth.signInWithPassword({ email, password });
  assert.ok(rejected.error);
  console.log("PASS old password rejected");
  const newLogin = await client.auth.signInWithPassword({
    email,
    password: nextPassword,
  });
  if (newLogin.error) throw newLogin.error;
  assert.equal(newLogin.data.user.id, createdId);
  console.log("PASS new password accepted");
  await client.auth.signOut();
} catch (error) {
  console.error("Authentication verification failed:", safeError(error));
  process.exitCode = 1;
} finally {
  if (createdId) {
    const result = await admin.auth.admin.deleteUser(createdId);
    if (result.error) {
      console.error(
        "Temporary account cleanup failed; account ID:",
        createdId,
        safeError(result.error),
      );
      process.exitCode = 1;
    } else console.log("PASS temporary account removed");
  }
}
