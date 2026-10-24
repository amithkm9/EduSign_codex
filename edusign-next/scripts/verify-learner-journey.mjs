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
  for (const [path, french, english] of [
    ["/dashboard", "Mon carnet", "My discovery journal"],
    ["/tutor", "Une question ?", "Have a question?"],
    ["/report", "Mon bilan", "My discovery report"],
    [
      "/learn/lsf-bonjour",
      "J’ai pratiqué cette activité",
      "I practised this activity",
    ],
  ]) {
    for (const [locale, marker] of [
      ["fr", french],
      ["en", english],
    ]) {
      const r = await fetch(base + path, {
        headers: {
          ...headers,
          cookie: headers.cookie + `; edusign_locale=${locale}`,
        },
        redirect: "manual",
      });
      assert.equal(r.status, 200, path);
      const html = await r.text();
      assert.ok(html.includes(`lang="${locale}"`), path);
      assert.ok(
        html.toLowerCase().includes(marker.toLowerCase()),
        path + " " + locale,
      );
      console.log("PASS signed-in page", locale, path);
    }
  }
  let r = await fetch(base + "/api/learning/events", {
    method: "POST",
    headers,
    body: JSON.stringify({
      courseId: "lsf-bonjour",
      type: "end",
      activeMs: 0,
      progressPercentage: 100,
    }),
  });
  assert.equal(r.status, 201);
  const saved = await client
    .from("user_progress")
    .select("status,progress_percentage")
    .eq("user_id", id)
    .eq("course_id", "lsf-bonjour")
    .single();
  if (saved.error) throw saved.error;
  assert.equal(saved.data.status, "completed");
  assert.equal(saved.data.progress_percentage, 100);
  console.log("PASS declared activity persists to the authenticated learner");
  r = await fetch(base + "/api/learning/events", {
    method: "POST",
    headers,
    body: JSON.stringify({
      courseId: "001",
      type: "end",
      progressPercentage: 100,
    }),
  });
  assert.equal(r.status, 400);
  console.log("PASS legacy lesson rejected by new activity flow");
  for (const [language, message] of [
    ["fr", "Où apprendre l’alphabet en LSF ?"],
    ["en", "Where can I learn the alphabet in LSF?"],
  ]) {
    r = await fetch(base + "/api/tutor/chat", {
      method: "POST",
      headers,
      body: JSON.stringify({ message, language }),
      signal: AbortSignal.timeout(35000),
    });
    assert.equal(r.status, 200);
    const reply = await r.json();
    assert.equal(reply.language, language);
    assert.equal(reply.response.resources[0].url, "/learn/lsf-alphabet");
    assert.ok(!reply.response.videoSequence);
    console.log("PASS tutor returns a curated LSF lesson", language);
  }
  for (const [language, marker] of [
    ["fr", "activité"],
    ["en", "activit"],
  ]) {
    const report = await fetch(base + `/api/report?language=${language}`, {
      headers,
    });
    assert.equal(report.status, 200);
    const data = await report.json();
    assert.ok(data.report.aiInsights.overallSummary.includes(marker));
    console.log("PASS localized report", language);
  }
} catch (e) {
  console.error("Learner journey failed:", safeError(e));
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
