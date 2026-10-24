// Publish the French LSF catalog without deleting any learner or activity.
import { readFile } from "node:fs/promises";
import postgres from "postgres";
import { databaseUrl, safeError } from "./env.mjs";
const lessons = JSON.parse(
  await readFile(
    new URL("../src/lib/data/lsf-catalog.json", import.meta.url),
    "utf8",
  ),
);
const sql = postgres(databaseUrl(), {
  prepare: false,
  max: 1,
  connect_timeout: 10,
});
try {
  await sql.begin(async (tx) => {
    for (const l of lessons)
      await tx`insert into public.courses (id,title,description,video,age_group,category,difficulty,duration,duration_minutes,skills,learning_objectives,tags,is_published) values (${l.id},${l.title},${l.description},${"https://www.youtube.com/watch?v=" + l.youtubeId},${l.ageGroup},${l.topic},'Découverte',${"Atelier de " + l.practiceMinutes + " min"},${l.practiceMinutes},${[l.topic]},${l.objectives},${["LSF", "français"]},true) on conflict (id) do update set title=excluded.title,description=excluded.description,video=excluded.video,age_group=excluded.age_group,category=excluded.category,difficulty=excluded.difficulty,duration=excluded.duration,duration_minutes=excluded.duration_minutes,skills=excluded.skills,learning_objectives=excluded.learning_objectives,tags=excluded.tags,is_published=true`;
    // Retain historical records, but no longer offer the unverified legacy lessons.
    await tx`update public.courses set is_published=false where id in ('001','002','003','004','005','006','007','008','lsf-bonjour','lsf-couleurs','lsf-famille','lsf-ecole','lsf-emotions','lsf-dialogue')`;
    await tx`update public.packages set is_active=false where id in ('family-starter','parent-child-duo','comprehensive-learning')`;
  });
  console.log("Published alphabet and number LSF workshops; existing progress preserved.");
} catch (e) {
  console.error("Catalog sync failed:", safeError(e));
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
