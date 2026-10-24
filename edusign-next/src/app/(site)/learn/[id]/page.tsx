import { getVideoProgress } from "@/lib/video/data";
import { getTranslator } from "@/lib/i18n/server";

import { T } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ExternalLink,
  Clock,
} from "lucide-react";
import { getUser } from "@/lib/auth";
import { getUserProgressForCourses } from "@/lib/data/courses";
import { getLsfLesson, LSF_LESSONS } from "@/lib/data/lsf";
import { LessonPlayer } from "@/components/learn/lesson-player";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslator();
  return { title: t(getLsfLesson(id)?.title ?? "Leçon LSF") };
}
export default async function Lesson({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getLsfLesson(id);
  if (!lesson) {
    if (
      /^00[1-8]$/.test(id) ||
      [
        "lsf-bonjour",
        "lsf-couleurs",
        "lsf-famille",
        "lsf-ecole",
        "lsf-emotions",
        "lsf-dialogue",
      ].includes(id)
    )
      redirect("/courses");
    notFound();
  }
  const user = await getUser();
  const progress = user ? await getUserProgressForCourses(user.id, [id]) : {};
  const video = user ? (await getVideoProgress(user.id)).find((v) => v.courseId === id) : undefined;
  const next =
    LSF_LESSONS[(LSF_LESSONS.indexOf(lesson) + 1) % LSF_LESSONS.length];
  return (
    <div className="container py-9 sm:py-12">
      <Link
        href="/courses"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="size-4" />{" "}
        <T text={"Toutes les découvertes"} />{" "}
      </Link>
      <div className="mb-8 mt-6">
        <p className="eyebrow">
          <T text={lesson.topic} /> <T text={"· LANGUE DES SIGNES FRANÇAISE"} />
        </p>
        <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">
          <T text={lesson.title} />
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          <T text={lesson.description} />
        </p>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-4" /> <T text={"Suggestion : un atelier de"} />
          <T text={" "} />
          {lesson.practiceMinutes} <T text={"minutes, à votre rythme."} />{" "}
        </p>
      </div>
      <div className="grid gap-7 lg:grid-cols-[1fr_20rem]">
        <LessonPlayer
          key={lesson.id}
          lesson={lesson}
          track={!!user}
          initialProgress={progress[id]?.progressPercentage}
          initialVideo={video}
        />
        <aside className="space-y-5">
          <div className="rounded-3xl border border-border bg-white p-6">
            <h2 className="text-lg font-bold">
              <T text={"Votre petite feuille de route"} />
            </h2>
            <ol className="mt-5 space-y-5">
              {lesson.objectives.map((o, i) => (
                <li key={o} className="flex gap-3 text-sm leading-relaxed">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <T text={o} />
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl bg-[#fff0b5] p-6">
            <h2 className="flex items-center gap-2 font-bold">
              <Heart className="size-5" />{" "}
              <T text={"Le petit coup de pouce parent"} />{" "}
            </h2>
            <p className="mt-3 text-sm leading-relaxed">
              <T text={lesson.parentTip} />
            </p>
            <Link
              href="/parents"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold"
            >
              <T text={"D’autres idées"} /> <ArrowRight className="size-4" />
            </Link>
          </div>
          <a
            href={lesson.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 text-xs font-semibold text-primary"
          >
            <T text={"Consulter la source pédagogique"} />
            <T text={" "} />
            <ExternalLink className="size-3.5" />
            <span className="sr-only">
              {" "}
              <T text={"(nouvel onglet)"} />
            </span>
          </a>
        </aside>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-white p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <T text={"ENVIE DE CONTINUER ?"} />{" "}
          </p>
          <p className="mt-1 text-xl font-bold">
            <T text={next.title} />
          </p>
        </div>
        <Link
          href={`/learn/${next.id}`}
          className="inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 font-semibold text-white"
        >
          <T text={"La prochaine découverte"} />{" "}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
