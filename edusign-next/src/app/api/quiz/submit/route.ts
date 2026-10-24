import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizAttempts } from "@/lib/db/schema";
import quizzes from "@/lib/quiz/quizzes.json";
import { gradeQuiz } from "@/lib/quiz/grade.mjs";

const submission = z.object({
  courseId: z.string().max(80),
  quizId: z.string().max(80),
  attemptId: z.uuid(),
  timeMs: z.number().int().min(0).max(86_400_000),
  answers: z
    .array(
      z.object({ questionId: z.string().max(80), choice: z.string().max(80) }),
    )
    .max(20),
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = submission.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  const { courseId, quizId, attemptId, timeMs, answers } = parsed.data;
  const quiz = quizzes.find(
    (entry) => entry.id === quizId && entry.courseId === courseId,
  );
  if (!quiz)
    return NextResponse.json({ error: "Unknown lesson quiz" }, { status: 400 });
  let result;
  try {
    result = gradeQuiz(quiz, answers);
  } catch {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }
  const graded = result;
  try {
    const saved = await db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext(${`${user.id}:${courseId}:${quizId}`})::int8)`,
      );
      // A stable attempt UUID makes retries safe after an interrupted response.
      const [existing] = await tx
        .select()
        .from(quizAttempts)
        .where(eq(quizAttempts.id, attemptId))
        .limit(1);
      if (existing) return existing;
      const [last] = await tx
        .select({ n: quizAttempts.attemptNo })
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.userId, user.id),
            eq(quizAttempts.courseId, courseId),
            eq(quizAttempts.quizId, quizId),
          ),
        )
        .orderBy(desc(quizAttempts.attemptNo))
        .limit(1);
      const [inserted] = await tx
        .insert(quizAttempts)
        .values({
          id: attemptId,
          userId: user.id,
          courseId,
          quizId,
          attemptNo: (last?.n ?? 0) + 1,
          ...graded,
          timeMs,
          passed: graded.score >= 70,
        })
        .onConflictDoNothing()
        .returning();
      return inserted;
    });
    if (
      !saved ||
      saved.userId !== user.id ||
      saved.courseId !== courseId ||
      saved.quizId !== quizId ||
      !graded.answers.every((answer) =>
        saved.answers.some(
          (old) =>
            old.questionId === answer.questionId &&
            old.choice === answer.choice,
        ),
      )
    )
      return NextResponse.json(
        { error: "Attempt already used" },
        { status: 409 },
      );
    return NextResponse.json({
      ok: true,
      attemptId: saved.id,
      score: saved.score,
      correct: saved.correct,
      totalQuestions: saved.totalQuestions,
    });
  } catch (error) {
    console.error(
      "Quiz save error:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json({ error: "Unable to save quiz" }, { status: 500 });
  }
}
