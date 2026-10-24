// Creates one temporary signup link, verifies it, then deletes the account. No email is sent.
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig, safeError } from "./env.mjs";
if (!process.argv.includes("--temporary-user"))
  throw new Error(
    "Pass --temporary-user to create and remove an isolated account.",
  );
const { url, key, secret } = supabaseConfig();
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, secret, options);
const client = createClient(url, key, options);
let id;
try {
  const email = `edusign-signup-${randomUUID()}@example.com`;
  const password = `Edu9!${randomBytes(24).toString("base64url")}`;
  const generated = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: {
        full_name: "EduSign signup check",
        locale: "en-GB",
        edusign_test: true,
      },
    },
  });
  if (generated.error) throw generated.error;
  id = generated.data.user.id;
  assert.ok(!generated.data.user.email_confirmed_at);
  console.log("PASS temporary signup awaits confirmation");
  const rejected = await client.auth.signInWithPassword({ email, password });
  assert.equal(rejected.error?.code, "email_not_confirmed");
  console.log("PASS unconfirmed account cannot sign in");
  const confirmed = await client.auth.verifyOtp({
    token_hash: generated.data.properties.hashed_token,
    type: "signup",
  });
  if (confirmed.error) throw confirmed.error;
  assert.equal(confirmed.data.user.id, id);
  assert.ok(confirmed.data.session);
  assert.equal(confirmed.data.user.user_metadata.locale, "en-GB");
  console.log("PASS confirmation creates a session and retains locale");
  const profile = await client
    .from("profiles")
    .select("id,name,user_type")
    .eq("id", id)
    .single();
  if (profile.error) throw profile.error;
  assert.equal(profile.data.name, "EduSign signup check");
  assert.equal(profile.data.user_type, "parent");
  console.log(
    "PASS profile trigger supports full_name metadata without an explicit user type",
  );
  await client.auth.signOut();
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) throw login.error;
  assert.equal(login.data.user.id, id);
  console.log("PASS confirmed account can sign in using email and password");
} catch (error) {
  console.error("Signup verification failed:", safeError(error));
  process.exitCode = 1;
} finally {
  await client.auth.signOut();
  if (id) {
    const removed = await admin.auth.admin.deleteUser(id);
    if (removed.error) {
      console.error("Cleanup failed for account", id, safeError(removed.error));
      process.exitCode = 1;
    } else console.log("PASS temporary signup account removed");
  }
}
