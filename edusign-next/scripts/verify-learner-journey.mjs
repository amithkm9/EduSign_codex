// Integration test: one temporary account; no email; no credentials printed.
import { readFile } from "node:fs/promises";
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
    ["/tutor", "Apprenons un signe.", "Let’s learn a sign."],
    ["/report", "Mon bilan", "My discovery report"],
    [
      "/learn/lsf-alphabet",
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
      courseId: "lsf-alphabet",
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
    .eq("course_id", "lsf-alphabet")
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
  const videoEvent = {
    id: randomUUID(),
    courseId: "lsf-alphabet",
    sessionId: randomUUID(),
    type: "heartbeat",
    activeMs: 15000,
    durationMs: 120000,
    positionMs: 15000,
    ranges: [[0, 15000]],
    at: new Date().toISOString(),
  };
  const postVideo = (payload) =>
    fetch(base + "/api/learning/video", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  assert.equal((await postVideo(videoEvent)).status, 200);
  const retries = await Promise.all([
    postVideo(videoEvent),
    postVideo(videoEvent),
  ]);
  for (const retry of retries) assert.equal(retry.status, 200);
  assert.equal(
    (
      await postVideo({
        ...videoEvent,
        id: randomUUID(),
        at: new Date().toISOString(),
      })
    ).status,
    200,
  );
  for (const invalid of [
    null,
    { ...videoEvent, activeMs: 60001 },
    { ...videoEvent, ranges: [[0, 120000]] },
    { ...videoEvent, courseId: "lsf-bonjour" },
    { ...videoEvent, positionMs: 200000 },
  ])
    assert.equal((await postVideo(invalid)).status, 400);
  const videos = await (
    await fetch(base + "/api/learning/video", { headers })
  ).json();
  const watched = videos.videos.find((v) => v.courseId === "lsf-alphabet");
  assert.equal(watched.activeMs, 30000);
  assert.equal(watched.watchedMs, 15000);
  assert.equal(watched.coverage, 12);
  assert.equal(watched.positionMs, 15000);
  const direct = await client.from("learning_events").insert({
    user_id: id,
    course_id: "lsf-alphabet",
    type: "heartbeat",
    active_ms: 999999,
    source: "youtube",
  });
  assert.equal(direct.error?.code, "42501");
  const capability = await (
    await fetch(base + "/api/ml/recognize", { headers })
  ).json();
  assert.equal(capability.ready, true);
  assert.equal(capability.mode, "legacy_demo");
  assert.equal(capability.lsf_validated, false);
  const unvalidated = await fetch(base + "/api/ml/recognize", {
    method: "POST",
    headers,
    body: JSON.stringify({ frames: [] }),
  });
  assert.equal(unvalidated.status, 400);
  const blank = await readFile(
    new URL("../tests/fixtures/blank.jpg", import.meta.url),
  );
  const demo = await fetch(base + "/api/ml/recognize", {
    method: "POST",
    headers,
    body: JSON.stringify({
      target: "A",
      frames: Array(30).fill(
        "data:image/jpeg;base64," + blank.toString("base64"),
      ),
    }),
  });
  assert.equal(demo.status, 200);
  const prediction = await demo.json();
  assert.equal(prediction.mode, "legacy_demo");
  assert.equal(prediction.verdict, "uncertain");
  assert.equal(prediction.correct, null);
  assert.equal(prediction.lsf_validated, false);
  assert.equal(prediction.saved_to_report, false);
  console.log(
    "PASS playback persistence, retries, unique coverage, invalid telemetry and demo-model inference",
  );
  const quizzes = JSON.parse(
    await readFile(
      new URL("../src/lib/quiz/quizzes.json", import.meta.url),
      "utf8",
    ),
  );
  const postQuiz = (payload) =>
    fetch(base + "/api/quiz/submit", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  // Prime a report before the quiz to verify that new scores bypass stale cached data.
  const before = await fetch(base + "/api/report?language=fr", { headers });
  assert.equal(before.status, 200);
  assert.equal((await before.json()).report.quizTrend.length, 0);
  for (const quiz of quizzes) {
    const answers = quiz.questions.map((q) => ({
      questionId: q.id,
      choice: q.correctOption,
    }));
    answers[0].choice = quiz.questions[0].options.find(
      (o) => o.id !== quiz.questions[0].correctOption,
    ).id;
    const payload = {
      courseId: quiz.courseId,
      quizId: quiz.id,
      attemptId: randomUUID(),
      timeMs: 12000,
      answers,
      score: 100,
      correct: 3,
      userId: randomUUID(),
    };
    const result = await postQuiz(payload);
    assert.equal(result.status, 200);
    assert.equal((await result.json()).score, 67);
    // Concurrent retries must not insert additional attempts.
    const retries = await Promise.all([postQuiz(payload), postQuiz(payload)]);
    for (const retry of retries) assert.equal(retry.status, 200);
    const saved = await client
      .from("quiz_attempts")
      .select("user_id,score,correct,passed,answers,attempt_no")
      .eq("course_id", quiz.courseId);
    if (saved.error) throw saved.error;
    assert.equal(saved.data.length, 1);
    assert.equal(saved.data[0].user_id, id);
    assert.equal(saved.data[0].score, 67);
    assert.equal(saved.data[0].correct, 2);
    assert.equal(saved.data[0].passed, false);
    assert.equal(saved.data[0].answers[0].correct, false);
    assert.equal(saved.data[0].attempt_no, 1);
    const corrected = quiz.questions.map((q) => ({
      questionId: q.id,
      choice: q.correctOption,
    }));
    assert.equal(
      (await postQuiz({ ...payload, answers: corrected })).status,
      409,
    );
    assert.equal(
      (
        await postQuiz({
          ...payload,
          answers: corrected,
          attemptId: randomUUID(),
        })
      ).status,
      200,
    );
    for (const invalid of [
      null,
      { ...payload, answers: answers.slice(1) },
      { ...payload, courseId: "lsf-bonjour" },
      { ...payload, quizId: "unknown" },
      { ...payload, timeMs: -1 },
      { ...payload, answers: [answers[0], answers[0], answers[2]] },
    ])
      assert.equal((await postQuiz(invalid)).status, 400);
    console.log(
      "PASS quiz scoring, ownership, retry deduplication and validation",
      quiz.courseId,
    );
  }
  const after = await fetch(base + "/api/report?language=fr", { headers });
  assert.equal(after.status, 200);
  const fresh = (await after.json()).report;
  assert.equal(fresh.quizTrend.length, 4);
  assert.equal(fresh.statistics.quizAttempts, 4);
  assert.equal(
    fresh.videoProgress.find((v) => v.courseId === "lsf-alphabet").activeMs,
    30000,
  );
  assert.ok(fresh.quizTrend.some((q) => q.score === 100));
  console.log(
    "PASS new quiz results appear in report despite previously cached data",
  );
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
