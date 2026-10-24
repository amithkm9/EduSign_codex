"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import quizzes from "@/lib/quiz/quizzes.json";
import { gradeQuiz, type Answers, type QuizResult } from "@/lib/quiz/grade.mjs";

export function LessonQuiz({
  courseId,
  track,
  onReplay,
}: {
  courseId: string;
  track: boolean;
  onReplay(): void;
}) {
  const { t } = useLocale();
  const quiz = quizzes.find((entry) => entry.courseId === courseId)!;
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState("");
  const [answers, setAnswers] = useState<Answers>([]);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<
    "idle" | "saved" | "error" | "expired"
  >("idle");
  const started = useRef<number | null>(null);
  const attemptId = useRef<string | null>(null);
  const elapsed = useRef(0);
  const pending = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const question = quiz.questions[index];
  const correct = choice === question.correctOption;

  async function save(completed: QuizResult) {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setSaveState("idle");
    attemptId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          quizId: quiz.id,
          attemptId: attemptId.current,
          answers: completed.answers.map(({ questionId, choice }) => ({
            questionId,
            choice,
          })),
          timeMs: elapsed.current,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 401) {
        setSaveState("expired");
        return;
      }
      if (!response.ok) throw new Error("Save failed");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }
  function advance() {
    const next = [...answers, { questionId: question.id, choice }];
    setAnswers(next);
    if (next.length === quiz.questions.length) {
      const completed = gradeQuiz(quiz, next);
      elapsed.current = Math.max(
        0,
        Math.round(performance.now() - (started.current ?? performance.now())),
      );
      setResult(completed);
      if (track) void save(completed);
    } else {
      setIndex(index + 1);
      setChoice("");
      setChecked(false);
    }
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  }
  function reset() {
    setIndex(0);
    setChoice("");
    setAnswers([]);
    setChecked(false);
    setResult(null);
    setSaveState("idle");
    started.current = null;
    attemptId.current = null;
    requestAnimationFrame(() =>
      heading.current?.focus({ preventScroll: true }),
    );
  }
  return (
    <div className="rounded-3xl border border-primary/20 bg-secondary/50 p-5 sm:p-7">
      <p className="eyebrow">{t("VOTRE MINI-QUIZ")}</p>
      <h2
        ref={heading}
        tabIndex={-1}
        className="mt-3 text-2xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {t(result ? "Une découverte de plus !" : "À vous de répondre")}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {t(
          "Un quiz de compréhension et de mise en pratique. Vos gestes ne sont pas évalués.",
        )}
      </p>
      {result ? (
        <div>
          <p className="mt-6 text-4xl font-bold text-primary">
            {result.correct} / {result.totalQuestions}
          </p>
          <p className="mt-2 font-semibold">{t("Bonnes réponses")}</p>
          <p className="mt-3 text-sm">
            {t(
              result.correct === result.totalQuestions
                ? "Bravo ! Vous pouvez revoir la vidéo ou découvrir l’autre atelier."
                : "Chaque essai aide à apprendre. Relisez les explications et réessayez quand vous voulez.",
            )}
          </p>
          <div role="status" aria-live="polite" className="mt-4 text-sm">
            {saving && t("Enregistrement du résultat…")}
            {saveState === "saved" && (
              <span className="inline-flex items-center gap-2 text-primary">
                <CheckCircle2 className="size-4" />
                {t("Résultat enregistré dans votre bilan.")}
              </span>
            )}
            {saveState === "error" && (
              <p>
                {t(
                  "Votre résultat n’a pas été enregistré. Vous pouvez réessayer.",
                )}
              </p>
            )}
            {(!track || saveState === "expired") && (
              <Link
                className="font-semibold text-primary underline"
                href={`/login?redirectTo=/learn/${courseId}`}
              >
                {t(
                  "Connectez-vous, puis refaites le quiz pour enregistrer votre résultat.",
                )}
              </Link>
            )}
          </div>
          {saveState === "error" && (
            <Button
              onClick={() => void save(result)}
              disabled={saving}
              className="mt-3"
            >
              {t("Réessayer l’enregistrement")}
            </Button>
          )}
          <details className="mt-5 rounded-2xl border border-border bg-white p-4">
            <summary className="min-h-8 cursor-pointer font-semibold text-primary">
              {t("Revoir les explications")}
            </summary>
            <ol className="mt-4 space-y-5">
              {quiz.questions.map((item, i) => (
                <li key={item.id} className="text-sm leading-relaxed">
                  <p className="font-semibold">
                    {i + 1}. {t(item.prompt)}
                  </p>
                  <p className="mt-2">
                    {t("Votre réponse :")}{" "}
                    {t(
                      item.options.find(
                        (option) => option.id === result.answers[i].choice,
                      )!.text,
                    )}
                  </p>
                  <p className="mt-1 font-semibold text-primary">
                    {t("Bonne réponse :")}{" "}
                    {t(
                      item.options.find(
                        (option) => option.id === item.correctOption,
                      )!.text,
                    )}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    {t(item.explanation)}
                  </p>
                </li>
              ))}
            </ol>
          </details>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={reset} disabled={saving} className="rounded-full">
              <RotateCcw className="size-4" />
              {t("Refaire le quiz")}
            </Button>
            <Button
              onClick={onReplay}
              variant="outline"
              className="rounded-full"
            >
              {t("Revoir la vidéo")}
            </Button>
            {track && (
              <Link
                href="/report"
                className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-primary"
              >
                {t("Mon bilan")}
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!choice) return;
            if (checked) advance();
            else setChecked(true);
          }}
        >
          <p className="mb-3 text-xs font-bold text-primary">
            {t("Question")} {index + 1} / {quiz.questions.length}
          </p>
          <div className="mb-5 flex gap-2" aria-hidden>
            {quiz.questions.map((q, i) => (
              <span
                key={q.id}
                className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-primary" : "bg-primary/15"}`}
              />
            ))}
          </div>
          <fieldset disabled={checked} className="space-y-3">
            <legend className="mb-4 text-lg font-semibold leading-relaxed">
              {t(question.prompt)}
            </legend>
            {question.options.map((option) => (
              <label
                key={option.id}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm transition-colors ${choice === option.id ? "border-primary bg-white ring-1 ring-primary" : "border-border bg-white/75 hover:border-primary/40"}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={choice === option.id}
                  onChange={() => {
                    started.current ??= performance.now();
                    setChoice(option.id);
                  }}
                  className="size-5 shrink-0 accent-primary"
                />
                <span>{t(option.text)}</span>
              </label>
            ))}
          </fieldset>
          {checked && (
            <div
              role="status"
              className={`mt-5 rounded-2xl p-4 text-sm leading-relaxed ${correct ? "bg-success-subtle text-success-foreground" : "bg-warning-subtle text-warning-foreground"}`}
            >
              <p className="font-bold">
                {t(correct ? "Bien joué !" : "On apprend ensemble !")}
              </p>
              {!correct && (
                <p className="mt-2 font-semibold">
                  {t("Bonne réponse :")}{" "}
                  {t(
                    question.options.find(
                      (o) => o.id === question.correctOption,
                    )!.text,
                  )}
                </p>
              )}
              <p className="mt-2">{t(question.explanation)}</p>
            </div>
          )}
          <Button
            type="submit"
            disabled={!choice}
            className="mt-5 rounded-full"
          >
            {t(
              checked
                ? index + 1 === quiz.questions.length
                  ? "Voir mon résultat"
                  : "Question suivante"
                : "Vérifier ma réponse",
            )}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
