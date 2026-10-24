import test from "node:test";
import assert from "node:assert/strict";
import { publicSupabaseConfig } from "../src/lib/config/supabase-env.mjs";
import { safeRedirectPath } from "../src/lib/safe-redirect.mjs";
import { authErrorMessage } from "../src/lib/auth-feedback.mjs";

test("dashboard credentials expose only the URL and publishable key", () => {
  assert.deepEqual(
    publicSupabaseConfig({
      SUPABASE_URL: "https://example.supabase.co/",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      SUPABASE_SECRET_KEY: "sb_secret_never_public",
      DATABASE_URL: "postgresql://private",
    }),
    { url: "https://example.supabase.co", key: "sb_publishable_example" },
  );
});
test("explicit public configuration wins over legacy names", () => {
  assert.equal(
    publicSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://new.supabase.co",
      SUPABASE_URL: "https://old.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "new",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "old",
    }).key,
    "new",
  );
});
test("blank public values fall back to supplied dashboard names", () => {
  assert.equal(
    publicSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: " ",
      SUPABASE_URL: "https://new.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      SUPABASE_PUBLISHABLE_KEY: "publishable",
    }).key,
    "publishable",
  );
});
test("missing configuration fails without falling back to a different project", () => {
  assert.throws(() => publicSupabaseConfig({}), /required/);
});
test("modern and legacy administrator keys cannot enter the browser configuration", () => {
  const jwt = `header.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.signature`;
  for (const key of ["sb_secret_private", jwt])
    assert.throws(
      () =>
        publicSupabaseConfig({
          SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_PUBLISHABLE_KEY: key,
        }),
      /server secret/,
    );
});
test("project URLs cannot embed credentials or use executable schemes", () => {
  for (const url of [
    "https://user:password@test.supabase.co",
    "javascript:alert(1)",
  ])
    assert.throws(() =>
      publicSupabaseConfig({
        SUPABASE_URL: url,
        SUPABASE_PUBLISHABLE_KEY: "public",
      }),
    );
});
test("post-login redirects reject external and encoded bypass destinations", () => {
  for (const path of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/%2fevil.example",
    "/%5cevil.example",
    "/bad\npath",
    "/%0d%0aevil",
    "/%",
    undefined,
    123,
  ])
    assert.equal(safeRedirectPath(path), "/dashboard");
});
test("post-login redirects preserve valid internal paths and query parameters", () => {
  assert.equal(
    safeRedirectPath("/courses/5-10?search=bonjour"),
    "/courses/5-10?search=bonjour",
  );
  assert.equal(safeRedirectPath("/learn/001"), "/learn/001");
});
test("unknown provider errors cannot expose upstream messages or credentials", () => {
  const result = authErrorMessage({
    message: "database password=private",
    code: "unexpected",
  });
  assert.ok(!result.includes("private"));
  assert.match(result, /indisponible/);
});
test("login errors distinguish unconfirmed email from invalid credentials", () => {
  assert.match(authErrorMessage({ code: "email_not_confirmed" }), /Confirmez/);
  assert.match(authErrorMessage({ code: "invalid_credentials" }), /incorrect/);
});
test("rate limit responses provide recovery guidance", () => {
  assert.match(authErrorMessage({ status: 429 }), /Patientez/);
});
