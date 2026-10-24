import { getLsfLesson } from "@/lib/data/lsf";
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { learningEvents, userProgress } from "@/lib/db/schema";
import { updateStreak } from "@/lib/learning/streak";

const EVENT_TYPES = new Set(["start", "pause", "resume", "heartbeat", "end"]);

/**
 * Records a learning event (heartbeat) for the *authenticated* user — the
 * userId comes from the session, never the client (fixes the legacy
 * "trust the client userId" hole). Rolls the event up into user_progress
 * and updates the streak. Accepts navigator.sendBeacon posts.
 */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: {
    courseId?: string;
    type?: string;
    sessionId?: string;
    activeMs?: number;
    progressPercentage?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { courseId, type } = body;
  if (
    typeof courseId !== "string" ||
    !getLsfLesson(courseId) ||
    !type ||
    !EVENT_TYPES.has(type)
  ) {
    return NextResponse.json(
      { error: "courseId and a valid type are required" },
      { status: 400 },
    );
  }

  if (
    (body.activeMs !== undefined &&
      (typeof body.activeMs !== "number" || !Number.isFinite(body.activeMs))) ||
    (body.progressPercentage !== undefined &&
      (typeof body.progressPercentage !== "number" ||
        !Number.isFinite(body.progressPercentage)))
  )
    return NextResponse.json({ error: "Valeur invalide" }, { status: 400 });
  const activeMs = Math.min(60000, Math.max(0, Math.round(body.activeMs ?? 0)));
  const pct =
    typeof body.progressPercentage === "number"
      ? Math.min(100, Math.max(0, Math.round(body.progressPercentage)))
      : null;

  try {
    // All three writes run in one transaction so a partial failure can't leave
    // the event recorded but the rollup/streak inconsistent.
    await db.transaction(async (tx) => {
      // 1. Append the raw event.
      await tx.insert(learningEvents).values({
        userId: user.id,
        courseId,
        type,
        sessionId: body.sessionId,
        activeMs,
        progressPercentage: pct ?? undefined,
      });

      // 2. Roll up into user_progress (only when there's something to record).
      if (activeMs > 0 || pct !== null) {
        const deltaMinutes = Math.round(activeMs / 60000);
        const pctForGreatest = pct ?? 0;
        const now = new Date();

        await tx
          .insert(userProgress)
          .values({
            userId: user.id,
            courseId,
            status: pctForGreatest >= 100 ? "completed" : "in_progress",
            progressPercentage: pctForGreatest,
            timeSpent: deltaMinutes,
            startedAt: now,
            lastAccessedAt: now,
            completedAt: pctForGreatest >= 100 ? now : null,
          })
          .onConflictDoUpdate({
            target: [userProgress.userId, userProgress.courseId],
            set: {
              timeSpent: sql`${userProgress.timeSpent} + ${deltaMinutes}`,
              progressPercentage: sql`greatest(${userProgress.progressPercentage}, ${pctForGreatest})`,
              status: sql`case when greatest(${userProgress.progressPercentage}, ${pctForGreatest}) >= 100 then 'completed' else 'in_progress' end`,
              completedAt: sql`case when greatest(${userProgress.progressPercentage}, ${pctForGreatest}) >= 100 and ${userProgress.completedAt} is null then now() else ${userProgress.completedAt} end`,
              lastAccessedAt: sql`now()`,
            },
          });

        // 3. Update streak + total learning time on the profile.
        await updateStreak(tx, user.id);
      }
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error(
      "learning event error:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Failed to record event" },
      { status: 500 },
    );
  }
}
