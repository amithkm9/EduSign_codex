// Local HTTP checks; no email, account creation or third-party sign-in submission.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.BASE || "http://localhost:3100";
const lessons = JSON.parse(
  await readFile(
    new URL("../src/lib/data/lsf-catalog.json", import.meta.url),
    "utf8",
  ),
);
const decode = (s) =>
  s
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
for (const locale of ["fr", "en"]) {
  const headers = { cookie: `edusign_locale=${locale}` };
  for (const path of ["/login", "/register"]) {
    const url = base + path + "?redirectTo=%2Flearn%2Flsf-couleurs";
    const response = await fetch(url, { headers });
    assert.equal(response.status, 200);
    const html = await response.text();
    const forms = [...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)].map(
      (m) => m[0],
    );
    const google = forms.find((f) =>
      f.includes(
        locale === "fr" ? "Continuer avec Google" : "Continue with Google",
      ),
    );
    assert.ok(google, path + " Google form");
    assert.ok(
      forms.some(
        (f) => f.includes('name="email"') && f.includes('name="password"'),
      ),
      path + " email form",
    );
    assert.ok(google.includes('value="/learn/lsf-couleurs"'));
    assert.ok(
      forms
        .find((f) => f.includes('name="email"'))
        .includes('value="/learn/lsf-couleurs"'),
    );
    // The server action either starts OAuth or explains its disabled-provider state.
    const body = new FormData();
    for (const m of google.matchAll(/<input\b[^>]*>/g)) {
      const name = m[0].match(/name="([^"]+)"/)?.[1];
      const value = m[0].match(/value="([^"]*)"/)?.[1] ?? "";
      if (name) body.append(decode(name), decode(value));
    }
    const submitted = await fetch(url, {
      method: "POST",
      body,
      headers: { ...headers, origin: base },
      redirect: "manual",
    });
    if (submitted.status === 303) {
      assert.match(
        submitted.headers.get("location") ?? "",
        /^https:\/\/[^/]+\/auth\/v1\/authorize\?/,
      );
      console.log("PASS Google OAuth initiation", locale, path);
    } else {
      assert.equal(submitted.status, 200);
      const result = await submitted.text();
      assert.ok(
        result.includes(
          locale === "fr"
            ? "La connexion Google n’est pas encore disponible."
            : "Google sign-in is not available yet.",
        ),
      );
      console.log("PASS disabled Google provider offers email", locale, path);
    }
  }
}
for (const [error, notice] of [
  ["access_denied", "oauth_cancelled"],
  ["provider_error", "oauth_failed"],
]) {
  const response = await fetch(
    `${base}/auth/callback?error=${error}&error_description=private-upstream-details&next=%2F%2Fevil.example`,
    { redirect: "manual" },
  );
  assert.equal(response.status, 307);
  const target = new URL(response.headers.get("location"));
  assert.equal(target.origin, new URL(base).origin);
  assert.equal(target.pathname, "/login");
  assert.equal(target.searchParams.get("notice"), notice);
  assert.equal(target.searchParams.get("redirectTo"), "/dashboard");
  assert.ok(!target.toString().includes("private-upstream-details"));
}
console.log("PASS OAuth cancellation and failure return safely to sign-in");
const catalog = await (await fetch(base + "/courses")).text();
for (const lesson of lessons)
  assert.ok(
    catalog.includes(
      encodeURIComponent(
        `https://i.ytimg.com/vi/${lesson.youtubeId}/hqdefault.jpg`,
      ),
    ),
    lesson.id + " image",
  );
for (const lesson of lessons) {
  const image = await fetch(
    `${base}/_next/image?url=${encodeURIComponent(`https://i.ytimg.com/vi/${lesson.youtubeId}/hqdefault.jpg`)}&w=640&q=75`,
  );
  assert.equal(image.status, 200, lesson.id + " preview response");
  assert.match(image.headers.get("content-type"), /^image\//);
  assert.ok((await image.arrayBuffer()).byteLength > 1000);
  console.log("PASS optimized LSF course preview", lesson.id);
}
console.log(
  "PASS Google/email entry points, callback boundaries and course images",
);
