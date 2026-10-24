import assert from "node:assert/strict";
const base = process.env.BASE || "http://localhost:3100";
for (const [path, text] of [
  ["/", "Apprenez la LSF."],
  ["/login", "Heureux de vous revoir."],
  ["/register", "Faisons connaissance."],
  ["/forgot-password", "Ça arrive à tout le monde."],
]) {
  const response = await fetch(base + path, {
    signal: AbortSignal.timeout(30_000),
  });
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.ok(html.includes(text), `French page content: ${path}`);
  assert.ok(html.includes('lang="fr"'), `French document language: ${path}`);
  console.log("PASS French page", path);
}
for (const path of [
  "/dashboard",
  "/tutor",
  "/report",
  "/auth/update-password",
]) {
  const response = await fetch(base + path, { redirect: "manual" });
  assert.equal(response.status, 307, path);
  assert.equal(new URL(response.headers.get("location")).pathname, "/login");
  console.log("PASS anonymous redirect", path);
}
for (const path of [
  "/api/tutor/chat",
  "/api/voice/chat",
  "/api/quiz/submit",
  "/api/learning/events",
  "/api/ml/recognize",
]) {
  const response = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(response.status, 401, path);
  console.log("PASS API authentication", path);
}
const callback = await fetch(`${base}/auth/callback?next=https://example.com`, {
  redirect: "manual",
});
assert.equal(new URL(callback.headers.get("location")).origin, base);
console.log("PASS invalid callback stays on this application");
