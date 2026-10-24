import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles, learningEvents, type ProgressRollup } from "@/lib/db/schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function updateStreak(tx: Tx, userId: string) {
  // `for update` locks the profile row for the duration of the transaction, so
  // concurrent beacons serialize instead of clobbering each other's read-modify
  // -write of the whole `progress` jsonb.
  const [row] = await tx
    .select({ progress: profiles.progress })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .for("update")
    .limit(1);
  if (!row) return;

  const progress = row.progress as ProgressRollup;
  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 86_400_000));
  const last = progress.lastActivityDate
    ? dayKey(new Date(progress.lastActivityDate))
    : null;

  let currentStreak = progress.currentStreak;
  if (last !== today) {
    currentStreak = last === yesterday ? progress.currentStreak + 1 : 1;
  }
  const longestStreak = Math.max(progress.longestStreak, currentStreak);

  const [time] = await tx
    .select({
      ms: sql<number>`coalesce(sum(${learningEvents.activeMs}), 0)::bigint`,
    })
    .from(learningEvents)
    .where(eq(learningEvents.userId, userId));
  const next: ProgressRollup = {
    ...progress,
    currentStreak,
    longestStreak,
    lastActivityDate: new Date().toISOString(),
    totalLearningTime: Math.floor(Number(time?.ms ?? 0) / 60000),
  };

  await tx
    .update(profiles)
    .set({ progress: next })
    .where(eq(profiles.id, userId));
}
