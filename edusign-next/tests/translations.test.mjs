import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const english = JSON.parse(
  await readFile(new URL("../src/lib/i18n/en.json", import.meta.url), "utf8"),
);
const lessons = JSON.parse(
  await readFile(
    new URL("../src/lib/data/lsf-catalog.json", import.meta.url),
    "utf8",
  ),
);
test("every learner-facing catalog field has an English translation", () => {
  for (const lesson of lessons)
    for (const field of [
      "title",
      "topic",
      "description",
      "objectives",
      "parentTip",
      "challenge",
    ])
      for (const text of [lesson[field]].flat())
        assert.ok(english[text], `${lesson.id}: ${field}`);
});
test("English explanations retain French Sign Language instead of claiming ASL", () => {
  assert.match(
    english["Explorez l’alphabet manuel français, une lettre après l’autre."],
    /French/,
  );
  assert.match(english["Les leçons LSF"], /LSF/);
});
test("key authentication feedback is translated", () => {
  for (const text of [
    "Les mots de passe ne correspondent pas",
    "L’adresse e-mail ou le mot de passe est incorrect.",
    "Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien.",
  ])
    assert.ok(english[text]);
});

test("new authentication and plan states have English translations", () => {
  for (const copy of [
    "Continuer avec Google",
    "Tuteur personnel",
    "Abonnement",
    "En préparation",
    "La connexion Google n’est pas encore disponible. Vous pouvez créer un compte ou vous connecter par e-mail.",
    "Connexion Google annulée. Vous pouvez réessayer ou continuer par e-mail.",
    "Aperçu indisponible · La leçon reste accessible",
    "Lien copié. À vous de l’envoyer à un proche !",
  ])
    assert.ok(english[copy], copy);
});
