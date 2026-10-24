import assert from "node:assert/strict";
const base = process.env.BASE || "http://localhost:3100";
for (const [path, fr, en] of [
  ["/", "De petites mains.", "Little hands."],
  ["/courses", "Un monde en couleurs", "A world of colours"],
  ["/parents", "Apprendre à ses côtés.", "Learning by their side."],
  ["/quiz", "On essaie, à deux ?", "Shall we try together?"],
  ["/login", "Heureux de vous revoir.", "Welcome back."],
  ["/register", "Faisons connaissance.", "Let’s get to know you."],
  ["/learn/lsf-alphabet", "Les lettres prennent vie", "Letters come to life"],
  ["/resources", "De bonnes sources.", "Trusted sources."],
  ["/packages", "Un chemin à votre mesure.", "A path that fits you."],
  ["/community", "se vivent ensemble.", "are better together."],
  ["/about", "À PROPOS DE NOUS", "ABOUT US"],
]) {
  for (const [locale, marker] of [
    ["fr", fr],
    ["en", en],
  ]) {
    const response = await fetch(base + path, {
      headers: { cookie: `edusign_locale=${locale}` },
    });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(html.includes(`lang="${locale}"`), path + " language");
    assert.ok(html.includes(marker), path + " " + locale);
    console.log("PASS", locale, path);
  }
}
const fallback = await (
  await fetch(base, { headers: { cookie: "edusign_locale=invalid" } })
).text();
assert.ok(fallback.includes('lang="fr"'));
console.log("PASS unknown locale falls back to French");
