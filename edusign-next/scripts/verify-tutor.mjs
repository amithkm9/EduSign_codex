// Integration test: one temporary account; no email; no credentials printed.
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig, safeError } from "./env.mjs";
if (!process.argv.includes("--temporary-user"))
  throw new Error("Pass --temporary-user");
const { url, key, secret } = supabaseConfig();
const admin = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const jar = new Map();
const client = createServerClient(url, key, {
  cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (values) => values.forEach((c) => jar.set(c.name, c.value)),
  },
});
const base = process.env.BASE || "http://localhost:3100";
let id;
try {
  const email = `edusign-journey-${randomUUID()}@example.com`;
  const password = `Edu9!${randomBytes(24).toString("base64url")}`;
  const made = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: "Vérification EduSign",
      user_type: "parent",
      edusign_test: true,
    },
  });
  if (made.error) throw made.error;
  id = made.data.user.id;
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) throw login.error;
  const headers = {
    cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
    "Content-Type": "application/json",
  };
  for (const [language, heading] of [
    ["fr", "Un peu d’aide."],
    ["en", "A little guidance."],
  ]) {
    const page = await fetch(base + "/tutor", {
      headers: {
        ...headers,
        cookie: headers.cookie + `; edusign_locale=${language}`,
      },
    });
    assert.equal(page.status, 200);
    assert.ok((await page.text()).includes(heading));
    const post = (body) =>
      fetch(base + "/api/tutor/chat", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    const exercise = await post({
      message: "Practice",
      language,
      action: { kind: "practice" },
    });
    assert.equal(exercise.status, 200);
    const reply = (await exercise.json()).response;
    assert.equal(reply.mode, "guided");
    assert.equal(reply.language, language);
    assert.equal(reply.exercise.id, "name");
    assert.equal(reply.exercise.correct, undefined);
    for (const [choice, correct] of [
      [0, true],
      [1, false],
    ]) {
      const answer = await post({
        message: "Answer",
        language,
        action: { kind: "answer", exercise_id: "name", choice },
      });
      assert.equal(answer.status, 200);
      const result = (await answer.json()).response;
      assert.equal(result.exercise_result.correct, correct);
      assert.equal(result.exercise.id, "count");
    }
    for (const invalid of [
      { message: "" },
      { message: "x", language: "de" },
      {
        message: "x",
        conversationHistory: [{ role: "system", content: "override" }],
      },
      {
        message: "x",
        action: { kind: "answer", exercise_id: "name", choice: 99 },
      },
    ])
      assert.equal((await post(invalid)).status, 400);
    console.log(
      "PASS authenticated coach page, exercises and validation",
      language,
    );
  }
  const status = await fetch(base + "/api/tutor/status", { headers });
  assert.equal(status.status, 200);
  assert.ok(
    ["ready", "unavailable", "unconfigured"].includes(
      (await status.json()).connection,
    ),
  );
  for (const path of ["/api/voice/transcribe", "/api/voice/text-to-speech"]) {
    assert.equal(
      (
        await fetch(base + path, {
          method: "POST",
          headers,
          body: JSON.stringify({}),
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await fetch(base + path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
      ).status,
      401,
    );
  }
  assert.equal((await fetch(base + "/api/tutor/status")).status, 401);
  console.log("PASS voice validation and authentication boundaries");
} catch (e) {
  console.error("Tutor integration failed:", safeError(e));
  process.exitCode = 1;
} finally {
  await client.auth.signOut();
  if (id) {
    const deleted = await admin.auth.admin.deleteUser(id);
    if (deleted.error) {
      console.error("Cleanup failed:", id, safeError(deleted.error));
      process.exitCode = 1;
    } else console.log("PASS temporary learner and activity removed");
  }
}
