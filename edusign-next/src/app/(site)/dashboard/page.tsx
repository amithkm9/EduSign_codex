import { getTranslator } from "@/lib/i18n/server";

import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Heart, CheckCircle2 } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/data/analytics";
import { LSF_LESSONS, getLsfLesson } from "@/lib/data/lsf";
import { CourseCard } from "@/components/courses/course-card";
export async function generateMetadata() {
  const t = await getTranslator();
  return { title: t("Mon carnet de découvertes") };
}
export default async function Dashboard() {
  const p = await getProfile();
  if (!p) redirect("/login");
  const s = await getDashboardSummary(p.id);
  return (
    <div className="container py-12">
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-[#dceaff] p-8 sm:p-10">
        <div>
          <p className="eyebrow">
            <T text={"MON CARNET DE DÉCOUVERTES"} />
          </p>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            <T text={"Bonjour,"} /> {p.name} !
          </h1>
          <p className="mt-3 text-muted-foreground">
            <T
              text={"Une nouvelle journée pour apprendre, essayer et partager."}
            />{" "}
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 font-bold text-white"
        >
          <T text={"Choisir une découverte"} />{" "}
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="mt-7 grid gap-5 sm:grid-cols-3">
        {[
          {
            Icon: CheckCircle2,
            value: s.totalCompleted,
            label: "Activités déclarées terminées",
            color: "bg-[#d9efdf]",
          },
          {
            Icon: BookOpen,
            value: s.coursesInProgress,
            label: "Activités en cours",
            color: "bg-[#ffdfc8]",
          },
          {
            Icon: Heart,
            value: s.totalDaysActive,
            label: "Jours de découverte",
            color: "bg-[#f7dbea]",
          },
        ].map((x) => (
          <div
            key={x.label}
            className="flex items-center gap-5 rounded-3xl border border-border bg-white p-6"
          >
            <span
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${x.color}`}
            >
              <x.Icon className="size-6" />
            </span>
            <div>
              <div className="text-3xl font-extrabold">{x.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                <T text={x.label} />
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        <T
          text={
            "Ce carnet reflète les activités de ce compte, sans évaluer la maîtrise des signes."
          }
        />{" "}
      </p>
      {s.inProgress.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            <T text={"On reprend où on en était ?"} />
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {s.inProgress
              .filter((c) => getLsfLesson(c.courseId))
              .map((c) => (
                <Link
                  key={c.courseId}
                  href={`/learn/${c.courseId}`}
                  className="flex items-center justify-between rounded-2xl border border-border bg-white p-5 font-semibold"
                >
                  <T text={getLsfLesson(c.courseId)?.title} />
                  <ArrowRight className="size-4 text-primary" />
                </Link>
              ))}
          </div>
        </section>
      )}
      <section className="mt-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold">
            <T text={"Votre prochaine petite aventure."} />{" "}
          </h2>
          <Link href="/courses" className="text-sm font-bold text-primary">
            <T text={"Toutes les leçons →"} />{" "}
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {LSF_LESSONS.slice(0, 3).map((l, i) => (
            <CourseCard lesson={l} index={i} key={l.id} />
          ))}
        </div>
      </section>
      <div className="mt-9 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[#fff0b5] p-7">
        <div>
          <h2 className="text-xl font-bold">
            <T text={"Un moment à partager en famille."} />{" "}
          </h2>
          <p className="mt-1 text-sm">
            <T
              text={
                "Ouvrez le bilan ensemble et choisissez la prochaine découverte."
              }
            />{" "}
          </p>
        </div>
        <Link
          href="/report"
          className="inline-flex min-h-11 items-center gap-2 font-bold text-primary"
        >
          <T text={"Voir mon bilan"} /> <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
