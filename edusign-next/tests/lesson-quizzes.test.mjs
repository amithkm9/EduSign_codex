import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { gradeQuiz } from "../src/lib/quiz/grade.mjs";
const readJson = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const quizzes = await readJson("../src/lib/quiz/quizzes.json");
const lessons = await readJson("../src/lib/data/lsf-catalog.json");
const en = await readJson("../src/lib/i18n/en.json");
const answersFor = (q) =>
  q.questions.map((question) => ({
    questionId: question.id,
    choice: question.correctOption,
  }));

test("only alphabet and numbers are published, each with one complete bilingual quiz", () => {
  assert.deepEqual(lessons.map((l) => l.id).sort(), [
    "lsf-alphabet",
    "lsf-nombres",
  ]);
  assert.equal(quizzes.length, lessons.length);
  for (const lesson of lessons) {
    const matches = quizzes.filter((q) => q.courseId === lesson.id);
    assert.equal(matches.length, 1);
    const quiz = matches[0];
    assert.equal(quiz.questions.length, 3);
    assert.equal(new Set(quiz.questions.map((q) => q.id)).size, 3);
    for (const question of quiz.questions) {
      assert.equal(
        question.options.filter((o) => o.id === question.correctOption).length,
        1,
      );
      assert.equal(
        new Set(question.options.map((o) => o.id)).size,
        question.options.length,
      );
      for (const text of [
        question.prompt,
        question.explanation,
        ...question.options.map((o) => o.text),
      ])
        if (/[a-zà-ÿ]{2}/i.test(text))
          assert.ok(en[text], `Missing translation: ${text}`);
    }
  }
});
test("grades choices independently of answer order and client correctness claims", () => {
  for (const quiz of quizzes) {
    const answers = answersFor(quiz);
    assert.equal(gradeQuiz(quiz, answers.toReversed()).score, 100);
    answers[0].choice = quiz.questions[0].options.find(
      (o) => o.id !== quiz.questions[0].correctOption,
    ).id;
    answers[0].correct = true;
    const result = gradeQuiz(quiz, answers);
    assert.equal(result.score, 67);
    assert.equal(result.correct, 2);
    assert.equal(result.answers[0].correct, false);
  }
});
test("rejects partial, repeated, unknown and cross-lesson answers", () => {
  const quiz = quizzes[0];
  const answers = answersFor(quiz);
  for (const invalid of [
    null,
    {},
    [],
    answers.slice(1),
    [...answers, answers[0]],
    [answers[0], answers[0], answers[2]],
    [{ ...answers[0], choice: "invented" }, ...answers.slice(1)],
    [{ ...answers[0], questionId: "unknown" }, ...answers.slice(1)],
    answersFor(quizzes[1]),
    [null, ...answers.slice(1)],
  ])
    assert.throws(() => gradeQuiz(quiz, invalid));
});
test("all incorrect choices produce zero without changing quiz content", () => {
  for (const quiz of quizzes) {
    const original = JSON.stringify(quiz);
    const result = gradeQuiz(
      quiz,
      quiz.questions.map((q) => ({
        questionId: q.id,
        choice: q.options.find((o) => o.id !== q.correctOption).id,
      })),
    );
    assert.equal(result.score, 0);
    assert.equal(result.correct, 0);
    assert.equal(result.totalQuestions, 3);
    assert.equal(JSON.stringify(quiz), original);
  }
});
