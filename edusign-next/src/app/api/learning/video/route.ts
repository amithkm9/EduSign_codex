import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { updateStreak } from "@/lib/learning/streak";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { learningEvents } from "@/lib/db/schema";
import { getLsfLesson } from "@/lib/data/lsf";
import { mergeRanges } from "@/lib/video/progress.mjs";
import { getVideoProgress } from "@/lib/video/data";
const payload = z.object({
  id: z.uuid(),
  courseId: z.string().max(80),
  sessionId: z.uuid(),
  type: z.enum(["start", "heartbeat", "pause", "end"]),
  activeMs: z.number().int().min(0).max(60000),
  durationMs: z.number().int().min(1).max(21_600_000),
  positionMs: z.number().int().min(0),
  ranges: z
    .array(z.tuple([z.number().int().min(0), z.number().int().min(0)]))
    .max(120),
  at: z.iso.datetime(),
});
export async function GET() {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json({ videos: await getVideoProgress(user.id) });
}
export async function POST(req: Request) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  let raw;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = payload.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid playback event" },
      { status: 400 },
    );
  const p = parsed.data;
  const age = Date.now() - Date.parse(p.at);
  const coverage = p.ranges.reduce((sum, [a, b]) => sum + b - a, 0);
  if (
    !getLsfLesson(p.courseId) ||
    p.positionMs > p.durationMs ||
    age < -10000 ||
    age > 86400000 ||
    p.ranges.some(([a, b]) => b <= a || b > p.durationMs) ||
    coverage > p.activeMs * 2 + 1000 ||
    (p.activeMs > 0 && coverage === 0)
  )
    return NextResponse.json(
      { error: "Inconsistent playback event" },
      { status: 400 },
    );
  try {
    const inserted = await db.transaction(async (tx) => {
      const [record] = await tx
        .insert(learningEvents)
        .values({
          id: p.id,
          userId: user.id,
          courseId: p.courseId,
          sessionId: p.sessionId,
          type: p.type,
          activeMs: p.activeMs,
          source: "youtube",
          ts: new Date(p.at),
          videoDurationMs: p.durationMs,
          videoPositionMs: p.positionMs,
          watchedRanges: mergeRanges(p.ranges, p.durationMs),
        })
        .onConflictDoNothing()
        .returning({ id: learningEvents.id });
      if (record && p.activeMs > 0) await updateStreak(tx, user.id);
      return record;
    });
    if (!inserted) {
      const [existing] = await db
        .select({
          userId: learningEvents.userId,
          courseId: learningEvents.courseId,
          source: learningEvents.source,
        })
        .from(learningEvents)
        .where(eq(learningEvents.id, p.id))
        .limit(1);
      if (
        !existing ||
        existing.userId !== user.id ||
        existing.courseId !== p.courseId ||
        existing.source !== "youtube"
      )
        return NextResponse.json(
          { error: "Event already used" },
          { status: 409 },
        );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to save playback" },
      { status: 500 },
    );
  }
}
