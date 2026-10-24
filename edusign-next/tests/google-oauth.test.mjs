import test from "node:test";
import assert from "node:assert/strict";
import { createServerClient } from "@supabase/ssr";
import { beginGoogleOAuth } from "../src/lib/google-oauth.mjs";

test("Google OAuth creates a PKCE verifier and keeps the learner destination", async () => {
  const cookies = new Map();
  const client = createServerClient(
    "https://example.supabase.co",
    "public-test-key",
    {
      cookies: {
        getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
        setAll: (updates) =>
          updates.forEach(({ name, value }) => cookies.set(name, value)),
      },
    },
  );
  const result = await beginGoogleOAuth(client, {
    origin: "https://edusign.example",
    redirectTo: "/learn/lsf-couleurs?from=community",
    enabled: true,
  });
  assert.equal(result.error, null);
  const providerUrl = new URL(result.url);
  assert.equal(providerUrl.origin, "https://example.supabase.co");
  assert.equal(providerUrl.searchParams.get("provider"), "google");
  assert.equal(providerUrl.searchParams.get("code_challenge_method"), "s256");
  assert.ok(providerUrl.searchParams.get("code_challenge"));
  assert.ok([...cookies.keys()].some((name) => name.includes("code-verifier")));
  const callback = new URL(providerUrl.searchParams.get("redirect_to"));
  assert.equal(callback.origin, "https://edusign.example");
  assert.equal(callback.pathname, "/auth/callback");
  assert.equal(
    callback.searchParams.get("next"),
    "/learn/lsf-couleurs?from=community",
  );
});
test("Google OAuth rejects external return destinations", async () => {
  let options;
  const client = {
    auth: {
      signInWithOAuth: async (request) => {
        options = request.options;
        return {
          data: { url: "https://example.supabase.co/auth/v1/authorize" },
          error: null,
        };
      },
    },
  };
  for (const redirectTo of [
    "//attacker.example",
    "https://attacker.example",
    "/%2fattacker.example",
    null,
  ]) {
    await beginGoogleOAuth(client, {
      origin: "https://edusign.example",
      redirectTo,
      enabled: true,
    });
    assert.equal(
      new URL(options.redirectTo).searchParams.get("next"),
      "/dashboard",
    );
  }
});
test("a disabled Google provider leaves email signup available without starting OAuth", async () => {
  const client = {
    auth: {
      signInWithOAuth: async () => {
        throw new Error("must not be called");
      },
    },
  };
  const result = await beginGoogleOAuth(client, {
    origin: "https://edusign.example",
    enabled: false,
  });
  assert.match(result.error, /e-mail/);
  assert.equal(result.url, undefined);
});
test("provider failures do not expose upstream credentials", async () => {
  const client = {
    auth: {
      signInWithOAuth: async () => {
        throw new Error("private-provider-credential");
      },
    },
  };
  const result = await beginGoogleOAuth(client, {
    origin: "https://edusign.example",
    enabled: true,
  });
  assert.match(result.error, /Réessayez/);
  assert.ok(!result.error.includes("private-provider-credential"));
});
