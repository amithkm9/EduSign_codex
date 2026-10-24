import { and, eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { learningEvents } from "@/lib/db/schema";
import { summarizeVideo, type VideoEvent } from "./progress.mjs";
import { LSF_LESSONS } from "@/lib/data/lsf";
export async function getVideoProgress(userId: string) {
  const rows = await db
    .select()
    .from(learningEvents)
    .where(
      and(
        eq(learningEvents.userId, userId),
        eq(learningEvents.source, "youtube"),
      ),
    )
    .orderBy(asc(learningEvents.ts));
  return LSF_LESSONS.map((lesson) => ({
    courseId: lesson.id,
    title: lesson.title,
    ...summarizeVideo(
      rows
        .filter((r) => r.courseId === lesson.id)
        .map((r): VideoEvent => ({
          activeMs: r.activeMs,
          durationMs: r.videoDurationMs ?? 0,
          positionMs: r.videoPositionMs ?? 0,
          ranges: r.watchedRanges ?? [],
          at: r.ts.toISOString(),
        })),
    ),
  }));
}
